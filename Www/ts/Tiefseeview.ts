import { TiefseeScroll } from "./TiefseeScroll";
import { TiefseeviewClipController } from "./Tiefseeview/TiefseeviewClipController";
import { TiefseeviewExport } from "./Tiefseeview/TiefseeviewExport";
import { TiefseeviewDomMediaRenderer } from "./Tiefseeview/TiefseeviewDomMediaRenderer";
import { TiefseeviewMediaLoader } from "./Tiefseeview/TiefseeviewMediaLoader";
import { TiefseeviewCanvasRenderer } from "./Tiefseeview/TiefseeviewCanvasRenderer";
import type { TiefseeviewCanvasDrawInfo } from "./Tiefseeview/TiefseeviewCanvasRenderer";
import { TiefseeviewInputController } from "./Tiefseeview/TiefseeviewInputController";
import { TiefseeviewPositionController } from "./Tiefseeview/TiefseeviewPositionController";
import { TiefseeviewZoomController } from "./Tiefseeview/TiefseeviewZoomController";
import { TiefseeviewTransformController } from "./Tiefseeview/TiefseeviewTransformController";
import { TiefseeviewCanvasCache } from "./Tiefseeview/TiefseeviewCanvasCache";

/**
 * 圖片瀏覽器
 */
export class Tiefseeview {

    public domTiefseeview: HTMLDivElement; // 整體的 div
    public domCon: HTMLDivElement; // 表示整體佔位的容器，用於設定 left、topo
    public domData: HTMLDivElement; // 放圖片的容器，用於旋轉與鏡像
    public domImg: HTMLImageElement; // 圖片
    public scrollX; // 水平滾動條
    public scrollY; // 垂直滾動條

    public preloadImg; // 預載入 圖片
    public loadImg; // 載入圖片
    public loadBigimg;
    public loadBigimgscale;
    public loadVideo;
    public loadNone; // 載入空白圖片
    public setLoading; // 顯示或隱藏 loading
    public getMargin; // 取得 外距
    public setMargin;
    public getOverflowDistance; // 取得 圖片拖曳允許的溢位距離
    public setOverflowDistance;
    public getLoadingUrl; // 取得 loading 圖片
    public setLoadingUrl;
    public getErrerUrl; // 取得 error 圖片
    public setErrerUrl;
    public getIsOverflowX; // 取得 圖片是否大於視窗(水平)
    public getIsOverflowY; // 取得 圖片是否大於視窗(垂直)
    public getOriginalWidth; // 取得圖片原始寬度
    public getOriginalHeight; // 取得圖片原始高度
    public getZoomRatio; // 取得縮放比例。原始 1.00
    public getDisplayZoomRatio; // 取得實際顯示縮放比例。原始 1.00
    public zoomFull; // 圖片全滿
    public zoomIn; // 圖片放大
    public zoomOut; // 圖片縮小
    public getDeg; // 取得角度
    public setDeg;
    public setDegForward; // 順時針旋轉
    public setDegReverse; // 逆時針旋轉
    public getMirrorHorizontal; // 取得 水平鏡像
    public setMirrorHorizontal;
    public getMirrorVertica; // 取得 垂直鏡像
    public setMirrorVertica;
    public getXY; // 取得 圖片坐標
    public setXY;
    public move; // 向特定方向移動
    public transformRefresh; // 旋轉跟鏡像初始化
    public setAlign; // 圖片對齊
    public getRendering; // 取得渲染模式
    public setRendering;
    public getUrl; // 取得當前圖片網址
    public getCanvasBase64;
    public getCanvasBlob;
    public getIsZoomWithWindow; // 取得 是否圖片隨視窗縮放
    public getVideoDuration; // 取得影片長度
    public setIsZoomWithWindow;
    public getSharpenValue; // 取得銳化值
    public setSharpenValue; // 設定銳化值
    public showClip; // 顯示或隱藏剪裁框
    public getClipInfo; // 取得剪裁框的資訊
    public clipFull; // 剪裁框全滿
    public enableTouchpadGestures; // 啟用觸控板手勢

    public getEventMouseWheel; // 滑鼠滾輪捲動時
    public setEventMouseWheel;
    public sendWheelEvent;
    public getEventChangeZoom; // 圖片發生縮放，或顯示圖片的區域改變大小時
    public setEventChangeZoom;
    public getEventChangeDeg; // 圖片發生旋轉時
    public setEventChangeDeg;
    public getEventChangeMirror; // 圖片發生鏡像時
    public setEventChangeMirror;
    public getEventChangeXY; // 圖片發生移動時
    public setEventChangeXY;
    public getEventLimitMax; // 圖片放大上限
    public setEventLimitMax;
    public getEventLimitMin; // 圖片縮小下限
    public setEventLimitMin;
    public setEventHighQualityLimit; // 覆寫 圖片面積大於這個數值，就停止使用高品質縮放

