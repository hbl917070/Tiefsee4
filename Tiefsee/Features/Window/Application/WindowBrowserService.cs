namespace Tiefsee;

/// <summary>
/// 封裝 WebView2 開發工具與瀏覽器資訊
/// </summary>
public sealed class WindowBrowserService {

    /// <summary>
    /// 清理 webview2 的暫存
    /// </summary>
    public void ClearBrowserCache(WebWindow window) {
        window.Wv2.CoreWebView2.CallDevToolsProtocolMethodAsync("Network.clearBrowserCache", "{}");
    }

    /// <summary>
    /// 開啟開發人員工具
    /// </summary>
    public void OpenDevTools(WebWindow window) {
        if (window.Wv2?.CoreWebView2 == null) { return; }
        window.Wv2.CoreWebView2.OpenDevToolsWindow();
    }

    /// <summary>
    /// 取得 webview2 版本資訊，格式為 "major.minor.build.patch"（例如 "114.0.1823.43"）
    /// </summary>
    public async Task<string> GetBrowserVersionString() {
        return (await WebWindow.GetCoreWebView2Environment()).BrowserVersionString;
    }
}
