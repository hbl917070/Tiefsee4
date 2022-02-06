

class FileShow {


    public openImage;
    public openPdf;
    public openTxt;
    public openWelcome;
    public openNone;
    public getIsLoaded;

    public tieefseeview;
    public dom_imgview;
    public dom_welcomeview;

    constructor(M: MainWindow) {

        var tieefseeview: Tieefseeview = new Tieefseeview(<HTMLDivElement>document.querySelector("#main-tiefseeview"));
        var dom_imgview = <HTMLDivElement>document.querySelector("#main-tiefseeview")
        var dom_pdfview = <HTMLDivElement>document.querySelector("#main-pdfview")
        var dom_txtview = <HTMLTextAreaElement>document.querySelector("#main-txtview")
        var dom_welcomeview = <HTMLDivElement>document.querySelector("#main-welcomeview")
        var isLoaded = true;

        this.openImage = openImage;
        this.openPdf = openPdf;
        this.openTxt = openTxt;
        this.openWelcome = openWelcome;
        this.openNone = openNone;
        this.getIsLoaded = getIsLoaded;
        this.dom_welcomeview = dom_welcomeview;
        this.dom_imgview = dom_imgview;
        this.tieefseeview = tieefseeview;

        /**
         * 
         * @param groupType 
         * @returns 
         */
        function setShowType(groupType: string) {

            let arToolsGroup = document.querySelectorAll(".main-tools-group");
            for (let i = 0; i < arToolsGroup.length; i++) {
                const item = arToolsGroup[i];
                item.setAttribute("active", "");
            }

            if (groupType === GroupType.none) {

                //更換工具列
                getToolsDom(GroupType.none)?.setAttribute("active", "true");

                dom_imgview.style.display = "none";
                dom_pdfview.style.display = "none";
                dom_txtview.style.display = "none";
                dom_welcomeview.style.display = "none";

                dom_pdfview.setAttribute("src", "");
                dom_txtview.value = "";
                tieefseeview.loadNone();
                return;
            }


            if (groupType === GroupType.img) {

                //更換工具列
                getToolsDom(GroupType.img)?.setAttribute("active", "true");

                dom_imgview.style.display = "block";
                dom_pdfview.style.display = "none";
                dom_txtview.style.display = "none";
                dom_welcomeview.style.display = "none";

                dom_pdfview.setAttribute("src", "");
                dom_txtview.value = "";
                //view_image.loadNone();
                return;
            }

            if (groupType === GroupType.imgs) {
                return;
            }

            if (groupType === GroupType.txt) {

                //更換工具列
                getToolsDom(GroupType.txt)?.setAttribute("active", "true");

                dom_imgview.style.display = "none";
                dom_pdfview.style.display = "none";
                dom_txtview.style.display = "block";
                dom_welcomeview.style.display = "none";

                dom_pdfview.setAttribute("src", "");
                //dom_txtview.value = "";
                tieefseeview.loadNone();
                return;
            }

            if (groupType === GroupType.pdf) {

                //更換工具列
                getToolsDom(GroupType.pdf)?.setAttribute("active", "true");

                dom_imgview.style.display = "none";
                dom_pdfview.style.display = "block";
                dom_txtview.style.display = "none";
                dom_welcomeview.style.display = "none";

                //dom_pdfview.setAttribute("src", "");
                dom_txtview.value = "";
                tieefseeview.loadNone();
                return;
            }

            if (groupType === GroupType.welcome) {

                //更換工具列
                getToolsDom(GroupType.welcome)?.setAttribute("active", "true");

                dom_imgview.style.display = "none";
                dom_pdfview.style.display = "none";
                dom_txtview.style.display = "none";
                dom_welcomeview.style.display = "flex";

                dom_pdfview.setAttribute("src", "");
                dom_txtview.value = "";
                tieefseeview.loadNone();
                return;
            }
        }


        /**
         * 
         * @param type 
         * @returns 
         */
        function getToolsDom(type: string): HTMLElement | null {
            return M.dom_tools.querySelector(`.main-tools-group[data-name="${type}"]`);
        }


        function getIsLoaded() {
            return isLoaded;
        }

        /**
         * 
         * @param _path 
         */
        async function openImage(fileInfo2: FileInfo2) {

            //if (isLoaded) {
            isLoaded = false;
            //}

            let _path = fileInfo2.Path;

            setShowType(GroupType.img);//改變顯示類型

            let imgurl = _path;//圖片網址

            if (M.fileLoad.getGroupType() === GroupType.unknown) {//如果是未知的類型
                imgurl = await WV_Image.GetFileIcon(_path, 256);//取得檔案總管的圖示
            } else {
                imgurl = "/api/getimg/" + encodeURIComponent(_path) + `?LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
            }

            tieefseeview.setLoading(true);

            await tieefseeview.preload(imgurl);//預載入

            if (Lib.IsAnimation(fileInfo2) === true) {//判斷是否為動圖
                await tieefseeview.loadImg(imgurl);//使用<img>渲染
            } else {
                await tieefseeview.loadBigimg(imgurl);//使用canvas渲染
            }

            tieefseeview.setLoading(false);
            tieefseeview.transformRefresh(false);//初始化 旋轉、鏡像
            tieefseeview.setEventChangeZoom(((ratio: number) => {
                let dom_btnScale = M.dom_tools.querySelector(`[data-name="btnScale"]`);
                if (dom_btnScale != null) {
                    dom_btnScale.innerHTML = (ratio * 100).toFixed(0) + "%";
                }
            }))
            tieefseeview.zoomFull(TieefseeviewZoomType['full-100%']);

            //圖片長寬
            let dom_size = getToolsDom(GroupType.img)?.querySelector(`[data-name="infoSize"]`);
            if (dom_size != null) {
                dom_size.innerHTML = `${tieefseeview.getOriginalWidth()}<br>${tieefseeview.getOriginalHeight()}`;
            }

            //檔案類型
            let dom_type = getToolsDom(GroupType.img)?.querySelector(`[data-name="infoType"]`);
            if (dom_type != null) {
                let fileType = Lib.GetFileType(fileInfo2).toLocaleUpperCase();;
                let fileLength = getFileLength(fileInfo2.Lenght);
                dom_type.innerHTML = `${fileType}<br>${fileLength}`;
            }

            //檔案修改時間
            let dom_writeTime = getToolsDom(GroupType.img)?.querySelector(`[data-name="infoWriteTime"]`);
            if (dom_writeTime != null) {
                let timeUtc = fileInfo2.LastWriteTimeUtc;
                let time = new Date(timeUtc).format("yyyy-MM-dd<br>hh:mm:ss")
                dom_writeTime.innerHTML = time;
            }

            //if (isLoaded === false) {
                isLoaded = true;
            //}

        }


        /**
         * pdf 或 ai
         * @param _url 
         */
        async function openPdf(fileInfo2: FileInfo2) {

            let _path = fileInfo2.Path;

            setShowType(GroupType.pdf);//改變顯示類型

            let _url = "/api/getpdf/" + encodeURIComponent(_path)
            dom_pdfview.setAttribute("src", _url);

            //檔案類型
            let dom_type = getToolsDom(GroupType.pdf)?.querySelector(`[data-name="infoType"]`);
            if (dom_type != null) {
                let fileType = Lib.GetFileType(fileInfo2).toLocaleUpperCase();
                let fileLength = getFileLength(fileInfo2.Lenght);
                dom_type.innerHTML = `${fileType}<br>${fileLength}`;
            }

            //檔案修改時間
            let dom_writeTime = getToolsDom(GroupType.pdf)?.querySelector(`[data-name="infoWriteTime"]`);
            if (dom_writeTime != null) {
                let timeUtc = fileInfo2.LastWriteTimeUtc;
                let time = new Date(timeUtc).format("yyyy-MM-dd<br>hh:mm:ss")
                dom_writeTime.innerHTML = time;
            }
        }


        /**
         * 純文字
         * @param _path 
         */
        async function openTxt(fileInfo2: FileInfo2) {

            let _path = fileInfo2.Path;

            setShowType(GroupType.txt);//改變顯示類型
            dom_txtview.value = await WV_File.GetText(_path);

            //檔案類型
            let dom_type = getToolsDom(GroupType.txt)?.querySelector(`[data-name="infoType"]`);
            if (dom_type != null) {
                let fileType = Lib.GetFileType(fileInfo2).toLocaleUpperCase();;
                let fileLength = getFileLength(fileInfo2.Lenght);
                dom_type.innerHTML = `${fileType}<br>${fileLength}`;
            }

            //檔案修改時間
            let dom_writeTime = getToolsDom(GroupType.txt)?.querySelector(`[data-name="infoWriteTime"]`);
            if (dom_writeTime != null) {
                let timeUtc = fileInfo2.LastWriteTimeUtc;
                let time = new Date(timeUtc).format("yyyy-MM-dd<br>hh:mm:ss")
                dom_writeTime.innerHTML = time;
            }
        }

        /**
         * 起始畫面
         */
        async function openWelcome() {
            baseWindow.setTitle("Tiefsee 4");
            setShowType(GroupType.welcome);//改變顯示類型
        }


        /**
         * 不顯示任何東西
         */
        function openNone() {
            baseWindow.setTitle("Tiefsee 4");
            setShowType(GroupType.none);//改變顯示類型
        }


        /**
         * 取得檔案的大小的文字
         * @param path 
         * @returns 
         */
        function getFileLength(len: number) {

            //let len = await WV_File.GetFileInfo(path).Length;

            if (len / 1024 < 1) {
                return len.toFixed(1) + " B";

            } else if (len / (1024 * 1024) < 1) {
                return (len / (1024)).toFixed(1) + " KB";
            } else if (len / (1024 * 1024 * 1024) < 1) {
                return (len / (1024 * 1024)).toFixed(1) + " MB";
            }

            return (len / (1024 * 1024 * 1024)).toFixed(1) + " GB";
        }




    }

}