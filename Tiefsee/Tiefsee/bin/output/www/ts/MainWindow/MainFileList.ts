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

            let start = Math.floor(dom_fileList.scrollTop / itemHeight)
            let count = Math.floor(dom_fileList.clientHeight / itemHeight) + 2

            if (temp_start === start && temp_count === count) {
                return
            }

            temp_start = start;
            temp_count = count;

            console.log(start, count)

            dom_fileListData.innerHTML = "";//移除之前的所有物件

            let arWaitingFile = M.fileLoad.getWaitingFile()

            let end = start + count;
            if (end > arWaitingFile.length) { end = arWaitingFile.length }
            for (let i = start; i < end; i++) {
                const path = arWaitingFile[i];
                let name = Lib.GetFileName(path);
                let imgUrl = APIURL + "/api/getFileIcon?size=128&path=" + encodeURIComponent(path);

                let div = newDiv(
                    `<div class="fileList-item">
                        <div class="fileList-no">${i + 1}</div>
                        <div class="fileList-img" style="background-image:url('${imgUrl}'"> </div>
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

