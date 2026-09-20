using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;

namespace Tiefsee;

public sealed class FileHttpEndpoints : HttpEndpointModuleBase {

    /// <summary> 網路圖示最大允許下載的檔案大小 100 MiB </summary>
    private const long MaxWebIconDownloadBytes = 100L * 1024 * 1024;
    /// <summary> 網路圖示最大允許重新導向的次數 </summary>
    private const int MaxWebIconRedirectCount = 5;

    private readonly ImageProcessingService _imageProcessingService;
    private readonly FileMetadataService _fileMetadataService;
    /// <summary>
    /// 記錄同一個視窗針對同一影片的最新串流請求序號
    /// </summary>
    private readonly Dictionary<string, int> _streamingRequests = new();

    /// <summary>
    /// 註冊路由
    /// </summary>
    public FileHttpEndpoints(WebServer webServer) : base(webServer) {
        _imageProcessingService = Program.services.ImageProcessing;
        _fileMetadataService = Program.services.FileMetadata;
    }

    /// <summary>
    /// 註冊路由
    /// </summary>
    public void RegisterRoutes() {
        HttpEndpointRegistrar.Map(WebServer, "/api/images/metadata/exif", GetMetadata);
        HttpEndpointRegistrar.Map(WebServer, "/api/files/icon", GetFileIcon);
        HttpEndpointRegistrar.Map(WebServer, "/api/web/icon", GetWebIcon);
        HttpEndpointRegistrar.Map(WebServer, "/api/files/info", GetFileInfo);
        HttpEndpointRegistrar.Map(WebServer, "/api/files/info-list", GetFileInfoList);
        HttpEndpointRegistrar.Map(WebServer, "/api/files/related", GetRelatedFileList);
        HttpEndpointRegistrar.Map(WebServer, "/api/files/binary-check", IsBinary);

        HttpEndpointRegistrar.Map(WebServer, "/api/files/video", GetVideo);
        HttpEndpointRegistrar.Map(WebServer, "/api/files/content", GetFile);
        HttpEndpointRegistrar.Map(WebServer, "/api/files/pdf", GetPdf);
        HttpEndpointRegistrar.Map(WebServer, "/api/files/text", GetText);
    }

    /// <summary>
    /// 回傳影片，支援 range request 與同視窗快速跳轉時的舊串流中止
    /// </summary>
    private async Task GetVideo(RequestData d) {
        string path = Uri.UnescapeDataString(d.args["path"]);
        string windowId = d.args["windowId"];

        if (await CheckFileExist(d, path) == false) { return; }

        var response = d.context.Response;
        var request = d.context.Request;
        response.SendChunked = true;

        long totalLength = new FileInfo(path).Length;
        long start = 0;
        long end = totalLength - 1;

        if (request.Headers["Range"] != null) {
            var range = request.Headers["Range"];
            var rangeValues = range.Replace("bytes=", "").Split('-');
            start = long.Parse(rangeValues[0]);
            if (rangeValues.Length > 1 && string.IsNullOrEmpty(rangeValues[1]) == false) {
                end = long.Parse(rangeValues[1]);
            }

            response.StatusCode = (int)HttpStatusCode.PartialContent;
            response.Headers.Add("Content-Range", $"bytes {start}-{end}/{totalLength}");
        }
        else {
            response.StatusCode = (int)HttpStatusCode.OK;
        }

        // 同一個 windowId + path 僅保留最後一次請求持續輸出，避免拖曳進度條時多個串流互相競爭
        var key = windowId + path;
        if (_streamingRequests.ContainsKey(key) == false) {
            _streamingRequests.Add(key, 0);
        }
        _streamingRequests[key] += 1;
        var nowKey = _streamingRequests[key];

        response.ContentLength64 = end - start + 1;
        using var fileStream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
        fileStream.Seek(start, SeekOrigin.Begin);
        var buffer = new byte[64 * 1024];
        int bytesRead;
        while ((bytesRead = await fileStream.ReadAsync(buffer, 0, buffer.Length)) > 0 && response.OutputStream.CanWrite) {
            if (nowKey != _streamingRequests[key]) { break; }
            await response.OutputStream.WriteAsync(buffer, 0, bytesRead);
        }
        response.SendChunked = false;
    }

    /// <summary>
    /// 取得 PDF 檔案
    /// </summary>
    private async Task GetPdf(RequestData d) {
        string path = Uri.UnescapeDataString(d.args["path"]);

        if (await CheckFileExist(d, path) == false) { return; }
        if (HeadersAdd304(d, path)) { return; }

        d.context.Response.ContentType = "application/pdf";
        await WriteFile(d, path);
    }

