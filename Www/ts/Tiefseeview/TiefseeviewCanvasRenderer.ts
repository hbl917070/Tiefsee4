import type { TiefseeviewMediaType } from "./TiefseeviewDomMediaRenderer";
import { getOrigPoint } from "./TiefseeviewGeometry";
import type { TiefseeviewRenderer, TiefseeviewViewState } from "./TiefseeviewTypes";

export interface TiefseeviewCanvasDrawInfo {
    scale: number;
    sx: number;
    sy: number;
    sWidth: number;
    sHeight: number;
    dx: number;
    dy: number;
    dWidth: number;
    dHeight: number;
    isSharpen: boolean;
    url: string;
}

export interface TiefseeviewCanvasRendererOptions {
    canvas: HTMLCanvasElement;
    domBigimg: HTMLDivElement;
    domCon: HTMLDivElement;
    viewport: HTMLDivElement;
    dataType: TiefseeviewMediaType;
    isDisplaySizeInitialized: boolean;
    nowWidth: number;
    nowHeight: number;
    deg: number;
    mirrorHorizontal: boolean;
    mirrorVertical: boolean;
    url: string;
    tempCanvasSN: number;
    tempDrawImage: TiefseeviewCanvasDrawInfo;
    isPinching: boolean;
    getOriginalWidth: () => number;
    getOriginalHeight: () => number;
    getRenderDpiZoom: (width: number) => number;
    getBigimgTemp: () => { img: HTMLCanvasElement | HTMLImageElement | ImageBitmap | undefined; scale: number } | null;
    getHighQualityLimit: () => number;
    isPixelatedRendering: () => boolean;
    toNumber: (value: string | number) => number;
    alignToPixel: (value: number) => number;
    setDataType: (type: TiefseeviewMediaType) => void;
    loadImg: (url: string) => Promise<boolean>;
    setDataSize: (width: number) => void;
    updateClip: () => void;
    debouncedSharpening: () => void;
}

/** 舊 Canvas 大圖路徑的可視區計算與繪製。 */
export class TiefseeviewCanvasRenderer implements TiefseeviewRenderer {
    private viewState: TiefseeviewViewState | null = null;

    constructor(private readonly options: TiefseeviewCanvasRendererOptions) { }

    public setViewState(state: TiefseeviewViewState): void {
        this.viewState = state;
    }

    /** Renderer 合約入口；舊 Canvas 繼續使用既有 DOM 與繪製演算法。 */
    public async render(isImmediatelyRun?: boolean): Promise<void> {
        await this.draw(isImmediatelyRun);
    }

    /** 此相容 Renderer 不持有獨立資源；快取與 Worker 仍由 CanvasCache 管理。 */
    public dispose(): void { }