    constructor(_dom: HTMLDivElement) {

        _dom.innerHTML = /*html*/`
            <div class="tiefseeview-loading"></div>   
            <div class="tiefseeview-dpizoom">         
                <div class="tiefseeview-container">
                    <div class="tiefseeview-data" style="width:400px;">
                        <div class="view-bigimg">
                            <canvas class="view-bigimg-canvas"></canvas>
                        </div>   
                        <img class="view-img" style="display:none">
                        <video class="view-video" style="display:none" loop ></video>
                    </div>
                </div>
            </div>
            <div class="scroll-y">
                <div class="scroll-bg"></div>
                <div class="scroll-box"></div>
            </div>
            <div class="scroll-x">
                <div class="scroll-bg"></div>
                <div class="scroll-box"></div>
            </div>`;

        const _domTiefseeview = _dom;
        const _domDpiZoom = _domTiefseeview.querySelector(".tiefseeview-dpizoom") as HTMLDivElement;
        const _domCon = _domTiefseeview.querySelector(".tiefseeview-container") as HTMLDivElement;
        const _domData = _domTiefseeview.querySelector(".tiefseeview-data") as HTMLDivElement;
        const _domImg = _domTiefseeview.querySelector(".view-img") as HTMLImageElement;
        const _domBigimg = _domTiefseeview.querySelector(".view-bigimg") as HTMLDivElement;
        const _domVideo = _domTiefseeview.querySelector(".view-video") as HTMLVideoElement;
        const _domBigimgCanvas = _domTiefseeview.querySelector(".view-bigimg-canvas") as HTMLCanvasElement;
        const _domLoading = _domTiefseeview.querySelector(".tiefseeview-loading") as HTMLDivElement;
        const _scrollX = new TiefseeScroll(); // 水平滾動條
        const _scrollY = new TiefseeScroll(); // 垂直滾動條
        _scrollX.initTiefseeScroll(<HTMLImageElement>_domTiefseeview.querySelector(".scroll-x"), "x");
        _scrollY.initTiefseeScroll(<HTMLImageElement>_domTiefseeview.querySelector(".scroll-y"), "y");

        var _url: string; // 目前的圖片網址
        /** 圖片當前被設定寬度 (含小數點，避免計算縮放時失去精度。還必須乘 _dpiZoom 才是當前實際的像素) */
        var _nowWidth = 1;
        var _nowHeight = 1;
        /** 是否已經完成第一次顯示尺寸初始化 */
        var _isDisplaySizeInitialized = false;

        var _dpiZoom = 1;
        var _isDpizoomAUto = true;
        var _nowDeg = 0; // 目前的角度 0~359
        var _zoomRatio = 1.1; // 縮放比率(必須大於1)
        var _transformDuration = 200; // transform 動畫時間(毫秒)
        var _mirrorHorizontal = false; // 水平鏡像
        var _mirrorVertical = false; // 垂直鏡像
        var _rendering: TiefseeviewImageRendering = TiefseeviewImageRendering.auto; // 圖片渲染模式
        var _overflowDistance = 0; // 溢位距離
        var _marginTop = 10; // 外距
        var _marginLeft = 10;
        var _marginBottom = 10;
        var _marginRight = 10;
        var _loadingUrl = "img/loading.svg";
        var _errerUrl = "img/error.svg";
        var _rotateCriticalValue = 15; // 觸控旋轉的最低旋轉角度

        var _tempDateShowLoading = 0; // 控制laoding顯示的延遲
        var _tempOriginalWidth = 1; // 用於記錄圖片size 的暫存
        var _tempOriginalHeight = 1;
        var _tempCan: HTMLCanvasElement; // canvas暫存
        var _tempCanvasSN = 0; // 用於判斷canvas是否重複繪製
        var _tempTouchPadTime = 0; // 用於判斷是否為觸控板
        var _isZoomWithWindow = true; // 圖片隨視窗縮放
        var _tempZoomWithWindow = false; // 縮放過圖片大小的話，就停止 圖片隨視窗縮放
        var _tempTiefseeviewZoomType: TiefseeviewZoomType = TiefseeviewZoomType.imageOriginal;
        var _tempTiefseeviewZoomTypeVal = 100;

        var _tempVideoDuration = -1; // 影片長度

        var _touchpadGestures = false; // 啟用觸控板手勢
        var _isPinching = false;

        // 滑鼠滾輪的行為
        var _eventMouseWheel = (type: ("up" | "down"), e: WheelEvent, offsetX: number, offsetY: number): void => {
            if (type === "up") { zoomIn(offsetX, offsetY); }
            else { zoomOut(offsetX, offsetY); }
        }
        var _eventChangeZoom = (ratio: number): void => { }
        var _eventChangeDeg = (deg: number): void => { }
        var _eventChangeMirror = (isMirrorHorizontal: boolean, isMirrorVertica: boolean): void => { }
        var _eventChangeXY = (x: number, y: number): void => { };
        var _eventLimitMax = (): boolean => { return eventLimitMax(); } // 超出縮放上限，return true表示超過限制    
        var _eventLimitMin = (): boolean => { return eventLimitMin(); } // 超出縮放下限，return true表示超過限制
        var _eventHighQualityLimit = (): number => { return 7000 * 7000; } // 圖片面積大於這個數值，就禁用高品質縮放

        const domMediaRenderer = new TiefseeviewDomMediaRenderer(_domImg, _domBigimg, _domVideo);

        const clipController = new TiefseeviewClipController({
            container: _domTiefseeview,
            getScale: getZoomRatio,
            getOriginalWidth,
            getOriginalHeight,
            getDeg: () => _nowDeg,
            getMirrors: () => ({ horizontal: _mirrorHorizontal, vertical: _mirrorVertical }),
            getPosition: () => ({ left: toNumber(_domCon.style.left), top: toNumber(_domCon.style.top) }),
            sendWheelEvent
        });

        const mediaLoader = new TiefseeviewMediaLoader({
            domImg: _domImg,
            domBigimgCanvas: _domBigimgCanvas,
            domVideo: _domVideo,
            mediaRenderer: domMediaRenderer,
            getUrl,
            setUrl: (url: string) => { _url = url; },
            setOriginalSize: (width: number, height: number) => { _tempOriginalWidth = width; _tempOriginalHeight = height; },
            setVideoDuration: (duration: number) => { _tempVideoDuration = duration; },
            setDisplaySizeInitialized: (value: boolean) => { _isDisplaySizeInitialized = value; },
            getErrorUrl: () => _errerUrl,
            getZoomFullWidth: getZoomFull_width,
            getRenderScale,
            setDataSize,
            urlToCanvas,
            resetBigimgCache: () => { canvasCache.resetBigimgCache(); },
            resetDrawImage: () => {
                _tempDrawImage = {
                    scale: -1,
                    sx: 0, sy: 0,
                    sWidth: 1, sHeight: 1,
                    dx: 0, dy: 0,
                    dWidth: 1, dHeight: 1,
                    isSharpen: false,
                    url: ""
                };
            },
            setTempCanvas: (canvas: HTMLCanvasElement) => { _tempCan = canvas; },
            setScaleImageCanvas: (scale: number, canvas: HTMLCanvasElement) => { canvasCache.setScaleImageCanvas(scale, canvas); },
            resetScaleImageCache: (initialScale: number) => { canvasCache.resetScaleImageCache(initialScale); },
            clipFull: () => { clipController.clipFull(); }
        });
        const canvasRenderer = new TiefseeviewCanvasRenderer({
            canvas: _domBigimgCanvas,
            domBigimg: _domBigimg,
            domCon: _domCon,
            viewport: _domDpiZoom,
            get dataType() { return domMediaRenderer.getDataType(); },
            get isDisplaySizeInitialized() { return _isDisplaySizeInitialized; },
            get nowWidth() { return _nowWidth; },
            get nowHeight() { return _nowHeight; },
            get deg() { return _nowDeg; },
            get mirrorHorizontal() { return _mirrorHorizontal; },
            get mirrorVertical() { return _mirrorVertical; },
            get url() { return _url; },
            get tempCanvasSN() { return _tempCanvasSN; },
            set tempCanvasSN(value: number) { _tempCanvasSN = value; },
            get tempDrawImage() { return _tempDrawImage; },
            set tempDrawImage(value: TiefseeviewCanvasDrawInfo) { _tempDrawImage = value; },
            get isPinching() { return _isPinching; },
            getOriginalWidth,
            getOriginalHeight,
            getRenderDpiZoom,
            getBigimgTemp,
            getHighQualityLimit: () => _eventHighQualityLimit(),
            isPixelatedRendering: () => _rendering === TiefseeviewImageRendering.autoOrPixelated,
            toNumber,
            alignToPixel,
            setDataType,
            loadImg,
            setDataSize,
            updateClip: () => clipController.update(),
            debouncedSharpening: () => canvasCache.debouncedSharpening()
        });
        const canvasCache = new TiefseeviewCanvasCache({
            canvas: _domBigimgCanvas,
            getDataType: () => domMediaRenderer.getDataType(),
            getScale,
            getBaseCanvas: () => _tempCan,
            getScaleImageItem: () => mediaLoader.getScaleImageItem(getScale()),
            getUrl,
            getDrawInfo: () => _tempDrawImage,
            getSharpenValue: () => _sharpenValue,
            draw: bigimgDraw
        });
        const exportService = new TiefseeviewExport({
            getCanvas,
            getCanvasZoom: (img, zoom, quality) => canvasCache.getCanvasZoom(img, zoom, quality),
            getDataType: () => domMediaRenderer.getDataType()
        });
        const positionController = new TiefseeviewPositionController({
            viewport: _domDpiZoom,
            container: _domCon,
            data: _domData,
            scrollX: _scrollX,
            scrollY: _scrollY,
            alignTypes: TiefseeviewAlignType,
            getMargins: () => ({ top: _marginTop, left: _marginLeft, bottom: _marginBottom, right: _marginRight }),
            getHasOverflowX,
            getHasOverflowY,
            toNumber,
            onChangeXY: (x: number, y: number) => { _eventChangeXY(x, y); },
            draw: bigimgDraw
        });
        const zoomController = new TiefseeviewZoomController({
            viewport: _domDpiZoom,
            container: _domCon,
            zoomTypes: TiefseeviewZoomType,
            getOriginalWidth,
            getOriginalHeight,
            getCurrentWidth: () => _nowWidth,
            getDpiZoom: () => _dpiZoom,
            getMargins: () => ({ top: _marginTop, left: _marginLeft, bottom: _marginBottom, right: _marginRight }),
            getDeg: () => _nowDeg,
            getRendering: () => _rendering,
            getZoomRatio,
            getZoomStep: () => _zoomRatio,
            isLimitMax: () => _eventLimitMax(),
            isLimitMin: () => _eventLimitMin(),
            setZoomType: (type: TiefseeviewZoomType) => { _tempTiefseeviewZoomType = type; },
            setZoomTypeValue: (value: number) => { _tempTiefseeviewZoomTypeVal = value; },
            setZoomWithWindow: (value: boolean) => { _tempZoomWithWindow = value; },
            setDataSize,
            setXY,
            initPoint,
            setRendering,
            onChangeZoom: (ratio: number) => { _eventChangeZoom(ratio); },
            toNumber
        });
        const transformController = new TiefseeviewTransformController({
            viewport: _domDpiZoom,
            container: _domCon,
            data: _domData,
            clipController,
            getCurrentWidth: () => _nowWidth,
            getCurrentHeight: () => _nowHeight,
            getOriginalWidth,
            getOriginalHeight,
            getDeg: () => _nowDeg,
            setDegValue: (deg: number) => { _nowDeg = deg; },
            getMirrorHorizontal: () => _mirrorHorizontal,
            setMirrorHorizontalValue: (value: boolean) => { _mirrorHorizontal = value; },
            getMirrorVertical: () => _mirrorVertical,
            setMirrorVerticalValue: (value: boolean) => { _mirrorVertical = value; },
            getTransformDuration: () => _transformDuration,
            getHasOverflowX,
            getHasOverflowY,
            setXY,
            initPoint,
            onChangeDeg: (deg: number) => { _eventChangeDeg(deg); },
            onChangeMirror: (horizontal: boolean, vertical: boolean) => { _eventChangeMirror(horizontal, vertical); },
            toNumber
        });
        this.domTiefseeview = _domTiefseeview;
        this.domCon = _domCon;
        this.domData = _domData;
        this.domImg = _domImg;
        this.scrollX = _scrollX;
        this.scrollY = _scrollY;
        this.preloadImg = preloadImg;
        this.loadImg = loadImg;
        this.loadBigimg = loadBigimg;
        this.loadBigimgscale = loadBigimgscale;
        this.loadVideo = loadVideo;
        this.loadNone = loadNone;
        this.setLoading = setLoading;
        this.getRendering = getRendering;
        this.setRendering = setRendering;
        this.getIsOverflowX = getHasOverflowX;
        this.getIsOverflowY = getHasOverflowY;
        this.zoomFull = zoomFull;
        this.getDeg = getDeg;
        this.setDeg = setDeg;
        this.setDegForward = setDegForward;
        this.setDegReverse = setDegReverse;
        this.getMirrorHorizontal = getMirrorHorizontal;
        this.setMirrorHorizontal = setMirrorHorizontal;
        this.getMirrorVertica = getMirrorVertica;
        this.setMirrorVertica = setMirrorVertica;
        this.getXY = getXY;
        this.setXY = setXY;
        this.move = move;
        this.transformRefresh = transformRefresh;
        this.setAlign = setAlign;
        this.zoomOut = zoomOut;
        this.zoomIn = zoomIn;
        this.getEventMouseWheel = getEventMouseWheel;
        this.setEventMouseWheel = setEventMouseWheel;
        this.sendWheelEvent = sendWheelEvent;
        this.getEventLimitMax = getEventLimitMax;
        this.setEventLimitMax = setEventLimitMax;
        this.getEventLimitMin = getEventLimitMin;
        this.setEventLimitMin = setEventLimitMin;
        this.setEventHighQualityLimit = setEventHighQualityLimit;
        this.setEventChangeZoom = setEventChangeZoom;
        this.getEventChangeZoom = getEventChangeZoom;
        this.setEventChangeDeg = setEventChangeDeg;
        this.getEventChangeDeg = getEventChangeDeg;
        this.setEventChangeMirror = setEventChangeMirror;
        this.getEventChangeMirror = getEventChangeMirror;
        this.setEventChangeXY = setEventChangeXY;
        this.getEventChangeXY = getEventChangeXY;
        this.getOriginalWidth = getOriginalWidth;
        this.getOriginalHeight = getOriginalHeight;
        this.getZoomRatio = getZoomRatio;
        this.getDisplayZoomRatio = getDisplayZoomRatio;
        this.setMargin = setMargin;
        this.getMargin = getMargin;
        this.getOverflowDistance = getOverflowDistance;
        this.setOverflowDistance = setOverflowDistance;
        this.getLoadingUrl = getLoadingUrl;
        this.setLoadingUrl = setLoadingUrl;
        this.getErrerUrl = getErrerUrl;
        this.setErrerUrl = setErrerUrl;
        this.getUrl = getUrl;
        this.getCanvasBase64 = exportService.getCanvasBase64.bind(exportService); // 從 Canvas 取得 base64
        this.getCanvasBlob = exportService.getCanvasBlob.bind(exportService);
        this.getIsZoomWithWindow = getIsZoomWithWindow;
        this.getVideoDuration = getVideoDuration;
        this.setIsZoomWithWindow = setIsZoomWithWindow;
        this.getSharpenValue = getSharpenValue;
        this.setSharpenValue = setSharpenValue;
        this.showClip = clipController.showClip.bind(clipController);
        this.getClipInfo = clipController.getClipInfo.bind(clipController);
        this.clipFull = clipController.clipFull.bind(clipController);
        this.enableTouchpadGestures = (enable: boolean) => { _touchpadGestures = enable; }

        setLoadingUrl(_loadingUrl); // 初始化 loading 圖片
        setLoading(false); // 預設為隱藏
        _domTiefseeview.classList.add("tiefseeview");
        setTransform(undefined, undefined, false); // 初始化定位
        setDpizoom(-1);

        // 顯示圖片的區塊改變大小時
        new ResizeObserver(() => {
            requestAnimationFrame(() => {
                initPoint(false); // 重新定位圖片
                _eventChangeZoom(getZoomRatio() * _dpiZoom);

                // 圖片隨視窗縮放
                if (_isZoomWithWindow && _tempZoomWithWindow) {
                    zoomFull(_tempTiefseeviewZoomType, _tempTiefseeviewZoomTypeVal);
                }
            })
        }).observe(_domDpiZoom);

        // 滾動條變化時，同步至圖片位置
        _scrollY.setEventChange((val: number, mode: string) => {
            if (mode === "set") { return; }
            val = val * -1 + _marginTop;
            setXY(undefined, val, 0);
        });
        _scrollX.setEventChange((val: number, mode: string) => {
            if (mode === "set") { return; }
            val = val * -1 + _marginLeft;
            setXY(val, undefined, 0);
        });

        new TiefseeviewInputController({
            viewport: _domDpiZoom,
            container: _domCon,
            getPosition: () => ({ left: toNumber(_domCon.style.left), top: toNumber(_domCon.style.top) }),
            getMargins: () => ({ top: _marginTop, left: _marginLeft, bottom: _marginBottom, right: _marginRight }),
            getOverflowDistance: () => _overflowDistance,
            hasOverflowX: getHasOverflowX,
            hasOverflowY: getHasOverflowY,
            getDeg: () => _nowDeg,
            getRotateCriticalValue: () => _rotateCriticalValue,
            setDeg,
            setDegForward,
            setDegReverse,
            getRendering: () => _rendering,
            setRendering,
            zoomIn,
            zoomOut,
            setXY,
            initPoint,
            stopAnimation: () => { $(_domCon).stop(true, false); },
            setTempZoomWithWindow: (value: boolean) => { _tempZoomWithWindow = value; },
            getTouchpadGestures: () => _touchpadGestures,
            getEventMouseWheel: () => _eventMouseWheel,
            setIsPinching: (value: boolean) => { _isPinching = value; },
            findDifference,
            pixelatedRendering: TiefseeviewImageRendering.pixelated
        });

        //#region 對外公開的事件

        /**
         * 取得 滑鼠滾輪的事件
         * @returns 
         */
        function getEventMouseWheel() { return _eventMouseWheel; }
        /**
         * 覆寫 滑鼠滾輪的事件
         * @param func 
         */
        function setEventMouseWheel(func: (type: ("up" | "down"), e: WheelEvent, offsetX: number, offsetY: number) => void) {
            _eventMouseWheel = func;
        }

        /**
         * 覆寫 圖片或顯示範圍改變的事件
         */
        function setEventChangeZoom(func: (ratio: number) => void) { _eventChangeZoom = func; }
        /**
         * 取得 圖片或顯示範圍改變的事件
         */
        function getEventChangeZoom() { return _eventChangeZoom; }

        /**
         * 覆寫 角度改變的事件
         */
        function setEventChangeDeg(func: (deg: number) => {}) { _eventChangeDeg = func; }
        /**
         * 取得 角度改變的事件
         */
        function getEventChangeDeg() { return _eventChangeDeg; }

        /**
         * 覆寫 鏡像改變的事件
         */
        function setEventChangeMirror(func: () => {}) { _eventChangeMirror = func; }
        /**
         * 取得 鏡像改變的事件
         */
        function getEventChangeMirror() { return _eventChangeMirror; }

        /**
         * 覆寫 坐標改變的事件
         */
        function setEventChangeXY(func: (x: number, y: number) => {}) { _eventChangeXY = func; }
        /**
         * 取得 坐標改變的事件
         */
        function getEventChangeXY() { return _eventChangeXY; }

        /**
         * (預設值)超出縮放上限
         * @returns true 表示超過限制
         */
        function eventLimitMax(): boolean {

            // 寬度或高度大於100px的圖片，放大上限為30倍
            if (getOriginalWidth() > 100 || getOriginalHeight() > 100) {
                if (getZoomRatio() > 50) {
                    return true;
                }
            }

            // 放大上限為100萬px
            if (_nowWidth > 999999 || _nowHeight > 999999) {
                return true;
            }

            return false;
        }

        /**
         * (預設值)超出縮放下限 
         * @returns true 表示超過限制
         */
        function eventLimitMin(): boolean {

            // 寬度或高度小於10px的圖片，縮小下限為1px
            if (getOriginalWidth() <= 10 || getOriginalHeight() <= 10) {
                if (_nowWidth <= 1 || _nowHeight <= 1) {
                    return true;
                }
            } else {
                // 縮小下限為10px
                if (_nowWidth <= 10 || _nowHeight <= 10) {
                    return true;
                }
            }

            return false;
        }

        /**
         * 取得 圖片放大上限
         */
        function getEventLimitMax() { return _eventLimitMax; }
        /**
         * 覆寫 圖片放大上限
         */
        function setEventLimitMax(func: () => boolean) { _eventLimitMax = func; }

        /**
         * 取得 圖片縮小下限
         */
        function getEventLimitMin() { return _eventLimitMin; }
        /**
         * 覆寫 圖片縮小下限
         */
        function setEventLimitMin(func: () => boolean) { _eventLimitMin = func; }

        /**
         * 覆寫 圖片面積大於這個數值，就停止使用高品質縮放
         */
        function setEventHighQualityLimit(func: () => number) {
            _eventHighQualityLimit = func;
        }

        //#endregion

        //#region 載入圖片(入口)

        function preloadImg(url: string, isInitSize: undefined | boolean = true) { return mediaLoader.preloadImg(url, isInitSize); }
        function loadNone() { return mediaLoader.loadNone(); }
        function loadVideo(url: string) { return mediaLoader.loadVideo(url); }
        function loadImg(url: string) { return mediaLoader.loadImg(url); }
        function loadBigimg(url: string) { return mediaLoader.loadBigimg(url); }
        function loadBigimgscale(images: { scale: number, url: string }[], width: number, height: number, zoomType: TiefseeviewZoomType, zoomValue: number) {
            return mediaLoader.loadBigimgscale(images, width, height, zoomType, zoomValue);
        }
        function setDataType(type: ("img" | "video" | "imgs" | "bigimg" | "bigimgscale")) { domMediaRenderer.setDataType(type); }

        //#endregion

        /**
         * 取得縮放比例。原始1.00
         */
        function getZoomRatio(): number { return _nowWidth / getOriginalWidth(); }

        /**
         * 取得實際顯示縮放比例。原始1.00
         */
        function getDisplayZoomRatio(): number { return getZoomRatio() * _dpiZoom; }

        /**
         * 取得 是否圖片隨視窗縮放
         */
        function getIsZoomWithWindow() { return _isZoomWithWindow; }
        /**
         * 設定 是否圖片隨視窗縮放
         * @param val
         */
        function setIsZoomWithWindow(val: boolean) { _isZoomWithWindow = val; }

        /**
         * 取得 loading 圖片
         */
        function getLoadingUrl(): string { return _loadingUrl }
        /**
         * 設定 loading 圖片
         * @param url 
         */
        function setLoadingUrl(url: string): void {
            _loadingUrl = url;
            _domLoading.style.backgroundImage = `url("${_loadingUrl}")`
        }
        /**
         * 顯示或隱藏 loading
         * @param val 
         * @param delay 延遲顯示(ms)
         */
        function setLoading(val: boolean, delay: number = 200) {
            if (val) {
                setTimeout(() => {
                    if ((new Date()).getTime() > _tempDateShowLoading) {
                        _domLoading.style.display = "block";
                    }
                }, delay);
                _tempDateShowLoading = (new Date()).getTime() + delay - 1;
            } else {
                _tempDateShowLoading = 99999999999999; // 避免延遲時間到了之後還顯示
                _domLoading.style.display = "none";
            }
        }

        /**
         * 取得 error 圖片
         */
        function getErrerUrl(): string { return _errerUrl; }
        /**
         * 設定 error 圖片
         */
        function setErrerUrl(url: string): void { _errerUrl = url; }

        /**
         * 取得 外距
         */
        function getMargin(): { top: number, right: number, bottom: number, left: number } {
            return { top: _marginTop, right: _marginRight, bottom: _marginBottom, left: _marginLeft };
        }
        /**
         * 設定 外距
         */
        function setMargin(top: number, right: number, bottom: number, left: number) {
            _marginTop = top;
            _marginLeft = left;
            _marginBottom = bottom;
            _marginRight = right;
        }

        /**
         * 設定 dpizoom。嘗試以更高的DPI來渲染圖片
         * @param val -1=自動(根據網頁縮放比例與螢幕縮放)  1=原始  2=圖片縮小一半
         * @param isOnlyRun 單純執行而不設定
         */
        function setDpizoom(val: number, isOnlyRun: boolean = false) {

            if (val == -1) {
                val = window.devicePixelRatio;
                if (isOnlyRun === false) { _isDpizoomAUto = true; }
            } else {
                if (isOnlyRun === false) { _isDpizoomAUto = false; }
            }

            // 重新縮放圖片
            zoomIn(undefined, undefined, _dpiZoom / val);

            // TODO 已棄用，因為會 chrome 128 版的 zoom 機制與原本的不一樣
            // @ts-ignore
            // dom_dpizoom.style.zoom = (1 / val);
            // dpizoom = val;
            _dpiZoom = val;
        }

        /**
         * 取得 允許拖曳的溢位距離
         */
        function getOverflowDistance() { return _overflowDistance; }
        /**
         * 設定 允許拖曳的溢位距離
         */
        function setOverflowDistance(val: number) { _overflowDistance = val; }

        /**
         * 取得 圖片的渲染模式
         */
        function getRendering() { return _rendering; }
        /**
         * 設定 圖片的渲染模式
         * @param renderin 
         * @param isOnlyRun 單純執行而不設定
         */
        function setRendering(renderin: TiefseeviewImageRendering, isOnlyRun: boolean = false) {

            if (isOnlyRun === false) {
                _rendering = renderin;
            }

            if (renderin === TiefseeviewImageRendering.auto) {
                _domData.style.imageRendering = "auto";

            } else if (renderin === TiefseeviewImageRendering.pixelated) {
                _domData.style.imageRendering = "pixelated";

            } else if (renderin === TiefseeviewImageRendering.autoOrPixelated) {
                if (getZoomRatio() > 1 / _dpiZoom) {
                    _domData.style.imageRendering = "pixelated";
                } else {
                    _domData.style.imageRendering = "auto";
                }
            }
        }

        /**
         * 設定對齊
         */
        function setAlign(type: TiefseeviewAlignType) { positionController.setAlign(type); }

        function getOriginalWidth() {
            return _tempOriginalWidth;
        }

        /**
         * 取得圖片原始高度
         */
        function getOriginalHeight() {
            return _tempOriginalHeight;
        }

        /**
         * 取得影片長度，非影片或尚未載入完畢則回傳 -1
         */
        function getVideoDuration() {
            if (domMediaRenderer.getDataType() !== "video") { return -1; }
            return _tempVideoDuration;
        }

        /**
         * 順時針旋轉 90°
         * @param enableAnimation 是否使用動畫
         */
        async function setDegForward(x: number | undefined, y: number | undefined, enableAnimation: boolean = true) { return transformController.setDegForward(x, y, enableAnimation); }
        async function setDegReverse(x: number | undefined, y: number | undefined, enableAnimation: boolean = true) { return transformController.setDegReverse(x, y, enableAnimation); }
        function getMirrorHorizontal() { return transformController.getMirrorHorizontal(); }
        async function setMirrorHorizontal(isMirrored: boolean, x?: number, y?: number) { return transformController.setMirrorHorizontal(isMirrored, x, y); }
        function getMirrorVertica() { return transformController.getMirrorVertical(); }
        async function setMirrorVertica(isMirror: boolean, x?: number, y?: number) { return transformController.setMirrorVertical(isMirror, x, y); }
        function getDeg(): number { return transformController.getDeg(); }
        async function setDeg(deg: number, x: number | undefined, y: number | undefined, enableAnimation: boolean = true) { return transformController.setDeg(deg, x, y, enableAnimation); }
        function getXY() { return positionController.getXY(); }
        async function setXY(left: number | undefined, top: number | undefined, animationDuration: number) { return positionController.setXY(left, top, animationDuration); }
        function move(type: ("up" | "right" | "down" | "left"), distance: number = 100) { positionController.move(type, distance); }
        async function transformRefresh(enableAnimation: boolean = true) { return transformController.transformRefresh(enableAnimation); }
        async function setTransform(x: number | undefined, y: number | undefined, enableAnimation: boolean = true) { return transformController.setTransform(x, y, enableAnimation); }

        function getScale() {
            return getRenderScale();
        }

        /**
         * 取得圖片實際渲染時使用的 DPI 縮放比例。
         * 初次選擇 bigimgscale 與後續 bigimgDraw 必須使用同一套規則，
         * 否則在網頁或 Windows 螢幕縮放不是 100% 時會先顯示一張縮圖，
         * worker 載入另一張縮圖後再次繪製，造成畫面短暫位移。
         */
        function getRenderDpiZoom(width: number) {
            let dpiZoom = _dpiZoom;
            // 低於 1 倍時圖片會變得模糊
            if (dpiZoom < 1) { dpiZoom = 1; }

            // 「呈現像素」模式在實際顯示比例大於 100% 時不再使用額外 DPI
            if (_rendering === TiefseeviewImageRendering.autoOrPixelated &&
                width / getOriginalWidth() * dpiZoom > 1) {
                dpiZoom = 1;
            }
            return dpiZoom;
        }

        /**
         * 取得圖片實際渲染比例，包含 DPI 與渲染模式的限制。
         */
        function getRenderScale(width: number = _nowWidth) {
            return width / getOriginalWidth() * getRenderDpiZoom(width);
        }

        /**
         * 套用 縮放圖片
         * @param type 縮放類型
         * @param val 附加參數，例如以px或%進行縮放時，必須另外傳入number
         */
        function zoomFull(type: TiefseeviewZoomType, val?: number, x?: number, y?: number) { zoomController.zoomFull(type, val, x, y); }
        function getZoomFull_scale(type: TiefseeviewZoomType, val?: number) { return zoomController.getZoomFullScale(type, val); }
        function getZoomFull_width(type: TiefseeviewZoomType, val?: number) { return zoomController.getZoomFullWidth(type, val); }
        function zoomIn(x?: number, y?: number, zoomRatio?: number, rendering?: TiefseeviewImageRendering) { zoomController.zoomIn(x, y, zoomRatio, rendering); }
        function zoomOut(x?: number, y?: number, zoomRatio?: number) { zoomController.zoomOut(x, y, zoomRatio); }

        /**
         * 主動觸發 wheel 事件
         */
        function sendWheelEvent(event: WheelEvent) {
            // 創建一個新的滾輪事件，並設置相應的坐標
            const newEvent = new WheelEvent("wheel", {
                clientX: event.x * _dpiZoom,
                clientY: event.y * _dpiZoom,
                deltaX: event.deltaX,
                deltaY: event.deltaY,
                deltaZ: event.deltaZ,
                deltaMode: event.deltaMode,
                ctrlKey: event.ctrlKey,
                altKey: event.altKey,
                shiftKey: event.shiftKey,
                // @ts-ignore
                wheelDelta: event.wheelDelta,
                // @ts-ignore
                wheelDeltaY: event.wheelDeltaY,
                // @ts-ignore
                wheelDeltaX: event.wheelDeltaX,
            });

            // 主動觸發 wheel 事件
            _domDpiZoom.dispatchEvent(newEvent);
        }

        /**
         * 判斷圖片是否大於視窗(寬度)
         */
        function getHasOverflowX() {
            if (_domCon.offsetWidth + _marginLeft + _marginRight > _domDpiZoom.offsetWidth) {
                return true;
            }
            return false;
        }

        /**
         * 判斷圖片是否大於視窗(高度)
         */
        function getHasOverflowY() {
            if (_domCon.offsetHeight + _marginTop + _marginBottom > _domDpiZoom.offsetHeight) {
                return true;
            }
            return false;
        }

        /** 
         * 取得目前的圖片網址
         */
        function getUrl() { return _url; }

        async function getCanvas(): Promise<HTMLCanvasElement | null> {

            if (domMediaRenderer.getDataType() === "bigimg") {
                return _tempCan;
            }

            if (domMediaRenderer.getDataType() === "img") {
                _tempCan = document.createElement("canvas");
                _tempCan.width = getOriginalWidth();
                _tempCan.height = getOriginalHeight();
                const ctx = _tempCan.getContext("2d") as CanvasRenderingContext2D;
                ctx.drawImage(_domImg, 0, 0, getOriginalWidth(), getOriginalHeight());
                return _tempCan;
            }

            if (domMediaRenderer.getDataType() === "video") {
                _tempCan = document.createElement("canvas");
                _tempCan.width = getOriginalWidth();
                _tempCan.height = getOriginalHeight();
                const ctx = _tempCan.getContext("2d") as CanvasRenderingContext2D;
                ctx.drawImage(_domVideo, 0, 0, getOriginalWidth(), getOriginalHeight());
                return _tempCan;
            }

            if (domMediaRenderer.getDataType() === "bigimgscale") { // 未測試

                if (canvasCache.getScaleImageCanvas(1) !== undefined) {
                    return canvasCache.getScaleImageCanvas(1) ?? null;

                } else {
                    const isImageLoaded = await new Promise((resolve, reject) => {

                        const tempUrl = getUrl();
                        const domImg = document.createElement("img");
                        domImg.addEventListener("load", (e) => {
                            if (tempUrl != getUrl()) { // 避免已經切換圖片了
                                // console.log("old:" + tempUrl + "   new:" + getUrl())
                                resolve(false);
                                return;
                            }
                            canvasCache.setScaleImageCanvas(1, urlToCanvas(tempUrl))
                            resolve(true);
                        });
                        domImg.addEventListener("error", (e) => {
                            resolve(false);
                        })
                        domImg.src = tempUrl;
                    })

                    if (isImageLoaded) {
                        if (canvasCache.getScaleImageCanvas(1) !== undefined) {
                            return canvasCache.getScaleImageCanvas(1) ?? null;
                        } else {
                            return null;
                        }
                    } else {
                        return null;
                    }
                }
            }

            return null;
        }

        /**
         * [private] url 轉 Canvas 。只能在網址已經載入完成的情況下使用
         */
        function urlToCanvas(url: string) {
            const domImg = document.createElement("img");
            domImg.src = url;

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
            canvas.width = domImg.width;
            canvas.height = domImg.height;
            ctx.drawImage(domImg, 0, 0, domImg.width, domImg.height);

            return canvas;
        }

        function getBigimgTemp() { return canvasCache.getBigimgTemp(); }
        /** 用於判斷繪製位置 */
        var _tempDrawImage = {
            scale: -1,
            sx: 0, sy: 0,
            sWidth: 1, sHeight: 1,
            dx: 0, dy: 0,
            dWidth: 1, dHeight: 1,
            /** 是否已經執行銳化 */
            isSharpen: false,
            url: ""
        }

        /**
         * [private] bigimg 或 bigimgscale 渲染圖片
         * @param isImmediatelyRun 是否立即執行
         */
        async function bigimgDraw(isImmediatelyRun?: boolean) { await canvasRenderer.draw(isImmediatelyRun); }

        /** 銳化值 */
        let _sharpenValue = 0;
        /** 設定銳化值 */
        function setSharpenValue(val: number) {
            if (val !== _sharpenValue) {
                _sharpenValue = val;
                // 強制重新渲染
                bigimgDraw(true);
            }
        }
        /** 取得銳化值 */
        function getSharpenValue() { return _sharpenValue; }

        /**
         * [private] 改變內容大小
         */
        function setDataSize(width: number) {

            const ratio = getOriginalHeight() / getOriginalWidth();

            _nowWidth = width;
            _nowHeight = width * ratio;
            // 圖片載入完成只代表原始尺寸與來源資料已準備好；此時 _nowWidth/_nowHeight
            // 仍可能是上一個內容或預設值。setDataSize() 完成顯示尺寸設定後，才允許 bigimgDraw() 渲染。
            _isDisplaySizeInitialized = true;

            if (domMediaRenderer.getDataType() === "img") {
                _domData.style.width = Math.floor(width) + "px";
                _domData.style.height = Math.floor(width * ratio) + "px";
                _domImg.style.width = Math.floor(width) + "px";
                _domImg.style.height = Math.floor(width * ratio) + "px";
            }
            if (domMediaRenderer.getDataType() === "bigimg" || domMediaRenderer.getDataType() === "bigimgscale") {
                const w = width;
                const h = width * ratio;
                _domData.style.width = Math.floor(w) + "px";
                _domData.style.height = Math.floor(h) + "px";
            }
            if (domMediaRenderer.getDataType() === "video") {
                _domData.style.width = Math.floor(width) + "px";
                _domData.style.height = Math.floor(width * ratio) + "px";
                _domVideo.style.width = Math.floor(width) + "px";
                _domVideo.style.height = Math.floor(width * ratio) + "px";
            }
        }

        /**
         * [private] 更新 滾動條位置
         */
        function initScroll() { positionController.initScroll(); }

        async function initPoint(enableAnimation: boolean) { return positionController.initPoint(enableAnimation); }

        eventChangePixelRatio(() => {
            if (_isDpizoomAUto === true) {
                setDpizoom(window.devicePixelRatio, true);
            }
        })

        // -----------------------------------------------

        //#region Lib

        /**
         * 用於計算 canvas 的像素對齊
         */
        function alignToPixel(value: number) {
            const dpr = window.devicePixelRatio;
            return Math.floor(value * dpr) / dpr;
        }

        /**
         * 網頁比例縮放或是 DPI 變化時
         */
        function eventChangePixelRatio(func: () => void) {
            let remove: any = null;

            const updatePixelRatio = () => {
                if (remove != null) {
                    remove();
                }
                const mqString = `(resolution: ${window.devicePixelRatio}dppx)`;
                const media = matchMedia(mqString);
                media.addEventListener("change", updatePixelRatio);
                remove = function () { media.removeEventListener("change", updatePixelRatio) };
                func();
            }
            updatePixelRatio();
        }

        /**
         * 返回與整數的差值，例如 6.03 => 0.03
         */
        function findDifference(num: number) {
            return Math.abs(num - Math.round(num));
        }

        /**
         * 轉 number
         */
        function toNumber(t: string | number) {
            if (typeof (t) === "number") { return t } // 如果本來就是數字，直接回傳     
            if (typeof t === "string") { return Number(t.replace("px", "")); } // 如果是 string，則去掉 "px" 再轉換為數字
            return 0;
        }



    }
}

