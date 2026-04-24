using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

namespace Tiefsee;

/// <summary>
/// 處理圖片與 base64 互轉的服務
/// </summary>
public sealed class ImageBase64Service {

    /// <summary>
    /// 將 Bitmap 轉成 data URL 格式的 PNG base64 字串
    /// </summary>
    public string BitmapToBase64Png(Bitmap bitmap) {
        try {
            using MemoryStream ms = new();
            bitmap.Save(ms, ImageFormat.Png);
            return "data:image/png;base64," + Convert.ToBase64String(ms.ToArray());
        }
        catch (Exception e) {
            System.Windows.Forms.MessageBox.Show(e.ToString());
            return "";
        }
    }
}
