using System.IO;
using System.IO.Compression;
using System.Text;
using System.Text.Json;

namespace Tiefsee;

public class WebServerController {

    private WebServer webServer;
    private int cacheTime = 0; // 靜態資源快取的時間

    public WebServerController(WebServer ws) {

        webServer = ws;

        //註冊路由
        /*webServer.RouteAddGet("/aa/bb/{*}", (RequestData d) => {
            byte[] _responseArray = Encoding.UTF8.GetBytes("-" + d.value + "-");
            d.context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length); // write bytes to the output stream
        });*/

        webServer.RouteAdd("/api/check", Ckeck);
        webServer.RouteAdd("/api/newWindow", NewWindow);

        webServer.RouteAdd("/api/getExif", GetExif);
        webServer.RouteAdd("/api/getPdf", GetPdf);
        webServer.RouteAdd("/api/getText", GetText);
        webServer.RouteAdd("/api/getFileIcon", GetFileIcon);
        webServer.RouteAdd("/api/getFileInfo2", GetFileInfo2);
        webServer.RouteAdd("/api/getFileInfo2List", GetFileInfo2List);
        webServer.RouteAdd("/api/getUwpList", GetUwpList);
        webServer.RouteAdd("/api/getRelatedFileList", GetRelatedFileList);
        webServer.RouteAdd("/api/isBinary", IsBinary);
        webServer.RouteAdd("/api/getClipboardContent", GetClipboardContent);
        webServer.RouteAdd("/api/extractFrames", ExtractFrames);

        webServer.RouteAdd("/api/sort", GetSort);
        webServer.RouteAdd("/api/sort2", GetSort2);

        webServer.RouteAdd("/api/directory/getSiblingDir", GetSiblingDir);
        webServer.RouteAdd("/api/directory/getFiles2", GetFiles2);
        webServer.RouteAdd("/api/directory/getFiles", GetFiles);
        webServer.RouteAdd("/api/directory/getDirectories", GetDirectories);

        //webServer.RouteAddGet("/api/getImg/file/{*}", getImg);
        webServer.RouteAdd("/api/img/magick", ImgMagick);
        webServer.RouteAdd("/api/img/rawThumbnail", ImgRawThumbnail);
        webServer.RouteAdd("/api/img/wpf", ImgWpf);
        webServer.RouteAdd("/api/img/webIcc", ImgWebIcc);
        webServer.RouteAdd("/api/img/nconvert", ImgNconvert);
        webServer.RouteAdd("/api/img/vipsInit", ImgVipsInit);
        webServer.RouteAdd("/api/img/vipsResize", ImgVipsResize);
        webServer.RouteAdd("/api/img/clip", ImgClip);
        webServer.RouteAdd("/api/img/extractPng", ImgExtractPng);

        webServer.RouteAdd("/www/{*}", GetWww);
        webServer.RouteAdd("/{*}", GetWww);
    }


    #region Web API

    /// <summary>
    /// 取得檔案的 Exif 資訊
    /// </summary>
    void GetExif(RequestData d) {

        int maxLength = int.Parse(d.args["maxLength"]);
        string path = d.args["path"];
        path = Uri.UnescapeDataString(path);

        // 如果檔案不存在就返回 404 錯誤
        if (File.Exists(path) == false) {
            d.context.Response.StatusCode = 404;
            WriteString(d, JsonSerializer.Serialize(new ImgExif()));
            return;
        }

        //bool is304 = HeadersAdd304(d, path); //回傳檔案時加入快取的Headers
        //if (is304) { return; }

        var exif = Exif.GetExif(path, maxLength);
        string json = JsonSerializer.Serialize(exif);
        WriteString(d, json);
    }


