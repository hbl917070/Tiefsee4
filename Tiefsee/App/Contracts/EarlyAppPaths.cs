namespace Tiefsee;

/// <summary>
/// 啟動最早期即可取得的路徑資訊
/// </summary>
public sealed class EarlyAppPaths {

    public string BaseDirectory { get; set; } = "";
    public string InitialAppData { get; set; } = "";
    public string StartIniPath { get; set; } = "";
    public bool IsPortableMode { get; set; }
}