    public async draw(isImmediatelyRun?: boolean) {

            this.options.updateClip(); // 更新裁切

            if (this.options.dataType !== "bigimg" && this.options.dataType !== "bigimgscale") { return; }

            // loadBigimg 完成後，要等 setDataSize 設定顯示尺寸才能開始渲染。
            const state = this.viewState;
            if ((state?.image.isReady ?? this.options.isDisplaySizeInitialized) === false) { return; }

            const originalWidth = state?.image.width ?? this.options.getOriginalWidth();
            const originalHeight = state?.image.height ?? this.options.getOriginalHeight();
            const nowWidth = state?.image.displayWidthCss ?? this.options.nowWidth;
            const nowHeight = state?.image.displayHeightCss ?? this.options.nowHeight;
            const deg = state?.transform.rotationDeg ?? this.options.deg;
            const mirrorHorizontal = state?.transform.mirrorHorizontal ?? this.options.mirrorHorizontal;
            const mirrorVertical = state?.transform.mirrorVertical ?? this.options.mirrorVertical;
            const renderDpiZoom = state?.viewport.renderDpiZoom ?? this.options.getRenderDpiZoom(nowWidth);
            const viewportWidth = state?.viewport.widthCss ?? this.options.viewport.offsetWidth;
            const viewportHeight = state?.viewport.heightCss ?? this.options.viewport.offsetHeight;
            const containerLeft = state?.container.leftCss ?? this.options.toNumber(this.options.domCon.style.left);
            const containerTop = state?.container.topCss ?? this.options.toNumber(this.options.domCon.style.top);

            if (originalWidth === 0) { return; } // 避免圖片尚未載入完成就渲染

            if (isImmediatelyRun === true) {
                this.options.tempDrawImage = {
                    scale: -123,
                    sx: 0, sy: 0,
                    sWidth: 1, sHeight: 1,
                    dx: 0, dy: 0,
                    dWidth: 1, dHeight: 1,
                    isSharpen: false,
                    url: ""
                }
            }
            const w = nowWidth;
            const h = nowHeight;

            const dpiZoom = renderDpiZoom;

            const bigimgTemp = this.options.getBigimgTemp(); // 判斷要使用原圖或是縮小後的圖片
            if (bigimgTemp === null) { return; }

            const can = bigimgTemp.img;
            if (can == null) { return; }
            const temp_can_width = can.width;
            const temp_can_height = can.height;

            if (w === 0 || h === 0) { return; }
            const margin = 35 * dpiZoom; // 多繪製的區域
            const scale = w / originalWidth * dpiZoom; // 目前的 圖片縮放比例
            let radio_can = 1;
            if (w > originalWidth) { // 如果圖片大於 1 倍，則用用原始大小
                radio_can = w / originalWidth
            }

            this.options.domBigimg.style.width = w + "px";
            this.options.domBigimg.style.height = h + "px";

            // 取得顯示範圍左上角的坐標
            let imgLeft = -containerLeft;
            let imgTop = -containerTop;

            // 計算顯示範圍的四個角落在圖片旋轉前的位置
            let origPoint1 = getOrigPoint(imgLeft, imgTop, w, h, deg);
            let origPoint2 = getOrigPoint(imgLeft + viewportWidth, imgTop, w, h, deg);
            let origPoint3 = getOrigPoint(imgLeft + viewportWidth, imgTop + viewportHeight, w, h, deg);
            let origPoint4 = getOrigPoint(imgLeft, imgTop + viewportHeight, w, h, deg);

            // 轉換鏡像前的坐標
            const calc = (p: { x: number, y: number }) => {
                if (mirrorVertical) {
                    p.y = nowHeight - p.y;
                }
                if (mirrorHorizontal) {
                    p.x = nowWidth - p.x;
                }
                return p;
            }
            origPoint1 = calc(origPoint1);
            origPoint2 = calc(origPoint2);
            origPoint3 = calc(origPoint3);
            origPoint4 = calc(origPoint4);

            // 取得圖片旋轉前的 left、top
            imgLeft = origPoint1.x;
            imgTop = origPoint1.y;
            if (imgLeft > (origPoint1.x)) { imgLeft = (origPoint1.x); }
            if (imgLeft > (origPoint2.x)) { imgLeft = (origPoint2.x); }
            if (imgLeft > (origPoint3.x)) { imgLeft = (origPoint3.x); }
            if (imgLeft > (origPoint4.x)) { imgLeft = (origPoint4.x); }
            if (imgTop > (origPoint1.y)) { imgTop = (origPoint1.y); }
            if (imgTop > (origPoint2.y)) { imgTop = (origPoint2.y); }
            if (imgTop > (origPoint3.y)) { imgTop = (origPoint3.y); }
            if (imgTop > (origPoint4.y)) { imgTop = (origPoint4.y); }

            // 取得圖片旋轉後的 width、height
            let viewWidth = 1;
            let viewHeight = 1;
            if (viewWidth < (origPoint1.x)) { viewWidth = (origPoint1.x) }
            if (viewWidth < (origPoint2.x)) { viewWidth = (origPoint2.x) }
            if (viewWidth < (origPoint3.x)) { viewWidth = (origPoint3.x) }
            if (viewWidth < (origPoint4.x)) { viewWidth = (origPoint4.x) }
            if (viewHeight < (origPoint1.y)) { viewHeight = (origPoint1.y) }
            if (viewHeight < (origPoint2.y)) { viewHeight = (origPoint2.y) }
            if (viewHeight < (origPoint3.y)) { viewHeight = (origPoint3.y) }
            if (viewHeight < (origPoint4.y)) { viewHeight = (origPoint4.y) }
            viewWidth = viewWidth - imgLeft;
            viewHeight = viewHeight - imgTop;

            let sx = (imgLeft - margin) / scale;
            let sy = (imgTop - margin) / scale;
            let sWidth = (viewWidth + margin * 2) / scale * radio_can;
            let sHeight = (viewHeight + margin * 2) / scale * radio_can;
            let dx = imgLeft - margin;
            let dy = imgTop - margin;
            let dWidth = (viewWidth + margin * 2);
            let dHeight = (viewHeight + margin * 2);

            sx *= dpiZoom;
            sy *= dpiZoom;
            sWidth *= dpiZoom;
            sHeight *= dpiZoom;
            dx *= dpiZoom;
            dy *= dpiZoom;
            dWidth *= dpiZoom;
            dHeight *= dpiZoom;

            // 避免以浮點數進行運算
            function toFloor() {
                sx = Math.floor(sx);
                sy = Math.floor(sy);
                sWidth = Math.floor(sWidth);
                sHeight = Math.floor(sHeight);
                dx = Math.floor(dx);
                dy = Math.floor(dy);
                dWidth = Math.floor(dWidth);
                dHeight = Math.floor(dHeight);
            }
            toFloor();

            // 圖片如果有旋轉，或是移動超過多餘渲染區塊的1/2，才會再次渲染
            if (
                scale != this.options.tempDrawImage.scale
                || Math.abs(dx - this.options.tempDrawImage.dx) > margin / 2
                || Math.abs(dy - this.options.tempDrawImage.dy) > margin / 2
                || Math.abs(sWidth - this.options.tempDrawImage.sWidth) > margin / 2
                || Math.abs(sHeight - this.options.tempDrawImage.sHeight) > margin / 2
            ) {
                this.options.tempDrawImage = {
                    scale: scale,
                    sx: sx, sy: sy,
                    sWidth: sWidth, sHeight: sHeight,
                    dx: dx, dy: dy,
                    dWidth: dWidth, dHeight: dHeight,
                    isSharpen: false,
                    url: this.options.url
                }

                // 如果圖片大於 canvas 的最大限制，就改用 <img> 來渲染
                let nowWidth = can.width;
                let nowHeight = can.height;
                if (nowWidth > 65535 || nowHeight > 65535 || nowWidth * nowHeight > 265690000) {
                    console.log("圖片過大，無法渲染", this.options.url);
                    this.options.setDataType("img");
                    await this.options.loadImg(this.options.url);
                    // 載入圖片後必須重新設定大小
                    this.options.setDataSize(nowWidth);
                    return;
                }

                this.options.canvas.width = this.options.alignToPixel((viewWidth + margin * 2) / radio_can * dpiZoom);
                this.options.canvas.height = this.options.alignToPixel((viewHeight + margin * 2) / radio_can * dpiZoom);
                this.options.canvas.style.width = this.options.alignToPixel(viewWidth + margin * 2) + "px";
                this.options.canvas.style.height = this.options.alignToPixel(viewHeight + margin * 2) + "px";
                this.options.canvas.style.left = this.options.alignToPixel(dx / dpiZoom) + "px";
                this.options.canvas.style.top = this.options.alignToPixel(dy / dpiZoom) + "px";
                let ctx = this.options.canvas.getContext("2d") as CanvasRenderingContext2D;
                // ctx.imageSmoothingEnabled = false;


                this.options.tempCanvasSN += 1; // 用於判斷是否已經切換圖片
                let tc = this.options.tempCanvasSN;

                let resizeQuality: "high" = "high"; // medium

                if (can.width * can.height > this.options.getHighQualityLimit() || this.options.isPinching) { // 如果圖片面積過大，或 雙指縮放中

                    // console.log("drawImage直接渲染(不使用高品質縮放)");
                    sx = sx * bigimgTemp.scale
                    sy = sy * bigimgTemp.scale
                    sWidth = sWidth * bigimgTemp.scale
                    sHeight = sHeight * bigimgTemp.scale
                    dWidth = dWidth
                    dHeight = dHeight
                    toFloor();
                    // ctx.imageSmoothingQuality = "high";
                    ctx.drawImage(can,
                        sx, sy, sWidth, sHeight,
                        0, 0, dWidth, dHeight
                    );

                }
                else if (scale > bigimgTemp.scale && bigimgTemp.scale < 1) {

                    // console.log("drawImage直接渲染 原圖尚未載入完成");
                    sx = sx * bigimgTemp.scale
                    sy = sy * bigimgTemp.scale
                    dWidth = dWidth / bigimgTemp.scale
                    dHeight = dHeight / bigimgTemp.scale
                    toFloor();
                    ctx.drawImage(can,
                        sx, sy, sWidth, sHeight,
                        0, 0, dWidth, dHeight
                    );

                }
                else if (scale >= 1) {

                    // console.log("drawImage直接渲染");
                    sx = sx * bigimgTemp.scale
                    sy = sy * bigimgTemp.scale
                    dWidth = dWidth / bigimgTemp.scale
                    dHeight = dHeight / bigimgTemp.scale
                    toFloor();
                    const oc = new OffscreenCanvas(sWidth, sHeight); // 創建一個canvas畫布
                    const oc2d = oc.getContext("2d"); // canvas 畫筆
                    if (oc2d == null) { return; }
                    oc2d.drawImage(can,
                        sx, sy, sWidth, sHeight,
                        0, 0, sWidth, sHeight
                    );
                    // resizeQuality = "medium";

                    // 如果啟用了「呈現像素」，則不進行縮放
                    if (this.options.isPixelatedRendering()) {
                        await createImageBitmap(oc, 0, 0, sWidth, sHeight).then((sprites) => {
                            if (tc === this.options.tempCanvasSN) {
                                ctx.drawImage(sprites, 0, 0,);
                            }
                            sprites.close();
                        });
                    }
                    else {
                        await createImageBitmap(oc, 0, 0, sWidth, sHeight,
                            { resizeWidth: dWidth, resizeHeight: dHeight, resizeQuality: resizeQuality }
                        ).then((sprites) => {
                            if (tc === this.options.tempCanvasSN) {
                                ctx.drawImage(sprites, 0, 0,);
                            }
                            sprites.close();
                        });
                    }
                }
                else if (sWidth > temp_can_width && sHeight > temp_can_height) {

                    // console.log("寬高跟高度全部渲染");
                    sWidth = temp_can_width;
                    sHeight = temp_can_height;
                    sx = dx * -1
                    sy = dy * -1
                    dWidth = temp_can_width * scale / bigimgTemp.scale
                    dHeight = temp_can_height * scale / bigimgTemp.scale
                    toFloor();
                    await createImageBitmap(can, 0, 0, sWidth, sHeight,
                        { resizeWidth: dWidth, resizeHeight: dHeight, resizeQuality: resizeQuality })
                        .then((sprites) => {
                            if (tc === this.options.tempCanvasSN) {
                                ctx.drawImage(sprites, sx, sy,);
                            }
                            sprites.close();
                        });

                }
                else if (sWidth > temp_can_width == false && sHeight > temp_can_height) {

                    // console.log("高度全部渲染");
                    // sWidth = this.options.getOriginalWidth();
                    sHeight = temp_can_height;
                    sx = sx * bigimgTemp.scale
                    sy = dy * -1
                    dWidth = dWidth / bigimgTemp.scale
                    dHeight = originalHeight * scale
                    toFloor();
                    await createImageBitmap(can, sx, 0, sWidth, sHeight,
                        { resizeWidth: dWidth, resizeHeight: dHeight, resizeQuality: resizeQuality })
                        .then((sprites) => {
                            if (tc === this.options.tempCanvasSN) {
                                ctx.drawImage(sprites, 0, sy);
                            }
                            sprites.close();
                        });

                }
                else if (sWidth > temp_can_width && sHeight > temp_can_height == false) {

                    // console.log("寬度全部渲染");
                    sWidth = temp_can_width;
                    // sHeight = this.options.getOriginalHeight();
                    sx = dx * -1
                    sy = sy * bigimgTemp.scale
                    dWidth = originalWidth * scale
                    dHeight = dHeight / bigimgTemp.scale
                    toFloor();
                    await createImageBitmap(can, 0, sy, sWidth, sHeight,
                        { resizeWidth: dWidth, resizeHeight: dHeight, resizeQuality: resizeQuality })
                        .then((sprites) => {
                            if (tc === this.options.tempCanvasSN) {
                                ctx.drawImage(sprites, sx, 0);
                            }
                            sprites.close();
                        });

                }
                else if (sWidth > temp_can_width == false && sHeight > temp_can_height == false) {

                    // console.log("局部渲染");
                    sx = sx * bigimgTemp.scale
                    dWidth = dWidth / bigimgTemp.scale
                    sy = sy * bigimgTemp.scale
                    dHeight = dHeight / bigimgTemp.scale
                    toFloor();
                    await createImageBitmap(can, sx, sy, sWidth, sHeight,
                        { resizeWidth: dWidth, resizeHeight: dHeight, resizeQuality: resizeQuality })
                        .then((sprites) => {
                            if (tc === this.options.tempCanvasSN) {
                                ctx.drawImage(sprites, 0, 0,);
                            }
                            sprites.close();
                        });
                }

                // 銳化圖片
                if (w > 10 && h > 10) {
                    this.options.debouncedSharpening();
                }

            }

        }
}
