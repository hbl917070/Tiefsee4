/**
 * 圖片瀏覽器
 */
class Tiefseeview {

    public dom_tiefseeview: HTMLDivElement; // 整體的div
    public dom_con: HTMLDivElement; // 表示整體佔位的容器，用於設定left、topo
    public dom_data: HTMLDivElement; // 放圖片的容器，用於旋轉與鏡像
    public dom_img: HTMLImageElement; // 圖片
    public scrollX; // 水平滾動條
    public scrollY; // 垂直滾動條

    public preloadImg; // 預載入 圖片
    public preloadVideo; // 預載入 影片
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
    public getLoadingUrl; // 取得 loading圖片
    public setLoadingUrl;
    public getErrerUrl; // 取得 error圖片
    public setErrerUrl;
    public getIsOverflowX; // 取得 圖片是否大於視窗(水平)
    public getIsOverflowY; // 取得 圖片是否大於視窗(垂直)
    public getOriginalWidth; // 取得圖片原始寬度
    public getOriginalHeight; // 取得圖片原始高度
    public getZoomRatio; // 取得縮放比例。原始1.00
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

        var dom_tiefseeview = _dom;
        var dom_dpizoom = <HTMLDivElement>dom_tiefseeview.querySelector(".tiefseeview-dpizoom");
        var dom_con = <HTMLDivElement>dom_tiefseeview.querySelector(".tiefseeview-container");
        var dom_data = <HTMLDivElement>dom_tiefseeview.querySelector(".tiefseeview-data");
        var dom_img = <HTMLImageElement>dom_tiefseeview.querySelector(".view-img");
        var dom_bigimg = <HTMLDivElement>dom_tiefseeview.querySelector(".view-bigimg");
        var dom_video = <HTMLVideoElement>dom_tiefseeview.querySelector(".view-video");
        var dom_bigimg_canvas = <HTMLCanvasElement>dom_tiefseeview.querySelector(".view-bigimg-canvas");
        var dom_loading = <HTMLImageElement>dom_tiefseeview.querySelector(".tiefseeview-loading");
        var scrollX = new TiefseeScroll(); // 水平滾動條
        var scrollY = new TiefseeScroll(); // 垂直滾動條
        scrollX.initTiefseeScroll(<HTMLImageElement>dom_tiefseeview.querySelector(".scroll-x"), "x")
        scrollY.initTiefseeScroll(<HTMLImageElement>dom_tiefseeview.querySelector(".scroll-y"), "y")

        var url: string; // 目前的圖片網址
        var dataType: ("img" | "video" | "imgs" | "bigimg" | "bigimgscale") = "img"; // 資料類型
        var dpizoom: number = 1; // 已棄用
        var dpizoom2: number = 1;
        var isDpizoomAUto: boolean = true;
        var degNow: number = 0; // 目前的角度 0~359
        var zoomRatio: number = 1.1; // 縮放比率(必須大於1)
        var transformDuration: number = 200; // transform 動畫時間(毫秒)
        var mirrorHorizontal: boolean = false; // 水平鏡像
        var mirrorVertical: boolean = false; // 垂直鏡像
        var rendering: TiefseeviewImageRendering = TiefseeviewImageRendering["auto"]; // 圖片渲染模式
        var overflowDistance: number = 0; // 溢位距離
        var marginTop: number = 10; // 外距
        var marginLeft: number = 10;
        var marginBottom: number = 10;
        var marginRight: number = 10;
        var loadingUrl: string = "img/loading.svg";
        var errerUrl: string = "img/error.svg";
        var rotateCriticalValue = 15; // 觸控旋轉的最低旋轉角度

        var hammerPan = new Hammer(dom_dpizoom); // 單指拖曳
        var panStartX: number = 0; // 開始拖曳的坐標
        var panStartY: number = 0;
        var isMoving = false; // 目前是否正在拖曳圖片
        var isPaning = false; // 目前是否正在拖曳圖片

        var hammerPlural = new Hammer.Manager(dom_dpizoom); // 用於雙指旋轉與縮放
        var temp_rotateStareDegValue = 0; // 雙指旋轉，初始角度
        var temp_touchRotateStarting = false; // 觸控旋轉 開始
        var temp_rotateStareDegNow = 0; // 觸控旋轉的起始角度
        var temp_pinchZoom = 1; // 雙指捏合縮放的上一個值
        var temp_pinchCenterX = 0;
        var temp_pinchCenterY = 0;

        var temp_dateShowLoading: number = 0; // 控制laoding顯示的延遲
        var temp_originalWidth: number = 1; // 用於記錄圖片size 的暫存
        var temp_originalHeight: number = 1;
        var temp_img: HTMLImageElement; // 圖片暫存
        var temp_can: HTMLCanvasElement; // canvas暫存
        var temp_canvasSN = 0; // 用於判斷canvas是否重複繪製
        var temp_touchPadTime = 0; // 用於判斷是否為觸控板
        /** Bigimgscale 用於儲存圖片網址與比例 */
        var arBigimgscale: { scale: number, url: string }[] = []

        var isZoomWithWindow = true; // 圖片隨視窗縮放
        var temp_zoomWithWindow = false; // 縮放過圖片大小的話，就停止 圖片隨視窗縮放
        var temp_TiefseeviewZoomType: TiefseeviewZoomType = TiefseeviewZoomType["imageOriginal"];
        var temp_TiefseeviewZoomTypeVal = 100;

        var temp_videoDuration: number = -1; // 影片長度

        var touchpadGestures = false; // 啟用觸控板手勢

        // 滑鼠滾輪的行為
        var eventMouseWheel = (_type: ("up" | "down"), e: WheelEvent, offsetX: number, offsetY: number): void => {
            if (_type === "up") { zoomIn(offsetX, offsetY); }
            else { zoomOut(offsetX, offsetY); }
        }
        var eventChangeZoom = (ratio: number): void => { }
        var eventChangeDeg = (deg: number): void => { }
        var eventChangeMirror = (isMirrorHorizontal: boolean, isMirrorVertica: boolean): void => { }
        var eventChangeXY = (x: number, y: number): void => { };
        var eventLimitMax = (): boolean => { return _eventLimitMax(); } // 超出縮放上限，return true表示超過限制    
        var eventLimitMin = (): boolean => { return _eventLimitMin(); } // 超出縮放下限，return true表示超過限制
        var eventHighQualityLimit = (): number => { return 7000 * 7000; } // 圖片面積大於這個數值，就禁用高品質縮放

        var pinch = new Hammer.Pinch();
        var rotate = new Hammer.Rotate();
        rotate.recognizeWith(pinch); // we want to detect both the same time
        hammerPlural.add([pinch, rotate]); // add to the Manager

        this.dom_tiefseeview = dom_tiefseeview;
        this.dom_con = dom_con;
        this.dom_data = dom_data;
        this.dom_img = dom_img;
        this.scrollX = scrollX;
        this.scrollY = scrollY;
        this.preloadImg = preloadImg;
        this.preloadVideo = preloadVideo;
        this.loadImg = loadImg;
        this.loadBigimg = loadBigimg;
        this.loadBigimgscale = loadBigimgscale;
        this.loadVideo = loadVideo;
        this.loadNone = loadNone;
        this.setLoading = setLoading;
        this.getRendering = getRendering;
        this.setRendering = setRendering;
        this.getIsOverflowX = getIsOverflowX;
        this.getIsOverflowY = getIsOverflowY;
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
        this.showClip = showClip;
        this.getClipInfo = getClipInfo;
        this.clipFull = clipFull;
        this.enableTouchpadGestures = (enable: boolean) => { touchpadGestures = enable; }

        setLoadingUrl(loadingUrl); // 初始化 loading 圖片
        setLoading(false); // 預設為隱藏
        dom_tiefseeview.classList.add("tiefseeview");
        setTransform(undefined, undefined, false); // 初始化定位
        setDpizoom(-1);

        // 顯示圖片的區塊改變大小時
        new ResizeObserver(() => {
            requestAnimationFrame(() => {
                init_point(false); // 重新定位圖片
                eventChangeZoom(getZoomRatio() * dpizoom2);

                // 圖片隨視窗縮放
                if (isZoomWithWindow && temp_zoomWithWindow) {
                    zoomFull(temp_TiefseeviewZoomType, temp_TiefseeviewZoomTypeVal);
                }
            })
        }).observe(dom_dpizoom)

        // 滾動條變化時，同步至圖片位置
        scrollY.setEventChange((v: number, mode: string) => {
            if (mode === "set") { return; }
            v = v * -1 + marginTop;
            setXY(undefined, v, 0);
        });
        scrollX.setEventChange((v: number, mode: string) => {
            if (mode === "set") { return; }
            v = v * -1 + marginLeft;
            setXY(v, undefined, 0);
        });

        //#region 剪裁框

        // 是否已經初始化過剪裁框
        var isInitClip = false;
        // 當前剪裁框是否啟用
        var isClip = false;
        // 剪裁框
        var domClipLT: HTMLDivElement;
        var domClipRT: HTMLDivElement;
        var domClipLB: HTMLDivElement;
        var domClipRB: HTMLDivElement;
        var domClipC: HTMLDivElement;
        var domClipMask: HTMLDivElement;
        var domClipMaskBg: HTMLDivElement;
        var domClipSvg: HTMLDivElement;
        // 剪裁框size
        var clipWidth = 100;
        var clipHeight = 100;
        var clipX = 100;
        var clipY = 100;
        // 拖曳前的坐標
        var clipStartX = 0;
        var clipStartY = 0;
        var clipStartWidth = 0;
        var clipStartHeight = 0;

        /**
         * 顯示或隱藏剪裁框
         **/
        function showClip(isShow: boolean) {

            if (isShow) {
                if (isInitClip === false) {
                    initClip();
                }
                domClipLT.style.display = "block";
                domClipRT.style.display = "block";
                domClipLB.style.display = "block";
                domClipRB.style.display = "block";
                domClipC.style.display = "block";
                domClipSvg.style.display = "block";
            } else {
                domClipLT.style.display = "none";
                domClipRT.style.display = "none";
                domClipLB.style.display = "none";
                domClipRB.style.display = "none";
                domClipC.style.display = "none";
                domClipSvg.style.display = "none";
            }
            isClip = isShow;
            updateClip();
        }

        /**
         * 取得剪裁框的資訊
         */
        function getClipInfo() {
            return {
                x: Math.round(clipX),
                y: Math.round(clipY),
                width: Math.round(clipWidth),
                height: Math.round(clipHeight),
                deg: degNow, // 旋轉角度   
                mirrorHorizontal: mirrorHorizontal, // 鏡像-水平
                mirrorVertical: mirrorVertical, // 鏡像-垂直
            }
        }

        /**
         * 剪裁框全滿
         */
        function clipFull() {
            if (isClip === false) { return; }

            // 取得旋轉後的 size
            let rect = getRotateRect(getOriginalWidth(), getOriginalHeight(), 0, 0, degNow);
            let oWidth = rect.rectWidth;
            let oHeight = rect.rectHeight;

            setClipXY(0, 0, oWidth, oHeight);
        }

        /**
         * 設定剪裁框的位置
         */
        function setClipXY(x: number, y: number, width: number, height: number) {
            if (isClip === false) { return; }

            clipX = x;
            clipY = y;
            clipWidth = width;
            clipHeight = height;
            updateClip();
        }

