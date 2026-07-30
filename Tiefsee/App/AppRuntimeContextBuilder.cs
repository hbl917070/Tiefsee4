using System.IO;

namespace Tiefsee;

/// <summary>
/// 將 early paths 與 start.ini 設定組裝成執行期環境資訊
/// </summary>
public sealed class AppRuntimeContextBuilder {

    private readonly StartupConfigLoader _startupConfigLoader = new();

    /// <summary>
    /// 根據 early path 與 ini 設定，組裝出真正可供整個 app 使用的執行期環境資訊
    /// </summary>
    public AppRuntimeContext Build(EarlyAppPaths earlyPaths, StartupConfig startupConfig) {
        string appData = earlyPaths.InitialAppData;
        bool isStoreApp = false;
        bool needReloadRuntimeStartIni = false;

        if (earlyPaths.IsPortableMode) {
            isStoreApp = false;
        }
        else if (File.Exists(Path.Combine(earlyPaths.BaseDirectory, "../TiefseeLauncher/Tiefsee.exe")) == false) {
            isStoreApp = false;
        }
        else if (startupConfig.IniAppData != "") {
            // 已有上次寫回的 appData，就直接使用，避免重新探測 store path
            appData = startupConfig.IniAppData;
            isStoreApp = startupConfig.IniIsStoreApp;
        }
        else {
            try {
                // 只有在缺少 ini 暫存資料時，才去讀取成本較高的 LocalCacheFolder.Path
                appData = Windows.Storage.ApplicationData.Current.LocalCacheFolder.Path;
                appData = Path.Combine(appData, "Local", "Tiefsee");
                isStoreApp = true;
                needReloadRuntimeStartIni = true;
            }
            catch {
                appData = earlyPaths.InitialAppData;
                isStoreApp = false;
            }
        }

        var runtimeContext = new AppRuntimeContext {
            BaseDirectory = earlyPaths.BaseDirectory,
            AppData = appData,
            AppDataStartIni = Path.Combine(appData, "Start.ini"),
            AppDataLock = Path.Combine(appData, "Lock"),
            AppDataPort = Path.Combine(appData, "Port"),
            AppDataPlugin = Path.Combine(appData, "Plugin"),
            AppDataSetting = Path.Combine(appData, "Setting.json"),
            AppDataUwpList = Path.Combine(appData, "UwpList.json"),
            AppDataA1111ModelList = Path.Combine(appData, "A1111ModelList.json"),
            TempDirImgProcessed = Path.Combine(Path.GetTempPath(), "Tiefsee\\ImgProcessed"),
            TempDirImgZoom = Path.Combine(Path.GetTempPath(), "Tiefsee\\ImgZoom"),
            TempDirWebFile = Path.Combine(KnownFolders.GetPath(KnownFolder.Downloads), "Tiefsee"),
            TempDirArchive = Path.Combine(Path.GetTempPath(), "Tiefsee\\Archives"),
            LogoIcon = Path.Combine(earlyPaths.BaseDirectory, "Www\\img\\logo.ico"),
            IsStoreApp = isStoreApp,
            IsPortableMode = earlyPaths.IsPortableMode,
            StartPort = startupConfig.StartPort,
            StartType = startupConfig.StartType
        };

        // 路徑組裝完成後，先確保基本資料夾存在，後續 service 才能安全使用
        EnsureDirectories(runtimeContext);

        if (needReloadRuntimeStartIni) {
            // 切換到真正的 store appData 後，要重新讀取該位置的 start.ini
            var runtimeStartupConfig = _startupConfigLoader.Load(runtimeContext.AppDataStartIni);
            runtimeContext.StartPort = runtimeStartupConfig.StartPort;
            runtimeContext.StartType = runtimeStartupConfig.StartType;

            var iniManager = new IniFileHelper(runtimeContext.AppDataStartIni);
            // 把探測結果寫回 ini，下次啟動就能直接走便宜路徑
            iniManager.WriteIniFile("temporary", "appData", runtimeContext.AppData);
            iniManager.WriteIniFile("temporary", "isStoreApp", runtimeContext.IsStoreApp.ToString());
        }

        return runtimeContext;
    }

    private static void EnsureDirectories(AppRuntimeContext runtimeContext) {
        if (Directory.Exists(runtimeContext.AppData) == false) {
            Directory.CreateDirectory(runtimeContext.AppData);
        }
        if (Directory.Exists(runtimeContext.AppDataPlugin) == false) {
            Directory.CreateDirectory(runtimeContext.AppDataPlugin);
        }
    }
}
