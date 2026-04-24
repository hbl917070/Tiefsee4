namespace Tiefsee;

public sealed class AppHttpEndpoints : HttpEndpointModuleBase {

    /// <summary>
    /// 建立 app 層級的 HTTP endpoints。
    /// </summary>
    public AppHttpEndpoints(WebServer webServer) : base(webServer) {
    }

    /// <summary>
    /// 註冊 app 層級相關路由。
    /// </summary>
    public void RegisterRoutes() {
        HttpEndpointRegistrar.Map(WebServer, "/api/app/ping", Check, "/api/check");
    }

    /// <summary>
    /// 確認指定 port 是否為 Tiefsee 的本機服務，用於快速啟動檢查。
    /// </summary>
    private async Task Check(RequestData d) {
        await WriteString(d, "tiefsee");
    }
}
