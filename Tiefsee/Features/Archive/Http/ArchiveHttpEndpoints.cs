using System.Drawing;
using System.IO;
using System.Text.Json;

namespace Tiefsee;

/// <summary>
/// 壓縮檔預覽 API
/// </summary>
public sealed class ArchiveHttpEndpoints : HttpEndpointModuleBase {

    private readonly ArchivePreviewService _archiveService;
    private readonly ImageProcessingService _imageProcessingService;

    public ArchiveHttpEndpoints(WebServer webServer) : base(webServer) {
        _archiveService = Program.services.ArchivePreview;
        _imageProcessingService = Program.services.ImageProcessing;
    }

    public void RegisterRoutes() {
        HttpEndpointRegistrar.Map(WebServer, "/api/archives/sessions/open", d => Execute(d, () => OpenSession(d)));
        HttpEndpointRegistrar.Map(WebServer, "/api/archives/sessions/close", d => Execute(d, () => CloseSession(d)));
        HttpEndpointRegistrar.Map(WebServer, "/api/archives/entry", d => Execute(d, () => GetEntry(d)));
        HttpEndpointRegistrar.Map(WebServer, "/api/archives/entry-path", d => Execute(d, () => GetEntryPath(d)));
        HttpEndpointRegistrar.Map(WebServer, "/api/archives/entry-thumbnail", d => Execute(d, () => GetEntryThumbnail(d)));
    }

    private async Task Execute(RequestData d, Func<Task> handler) {
        try {
            await handler();
        }
        catch (ArchivePreviewException ex) {
            await WriteErrorJson(d, ex.StatusCode, ex.ErrorCode, ex.Message);
        }
        catch (JsonException ex) {
            await WriteErrorJson(d, 400, "invalidJson", ex.Message);
        }
        catch (FormatException ex) {
            await WriteErrorJson(d, 400, "invalidParameter", ex.Message);
        }
        catch (Exception) {
            await WriteErrorJson(d, 500, "archiveApiFailed", "壓縮檔 API 處理失敗。");
        }
    }

    /// <summary>
    /// 建立或重用 session
    /// </summary>
    private async Task OpenSession(RequestData d) {
        EnsureMethod(d, "POST");
        using JsonDocument json = JsonDocument.Parse(d.postData);
        JsonElement root = json.RootElement;
        string path = GetRequiredJsonString(root, "path");
        string password = GetOptionalJsonString(root, "password");
        string windowId = GetRequiredJsonString(root, "windowId");

        await WriteJson(d, await _archiveService.OpenAsync(path, password, windowId));
    }

    /// <summary>
    /// 釋放前端目前不再使用的單一 session。
    ///
    /// 此 API 必須同時提供 sessionId 與 windowId，只能釋放該視窗對指定
    /// session 的持有。視窗關閉時釋放全部 session 不經過 HTTP，而是由
    /// WebWindow.FormClosed 直接呼叫 ArchivePreviewService.CloseWindow。
    /// </summary>
    private async Task CloseSession(RequestData d) {
        EnsureMethod(d, "DELETE");
        string sessionId = GetRequiredArg(d, "sessionId");
        string windowId = GetRequiredArg(d, "windowId");
        if (_archiveService.Close(sessionId, windowId) == false) {
            await WriteErrorJson(d, 404, "sessionNotFound", "找不到此 windowId 持有的壓縮檔 session。");
            return;
        }

        await WriteJson(d, new { status = "released", sessionId, windowId });
    }

    /// <summary>
    /// 取得解壓後的檔案
    /// </summary>
    private async Task GetEntry(RequestData d) {
        EnsureMethod(d, "GET");
        string sessionId = GetRequiredArg(d, "sessionId");
        int entryId = GetRequiredEntryId(d);
        string path = await _archiveService.GetEntryPathAsync(sessionId, entryId);

        d.context.Response.ContentType = GetMimeTypeMapping(path);
        await WriteFile(d, path);
    }

