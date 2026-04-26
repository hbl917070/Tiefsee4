namespace Tiefsee;

public class AppInfo {
    /// <summary> 命令列參數 </summary>
    public string[] args { get; set; }
    /// <summary> 啟動模式 </summary>
    public StartMode startType { get; set; }
    /// <summary> 程式開始的port </summary>
    public int startPort { get; set; }
    /// <summary> 程式所在的資料夾 </summary>
    public string appDirPath { get; set; }
    /// <summary> 程式的暫存資料夾 </summary>
    public string appDataPath { get; set; }
    /// <summary> 暫存資料夾 - 從網路下載的檔案 </summary>
    public string tempDirWebFile { get; set; }
    /// <summary> 目前使用的 port </summary>
    public int mainPort { get; set; }
    /// <summary> setting.js 的路徑 </summary>
    public string settingPath { get; set; }
    /// <summary> setting.js 的文字 </summary>
    public string settingTxt { get; set; }
    /// <summary> 是否為快速預覽的視窗。 0=不是快速預覽 1=長按空白鍵 2=長按滑鼠中鍵 </summary>
    public int quickLookRunType { get; set; }
    /// <summary> 是否為商店版 APP </summary>
    public bool isStoreApp { get; set; }
    /// <summary> 是否為 win11 </summary>
    public bool isWin11 { get; set; }
    /// <summary> 哪些擴充是有啟用的 </summary>
    public PluginAvailability plugin { get; set; } = PluginRegistry.pluginAvailability;
}


