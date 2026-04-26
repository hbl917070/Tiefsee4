namespace Tiefsee;

/// <summary>
/// 封裝 start.ini 相關設定
/// </summary>
public sealed class WindowStartupConfigService {

    /// <summary>
    /// 儲存到 start.ini
    /// </summary>
    public void SetStartIni(int startPort, int startType) {
        IniFileHelper iniManager = new(AppPath.appDataStartIni);
        iniManager.WriteIniFile("setting", "startPort", startPort);
        iniManager.WriteIniFile("setting", "startType", startType);
        Program.startPort = startPort;
        Program.startType = (StartMode)startType;
    }
}
