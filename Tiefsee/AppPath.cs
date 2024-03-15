using System.IO;

namespace Tiefsee;

public class AppPath {

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

    /// <summary> 暫存資料夾 - 處理過的圖片(原始大小) </summary>
    public static string tempDirImgProcessed = "";

    /// <summary> 暫存資料夾 - 縮放後的圖片 </summary>
    public static string tempDirImgZoom = "";

    /// <summary> 暫存資料夾 - 從網路下載的檔案 </summary>
    public static string tempDirWebFile = "";

    /// <summary> 工作列右下角的圖示 </summary>
    public static string logoIcon = "";

    /// <summary>
    /// 在使用 Init() 之前如果就需要使用 appData 的話，就使用此方法
    /// </summary>
    public static void InitAppData() {
        if (appData != null) { return; }

        // 便攜模式 (如果存在此資料夾，就把資料儲存在這裡
        string portableMode = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "PortableMode");
        if (Directory.Exists(portableMode)) {
            appData = portableMode;
            StartWindow.isPortableMode = true;
        }
        else {
            appData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Tiefsee");
            StartWindow.isPortableMode = false;
        }
        appDataStartIni = Path.Combine(appData, "Start.ini");
    }

    public static void Init(string iniAppData, bool iniIsStoreApp) {

        InitAppData();

        // 需要更新 ini
        bool needUpdateIni = false;

        // 便攜模式
        if (StartWindow.isPortableMode) {
            StartWindow.isStoreApp = false;
        }
        // 不存在此路徑，表示是傳統應用程式版
        else if (File.Exists(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "../TiefseeLauncher/Tiefsee.exe")) == false) {
            StartWindow.isStoreApp = false;
        }
        // 如果已經 ini 檔案有資料，就使用 ini 檔案的資料
        else if (iniAppData != "") {
            StartWindow.isStoreApp = iniIsStoreApp;
            appData = iniAppData;
        }
        else {
            try {
                // 商店版
                appData = Windows.Storage.ApplicationData.Current.LocalCacheFolder.Path;
                appData = Path.Combine(appData, "Local", "Tiefsee");
                StartWindow.isStoreApp = true;
                needUpdateIni = true;
            }
            catch {
                // 傳統應用程式版
                appData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Tiefsee");
                StartWindow.isStoreApp = false;
            }
        }

        appDataLock = Path.Combine(appData, "Lock");
        appDataStartIni = Path.Combine(appData, "Start.ini");
        appDataPort = Path.Combine(appData, "Port");
        appDataPlugin = Path.Combine(appData, "Plugin");
        appDataSetting = Path.Combine(appData, "Setting.json");
        appDataUwpList = Path.Combine(appData, "UwpList.json");

        string downloadsPath = KnownFolders.GetPath(KnownFolder.Downloads); // 使用者的 下載

        tempDirImgProcessed = Path.Combine(Path.GetTempPath(), "Tiefsee\\ImgProcessed");
        tempDirImgZoom = Path.Combine(Path.GetTempPath(), "Tiefsee\\ImgZoom");
        tempDirWebFile = Path.Combine(downloadsPath, "Tiefsee");
        // tempDirWebFile = Path.Combine(Path.GetTempPath(), "Tiefsee\\WebFile");

        logoIcon = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "Www\\img\\logo.ico");

        //------

        // 如果資料夾不存在，就新建
        if (Directory.Exists(appData) == false) {
            Directory.CreateDirectory(appData);
        }
        if (Directory.Exists(appDataPlugin) == false) {
            Directory.CreateDirectory(appDataPlugin);
        }

        if (needUpdateIni) {
            // 重新讀取 ini
            var iniManager = new IniManager(AppPath.appDataStartIni);
            Program.startPort = Int32.Parse(iniManager.ReadIniFile("setting", "startPort", "4876"));
            Program.startType = Int32.Parse(iniManager.ReadIniFile("setting", "startType", "3"));
            // 把資料寫入 ini 檔案，下次就可以直接讀取
            iniManager.WriteIniFile("temporary", "appData", appData);
            iniManager.WriteIniFile("temporary", "isStoreApp", StartWindow.isStoreApp.ToString());
        }

    }

}
