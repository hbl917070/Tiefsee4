import { TiefseeviewDomMediaRenderer } from "./TiefseeviewDomMediaRenderer";
import type { TiefseeviewZoomType } from "../Tiefseeview";

export interface TiefseeviewScaleImage {
    scale: number;
    url: string;
}

export type TiefseeviewScaleImageItem = TiefseeviewScaleImage;

export interface TiefseeviewMediaLoaderOptions {
    domImg: HTMLImageElement;
    domBigimgCanvas: HTMLCanvasElement;
    domVideo: HTMLVideoElement;
    mediaRenderer: TiefseeviewDomMediaRenderer;
    getUrl: () => string;
    setUrl: (url: string) => void;
    setOriginalSize: (width: number, height: number) => void;
    setVideoDuration: (duration: number) => void;
    setDisplaySizeInitialized: (value: boolean) => void;
    getErrorUrl: () => string;
    getZoomFullWidth: (type: TiefseeviewZoomType, value: number) => number;
    getRenderScale: (width: number) => number;
    setDataSize: (width: number) => void;
    urlToCanvas: (url: string) => HTMLCanvasElement;
    resetBigimgCache: () => void;
    resetDrawImage: () => void;
    setTempCanvas: (canvas: HTMLCanvasElement) => void;
    setScaleImageCanvas: (scale: number, canvas: HTMLCanvasElement) => void;
    resetScaleImageCache: (initialScale: number) => void;
    clipFull: () => void;
}

/** 載入 DOM 圖片、舊 Canvas 大圖與原生影片，保留原有載入順序。 */
export class TiefseeviewMediaLoader {
    private static readonly videoLoadTimeoutMs = 15_000;
    private tempImg?: HTMLImageElement;
    private scaleImages: TiefseeviewScaleImage[] = [];
    private pendingVideoLoadCancel: (() => void) | null = null;

    constructor(private readonly options: TiefseeviewMediaLoaderOptions) { }

    public getScaleImageItem(scale: number): TiefseeviewScaleImageItem {
        let ret = this.scaleImages[0]!;
        for (let i = this.scaleImages.length - 1; i >= 0; i--) {
            const item = this.scaleImages[i];
            if (item.scale >= scale) {
                ret = item;
                break;
            }
        }
        return ret;
    }

    public async preloadImg(url: string, isInitSize: undefined | boolean = true): Promise<boolean> {
        const img = document.createElement("img");
        img.fetchPriority = "high";
        const loaded = await new Promise<boolean>(resolve => {
            img.addEventListener("load", () => {
                if (isInitSize) this.options.setOriginalSize(img.naturalWidth, img.naturalHeight);
                resolve(true);
            });
            img.addEventListener("error", () => {
                if (isInitSize) this.options.setOriginalSize(1, 1);
                resolve(false);
            });
            img.src = url;
        });
        this.tempImg = img;
        return loaded;
    }

