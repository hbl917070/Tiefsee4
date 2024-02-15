using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

namespace Tiefsee;

[ComVisible(true)]
public class WV_Image {

    WebWindow M;
    public WV_Image(WebWindow m) {
        this.M = m;
    }

    /// <summary>
    /// 取得任何檔案的圖示
    /// </summary>
    /// <returns> Base64 </returns>
    public string GetFileIcon(string path, int size) {
        using Bitmap icon = ImgLib.GetFileIcon(path, size);
        if (icon == null) { return ""; }
        return BitmapToBase64(icon);
    }

    /// <summary>
    /// 
    /// </summary>
    public string BitmapToBase64(Bitmap bmp) {
        string base64String = "";
        try {
            byte[] temp;
            using (MemoryStream ms = new MemoryStream()) {
                bmp.Save(ms, ImageFormat.Png);
                temp = ms.ToArray();
            }
            base64String = "data:image/png;base64," + Convert.ToBase64String(temp);
        }
        catch (Exception e) {
            System.Windows.Forms.MessageBox.Show(e.ToString());
        }
        return base64String;
    }

    /// <summary>
    /// 將圖片的 base64 存入暫存資料夾
    /// </summary>
    public string Base64ToTempImg(string path, string base64) {
        return ImgLib.Base64ToTempImg(path, base64);
    }

}
