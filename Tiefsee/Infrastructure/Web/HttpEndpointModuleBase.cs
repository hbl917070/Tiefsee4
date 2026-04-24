using System.IO;
using System.IO.Compression;
using System.Text;
using System.Text.Json;

namespace Tiefsee;

public abstract class HttpEndpointModuleBase {

    /// <summary>
    /// 建立 endpoint module 的共用基底
    /// </summary>
    protected HttpEndpointModuleBase(WebServer webServer) {
        WebServer = webServer;
    }

    /// <summary>
    /// 目前掛載中的本機 HTTP server
    /// </summary>
    protected WebServer WebServer { get; }

    /// <summary>
    /// 回傳檔案快取相關的 headers，若瀏覽器已持有相同版本則直接回傳 304
    /// </summary>
    protected bool HeadersAdd304(RequestData d, string path) {
        DateTime dt = new FileInfo(path).LastWriteTime;
        string lastModified = dt.ToString("ddd, dd MMM yyyy HH':'mm':'ss 'GMT'", new System.Globalization.CultureInfo("en-US"));
        string etag = dt.ToFileTimeUtc().ToString();

        d.context.Response.Headers.Add("Last-Modified", lastModified);
        d.context.Response.Headers.Add("ETag", etag);
        d.context.Response.Headers.Add("Cache-Control", "no-cache");

        if (d.context.Request.Headers["If-None-Match"] == etag) {
            d.context.Response.StatusCode = 304;
            return true;
        }

        return false;
    }

    /// <summary>
    /// 檢查檔案是否存在，不存在時回傳 404
    /// </summary>
    protected async Task<bool> CheckFileExist(RequestData d, string path) {
        if (File.Exists(path) == false) {
            await WriteError(d, 404, path);
            return false;
        }
        return true;
    }

    /// <summary>
    /// 檢查資料夾是否存在，不存在時回傳 404
    /// </summary>
    protected async Task<bool> CheckDirExist(RequestData d, string path) {
        if (Directory.Exists(path) == false) {
            await WriteError(d, 404, path);
            return false;
        }
        return true;
    }

    /// <summary>
    /// 回傳錯誤狀態碼與文字訊息
    /// </summary>
    protected async Task WriteError(RequestData d, int code, string msg) {
        d.context.Response.StatusCode = code;
        await WriteString(d, msg);
    }

    /// <summary>
    /// 以 Brotli 壓縮回傳 JSON
    /// </summary>
    protected async Task WriteJson(RequestData d, object obj) {
        string json = JsonSerializer.Serialize(obj);
        d.context.Response.AddHeader("Content-Encoding", "br");
        d.context.Response.AddHeader("Content-Type", "application/json; charset=utf-8");
        byte[] responseArray = CompressString(json);
        await d.context.Response.OutputStream.WriteAsync(responseArray, 0, responseArray.Length);
    }

    /// <summary>
    /// 以 Brotli 壓縮回傳純文字
    /// </summary>
    protected async Task WriteString(RequestData d, string str) {
        d.context.Response.AddHeader("Content-Encoding", "br");
        d.context.Response.AddHeader("Content-Type", "text/text; charset=utf-8");
        byte[] responseArray = CompressString(str);
        await d.context.Response.OutputStream.WriteAsync(responseArray, 0, responseArray.Length);
    }

    /// <summary>
    /// 直接將檔案內容寫入 response stream
    /// </summary>
    protected async Task WriteFile(RequestData d, string path) {
        using var input = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
        d.context.Response.ContentLength64 = input.Length;
        if (d.context.Request.HttpMethod == "HEAD") { return; }

        // 使用固定大小 buffer 逐段寫出，避免一次載入整個檔案
        byte[] buffer = new byte[1024 * 64];
        int nbytes;
        while ((nbytes = await input.ReadAsync(buffer, 0, buffer.Length)) > 0) {
            await d.context.Response.OutputStream.WriteAsync(buffer, 0, nbytes);
        }
    }

    /// <summary>
    /// 直接將記憶體串流內容寫入 response stream
    /// </summary>
    protected async Task WriteStream(RequestData d, Stream stream) {
        using var input = stream;
        d.context.Response.ContentLength64 = input.Length;
        if (d.context.Request.HttpMethod == "HEAD") { return; }

        // 和檔案輸出相同，採分段寫入避免佔用過大記憶體
        byte[] buffer = new byte[1024 * 64];
        int nbytes;
        while ((nbytes = await input.ReadAsync(buffer, 0, buffer.Length)) > 0) {
            await d.context.Response.OutputStream.WriteAsync(buffer, 0, nbytes);
        }
    }

    /// <summary>
    /// 依副檔名取得對應的 MIME type
    /// </summary>
    protected static string GetMimeTypeMapping(string path) {
        return MimeTypeMappings.TryGetValue(Path.GetExtension(path), out string mime)
            ? mime
            : "application/octet-stream";
    }

    /// <summary>
    /// 使用 Brotli 壓縮字串，降低 JSON 與文字回傳大小
    /// </summary>
    private static byte[] CompressString(string text) {
        var bytes = Encoding.UTF8.GetBytes(text);
        using var msi = new MemoryStream(bytes);
        using var mso = new MemoryStream();
        using (var br = new BrotliStream(mso, CompressionLevel.Fastest)) {
            msi.CopyTo(br);
        }
        return mso.ToArray();
    }

    /// <summary>
    /// 常用副檔名與 MIME type 對照表
    /// </summary>
    private static readonly IDictionary<string, string> MimeTypeMappings = new Dictionary<string, string>(StringComparer.InvariantCultureIgnoreCase) {
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
    };
}
