import Hammer from "hammerjs";
import type { TiefseeviewImageRendering } from "../Tiefseeview";

interface InputOptions {
    viewport: HTMLDivElement;
    container: HTMLDivElement;
    getPosition: () => { left: number; top: number };
    getMargins: () => { top: number; left: number; bottom: number; right: number };
    getOverflowDistance: () => number;
    hasOverflowX: () => boolean;
    hasOverflowY: () => boolean;
    getDeg: () => number;
    getRotateCriticalValue: () => number;
    setDeg: (deg: number, x: number, y: number, animate: boolean) => void;
    setDegForward: (x: number, y: number, animate: boolean) => void;
    setDegReverse: (x: number, y: number, animate: boolean) => void;
    getRendering: () => TiefseeviewImageRendering;
    setRendering: (rendering: TiefseeviewImageRendering) => void;
    zoomIn: (x?: number, y?: number, ratio?: number, rendering?: TiefseeviewImageRendering) => void;
    zoomOut: (x?: number, y?: number, ratio?: number) => void;
    setXY: (left: number | undefined, top: number | undefined, duration: number) => void | Promise<void>;
    initPoint: (animate: boolean) => void | Promise<void>;
    stopAnimation: () => void;
    setTempZoomWithWindow: (value: boolean) => void;
    getTouchpadGestures: () => boolean;
    getEventMouseWheel: () => (type: "up" | "down", e: WheelEvent, x: number, y: number) => void;
    setIsPinching: (value: boolean) => void;
    findDifference: (value: number) => number;
    pixelatedRendering: TiefseeviewImageRendering;
}

/** 管理 Tiefseeview 的滑鼠、觸控、觸控板輸入與手勢狀態。 */
export class TiefseeviewInputController {
    private readonly hammerPan: HammerManager;
    private readonly hammerPlural: HammerManager;
    private panStartX = 0;
    private panStartY = 0;
    private isMoving = false;
    private isPaning = false;
    private rotateStartDegValue = 0;
    private touchRotateStarting = false;
    private rotateStartDegNow = 0;
    private pinchZoom = 1;
    private touchPadTime = 0;

    constructor(private readonly options: InputOptions) {
        this.hammerPan = new Hammer(options.viewport);
        this.hammerPlural = new Hammer.Manager(options.viewport);
        const pinch = new Hammer.Pinch();
        const rotate = new Hammer.Rotate();
        rotate.recognizeWith(pinch);
        this.hammerPlural.add([pinch, rotate]);
        this.bindRotate();
        this.bindPinch();
        this.bindWheel();
        this.bindDragStart();
        this.bindPan();
    }

    private bindRotate() {
        this.hammerPlural.on("rotatestart", (e) => {
            this.rotateStartDegNow = this.options.getDeg();
            this.rotateStartDegValue = e.rotation - this.options.getDeg();
            this.touchRotateStarting = false;
        });
        this.hammerPlural.on("rotate", (e) => {
            let deg = e.rotation - this.rotateStartDegValue;
            if (this.touchRotateStarting === false) {
                if (Math.abs(this.rotateStartDegNow - Math.abs(deg)) > this.options.getRotateCriticalValue()) {
                    this.rotateStartDegValue -= (this.rotateStartDegNow - deg);
                    deg += (this.rotateStartDegNow - deg);
                    this.touchRotateStarting = true;
                }
            }
            if (this.touchRotateStarting) {
                this.options.setDeg(deg, e.center.x, e.center.y, false);
            }
        });
        this.hammerPlural.on("rotateend", (e) => {
            this.touchRotateStarting = false;
            const remainder = this.options.getDeg() % 90;
            if (remainder === 0) { return; }
            if (remainder > 45 || (remainder < 0 && remainder > -45)) {
                this.options.setDegForward(e.center.x, e.center.y, true);
            } else {
                this.options.setDegReverse(e.center.x, e.center.y, true);
            }
        });
    }

