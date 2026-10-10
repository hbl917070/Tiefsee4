import type { TiefseeviewClipController } from "./TiefseeviewClipController";
import { getOrigPoint, getRotateRect } from "./TiefseeviewGeometry";

interface TransformControllerOptions {
    viewport: HTMLDivElement;
    container: HTMLDivElement;
    data: HTMLDivElement;
    clipController: TiefseeviewClipController;
    getCurrentWidth: () => number;
    getCurrentHeight: () => number;
    getOriginalWidth: () => number;
    getOriginalHeight: () => number;
    getDeg: () => number;
    setDegValue: (deg: number) => void;
    getMirrorHorizontal: () => boolean;
    setMirrorHorizontalValue: (value: boolean) => void;
    getMirrorVertical: () => boolean;
    setMirrorVerticalValue: (value: boolean) => void;
    getTransformDuration: () => number;
    getHasOverflowX: () => boolean;
    getHasOverflowY: () => boolean;
    setXY: (left: number | undefined, top: number | undefined, duration: number) => void | Promise<void>;
    initPoint: (animate: boolean) => void | Promise<void>;
    onChangeDeg: (deg: number) => void;
    onChangeMirror: (horizontal: boolean, vertical: boolean) => void;
    toNumber: (value: string | number) => number;
}

/** 管理旋轉、鏡像及剪裁框在變換後的座標。 */
export class TiefseeviewTransformController {
    constructor(private readonly options: TransformControllerOptions) { }

    getDeg() { return this.options.getDeg(); }
    getMirrorHorizontal() { return this.options.getMirrorHorizontal(); }
    getMirrorVertical() { return this.options.getMirrorVertical(); }

    async setDegForward(x: number | undefined, y: number | undefined, enableAnimation: boolean = true) {
        const deg = (Math.floor(this.options.getDeg() / 90) + 1) * 90;
        await this.setDeg(deg, x, y, enableAnimation);
    }

    async setDegReverse(x: number | undefined, y: number | undefined, enableAnimation: boolean = true) {
        const deg = (Math.ceil(this.options.getDeg() / 90) - 1) * 90;
        await this.setDeg(deg, x, y, enableAnimation);
    }

    async setMirrorHorizontal(isMirrored: boolean, x?: number, y?: number) {
        const oldMirror = this.options.getMirrorHorizontal();
        let updateClip = false;
        let clipInfo = { x: 0, y: 0, width: 0, height: 0, deg: 0 };
        if (this.options.clipController.getIsEnabled() && oldMirror !== isMirrored) {
            updateClip = true;
            clipInfo = this.options.clipController.getClipInfo();
        }
        if (this.options.getDeg() !== 0) {
            this.setDeg(360 - this.options.getDeg(), undefined, undefined, true);
        }

        this.options.setMirrorHorizontalValue(isMirrored);
        this.options.onChangeMirror(isMirrored, this.options.getMirrorVertical());
        if (x === undefined || y === undefined) {
            x = this.options.viewport.offsetWidth / 2;
            y = this.options.viewport.offsetHeight / 2;
        }
        let left = -this.options.toNumber(this.options.container.style.left) + x;
        let top = -this.options.toNumber(this.options.container.style.top) + y;
        left = this.options.data.getBoundingClientRect().width - left;
        const origPoint = getOrigPoint(left, top, this.options.getCurrentWidth(), this.options.getCurrentHeight(), this.options.getDeg());
        left = origPoint.x;
        top = origPoint.y;
        const rotateRect = getRotateRect(this.options.getCurrentWidth(), this.options.getCurrentHeight(), left, top, this.options.getDeg());
        left = -rotateRect.x + x;
        top = -rotateRect.y + y;
        await this.setTransform(undefined, undefined, false);
        this.options.setXY(left, top, 0);
        if (this.options.getHasOverflowX() === false) { this.options.initPoint(false); }

        if (updateClip) {
            const rect = getRotateRect(this.options.getOriginalWidth(), this.options.getOriginalHeight(), 0, 0, this.options.getDeg());
            const clipX = rect.rectWidth - clipInfo.x - clipInfo.width;
            this.options.clipController.setClipXY(clipX, clipInfo.y, clipInfo.width, clipInfo.height);
        }
    }

    async setMirrorVertical(isMirrored: boolean, x?: number, y?: number) {
        const oldMirror = this.options.getMirrorVertical();
        let updateClip = false;
        let clipInfo = { x: 0, y: 0, width: 0, height: 0, deg: 0 };
        if (this.options.clipController.getIsEnabled() && oldMirror !== isMirrored) {
            updateClip = true;
            clipInfo = this.options.clipController.getClipInfo();
        }
        if (this.options.getDeg() !== 0) {
            this.setDeg(360 - this.options.getDeg(), undefined, undefined, true);
        }

        this.options.setMirrorVerticalValue(isMirrored);
        this.options.onChangeMirror(this.options.getMirrorHorizontal(), isMirrored);
        if (x === undefined || y === undefined) {
            x = this.options.viewport.offsetWidth / 2;
            y = this.options.viewport.offsetHeight / 2;
        }
        let left = -this.options.toNumber(this.options.container.style.left) + x;
        let top = -this.options.toNumber(this.options.container.style.top) + y;
        top = this.options.data.getBoundingClientRect().height - top;
        const origPoint = getOrigPoint(left, top, this.options.getCurrentWidth(), this.options.getCurrentHeight(), this.options.getDeg());
        left = origPoint.x;
        top = origPoint.y;
        const rotateRect = getRotateRect(this.options.getCurrentWidth(), this.options.getCurrentHeight(), left, top, this.options.getDeg());
        left = -rotateRect.x + x;
        top = -rotateRect.y + y;
        await this.setTransform(undefined, undefined, false);
        this.options.setXY(left, top, 0);
        if (this.options.getHasOverflowY() === false) { this.options.initPoint(false); }

        if (updateClip) {
            const rect = getRotateRect(this.options.getOriginalWidth(), this.options.getOriginalHeight(), 0, 0, this.options.getDeg());
            const clipY = rect.rectHeight - clipInfo.y - clipInfo.height;
            this.options.clipController.setClipXY(clipInfo.x, clipY, clipInfo.width, clipInfo.height);
        }
    }

