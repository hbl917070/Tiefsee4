namespace Tiefsee;

/// <summary>
/// 啟動完成後的執行期環境資訊
/// </summary>
public sealed class AppRuntimeContext {
    /// <summary> 基本目錄 </summary>
    public string BaseDirectory { get; set; } = "";
    /// <summary> AppData(使用者資料) </summary>
    public string AppData { get; set; } = "";
    /// <summary> Start.ini </summary>
    public string AppDataStartIni { get; set; } = "";
    /// <summary> Lock檔案，用於判斷是否短時間內重複啟動 </summary>
    public string AppDataLock { get; set; } = "";
    /// <summary> Port Dir </summary>
    public string AppDataPort { get; set; } = "";
    /// <summary> Plugin Dir </summary>
    public string AppDataPlugin { get; set; } = "";
    /// <summary> Setting.json </summary>
    public string AppDataSetting { get; set; } = "";
    /// <summary> UWP 列表 </summary>
    public string AppDataUwpList { get; set; } = "";
    /// <summary> LoRA 列表 </summary>
    public string AppDataA1111ModelList { get; set; } = "";
    /// <summary> 暫存資料夾 - 處理過的圖片(原始大小) </summary>
    public string TempDirImgProcessed { get; set; } = "";
    /// <summary> 暫存資料夾 - 縮放後的圖片 </summary>
    public string TempDirImgZoom { get; set; } = "";
    /// <summary> 暫存資料夾 - 從網路下載的檔案 </summary>
    public string TempDirWebFile { get; set; } = "";
    /// <summary> 暫存資料夾 - 壓縮檔解壓後的檔案 </summary>
    public string TempDirArchive { get; set; } = "";
    /// <summary> 工作列右下角的圖示路徑 </summary>
    public string LogoIcon { get; set; } = "";
    /// <summary> 是否為商店應用程式 </summary>
    public bool IsStoreApp { get; set; }
    /// <summary> 是否為可攜式模式 </summary>
    public bool IsPortableMode { get; set; }
    /// <summary> 程式起始的 Port (不一定是最終結果，如果被佔用，會自動選擇其他 Port)</summary>
    public int StartPort { get; set; }
    /// <summary> 啟動模式 </summary>
    public StartMode StartType { get; set; }
}
