namespace Tiefsee;

/// <summary>
/// 圖片初始化後的基本資訊
/// </summary>
public class ImgInitInfo {
    /// <summary>
    /// "1" 代表成功，其他值代表失敗
    /// </summary>
    public string code { get; set; } = "-1";
    /// <summary>
    /// 處理後的圖片暫存檔案路徑，瀏覽器可直接讀取
    /// </summary>
    public string path { get; set; } = "";
    /// <summary>
    /// 圖片的寬度
    /// </summary>
    public int width { get; set; } = 0;
    /// <summary>
    /// 圖片的高度
    /// </summary>
    public int height { get; set; } = 0;
    /// <summary>
    /// 初始化時使用的解碼方式，用於後續的 vips 縮放處理
    /// </summary>
    public string vipsType { get; set; } = "";
}
