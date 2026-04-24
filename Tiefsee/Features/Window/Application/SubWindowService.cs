namespace Tiefsee;

/// <summary>
/// 封裝子視窗建立與管理
/// </summary>
public sealed class SubWindowService {
    /// <summary>
    /// 子視窗快取，以 windowKey 為鍵值，對應的 WebWindow 為值。
    /// 當使用 NewSubWindow 建立子視窗時，會先檢查 windowKey 是否已存在於快取中，如果存在則直接顯示該視窗而不重複建立；
    /// 如果不存在則建立新視窗並加入快取。當子視窗被關閉時，會從快取中移除對應的 entry。
    /// </summary>
    private readonly Dictionary<string, WebWindow> _subWindowCache = [];

    /// <summary>
    /// 建立新視窗，並以 owner 進行父子視窗關聯
    /// </summary>
    /// <param name="owner"> 父視窗 </param>
    /// <param name="url"> 新視窗的 URL </param>
    /// <param name="args"> 新視窗的參數 </param>
    /// <returns> 新建立的視窗 </returns>
    public async Task<WebWindow> NewWindow(WebWindow owner, string url, object[] args) {
        return await WebWindow.Create(url, args.Select(x => x.ToString()).ToArray(), owner);
    }

    /// <summary>
    /// 建立子視窗，並以 windowKey 進行快取管理。當同一個 windowKey 已存在對應的子視窗時，會直接顯示該視窗而不重複建立。
    /// </summary>
    /// <param name="owner"> 父視窗 </param>
    /// <param name="url"> 子視窗的 URL </param>
    /// <param name="args"> 子視窗的參數 </param>
    /// <param name="windowKey"> 子視窗的唯一鍵值 </param>
    /// <param name="setOwnerAction"> 設定子視窗的父視窗的動作 </param>
    /// <returns> true=啟動成功 false=已經啟動過 </returns>
    public async Task<bool> NewSubWindow(WebWindow owner, string url, object[] args, string windowKey, Action<object> setOwnerAction) {
        if (_subWindowCache.ContainsKey(windowKey)) {
            _subWindowCache[windowKey]?.ShowWindow();
            return false;
        }

        var w = await NewWindow(owner, url, args);
        setOwnerAction(w);

        _subWindowCache.Add(windowKey, w);
        w.Closed += (sender, eventArgs) => {
            _subWindowCache.Remove(windowKey);
        };

        return true;
    }

    /// <summary>
    /// 設定為子視窗
    /// </summary>
    /// <param name="owner"> 父視窗 </param>
    /// <param name="window"> 子視窗 </param>
    public void SetOwner(WebWindow owner, object window) {
        if (window == null) { return; }

        WebWindow webwindow = (WebWindow)window;
        // 在 TopMost 的狀態下設定 Owner 也無法顯示，所以要先暫時取消 TopMost，設定完 Owner 後再恢復 TopMost
        if (owner.TopMost) {
            owner.TopMost = false;
            webwindow.Owner = owner;
            owner.TopMost = true;
            return;
        }

        webwindow.Owner = owner;
    }
}
