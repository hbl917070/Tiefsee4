using System.Net.Http;
using System.Text.Json;

namespace Tiefsee;

public sealed class SystemHttpEndpoints : HttpEndpointModuleBase {

    /// <summary>
    /// 建立系統整合相關的 HTTP endpoints
    /// </summary>
    public SystemHttpEndpoints(WebServer webServer) : base(webServer) {
    }

    /// <summary>
    /// 註冊路由
    /// </summary>
    public void RegisterRoutes() {
        HttpEndpointRegistrar.Map(WebServer, "/api/system/uwp-apps", GetUwpList, "/api/getUwpList");
        HttpEndpointRegistrar.Map(WebServer, "/api/system/clipboard", GetClipboardContent, "/api/getClipboardContent");
        HttpEndpointRegistrar.Map(WebServer, "/api/system/forward-request", ForwardRequest, "/api/forwardRequest");
        HttpEndpointRegistrar.Map(WebServer, "/api/system/a1111/lora-resource", GetA1111LoraResource, "/api/getA1111LoraResource");
    }

    /// <summary>
    /// 取得系統內可啟動的 UWP app 清單
    /// </summary>
    private async Task GetUwpList(RequestData d) {
        await WriteJson(d, new WV_RunApp().GetUwpList());
    }

    /// <summary>
    /// 取得剪貼簿內容，必要時限制文字長度
    /// </summary>
    private async Task GetClipboardContent(RequestData d) {
        int maxTextLength = int.Parse(d.args["maxTextLength"]);

        ClipboardLib.ClipboardContent clipboardContentData = null;
        // 剪貼簿存取需透過既有 UI/STA 包裝呼叫
        Adapter.Invoke(_ => {
            var clipboardLib = new ClipboardLib();
            clipboardContentData = clipboardLib.GetClipboardContent(maxTextLength);
        }, null);

        await WriteJson(d, clipboardContentData);
    }

    /// <summary>
    /// 代理轉送外部 HTTP 請求，保留大部分 request/response headers
    /// </summary>
    private async Task ForwardRequest(RequestData d) {
        var context = d.context;
        string targetUrl = d.context.Request.Headers["targetUrl"];

        if (string.IsNullOrEmpty(targetUrl)) {
            targetUrl = Uri.UnescapeDataString(d.args.GetValueOrDefault("targetUrl"));
        }

        if (string.IsNullOrEmpty(targetUrl)) {
            await WriteError(d, 400, "targetUrl is empty");
            return;
        }

        try {
            using HttpClient httpClient = new();
            var request = new HttpRequestMessage(new HttpMethod(context.Request.HttpMethod), targetUrl);

            if (context.Request.HasEntityBody) {
                request.Content = new StreamContent(context.Request.InputStream);
            }

            // 將原始 request header 盡量原樣轉送，但跳過會影響代理行為的欄位
            foreach (string headerName in context.Request.Headers.AllKeys) {
                if (headerName.Equals("url", StringComparison.OrdinalIgnoreCase)) { continue; }
                if (headerName.Equals("host", StringComparison.OrdinalIgnoreCase)) { continue; }
                if (headerName.Equals("referer", StringComparison.OrdinalIgnoreCase)) { continue; }

                if (!request.Headers.TryAddWithoutValidation(headerName, context.Request.Headers[headerName])) {
                    if (request.Content != null &&
                        !request.Content.Headers.TryAddWithoutValidation(headerName, context.Request.Headers[headerName])) {
                        Console.WriteLine($"無法添加標頭: {headerName}");
                    }
                }
            }

            using var response = await httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);
            context.Response.StatusCode = (int)response.StatusCode;
            context.Response.ContentType = response.Content.Headers.ContentType?.ToString();

            // 盡量把上游回應 header 帶回去，保留原始行為
            foreach (var header in response.Headers) {
                context.Response.Headers.Add(header.Key, string.Join(",", header.Value));
            }
            foreach (var header in response.Content.Headers) {
                if (header.Key.Equals("Content-Length", StringComparison.OrdinalIgnoreCase)) { continue; }
                context.Response.Headers.Add(header.Key, string.Join(",", header.Value));
            }

            using var responseStream = await response.Content.ReadAsStreamAsync();
            await responseStream.CopyToAsync(context.Response.OutputStream);
        }
        catch (Exception ex) {
            await WriteError(d, 500, ex.Message);
        }
    }

    /// <summary>
    /// 取得 A1111 LoRA 對應的相關資源
    /// </summary>
    private async Task GetA1111LoraResource(RequestData d) {
        var json = JsonDocument.Parse(d.postData);
        string[] searchDirs = json.GetStringArray("searchDirs");
        string[] loraNames = json.GetStringArray("loraNames");
        string[] excludeDirs = json.GetStringArray("excludeDirs");

        var a1111Manager = new A1111Manager(AppPath.appDataA1111ModelList);
        var result = a1111Manager.GetA1111LoraResource(searchDirs, loraNames, excludeDirs);
        await WriteJson(d, result);
    }
}
