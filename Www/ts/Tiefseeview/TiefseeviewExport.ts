import type { TiefseeviewMediaType } from "./TiefseeviewDomMediaRenderer";

export type TiefseeviewExportQuality = "high" | "low" | "medium";

export interface TiefseeviewExportOptions {
    getCanvas: () => Promise<HTMLCanvasElement | null>;
    getCanvasZoom: (image: HTMLCanvasElement | HTMLImageElement | ImageBitmap, zoom: number, quality: TiefseeviewExportQuality) => HTMLCanvasElement;
    getDataType: () => TiefseeviewMediaType;
}

/** 保留 Tiefseeview 原有的 Canvas 匯出行為。 */
export class TiefseeviewExport {
    constructor(private readonly options: TiefseeviewExportOptions) { }

    public async getCanvasBase64(zoom: number, quality: TiefseeviewExportQuality): Promise<string> {
        const blob = await this.getCanvasBlob(zoom, quality);
        if (blob == null) return "";
        return await this.blobToBase64(blob) as string;
    }

    public async getCanvasBlob(zoom: number, quality: TiefseeviewExportQuality, type = "png", q = 0.8): Promise<Blob | null> {
        const sourceCanvas = await this.options.getCanvas();
        if (sourceCanvas == null) return null;
        let exportCanvas = zoom < 1
            ? this.options.getCanvasZoom(sourceCanvas, zoom, quality)
            : sourceCanvas;

        let blob: Blob | null = null;
        await new Promise(resolve => {
            let outputType = "image/png";
            if (this.options.getDataType() === "video") outputType = "image/jpeg";
            if (type === "webp") outputType = "image/webp";
            if (type === "jpg" || type === "jpeg") {
                outputType = "image/jpeg";
                const canvasNew = document.createElement("canvas");
                const ctx = canvasNew.getContext("2d") as CanvasRenderingContext2D;
                canvasNew.width = exportCanvas.width;
                canvasNew.height = exportCanvas.height;
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
                ctx.drawImage(exportCanvas, 0, 0, exportCanvas.width, exportCanvas.height);
                exportCanvas = canvasNew;
            }
            const outputCanvas = exportCanvas;
            outputCanvas.toBlob(result => {
                blob = result;
                resolve(true);
            }, outputType, q);
        });
        return blob;
    }

    private blobToBase64(blob: Blob): Promise<string | ArrayBuffer | null> {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }
}
