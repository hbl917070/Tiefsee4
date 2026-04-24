namespace Tiefsee;

public sealed class WindowHttpEndpoints : HttpEndpointModuleBase {

    /// <summary>
    /// 建立視窗相關的 HTTP endpoints
    /// </summary>
    public WindowHttpEndpoints(WebServer webServer) : base(webServer) {
    }

    /// <summary>
    /// 註冊路由
    /// </summary>
    public void RegisterRoutes() {
        HttpEndpointRegistrar.Map(WebServer, "/api/windows/open", NewWindow, "/api/newWindow");
        HttpEndpointRegistrar.Map(WebServer, "/api/windows/close-all", CloseAllWindow, "/api/closeAllWindow");
    }

    /// <summary>
    /// 開啟新視窗
    /// </summary>
    private async Task NewWindow(RequestData d) {
        string arg = Uri.UnescapeDataString(d.args["path"]);
        string[] args = arg.Split('\n');

        // 視窗建立必須切回 UI thread 執行
        Adapter.UIThread(() => {
            WebWindow.Create("MainWindow.html", args, null);
        });

        await WriteString(d, "ok");
    }

    /// <summary>
    /// 關閉目前所有可見視窗
    /// </summary>
    private async Task CloseAllWindow(RequestData d) {
        Adapter.UIThread(() => {
            WebWindow.CloseAllWindow();
        });
        await WriteString(d, "ok");
    }
}
