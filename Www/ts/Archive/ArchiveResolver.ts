import { ArchiveApiClient } from "./ArchiveApi";
import { ArchiveApiError, ArchiveEntryItem, getArchiveLogicalPath } from "./ArchiveTypes";
import { ArchiveSourceManager } from "./ArchiveSource";

/** resolver 建立預覽資料時所需的檔案資訊讀取函數。 */
export type ArchiveFileInfoLoader = (path: string) => Promise<FileInfo2>;

/**
 * archive entry 的單檔解析結果。
 *
 * `fileInfo.Path` 是後端 materialize 後的實體暫存檔，交給既有 viewer；
 * `fileInfo.FullPath` 則保留 logical path，供檔名、標題與目前項目身份使用。
 */
export interface ArchiveResolvedFile {
    /** 原始 entry metadata 與 session 身份。 */
    item: ArchiveEntryItem;
    /** 後端回傳、可交給既有檔案 API 的實體暫存路徑。 */
    physicalPath: string;
    /** 已套用壓縮檔日期與 logical path 的既有檔案資訊模型。 */
    fileInfo: FileInfo2;
}

/**
 * 將 archive FileRef 解析成既有 viewer 可使用的實體檔案。
 *
 * 所有需要 materialize 的單檔預覽都集中經過這裡，避免圖片、影片、PDF
 * 與文字各自複製 session、entry-path 和 stale request 的判斷。resolver
 * 只接受目前 source 的 entry；切換來源或 session 後，舊請求會以
 * `staleRequest` 結束，不會把舊檔案寫回目前畫面。
 */
export class ArchiveResolver {

    private readonly api: ArchiveApiClient;
    private readonly source: ArchiveSourceManager;
    private readonly loadFileInfo: ArchiveFileInfoLoader;
    /** 建立 resolver；檔案資訊讀取函數可注入，方便未來測試與替換 host API。 */
    constructor(
        source: ArchiveSourceManager,
        api: ArchiveApiClient,
        loadFileInfo: ArchiveFileInfoLoader,
    ) {
        this.source = source;
        this.api = api;
        this.loadFileInfo = loadFileInfo;
    }

    /** 取得 entry 的內容 URL；瀏覽器型 viewer 或縮圖流程可按需使用。 */
    public getPreviewUrl(item: ArchiveEntryItem): string {
        return this.api.getEntryUrl(item.ref.sessionId, item.ref.entryId);
    }

    /** 取得 entry 的縮圖 URL；此階段先保留給後續列表與大量瀏覽流程。 */
    public getThumbnailUrl(item: ArchiveEntryItem, size = 256): string {
        return this.api.getEntryThumbnailUrl(item.ref.sessionId, item.ref.entryId, size);
    }

    /**
     * 取得 entry-path；後端在暫存檔遺失時會重新 materialize，因此前端不自行
     * 判斷暫存檔生命週期，也不會把暫存路徑當成 entry 的穩定身份。
     */
    public async resolvePhysicalPath(item: ArchiveEntryItem): Promise<string> {
        const generation = this.getCurrentGeneration(item);
        let response;
        try {
            response = await this.api.getEntryPath(item.ref.sessionId, item.ref.entryId);
        }
        catch (error) {
            throw this.withArchivePath(error, item);
        }
        this.ensureCurrent(item, generation);
        return response.physicalPath;
    }

    /**
     * 解析既有 FileInfo2。
     *
     * 第一次 entry-path 成功後若 Windows 仍回報檔案不存在，再請求一次
     * entry-path，讓後端依既有 materialize/cache 規則復原檔案；第二次仍
     * 不存在才回傳 entryNotFound。日期使用目前 entry 的 archive metadata。
     */
    public async resolvePreviewFile(item: ArchiveEntryItem): Promise<ArchiveResolvedFile> {
        const generation = this.getCurrentGeneration(item);

        let physicalPath = await this.resolvePhysicalPath(item);
        let fileInfo = await this.loadFileInfo(physicalPath);
        if (fileInfo.Type === "none") {
            physicalPath = await this.resolvePhysicalPath(item);
            fileInfo = await this.loadFileInfo(physicalPath);
        }
        this.ensureCurrent(item, generation);

        if (fileInfo.Type === "none") {
            throw new ArchiveApiError("entryNotFound", "解壓縮後的檔案不存在。", 404, item.ref.archivePath);
        }

        // viewer 依 Path 讀取實體檔案；FullPath、大小與修改日期則使用 archive 語意。
        fileInfo.Path = physicalPath;
        fileInfo.FullPath = getArchiveLogicalPath(item);
        fileInfo.Lenght = item.size;
        fileInfo.LastWriteTimeUtc = item.lastWriteTimeUtc;

        console.debug("[Archive] entry materialized", {
            archivePath: item.ref.archivePath,
            entryPath: item.logicalPath,
            sessionId: item.ref.sessionId,
            entryId: item.ref.entryId,
            physicalPath,
        });

        return { item, physicalPath, fileInfo };
    }

    /** 取得目前 source generation；entry 不屬於目前 source 時立即拒絕。 */
    private getCurrentGeneration(item: ArchiveEntryItem): number {
        const state = this.source.getState(item.ref.archivePath);
        if (this.source.isCurrent(item.ref.sessionId, state.generation) === false) {
            throw new ArchiveApiError("staleRequest", "壓縮檔來源已經切換。", 0, item.ref.archivePath);
        }
        return state.generation;
    }

    /** 確認非同步 API 回來時，entry 仍屬於原本的 source generation。 */
    private ensureCurrent(item: ArchiveEntryItem, generation: number): void {
        if (this.source.isCurrent(item.ref.sessionId, generation) === false) {
            throw new ArchiveApiError("staleRequest", "壓縮檔來源已經切換。", 0, item.ref.archivePath);
        }
    }

    /** 將 API 例外補上來源壓縮檔路徑，讓上層能顯示正確的 fallback 與 log。 */
    private withArchivePath(error: unknown, item: ArchiveEntryItem): ArchiveApiError {
        if (error instanceof ArchiveApiError) {
            return new ArchiveApiError(error.errorCode, error.message, error.statusCode, item.ref.archivePath);
        }
        const message = error instanceof Error ? error.message : "壓縮檔 entry 載入失敗。";
        return new ArchiveApiError("archiveApiFailed", message, 0, item.ref.archivePath);
    }
}
