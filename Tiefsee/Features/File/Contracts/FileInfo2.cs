using System.Runtime.InteropServices;

namespace Tiefsee;

[ComVisible(true)]
public class FileInfo2 {
    /// <summary> file / dir / none </summary>
    public string Type { get; set; } = "none";
    /// <summary> 檔案路徑 </summary>
    public string Path { get; set; } = "";
    /// <summary> 檔案大小 </summary>
    public long Lenght { get; set; } = 0;
    /// <summary> 建立時間 </summary>
    public long CreationTimeUtc { get; set; } = 0;
    /// <summary> 修改時間 </summary>
    public long LastWriteTimeUtc { get; set; } = 0;
    /// <summary> 檔案的 Hex (用於辨識檔案類型) </summary>
    public string HexValue { get; set; } = "";
}
