console.log(18)

class MainFileList {

    public initFileList;

    constructor(M: MainWindow) {

        let dom_fileList = document.getElementById("main-fileList") as HTMLElement;//螢幕看得到的區域
        let dom_fileListBody = document.getElementById("main-fileListBody") as HTMLElement;//整體的高
        let dom_fileListData = document.getElementById("main-fileListData") as HTMLElement;//資料

        let itemHeight = 135;//單個項目的高度
        var temp_start = 0;
        var temp_count = 0;
        var temp_loaded: number[] = [];

        this.initFileList = initFileList;

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

            let start = Math.floor(dom_fileList.scrollTop / itemHeight);//開始位置
            let count = Math.floor(dom_fileList.clientHeight / itemHeight) + 5;//抓取數量

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
                        let _url = APIURL + "/api/getFileIcon?size=128&path=" + encodeURIComponent(path)
                        let domImg = div.getElementsByClassName("fileList-img")[0] as HTMLImageElement;
                        domImg.style.backgroundImage = `url("${_url}")`;
                    }, 30);
                } else {

                    //圖片已經載入過了，直接顯示
                    let imgUrl = APIURL + "/api/getFileIcon?size=128&path=" + encodeURIComponent(path);
                    style = `background-image:url('${imgUrl}')`;
                }

                let div = newDiv(
                    `<div class="fileList-item">
                        <div class="fileList-no">${i + 1}</div>
                        <div class="fileList-img" style="${style}"> </div>
                        <div class="fileList-title">${name}</div>                                                 
                    </div>`)

                dom_fileListData.append(div);

                div.addEventListener("click", () => {
                    $(".fileList-item").attr("active", "");
                    div.setAttribute("active", "true");
                    M.fileLoad.show(i)
                })

            }

            dom_fileListData.style.marginTop = (start * itemHeight) + "px";

        }


        /**
         * 
         */
        async function initFileList() {
            let arWaitingFile = M.fileLoad.getWaitingFile()
            dom_fileListBody.style.height = (arWaitingFile.length * itemHeight) + "px";
            temp_start = -999;
            temp_loaded = [];
            updateItem();
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

