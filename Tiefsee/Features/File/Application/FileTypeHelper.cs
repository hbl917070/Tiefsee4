using System.IO;
using System.Text;

namespace Tiefsee;

public class FileTypeHelper {

    /// <summary>
    /// 取得檔案的 Hex，用於辨識檔案類型
    /// </summary>
    public static string GetFileHeaderHex(string path) {

        StringBuilder sb = new();
        try {
            using FileStream fs = new(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using BinaryReader br = new(fs);
            int readLength = 100;
            string lastFourBytes = "";
            bool isPng = false;

            for (int i = 0; i < readLength; i++) {
                if (fs.Position >= fs.Length) break; // 如果已經讀取到文件的結尾，則跳出循環

                string hexValue = br.ReadByte().ToString("X2");
                sb.Append(hexValue + " ");

                // 如果是 png，就把 hex 的讀取長度增加，避免 apng 無法辨識
                if (i == 7) {
                    if (sb.ToString() == "89 50 4E 47 0D 0A 1A 0A ") {
                        isPng = true;
                        readLength = 2000;
                    }
                }

                // png 只讀取 IDAT 之前的區塊
                if (isPng) {
                    lastFourBytes = lastFourBytes + hexValue;
                    if (lastFourBytes.Length > 8) {
                        lastFourBytes = lastFourBytes.Substring(2); // remove the first byte
                    }
                    // 如果讀取到 IDAT 區塊的開始，則停止讀取
                    if (lastFourBytes == "49444154") {
                        break;
                    }
                }

            }
            if (fs != null) {
                fs.Close();
                br.Close();
            }
        }
        catch { }

        return sb.ToString();
    }

    /// <summary>
    /// 取得檔案類型。一律小寫，例如 「jpg」
    /// </summary>
    public static string GetFileType(string path) {

        if (File.Exists(path)) {

            string hex = FileTypeHelper.GetFileHeaderHex(path);

            if (hex.StartsWith("FF D8 FF")) {
                return "jpg";
            }
            else if (hex.StartsWith("47 49 46 38")) { // GIF8
                return "gif";
            }
            else if (hex.StartsWith("89 50 4E 47 0D 0A 1A 0A")) {
                if (hex.IndexOf("08 61 63 54") > 10) { // acTL
                    return "apng";
                }
                return "png";
            }
            else if (hex.Contains("57 45 42 50 56 50 38")) { // WEBPVP8
                if (hex.Contains("41 4E 49 4D")) { // ANIM
                    return "webps";
                }
                else {
                    return "webp";
                }
            }
            else if (hex.StartsWith("25 50 44 46")) { // %PDF
                return "pdf";
                // } else if (hex.Contains("66 74 79 70")) { // 66(f) 74(t) 79(y) 70(p) 。其他影片格式也可能誤判成mp4
                // return "mp4";
            }
            else if (hex.StartsWith("1A 45 DF A3")) {
                if (hex.IndexOf("77 65 62 6D 42 87") > 0) { // 77(w) 65(e) 62(b) 6D(m) 42(B) 87()
                    return "webm";
                }
            }
            else if (hex.StartsWith("4F 67 67 53")) { // 4F(O) 67(g) 67(g) 53(S)
                return "ogv";
            }
            else if (hex.StartsWith("38 42 50 53")) { // 38(8) 42(B) 50(P) 53(S)
                return "psd";
            }
        }

        // 如果無法從 hex 判斷檔案類型，則回傳副檔名
        return Path.GetExtension(path).ToLower().Replace(".", "");
    }

    /// <summary>
    /// 以檔案的路徑跟大小來產生雜湊字串(用於暫存檔名)
    /// </summary>
    public static string FileToHash(string path) {
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        string s;
        if (File.Exists(path)) {
            var fileinfo = new FileInfo(path);
            long fileSize = fileinfo.Length; // File size
            long ticks = fileinfo.LastWriteTime.Ticks; // File last modified time
            s = Convert.ToBase64String(sha256.ComputeHash(Encoding.Default.GetBytes(fileSize + path + ticks)));
        }
        else {
            s = Convert.ToBase64String(sha256.ComputeHash(Encoding.Default.GetBytes(path)));
        }
        return s.ToLower().Replace("\\", "").Replace("/", "").Replace("+", "").Replace("=", "");
    }
}