    private bindPinch() {
        this.hammerPlural.on("pinchstart", () => {
            this.options.setIsPinching(true);
            this.pinchZoom = 1;
            this.options.setTempZoomWithWindow(false);
        });
        this.hammerPlural.on("pinch", (e) => {
            requestAnimationFrame(() => {
                this.options.zoomIn(e.center.x, e.center.y, e.scale / this.pinchZoom, this.options.pixelatedRendering);
                this.pinchZoom = e.scale;
            });
        });
        this.hammerPlural.on("pinchend", () => {
            this.options.setIsPinching(false);
            this.options.setRendering(this.options.getRendering());
        });
    }

    private bindWheel() {
        this.options.viewport.addEventListener("wheel", (e: WheelEvent) => {
            e.preventDefault();
            if (e.target !== this.options.viewport) { return; }
            this.options.setTempZoomWithWindow(false);
            this.options.stopAnimation();
            // wheelDeltaY 已過時，但目前仍用於辨識 Windows 實體滑鼠滾輪。
            // @ts-ignore
            let wheelDeltaY = e.wheelDeltaY;

            let isTouchPad: boolean;
            if (this.options.getTouchpadGestures() === false) {
                isTouchPad = false;
            } else if (e.deltaX !== 0) {
                isTouchPad = true;
            } else if (window.zoomFactor && wheelDeltaY) {
                let dy = Math.abs(wheelDeltaY * window.zoomFactor);
                dy = dy > 120 ? dy % 120 : dy;
                isTouchPad = Math.abs(120 - dy) >= 2;
            } else if (window.zoomFactor) {
                let dy = Math.abs(e.deltaY * window.zoomFactor) / 33.33333333;
                isTouchPad = this.options.findDifference(dy) >= 0.00001;
            } else {
                isTouchPad = false;
            }

            if (isTouchPad || this.touchPadTime + 200 > new Date().getTime()) {
                this.touchPadTime = new Date().getTime();
                requestAnimationFrame(() => {
                    if (e.ctrlKey === true) {
                        if (e.deltaY > 0) { this.options.zoomOut(e.offsetX, e.offsetY); }
                        else if (e.deltaY < 0) { this.options.zoomIn(e.offsetX, e.offsetY); }
                    } else {
                        let posX = e.deltaX;
                        let posY = e.deltaY;
                        if (e.deltaMode === 2) {
                            posX = Math.sign(posX) * 100;
                            posY = Math.sign(posY) * 100;
                        }
                        const position = this.options.getPosition();
                        this.options.setXY(position.left - posX, position.top - posY, 0);
                        this.options.initPoint(false);
                    }
                });
            } else {
                if (e.deltaX < 0 || e.deltaY < 0) {
                    this.options.getEventMouseWheel()("up", e, e.offsetX, e.offsetY);
                } else {
                    this.options.getEventMouseWheel()("down", e, e.offsetX, e.offsetY);
                }
            }
        }, true);
    }

    private bindDragStart() {
        this.options.viewport.addEventListener("mousedown", (e) => {
            e.preventDefault();
            if (this.options.hasOverflowX() === false && this.options.hasOverflowY() === false) {
                this.options.viewport.dispatchEvent(new PointerEvent("pointerup", {
                    pointerId: 1, bubbles: true, pointerType: "mouse",
                }));
                return;
            }
            if (e.target !== this.options.viewport) {
                this.isMoving = false;
                this.isPaning = false;
                return;
            }
            this.startMoving();
        });
        this.options.viewport.addEventListener("touchstart", (e) => {
            e.preventDefault();
            if (e.touches.length > 1 || e.target !== this.options.viewport) {
                this.isMoving = false;
                this.isPaning = false;
                return;
            }
            this.startMoving();
        });
    }

    private startMoving() {
        this.isMoving = true;
        this.isPaning = true;
        this.options.stopAnimation();
        const position = this.options.getPosition();
        this.panStartX = position.left;
        this.panStartY = position.top;
    }

