import { Lib } from "./Lib";
import { TiefseeScroll } from "./TiefseeScroll";

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

        var _worker: Worker;
        var _url: string; // 目前的圖片網址
        var _dataType: ("img" | "video" | "imgs" | "bigimg" | "bigimgscale") = "img"; // 資料類型

        var _dpiZoom = 1;
        var _isDpizoomAUto = true;
        var _degNow = 0; // 目前的角度 0~359
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

        const _hammerPan = new Hammer(_domDpiZoom); // 單指拖曳
        var _panStartX = 0; // 開始拖曳的坐標
        var _panStartY = 0;
        var _isMoving = false; // 目前是否正在拖曳圖片
        var _isPaning = false; // 目前是否正在拖曳圖片

        const _hammerPlural = new Hammer.Manager(_domDpiZoom); // 用於雙指旋轉與縮放
        var _tempRotateStareDegValue = 0; // 雙指旋轉，初始角度
        var _tempTouchRotateStarting = false; // 觸控旋轉 開始
        var _tempRotateStareDegNow = 0; // 觸控旋轉的起始角度
        var _temp_pinchZoom = 1; // 雙指捏合縮放的上一個值
        var _tempPinchCenterX = 0;
        var _tempPinchCenterY = 0;

        var _tempDateShowLoading = 0; // 控制laoding顯示的延遲
        var _tempOriginalWidth = 1; // 用於記錄圖片size 的暫存
        var _tempOriginalHeight = 1;
        var _tempImg: HTMLImageElement; // 圖片暫存
        var _tempCan: HTMLCanvasElement; // canvas暫存
        var _tempCanvasSN = 0; // 用於判斷canvas是否重複繪製
        var _tempTouchPadTime = 0; // 用於判斷是否為觸控板
        /** Bigimgscale 用於儲存圖片網址與比例 */
        var _arBigimgscale: { scale: number, url: string }[] = []

        var _isZoomWithWindow = true; // 圖片隨視窗縮放
        var _tempZoomWithWindow = false; // 縮放過圖片大小的話，就停止 圖片隨視窗縮放
        var _tempTiefseeviewZoomType: TiefseeviewZoomType = TiefseeviewZoomType.imageOriginal;
        var _tempTiefseeviewZoomTypeVal = 100;

        var _tempVideoDuration = -1; // 影片長度

        var _touchpadGestures = false; // 啟用觸控板手勢

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

        const _pinch = new Hammer.Pinch();
        const _rotate = new Hammer.Rotate();
        _rotate.recognizeWith(_pinch); // we want to detect both the same time
        _hammerPlural.add([_pinch, _rotate]); // add to the Manager

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
        this.setMargin = setMargin;
        this.getMargin = getMargin;
        this.getOverflowDistance = getOverflowDistance;
        this.setOverflowDistance = setOverflowDistance;
        this.getLoadingUrl = getLoadingUrl;
        this.setLoadingUrl = setLoadingUrl;
        this.getErrerUrl = getErrerUrl;
        this.setErrerUrl = setErrerUrl;
        this.getUrl = getUrl;
        this.getCanvasBase64 = getCanvasBase64; // 從 Canvas 取得 base64
        this.getCanvasBlob = getCanvasBlob;
        this.getIsZoomWithWindow = getIsZoomWithWindow;
        this.getVideoDuration = getVideoDuration;
        this.setIsZoomWithWindow = setIsZoomWithWindow;
        this.getSharpenValue = getSharpenValue;
        this.setSharpenValue = setSharpenValue;
        this.showClip = showClip;
        this.getClipInfo = getClipInfo;
        this.clipFull = clipFull;
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

        //#region 剪裁框

        // 是否已經初始化過剪裁框
        var _isInitClip = false;
        // 當前剪裁框是否啟用
        var _isClip = false;
        // 剪裁框
        var _domClipLT: HTMLDivElement;
        var _domClipRT: HTMLDivElement;
        var _domClipLB: HTMLDivElement;
        var _domClipRB: HTMLDivElement;
        var _domClipC: HTMLDivElement;
        var _domClipMask: HTMLDivElement;
        var _domClipMaskBg: HTMLDivElement;
        var _domClipSvg: HTMLDivElement;
        // 剪裁框size
        var _clipWidth = 100;
        var _clipHeight = 100;
        var _clipX = 100;
        var _clipY = 100;
        // 拖曳前的坐標
        var _clipStartX = 0;
        var _clipStartY = 0;
        var _clipStartWidth = 0;
        var _clipStartHeight = 0;

        /**
         * 顯示或隱藏剪裁框
         **/
        function showClip(isShow: boolean) {

            if (isShow) {
                if (_isInitClip === false) {
                    initClip();
                }
                _domClipLT.style.display = "block";
                _domClipRT.style.display = "block";
                _domClipLB.style.display = "block";
                _domClipRB.style.display = "block";
                _domClipC.style.display = "block";
                _domClipSvg.style.display = "block";
            } else {
                _domClipLT.style.display = "none";
                _domClipRT.style.display = "none";
                _domClipLB.style.display = "none";
                _domClipRB.style.display = "none";
                _domClipC.style.display = "none";
                _domClipSvg.style.display = "none";
            }
            _isClip = isShow;
            updateClip();
        }

        /**
         * 取得剪裁框的資訊
         */
        function getClipInfo() {
            return {
                x: Math.round(_clipX),
                y: Math.round(_clipY),
                width: Math.round(_clipWidth),
                height: Math.round(_clipHeight),
                deg: _degNow, // 旋轉角度   
                mirrorHorizontal: _mirrorHorizontal, // 鏡像-水平
                mirrorVertical: _mirrorVertical, // 鏡像-垂直
            }
        }

        /**
         * 剪裁框全滿
         */
        function clipFull() {
            if (_isClip === false) { return; }

            // 取得旋轉後的 size
            let rect = getRotateRect(getOriginalWidth(), getOriginalHeight(), 0, 0, _degNow);
            let oWidth = rect.rectWidth;
            let oHeight = rect.rectHeight;

            setClipXY(0, 0, oWidth, oHeight);
        }

        /**
         * 設定剪裁框的位置
         */
        function setClipXY(x: number, y: number, width: number, height: number) {
            if (_isClip === false) { return; }

            _clipX = x;
            _clipY = y;
            _clipWidth = width;
            _clipHeight = height;
            updateClip();
        }

        // [private] 初始化剪裁框
        function initClip() {

            // 4個角落的剪裁點、中間的拖曳區塊、黑色半透明遮罩
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
            _domTiefseeview.insertAdjacentHTML("beforeend", htmlClip);

            _domClipLT = _domTiefseeview.querySelector(".tiefseeview-clip-lt") as HTMLDivElement;
            _domClipRT = _domTiefseeview.querySelector(".tiefseeview-clip-rt") as HTMLDivElement;
            _domClipLB = _domTiefseeview.querySelector(".tiefseeview-clip-lb") as HTMLDivElement;
            _domClipRB = _domTiefseeview.querySelector(".tiefseeview-clip-rb") as HTMLDivElement;
            _domClipC = _domTiefseeview.querySelector(".tiefseeview-clip-c") as HTMLDivElement;
            _domClipMask = _domTiefseeview.querySelector(".tiefseeview-clip-mask-rect") as HTMLDivElement;
            _domClipMaskBg = _domTiefseeview.querySelector(".tiefseeview-clip-mask-bg") as HTMLDivElement;
            _domClipSvg = _domTiefseeview.querySelector(".tiefseeview-clip-svg") as HTMLDivElement;

            _isInitClip = true;

            // 把捲動事件傳遞給父層
            [_domClipLT, _domClipRT, _domClipLB, _domClipRB, _domClipC].forEach(dom => {
                dom.addEventListener("wheel", (e) => {
                    sendWheelEvent(e);
                    e.preventDefault();
                })
            });

            // 剪裁框事件
            const hammerClipLB = new Hammer(_domClipLB);
            const hammerClipLT = new Hammer(_domClipLT);
            const hammerClipRB = new Hammer(_domClipRB);
            const hammerClipRT = new Hammer(_domClipRT);
            const hammerClipC = new Hammer(_domClipC);
            hammerClipLB.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_ALL });
            hammerClipLT.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_ALL });
            hammerClipRB.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_ALL });
            hammerClipRT.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_ALL });
            hammerClipC.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_ALL });

            hammerClipLB.on("pan", (e) => { hammerClipMove("lb", e.deltaX, e.deltaY); });
            hammerClipLT.on("pan", (e) => { hammerClipMove("lt", e.deltaX, e.deltaY); });
            hammerClipRB.on("pan", (e) => { hammerClipMove("rb", e.deltaX, e.deltaY); });
            hammerClipRT.on("pan", (e) => { hammerClipMove("rt", e.deltaX, e.deltaY); });
            hammerClipC.on("pan", (e) => { hammerClipMove("c", e.deltaX, e.deltaY); });

            hammerClipLB.on("panstart", (e) => { hammerClipMoveStart("lb", e); });
            hammerClipLT.on("panstart", (e) => { hammerClipMoveStart("lt", e); });
            hammerClipRB.on("panstart", (e) => { hammerClipMoveStart("rb", e); });
            hammerClipRT.on("panstart", (e) => { hammerClipMoveStart("rt", e); });
            hammerClipC.on("panstart", (e) => { hammerClipMoveStart("c", e); });

            function hammerClipMoveStart(type: ("lt" | "rt" | "lb" | "rb" | "c"), e: HammerInput) {

                _clipStartWidth = _clipWidth;
                _clipStartHeight = _clipHeight;

                if (type === "lt") {
                    _clipStartX = e.deltaX + _clipX;
                    _clipStartY = e.deltaY + _clipY;
                }
                else if (type === "rt") {
                    _clipStartX = e.deltaX + _clipWidth;
                    _clipStartY = e.deltaY + _clipY;
                }
                else if (type === "lb") {
                    _clipStartX = e.deltaX + _clipX;
                    _clipStartY = e.deltaY + _clipHeight;
                }
                else if (type === "rb") {
                    _clipStartX = e.deltaX + _clipWidth;
                    _clipStartY = e.deltaY + _clipHeight;
                }
                else if (type === "c") {
                    _clipStartX = e.deltaX + _clipX;
                    _clipStartY = e.deltaY + _clipY;
                }
            }

            function hammerClipMove(type: ("lt" | "rt" | "lb" | "rb" | "c"), x: number, y: number) {

                const scale = getZoomRatio();
                let min = 50; // 剪裁框最小 size
                if (min * scale < 50) { min = 50 / scale; }

                x = x / scale;
                y = y / scale;

                if (type === "lt") {
                    if (_clipStartX + x > 0) {
                        _clipWidth = _clipStartWidth - x;
                    } else {
                        _clipWidth = _clipStartWidth + _clipStartX;
                    }
                    if (_clipStartY + y > 0) {
                        _clipHeight = _clipStartHeight - y;
                    } else {
                        _clipHeight = _clipStartHeight + _clipStartY;
                    }
                    if (_clipWidth > min) { // 避免剪裁框太小
                        _clipX = _clipStartX + x;
                    } else { // 如果剪裁框太小，就固定剪裁框的位置
                        _clipX = _clipStartX + _clipStartWidth - min;
                    }
                    if (_clipHeight > min) {
                        _clipY = _clipStartY + y;
                    } else {
                        _clipY = _clipStartY + _clipStartHeight - min;
                    }
                }
                if (type === "rt") {
                    _clipWidth = _clipStartX + x;
                    if (_clipStartY + y > 0) {
                        _clipHeight = _clipStartHeight - y;
                    } else {
                        _clipHeight = _clipStartHeight + _clipStartY;
                    }
                    if (_clipHeight > min) {
                        _clipY = _clipStartY + y;
                    } else {
                        _clipY = _clipStartY + _clipStartHeight - min;
                    }
                }
                if (type === "lb") {
                    if (_clipStartX + x > 0) {
                        _clipWidth = _clipStartWidth - x;
                    } else {
                        _clipWidth = _clipStartWidth + _clipStartX;
                    }
                    _clipHeight = _clipStartY + y;
                    if (_clipWidth > min) {
                        _clipX = _clipStartX + x;
                    } else {
                        _clipX = _clipStartX + _clipStartWidth - min;
                    }
                }
                if (type === "rb") {
                    _clipWidth = _clipStartX + x;
                    _clipHeight = _clipStartY + y;
                }
                if (type === "c") {

                    // 取得旋轉後的 size
                    let rect = getRotateRect(getOriginalWidth(), getOriginalHeight(), 0, 0, _degNow);
                    let oWidth = rect.rectWidth;
                    let oHeight = rect.rectHeight;


                    if (_clipStartX + x + _clipWidth < oWidth) {
                        _clipX = _clipStartX + x;
                    } else {
                        _clipX = oWidth - _clipWidth;
                    }
                    if (_clipStartY + y + _clipHeight < oHeight) {
                        _clipY = _clipStartY + y;
                    }
                    else {
                        _clipY = oHeight - _clipHeight;
                    }
                }
                updateClip();
            }

        }

        /**
         * [private] 更新剪裁框
         */
        function updateClip() {

            if (_isInitClip === false) { return; }
            if (_isClip === false) { return; }

            const scale = getZoomRatio(); // 根據縮放比例
            let min = 50; // 剪裁框最小 size
            if (min * scale < 50) { min = 50 / scale; }

            // 避免剪裁框太小
            if (_clipWidth < min) { _clipWidth = min; }
            if (_clipHeight < min) { _clipHeight = min; }

            // 取得原始圖片的size
            let oWidth = getOriginalWidth();
            let oHeight = getOriginalHeight();

            if (oWidth === 1 || oHeight === 1) { return; }

            // 取得旋轉後的 size
            const rect = getRotateRect(oWidth, oHeight, 0, 0, _degNow);
            oWidth = rect.rectWidth;
            oHeight = rect.rectHeight;

            // 避免剪裁框超出圖片範圍
            if (oWidth > min) {
                if (_clipX > oWidth) {
                    _clipX = oWidth - min;
                }
                if ((_clipX + _clipWidth) > oWidth) {
                    _clipWidth = oWidth - _clipX;
                }
            } else {
                _clipX = 0;
                _clipWidth = oWidth;
            }
            if (oHeight > min) {
                if (_clipY > oHeight) {
                    _clipY = oHeight - min;
                }
                if ((_clipY + _clipHeight) > oHeight) {
                    _clipHeight = oHeight - _clipY;
                }
            } else {
                _clipY = 0;
                _clipHeight = oHeight;
            }

            if (_clipX < 0) { _clipX = 0; }
            if (_clipY < 0) { _clipY = 0; }

            const conx = toNumber(_domCon.style.left);
            const cony = toNumber(_domCon.style.top);

            const boxSize = 20; // 角落剪裁點的 size
            const boxBorder = 10; // 角落剪裁點的外框寬度
            const ltx = (conx + _clipX * scale) - boxBorder;
            const lty = (cony + _clipY * scale) - boxBorder;
            const rtx = (conx + (_clipX + _clipWidth) * scale) - boxSize + boxBorder;
            const rty = (cony + _clipY * scale) - boxBorder;
            const lbx = (conx + _clipX * scale) - boxBorder;
            const lby = (cony + (_clipY + _clipHeight) * scale) - boxSize + boxBorder;
            const rbx = (conx + (_clipX + _clipWidth) * scale) - boxSize + boxBorder;
            const rby = (cony + (_clipY + _clipHeight) * scale) - boxSize + boxBorder;

            _domClipLT.style.left = ltx + "px";
            _domClipLT.style.top = lty + "px";
            _domClipRT.style.left = rtx + "px";
            _domClipRT.style.top = rty + "px";
            _domClipLB.style.left = lbx + "px";
            _domClipLB.style.top = lby + "px";
            _domClipRB.style.left = rbx + "px";
            _domClipRB.style.top = rby + "px";

            _domClipC.style.left = (conx + _clipX * scale) + "px";
            _domClipC.style.top = (cony + _clipY * scale) + "px";
            _domClipC.style.width = (_clipWidth * scale) + "px";
            _domClipC.style.height = (_clipHeight * scale) + "px";

            // 更新遮罩
            _domClipMaskBg.setAttribute("width", "100%");
            _domClipMaskBg.setAttribute("height", "100%");
            _domClipSvg.setAttribute("viewBox", `0 0 ${_domTiefseeview.offsetWidth} ${_domTiefseeview.offsetHeight}`);
            _domClipMask.setAttribute("x", (conx + (_clipX * scale)).toString());
            _domClipMask.setAttribute("y", (cony + (_clipY * scale)).toString());
            _domClipMask.setAttribute("width", (_clipWidth * scale).toString());
            _domClipMask.setAttribute("height", (_clipHeight * scale).toString());
        }

        //#endregion

        //#region 拖曳與縮放事件

        // 雙指旋轉  
        _hammerPlural.on("rotatestart", (e) => {
            _tempRotateStareDegNow = _degNow;
            _tempRotateStareDegValue = e.rotation - _degNow;
            _tempTouchRotateStarting = false;
        });
        _hammerPlural.on("rotate", async (e) => {

            let deg = (e.rotation - _tempRotateStareDegValue); // 取得旋轉角度

            if (_tempTouchRotateStarting === false) {
                if (Math.abs(_tempRotateStareDegNow - Math.abs(deg)) > _rotateCriticalValue) { // 旋轉超過特定角度，才會開始執行旋轉
                    _tempRotateStareDegValue -= (_tempRotateStareDegNow - deg);
                    deg += (_tempRotateStareDegNow - deg);
                    _tempTouchRotateStarting = true;
                }
            }
            if (_tempTouchRotateStarting) {
                setDeg(deg, e.center.x, e.center.y, false); // 無動畫旋轉
            }

        });
        _hammerPlural.on("rotateend", (e) => {
            _tempTouchRotateStarting = false;
            const r = _degNow % 90; // 如果不足 90 度
            if (r === 0) { return; }
            if (r > 45 || (r < 0 && r > -45)) {
                setDegForward(e.center.x, e.center.y, true); // 順時針旋轉
            } else {
                setDegReverse(e.center.x, e.center.y, true); // 逆時針旋轉
            }
        });

        /** 雙指縮放中 */
        var _isPinching = false;
        // 雙指捏合縮放
        _hammerPlural.on("pinchstart", (e) => {
            _isPinching = true;
            _temp_pinchZoom = 1;
            _tempPinchCenterX = e.center.x;
            _tempPinchCenterY = e.center.y;

            _tempZoomWithWindow = false;
        });
        _hammerPlural.on("pinch", (e) => { // pinchin
            requestAnimationFrame(() => {

                // 從兩指的中心進行縮放
                // 縮放前先把渲染模式改成成本較低的 pixelated
                zoomIn(e.center.x, e.center.y, (e.scale / _temp_pinchZoom), TiefseeviewImageRendering.pixelated);

                // 根據中心點的位移來拖曳圖片
                /*setXY(
                    toNumber(dom_con.style.left) - (temp_pinchCenterX - ev.center.x),
                    toNumber(dom_con.style.top) - (temp_pinchCenterY - ev.center.y),
                    0
                );*/
                _temp_pinchZoom = e.scale;
                _tempPinchCenterX = e.center.x;
                _tempPinchCenterY = e.center.y;
            })
        });
        _hammerPlural.on("pinchend", (e) => {
            _isPinching = false;
            setRendering(_rendering); // 縮放結束後，把渲染模式改回原本的縮放模式
        });


        // 滑鼠滾輪上下滾動時
        _domDpiZoom.addEventListener("wheel", (e: WheelEvent) => {

            e.preventDefault(); // 禁止頁面滾動

            // 避免在滾動條上面也觸發
            if (e.target !== _domDpiZoom) { return; }

            _tempZoomWithWindow = false;
            $(_domCon).stop(true, false);

            // @ts-ignore
            // wheelDeltaY 已被標記為過時
            let wheelDeltaY = e.wheelDeltaY;

            let isTouchPad: boolean;
            if (_touchpadGestures === false) {
                // 如果沒有啟用觸控板手勢，則一律視為滑鼠滾輪
                isTouchPad = false;
            }
            else if (e.deltaX !== 0) {
                // 如果有水平捲動，則視為觸控板
                isTouchPad = true;
            }
            else if (window.zoomFactor && wheelDeltaY) {
                // 當 wheelDeltaY 為 120 的倍數時，表示為滑鼠滾輪
                let dy = Math.abs(wheelDeltaY * window.zoomFactor);
                dy = dy > 120 ? dy % 120 : dy;
                if (Math.abs(120 - dy) < 2) {
                    isTouchPad = false;
                } else {
                    isTouchPad = true;
                }
            }
            else if (window.zoomFactor) {
                // Windows 將滑鼠設定成一次捲動 3 行時，deltaY 為 100
                // 如果 deltaY / 33.333 得到的結果是整數，表示為滑鼠滾輪
                let dy = Math.abs(e.deltaY * window.zoomFactor) / 33.33333333;
                if (findDifference(dy) < 0.00001) {
                    isTouchPad = false;
                } else {
                    isTouchPad = true;
                }
            }
            else {
                // 透過捲動距離來判斷是否為觸控板，如果系統設定滑鼠滾輪速度過低，這個方法就會失效
                // 且觸控板快速滑動時可能會大於100
                // isTouchPad = Math.abs(e.deltaX) < 100 && Math.abs(e.deltaY) < 100;

                // 因為有誤判的可能，所以在無法取得 zoomFactor 與 wheelDeltaY 的情況，一律視為滑鼠滾輪
                isTouchPad = false;
            }

            // 觸控板雙指移動
            if (isTouchPad || _tempTouchPadTime + 200 > new Date().getTime()) {

                _tempTouchPadTime = new Date().getTime(); // 記錄當前時間，在200毫秒內的捲動都當做觸控板

                requestAnimationFrame(() => {

                    if (e.ctrlKey === true) {

                        if (e.deltaY > 0) {
                            zoomOut(e.offsetX, e.offsetY);
                        }
                        else if (e.deltaY < 0) {
                            zoomIn(e.offsetX, e.offsetY);
                        }

                    } else {

                        let posX = e.deltaX;
                        let posY = e.deltaY;

                        // 如果一次捲動一頁，delta將會得到 1，所以直接乘上 100
                        if (e.deltaMode === 2) {
                            posX = Math.sign(posX) * 100;
                            posY = Math.sign(posY) * 100;
                        }

                        setXY(
                            toNumber(_domCon.style.left) - posX,
                            toNumber(_domCon.style.top) - posY,
                            0
                        ); // 平移
                        initPoint(false);
                    }

                })

            } else { // 一般的滑鼠滾輪
                // 縮放計算
                if (e.deltaX < 0 || e.deltaY < 0) { // 往上
                    _eventMouseWheel("up", e, e.offsetX, e.offsetY);
                } else { // 往下
                    _eventMouseWheel("down", e, e.offsetX, e.offsetY);
                }
            }

        }, true);

        // 拖曳開始
        _domDpiZoom.addEventListener("mousedown", (e) => {

            e.preventDefault();

            // 沒有出現捲動條就不要執行拖曳
            if (getHasOverflowX() === false && getHasOverflowY() === false) {

                // 模擬送出 mouseup ，避免拖曳視窗後導致touch事件變得異常
                var downEvent = new PointerEvent("pointerup", {
                    pointerId: 1,
                    bubbles: true,
                    pointerType: "mouse",
                });
                _domDpiZoom.dispatchEvent(downEvent);

                return;
            }

            // 避免在滾動條上面也觸發
            if (e.target !== _domDpiZoom) {
                _isMoving = false;
                _isPaning = false;
                return;
            }
            _isMoving = true;
            _isPaning = true;
            $(_domCon).stop(true, false);
            _panStartX = toNumber(_domCon.style.left);
            _panStartY = toNumber(_domCon.style.top);
        });
        _domDpiZoom.addEventListener("touchstart", (e) => {
            e.preventDefault();

            // 避免多指觸發
            if (e.touches.length > 1) {
                _isMoving = false;
                _isPaning = false;
                return;
            }

            // 避免在滾動條上面也觸發
            if (e.target !== _domDpiZoom) {
                _isMoving = false;
                _isPaning = false;
                return;
            }

            _isMoving = true;
            _isPaning = true;
            $(_domCon).stop(true, false);
            _panStartX = toNumber(_domCon.style.left);
            _panStartY = toNumber(_domCon.style.top);
        });

        // 拖曳
        _hammerPan.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_ALL });
        _hammerPan.on("pan", (e) => {
            requestAnimationFrame(() => {
                // 避免多指觸發
                if (e.maxPointers > 1) {
                    _isMoving = false;
                    _isPaning = false;
                    return;
                }

                // 沒有出現捲動條就不要執行拖曳
                if (getHasOverflowX() === false && getHasOverflowY() === false) {
                    return;
                }

                if (_isMoving === false) { return; }

                const deltaX = e.deltaX;
                const deltaY = e.deltaY;
                let left = _panStartX + deltaX;
                let top = _panStartY + deltaY;

                if (getHasOverflowY()) { // 高度大於視窗
                    if (top > _marginTop + _overflowDistance) { // 上
                        top = _marginTop + _overflowDistance;
                    }
                    let t = _domDpiZoom.offsetHeight - _domCon.offsetHeight - _marginBottom; // 下
                    if (top < t - _overflowDistance) {
                        top = t - _overflowDistance;
                    }
                } else {
                    let t = (_domDpiZoom.offsetHeight - _domCon.offsetHeight) / 2; // 置中的坐標
                    if (top > t + _overflowDistance) {
                        top = t + _overflowDistance;
                    }
                    if (top < t - _overflowDistance) {
                        top = t - _overflowDistance;
                    }
                }

                if (getHasOverflowX()) { // 寬度大於視窗
                    if (left > _marginLeft + _overflowDistance) { // 左
                        left = _marginLeft + _overflowDistance;
                    }
                    let l = _domDpiZoom.offsetWidth - _domCon.offsetWidth - _marginRight; // 右
                    if (left < l - _overflowDistance) {
                        left = l - _overflowDistance;
                    }
                } else {
                    let l = (_domDpiZoom.offsetWidth - _domCon.offsetWidth) / 2; // 置中的坐標
                    if (left > l + _overflowDistance) {
                        left = l + _overflowDistance;
                    }
                    if (left < l - _overflowDistance) {
                        left = l - _overflowDistance;
                    }
                }

                setXY(left, top, 0);
            })
        });

        // 拖曳 結束
        _hammerPan.on("panend", async (e) => {

            // 避免在滾動條上面也觸發
            // if (ev.target !== dom_tiefseeview) { return; }

            // 避免多指觸發
            if (e.maxPointers > 1) { return; }

            if (_isMoving === false) { return; }
            _isMoving = false;
            _isPaning = true;
            let velocity = e.velocity; // 加速度
            let velocityX = e.velocityX;
            let velocityY = e.velocityY;
            let duration = 10; // 動畫時間

            if (e.pointerType == "touch") { // 如果是觸控
                velocity *= 2;
                velocityX *= 2;
                velocityY *= 2;
            }

            duration = 150 + 100 * Math.abs(velocity); // 動畫時間
            if (duration > 1200) duration = 1200;

            $(_domCon).stop(true, false);

            // 速度小於 1 就不使用慣性
            if (Math.abs(velocity) < 1) {
                velocity = 0;
                velocityX = 0;
                velocityY = 0;
                duration = 10;
                initPoint(true);
                _isPaning = false;
                return;
            }

            const speed = 150; // 速度
            let top = toNumber(_domCon.style.top) + (velocityY * speed);
            let left = toNumber(_domCon.style.left) + (velocityX * speed);

            let hasOverflowX = false;
            let hasOverflowY = false;

            if (getHasOverflowY()) { // 高度大於視窗
                if (top > _marginTop + _overflowDistance) { // 上
                    top = _marginTop + _overflowDistance;
                    hasOverflowX = true;
                }
                let t = _domDpiZoom.offsetHeight - _domCon.offsetHeight - _marginBottom; // 下
                if (top < t - _overflowDistance) {
                    top = t - _overflowDistance;
                    hasOverflowX = true;
                }
            } else {
                let t = (_domDpiZoom.offsetHeight - _domCon.offsetHeight) / 2; // 置中的坐標
                if (top > t + _overflowDistance) {
                    top = t + _overflowDistance;
                    hasOverflowX = true;
                }
                if (top < t - _overflowDistance) {
                    top = t - _overflowDistance;
                    hasOverflowX = true;
                }
            }

            if (getHasOverflowX()) { // 寬度大於視窗
                if (left > _marginLeft + _overflowDistance) { // 左
                    left = _marginLeft + _overflowDistance;
                    hasOverflowY = true;
                }
                let l = _domDpiZoom.offsetWidth - _domCon.offsetWidth - _marginRight; // 右
                if (left < l - _overflowDistance) {
                    left = l - _overflowDistance;
                    hasOverflowY = true;
                }
            } else {
                let l = (_domDpiZoom.offsetWidth - _domCon.offsetWidth) / 2; // 置中的坐標
                if (left > l + _overflowDistance) {
                    left = l + _overflowDistance;
                    hasOverflowY = true;
                }
                if (left < l - _overflowDistance) {
                    left = l - _overflowDistance;
                    hasOverflowY = true;
                }
            }

            // 計算滑行距離
            /*let dep = Math.sqrt(Math.pow((toNumber(dom_con.style.top) - top), 2) + Math.pow((toNumber(dom_con.style.left) - left), 2));
            // console.log(dep, duration)
            if ((bool_overflowX || bool_overflowY) && dep < 300 * dpi) { // 距離太短就直接限制動畫時間
                duration = 300;
                return
            }*/

            await setXY(left, top, duration);
            _isPaning = false;
            initPoint(true);
        });

        //#endregion

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
            if (_domData.offsetWidth > 999999 || _domData.offsetHeight > 999999) {
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
                if (_domData.offsetWidth <= 1 || _domData.offsetHeight <= 1) {
                    return true;
                }
            } else {
                // 縮小下限為10px
                if (_domData.offsetWidth <= 10 || _domData.offsetHeight <= 10) {
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

        /**
         * 預載入圖片資源
         * @param url 網址
         * @returns true=載入完成、false=載入失敗
         */
        async function preloadImg(url: string, isInitSize: undefined | boolean = true) {

            const img = document.createElement("img");
            img.fetchPriority = "high"; // 設定圖片優先權
            const p = await new Promise((resolve, _) => {
                img.addEventListener("load", (e) => {
                    if (isInitSize) {
                        _tempOriginalWidth = img.naturalWidth; // 初始化圖片size
                        _tempOriginalHeight = img.naturalHeight;
                    }
                    resolve(true);
                });
                img.addEventListener("error", (e) => {
                    if (isInitSize) {
                        _tempOriginalWidth = 1;
                        _tempOriginalHeight = 1;
                    }
                    resolve(false);
                });
                img.src = url;
            });

            _tempImg = img;

            // img.src = "";
            // @ts-ignore
            // img = null;
            return <boolean>p;
        }

        /**
         * 載入空白圖片
         */
        async function loadNone() {
            await loadBigimg("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
        }

        /**
         * 載入並顯示 影片
         * @param url 
         * @returns 
         */
        async function loadVideo(url: string) {

            _url = url;

            _domVideo.onloadedmetadata = () => { // 載入完成時自動播放
                _domVideo.play();
            }

            const p = await new Promise((resolve, _) => {
                // 清除事件
                function clearEvent() {
                    _domVideo.removeEventListener("loadedmetadata", onLoadedMetadata);
                    _domVideo.removeEventListener("error", onError);
                }

                function onLoadedMetadata() {
                    clearEvent();
                    resolve(true);
                }

                function onError() {
                    clearEvent();
                    resolve(false);
                }

                _domVideo.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
                _domVideo.addEventListener("error", onError, { once: true });

                _domVideo.src = url;
            });

            // 如果載入期間，已經切換到其他圖片，就不要繼續執行
            if (_url !== url) { return; }

            if (p) {
                setDataType("video");

                _tempOriginalWidth = _domVideo.videoWidth; // 初始化圖片 size
                _tempOriginalHeight = _domVideo.videoHeight;
                _tempVideoDuration = isNaN(_domVideo.duration) ? -1 : _domVideo.duration;

                clipFull();
                return true;
            }
            else {
                _tempVideoDuration = -1;
                _tempOriginalWidth = 1;
                _tempOriginalHeight = 1;
                setDataType("img");
                await preloadImg(_errerUrl);
                _domImg.src = _errerUrl;
                return false;
            }
        }

        /**
         * 載入並顯示 - img
         * @param url 
         * @returns 
         */
        async function loadImg(url: string) {

            // setLoading(true);
            _url = url;
            const p = await preloadImg(url);
            // setLoading(false);
            setDataType("img");

            if (p === false) {
                await preloadImg(_errerUrl);
                _domImg.src = _errerUrl;
                return false;
            }

            // 清空畫布
            const ctx = _domBigimgCanvas.getContext("2d") as CanvasRenderingContext2D;
            ctx.clearRect(0, 0, _domBigimgCanvas.width, _domBigimgCanvas.height);

            _domImg.src = url;

            clipFull();

            return true;
        }

        /**
         * 載入並顯示 - canvas
         * @param url 
         * @returns 
         */
        async function loadBigimg(url: string) {

            // setLoading(true);
            _url = url;
            const p = await preloadImg(url);
            // setLoading(false);
            setDataType("bigimg");

            if (p === false) {
                setDataType("img");
                await preloadImg(_errerUrl);
                _domImg.src = _errerUrl;
                return false;
            }

            _tempBigimg = [];
            _tempDrawImage = {
                scale: -1,
                sx: 0, sy: 0,
                sWidth: 1, sHeight: 1,
                dx: 0, dy: 0,
                dWidth: 1, dHeight: 1,
                isSharpen: false,
                url: ""
            }

            _domImg.src = url;
            _tempCan = urlToCanvas(url)
            // setDataSize(getOriginalWidth());

            clipFull();

            return true;
        }

        /**
         * 載入已經縮放過的圖片並顯示 - canvas
         */
        async function loadBigimgscale(
            arUrl: { scale: number, url: string }[],
            w: number, h: number,
            zoomType: TiefseeviewZoomType, zoomVal: number) {

            _tempOriginalWidth = w; // 初始化圖片size
            _tempOriginalHeight = h;
            _arBigimgscale = arUrl;

            _url = _arBigimgscale[0].url;

            let scale = getZoomFull_scale(zoomType, zoomVal);
            let bigimgscaleItem = getBigimgscaleItem(scale);

            setDataType("bigimgscale");
            // setLoading(true);
            let p = await preloadImg(bigimgscaleItem.url, false);
            // setLoading(false);
            if (p === false) {
                setDataType("img");
                await preloadImg(_errerUrl);
                _domImg.src = _errerUrl;
                return false;
            }

            _tempBigimgscale = {};
            _tempBigimgscale[bigimgscaleItem.scale] = urlToCanvas(bigimgscaleItem.url)
            _tempBigimgscaleKey = [];
            _tempBigimgscaleKey.push(bigimgscaleItem.scale)

            setDataSize(getZoomFull_width(zoomType, zoomVal))
            _tempDrawImage = {
                scale: -1,
                sx: 0, sy: 0,
                sWidth: 1, sHeight: 1,
                dx: 0, dy: 0,
                dWidth: 1, dHeight: 1,
                isSharpen: false,
                url: ""
            }

            // dom_img.src = url;
            // temp_bigimg = [];
            // temp_can = urlToCanvas(bigimgscaleItem.url);
            // setDataSize(getOriginalWidth());

            clipFull();

            return true;
        }

        /**
         * [private]
         */
        function setDataType(type: ("img" | "video" | "imgs" | "bigimg" | "bigimgscale")) {

            _dataType = type;

            if (_dataType === "img") {
                _domImg.style.display = "";
                _domBigimg.style.display = "none";
                _domVideo.style.display = "none";
                _domVideo.src = "";
                return;
            }
            if (_dataType === "bigimg" || _dataType === "bigimgscale") {
                _domImg.style.display = "none";
                _domBigimg.style.display = "";
                _domVideo.style.display = "none";
                _domImg.src = "";
                _domVideo.src = "";
                return;
            }
            if (_dataType === "video") {
                _domImg.style.display = "none";
                _domBigimg.style.display = "none";
                _domVideo.style.display = "";
                _domImg.src = "";
                return;
            }
        }

        //#endregion

        /**
         * 取得縮放比例。原始1.00
         */
        function getZoomRatio(): number { return _domData.offsetWidth / getOriginalWidth(); }

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
        function setAlign(type: TiefseeviewAlignType) {

            let typeHorizontal: ("left" | "center" | "right") = "center"; // 水平對齊方式
            let typeVertical: ("top" | "center" | "bottom") = "center"; // 垂直對齊方式
            let x: number = 0;
            let y: number = 0;

            if (type === TiefseeviewAlignType.none) {
                return;
            }
            if (type === TiefseeviewAlignType.top) {
                typeHorizontal = "center";
                typeVertical = "top";
            }
            if (type === TiefseeviewAlignType.right) {
                typeHorizontal = "right";
                typeVertical = "center";
            }
            if (type === TiefseeviewAlignType.left) {
                typeHorizontal = "left";
                typeVertical = "center";
            }
            if (type === TiefseeviewAlignType.bottom) {
                typeHorizontal = "center";
                typeVertical = "bottom";
            }
            if (type === TiefseeviewAlignType.topRight) {
                typeHorizontal = "right";
                typeVertical = "top";
            }
            if (type === TiefseeviewAlignType.bottomRight) {
                typeHorizontal = "right";
                typeVertical = "bottom";
            }
            if (type === TiefseeviewAlignType.topLeft) {
                typeHorizontal = "left";
                typeVertical = "top";
            }
            if (type === TiefseeviewAlignType.bottomLeft) {
                typeHorizontal = "left";
                typeVertical = "bottom";
            }
            if (type === TiefseeviewAlignType.center) {
                typeHorizontal = "center";
                typeVertical = "center";
            }

            if (typeHorizontal === "left") {
                x = _marginLeft;
            }
            if (typeHorizontal === "center") {
                x = (_domDpiZoom.offsetWidth - _domCon.offsetWidth) / 2;
            }
            if (typeHorizontal === "right") {
                x = _domDpiZoom.offsetWidth - _domCon.offsetWidth - _marginRight;
            }

            if (typeVertical === "top") {
                y = _marginTop;
            }
            if (typeVertical === "center") {
                y = (_domDpiZoom.offsetHeight - _domCon.offsetHeight) / 2;
            }
            if (typeVertical === "bottom") {
                y = _domDpiZoom.offsetHeight - _domCon.offsetHeight - _marginBottom;
            }

            setXY(x, y, 0);
            initPoint(false);
        }

        /**
         * 取得圖片原始寬度
         */
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
            if (_dataType !== "video") { return -1; }
            return _tempVideoDuration;
        }

        /**
         * 順時針旋轉 90°
         * @param enableAnimation 是否使用動畫
         */
        async function setDegForward(x: number | undefined, y: number | undefined, enableAnimation: boolean = true) {
            let deg: number = _degNow;
            deg = (Math.floor(deg / 90) + 1) * 90;
            await setDeg(deg, x, y, enableAnimation);
        }
        /**
         * 逆時針旋轉 90°
         * @param enableAnimation 是否使用動畫
         */
        async function setDegReverse(x: number | undefined, y: number | undefined, enableAnimation: boolean = true) {
            let deg: number = _degNow;
            deg = (Math.ceil(deg / 90) - 1) * 90;
            await setDeg(deg, x, y, enableAnimation);
        }

        /**
         * 取得 是否水平鏡像
         */
        function getMirrorHorizontal() { return _mirrorHorizontal; }
        /**
         * 設定 水平鏡像
         * @param isMirrored true=水平鏡像、false=原始狀態 
         * @param boolAnimation 是否使用動畫
         */
        async function setMirrorHorizontal(isMirrored: boolean, x?: number, y?: number) {

            // 如果有啟用剪裁框，則重新計算剪裁框的位置
            let isUpdateClip = false;
            let clipInfo: { x: number, y: number, width: number, height: number, deg: number } = { x: 0, y: 0, width: 0, height: 0, deg: 0 };
            if (_isClip && _mirrorHorizontal !== isMirrored) {
                isUpdateClip = true;
                clipInfo = getClipInfo();
            }

            if (_degNow !== 0) {
                setDeg(360 - _degNow, undefined, undefined, true); // 先旋轉成鏡像後的角度
            }

            _mirrorHorizontal = isMirrored;
            _eventChangeMirror(_mirrorHorizontal, _mirrorVertical);

            if (x === undefined || y === undefined) {
                x = _domDpiZoom.offsetWidth / 2;
                y = _domDpiZoom.offsetHeight / 2;
            }

            // 取得顯示範圍的中心點
            let left = -toNumber(_domCon.style.left) + x;
            let top = -toNumber(_domCon.style.top) + y;

            // 計算鏡像後的坐標
            left = _domData.getBoundingClientRect().width - left;
            // top = dom_data.getBoundingClientRect().height - top;

            // 取得中心點在旋轉前的實際坐標
            let origPoint = getOrigPoint(left, top, toNumber(_domData.style.width), toNumber(_domData.style.height), _degNow);
            left = origPoint.x;
            top = origPoint.y;

            // 取得旋轉回原本角度的坐標
            let rotateRect = getRotateRect(toNumber(_domData.style.width), toNumber(_domData.style.height), left, top, _degNow);
            left = rotateRect.x;
            top = rotateRect.y;

            // 轉換成定位用的值，並移動回中心點
            left = -left + x;
            top = -top + y;

            await setTransform(undefined, undefined, false);

            setXY(left, top, 0);
            if (getHasOverflowX() === false) { // 在圖片有滾動條且指定坐標來鏡像時，允許超出視窗
                initPoint(false);
            }

            // 如果有啟用剪裁框，則重新計算剪裁框的位置
            if (isUpdateClip) {
                // 計算圖片旋轉後的大小
                const rect = getRotateRect(getOriginalWidth(), getOriginalHeight(), 0, 0, _degNow);

                // 鏡像後的坐標
                const clipX = rect.rectWidth - clipInfo.x - clipInfo.width;

                // 設定剪裁框的位置
                setClipXY(clipX, clipInfo.y, clipInfo.width, clipInfo.height);
            }
        }

        /**
         * 取得 是否垂直鏡像
         */
        function getMirrorVertica() { return _mirrorVertical; }
        /**
         * 設定 垂直鏡像
         * @param isMirror true=垂直鏡像、false=原始狀態 
         * @param boolAnimation 是否使用動畫
         */
        async function setMirrorVertica(isMirror: boolean, x?: number, y?: number) {

            // 如果有啟用剪裁框，則重新計算剪裁框的位置
            let isUpdateClip = false;
            let clipInfo: { x: number, y: number, width: number, height: number, deg: number } = { x: 0, y: 0, width: 0, height: 0, deg: 0 };
            if (_isClip && _mirrorVertical !== isMirror) {
                isUpdateClip = true;
                clipInfo = getClipInfo();
            }

            if (_degNow !== 0) {
                setDeg(360 - _degNow, undefined, undefined, true); // 先旋轉成鏡像後的角度
            }

            _mirrorVertical = isMirror;
            _eventChangeMirror(_mirrorHorizontal, _mirrorVertical);

            if (x === undefined || y === undefined) {
                x = (_domDpiZoom.offsetWidth / 2);
                y = (_domDpiZoom.offsetHeight / 2);
            }

            // 取得顯示範圍的中心點
            let left = -toNumber(_domCon.style.left) + x;
            let top = -toNumber(_domCon.style.top) + y;

            // 計算鏡像後的坐標
            // left = dom_data.getBoundingClientRect().width - left;
            top = _domData.getBoundingClientRect().height - top;

            // 取得中心點在旋轉前的實際坐標
            let origPoint = getOrigPoint(left, top, toNumber(_domData.style.width), toNumber(_domData.style.height), _degNow);
            left = origPoint.x;
            top = origPoint.y;

            // 取得旋轉回原本角度的坐標
            let rotateRect = getRotateRect(toNumber(_domData.style.width), toNumber(_domData.style.height), left, top, _degNow);
            left = rotateRect.x;
            top = rotateRect.y;

            // 轉換成定位用的值，並移動回中心點
            left = -left + x;
            top = -top + y;

            await setTransform(undefined, undefined, false);

            setXY(left, top, 0);
            if (getHasOverflowY() === false) { // 在圖片有滾動條且指定坐標來鏡像時，允許超出視窗
                initPoint(false);
            }

            // 如果有啟用剪裁框，則重新計算剪裁框的位置
            if (isUpdateClip) {
                // 計算圖片旋轉後的大小
                let rect1 = getRotateRect(getOriginalWidth(), getOriginalHeight(), 0, 0, _degNow);

                // 鏡像後的坐標
                let clipY = rect1.rectHeight - clipInfo.y - clipInfo.height;

                // 設定剪裁框的位置
                setClipXY(clipInfo.x, clipY, clipInfo.width, clipInfo.height);
            }
        }

        /**
         * 取得 旋轉角度
         * @returns 0 ~ 359
         */
        function getDeg(): number { return _degNow; }
        /**
          * 設定 旋轉角度
          * @param deg 角度
          * @param enableAnimation 是否使用動畫
          */
        async function setDeg(deg: number, x: number | undefined, y: number | undefined, enableAnimation: boolean = true) {

            // 如果有啟用剪裁框，且旋轉角度是90的倍數，則重新計算剪裁框的位置
            let isUpdateClip = false;
            let clipInfo: { x: number, y: number, width: number, height: number, deg: number } = { x: 0, y: 0, width: 0, height: 0, deg: 0 };
            if (_isClip) {
                if (deg % 90 === 0 && _degNow % 90 === 0 && deg !== _degNow) {
                    clipInfo = getClipInfo(); // 記錄旋轉前的 clip 位置
                    isUpdateClip = true;
                }
            }

            // 設定旋轉角度
            _degNow = deg;
            _eventChangeDeg(_degNow);
            await setTransform(x, y, enableAnimation);

            // 如果有啟用剪裁框，且旋轉角度是90的倍數，則重新計算剪裁框的位置
            if (isUpdateClip) {
                // 計算剪裁框在圖片旋轉前的位置
                let origPoint1 = getOrigPoint(clipInfo.x, clipInfo.y, getOriginalWidth(), getOriginalHeight(), clipInfo.deg);
                let origPoint2 = getOrigPoint(clipInfo.x + clipInfo.width, clipInfo.y + clipInfo.height, getOriginalWidth(), getOriginalHeight(), clipInfo.deg);

                // 計算旋轉後的剪裁框位置
                let rect1 = getRotateRect(getOriginalWidth(), getOriginalHeight(), origPoint1.x, origPoint1.y, _degNow);
                let rect2 = getRotateRect(getOriginalWidth(), getOriginalHeight(), origPoint2.x, origPoint2.y, _degNow);

                // 設定剪裁框的位置
                let rect = {
                    x: Math.min(rect1.x, rect2.x),
                    y: Math.min(rect1.y, rect2.y),
                    width: Math.abs(rect1.x - rect2.x),
                    height: Math.abs(rect1.y - rect2.y)
                }
                setClipXY(rect.x, rect.y, rect.width, rect.height);
            }

        }

        /**
         * 取得 圖片的坐標
         */
        function getXY() {
            return {
                x: toNumber(_domCon.style.left),
                y: toNumber(_domCon.style.top)
            };
        }
        /**
         * 設定 圖片的坐標
         * @param left 
         * @param top 
         * @param animationDuration 動畫時間(毫秒)
         */
        async function setXY(left: number | undefined, top: number | undefined, animationDuration: number) {

            // 允許只填單一參數，未填的使用目前的坐標
            if (top === undefined) { top = toNumber(_domCon.style.top) }
            if (left === undefined) { left = toNumber(_domCon.style.left) }

            _eventChangeXY(left, top);

            if (animationDuration <= 0) {

                _domCon.style.top = Math.round(top) + "px";
                _domCon.style.left = Math.round(left) + "px";
                initScroll(); // 初始化滾動條的位置(跟隨圖片位置同步)

            } else {

                await new Promise((resolve, reject) => {

                    $(_domCon).animate(
                        {
                            "top": top, // 自訂用於動畫的變數
                            "left": left,
                        },
                        {
                            step: function (now: any, fx: any) {
                                // @ts-ignore
                                let data: { left: number, top: number } = $(_domData).animate()[0]; // 取得記錄所有動畫變數的物件
                                _domCon.style.top = data.top + "px";
                                _domCon.style.left = data.left + "px";
                                bigimgDraw();
                                initScroll(); // 初始化滾動條的位置(跟隨圖片位置同步)
                            },
                            duration: animationDuration, // 動畫時間
                            start: () => { },
                            complete: () => { // 動畫結束時
                                _domCon.style.top = Math.round(top) + "px";
                                _domCon.style.left = Math.round(left) + "px";
                                resolve(0);
                            },
                            easing: "easeOutExpo"
                        });
                })
            }
            bigimgDraw();
        }

        /**
         * 向特定方向移動圖片
         * @param type 移動方向
         * @param distance 移動距離
         */
        function move(type: ("up" | "right" | "down" | "left"), distance: number = 100) {
            const point = getXY();
            if (type === "up") {
                setXY(point.x, point.y + distance, 0);
            }
            if (type === "down") {
                setXY(point.x, point.y - distance, 0);
            }
            if (type === "right") {
                setXY(point.x + distance, point.y, 0);
            }
            if (type === "left") {
                setXY(point.x - distance, point.y, 0);
            }
            initPoint(false);
        }

        /**
         * 旋轉跟鏡像初始化
         * @param enableAnimation 是否使用動畫
         */
        async function transformRefresh(enableAnimation: boolean = true) {
            if (_mirrorVertical === true) {
                await setMirrorVertica(false);
            }
            if (_mirrorHorizontal === true) {
                await setMirrorHorizontal(false);
            }
            await setDeg(0, undefined, undefined, enableAnimation);
        }

        /**
         * 設定 transform (旋轉、鏡像)
         * @param enableAnimation 是否使用動畫
         */
        async function setTransform(x: number | undefined, y: number | undefined, enableAnimation: boolean = true) {

            $(_domData).stop(true, false);

            // 動畫時間
            let duration: number = _transformDuration;
            if (enableAnimation == false) {
                duration = 0; // 無動畫
            }

            // 鏡像
            let scaleX = 1;
            if (_mirrorHorizontal === true) { scaleX = -1; }
            let scaleY = 1;
            if (_mirrorVertical === true) { scaleY = -1; }

            if (duration <= 0) {
                // 如果角度超過360，就初始化
                if (_degNow <= 0 || _degNow >= 360) { _degNow = _degNow - Math.floor(_degNow / 360) * 360; } // 避免超過360               
                $(_domData).animate({ "transform_rotate": _degNow, "transform_scaleX": scaleX, "transform_scaleY": scaleY, }, { duration: 0 });
                _domData.style.transform = `rotate(${_degNow}deg) scaleX(${scaleX}) scaleY(${scaleY})`;

                _domData.setAttribute("transform_rotate", _degNow.toString());
                initPoint(false);
                return;
            }

            await new Promise((resolve, _) => {

                $(_domData).animate({
                    "transform_rotate": _degNow, // 自訂用於動畫的變數
                    "transform_scaleX": scaleX,
                    "transform_scaleY": scaleY,
                }, {
                    start: () => { },
                    step: (now: any, fx: any) => {

                        // if (fx.prop == "transform_rotate") { }

                        // @ts-ignore
                        let andata: { transform_rotate, transform_scaleX, transform_scaleY } = $(_domData).animate()[0]; // 取得記錄所有動畫變數的物件

                        // 沒有指定從哪裡開始旋轉，就從中間
                        if (x === undefined) { x = (_domDpiZoom.offsetWidth / 2); }
                        if (y === undefined) { y = (_domDpiZoom.offsetHeight / 2); }

                        // 取得旋轉點在在旋轉前的位置(絕對坐標)
                        let x2 = x - toNumber(_domCon.style.left);
                        let y2 = y - toNumber(_domCon.style.top);

                        // 取得旋轉點在旋轉前的位置(相對坐標)
                        let degNow = _domData.getAttribute("transform_rotate");
                        if (degNow === null) { degNow = "0"; }
                        let rect = getOrigPoint(x2, y2, _domData.offsetWidth, _domData.offsetHeight, toNumber(degNow));
                        let x4 = rect.x
                        let y4 = rect.y

                        // 計算旋轉後的坐標
                        let rect2 = getRotateRect(_domData.offsetWidth, _domData.offsetHeight, x4, y4, andata.transform_rotate);

                        _domData.style.transform = `rotate(${andata.transform_rotate}deg) scaleX(${andata.transform_scaleX}) scaleY(${andata.transform_scaleY})`;
                        _domData.setAttribute("transform_rotate", andata.transform_rotate); // 儲存目前動畫旋轉的角度
                        setXY(x - rect2.x, y - rect2.y, 0);

                        initPoint(false);

                    },
                    duration: duration, // 動畫時間

                    complete: () => { // 動畫結束時

                        // 如果角度超過360，就初始化
                        if (_degNow <= 0 || _degNow >= 360) { _degNow = _degNow - Math.floor(_degNow / 360) * 360; } // 避免超過360               
                        $(_domData).animate({ "transform_rotate": _degNow, "transform_scaleX": scaleX, "transform_scaleY": scaleY, }, { duration: 0 });
                        _domData.style.transform = `rotate(${_degNow}deg) scaleX(${scaleX}) scaleY(${scaleY})`;

                        _domData.setAttribute("transform_rotate", _degNow.toString());
                        initPoint(false);
                        resolve(0);
                    },
                    easing: "linear"
                });
            })
        }

        /**
         * 目前的 圖片縮放比例
         */
        function getScale() {
            const w = toNumber(_domData.style.width); // 原始圖片大小(旋轉前的大小)
            const scale = w / getOriginalWidth(); // 目前的 圖片縮放比例
            return scale;
        }

        /**
         * 套用 縮放圖片
         * @param type 縮放類型
         * @param val 附加參數，例如以px或%進行縮放時，必須另外傳入number
         */
        function zoomFull(type: TiefseeviewZoomType, val?: number, x?: number, y?: number) {

            // 圖片隨視窗縮放
            _tempTiefseeviewZoomType = type;
            if (val != undefined) { _tempTiefseeviewZoomTypeVal = val; }
            if (type === TiefseeviewZoomType.windowWidthRatio || type === TiefseeviewZoomType.windowHeightRatio ||
                type === TiefseeviewZoomType.fiwWindowWidth || type === TiefseeviewZoomType.fitWindowHeight ||
                type === TiefseeviewZoomType.fitWindow || type === TiefseeviewZoomType.fitWindowOrImageOriginal) {

                _tempZoomWithWindow = true;
            } else {
                _tempZoomWithWindow = false;
            }

            const w = getZoomFull_width(type, val);
            setDataSize(w);
            setXY(
                (toNumber(_domCon.style.left)) * 0,
                (toNumber(_domCon.style.top)) * 0,
                0
            );
            initPoint(false);
            _eventChangeZoom(getZoomRatio() * _dpiZoom);
            setRendering(_rendering);
        }
        /** 取得縮放圖片後的 縮放比例 */
        function getZoomFull_scale(type: TiefseeviewZoomType, val?: number) {
            const w = getZoomFull_width(type, val);
            return w / getOriginalWidth();
        }
        /** 取得縮放圖片後的 寬度 (用於套用設定) */
        function getZoomFull_width(type: TiefseeviewZoomType, val?: number) {
            if (type === undefined) { type = TiefseeviewZoomType.fitWindow; }
            if (val === undefined) { val = 100; }

            let width = 1;

            // 取得圖片在原始大小下，旋轉後的實際長寬(避免圖片經縮放後，長寬比例失去精度)
            const rect = getRotateRect(getOriginalWidth(), getOriginalHeight(), 0, 0, _degNow);
            const dom_con_offsetWidth = rect.rectWidth;
            const dom_con_offsetHeight = rect.rectHeight;

            if (type === TiefseeviewZoomType.fitWindowOrImageOriginal) {
                if (getOriginalWidth() / _dpiZoom > (_domDpiZoom.offsetWidth - _marginLeft - _marginRight) ||
                    getOriginalHeight() / _dpiZoom > (_domDpiZoom.offsetHeight - _marginTop - _marginBottom)) { // 圖片比視窗大時
                    type = TiefseeviewZoomType.fitWindow; // 縮放至視窗大小
                } else {
                    type = TiefseeviewZoomType.imageOriginal; // 圖片原始大小
                }
            }
            // 圖片原始大小
            if (type === TiefseeviewZoomType.imageOriginal) {
                width = getOriginalWidth();
                width = width / _dpiZoom;
            }
            if (type === TiefseeviewZoomType.fitWindow) { // 縮放至視窗大小
                const ratioW = dom_con_offsetWidth / (_domDpiZoom.offsetWidth - _marginLeft - _marginRight)
                const ratioH = dom_con_offsetHeight / (_domDpiZoom.offsetHeight - _marginTop - _marginBottom)
                if (ratioW > ratioH) {
                    type = TiefseeviewZoomType.fiwWindowWidth;
                } else {
                    type = TiefseeviewZoomType.fitWindowHeight;
                }
            }
            if (type === TiefseeviewZoomType.fiwWindowWidth) { // 寬度全滿
                val = 100;
                type = TiefseeviewZoomType.windowWidthRatio;
            }
            if (type === TiefseeviewZoomType.fitWindowHeight) { // 高度全滿
                val = 100;
                type = TiefseeviewZoomType.windowHeightRatio;
            }
            if (type === TiefseeviewZoomType.windowWidthRatio) { // 以視窗寬度比例設定
                let w = _domDpiZoom.offsetWidth - _marginLeft - _marginRight - 5; // 顯示範圍 - 邊距
                if (w < 10) { w = 10; }
                const ratio = getOriginalWidth() / dom_con_offsetWidth;
                width = w * ratio * (val / 100);
            }
            if (type === TiefseeviewZoomType.windowHeightRatio) { // 以視窗高度比例設定
                let w = _domDpiZoom.offsetHeight - _marginTop - _marginBottom - 5; // 顯示範圍 - 邊距
                if (w < 10) { w = 10; }
                const ratio = getOriginalWidth() / dom_con_offsetWidth; // 旋轉後的比例
                const ratio_xy = dom_con_offsetWidth / dom_con_offsetHeight; // 旋轉後圖片長寬的比例
                width = w * ratio * ratio_xy * (val / 100);
            }

            if (type === TiefseeviewZoomType.imageWidthPx) { // 以絕對寬度設定
                const ratio = getOriginalWidth() / dom_con_offsetWidth;
                width = toNumber(val) * ratio;
                width = width / _dpiZoom;
            }
            if (type === TiefseeviewZoomType.imageHeightPx) { // 以絕對高度設定
                const ratio = getOriginalWidth() / dom_con_offsetWidth; // 旋轉後的比例
                const ratio_xy = dom_con_offsetWidth / dom_con_offsetHeight; // 旋轉後圖片長寬的比例
                width = toNumber(val) * ratio * ratio_xy;
                width = width / _dpiZoom;
            }

            return width;
        }

        /**
         * 放大
         * @param x 
         * @param y 
         * @param zoomRatio 渲染模式 (僅套用css，不會覆寫設定
         */
        function zoomIn(x?: number, y?: number, zoomRatio?: number, rendering?: TiefseeviewImageRendering) {

            // 未填入參數則從中央進行縮放
            if (x === undefined) { x = _domDpiZoom.offsetWidth / 2; }
            if (y === undefined) { y = _domDpiZoom.offsetHeight / 2; }

            // 未填入縮放比例，就是用預設縮放比例
            if (zoomRatio === undefined) { zoomRatio = _zoomRatio }

            // 渲染模式
            if (rendering === undefined) {
                rendering = _rendering
            }
            setRendering(rendering, true); // 單純套用css，而不覆寫設定

            // 圖片縮放上限
            if (zoomRatio === 1) { return; }
            if (zoomRatio > 1 && _eventLimitMax()) { return; }
            if (zoomRatio < 1 && _eventLimitMin()) { return; }

            setDataSize(_domData.offsetWidth * zoomRatio);

            var xxx = x - toNumber(_domCon.style.left);
            var yyy = y - toNumber(_domCon.style.top);

            var xx2 = _domCon.offsetWidth - _domCon.offsetWidth / zoomRatio;
            var yy2 = _domCon.offsetHeight - _domCon.offsetHeight / zoomRatio;

            setXY(
                (toNumber(_domCon.style.left) - ((xxx / _domCon.offsetWidth) * xx2) * zoomRatio),
                (toNumber(_domCon.style.top) - ((yyy / _domCon.offsetHeight) * yy2) * zoomRatio),
                0
            );

            initPoint(false);
            _eventChangeZoom(getZoomRatio() * _dpiZoom);
        }
        /**
         * 縮小
         * @param x 
         * @param y 
         */
        function zoomOut(x?: number, y?: number, zoomRatio?: number) {
            // 未填入縮放比例，就是用預設縮放比例
            if (zoomRatio === undefined) {
                zoomRatio = (1 / _zoomRatio)
            }
            zoomIn(x, y, zoomRatio);
        }

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

        /**
         * 從 Canvas 取得 base64
         */
        async function getCanvasBase64(zoom: number, quality: "high" | "low" | "medium") {
            const blob = await getCanvasBlob(zoom, quality);
            if (blob == null) { return ""; }
            const base64 = await blobToBase64(blob) as string;
            return base64;
        }

        /**
         * 從 Canvas 取得 Blob
         */
        async function getCanvasBlob(zoom: number, quality: "high" | "low" | "medium", type = "png", q = 0.8) {

            let canvas = await getCanvas();
            if (canvas === null) { return null; }

            if (zoom < 1) {
                canvas = getCanvasZoom(canvas, zoom, quality);
            }

            let blob: Blob | null = null;

            await new Promise((resolve, reject) => {
                if (canvas === null) { return null; }

                let outputType = "image/png";
                if (_dataType === "video") {
                    outputType = "image/jpeg";
                }
                if (type === "webp") {
                    outputType = "image/webp";
                }
                if (type === "jpg" || type === "jpeg") {
                    outputType = "image/jpeg";

                    // 背景色改成白色
                    const canvasNew = document.createElement("canvas");
                    const ctx = canvasNew.getContext("2d") as CanvasRenderingContext2D;
                    canvasNew.width = canvas.width;
                    canvasNew.height = canvas.height;
                    ctx.fillStyle = "#FFFFFF"; // 填滿顏色
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
                    canvas = canvasNew;
                }

                canvas.toBlob((b) => {
                    blob = b;
                    resolve(true);
                }, outputType, q);

            })

            return blob;
        }

        /**
         * [private] 取得縮放比例 100% 的 Canvas
         */
        async function getCanvas() {

            if (_dataType === "bigimg") {
                return _tempCan;
            }

            if (_dataType === "img") {
                _tempCan = document.createElement("canvas");
                _tempCan.width = getOriginalWidth();
                _tempCan.height = getOriginalHeight();
                const ctx = _tempCan.getContext("2d") as CanvasRenderingContext2D;
                ctx.drawImage(_domImg, 0, 0, getOriginalWidth(), getOriginalHeight());
                return _tempCan;
            }

            if (_dataType === "video") {
                _tempCan = document.createElement("canvas");
                _tempCan.width = getOriginalWidth();
                _tempCan.height = getOriginalHeight();
                const ctx = _tempCan.getContext("2d") as CanvasRenderingContext2D;
                ctx.drawImage(_domVideo, 0, 0, getOriginalWidth(), getOriginalHeight());
                return _tempCan;
            }

            if (_dataType === "bigimgscale") { // 未測試

                if (_tempBigimgscale[1] !== undefined) {
                    return _tempBigimgscale[1];

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
                            _tempBigimgscale[1] = urlToCanvas(tempUrl)
                            resolve(true);
                        });
                        domImg.addEventListener("error", (e) => {
                            resolve(false);
                        })
                        domImg.src = tempUrl;
                    })

                    if (isImageLoaded) {
                        if (_tempBigimgscale[1] !== undefined) {
                            return _tempBigimgscale[1];
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
         * [private] 取得 Bigimgscale 目前應該載入哪一個比例的圖片
         */
        function getBigimgscaleItem(scale?: number) {

            if (scale === undefined) { scale = getScale(); }
            let dpiZoom = _dpiZoom;
            if (dpiZoom < 1) { dpiZoom = 1; }
            let ret = _arBigimgscale[0];

            for (let i = _arBigimgscale.length - 1; i >= 0; i--) {
                const item = _arBigimgscale[i];
                if (item.scale / dpiZoom >= scale) {
                    ret = item;
                    break;
                }
            }
            return ret;
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

        // #region BigimgTemp 

        /**
         * [private] 根據目前的縮放比例來取得縮小後的圖片
         * @returns 
         */
        function getBigimgTemp() {
            if (_dataType === "bigimgscale") {
                return getBigimgTemp_bigimgscale();
            }
            if (_dataType === "bigimg") {
                return getBigimgTemp_bigimg();
            }
            return null;
        }


        var _tempBigimg: (undefined | HTMLCanvasElement | ImageBitmap)[] = [];
        /**
         * [private]
         */
        function getBigimgTemp_bigimg() {

            let x = 0.8; // 每次縮小的比例
            let len = 6; // 最多縮小幾次

            let scale = getScale(); // 目前的 圖片縮放比例

            // 如果不需要縮小，就直接回傳
            if (scale > 0.5) {
                return {
                    img: _tempCan,
                    scale: 1
                }
            }

            // 第一次縮小
            if (_tempBigimg[0] === undefined) {
                _tempBigimg[0] = getCanvasZoom(_tempCan, x, "medium")
            }

            for (let i = 1; i < len; i++) {

                // 產生縮小後的圖片
                if (_tempBigimg[i] === undefined) {
                    let last = _tempBigimg[i - 1] as HTMLCanvasElement | HTMLImageElement | ImageBitmap; // 上一次的圖
                    _tempBigimg[i] = getCanvasZoom(last, x, "medium");
                    // console.log(Math.pow(x, i + 1));
                }

                // 如果下一次縮小會比目標值還小，就回傳目前
                if (Math.pow(x, i + 2) < scale) {
                    return {
                        img: _tempBigimg[i],
                        scale: Math.pow(x, i + 1)
                    }
                }
            }

            // 回傳最小的圖
            return {
                img: _tempBigimg[_tempBigimg.length - 1],
                scale: Math.pow(x, _tempBigimg.length)
            }
        }
        /** [private] 取得縮放後的Canvas */
        function getCanvasZoom(img: HTMLCanvasElement | HTMLImageElement | ImageBitmap, zoom: number, quality: ("high" | "low" | "medium")) {

            const width = Math.round(img.width * zoom);
            const height = Math.round(img.height * zoom);

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

            ctx.imageSmoothingQuality = quality;
            ctx.drawImage(img, 0, 0, width, height);
            return canvas;
        }

        var _tempBigimgscale: { [key: number]: (HTMLCanvasElement | undefined) } = {}; // 記錄已經載入過的圖片
        var _tempBigimgscaleKey: number[] = []; // 判斷哪些圖片已經載入過了
        /** [private] */
        function getBigimgTemp_bigimgscale() {

            const nowItem = getBigimgscaleItem();

            // 有已經處理過的圖片就直接回傳
            if (_tempBigimgscale[nowItem.scale] != undefined) {
                // console.log("完成 " + nowItem.scale)
                return {
                    img: _tempBigimgscale[nowItem.scale],
                    scale: nowItem.scale
                }
            }

            // 開始載入新圖片
            if (_tempBigimgscaleKey.indexOf(nowItem.scale) === -1) {
                /*let tempUrl = getUrl();
                let domImg = document.createElement("img");
 
                domImg.addEventListener("load", (e) => {
                    if (tempUrl != getUrl()) {
                        console.log("old:" + tempUrl + "   new:" + getUrl())
                        return;
                    }//避免已經切換圖片了
                    temp_bigimgscale[nowItem.scale] = urlToCanvas(nowItem.url)
 
                    bigimgDraw(true)
                });
                domImg.src = nowItem.url;*/

                // 使用 worker 在背景載入圖片
                _worker.postMessage({
                    type: "loadImage",
                    url: nowItem.url,
                    tempUrl: getUrl(),
                    scale: nowItem.scale,
                });
                // console.log("處理中 " + nowItem.scale)
            }
            _tempBigimgscaleKey.push(nowItem.scale);

            // 回傳已經處理過的圖片
            const arKey = Object.keys(_tempBigimgscale);
            let sc = Number(arKey[0]);
            for (let i = 0; i < arKey.length; i++) {
                const key = Number(arKey[i]);
                if (key >= sc && key <= nowItem.scale) {
                    sc = key;
                }
            }

            return {
                img: _tempBigimgscale[sc],
                scale: sc
            }
        }

        // 使用 Worker 
        try {
            _worker = new Worker("./js/TiefseeviewWorker.js");
            _worker.addEventListener("message", (e) => {

                const type = e.data.type;

                // 在背景載入圖片
                if (type === "loadImage") {

                    const tempUrl = e.data.tempUrl;
                    const scale = e.data.scale;
                    const domImg = e.data.img;

                    if (tempUrl !== getUrl()) { // 避免已經切換圖片了
                        // console.log("old:" + tempUrl + "   new:" + getUrl())
                        return;
                    }

                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
                    canvas.width = domImg.width;
                    canvas.height = domImg.height;
                    ctx.drawImage(domImg, 0, 0, domImg.width, domImg.height);

                    _tempBigimgscale[scale] = canvas;

                    bigimgDraw(true);
                }

                // 銳化圖片
                if (type === "sharpen") {

                    const imageBitmap = e.data.imageBitmap;
                    const tempDrawImage = e.data.tempDrawImage;

                    if (tempDrawImage.scale === _tempDrawImage.scale &&
                        tempDrawImage.sx === _tempDrawImage.sx &&
                        tempDrawImage.sy === _tempDrawImage.sy &&
                        tempDrawImage.sWidth === _tempDrawImage.sWidth &&
                        tempDrawImage.sHeight === _tempDrawImage.sHeight &&
                        tempDrawImage.dx === _tempDrawImage.dx &&
                        tempDrawImage.dy === _tempDrawImage.dy &&
                        tempDrawImage.dWidth === _tempDrawImage.dWidth &&
                        tempDrawImage.dHeight === _tempDrawImage.dHeight &&
                        tempDrawImage.url === _tempDrawImage.url) {

                        const ctx = _domBigimgCanvas.getContext("2d") as CanvasRenderingContext2D;
                        ctx.drawImage(imageBitmap, 0, 0, imageBitmap.width, imageBitmap.height);
                    }

                }

            }, false);

        } catch (e) {
            console.log("Worker 載入失敗，無法使用「bigimgscale」")
        }

        // #endregion

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
        async function bigimgDraw(isImmediatelyRun?: boolean) {

            updateClip(); // 更新裁切

            if (_dataType !== "bigimg" && _dataType !== "bigimgscale") { return; }

            if (getOriginalWidth() === 0) { return; } // 避免圖片尚未載入完成就渲染

            if (isImmediatelyRun === true) {
                _tempDrawImage = {
                    scale: -123,
                    sx: 0, sy: 0,
                    sWidth: 1, sHeight: 1,
                    dx: 0, dy: 0,
                    dWidth: 1, dHeight: 1,
                    isSharpen: false,
                    url: ""
                }
            }
            const w = toNumber(_domData.style.width); // 原始圖片大小(旋轉前的大小)
            const h = toNumber(_domData.style.height);

            let dpiZoom = _dpiZoom;
            // 低於 1 倍時圖片會變得模糊
            if (dpiZoom < 1) { dpiZoom = 1; }
            // 當圖片縮放比例大於100%，就沒有必要用 dpiZoom 渲染更多的像素
            if (w / getOriginalWidth() * dpiZoom > 1) { dpiZoom = 1; }

            const bigimgTemp = getBigimgTemp(); // 判斷要使用原圖或是縮小後的圖片
            if (bigimgTemp === null) { return; }

            const can = bigimgTemp.img;
            if (can == null) { return; }
            const temp_can_width = can.width;
            const temp_can_height = can.height;

            if (w === 0 || h === 0) { return; }
            const margin = 35 * dpiZoom; // 多繪製的區域
            const scale = w / getOriginalWidth() * dpiZoom; // 目前的 圖片縮放比例
            let radio_can = 1;
            if (w > getOriginalWidth()) { // 如果圖片大於 1 倍，則用用原始大小
                radio_can = w / getOriginalWidth()
            }

            _domBigimg.style.width = w + "px";
            _domBigimg.style.height = h + "px";

            // 取得顯示範圍左上角的坐標
            let imgLeft = -toNumber(_domCon.style.left);
            let imgTop = -toNumber(_domCon.style.top);

            // 計算顯示範圍的四個角落在圖片旋轉前的位置
            let origPoint1 = getOrigPoint(imgLeft, imgTop, w, h, _degNow);
            let origPoint2 = getOrigPoint(imgLeft + _domDpiZoom.offsetWidth, imgTop, w, h, _degNow);
            let origPoint3 = getOrigPoint(imgLeft + _domDpiZoom.offsetWidth, imgTop + _domDpiZoom.offsetHeight, w, h, _degNow);
            let origPoint4 = getOrigPoint(imgLeft, imgTop + _domDpiZoom.offsetHeight, w, h, _degNow);

            // 轉換鏡像前的坐標
            function calc(p: { x: number, y: number }) {
                if (_mirrorVertical) {
                    p.y = toNumber(_domData.style.height) - p.y;
                }
                if (_mirrorHorizontal) {
                    p.x = toNumber(_domData.style.width) - p.x;
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
            function toRound() {
                sx = Math.round(sx);
                sy = Math.round(sy);
                sWidth = Math.round(sWidth);
                sHeight = Math.round(sHeight);
                dx = Math.round(dx);
                dy = Math.round(dy);
                dWidth = Math.round(dWidth);
                dHeight = Math.round(dHeight);
            }
            toRound();

            // 圖片如果有旋轉，或是移動超過多餘渲染區塊的1/2，才會再次渲染
            if (
                scale != _tempDrawImage.scale
                || Math.abs(dx - _tempDrawImage.dx) > margin / 2
                || Math.abs(dy - _tempDrawImage.dy) > margin / 2
                || Math.abs(sWidth - _tempDrawImage.sWidth) > margin / 2
                || Math.abs(sHeight - _tempDrawImage.sHeight) > margin / 2
            ) {
                _tempDrawImage = {
                    scale: scale,
                    sx: sx, sy: sy,
                    sWidth: sWidth, sHeight: sHeight,
                    dx: dx, dy: dy,
                    dWidth: dWidth, dHeight: dHeight,
                    isSharpen: false,
                    url: _url
                }

                // 如果圖片大於 canvas 的最大限制，就改用 <img> 來渲染
                let nowWidth = can.width;
                let nowHeight = can.height;
                if (nowWidth > 65535 || nowHeight > 65535 || nowWidth * nowHeight > 265690000) {
                    console.log("圖片過大，無法渲染", _url);
                    setDataType("img");
                    await loadImg(_url);
                    // 載入圖片後必須重新設定大小
                    setDataSize(_domData.offsetWidth);
                    return;
                }

                _domBigimgCanvas.width = Math.round((viewWidth + margin * 2) / radio_can * dpiZoom);
                _domBigimgCanvas.height = Math.round((viewHeight + margin * 2) / radio_can * dpiZoom);
                _domBigimgCanvas.style.width = Math.round(viewWidth + margin * 2) + "px";
                _domBigimgCanvas.style.height = Math.round(viewHeight + margin * 2) + "px";
                _domBigimgCanvas.style.left = Math.round(dx / dpiZoom) + "px";
                _domBigimgCanvas.style.top = Math.round(dy / dpiZoom) + "px";
                let ctx = _domBigimgCanvas.getContext("2d") as CanvasRenderingContext2D;
                // ctx.imageSmoothingEnabled = false;


                _tempCanvasSN += 1; // 用於判斷是否已經切換圖片
                let tc = _tempCanvasSN;

                let resizeQuality: ResizeQuality = "high"; // medium

                if (can.width * can.height > _eventHighQualityLimit() || _isPinching) { // 如果圖片面積過大，或 雙指縮放中 

                    // console.log("drawImage直接渲染(不使用高品質縮放)");
                    sx = sx * bigimgTemp.scale
                    sy = sy * bigimgTemp.scale
                    sWidth = sWidth * bigimgTemp.scale
                    sHeight = sHeight * bigimgTemp.scale
                    dWidth = dWidth
                    dHeight = dHeight
                    toRound();
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
                    toRound();
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
                    toRound();
                    const oc = new OffscreenCanvas(sWidth, sHeight); // 創建一個canvas畫布
                    const oc2d = oc.getContext("2d"); // canvas 畫筆
                    if (oc2d == null) { return; }
                    oc2d.drawImage(can,
                        sx, sy, sWidth, sHeight,
                        0, 0, sWidth, sHeight
                    );
                    resizeQuality = "medium";
                    await createImageBitmap(oc, 0, 0, sWidth, sHeight,
                        { resizeWidth: dWidth, resizeHeight: dHeight, resizeQuality: resizeQuality })
                        .then(function (sprites) {
                            if (tc === _tempCanvasSN) {
                                ctx.drawImage(sprites, 0, 0,);
                            }
                        });

                }
                else if (sWidth > temp_can_width && sHeight > temp_can_height) {

                    // console.log("寬高跟高度全部渲染");
                    sWidth = temp_can_width;
                    sHeight = temp_can_height;
                    sx = dx * -1
                    sy = dy * -1
                    dWidth = temp_can_width * scale / bigimgTemp.scale
                    dHeight = temp_can_height * scale / bigimgTemp.scale
                    toRound();
                    await createImageBitmap(can, 0, 0, sWidth, sHeight,
                        { resizeWidth: dWidth, resizeHeight: dHeight, resizeQuality: resizeQuality })
                        .then(function (sprites) {
                            if (tc === _tempCanvasSN) {
                                ctx.drawImage(sprites, sx, sy,);
                            }
                        });

                }
                else if (sWidth > temp_can_width == false && sHeight > temp_can_height) {

                    // console.log("高度全部渲染");
                    // sWidth = getOriginalWidth();
                    sHeight = temp_can_height;
                    sx = sx * bigimgTemp.scale
                    sy = dy * -1
                    dWidth = dWidth / bigimgTemp.scale
                    dHeight = getOriginalHeight() * scale
                    toRound();
                    await createImageBitmap(can, sx, 0, sWidth, sHeight,
                        { resizeWidth: dWidth, resizeHeight: dHeight, resizeQuality: resizeQuality })
                        .then(function (sprites) {
                            if (tc === _tempCanvasSN) {
                                ctx.drawImage(sprites, 0, sy);
                            }
                        });

                }
                else if (sWidth > temp_can_width && sHeight > temp_can_height == false) {

                    // console.log("寬度全部渲染");
                    sWidth = temp_can_width;
                    // sHeight = getOriginalHeight();
                    sx = dx * -1
                    sy = sy * bigimgTemp.scale
                    dWidth = getOriginalWidth() * scale
                    dHeight = dHeight / bigimgTemp.scale
                    toRound();
                    await createImageBitmap(can, 0, sy, sWidth, sHeight,
                        { resizeWidth: dWidth, resizeHeight: dHeight, resizeQuality: resizeQuality })
                        .then(function (sprites) {
                            if (tc === _tempCanvasSN) {
                                ctx.drawImage(sprites, sx, 0);
                            }
                        });

                }
                else if (sWidth > temp_can_width == false && sHeight > temp_can_height == false) {

                    // console.log("局部渲染");
                    sx = sx * bigimgTemp.scale
                    dWidth = dWidth / bigimgTemp.scale
                    sy = sy * bigimgTemp.scale
                    dHeight = dHeight / bigimgTemp.scale
                    toRound();
                    await createImageBitmap(can, sx, sy, sWidth, sHeight,
                        { resizeWidth: dWidth, resizeHeight: dHeight, resizeQuality: resizeQuality })
                        .then(function (sprites) {
                            if (tc === _tempCanvasSN) {
                                ctx.drawImage(sprites, 0, 0,);
                            }
                        });
                }

                // 銳化圖片
                if (w > 10 && h > 10) {
                    debouncedSharpening();
                }

            }

        }

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

        // 銳化圖片。不會立即執行，必須一段時間沒有更新，才會執行
        const debouncedSharpening = Lib.debounce(() => {

            if (_sharpenValue === 0) { return; }
            if (_domBigimgCanvas.width <= 10 || _domBigimgCanvas.height <= 10) { return; }

            // 轉換成 ImageBitmap
            const offscreenCanvas = new OffscreenCanvas(_domBigimgCanvas.width, _domBigimgCanvas.height);
            const ctx = offscreenCanvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
            ctx.drawImage(_domBigimgCanvas, 0, 0);
            const imageBitmap = offscreenCanvas.transferToImageBitmap();

            if (_tempDrawImage.isSharpen === false) {

                _worker.postMessage({
                    type: "sharpen",
                    blur: 0.5,
                    sharpen: _sharpenValue,
                    imageBitmap: imageBitmap,
                    tempDrawImage: _tempDrawImage
                }, [imageBitmap]);

                _tempDrawImage.isSharpen = true;
            }
        }, 100);

        /**
         * [private] 改變內容大小
         */
        function setDataSize(width: number) {
            if (_dataType === "img") {
                const ratio = getOriginalHeight() / getOriginalWidth();
                _domData.style.width = Math.round(width) + "px";
                _domData.style.height = Math.round(width * ratio) + "px";
                _domImg.style.width = Math.round(width) + "px";
                _domImg.style.height = Math.round(width * ratio) + "px";
            }
            if (_dataType === "bigimg" || _dataType === "bigimgscale") {
                const ratio = getOriginalHeight() / getOriginalWidth();
                const w = width;
                const h = width * ratio;
                _domData.style.width = Math.round(w) + "px";
                _domData.style.height = Math.round(h) + "px";
            }
            if (_dataType === "video") {
                const ratio = getOriginalHeight() / getOriginalWidth();
                _domData.style.width = Math.round(width) + "px";
                _domData.style.height = Math.round(width * ratio) + "px";
                _domVideo.style.width = Math.round(width) + "px";
                _domVideo.style.height = Math.round(width * ratio) + "px";
            }
        }

        /**
         * [private] 更新 滾動條位置
         */
        function initScroll() {
            _scrollX.update(
                _domCon.offsetWidth + _marginLeft + _marginRight,
                _domDpiZoom.offsetWidth,
                toNumber(_domCon.style.left) * -1 + _marginLeft
            );
            _scrollY.update(
                _domCon.offsetHeight + _marginTop + _marginBottom,
                _domDpiZoom.offsetHeight,
                toNumber(_domCon.style.top) * -1 + _marginTop
            );
        }

        /**
         * [private] 更新 定位，避免圖片超出視窗範圍，圖片小於視窗時進行 置中
         * @param enableAnimation 
         */
        async function initPoint(enableAnimation: boolean) {

            // 根據縮放或旋轉來重新設定圖片size
            _domCon.style.width = _domData.getBoundingClientRect().width + "px";
            _domCon.style.height = _domData.getBoundingClientRect().height + "px";

            initScroll();

            if (enableAnimation === undefined) { enableAnimation = true; }

            const hasOverflowX = getHasOverflowX();
            const hasOverflowY = getHasOverflowY();

            let top = toNumber(_domCon.style.top);
            let left = toNumber(_domCon.style.left);

            if (hasOverflowX && hasOverflowY) { // 圖片寬度高度都大於視窗
                if (toNumber(_domCon.style.top) > _marginTop) {
                    top = _marginTop;
                }
                if (toNumber(_domCon.style.left) > _marginLeft) {
                    left = _marginLeft;
                }
                let t = _domDpiZoom.offsetHeight - _domCon.offsetHeight - _marginBottom;
                if (toNumber(_domCon.style.top) < t) {
                    top = t;
                }
                let l = _domDpiZoom.offsetWidth - _domCon.offsetWidth - _marginRight;
                if (toNumber(_domCon.style.left) < l) {
                    left = l;
                }
            }

            if (hasOverflowX === false && hasOverflowY) {
                if (toNumber(_domCon.style.top) > _marginTop) {
                    top = _marginTop;
                }
                let t = _domDpiZoom.offsetHeight - _domCon.offsetHeight - _marginBottom;
                if (toNumber(_domCon.style.top) < t) {
                    top = t;
                }
                left = (_domDpiZoom.offsetWidth - _domCon.offsetWidth) / 2;
            }

            if (hasOverflowX && hasOverflowY === false) {
                if (toNumber(_domCon.style.left) > _marginLeft) {
                    left = _marginLeft;
                }
                let l = _domDpiZoom.offsetWidth - _domCon.offsetWidth - _marginRight;
                if (toNumber(_domCon.style.left) < l) {
                    left = l;
                }
                top = (_domDpiZoom.offsetHeight - _domCon.offsetHeight) / 2;
            }

            if (hasOverflowX === false && hasOverflowY === false) { // 圖片小於視窗、置中
                left = (_domDpiZoom.offsetWidth - _domCon.offsetWidth) / 2;
                top = (_domDpiZoom.offsetHeight - _domCon.offsetHeight) / 2;
            }

            if (enableAnimation) {
                await setXY(left, top, 100);
            } else {
                setXY(left, top, 0);
            }
        }

        eventChangePixelRatio(() => {
            if (_isDpizoomAUto === true) {
                setDpizoom(window.devicePixelRatio, true);
            }
        })

        // -----------------------------------------------

        //#region Lib

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

        /**
         * 
         */
        async function blobToBase64(blob: Blob) {
            return new Promise((resolve, _) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        }

        /**
         * 取得矩形旋轉後的實際大小，取得矩形裡面某一個點旋轉後的位置
         * @param width 
         * @param height 
         * @param x 
         * @param y 
         * @param deg 角度(0~360)
         */
        function getRotateRect(width: number, height: number, x: number, y: number, deg: number) {
            // 將角度轉換為弧度
            const rad = deg * Math.PI / 180;

            // 計算旋轉後的矩形寬度和高度
            const rectWidth = Math.abs(width * Math.cos(rad)) + Math.abs(height * Math.sin(rad));
            const rectHeight = Math.abs(width * Math.sin(rad)) + Math.abs(height * Math.cos(rad));

            // 將點移到矩形的中心
            const centerX = x - width / 2;
            const centerY = y - height / 2;

            // 計算旋轉後的點的位置
            let newX = centerX * Math.cos(rad) - centerY * Math.sin(rad);
            let newY = centerX * Math.sin(rad) + centerY * Math.cos(rad);

            // 將點移回原來的位置
            newX += rectWidth / 2;
            newY += rectHeight / 2;

            return {
                rectWidth: rectWidth,
                rectHeight: rectHeight,
                x: newX,
                y: newY
            }
        }

        /**
         * 旋轉一個向量
         * @param { object } vec 向量，具有 x 跟 y 屬性
         * @param { number } deg 旋轉角度
         * @returns { object } 向量，具有 x 跟 y 屬性
         */
        function rotateVector(vec: { x: number, y: number }, deg: number) {
            const theta = Math.PI * deg / 180;
            const cos = Math.cos(theta);
            const sin = Math.sin(theta);
            return {
                x: vec.x * cos - vec.y * sin,
                y: vec.x * sin + vec.y * cos
            };
        }

        /**
         * 取得旋轉後，原點（圖片左上角）的座標
         * @param {number} w 圖片寬度
         * @param {number} h 圖片高度
         * @param {number} deg 旋轉角度
         * @returns {object} 向量，具有 x 跟 y 屬性
         */
        function getRotatedOrig(w: number, h: number, deg: number) {
            const points = [
                { x: 0, y: 0 },
                { x: 0, y: h },
                { x: w, y: 0 },
                { x: w, y: h }
            ].map(p => rotateVector(p, deg));
            const minX = Math.min.apply(null, points.map(p => p.x));
            const minY = Math.min.apply(null, points.map(p => p.y));
            return {
                x: -minX,
                y: -minY
            }
        }

        /**
         * 計算點擊位置在原本圖片的哪個點
         * @param {number} x 點擊的 x 座標
         * @param {number} y 點擊的 y 座標
         * @param {number} w 圖片寬度
         * @param {number} h 圖片高度
         * @param {number} deg 旋轉角度
         * @returns {object} 向量，具有 x 跟 y 屬性
         */
        function getOrigPoint(x: number, y: number, w: number, h: number, deg: number) {
            let p = getRotatedOrig(w, h, deg);
            let v = {
                x: x - p.x,
                y: y - p.y
            };
            return rotateVector(v, -deg);
        }

        // #endregion

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
