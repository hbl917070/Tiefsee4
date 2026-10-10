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
    private tempImg?: HTMLImageElement;
    private scaleImages: TiefseeviewScaleImage[] = [];

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

    public async loadVideo(url: string): Promise<boolean | undefined> {
        const video = this.options.domVideo;
        this.options.setUrl(url);
        video.onloadedmetadata = () => { video.play(); };

        const loaded = await new Promise<boolean>(resolve => {
            const clearEvent = () => {
                video.removeEventListener("loadedmetadata", onLoadedMetadata);
                video.removeEventListener("error", onError);
            };
            const onLoadedMetadata = () => { clearEvent(); resolve(true); };
            const onError = () => { clearEvent(); resolve(false); };
            video.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
            video.addEventListener("error", onError, { once: true });
            video.src = url;
        });

        if (this.options.getUrl() !== url) return;
        if (loaded) {
            this.options.mediaRenderer.setDataType("video");
            this.options.setOriginalSize(video.videoWidth, video.videoHeight);
            this.options.setVideoDuration(isNaN(video.duration) ? -1 : video.duration);
            this.options.clipFull();
            return true;
        }

        this.options.setVideoDuration(-1);
        this.options.setOriginalSize(1, 1);
        this.options.mediaRenderer.setDataType("img");
        const errorUrl = this.options.getErrorUrl();
        await this.preloadImg(errorUrl);
        this.options.domImg.src = errorUrl;
        return false;
    }

    public async loadImg(url: string): Promise<boolean> {
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
