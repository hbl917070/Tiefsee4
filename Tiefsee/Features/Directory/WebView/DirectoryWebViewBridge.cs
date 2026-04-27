using System.IO;
using System.Runtime.InteropServices;

namespace Tiefsee;

[ComVisible(true)]
public class DirectoryWebViewBridge {

    WebWindow M;
    DirectoryHelper _directoryHelper = new();

    /// <summary>
    /// 建立資料夾相關的 WebView bridge
    /// </summary>
    public DirectoryWebViewBridge(WebWindow m) {
        this.M = m;
    }

    /// <summary>
    /// 取得跟自己同層的資料夾內的檔案資料(自然排序的前4筆)
    /// </summary>
    /// <param name="siblingPath"></param>
    /// <param name="arExt"> 副檔名 </param>
    /// <param name="maxCount"> 資料夾允許處理的最大數量 </param>
    /// <returns></returns>
    public Dictionary<string, List<string>> GetSiblingDir(string siblingPath, object[] arExt, int maxCount) {
        return _directoryHelper.GetSiblingDir(siblingPath, arExt, maxCount);
    }

    /// <summary>
    /// 檔名陣列 轉 路徑陣列 (用於載入複數檔案
    /// </summary>
    /// <param name="dirPath"> 資料夾路徑 </param>
    /// <param name="arName"> 檔名陣列 </param>
    /// <returns></returns>
    public string[] GetFiles2(string dirPath, object[] arName) {
        return _directoryHelper.GetFiles2(dirPath, arName);
    }

    /// <summary>
    /// 判斷指定路徑是否參考磁碟上的現有目錄
    /// </summary>
    public bool Exists(string path) {
        return Directory.Exists(path);
    }

    /// <summary>
    /// 新建目錄
    /// </summary>
    public void CreateDirectory(string path) {
        Directory.CreateDirectory(path);
    }

    /// <summary>
    /// 擷取指定路徑的父目錄
    /// </summary>
    public DirectoryInfo GetParent(string path) {
        return Directory.GetParent(path);
    }

    /// <summary>
    /// 刪除資料夾(包含子目錄與檔案)
    /// </summary>
    public string Delete(string path) {
        try {
            Directory.Delete(path, true);
        }
        catch (Exception e) {
            return e.Message;
        }
        return "";
    }

    /// <summary>
    /// 資料夾移到資源回收桶
    /// </summary>
    public string MoveToRecycle(string path) {
        try {
            Microsoft.VisualBasic.FileIO.FileSystem.DeleteDirectory(
                path,
                Microsoft.VisualBasic.FileIO.UIOption.OnlyErrorDialogs,
                Microsoft.VisualBasic.FileIO.RecycleOption.SendToRecycleBin
            );
        }
        catch (Exception e) {
            return e.Message;
        }
        return "";
    }

    /// <summary>
    /// 移動檔案或目錄和其內容到新位置
    /// </summary>
    /// <param name="sourceDirName"></param>
    /// <param name="destDirName"></param>
    public string Move(string sourceDirName, string destDirName) {
        try {
            Directory.Move(sourceDirName, destDirName);
        }
        catch (Exception e) {
            return e.Message;
        }
        return "";
    }

    /// <summary>
    /// 回傳資料夾裡面的檔案
    /// </summary>
    /// <param name="path"></param>
    /// <param name="searchPattern"></param>
    /// <returns></returns>
    public String[] GetFiles(string path, string searchPattern) {
        if (searchPattern == null || searchPattern == "") {
            return Directory.GetFiles(path);
        }
        return Directory.GetFiles(path, searchPattern);
    }

    /// <summary>
    /// 傳回指定目錄中符合指定搜尋模式的子目錄名稱 (包括檔案的路徑)
    /// </summary>
    /// <param name="path"></param>
    /// <param name="searchPattern"></param>
    /// <returns></returns>
    public String[] GetDirectories(string path, string searchPattern) {
        if (searchPattern == null || searchPattern == "") {
            return Directory.GetDirectories(path);
        }
        return Directory.GetDirectories(path, searchPattern);
    }

    private long toUnix(DateTime time) {
        var t = time.Subtract(new DateTime(1970, 1, 1));
        string unixTimestamp = (Int32)t.TotalSeconds + t.Milliseconds.ToString("000");
        return long.Parse(unixTimestamp);
    }

    /// <summary>
    /// 取得資料夾的建立時間
    /// </summary>
    public long GetCreationTimeUtc(string path) {
        if (Directory.Exists(path) == false) { return 0; }
        var time = Directory.GetCreationTimeUtc(path);
        long unixTimestamp = toUnix(time);
        return unixTimestamp;
    }

    /// <summary>
    /// 傳回指定檔案或目錄上次被寫入的日期和時間
    /// </summary>
    public long GetLastWriteTimeUtc(string path) {
        if (Directory.Exists(path) == false) { return 0; }
        var time = Directory.GetLastWriteTimeUtc(path);
        long unixTimestamp = toUnix(time);
        return unixTimestamp;
    }

    /// <summary>
    /// 取得資料夾的建立時間(於js使用的話，必須在加上時區)
    /// </summary>
    /// <param name="path"></param>
    /// <returns></returns>
    /*public long GetCreationTime(string path) {
        var time = Directory.GetCreationTime(path);
        long unixTimestamp = toUnix(time);
        return unixTimestamp;
    }*/

}
