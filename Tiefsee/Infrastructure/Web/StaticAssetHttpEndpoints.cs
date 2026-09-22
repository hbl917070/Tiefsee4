using System.IO;

namespace Tiefsee;

public sealed class StaticAssetHttpEndpoints : HttpEndpointModuleBase {

    /// <summary>
    /// 建立靜態資源相關的 HTTP endpoints
    /// </summary>
    public StaticAssetHttpEndpoints(WebServer webServer) : base(webServer) {
    }

    /// <summary>
    /// 註冊路由
    /// </summary>
    public void RegisterRoutes() {
        // 這三條路由的安全語義不同，請勿合併成單一「assets」路由：
        // - /assets/www：Tiefsee 內建 WebView 資源，固定只能讀取 BaseDirectory\Www。
        // - /assets/plugins：外掛資源，固定只能讀取 AppDataPlugin；不加 token 以支援外掛載入。
        // - /assets/files：Markdown 的本機圖片、超連結及其他檔案資源，故意支援任意本機路徑，
        //   由 capability token 保護，不適用固定根目錄 containment。
        HttpEndpointRegistrar.Map(WebServer, "/assets/plugins/{*}", GetPlugin);
        HttpEndpointRegistrar.Map(WebServer, "/assets/files/{*}", GetFile);
        HttpEndpointRegistrar.Map(WebServer, "/assets/www/{*}", GetWww);
    }

    /// <summary>
    /// 取得內建 www 靜態資源。
    /// 此路由只服務程式內建的 WebView HTML、JS、CSS、Worker、iframe 與圖片，
    /// 不應被用來讀取任意本機檔案；路徑必須 containment 在 BaseDirectory\Www。
    /// </summary>
    private async Task GetWww(RequestData d) {
        bool allowCors = d.args.GetValueOrDefault("allowCors") == "true";
        string exeDir = AppDomain.CurrentDomain.BaseDirectory;

        if (TryGetContainedAssetPath(
                Path.Combine(exeDir, "Www"),
                d.value,
                out string path,
                allowLegacyWwwPrefix: true) == false) {
            await WriteError(d, 404, "404");
            return;
        }

        if (HeadersAdd304(d, path)) { return; }

        d.context.Response.ContentType = GetMimeTypeMapping(path);
        if (allowCors) {
            // 僅在明確要求時開放跨網域，避免無條件暴露所有靜態資源
            d.context.Response.AddHeader("Access-Control-Allow-Origin", "*");
        }

        await WriteFile(d, path);
    }

    /// <summary>
    /// 取得 plugin 目錄中的靜態資源。
    /// 此路由只服務已安裝外掛的資源，路徑必須 containment 在 AppDataPlugin；
    /// 它與 /assets/files 的任意本機檔案語義完全不同。
    /// </summary>
    private async Task GetPlugin(RequestData d) {
        if (TryGetContainedAssetPath(Program.runtimeContext.AppDataPlugin, d.value, out string path) == false) {
            await WriteError(d, 404, "404");
            return;
        }

        if (HeadersAdd304(d, path)) { return; }

        d.context.Response.ContentType = GetMimeTypeMapping(path);
        await WriteFile(d, path);
    }

    /// <summary>
    /// 取得任意檔案內容，可由 query 或 wildcard path 指定目標。
    /// 這是唯一刻意支援任意本機路徑的靜態資源路由，供 Markdown 的本機圖片、
    /// 超連結及其他文件資源使用；安全邊界是 WebServer 的 capability token，
    /// 不能套用 /assets/www 或 /assets/plugins 的固定根目錄 containment。
    /// </summary>
    private async Task GetFile(RequestData d) {
        var path = d.args.GetValueOrDefault("path");
        path = path != null ? Uri.UnescapeDataString(path) : d.value;

        if (await CheckFileExist(d, path) == false) { return; }
        if (HeadersAdd304(d, path)) { return; }

        d.context.Response.ContentType = GetMimeTypeMapping(path);
        await WriteFile(d, path);
    }

    /// <summary>
    /// 將固定根目錄下的 URL 路徑解析成安全的檔案路徑。
    ///
    /// 先解碼 URL，再拒絕絕對路徑、UNC 與非法檔名，接著以 Path.GetFullPath
    /// 做 canonicalization；因此允許子資料夾內的「子資料夾/../檔案」，但最後用
    /// 帶有目錄分隔符的 root prefix 檢查，拒絕 canonical 化後離開根目錄或偽造
    /// sibling prefix。固定根目錄及其下所有既有路徑元件也不得是 reparse point，
    /// 避免 junction／symbolic link 將讀取導向允許目錄外。
    /// </summary>
    private static bool TryGetContainedAssetPath(
        string rootDirectory,
        string rawRelativePath,
        out string fullPath,
        bool allowLegacyWwwPrefix = false) {
        fullPath = "";

        try {
            string relativePath = Uri.UnescapeDataString(rawRelativePath)
                .Replace(Path.AltDirectorySeparatorChar, Path.DirectorySeparatorChar);

            // 舊版 /assets/www/Www/... 呼叫仍解析到 BaseDirectory\Www，保留相同語義；
            // 這個相容前綴只適用於 /assets/www，不可套用到其他固定資源路由。
            if (allowLegacyWwwPrefix
                && relativePath.StartsWith("Www" + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)) {
                relativePath = relativePath.Substring("Www".Length + 1);
            }

            if (string.IsNullOrWhiteSpace(relativePath)
                || Path.IsPathRooted(relativePath)
                || Path.IsPathFullyQualified(relativePath)) {
                return false;
            }

            string[] segments = relativePath.Split(Path.DirectorySeparatorChar);
            foreach (string segment in segments) {
                if (segment.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0) {
                    return false;
                }
            }

            string root = Path.GetFullPath(rootDirectory);
            string rootPrefix = root.EndsWith(Path.DirectorySeparatorChar)
                ? root
                : root + Path.DirectorySeparatorChar;
            string candidate = Path.GetFullPath(Path.Combine(root, relativePath));

            if (candidate.StartsWith(rootPrefix, StringComparison.OrdinalIgnoreCase) == false
                || File.Exists(candidate) == false
                || ContainsReparsePoint(root, candidate)) {
                return false;
            }

            fullPath = candidate;
            return true;
        }
        catch (ArgumentException) {
            return false;
        }
        catch (IOException) {
            return false;
        }
        catch (UnauthorizedAccessException) {
            return false;
        }
        catch (NotSupportedException) {
            return false;
        }
    }

    /// <summary>
    /// 檢查 candidate 到 root 之間的既有檔案系統元件是否包含 reparse point。
    /// </summary>
    private static bool ContainsReparsePoint(string root, string candidate) {
        string current = candidate;

        while (true) {
            FileAttributes attributes = File.GetAttributes(current);
            if ((attributes & FileAttributes.ReparsePoint) != 0) {
                return true;
            }

            if (string.Equals(current, root, StringComparison.OrdinalIgnoreCase)) {
                return false;
            }

            DirectoryInfo parent = Directory.GetParent(current);
            if (parent == null) {
                return true;
            }

            current = parent.FullName.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        }
    }
}