    /// <summary>
    /// 產生圖片暫存並且返回圖片的長寬
    /// </summary>
    void ImgVipsInit(RequestData d) {

        string json;
        ImgInitInfo imgInfo = new();

        string path = d.args["path"];
        string[] arType = d.args["type"].Split(','); // 使用什麼方式處理圖片

        path = Uri.UnescapeDataString(path);

        if (File.Exists(path) == false) { // 檔案不存在
            json = JsonSerializer.Serialize(new ImgInitInfo());
            WriteString(d, json);
            return;
        }

        //bool is304 = HeadersAdd304(d, path); //回傳檔案時加入快取的Headers
        //if (is304 == true) { return; }

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

        json = JsonSerializer.Serialize(imgInfo);
        WriteString(d, json); // 回傳輸出的檔案路徑
    }

    /// <summary>
    /// 縮放圖片，並且存入暫存資料夾(必須於vipsInit之後使用)
    /// </summary>
    void ImgVipsResize(RequestData d) {
        string path = d.args["path"];
        double scale = Double.Parse(d.args["scale"]);
        string fileType = d.args["fileType"];
        string vipsType = d.args["vipsType"];

        path = Uri.UnescapeDataString(path);

        bool is304 = HeadersAdd304(d, path); // 回傳檔案時加入快取的Headers
        if (is304) { return; }

        string imgPath = ImgLib.VipsResize(path, scale, fileType, vipsType);
        WriteFile(d, imgPath); // 回傳檔案
    }

    /// <summary>
    ///
    /// </summary>
    void ImgNconvert(RequestData d) {

        string type = d.args["type"];
        string path = d.args["path"];
        path = Uri.UnescapeDataString(path);
        if (File.Exists(path) == false) { return; }
        //string contentType = "";
        //bool is304 = HeadersAdd304(d, path); // 回傳檔案時加入快取的Headers
        //if (is304 == true) { return; }

        string imgPath;
        if (type == "png") {
            imgPath = ImgLib.Nconvert_PathToPath(path, false, "png");
        }
        else {
            imgPath = ImgLib.Nconvert_PathToPath(path, false, "bmp");
        }
        WriteString(d, imgPath); // 回傳輸出的檔案路徑
    }

    /// <summary>
    ///
    /// </summary>
    void ImgMagick(RequestData d) {

        string type = d.args["type"];
        string path = d.args["path"];
        path = Uri.UnescapeDataString(path);
        if (File.Exists(path) == false) { return; }

        bool is304 = HeadersAdd304(d, path); // 回傳檔案時加入快取的Headers
        if (is304 == true) { return; }

        //d.context.Response.ContentType = "image/bmp";
        using (Stream stream = ImgLib.MagickImage_PathToStream(path, type)) {
            WriteStream(d, stream); // 回傳檔案
        }
    }

    /// <summary>
    ///
    /// </summary>
    void ImgWpf(RequestData d) {

        string path = d.args["path"];
        path = Uri.UnescapeDataString(path);
        if (File.Exists(path) == false) { return; }

        bool is304 = HeadersAdd304(d, path); // 回傳檔案時加入快取的Headers
        if (is304 == true) { return; }

        d.context.Response.ContentType = "image/bmp";
        using (Stream stream = ImgLib.Wpf_PathToStream(path)) {
            WriteStream(d, stream); // 回傳檔案
        }
    }

    /// <summary>
    /// 如果檔案的ICC Profile為CMYK，則先使用WPF處理圖片
    /// </summary>
    void ImgWebIcc(RequestData d) {

        string path = d.args["path"];
        path = Uri.UnescapeDataString(path);
        if (File.Exists(path) == false) { return; }

        bool is304 = HeadersAdd304(d, path); // 回傳檔案時加入快取的Headers
        if (is304 == true) { return; }

        if (ImgLib.IsCMYK(path)) { // 檢查檔案是否為 CMYK
            d.context.Response.ContentType = "image/bmp";
            using (Stream stream = ImgLib.Wpf_PathToStream(path)) {
                WriteStream(d, stream); // 回傳檔案
            }
        }
        else {
            WriteFile(d, path); // 回傳檔案
        }
    }

