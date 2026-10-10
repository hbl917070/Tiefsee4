import type { TiefseeviewImageRendering, TiefseeviewZoomType } from "../Tiefseeview";
import { getRotateRect } from "./TiefseeviewGeometry";

type ZoomTypes = typeof import("../Tiefseeview").TiefseeviewZoomType;

interface ZoomControllerOptions {
    viewport: HTMLDivElement;
    container: HTMLDivElement;
    zoomTypes: ZoomTypes;
    getOriginalWidth: () => number;
    getOriginalHeight: () => number;
    getCurrentWidth: () => number;
    getDpiZoom: () => number;
    getMargins: () => { top: number; left: number; bottom: number; right: number };
    getDeg: () => number;
    getRendering: () => TiefseeviewImageRendering;
    getZoomRatio: () => number;
    getZoomStep: () => number;
    isLimitMax: () => boolean;
    isLimitMin: () => boolean;
    setZoomType: (type: TiefseeviewZoomType) => void;
    setZoomTypeValue: (value: number) => void;
    setZoomWithWindow: (value: boolean) => void;
    setDataSize: (width: number) => void;
    setXY: (left: number | undefined, top: number | undefined, duration: number) => void | Promise<void>;
    initPoint: (animate: boolean) => void | Promise<void>;
    setRendering: (rendering: TiefseeviewImageRendering, isOnlyRun?: boolean) => void;
    onChangeZoom: (ratio: number) => void;
    toNumber: (value: string | number) => number;
}

/** 管理適合視窗、比例縮放與錨點縮放。 */
export class TiefseeviewZoomController {
    constructor(private readonly options: ZoomControllerOptions) { }

    zoomFull(type: TiefseeviewZoomType, value?: number, x?: number, y?: number) {
        const types = this.options.zoomTypes;
        this.options.setZoomType(type);
        if (value != undefined) { this.options.setZoomTypeValue(value); }
        this.options.setZoomWithWindow(
            type === types.windowWidthRatio || type === types.windowHeightRatio ||
            type === types.fiwWindowWidth || type === types.fitWindowHeight ||
            type === types.fitWindow || type === types.fitWindowOrImageOriginal
        );

        this.options.setDataSize(this.getZoomFullWidth(type, value));
        const left = this.options.toNumber(this.options.container.style.left);
        const top = this.options.toNumber(this.options.container.style.top);
        this.options.setXY(left * 0, top * 0, 0);
        this.options.initPoint(false);
        this.options.onChangeZoom(this.options.getZoomRatio() * this.options.getDpiZoom());
        this.options.setRendering(this.options.getRendering());
    }

    getZoomFullScale(type: TiefseeviewZoomType, value?: number) {
        return this.getZoomFullWidth(type, value) / this.options.getOriginalWidth();
    }

    getZoomFullWidth(type: TiefseeviewZoomType, value?: number) {
        const types = this.options.zoomTypes;
        const margins = this.options.getMargins();
        const dpiZoom = this.options.getDpiZoom();
        const originalWidth = this.options.getOriginalWidth();
        const originalHeight = this.options.getOriginalHeight();
        if (type === undefined) { type = types.fitWindow; }
        if (value === undefined) { value = 100; }
        let width = 1;

        const rect = getRotateRect(originalWidth, originalHeight, 0, 0, this.options.getDeg());
        const rotatedWidth = rect.rectWidth;
        const rotatedHeight = rect.rectHeight;

        if (type === types.fitWindowOrImageOriginal) {
            if (originalWidth / dpiZoom > (this.options.viewport.offsetWidth - margins.left - margins.right) ||
                originalHeight / dpiZoom > (this.options.viewport.offsetHeight - margins.top - margins.bottom)) {
                type = types.fitWindow;
            } else {
                type = types.imageOriginal;
            }
        }
        if (type === types.imageOriginal) {
            width = originalWidth / dpiZoom;
        }
        if (type === types.fitWindow) {
            const ratioW = rotatedWidth / (this.options.viewport.offsetWidth - margins.left - margins.right);
            const ratioH = rotatedHeight / (this.options.viewport.offsetHeight - margins.top - margins.bottom);
            type = ratioW > ratioH ? types.fiwWindowWidth : types.fitWindowHeight;
        }
        if (type === types.fiwWindowWidth) {
            value = 100;
            type = types.windowWidthRatio;
        }
        if (type === types.fitWindowHeight) {
            value = 100;
            type = types.windowHeightRatio;
        }
        if (type === types.windowWidthRatio) {
            let availableWidth = this.options.viewport.offsetWidth - margins.left - margins.right;
            if (availableWidth < 10) { availableWidth = 10; }
            const ratio = originalWidth / rotatedWidth;
            width = availableWidth * ratio * (value / 100);
        }
        if (type === types.windowHeightRatio) {
            let availableHeight = this.options.viewport.offsetHeight - margins.top - margins.bottom;
            if (availableHeight < 10) { availableHeight = 10; }
            const ratio = originalWidth / rotatedWidth;
            const ratioXY = rotatedWidth / rotatedHeight;
            width = availableHeight * ratio * ratioXY * (value / 100);
        }
        if (type === types.imageWidthPx) {
            const ratio = originalWidth / rotatedWidth;
            width = this.options.toNumber(value) * ratio / dpiZoom;
        }
        if (type === types.imageHeightPx) {
            const ratio = originalWidth / rotatedWidth;
            const ratioXY = rotatedWidth / rotatedHeight;
            width = this.options.toNumber(value) * ratio * ratioXY / dpiZoom;
        }
        return width;
    }

    zoomIn(x?: number, y?: number, zoomRatio?: number, rendering?: TiefseeviewImageRendering) {
        const { viewport, container } = this.options;
        if (x === undefined) { x = viewport.offsetWidth / 2; }
        if (y === undefined) { y = viewport.offsetHeight / 2; }
        if (zoomRatio === undefined) { zoomRatio = this.options.getZoomStep(); }
        if (rendering === undefined) { rendering = this.options.getRendering(); }
        this.options.setRendering(rendering, true);

        if (zoomRatio === 1) { return; }
        if (zoomRatio > 1 && this.options.isLimitMax()) { return; }
        if (zoomRatio < 1 && this.options.isLimitMin()) { return; }
        this.options.setDataSize(this.options.getCurrentWidth() * zoomRatio);

        const xFromLeft = x - this.options.toNumber(container.style.left);
        const yFromTop = y - this.options.toNumber(container.style.top);
        const removedWidth = container.offsetWidth - container.offsetWidth / zoomRatio;
        const removedHeight = container.offsetHeight - container.offsetHeight / zoomRatio;
        this.options.setXY(
            this.options.toNumber(container.style.left) - ((xFromLeft / container.offsetWidth) * removedWidth) * zoomRatio,
            this.options.toNumber(container.style.top) - ((yFromTop / container.offsetHeight) * removedHeight) * zoomRatio,
            0
        );
        this.options.initPoint(false);
        this.options.onChangeZoom(this.options.getZoomRatio() * this.options.getDpiZoom());
    }

    zoomOut(x?: number, y?: number, zoomRatio?: number) {
        if (zoomRatio === undefined) { zoomRatio = 1 / this.options.getZoomStep(); }
        this.zoomIn(x, y, zoomRatio);
    }
}
