namespace Tiefsee;

public class SafetensorsData {
    /// <summary>
    /// 嵌入在檔案裡面的資訊 sshs_model_hash
    /// </summary>
    // public string SshsModelHash { get; set; }
    /// <summary>
    /// 嵌入在檔案裡面的資訊 ss_output_name
    /// </summary>
    public string SsOutputName { get; set; }
    /// <summary>
    /// 檔案最後寫入時間
    /// </summary>
    public DateTime LastWriteTimeUtc { get; set; }
    /// <summary>
    /// 檔案路徑的雜湊
    /// </summary>
    // public string PathHash { get; set; }
}
