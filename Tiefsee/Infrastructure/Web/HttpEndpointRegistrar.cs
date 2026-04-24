namespace Tiefsee;

public static class HttpEndpointRegistrar {

    /// <summary>
    /// 註冊 endpoint 的正式路徑，並視需要同時保留舊路徑相容
    /// </summary>
    public static void Map(WebServer webServer, string canonicalPath, Func<RequestData, Task> handler, params string[] legacyPaths) {
        webServer.RouteAdd(canonicalPath, handler);

        foreach (var legacyPath in legacyPaths) {
            webServer.RouteAdd(legacyPath, handler);
        }
    }
}