    public async loadNone(): Promise<boolean | undefined> {
        return this.loadBigimg("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
    }

    /** 換來源時取消尚未完成的影片載入，並卸載舊影片以免它稍後開始播放。 */
    public cancelVideoLoad(): void {
        const video = this.options.domVideo;
        this.pendingVideoLoadCancel?.();
        this.pendingVideoLoadCancel = null;
        video.onloadedmetadata = null;
        video.pause();
        if (video.hasAttribute("src")) {
            video.removeAttribute("src");
            video.load();
        }
    }

    public async loadVideo(url: string): Promise<boolean | undefined> {
        this.cancelVideoLoad();
        const video = this.options.domVideo;
        this.options.setUrl(url);
        video.onloadedmetadata = () => {
            if (video.videoWidth > 0 && video.videoHeight > 0) {
                void video.play().catch(() => { });
            }
        };

        const loaded = await new Promise<boolean | undefined>(resolve => {
            let isSettled = false;
            let timeoutId: number | null = null;
            let cancelLoad: () => void;
            const clearEvent = () => {
                video.removeEventListener("loadeddata", onLoadedData);
                video.removeEventListener("error", onError);
                if (timeoutId !== null) {
                    window.clearTimeout(timeoutId);
                    timeoutId = null;
                }
            };
            const finish = (result: boolean | undefined) => {
                if (isSettled) return;
                isSettled = true;
                clearEvent();
                if (this.pendingVideoLoadCancel === cancelLoad) {
                    this.pendingVideoLoadCancel = null;
                }
                resolve(result);
            };
            cancelLoad = () => finish(undefined);
            const onLoadedData = () => {
                // 音訊軌可能可播放，但若沒有成功辨識出影像軌，影片區會是黑畫面。
                const hasVideoFrame = video.videoWidth > 0 && video.videoHeight > 0;
                if (hasVideoFrame === false) {
                    const error = video.error;
                    console.warn("Video loaded without a decoded video frame", {
                        width: video.videoWidth,
                        height: video.videoHeight,
                        code: error?.code,
                        message: error?.message,
                    });
                }
                finish(hasVideoFrame);
            };
            const onError = () => {
                const error = video.error;
                console.warn("Video loading failed", { code: error?.code, message: error?.message });
                finish(false);
            };
            this.pendingVideoLoadCancel = cancelLoad;
            video.addEventListener("loadeddata", onLoadedData, { once: true });
            video.addEventListener("error", onError, { once: true });
            timeoutId = window.setTimeout(() => {
                console.warn("Video loading timed out");
                finish(false);
            }, TiefseeviewMediaLoader.videoLoadTimeoutMs);
            video.src = url;
        });

        if (loaded === undefined || this.options.getUrl() !== url) return;
        if (loaded) {
            this.options.mediaRenderer.setDataType("video");
            this.options.setOriginalSize(video.videoWidth, video.videoHeight);
            this.options.setVideoDuration(isNaN(video.duration) ? -1 : video.duration);
            this.options.clipFull();
            return true;
        }

        video.pause();
        video.removeAttribute("src");
        video.load();
        this.options.setVideoDuration(-1);
        this.options.setOriginalSize(1, 1);
        this.options.mediaRenderer.setDataType("img");
        const errorUrl = this.options.getErrorUrl();
        await this.preloadImg(errorUrl);
        this.options.domImg.src = errorUrl;
        return false;
    }

    public async loadImg(url: string): Promise<boolean> {
        this.cancelVideoLoad();
        this.options.setUrl(url);
        const loaded = await this.preloadImg(url);
        this.options.mediaRenderer.setDataType("img");
        if (loaded === false) {
            const errorUrl = this.options.getErrorUrl();
            await this.preloadImg(errorUrl);
            this.options.domImg.src = errorUrl;
            return false;
        }

        const context = this.options.domBigimgCanvas.getContext("2d") as CanvasRenderingContext2D;
        context.clearRect(0, 0, this.options.domBigimgCanvas.width, this.options.domBigimgCanvas.height);
        this.options.domImg.src = url;
        this.options.clipFull();
        return true;
    }

    public async loadBigimg(url: string): Promise<boolean> {
        this.cancelVideoLoad();
        this.options.setUrl(url);
        this.options.setDisplaySizeInitialized(false);
        const loaded = await this.preloadImg(url);
        this.options.mediaRenderer.setDataType("bigimg");
        if (loaded === false) {
            this.options.mediaRenderer.setDataType("img");
            const errorUrl = this.options.getErrorUrl();
            await this.preloadImg(errorUrl);
            this.options.domImg.src = errorUrl;
            return false;
        }

        this.options.resetBigimgCache();
        this.options.resetDrawImage();
        this.options.domImg.src = url;
        this.options.setTempCanvas(this.options.urlToCanvas(url));
        this.options.clipFull();
        return true;
    }

    public async loadBigimgscale(
        images: TiefseeviewScaleImage[],
        width: number,
        height: number,
        zoomType: TiefseeviewZoomType,
        zoomValue: number
    ): Promise<boolean> {
        this.cancelVideoLoad();
        this.options.setOriginalSize(width, height);
        this.scaleImages = images;
        const url = images[0].url;
        this.options.setUrl(url);
        this.options.setDisplaySizeInitialized(false);

        const zoomWidth = this.options.getZoomFullWidth(zoomType, zoomValue);
        const scale = this.options.getRenderScale(zoomWidth);
        const imageItem = this.getScaleImageItem(scale);
        this.options.mediaRenderer.setDataType("bigimgscale");
        const loaded = await this.preloadImg(imageItem.url, false);
        if (loaded === false) {
            this.options.mediaRenderer.setDataType("img");
            const errorUrl = this.options.getErrorUrl();
            await this.preloadImg(errorUrl);
            this.options.domImg.src = errorUrl;
            return false;
        }

        this.options.resetScaleImageCache(imageItem.scale);
        this.options.setScaleImageCanvas(imageItem.scale, this.options.urlToCanvas(imageItem.url));
        this.options.setDataSize(zoomWidth);
        this.options.resetDrawImage();
        this.options.clipFull();
        return true;
    }
}