/**
 * 對齊位置
 */
export enum TiefseeviewAlignType {
    /** 上 */
    "top",
    /** 右 */
    "right",
    /** 下 */
    "bottom",
    /** 左 */
    "left",
    /** 右上 */
    "topRight",
    /** 右下 */
    "bottomRight",
    /** 左上 */
    "topLeft",
    /** 左下 */
    "bottomLeft",
    /** 中間 */
    "center",
    /**  */
    "none",
}

/**
 * 圖片縮放模式
 */
export enum TiefseeviewZoomType {

    /** 圖片大於視窗則縮放到視窗內，小於視窗則用圖片原始大小 */
    "fitWindowOrImageOriginal",

    /** 縮放到視窗內 */
    "fitWindow",
    /** 讓圖片填滿視窗寬度 */
    "fiwWindowWidth",
    /** 讓圖片填滿視窗高度 */
    "fitWindowHeight",

    /** 原始圖片大小 */
    "imageOriginal",

    /** 圖片寬度 (px) */
    "imageWidthPx",
    /** 圖片高度 (px) */
    "imageHeightPx",

    /** 視窗寬度 (%) */
    "windowWidthRatio",
    /** 視窗高度 (%) */
    "windowHeightRatio",
}

/**
 * 圖片渲染模式
 */
export enum TiefseeviewImageRendering {

    /** 預設值，運算成本較高 */
    "auto" = 0,

    /** 運算成本低，放大時呈現方塊 */
    "pixelated" = 1,

    /** 圖片大於100%時呈現方塊 */
    "autoOrPixelated" = 2,
}
