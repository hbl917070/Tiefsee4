using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace Tiefsee;

public class WebServerController {

    private WebServer _webServer;

    public WebServerController(WebServer ws) {

        _webServer = ws;

        //註冊路由
        /*webServer.RouteAddGet("/aa/bb/{*}", (RequestData d) => {
            byte[] _responseArray = Encoding.UTF8.GetBytes("-" + d.value + "-");
            d.context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length); // write bytes to the output stream
        });*/

        _webServer.RouteAdd("/api/check", Ckeck);
        _webServer.RouteAdd("/api/newWindow", NewWindow);
        _webServer.RouteAdd("/api/closeAllWindow", CloseAllWindow);

        _webServer.RouteAdd("/api/getExif", GetExif);
        _webServer.RouteAdd("/api/getFileIcon", GetFileIcon);
        _webServer.RouteAdd("/api/getWebIcon", GetWebIcon);
        _webServer.RouteAdd("/api/getFileInfo2", GetFileInfo2);
        _webServer.RouteAdd("/api/getFileInfo2List", GetFileInfo2List);
        _webServer.RouteAdd("/api/getUwpList", GetUwpList);
        _webServer.RouteAdd("/api/getRelatedFileList", GetRelatedFileList);
        _webServer.RouteAdd("/api/isBinary", IsBinary);
        _webServer.RouteAdd("/api/getClipboardContent", GetClipboardContent);
        _webServer.RouteAdd("/api/extractFrames", ExtractFrames);
        _webServer.RouteAdd("/api/forwardRequest", ForwardRequest);
        _webServer.RouteAdd("/api/sort", GetSort);
        _webServer.RouteAdd("/api/sort2", GetSort2);

        _webServer.RouteAdd("/api/getVideo", GetVideo);
        _webServer.RouteAdd("/api/getFile", GetFile);
        _webServer.RouteAdd("/api/getPdf", GetPdf);
        _webServer.RouteAdd("/api/getText", GetText);

        _webServer.RouteAdd("/api/directory/getSiblingDir", GetSiblingDir);
        _webServer.RouteAdd("/api/directory/getFiles2", GetFiles2);
        _webServer.RouteAdd("/api/directory/getFiles", GetFiles);
        _webServer.RouteAdd("/api/directory/getDirectories", GetDirectories);

        _webServer.RouteAdd("/api/img/magick", ImgMagick);
        _webServer.RouteAdd("/api/img/rawThumbnail", ImgRawThumbnail);
        _webServer.RouteAdd("/api/img/wpf", ImgWpf);
        _webServer.RouteAdd("/api/img/webIcc", ImgWebIcc);
        _webServer.RouteAdd("/api/img/nconvert", ImgNconvert);
        _webServer.RouteAdd("/api/img/vipsInit", ImgVipsInit);
        _webServer.RouteAdd("/api/img/vipsResize", ImgVipsResize);
        _webServer.RouteAdd("/api/img/clip", ImgClip);
        _webServer.RouteAdd("/api/img/extractPng", ImgExtractPng);

        _webServer.RouteAdd("/plugin/{*}", GetPlugin);
        _webServer.RouteAdd("/www/{*}", GetWww);
        _webServer.RouteAdd("/file/{*}", GetFile);
        _webServer.RouteAdd("/{*}", GetWww);
    }

    #region 視窗

    /// <summary>
    /// 檢查這個 port 是否為 Tiefsee 所使用，用於快速啟動
    /// </summary>
    private async Task Ckeck(RequestData d) {
        await WriteString(d, "tiefsee");
    }

    /// <summary>
    /// 新開一個視窗，用於快速啟動
    /// </summary>
    private async Task NewWindow(RequestData d) {

        string arg = Uri.UnescapeDataString(d.args["path"]); // 將字串剖析回命令列參數
        string[] args = arg.Split('\n');

        Adapter.UIThread(() => {
            WebWindow.Create("MainWindow.html", args, null);
        });

        await WriteString(d, "ok");
    }

    /// <summary>
    /// 關閉全部的視窗
    /// </summary>
    private async Task CloseAllWindow(RequestData d) {
        Adapter.UIThread(() => {
            WebWindow.CloseAllWindow();
        });
        await WriteString(d, "ok");
    }

    #endregion

    #region 返回檔案

    private readonly Dictionary<string, int> _cache = new();
    /// <summary>
    /// 取得影片
    /// </summary>
    async Task GetVideo(RequestData d) {

        string path = Uri.UnescapeDataString(d.args["path"]);
        string windowId = d.args["windowId"]; // 避免快速調整進度條時，已經關閉的影片還在持續寫入

        // 如果檔案不存在就返回 404 錯誤
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
            if (rangeValues.Length > 1 && !string.IsNullOrEmpty(rangeValues[1])) {
                end = long.Parse(rangeValues[1]);
            }

            response.StatusCode = (int)HttpStatusCode.PartialContent;
            response.Headers.Add("Content-Range", $"bytes {start}-{end}/{totalLength}");
        }
        else {
            response.StatusCode = (int)HttpStatusCode.OK;
        }