    async setDeg(deg: number, x: number | undefined, y: number | undefined, enableAnimation: boolean = true) {
        let updateClip = false;
        let clipInfo = { x: 0, y: 0, width: 0, height: 0, deg: 0 };
        if (this.options.clipController.getIsEnabled() &&
            deg % 90 === 0 && this.options.getDeg() % 90 === 0 && deg !== this.options.getDeg()) {
            clipInfo = this.options.clipController.getClipInfo();
            updateClip = true;
        }
        this.options.setDegValue(deg);
        this.options.onChangeDeg(deg);
        await this.setTransform(x, y, enableAnimation);

        if (updateClip) {
            const origPoint1 = getOrigPoint(clipInfo.x, clipInfo.y, this.options.getOriginalWidth(), this.options.getOriginalHeight(), clipInfo.deg);
            const origPoint2 = getOrigPoint(clipInfo.x + clipInfo.width, clipInfo.y + clipInfo.height, this.options.getOriginalWidth(), this.options.getOriginalHeight(), clipInfo.deg);
            const rect1 = getRotateRect(this.options.getOriginalWidth(), this.options.getOriginalHeight(), origPoint1.x, origPoint1.y, this.options.getDeg());
            const rect2 = getRotateRect(this.options.getOriginalWidth(), this.options.getOriginalHeight(), origPoint2.x, origPoint2.y, this.options.getDeg());
            this.options.clipController.setClipXY(
                Math.min(rect1.x, rect2.x),
                Math.min(rect1.y, rect2.y),
                Math.abs(rect1.x - rect2.x),
                Math.abs(rect1.y - rect2.y)
            );
        }
    }

    async transformRefresh(enableAnimation: boolean = true) {
        if (this.options.getMirrorVertical()) { await this.setMirrorVertical(false); }
        if (this.options.getMirrorHorizontal()) { await this.setMirrorHorizontal(false); }
        await this.setDeg(0, undefined, undefined, enableAnimation);
    }

    async setTransform(x: number | undefined, y: number | undefined, enableAnimation: boolean = true) {
        const { data, viewport, container } = this.options;
        $(data).stop(true, false);
        let duration = this.options.getTransformDuration();
        if (enableAnimation == false) { duration = 0; }
        const scaleX = this.options.getMirrorHorizontal() ? -1 : 1;
        const scaleY = this.options.getMirrorVertical() ? -1 : 1;

        if (duration <= 0) {
            let deg = this.options.getDeg();
            if (deg <= 0 || deg >= 360) {
                deg = deg - Math.floor(deg / 360) * 360;
                this.options.setDegValue(deg);
            }
            $(data).animate({ transform_rotate: deg, transform_scaleX: scaleX, transform_scaleY: scaleY }, { duration: 0 });
            data.style.transform = "rotate(" + deg + "deg) scaleX(" + scaleX + ") scaleY(" + scaleY + ")";
            data.setAttribute("transform_rotate", deg.toString());
            this.options.initPoint(false);
            return;
        }

        await new Promise((resolve) => {
            $(data).animate({
                transform_rotate: this.options.getDeg(),
                transform_scaleX: scaleX,
                transform_scaleY: scaleY,
            }, {
                start: () => { },
                step: () => {
                    // @ts-ignore
                    const animationData: { transform_rotate: number; transform_scaleX: number; transform_scaleY: number } = $(data).animate()[0];
                    if (x === undefined) { x = viewport.offsetWidth / 2; }
                    if (y === undefined) { y = viewport.offsetHeight / 2; }
                    const x2 = x - this.options.toNumber(container.style.left);
                    const y2 = y - this.options.toNumber(container.style.top);
                    let degNow = data.getAttribute("transform_rotate");
                    if (degNow === null) { degNow = "0"; }
                    const point = getOrigPoint(x2, y2, this.options.getCurrentWidth(), this.options.getCurrentHeight(), this.options.toNumber(degNow));
                    const rect = getRotateRect(this.options.getCurrentWidth(), this.options.getCurrentHeight(), point.x, point.y, animationData.transform_rotate);
                    data.style.transform = "rotate(" + animationData.transform_rotate + "deg) scaleX(" + animationData.transform_scaleX + ") scaleY(" + animationData.transform_scaleY + ")";
                    data.setAttribute("transform_rotate", animationData.transform_rotate.toString());
                    this.options.setXY(x - rect.x, y - rect.y, 0);
                    this.options.initPoint(false);
                },
                duration,
                complete: () => {
                    let deg = this.options.getDeg();
                    if (deg <= 0 || deg >= 360) {
                        deg = deg - Math.floor(deg / 360) * 360;
                        this.options.setDegValue(deg);
                    }
                    $(data).animate({ transform_rotate: deg, transform_scaleX: scaleX, transform_scaleY: scaleY }, { duration: 0 });
                    data.style.transform = "rotate(" + deg + "deg) scaleX(" + scaleX + ") scaleY(" + scaleY + ")";
                    data.setAttribute("transform_rotate", deg.toString());
                    this.options.initPoint(false);
                    resolve(0);
                },
                easing: "linear"
            });
        });
    }
}
