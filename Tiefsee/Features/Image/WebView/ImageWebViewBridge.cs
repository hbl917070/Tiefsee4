using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

namespace Tiefsee;

[ComVisible(true)]
public class ImageWebViewBridge {

    private readonly WebWindow _window;
    private readonly ImageBase64Service _imageBase64Service;
    private readonly ImageProcessingService _imageProcessingService;

    /// <summary>
    /// 建立圖片相關的 WebView bridge
    /// </summary>
    public ImageWebViewBridge(WebWindow window) {
        _window = window;
        _imageBase64Service = new ImageBase64Service();
        _imageProcessingService = Program.services.ImageProcessing;
    }

    /// <summary>
    /// 取得任何檔案的圖示
    /// </summary>
    /// <returns> Base64 </returns>
    public string GetFileIcon(string path, int size) {
        using Bitmap icon = _imageProcessingService.GetFileIcon(path, size);
        if (icon == null) { return ""; }
        return BitmapToBase64(icon);
    }

    /// <summary>
    /// 將 Bitmap 轉成可直接給前端使用的 base64 字串
    /// </summary>
    public string BitmapToBase64(Bitmap bmp) {
        return _imageBase64Service.BitmapToBase64Png(bmp);
    }

    /// <summary>
    /// 將圖片的 base64 存入暫存資料夾
    /// </summary>
    public string Base64ToTempImg(string path, string base64) {
        return _imageProcessingService.Base64ToTempImg(path, base64);
    }

}
