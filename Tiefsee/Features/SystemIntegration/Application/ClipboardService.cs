namespace Tiefsee;

/// <summary>
/// 封裝剪貼簿操作
/// </summary>
public sealed class ClipboardService {

    private readonly ClipboardLib _clipboardLib = new();

    /// <summary>
    /// 將 Base64 圖片寫入剪貼簿
    /// </summary>
    public bool SetClipboardBase64ToImage(string base64, bool isTransparent) {
        return _clipboardLib.SetClipboard_Base64ToImage(base64, isTransparent);
    }

    /// <summary>
    /// 將檔案內容以圖片寫入剪貼簿
    /// </summary>
    public bool SetClipboardFileToImage(string path, bool isTransparent) {
        return _clipboardLib.SetClipboard_FileToImage(path, isTransparent);
    }

    /// <summary>
    /// 將文字檔內容寫入剪貼簿
    /// </summary>
    public bool SetClipboardFileToText(string path) {
        return _clipboardLib.SetClipboard_FileToText(path);
    }

    /// <summary>
    /// 將檔案內容以 Base64 寫入剪貼簿
    /// </summary>
    public bool SetClipboardFileToBase64(string path) {
        return _clipboardLib.SetClipboard_FileToBase64(path);
    }

    /// <summary>
    /// 寫入純文字到剪貼簿
    /// </summary>
    public bool SetClipboardText(string text) {
        return _clipboardLib.SetClipboard_Text(text);
    }

    /// <summary>
    /// 將檔案路徑寫入剪貼簿
    /// </summary>
    public bool SetClipboardFile(string path) {
        return _clipboardLib.SetClipboard_File(path);
    }
}
