using System.IO;
using System.Text.Json;

namespace Tiefsee;

public sealed class DirectoryHttpEndpoints : HttpEndpointModuleBase {

    /// <summary>
    /// 建立資料夾相關的 HTTP endpoints
    /// </summary>
    public DirectoryHttpEndpoints(WebServer webServer) : base(webServer) {
    }

    /// <summary>
    /// 註冊路由
    /// </summary>
    public void RegisterRoutes() {
        HttpEndpointRegistrar.Map(WebServer, "/api/directories/siblings", GetSiblingDir, "/api/directory/getSiblingDir");
        HttpEndpointRegistrar.Map(WebServer, "/api/directories/files2", GetFiles2, "/api/directory/getFiles2");
        HttpEndpointRegistrar.Map(WebServer, "/api/directories/files", GetFiles, "/api/directory/getFiles");
        HttpEndpointRegistrar.Map(WebServer, "/api/directories/children", GetDirectories, "/api/directory/getDirectories");
        HttpEndpointRegistrar.Map(WebServer, "/api/directories/sort", GetSort, "/api/sort");
        HttpEndpointRegistrar.Map(WebServer, "/api/directories/sort2", GetSort2, "/api/sort2");
    }

    /// <summary>
    /// 取得同層資料夾中的代表檔案資料，用於鄰近資料夾預覽
    /// </summary>
    private async Task GetSiblingDir(RequestData d) {
        var json = JsonDocument.Parse(d.postData);
        string path = json.GetString("path");
        string[] arExt = json.GetStringArray("arExt");
        int maxCount = json.GetInt32("maxCount");

        if (await CheckDirExist(d, path) == false) { return; }

        await WriteJson(d, new WV_Directory().GetSiblingDir(path, arExt, maxCount));
    }

    /// <summary>
    /// 將檔名陣列轉成完整路徑陣列，再裁切回相對名稱
    /// </summary>
    private async Task GetFiles2(RequestData d) {
        var json = JsonDocument.Parse(d.postData);
        string dirPath = json.GetString("dirPath");
        string[] arName = json.GetStringArray("arName");

        // 底層仍使用既有 WV_Directory 邏輯，這裡只負責轉成較省流量的回傳格式
        int pathLen = dirPath.Length;
        var ret = new WV_Directory().GetFiles2(dirPath, arName)
            .Select(filePath => filePath.Substring(pathLen))
            .ToArray();

        await WriteJson(d, ret);
    }

    /// <summary>
    /// 回傳資料夾內符合搜尋條件的檔案名稱
    /// </summary>
    private async Task GetFiles(RequestData d) {
        var json = JsonDocument.Parse(d.postData);
        string path = json.GetString("path");
        string searchPattern = json.GetString("searchPattern");

        if (await CheckDirExist(d, path) == false) { return; }

        int pathLen = path.Length;
        var ret = Directory.EnumerateFiles(path, searchPattern)
            .Select(filePath => filePath.Substring(pathLen))
            .ToArray();

        await WriteJson(d, ret);
    }

    /// <summary>
    /// 回傳資料夾內符合搜尋條件的子資料夾名稱
    /// </summary>
    private async Task GetDirectories(RequestData d) {
        var json = JsonDocument.Parse(d.postData);
        string path = json.GetString("path");
        string searchPattern = json.GetString("searchPattern");

        if (await CheckDirExist(d, path) == false) { return; }

        int pathLen = path.Length;
        var ret = Directory.GetDirectories(path, searchPattern)
            .Select(dirPath => dirPath.Substring(pathLen))
            .ToArray();

        await WriteJson(d, ret);
    }

    /// <summary>
    /// 依指定排序規則排序字串陣列
    /// </summary>
    private async Task GetSort(RequestData d) {
        var json = JsonDocument.Parse(d.postData);
        string[] ar = json.GetStringArray("ar");
        string type = json.GetString("type");

        await WriteJson(d, new FileSort().Sort(ar, type));
    }

    /// <summary>
    /// 依指定資料夾上下文排序檔名陣列
    /// </summary>
    private async Task GetSort2(RequestData d) {
        var json = JsonDocument.Parse(d.postData);
        string dir = json.GetString("dir");
        string[] ar = json.GetStringArray("ar");
        string type = json.GetString("type");

        await WriteJson(d, new FileSort().Sort2(dir, ar, type));
    }
}
