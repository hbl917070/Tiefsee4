using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Tiefsee;

/// <summary>
/// 所有已改造 API 共用的固定回應格式。
/// 成功與失敗都保留相同欄位，避免前端因回應結構改變而產生二次錯誤。
/// </summary>
public sealed class ApiResponse<T> {

    [JsonPropertyName("status")]
    public string Status { get; set; } = "success";

    [JsonPropertyName("data")]
    public T Data { get; set; }

    [JsonPropertyName("errorCode")]
    public string ErrorCode { get; set; } = "";

    [JsonPropertyName("message")]
    public string Message { get; set; } = "";

    /// <summary>
    /// 建立成功回應。
    /// </summary>
    public static ApiResponse<T> Success(T data) {
        return new ApiResponse<T> {
            Status = "success",
            Data = data,
            ErrorCode = "",
            Message = "",
        };
    }

    /// <summary>
    /// 建立失敗回應。
    /// </summary>
    public static ApiResponse<T> Failure(string errorCode, string message) {
        return new ApiResponse<T> {
            Status = "failed",
            Data = default,
            ErrorCode = errorCode,
            Message = message,
        };
    }
}

/// <summary>
/// 已改造 API 使用的穩定錯誤代碼。
/// </summary>
public static class ApiErrorCode {
    public const string FileSystemReadFailed = "filesystemReadFailed";
    public const string FileSystemAccessDenied = "filesystemAccessDenied";
    public const string PathNotFound = "pathNotFound";
    public const string InvalidJson = "invalidJson";
    public const string InvalidParameter = "invalidParameter";
    public const string InternalError = "internalError";
}

/// <summary>
/// 將 API 內部例外轉成可安全傳給前端的例外。
/// </summary>
public sealed class ApiResponseException : Exception {

    public ApiResponseException(string errorCode, string message, int statusCode = 400, Exception innerException = null)
        : base(message, innerException) {
        ErrorCode = errorCode;
        StatusCode = statusCode;
    }

    public string ErrorCode { get; }
    public int StatusCode { get; }
}

/// <summary>
/// 統一 HTTP endpoint 與 WebView bridge 的錯誤代碼及使用者訊息。
/// </summary>
public static class ApiErrorMapper {

    public static (int StatusCode, string ErrorCode, string Message) Map(Exception exception) {
        return exception switch {
            ApiResponseException apiException => (apiException.StatusCode, apiException.ErrorCode, apiException.Message),
            JsonException => (400, ApiErrorCode.InvalidJson, "請求內容格式錯誤。"),
            FormatException => (400, ApiErrorCode.InvalidParameter, "請求參數格式錯誤。"),
            ArgumentException => (400, ApiErrorCode.InvalidParameter, "請求參數錯誤。"),
            FileNotFoundException => (404, ApiErrorCode.PathNotFound, "找不到指定檔案。"),
            DirectoryNotFoundException => (404, ApiErrorCode.PathNotFound, "找不到指定資料夾。"),
            UnauthorizedAccessException => (403, ApiErrorCode.FileSystemAccessDenied, "檔案或資料夾沒有存取權限。"),
            IOException => (500, ApiErrorCode.FileSystemReadFailed, "檔案或資料夾讀取失敗。"),
            _ => (500, ApiErrorCode.InternalError, "API 處理失敗。"),
        };
    }
}
