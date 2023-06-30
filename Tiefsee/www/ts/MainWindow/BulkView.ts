
/** 
 * 大量瀏覽模式
 */
class BulkView {

    public visible;
    public load;
    public load2;
    public pageNext;
    public pagePrev;
    public setColumns;
    public setFocus;
    public saveCurrentState;
    public updateFileWatcher;

    constructor(M: MainWindow) {

        var dom_bulkView = document.querySelector("#mView-bulkView") as HTMLTextAreaElement;
        var dom_bulkViewContent = dom_bulkView.querySelector(".bulkView-content") as HTMLElement;

        var dom_menu = document.querySelector("#menu-bulkView") as HTMLSelectElement;
        var dom_columns = dom_menu.querySelector(".js-columns") as HTMLElement;
        var dom_gaplessMode = dom_menu.querySelector(".js-gaplessMode") as HTMLSelectElement;
        var dom_fixedWidth = dom_menu.querySelector(".js-fixedWidth") as HTMLSelectElement;
        var dom_align = dom_menu.querySelector(".js-align") as HTMLSelectElement;
        var dom_indentation = dom_menu.querySelector(".js-indentation") as HTMLSelectElement;
        var dom_waterfall = dom_menu.querySelector(".js-waterfall") as HTMLSelectElement;

        var dom_number = dom_menu.querySelector(".js-number") as HTMLInputElement;
        var dom_fileName = dom_menu.querySelector(".js-fileName") as HTMLInputElement;
        var dom_imageSize = dom_menu.querySelector(".js-imageSize") as HTMLInputElement;
        var dom_fileSize = dom_menu.querySelector(".js-fileSize") as HTMLInputElement;
        var dom_lastWriteDate = dom_menu.querySelector(".js-lastWriteDate") as HTMLInputElement;
        var dom_lastWriteTime = dom_menu.querySelector(".js-lastWriteTime") as HTMLInputElement;

        var dom_box_gaplessMode = dom_menu.querySelector(".js-box-gaplessMode") as HTMLDivElement;
        var dom_box_indentation = dom_menu.querySelector(".js-box-indentation") as HTMLDivElement;
        var dom_box_fixedWidth = dom_menu.querySelector(".js-box-fixedWidth") as HTMLDivElement;
        var dom_box_waterfall = dom_menu.querySelector(".js-box-waterfall") as HTMLDivElement;
        var dom_box_align = dom_menu.querySelector(".js-box-align") as HTMLDivElement;

        /** 名單列表 */
        var arFile: string[] = [];
        /** 一頁顯示幾張圖片*/
        var imgMaxCount = 100;
        /** 當前頁數 */
        var pageNow = 1;
        /** 取得當前的狀態為顯示或隱藏 */
        var isVisible = false;
        /** 首圖縮排 的svg圖示 */
        var svgIndentation = "";

        /** 記錄離開時捲動到哪個位置 */
        var temp_scrollTop = -1;
        /** 用於判斷列表是否有異動 */
        var temp_arFile: string[] = [];
        /** 用於判斷是否有切換資料夾 */
        var temp_dirPath = "";
        /** 離開前記錄當時的頁碼 */
        var temp_pageNow = -1;
        /** 判斷是否有修改排序方式， SortType + OrderbyType */
        var temp_fileSortType = "";
        /** 判斷是否有捲動 */
        var temp_hasScrolled = false;
        /** 離開前記錄bulkViewContent的寬度 */
        var temp_scrollWidth = 0;
        /** 離開前記錄bulkViewContent的高度 */
        var temp_scrollHeight = 0;
        /** 切換欄時，記錄上一次的值。用於辨識是否使用首圖縮排 */
        let temp_columns = -1;

        /** 請求限制器 */
        const limiter = new RequestLimiter(3);

        this.visible = visible;
        this.pageNext = pageNext;
        this.pagePrev = pagePrev;
        this.load = load;
        this.load2 = load2;
        this.setColumns = setColumns;
        this.saveCurrentState = saveCurrentState;
        this.updateFileWatcher = updateFileWatcher;
        /** 取得焦點 */
        this.setFocus = () => {
            dom_bulkViewContent.tabIndex = 0;
            dom_bulkViewContent.focus();
        }

        initEvent();


        function initEvent() {

            initGroupRadio(dom_columns); //初始化群組按鈕

            new ResizeObserver(Lib.debounce(() => { //區塊改變大小時    
                updateSize();
            }, 30)).observe(dom_bulkView);

            new TiefseeScroll().initGeneral(dom_bulkView, "y"); //滾動條元件

            //判斷是否有捲動
            dom_bulkView.addEventListener("wheel", () => {
                temp_hasScrolled = true;
            });
            dom_bulkView.addEventListener("touchmove", () => {
                temp_hasScrolled = true;
            });

            (dom_bulkView.querySelectorAll(".bulkView-pagination-prev") as NodeListOf<HTMLDivElement>).forEach(dom => {
                dom.addEventListener("click", () => {
                    pagePrev();
                });
            });
            (dom_bulkView.querySelectorAll(".bulkView-pagination-next") as NodeListOf<HTMLDivElement>).forEach(dom => {
                dom.addEventListener("click", () => {
                    pageNext();
                });
            });
            (dom_bulkView.querySelectorAll(".bulkView-pagination-select") as NodeListOf<HTMLSelectElement>).forEach(dom => {
                dom.addEventListener("input", () => {
                    let val = Number.parseInt(dom.value);
                    showPage(val);
                });
            });

            //------

            let arDomCheckbox = [
                dom_columns,
                dom_gaplessMode,
                dom_fixedWidth,
                dom_align,
                dom_indentation,
                dom_waterfall,

                dom_number,
                dom_fileName,
                dom_imageSize,
                dom_fileSize,
                dom_lastWriteDate,
                dom_lastWriteTime
            ];


            arDomCheckbox.forEach((dom) => {
                dom.addEventListener("input", (e) => {
                    apply();
                    if (dom === dom_indentation) {
                        let columns = Number.parseInt(getGroupRadioVal(dom_columns));
                        if (columns === 2) {
                            load(pageNow);
                        }
                    }
                });
            });

            //切換 欄 時
            dom_columns.addEventListener("click", (e) => {

                apply();

                let columns = Number.parseInt(getGroupRadioVal(dom_columns));
                let indentation = dom_indentation.value;
                if (indentation === "on") { //在開啟首圖進縮的情況下
                    if (temp_columns === 2 || columns === 2) { //從2欄切換成其他，或從其他切換成2欄
                        load(pageNow);
                    }
                }
                temp_columns = columns;
            });

        }


        /**
         * 從config讀取設定值並套用(用於初始化設定值)
         */
        function initSetting() {
            setGroupRadioVal(dom_columns, M.config.settings.bulkView.columns.toString());
            temp_columns = M.config.settings.bulkView.columns;
            dom_gaplessMode.value = M.config.settings.bulkView.gaplessMode;
            dom_fixedWidth.value = M.config.settings.bulkView.fixedWidth;
            dom_align.value = M.config.settings.bulkView.align;
            dom_indentation.value = M.config.settings.bulkView.indentation;
            dom_waterfall.value = M.config.settings.bulkView.waterfall;

            dom_number.checked = M.config.settings.bulkView.show.number;
            dom_fileName.checked = M.config.settings.bulkView.show.fileName
            dom_imageSize.checked = M.config.settings.bulkView.show.imageSize;
            dom_fileSize.checked = M.config.settings.bulkView.show.fileSize;
            dom_lastWriteDate.checked = M.config.settings.bulkView.show.lastWriteDate;
            dom_lastWriteTime.checked = M.config.settings.bulkView.show.lastWriteTime;
            apply();

            if (svgIndentation === "" && baseWindow.appInfo !== undefined) {
                svgIndentation = Lib.Combine([baseWindow.appInfo.appDirPath, "\\www\\img\\indentation.svg"]);
            }
        }


        /**
         * 套用設定
         */
        function apply() {

            let columns = M.config.settings.bulkView.columns = Number.parseInt(getGroupRadioVal(dom_columns));
            let gaplessMode = M.config.settings.bulkView.gaplessMode = dom_gaplessMode.value;
            let fixedWidth = M.config.settings.bulkView.fixedWidth = dom_fixedWidth.value;
            let align = M.config.settings.bulkView.align = dom_align.value;
            let indentation = M.config.settings.bulkView.indentation = dom_indentation.value;
            let waterfall = M.config.settings.bulkView.waterfall = dom_waterfall.value;

            dom_bulkViewContent.setAttribute("waterfall", waterfall);
            dom_bulkViewContent.setAttribute("columns", columns.toString());
            dom_bulkViewContent.setAttribute("align", align);
            if (columns === 1 || columns === 2) {
                dom_bulkViewContent.setAttribute("fixedWidth", fixedWidth);
            } else {
                dom_bulkViewContent.setAttribute("fixedWidth", "");
            }

            dom_bulkViewContent.setAttribute("gaplessMode", gaplessMode);
            updateColumns(columns);

            let number = M.config.settings.bulkView.show.number = dom_number.checked;
            let fileName = M.config.settings.bulkView.show.fileName = dom_fileName.checked;
            let imageSize = M.config.settings.bulkView.show.imageSize = dom_imageSize.checked;
            let fileSize = M.config.settings.bulkView.show.fileSize = dom_fileSize.checked;
            let lastWriteDate = M.config.settings.bulkView.show.lastWriteDate = dom_lastWriteDate.checked;
            let lastWriteTime = M.config.settings.bulkView.show.lastWriteTime = dom_lastWriteTime.checked;
            let arShow = [];
            if (number) { arShow.push("number"); }
            if (fileName) { arShow.push("fileName"); }
            if (imageSize) { arShow.push("imageSize"); }
            if (fileSize) { arShow.push("fileSize"); }
            if (lastWriteDate) { arShow.push("lastWriteDate"); }
            if (lastWriteTime) { arShow.push("lastWriteTime"); }
            dom_bulkViewContent.setAttribute("show", arShow.join(","));

            //顯示或隱藏區塊
            if (columns === 1 || columns === 2) { //無間距模式
                dom_box_gaplessMode.style.display = "block";
            } else {
                dom_box_gaplessMode.style.display = "none";
            }
            if (columns === 1 || columns === 2) { //瀑布流
                dom_box_waterfall.style.display = "none";
            } else {
                dom_box_waterfall.style.display = "block";
            }
            if (columns === 1 || columns === 2) { //鎖定寬度
                dom_box_fixedWidth.style.display = "block";
            } else {
                dom_box_fixedWidth.style.display = "none";
            }
            if (columns === 2) { //排列方向
                dom_box_align.style.display = "block";
            } else {
                dom_box_align.style.display = "none";
            }
            if (columns === 2) { //第一張圖縮排
                dom_box_indentation.style.display = "block";
            } else {
                dom_box_indentation.style.display = "none";
            }
        }


        /** 取得 鎖定寬度 */
        function getFixedWidth() {
            return M.config.settings.bulkView.fixedWidth;
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
        function setColumns(n: number) {
            if (n < 1) { n = 1; }
            if (n > 8) { n = 8; }
            setGroupRadioVal(dom_columns, n.toString());
            dom_columns.dispatchEvent(new Event("input"));
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

            setGroupRadioVal(dom_columns, n.toString());
            dom_bulkView.setAttribute("columns", n.toString());
            updateSize();
        }


        var updateSizeThrottle = new Throttle(50); //節流
        /**
         * 重新計算項目大小
         * @param donItem 項目，未傳入則全部重新計算
         */
        function updateSize(donItem?: HTMLElement) {

            if (isVisible === false) { return; }

            updateSizeThrottle.run = async () => {

                if (isVisible === false) { return; }
                if (document.body.offsetWidth * window.devicePixelRatio < 200) { //避免最小化視窗也觸發
                    return;
                }

                var containerPadding = 5; //內距
                let columns = getColumns();
                let bulkViewWidth = dom_bulkViewContent.offsetWidth;
                let itemWidth = Math.floor(bulkViewWidth / columns); //容器寬度

                let arItme;
                if (donItem === undefined) {
                    arItme = dom_bulkViewContent.querySelectorAll(".bulkView-item");
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

                    dom_bulkViewContent.style.height = ""; //復原總高度
                }

                //瀑布流 垂直
                if (getWaterfall() === "vertical" && columns >= 3) {
                    if (arItme.length === 1) {
                        arItme = dom_bulkViewContent.querySelectorAll(".bulkView-item");
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
                    dom_bulkViewContent.style.height = sumHeight + "px";
                }

                //瀑布流 水平
                if (getWaterfall() === "horizontal" && columns >= 3) {
                    if (arItme.length === 1) {
                        arItme = dom_bulkViewContent.querySelectorAll(".bulkView-item");
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
                        let aspectRatios = images.map(size => size[0] / size[1]); //計算每張圖片的寬高比
                        let totalAspectRatio = aspectRatios.reduce((a, b) => a + b); // 計算所有圖片寬高比之和
                        let imageHeights = aspectRatios.map(ratio => (containerWidth - containerPadding * images.length * 2) / totalAspectRatio); //計算每張圖片的高度，使得每張圖片的高度一樣
                        let divWidths = imageHeights.map((height, index) => height * aspectRatios[index] + containerPadding * 2); //計算每個容器的寬度，使每個容器的寬度加起來剛好填滿總寬度，且圖片距離容器有內距

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

                    dom_bulkViewContent.style.height = ""; //復原總高度
                }

            }
        }


        /** 
         * 顯示或隱藏dom
         */
        function visible(val: boolean) {
            isVisible = val;
            if (val === true) {
                initSetting();
                dom_bulkView.style.display = "flex";
            } else {
                dom_bulkView.style.display = "none";
            }
        }


        /**
         * 記錄當前狀態(結束大量瀏覽模式前呼叫)
         */
        function saveCurrentState() {
            isVisible = false;
            temp_scrollTop = dom_bulkView.scrollTop; //記錄離開時捲動到哪個位置
            temp_scrollWidth = dom_bulkViewContent.scrollWidth;
            temp_scrollHeight = dom_bulkViewContent.scrollHeight;

            temp_arFile = arFile;
            if (temp_arFile.length > 0 && temp_arFile[0] === svgIndentation) { //如果有使用首圖縮排
                temp_arFile.shift();
            }
            temp_dirPath = getDirPath();
            temp_fileSortType = M.fileSort.getSortType() + M.fileSort.getOrderbyType();
            temp_pageNow = pageNow;

            //M.fileLoad.setWaitingFile(arFile);
        }


        /**
         * 載入列表，並恢復到上次捲動的位置
         */
        async function load2() {

            //設定返回按鈕
            M.toolbarBack.visible(true);
            M.toolbarBack.setEvent(() => {
                M.script.bulkView.close();
            });

            temp_hasScrolled = false;

            //比較兩個 string[] 是否一樣
            function arraysEqual(a: string[], b: string[]) {
                if (a === b) return true;
                if (a == null || b == null) return false;
                if (a.length !== b.length) return false;

                for (var i = 0; i < a.length; ++i) {
                    if (a[i] !== b[i]) return false;
                }
                return true;
            }

            //返回上次捲動的位置
            function scrollToLastPosition(time: number) {

                //如果寬度變化小於100，則暫時使用上次的高度，避免圖片載入完成前導致移位
                if (Math.abs(dom_bulkViewContent.scrollWidth - temp_scrollWidth) < 100) {
                    dom_bulkViewContent.style.minHeight = temp_scrollHeight + "px";
                    setTimeout(() => {
                        dom_bulkViewContent.style.minHeight = "";
                        temp_scrollTop = -1;
                    }, time);
                }

                if (temp_scrollTop === -1) { return; }
                dom_bulkView.scrollTop = temp_scrollTop;
                for (let i = 1; i <= 10; i++) {
                    setTimeout(() => {
                        if (temp_scrollTop === -1) { return; }
                        if (temp_hasScrolled === false && temp_pageNow === pageNow) {
                            dom_bulkView.scrollTop = temp_scrollTop;
                        }
                    }, (time / 10) * i);
                }
            }

            arFile = Array.from(M.fileLoad.getWaitingFile());

            if (temp_dirPath === getDirPath() && arraysEqual(arFile, temp_arFile)) { //完全一樣

                // scrollToLastPosition(200); //返回上次捲動的位置

            } else if (temp_dirPath === getDirPath()) {

                let fileSortType = M.fileSort.getSortType() + M.fileSort.getOrderbyType();
                if (temp_fileSortType === fileSortType) { //資料夾一樣，排序一樣 (名單不一樣)

                    scrollToLastPosition(800); //返回上次捲動的位置
                    await load(pageNow);

                } else { //資料夾一樣，排序不一樣

                    dom_bulkView.scrollTop = 0; //捲動到最上面
                    await load();

                }

            } else { //完全不一樣

                dom_bulkView.scrollTop = 0; //捲動到最上面
                await load();

            }

            temp_dirPath = getDirPath();

        }


        /**
         * 載入列表
         * @param page 
         */
        async function load(page = 0) {

            arFile = Array.from(M.fileLoad.getWaitingFile());
            if (arFile === undefined) { return; }

            if (getIndentation() === "on" && getColumns() === 2) {
                arFile.unshift(svgIndentation); //插入到最前面
            }

            showPage(page);
        }


        var showPageThrottle = new Throttle(50); //節流
        /**
         * 載入頁面
         * @param _page 
         */
        async function showPage(_page?: number) {

            if (_page === undefined) { _page = pageNow; }
            if (_page !== undefined) { pageNow = _page; }
            pageNow = _page;
            if (pageNow < 1) { pageNow = 1; }
            let pageMax = Math.ceil(arFile.length / imgMaxCount);
            if (pageNow >= pageMax) { pageNow = pageMax; }

            updatePagination(); //更新分頁器

            showPageThrottle.run = async () => {

                dom_bulkView.scrollTop = 0; //捲動到最上面
                dom_bulkViewContent.innerHTML = "";

                let temp = pageNow + getDirPath();
                let start = ((pageNow - 1) * imgMaxCount);
                while (true) { //每次都撈10筆
                    if (start >= pageNow * imgMaxCount) { break; }
                    let n = 10;
                    if (start + n > pageNow * imgMaxCount) { //超過頁的結尾
                        n = pageNow * imgMaxCount - start;
                    }
                    let end = start + n;
                    let newArr = arFile.slice(start, end); //取得陣列特定範圍
                    let retAr = await WebAPI.getFileInfo2List(newArr);
                    if (temp !== pageNow + getDirPath()) { //已經載入其他資料夾，或是切換到其他頁
                        return;
                    }
                    for (let j = 0; j < retAr.length; j++) {
                        const item = retAr[j];
                        let domItem = newItem(item);
                        dom_bulkViewContent.appendChild(domItem);
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
            let arDom = dom_bulkView.querySelectorAll(".bulkView-item");

            for (let i = 0; i < arDom.length; i++) {
                const domItem = arDom[i];
                let domItemPath = domItem.getAttribute("data-path");
                if (domItemPath === null) { continue; }

                let n = (arFile.indexOf(domItemPath) + 1);
                if (getIndentation() === "on" && getColumns() === 2) { //如果有使用首圖縮排
                    n = n - 1;
                }
                //domItem.setAttribute("data-number", n);

                let domNumber = domItem.querySelector(".bulkView-number");
                if (domNumber === null) { continue; }
                domNumber.innerHTML = n.toString();
            }
        }

        var queueUpdateFileWatcher = Promise.resolve(); //佇列
        /**
         * 檔案被修改時呼叫
         */
        function updateFileWatcher(fileWatcherData: FileWatcherData) {

            let dirPath = getDirPath();
            let deleteIndex = -1;
            if (fileWatcherData.ChangeType === "deleted") {
                //跟上次的檔案列表做比較，取得被刪除的檔案的位置    
                let newAr = Array.from(M.fileLoad.getWaitingFile());
                if (arFile.length > 0 && arFile[0] === svgIndentation) { //如果有使用首圖縮排，先刪除首圖才進行比較
                    arFile.shift();
                }
                for (let i = 0; i < arFile.length; i++) {
                    if (arFile[i] != newAr[i]) {
                        deleteIndex = i;
                        break;
                    }
                }
                arFile = newAr;
            } else {
                arFile = Array.from(M.fileLoad.getWaitingFile()); //取得檔案列表
            }

            //加入佇列裡面
            queueUpdateFileWatcher = queueUpdateFileWatcher.then(async () => {

                if (isVisible === false) { return; }
                if (dirPath !== getDirPath()) { return; }

                if (getIndentation() === "on" && getColumns() === 2) { //如果有使用首圖縮排
                    arFile.unshift(svgIndentation); //插入到最前面
                    if (deleteIndex !== -1) { deleteIndex += 1; }
                }

                if (fileWatcherData.ChangeType === "created") {

                    if (pageNow < 1) { pageNow = 1; }

                    let index = arFile.indexOf(fileWatcherData.FullPath);
                    if (index === -1) { //副檔名匹配失敗，沒有出現在列表裡
                        return;

                    } else if (((pageNow - 1) * imgMaxCount) < index + 1 && index < (pageNow * imgMaxCount)) {

                        let newItemDom = await pathToItem(fileWatcherData.FullPath);
                        let items = dom_bulkView.querySelectorAll(".bulkView-item");
                        if (items.length !== 0) {
                            let thirdItem = items[items.length - 1];
                            thirdItem.insertAdjacentElement("afterend", newItemDom);
                        } else {
                            dom_bulkViewContent.appendChild(newItemDom);
                        }

                    }

                    updateItemNumber(); //更新左上角的圖片編號
                    updatePagination(); //更新分頁器

                } else if (fileWatcherData.ChangeType === "deleted") {

                    if (deleteIndex === -1) { return; }

                    //如果刪除檔案後，當前頁碼超過最大頁數，則重新載入
                    let pageMax = Math.ceil(arFile.length / imgMaxCount);
                    if (pageNow > pageMax) {
                        pageNow = pageMax;
                        showPage();
                        return;
                    }

                    if (deleteIndex > (pageNow) * imgMaxCount) { //刪除後面頁的圖片

                    } else if (deleteIndex < (pageNow - 1) * imgMaxCount) { //刪除前面頁的圖片

                        //刪除當前顯示的第1張圖片
                        let arDom = dom_bulkView.querySelectorAll(".bulkView-item");
                        if (arDom.length > 0) {
                            arDom[0].remove();
                        }

                        if (pageNow < pageMax) { //如果不是最後一頁
                            //在最後面插入下一頁的第1張圖片
                            let newItemDom = await pathToItem(arFile[pageNow * imgMaxCount - 1]);
                            let items = dom_bulkView.querySelectorAll(".bulkView-item");
                            let thirdItem = items[items.length - 1];
                            thirdItem.insertAdjacentElement("afterend", newItemDom);
                        }
                        updateItemNumber(); //更新左上角的圖片編號
                        updatePagination(); //更新分頁器

                    } else { //刪除當前頁的圖片

                        //確認刪除的目標在當前頁面
                        let isDelete = false;
                        let arDom = dom_bulkView.querySelectorAll(".bulkView-item");
                        for (let i = 0; i < arDom.length; i++) {
                            const domItem = arDom[i];
                            let domItemPath = domItem.getAttribute("data-path");
                            if (domItemPath === fileWatcherData.FullPath) {
                                domItem.remove();
                                isDelete = true;
                                break;
                            }
                        }
                        if (isDelete) {
                            if (pageNow < pageMax) { //如果不是最後一頁
                                //在最後面插入下一頁的第1張圖片
                                let newItemDom = await pathToItem(arFile[pageNow * imgMaxCount - 1]);
                                let items = dom_bulkView.querySelectorAll(".bulkView-item");
                                let thirdItem = items[items.length - 1];
                                thirdItem.insertAdjacentElement("afterend", newItemDom);
                            }
                            updateItemNumber(); //更新左上角的圖片編號
                            updatePagination(); //更新分頁器
                        }
                    }

                } else if (fileWatcherData.ChangeType === "renamed") {

                    let domItem: HTMLElement | undefined;
                    let arDom = dom_bulkView.querySelectorAll(".bulkView-item");
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
                        updateItemNumber(); //更新左上角的圖片編號
                    } else {
                        return;
                    }

                } else if (fileWatcherData.ChangeType === "changed") {

                    let domItem: HTMLElement | undefined;
                    let arDom = dom_bulkView.querySelectorAll(".bulkView-item");
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
        //傳入檔案路徑，回傳item
        async function pathToItem(path: string) {
            let retAr = await WebAPI.getFileInfo2List([path]);
            let newItemDom = newItem(retAr[0]);
            return newItemDom;
        }


        /**
         * 更新分頁器
         */
        function updatePagination() {

            let pageMax = Math.ceil(arFile.length / imgMaxCount);

            //更新分頁器下拉選單
            (dom_bulkView.querySelectorAll(".bulkView-pagination-select") as NodeListOf<HTMLSelectElement>).forEach(dom => {
                let html = "";
                for (let i = 0; i < pageMax; i++) {
                    let n = i + 1;
                    let start = i * imgMaxCount + 1;
                    let end = (i + 1) * imgMaxCount;
                    if (end >= arFile.length) { end = arFile.length; }
                    if (getIndentation() === "on" && getColumns() === 2) { //如果有使用首圖縮排
                        start -= 1;
                        end -= 1;
                    }
                    html += `<option value="${n}">${n}　(${start}~${end})</option>`;
                }
                dom.innerHTML = html;
                dom.value = pageNow.toString();
            });

            //不能在上下一頁就禁止點擊
            (dom_bulkView.querySelectorAll(".bulkView-pagination-prev") as NodeListOf<HTMLElement>).forEach(dom => {
                if (pageNow === 1) {
                    dom.setAttribute("freeze", "true");
                } else {
                    dom.setAttribute("freeze", "");
                }
            });
            (dom_bulkView.querySelectorAll(".bulkView-pagination-next") as NodeListOf<HTMLElement>).forEach(dom => {
                if (pageNow === pageMax) {
                    dom.setAttribute("freeze", "true");
                } else {
                    dom.setAttribute("freeze", "");
                }
            });

            //只有一頁就隱藏分頁器
            (dom_bulkView.querySelectorAll(".bulkView-pagination") as NodeListOf<HTMLElement>).forEach(dom => {
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

            let temp = pageNow + getDirPath();
            let size = Math.floor(dom_bulkViewContent.offsetWidth / getColumns());
            let div = Lib.newDom(/*html*/`
                <div class="bulkView-item">
                    <div class="bulkView-center bulkView-loading">
                        <img class="bulkView-img">
                    </div>
                </div>
            `);
            div.setAttribute("data-path", fileInfo2.Path);
            div.style.width = size + "px";
            div.style.minHeight = size + "px";
            updateSize(div);

            let n = arFile.indexOf(fileInfo2.Path) + 1;

            setTimeout(async () => {

                //把長路經轉回虛擬路徑，避免瀏覽器無法載入圖片
                if (fileInfo2.Path.length > 255) {
                    fileInfo2.Path = await WV_Path.GetShortPath(fileInfo2.Path);
                }

                let imgData = await M.script.img.getImgData(fileInfo2);
                let width = imgData.width;
                let height = imgData.height;
                let arUrl = imgData.arUrl;

                //--------

                if (temp !== pageNow + getDirPath()) { //已經載入其他資料夾，或是切換到其他頁
                    return;
                }

                //---------

                if (getIndentation() === "on" && getColumns() === 2) { //如果有使用首圖縮排
                    n -= 1;
                }

                let fileName = Lib.GetFileName(fileInfo2.FullPath);
                let LastWriteTimeUtc = fileInfo2.LastWriteTimeUtc;
                let LastWriteTime = new Date(LastWriteTimeUtc).format("yyyy-MM-dd hh:mm:ss");
                let writeDate = new Date(LastWriteTimeUtc).format("yyyy-MM-dd");
                let writeTime = new Date(LastWriteTimeUtc).format("hh:mm:ss");
                let fileSize = Lib.getFileLength(fileInfo2.Lenght);

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

                //點擊圖片後，退出大量瀏覽模式
                div.addEventListener("click", async () => {
                    if (div.getAttribute("data-reload") === "true") {
                        let newItemDom = await pathToItem(fileInfo2.Path);
                        div.insertAdjacentElement("afterend", newItemDom);
                        div.remove();
                        updateItemNumber(); //更新左上角的圖片編號
                    } else if (n !== 0) {

                        M.fileLoad.setIsBulkViewSub(true);
                        await M.script.bulkView.close(arFile.indexOf(fileInfo2.Path));

                        //設定返回按鈕
                        M.toolbarBack.visible(true);
                        M.toolbarBack.setEvent(() => {
                            M.script.bulkView.show();
                        });
                    }
                });

                let dom_img = div.querySelector(".bulkView-img") as HTMLImageElement;
                let dom_center = div.querySelector(".bulkView-center") as HTMLDivElement;
                let dom_header = div.querySelector(".bulkView-header") as HTMLDivElement;
                let dom_header2 = div.querySelector(".bulkView-header2") as HTMLDivElement;

                let title = `${M.i18n.t("bulkView.imageSize")}：${width} x ${height}\n` +
                    `${M.i18n.t("bulkView.fileSize")}：${fileSize}\n` +
                    `${M.i18n.t("bulkView.lastWriteDate")}：${LastWriteTime}`;
                dom_header.setAttribute("title", title);
                dom_header2.setAttribute("title", title);

                //載入失敗時
                if (dom_img.onerror === null) {
                    dom_img.onerror = () => {
                        dom_img.src = "./img/error.svg";
                    }
                }

                //區塊改變大小時
                new ResizeObserver(Lib.debounce(() => {

                    if (isVisible === false) { return; }

                    let ret = arUrl[0];
                    let boxWidth = dom_center.offsetWidth;

                    if (boxWidth <= 10) {
                        return;
                    }

                    //如果是1欄或2欄且有鎖定寬度
                    if (getFixedWidth() !== "off") {
                        let columns = getColumns();
                        if (columns === 1 || columns === 2) {
                            boxWidth = boxWidth * Number.parseInt(getFixedWidth()) / 100;
                        }
                    }

                    let nowScale = boxWidth / width;
                    for (let i = arUrl.length - 1; i >= 0; i--) {
                        const item = arUrl[i];
                        if (item.scale >= nowScale) {
                            ret = item;
                            break;
                        }
                    }

                    if (dom_img.getAttribute("src") !== ret.url) {
                        //dom_img.setAttribute("src", ret.url);
                        limiter.addRequest(dom_img, ret.url);
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
            let page = pageNow;
            page += 1;
            let pageMax = Math.ceil(arFile.length / imgMaxCount);
            if (page >= pageMax) { page = pageMax; }
            if (page !== pageNow) { //如果已經到達最後一頁就不做任何事情
                pageNow = page;
                showPage();
            }
        }


        /**
         * 上一頁
         */
        function pagePrev() {
            let page = pageNow;
            page -= 1;
            if (page <= 1) { page = 1; }
            if (page !== pageNow) { //如果已經是第一頁就不做任何事情
                pageNow = page;
                showPage();
            }
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
            let domActive = dom.querySelector("[active=true]");
            if (domActive === null) { return ""; }
            let value = domActive.getAttribute("value");
            if (value === null) { value = ""; }
            return value;
        }
        /** 設定群組按鈕的值 */
        function setGroupRadioVal(dom: HTMLElement, value: string) {
            let domActive = dom.querySelector(`[value="${value}"]`);
            if (domActive === null) { return; }

            let arDom = dom.querySelectorAll("div");
            for (let i = 0; i < arDom.length; i++) {
                arDom[i].setAttribute("active", "");
            }

            domActive.setAttribute("active", "true");
        }

    }

}



/**
 * 限制最大同時連線數。Chrome最大連線數為6
 */
class RequestLimiter {
    private queue: [HTMLImageElement, string][];
    private inProgress: number;
    private maxRequests: number;

    constructor(maxRequests: number) {
        this.queue = [];
        this.inProgress = 0;
        this.maxRequests = maxRequests;
    }

    addRequest(img: HTMLImageElement, url: string) {

        // 檢查 img 元素是否仍然存在於文檔中
        if (!document.body.contains(img)) {
            return;
        }

        // 檢查佇列中是否已經存在相同的 img 元素和網址
        const index = this.queue.findIndex(([i, u]) => i === img && u === url);
        if (index !== -1) { // 如果存在，則忽略這個請求       
            return;
        }

        // 檢查佇列中是否存在相同的 img 元素但不同的網址
        const index2 = this.queue.findIndex(([i, u]) => i === img && u !== url);
        if (index2 !== -1) { // 如果存在，則將舊的請求從佇列中移除   
            this.queue.splice(index2, 1);
        }

        // 添加新的請求
        this.queue.push([img, url]);
        this.processQueue();
    }

    private processQueue() {
        while (this.inProgress < this.maxRequests && this.queue.length > 0) {
            this.inProgress++;
            const [img, url] = this.queue.shift()!;
            this.loadImage(img, url).then(() => {
                this.inProgress--;
                this.processQueue();
            });
        }
    }

    private loadImage(img: HTMLImageElement, url: string) {
        return new Promise<void>((resolve) => {
            if (!document.body.contains(img)) { // 檢查 img 元素是否仍然存在於文檔中
                resolve();
                return;
            }
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
            img.src = url;
        });
    }
}