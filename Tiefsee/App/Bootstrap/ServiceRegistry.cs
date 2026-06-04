namespace Tiefsee;

/// <summary>
/// 集中管理 app 啟動後共享的服務實例
/// </summary>
public sealed class ServiceRegistry {

    /// <summary> 啟動後可共享的執行期環境資訊 </summary>
    public AppRuntimeContext RuntimeContext { get; }
    /// <summary> 共用的圖片處理 service </summary>
    public ImageProcessingService ImageProcessing { get; }
    /// <summary> 共用的檔案中繼資料 service </summary>
    public FileMetadataService FileMetadata { get; }
    /// <summary> 共用的 UWP app service </summary>
    public UwpAppService UwpApp { get; }
    /// <summary> 共用的 A1111 資源 service </summary>
    public A1111ResourceService A1111Resource { get; }
    public WebServer WebServer { get; private set; }

    public ServiceRegistry(AppRuntimeContext runtimeContext) {
        RuntimeContext = runtimeContext;
        ImageProcessing = new ImageProcessingService(runtimeContext.TempDirImgProcessed, runtimeContext.TempDirImgZoom);
        FileMetadata = new FileMetadataService();
        UwpApp = new UwpAppService(runtimeContext.AppDataUwpList);
        // A1111Resource 需要先知道執行期的暫存檔路徑，所以在 bootstrap 階段建立
        A1111Resource = new A1111ResourceService(runtimeContext.AppDataA1111ModelList);
    }

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
