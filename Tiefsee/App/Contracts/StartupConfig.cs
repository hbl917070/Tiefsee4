namespace Tiefsee;

/// <summary>
/// 從 start.ini 載入的啟動設定
/// </summary>
public sealed class StartupConfig {

    public int StartPort { get; set; }
    public StartMode StartType { get; set; }
    public string IniAppData { get; set; } = "";
    public bool IniIsStoreApp { get; set; }
}