        // 同一個 windowId 下，同一個檔案只有最後一個請求會持續寫入
        var key = windowId + path;
        if (_cache.ContainsKey(key) == false) {
            _cache.Add(key, 0);
        }
        _cache[key] += 1;
        var nowKey = _cache[key];

        response.ContentLength64 = end - start + 1;
        using var fileStream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
        fileStream.Seek(start, SeekOrigin.Begin);
        var buffer = new byte[64 * 1024]; // 64KB buffer
        int bytesRead;
        while ((bytesRead = await fileStream.ReadAsync(buffer, 0, buffer.Length)) > 0 && response.OutputStream.CanWrite) {
            if (nowKey != _cache[key]) { return; }
            await response.OutputStream.WriteAsync(buffer, 0, bytesRead);
        }
    }

    /// <summary>
    /// 取得 Pdf
    /// </summary>
    private async Task GetPdf(RequestData d) {

        string path = Uri.UnescapeDataString(d.args["path"]);

        // 如果檔案不存在就返回 404 錯誤
        if (await CheckFileExist(d, path) == false) { return; }

        // 如果前端的檔案已經有快取，則直接回傳 304
        if (HeadersAdd304(d, path)) { return; }

        d.context.Response.ContentType = "application/pdf";

        await WriteFile(d, path);
    }

    /// <summary>
    /// 取得文字檔內容
    /// </summary>
    async Task GetText(RequestData d) {

        string path = Uri.UnescapeDataString(d.args["path"]);

        // 如果檔案不存在就返回 404 錯誤
        if (await CheckFileExist(d, path) == false) { return; }

        // 如果前端的檔案已經有快取，則直接回傳 304
        if (HeadersAdd304(d, path)) { return; }

        await WriteString(d,
            FileLib.GetText(path));
    }

    /// <summary>
    /// 取得 www 目錄裡面的檔案
    /// </summary>
    private async Task GetWww(RequestData d) {

        bool allowCors = d.args.GetValueOrDefault("allowCors") == "true";
        string exeDir = System.AppDomain.CurrentDomain.BaseDirectory; // 程式的目錄
        string path;
        if (d.value.StartsWith("Www/", StringComparison.OrdinalIgnoreCase)) {
            path = System.IO.Path.Combine(exeDir, d.value);
        }
        else {
            path = System.IO.Path.Combine(exeDir, "Www", d.value);
        }

        // 如果檔案不存在就返回 404 錯誤
        if (await CheckFileExist(d, path) == false) { return; }

        // 如果前端的檔案已經有快取，則直接回傳 304
        if (HeadersAdd304(d, path)) { return; }

        // 禁止跨域請求
        if (allowCors == false) {
            d.context.Response.Headers.Add("Cross-Origin-Opener-Policy", "same-origin");
            d.context.Response.Headers.Add("Cross-Origin-Embedder-Policy", "require-corp");
        }

        d.context.Response.ContentType = GetMimeTypeMapping(path);

        await WriteFile(d, path);
    }

    // <summary>
    /// 取得 plugin 目錄裡面的檔案
    /// </summary>
    private async Task GetPlugin(RequestData d) {

        string path = System.IO.Path.Combine(AppPath.appDataPlugin, d.value);

        // 如果檔案不存在就返回 404 錯誤
        if (await CheckFileExist(d, path) == false) { return; }

        // 如果前端的檔案已經有快取，則直接回傳 304
        if (HeadersAdd304(d, path)) { return; }

        // 禁止跨域請求
        d.context.Response.Headers.Add("Cross-Origin-Opener-Policy", "same-origin");
        d.context.Response.Headers.Add("Cross-Origin-Embedder-Policy", "require-corp");

        d.context.Response.ContentType = GetMimeTypeMapping(path);

        await WriteFile(d, path);
    }

    /// <summary>
    /// 取得任意檔案
    /// </summary>
    async Task GetFile(RequestData d) {

        var path = d.args.GetValueOrDefault("path");
        if (path != null) {
            path = Uri.UnescapeDataString(path);
        }
        else {
            path = d.value;
        }

        // 如果檔案不存在就返回 404 錯誤
        if (await CheckFileExist(d, path) == false) { return; }

        // 如果前端的檔案已經有快取，則直接回傳 304
        // if (HeadersAdd304(d, path)) { return; }

        d.context.Response.ContentType = GetMimeTypeMapping(path);

        await WriteFile(d, path);
    }

    #endregion

    #region 圖片

    /// <summary>
    /// 產生圖片暫存並且返回圖片的長寬
    /// </summary>
    async Task ImgVipsInit(RequestData d) {

        string path = Uri.UnescapeDataString(d.args["path"]);
        string[] arType = d.args["type"].Split(','); // 使用什麼方式處理圖片

        if (File.Exists(path) == false) { // 檔案不存在
            await WriteJson(d, new ImgInitInfo());
            return;
        }

        // 如果前端的檔案已經有快取，則直接回傳 304
        if (HeadersAdd304(d, path)) { return; }

        ImgInitInfo imgInfo = new();
        Adapter.RunWithTimeout(60, () => {
            for (int i = 0; i < arType.Length; i++) {
                string type = arType[i];

                try {
                    imgInfo = ImgLib.GetImgInitInfo(path, type, type);
                }
                catch { }

                if (imgInfo.width != 0) {
                    break;
                }
            }
        });

        await WriteJson(d, imgInfo);
    }

    /// <summary>
    /// 縮放圖片，並且存入暫存資料夾(必須於vipsInit之後使用)
    /// </summary>
    async Task ImgVipsResize(RequestData d) {

        string path = Uri.UnescapeDataString(d.args["path"]);
        double scale = Double.Parse(d.args["scale"], CultureInfo.InvariantCulture);
        string fileType = d.args["fileType"];
        string vipsType = d.args["vipsType"];

        // 如果檔案不存在就返回 404 錯誤
        if (await CheckFileExist(d, path) == false) { return; }

        // 如果前端的檔案已經有快取，則直接回傳 304
        if (HeadersAdd304(d, path)) { return; }

        string imgPath = null;
        Adapter.RunWithTimeout(60, () => {
            imgPath = ImgLib.VipsResize(path, scale, fileType, vipsType);
        });
        if (imgPath == null) {
            await WriteError(d, 500, "Timeout");
        }
        else {
            await WriteFile(d, imgPath);
        }
    }

    /// <summary>
    ///
    /// </summary>
    async Task ImgNconvert(RequestData d) {

        string type = d.args["type"];
        string path = Uri.UnescapeDataString(d.args["path"]);

        // 如果檔案不存在就返回 404 錯誤
        if (await CheckFileExist(d, path) == false) { return; }

        // 如果前端的檔案已經有快取，則直接回傳 304
        if (HeadersAdd304(d, path)) { return; }

        // string contentType = "";

        string imgPath;
        if (type == "png") {
            imgPath = ImgLib.Nconvert_PathToPath(path, false, "png");
        }
        else {
            imgPath = ImgLib.Nconvert_PathToPath(path, false, "bmp");
        }
        await WriteString(d, imgPath); // 回傳輸出的檔案路徑
    }

    /// <summary>
    ///
    /// </summary>
    async Task ImgMagick(RequestData d) {

        string type = d.args["type"];
        string path = Uri.UnescapeDataString(d.args["path"]);

        // 如果檔案不存在就返回 404 錯誤
        if (await CheckFileExist(d, path) == false) { return; }

        // 如果前端的檔案已經有快取，則直接回傳 304
        if (HeadersAdd304(d, path)) { return; }

        // d.context.Response.ContentType = "image/bmp";

        using var stream = ImgLib.MagickImage_PathToStream(path, type);

        await WriteStream(d, stream);
    }

    /// <summary>
    ///
    /// </summary>
    async Task ImgWpf(RequestData d) {

        string path = Uri.UnescapeDataString(d.args["path"]);

        // 如果檔案不存在就返回 404 錯誤
        if (await CheckFileExist(d, path) == false) { return; }

        // 如果前端的檔案已經有快取，則直接回傳 304
        if (HeadersAdd304(d, path)) { return; }

        d.context.Response.ContentType = "image/bmp";

        using var stream = ImgLib.Wpf_PathToStream(path);

        await WriteStream(d, stream);
    }

    /// <summary>
    /// 如果檔案的 ICC Profile 為 CMYK，則先使用 WPF 處理圖片
    /// </summary>
    async Task ImgWebIcc(RequestData d) {

        string path = Uri.UnescapeDataString(d.args["path"]);

        // 如果檔案不存在就返回 404 錯誤
        if (await CheckFileExist(d, path) == false) { return; }

        // 如果前端的檔案已經有快取，則直接回傳 304
        if (HeadersAdd304(d, path)) { return; }

        if (ImgLib.IsCMYK(path)) { // 檢查檔案是否為 CMYK
            d.context.Response.ContentType = "image/bmp";
            using var stream = ImgLib.Wpf_PathToStream(path);
            await WriteStream(d, stream);
        }
        else {
            await WriteFile(d, path);
        }
    }

    /// <summary>
    ///
    /// </summary>
    async Task ImgRawThumbnail(RequestData d) {

        string path = Uri.UnescapeDataString(d.args["path"]);

        // 如果檔案不存在就返回 404 錯誤
        if (await CheckFileExist(d, path) == false) { return; }

        // 如果前端的檔案已經有快取，則直接回傳 304
        if (HeadersAdd304(d, path)) { return; }

        d.context.Response.ContentType = "image/bmp";

        using var stream = ImgLib.RawThumbnail_PathToStream(path, 800, out int width, out int height);

        await WriteStream(d, stream);
    }

    /// <summary>
    ///
    /// </summary>
    async Task ImgClip(RequestData d) {

        string path = Uri.UnescapeDataString(d.args["path"]);

        // 如果檔案不存在就返回 404 錯誤
        if (await CheckFileExist(d, path) == false) { return; }

        // 如果前端的檔案已經有快取，則直接回傳 304
        if (HeadersAdd304(d, path)) { return; }

        using var stream = ImgLib.ClipToStream(path);

        await WriteStream(d, stream);
    }

    /// <summary>
    ///
    /// </summary>
    async Task ImgExtractPng(RequestData d) {

        string path = Uri.UnescapeDataString(d.args["path"]);

        // 如果檔案不存在就返回 404 錯誤
        if (await CheckFileExist(d, path) == false) { return; }

        // 如果前端的檔案已經有快取，則直接回傳 304
        if (HeadersAdd304(d, path)) { return; }

        using var stream = ImgLib.ExtractPngToStream(path);

        await WriteStream(d, stream);
    }

    #endregion

    #region Directory

    /// <summary>
    /// 取得跟自己同層的資料夾內的檔案資料(自然排序的前5筆)
    /// </summary>
    private async Task GetSiblingDir(RequestData d) {

        var json = JsonDocument.Parse(d.postData);
        string path = json.GetString("path");
        string[] arExt = json.GetStringArray("arExt");
        int maxCount = json.GetInt32("maxCount");

        // 如果資料夾不存在就返回 404 錯誤
        if (await CheckDirExist(d, path) == false) { return; }

        await WriteJson(d,
            new WV_Directory().GetSiblingDir(path, arExt, maxCount));
    }

    /// <summary>
    /// 檔名陣列 轉 路徑陣列 (用於載入複數檔案
    /// </summary>
    private async Task GetFiles2(RequestData d) {

        var json = JsonDocument.Parse(d.postData);
        string dirPath = json.GetString("dirPath");
        string[] arName = json.GetStringArray("arName");

        // 只回傳檔名，減少傳輸成本
        int pathLen = dirPath.Length;
        var ret = new WV_Directory().GetFiles2(dirPath, arName)
            .Select(filePath => filePath.Substring(pathLen))
            .ToArray();

        await WriteJson(d, ret);
    }

    /// <summary>
    /// 回傳資料夾裡面的檔案
    /// </summary>
    private async Task GetFiles(RequestData d) {

        var json = JsonDocument.Parse(d.postData);
        string path = json.GetString("path");
        string searchPattern = json.GetString("searchPattern");

        // 如果資料夾不存在就返回 404 錯誤
        if (await CheckDirExist(d, path) == false) { return; }

        // 只回傳檔名，減少傳輸成本
        int pathLen = path.Length;
        var ret = Directory.EnumerateFiles(path, searchPattern)
            .Select(filePath => filePath.Substring(pathLen))
            .ToArray();

        await WriteJson(d, ret);
    }

    /// <summary>
    /// 回傳資料夾裡面的子資料夾
    /// </summary>
    private async Task GetDirectories(RequestData d) {

        var json = JsonDocument.Parse(d.postData);
        string path = json.GetString("path");
        string searchPattern = json.GetString("searchPattern");

        // 如果資料夾不存在就返回 404 錯誤
        if (await CheckDirExist(d, path) == false) { return; }

        // 只回傳檔名，減少傳輸成本
        int pathLen = path.Length;
        var ret = Directory.GetDirectories(path, searchPattern)
            .Select(dirPath => dirPath.Substring(pathLen))
            .ToArray();

        await WriteJson(d, ret);
    }

    #endregion

    /// <summary>
    /// 轉送請求
    /// </summary>
    async Task ForwardRequest(RequestData d) {

        var context = d.context;
        string targetUrl = d.context.Request.Headers["targetUrl"];

        // 如果 Headers 無法獲取 targetUrl，就從 query string 取得
        if (string.IsNullOrEmpty(targetUrl)) {
            targetUrl = Uri.UnescapeDataString(d.args.GetValueOrDefault("targetUrl"));
        }

        // 如果沒有指定 targetUrl，就返回 400 錯誤
        if (string.IsNullOrEmpty(targetUrl)) {
            await WriteError(d, 400, "targetUrl is empty");
            return;
        }

        try {
            using HttpClient httpClient = new HttpClient();
            var request = new HttpRequestMessage(new HttpMethod(context.Request.HttpMethod), targetUrl);

            // 複製請求內容
            if (context.Request.HasEntityBody) {
                request.Content = new StreamContent(context.Request.InputStream);
            }

            // 複製請求標頭
            foreach (string headerName in context.Request.Headers.AllKeys) {

                // 跳過自定義的 url header
                if (headerName.Equals("url", StringComparison.OrdinalIgnoreCase)) { continue; }
                // 設定了會導致 SSL 驗證失敗
                if (headerName.Equals("host", StringComparison.OrdinalIgnoreCase)) { continue; }
                if (headerName.Equals("referer", StringComparison.OrdinalIgnoreCase)) { continue; }

                if (!request.Headers.TryAddWithoutValidation(headerName, context.Request.Headers[headerName])) {
                    if (request.Content != null && !request.Content.Headers.TryAddWithoutValidation(headerName, context.Request.Headers[headerName])) {
                        Console.WriteLine($"無法添加標頭: {headerName}");
                    }
                }
            }

            using (var response = await httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead)) {
                context.Response.StatusCode = (int)response.StatusCode;
                context.Response.ContentType = response.Content.Headers.ContentType?.ToString();

                // 複製響應標頭
                foreach (var header in response.Headers) {
                    context.Response.Headers.Add(header.Key, string.Join(",", header.Value));
                }
                foreach (var header in response.Content.Headers) {
                    // 設定了在某些情況下會導致錯誤
                    if (header.Key.Equals("Content-Length", StringComparison.OrdinalIgnoreCase)) { continue; }

                    context.Response.Headers.Add(header.Key, string.Join(",", header.Value));
                }

                // 複製響應內容
                using (var responseStream = await response.Content.ReadAsStreamAsync()) {
                    await responseStream.CopyToAsync(context.Response.OutputStream);
                }
            }
        }
        catch (Exception ex) {
            await WriteError(d, 500, ex.Message);
        }
    }

    /// <summary>
    /// 取得檔案的 Exif 資訊
    /// </summary>
    async Task GetExif(RequestData d) {

        int maxLength = int.Parse(d.args["maxLength"]);
        string path = Uri.UnescapeDataString(d.args["path"]);

        // 如果檔案不存在就返回 404 錯誤
        if (File.Exists(path) == false) {
            d.context.Response.StatusCode = 404;
            await WriteJson(d, new ImgExif());
            return;
        }

        // 如果前端的檔案已經有快取，則直接回傳 304
        if (HeadersAdd304(d, path)) { return; }

        var exif = Exif.GetExif(path, maxLength);

        await WriteJson(d, exif);
    }

    /// <summary>
    /// 取得檔案的 Icon
    /// </summary>
    private async Task GetFileIcon(RequestData d) {

        int size = Int32.Parse(d.args["size"]);
        string path = Uri.UnescapeDataString(d.args["path"]);

        // 如果檔案不存在就返回 404 錯誤
        if (await CheckFileExist(d, path) == false) { return; }

        // 如果前端的檔案已經有快取，則直接回傳 304
        if (HeadersAdd304(d, path)) { return; }

        using Bitmap icon = ImgLib.GetFileIcon(path, size, 3);

        // 如果取得失敗，就返回 500 錯誤
        if (icon == null) {
            await WriteError(d, 500, "圖示取得失敗");
            return;
        }

        try {
            using var input = new MemoryStream();
            icon.Save(input, System.Drawing.Imaging.ImageFormat.Png);
            input.Position = 0;

            d.context.Response.ContentType = "image/png";

            await WriteStream(d, input); // 回傳檔案

            icon.Dispose();
        }
        catch {
            await WriteError(d, 500, "圖示解析失敗");
        }
    }

    /// <summary>
    /// 從網路下載圖片後，返回圖片的 icon
    /// </summary>
    /// <param name="d"></param>
    private async Task GetWebIcon(RequestData d) {

        int size = Int32.Parse(d.args["size"]);
        string path = Uri.UnescapeDataString(d.args["path"]); // 檔案儲存的相對路徑
        string url = Uri.UnescapeDataString(d.args["url"]);

        string tempPath = Path.Combine(AppPath.tempDirWebFile, path);

        // 如果資料夾不存在就建立
        if (Directory.Exists(Path.GetDirectoryName(tempPath)) == false) {
            Directory.CreateDirectory(Path.GetDirectoryName(tempPath));
        }

        if (File.Exists(tempPath) == false) {
            try {
                // 下載圖片
                using HttpClient webClient = new();
                webClient.Timeout = TimeSpan.FromSeconds(10); // 設定超時時間為 10 秒
                byte[] data = webClient.GetByteArrayAsync(url).Result;
                File.WriteAllBytes(tempPath, data);
            }
            catch (Exception ex) {
                Debug.WriteLine("GetWebIcon fail " + ex.Message);
                await WriteError(d, 500, "圖片下載失敗: " + ex);
                return;
            }
        }

        // 如果檔案不存在就返回 404 錯誤
        if (File.Exists(tempPath) == false) {
            await WriteError(d, 404, $"url:{url}\npath:{tempPath}");
            return;
        }

        d.context.Response.ContentType = "image/png";

        // 如果前端的檔案已經有快取，則直接回傳 304
        if (HeadersAdd304(d, path)) { return; }

        using Bitmap icon = ImgLib.GetFileIcon(tempPath, size, 3);

        // 如果取得失敗，就返回 500 錯誤
        if (icon == null) {
            await WriteError(d, 500, "圖示取得失敗");
            return;
        }

        try {
            using Stream input = new MemoryStream();
            icon.Save(input, System.Drawing.Imaging.ImageFormat.Png);
            input.Position = 0;

            await WriteStream(d, input); // 回傳檔案

            icon.Dispose();
        }
        catch {
            await WriteError(d, 500, "圖示解析失敗");
        }
    }

    /// <summary>
    ///
    /// </summary>
    private async Task GetFileInfo2(RequestData d) {

        string path = Uri.UnescapeDataString(d.args["path"]);

        // 如果檔案不存在就返回 404 錯誤
        if (await CheckFileExist(d, path) == false) { return; }

        // 如果前端的檔案已經有快取，則直接回傳 304
        if (HeadersAdd304(d, path)) { return; }

        await WriteJson(d,
            FileLib.GetFileInfo2(path));
    }

    /// <summary>
    ///
    /// </summary>
    private async Task GetFileInfo2List(RequestData d) {

        var json = JsonDocument.Parse(d.postData);
        string[] ar = json.GetStringArray("ar");

        await WriteJson(d,
            FileLib.GetFileInfo2List(ar));
    }

    /// <summary>
    /// 取得 UWP 列表
    /// </summary>
    private async Task GetUwpList(RequestData d) {

        await WriteJson(d,
            new WV_RunApp().GetUwpList());
    }

    /// <summary>
    /// 取得 相關檔案
    /// </summary>
    private async Task GetRelatedFileList(RequestData d) {

        string filePath = d.args["path"];
        filePath = Uri.UnescapeDataString(filePath);
        string[] arTextExt = d.args["textExt"].Split(','); // 要讀取文字的副檔名名單

        // 如果檔案不存在就返回 404 錯誤
        if (await CheckFileExist(d, filePath) == false) { return; }

        FileInfo fileInfo = new FileInfo(filePath);  // 取得檔案資訊
        DirectoryInfo directoryInfo = fileInfo.Directory; // 取得檔案所在的目錄
        string fileNameWithoutExtension = Path.GetFileNameWithoutExtension(filePath); // 取得檔案名稱（不含副檔名）

        string fileNamePrefix = fileInfo.Name.Split('.')[0]; // 取得檔名中第一個「.」前面的部分

        // 取得與該檔案相同檔名但不同副檔名的所有檔案陣列
        FileInfo[] files = directoryInfo.GetFiles()
            .Where(file => (file.Name != fileInfo.Name) && file.Name.Split('.')[0].Equals(fileNamePrefix, StringComparison.OrdinalIgnoreCase))
            .ToArray();

        // string[] arTextExt = new[] { ".txt", ".json", ".xml", ".info", ".ini", ".config" };
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
    /// 檢查檔案是否為二進制檔
    /// </summary>
    private async Task IsBinary(RequestData d) {

        string path = Uri.UnescapeDataString(d.args["path"]);

        // 如果檔案不存在就返回 404 錯誤
        if (await CheckFileExist(d, path) == false) { return; }

        // 如果前端的檔案已經有快取，則直接回傳 304
        if (HeadersAdd304(d, path)) { return; }

        await WriteString(d,
            FileLib.IsBinary(path).ToString());
    }

    /// <summary>
    /// 取得 剪貼簿內容
    /// </summary>
    private async Task GetClipboardContent(RequestData d) {

        int maxTextLength = int.Parse(d.args["maxTextLength"]);

        ClipboardLib.ClipboardContent clipboardContentData = null;
        Adapter.UIThread(() => {
            var clipboardLib = new ClipboardLib();
            clipboardContentData = clipboardLib.GetClipboardContent(maxTextLength);
        });

        await WriteJson(d, clipboardContentData);
    }

    /// <summary>
    /// 解析多幀圖片，並儲存到指定資料夾
    /// </summary>
    private async Task ExtractFrames(RequestData d) {

        string postData = d.postData;
        var json = JsonDocument.Parse(postData);
        string imgPath = json.GetString("imgPath");
        string outputDir = json.GetString("outputDir");

        await WriteJson(d,
            ImgFrames.ExtractFrames(imgPath, outputDir));
    }

    /// <summary>
    ///
    /// </summary>
    private async Task GetSort(RequestData d) {

        var json = JsonDocument.Parse(d.postData);
        string[] ar = json.GetStringArray("ar");
        string type = json.GetString("type");

        await WriteJson(d,
            new FileSort().Sort(ar, type));
    }

    /// <summary>
    ///
    /// </summary>
    private async Task GetSort2(RequestData d) {

        var json = JsonDocument.Parse(d.postData);
        string dir = json.GetString("dir");
        string[] ar = json.GetStringArray("ar");
        string type = json.GetString("type");

        await WriteJson(d,
            new FileSort().Sort2(dir, ar, type));
    }

    #region Headers 相關

    /// <summary>
    /// 回傳檔案時加入快取的 Headers
    /// </summary>
    /// <returns> true=304 false=正常回傳檔案 </returns>
    private bool HeadersAdd304(RequestData d, string path) {

        DateTime dt = new FileInfo(path).LastWriteTime;
        string lastModified = dt.ToString("ddd, dd MMM yyy HH':'mm':'ss 'GMT'", new System.Globalization.CultureInfo("en-US"));
        string etag = dt.ToFileTimeUtc().ToString();

        d.context.Response.Headers.Add("Last-Modified", lastModified); // 檔案建立的時間
        d.context.Response.Headers.Add("ETag", etag); // 瀏覽器用來判斷資源是否有更新的key

        if (d.context.Request.Headers["If-None-Match"] == etag) { // 表示瀏覽器還留有暫存，狀態304後，不用回傳任何資料
            d.context.Response.StatusCode = 304;
            return true;
        }

        return false;
    }

    /// <summary>
    /// 檢查檔案是否存在，不存在則回傳 404
    /// </summary>
    private async Task<bool> CheckFileExist(RequestData d, string path) {
        if (File.Exists(path) == false) {
            await WriteError(d, 404, path);
            return false;
        }
        return true;
    }

    // 檢查資料夾是否存在，不存在則回傳 404
    private async Task<bool> CheckDirExist(RequestData d, string path) {
        if (Directory.Exists(path) == false) {
            await WriteError(d, 404, path);
            return false;
        }
        return true;
    }

    #endregion

    #region 寫入回傳資料

    /// <summary>
    /// 回傳錯誤
    /// </summary>
    private async Task WriteError(RequestData d, int code, string msg) {
        d.context.Response.StatusCode = code;
        await WriteString(d, msg);
    }

    /// <summary>
    /// 回傳 Json
    /// </summary>
    private async Task WriteJson(RequestData d, object obj) {
        string json = JsonSerializer.Serialize(obj);
        d.context.Response.AddHeader("Content-Encoding", "br"); // 告訴瀏覽器使用了 Brotli 壓縮
        d.context.Response.AddHeader("Content-Type", "application/json; charset=utf-8"); // 設定編碼
        byte[] _responseArray = CompressString(json);
        await d.context.Response.OutputStream.WriteAsync(_responseArray, 0, _responseArray.Length);
    }

    /// <summary>
    /// 回傳字串
    /// </summary>
    private async Task WriteString(RequestData d, string str) {
        d.context.Response.AddHeader("Content-Encoding", "br"); // 告訴瀏覽器使用了 Brotli 壓縮
        d.context.Response.AddHeader("Content-Type", "text/text; charset=utf-8"); // 設定編碼
        byte[] _responseArray = CompressString(str);
        await d.context.Response.OutputStream.WriteAsync(_responseArray, 0, _responseArray.Length);
    }

    /// <summary>
    /// 使用 Brotli 壓縮
    /// </summary>
    private byte[] CompressString(string text) {
        var bytes = Encoding.UTF8.GetBytes(text);
        using (var msi = new MemoryStream(bytes))
        using (var mso = new MemoryStream()) {
            using (var br = new BrotliStream(mso, CompressionLevel.Fastest)) {
                msi.CopyTo(br);
            }
            return mso.ToArray();
        }
    }

    /// <summary>
    /// 回傳檔案
    /// </summary>
    private async Task WriteFile(RequestData d, string path) {
        using var input = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
        d.context.Response.ContentLength64 = input.Length;
        if (d.context.Request.HttpMethod == "HEAD") { return; }
        byte[] buffer = new byte[1024 * 64];
        int nbytes;
        while ((nbytes = await input.ReadAsync(buffer, 0, buffer.Length)) > 0) {
            await d.context.Response.OutputStream.WriteAsync(buffer, 0, nbytes);
        }
    }

    /// <summary>
    /// 回傳檔案
    /// </summary>
    private async Task WriteStream(RequestData d, Stream ms) {
        using var input = ms;
        d.context.Response.ContentLength64 = input.Length;
        if (d.context.Request.HttpMethod == "HEAD") { return; }
        byte[] buffer = new byte[1024 * 64];
        int nbytes;
        while ((nbytes = await input.ReadAsync(buffer, 0, buffer.Length)) > 0) {
            await d.context.Response.OutputStream.WriteAsync(buffer, 0, nbytes);
        }
    }

    #endregion

    // 取得檔案的 MIME type
    private string GetMimeTypeMapping(string path) {
        return _mimeTypeMappings.TryGetValue(Path.GetExtension(path), out string mime) ?
            mime :
            "application/octet-stream";
    }
    private IDictionary<string, string> _mimeTypeMappings = new Dictionary<string, string>(StringComparer.InvariantCultureIgnoreCase) {
        #region extension to MIME type list
        {".asf", "video/x-ms-asf"},
        {".asx", "video/x-ms-asf"},
        {".avi", "video/x-msvideo"},
        {".bin", "application/octet-stream"},
        {".cco", "application/x-cocoa"},
        {".crt", "application/x-x509-ca-cert"},
        {".css", "text/css"},
        {".deb", "application/octet-stream"},
        {".der", "application/x-x509-ca-cert"},
        {".dll", "application/octet-stream"},
        {".dmg", "application/octet-stream"},
        {".ear", "application/java-archive"},
        {".eot", "application/octet-stream"},
        {".exe", "application/octet-stream"},
        {".flv", "video/x-flv"},
        {".gif", "image/gif"},
        {".hqx", "application/mac-binhex40"},
        {".htc", "text/x-component"},
        {".htm", "text/html"},
        {".html", "text/html"},
        {".ico", "image/x-icon"},
        {".img", "application/octet-stream"},
        {".iso", "application/octet-stream"},
        {".jar", "application/java-archive"},
        {".jardiff", "application/x-java-archive-diff"},
        {".jng", "image/x-jng"},
        {".jnlp", "application/x-java-jnlp-file"},
        {".jpeg", "image/jpeg"},
        {".jpg", "image/jpeg"},
        {".js", "application/x-javascript"},
        {".mml", "text/mathml"},
        {".mng", "video/x-mng"},
        {".mov", "video/quicktime"},
        {".mp3", "audio/mpeg"},
        {".mpeg", "video/mpeg"},
        {".mpg", "video/mpeg"},
        {".msi", "application/octet-stream"},
        {".msm", "application/octet-stream"},
        {".msp", "application/octet-stream"},
        {".pdb", "application/x-pilot"},
        {".pdf", "application/pdf"},
        {".pem", "application/x-x509-ca-cert"},
        {".pl", "application/x-perl"},
        {".pm", "application/x-perl"},
        {".png", "image/png"},
        {".prc", "application/x-pilot"},
        {".ra", "audio/x-realaudio"},
        {".rar", "application/x-rar-compressed"},
        {".rpm", "application/x-redhat-package-manager"},
        {".rss", "text/xml"},
        {".run", "application/x-makeself"},
        {".sea", "application/x-sea"},
        {".shtml", "text/html"},
        {".sit", "application/x-stuffit"},
        {".swf", "application/x-shockwave-flash"},
        {".tcl", "application/x-tcl"},
        {".tk", "application/x-tcl"},
        {".txt", "text/plain"},
        {".war", "application/java-archive"},
        {".wbmp", "image/vnd.wap.wbmp"},
        {".wmv", "video/x-ms-wmv"},
        {".xml", "text/xml"},
        {".xpi", "application/x-xpinstall"},
        {".zip", "application/zip"},
        {".mp4", "video/mpeg"},
        {".svg", "image/svg+xml" },
        {".ai", "application/pdf" },
        {".webp", "image/webp" },
        {".webm", "video/webm" },
        {".ogg", "audio/ogg" },
        {".avif", "image/avif" },
        {".json", "application/json" },
        {".bmp", "image/bmp" },
        {".tif", "image/tiff" },
        {".tiff", "image/tiff" },
        {".wasm", "application/wasm" },

        {".doc" , "application/msword" },
        {".dot" , "application/msword" },
        {".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
        {".dotx", "application/vnd.openxmlformats-officedocument.wordprocessingml.template" },
        {".docm", "application/vnd.ms-word.document.macroEnabled.12" },
        {".dotm", "application/vnd.ms-word.template.macroEnabled.12" },
        {".xls" , "application/vnd.ms-excel" },
        {".xlt" , "application/vnd.ms-excel" },
        {".xla" , "application/vnd.ms-excel" },
        {".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
        {".xltx", "application/vnd.openxmlformats-officedocument.spreadsheetml.template" },
        {".xlsm", "application/vnd.ms-excel.sheet.macroEnabled.12" },
        {".xltm", "application/vnd.ms-excel.template.macroEnabled.12" },
        {".xlam", "application/vnd.ms-excel.addin.macroEnabled.12" },
        {".xlsb", "application/vnd.ms-excel.sheet.binary.macroEnabled.12" },
        {".ppt" , "application/vnd.ms-powerpoint" },
        {".pot" , "application/vnd.ms-powerpoint" },
        {".pps" , "application/vnd.ms-powerpoint" },
        {".ppa" , "application/vnd.ms-powerpoint" },
        {".pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
        {".potx", "application/vnd.openxmlformats-officedocument.presentationml.template" },
        {".ppsx", "application/vnd.openxmlformats-officedocument.presentationml.slideshow" },
        {".ppam", "application/vnd.ms-powerpoint.addin.macroEnabled.12" },
        {".pptm", "application/vnd.ms-powerpoint.presentation.macroEnabled.12" },
        {".potm", "application/vnd.ms-powerpoint.template.macroEnabled.12" },
        {".ppsm", "application/vnd.ms-powerpoint.slideshow.macroEnabled.12" },
        {".mdb" , "application/vnd.ms-access" },

        #endregion
    };
}
