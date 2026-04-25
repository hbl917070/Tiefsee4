namespace Tiefsee;

/// <summary>
/// 表示一次檔案監看事件的資料
/// </summary>
public class FileWatcherData {
    /// <summary>
    /// 如果需要偵測多個資料夾，用此欄位來進行區分
    /// </summary>
    public string Key { get; set; }

    /// <summary>
    /// 發生變化的檔案或資料夾完整路徑
    /// </summary>
    public string FullPath { get; set; }

    /// <summary>
    /// 重新命名時的舊路徑
    /// </summary>
    public string OldFullPath { get; set; }

    /// <summary>
    /// 變化類型，例如 changed、created、deleted、renamed
    /// </summary>
    public string ChangeType { get; set; }

    /// <summary>
    /// 項目類型，例如 file、dir、none
    /// </summary>
    public string FileType { get; set; }
}
