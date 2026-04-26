using System.Globalization;
using System.IO;
using System.Text.Json;

namespace Tiefsee;

public sealed class ImageHttpEndpoints : HttpEndpointModuleBase {

    private readonly ImageProcessingService _imageProcessingService;

    /// <summary>
    /// 建立圖片相關的 HTTP endpoints
    /// </summary>
    public ImageHttpEndpoints(WebServer webServer) : base(webServer) {
        _imageProcessingService = Program.services.ImageProcessing;
    }

    /// <summary>
    /// 註冊路由
    /// </summary>
    public void RegisterRoutes() {
        HttpEndpointRegistrar.Map(WebServer, "/api/images/frames", ExtractFrames, "/api/extractFrames");
        HttpEndpointRegistrar.Map(WebServer, "/api/images/thumbnail/magick", ImgMagick, "/api/img/magick");
        HttpEndpointRegistrar.Map(WebServer, "/api/images/thumbnail/raw", ImgRawThumbnail, "/api/img/rawThumbnail");
        HttpEndpointRegistrar.Map(WebServer, "/api/images/thumbnail/wpf", ImgWpf, "/api/img/wpf");
        HttpEndpointRegistrar.Map(WebServer, "/api/images/thumbnail/web-icc", ImgWebIcc, "/api/img/webIcc");
        HttpEndpointRegistrar.Map(WebServer, "/api/images/thumbnail/nconvert", ImgNconvert, "/api/img/nconvert");
        HttpEndpointRegistrar.Map(WebServer, "/api/images/vips/init", ImgVipsInit, "/api/img/vipsInit");
        HttpEndpointRegistrar.Map(WebServer, "/api/images/vips/resize", ImgVipsResize, "/api/img/vipsResize");
        HttpEndpointRegistrar.Map(WebServer, "/api/images/clip/preview", ImgClip, "/api/img/clip");
        HttpEndpointRegistrar.Map(WebServer, "/api/images/extract-png", ImgExtractPng, "/api/img/extractPng");
    }

