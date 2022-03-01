
class MainFileList {

    public initFileList;
    public select;
    public updataLocation;
    public setStartLocation;

    constructor(M: MainWindow) {

        this.initFileList = initFileList;
        this.select = select;
        this.updataLocation = updataLocation;
        this.setStartLocation = setStartLocation;

        let dom_fileList = document.getElementById("main-fileList") as HTMLElement;//螢幕看得到的區域
        let dom_fileListBody = document.getElementById("main-fileListBody") as HTMLElement;//整體的高
        let dom_fileListData = document.getElementById("main-fileListData") as HTMLElement;//資料

        let itemHeight = 80 + 40 + 10;//單個項目的高度

        var temp_loaded: number[] = [];//已經載入過的圖片編號
        var temp_start = 0;//用於判斷是否需要重新渲染UI
        var temp_count = 0;



        //捲動時
        dom_fileList.addEventListener("scroll", () => {
            updateItem()
        })

        //區塊改變大小時
        new ResizeObserver(() => {
            updateItem()
        }).observe(dom_fileList)



        /**
         * 
         * @returns 
         */
        function updateItem() {

            let start = Math.floor(dom_fileList.scrollTop / itemHeight) - 1;//開始位置
            let count = Math.floor(dom_fileList.clientHeight / itemHeight) + 5;//抓取數量

            if (start < 0) { start = 0 }

            if (temp_start === start && temp_count === count) {//沒變化就離開
                return
            }
            temp_start = start;
            temp_count = count;

            //console.log(start, count)

            dom_fileListData.innerHTML = "";//移除之前的所有物件

            let arWaitingFile = M.fileLoad.getWaitingFile()

            let end = start + count;
            if (end > arWaitingFile.length) { end = arWaitingFile.length }
            for (let i = start; i < end; i++) {
                const path = arWaitingFile[i];
                let name = Lib.GetFileName(path);

                let style = "";
                if (temp_loaded.indexOf(i) === -1) {//第一次載入圖片，延遲30毫秒，避免快速捲動時載入太多圖片
                    setTimeout(() => {
                        if (dom_fileListData.contains(div) === false) { return; }//如果物件武警不在UI上，就不載入圖片

                        temp_loaded.push(i);//加到全域變數，表示已經載入過
                        let _url = getImgUrl(path)
                        let domImg = div.getElementsByClassName("fileList-img")[0] as HTMLImageElement;
                        domImg.style.backgroundImage = `url("${_url}")`;
                    }, 30);
                } else {

                    //圖片已經載入過了，直接顯示
                    let imgUrl = getImgUrl(path);
                    style = `background-image:url('${imgUrl}')`;
                }

                let div = newDiv(
                    `<div class="fileList-item" data-id="${i}">
                        <div class="fileList-no">${i + 1}</div>
                        <div class="fileList-img" style="${style}"> </div>
                        <div class="fileList-title">${name}</div>                                                 
                    </div>`)

                dom_fileListData.append(div);

                div.addEventListener("click", () => {

                    M.fileLoad.show(i)
                })

            }

            dom_fileListData.style.marginTop = (start * itemHeight) + "px";
            select();
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
        async function initFileList() {
            let arWaitingFile = M.fileLoad.getWaitingFile()
            dom_fileListBody.style.height = (arWaitingFile.length * itemHeight) + "px";
            temp_start = -999;
            temp_loaded = [];
            updateItem();
        }


        /**
         * 設定 檔案預覽列表 目前選中的項目
         * @returns 
         */
        function select() {

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
            let id = M.fileLoad.getFlag();//取得id
            let f = (dom_fileList.clientHeight - itemHeight) / 2 - 15;//計算距離中心的距離
            dom_fileList.scrollTop = id * itemHeight - f;
        }


        /**
         * 檔案預覽列表 自動捲動到選中項目的地方
         */
        function updataLocation() {

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



        /**
         * 
         */
        /*async function initFileList() {
 
 
            dom_fileList.innerHTML = "";//移除之前的所有物件
 
            let arWaitingFile = M.fileLoad.getWaitingFile()
 
            for (let i = 0; i < arWaitingFile.length; i++) {
                const path = arWaitingFile[i];
                let name = Lib.GetFileName(path);
 
                let div = newDiv(
                    `<div class="fileList-item">
                        <div class="fileList-no">${i + 1}</div>
                        <div class="fileList-img"> </div>
                        <div class="fileList-title">${name}</div>                                                 
                    </div>`)
 
                dom_fileList.append(div);
 
 
                div.addEventListener("click", () => {
                    $(".fileList-item").attr("active", "");
                    div.setAttribute("active", "true");
                    M.fileLoad.show(i)
                })
 
                //----------
 
                let options = {
                    ///root: dom,
                    rootMargin: '0px',
                    threshold: 0
                }
 
                let observer = new IntersectionObserver(async (e) => {
                    if (e.length === 0) { return; }
 
                    let obj = e[0];
                    let domImg = div.getElementsByClassName("fileList-img")[0] as HTMLImageElement;
 
                    let isIntersecting = obj.isIntersecting;
                    if (isIntersecting) {
 
                        let _url = APIURL + "/api/getFileIcon?size=128&path=" + encodeURIComponent(path)
                        domImg.style.backgroundImage = `url("${_url}")`;
                        //console.log("進入" + i)
 
                    } else {
 
                        domImg.style.backgroundImage = ``;
                        //console.log("離開" + i)
                    }
 
                }, options);
 
                observer.observe(div);
 
            }*/



    }


}

