namespace Tiefsee;

/// <summary>
/// 剪貼簿內容
/// </summary>
public class ClipboardContent {
    /// <summary>
    /// 類型，可能的值有：
    /// html: HTML 字串、
    /// img: base64 字串、
    /// file: 檔案路徑、
    /// dir: 資料夾路徑、
    /// url: URL 字串、
    /// text: 純文字、
    /// exceededLength: 文字超過長度限制、
    /// error: 讀取剪貼簿過程發生錯誤，Data 欄位為錯誤訊息
    /// </summary>
    public string Type { get; set; }
    /// <summary>
    /// 內容
    /// </summary>
    public string Data { get; set; }
}
