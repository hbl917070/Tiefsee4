
/** 
 * 大量瀏覽模式
 */
class BulkView {

    public visible;
    public load;
    public pageNext;
    public pagePrev;
    public setColumns;

    constructor(M: MainWindow) {

        var dom_bulkView = document.querySelector("#mView-bulkView") as HTMLTextAreaElement;
        var dom_bulkViewContent = dom_bulkView.querySelector(".bulkView-content") as HTMLElement;

        var dom_menu = document.querySelector("#menu-bulkView") as HTMLSelectElement;
        var dom_columns = dom_menu.querySelector(".js-columns") as HTMLSelectElement;
        var dom_gaplessMode = dom_menu.querySelector(".js-gaplessMode") as HTMLSelectElement;
        var dom_fixedWidth = dom_menu.querySelector(".js-fixedWidth") as HTMLSelectElement;
        var dom_alignmentDirection = dom_menu.querySelector(".js-alignmentDirection") as HTMLSelectElement;
        var dom_firstImageIndentation = dom_menu.querySelector(".js-firstImageIndentation") as HTMLSelectElement;

        var dom_number = dom_menu.querySelector(".js-number") as HTMLInputElement;
        var dom_fileName = dom_menu.querySelector(".js-fileName") as HTMLInputElement;
        var dom_imageSize = dom_menu.querySelector(".js-imageSize") as HTMLInputElement;
        var dom_fileSize = dom_menu.querySelector(".js-fileSize") as HTMLInputElement;
        var dom_lastWriteDate = dom_menu.querySelector(".js-lastWriteDate") as HTMLInputElement;
        var dom_lastWriteTime = dom_menu.querySelector(".js-lastWriteTime") as HTMLInputElement;

        var dom_box_gaplessMode = dom_menu.querySelector(".js-box-gaplessMode") as HTMLDivElement;
        var dom_box_firstImageIndentation = dom_menu.querySelector(".js-box-firstImageIndentation") as HTMLDivElement;
        var dom_box_fixedWidth = dom_menu.querySelector(".js-box-fixedWidth") as HTMLDivElement;


        var arFile: string[] = [];


        /** 項目的邊距 */
        var itemMargin = 0;

        /** 一頁顯示幾張圖片*/
        var imgMaxCount = 100;

        /** 當前頁數 */
        var pageNow = 1;

        this.visible = visible;
        this.pageNext = pageNext;
        this.pagePrev = pagePrev;
        this.load = load;
        this.setColumns = setColumns;

        initEvent();


        function initEvent() {


            //區塊改變大小時
            new ResizeObserver(() => {
                requestAnimationFrame(() => {
                    updateColumns();
                })
            }).observe(dom_bulkView);

            /*dom_columns.addEventListener("input", (e) => {
                let val = Number.parseInt(dom_columns.value);
                setColumns(val);
            });*/

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
                    showFile(val);
                });
            });

            //------

            let arDomCheckbox = [
                dom_columns,
                dom_gaplessMode,
                dom_fixedWidth,
                dom_alignmentDirection,
                dom_firstImageIndentation,
                dom_number,
                dom_fileName,
                dom_imageSize,
                dom_fileSize,
                dom_lastWriteDate,
                dom_lastWriteTime
            ];

            let temp_columns = -1;//記錄上一次的值
            arDomCheckbox.forEach((dom) => {
                dom.addEventListener("input", (e) => {
                    apply();

                    if (dom === dom_columns) {
                        let columns = Number.parseInt(dom_columns.value);
                        let firstImageIndentation = dom_firstImageIndentation.value;

                        if (firstImageIndentation === "on") { //在開啟首圖進縮的情況下
                            if (temp_columns === 2 || columns === 2) { //從2欄切換成其他，或從其他切換成2欄
                                load(pageNow);
                            }
                        }
                        temp_columns = columns;
                    }

                    if (dom === dom_firstImageIndentation) {
                        let columns = Number.parseInt(dom_columns.value);
                        let firstImageIndentation = dom_firstImageIndentation.value;
                        if (columns === 2) {
                            load(pageNow);
                        }
                    }

                });
            })

        }


        /**
         * 從config讀取設定值並套用(用於初始化設定值)
         */
        function initSetting() {
            dom_columns.value = M.config.settings.bulkView.columns.toString();
            dom_gaplessMode.value = M.config.settings.bulkView.gaplessMode;
            dom_fixedWidth.value = M.config.settings.bulkView.fixedWidth;
            dom_alignmentDirection.value = M.config.settings.bulkView.alignmentDirection;
            dom_firstImageIndentation.value = M.config.settings.bulkView.firstImageIndentation;

            dom_number.checked = M.config.settings.bulkView.show.number;
            dom_fileName.checked = M.config.settings.bulkView.show.fileName
            dom_imageSize.checked = M.config.settings.bulkView.show.imageSize;
            dom_fileSize.checked = M.config.settings.bulkView.show.fileSize;
            dom_lastWriteDate.checked = M.config.settings.bulkView.show.lastWriteDate;
            dom_lastWriteTime.checked = M.config.settings.bulkView.show.lastWriteTime;
            apply();
        }


        /**
         * 套用設定
         */
        function apply() {

            let columns = M.config.settings.bulkView.columns = Number.parseInt(dom_columns.value);
            let gaplessMode = M.config.settings.bulkView.gaplessMode = dom_gaplessMode.value;
            let fixedWidth = M.config.settings.bulkView.fixedWidth = dom_fixedWidth.value;
            let alignmentDirection = M.config.settings.bulkView.alignmentDirection = dom_alignmentDirection.value;
            let firstImageIndentation = M.config.settings.bulkView.firstImageIndentation = dom_firstImageIndentation.value;

            dom_bulkViewContent.setAttribute("columns", columns.toString());
            dom_bulkViewContent.setAttribute("alignmentDirection", alignmentDirection);
            dom_bulkViewContent.setAttribute("fixedWidth", fixedWidth);
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
            if (columns === 1 || columns === 2) {
                dom_box_gaplessMode.style.display = "block";
            } else {
                dom_box_gaplessMode.style.display = "none";
            }
            if (columns === 2) {
                dom_box_firstImageIndentation.style.display = "block";
            } else {
                dom_box_firstImageIndentation.style.display = "none";
            }
        }



        function setColumns(n: number) {
            if (n < 1) { n = 1; }
            if (n > 8) { n = 8; }
            dom_columns.value = n.toString();
            dom_columns.dispatchEvent(new Event("input"));
        }
        function getColumns() {
            return M.config.settings.bulkView.columns;
        }
        function getFixedWidth() {
            return M.config.settings.bulkView.fixedWidth;
        }

        function getFirstImageIndentation() {
            return M.config.settings.bulkView.firstImageIndentation;
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

            dom_columns.value = n.toString();
            dom_bulkView.setAttribute("columns", n.toString());
            updateSize();
        }


        /**
         * 重新計算項目大小
         * @param donItem 項目，未傳入則全部重新計算
         */
        function updateSize(donItem?: HTMLElement) {

            let domBulkViewWidth = dom_bulkViewContent.offsetWidth - 18 - (getColumns() + 1) * itemMargin;
            dom_bulkViewContent.style.paddingLeft = itemMargin + "px";
            dom_bulkViewContent.style.paddingTop = itemMargin + "px";
            let size = Math.floor(domBulkViewWidth / getColumns());

            let arItme;
            if (donItem === undefined) {
                arItme = dom_bulkViewContent.querySelectorAll(".bulkView-item");
            } else {
                arItme = [donItem];
            }

            for (let i = 0; i < arItme.length; i++) {
                const item = arItme[i] as HTMLElement;
                item.style.width = `calc( ${100 / getColumns()}% - ${itemMargin}px )`;
                item.style.marginRight = itemMargin + "px";
                item.style.marginBottom = itemMargin + "px";

                let itmecenter = item.querySelector(".bulkView-img") as HTMLElement;
                if (getColumns() <= 2) {
                    itmecenter.style.maxHeight = "";
                } else if (getColumns() === 3) {
                    itmecenter.style.maxHeight = size * 4 + "px";
                } else {
                    itmecenter.style.maxHeight = size * 2 + "px";
                }
            }
        }


        /** 
         * 顯示或隱藏dom
         */
        function visible(val: boolean) {
            if (val === true) {
                initSetting();
                dom_bulkView.style.display = "flex";
            } else {
                dom_bulkView.style.display = "none";
            }
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
                showFile();
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
                showFile();
            }
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


        async function newItem(path: string, n: number) {

            let temp_pageNow = pageNow;
            let temp_dir = M.fileLoad.getFilePath();

            let fileInfo2 = await WebAPI.getFileInfo2(path);

            let div = newDiv(/*html*/`
                <div class="bulkView-item">
                    <div class="bulkView-center">
                        <img class="bulkView-img" src="./img/loading.svg" style="max-width:100px;">
                    </div>
                </div>
            `)
            dom_bulkViewContent.appendChild(div);
            updateSize(div);

            let fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
            let fileType = Lib.GetFileType(fileInfo2); //取得檔案類型
            let configItem = M.config.getAllowFileTypeItem(GroupType.img, fileType); // ex. { ext:"psd", type:"magick" }
            if (configItem === null) {
                configItem = { ext: "", type: "vips", vipsType: "magick" }
            }
            let configType = configItem.type;

            let vipsType = configItem.vipsType as string;
            let arUrl: { scale: number, url: string }[] = [];
            let width = -1;
            let height = -1;

            if (Lib.IsAnimation(fileInfo2) === true) { //判斷是否為動圖

                let imgInitInfo = await WebAPI.Img.webInit(fileInfo2);
                if (imgInitInfo.code == "1") {
                    width = imgInitInfo.width;
                    height = imgInitInfo.height;
                    arUrl.push({ scale: 1, url: imgInitInfo.path });
                }

            } else if (configType === "vips") {

                let imgInitInfo = await WebAPI.Img.vipsInit(vipsType, fileInfo2);
                if (imgInitInfo.code == "1") {

                    width = imgInitInfo.width;
                    height = imgInitInfo.height;

                    let ratio = Number(M.config.settings.image.tiefseeviewBigimgscaleRatio);
                    if (isNaN(ratio)) { ratio = 0.8; }
                    if (ratio > 0.95) { ratio = 0.95; }
                    if (ratio < 0.5) { ratio = 0.5; }

                    //設定縮放的比例
                    arUrl.push({ scale: 1, url: Lib.pathToURL(imgInitInfo.path) + `?${fileTime}` });
                    for (let i = 1; i <= 30; i++) {
                        let scale = Number(Math.pow(ratio, i).toFixed(3));
                        if (imgInitInfo.width * scale < 200 || imgInitInfo.height * scale < 200) { //如果圖片太小就不處理
                            break;
                        }
                        let imgU = WebAPI.Img.vipsResize(scale, fileInfo2);
                        arUrl.push({ scale: scale, url: imgU })
                    }

                }

            } else { //直接開啟網址

                let url = await WebAPI.Img.getUrl(configType, fileInfo2); //取得圖片網址
                let imgInitInfo = await WebAPI.Img.webInit(url);
                if (imgInitInfo.code == "1") {
                    width = imgInitInfo.width;
                    height = imgInitInfo.height;
                    arUrl.push({ scale: 1, url: imgInitInfo.path });
                }

            }

            if (width === -1) {
                let url = await WebAPI.Img.getUrl("icon", fileInfo2); //取得圖片網址
                width = 256;
                height = 256;
                arUrl.push({ scale: 1, url: url });
            }

            //--------

            if (temp_pageNow !== pageNow) {
                console.warn(`${temp_pageNow} !== ${pageNow}`)
                return;
            }

            //---------

            n = n + 1 + (pageNow - 1) * imgMaxCount;

            let fileName = Lib.GetFileName(fileInfo2.Path);
            let LastWriteTimeUtc = fileInfo2.LastWriteTimeUtc;
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
                </div>
            `

            let dom_img = div.querySelector(".bulkView-img") as HTMLImageElement;
            let dom_center = div.querySelector(".bulkView-center") as HTMLDivElement;

            //載入失敗時
            if (dom_img.onerror === null) {
                dom_img.onerror = () => {
                    dom_img.src = "./img/error.svg";
                }
            }

            //區塊改變大小時
            new ResizeObserver(() => {
                requestAnimationFrame(() => {
                    let ret = arUrl[0];
                    let boxWidth = dom_center.offsetWidth;
                    if (getFixedWidth() !== "off") { //如果有鎖定寬度
                        boxWidth = boxWidth * Number.parseInt(getFixedWidth()) / 100;
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
                        dom_img.setAttribute("src", ret.url);
                    }
                })
            }).observe(div);

            updateSize(div);
        }


        //以定時的方式執行 show() ，如果在圖片載入完成前接受到多次指令，則只會執行最後一個指令
        var _showFile = async () => { };
        async function timerFile() {
            let func = _showFile;
            _showFile = async () => { };
            await func();

            setTimeout(() => { timerFile(); }, 50);  //遞迴
        }
        timerFile();


        async function showFile(_page?: number) {

            if (_page === undefined) { _page = pageNow; }
            if (_page !== undefined) { pageNow = _page; }
            pageNow = _page;
            if (pageNow < 1) { pageNow = 1; }
            let pageMax = Math.ceil(arFile.length / imgMaxCount);
            if (pageNow >= pageMax) { pageNow = pageMax; }

            updatePagination(); //更新分頁器

            _showFile = async () => {

                let start = ((pageNow - 1) * imgMaxCount);

                dom_bulkViewContent.innerHTML = "";
                for (let i = 0; i < 10; i++) { //分成10次處理
                    console.time();

                    let start2 = start + (imgMaxCount / 10) * (i);
                    let end = start + (imgMaxCount / 10) * (i + 1);
                    let newArr = arFile.slice(start2, end); //取得陣列特定範圍
                    if (newArr.length === 0) { break; }
                    let retAr = await WebAPI.getFileInfo2List(newArr);

                    for (let j = 0; j < retAr.length; j++) {
                        const item = retAr[j];
                        let path = item.Path;
                        newItem(path, i * 10 + j);
                    }
                    console.timeEnd();
                }

                updateColumns();
            }

        }



        async function load(page = 0) {

            arFile = Array.from(M.fileLoad.getWaitingFile());
            if (arFile === undefined) { return; }

            if (getFirstImageIndentation() === "on" && getColumns() === 2) {
                if (baseWindow.appInfo !== undefined) {
                    let path = Lib.Combine([baseWindow.appInfo.appDirPath, "\\www\\img\\indentation.svg"])
                    arFile.unshift(path);
                }
            }

            showFile(page);
        }



    }


}
