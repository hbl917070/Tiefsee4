import { ArchiveApiClient } from "./ArchiveApi";
import {
    ArchiveApiError,
    ArchiveSessionResponse,
    ArchiveSourceState,
    createArchiveEntryItem,
    ArchiveEntryItem,
    FileRef,
} from "./ArchiveTypes";

/**
 * 管理單一視窗目前持有的 archive session 集合。
 *
 * 一次開啟多個壓縮檔時，每一個原始壓縮檔都有自己的 session；此類別將
 * 它們集中管理，再把各 session 的 entry 扁平合併給 FileLoad。generation
 * 用來丟棄較晚才回來的舊 open 結果，避免切換來源後舊請求覆蓋新清單。
 */
export class ArchiveSourceManager {

    private readonly api: ArchiveApiClient;
    private generation = 0;
    private current: ArchiveSessionResponse[] = [];
    private status: ArchiveSourceState["status"] = "closed";

    /** 建立 source manager；預設使用目前視窗的集中式 ArchiveApiClient。 */
    constructor(api: ArchiveApiClient = new ArchiveApiClient()) {
        this.api = api;
    }

    /** 取得目前 source 的不可變狀態快照，供 UI 或非同步流程保存 generation。 */
    public getState(archivePath = ""): ArchiveSourceState {
        return {
            status: this.status,
            generation: this.generation,
            archivePath: this.current[0]?.archivePath ?? archivePath,
            session: this.current[0] ?? null,
            sessions: [...this.current],
        };
    }

    /** 取得目前視窗持有的所有 archive session。 */
    public getCurrentSessions(): ArchiveSessionResponse[] {
        return [...this.current];
    }

    /** 取得第一個 session，供單一壓縮檔的相容呼叫使用。 */
    public getCurrentSession(): ArchiveSessionResponse | null {
        return this.current[0] ?? null;
    }

    /**
     * 判斷指定 session 是否仍屬於目前來源。
     * generation 可由呼叫端保存，讓「同一個 sessionId 但已重新載入」的舊結果也失效。
     */
    public isCurrent(sessionId: string, generation = this.generation): boolean {
        return generation === this.generation
            && this.current.some(session => session.sessionId === sessionId);
    }

    /** 將目前所有 session 的 entry 依原始壓縮檔順序扁平化成列表項目。 */
    public getEntryItems(sessions = this.current): ArchiveEntryItem[] {
        return sessions.flatMap(session => session.entries.map(entry => createArchiveEntryItem(session, entry)));
    }

    /** 開啟單一壓縮檔；實際工作委派給多來源版本以保持生命週期一致。 */
    public async open(archivePath: string, password?: string): Promise<ArchiveSessionResponse> {
        const sessions = await this.openMany([archivePath], password);
        return sessions[0];
    }

    /**
     * 開啟多個壓縮檔並合併 entry。
     *
     * 這裡刻意採序列開啟：若其中一個壓縮檔需要密碼或載入失敗，可以
     * 立即停止並清理已建立的 session，不留下半套來源清單。密碼重試時
     * FileLoad 會重新呼叫此方法，後端相同 fingerprint 仍可重用暫存目錄。
     */
    public async openMany(archivePaths: string[], password?: string): Promise<ArchiveSessionResponse[]> {
        const requestGeneration = ++this.generation;
        const previous = this.current;
        this.current = [];
        this.status = "opening";

        const opened: ArchiveSessionResponse[] = [];
        try {
            for (const archivePath of archivePaths) {
                let result: ArchiveSessionResponse;
                try {
                    result = await this.api.open(archivePath, password);
                }
                catch (error) {
                    // 將失敗來源附在穩定錯誤上，FileLoad 才能顯示正確的壓縮檔圖示。
                    if (error instanceof ArchiveApiError) {
                        throw new ArchiveApiError(error.errorCode, error.message, error.statusCode, archivePath);
                    }
                    throw error;
                }
                if (requestGeneration !== this.generation) {
                    await this.releaseQuietly(result.sessionId);
                    throw new ArchiveApiError("staleRequest", "壓縮檔載入結果已過期。", 0, archivePath);
                }
                opened.push(result);
            }

            this.current = opened;
            this.status = "ready";

            const activeSessionIds = new Set(opened.map(session => session.sessionId));
            for (const session of previous) {
                if (activeSessionIds.has(session.sessionId) === false) {
                    await this.releaseQuietly(session.sessionId);
                }
            }
            return [...opened];
        }
        catch (error) {
            // 只有目前這一代的請求可以改變狀態；過期請求的清理由呼叫端代辦。
            if (requestGeneration === this.generation) {
                this.status = "closed";
                for (const session of opened) {
                    await this.releaseQuietly(session.sessionId);
                }
                for (const session of previous) {
                    await this.releaseQuietly(session.sessionId);
                }
            }
            else {
                // 新一代請求已接管狀態，舊請求仍須清理自己已開啟的 session。
                for (const session of opened) {
                    await this.releaseQuietly(session.sessionId);
                }
            }
            throw error;
        }
    }

    /** 關閉目前視窗持有的全部 session，並讓所有舊 generation 失效。 */
    public async close(): Promise<void> {
        const closeGeneration = ++this.generation;
        const previous = this.current;
        this.current = [];
        this.status = "closing";
        try {
            for (const session of previous) {
                await this.release(session.sessionId);
            }
        }
        finally {
            if (closeGeneration === this.generation) {
                this.status = "closed";
            }
        }
    }

    /** 釋放單一 session；session 已不存在時視為清理已完成。 */
    public async release(sessionId: string): Promise<void> {
        try {
            await this.api.close(sessionId);
        }
        catch (error) {
            // session 已被後端清理時，前端狀態已經達成關閉，不需阻止換檔。
            if (error instanceof ArchiveApiError && error.errorCode === "sessionNotFound") {
                return;
            }
            throw error;
        }
    }

    /** 清理過期 session 時吞掉清理錯誤，避免遮蔽原始載入結果。 */
    private async releaseQuietly(sessionId: string): Promise<void> {
        try {
            await this.release(sessionId);
        }
        catch (error) {
            console.warn("關閉過期的 archive session 失敗。", error);
        }
    }
}

/** 判斷 FileRef 是否為 archive entry，供後續 resolver 做型別縮小。 */
export function isArchiveFileRef(fileRef: FileRef): fileRef is Extract<FileRef, { kind: "archive" }> {
    return fileRef.kind === "archive";
}