    private bindPan() {
        this.hammerPan.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_ALL });
        this.hammerPan.on("pan", (e) => {
            requestAnimationFrame(() => {
                if (e.maxPointers > 1) {
                    this.isMoving = false;
                    this.isPaning = false;
                    return;
                }
                if (this.options.hasOverflowX() === false && this.options.hasOverflowY() === false) { return; }
                if (this.isMoving === false) { return; }
                const margins = this.options.getMargins();
                const distance = this.options.getOverflowDistance();
                const viewport = this.options.viewport;
                const container = this.options.container;
                let left = this.panStartX + e.deltaX;
                let top = this.panStartY + e.deltaY;
                if (this.options.hasOverflowY()) {
                    if (top > margins.top + distance) { top = margins.top + distance; }
                    let minTop = viewport.offsetHeight - container.offsetHeight - margins.bottom;
                    if (top < minTop - distance) { top = minTop - distance; }
                } else {
                    let centerTop = (viewport.offsetHeight - container.offsetHeight) / 2;
                    if (top > centerTop + distance) { top = centerTop + distance; }
                    if (top < centerTop - distance) { top = centerTop - distance; }
                }
                if (this.options.hasOverflowX()) {
                    if (left > margins.left + distance) { left = margins.left + distance; }
                    let minLeft = viewport.offsetWidth - container.offsetWidth - margins.right;
                    if (left < minLeft - distance) { left = minLeft - distance; }
                } else {
                    let centerLeft = (viewport.offsetWidth - container.offsetWidth) / 2;
                    if (left > centerLeft + distance) { left = centerLeft + distance; }
                    if (left < centerLeft - distance) { left = centerLeft - distance; }
                }
                this.options.setXY(left, top, 0);
            });
        });
        this.hammerPan.on("panend", async (e) => {
            if (e.maxPointers > 1 || this.isMoving === false) { return; }
            this.isMoving = false;
            this.isPaning = true;
            let velocity = e.velocity;
            let velocityX = e.velocityX;
            let velocityY = e.velocityY;
            if (e.pointerType == "touch") {
                velocity *= 2;
                velocityX *= 2;
                velocityY *= 2;
            }
            let duration = 150 + 100 * Math.abs(velocity);
            if (duration > 1200) duration = 1200;
            this.options.stopAnimation();
            if (Math.abs(velocity) < 1) {
                velocity = 0;
                velocityX = 0;
                velocityY = 0;
                duration = 10;
                this.options.initPoint(true);
                this.isPaning = false;
                return;
            }

            const margins = this.options.getMargins();
            const distance = this.options.getOverflowDistance();
            const viewport = this.options.viewport;
            const container = this.options.container;
            const position = this.options.getPosition();
            let top = position.top + velocityY * 150;
            let left = position.left + velocityX * 150;
            let hasOverflowX = false;
            let hasOverflowY = false;
            if (this.options.hasOverflowY()) {
                if (top > margins.top + distance) { top = margins.top + distance; hasOverflowX = true; }
                let minTop = viewport.offsetHeight - container.offsetHeight - margins.bottom;
                if (top < minTop - distance) { top = minTop - distance; hasOverflowX = true; }
            } else {
                let centerTop = (viewport.offsetHeight - container.offsetHeight) / 2;
                if (top > centerTop + distance) { top = centerTop + distance; hasOverflowX = true; }
                if (top < centerTop - distance) { top = centerTop - distance; hasOverflowX = true; }
            }
            if (this.options.hasOverflowX()) {
                if (left > margins.left + distance) { left = margins.left + distance; hasOverflowY = true; }
                let minLeft = viewport.offsetWidth - container.offsetWidth - margins.right;
                if (left < minLeft - distance) { left = minLeft - distance; hasOverflowY = true; }
            } else {
                let centerLeft = (viewport.offsetWidth - container.offsetWidth) / 2;
                if (left > centerLeft + distance) { left = centerLeft + distance; hasOverflowY = true; }
                if (left < centerLeft - distance) { left = centerLeft - distance; hasOverflowY = true; }
            }
            // 原本保留的邊界結果值目前沒有後續分支使用。
            void hasOverflowX;
            void hasOverflowY;
            await this.options.setXY(left, top, duration);
            this.isPaning = false;
            this.options.initPoint(true);
        });
    }
}
