/**
 * C# 已改造 API 共用的固定回應格式。
 */
export interface ApiResponse<T> {
    status: "success" | "failed";
    data: T | null;
    errorCode: string;
    message: string;
}

/**
 * API 回應失敗時使用的前端例外。
 * API layer 只負責保留狀態與拋出例外，畫面要如何提示由上層決定。
 */
export class WebApiError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;

    constructor(errorCode: string, message: string, statusCode: number) {
        super(message);
        this.name = "WebApiError";
        this.errorCode = errorCode;
        this.statusCode = statusCode;
    }
}

/**
 * 取得可顯示給使用者的例外訊息。
 */
export function getExceptionMessage(error: unknown): string {
    if (error instanceof Error) { return error.message; }
    return String(error);
}

function isApiResponse(body: unknown): body is ApiResponse<unknown> {
    if (body === null || typeof body !== "object") { return false; }

    const response = body as Record<string, unknown>;
    return (response.status === "success" || response.status === "failed")
        && Object.prototype.hasOwnProperty.call(response, "data")
        && typeof response.errorCode === "string"
        && typeof response.message === "string";
}

/**
 * 檢查 envelope 並取出 data；API 失敗或格式不符時直接拋出例外。
 */
export function unwrapApiResponse<T>(body: unknown, statusCode: number): T {
    if (isApiResponse(body) === false) {
        throw new WebApiError("invalidResponse", "API 回應格式錯誤。", statusCode);
    }

    const hasHttpStatus = statusCode !== 0;
    if ((hasHttpStatus && (statusCode < 200 || statusCode >= 300)) || body.status === "failed") {
        throw new WebApiError(
            body.errorCode || "apiFailed",
            body.message || "API 請求失敗。",
            statusCode,
        );
    }

    return body.data as T;
}

/**
 * 解析 WebView bridge 回傳的 JSON envelope。
 */
export function parseApiResponseJson<T>(text: string, statusCode = 0): T {
    let body: unknown;
    try {
        body = JSON.parse(text);
    }
    catch {
        // bridge 回應不是 JSON 時轉成統一 API 例外，交由上層決定畫面如何處理。
        throw new WebApiError("invalidJson", "API 回應不是有效的 JSON。", statusCode);
    }

    return unwrapApiResponse<T>(body, statusCode);
}