    /// <summary>
    /// 取得文字檔
    /// </summary>
    private async Task GetText(RequestData d) {
        try {
            string path = Uri.UnescapeDataString(d.args["path"]);

            if (await CheckFileExist(d, path) == false) { return; }
            if (HeadersAdd304(d, path)) { return; }
            await WriteString(d, FileInfoHelper.GetText(path));
        }
        catch (Exception exception) {
            // 文字內容成功時維持純文字回應；只有失敗時回傳安全訊息，避免前端把例外內容當成檔案文字。
            Console.Error.WriteLine($"[API] {exception}");
            var error = ApiErrorMapper.Map(exception);
            await WriteError(d, error.StatusCode, error.Message);
        }
    }

    /// <summary>
    /// 取得任意檔案，可由 query 或 wildcard path 指定目標
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
    /// 取得檔案的 Metadata 資訊
    /// </summary>
    private async Task GetMetadata(RequestData d) {
        int maxLength = int.Parse(d.args["maxLength"]);
        string path = Uri.UnescapeDataString(d.args["path"]);

        if (File.Exists(path) == false) {
            d.context.Response.StatusCode = 404;
            await WriteJson(d, new FileMetadataResult());
            return;
        }

        if (HeadersAdd304(d, path)) { return; }

        var metadata = _fileMetadataService.GetMetadata(path, maxLength);
        await WriteJson(d, metadata);
    }

    /// <summary>
    /// 取得檔案對應的系統 icon，並轉成 PNG 回傳
    /// </summary>
    private async Task GetFileIcon(RequestData d) {
        int size = Int32.Parse(d.args["size"]);
        string path = Uri.UnescapeDataString(d.args["path"]);

        if (await CheckFileExist(d, path) == false) { return; }
        if (HeadersAdd304(d, path)) { return; }

        using Bitmap icon = _imageProcessingService.GetFileIcon(path, size, 3);
        if (icon == null) {
            await WriteError(d, 500, "圖示取得失敗");
            return;
        }

        try {
            using var input = new MemoryStream();
            icon.Save(input, System.Drawing.Imaging.ImageFormat.Png);
            input.Position = 0;
            d.context.Response.ContentType = "image/png";
            await WriteStream(d, input);
        }
        catch {
            await WriteError(d, 500, "圖示解析失敗");
        }
    }

#region Web icon download and validation

    /// <summary>
    /// 下載網路圖片到暫存資料夾後，再以系統縮圖方式回傳 icon
    /// </summary>
    private async Task GetWebIcon(RequestData d) {
        int size = Int32.Parse(d.args["size"]);
        string path = Uri.UnescapeDataString(d.args["path"]);
        string url = Uri.UnescapeDataString(d.args["url"]);

        if (TryGetSafeWebIconPath(path, out string tempPath) == false) {
            await WriteError(d, 400, "無效的圖片快取路徑");
            return;
        }

        if (TryGetSafeWebIconUri(url, out Uri sourceUri) == false) {
            await WriteError(d, 400, "只允許從安全的 HTTPS 圖片或影片網址下載");
            return;
        }

        // 若本地尚未快取，先下載圖片到指定暫存位置
        if (File.Exists(tempPath) == false) {
            try {
                IPAddress[] addresses = await ResolveSafeWebIconAddresses(sourceUri);
                if (addresses.Length == 0) {
                    await WriteError(d, 400, "禁止連線至 localhost、區域網路或本機名稱");
                    return;
                }

                string tempDir = Path.GetDirectoryName(tempPath);
                // 通過 URL 與 IP 檢查後才建立暫存資料夾，避免拒絕請求留下目錄。
                if (Directory.Exists(tempDir) == false) {
                    Directory.CreateDirectory(tempDir);
                }

                using HttpClientHandler handler = new() {
                    AllowAutoRedirect = false
                };
                using HttpClient webClient = new(handler) {
                    Timeout = TimeSpan.FromSeconds(10)
                };
                Uri downloadUri = sourceUri;
                HttpResponseMessage response = null;
                for (int redirectCount = 0; ; redirectCount++) {
                    using HttpRequestMessage request = new(HttpMethod.Get, downloadUri);
                    response = await webClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);
                    if (IsWebIconRedirect(response.StatusCode) == false) {
                        break;
                    }

                    if (redirectCount >= MaxWebIconRedirectCount
                        || response.Headers.Location == null) {
                        response.Dispose();
                        await WriteError(d, 400, "網路圖示重新導向次數過多或缺少目標");
                        return;
                    }

                    Uri redirectLocation = response.Headers.Location;
                    response.Dispose();
                    if (Uri.TryCreate(downloadUri, redirectLocation, out Uri redirectUri) == false
                        || TryGetSafeWebIconUri(redirectUri, out downloadUri) == false
                        || (await ResolveSafeWebIconAddresses(downloadUri)).Length == 0) {
                        await WriteError(d, 400, "不允許重新導向到不安全來源");
                        return;
                    }
                }

                using (response) {
                    if (response.IsSuccessStatusCode == false) {
                        await WriteError(d, 502, "圖片下載來源回應失敗");
                        return;
                    }

                    if (IsAllowedWebIconContentType(response.Content.Headers.ContentType?.MediaType) == false) {
                        await WriteError(d, 415, "下載來源不是圖片或影片");
                        return;
                    }

                    if (response.Content.Headers.ContentLength > MaxWebIconDownloadBytes) {
                        await WriteError(d, 413, "下載來源超過大小限制");
                        return;
                    }

                    using Stream responseStream = await response.Content.ReadAsStreamAsync();
                    using MemoryStream dataStream = new();
                    byte[] buffer = new byte[64 * 1024];
                    long totalBytes = 0;
                    int bytesRead;
                    while ((bytesRead = await responseStream.ReadAsync(buffer, 0, buffer.Length)) > 0) {
                        totalBytes += bytesRead;
                        if (totalBytes > MaxWebIconDownloadBytes) {
                            await WriteError(d, 413, "下載來源超過大小限制");
                            return;
                        }
                        await dataStream.WriteAsync(buffer, 0, bytesRead);
                    }

                    File.WriteAllBytes(tempPath, dataStream.ToArray());
                }
            }
            catch (Exception ex) {
                Debug.WriteLine("GetWebIcon fail " + ex.Message);
                await WriteError(d, 500, "圖片下載失敗: " + ex);
                return;
            }
        }

