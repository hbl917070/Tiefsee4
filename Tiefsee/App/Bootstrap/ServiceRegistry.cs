namespace Tiefsee;

/// <summary>
/// 集中管理 app 啟動後共享的服務實例
/// </summary>
public sealed class ServiceRegistry {

    public WebServer WebServer { get; private set; }

    public void SetWebServer(WebServer webServer) {
        WebServer = webServer;
    }
}

