import { Lib } from "../Lib";
import { RequestLimiter } from "../RequestLimiter";
import { Throttle } from "../Throttle";
import { TiefseeScroll } from "../TiefseeScroll";
import { WebAPI } from "../WebAPI";
import { MainWindow } from "./MainWindow";

/** 
 * 大量瀏覽模式
 */
export class BulkView {

    public visible;
    public load;
    public load2;
    public pageNext;
    public pagePrev;
    public setColumns;
    public setFocus;
    public saveCurrentState;
    public updateFileWatcher;
    public setImgMaxCount;
    public incrColumns;
    public decColumns;
    public incrFixedWidth;
    public decFixedWidth;

    constructor(M: MainWindow) {

        const _domBulkView = document.querySelector("#mView-bulkView") as HTMLTextAreaElement;
        const _domBulkViewContent = _domBulkView.querySelector(".bulkView-content") as HTMLElement;

        const _domMenu = document.querySelector("#menu-bulkView") as HTMLSelectElement;
        const _domColumns = _domMenu.querySelector(".js-columns") as HTMLElement;
        const _domGaplessMode = _domMenu.querySelector(".js-gaplessMode") as HTMLSelectElement;
        const _domFixedWidth = _domMenu.querySelector(".js-fixedWidth") as HTMLSelectElement;
        const _domAlign = _domMenu.querySelector(".js-align") as HTMLSelectElement;
        const _domIndentation = _domMenu.querySelector(".js-indentation") as HTMLSelectElement;
        const _domWaterfall = _domMenu.querySelector(".js-waterfall") as HTMLSelectElement;

        const _domNumber = _domMenu.querySelector(".js-number") as HTMLInputElement;
        const _domFileName = _domMenu.querySelector(".js-fileName") as HTMLInputElement;
        const _domImageSize = _domMenu.querySelector(".js-imageSize") as HTMLInputElement;
        const _domFileSize = _domMenu.querySelector(".js-fileSize") as HTMLInputElement;
        const _domLastWriteDate = _domMenu.querySelector(".js-lastWriteDate") as HTMLInputElement;
        const _domLastWriteTime = _domMenu.querySelector(".js-lastWriteTime") as HTMLInputElement;

        const _domBoxGaplessMode = _domMenu.querySelector(".js-box-gaplessMode") as HTMLDivElement;
        const _domBoxIndentation = _domMenu.querySelector(".js-box-indentation") as HTMLDivElement;
        const _domBoxFixedWidth = _domMenu.querySelector(".js-box-fixedWidth") as HTMLDivElement;
        const _domBoxWaterfall = _domMenu.querySelector(".js-box-waterfall") as HTMLDivElement;
        const _domBoxAlign = _domMenu.querySelector(".js-box-align") as HTMLDivElement;

        /** 名單列表 */
        var _arFile: string[] = [];
        /** 一頁顯示幾張圖片 */
        var _imgMaxCount = 100;
        /** 當前頁數 */
        var _pageNow = 1;
        /** 取得當前的狀態為顯示或隱藏 */
        var _isVisible = false;
        /** 首圖縮排 的svg圖示 */
        var _svgIndentation = "";

        /** 記錄離開時捲動到哪個位置 */
        var _tempScrollTop = -1;
        /** 用於判斷列表是否有異動 */
        var _tempArFile: string[] = [];
        /** 用於判斷是否有切換資料夾 */
        var _tempDirPath = "";
        /** 離開前記錄當時的頁碼 */
        var _tempPageNow = -1;
        /** 判斷是否有修改排序方式， SortType + OrderbyType */
        var _tempFileSortType = "";
        /** 判斷是否有捲動 */
        var _tempHasScrolled = false;
        /** 離開前記錄bulkViewContent的寬度 */
        var _tempScrollWidth = 0;
        /** 離開前記錄bulkViewContent的高度 */
        var _tempScrollHeight = 0;
        /** 切換欄時，記錄上一次的值。用於辨識是否使用首圖縮排 */
        let _tempColumns = -1;

        /** 記錄改變寬度前的高度及捲動位置 */
        let _originBulkViewHeight = 0;
        let _originBulkViewScrollTop = 0;

        /** 請求限制器 */
        const _limiter = new RequestLimiter(3);

        this.visible = visible;
        this.pageNext = pageNext;
        this.pagePrev = pagePrev;
        this.load = load;
        this.load2 = load2;
        this.setColumns = setColumns;
        this.saveCurrentState = saveCurrentState;
        this.updateFileWatcher = updateFileWatcher;
        this.setImgMaxCount = setImgMaxCount;
        this.incrColumns = incrColumns;
        this.decColumns = decColumns;
        this.incrFixedWidth = incrFixedWidth;
        this.decFixedWidth = decFixedWidth;
        /** 取得焦點 */
        this.setFocus = () => {
            _domBulkViewContent.tabIndex = 0;
            _domBulkViewContent.focus();
        }

        initEvent();

        function initEvent() {

            initGroupRadio(_domColumns); // 初始化群組按鈕

            new ResizeObserver(Lib.debounce(() => { // 區塊改變大小時    
                updateSize();
            }, 30)).observe(_domBulkView);

            new TiefseeScroll().initGeneral(_domBulkView, "y"); // 滾動條元件

            //判斷是否有捲動
            _domBulkView.addEventListener("wheel", () => {
                _tempHasScrolled = true;
            });
            _domBulkView.addEventListener("touchmove", () => {
                _tempHasScrolled = true;
            });

            (_domBulkView.querySelectorAll(".bulkView-pagination-prev") as NodeListOf<HTMLDivElement>).forEach(dom => {
                dom.addEventListener("click", () => {
                    pagePrev();
                });
            });
            (_domBulkView.querySelectorAll(".bulkView-pagination-next") as NodeListOf<HTMLDivElement>).forEach(dom => {
                dom.addEventListener("click", () => {
                    pageNext();
                });
            });
            (_domBulkView.querySelectorAll(".bulkView-pagination-select") as NodeListOf<HTMLSelectElement>).forEach(dom => {
                dom.addEventListener("input", () => {
                    let val = Number.parseInt(dom.value);
                    showPage(val);
                });
            });

            //------

            const arDomCheckbox = [
                _domColumns,
                _domGaplessMode,
                _domFixedWidth,
                _domAlign,
                _domIndentation,
                _domWaterfall,

                _domNumber,
                _domFileName,
                _domImageSize,
                _domFileSize,
                _domLastWriteDate,
                _domLastWriteTime
            ];


            arDomCheckbox.forEach((dom) => {
                dom.addEventListener("input", (e) => {
                    apply();
                    if (dom === _domIndentation) {
                        let columns = Number.parseInt(getGroupRadioVal(_domColumns));
                        if (columns === 2) {
                            load(_pageNow);
                        }
                    }
                });
            });

            //切換 欄 時
            _domColumns.addEventListener("click", (e) => {

                const columns = Number.parseInt(getGroupRadioVal(_domColumns));
                setColumns(columns)

                /*apply();

                let columns = Number.parseInt(getGroupRadioVal(dom_columns));
                let indentation = dom_indentation.value;
                if (indentation === "on") { //在開啟首圖進縮的情況下
                    if (temp_columns === 2 || columns === 2) { //從2欄切換成其他，或從其他切換成2欄
                        load(pageNow);
                    }
                }
                temp_columns = columns;*/
            });

            //---------

            // 大量瀏覽模式 - 滑鼠滾輪
            _domBulkView.addEventListener("wheel", (e: WheelEvent) => {
                const deltaY = e.deltaY; // 上下滾動的量
                let sc = "";
                if (deltaY > 0) { // 下
                    if (e.ctrlKey) {
                        sc = M.config.settings.mouse.bulkViewScrollDownCtrl;
                    } else if (e.shiftKey) {
                        sc = M.config.settings.mouse.bulkViewScrollDownShift;
                    } else if (e.altKey) {
                        sc = M.config.settings.mouse.bulkViewScrollDownAlt;
                    }
                }
                if (deltaY < 0) { // 上
                    if (e.ctrlKey) {
                        sc = M.config.settings.mouse.bulkViewScrollUpCtrl;
                    } else if (e.shiftKey) {
                        sc = M.config.settings.mouse.bulkViewScrollUpShift;
                    } else if (e.altKey) {
                        sc = M.config.settings.mouse.bulkViewScrollUpAlt;
                    }
                }
                if (sc !== "") {
                    M.script.run(sc, { x: e.offsetX, y: e.offsetY });
                    e.preventDefault(); // 禁止頁面滾動
                }
            }, false);

        }

        /**
         * 從config讀取設定值並套用(用於初始化設定值)
         */
        function initSetting() {
            setGroupRadioVal(_domColumns, M.config.settings.bulkView.columns.toString());
            _tempColumns = M.config.settings.bulkView.columns;
            _domGaplessMode.value = M.config.settings.bulkView.gaplessMode;
            _domFixedWidth.value = M.config.settings.bulkView.fixedWidth;
            _domAlign.value = M.config.settings.bulkView.align;
            _domIndentation.value = M.config.settings.bulkView.indentation;
            _domWaterfall.value = M.config.settings.bulkView.waterfall;

            _domNumber.checked = M.config.settings.bulkView.show.number;
            _domFileName.checked = M.config.settings.bulkView.show.fileName
            _domImageSize.checked = M.config.settings.bulkView.show.imageSize;
            _domFileSize.checked = M.config.settings.bulkView.show.fileSize;
            _domLastWriteDate.checked = M.config.settings.bulkView.show.lastWriteDate;
            _domLastWriteTime.checked = M.config.settings.bulkView.show.lastWriteTime;
            apply();

            if (_svgIndentation === "") {
                _svgIndentation = Lib.combine([baseWindow.appInfo.appDirPath, "\\Www\\img\\indentation.svg"]);
            }
        }

        /**
         * 套用設定
         */
        function apply() {
            _originBulkViewHeight = _domBulkViewContent.offsetHeight;
            _originBulkViewScrollTop = _domBulkView.scrollTop;

            const columns = M.config.settings.bulkView.columns = Number.parseInt(getGroupRadioVal(_domColumns));
            const gaplessMode = M.config.settings.bulkView.gaplessMode = _domGaplessMode.value;
            const fixedWidth = M.config.settings.bulkView.fixedWidth = _domFixedWidth.value;
            const align = M.config.settings.bulkView.align = _domAlign.value;
            const indentation = M.config.settings.bulkView.indentation = _domIndentation.value;
            const waterfall = M.config.settings.bulkView.waterfall = _domWaterfall.value;

            _domBulkViewContent.setAttribute("waterfall", waterfall);
            _domBulkViewContent.setAttribute("columns", columns.toString());
            _domBulkViewContent.setAttribute("align", align);

            _domBulkViewContent.setAttribute("gaplessMode", gaplessMode);
            updateFixedWidth(fixedWidth, columns);
            updateColumns(columns);

            const number = M.config.settings.bulkView.show.number = _domNumber.checked;
            const fileName = M.config.settings.bulkView.show.fileName = _domFileName.checked;
            const imageSize = M.config.settings.bulkView.show.imageSize = _domImageSize.checked;
            const fileSize = M.config.settings.bulkView.show.fileSize = _domFileSize.checked;
            const lastWriteDate = M.config.settings.bulkView.show.lastWriteDate = _domLastWriteDate.checked;
            const lastWriteTime = M.config.settings.bulkView.show.lastWriteTime = _domLastWriteTime.checked;
            let arShow = [];
            if (number) { arShow.push("number"); }
            if (fileName) { arShow.push("fileName"); }
            if (imageSize) { arShow.push("imageSize"); }
            if (fileSize) { arShow.push("fileSize"); }
            if (lastWriteDate) { arShow.push("lastWriteDate"); }
            if (lastWriteTime) { arShow.push("lastWriteTime"); }
            _domBulkViewContent.setAttribute("show", arShow.join(","));

            //顯示或隱藏區塊
            if (columns === 1 || columns === 2) { //無間距模式
                _domBoxGaplessMode.style.display = "block";
            } else {
                _domBoxGaplessMode.style.display = "none";
            }
            if (columns === 1 || columns === 2) { //瀑布流
                _domBoxWaterfall.style.display = "none";
            } else {
                _domBoxWaterfall.style.display = "block";
            }
            if (columns === 1 || columns === 2) { //鎖定寬度
                _domBoxFixedWidth.style.display = "block";
            } else {
                _domBoxFixedWidth.style.display = "none";
            }
            if (columns === 2) { //排列方向
                _domBoxAlign.style.display = "block";
            } else {
                _domBoxAlign.style.display = "none";
            }
            if (columns === 2) { //第一張圖縮排
                _domBoxIndentation.style.display = "block";
            } else {
                _domBoxIndentation.style.display = "none";
            }
        }

        /** 取得 鎖定寬度 */
        function getFixedWidth() {
            return M.config.settings.bulkView.fixedWidth;
        }
        /** 設定 getFixedWidth */
        function setFixedWidth(n: string) {
            if (n === getFixedWidth()) { return; }
            _domFixedWidth.value = n;
            _domFixedWidth.dispatchEvent(new Event("input"));
        }
        /** 取得 首圖進縮 */
        function getIndentation() {
            return M.config.settings.bulkView.indentation;
        }
        /** 取得 瀑布流 */
        function getWaterfall() {
            return M.config.settings.bulkView.waterfall;
        }
        /** 取得 欄 */
        function getColumns() {
            return M.config.settings.bulkView.columns;
        }
        /** 設定 欄 */
        function setColumns(columns: number) {
            if (columns < 1) { columns = 1; }
            if (columns > 8) { columns = 8; }
            if (columns === getColumns()) { return; }

            setGroupRadioVal(_domColumns, columns.toString());
            //dom_columns.dispatchEvent(new Event("input"));

            apply();

            const indentation = _domIndentation.value;
            if (indentation === "on") { // 在開啟首圖進縮的情況下
                if (_tempColumns === 2 || columns === 2) { // 從2欄切換成其他，或從其他切換成2欄
                    load(_pageNow);
                }
            }
            _tempColumns = columns;
        }

        /**
         * 
         * @param n 
         */
        function updateColumns(n?: number) {
            if (n === undefined) {
                n = M.config.settings.bulkView.columns;
            }
            if (n < 1) { n = 1; }
            if (n > 8) { n = 8; }

            setGroupRadioVal(_domColumns, n.toString());
            _domBulkView.setAttribute("columns", n.toString());
            updateSize();
        }

        function updateFixedWidth(width: string, columns: number) {
            if (columns === 1 || columns === 2) {
                _domBulkViewContent.setAttribute("fixedWidth", width);
            } else {
                _domBulkViewContent.setAttribute("fixedWidth", "");
            }
            // 設定捲動條位置
            let currentBulkViewHeight = _domBulkViewContent.offsetHeight;
            let ratio = _originBulkViewHeight == 0 ? 1 : _originBulkViewScrollTop / _originBulkViewHeight;
            if (_originBulkViewHeight !== currentBulkViewHeight) {
                _domBulkView.scrollTop = currentBulkViewHeight * ratio;
            }
        }

        const _updateSizeThrottle = new Throttle(50); // 節流
        /**
         * 重新計算項目大小
         * @param donItem 項目，未傳入則全部重新計算
         */
        function updateSize(donItem?: HTMLElement) {

            if (_isVisible === false) { return; }

            _updateSizeThrottle.run = async () => {

                if (_isVisible === false) { return; }
                if (document.body.offsetWidth * window.devicePixelRatio < 200) { // 避免最小化視窗也觸發
                    return;
                }

                const containerPadding = 5; // 內距
                const columns = getColumns();
                const bulkViewWidth = _domBulkViewContent.offsetWidth;
                const itemWidth = Math.floor(bulkViewWidth / columns); // 容器寬度

                let arItme;
                if (donItem === undefined) {
                    arItme = _domBulkViewContent.querySelectorAll(".bulkView-item");
                } else {
                    arItme = [donItem];
                }

                if (getWaterfall() === "off"
                    || getWaterfall() === "vertical"
                    || columns <= 2
                ) {

                    for (let i = 0; i < arItme.length; i++) {

                        const dom = arItme[i] as HTMLElement;
                        const domImg = dom.querySelector(".bulkView-img") as HTMLImageElement;
                        dom.style.width = `calc( ${100 / columns}% )`;

                        if (dom.getAttribute("data-width") !== null) {

                            if (columns > 2) {
                                dom.style.minHeight = itemWidth / 2 + "px";
                            } else {
                                dom.style.minHeight = "";
                            }

                            let imgWidth = Number.parseInt(dom.getAttribute("data-width") ?? "1");
                            let imgHeight = Number.parseInt(dom.getAttribute("data-height") ?? "1");

                            let ratio = imgHeight / imgWidth;
                            let newImgWidth = itemWidth - 10;
                            let newImgHeight = newImgWidth * ratio;

                            let maxH = itemWidth;
                            if (columns === 1 || columns === 2) {
                                domImg.style.width = "";
                                domImg.style.height = "";
                            } else {
                                if (columns === 3) {
                                    maxH = itemWidth * 3;
                                } else {
                                    maxH = itemWidth * 2;
                                }

                                if (newImgHeight > maxH) {
                                    domImg.style.width = "";
                                    domImg.style.height = maxH + "px";
                                } else {
                                    domImg.style.width = "100%";
                                    domImg.style.height = "";
                                }
                            }

                        }

                    }

                    _domBulkViewContent.style.height = ""; //復原總高度
                }

                //瀑布流 垂直
                if (getWaterfall() === "vertical" && columns >= 3) {
                    if (arItme.length === 1) {
                        arItme = _domBulkViewContent.querySelectorAll(".bulkView-item");
                    }

                    let arTop = new Array(columns).fill(0); //判斷要插入到哪一個垂直列

                    for (let i = 0; i < arItme.length; i++) {
                        const dom = arItme[i] as HTMLElement;

                        //找出最小
                        let minTop = arTop[0];
                        let minTopFlag = 0;
                        for (let i = 0; i < arTop.length; i++) {
                            if (minTop > arTop[i]) {
                                minTopFlag = i;
                                minTop = arTop[i];
                            }
                        }

                        let h = dom.offsetHeight;
                        let left = (minTopFlag) * itemWidth;
                        let top = arTop[minTopFlag];
                        dom.style.left = left + "px";
                        dom.style.top = top + "px";

                        arTop[minTopFlag] += h;
                    }

                    //修改總高度
                    let sumHeight = Math.max.apply(null, arTop);
                    _domBulkViewContent.style.height = sumHeight + "px";
                }

                //瀑布流 水平
                if (getWaterfall() === "horizontal" && columns >= 3) {
                    if (arItme.length === 1) {
                        arItme = _domBulkViewContent.querySelectorAll(".bulkView-item");
                    }
                    let isEnd = false;
                    let len = Math.floor(arItme.length / columns) + 1;
                    for (let i = 0; i < len; i++) {

                        let images: number[][] = []; // 圖片大小 [寬度, 高度]

                        let isRun = true;
                        for (let j = i * columns; j < i * columns + columns; j++) {
                            if (j >= arItme.length) {
                                isEnd = true;
                                break;
                            }
                            const item = arItme[j] as HTMLElement;
                            if (item.getAttribute("data-width") === null) {
                                isRun = false;
                                break;
                            } else {
                                images.push([
                                    Number.parseInt(item.getAttribute("data-width") ?? "1"),
                                    Number.parseInt(item.getAttribute("data-height") ?? "1"),
                                ])
                            }
                        }
                        if (isRun === false || images.length === 0) {
                            break;
                        }

                        let containerWidth = bulkViewWidth - 1;
                        if (isEnd) {
                            containerWidth = bulkViewWidth / columns * (arItme.length % columns) - 1;
                        }
                        //let images = [[30, 10], [20, 20], [100, 50]];
                        const aspectRatios = images.map(size => size[0] / size[1]); //計算每張圖片的寬高比
                        const totalAspectRatio = aspectRatios.reduce((a, b) => a + b); // 計算所有圖片寬高比之和
                        const imageHeights = aspectRatios.map(ratio => (containerWidth - containerPadding * images.length * 2) / totalAspectRatio); //計算每張圖片的高度，使得每張圖片的高度一樣
                        const divWidths = imageHeights.map((height, index) => height * aspectRatios[index] + containerPadding * 2); //計算每個容器的寬度，使每個容器的寬度加起來剛好填滿總寬度，且圖片距離容器有內距

                        for (let j = 0; j < divWidths.length; j++) {
                            const dom = arItme[i * columns + j] as HTMLElement;
                            const domImg = dom.querySelector(".bulkView-img") as HTMLImageElement;
                            const divWidth = divWidths[j];
                            const imgWidth = divWidths[j] - containerPadding * 2;
                            const imgHeight = imageHeights[j];
                            dom.style.width = divWidth + "px";
                            domImg.style.width = imgWidth + "px";
                            domImg.style.height = imgHeight + "px";

                            dom.style.minHeight = ""; //復原
                            //donImg.style.maxHeight = "calc( 100% - 10px )";
                        }

                    }

                    _domBulkViewContent.style.height = ""; //復原總高度
                }

            }
        }

        /** 
         * 顯示或隱藏dom
         */
        function visible(val: boolean) {
            _isVisible = val;
            if (val === true) {
                initSetting();
                _domBulkView.style.display = "flex";
            } else {
                _domBulkView.style.display = "none";
            }
        }

        /**
         * 記錄當前狀態(結束大量瀏覽模式前呼叫)
         */
        function saveCurrentState() {
            _isVisible = false;
            _tempScrollTop = _domBulkView.scrollTop; // 記錄離開時捲動到哪個位置
            _tempScrollWidth = _domBulkViewContent.scrollWidth;
            _tempScrollHeight = _domBulkViewContent.scrollHeight;

            _tempArFile = _arFile;
            if (_tempArFile[0] === _svgIndentation) { // 如果有使用首圖縮排
                _tempArFile.shift(); // 移除第一筆
            }
            _tempDirPath = getDirPath();
            _tempFileSortType = M.fileSort.getSortType() + M.fileSort.getOrderbyType();
            _tempPageNow = _pageNow;

            // M.fileLoad.setWaitingFile(arFile);
        }

        /**
         * 載入列表，並恢復到上次捲動的位置
         */
        async function load2() {

            // 設定返回按鈕
            M.toolbarBack.visible(true);
            M.toolbarBack.setEvent(() => {
                M.script.bulkView.close();
            });

            _tempHasScrolled = false;

            // 比較兩個 string[] 是否一樣
            function arraysEqual(a: string[], b: string[]) {
                if (a === b) return true;
                if (a == null || b == null) return false;
                if (a.length !== b.length) return false;

                for (var i = 0; i < a.length; ++i) {
                    if (a[i] !== b[i]) return false;
                }
                return true;
            }

            // 返回上次捲動的位置
            function scrollToLastPosition(time: number) {

                // 如果寬度變化小於100，則暫時使用上次的高度，避免圖片載入完成前導致移位
                if (Math.abs(_domBulkViewContent.scrollWidth - _tempScrollWidth) < 100) {
                    _domBulkViewContent.style.minHeight = _tempScrollHeight + "px";
                    setTimeout(() => {
                        _domBulkViewContent.style.minHeight = "";
                        _tempScrollTop = -1;
                    }, time);
                }

                if (_tempScrollTop === -1) { return; }
                _domBulkView.scrollTop = _tempScrollTop;
                if (time === 0) { return; }
                for (let i = 1; i <= 10; i++) {
                    setTimeout(() => {
                        if (_tempScrollTop === -1) { return; }
                        if (_tempHasScrolled === false && _tempPageNow === _pageNow) {
                            _domBulkView.scrollTop = _tempScrollTop;
                        }
                    }, (time / 10) * i);
                }
            }

            _arFile = Array.from(M.fileLoad.getWaitingFile());

            if (_tempDirPath === getDirPath() && arraysEqual(_arFile, _tempArFile)) { // 完全一樣

                if (getIndentation() === "on" && getColumns() === 2) { // 如果有使用首圖縮排
                    _arFile.unshift(_svgIndentation); // 插入到最前面
                }
                scrollToLastPosition(0); // 返回上次捲動的位置

            } else if (_tempDirPath === getDirPath()) {

                let fileSortType = M.fileSort.getSortType() + M.fileSort.getOrderbyType();
                if (_tempFileSortType === fileSortType) { // 資料夾一樣，排序一樣 (名單不一樣)

                    scrollToLastPosition(800); // 返回上次捲動的位置
                    await load(_pageNow);

                } else { // 資料夾一樣，排序不一樣

                    _domBulkView.scrollTop = 0; // 捲動到最上面
                    await load();

                }

            } else { // 完全不一樣

                _domBulkView.scrollTop = 0; // 捲動到最上面
                await load();

            }

            _tempDirPath = getDirPath();
        }

        /**
         * 載入列表
         * @param page 
         */
        async function load(page = 0) {

            _arFile = Array.from(M.fileLoad.getWaitingFile());
            if (_arFile === undefined) { return; }

            if (getIndentation() === "on" && getColumns() === 2) {
                _arFile.unshift(_svgIndentation); // 插入到最前面
            }

            showPage(page);
        }

        var showPageThrottle = new Throttle(50); // 節流
        /**
         * 載入頁面
         * @param page 
         */
        async function showPage(page?: number) {

            if (page === undefined) { page = _pageNow; }
            if (page !== undefined) { _pageNow = page; }
            _pageNow = page;
            if (_pageNow < 1) { _pageNow = 1; }
            let pageMax = Math.ceil(_arFile.length / _imgMaxCount);
            if (_pageNow >= pageMax) { _pageNow = pageMax; }

            updatePagination(); //更新分頁器

            showPageThrottle.run = async () => {

                _domBulkView.scrollTop = 0; //捲動到最上面
                _domBulkViewContent.innerHTML = "";

                let temp = _pageNow + getDirPath();
                let start = ((_pageNow - 1) * _imgMaxCount);
                while (true) { //每次都撈10筆
                    if (start >= _pageNow * _imgMaxCount) { break; }
                    let n = 10;
                    if (start + n > _pageNow * _imgMaxCount) { //超過頁的結尾
                        n = _pageNow * _imgMaxCount - start;
                    }
                    let end = start + n;
                    let newArr = _arFile.slice(start, end); //取得陣列特定範圍
                    let retAr = await WebAPI.getFileInfo2List(newArr);
                    if (temp !== _pageNow + getDirPath()) { //已經載入其他資料夾，或是切換到其他頁
                        return;
                    }
                    for (let j = 0; j < retAr.length; j++) {
                        const item = retAr[j];
                        let domItem = newItem(item);
                        _domBulkViewContent.appendChild(domItem);
                    }

                    start += n;
                }

                updateSize();
            }

        }

        /**
         * 更新左上角的圖片編號
         */
        function updateItemNumber() {
            const arDom = _domBulkView.querySelectorAll(".bulkView-item");

            for (let i = 0; i < arDom.length; i++) {
                const domItem = arDom[i];
                let domItemPath = domItem.getAttribute("data-path");
                if (domItemPath === null) { continue; }

                let n = (_arFile.indexOf(domItemPath) + 1);
                if (getIndentation() === "on" && getColumns() === 2) { // 如果有使用首圖縮排
                    n = n - 1;
                }
                // domItem.setAttribute("data-number", n);

                const domNumber = domItem.querySelector(".bulkView-number");
                if (domNumber !== null) {
                    domNumber.innerHTML = n.toString();
                } else {
                    domItem.setAttribute("data-number", n.toString());
                }
            }
        }

        var _queueUpdateFileWatcher = Promise.resolve(); // 佇列
        /**
         * 檔案被修改時呼叫
         */
        function updateFileWatcher(fileWatcherData: FileWatcherData) {

            const newAr = Array.from(M.fileLoad.getWaitingFile());
            const dirPath = getDirPath();

            // 加入佇列裡面
            _queueUpdateFileWatcher = _queueUpdateFileWatcher.then(async () => {

                if (_isVisible === false) { return; }
                if (dirPath !== getDirPath()) { return; }

                let deleteIndex = -1;
                if (fileWatcherData.ChangeType === "deleted") {
                    // 跟上次的檔案列表做比較，取得被刪除的檔案的位置    
                    if (_arFile.length > 0 && _arFile[0] === _svgIndentation) { // 如果有使用首圖縮排，先刪除首圖才進行比較
                        _arFile.shift();
                    }
                    for (let i = 0; i < _arFile.length; i++) {
                        if (_arFile[i] != newAr[i]) {
                            deleteIndex = i;
                            break;
                        }
                    }
                }

                if (getIndentation() === "on" && getColumns() === 2) { // 如果有使用首圖縮排
                    newAr.unshift(_svgIndentation); // 插入到最前面
                    if (deleteIndex !== -1) { deleteIndex += 1; }
                }

                _arFile = newAr;

                if (fileWatcherData.ChangeType === "created") {

                    if (_pageNow < 1) { _pageNow = 1; }

                    let index = _arFile.indexOf(fileWatcherData.FullPath);
                    if (index === -1) { // 副檔名匹配失敗，沒有出現在列表裡
                        return;
                    }

                    let items = _domBulkView.querySelectorAll(".bulkView-item");

                    let isEnd = false;
                    const whenInsertingFile = M.config.settings.other.whenInsertingFile;
                    if (whenInsertingFile === "end") {
                        isEnd = true;
                    } else if (whenInsertingFile === "auto" && M.fileSort.getOrderbyType() === "asc") {
                        isEnd = true;
                    }

                    if (isEnd) { // 插入到最後
                        if (((_pageNow - 1) * _imgMaxCount) < index + 1 && index < (_pageNow * _imgMaxCount)) {
                            let newItemDom = await pathToItem(fileWatcherData.FullPath);
                            if (items.length !== 0) {
                                let thirdItem = items[items.length - 1];
                                thirdItem.insertAdjacentElement("afterend", newItemDom);
                            } else {
                                _domBulkViewContent.appendChild(newItemDom);
                            }
                        }
                    } else { // 插入到最前

                        if (_pageNow === 1) { // 在第一頁
                            let newItemDom = await pathToItem(fileWatcherData.FullPath);
                            if (items.length !== 0) {
                                let thirdItem;
                                if (getIndentation() === "on" && getColumns() === 2) { // 如果有使用首圖縮排
                                    thirdItem = items[1];
                                } else {
                                    thirdItem = items[0];
                                }
                                thirdItem.insertAdjacentElement("beforebegin", newItemDom);
                            } else {
                                _domBulkViewContent.appendChild(newItemDom);
                            }
                        } else { // 不是在第一頁
                            let path = _arFile[(_pageNow - 1) * _imgMaxCount]; // 上一頁的最後一筆
                            let newItemDom = await pathToItem(path);
                            if (items.length !== 0) {
                                let thirdItem = items[0];
                                thirdItem.insertAdjacentElement("beforebegin", newItemDom);
                            } else {
                                _domBulkViewContent.appendChild(newItemDom);
                            }
                        }

                        // 移除多餘的項目
                        items = _domBulkView.querySelectorAll(".bulkView-item");
                        if (items.length > _imgMaxCount) {
                            let removeCount = items.length - _imgMaxCount;
                            for (let i = items.length - 1; i >= items.length - removeCount; i--) {
                                items[i].remove();
                            }
                        }

                    }

                    updateItemNumber(); // 更新左上角的圖片編號
                    updatePagination(); // 更新分頁器

                } else if (fileWatcherData.ChangeType === "deleted") {

                    if (deleteIndex === -1) { return; }

                    // 如果刪除檔案後，當前頁碼超過最大頁數，則重新載入
                    let pageMax = Math.ceil(_arFile.length / _imgMaxCount);
                    if (_pageNow > pageMax) {
                        _pageNow = pageMax;
                        showPage();
                        return;
                    }

                    if (deleteIndex + 1 > (_pageNow) * _imgMaxCount) { // 刪除後面頁的圖片
                        updatePagination(); // 更新分頁器

                    } else if (deleteIndex < (_pageNow - 1) * _imgMaxCount) { // 刪除前面頁的圖片

                        // 刪除當前顯示的第1張圖片
                        let arDom = _domBulkView.querySelectorAll(".bulkView-item");
                        if (arDom.length > 0) {
                            arDom[0].remove();
                        }

                        if (_pageNow < pageMax) { // 如果不是最後一頁
                            // 在最後面插入下一頁的第1張圖片
                            let newItemDom = await pathToItem(_arFile[_pageNow * _imgMaxCount - 1]);
                            let items = _domBulkView.querySelectorAll(".bulkView-item");
                            let thirdItem = items[items.length - 1];
                            thirdItem.insertAdjacentElement("afterend", newItemDom);
                        }
                        updateItemNumber(); // 更新左上角的圖片編號
                        updatePagination(); // 更新分頁器

                    } else { // 刪除當前頁的圖片

                        // 確認刪除的目標在當前頁面
                        let isDelete = false;
                        let domItem: Element | undefined;
                        let arDom = _domBulkView.querySelectorAll(".bulkView-item");
                        for (let i = 0; i < arDom.length; i++) {
                            domItem = arDom[i];
                            let domItemPath = domItem.getAttribute("data-path");
                            if (domItemPath === fileWatcherData.FullPath) {
                                isDelete = true;
                                break;
                            }
                        }
                        if (isDelete) {
                            if (_pageNow * _imgMaxCount - 1 < _arFile.length) { // 如果不是最後一頁
                                // 在最後面插入下一頁的第1張圖片
                                let newItemDom = await pathToItem(_arFile[_pageNow * _imgMaxCount - 1]);
                                let items = _domBulkView.querySelectorAll(".bulkView-item");
                                let thirdItem = items[items.length - 1];
                                thirdItem.insertAdjacentElement("afterend", newItemDom);
                            }
                            domItem?.remove();
                            updateItemNumber(); // 更新左上角的圖片編號
                        }
                        updatePagination(); // 更新分頁器
                    }

                } else if (fileWatcherData.ChangeType === "renamed") {

                    let domItem: HTMLElement | undefined;
                    let arDom = _domBulkView.querySelectorAll(".bulkView-item");
                    for (let i = 0; i < arDom.length; i++) {
                        const dom = arDom[i] as HTMLElement;
                        let domItemPath = dom.getAttribute("data-path");
                        if (domItemPath === fileWatcherData.OldFullPath) {
                            domItem = dom;
                            break;
                        }
                    }
                    if (domItem !== undefined) {
                        let newItemDom = await pathToItem(fileWatcherData.FullPath);
                        domItem.insertAdjacentElement("afterend", newItemDom);
                        domItem.remove();
                        updateItemNumber(); // 更新左上角的圖片編號
                    } else {
                        return;
                    }

                } else if (fileWatcherData.ChangeType === "changed") {

                    let domItem: HTMLElement | undefined;
                    let arDom = _domBulkView.querySelectorAll(".bulkView-item");
                    for (let i = 0; i < arDom.length; i++) {
                        let dom = arDom[i] as HTMLElement;
                        let domItemPath = dom.getAttribute("data-path");
                        if (domItemPath === fileWatcherData.FullPath) {
                            domItem = dom;
                            break;
                        }
                    }
                    if (domItem !== undefined) {
                        let dataReload = domItem.getAttribute("data-reload");
                        if (dataReload === "true") { return; }
                        let domCenter = domItem.querySelector(".bulkView-center");
                        if (domCenter === null) { return; }

                        let div = Lib.newDom(`<div class="bulkView-reload">${SvgList["tool-rotateCw.svg"]}</div>`);
                        domCenter.appendChild(div);
                        domItem.setAttribute("data-reload", "true");
                    } else {
                        return;
                    }

                }

                updateSize();

            });
        }
        // 傳入檔案路徑，回傳item
        async function pathToItem(path: string) {
            let retAr = await WebAPI.getFileInfo2List([path]);
            let newItemDom = newItem(retAr[0]);
            return newItemDom;
        }

        /**
         * 更新分頁器
         */
        function updatePagination() {

            let pageMax = Math.ceil(_arFile.length / _imgMaxCount);

            // 更新分頁器下拉選單
            (_domBulkView.querySelectorAll(".bulkView-pagination-select") as NodeListOf<HTMLSelectElement>).forEach(dom => {
                let html = "";
                for (let i = 0; i < pageMax; i++) {
                    let n = i + 1;
                    let start = i * _imgMaxCount + 1;
                    let end = (i + 1) * _imgMaxCount;
                    if (end >= _arFile.length) { end = _arFile.length; }
                    if (getIndentation() === "on" && getColumns() === 2) { // 如果有使用首圖縮排
                        start -= 1;
                        end -= 1;
                    }
                    html += `<option value="${n}">${n}　(${start}~${end})</option>`;
                }
                dom.innerHTML = html;
                dom.value = _pageNow.toString();
            });

            // 不能在上下一頁就禁止點擊
            (_domBulkView.querySelectorAll(".bulkView-pagination-prev") as NodeListOf<HTMLElement>).forEach(dom => {
                if (_pageNow === 1) {
                    dom.setAttribute("freeze", "true");
                } else {
                    dom.setAttribute("freeze", "");
                }
            });
            (_domBulkView.querySelectorAll(".bulkView-pagination-next") as NodeListOf<HTMLElement>).forEach(dom => {
                if (_pageNow === pageMax) {
                    dom.setAttribute("freeze", "true");
                } else {
                    dom.setAttribute("freeze", "");
                }
            });

            // 只有一頁就隱藏分頁器
            (_domBulkView.querySelectorAll(".bulkView-pagination") as NodeListOf<HTMLElement>).forEach(dom => {
                if (pageMax !== 1) {
                    dom.setAttribute("active", "true");
                } else {
                    dom.setAttribute("active", "");
                }
            });
        }

        /**
         * 
         */
        function newItem(fileInfo2: FileInfo2) {

            let n = _arFile.indexOf(fileInfo2.Path) + 1;
            if (getIndentation() === "on" && getColumns() === 2) { // 如果有使用首圖縮排
                n -= 1;
            }

            const temp = _pageNow + getDirPath();
            const size = Math.floor(_domBulkViewContent.offsetWidth / getColumns());
            const div = Lib.newDom(/*html*/`
                <div class="bulkView-item">
                    <div class="bulkView-center bulkView-loading">
                        <img class="bulkView-img">
                    </div>
                </div>
            `);
            if (n !== 0) {
                div.setAttribute("data-path", fileInfo2.Path);
            }
            div.style.width = size + "px";
            div.style.minHeight = size + "px";
            updateSize(div);

            setTimeout(async () => {

                // 把長路經轉回虛擬路徑，避免瀏覽器無法載入圖片
                if (fileInfo2.Path.length > 255) {
                    fileInfo2.Path = await WV_Path.GetShortPath(fileInfo2.Path);
                }

                let imgData = await M.script.img.getImgData(fileInfo2);
                let width = imgData.width;
                let height = imgData.height;
                let arUrl = imgData.arUrl;

                if (temp !== _pageNow + getDirPath()) { // 已經載入其他資料夾，或是切換到其他頁
                    return;
                }

                // 如果在初始化完成前有重新計算過圖片編號，則使用重新計算的編號
                let dataNumber = div.getAttribute("data-number");
                if (dataNumber !== null) {
                    div.removeAttribute("data-number");
                    n = Number(dataNumber);
                }

                //---------

                const fileName = Lib.getFileName(fileInfo2.FullPath);
                const LastWriteTimeUtc = fileInfo2.LastWriteTimeUtc;
                const LastWriteTime = new Date(LastWriteTimeUtc).format("yyyy-MM-dd hh:mm:ss");
                const writeDate = new Date(LastWriteTimeUtc).format("yyyy-MM-dd");
                const writeTime = new Date(LastWriteTimeUtc).format("hh:mm:ss");
                const fileSize = Lib.getFileLength(fileInfo2.Lenght);

                div.innerHTML = /*html*/`
                <div class="bulkView-header">
                    <div class="bulkView-number">${n}</div>
                    <div class="bulkView-fileName">${fileName}</div>
                </div>
                <div class="bulkView-header2">
                    <div class="bulkView-tag bulkView-imageSize">${width},${height}</div>
                    <div class="bulkView-tag bulkView-fileSize">${fileSize}</div>
                    <div class="bulkView-tag bulkView-lastWriteDate">${writeDate}</div>
                    <div class="bulkView-tag bulkView-lastWriteTime">${writeTime}</div>
                </div>
                <div class="bulkView-center">
                    <img class="bulkView-img">
                </div>`;

                div.setAttribute("data-width", width.toString());
                div.setAttribute("data-height", height.toString());
                div.style.width = size + "px";
                div.style.minHeight = size + "px";
                updateSize(div);

                // 點擊圖片後，退出大量瀏覽模式
                div.addEventListener("click", async () => {
                    if (div.getAttribute("data-reload") === "true") {
                        let newItemDom = await pathToItem(fileInfo2.Path);
                        div.insertAdjacentElement("afterend", newItemDom);
                        div.remove();
                        updateItemNumber(); // 更新左上角的圖片編號

                    } else if (n !== 0) {

                        M.fileLoad.setIsBulkViewSub(true);
                        let index = _arFile.indexOf(fileInfo2.FullPath);

                        if (_arFile.length > 0 && _arFile[0] === _svgIndentation) { // 如果有使用首圖縮排
                            index -= 1;
                        }
                        await M.script.bulkView.close(index);

                        // 設定返回按鈕
                        M.toolbarBack.visible(true);
                        M.toolbarBack.setEvent(() => {
                            M.script.bulkView.show();
                        });
                    }
                });

                // 快速拖曳
                Lib.addDragThresholdListener(div, 5, () => {
                    if (n !== 0) {
                        M.script.file.dragDropFile(fileInfo2.FullPath);
                    }
                });

                const domImg = div.querySelector(".bulkView-img") as HTMLImageElement;
                const domCenter = div.querySelector(".bulkView-center") as HTMLDivElement;
                const domHeader = div.querySelector(".bulkView-header") as HTMLDivElement;
                const domHeader2 = div.querySelector(".bulkView-header2") as HTMLDivElement;

                const title = `${M.i18n.t("bulkView.imageSize")}：${width} x ${height}\n` +
                    `${M.i18n.t("bulkView.fileSize")}：${fileSize}\n` +
                    `${M.i18n.t("bulkView.lastWriteDate")}：${LastWriteTime}`;
                domHeader.setAttribute("title", title);
                domHeader2.setAttribute("title", title);

                // 載入失敗時
                if (domImg.onerror === null) {
                    domImg.onerror = () => {
                        domImg.src = "./img/error.svg";
                    }
                }

                // 區塊改變大小時
                new ResizeObserver(Lib.debounce(() => {

                    if (_isVisible === false) { return; }

                    let ret = arUrl[0];
                    let boxWidth = domCenter.offsetWidth;

                    if (boxWidth <= 10) {
                        return;
                    }

                    // 如果是 1欄 或 2欄 且有鎖定寬度
                    if (getFixedWidth() !== "off") {
                        let columns = getColumns();
                        if (columns === 1 || columns === 2) {
                            boxWidth = boxWidth * Number.parseInt(getFixedWidth()) / 100;
                        }
                    }

                    const nowScale = boxWidth / width;
                    for (let i = arUrl.length - 1; i >= 0; i--) {
                        const item = arUrl[i];
                        if (item.scale >= nowScale) {
                            ret = item;
                            break;
                        }
                    }

                    if (domImg.getAttribute("src") !== ret.url) {
                        // dom_img.setAttribute("src", ret.url);
                        _limiter.addRequest(domImg, ret.url);
                    }
                    updateSize();

                }, 300)).observe(div);

            }, 0);

            return div;
        }

        /**
         * 下一頁
         */
        function pageNext() {
            let page = _pageNow;
            page += 1;
            const pageMax = Math.ceil(_arFile.length / _imgMaxCount);
            if (page >= pageMax) { page = pageMax; }
            if (page !== _pageNow) { // 如果已經到達最後一頁就不做任何事情
                _pageNow = page;
                showPage();
            }
        }

        /**
         * 上一頁
         */
        function pagePrev() {
            let page = _pageNow;
            page -= 1;
            if (page <= 1) { page = 1; }
            if (page !== _pageNow) { // 如果已經是第一頁就不做任何事情
                _pageNow = page;
                showPage();
            }
        }

        /**
         * 設定 一頁顯示幾張圖片
         * @param n 
         */
        function setImgMaxCount(n: number) {
            n = Math.floor(n);
            if (n < 1) { n = 1; }

            if (_isVisible && n !== _imgMaxCount) { // 如果當前正在大量瀏覽模式，且有修改
                _imgMaxCount = n;
                load();
            } if (_isVisible === false && n !== _imgMaxCount) { // 如果當前不在大量瀏覽模式，且有修改
                _imgMaxCount = n;
                _tempDirPath = ""; // 避免回到大量瀏覽模式後沒有觸發更新
            } else {
                _imgMaxCount = n;
            }
        }

        /** 增加「每行圖片數」 */
        function incrColumns() {
            setColumns(getColumns() + 1);
        }
        /** 減少「每行圖片數」 */
        function decColumns() {
            setColumns(getColumns() - 1);
        }
        /** 增加「鎖定寬度」 */
        function incrFixedWidth() {
            let n = Number(getFixedWidth());
            if (isNaN(n)) {
                n = 40;
            }
            n += 10;
            if (n < 10) { n = 10; }
            if (n > 100) { n = 100; }
            setFixedWidth(n.toString());
        }
        /** 減少「鎖定寬度」 */
        function decFixedWidth() {
            let n = Number(getFixedWidth());
            if (isNaN(n)) {
                n = 40;
            }
            n -= 10;
            if (n < 10) { n = 10; }
            if (n > 100) { n = 100; }
            setFixedWidth(n.toString());
        }

        /** 取得當前資料夾路徑 */
        function getDirPath() {
            return M.fileLoad.getDirPath();
        }
        /** 初始化群組按鈕 */
        function initGroupRadio(dom: HTMLElement) {
            dom.addEventListener("click", (e) => {
                let domActive = e.target as HTMLElement;
                if (domActive === null) { return; }
                let value = domActive.getAttribute("value");
                if (value === null) { value = ""; }
                setGroupRadioVal(dom, value);
            })

            let domActive = dom.querySelector("[active=true]");
            if (domActive === null) { return ""; }
            let value = domActive.getAttribute("value");
            if (value === null) { value = ""; }
            return value;
        }
        /** 取得群組按鈕的值 */
        function getGroupRadioVal(dom: HTMLElement) {
            const domActive = dom.querySelector("[active=true]");
            if (domActive === null) { return ""; }
            let value = domActive.getAttribute("value");
            if (value === null) { value = ""; }
            return value;
        }
        /** 設定群組按鈕的值 */
        function setGroupRadioVal(dom: HTMLElement, value: string) {
            const domActive = dom.querySelector(`[value="${value}"]`);
            if (domActive === null) { return; }

            let arDom = dom.querySelectorAll("div");
            for (let i = 0; i < arDom.length; i++) {
                arDom[i].setAttribute("active", "");
            }

            domActive.setAttribute("active", "true");
        }

    }

}
