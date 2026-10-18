import type { TiefseeviewImageRect } from "./TiefseeviewTypes";

export interface TiefseeviewImageLevel {
    /** 此層影像相對於原圖的寬高比例；原始解析度為 1。 */
    scale: number;
    /** 空值代表這層只可由後端 tile API 取得，不能交給瀏覽器解碼完整圖片。 */
    url?: string;
}
export interface TiefseeviewImageRegionRequest {
    /** 以原圖像素表示的請求區域。 */
    rect: TiefseeviewImageRect;
    /** 要求的來源層級比例。 */
    scale: number;
}

export interface TiefseeviewImageTileRequest {
    tileX: number;
    tileY: number;
    scale: number;
    tileSize: number;
    gutter: number;
}

export interface TiefseeviewImageSourceRegion {
    /** ImageSource 將影像所有權交給呼叫端；完成上傳後呼叫端必須 close ImageBitmap。 */
    source: ImageBitmap;
    /** 回傳影像在原圖座標中實際涵蓋的範圍。 */
    imageRect: TiefseeviewImageRect;
    pixelWidth: number;
    pixelHeight: number;
    scale: number;
    /** source 內實際代表 imageRect 的像素範圍；完整層級預覽通常涵蓋整張 source。 */
    contentRect?: { x: number; y: number; width: number; height: number };
}

/**
 * 靜態圖片來源合約。來源負責解碼與取消請求；交付的 ImageBitmap 所有權轉移給 Renderer，後者上傳後負責關閉。
 */
export interface TiefseeviewImageSource {
    readonly width: number;
    readonly height: number;
    readonly levels: readonly TiefseeviewImageLevel[];
    readonly supportsRegionalRequests?: boolean;
    requestRegion(
        request: TiefseeviewImageRegionRequest,
        signal?: AbortSignal
    ): Promise<TiefseeviewImageSourceRegion>;
    requestTile?(request: TiefseeviewImageTileRequest, signal?: AbortSignal): Promise<TiefseeviewImageSourceRegion>;
    /** Renderer 完成上傳後可釋放不再顯示的解碼層級快取。 */
    releaseLevel?(scale: number): void;
    dispose(): void;
}

/**
 * 將現有完整圖片 URL 或 arUrl 多解析度 URL 包成 ImageSource；可選擇提供後端來源格子 URL。
 */
export class TiefseeviewUrlImageSource implements TiefseeviewImageSource {
    public readonly levels: readonly TiefseeviewImageLevel[];
    public readonly supportsRegionalRequests: boolean;
    private readonly worker: Worker;
    private readonly pending = new Map<number, { resolve: (bitmap: ImageBitmap) => void; reject: (error: Error) => void; signal?: AbortSignal; abort?: () => void }>();
    private nextRequestId = 0;
    private disposed = false;

    constructor(
        public readonly width: number,
        public readonly height: number,
        levels: readonly TiefseeviewImageLevel[],
        private readonly getTileUrl?: (request: TiefseeviewImageTileRequest) => string
    ) {
        this.supportsRegionalRequests = getTileUrl !== undefined;
        this.worker = new Worker("./js/TiefseeviewImageWorker.js");
        this.worker.addEventListener("message", this.onWorkerMessage);
        this.worker.addEventListener("error", this.onWorkerError);
        if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
            throw new RangeError("ImageSource 的原圖尺寸必須是正數");
        }
        if (levels.length === 0) {
            throw new RangeError("ImageSource 至少需要一個圖片層級");
        }

