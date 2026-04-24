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
        HttpEndpointRegistrar.Map(WebServer, "/assets/plugins/{*}", GetPlugin, "/plugin/{*}");
        HttpEndpointRegistrar.Map(WebServer, "/assets/www/{*}", GetWww, "/www/{*}", "/{*}");
        HttpEndpointRegistrar.Map(WebServer, "/assets/files/{*}", GetFile, "/file/{*}");
    }

    /// <summary>
    /// 取得內建 www 靜態資源
    /// </summary>
    private async Task GetWww(RequestData d) {
        bool allowCors = d.args.GetValueOrDefault("allowCors") == "true";
        string exeDir = AppDomain.CurrentDomain.BaseDirectory;
        string path = d.value.StartsWith("Www/", StringComparison.OrdinalIgnoreCase)
            ? Path.Combine(exeDir, d.value)
            : Path.Combine(exeDir, "Www", d.value);

        if (await CheckFileExist(d, path) == false) { return; }
        if (HeadersAdd304(d, path)) { return; }

        d.context.Response.ContentType = GetMimeTypeMapping(path);
        if (allowCors) {
            // 僅在明確要求時開放跨網域，避免無條件暴露所有靜態資源
            d.context.Response.AddHeader("Access-Control-Allow-Origin", "*");
        }

        await WriteFile(d, path);
    }

    /// <summary>
    /// 取得 plugin 目錄中的靜態資源
    /// </summary>
    private async Task GetPlugin(RequestData d) {
        string path = Path.Combine(AppPath.appDataPlugin, d.value);

        if (await CheckFileExist(d, path) == false) { return; }
        if (HeadersAdd304(d, path)) { return; }

        d.context.Response.ContentType = GetMimeTypeMapping(path);
        await WriteFile(d, path);
    }

    /// <summary>
    /// 取得任意檔案內容，可由 query 或 wildcard path 指定目標
    /// </summary>
    private async Task GetFile(RequestData d) {
        var path = d.args.GetValueOrDefault("path");
        path = path != null ? Uri.UnescapeDataString(path) : d.value;

        if (await CheckFileExist(d, path) == false) { return; }
        if (HeadersAdd304(d, path)) { return; }

        d.context.Response.ContentType = GetMimeTypeMapping(path);
        await WriteFile(d, path);
    }
}
