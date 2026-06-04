using System.Diagnostics;
using System.IO;

namespace Tiefsee;

public class AppPaths {

    /// <summary> AppData(使用者資料) </summary>
    public static string appData;
    /// <summary> Start.ini </summary>
    public static string appDataStartIni;
    /// <summary> Lock檔案，用於判斷是否短時間內重複啟動 </summary>
    public static string appDataLock;
    /// <summary> Port Dir </summary>
    public static string appDataPort;
    /// <summary> Plugin Dir </summary>
    public static string appDataPlugin;
    /// <summary> Strting.json </summary>
    public static string appDataSetting;
    /// <summary> UWP 列表 </summary>
    public static string appDataUwpList;
    /// <summary> LoRA 列表 </summary>
    public static string appDataA1111ModelList;
    /// <summary> 暫存資料夾 - 處理過的圖片(原始大小) </summary>
    public static string tempDirImgProcessed = "";
    /// <summary> 暫存資料夾 - 縮放後的圖片 </summary>
    public static string tempDirImgZoom = "";
    /// <summary> 暫存資料夾 - 從網路下載的檔案 </summary>
    public static string tempDirWebFile = "";
    /// <summary> 工作列右下角的圖示 </summary>
    public static string logoIcon = "";

    /// <summary>
    /// 套用已組裝完成的執行期環境資訊，提供舊程式碼過渡使用
    /// </summary>
    public static void ApplyRuntimeContext(AppRuntimeContext runtimeContext) {
        appData = runtimeContext.AppData;
        appDataStartIni = runtimeContext.AppDataStartIni;
        appDataLock = runtimeContext.AppDataLock;
        appDataPort = runtimeContext.AppDataPort;
        appDataPlugin = runtimeContext.AppDataPlugin;
        appDataSetting = runtimeContext.AppDataSetting;
        appDataUwpList = runtimeContext.AppDataUwpList;
        appDataA1111ModelList = runtimeContext.AppDataA1111ModelList;
        tempDirImgProcessed = runtimeContext.TempDirImgProcessed;
        tempDirImgZoom = runtimeContext.TempDirImgZoom;
        tempDirWebFile = runtimeContext.TempDirWebFile;
        logoIcon = runtimeContext.LogoIcon;

        // 目前仍有不少舊流程直接讀 StartWindow 的 static 狀態，先在這裡同步
        StartWindow.isPortableMode = runtimeContext.IsPortableMode;
        StartWindow.isStoreApp = runtimeContext.IsStoreApp;
    }

    /// <summary>
    /// 取得程式的暫存資料夾，例如 C:\Users\user\AppData\Local\Tiefsee
    /// </summary>
    public static string GetAppDataPath() {
        string path = AppPaths.appData;
        if (Directory.Exists(path) == false) {
            Directory.CreateDirectory(path);
        }
        return path;
    }

    /// <summary>
    /// 取得執行檔所在的資料夾
    /// </summary>
    public static string GetAppDirPath() {
        return AppDomain.CurrentDomain.BaseDirectory;
    }

    /// <summary>
    /// 取得執行檔路徑 (TiefseeCore.exe 的路徑)
    /// </summary>
    public static string GetAppPath() {
        return Process.GetCurrentProcess().MainModule.FileName;
    }

    /// <summary>
    /// 取得 Tiefsee.exe 的路徑
    /// </summary>
    public static string GetTiefseePath() {
        var dir = GetAppDirPath();

        var path = Path.Combine(dir, "Tiefsee.exe");
        if (File.Exists(path)) { return path; }

        path = Path.Combine(dir, "../TiefseeLauncher/Tiefsee.exe");
        if (File.Exists(path)) { return Path.GetFullPath(path); }

        return GetAppPath();
    }
}
