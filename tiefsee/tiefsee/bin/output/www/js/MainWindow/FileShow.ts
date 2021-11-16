

class FileShow {


    public openImage;
    public openPdf;
    public openTxt;
    public openWelcome;

    public view_image;
    public dom_image;

    constructor(M: MainWindow) {

        var view_image: Tieefseeview = new Tieefseeview(<HTMLDivElement>document.querySelector("#main-tiefseeview"));
        var dom_image = <HTMLDivElement>document.querySelector("#main-tiefseeview")
        var dom_pdfview = <HTMLDivElement>document.querySelector("#main-pdfview")
        var dom_txtview = <HTMLTextAreaElement>document.querySelector("#main-txtview")
        var dom_welcomeview = <HTMLDivElement>document.querySelector("#main-welcomeview")



        this.openImage = openImage;
        this.openPdf = openPdf;
        this.openTxt = openTxt;
        this.openWelcome = openWelcome;

        this.dom_image = dom_image;
        this.view_image = view_image;

        //openImage("https://wall.bahamut.com.tw/B/40/5328257e8d00594e61f8b815d505cab3_4080425.JPG")


        function setShowType(groupType: string) {

            if (groupType === GroupType.img) {
                dom_image.style.display = "block";
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
                dom_image.style.display = "none";
                dom_pdfview.style.display = "none";
                dom_txtview.style.display = "block";
                dom_welcomeview.style.display = "none";

                dom_pdfview.setAttribute("src", "");
                //dom_txtview.value = "";
                view_image.loadNone();
                return;
            }

            if (groupType === GroupType.pdf) {
                dom_image.style.display = "none";
                dom_pdfview.style.display = "block";
                dom_txtview.style.display = "none";
                dom_welcomeview.style.display = "none";

                //dom_pdfview.setAttribute("src", "");
                dom_txtview.value = "";
                view_image.loadNone();
                return;
            }

            if (groupType === GroupType.welcome) {
                dom_image.style.display = "none";
                dom_pdfview.style.display = "none";
                dom_txtview.style.display = "none";
                dom_welcomeview.style.display = "flex";

                dom_pdfview.setAttribute("src", "");
                dom_txtview.value = "";
                view_image.loadNone();
                return;
            }
        }


        /**
         * 
         * @param _path 
         */
        async function openImage(_path: string) {

            setShowType(GroupType.img);//改變顯示類型

            let imgurl = _path;//圖片網址
            if (await WV_File.Exists(_path) === true) {
                imgurl = "/api/getimg/" + encodeURIComponent(_path);
            }

            //await view_image.loadImg(imgurl);
            view_image.setLoading(true);

            await view_image.getIsLoaded(imgurl);//預載入
            if (view_image.getOriginalWidth() * view_image.getOriginalHeight() > 2000 * 2000) {
                await view_image.loadBigimg(imgurl);
            } else {
                await view_image.loadImg(imgurl);
            }

            view_image.setLoading(false);

            view_image.transformRefresh(false)
            view_image.zoomFull(TieefseeviewZoomType['full-100%']);


            //圖片長寬
            let dom_size = M.dom_tools.querySelector(`[data-name="infoSize"]`);
            if (dom_size != null) {
                dom_size.innerHTML = `${view_image.getOriginalWidth()}<br>${view_image.getOriginalHeight()}`;
            }

            if (await WV_File.Exists(_path) === true) {
                //檔案類型
                let dom_type = M.dom_tools.querySelector(`[data-name="infoType"]`);
                if (dom_type != null) {
                    let fileType = (await M.config.getFileType(_path)).toLocaleUpperCase();
                    let fileLength = await getFileLength(_path);
                    dom_type.innerHTML = `${fileType}<br>${fileLength}`;
                }

                //檔案修改時間
                let dom_writeTime = M.dom_tools.querySelector(`[data-name="infoWriteTime"]`);
                if (dom_writeTime != null) {
                    let timeUtc = await WV_File.GetLastWriteTimeUtc(_path);
                    let time = new Date(timeUtc).format("yyyy-MM-dd<br>hh:mm:ss")
                    dom_writeTime.innerHTML = time;
                }
            }

            view_image.setEventChangeZoom(((ratio: number) => {

                let dom_btnScale = M.dom_tools.querySelector(`[data-name="btnScale"]`);
                if (dom_btnScale != null) {
                    dom_btnScale.innerHTML = (ratio * 100).toFixed(0) + "%";
                }

                //$('#output-overflow').html(`水平：${view_image.getIsOverflowX()}  垂直：${view_image.getIsOverflowY()}`);

            }))

        }



        /**
         * 
         * @param _url 
         */
        async function openPdf(_url: string) {
            setShowType(GroupType.pdf);//改變顯示類型
            dom_pdfview.setAttribute("src", _url);
        }


        /**
         * 
         * @param path 
         */
        async function openTxt(path: string) {
            setShowType(GroupType.txt);//改變顯示類型
            dom_txtview.value = await WV_File.GetText(path);
        }

        /**
         * 
         */
        async function openWelcome() {
            setShowType(GroupType.welcome);//改變顯示類型
        }


        /**
         * 取得檔案的大小的文字
         * @param path 
         * @returns 
         */
        async function getFileLength(path: string) {

            let len = await WV_File.GetFileInfo(path).Length;

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