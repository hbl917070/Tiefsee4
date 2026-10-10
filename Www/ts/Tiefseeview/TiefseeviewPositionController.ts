import type { TiefseeviewAlignType } from "../Tiefseeview";

type AlignTypes = typeof import("../Tiefseeview").TiefseeviewAlignType;

interface PositionControllerOptions {
    viewport: HTMLDivElement;
    container: HTMLDivElement;
    data: HTMLDivElement;
    scrollX: { update: (contentSize: number, viewportSize: number, position: number) => void };
    scrollY: { update: (contentSize: number, viewportSize: number, position: number) => void };
    alignTypes: AlignTypes;
    getMargins: () => { top: number; left: number; bottom: number; right: number };
    getHasOverflowX: () => boolean;
    getHasOverflowY: () => boolean;
    toNumber: (value: string | number) => number;
    onChangeXY: (x: number, y: number) => void;
    draw: () => void;
}
/** 管理圖片定位、置中、捲軸同步及平移動畫。 */
export class TiefseeviewPositionController {
    constructor(private readonly options: PositionControllerOptions) { }

    setAlign(type: TiefseeviewAlignType) {
        const { viewport, container } = this.options;
        const margins = this.options.getMargins();
        let horizontal: "left" | "center" | "right" = "center";
        let vertical: "top" | "center" | "bottom" = "center";
        let x = 0;
        let y = 0;

        if (type === this.options.alignTypes.none) { return; }
        if (type === this.options.alignTypes.top) { horizontal = "center"; vertical = "top"; }
        if (type === this.options.alignTypes.right) { horizontal = "right"; vertical = "center"; }
        if (type === this.options.alignTypes.left) { horizontal = "left"; vertical = "center"; }
        if (type === this.options.alignTypes.bottom) { horizontal = "center"; vertical = "bottom"; }
        if (type === this.options.alignTypes.topRight) { horizontal = "right"; vertical = "top"; }
        if (type === this.options.alignTypes.bottomRight) { horizontal = "right"; vertical = "bottom"; }
        if (type === this.options.alignTypes.topLeft) { horizontal = "left"; vertical = "top"; }
        if (type === this.options.alignTypes.bottomLeft) { horizontal = "left"; vertical = "bottom"; }
        if (type === this.options.alignTypes.center) { horizontal = "center"; vertical = "center"; }

        if (horizontal === "left") { x = margins.left; }
        if (horizontal === "center") { x = (viewport.offsetWidth - container.offsetWidth) / 2; }
        if (horizontal === "right") { x = viewport.offsetWidth - container.offsetWidth - margins.right; }
        if (vertical === "top") { y = margins.top; }
        if (vertical === "center") { y = (viewport.offsetHeight - container.offsetHeight) / 2; }
        if (vertical === "bottom") { y = viewport.offsetHeight - container.offsetHeight - margins.bottom; }
        this.setXY(x, y, 0);
        this.initPoint(false);
    }

    getXY() {
        return {
            x: this.options.toNumber(this.options.container.style.left),
            y: this.options.toNumber(this.options.container.style.top)
        };
    }

    async setXY(left: number | undefined, top: number | undefined, animationDuration: number): Promise<void> {
        const { container, data } = this.options;
        if (top === undefined) { top = this.options.toNumber(container.style.top); }
        if (left === undefined) { left = this.options.toNumber(container.style.left); }
        this.options.onChangeXY(left, top);

        if (animationDuration <= 0) {
            container.style.top = Math.floor(top) + "px";
            container.style.left = Math.floor(left) + "px";
            this.initScroll();
        } else {
            await new Promise((resolve) => {
                $(container).animate(
                    { top, left },
                    {
                        step: () => {
                            // @ts-ignore
                            const position: { left: number; top: number } = $(data).animate()[0];
                            container.style.top = position.top + "px";
                            container.style.left = position.left + "px";
                            this.options.draw();
                            this.initScroll();
                        },
                        duration: animationDuration,
                        start: () => { },
                        complete: () => {
                            container.style.top = Math.floor(top!) + "px";
                            container.style.left = Math.floor(left!) + "px";
                            resolve(0);
                        },
                        easing: "easeOutExpo"
                    });
            });
        }
        this.options.draw();
    }

    move(type: "up" | "right" | "down" | "left", distance: number = 100) {
        const point = this.getXY();
        if (type === "up") { this.setXY(point.x, point.y + distance, 0); }
        if (type === "down") { this.setXY(point.x, point.y - distance, 0); }
        if (type === "right") { this.setXY(point.x + distance, point.y, 0); }
        if (type === "left") { this.setXY(point.x - distance, point.y, 0); }
        this.initPoint(false);
    }

    initScroll() {
        const { container, viewport, scrollX, scrollY } = this.options;
        const margins = this.options.getMargins();
        scrollX.update(
            container.offsetWidth + margins.left + margins.right,
            viewport.offsetWidth,
            this.options.toNumber(container.style.left) * -1 + margins.left
        );
        scrollY.update(
            container.offsetHeight + margins.top + margins.bottom,
            viewport.offsetHeight,
            this.options.toNumber(container.style.top) * -1 + margins.top
        );
    }

    async initPoint(enableAnimation: boolean) {
        const { container, data, viewport } = this.options;
        const margins = this.options.getMargins();
        container.style.width = data.getBoundingClientRect().width + "px";
        container.style.height = data.getBoundingClientRect().height + "px";
        this.initScroll();
        if (enableAnimation === undefined) { enableAnimation = true; }

        const hasOverflowX = this.options.getHasOverflowX();
        const hasOverflowY = this.options.getHasOverflowY();
        let top = this.options.toNumber(container.style.top);
        let left = this.options.toNumber(container.style.left);

        if (hasOverflowX && hasOverflowY) {
            if (this.options.toNumber(container.style.top) > margins.top) { top = margins.top; }
            if (this.options.toNumber(container.style.left) > margins.left) { left = margins.left; }
            const minTop = viewport.offsetHeight - container.offsetHeight - margins.bottom;
            if (this.options.toNumber(container.style.top) < minTop) { top = minTop; }
            const minLeft = viewport.offsetWidth - container.offsetWidth - margins.right;
            if (this.options.toNumber(container.style.left) < minLeft) { left = minLeft; }
        }
        if (hasOverflowX === false && hasOverflowY) {
            if (this.options.toNumber(container.style.top) > margins.top) { top = margins.top; }
            const minTop = viewport.offsetHeight - container.offsetHeight - margins.bottom;
            if (this.options.toNumber(container.style.top) < minTop) { top = minTop; }
            left = (viewport.offsetWidth - container.offsetWidth) / 2;
        }
        if (hasOverflowX && hasOverflowY === false) {
            if (this.options.toNumber(container.style.left) > margins.left) { left = margins.left; }
            const minLeft = viewport.offsetWidth - container.offsetWidth - margins.right;
            if (this.options.toNumber(container.style.left) < minLeft) { left = minLeft; }
            top = (viewport.offsetHeight - container.offsetHeight) / 2;
        }
        if (hasOverflowX === false && hasOverflowY === false) {
            left = (viewport.offsetWidth - container.offsetWidth) / 2;
            top = (viewport.offsetHeight - container.offsetHeight) / 2;
        }
        if (enableAnimation) {
            await this.setXY(left, top, 100);
        } else {
            this.setXY(left, top, 0);
        }
    }
}