        if (File.Exists(tempPath) == false) {
            await WriteError(d, 404, $"url:{url}\npath:{tempPath}");
            return;
        }

        d.context.Response.ContentType = "image/png";
        if (HeadersAdd304(d, tempPath)) { return; }

        using Bitmap icon = _imageProcessingService.GetFileIcon(tempPath, size, 3);
        if (icon == null) {
            await WriteError(d, 500, "圖示取得失敗");
            return;
        }

        try {
            using Stream input = new MemoryStream();
            icon.Save(input, System.Drawing.Imaging.ImageFormat.Png);
            input.Position = 0;
            await WriteStream(d, input);
        }
        catch {
            await WriteError(d, 500, "圖示解析失敗");
        }
    }

    /// <summary>
    /// 解析網路圖示的來源網址，僅接受 HTTPS 且不直接指向本機名稱。
    /// </summary>
    private static bool TryGetSafeWebIconUri(string url, out Uri sourceUri) {
        sourceUri = null;

        if (Uri.TryCreate(url, UriKind.Absolute, out Uri uri) == false) {
            return false;
        }

        return TryGetSafeWebIconUri(uri, out sourceUri);
    }

    /// <summary>
    /// 驗證已解析的 redirect URI 必須仍然是 HTTPS 且不能指向本機名稱。
    /// </summary>
    private static bool TryGetSafeWebIconUri(Uri uri, out Uri sourceUri) {
        sourceUri = null;

        if (uri.IsAbsoluteUri == false
            || uri.Scheme != Uri.UriSchemeHttps
            || string.IsNullOrWhiteSpace(uri.Host)
            || IsForbiddenWebIconHost(uri.DnsSafeHost)) {
            return false;
        }

        sourceUri = uri;
        return true;
    }

    /// <summary>
    /// 解析來源網域的所有 IP，若任何結果指向本機或內部網段則整個來源拒絕。
    /// </summary>
    private static async Task<IPAddress[]> ResolveSafeWebIconAddresses(Uri sourceUri) {
        IPAddress[] addresses;
        try {
            addresses = await Dns.GetHostAddressesAsync(sourceUri.DnsSafeHost);
        }
        catch (SocketException) {
            return Array.Empty<IPAddress>();
        }
        catch (ArgumentException) {
            return Array.Empty<IPAddress>();
        }

        if (addresses.Length == 0 || addresses.Any(IsForbiddenWebIconAddress)) {
            return Array.Empty<IPAddress>();
        }

        return addresses;
    }

    /// <summary>
    /// 確認下載來源的 Content-Type 是圖片或影片，避免把任意回應寫入快取。
    /// </summary>
    private static bool IsAllowedWebIconContentType(string contentType) {
        return contentType?.StartsWith("image/", StringComparison.OrdinalIgnoreCase) == true
            || contentType?.StartsWith("video/", StringComparison.OrdinalIgnoreCase) == true;
    }

    /// <summary>
    /// 判斷 HTTP 狀態碼是否代表需要處理 Location 的重新導向回應。
    /// </summary>
    private static bool IsWebIconRedirect(HttpStatusCode statusCode) {
        return statusCode is HttpStatusCode.Moved
            or HttpStatusCode.Redirect
            or HttpStatusCode.SeeOther
            or HttpStatusCode.TemporaryRedirect
            or HttpStatusCode.PermanentRedirect;
    }

    /// <summary>
    /// 判斷網址主機名稱是否是 localhost 或目前電腦名稱。
    /// </summary>
    private static bool IsForbiddenWebIconHost(string host) {
        string normalizedHost = host.TrimEnd('.');
        string machineName = Environment.MachineName;
        string localHostName = Dns.GetHostName();

        return normalizedHost.Equals("localhost", StringComparison.OrdinalIgnoreCase)
            || normalizedHost.EndsWith(".localhost", StringComparison.OrdinalIgnoreCase)
            || normalizedHost.Equals(machineName, StringComparison.OrdinalIgnoreCase)
            || normalizedHost.Equals(localHostName, StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// 判斷 IP 是否屬於 loopback、未指定、私有、link-local 或其他禁止連線的網段。
    /// </summary>
    private static bool IsForbiddenWebIconAddress(IPAddress address) {
        if (IPAddress.IsLoopback(address)) {
            return true;
        }

        if (address.IsIPv4MappedToIPv6) {
            address = address.MapToIPv4();
        }

        return address.AddressFamily switch {
            AddressFamily.InterNetwork => IsForbiddenWebIconIpv4Address(address),
            AddressFamily.InterNetworkV6 => IsForbiddenWebIconIpv6Address(address),
            _ => true
        };
    }

    /// <summary>
    /// 判斷 IPv4 是否落在未指定、私有、link-local、測試保留或 multicast 網段。
    /// </summary>
    private static bool IsForbiddenWebIconIpv4Address(IPAddress address) {
        byte[] bytes = address.GetAddressBytes();

        return IsIpv4InCidr(bytes, 0, 0, 0, 0, 8) // 0.0.0.0/8
            || IsIpv4InCidr(bytes, 10, 0, 0, 0, 8) // 10.0.0.0/8
            || IsIpv4InCidr(bytes, 100, 64, 0, 0, 10) // 100.64.0.0/10
            || IsIpv4InCidr(bytes, 169, 254, 0, 0, 16) // 169.254.0.0/16
            || IsIpv4InCidr(bytes, 172, 16, 0, 0, 12) // 172.16.0.0/12
            || IsIpv4InCidr(bytes, 192, 0, 0, 0, 24) // 192.0.0.0/24
            || IsIpv4InCidr(bytes, 192, 168, 0, 0, 16) // 192.168.0.0/16
            || IsIpv4InCidr(bytes, 198, 18, 0, 0, 15) // 198.18.0.0/15
            || bytes[0] >= 224; // multicast 與保留範圍
    }

    /// <summary>
    /// 判斷 IPv6 是否為未指定、link-local、site-local、multicast 或 unique-local 位址。
    /// </summary>
    private static bool IsForbiddenWebIconIpv6Address(IPAddress address) {
        byte[] bytes = address.GetAddressBytes();

        return address.Equals(IPAddress.IPv6Any)
            || address.IsIPv6LinkLocal
            || address.IsIPv6SiteLocal
            || address.IsIPv6Multicast
            || (bytes[0] & 0xFE) == 0xFC; // fc00::/7
    }

    /// <summary>
    /// 判斷 IPv4 位址是否符合指定的 CIDR 網段。
    /// </summary>
    private static bool IsIpv4InCidr(byte[] address, byte network0, byte network1, byte network2, byte network3, int prefixLength) {
        uint addressValue = ((uint)address[0] << 24)
            | ((uint)address[1] << 16)
            | ((uint)address[2] << 8)
            | address[3];
        uint networkValue = ((uint)network0 << 24)
            | ((uint)network1 << 16)
            | ((uint)network2 << 8)
            | network3;
        uint mask = prefixLength == 0 ? 0 : uint.MaxValue << (32 - prefixLength);

        return (addressValue & mask) == (networkValue & mask);
    }

#endregion

#region Web icon cache path validation

    /// <summary>
    /// 驗證網路圖片快取路徑只能位於暫存資料夾內。
    /// </summary>
    private static bool TryGetSafeWebIconPath(string relativePath, out string fullPath) {
        fullPath = "";

        if (string.IsNullOrWhiteSpace(relativePath) || Path.IsPathRooted(relativePath)) {
            return false;
        }

        try {
            string normalizedPath = relativePath.Replace(Path.AltDirectorySeparatorChar, Path.DirectorySeparatorChar);
            string[] segments = normalizedPath.Split(Path.DirectorySeparatorChar, StringSplitOptions.None);

            foreach (string segment in segments) {
                if (segment.Length == 0
                    || segment == "."
                    || segment == ".."
                    || segment.EndsWith('.')
                    || segment.EndsWith(' ')
                    || segment.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0
                    || IsReservedWindowsFileName(segment)) {
                    return false;
                }
            }

            string root = Path.GetFullPath(Program.runtimeContext.TempDirWebFile)
                .TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
                + Path.DirectorySeparatorChar;
            string candidate = Path.GetFullPath(Path.Combine(root, normalizedPath));

            if (candidate.StartsWith(root, StringComparison.OrdinalIgnoreCase) == false) {
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
        catch (NotSupportedException) {
            return false;
        }
    }

    /// <summary>
    /// 判斷檔名是否為 Windows 保留名稱，例如 CON、PRN、COM1 或 LPT1。
    /// </summary>
    private static bool IsReservedWindowsFileName(string segment) {
        string name = Path.GetFileNameWithoutExtension(segment).ToUpperInvariant();
        return name is "CON" or "PRN" or "AUX" or "NUL"
            || (name.Length == 4 && (name.StartsWith("COM") || name.StartsWith("LPT"))
                && name[3] is >= '1' and <= '9');
    }

#endregion

    /// <summary>
    /// 取得單一檔案的詳細資訊
    /// </summary>
    private async Task GetFileInfo(RequestData d) {
        try {
            string path = Uri.UnescapeDataString(d.args["path"]);

            EnsureFileExistsApi(path);
            if (HeadersAdd304(d, path)) { return; }

            await WriteApiSuccess(d, FileInfoHelper.GetFileInfo2(path));
        }
        catch (Exception exception) {
            // 檔案資訊讀取失敗時仍回傳固定 envelope，讓前端以 errorCode 處理，不暴露 stack trace。
            await WriteApiException(d, exception);
        }
    }

    /// <summary>
    /// 批次取得多個檔案的詳細資訊
    /// </summary>
    private Task GetFileInfoList(RequestData d) {
        return ExecuteApi(d, () => {
            var json = JsonDocument.Parse(d.postData);
            string[] ar = json.GetStringArray("ar");

            return Task.FromResult(FileInfoHelper.GetFileInfo2List(ar).ToArray());
        });
    }

    /// <summary>
    /// 尋找同名但不同副檔名的相關檔案，必要時順便讀出文字內容
    /// </summary>
    private async Task GetRelatedFileList(RequestData d) {
        string filePath = Uri.UnescapeDataString(d.args["path"]);
        string[] arTextExt = d.args["textExt"].Split(',');

        if (await CheckFileExist(d, filePath) == false) { return; }

        FileInfo fileInfo = new(filePath);
        DirectoryInfo directoryInfo = fileInfo.Directory;
        string fileNamePrefix = fileInfo.Name.Split('.')[0];

        // 用第一個 '.' 前的字串做配對，維持舊版 related file 判斷邏輯
        FileInfo[] files = directoryInfo.GetFiles()
            .Where(file => (file.Name != fileInfo.Name) && file.Name.Split('.')[0].Equals(fileNamePrefix, StringComparison.OrdinalIgnoreCase))
            .ToArray();

        var result = new List<object>();
        foreach (FileInfo file in files) {
            string ext = file.Extension.Replace(".", "");
            string text = null;
            if (arTextExt.Contains(ext)) {
                text = File.ReadAllText(file.FullName, Encoding.UTF8);
            }
            result.Add(new {
                path = file.FullName,
                text = text
            });
        }

        await WriteJson(d, result);
    }

    /// <summary>
    /// 檢查檔案是否為二進位格式
    /// </summary>
    private async Task IsBinary(RequestData d) {
        string path = Uri.UnescapeDataString(d.args["path"]);

        if (await CheckFileExist(d, path) == false) { return; }
        if (HeadersAdd304(d, path)) { return; }

        await WriteString(d, FileInfoHelper.IsBinary(path).ToString());
    }
}
