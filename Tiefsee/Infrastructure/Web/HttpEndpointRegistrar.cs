namespace Tiefsee;

public static class HttpEndpointRegistrar {

    /// <summary>
    /// 註冊 endpoint 的正式路徑
    /// </summary>
    public static void Map(WebServer webServer, string canonicalPath, Func<RequestData, Task> handler) {
        webServer.RouteAdd(canonicalPath, handler);
    }
}
