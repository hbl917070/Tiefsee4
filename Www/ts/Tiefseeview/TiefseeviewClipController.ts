import Hammer from "hammerjs";
import { getRotateRect } from "./TiefseeviewGeometry";

export interface TiefseeviewClipInfo {
    x: number;
    y: number;
    width: number;
    height: number;
    deg: number;
    mirrorHorizontal: boolean;
    mirrorVertical: boolean;
}

export interface TiefseeviewClipControllerOptions {
    container: HTMLDivElement;
    getScale: () => number;
    getOriginalWidth: () => number;
    getOriginalHeight: () => number;
    getDeg: () => number;
    getMirrors: () => { horizontal: boolean; vertical: boolean };
    getPosition: () => { left: number; top: number };
    sendWheelEvent: (event: WheelEvent) => void;
}

/** 維護剪裁框的圖片座標、DOM 與拖曳互動。 */
export class TiefseeviewClipController {
    private isInitialized = false;
    private isEnabled = false;
    private domClipLT!: HTMLDivElement;
    private domClipRT!: HTMLDivElement;
    private domClipLB!: HTMLDivElement;
    private domClipRB!: HTMLDivElement;
    private domClipC!: HTMLDivElement;
    private domClipMask!: SVGRectElement;
    private domClipMaskBg!: SVGRectElement;
    private domClipSvg!: SVGSVGElement;
    private clipWidth = 100;
    private clipHeight = 100;
    private clipX = 100;
    private clipY = 100;
    private clipStartX = 0;
    private clipStartY = 0;
    private clipStartWidth = 0;
    private clipStartHeight = 0;

    constructor(private readonly options: TiefseeviewClipControllerOptions) { }

    public showClip(isShow: boolean): void {
        if (isShow) {
            if (this.isInitialized === false) this.initClip();
            this.domClipLT.style.display = "block";
            this.domClipRT.style.display = "block";
            this.domClipLB.style.display = "block";
            this.domClipRB.style.display = "block";
            this.domClipC.style.display = "block";
            this.domClipSvg.style.display = "block";
        } else if (this.isInitialized) {
            this.domClipLT.style.display = "none";
            this.domClipRT.style.display = "none";
            this.domClipLB.style.display = "none";
            this.domClipRB.style.display = "none";
            this.domClipC.style.display = "none";
            this.domClipSvg.style.display = "none";
        }
        this.isEnabled = isShow;
        this.updateClip();
    }

    public getClipInfo(): TiefseeviewClipInfo {
        const mirrors = this.options.getMirrors();
        return {
            x: Math.floor(this.clipX),
            y: Math.floor(this.clipY),
            width: Math.floor(this.clipWidth),
            height: Math.floor(this.clipHeight),
            deg: this.options.getDeg(),
            mirrorHorizontal: mirrors.horizontal,
            mirrorVertical: mirrors.vertical
        };
    }

    public clipFull(): void {
        if (this.isEnabled === false) return;
        const rect = getRotateRect(this.options.getOriginalWidth(), this.options.getOriginalHeight(), 0, 0, this.options.getDeg());
        this.setClipXY(0, 0, rect.rectWidth, rect.rectHeight);
    }

    public setClipXY(x: number, y: number, width: number, height: number): void {
        if (this.isEnabled === false) return;
        this.clipX = x;
        this.clipY = y;
        this.clipWidth = width;
        this.clipHeight = height;
        this.updateClip();
    }

    public getIsEnabled(): boolean {
        return this.isEnabled;
    }

    public update(): void {
        this.updateClip();
    }

