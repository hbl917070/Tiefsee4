namespace Tiefsee;

/// <summary>
/// 檔案中繼資料
/// </summary>
public class FileMetadataResult {
    /// <summary>
    /// 狀態：1=>成功，0=>失敗
    /// </summary>
    public string code { get; set; } = "0";
    /// <summary>
    /// 檔案中繼資料項目列表
    /// </summary>
    public List<FileMetadataItem> data { get; set; } = new();
}
