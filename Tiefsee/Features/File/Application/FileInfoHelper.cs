using System.IO;

namespace Tiefsee;

public class FileInfoHelper {

    private static LRUCache<string, FileInfo2> _lruGetFileInfo2 = new(1000);

    /// <summary>
    /// 取得 FileInfo2
    /// </summary>
    public static FileInfo2 GetFileInfo2(string path) {

        string hash = FileTypeHelper.FileToHash(path);
        var lruData = _lruGetFileInfo2.Get(hash);
        if (lruData != null) { return lruData; }

        FileInfo2 info = new();
        info.Path = Path.GetFullPath(path);

        if (File.Exists(path)) {
            info.Type = "file";
            info.Lenght = new FileInfo(path).Length;
            info.CreationTimeUtc = GetCreationTimeUtc(path);
            info.LastWriteTimeUtc = GetLastWriteTimeUtc(path);
            info.HexValue = FileTypeHelper.GetFileHeaderHex(path);
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
            arFileInfo2[i] = FileInfoHelper.GetFileInfo2(path);
        }
        return arFileInfo2;
    }

    /// <summary>
    /// 檢查檔案是否為二進制檔
    /// </summary>
    /// <param name="filePath"></param>
    /// <param name="requiredConsecutiveNul"> 需要多少個連續的 NUL 字元才判定為二進制檔，預設為 1</param>
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