    /// <summary>
    ///
    /// </summary>
    void ImgRawThumbnail(RequestData d) {
        string path = d.args["path"];
        path = Uri.UnescapeDataString(path);
        if (File.Exists(path) == false) { return; }
        d.context.Response.ContentType = "image/bmp";
        bool is304 = HeadersAdd304(d, path); // 回傳檔案時加入快取的Headers
        if (is304 == true) { return; }

        using (Stream stream = ImgLib.RawThumbnail_PathToStream(path, 800, out int width, out int height)) {
            WriteStream(d, stream); // 回傳檔案
        }
    }

    /// <summary>
    ///
    /// </summary>
    void ImgClip(RequestData d) {

        string path = d.args["path"];
        path = Uri.UnescapeDataString(path);
        if (File.Exists(path) == false) { return; }
        bool is304 = HeadersAdd304(d, path); // 回傳檔案時加入快取的Headers
        if (is304 == true) { return; }

        using (Stream stream = ImgLib.ClipToStream(path)) {
            WriteStream(d, stream); // 回傳檔案
        }
    }

    /// <summary>
    ///
    /// </summary>
    void ImgExtractPng(RequestData d) {
        string path = d.args["path"];
        path = Uri.UnescapeDataString(path);
        if (File.Exists(path) == false) { return; }
        bool is304 = HeadersAdd304(d, path); // 回傳檔案時加入快取的Headers
        if (is304 == true) { return; }

        using (Stream stream = ImgLib.ExtractPngToStream(path)) {
            WriteStream(d, stream); // 回傳檔案
        }
    }

    /// <summary>
    /// 檢查這個 port 是否為 Tiefsee 所使用，用於快速啟動
    /// </summary>
    private void Ckeck(RequestData d) {
        WriteString(d, "tiefsee");
    }

    /// <summary>
    /// 新開一個視窗，用於快速啟動
    /// </summary>
    private void NewWindow(RequestData d) {
        string arg = Uri.UnescapeDataString(d.args["path"]); // 將字串剖析回命令列參數
        string[] args = arg.Split('\n');

        Adapter.UIThread(() => {
            WebWindow.Create("MainWindow.html", args, null);
        });

        WriteString(d, "ok");
    }

    /// <summary>
    ///
    /// </summary>
    private void GetImg(RequestData d) {
        string path = d.value;
        if (File.Exists(path) == false) { return; }
        d.context.Response.ContentType = _mimeTypeMappings.TryGetValue(Path.GetExtension(path), out string mime) ? mime : "application/octet-stream";
        bool is304 = HeadersAdd304(d, path); // 回傳檔案時加入快取的Headers
        if (is304 == false) {
            WriteFile(d, path); // 回傳檔案
        }
    }

    /// <summary>
    ///
    /// </summary>
    private void GetPdf(RequestData d) {
        string path = d.args["path"];
        path = Uri.UnescapeDataString(path);
        if (File.Exists(path) == false) { return; }
        d.context.Response.ContentType = "application/pdf";
        bool is304 = HeadersAdd304(d, path); // 回傳檔案時加入快取的Headers
        if (is304 == false) {
            WriteFile(d, path); // 回傳檔案
        }
    }

    /// <summary>
    /// 取得檔案的Exif資訊
    /// </summary>
    void GetText(RequestData d) {

        string path = d.args["path"];
        path = Uri.UnescapeDataString(path);

        //如果檔案不存在就返回404錯誤
        if (File.Exists(path) == false) {
            d.context.Response.StatusCode = 404;
            WriteString(d, JsonSerializer.Serialize(new ImgExif()));
            return;
        }

        bool is304 = HeadersAdd304(d, path); // 回傳檔案時加入快取的Headers
        if (is304) { return; }

        string ret = FileLib.GetText(path);

        WriteString(d, ret);
    }

