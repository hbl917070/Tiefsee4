using System.IO;
using System.Runtime.InteropServices;
using System.Text;

namespace Tiefsee;

public class FileLib {

    /// <summary>
    /// 檢查檔案是否為二進制檔
    /// </summary>
    /// <param name="filePath"></param>
    /// <param name="requiredConsecutiveNul"></param>
    /// <returns></returns>
    public static bool IsBinary(string filePath, int requiredConsecutiveNul = 1) {
        const int charsToCheck = 8000;
        const char nulChar = '\0';
        int nulCount = 0;
        using (var streamReader = new StreamReader(filePath)) {
            for (var i = 0; i < charsToCheck; i++) {
                if (streamReader.EndOfStream)
                    return false;

                if ((char)streamReader.Read() == nulChar) {
                    nulCount++;

                    if (nulCount >= requiredConsecutiveNul)
                        return true;
                }
                else {
                    nulCount = 0;
                }
            }
        }
        return false;
    }

    /// <summary>
    /// 取得 FileInfo2
    /// </summary>
    public static FileInfo2 GetFileInfo2(string path) {

        string hash = FileToHash(path);
        var lruData = _lruGetFileInfo2.Get(hash);
        if (lruData != null) { return lruData; }

        FileInfo2 info = new();
        info.Path = Path.GetFullPath(path);

        if (File.Exists(path)) {
            info.Type = "file";
            info.Lenght = new FileInfo(path).Length;
            info.CreationTimeUtc = GetCreationTimeUtc(path);
            info.LastWriteTimeUtc = GetLastWriteTimeUtc(path);
            info.HexValue = GetFileHeaderHex(path);
        }
        else if (Directory.Exists(path)) {
            info.Type = "dir";
            info.Lenght = 0;
            info.CreationTimeUtc = ToUnix(Directory.GetLastWriteTimeUtc(path));
            info.LastWriteTimeUtc = ToUnix(Directory.GetLastWriteTimeUtc(path));
            info.HexValue = "";
        }
        else {
            info.Type = "none";
        }

        _lruGetFileInfo2.Add(hash, info);

        return info;
    }
    private static LRUCache<string, FileInfo2> _lruGetFileInfo2 = new(1000);

    /// <summary>
    /// 取得多個檔案的 FileInfo2
    /// </summary>
    /// <param name="arPath"></param>
    /// <returns></returns>
    public static IEnumerable<FileInfo2> GetFileInfo2List(string[] arPath) {
        int count = arPath.Length;
        FileInfo2[] arFileInfo2 = new FileInfo2[count];
        for (int i = 0; i < count; i++) {
            string path = arPath[i];
            arFileInfo2[i] = FileLib.GetFileInfo2(path);
        }
        return arFileInfo2;
    }

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

            string hex = FileLib.GetFileHeaderHex(path);

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

    /// <summary>
    /// 取得文字資料
    /// </summary>
    public static string GetText(string path) {
        // 檔案被鎖定一樣可以讀取
        using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
        using var reader = new StreamReader(stream);
        return reader.ReadToEnd();
    }

    /// <summary>
    /// 儲存文字資料
    /// </summary>
    public static void SetText(string path, string text) {
        var utf8WithoutBom = new System.Text.UTF8Encoding(false);
        using (FileStream fs = new FileStream(path, FileMode.Create)) {
            using (StreamWriter sw = new StreamWriter(fs, utf8WithoutBom)) {
                sw.Write(text);
            }
        }
    }

    /// <summary>
    ///
    /// </summary>
    public static long ToUnix(DateTime time) {
        var t = time.Subtract(new DateTime(1970, 1, 1));
        string unixTimestamp = (Int32)t.TotalSeconds + t.Milliseconds.ToString("000");
        return long.Parse(unixTimestamp);
    }

    /// <summary>
    /// 取得檔案的建立時間
    /// </summary>
    public static long GetCreationTimeUtc(string path) {
        if (File.Exists(path) == false) { return 0; }
        var time = File.GetCreationTimeUtc(path);
        long unixTimestamp = ToUnix(time);
        return unixTimestamp;
    }

    /// <summary>
    /// 傳回指定檔案或目錄上次被寫入的日期和時間
    /// </summary>
    public static long GetLastWriteTimeUtc(string path) {
        if (File.Exists(path) == false) { return 0; }
        var time = File.GetLastWriteTimeUtc(path);
        long unixTimestamp = ToUnix(time);
        return unixTimestamp;
    }
}

[ComVisible(true)]
public class FileInfo2 {
    /// <summary> file / dir / none </summary>
    public string Type { get; set; } = "none";
    /// <summary> 檔案路徑 </summary>
    public string Path { get; set; } = "";
    /// <summary> 檔案大小 </summary>
    public long Lenght { get; set; } = 0;
    /// <summary> 建立時間 </summary>
    public long CreationTimeUtc { get; set; } = 0;
    /// <summary> 修改時間 </summary>
    public long LastWriteTimeUtc { get; set; } = 0;
    /// <summary> 檔案的 Hex (用於辨識檔案類型) </summary>
    public string HexValue { get; set; } = "";
}
