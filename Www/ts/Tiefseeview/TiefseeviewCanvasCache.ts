import { Lib } from "../Lib";
import type { TiefseeviewCanvasDrawInfo } from "./TiefseeviewCanvasRenderer";
import type { TiefseeviewMediaType } from "./TiefseeviewDomMediaRenderer";
import type { TiefseeviewScaleImageItem } from "./TiefseeviewMediaLoader";

export interface TiefseeviewCanvasCacheItem {
    img: HTMLCanvasElement | HTMLImageElement | ImageBitmap | undefined;
    scale: number;
}

interface CanvasCacheOptions {
    canvas: HTMLCanvasElement;
    getDataType: () => TiefseeviewMediaType;
    getScale: () => number;
    getBaseCanvas: () => HTMLCanvasElement | undefined;
    getScaleImageItem: () => TiefseeviewScaleImageItem;
    getUrl: () => string;
    getDrawInfo: () => TiefseeviewCanvasDrawInfo;
    getSharpenValue: () => number;
    draw: (immediately?: boolean) => void;
}

/** 管理舊 Canvas 路徑的縮放快取、縮圖 Worker 與銳化 Worker。 */
export class TiefseeviewCanvasCache {
    private worker!: Worker;
    private bigimgCache: (undefined | HTMLCanvasElement | ImageBitmap)[] = [];
    private bigimgScaleCache: { [key: number]: HTMLCanvasElement | undefined } = {};
    private bigimgScaleCacheKeys: number[] = [];
    public readonly debouncedSharpening: () => void;

    constructor(private readonly options: CanvasCacheOptions) {
        this.debouncedSharpening = Lib.debounce(() => {
            const sharpenValue = this.options.getSharpenValue();
            if (sharpenValue === 0) { return; }
            if (this.options.canvas.width <= 10 || this.options.canvas.height <= 10) { return; }

            const offscreenCanvas = new OffscreenCanvas(this.options.canvas.width, this.options.canvas.height);
            const ctx = offscreenCanvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
            ctx.drawImage(this.options.canvas, 0, 0);
            const imageBitmap = offscreenCanvas.transferToImageBitmap();
            const drawInfo = this.options.getDrawInfo();
            if (drawInfo.isSharpen === false) {
                this.worker.postMessage({
                    type: "sharpen",
                    blur: 0.5,
                    sharpen: sharpenValue,
                    imageBitmap,
                    tempDrawImage: drawInfo
                }, [imageBitmap]);
                drawInfo.isSharpen = true;
            }
        }, 100);

        try {
            this.worker = new Worker("./js/TiefseeviewWorker.js");
            this.worker.addEventListener("message", (e) => this.onWorkerMessage(e), false);
        } catch (e) {
            console.log("Worker 載入失敗，無法使用「bigimgscale」");
        }
    }

    resetBigimgCache() {
        this.bigimgCache = [];
    }

    resetScaleImageCache(initialScale: number) {
        this.bigimgScaleCache = {};
        this.bigimgScaleCacheKeys = [initialScale];
    }

    setScaleImageCanvas(scale: number, canvas: HTMLCanvasElement) {
        this.bigimgScaleCache[scale] = canvas;
    }

    getScaleImageCanvas(scale: number) {
        return this.bigimgScaleCache[scale];
    }

    getCanvasZoom(img: HTMLCanvasElement | HTMLImageElement | ImageBitmap, zoom: number, quality: "high" | "low" | "medium") {
        const width = Math.floor(img.width * zoom);
        const height = Math.floor(img.height * zoom);
        const canvas = document.createElement("canvas");
        if (width <= 0 || height <= 0) { return canvas; }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.imageSmoothingQuality = quality;
        ctx.drawImage(img, 0, 0, width, height);
        return canvas;
    }