    /// <summary>
    ///
    /// </summary>
    private void GetFileIcon(RequestData d) {

        Dictionary<string, string> args = d.args;
        int size = Int32.Parse(args["size"]);
        string path = Uri.UnescapeDataString(args["path"]);

        // 如果檔案不存在就返回 404 錯誤
        if (File.Exists(path) == false) {
            d.context.Response.StatusCode = 404;
            WriteString(d, "404");
            return;
        }

        d.context.Response.ContentType = "image/png";
        bool is304 = HeadersAdd304(d, path); // 回傳檔案時加入快取的 Headers
        if (is304) { return; }

        try {
            using Bitmap icon = ImgLib.GetFileIcon(path, size);
            if (icon == null) { return; }

            using (Stream input = new MemoryStream()) {

                icon.Save(input, System.Drawing.Imaging.ImageFormat.Png);
                input.Position = 0;

                d.context.Response.ContentLength64 = input.Length;

                if (d.context.Request.HttpMethod != "HEAD") {
                    byte[] buffer = new byte[1024 * 16];
                    int nbytes;
                    while ((nbytes = input.Read(buffer, 0, buffer.Length)) > 0) {
                        // context.Response.SendChunked = input.Length > 1024 * 16;
                        d.context.Response.OutputStream.Write(buffer, 0, nbytes);
                    }
                }
            }

        }
        catch {
            d.context.Response.StatusCode = 500;
            WriteString(d, "500");
        }
    }

    /// <summary>
    ///
    /// </summary>
    private void GetFileInfo2(RequestData d) {
        string path = d.args["path"];
        path = Uri.UnescapeDataString(path);

        var fileInfo2 = FileLib.GetFileInfo2(path);
        string srtStrJson = JsonSerializer.Serialize(fileInfo2);
        WriteString(d, srtStrJson);
    }

    /// <summary>
    ///
    /// </summary>
    private void GetFileInfo2List(RequestData d) {
        string postData = d.postData;
        var json = JsonDocument.Parse(postData);
        string[] ar = json.GetStringArray("ar");
        var arFileInfo2 = FileLib.GetFileInfo2List(ar);
        string srtStrJson = JsonSerializer.Serialize(arFileInfo2);
        WriteString(d, srtStrJson);
    }

    /// <summary>
    /// 取得 UWP 列表
    /// </summary>
    private void GetUwpList(RequestData d) {
        WV_RunApp wv = new WV_RunApp();
        string srtStrJson = wv.GetUwpList();
        WriteString(d, srtStrJson);
    }

    /// <summary>
    /// 取得 相關檔案
    /// </summary>
    /// <param name="d"></param>
    private void GetRelatedFileList(RequestData d) {

        string filePath = d.args["path"];
        filePath = Uri.UnescapeDataString(filePath);
        string[] arTextExt = d.args["textExt"].Split(','); // 要讀取文字的副檔名名單

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

        string retJson = JsonSerializer.Serialize(result);

        WriteString(d, retJson);
    }

    /// <summary>
    /// 檢查檔案是否為二進制檔
    /// </summary>
    private void IsBinary(RequestData d) {
        string path = d.args["path"];
        path = Uri.UnescapeDataString(path);
        var ret = FileLib.IsBinary(path).ToString();
        WriteString(d, ret);
    }

    /// <summary>
    /// 取得 剪貼簿內容
    /// </summary>
    private void GetClipboardContent(RequestData d) {
        int maxTextLength = int.Parse(d.args["maxTextLength"]);

        ClipboardLib.ClipboardContent json = null;
        Adapter.UIThread(() => {
            var clipboardLib = new ClipboardLib();
            json = clipboardLib.GetClipboardContent(maxTextLength);
        });

        string retJson = JsonSerializer.Serialize(json);
        WriteString(d, retJson);
    }

    /// <summary>
    /// 解析多幀圖片，並儲存到指定資料夾
    /// </summary>
    private void ExtractFrames(RequestData d) {
        string postData = d.postData;
        var json = JsonDocument.Parse(postData);
        string imgPath = json.GetString("imgPath");
        string outputDir = json.GetString("outputDir");

        var ret = ImgFrames.ExtractFrames(imgPath, outputDir);
        string srtStrJson = JsonSerializer.Serialize(ret);
        WriteString(d, srtStrJson);
    }

