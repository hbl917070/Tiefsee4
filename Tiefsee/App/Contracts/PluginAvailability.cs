namespace Tiefsee;

/// <summary>
/// 外掛可用性資料結構
/// </summary>
public class PluginAvailability {
    /// <summary>
    /// 是否可用 NConvert
    /// </summary>
    public bool NConvert { get; set; } = false;
    /// <summary>
    /// 是否可用 hdrfix
    /// </summary>
    public bool Hdrfix { get; set; } = false;
    /// <summary>
    /// 是否可用 QuickLook
    /// </summary>
    public bool QuickLook { get; set; } = false;
    /// <summary>
    /// 是否可用 MonacoEditor
    /// </summary>
    public bool MonacoEditor { get; set; } = false;
    /// <summary>
    /// 是否可用 PDFTronWebviewer
    /// </summary>
    public bool PDFTronWebviewer { get; set; } = false;
    /// <summary>
    /// PDFTronWebviewer 的 js 路徑
    /// </summary>
    public string PDFTronWebviewer_js { get; set; } = "";
    /// <summary>
    /// PDFTronWebviewer 的 lib 路徑
    /// </summary>
    public string PDFTronWebviewer_lib { get; set; } = "";
}