    getBigimgTemp(): TiefseeviewCanvasCacheItem | null {
        if (this.options.getDataType() === "bigimgscale") {
            return this.getBigimgScaleTemp();
        }
        if (this.options.getDataType() === "bigimg") {
            return this.getBigimgTempImage();
        }
        return null;
    }

    private getBigimgTempImage(): TiefseeviewCanvasCacheItem {
        const reduction = 0.8;
        const maxLevels = 6;
        const scale = this.options.getScale();
        if (scale > 0.5) {
            return { img: this.options.getBaseCanvas(), scale: 1 };
        }
        if (this.bigimgCache[0] === undefined) {
            this.bigimgCache[0] = this.getCanvasZoom(this.options.getBaseCanvas()!, reduction, "medium");
        }
        for (let i = 1; i < maxLevels; i++) {
            if (this.bigimgCache[i] === undefined) {
                const previous = this.bigimgCache[i - 1] as HTMLCanvasElement | HTMLImageElement | ImageBitmap;
                this.bigimgCache[i] = this.getCanvasZoom(previous, reduction, "medium");
            }
            if (Math.pow(reduction, i + 2) < scale) {
                return { img: this.bigimgCache[i], scale: Math.pow(reduction, i + 1) };
            }
        }
        return {
            img: this.bigimgCache[this.bigimgCache.length - 1],
            scale: Math.pow(reduction, this.bigimgCache.length)
        };
    }

    private getBigimgScaleTemp(): TiefseeviewCanvasCacheItem {
        const nowItem = this.options.getScaleImageItem();
        if (this.bigimgScaleCache[nowItem.scale] != undefined) {
            return { img: this.bigimgScaleCache[nowItem.scale], scale: nowItem.scale };
        }

        if (this.bigimgScaleCacheKeys.indexOf(nowItem.scale) === -1) {
            this.worker.postMessage({
                type: "loadImage",
                url: nowItem.url,
                tempUrl: this.options.getUrl(),
                scale: nowItem.scale,
            });
        }
        this.bigimgScaleCacheKeys.push(nowItem.scale);

        const keys = Object.keys(this.bigimgScaleCache);
        let scale = Number(keys[0]);
        for (let i = 0; i < keys.length; i++) {
            const key = Number(keys[i]);
            if (key >= scale && key <= nowItem.scale) { scale = key; }
        }
        return { img: this.bigimgScaleCache[scale], scale };
    }

    private onWorkerMessage(e: MessageEvent) {
        const type = e.data.type;
        if (type === "loadImage") {
            const tempUrl = e.data.tempUrl;
            const scale = e.data.scale;
            const domImg = e.data.img as ImageBitmap;
            if (tempUrl !== this.options.getUrl()) {
                domImg.close();
                return;
            }
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
            canvas.width = domImg.width;
            canvas.height = domImg.height;
            ctx.drawImage(domImg, 0, 0, domImg.width, domImg.height);
            domImg.close();
            this.bigimgScaleCache[scale] = canvas;
            this.options.draw(true);
        }
        if (type === "sharpen") {
            const imageBitmap = e.data.imageBitmap as ImageBitmap;
            const drawInfo = e.data.tempDrawImage as TiefseeviewCanvasDrawInfo;
            const current = this.options.getDrawInfo();
            if (drawInfo.scale === current.scale &&
                drawInfo.sx === current.sx &&
                drawInfo.sy === current.sy &&
                drawInfo.sWidth === current.sWidth &&
                drawInfo.sHeight === current.sHeight &&
                drawInfo.dx === current.dx &&
                drawInfo.dy === current.dy &&
                drawInfo.dWidth === current.dWidth &&
                drawInfo.dHeight === current.dHeight &&
                drawInfo.url === current.url) {
                const ctx = this.options.canvas.getContext("2d") as CanvasRenderingContext2D;
                ctx.drawImage(imageBitmap, 0, 0, imageBitmap.width, imageBitmap.height);
            }
            imageBitmap.close();
        }
    }
}