    /// <summary>
    ///
    /// </summary>
    private void GetSort(RequestData d) {
        string postData = d.postData;
        var json = JsonDocument.Parse(postData);
        string[] ar = json.GetStringArray("ar");
        string type = json.GetString("type");

        var filesort = new FileSort();
        string[] retAr = filesort.Sort(ar, type);
        string srtStrJson = JsonSerializer.Serialize(retAr);
        WriteString(d, srtStrJson);
    }

    /// <summary>
    ///
    /// </summary>
    private void GetSort2(RequestData d) {
        string postData = d.postData;
        var json = JsonDocument.Parse(postData);
        string dir = json.GetString("dir");
        string[] ar = json.GetStringArray("ar");
        string type = json.GetString("type");

        var filesort = new FileSort();
        string[] retAr = filesort.Sort2(dir, ar, type);
        string srtStrJson = JsonSerializer.Serialize(retAr);
        WriteString(d, srtStrJson);
    }

    #region Directory

    /// <summary>
    /// 取得跟自己同層的資料夾內的檔案資料(自然排序的前5筆)
    /// </summary>
    private void GetSiblingDir(RequestData d) {
        var json = JsonDocument.Parse(d.postData);
        string path = json.GetString("path");
        string[] arExt = json.GetStringArray("arExt");
        int maxCount = json.GetInt32("maxCount");

        var wvdir = new WV_Directory();
        string srtStrJson = wvdir.GetSiblingDir(path, arExt, maxCount);

        WriteString(d, srtStrJson);
    }


    /// <summary>
    /// 檔名陣列 轉 路徑陣列 (用於載入複數檔案
    /// </summary>
    private void GetFiles2(RequestData d) {

        var json = JsonDocument.Parse(d.postData);
        string dirPath = json.GetString("dirPath");
        string[] arName = json.GetStringArray("arName");

        var wvdir = new WV_Directory();
        string[] retAr = wvdir.GetFiles2(dirPath, arName);
        int pathLen = dirPath.Length; // 只回傳檔名，減少傳輸成本
        for (int i = 0; i < retAr.Length; i++) {
            retAr[i] = retAr[i].Substring(pathLen);
        }

        string srtStrJson = JsonSerializer.Serialize(retAr);
        WriteString(d, srtStrJson);
    }


    /// <summary>
    /// 回傳資料夾裡面的檔案
    /// </summary>
    private void GetFiles(RequestData d) {
        var json = JsonDocument.Parse(d.postData);
        string path = json.GetString("path");
        string searchPattern = json.GetString("searchPattern");

        // 只回傳檔名，減少傳輸成本
        int pathLen = path.Length;
        string[] retAr = Directory.EnumerateFiles(path, searchPattern)
            .Select(filePath => filePath.Substring(pathLen))
            .ToArray();

        string srtStrJson = JsonSerializer.Serialize(retAr);
        WriteString(d, srtStrJson);
    }

    /// <summary>
    /// 回傳資料夾裡面的子資料夾
    /// </summary>
    private void GetDirectories(RequestData d) {
        var json = JsonDocument.Parse(d.postData);
        string path = json.GetString("path");
        string searchPattern = json.GetString("searchPattern");

        string[] retAr = Directory.GetDirectories(path, searchPattern);
        int pathLen = path.Length; //只回傳檔名，減少傳輸成本
        for (int i = 0; i < retAr.Length; i++) {
            retAr[i] = retAr[i].Substring(pathLen);
        }

        string srtStrJson = JsonSerializer.Serialize(retAr);
        WriteString(d, srtStrJson); //回傳
    }

    #endregion

    /// <summary>
    /// 取得 www 目錄裡面的檔案
    /// </summary>
    private void GetWww(RequestData d) {

        string exeDir = System.AppDomain.CurrentDomain.BaseDirectory; // 程式的目錄

        string path;
        if (d.value.StartsWith("Www/", StringComparison.OrdinalIgnoreCase)) {
            path = System.IO.Path.Combine(exeDir, d.value);
        }
        else {
            path = System.IO.Path.Combine(exeDir, "Www", d.value);
        }

        // 如果檔案不存在就返回404錯誤
        if (File.Exists(path) == false) {
            d.context.Response.StatusCode = 404;
            WriteString(d, "404");
            return;
        }

        d.context.Response.ContentType = _mimeTypeMappings.TryGetValue(Path.GetExtension(path), out string mime) ? mime : "application/octet-stream";
        bool is304 = HeadersAdd304(d, path); // 回傳檔案時加入快取的Headers
                                             // d.context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
        if (is304 == false) {
            WriteFile(d, path); // 回傳檔案
        }
    }

