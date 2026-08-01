/**
 * 第一版支援的壓縮檔副檔名。
 *
 * 副檔名只用來決定是否嘗試進入 archive source；真正能否讀取仍由後端
 * provider 在 sessions/open 時驗證。
 */
export const ARCHIVE_EXTENSIONS = [
    "zip", "rar", "7z", "cbz", "cbr", "xz", "bz2", "gz", "tar", "tgz",
] as const;

/** 支援格式清單中單一副檔名的字面值型別。 */
export type ArchiveExtension = typeof ARCHIVE_EXTENSIONS[number];

/** 一般檔案與壓縮檔 entry 共用的來源身份模型。 */
export type FileRef =
    | {
        /** 一般檔案來源。path 是可直接交給既有 API 的實體路徑。 */
        kind: "filesystem";
        path: string;
    }
    | {
        /** archive entry 來源；不可把暫存實體路徑當成 identity。 */
        kind: "archive";
        /** 原始壓縮檔實體路徑。 */
        archivePath: string;
        /** 後端 session 識別碼。 */
        sessionId: string;
        /** entry 在該 session 內的索引。 */
        entryId: number;
        /** 壓縮檔內的邏輯相對路徑。 */
        logicalPath: string;
    };

/** 後端在 sessions/open 回傳的單一 entry metadata。 */
export interface ArchiveEntryMetadata {
    /** entry 在目前 session 內的穩定索引。 */
    entryId: number;
    /** 壓縮檔內的邏輯相對路徑。 */
    name: string;
    /** entry 解壓後的大小，單位為 bytes。 */
    size: number;
    /** entry 最後修改時間的 Unix milliseconds UTC；壓縮檔沒有提供時間時為 0。 */
    lastWriteTimeUtc: number;
    /** 是否為資料夾；資料夾只保留在 metadata，不加入預覽列表。 */
    isDirectory: boolean;
}

/** 後端建立 archive session 後回傳的完整來源快照。 */
export interface ArchiveSessionResponse {
    /** 正常成功時固定為 ready。 */
    status: "ready";
    /** 來源 fingerprint session 識別碼。 */
    sessionId: string;
    /** 正規化後的原始壓縮檔路徑。 */
    archivePath: string;
    /** provider 判斷出的實際壓縮格式。 */
    format: string;
    /** 是否為固實壓縮檔。 */
    isSolid: boolean;
    /** 固實 block 數量；後端無法取得時為 0。 */
    solidBlockCount: number;
    /** 壓縮方法描述，例如 LZMA2:48m。 */
    compressionMethod: string;
    /** 所有檔案 entry 的未壓縮大小總和。 */
    totalUnpackedBytes: number;
    /** 是否包含加密 entry。 */
    hasEncryptedEntries: boolean;
    /** 目前 session 的密碼是否已驗證。 */
    isPasswordVerified: boolean;
    /** session 專用的暫存資料夾；第一階段不直接交給 UI。 */
    tempDirectory: string;
    /** 初始化時讀取的完整 entry metadata。 */
    entries: ArchiveEntryMetadata[];
}

/** entry-path API 回傳的實體暫存檔資料。 */
export interface ArchivePhysicalPathResponse {
    /** 正常成功時固定為 ready。 */
    status: "ready";
    /** 對應的 archive session。 */
    sessionId: string;
    /** 對應的 entry 索引。 */
    entryId: number;
    /** 解壓完成後可交給 Windows 的實體路徑。 */
    physicalPath: string;
    /** 原始 entry 名稱。 */
    fileName: string;
}

/** 提供給前端列表、排序與後續 resolver 使用的 entry 模型。 */
export interface ArchiveEntryItem {
    /** 以 sessionId + entryId 識別的 archive FileRef。 */
    ref: Extract<FileRef, { kind: "archive" }>;
    /** 壓縮檔內的標準化邏輯相對路徑。 */
    logicalPath: string;
    /** UI 列表顯示的 basename。 */
    displayName: string;
    /** 由 displayName 推導的無點副檔名。 */
    extension: string;
    /** entry 解壓後大小。 */
    size: number;
    /** entry 最後修改時間的 Unix milliseconds UTC；壓縮檔沒有提供時間時為 0。 */
    lastWriteTimeUtc: number;
    /** 是否為資料夾。 */
    isDirectory: boolean;
}

/** archive source 在非同步開啟與關閉期間可能處於的狀態。 */
export type ArchiveSourceStatus = "opening" | "ready" | "closing" | "closed";

