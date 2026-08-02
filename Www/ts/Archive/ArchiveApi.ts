import {
    ArchiveApiError,
    ArchiveErrorResponse,
    ArchivePhysicalPathResponse,
    ArchiveSessionResponse,
} from "./ArchiveTypes";

type FetchFunction = typeof fetch;

/**
 * 壓縮檔 API 的唯一前端入口。
 *
 * 這裡只處理 HTTP、錯誤格式與 URL 組合，不負責 UI、viewer 或列表狀態，
 * 讓後續 FileLoad 接入時不需要把 fetch/error handling 複製到各處。
 */
export class ArchiveApiClient {

    private readonly baseUrl: string | undefined;
    private readonly getWindowId: () => string;
    private readonly fetchFunction: FetchFunction;

    /** 建立 API client；參數可注入以便測試不同 API host、windowId 與 fetch 行為。 */
    constructor(
        baseUrl?: string,
        getWindowId: () => string = () => baseWindow.windowId,
        fetchFunction: FetchFunction = globalThis.fetch.bind(globalThis),
    ) {
        this.baseUrl = baseUrl;
        this.getWindowId = getWindowId;
        this.fetchFunction = fetchFunction;
    }

    /** 建立或重用 archive session，並傳遞目前視窗的 windowId。 */
    public async open(path: string, password?: string): Promise<ArchiveSessionResponse> {
        const session = await this.requestJson<ArchiveSessionResponse>("/api/archives/sessions/open", {
            method: "POST",
            body: JSON.stringify({
                path,
                password: password ?? null,
                windowId: this.getWindowId(),
            }),
        });

        // ZIP 可能在尚未解密 entry 的情況下仍成功回傳 metadata；不能只依賴 HTTP 401
        // 判斷密碼狀態。這裡只記錄狀態與數量，不記錄 password 本身。
        console.debug("[Archive] sessions/open", {
            path,
            sessionId: session.sessionId,
            hasEncryptedEntries: session.hasEncryptedEntries,
            isPasswordVerified: session.isPasswordVerified,
            isSolid: session.isSolid,
            solidBlockCount: session.solidBlockCount,
            compressionMethod: session.compressionMethod,
            totalUnpackedBytes: session.totalUnpackedBytes,
            entryCount: session.entries.length,
        });
        return session;
    }

    /** 釋放目前視窗對指定 session 的持有，不直接刪除其他視窗的 session。 */
    public async close(sessionId: string): Promise<void> {
        await this.requestJson<unknown>(
            "/api/archives/sessions/close"
            + `?sessionId=${encodeURIComponent(sessionId)}`
            + `&windowId=${encodeURIComponent(this.getWindowId())}`,
            { method: "DELETE" },
        );
    }

    /** 取得可直接給既有圖片/影片/文字 API 使用的內容 URL；呼叫時後端才會 materialize entry。 */
    public getEntryUrl(sessionId: string, entryId: number): string {
        return this.getUrl("/api/archives/entry", sessionId, entryId);
    }

    /** 取得 entry 解壓後的實體暫存路徑，供後續 Windows/外部操作使用。 */
    public async getEntryPath(sessionId: string, entryId: number): Promise<ArchivePhysicalPathResponse> {
        return this.requestJson<ArchivePhysicalPathResponse>(
            this.getEndpoint("/api/archives/entry-path", sessionId, entryId),
            { method: "GET" },
        );
    }

    /** 建立一般 archive entry 的縮圖 URL；請求時才會進入 materialize。 */
    public getEntryThumbnailUrl(sessionId: string, entryId: number, size = 256): string {
        return this.getBaseUrl() + this.getEndpoint("/api/archives/entry-thumbnail", sessionId, entryId)
            + `&size=${encodeURIComponent(String(size))}`;
    }

    /** 建立不需解壓高風險 entry 的 Windows Shell 通用 icon URL。 */
    public getEntryIconUrl(sessionId: string, entryId: number, size = 256): string {
        return this.getBaseUrl() + this.getEndpoint("/api/archives/entry-icon", sessionId, entryId)
            + `&size=${encodeURIComponent(String(size))}`;
    }

    /** 載入候選壓縮檔失敗時，FileLoad 用此 URL 顯示原始檔案圖示。 */
    public getArchiveIconUrl(archivePath: string, size = 256): string {
        return this.getBaseUrl() + `/api/getFileIcon?size=${encodeURIComponent(String(size))}`
            + `&path=${encodeURIComponent(archivePath)}`;
    }

    /** 統一組合需要 sessionId 與 entryId 的 archive endpoint URL。 */
    private getEndpoint(endpoint: string, sessionId: string, entryId: number): string {
        // requestJson 會統一補上 API host，因此這裡只能回傳相對 endpoint。
        return endpoint
            + `?sessionId=${encodeURIComponent(sessionId)}`
            + `&entryId=${encodeURIComponent(String(entryId))}`;
    }

    /** 建立可直接交給瀏覽器元件使用的完整 archive URL。 */
    private getUrl(endpoint: string, sessionId: string, entryId: number): string {
        return this.getBaseUrl() + this.getEndpoint(endpoint, sessionId, entryId);
    }

    /** 取得 API host；延遲讀取全域 APIURL 以避開 module 初始化順序問題。 */
    private getBaseUrl(): string {
        // APIURL 是 BaseWindow 初始化後才設定，因此不能在 module load 時讀取。
        return this.baseUrl ?? APIURL;
    }

    /** 執行 JSON API 請求，統一處理網路錯誤、非 2xx 與後端錯誤格式。 */
    private async requestJson<T>(endpoint: string, init: RequestInit): Promise<T> {
        let response: Response;
        try {
            response = await this.fetchFunction(this.getBaseUrl() + endpoint, init);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "網路請求失敗。";
            throw new ArchiveApiError("networkError", message);
        }

        let body: unknown = undefined;
        try {
            body = await response.json();
        }
        catch (error) {
            if (response.ok === false) {
                throw new ArchiveApiError("archiveApiFailed", "壓縮檔 API 回應格式錯誤。", response.status);
            }
            throw new ArchiveApiError("invalidJson", "壓縮檔 API 回應不是有效的 JSON。", response.status);
        }

        if (this.isErrorResponse(body)) {
            throw new ArchiveApiError(body.errorCode, body.message, response.status);
        }
        if (response.ok === false) {
            throw new ArchiveApiError("archiveApiFailed", "壓縮檔 API 請求失敗。", response.status);
        }

        return body as T;
    }

    /** 以結構判斷回應是否為後端定義的 ArchiveErrorResult。 */
    private isErrorResponse(body: unknown): body is ArchiveErrorResponse {
        if (typeof body !== "object" || body === null) { return false; }
        const value = body as Partial<ArchiveErrorResponse>;
        return value.status === "failed"
            && typeof value.errorCode === "string"
            && typeof value.message === "string";
    }
}
