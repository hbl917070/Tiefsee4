namespace Tiefsee;

/// <summary>
/// 集中管理 app 啟動後共享的服務實例
/// </summary>
public sealed class ServiceRegistry {

    public ImageProcessingService ImageProcessing { get; } = new();
    public FileMetadataService FileMetadata { get; } = new();

    public WebServer WebServer { get; private set; }

    public void SetWebServer(WebServer webServer) {
        WebServer = webServer;
    }

    public void RegisterHttpRoutes() {
        new AppHttpEndpoints(WebServer).RegisterRoutes();
        new WindowHttpEndpoints(WebServer).RegisterRoutes();
        new FileHttpEndpoints(WebServer).RegisterRoutes();
        new DirectoryHttpEndpoints(WebServer).RegisterRoutes();
        new ImageHttpEndpoints(WebServer).RegisterRoutes();
        new SystemHttpEndpoints(WebServer).RegisterRoutes();
        new StaticAssetHttpEndpoints(WebServer).RegisterRoutes();
    }
}