        // [private] 初始化剪裁框
        function initClip() {

            // 4個角落的剪裁點、中間的拖曳區塊、黑色半透明遮罩
            let htmlClip = `
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
            dom_tiefseeview.insertAdjacentHTML("beforeend", htmlClip);

            domClipLT = <HTMLDivElement>dom_tiefseeview.querySelector(".tiefseeview-clip-lt");
            domClipRT = <HTMLDivElement>dom_tiefseeview.querySelector(".tiefseeview-clip-rt");
            domClipLB = <HTMLDivElement>dom_tiefseeview.querySelector(".tiefseeview-clip-lb");
            domClipRB = <HTMLDivElement>dom_tiefseeview.querySelector(".tiefseeview-clip-rb");
            domClipC = <HTMLDivElement>dom_tiefseeview.querySelector(".tiefseeview-clip-c");
            domClipMask = <HTMLDivElement>dom_tiefseeview.querySelector(".tiefseeview-clip-mask-rect");
            domClipMaskBg = <HTMLDivElement>dom_tiefseeview.querySelector(".tiefseeview-clip-mask-bg");
            domClipSvg = <HTMLDivElement>dom_tiefseeview.querySelector(".tiefseeview-clip-svg");

            isInitClip = true;

            // 把捲動事件傳遞給父層
            [domClipLT, domClipRT, domClipLB, domClipRB, domClipC].forEach(dom => {
                dom.addEventListener("wheel", (e) => {
                    sendWheelEvent(e);
                    e.preventDefault();
                })
            });

            // 剪裁框事件
            var hammerClipLB = new Hammer(domClipLB);
            var hammerClipLT = new Hammer(domClipLT);
            var hammerClipRB = new Hammer(domClipRB);
            var hammerClipRT = new Hammer(domClipRT);
            var hammerClipC = new Hammer(domClipC);
            hammerClipLB.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_ALL });
            hammerClipLT.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_ALL });
            hammerClipRB.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_ALL });
            hammerClipRT.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_ALL });
            hammerClipC.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_ALL });

            hammerClipLB.on("pan", (ev) => { hammerClipMove("lb", ev.deltaX, ev.deltaY); });
            hammerClipLT.on("pan", (ev) => { hammerClipMove("lt", ev.deltaX, ev.deltaY); });
            hammerClipRB.on("pan", (ev) => { hammerClipMove("rb", ev.deltaX, ev.deltaY); });
            hammerClipRT.on("pan", (ev) => { hammerClipMove("rt", ev.deltaX, ev.deltaY); });
            hammerClipC.on("pan", (ev) => { hammerClipMove("c", ev.deltaX, ev.deltaY); });

            hammerClipLB.on("panstart", (ev) => { hammerClipMoveStart("lb", ev); });
            hammerClipLT.on("panstart", (ev) => { hammerClipMoveStart("lt", ev); });
            hammerClipRB.on("panstart", (ev) => { hammerClipMoveStart("rb", ev); });
            hammerClipRT.on("panstart", (ev) => { hammerClipMoveStart("rt", ev); });
            hammerClipC.on("panstart", (ev) => { hammerClipMoveStart("c", ev); });

            function hammerClipMoveStart(type: ("lt" | "rt" | "lb" | "rb" | "c"), ev: HammerInput) {

                clipStartWidth = clipWidth;
                clipStartHeight = clipHeight;

                if (type === "lt") {
                    clipStartX = ev.deltaX + clipX;
                    clipStartY = ev.deltaY + clipY;
                }
                else if (type === "rt") {
                    clipStartX = ev.deltaX + clipWidth;
                    clipStartY = ev.deltaY + clipY;
                }
                else if (type === "lb") {
                    clipStartX = ev.deltaX + clipX;
                    clipStartY = ev.deltaY + clipHeight;
                }
                else if (type === "rb") {
                    clipStartX = ev.deltaX + clipWidth;
                    clipStartY = ev.deltaY + clipHeight;
                }
                else if (type === "c") {
                    clipStartX = ev.deltaX + clipX;
                    clipStartY = ev.deltaY + clipY;
                }

            }

            function hammerClipMove(type: ("lt" | "rt" | "lb" | "rb" | "c"), x: number, y: number) {

                let scale = getZoomRatio();
                let min = 50; // 剪裁框最小 size
                if (min * scale < 50) { min = 50 / scale; }

                x = x / scale * dpizoom;
                y = y / scale * dpizoom;

                if (type === "lt") {
                    if (clipStartX + x > 0) {
                        clipWidth = clipStartWidth - x;
                    } else {
                        clipWidth = clipStartWidth + clipStartX;
                    }
                    if (clipStartY + y > 0) {
                        clipHeight = clipStartHeight - y;
                    } else {
                        clipHeight = clipStartHeight + clipStartY;
                    }
                    if (clipWidth > min) { // 避免剪裁框太小
                        clipX = clipStartX + x;
                    } else { // 如果剪裁框太小，就固定剪裁框的位置
                        clipX = clipStartX + clipStartWidth - min;
                    }
                    if (clipHeight > min) {
                        clipY = clipStartY + y;
                    } else {
                        clipY = clipStartY + clipStartHeight - min;
                    }
                }
                if (type === "rt") {
                    clipWidth = clipStartX + x;
                    if (clipStartY + y > 0) {
                        clipHeight = clipStartHeight - y;
                    } else {
                        clipHeight = clipStartHeight + clipStartY;
                    }
                    if (clipHeight > min) {
                        clipY = clipStartY + y;
                    } else {
                        clipY = clipStartY + clipStartHeight - min;
                    }
                }
                if (type === "lb") {
                    if (clipStartX + x > 0) {
                        clipWidth = clipStartWidth - x;
                    } else {
                        clipWidth = clipStartWidth + clipStartX;
                    }
                    clipHeight = clipStartY + y;
                    if (clipWidth > min) {
                        clipX = clipStartX + x;
                    } else {
                        clipX = clipStartX + clipStartWidth - min;
                    }
                }
                if (type === "rb") {
                    clipWidth = clipStartX + x;
                    clipHeight = clipStartY + y;
                }
                if (type === "c") {

                    // 取得旋轉後的 size
                    let rect = getRotateRect(getOriginalWidth(), getOriginalHeight(), 0, 0, degNow);
                    let oWidth = rect.rectWidth;
                    let oHeight = rect.rectHeight;


                    if (clipStartX + x + clipWidth < oWidth) {
                        clipX = clipStartX + x;
                    } else {
                        clipX = oWidth - clipWidth;
                    }
                    if (clipStartY + y + clipHeight < oHeight) {
                        clipY = clipStartY + y;
                    }
                    else {
                        clipY = oHeight - clipHeight;
                    }
                }
                updateClip();
            }

        }

        /**
         * [private] 更新剪裁框
         */
        function updateClip() {

            if (isInitClip === false) { return; }
            if (isClip === false) { return; }

            let scale = getZoomRatio(); // 根據縮放比例
            let min = 50; // 剪裁框最小 size
            if (min * scale < 50) { min = 50 / scale; }

            // 避免剪裁框太小
            if (clipWidth < min) { clipWidth = min; }
            if (clipHeight < min) { clipHeight = min; }

            // 取得原始圖片的size
            let oWidth = getOriginalWidth();
            let oHeight = getOriginalHeight();

            if (oWidth === 1 || oHeight === 1) { return; }

            // 取得旋轉後的 size
            let rect = getRotateRect(oWidth, oHeight, 0, 0, degNow);
            oWidth = rect.rectWidth;
            oHeight = rect.rectHeight;

            // 避免剪裁框超出圖片範圍
            if (oWidth > min) {
                if (clipX > oWidth) {
                    clipX = oWidth - min;
                }
                if ((clipX + clipWidth) > oWidth) {
                    clipWidth = oWidth - clipX;
                }
            } else {
                clipX = 0;
                clipWidth = oWidth;
            }
            if (oHeight > min) {
                if (clipY > oHeight) {
                    clipY = oHeight - min;
                }
                if ((clipY + clipHeight) > oHeight) {
                    clipHeight = oHeight - clipY;
                }
            } else {
                clipY = 0;
                clipHeight = oHeight;
            }

            if (clipX < 0) { clipX = 0; }
            if (clipY < 0) { clipY = 0; }

            let conx = toNumber(dom_con.style.left);
            let cony = toNumber(dom_con.style.top);

            let boxSize = 20; // 角落剪裁點的 size
            let boxBorder = 10; // 角落剪裁點的外框寬度
            let ltx = 1 / dpizoom * (conx + clipX * scale) - boxBorder;
            let lty = 1 / dpizoom * (cony + clipY * scale) - boxBorder;
            let rtx = 1 / dpizoom * (conx + (clipX + clipWidth) * scale) - boxSize + boxBorder;
            let rty = 1 / dpizoom * (cony + clipY * scale) - boxBorder;
            let lbx = 1 / dpizoom * (conx + clipX * scale) - boxBorder;
            let lby = 1 / dpizoom * (cony + (clipY + clipHeight) * scale) - boxSize + boxBorder;
            let rbx = 1 / dpizoom * (conx + (clipX + clipWidth) * scale) - boxSize + boxBorder;
            let rby = 1 / dpizoom * (cony + (clipY + clipHeight) * scale) - boxSize + boxBorder;

            domClipLT.style.left = ltx + "px";
            domClipLT.style.top = lty + "px";
            domClipRT.style.left = rtx + "px";
            domClipRT.style.top = rty + "px";
            domClipLB.style.left = lbx + "px";
            domClipLB.style.top = lby + "px";
            domClipRB.style.left = rbx + "px";
            domClipRB.style.top = rby + "px";

            domClipC.style.left = (conx + clipX * scale) / dpizoom + "px";
            domClipC.style.top = (cony + clipY * scale) / dpizoom + "px";
            domClipC.style.width = (clipWidth * scale) / dpizoom + "px";
            domClipC.style.height = (clipHeight * scale) / dpizoom + "px";

            // 更新遮罩
            // domClipMaskBg.setAttribute("x", (conx / dpizoom - 1).toString());
            // domClipMaskBg.setAttribute("y", (cony / dpizoom - 1).toString());
            // domClipMaskBg.setAttribute("width", (toNumber(dom_con.style.width) / dpizoom + 2).toString());
            // domClipMaskBg.setAttribute("height", (toNumber(dom_con.style.height) / dpizoom + 2).toString());
            domClipMaskBg.setAttribute("width", "100%");
            domClipMaskBg.setAttribute("height", "100%");
            domClipSvg.setAttribute("viewBox", `0 0 ${dom_tiefseeview.offsetWidth} ${dom_tiefseeview.offsetHeight}`);
            domClipMask.setAttribute("x", (conx / dpizoom + (clipX * scale / dpizoom)).toString());
            domClipMask.setAttribute("y", (cony / dpizoom + (clipY * scale / dpizoom)).toString());
            domClipMask.setAttribute("width", (clipWidth * scale / dpizoom).toString());
            domClipMask.setAttribute("height", (clipHeight * scale / dpizoom).toString());
        }

        //#endregion

        //#region 拖曳與縮放事件

        // 雙指旋轉  
        hammerPlural.on("rotatestart", (ev) => {
            temp_rotateStareDegNow = degNow;
            temp_rotateStareDegValue = ev.rotation - degNow;
            temp_touchRotateStarting = false;
        });
        hammerPlural.on("rotate", async (ev) => {

            let _deg = (ev.rotation - temp_rotateStareDegValue); // 取得旋轉角度

            if (temp_touchRotateStarting === false) {
                if (Math.abs(temp_rotateStareDegNow - Math.abs(_deg)) > rotateCriticalValue) { // 旋轉超過特定角度，才會開始執行旋轉
                    temp_rotateStareDegValue -= (temp_rotateStareDegNow - _deg);
                    _deg += (temp_rotateStareDegNow - _deg);
                    temp_touchRotateStarting = true;
                }
            }
            if (temp_touchRotateStarting) {
                setDeg(_deg, ev.center.x, ev.center.y, false); // 無動畫旋轉
            }

        });
        hammerPlural.on("rotateend", (ev) => {
            temp_touchRotateStarting = false;
            let r = degNow % 90; // 如果不足90度
            if (r === 0) { return; }
            if (r > 45 || (r < 0 && r > -45)) {
                setDegForward(ev.center.x, ev.center.y, true); // 順時針旋轉
            } else {
                setDegReverse(ev.center.x, ev.center.y, true); // 逆時針旋轉
            }
        });

        /** 雙指縮放中 */
        var isPinching = false;
        // 雙指捏合縮放
        hammerPlural.on("pinchstart", (ev) => {
            isPinching = true;
            temp_pinchZoom = 1;
            temp_pinchCenterX = ev.center.x;
            temp_pinchCenterY = ev.center.y;

            temp_zoomWithWindow = false;
        });
        hammerPlural.on("pinch", (ev) => { // pinchin
            requestAnimationFrame(() => {

                // 從兩指的中心進行縮放
                // 縮放前先把渲染模式改成成本較低的 pixelated
                zoomIn(ev.center.x, ev.center.y, (ev.scale / temp_pinchZoom), TiefseeviewImageRendering["pixelated"]);

                // 根據中心點的位移來拖曳圖片
                /*setXY(
                    toNumber(dom_con.style.left) - (temp_pinchCenterX - ev.center.x),
                    toNumber(dom_con.style.top) - (temp_pinchCenterY - ev.center.y),
                    0
                );*/
                temp_pinchZoom = ev.scale;
                temp_pinchCenterX = ev.center.x;
                temp_pinchCenterY = ev.center.y;
            })
        });
        hammerPlural.on("pinchend", (ev) => {
            isPinching = false;
            setRendering(rendering); // 縮放結束後，把渲染模式改回原本的縮放模式
        });



        // 滑鼠滾輪上下滾動時
        dom_dpizoom.addEventListener("wheel", (e: WheelEvent) => {

            e.preventDefault(); // 禁止頁面滾動

            // 避免在滾動條上面也觸發
            if (e.target !== dom_dpizoom) { return; }

            temp_zoomWithWindow = false;
            $(dom_con).stop(true, false);

            // @ts-ignore
            // wheelDeltaY 已被標記為過時
            let wheelDeltaY = e.wheelDeltaY;

            let isTouchPad: boolean;
            if (touchpadGestures === false) {
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
            if (isTouchPad || temp_touchPadTime + 200 > new Date().getTime()) {

                temp_touchPadTime = new Date().getTime(); // 記錄當前時間，在200毫秒內的捲動都當做觸控板

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
                            toNumber(dom_con.style.left) - posX,
                            toNumber(dom_con.style.top) - posY,
                            0
                        ); // 平移
                        init_point(false);
                    }

                })

            } else { // 一般的滑鼠滾輪
                // 縮放計算
                if (e.deltaX < 0 || e.deltaY < 0) { // 往上
                    eventMouseWheel("up", e, e.offsetX, e.offsetY);
                } else { // 往下
                    eventMouseWheel("down", e, e.offsetX, e.offsetY);
                }
            }

        }, true);

        // 拖曳開始
        dom_dpizoom.addEventListener("mousedown", (ev) => {

            ev.preventDefault();

            // 沒有出現捲動條就不要執行拖曳
            if (getIsOverflowX() === false && getIsOverflowY() === false) {

                // 模擬送出 mouseup ，避免拖曳視窗後導致touch事件變得異常
                var downEvent = new PointerEvent("pointerup", {
                    pointerId: 1,
                    bubbles: true,
                    pointerType: "mouse",
                });
                dom_dpizoom.dispatchEvent(downEvent);

                return;
            }

            // 避免在滾動條上面也觸發
            if (ev.target !== dom_dpizoom) {
                isMoving = false;
                isPaning = false;
                return;
            }
            isMoving = true;
            isPaning = true;
            $(dom_con).stop(true, false);
            panStartX = toNumber(dom_con.style.left);
            panStartY = toNumber(dom_con.style.top);
        });
        dom_dpizoom.addEventListener("touchstart", (ev) => {
            ev.preventDefault();

            // 避免多指觸發
            if (ev.touches.length > 1) {
                isMoving = false;
                isPaning = false;
                return;
            }

            // 避免在滾動條上面也觸發
            if (ev.target !== dom_dpizoom) {
                isMoving = false;
                isPaning = false;
                return;
            }

            isMoving = true;
            isPaning = true;
            $(dom_con).stop(true, false);
            panStartX = toNumber(dom_con.style.left);
            panStartY = toNumber(dom_con.style.top);
        });

        // 拖曳
        hammerPan.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_ALL });
        hammerPan.on("pan", (ev) => {
            requestAnimationFrame(() => {
                // 避免多指觸發
                if (ev.maxPointers > 1) {
                    isMoving = false;
                    isPaning = false;
                    return;
                }

                // 沒有出現捲動條就不要執行拖曳
                if (getIsOverflowX() === false && getIsOverflowY() === false) {
                    return;
                }

                if (isMoving === false) { return; }

                let deltaX = ev["deltaX"];
                let deltaY = ev["deltaY"];
                let left = panStartX + deltaX * dpizoom;
                let top = panStartY + deltaY * dpizoom;

                if (getIsOverflowY()) { // 高度大於視窗
                    if (top > marginTop + overflowDistance) { // 上
                        top = marginTop + overflowDistance;
                    }
                    let t = dom_dpizoom.offsetHeight - dom_con.offsetHeight - marginBottom; // 下
                    if (top < t - overflowDistance) {
                        top = t - overflowDistance;
                    }
                } else {
                    let t = (dom_dpizoom.offsetHeight - dom_con.offsetHeight) / 2; // 置中的坐標
                    if (top > t + overflowDistance) {
                        top = t + overflowDistance;
                    }
                    if (top < t - overflowDistance) {
                        top = t - overflowDistance;
                    }
                }

                if (getIsOverflowX()) { // 寬度大於視窗
                    if (left > marginLeft + overflowDistance) { // 左
                        left = marginLeft + overflowDistance;
                    }
                    let l = dom_dpizoom.offsetWidth - dom_con.offsetWidth - marginRight; // 右
                    if (left < l - overflowDistance) {
                        left = l - overflowDistance;
                    }
                } else {
                    let l = (dom_dpizoom.offsetWidth - dom_con.offsetWidth) / 2; // 置中的坐標
                    if (left > l + overflowDistance) {
                        left = l + overflowDistance;
                    }
                    if (left < l - overflowDistance) {
                        left = l - overflowDistance;
                    }
                }

                setXY(left, top, 0);
            })
        });

        // 拖曳 結束
        hammerPan.on("panend", async (ev) => {

            // 避免在滾動條上面也觸發
            // if (ev.target !== dom_tiefseeview) { return; }

            // 避免多指觸發
            if (ev.maxPointers > 1) { return; }

            if (isMoving === false) { return; }
            isMoving = false;
            isPaning = true;
            let velocity = ev["velocity"]; // 加速度
            let velocityX = ev["velocityX"];
            let velocityY = ev["velocityY"];
            let duration = 10; // 動畫時間

            let dpi = dpizoom;
            velocity *= dpi;
            velocityX *= dpi;
            velocityY *= dpi;

            if (ev.pointerType == "touch") { // 如果是觸控
                velocity *= 2;
                velocityX *= 2;
                velocityY *= 2;
            }

            duration = 150 + 100 * Math.abs(velocity); // 動畫時間
            if (duration > 1200) duration = 1200;

            $(dom_con).stop(true, false);

            // 速度小於 1 就不使用慣性
            if (Math.abs(velocity) < 1) {
                velocity = 0;
                velocityX = 0;
                velocityY = 0;
                duration = 10;
                init_point(true);
                isPaning = false;
                return;
            }

            let speed = 150; // 速度
            let top = toNumber(dom_con.style.top) + (velocityY * speed);
            let left = toNumber(dom_con.style.left) + (velocityX * speed);

            let bool_overflowX = false;
            let bool_overflowY = false;

            if (getIsOverflowY()) { // 高度大於視窗
                if (top > marginTop + overflowDistance) { // 上
                    top = marginTop + overflowDistance;
                    bool_overflowX = true;
                }
                let t = dom_dpizoom.offsetHeight - dom_con.offsetHeight - marginBottom; // 下
                if (top < t - overflowDistance) {
                    top = t - overflowDistance;
                    bool_overflowX = true;
                }
            } else {
                let t = (dom_dpizoom.offsetHeight - dom_con.offsetHeight) / 2; // 置中的坐標
                if (top > t + overflowDistance) {
                    top = t + overflowDistance;
                    bool_overflowX = true;
                }
                if (top < t - overflowDistance) {
                    top = t - overflowDistance;
                    bool_overflowX = true;
                }
            }

            if (getIsOverflowX()) { // 寬度大於視窗
                if (left > marginLeft + overflowDistance) { // 左
                    left = marginLeft + overflowDistance;
                    bool_overflowY = true;
                }
                let l = dom_dpizoom.offsetWidth - dom_con.offsetWidth - marginRight; // 右
                if (left < l - overflowDistance) {
                    left = l - overflowDistance;
                    bool_overflowY = true;
                }
            } else {
                let l = (dom_dpizoom.offsetWidth - dom_con.offsetWidth) / 2; // 置中的坐標
                if (left > l + overflowDistance) {
                    left = l + overflowDistance;
                    bool_overflowY = true;
                }
                if (left < l - overflowDistance) {
                    left = l - overflowDistance;
                    bool_overflowY = true;
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
            isPaning = false;
            init_point(true);
        });

        //#endregion

        //#region 對外公開的事件

        /**
         * 取得 滑鼠滾輪的事件
         * @returns 
         */
        function getEventMouseWheel() { return eventMouseWheel; }
        /**
         * 覆寫 滑鼠滾輪的事件
         * @param _func 
         */
        function setEventMouseWheel(_func: (_type: ("up" | "down"), e: WheelEvent, offsetX: number, offsetY: number) => void) {
            eventMouseWheel = _func;
        }

        /**
         * 覆寫 圖片或顯示範圍改變的事件
         */
        function setEventChangeZoom(_func: (ratio: number) => void) { eventChangeZoom = _func; }
        /**
         * 取得 圖片或顯示範圍改變的事件
         */
        function getEventChangeZoom() { return eventChangeZoom; }

        /**
         * 覆寫 角度改變的事件
         */
        function setEventChangeDeg(_func: (deg: number) => {}) { eventChangeDeg = _func; }
        /**
         * 取得 角度改變的事件
         */
        function getEventChangeDeg() { return eventChangeDeg; }

        /**
         * 覆寫 鏡像改變的事件
         */
        function setEventChangeMirror(_func: () => {}) { eventChangeMirror = _func; }
        /**
         * 取得 鏡像改變的事件
         */
        function getEventChangeMirror() { return eventChangeMirror; }

        /**
         * 覆寫 坐標改變的事件
         */
        function setEventChangeXY(_func: (x: number, y: number) => {}) { eventChangeXY = _func; }
        /**
         * 取得 坐標改變的事件
         */
        function getEventChangeXY() { return eventChangeXY; }

        /**
         * (預設值)超出縮放上限，return true表示超過限制
         */
        function _eventLimitMax(): boolean {

            // 寬度或高度大於100px的圖片，放大上限為30倍
            if (getOriginalWidth() > 100 || getOriginalHeight() > 100) {
                if (getZoomRatio() > 50) {
                    return true;
                }
            }

            // 放大上限為100萬px
            if (dom_data.offsetWidth > 999999 || dom_data.offsetHeight > 999999) {
                return true;
            }

            return false;
        }

        /**
         * (預設值)超出縮放下限，return true表示超過限制
         * @returns 
         */
        function _eventLimitMin(): boolean {

            // 寬度或高度小於10px的圖片，縮小下限為1px
            if (getOriginalWidth() <= 10 || getOriginalHeight() <= 10) {
                if (dom_data.offsetWidth <= 1 || dom_data.offsetHeight <= 1) {
                    return true;
                }
            } else {
                // 縮小下限為10px
                if (dom_data.offsetWidth <= 10 || dom_data.offsetHeight <= 10) {
                    return true;
                }
            }

            return false;
        }

        /**
         * 取得 圖片放大上限
         */
        function getEventLimitMax() { return eventLimitMax; }
        /**
         * 覆寫 圖片放大上限
         */
        function setEventLimitMax(_func: () => boolean) { eventLimitMax = _func; }

        /**
         * 取得 圖片縮小下限
         */
        function getEventLimitMin() { return eventLimitMin; }
        /**
         * 覆寫 圖片縮小下限
         */
        function setEventLimitMin(_func: () => boolean) { eventLimitMin = _func; }

        /**
         * 覆寫 圖片面積大於這個數值，就停止使用高品質縮放
         */
        function setEventHighQualityLimit(_func: () => number) {
            eventHighQualityLimit = _func;
        }

        //#endregion

        //#region 載入圖片(入口)

        /**
         * 預載入圖片資源
         * @param _url 網址
         * @returns true=載入完成、false=載入失敗
         */
        async function preloadImg(_url: string, isInitSize: undefined | boolean = true): Promise<boolean> {

            let img = document.createElement("img");
            img.fetchPriority = "high"; // 設定圖片優先權
            let p = await new Promise((resolve, reject) => {
                img.addEventListener("load", (e) => {
                    if (isInitSize) {
                        temp_originalWidth = img.naturalWidth; // 初始化圖片size
                        temp_originalHeight = img.naturalHeight;
                    }
                    resolve(true);
                });
                img.addEventListener("error", (e) => {
                    if (isInitSize) {
                        temp_originalWidth = 1;
                        temp_originalHeight = 1;
                    }
                    resolve(false);
                });
                img.src = _url;
            })

            temp_img = img;

            // img.src = "";
            // @ts-ignore
            // img = null;
            return <boolean>p;
        }

        /**
         * 預載入影片資源
         * @param _url 網址
         * @returns true=載入完成、false=載入失敗
         */
        async function preloadVideo(_url: string): Promise<boolean> {

            let video = document.createElement("video");
            let p = await new Promise((resolve, reject) => {
                video.addEventListener("loadedmetadata", (e) => {
                    temp_originalWidth = video.videoWidth; // 初始化圖片size
                    temp_originalHeight = video.videoHeight;
                    temp_videoDuration = isNaN(video.duration) ? -1 : video.duration;

                    resolve(true);
                });
                video.addEventListener("error", (e) => {
                    temp_videoDuration = -1;
                    temp_originalWidth = 1;
                    temp_originalHeight = 1;
                    resolve(false);
                });
                video.src = _url;
            })

            // temp_img = video;

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
         * @param _url 
         * @returns 
         */
        async function loadVideo(_url: string): Promise<boolean> {

            // setLoading(true);
            url = _url;
            let p = await preloadVideo(_url);
            // setLoading(false);
            setDataType("video");

            if (p === false) {
                setDataType("img");
                await preloadImg(errerUrl);
                dom_img.src = errerUrl;
                return false;
            }

            dom_video.src = _url;
            dom_video.onloadedmetadata = () => { // 載入完成時自動播放
                dom_video.play();
            }

            clipFull();

            return true;
        }

        /**
         * 載入並顯示 - img
         * @param _url 
         * @returns 
         */
        async function loadImg(_url: string): Promise<boolean> {

            // setLoading(true);
            url = _url;
            let p = await preloadImg(_url);
            // setLoading(false);
            setDataType("img");

            if (p === false) {
                await preloadImg(errerUrl);
                dom_img.src = errerUrl;
                return false;
            }

            // 清空畫布
            let context = <CanvasRenderingContext2D>dom_bigimg_canvas.getContext("2d");
            context.clearRect(0, 0, dom_bigimg_canvas.width, dom_bigimg_canvas.height);

            dom_img.src = _url;

            clipFull();

            return true;
        }

        /**
         * 載入並顯示 - canvas
         * @param _url 
         * @returns 
         */
        async function loadBigimg(_url: string): Promise<boolean> {

            // setLoading(true);
            url = _url;
            let p = await preloadImg(_url);
            // setLoading(false);
            setDataType("bigimg");

            if (p === false) {
                setDataType("img");
                await preloadImg(errerUrl);
                dom_img.src = errerUrl;
                return false;
            }

            temp_bigimg = [];
            temp_drawImage = {
                scale: -1,
                sx: 0, sy: 0,
                sWidth: 1, sHeight: 1,
                dx: 0, dy: 0,
                dWidth: 1, dHeight: 1
            }

            dom_img.src = _url;
            temp_can = urlToCanvas(_url)
            // setDataSize(getOriginalWidth());

            clipFull();

            return true;
        }

        /**
         * 載入已經縮放過的圖片並顯示 - canvas
         */
        async function loadBigimgscale(
            _arUrl: { scale: number, url: string }[],
            _w: number, _h: number,
            _zoomType: TiefseeviewZoomType, _zoomVal: number): Promise<boolean> {

            temp_originalWidth = _w; // 初始化圖片size
            temp_originalHeight = _h;
            arBigimgscale = _arUrl;

            url = arBigimgscale[0].url;

            let scale = getZoomFull_scale(_zoomType, _zoomVal);
            let bigimgscaleItem = getBigimgscaleItem(scale);

            setDataType("bigimgscale");
            // setLoading(true);
            let p = await preloadImg(bigimgscaleItem.url, false);
            // setLoading(false);
            if (p === false) {
                setDataType("img");
                await preloadImg(errerUrl);
                dom_img.src = errerUrl;
                return false;
            }

            temp_bigimgscale = {};
            temp_bigimgscale[bigimgscaleItem.scale] = urlToCanvas(bigimgscaleItem.url)
            temp_bigimgscaleKey = [];
            temp_bigimgscaleKey.push(bigimgscaleItem.scale)

            setDataSize(getZoomFull_width(_zoomType, _zoomVal))
            temp_drawImage = {
                scale: -1,
                sx: 0, sy: 0,
                sWidth: 1, sHeight: 1,
                dx: 0, dy: 0,
                dWidth: 1, dHeight: 1
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
        function setDataType(_type: ("img" | "video" | "imgs" | "bigimg" | "bigimgscale")) {

            dataType = _type;

            if (dataType === "img") {
                dom_img.style.display = "";
                dom_bigimg.style.display = "none";
                dom_video.style.display = "none";
                dom_video.src = "";
                return;
            }
            if (dataType === "bigimg" || dataType === "bigimgscale") {
                dom_img.style.display = "none";
                dom_bigimg.style.display = "";
                dom_video.style.display = "none";
                dom_img.src = "";
                dom_video.src = "";
                return;
            }
            if (dataType === "video") {
                dom_img.style.display = "none";
                dom_bigimg.style.display = "none";
                dom_video.style.display = "";
                dom_img.src = "";
                return;
            }
        }

        //#endregion

        /**
         * 取得縮放比例。原始1.00
         */
        function getZoomRatio(): number { return dom_data.offsetWidth / getOriginalWidth(); }

        /**
         * 取得 是否圖片隨視窗縮放
         */
        function getIsZoomWithWindow() { return isZoomWithWindow; }
        /**
         * 設定 是否圖片隨視窗縮放
         * @param val 
         */
        function setIsZoomWithWindow(val: boolean) { isZoomWithWindow = val; }

        /**
         * 取得 loading 圖片
         */
        function getLoadingUrl(): string { return loadingUrl }
        /**
         * 設定 loading 圖片
         * @param _url 
         */
        function setLoadingUrl(_url: string): void {
            loadingUrl = _url;
            dom_loading.style.backgroundImage = `url("${loadingUrl}")`
        }
        /**
         * 顯示或隱藏 loading
         * @param val 
         * @param delay 延遲顯示(ms)
         */
        function setLoading(val: boolean, delay: number = 200) {
            if (val) {
                setTimeout(() => {
                    if ((new Date()).getTime() > temp_dateShowLoading) {
                        dom_loading.style.display = "block";
                    }
                }, delay);
                temp_dateShowLoading = (new Date()).getTime() + delay - 1;
            } else {
                temp_dateShowLoading = 99999999999999; // 避免延遲時間到了之後還顯示
                dom_loading.style.display = "none";
            }
        }

        /**
         * 取得 error 圖片
         */
        function getErrerUrl(): string { return errerUrl; }
        /**
         * 設定 error 圖片
         */
        function setErrerUrl(_url: string): void { errerUrl = _url; }

        /**
         * 取得 外距
         */
        function getMargin(): { top: number, right: number, bottom: number, left: number } {
            return { top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft };
        }
        /**
         * 設定 外距
         */
        function setMargin(_top: number, _right: number, _bottom: number, _left: number): void {
            marginTop = _top;
            marginLeft = _left;
            marginBottom = _bottom;
            marginRight = _right;
        }

        /**
         * 設定 dpizoom。嘗試以更高的DPI來渲染圖片
         * @param val -1=自動(根據網頁縮放比例與螢幕縮放)  1=原始  2=圖片縮小一半
         * @param isOnlyRun 單純執行而不設定
         */
        function setDpizoom(val: number, isOnlyRun: boolean = false) {

            if (val == -1) {
                val = window.devicePixelRatio;
                if (isOnlyRun === false) { isDpizoomAUto = true; }
            } else {
                if (isOnlyRun === false) { isDpizoomAUto = false; }
            }

            // 重新縮放圖片
            zoomIn(undefined, undefined, dpizoom2 / val);

            // TODO 已棄用，因為會 chrome 128 版的 zoom 機制與原本的不一樣
            // @ts-ignore
            // dom_dpizoom.style.zoom = (1 / val);
            // dpizoom = val;
            dpizoom2 = val;
        }

        /**
         * 取得 允許拖曳的溢位距離
         */
        function getOverflowDistance(): number { return overflowDistance; }
        /**
         * 設定 允許拖曳的溢位距離
         */
        function setOverflowDistance(_v: number): void { overflowDistance = _v; }

        /**
         * 取得 圖片的渲染模式
         */
        function getRendering(): TiefseeviewImageRendering { return rendering; }
        /**
         * 設定 圖片的渲染模式
         * @param _renderin 
         * @param isOnlyRun 單純執行而不設定
         */
        function setRendering(_renderin: TiefseeviewImageRendering, isOnlyRun: boolean = false) {

            if (isOnlyRun === false) {
                rendering = _renderin;
            }

            if (_renderin === TiefseeviewImageRendering["auto"]) {
                dom_data.style.imageRendering = "auto";

            } else if (_renderin === TiefseeviewImageRendering["pixelated"]) {
                dom_data.style.imageRendering = "pixelated";

            } else if (_renderin === TiefseeviewImageRendering["autoOrPixelated"]) {
                if (getZoomRatio() > 1) {
                    dom_data.style.imageRendering = "pixelated";
                } else {
                    dom_data.style.imageRendering = "auto";
                }
            }
        }

        /**
         * 設定對齊
         */
        function setAlign(_type: TiefseeviewAlignType) {

            let type_horizontal: ("left" | "center" | "right") = "center"; // 水平對齊方式
            let type_vertical: ("top" | "center" | "bottom") = "center"; // 垂直對齊方式
            let x: number = 0;
            let y: number = 0;

            if (_type === TiefseeviewAlignType["none"]) {
                return;
            }
            if (_type === TiefseeviewAlignType["top"]) {
                type_horizontal = "center";
                type_vertical = "top";
            }
            if (_type === TiefseeviewAlignType["right"]) {
                type_horizontal = "right";
                type_vertical = "center";
            }
            if (_type === TiefseeviewAlignType["left"]) {
                type_horizontal = "left";
                type_vertical = "center";
            }
            if (_type === TiefseeviewAlignType["bottom"]) {
                type_horizontal = "center";
                type_vertical = "bottom";
            }
            if (_type === TiefseeviewAlignType["topRight"]) {
                type_horizontal = "right";
                type_vertical = "top";
            }
            if (_type === TiefseeviewAlignType["bottomRight"]) {
                type_horizontal = "right";
                type_vertical = "bottom";
            }
            if (_type === TiefseeviewAlignType["topLeft"]) {
                type_horizontal = "left";
                type_vertical = "top";
            }
            if (_type === TiefseeviewAlignType["bottomLeft"]) {
                type_horizontal = "left";
                type_vertical = "bottom";
            }
            if (_type === TiefseeviewAlignType["center"]) {
                type_horizontal = "center";
                type_vertical = "center";
            }

            if (type_horizontal === "left") {
                x = marginLeft;
            }
            if (type_horizontal === "center") {
                x = (dom_dpizoom.offsetWidth - dom_con.offsetWidth) / 2;
            }
            if (type_horizontal === "right") {
                x = dom_dpizoom.offsetWidth - dom_con.offsetWidth - marginRight;
            }

            if (type_vertical === "top") {
                y = marginTop;
            }
            if (type_vertical === "center") {
                y = (dom_dpizoom.offsetHeight - dom_con.offsetHeight) / 2;
            }
            if (type_vertical === "bottom") {
                y = dom_dpizoom.offsetHeight - dom_con.offsetHeight - marginBottom;
            }

            setXY(x, y, 0);
            init_point(false);
        }

        /**
         * 取得圖片原始寬度
         */
        function getOriginalWidth(): number {
            return temp_originalWidth;
        }

        /**
         * 取得圖片原始高度
         */
        function getOriginalHeight(): number {
            return temp_originalHeight;
        }

        /**
         * 取得影片長度，非影片或尚未載入完畢則回傳 -1
         */
        function getVideoDuration() {
            if (dataType !== "video") { return -1; }
            return temp_videoDuration;
        }

        /**
         * 順時針旋轉 90°
         * @param isAnimation 是否使用動畫
         */
        async function setDegForward(_x: number | undefined, _y: number | undefined, isAnimation: boolean = true) {
            var deg: number = degNow;
            deg = (Math.floor(deg / 90) + 1) * 90;
            await setDeg(deg, _x, _y, isAnimation);
        }
        /**
         * 逆時針旋轉 90°
         * @param isAnimation 是否使用動畫
         */
        async function setDegReverse(_x: number | undefined, _y: number | undefined, isAnimation: boolean = true) {
            var deg: number = degNow;
            deg = (Math.ceil(deg / 90) - 1) * 90;
            await setDeg(deg, _x, _y, isAnimation);
        }

        /**
         * 取得 是否水平鏡像
         */
        function getMirrorHorizontal() { return mirrorHorizontal; }
        /**
         * 設定 水平鏡像
         * @param bool true=水平鏡像、false=原始狀態 
         * @param boolAnimation 是否使用動畫
         */
        async function setMirrorHorizontal(bool: boolean, _x?: number, _y?: number) {

            // 如果有啟用剪裁框，則重新計算剪裁框的位置
            let isUpdateClip = false;
            let clipInfo: { x: number, y: number, width: number, height: number, deg: number } = { x: 0, y: 0, width: 0, height: 0, deg: 0 };
            if (isClip && mirrorHorizontal !== bool) {
                isUpdateClip = true;
                clipInfo = getClipInfo();
            }

            if (degNow !== 0) {
                setDeg(360 - degNow, undefined, undefined, true); // 先旋轉成鏡像後的角度
            }

            mirrorHorizontal = bool;
            eventChangeMirror(mirrorHorizontal, mirrorVertical);

            let x;
            let y;
            if (_x !== undefined && _y !== undefined) {
                x = _x * dpizoom;
                y = _y * dpizoom;
            } else {
                x = (dom_dpizoom.offsetWidth / 2);
                y = (dom_dpizoom.offsetHeight / 2);
            }

            // 取得顯示範圍的中心點
            let left = -toNumber(dom_con.style.left) + x;
            let top = -toNumber(dom_con.style.top) + y;

            // 計算鏡像後的坐標
            left = dom_data.getBoundingClientRect().width - left;
            // top = dom_data.getBoundingClientRect().height - top;

            // 取得中心點在旋轉前的實際坐標
            let origPoint = getOrigPoint(left, top, toNumber(dom_data.style.width), toNumber(dom_data.style.height), degNow);
            left = origPoint.x;
            top = origPoint.y;

            // 取得旋轉回原本角度的坐標
            let rotateRect = getRotateRect(toNumber(dom_data.style.width), toNumber(dom_data.style.height), left, top, degNow);
            left = rotateRect.x;
            top = rotateRect.y;

            // 轉換成定位用的值，並移動回中心點
            left = -left + x;
            top = -top + y;

            await setTransform(undefined, undefined, false);

            setXY(left, top, 0);
            if (getIsOverflowX() === false) { // 在圖片有滾動條且指定坐標來鏡像時，允許超出視窗
                init_point(false);
            }

            // 如果有啟用剪裁框，則重新計算剪裁框的位置
            if (isUpdateClip) {
                // 計算圖片旋轉後的大小
                let rect1 = getRotateRect(getOriginalWidth(), getOriginalHeight(), 0, 0, degNow);

                // 鏡像後的坐標
                let clipX = rect1.rectWidth - clipInfo.x - clipInfo.width;

                // 設定剪裁框的位置
                setClipXY(clipX, clipInfo.y, clipInfo.width, clipInfo.height);
            }
        }

        /**
         * 取得 是否垂直鏡像
         */
        function getMirrorVertica() { return mirrorVertical; }
        /**
         * 設定 垂直鏡像
         * @param bool true=垂直鏡像、false=原始狀態 
         * @param boolAnimation 是否使用動畫
         */
        async function setMirrorVertica(bool: boolean, _x?: number, _y?: number) {

            // 如果有啟用剪裁框，則重新計算剪裁框的位置
            let isUpdateClip = false;
            let clipInfo: { x: number, y: number, width: number, height: number, deg: number } = { x: 0, y: 0, width: 0, height: 0, deg: 0 };
            if (isClip && mirrorVertical !== bool) {
                isUpdateClip = true;
                clipInfo = getClipInfo();
            }

            if (degNow !== 0) {
                setDeg(360 - degNow, undefined, undefined, true); // 先旋轉成鏡像後的角度
            }

            mirrorVertical = bool;
            eventChangeMirror(mirrorHorizontal, mirrorVertical);

            let x;
            let y;
            if (_x !== undefined && _y !== undefined) {
                x = _x * dpizoom;
                y = _y * dpizoom;
            } else {
                x = (dom_dpizoom.offsetWidth / 2);
                y = (dom_dpizoom.offsetHeight / 2);
            }
            // 取得顯示範圍的中心點
            let left = -toNumber(dom_con.style.left) + x;
            let top = -toNumber(dom_con.style.top) + y;

            // 計算鏡像後的坐標
            // left = dom_data.getBoundingClientRect().width - left;
            top = dom_data.getBoundingClientRect().height - top;

            // 取得中心點在旋轉前的實際坐標
            let origPoint = getOrigPoint(left, top, toNumber(dom_data.style.width), toNumber(dom_data.style.height), degNow);
            left = origPoint.x;
            top = origPoint.y;

            // 取得旋轉回原本角度的坐標
            let rotateRect = getRotateRect(toNumber(dom_data.style.width), toNumber(dom_data.style.height), left, top, degNow);
            left = rotateRect.x;
            top = rotateRect.y;

            // 轉換成定位用的值，並移動回中心點
            left = -left + x;
            top = -top + y;

            await setTransform(undefined, undefined, false);

            setXY(left, top, 0);
            if (getIsOverflowY() === false) { // 在圖片有滾動條且指定坐標來鏡像時，允許超出視窗
                init_point(false);
            }

            // 如果有啟用剪裁框，則重新計算剪裁框的位置
            if (isUpdateClip) {
                // 計算圖片旋轉後的大小
                let rect1 = getRotateRect(getOriginalWidth(), getOriginalHeight(), 0, 0, degNow);

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
        function getDeg(): number { return degNow; }
        /**
          * 設定 旋轉角度
          * @param _deg 角度
          * @param isAnimation 是否使用動畫
          */
        async function setDeg(_deg: number, _x: number | undefined, _y: number | undefined, isAnimation: boolean = true) {

            // 如果有啟用剪裁框，且旋轉角度是90的倍數，則重新計算剪裁框的位置
            let isUpdateClip = false;
            let clipInfo: { x: number, y: number, width: number, height: number, deg: number } = { x: 0, y: 0, width: 0, height: 0, deg: 0 };
            if (isClip) {
                if (_deg % 90 === 0 && degNow % 90 === 0 && _deg !== degNow) {
                    clipInfo = getClipInfo(); // 記錄旋轉前的 clip 位置
                    isUpdateClip = true;
                }
            }

            // 設定旋轉角度
            degNow = _deg;
            eventChangeDeg(degNow);
            await setTransform(_x, _y, isAnimation);

            // 如果有啟用剪裁框，且旋轉角度是90的倍數，則重新計算剪裁框的位置
            if (isUpdateClip) {
                // 計算剪裁框在圖片旋轉前的位置
                let origPoint1 = getOrigPoint(clipInfo.x, clipInfo.y, getOriginalWidth(), getOriginalHeight(), clipInfo.deg);
                let origPoint2 = getOrigPoint(clipInfo.x + clipInfo.width, clipInfo.y + clipInfo.height, getOriginalWidth(), getOriginalHeight(), clipInfo.deg);

                // 計算旋轉後的剪裁框位置
                let rect1 = getRotateRect(getOriginalWidth(), getOriginalHeight(), origPoint1.x, origPoint1.y, degNow);
                let rect2 = getRotateRect(getOriginalWidth(), getOriginalHeight(), origPoint2.x, origPoint2.y, degNow);

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
                x: toNumber(dom_con.style.left),
                y: toNumber(dom_con.style.top)
            };
        }
        /**
         * 設定 圖片的坐標
         * @param _left 
         * @param _top 
         * @param _sp 動畫時間(毫秒)
         */
        async function setXY(_left: number | undefined, _top: number | undefined, _sp: number) {

            // 允許只填單一參數，未填的使用目前的坐標
            if (_top === undefined) { _top = toNumber(dom_con.style.top) }
            if (_left === undefined) { _left = toNumber(dom_con.style.left) }

            eventChangeXY(_left, _top);

            if (_sp <= 0) {

                dom_con.style.top = _top + "px";
                dom_con.style.left = _left + "px";
                init_scroll(); // 初始化滾動條的位置(跟隨圖片位置同步)

            } else {

                await new Promise((resolve, reject) => {

                    $(dom_con).animate(
                        {
                            "top": _top, // 自訂用於動畫的變數
                            "left": _left,
                        },
                        {
                            step: function (now: any, fx: any) {
                                // @ts-ignore
                                let data: { left: number, top: number } = $(dom_data).animate()[0]; // 取得記錄所有動畫變數的物件
                                dom_con.style.top = data.top + "px";
                                dom_con.style.left = data.left + "px";
                                bigimgDraw();
                                init_scroll(); // 初始化滾動條的位置(跟隨圖片位置同步)
                            },
                            duration: _sp, // 動畫時間
                            start: () => { },
                            complete: () => { // 動畫結束時
                                dom_con.style.top = _top + "px";
                                dom_con.style.left = _left + "px";
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
            init_point(false);
        }

        /**
         * 旋轉跟鏡像初始化
         * @param boolAnimation 是否使用動畫
         */
        async function transformRefresh(boolAnimation: boolean = true): Promise<void> {
            if (mirrorVertical === true) {
                await setMirrorVertica(false);
            }
            if (mirrorHorizontal === true) {
                await setMirrorHorizontal(false);
            }
            await setDeg(0, undefined, undefined, boolAnimation);
        }

        /**
         * 設定 transform (旋轉、鏡像)
         * @param isAnimation 是否使用動畫
         */
        async function setTransform(_x: number | undefined, _y: number | undefined, isAnimation: boolean = true): Promise<void> {

            $(dom_data).stop(true, false);

            // 動畫時間
            let duration: number = transformDuration;
            if (isAnimation == false) {
                duration = 0; // 無動畫
            }

            // 鏡像
            let scaleX = 1;
            if (mirrorHorizontal === true) { scaleX = -1; }
            let scaleY = 1;
            if (mirrorVertical === true) { scaleY = -1; }

            if (duration <= 0) {
                // 如果角度超過360，就初始化
                if (degNow <= 0 || degNow >= 360) { degNow = degNow - Math.floor(degNow / 360) * 360; } // 避免超過360               
                $(dom_data).animate({ "transform_rotate": degNow, "transform_scaleX": scaleX, "transform_scaleY": scaleY, }, { duration: 0 });
                dom_data.style.transform = `rotate(${degNow}deg) scaleX(${scaleX}) scaleY(${scaleY})`;

                dom_data.setAttribute("transform_rotate", degNow.toString());
                init_point(false);
                return;
            }

            await new Promise((resolve, reject) => {

                $(dom_data).animate({
                    "transform_rotate": degNow, // 自訂用於動畫的變數
                    "transform_scaleX": scaleX,
                    "transform_scaleY": scaleY,
                }, {
                    start: () => { },
                    step: function (now: any, fx: any) {

                        // if (fx.prop == "transform_rotate") { }

                        // @ts-ignore
                        let andata: { transform_rotate, transform_scaleX, transform_scaleY } = $(dom_data).animate()[0]; // 取得記錄所有動畫變數的物件

                        // 沒有指定從哪裡開始旋轉，就從中間
                        if (_x === undefined) { _x = (dom_dpizoom.offsetWidth / 2); }
                        if (_y === undefined) { _y = (dom_dpizoom.offsetHeight / 2); }

                        // 取得旋轉點在在旋轉前的位置(絕對坐標)
                        let _x2 = _x - toNumber(dom_con.style.left);
                        let _y2 = _y - toNumber(dom_con.style.top);

                        // 取得旋轉點在旋轉前的位置(相對坐標)
                        let _degNow: string | null = dom_data.getAttribute("transform_rotate");
                        if (_degNow === null) { _degNow = "0"; }
                        let rect0 = getOrigPoint(_x2, _y2, dom_data.offsetWidth, dom_data.offsetHeight, toNumber(_degNow));
                        let x4 = rect0.x
                        let y4 = rect0.y

                        // 計算旋轉後的坐標
                        let rect2 = getRotateRect(dom_data.offsetWidth, dom_data.offsetHeight, x4, y4, andata.transform_rotate);

                        dom_data.style.transform = `rotate(${andata.transform_rotate}deg) scaleX(${andata.transform_scaleX}) scaleY(${andata.transform_scaleY})`;
                        dom_data.setAttribute("transform_rotate", andata.transform_rotate); // 儲存目前動畫旋轉的角度
                        setXY(_x - rect2.x, _y - rect2.y, 0);

                        init_point(false);

                    },
                    duration: duration, // 動畫時間

                    complete: () => { // 動畫結束時

                        // 如果角度超過360，就初始化
                        if (degNow <= 0 || degNow >= 360) { degNow = degNow - Math.floor(degNow / 360) * 360; } // 避免超過360               
                        $(dom_data).animate({ "transform_rotate": degNow, "transform_scaleX": scaleX, "transform_scaleY": scaleY, }, { duration: 0 });
                        dom_data.style.transform = `rotate(${degNow}deg) scaleX(${scaleX}) scaleY(${scaleY})`;

                        dom_data.setAttribute("transform_rotate", degNow.toString());
                        init_point(false);
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
            let _w = toNumber(dom_data.style.width); // 原始圖片大小(旋轉前的大小)
            let _scale = _w / getOriginalWidth(); // 目前的 圖片縮放比例
            return _scale;
        }

        /**
         * 套用 縮放圖片
         * @param _type 縮放類型
         * @param _val 附加參數，例如以px或%進行縮放時，必須另外傳入number
         */
        function zoomFull(_type: TiefseeviewZoomType, _val?: number, _x?: number, _y?: number): void {

            // 圖片隨視窗縮放
            temp_TiefseeviewZoomType = _type;
            if (_val != undefined) { temp_TiefseeviewZoomTypeVal = _val; }
            if (_type === TiefseeviewZoomType["windowWidthRatio"] || _type === TiefseeviewZoomType["windowHeightRatio"] ||
                _type === TiefseeviewZoomType["fiwWindowWidth"] || _type === TiefseeviewZoomType["fitWindowHeight"] ||
                _type === TiefseeviewZoomType["fitWindow"] || _type === TiefseeviewZoomType["fitWindowOrImageOriginal"]) {

                temp_zoomWithWindow = true;
            } else {
                temp_zoomWithWindow = false;
            }

            /* if (_type === TiefseeviewZoomType.imageOriginal) {
                let tatio = getOriginalWidth() / dom_con.offsetWidth;
                if (_x !== undefined && _y !== undefined) {
                    zoomIn(_x, _y, tatio);
                } else {
                    zoomIn(undefined, undefined, tatio);
                }
            } else { */
            let _w = getZoomFull_width(_type, _val);
            setDataSize(_w);
            setXY(
                (toNumber(dom_con.style.left)) * 0,
                (toNumber(dom_con.style.top)) * 0,
                0
            );
            init_point(false);
            eventChangeZoom(getZoomRatio() * dpizoom2);
            setRendering(rendering);
            // }

        }
        /** 取得縮放圖片後的 縮放比例 */
        function getZoomFull_scale(_type: TiefseeviewZoomType, _val?: number) {
            let _w = getZoomFull_width(_type, _val);
            return _w / getOriginalWidth();
        }
        /** 取得縮放圖片都得 寬度 (用於套用設定) */
        function getZoomFull_width(_type: TiefseeviewZoomType, _val?: number) {
            if (_type === undefined) { _type = TiefseeviewZoomType["fitWindow"] }
            if (_val === undefined) { _val = 100 }

            let _w = 1;

            // 取得圖片在原始大小下，旋轉後的實際長寬(避免圖片經縮放後，長寬比例失去精度)
            let rect = getRotateRect(getOriginalWidth(), getOriginalHeight(), 0, 0, degNow);
            let dom_con_offsetWidth = rect.rectWidth;
            let dom_con_offsetHeight = rect.rectHeight;

            if (_type === TiefseeviewZoomType["fitWindowOrImageOriginal"]) {
                if (getOriginalWidth() / dpizoom2 > (dom_dpizoom.offsetWidth - marginLeft - marginRight) ||
                    getOriginalHeight() / dpizoom2 > (dom_dpizoom.offsetHeight - marginTop - marginBottom)) { // 圖片比視窗大時
                    _type = TiefseeviewZoomType["fitWindow"]; // 縮放至視窗大小
                } else {
                    _type = TiefseeviewZoomType["imageOriginal"]; // 圖片原始大小
                }
            }
            // 圖片原始大小
            if (_type === TiefseeviewZoomType["imageOriginal"]) {
                _w = getOriginalWidth();
                _w = _w / dpizoom2;
            }
            if (_type === TiefseeviewZoomType["fitWindow"]) { // 縮放至視窗大小
                let ratio_w = dom_con_offsetWidth / (dom_dpizoom.offsetWidth - marginLeft - marginRight)
                let ratio_h = dom_con_offsetHeight / (dom_dpizoom.offsetHeight - marginTop - marginBottom)
                if (ratio_w > ratio_h) {
                    _type = TiefseeviewZoomType["fiwWindowWidth"]
                } else {
                    _type = TiefseeviewZoomType["fitWindowHeight"]
                }
            }
            if (_type === TiefseeviewZoomType["fiwWindowWidth"]) { // 寬度全滿
                _val = 100;
                _type = TiefseeviewZoomType["windowWidthRatio"];
            }
            if (_type === TiefseeviewZoomType["fitWindowHeight"]) { // 高度全滿
                _val = 100;
                _type = TiefseeviewZoomType["windowHeightRatio"];
            }
            if (_type === TiefseeviewZoomType["windowWidthRatio"]) { // 以視窗寬度比例設定
                let w = dom_dpizoom.offsetWidth - marginLeft - marginRight - 5; // 顯示範圍 - 邊距
                if (w < 10) { w = 10 }
                let ratio = getOriginalWidth() / dom_con_offsetWidth;
                _w = (w * ratio * (_val / 100));
            }
            if (_type === TiefseeviewZoomType["windowHeightRatio"]) { // 以視窗高度比例設定
                let w = dom_dpizoom.offsetHeight - marginTop - marginBottom - 5; // 顯示範圍 - 邊距
                if (w < 10) { w = 10 }
                let ratio = getOriginalWidth() / dom_con_offsetWidth; // 旋轉後的比例
                let ratio_xy = dom_con_offsetWidth / dom_con_offsetHeight; // 旋轉後圖片長寬的比例
                _w = (w * ratio * ratio_xy * (_val / 100));
            }

            if (_type === TiefseeviewZoomType["imageWidthPx"]) { // 以絕對寬度設定
                let ratio = getOriginalWidth() / dom_con_offsetWidth;
                _w = (toNumber(_val) * ratio);
                _w = _w / dpizoom2;
            }
            if (_type === TiefseeviewZoomType["imageHeightPx"]) { // 以絕對高度設定
                let ratio = getOriginalWidth() / dom_con_offsetWidth; // 旋轉後的比例
                let ratio_xy = dom_con_offsetWidth / dom_con_offsetHeight; // 旋轉後圖片長寬的比例
                _w = (toNumber(_val) * ratio * ratio_xy);
                _w = _w / dpizoom2;
            }

            return _w;
        }

        /**
         * 放大
         * @param _x 
         * @param _y 
         * @param _zoomRatio 渲染模式 (僅套用css，不會覆寫設定
         */
        function zoomIn(_x?: number, _y?: number, _zoomRatio?: number, _rendering?: TiefseeviewImageRendering) {

            // 未填入參數則從中央進行縮放
            if (_x === undefined) { _x = dom_dpizoom.offsetWidth / 2; } else { _x *= dpizoom; }
            if (_y === undefined) { _y = dom_dpizoom.offsetHeight / 2; } else { _y *= dpizoom; }

            // 未填入縮放比例，就是用預設縮放比例
            if (_zoomRatio === undefined) { _zoomRatio = zoomRatio }

            // 渲染模式
            if (_rendering === undefined) {
                _rendering = rendering
            }
            setRendering(_rendering, true); // 單純套用css，而不覆寫設定

            // 圖片縮放上限
            if (_zoomRatio === 1) { return; }
            if (_zoomRatio > 1 && eventLimitMax()) { return; }
            if (_zoomRatio < 1 && eventLimitMin()) { return; }

            let w = dom_data.offsetWidth;
            w *= _zoomRatio;
            setDataSize(w);

            var xxx = _x - toNumber(dom_con.style.left);
            var yyy = _y - toNumber(dom_con.style.top);

            var xx2 = dom_con.offsetWidth - dom_con.offsetWidth / _zoomRatio;
            var yy2 = dom_con.offsetHeight - dom_con.offsetHeight / _zoomRatio;

            setXY(
                (toNumber(dom_con.style.left) - ((xxx / dom_con.offsetWidth) * xx2) * _zoomRatio),
                (toNumber(dom_con.style.top) - ((yyy / dom_con.offsetHeight) * yy2) * _zoomRatio),
                0
            );

            init_point(false);
            eventChangeZoom(getZoomRatio() * dpizoom2);
        }
        /**
         * 縮小
         * @param _x 
         * @param _y 
         */
        function zoomOut(_x?: number, _y?: number, _zoomRatio?: number) {
            // 未填入縮放比例，就是用預設縮放比例
            if (_zoomRatio === undefined) {
                _zoomRatio = (1 / zoomRatio)
            }
            zoomIn(_x, _y, _zoomRatio);
        }

        /**
         * 主動觸發 wheel 事件
         */
        function sendWheelEvent(event: WheelEvent) {
            // 創建一個新的滾輪事件，並設置相應的坐標
            var newEvent = new WheelEvent("wheel", {
                clientX: event.x * dpizoom2,
                clientY: event.y * dpizoom2,
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
            dom_dpizoom.dispatchEvent(newEvent);
        }

        /**
         * 判斷圖片是否大於視窗(寬度)
         */
        function getIsOverflowX(): boolean {
            if (dom_con.offsetWidth + marginLeft + marginRight > dom_dpizoom.offsetWidth) {
                return true;
            }
            return false;
        }

        /**
         * 判斷圖片是否大於視窗(高度)
         */
        function getIsOverflowY(): boolean {
            if (dom_con.offsetHeight + marginTop + marginBottom > dom_dpizoom.offsetHeight) {
                return true;
            }
            return false;
        }

        /** 
         * 取得目前的圖片網址
         */
        function getUrl() { return url; }

        /**
         * 從 Canvas 取得 base64
         */
        async function getCanvasBase64(zoom: number, quality: "high" | "low" | "medium") {
            let blob = await getCanvasBlob(zoom, quality);
            if (blob == null) { return ""; }
            let base64 = await blobToBase64(blob) as string;
            return base64;
        }

        /**
         * 從 Canvas 取得 Blob
         */
        async function getCanvasBlob(zoom: number, quality: "high" | "low" | "medium", type = "png", q = 0.8) {

            let can = await getCanvas();
            if (can === null) { return null; }

            if (zoom < 1) {
                can = getCanvasZoom(can, zoom, quality);
            }

            let blob: Blob | null = null;

            await new Promise((resolve, reject) => {
                if (can === null) { return null; }

                let outputType = "image/png";
                if (dataType === "video") {
                    outputType = "image/jpeg";
                }
                if (type === "webp") {
                    outputType = "image/webp";
                }
                if (type === "jpg" || type === "jpeg") {
                    outputType = "image/jpeg";

                    // 背景色改成白色
                    let cc = document.createElement("canvas");
                    cc.width = can.width;
                    cc.height = can.height;
                    let context = cc.getContext("2d") as CanvasRenderingContext2D;
                    context.fillStyle = "#FFFFFF"; // 填滿顏色
                    context.fillRect(0, 0, can.width, can.height);
                    context.drawImage(can, 0, 0, can.width, can.height);
                    can = cc;
                }

                can.toBlob((b) => {
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

            if (dataType === "bigimg") {
                return temp_can;
            }

            if (dataType === "img") {
                temp_can = document.createElement("canvas");
                temp_can.width = getOriginalWidth();
                temp_can.height = getOriginalHeight();
                let context0 = temp_can.getContext("2d");
                context0?.drawImage(dom_img, 0, 0, getOriginalWidth(), getOriginalHeight());
                return temp_can;
            }

            if (dataType === "video") {
                temp_can = document.createElement("canvas");
                temp_can.width = getOriginalWidth();
                temp_can.height = getOriginalHeight();
                let context0 = temp_can.getContext("2d");
                context0?.drawImage(dom_video, 0, 0, getOriginalWidth(), getOriginalHeight());
                return temp_can;
            }

            if (dataType === "bigimgscale") { // 未測試

                if (temp_bigimgscale[1] != undefined) {
                    return temp_bigimgscale[1];

                } else {
                    let p = await new Promise((resolve, reject) => {

                        let tempUrl = getUrl();
                        let domImg = document.createElement("img");
                        domImg.addEventListener("load", (e) => {
                            if (tempUrl != getUrl()) { // 避免已經切換圖片了
                                // console.log("old:" + tempUrl + "   new:" + getUrl())
                                resolve(false);
                                return;
                            }
                            temp_bigimgscale[1] = urlToCanvas(tempUrl)
                            resolve(true);
                        });
                        domImg.addEventListener("error", (e) => {
                            resolve(false);
                        })
                        domImg.src = tempUrl;
                    })

                    if (p) {
                        if (temp_bigimgscale[1] != undefined) {
                            return temp_bigimgscale[1];
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
            let dpizoom3 = dpizoom2;
            if (dpizoom3 < 1) { dpizoom3 = 1; }
            let ret = arBigimgscale[0];

            for (let i = arBigimgscale.length - 1; i >= 0; i--) {
                const item = arBigimgscale[i];
                if (item.scale / dpizoom3 >= scale) {
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
            let domImg = document.createElement("img");
            domImg.src = url;

            let domCan = document.createElement("canvas");
            domCan.width = domImg.width;
            domCan.height = domImg.height;
            let context0 = domCan.getContext("2d");
            context0?.drawImage(domImg, 0, 0, domImg.width, domImg.height);

            return domCan;
        }

        // #region BigimgTemp 

        /**
         * [private] 根據目前的縮放比例來取得縮小後的圖片
         * @returns 
         */
        function getBigimgTemp() {
            if (dataType === "bigimgscale") {
                return getBigimgTemp_bigimgscale();
            }
            if (dataType === "bigimg") {
                return getBigimgTemp_bigimg();
            }
            return null;
        }


        var temp_bigimg: (undefined | HTMLCanvasElement | ImageBitmap)[] = [];
        /**
         * [private]
         */
        function getBigimgTemp_bigimg() {

            let x = 0.8; // 每次縮小的比例
            let len = 6; // 最多縮小幾次

            let _scale = getScale(); // 目前的 圖片縮放比例

            // 如果不需要縮小，就直接回傳
            if (_scale > 0.5) {
                return {
                    img: temp_can,
                    scale: 1
                }
            }

            // 第一次縮小
            if (temp_bigimg[0] === undefined) {
                temp_bigimg[0] = getCanvasZoom(temp_can, x, "medium")
            }

            for (let i = 1; i < len; i++) {

                // 產生縮小後的圖片
                if (temp_bigimg[i] === undefined) {
                    let last = temp_bigimg[i - 1] as HTMLCanvasElement | HTMLImageElement | ImageBitmap; // 上一次的圖
                    temp_bigimg[i] = getCanvasZoom(last, x, "medium");
                    // console.log(Math.pow(x, i + 1));
                }

                // 如果下一次縮小會比目標值還小，就回傳目前
                if (Math.pow(x, i + 2) < _scale) {
                    return {
                        img: temp_bigimg[i],
                        scale: Math.pow(x, i + 1)
                    }
                }
            }

            // 回傳最小的圖
            return {
                img: temp_bigimg[temp_bigimg.length - 1],
                scale: Math.pow(x, temp_bigimg.length)
            }
        }
        /** [private] 取得縮放後的Canvas */
        function getCanvasZoom(img: HTMLCanvasElement | HTMLImageElement | ImageBitmap, zoom: number, quality: ("high" | "low" | "medium")) {

            let width = Math.floor(img.width * zoom);
            let height = Math.floor(img.height * zoom);

            let cs = document.createElement("canvas");
            cs.width = width;
            cs.height = height;
            let context0 = cs.getContext("2d") as CanvasRenderingContext2D;

            context0.imageSmoothingQuality = quality;
            context0.drawImage(img, 0, 0, width, height);
            return cs;
        }

        var temp_bigimgscale: { [key: number]: (HTMLCanvasElement | undefined) } = {}; // 記錄已經載入過的圖片
        var temp_bigimgscaleKey: number[] = []; // 判斷哪些圖片已經載入過了
        /** [private] */
        function getBigimgTemp_bigimgscale() {

            let nowItem = getBigimgscaleItem();

            // 有已經處理過的圖片就直接回傳
            if (temp_bigimgscale[nowItem.scale] != undefined) {
                // console.log("完成 " + nowItem.scale)
                return {
                    img: temp_bigimgscale[nowItem.scale],
                    scale: nowItem.scale
                }
            }

            // 開始載入新圖片
            if (temp_bigimgscaleKey.indexOf(nowItem.scale) === -1) {
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
                worker.postMessage({
                    url: nowItem.url,
                    tempUrl: getUrl(),
                    scale: nowItem.scale,
                });
                // console.log("處理中 " + nowItem.scale)
            }
            temp_bigimgscaleKey.push(nowItem.scale);

            // 回傳已經處理過的圖片
            let arKey = Object.keys(temp_bigimgscale);
            let sc = Number(arKey[0])
            for (let i = 0; i < arKey.length; i++) {
                let key = Number(arKey[i])
                if (key >= sc && key <= nowItem.scale) {
                    sc = key
                }
            }

            return {
                img: temp_bigimgscale[sc],
                scale: sc
            }
        }

        // 使用 Worker 在背景載入圖片
        try {

            // var worker_url = URL.createObjectURL(new Blob([`${worker_js}`]));
            // var worker = new Worker(worker_url);
            var worker = new Worker("./js/TiefseeviewWorker.js");
            worker.addEventListener('message', function (e) {

                let tempUrl = e.data.tempUrl;
                let url = e.data.url;
                let scale = e.data.scale;

                let domImg = e.data.img;

                if (tempUrl != getUrl()) { // 避免已經切換圖片了
                    // console.log("old:" + tempUrl + "   new:" + getUrl())
                    return;
                }

                let domCan = document.createElement("canvas");
                domCan.width = domImg.width;
                domCan.height = domImg.height;
                let context0 = domCan.getContext("2d");
                context0?.drawImage(domImg, 0, 0, domImg.width, domImg.height);

                temp_bigimgscale[scale] = domCan;

                bigimgDraw(true)

            }, false);

        } catch (e2) {
            console.log("Worker 載入失敗，無法使用「bigimgscale」")
        }

        // #endregion

        var temp_drawImage = {
            scale: -1,
            sx: 0, sy: 0,
            sWidth: 1, sHeight: 1,
            dx: 0, dy: 0,
            dWidth: 1, dHeight: 1
        }

        /**
         * [private] bigimg 或 bigimgscale 渲染圖片
         */
        async function bigimgDraw(IsImmediatelyRun?: boolean) {

            updateClip(); // 更新裁切

            if (dataType !== "bigimg" && dataType !== "bigimgscale") { return; }

            if (getOriginalWidth() === 0) { return; } // 避免圖片尚未載入完成就渲染

            if (IsImmediatelyRun === true) {
                temp_drawImage = {
                    scale: -123,
                    sx: 0, sy: 0,
                    sWidth: 1, sHeight: 1,
                    dx: 0, dy: 0,
                    dWidth: 1, dHeight: 1
                }
            }
            let dpizoom3 = dpizoom2;
            if (dpizoom3 < 1) { dpizoom3 = 1; } // 低於 1 倍時圖片會變得模糊

            let bigimgTemp = getBigimgTemp(); // 判斷要使用原圖或是縮小後的圖片
            if (bigimgTemp === null) { return; }

            let can = bigimgTemp.img;
            if (can == null) { return; }
            let temp_can_width = can.width;
            let temp_can_height = can.height;

            let _w = toNumber(dom_data.style.width); // 原始圖片大小(旋轉前的大小)
            let _h = toNumber(dom_data.style.height);
            if (_w === 0 || _h === 0) { return; }
            let _margin = 35 * dpizoom3; // 多繪製的區域
            let _scale = _w / getOriginalWidth() * dpizoom3; // 目前的 圖片縮放比例
            let radio_can = 1;
            if (_w > getOriginalWidth()) { // 如果圖片大於1倍，則用用原始大小
                radio_can = _w / getOriginalWidth()
            }

            dom_bigimg.style.width = _w + "px";
            dom_bigimg.style.height = _h + "px";

            // 取得顯示範圍左上角的坐標
            let img_left = -toNumber(dom_con.style.left);
            let img_top = -toNumber(dom_con.style.top);

            // 計算顯示範圍的四個角落在圖片旋轉前的位置
            let origPoint1 = getOrigPoint(img_left, img_top, _w, _h, degNow);
            let origPoint2 = getOrigPoint(img_left + dom_dpizoom.offsetWidth, img_top, _w, _h, degNow);
            let origPoint3 = getOrigPoint(img_left + dom_dpizoom.offsetWidth, img_top + dom_dpizoom.offsetHeight, _w, _h, degNow);
            let origPoint4 = getOrigPoint(img_left, img_top + dom_dpizoom.offsetHeight, _w, _h, degNow);

            // 轉換鏡像前的坐標
            function calc(_p: { x: number, y: number }) {
                if (mirrorVertical) {
                    _p.y = toNumber(dom_data.style.height) - _p.y
                }
                if (mirrorHorizontal) {
                    _p.x = toNumber(dom_data.style.width) - _p.x
                }
                return _p;
            }
            origPoint1 = calc(origPoint1);
            origPoint2 = calc(origPoint2);
            origPoint3 = calc(origPoint3);
            origPoint4 = calc(origPoint4);

            // 取得圖片旋轉前的left、top
            img_left = origPoint1.x;
            img_top = origPoint1.y;
            if (img_left > (origPoint1.x)) { img_left = (origPoint1.x) }
            if (img_left > (origPoint2.x)) { img_left = (origPoint2.x) }
            if (img_left > (origPoint3.x)) { img_left = (origPoint3.x) }
            if (img_left > (origPoint4.x)) { img_left = (origPoint4.x) }
            if (img_top > (origPoint1.y)) { img_top = (origPoint1.y) }
            if (img_top > (origPoint2.y)) { img_top = (origPoint2.y) }
            if (img_top > (origPoint3.y)) { img_top = (origPoint3.y) }
            if (img_top > (origPoint4.y)) { img_top = (origPoint4.y) }

            // 取得圖片旋轉後的width、height
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
            viewWidth = viewWidth - img_left;
            viewHeight = viewHeight - img_top;

            let sx = (img_left - _margin) / _scale;
            let sy = (img_top - _margin) / _scale;
            let sWidth = (viewWidth + _margin * 2) / _scale * radio_can;
            let sHeight = (viewHeight + _margin * 2) / _scale * radio_can;
            let dx = img_left - _margin;
            let dy = img_top - _margin;
            let dWidth = (viewWidth + _margin * 2);
            let dHeight = (viewHeight + _margin * 2);

            sx *= dpizoom3;
            sy *= dpizoom3;
            sWidth *= dpizoom3;
            sHeight *= dpizoom3;
            dx *= dpizoom3;
            dy *= dpizoom3;
            dWidth *= dpizoom3;
            dHeight *= dpizoom3;

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
                _scale != temp_drawImage.scale
                || Math.abs(dx - temp_drawImage.dx) > _margin / 2
                || Math.abs(dy - temp_drawImage.dy) > _margin / 2
                || Math.abs(sWidth - temp_drawImage.sWidth) > _margin / 2
                || Math.abs(sHeight - temp_drawImage.sHeight) > _margin / 2
            ) {
                temp_drawImage = {
                    scale: _scale,
                    sx: sx, sy: sy,
                    sWidth: sWidth, sHeight: sHeight,
                    dx: dx, dy: dy,
                    dWidth: dWidth, dHeight: dHeight
                }

                // 如果圖片大於 canvas 的最大限制，就改用 <img> 來渲染
                let nowWidth = can.width;
                let nowHeight = can.height;
                if (nowWidth > 65535 || nowHeight > 65535 || nowWidth * nowHeight > 265690000) {
                    console.log("圖片過大，無法渲染", url);
                    setDataType("img");
                    await loadImg(url);
                    // 載入圖片後必須重新設定大小
                    setDataSize(dom_data.offsetWidth);
                    return;
                }

                // if (sx < 0) { sx = 0 }
                // if (sy < 0) { sy = 0 }
                // if (sWidth > getOriginalWidth()) { sWidth = getOriginalWidth() }
                // if (sHeight > getOriginalHeight()) { sWidth = getOriginalHeight() }
                dom_bigimg_canvas.width = Math.floor((viewWidth + _margin * 2) / radio_can * dpizoom3);
                dom_bigimg_canvas.height = Math.floor((viewHeight + _margin * 2) / radio_can * dpizoom3);
                dom_bigimg_canvas.style.width = Math.floor(viewWidth + _margin * 2) + "px";
                dom_bigimg_canvas.style.height = Math.floor(viewHeight + _margin * 2) + "px";
                dom_bigimg_canvas.style.left = dx / dpizoom3 + "px";
                dom_bigimg_canvas.style.top = dy / dpizoom3 + "px";
                let context = <CanvasRenderingContext2D>dom_bigimg_canvas.getContext("2d");
                // context.imageSmoothingEnabled = false;


                temp_canvasSN += 1; // 用於判斷是否已經切換圖片
                let tc = temp_canvasSN;

                let resizeQuality: ResizeQuality = "high"; // medium

                if (can.width * can.height > eventHighQualityLimit() || isPinching) { // 如果圖片面積過大，或 雙指縮放中 

                    // console.log("drawImage直接渲染(不使用高品質縮放)");
                    sx = sx * bigimgTemp.scale
                    sy = sy * bigimgTemp.scale
                    sWidth = sWidth * bigimgTemp.scale
                    sHeight = sHeight * bigimgTemp.scale
                    dWidth = dWidth
                    dHeight = dHeight
                    toFloor();
                    // context.imageSmoothingQuality = "high";
                    context.drawImage(can,
                        sx, sy, sWidth, sHeight,
                        0, 0, dWidth, dHeight
                    );

                }
                else if (_scale / dpizoom3 > bigimgTemp.scale && bigimgTemp.scale < 1) {

                    // console.log("drawImage直接渲染 原圖尚未載入完成");
                    sx = sx * bigimgTemp.scale
                    sy = sy * bigimgTemp.scale
                    dWidth = dWidth / bigimgTemp.scale
                    dHeight = dHeight / bigimgTemp.scale
                    toFloor();
                    context.drawImage(can,
                        sx, sy, sWidth, sHeight,
                        0, 0, dWidth, dHeight
                    );

                }
                else if (_scale / dpizoom3 >= 1) {

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
                    resizeQuality = "medium";
                    await createImageBitmap(oc, 0, 0, sWidth, sHeight,
                        { resizeWidth: dWidth, resizeHeight: dHeight, resizeQuality: resizeQuality })
                        .then(function (sprites) {
                            if (tc === temp_canvasSN) {
                                context.drawImage(sprites, 0, 0,);
                            }
                        });

                }
                else if (sWidth > temp_can_width && sHeight > temp_can_height) {

                    // console.log("寬高跟高度全部渲染");
                    sWidth = temp_can_width;
                    sHeight = temp_can_height;
                    sx = dx * -1
                    sy = dy * -1
                    dWidth = temp_can_width * _scale / bigimgTemp.scale
                    dHeight = temp_can_height * _scale / bigimgTemp.scale
                    toFloor();
                    await createImageBitmap(can, 0, 0, sWidth, sHeight,
                        { resizeWidth: dWidth, resizeHeight: dHeight, resizeQuality: resizeQuality })
                        .then(function (sprites) {
                            if (tc === temp_canvasSN) {
                                context.drawImage(sprites, sx, sy,);
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
                    dHeight = getOriginalHeight() * _scale
                    toFloor();
                    await createImageBitmap(can, sx, 0, sWidth, sHeight,
                        { resizeWidth: dWidth, resizeHeight: dHeight, resizeQuality: resizeQuality })
                        .then(function (sprites) {
                            if (tc === temp_canvasSN) {
                                context.drawImage(sprites, 0, sy);
                            }
                        });

                }
                else if (sWidth > temp_can_width && sHeight > temp_can_height == false) {

                    // console.log("寬度全部渲染");
                    sWidth = temp_can_width;
                    // sHeight = getOriginalHeight();
                    sx = dx * -1
                    sy = sy * bigimgTemp.scale
                    dWidth = getOriginalWidth() * _scale
                    dHeight = dHeight / bigimgTemp.scale
                    toFloor();
                    await createImageBitmap(can, 0, sy, sWidth, sHeight,
                        { resizeWidth: dWidth, resizeHeight: dHeight, resizeQuality: resizeQuality })
                        .then(function (sprites) {
                            if (tc === temp_canvasSN) {
                                context.drawImage(sprites, sx, 0);
                            }
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
                        .then(function (sprites) {
                            if (tc === temp_canvasSN) {
                                context.drawImage(sprites, 0, 0,);
                            }
                        });
                }

            }

        }

        /**
         * [private] 改變內容大小
         */
        function setDataSize(_width: number) {
            if (dataType === "img") {
                let ratio = getOriginalHeight() / getOriginalWidth();
                dom_data.style.width = _width + "px";
                dom_data.style.height = (_width * ratio) + "px";
                dom_img.style.width = _width + "px";
                dom_img.style.height = (_width * ratio) + "px";
            }
            if (dataType === "bigimg" || dataType === "bigimgscale") {
                let ratio = getOriginalHeight() / getOriginalWidth();
                let _w = _width;
                let _h = _width * ratio;
                dom_data.style.width = _w + "px";
                dom_data.style.height = _h + "px";
            }
            if (dataType === "video") {
                let ratio = getOriginalHeight() / getOriginalWidth();
                dom_data.style.width = _width + "px";
                dom_data.style.height = (_width * ratio) + "px";
                dom_video.style.width = _width + "px";
                dom_video.style.height = (_width * ratio) + "px";
            }
        }

        /**
         * [private] 更新 滾動條位置
         */
        function init_scroll(): void {
            scrollX.update(
                dom_con.offsetWidth + marginLeft + marginRight,
                dom_dpizoom.offsetWidth,
                toNumber(dom_con.style.left) * -1 + marginLeft
            );
            scrollY.update(
                dom_con.offsetHeight + marginTop + marginBottom,
                dom_dpizoom.offsetHeight,
                toNumber(dom_con.style.top) * -1 + marginTop
            );
        }

        /**
         * [private] 更新 定位，避免圖片超出視窗範圍，圖片小於視窗時進行 置中
         * @param isAnimation 
         */
        async function init_point(isAnimation: boolean) {

            // 根據縮放或旋轉來重新設定圖片size
            dom_con.style.width = dom_data.getBoundingClientRect().width + "px";
            dom_con.style.height = dom_data.getBoundingClientRect().height + "px";

            init_scroll();

            if (isAnimation === undefined) { isAnimation = true; }

            let bool_w = getIsOverflowX();
            let bool_h = getIsOverflowY();

            let top = toNumber(dom_con.style.top);
            let left = toNumber(dom_con.style.left);

            if (bool_w && bool_h) { // 圖片寬度高度都大於視窗
                if (toNumber(dom_con.style.top) > marginTop) {
                    top = marginTop;
                }
                if (toNumber(dom_con.style.left) > marginLeft) {
                    left = marginLeft;
                }
                let t = dom_dpizoom.offsetHeight - dom_con.offsetHeight - marginBottom;
                if (toNumber(dom_con.style.top) < t) {
                    top = t;
                }
                let l = dom_dpizoom.offsetWidth - dom_con.offsetWidth - marginRight;
                if (toNumber(dom_con.style.left) < l) {
                    left = l;
                }
            }

            if (bool_w === false && bool_h) {
                if (toNumber(dom_con.style.top) > marginTop) {
                    top = marginTop;
                }
                let t = dom_dpizoom.offsetHeight - dom_con.offsetHeight - marginBottom;
                if (toNumber(dom_con.style.top) < t) {
                    top = t;
                }
                left = (dom_dpizoom.offsetWidth - dom_con.offsetWidth) / 2;
            }

            if (bool_w && bool_h === false) {
                if (toNumber(dom_con.style.left) > marginLeft) {
                    left = marginLeft;
                }
                let l = dom_dpizoom.offsetWidth - dom_con.offsetWidth - marginRight;
                if (toNumber(dom_con.style.left) < l) {
                    left = l;
                }
                top = (dom_dpizoom.offsetHeight - dom_con.offsetHeight) / 2;
            }

            if (bool_w === false && bool_h === false) { // 圖片小於視窗、置中
                left = (dom_dpizoom.offsetWidth - dom_con.offsetWidth) / 2;
                top = (dom_dpizoom.offsetHeight - dom_con.offsetHeight) / 2;
            }

            if (isAnimation) {
                await setXY(left, top, 100);
            } else {
                setXY(left, top, 0);
            }
        }

        EventChangePixelRatio(() => {
            if (isDpizoomAUto === true) {
                setDpizoom(window.devicePixelRatio, true);
            }
        })

        // -----------------------------------------------

        //#region Lib

        /**
         * 網頁比例縮放或是 DPI 變化時
         */
        function EventChangePixelRatio(func: () => void) {
            let remove: any = null;

            const updatePixelRatio = () => {
                if (remove != null) {
                    remove();
                }
                let mqString = `(resolution: ${window.devicePixelRatio}dppx)`;
                let media = matchMedia(mqString);
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
        function toNumber(t: string | number): number {
            if (typeof (t) === "number") { return t } // 如果本來就是數字，直接回傳     
            if (typeof t === "string") { return Number(t.replace("px", "")); } // 如果是string，去掉px後轉型成數字
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
        function getRotateRect(width: number, height: number, x: number, y: number, deg: number): { rectWidth: number, rectHeight: number, x: number, y: number } {
            // 將角度轉換為弧度
            let rad = deg * Math.PI / 180;

            // 計算旋轉後的矩形寬度和高度
            let rectWidth = Math.abs(width * Math.cos(rad)) + Math.abs(height * Math.sin(rad));
            let rectHeight = Math.abs(width * Math.sin(rad)) + Math.abs(height * Math.cos(rad));

            // 將點移到矩形的中心
            let centerX = x - width / 2;
            let centerY = y - height / 2;

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
            let theta = Math.PI * deg / 180;
            let cos = Math.cos(theta),
                sin = Math.sin(theta);
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
            let points = [
                { x: 0, y: 0 },
                { x: 0, y: h },
                { x: w, y: 0 },
                { x: w, y: h }
            ].map(p => rotateVector(p, deg));
            let minX = Math.min.apply(null, points.map(p => p.x)),
                minY = Math.min.apply(null, points.map(p => p.y));
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
enum TiefseeviewAlignType {
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
enum TiefseeviewZoomType {

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
enum TiefseeviewImageRendering {

    /** 預設值，運算成本較高 */
    "auto" = 0,

    /** 運算成本低，放大時呈現方塊 */
    "pixelated" = 1,

    /** 圖片大於100%時呈現方塊 */
    "autoOrPixelated" = 2,
}
