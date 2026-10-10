import type { TiefseeviewImageRect } from "./TiefseeviewTypes";

export interface TiefseeviewImageLevel {
    /** 此層影像相對於原圖的寬高比例；原始解析度為 1。 */
    scale: number;
    url: string;
}

export interface TiefseeviewImageRegionRequest {
    /** 以原圖像素表示的請求區域。整圖來源可回傳整張影像。 */
    rect: TiefseeviewImageRect;
    /** 要求的來源層級比例。 */
    scale: number;
}

export interface TiefseeviewImageSourceRegion {
    /** 可供 Canvas 或 WebGL 上傳的影像；其生命週期由 ImageSource 管理。 */
    source: CanvasImageSource;
    /** 回傳影像在原圖座標中實際涵蓋的範圍。 */
    imageRect: TiefseeviewImageRect;
    pixelWidth: number;
    pixelHeight: number;
    scale: number;
}

/**
 * 靜態圖片來源合約。來源負責解碼、取消請求及管理回傳影像的生命週期；
 * Renderer 不可自行關閉來源持有的 ImageBitmap 或清除來源 URL。
 */
export interface TiefseeviewImageSource {
    readonly width: number;
    readonly height: number;
    readonly levels: readonly TiefseeviewImageLevel[];
    requestRegion(
        request: TiefseeviewImageRegionRequest,
        signal?: AbortSignal
    ): Promise<TiefseeviewImageSourceRegion>;
    dispose(): void;
}

/**
 * 將現有完整圖片 URL 或 arUrl 多解析度 URL 包成 ImageSource。
 * 本適配器回傳整個解析度層級；後端按區域取圖留給後續的來源實作。
 */
export class TiefseeviewUrlImageSource implements TiefseeviewImageSource {
    public readonly levels: readonly TiefseeviewImageLevel[];
    private readonly loadedImages = new Map<number, HTMLImageElement>();
    private readonly pendingLoads = new Map<number, {
        promise: Promise<HTMLImageElement>;
        cancel: () => void;
        waiters: number;
    }>();
    private disposed = false;

    constructor(
        public readonly width: number,
        public readonly height: number,
        levels: readonly TiefseeviewImageLevel[]
    ) {
        if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
            throw new RangeError("ImageSource 的原圖尺寸必須是正數");
        }
        if (levels.length === 0) {
            throw new RangeError("ImageSource 至少需要一個圖片層級");
        }

        const normalized = [...levels].sort((a, b) => b.scale - a.scale);
        const seenScales = new Set<number>();
        for (const level of normalized) {
            if (!Number.isFinite(level.scale) || level.scale <= 0 || level.url.length === 0) {
                throw new RangeError("ImageSource 的圖片層級必須有正比例與 URL");
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
        if (level === undefined) {
            throw new RangeError(`找不到圖片層級：${request.scale}`);
        }

        const image = await this.loadLevel(level, signal);
        this.throwIfUnavailable(signal);
        return {
            source: image,
            imageRect: { x: 0, y: 0, width: this.width, height: this.height },
            pixelWidth: image.naturalWidth,
            pixelHeight: image.naturalHeight,
            scale: level.scale
        };
    }

    public dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        for (const pending of this.pendingLoads.values()) pending.cancel();
        this.pendingLoads.clear();
        for (const image of this.loadedImages.values()) image.removeAttribute("src");
        this.loadedImages.clear();
    }

    private loadLevel(level: TiefseeviewImageLevel, signal?: AbortSignal): Promise<HTMLImageElement> {
        const loaded = this.loadedImages.get(level.scale);
        if (loaded !== undefined) {
            return signal?.aborted ? Promise.reject(this.createAbortError()) : Promise.resolve(loaded);
        }

        if (this.pendingLoads.has(level.scale) === false) {
            const image = new Image();
            let resolveLoad!: (image: HTMLImageElement) => void;
            let rejectLoad!: (error: Error) => void;
            const promise = new Promise<HTMLImageElement>((resolve, reject) => {
                resolveLoad = resolve;
                rejectLoad = reject;
            });
            const cleanup = () => {
                image.removeEventListener("load", onLoad);
                image.removeEventListener("error", onError);
            };
            const onLoad = () => {
                cleanup();
                this.pendingLoads.delete(level.scale);
                if (this.disposed) {
                    image.removeAttribute("src");
                    rejectLoad(this.createAbortError("ImageSource 已釋放"));
                    return;
                }
                this.loadedImages.set(level.scale, image);
                resolveLoad(image);
            };
            const onError = () => {
                cleanup();
                this.pendingLoads.delete(level.scale);
                rejectLoad(new Error("圖片來源載入失敗"));
            };
            let pending!: { promise: Promise<HTMLImageElement>; cancel: () => void; waiters: number };
            const cancel = () => {
                cleanup();
                image.removeAttribute("src");
                if (this.pendingLoads.get(level.scale) === pending) {
                    this.pendingLoads.delete(level.scale);
                }
                rejectLoad(this.createAbortError("ImageSource 已釋放"));
            };
            pending = { promise, cancel, waiters: 0 };
            this.pendingLoads.set(level.scale, pending);
            image.addEventListener("load", onLoad, { once: true });
            image.addEventListener("error", onError, { once: true });
            image.src = level.url;
        }

        const current = this.pendingLoads.get(level.scale);
        if (current === undefined) {
            return promiseFor(this.loadedImages.get(level.scale));
        }
        return this.waitForPending(level.scale, current, signal);
    }

    private waitForPending(
        scale: number,
        pending: { promise: Promise<HTMLImageElement>; cancel: () => void; waiters: number },
        signal?: AbortSignal
    ): Promise<HTMLImageElement> {
        if (signal?.aborted) return Promise.reject(this.createAbortError());
        pending.waiters++;
        return new Promise<HTMLImageElement>((resolve, reject) => {
            let settled = false;
            const cleanup = () => signal?.removeEventListener("abort", onAbort);
            const release = () => {
                pending.waiters--;
                if (pending.waiters === 0 && this.pendingLoads.get(scale) === pending) {
                    pending.cancel();
                }
            };
            const onAbort = () => {
                if (settled) return;
                settled = true;
                cleanup();
                release();
                reject(this.createAbortError());
            };
            signal?.addEventListener("abort", onAbort, { once: true });
            pending.promise.then(value => {
                if (settled) return;
                settled = true;
                cleanup();
                release();
                resolve(value);
            }, error => {
                if (settled) return;
                settled = true;
                cleanup();
                release();
                reject(error);
            });
        });
    }

    private throwIfUnavailable(signal?: AbortSignal): void {
        if (this.disposed) throw this.createAbortError("ImageSource 已釋放");
        if (signal?.aborted) throw this.createAbortError();
    }

    private createAbortError(message = "圖片來源請求已取消"): Error {
        return new DOMException(message, "AbortError");
    }
}

function promiseFor<T>(value: T | undefined): Promise<T> {
    return value === undefined ? Promise.reject(new Error("圖片來源載入失敗")) : Promise.resolve(value);
}

