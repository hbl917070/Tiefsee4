namespace Tiefsee;

/// <summary>
/// 載入 start.ini 的啟動設定
/// </summary>
public sealed class StartupConfigLoader {

    /// <summary>
    /// 從 start.ini 讀取啟動設定，但不在這裡決定最終執行期路徑
    /// </summary>
    public StartupConfig Load(string startIniPath) {
        var iniManager = new IniFileHelper(startIniPath);

        return new StartupConfig {
            StartPort = int.Parse(iniManager.ReadIniFile("setting", "startPort", "4876")),
            StartType = (StartMode)int.Parse(iniManager.ReadIniFile("setting", "startType", ((byte)StartMode.QuickStartResident).ToString())),
            IniAppData = iniManager.ReadIniFile("temporary", "appData", ""),
            IniIsStoreApp = iniManager.ReadIniFile("temporary", "isStoreApp", "") == "True"
        };
    }
}