    /// <summary>
    /// 取得解壓後的檔案實體路徑
    /// </summary>
    private async Task GetEntryPath(RequestData d) {
        EnsureMethod(d, "GET");
        string sessionId = GetRequiredArg(d, "sessionId");
        int entryId = GetRequiredEntryId(d);
        string path = await _archiveService.GetEntryPathAsync(sessionId, entryId);
        ArchiveEntryInfoResult entry = _archiveService.GetEntry(sessionId, entryId);

        await WriteJson(d, new ArchivePhysicalPathResult {
            sessionId = sessionId,
            entryId = entryId,
            physicalPath = path,
            fileName = entry.name
        });
    }

    /// <summary>
    /// 取得解壓後的檔案縮圖
    /// </summary>
    private async Task GetEntryThumbnail(RequestData d) {
        EnsureMethod(d, "GET");
        string sessionId = GetRequiredArg(d, "sessionId");
        int entryId = GetRequiredEntryId(d);
        int size = GetOptionalIntArg(d, "size", 256);
        if (size < 16 || size > 1024) {
            throw new ArchivePreviewException("invalidParameter", "size 必須介於 16 到 1024 之間。", 400);
        }

        string path = await _archiveService.GetEntryPathAsync(sessionId, entryId);
        if (HeadersAdd304(d, path)) { return; }

        using Bitmap thumbnail = _imageProcessingService.GetFileIcon(path, size, 3);
        if (thumbnail == null) {
            await WriteError(d, 500, "縮圖取得失敗");
            return;
        }

        using MemoryStream output = new();
        thumbnail.Save(output, System.Drawing.Imaging.ImageFormat.Png);
        output.Position = 0;
        d.context.Response.ContentType = "image/png";
        await WriteStream(d, output);
    }

    #region 參數檢查

    private static string GetRequiredArg(RequestData d, string name) {
        if (d.args.TryGetValue(name, out string value) == false || string.IsNullOrWhiteSpace(value)) {
            throw new ArchivePreviewException("missingParameter", $"缺少參數：{name}。", 400);
        }
        return Uri.UnescapeDataString(value);
    }

    private static int GetRequiredEntryId(RequestData d) {
        string value = GetRequiredArg(d, "entryId");
        if (int.TryParse(value, out int entryId) == false || entryId < 0) {
            throw new FormatException("entryId 必須是非負整數。");
        }
        return entryId;
    }

    private static int GetOptionalIntArg(RequestData d, string name, int defaultValue) {
        if (d.args.TryGetValue(name, out string value) == false || string.IsNullOrWhiteSpace(value)) {
            return defaultValue;
        }
        if (int.TryParse(Uri.UnescapeDataString(value), out int result) == false) {
            throw new FormatException($"{name} 必須是整數。");
        }
        return result;
    }

    private static string GetRequiredJsonString(JsonElement root, string name) {
        if (root.TryGetProperty(name, out JsonElement element) == false
            || element.ValueKind != JsonValueKind.String
            || string.IsNullOrWhiteSpace(element.GetString())) {
            throw new ArchivePreviewException("missingParameter", $"缺少參數：{name}。", 400);
        }
        return element.GetString();
    }

    private static string GetOptionalJsonString(JsonElement root, string name) {
        if (root.TryGetProperty(name, out JsonElement element) == false
            || element.ValueKind == JsonValueKind.Null) {
            return null;
        }
        if (element.ValueKind != JsonValueKind.String) {
            throw new ArchivePreviewException("invalidParameter", $"參數格式錯誤：{name}。", 400);
        }
        return element.GetString();
    }

    private static void EnsureMethod(RequestData d, string expectedMethod) {
        if (d.context.Request.HttpMethod.Equals(expectedMethod, StringComparison.OrdinalIgnoreCase) == false) {
            throw new ArchivePreviewException("methodNotAllowed", "HTTP method 不符合此 API。", 405);
        }
    }

    #endregion

    private async Task WriteErrorJson(RequestData d, int statusCode, string errorCode, string message) {
        d.context.Response.StatusCode = statusCode;
        await WriteJson(d, new ArchiveErrorResult {
            status = "failed",
            errorCode = errorCode,
            message = message
        });
    }
}