        const normalized = [...levels].sort((a, b) => b.scale - a.scale);
        const seenScales = new Set<number>();
        for (const level of normalized) {
            if (!Number.isFinite(level.scale) || level.scale <= 0 ||
                (level.url !== undefined && level.url.length === 0) ||
                (level.url === undefined && getTileUrl === undefined)) {
                throw new RangeError("ImageSource 的層級必須有正比例，以及圖片 URL 或 tile API");
            }
            if (seenScales.has(level.scale)) {
                throw new RangeError(`ImageSource 的圖片層級比例重複：${level.scale}`);
            }
            seenScales.add(level.scale);
        }
        this.levels = normalized.map(level => ({ ...level }));
    }

    public async requestRegion(
        request: TiefseeviewImageRegionRequest,
        signal?: AbortSignal
    ): Promise<TiefseeviewImageSourceRegion> {
        this.throwIfUnavailable(signal);
        if (![request.rect.x, request.rect.y, request.rect.width, request.rect.height].every(Number.isFinite) ||
            request.rect.x < 0 || request.rect.y < 0 || request.rect.width <= 0 || request.rect.height <= 0 ||
            request.rect.x + request.rect.width > this.width || request.rect.y + request.rect.height > this.height) {
            throw new RangeError("圖片區域必須是有效的原圖像素範圍");
        }
        const level = this.levels.find(item => item.scale === request.scale);
        if (level === undefined || level.url === undefined) {
            throw new RangeError(`找不到圖片層級：${request.scale}`);
        }

        const bitmap = await this.decodeUrl(level.url, signal);
        try {
            this.throwIfUnavailable(signal);
        } catch (error) {
            bitmap.close();
            throw error;
        }
        return {
            source: bitmap,
            imageRect: { x: 0, y: 0, width: this.width, height: this.height },
            pixelWidth: bitmap.width,
            pixelHeight: bitmap.height,
            scale: level.scale
        };
    }

    public async requestTile(
        request: TiefseeviewImageTileRequest,
        signal?: AbortSignal
    ): Promise<TiefseeviewImageSourceRegion> {
        this.throwIfUnavailable(signal);
        if (this.getTileUrl === undefined) throw new Error("ImageSource 不支援來源格子請求");
        if (![request.tileX, request.tileY, request.scale, request.tileSize, request.gutter].every(Number.isFinite) ||
            !Number.isInteger(request.tileX) || !Number.isInteger(request.tileY) ||
            !Number.isInteger(request.tileSize) || !Number.isInteger(request.gutter) ||
            request.tileX < 0 || request.tileY < 0 || request.tileSize <= 0 || request.tileSize > 2048 || request.gutter < 0 || request.gutter > 16) {
            throw new RangeError("圖片格子參數無效");
        }
        if (!this.levels.some(level => level.scale === request.scale)) {
            throw new RangeError(`找不到圖片層級：${request.scale}`);
        }
        const levelWidth = Math.max(1, Math.round(this.width * request.scale));
        const levelHeight = Math.max(1, Math.round(this.height * request.scale));
        const levelX = request.tileX * request.tileSize;
        const levelY = request.tileY * request.tileSize;
        if (levelX >= levelWidth || levelY >= levelHeight) throw new RangeError("圖片格子超出來源範圍");
        const bitmap = await this.decodeUrl(this.getTileUrl(request), signal);
        try {
            this.throwIfUnavailable(signal);
        } catch (error) {
            bitmap.close();
            throw error;
        }
        const leftGutter = request.tileX === 0 ? 0 : request.gutter;
        const topGutter = request.tileY === 0 ? 0 : request.gutter;
        const expectedWidth = request.tileSize + leftGutter + request.gutter;
        const expectedHeight = request.tileSize + topGutter + request.gutter;
        const rightGutter = bitmap.width < expectedWidth ? 0 : request.gutter;
        const bottomGutter = bitmap.height < expectedHeight ? 0 : request.gutter;
        const contentWidth = bitmap.width - leftGutter - rightGutter;
        const contentHeight = bitmap.height - topGutter - bottomGutter;
        const sourceX = levelX / request.scale;
        const sourceY = levelY / request.scale;
        return {
            source: bitmap,
            imageRect: {
                x: sourceX,
                y: sourceY,
                width: Math.min(contentWidth / request.scale, this.width - sourceX),
                height: Math.min(contentHeight / request.scale, this.height - sourceY)
            },
            pixelWidth: bitmap.width,
            pixelHeight: bitmap.height,
            contentRect: {
                x: leftGutter,
                y: topGutter,
                width: contentWidth,
                height: contentHeight
            },
            scale: request.scale
        };
    }

    public dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        this.worker.removeEventListener("message", this.onWorkerMessage);
        this.worker.removeEventListener("error", this.onWorkerError);
        try { this.worker.postMessage({ type: "dispose" }); } catch { }
        this.worker.terminate();
        for (const [id, pending] of this.pending) {
            pending.signal?.removeEventListener("abort", pending.abort!);
            pending.reject(this.createAbortError("ImageSource 已釋放"));
            this.pending.delete(id);
        }
    }

    public releaseLevel(scale: number): void {
        // ImageBitmap 會在 Renderer 上傳後立即釋放，ImageSource 不保留解碼層級。
    }

    private decodeUrl(url: string, signal?: AbortSignal): Promise<ImageBitmap> {
        this.throwIfUnavailable(signal);
        const id = ++this.nextRequestId;
        return new Promise<ImageBitmap>((resolve, reject) => {
            const pending = { resolve, reject, signal, abort: undefined as (() => void) | undefined };
            pending.abort = () => {
                this.pending.delete(id);
                reject(this.createAbortError());
                try { this.worker.postMessage({ type: "abort", id }); } catch { }
            };
            signal?.addEventListener("abort", pending.abort, { once: true });
            this.pending.set(id, pending);
            try {
                this.worker.postMessage({ type: "decode", id, url });
            } catch (error) {
                this.pending.delete(id);
                signal?.removeEventListener("abort", pending.abort);
                reject(error instanceof Error ? error : new Error(String(error)));
            }
        });
    }

    private onWorkerMessage = (event: MessageEvent): void => {
        const data = event.data as { id: number; bitmap?: ImageBitmap; error?: string };
        const pending = this.pending.get(data.id);
        if (pending === undefined) {
            data.bitmap?.close();
            return;
        }
        this.pending.delete(data.id);
        pending.signal?.removeEventListener("abort", pending.abort!);
        if (data.bitmap !== undefined) pending.resolve(data.bitmap);
        else pending.reject(new Error(data.error || "圖片 Worker 解碼失敗"));
    };

    private onWorkerError = (event: ErrorEvent): void => {
        for (const pending of this.pending.values()) {
            pending.signal?.removeEventListener("abort", pending.abort!);
            pending.reject(new Error(event.message || "圖片 Worker 無法使用"));
        }
        this.pending.clear();
    }

    private throwIfUnavailable(signal?: AbortSignal): void {
        if (this.disposed) throw this.createAbortError("ImageSource 已釋放");
        if (signal?.aborted) throw this.createAbortError();
    }

    private createAbortError(message = "圖片來源請求已取消"): Error {
        return new DOMException(message, "AbortError");
    }
}

