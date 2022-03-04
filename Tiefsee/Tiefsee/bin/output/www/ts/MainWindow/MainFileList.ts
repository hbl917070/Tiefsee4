
/**
 * 檔案預覽列表
 */
class MainFileList {

    public initFileList;
    public select;
    public updataLocation;
    public setStartLocation;
    public setEnabled;
    public setShowNo;
    public setShowName;
    public setItemWidth;

    constructor(M: MainWindow) {

        this.initFileList = initFileList;
        this.select = select;
        this.updataLocation = updataLocation;
        this.setStartLocation = setStartLocation;
        this.setEnabled = setEnabled
        this.setShowNo = setShowNo
        this.setShowName = setShowName
        this.setItemWidth = setItemWidth

        let dom_fileList = document.getElementById("main-fileList") as HTMLElement;//螢幕看得到的區域
        let dom_fileListBody = document.getElementById("main-fileListBody") as HTMLElement;//整體的高
        let dom_fileListData = document.getElementById("main-fileListData") as HTMLElement;//資料
        var dom_dragbar_mainFileList = document.getElementById("dragbar-mainFileList") as HTMLElement;

        var isEnabled = true;//啟用 檔案預覽列表
        var isShowNo = true;//顯示編號
        var isShowName = true;//顯示檔名
        var itemWidth = 1;//單個項目的寬度
        var itemHeight = 1;//單個項目的高度

        var temp_loaded: number[] = [];//已經載入過的圖片編號
        var temp_start = 0;//用於判斷是否需要重新渲染UI
        var temp_count = 0;
        var temp_itemHeight = 0;//用於判斷物件高度是否需要更新

        //拖曳改變size
        var dragbar = new Dragbar();
        dragbar.init(dom_fileList, dom_dragbar_mainFileList);
        //拖曳開始
        dragbar.setEventStart(() => { })
        //拖曳
        dragbar.setEventMove((val: number) => {
            if (val < 10) {//小於10的話就暫時隱藏
                dom_dragbar_mainFileList.style.left = "0px";
                dom_fileList.style.opacity = "0";
            } else {
                dom_fileList.style.opacity = "1";
                setItemWidth(val);
            }
        })
        //拖曳 結束
        dragbar.setEventEnd((val: number) => {
            if (val < 10) {//小於10的話，關閉檔案預覽列表
                setEnabled(false);
            }
        })


        //更新畫面
        dom_fileList.addEventListener("scroll", () => {//捲動時
            updateItem()
        })
        new ResizeObserver(() => { //區塊改變大小時
            updateItem()
        }).observe(dom_fileList)


        function setEnabled(val: boolean) {

            if (val) {
                dom_fileList.setAttribute("active", "true");
            } else {
                dom_fileList.setAttribute("active", "");
            }

            M.config.settings.layout.fileListEnabled = val;
            dragbar.setEnabled(val);
            dom_fileList.style.opacity = "1";

            if (isEnabled === val) { return; }
            isEnabled = val;
            temp_start = -1;//強制必須重新繪製
            dom_fileListData.innerHTML = "";//移除之前的所有物件
            updateItem();
            setStartLocation();//捲到中間
        }

        function setShowNo(val: boolean) {
            if (isShowNo === val) { return; }
            isShowNo = val;
            temp_start = -1;//強制必須重新繪製
            dom_fileListData.innerHTML = "";//移除之前的所有物件
            updateItem();
            setStartLocation();//捲到中間
        }

        function setShowName(val: boolean) {
            if (isShowName === val) { return; }
            isShowName = val;
            temp_start = -1;//強制必須重新繪製
            dom_fileListData.innerHTML = "";//移除之前的所有物件
            updateItem();
            setStartLocation();//捲到中間
        }


        /**
         * 設定size
         * @param val 
         */
        function setItemWidth(val: number) {

            if (itemWidth === val) { return; }

            let valMin = 80;
            let valMax = 200;
            if (val <= valMin) { val = valMin; }
            if (val >= valMax) { val = valMax; }

            itemWidth = val;
            M.config.settings.layout.fileListShowWidth = val;

            var cssRoot = document.body;
            cssRoot.style.setProperty("--fileList-width", val + "px");
            dom_dragbar_mainFileList.style.left = val + "px";

            temp_start = -1;//強制必須重新繪製
            updateItem();
            setStartLocation();//捲到中間
            //updataLocation()
        }


        /**
         * 
         * @returns 
         */
        function updateItem() {

            if (isEnabled === false) {
                dom_fileListData.innerHTML = "";//移除之前的所有物件
                return;
            }

            //取得單個項目的高度
            let fileListItem = dom_fileListData.querySelector(".fileList-item");
            if (fileListItem === null) {
                newItem(-1, "");
                fileListItem = dom_fileListData.querySelector(".fileList-item");
            }
            if (fileListItem !== null) {
                itemHeight = fileListItem.getBoundingClientRect().height + 5;
            }

            //重新計算整體的高度
            if (temp_itemHeight !== itemHeight) {
                let arWaitingFile = M.fileLoad.getWaitingFile();
                dom_fileListBody.style.height = (arWaitingFile.length * itemHeight) + "px";
            }
            temp_itemHeight = itemHeight;

            let start = Math.floor(dom_fileList.scrollTop / itemHeight) - 1;//開始位置
            let count = Math.floor(dom_fileList.clientHeight / itemHeight) + 5;//抓取數量

            if (start < 0) { start = 0 }
            if (temp_start === start && temp_count === count) {//沒變化就離開
                return
            }
            temp_start = start;
            temp_count = count;

            dom_fileListData.innerHTML = "";//移除之前的所有物件
            dom_fileListData.style.marginTop = (start * itemHeight) + "px";
            let arWaitingFile = M.fileLoad.getWaitingFile()

            let end = start + count;
            if (end > arWaitingFile.length) { end = arWaitingFile.length }
            for (let i = start; i < end; i++) {
                const path = arWaitingFile[i];
                newItem(i, path);
            }

            select();
        }


        /**
         * 產生一個新項目
         * @param i 
         * @param path 
         * @returns 
         */
        function newItem(i: number, path: string) {

            let name = Lib.GetFileName(path);//檔名

            let style = "";
            if (temp_loaded.indexOf(i) === -1) {//第一次載入圖片，延遲30毫秒，避免快速捲動時載入太多圖片
                if (path !== "") {
                    setTimeout(() => {
                        if (dom_fileListData.contains(div) === false) { return; }//如果物件不在網頁上，就不載入圖片

                        temp_loaded.push(i);//加到全域變數，表示已經載入過
                        let _url = getImgUrl(path)
                        let domImg = div.getElementsByClassName("fileList-img")[0] as HTMLImageElement;
                        domImg.style.backgroundImage = `url("${_url}")`;
                    }, 30);
                }
            } else {

                //圖片已經載入過了，直接顯示
                let imgUrl = getImgUrl(path);
                style = `background-image:url('${imgUrl}')`;
            }

            let htmlNo = ``
            let htmlName = ``
            if (isShowNo === true) {
                htmlNo = `<div class="fileList-no">${i + 1}</div>`
            }
            if (isShowName === true) {
                htmlName = ` <div class="fileList-name">${name}</div> `
            }

            let div = newDiv(
                `<div class="fileList-item" data-id="${i}">
                    ${htmlNo}
                    <div class="fileList-img" style="${style}"> </div>
                    ${htmlName}                                               
                </div>`)
            dom_fileListData.append(div);

            //click載入圖片
            div.addEventListener("click", () => {
                M.fileLoad.show(i);
            })

            return div
        }


        function getImgUrl(path: string) {
            if (Lib.GetExtension(path) === ".svg") {
                return Lib.pathToURL(path);
            }
            return APIURL + "/api/getFileIcon?size=128&path=" + encodeURIComponent(path);
        }


        /**
         * 檔案預覽列表初始化 (重新讀取列表
         */
        function initFileList() {
            //let arWaitingFile = M.fileLoad.getWaitingFile()
            //dom_fileListBody.style.height = (arWaitingFile.length * itemHeight) + "px";
            temp_start = -999;
            temp_loaded = [];
            temp_itemHeight = -1;
            updateItem();
        }


        /**
         * 設定 檔案預覽列表 目前選中的項目
         * @returns 
         */
        function select() {

            if (isEnabled === false) { return; }

            //移除上一次選擇的項目
            document.querySelector(`.fileList-item[active=true]`)?.setAttribute("active", "");

            let id = M.fileLoad.getFlag();//取得id

            let div = document.querySelector(`.fileList-item[data-id="${id}"]`);
            if (div == null) { return; }
            div.setAttribute("active", "true");
        }


        /**
         * 檔案預覽列表 捲動到選中項目的中間
         */
        function setStartLocation() {

            if (isEnabled === false) { return; }

            let id = M.fileLoad.getFlag();//取得id
            let f = (dom_fileList.clientHeight - itemHeight) / 2 - 15;//計算距離中心的距離
            dom_fileList.scrollTop = id * itemHeight - f;
        }


        /**
         * 檔案預覽列表 自動捲動到選中項目的地方
         */
        function updataLocation() {

            if (isEnabled === false) { return; }

            let id = M.fileLoad.getFlag();//取得id

            //如果選中的項目在上面
            let start = Math.floor(dom_fileList.scrollTop / itemHeight);//開始位置
            if (id <= start) {
                dom_fileList.scrollTop = id * itemHeight;
                return
            }

            //如果選中的項目在下面
            let count = Math.floor(dom_fileList.clientHeight / itemHeight);//抓取數量
            let end = (id - count + 1) * itemHeight - (dom_fileList.clientHeight % itemHeight);
            if (dom_fileList.scrollTop < end) {
                dom_fileList.scrollTop = end;
            }
        }



    }


}