/** 一個視窗目前持有的 archive source 狀態快照。 */
export interface ArchiveSourceState {
    /** 目前 source 的生命週期狀態。 */
    status: ArchiveSourceStatus;
    /** 每次切換來源時遞增的非同步請求世代。 */
    generation: number;
    /** 第一個 session 的路徑，供單一來源相容顯示。 */
    archivePath: string;
    /** 第一個 session，供既有單一來源呼叫相容。 */
    session: ArchiveSessionResponse | null;
    /** 視窗目前持有的全部 sessions。 */
    sessions: ArchiveSessionResponse[];
}

/** archive endpoint 統一回傳的錯誤 JSON 格式。 */
export interface ArchiveErrorResponse {
    /** 失敗回應固定為 failed。 */
    status: "failed";
    /** 穩定的程式錯誤代碼。 */
    errorCode: string;
    /** 後端提供的參考訊息；UI 不依賴其內容分支。 */
    message: string;
}

/** 穩定錯誤代碼，實際值仍允許後端未來擴充。 */
export type ArchiveErrorCode =
    | "networkError"
    | "invalidJson"
    | "invalidParameter"
    | "missingParameter"
    | "archiveApiFailed"
    | "archiveNotFound"
    | "archiveOpenFailed"
    | "archiveInvalid"
    | "solidArchiveSizeLimitExceeded"
    | "passwordRequired"
    | "passwordIncorrect"
    | "passwordCancelled"
    | "sourceChanged"
    | "sessionNotFound"
    | "entryNotFound"
    | "entryIsDirectory"
    | "staleRequest"
    | (string & {});

/** 將 archive API 錯誤保留為可供 UI 分支判斷的例外模型。 */
export class ArchiveApiError extends Error {
    public readonly errorCode: ArchiveErrorCode;
    public readonly statusCode: number;
    public readonly archivePath: string | undefined;

    constructor(errorCode: ArchiveErrorCode, message: string, statusCode = 0, archivePath?: string) {
        super(message);
        this.name = "ArchiveApiError";
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.archivePath = archivePath;
    }
}

/** 判斷檔案路徑是否具有第一版支援的壓縮檔副檔名。 */
export function isSupportedArchivePath(path: string): boolean {
    const normalizedPath = path.replace(/\\/g, "/");
    const fileName = normalizedPath.substring(normalizedPath.lastIndexOf("/") + 1);
    const dotIndex = fileName.lastIndexOf(".");
    if (dotIndex < 0) { return false; }

    const extension = fileName.substring(dotIndex + 1).toLocaleLowerCase();
    return (ARCHIVE_EXTENSIONS as readonly string[]).includes(extension);
}

/** 取得原始壓縮檔的檔名，不包含父目錄。 */
export function getArchiveFileName(path: string): string {
    const normalizedPath = path.replace(/\\/g, "/");
    return normalizedPath.substring(normalizedPath.lastIndexOf("/") + 1);
}

/** 取得 entry 的內部檔名，不包含壓縮檔內的相對資料夾。 */
export function getArchiveEntryDisplayName(logicalPath: string): string {
    const normalizedPath = logicalPath.replace(/\\/g, "/").replace(/\/+$/, "");
    return normalizedPath.substring(normalizedPath.lastIndexOf("/") + 1);
}

/** 建立供標題、複製路徑與既有 UI 使用的完整 logical path。 */
export function getArchiveLogicalPath(item: ArchiveEntryItem): string {
    return item.ref.archivePath + "\\" + item.logicalPath.replace(/\//g, "\\");
}

/** 將後端 entry metadata 轉成帶有穩定 FileRef 的前端列表模型。 */
export function createArchiveEntryItem(
    session: ArchiveSessionResponse,
    entry: ArchiveEntryMetadata,
): ArchiveEntryItem {
    const logicalPath = entry.name.replace(/\\/g, "/");
    const displayName = getArchiveEntryDisplayName(logicalPath);
    const dotIndex = displayName.lastIndexOf(".");

    return {
        ref: {
            kind: "archive",
            archivePath: session.archivePath,
            sessionId: session.sessionId,
            entryId: entry.entryId,
            logicalPath,
        },
        logicalPath,
        displayName,
        extension: dotIndex >= 0 ? displayName.substring(dotIndex + 1).toLocaleLowerCase() : "",
        size: entry.size,
        lastWriteTimeUtc: entry.lastWriteTimeUtc,
        isDirectory: entry.isDirectory,
    };
}
