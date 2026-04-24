namespace Tiefsee;

public class WebServerController {

    private readonly WebServer _webServer;

    public WebServerController(WebServer ws) {

        _webServer = ws;
        RegisterRoutes();
    }

    private void RegisterRoutes() {
        new AppHttpEndpoints(_webServer).RegisterRoutes();
        new WindowHttpEndpoints(_webServer).RegisterRoutes();
        new FileHttpEndpoints(_webServer).RegisterRoutes();
        new DirectoryHttpEndpoints(_webServer).RegisterRoutes();
        new ImageHttpEndpoints(_webServer).RegisterRoutes();
        new SystemHttpEndpoints(_webServer).RegisterRoutes();
        new StaticAssetHttpEndpoints(_webServer).RegisterRoutes();
    }
}
