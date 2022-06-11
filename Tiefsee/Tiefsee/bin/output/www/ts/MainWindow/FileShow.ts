class FileShow {

    public openImage;
    public openVideo;
    public openPdf;
    public openTxt;
    public openWelcome;
    public openNone;
    public getIsLoaded;
    public getGroupType;

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
        var _groupType = GroupType.none;//目前顯示的類型

        this.openImage = openImage;
        this.openVideo = openVideo;
        this.openPdf = openPdf;
        this.openTxt = openTxt;
        this.openWelcome = openWelcome;
        this.openNone = openNone;
        this.getIsLoaded = getIsLoaded;
        this.getGroupType = getGroupType;
        this.dom_welcomeview = dom_welcomeview;
        this.dom_imgview = dom_imgview;
        this.tieefseeview = tieefseeview;


        /** 
         * 取得 目前顯示的類型
         */
        function getGroupType() { return _groupType }


        /**
         * 
         * @param groupType 
         * @returns 
         */
        function setShowType(groupType: string) {

            _groupType = groupType;

            let arToolsGroup = document.querySelectorAll(".main-tools-group");
            for (let i = 0; i < arToolsGroup.length; i++) {
                const item = arToolsGroup[i];
                item.setAttribute("active", "");
            }

            if (groupType === GroupType.none) {

                //更換工具列
                getToolsDom(GroupType.none)?.setAttribute("active", "true");

                M.mainFileList.setHide(true);//暫時隱藏 檔案預覽列表
                M.mainDirList.setHide(true);//暫時隱藏 資料夾預覽列表

                dom_imgview.style.display = "none";
                dom_pdfview.style.display = "none";
                dom_txtview.style.display = "none";
                dom_welcomeview.style.display = "none";

                dom_pdfview.setAttribute("src", "");
                dom_txtview.value = "";
                tieefseeview.loadNone();
                return;
            }

            if (groupType === GroupType.welcome) {

                //更換工具列
                getToolsDom(GroupType.welcome)?.setAttribute("active", "true");

                M.mainFileList.setHide(true);//暫時隱藏 檔案預覽列表
                M.mainDirList.setHide(true);//暫時隱藏 資料夾預覽列表

                dom_imgview.style.display = "none";
                dom_pdfview.style.display = "none";
                dom_txtview.style.display = "none";
                dom_welcomeview.style.display = "flex";

                dom_pdfview.setAttribute("src", "");
                dom_txtview.value = "";
                tieefseeview.loadNone();
                return;
            }

            if (groupType === GroupType.img || groupType === GroupType.video) {

                //更換工具列
                getToolsDom(GroupType.img)?.setAttribute("active", "true");

                M.mainFileList.setHide(false);//解除隱藏 檔案預覽列表
                M.mainDirList.setHide(false);//解除隱藏 資料夾預覽列表

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

                M.mainFileList.setHide(false);//解除隱藏 檔案預覽列表
                M.mainDirList.setHide(false);//解除隱藏 資料夾預覽列表

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

                M.mainFileList.setHide(false);//解除隱藏 檔案預覽列表
                M.mainDirList.setHide(false);//解除隱藏 資料夾預覽列表

                dom_imgview.style.display = "none";
                dom_pdfview.style.display = "block";
                dom_txtview.style.display = "none";
                dom_welcomeview.style.display = "none";

                //dom_pdfview.setAttribute("src", "");
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
         * 取得圖片網址並且預載入
         */
        /*async function loadImage(fileInfo2: FileInfo2) {

            let _path = fileInfo2.Path;
            let encodePath = encodeURIComponent(_path);
            let fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
            let imgurl = _path;//圖片網址

            let imgType = Lib.GetFileType(fileInfo2);//取得檔案類型
            let fileItem = M.config.getAllowFileTypeItem(GroupType.img, imgType);// ex. { ext: "avif", type: ["wpf", "magick"] }
            let loadOk = false;
            if (fileItem !== null) {
                let arType = fileItem.type;//ex. ["wpf", "magick"]
                for (let i = 0; i < arType.length; i++) {
                    const type = arType[i];
                    imgurl = await getUrl(type);

                    loadOk = await tieefseeview.preloadImg(imgurl);//預載入
                    if (loadOk) {//如果載入失敗就使用下一種模式來解析
                        break;
                    }
                }
            } else {
                imgurl = await getUrl("magick");
                loadOk = await tieefseeview.preloadImg(imgurl);//預載入
            }

            //如果都載入失敗，就顯示檔案的圖示
            if (loadOk == false) {
                imgurl = await getUrl("icon")
                await tieefseeview.preloadImg(imgurl);//預載入
            }

            return imgurl;
        }*/



        /**
         * 載入圖片
         * @param _path 
         */
        async function openImage(fileInfo2: FileInfo2) {

            isLoaded = false;
            let _path = fileInfo2.Path;
            setShowType(GroupType.img);//改變顯示類型
            let imgurl = _path;//圖片網址

            tieefseeview.setLoading(true, 200);

            let encodePath = encodeURIComponent(_path);
            let fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;

            let fileType = Lib.GetFileType(fileInfo2);//取得檔案類型
            let configItem = M.config.getAllowFileTypeItem(GroupType.img, fileType);// ex. { ext:"psd", type:"magick" }
            if (configItem == undefined) {
                configItem = { ext: "", type: "vips", vipsType: "magick" }
            }
            let configType = configItem.type;

            async function getUrl(type: string) {
                if (type === "web") {
                    return Lib.pathToURL(_path) + `?${fileTime}`;
                }
                if (type === "webIcc") {
                    return APIURL + `/api/getImg/webIcc?path=${encodePath}&${fileTime}`
                }
                if (type === "icon") {
                    return APIURL + "/api/getFileIcon?size=256&path=" + encodeURIComponent(_path)
                }
                if (type === "wpf") {
                    return APIURL + `/api/getImg/wpf?path=${encodePath}&${fileTime}`
                }
                if (type === "magick" || type === "magickBmp") {
                    return APIURL + `/api/getImg/magick?type=bmp&path=${encodePath}&${fileTime}`
                }
                if (type === "magickPng") {
                    return APIURL + `/api/getImg/magick?type=png&path=${encodePath}&${fileTime}`
                }
                if (type === "dcraw") {
                    return APIURL + `/api/getImg/dcraw?path=${encodePath}&${fileTime}`
                }
                if (type === "nconvert" || type === "nconvertBmp") {
                    let url = APIURL + `/api/getImg/nconvert?type=bmp&path=${encodePath}&${fileTime}`
                    url = Lib.pathToURL(await fetchGet_text(url));
                    return url;
                }
                if (type === "nconvertPng") {
                    let url = APIURL + `/api/getImg/nconvert?type=png&path=${encodePath}&${fileTime}`
                    url = Lib.pathToURL(await fetchGet_text(url));
                    return url;
                }
                return APIURL + `/api/getImg/magick?path=${encodePath}&${fileTime}`
            }


            if (Lib.IsAnimation(fileInfo2) === true) {//判斷是否為動圖

                imgurl = await getUrl("web");//取得圖片網址並且預載入
                await tieefseeview.loadImg(imgurl);//使用<img>渲染

            } else if (configType === "vips") {//

                let encodePath = encodeURIComponent(_path);
                let fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
                let vipsType = configItem.vipsType;
                let u = APIURL + `/api/vips/init?path=${encodePath}&type=${vipsType}&${fileTime}`

                let imgInitInfo = await fetchGet_json(u);
                console.log(imgInitInfo);

                if (imgInitInfo.code == 1) {

                    //設定縮放的比例
                    let arUrl: { scale: number, url: string }[] = [];
                    arUrl.push({ scale: 1, url: imgInitInfo.path + `?${fileTime}` })
                    for (let i = 1; i <= 10; i++) {
                        let scale = Number(Math.pow(0.7, i).toFixed(3));
                        if (imgInitInfo.width * scale < 600 || imgInitInfo.height * scale < 600) {//如果圖片太小就不處理
                            break;
                        }
                        let imgU = APIURL + `/api/vips/resize?path=${encodePath}&scale=${scale}&${fileTime}`
                        arUrl.push({ scale: scale, url: imgU })
                    }

                    await tieefseeview.loadBigimgscale(
                        arUrl,
                        imgInitInfo.width, imgInitInfo.height,
                        TieefseeviewZoomType["full-100%"]
                    );

                } else {//載入失敗就顯示圖示

                    imgurl = await getUrl("icon");//取得圖片網址
                    await tieefseeview.loadBigimg(imgurl);//使用<canvas>渲染

                }

            } else {//使用<canvas>直接開啟網址

                imgurl = await getUrl(configType);//取得圖片網址
                let loadOk = await tieefseeview.preloadImg(imgurl);//預載入
                if (loadOk) {
                    await tieefseeview.loadBigimg(imgurl);//使用<canvas>渲染
                } else {//載入失敗就顯示圖示
                    imgurl = await getUrl("icon");//取得圖片網址
                    await tieefseeview.loadBigimg(imgurl);//使用<canvas>渲染
                }

            }

            initTiefseeview(fileInfo2);
            isLoaded = true;
        }


        /**
         * 載入影片
         * @param _path 
         */
        async function openVideo(fileInfo2: FileInfo2) {

            isLoaded = false;
            let _path = fileInfo2.Path;
            setShowType(GroupType.video);//改變顯示類型
            let imgurl = _path;//圖片網址

            if (M.fileLoad.getGroupType() === GroupType.unknown) {//如果是未知的類型
                imgurl = await WV_Image.GetFileIcon(_path, 256);//取得檔案總管的圖示
            } else {
                //imgurl = APIURL + "/api/getImg/" + encodeURIComponent(_path) + `?LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
                imgurl = Lib.pathToURL(_path) + `?LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
            }

            tieefseeview.setLoading(true, 200);
            await tieefseeview.preloadImg(imgurl);//預載入
            await tieefseeview.loadVideo(imgurl);//使用video渲染

            initTiefseeview(fileInfo2);
            isLoaded = true;
        }

        /**
         * 
         * @param fileInfo2 
         */
        async function initTiefseeview(fileInfo2: FileInfo2) {
            tieefseeview.setLoading(false);
            await tieefseeview.transformRefresh(false);//初始化 旋轉、鏡像
            tieefseeview.setEventChangeZoom(((ratio: number) => {
                let txt = (ratio * 100).toFixed(0) + "%"

                let dom_btnScale = M.dom_tools.querySelector(`[data-name="btnScale"]`);//工具列
                if (dom_btnScale !== null) { dom_btnScale.innerHTML = txt; }

                M.initMenu.updateRightMenuImageZoomRatioTxt(txt);//更新 右鍵選單的圖片縮放比例
            }))
            tieefseeview.zoomFull(TieefseeviewZoomType["full-100%"]);

            //圖片長寬
            let dom_size = getToolsDom(GroupType.img)?.querySelector(`[data-name="infoSize"]`);
            if (dom_size != null) {
                dom_size.innerHTML = `${tieefseeview.getOriginalWidth()}<br>${tieefseeview.getOriginalHeight()}`;
            }

            //檔案類型
            let dom_type = getToolsDom(GroupType.img)?.querySelector(`[data-name="infoType"]`);
            if (dom_type != null) {
                let fileType = Lib.GetFileType(fileInfo2);
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
        }


        /**
         * pdf 或 ai
         * @param _url 
         */
        async function openPdf(fileInfo2: FileInfo2) {

            let _path = fileInfo2.Path;

            setShowType(GroupType.pdf);//改變顯示類型

            let fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
            let encodePath = encodeURIComponent(_path);
            let _url = `${APIURL}/api/getPdf?path=${encodePath}&${fileTime}`
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