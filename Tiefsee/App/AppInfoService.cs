namespace Tiefsee;

/// <summary>
/// appInfo 取得
/// </summary>
public sealed class AppInfoService {

    /// <summary>
    /// 取得 AppInfo
    /// </summary>
    public string GetAppInfo(WebWindow window) {
        return WebWindow.GetAppInfo(window, window.Args, 0);
    }
}