    private initClip(): void {
        const htmlClip = `
            <div class="tiefseeview-clip tiefseeview-clip-lt"></div>
            <div class="tiefseeview-clip tiefseeview-clip-rt"></div>
            <div class="tiefseeview-clip tiefseeview-clip-lb"></div>
            <div class="tiefseeview-clip tiefseeview-clip-rb"></div>
            <div class="tiefseeview-clip-c"></div>
            <svg class="tiefseeview-clip-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <mask id="tiefseeview-clip-mask">
                        <rect class="tiefseeview-clip-mask-bg" width="100%" height="100%" fill="white" />
                        <rect class="tiefseeview-clip-mask-rect" width="100%" height="100%" fill="black" />
                    </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#tiefseeview-clip-mask)" />
            </svg>
        `;
        this.options.container.insertAdjacentHTML("beforeend", htmlClip);
        this.domClipLT = this.options.container.querySelector(".tiefseeview-clip-lt") as HTMLDivElement;
        this.domClipRT = this.options.container.querySelector(".tiefseeview-clip-rt") as HTMLDivElement;
        this.domClipLB = this.options.container.querySelector(".tiefseeview-clip-lb") as HTMLDivElement;
        this.domClipRB = this.options.container.querySelector(".tiefseeview-clip-rb") as HTMLDivElement;
        this.domClipC = this.options.container.querySelector(".tiefseeview-clip-c") as HTMLDivElement;
        this.domClipMask = this.options.container.querySelector(".tiefseeview-clip-mask-rect") as SVGRectElement;
        this.domClipMaskBg = this.options.container.querySelector(".tiefseeview-clip-mask-bg") as SVGRectElement;
        this.domClipSvg = this.options.container.querySelector(".tiefseeview-clip-svg") as unknown as SVGSVGElement;
        this.isInitialized = true;

        [this.domClipLT, this.domClipRT, this.domClipLB, this.domClipRB, this.domClipC].forEach(dom => {
            dom.addEventListener("wheel", event => {
                this.options.sendWheelEvent(event);
                event.preventDefault();
            });
        });

        const handles = [
            ["lb", this.domClipLB], ["lt", this.domClipLT], ["rb", this.domClipRB],
            ["rt", this.domClipRT], ["c", this.domClipC]
        ] as const;
        for (const [type, dom] of handles) {
            const hammer = new Hammer(dom);
            hammer.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_ALL });
            hammer.on("panstart", event => this.hammerClipMoveStart(type, event));
            hammer.on("pan", event => this.hammerClipMove(type, event.deltaX, event.deltaY));
        }
    }

    private hammerClipMoveStart(type: "lt" | "rt" | "lb" | "rb" | "c", event: HammerInput): void {
        this.clipStartWidth = this.clipWidth;
        this.clipStartHeight = this.clipHeight;
        if (type === "lt") {
            this.clipStartX = event.deltaX + this.clipX;
            this.clipStartY = event.deltaY + this.clipY;
        } else if (type === "rt") {
            this.clipStartX = event.deltaX + this.clipWidth;
            this.clipStartY = event.deltaY + this.clipY;
        } else if (type === "lb") {
            this.clipStartX = event.deltaX + this.clipX;
            this.clipStartY = event.deltaY + this.clipHeight;
        } else if (type === "rb") {
            this.clipStartX = event.deltaX + this.clipWidth;
            this.clipStartY = event.deltaY + this.clipHeight;
        } else {
            this.clipStartX = event.deltaX + this.clipX;
            this.clipStartY = event.deltaY + this.clipY;
        }
    }

    private hammerClipMove(type: "lt" | "rt" | "lb" | "rb" | "c", x: number, y: number): void {
        const scale = this.options.getScale();
        let min = 50;
        if (min * scale < 50) min = 50 / scale;
        x /= scale;
        y /= scale;

        if (type === "lt") {
            this.clipWidth = this.clipStartX + x > 0 ? this.clipStartWidth - x : this.clipStartWidth + this.clipStartX;
            this.clipHeight = this.clipStartY + y > 0 ? this.clipStartHeight - y : this.clipStartHeight + this.clipStartY;
            this.clipX = this.clipWidth > min ? this.clipStartX + x : this.clipStartX + this.clipStartWidth - min;
            this.clipY = this.clipHeight > min ? this.clipStartY + y : this.clipStartY + this.clipStartHeight - min;
        } else if (type === "rt") {
            this.clipWidth = this.clipStartX + x;
            this.clipHeight = this.clipStartY + y > 0 ? this.clipStartHeight - y : this.clipStartHeight + this.clipStartY;
            this.clipY = this.clipHeight > min ? this.clipStartY + y : this.clipStartY + this.clipStartHeight - min;
        } else if (type === "lb") {
            this.clipWidth = this.clipStartX + x > 0 ? this.clipStartWidth - x : this.clipStartWidth + this.clipStartX;
            this.clipHeight = this.clipStartY + y;
            this.clipX = this.clipWidth > min ? this.clipStartX + x : this.clipStartX + this.clipStartWidth - min;
        } else if (type === "rb") {
            this.clipWidth = this.clipStartX + x;
            this.clipHeight = this.clipStartY + y;
        } else {
            const rect = getRotateRect(this.options.getOriginalWidth(), this.options.getOriginalHeight(), 0, 0, this.options.getDeg());
            this.clipX = this.clipStartX + x + this.clipWidth < rect.rectWidth ? this.clipStartX + x : rect.rectWidth - this.clipWidth;
            this.clipY = this.clipStartY + y + this.clipHeight < rect.rectHeight ? this.clipStartY + y : rect.rectHeight - this.clipHeight;
        }
        this.updateClip();
    }

    private updateClip(): void {
        if (this.isInitialized === false || this.isEnabled === false) return;
        const scale = this.options.getScale();
        let min = 50;
        if (min * scale < 50) min = 50 / scale;
        if (this.clipWidth < min) this.clipWidth = min;
        if (this.clipHeight < min) this.clipHeight = min;

        let originalWidth = this.options.getOriginalWidth();
        let originalHeight = this.options.getOriginalHeight();
        if (originalWidth === 1 || originalHeight === 1) return;
        const rect = getRotateRect(originalWidth, originalHeight, 0, 0, this.options.getDeg());
        originalWidth = rect.rectWidth;
        originalHeight = rect.rectHeight;

        if (originalWidth > min) {
            if (this.clipX > originalWidth) this.clipX = originalWidth - min;
            if (this.clipX + this.clipWidth > originalWidth) this.clipWidth = originalWidth - this.clipX;
        } else {
            this.clipX = 0;
            this.clipWidth = originalWidth;
        }
        if (originalHeight > min) {
            if (this.clipY > originalHeight) this.clipY = originalHeight - min;
            if (this.clipY + this.clipHeight > originalHeight) this.clipHeight = originalHeight - this.clipY;
        } else {
            this.clipY = 0;
            this.clipHeight = originalHeight;
        }
        if (this.clipX < 0) this.clipX = 0;
        if (this.clipY < 0) this.clipY = 0;

        const { left, top } = this.options.getPosition();
        const boxSize = 20;
        const boxBorder = 10;
        const ltx = left + this.clipX * scale - boxBorder;
        const lty = top + this.clipY * scale - boxBorder;
        const rtx = left + (this.clipX + this.clipWidth) * scale - boxSize + boxBorder;
        const rty = top + this.clipY * scale - boxBorder;
        const lbx = left + this.clipX * scale - boxBorder;
        const lby = top + (this.clipY + this.clipHeight) * scale - boxSize + boxBorder;
        const rbx = left + (this.clipX + this.clipWidth) * scale - boxSize + boxBorder;
        const rby = top + (this.clipY + this.clipHeight) * scale - boxSize + boxBorder;
        this.domClipLT.style.left = `${ltx}px`;
        this.domClipLT.style.top = `${lty}px`;
        this.domClipRT.style.left = `${rtx}px`;
        this.domClipRT.style.top = `${rty}px`;
        this.domClipLB.style.left = `${lbx}px`;
        this.domClipLB.style.top = `${lby}px`;
        this.domClipRB.style.left = `${rbx}px`;
        this.domClipRB.style.top = `${rby}px`;
        this.domClipC.style.left = `${left + this.clipX * scale}px`;
        this.domClipC.style.top = `${top + this.clipY * scale}px`;
        this.domClipC.style.width = `${this.clipWidth * scale}px`;
        this.domClipC.style.height = `${this.clipHeight * scale}px`;

        this.domClipMaskBg.setAttribute("width", "100%");
        this.domClipMaskBg.setAttribute("height", "100%");
        this.domClipSvg.setAttribute("viewBox", `0 0 ${this.options.container.offsetWidth} ${this.options.container.offsetHeight}`);
        this.domClipMask.setAttribute("x", (left + this.clipX * scale).toString());
        this.domClipMask.setAttribute("y", (top + this.clipY * scale).toString());
        this.domClipMask.setAttribute("width", (this.clipWidth * scale).toString());
        this.domClipMask.setAttribute("height", (this.clipHeight * scale).toString());
    }
}
