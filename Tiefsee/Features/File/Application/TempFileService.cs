using System.IO;
using System.Text;

namespace Tiefsee;

/// <summary>
/// 處理暫存檔建立與 base64 落檔
/// </summary>
public sealed class TempFileService {

    /// <summary>
    /// 將 base64 內容寫入 tempDirWebFile 並回傳路徑
    /// </summary>
    public string Base64ToTempFile(string base64, string extension) {
        try {
            string path = GetUniqueTempFilePath(extension);
            EnsureTempDirectory();

            base64 = Uri.UnescapeDataString(base64);
            int index = base64.IndexOf("base64,");
            if (index != -1) {
                base64 = base64.Substring(index + 7);
            }

            base64 = base64.Trim();
            byte[] buffer = Convert.FromBase64String(base64);
            File.WriteAllBytes(path, buffer);

            return path;
        }
        catch (Exception e) {
            Console.WriteLine(e.Message);
            return "false";
        }
    }

    /// <summary>
    /// 建立不重複的暫存檔路徑
    /// </summary>
    private string GetUniqueTempFilePath(string extension) {
        while (true) {
            string name = DateTime.Now.ToString("yyyyMMdd-HHmmss") + "-" + GenerateRandomString(10) + "." + extension;
            string path = Path.Combine(AppPath.tempDirWebFile, name);
            if (File.Exists(path) == false) {
                return path;
            }
        }
    }

    /// <summary>
    /// 確保暫存目錄存在
    /// </summary>
    private void EnsureTempDirectory() {
        if (Directory.Exists(AppPath.tempDirWebFile) == false) {
            Directory.CreateDirectory(AppPath.tempDirWebFile);
        }
    }

    /// <summary>
    /// 產生固定長度的亂數字串
    /// </summary>
    private string GenerateRandomString(int length) {
        string chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new();
        Random random = new();
        for (int i = 0; i < length; i++) {
            int index = random.Next(chars.Length);
            sb.Append(chars[index]);
        }
        return sb.ToString();
    }
}

