using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace Tiefsee;

public sealed class FileHttpEndpoints : HttpEndpointModuleBase {

    private readonly ImageProcessingService _imageProcessingService;
    /// <summary>
    /// 記錄同一個視窗針對同一影片的最新串流請求序號
    /// </summary>
    private readonly Dictionary<string, int> _streamingRequests = new();

    /// <summary>
    /// 註冊路由
    /// </summary>
    public FileHttpEndpoints(WebServer webServer) : base(webServer) {
        _imageProcessingService = Program.services.ImageProcessing;
    }

    /// <summary>
    /// 註冊路由
    /// </summary>
    public void RegisterRoutes() {
        HttpEndpointRegistrar.Map(WebServer, "/api/images/metadata/exif", GetExif, "/api/getExif");
        HttpEndpointRegistrar.Map(WebServer, "/api/files/icon", GetFileIcon, "/api/getFileIcon");
        HttpEndpointRegistrar.Map(WebServer, "/api/web/icon", GetWebIcon, "/api/getWebIcon");
        HttpEndpointRegistrar.Map(WebServer, "/api/files/info", GetFileInfo, "/api/getFileInfo2");
        HttpEndpointRegistrar.Map(WebServer, "/api/files/info-list", GetFileInfoList, "/api/getFileInfo2List");
        HttpEndpointRegistrar.Map(WebServer, "/api/files/related", GetRelatedFileList, "/api/getRelatedFileList");
        HttpEndpointRegistrar.Map(WebServer, "/api/files/binary-check", IsBinary, "/api/isBinary");

        HttpEndpointRegistrar.Map(WebServer, "/api/files/video", GetVideo, "/api/getVideo");
        HttpEndpointRegistrar.Map(WebServer, "/api/files/content", GetFile, "/api/getFile");
        HttpEndpointRegistrar.Map(WebServer, "/api/files/pdf", GetPdf, "/api/getPdf");
        HttpEndpointRegistrar.Map(WebServer, "/api/files/text", GetText, "/api/getText");
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
        string path = Uri.UnescapeDataString(d.args["path"]);

        if (await CheckFileExist(d, path) == false) { return; }
        if (HeadersAdd304(d, path)) { return; }

        await WriteString(d, FileLib.GetText(path));
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
    /// 取得檔案的 Exif 資訊
    /// </summary>
    private async Task GetExif(RequestData d) {
        int maxLength = int.Parse(d.args["maxLength"]);
        string path = Uri.UnescapeDataString(d.args["path"]);

        if (File.Exists(path) == false) {
            d.context.Response.StatusCode = 404;
            await WriteJson(d, new ImgExif());
            return;
        }

        if (HeadersAdd304(d, path)) { return; }

        var exif = Exif.GetExif(path, maxLength);
        await WriteJson(d, exif);
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

    /// <summary>
    /// 下載網路圖片到暫存資料夾後，再以系統縮圖方式回傳 icon
    /// </summary>
    private async Task GetWebIcon(RequestData d) {
        int size = Int32.Parse(d.args["size"]);
        string path = Uri.UnescapeDataString(d.args["path"]);
        string url = Uri.UnescapeDataString(d.args["url"]);

        string tempPath = Path.Combine(AppPath.tempDirWebFile, path);

        string tempDir = Path.GetDirectoryName(tempPath);
        // 先確保暫存資料夾存在，避免下載完成後無法落檔
        if (Directory.Exists(tempDir) == false) {
            Directory.CreateDirectory(tempDir);
        }

        // 若本地尚未快取，先下載圖片到指定暫存位置
        if (File.Exists(tempPath) == false) {
            try {
                using HttpClient webClient = new();
                webClient.Timeout = TimeSpan.FromSeconds(10);
                byte[] data = webClient.GetByteArrayAsync(url).Result;
                File.WriteAllBytes(tempPath, data);
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
        if (HeadersAdd304(d, path)) { return; }

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
    /// 取得單一檔案的詳細資訊
    /// </summary>
    private async Task GetFileInfo(RequestData d) {
        string path = Uri.UnescapeDataString(d.args["path"]);

        if (await CheckFileExist(d, path) == false) { return; }
        if (HeadersAdd304(d, path)) { return; }

        await WriteJson(d, FileLib.GetFileInfo2(path));
    }

    /// <summary>
    /// 批次取得多個檔案的詳細資訊
    /// </summary>
    private async Task GetFileInfoList(RequestData d) {
        var json = JsonDocument.Parse(d.postData);
        string[] ar = json.GetStringArray("ar");

        await WriteJson(d, FileLib.GetFileInfo2List(ar));
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

        await WriteString(d, FileLib.IsBinary(path).ToString());
    }
}