    #endregion

    /// <summary>
    /// 回傳檔案時加入快取的Headers
    /// </summary>
    /// <returns> true=304 false=正常回傳檔案 </returns>
    private bool HeadersAdd304(RequestData d, string path) {

        DateTime dt = File.GetLastWriteTime(path);
        string lastModified = dt.ToString("ddd, dd MMM yyy HH':'mm':'ss 'GMT'", new System.Globalization.CultureInfo("en-US"));
        string etag = dt.ToFileTimeUtc().ToString();

        d.context.Response.Headers.Add("Last-Modified", lastModified); // 檔案建立的時間
        d.context.Response.Headers.Add("ETag", etag); // 瀏覽器用來判斷資源是否有更新的key
        d.context.Response.Headers.Add("Cache-Control", "public, max-age=" + cacheTime); // 讓瀏覽器快取檔案

        if (d.context.Request.Headers["If-None-Match"] == etag) { // 表示瀏覽器還留有暫存，狀態304後，不用回傳任何資料
            d.context.Response.StatusCode = 304;
            return true;
        }

        return false;
    }

    /// <summary>
    /// 設定是否對靜態資源使用快取
    /// </summary>
    /// <param name="time"> 秒數 </param>
    public void SetCacheTime(int time) {
        if (time <= 0) { time = 0; }
        if (time >= 31536000) { time = 31536000; } // 一年
        cacheTime = time;
    }

    /// <summary>
    /// 回傳字串
    /// </summary>
    /// <param name="context"></param>
    /// <param name="str"></param>
    private void WriteString(RequestData d, string str) {
        d.context.Response.AddHeader("Content-Encoding", "br"); // 告訴瀏覽器使用了Brotli壓縮
        d.context.Response.AddHeader("Content-Type", "text/text; charset=utf-8"); //設定編碼
        byte[] _responseArray = CompressString(str);
        d.context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length); // write bytes to the output stream
    }
    // 使用 Brotli 壓縮
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
    private void WriteFile(RequestData d, string path) {

        using (Stream input = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) {
            d.context.Response.ContentLength64 = input.Length;
            if (d.context.Request.HttpMethod != "HEAD") {
                byte[] buffer = new byte[1024 * 16];
                int nbytes;
                while ((nbytes = input.Read(buffer, 0, buffer.Length)) > 0) {
                    // context.Response.SendChunked = input.Length > 1024 * 16;
                    d.context.Response.OutputStream.Write(buffer, 0, nbytes);
                }
            }
            // context.Response.StatusCode = (int)HttpStatusCode.OK;
            // context.Response.OutputStream.Flush();
        }
        /*using (FileStream fs = new FileStream(_path, FileMode.Open, FileAccess.Read, FileAccess.Read, FileShare.ReadWrite)) {
            byte[] _responseArray = new byte[fs.Length];
            fs.Read(_responseArray, 0, _responseArray.Length);
            fs.Close();
            context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length); // write bytes to the output stream
        }*/
    }

    /// <summary>
    /// 回傳檔案
    /// </summary>
    void WriteStream(RequestData d, Stream ms) {
        using var input = ms;
        d.context.Response.ContentLength64 = input.Length;
        if (d.context.Request.HttpMethod != "HEAD") {
            byte[] buffer = new byte[1024 * 16];
            int nbytes;
            while ((nbytes = input.Read(buffer, 0, buffer.Length)) > 0) {
                d.context.Response.OutputStream.Write(buffer, 0, nbytes);
            }
        }
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
        #endregion
    };
}