    /// <summary>
    /// 取得圖片的 size，然後把檔案處理成 vips 可以載入的格式，寫入到暫存資料夾
    /// </summary>
    private async Task ImgVipsInit(RequestData d) {
        string path = Uri.UnescapeDataString(d.args["path"]);
        string[] arType = d.args["type"].Split(',');

        if (File.Exists(path) == false) {
            await WriteJson(d, new ImgInitInfo());
            return;
        }

        if (HeadersAdd304(d, path)) { return; }

        ImgInitInfo imgInfo = new();
        // 依序嘗試不同解碼方式，找到第一個可成功取得尺寸的結果
        UiThreadScheduler.RunWithTimeout(60, () => {
            for (int i = 0; i < arType.Length; i++) {
                string type = arType[i];
                try {
                    imgInfo = _imageProcessingService.GetImgInitInfo(path, type, type);
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
    /// 使用 vips 縮放圖片 (必須前使用 ImgVipsInit 處理)
    /// </summary>
    private async Task ImgVipsResize(RequestData d) {
        string path = Uri.UnescapeDataString(d.args["path"]);
        double scale = Double.Parse(d.args["scale"], CultureInfo.InvariantCulture);
        string fileType = d.args["fileType"];
        string vipsType = d.args["vipsType"];

        if (await CheckFileExist(d, path) == false) { return; }
        if (HeadersAdd304(d, path)) { return; }

        string imgPath = null;
        // vips 轉檔可能較久，加入超時機制避免無限等待
        UiThreadScheduler.RunWithTimeout(60, () => {
            imgPath = _imageProcessingService.VipsResize(path, scale, fileType, vipsType);
        });

        if (imgPath == null) {
            await WriteError(d, 500, "Timeout");
            return;
        }

        await WriteFile(d, imgPath);
    }

    /// <summary>
    /// 使用 nconvert 解碼圖片
    /// </summary>
    private async Task ImgNconvert(RequestData d) {
        string type = d.args["type"];
        string path = Uri.UnescapeDataString(d.args["path"]);

        if (await CheckFileExist(d, path) == false) { return; }
        if (HeadersAdd304(d, path)) { return; }

        string imgPath = type == "png"
            ? _imageProcessingService.Nconvert_PathToPath(path, false, "png")
            : _imageProcessingService.Nconvert_PathToPath(path, false, "bmp");

        await WriteString(d, imgPath);
    }

    /// <summary>
    /// 使用 ImageMagick 解碼圖片
    /// </summary>
    private async Task ImgMagick(RequestData d) {
        string type = d.args["type"];
        string path = Uri.UnescapeDataString(d.args["path"]);

        if (await CheckFileExist(d, path) == false) { return; }
        if (HeadersAdd304(d, path)) { return; }

        using var stream = _imageProcessingService.MagickImage_PathToStream(path, type);
        await WriteStream(d, stream);
    }

    /// <summary>
    /// 使用 WPF 解碼圖片
    /// </summary>
    private async Task ImgWpf(RequestData d) {
        string path = Uri.UnescapeDataString(d.args["path"]);

        if (await CheckFileExist(d, path) == false) { return; }
        if (HeadersAdd304(d, path)) { return; }

        d.context.Response.ContentType = "image/bmp";
        using var stream = _imageProcessingService.Wpf_PathToStream(path);
        await WriteStream(d, stream);
    }

    /// <summary>
    /// 若圖片為 CMYK，先用 WPF 解碼避免瀏覽器端顯示異常，否則直接回傳原檔
    /// </summary>
    private async Task ImgWebIcc(RequestData d) {
        string path = Uri.UnescapeDataString(d.args["path"]);

        if (await CheckFileExist(d, path) == false) { return; }
        if (HeadersAdd304(d, path)) { return; }

        if (_imageProcessingService.IsCMYK(path)) {
            d.context.Response.ContentType = "image/bmp";
            using var stream = _imageProcessingService.Wpf_PathToStream(path);
            await WriteStream(d, stream);
            return;
        }

        await WriteFile(d, path);
    }

    /// <summary>
    /// 讀取 raw 圖片內嵌縮圖並回傳 BMP
    /// </summary>
    private async Task ImgRawThumbnail(RequestData d) {
        string path = Uri.UnescapeDataString(d.args["path"]);

        if (await CheckFileExist(d, path) == false) { return; }
        if (HeadersAdd304(d, path)) { return; }

        d.context.Response.ContentType = "image/bmp";
        using var stream = _imageProcessingService.RawThumbnail_PathToStream(path, 800, out int width, out int height);
        await WriteStream(d, stream);
    }

    /// <summary>
    /// 讀取 Clip Studio Paint 檔案中的預覽圖
    /// </summary>
    private async Task ImgClip(RequestData d) {
        string path = Uri.UnescapeDataString(d.args["path"]);

        if (await CheckFileExist(d, path) == false) { return; }
        if (HeadersAdd304(d, path)) { return; }

        using var stream = _imageProcessingService.ClipToStream(path);
        await WriteStream(d, stream);
    }

    /// <summary>
    /// 從複合格式中抽出 PNG 內容並回傳
    /// </summary>
    private async Task ImgExtractPng(RequestData d) {
        string path = Uri.UnescapeDataString(d.args["path"]);

        if (await CheckFileExist(d, path) == false) { return; }
        if (HeadersAdd304(d, path)) { return; }

        using var stream = _imageProcessingService.ExtractPngToStream(path);
        await WriteStream(d, stream);
    }

    /// <summary>
    /// 解析多幀圖片並輸出到指定資料夾
    /// </summary>
    private async Task ExtractFrames(RequestData d) {
        var json = JsonDocument.Parse(d.postData);
        string imgPath = json.GetString("imgPath");
        string outputDir = json.GetString("outputDir");

        await WriteJson(d, AnimatedImageHelper.ExtractFrames(imgPath, outputDir));
    }
}
