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

    public iframes;

    constructor(M: MainWindow) {

        var dom_imgview = document.querySelector("#mView-tiefseeview") as HTMLDivElement;
        var dom_pdfview = document.querySelector("#mView-pdf") as HTMLIFrameElement;
        var dom_txtview = document.querySelector("#mView-txt") as HTMLTextAreaElement;
        var dom_welcomeview = document.querySelector("#mView-welcome") as HTMLDivElement;

        var tieefseeview: Tieefseeview = new Tieefseeview(dom_imgview);

        var iframes = new Iframes(M);
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

        this.iframes = iframes;
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


            if (groupType === GroupType.none || groupType === GroupType.welcome) {
                M.mainFileList.setHide(true);//暫時隱藏 檔案預覽列表
                M.mainDirList.setHide(true);//暫時隱藏 資料夾預覽列表
                M.mainExif.setHide(true);//暫時隱藏 詳細資料視窗
                M.largeBtn.setHide(true);//暫時隱藏 大型切換按鈕
            } else if (groupType === GroupType.img || groupType === GroupType.imgs || groupType === GroupType.video) {
                M.mainFileList.setHide(false);//解除隱藏 檔案預覽列表
                M.mainDirList.setHide(false);//解除隱藏 資料夾預覽列表
                M.mainExif.setHide(false);//解除隱藏 詳細資料視窗
                M.largeBtn.setHide(false);//解除隱藏 大型切換按鈕
            } else {
                M.mainFileList.setHide(false);//解除隱藏 檔案預覽列表
                M.mainDirList.setHide(false);//解除隱藏 資料夾預覽列表
                M.mainExif.setHide(false);//解除隱藏 詳細資料視窗
                M.largeBtn.setHide(true);//暫時隱藏 大型切換按鈕
            }


            if (groupType === GroupType.none) {
                setShowTools(GroupType.none); //更換工具列
            }

            if (groupType === GroupType.welcome) {
                setShowTools(GroupType.welcome);
                dom_welcomeview.style.display = "flex";
            } else {
                dom_welcomeview.style.display = "none";
            }

            if (groupType === GroupType.img || groupType === GroupType.video) {
                setShowTools(GroupType.img);
                dom_imgview.style.display = "block";
            } else {
                dom_imgview.style.display = "none";
                tieefseeview.loadNone();
            }

            if (groupType === GroupType.imgs) {
            }

            if (groupType === GroupType.txt) {
                setShowTools(GroupType.txt);
                dom_txtview.style.display = "block";
            } else {
                dom_txtview.style.display = "none";
                dom_txtview.value = "";
            }

            if (groupType === GroupType.monacoEditor) {
                setShowTools(GroupType.txt);
                iframes.monacoEditor.visible(true);
            } else {
                iframes.monacoEditor.visible(false);
                iframes.monacoEditor.loadNone();
            }

            if (groupType === GroupType.pdf) {
                setShowTools(GroupType.pdf);
                dom_pdfview.style.display = "block";
            } else {
                dom_pdfview.setAttribute("src", "");
                dom_pdfview.style.display = "none";
            }

            if (groupType === GroupType.office) {
                setShowTools(GroupType.pdf);
                iframes.pDFTronWebviewer.visible(true);
            } else {
                iframes.pDFTronWebviewer.loadNone();
                iframes.pDFTronWebviewer.visible(false);
            }

            if (groupType === GroupType.md) {
                setShowTools(GroupType.txt);
                iframes.cherryMarkdown.visible(true);
            } else {
                iframes.cherryMarkdown.visible(false);
                iframes.cherryMarkdown.loadNone();
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


        /**
         * 更換工具列
         * @param type 
         */
        function setShowTools(type: string) {
            let arToolsGroup = document.querySelectorAll(".main-tools-group");
            for (let i = 0; i < arToolsGroup.length; i++) {
                const item = arToolsGroup[i];
                item.setAttribute("active", "");
            }

            getToolsDom(type)?.setAttribute("active", "true"); //更換工具列
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
            if (configItem === null) {
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

                if (imgInitInfo.code == 1) {

                    let ratio = Number(M.config.settings.image.tiefseeviewBigimgscaleRatio);
                    if (isNaN(ratio)) { ratio = 0.8; }
                    if (ratio > 0.95) { ratio = 0.95; }
                    if (ratio < 0.5) { ratio = 0.5; }

                    //設定縮放的比例
                    let arUrl: { scale: number, url: string }[] = [];
                    arUrl.push({ scale: 1, url: Lib.pathToURL(imgInitInfo.path) + `?${fileTime}` });

                    for (let i = 1; i <= 30; i++) {
                        let scale = Number(Math.pow(ratio, i).toFixed(3));
                        if (imgInitInfo.width * scale < 300 || imgInitInfo.height * scale < 300) {//如果圖片太小就不處理
                            break;
                        }
                        let imgU = APIURL + `/api/vips/resize?path=${encodePath}&scale=${scale}&${fileTime}`
                        arUrl.push({ scale: scale, url: imgU })
                    }

                    //縮放方式與對齊方式
                    let _zoomType: TieefseeviewZoomType = (<any>TieefseeviewZoomType)[M.config.settings.image.tieefseeviewZoomType];
                    let _zoomVal: number = M.config.settings.image.tieefseeviewZoomValue;
                    //let _alignType: TieefseeviewAlignType = (<any>TieefseeviewAlignType)[M.config.settings.image.tieefseeviewAlignType];
                    if (_zoomType === undefined) { _zoomType = TieefseeviewZoomType["full-100%"] }
                    //if (_alignType === undefined) { _alignType = TieefseeviewAlignType["C"] }

                    await tieefseeview.loadBigimgscale(
                        arUrl,
                        imgInitInfo.width, imgInitInfo.height,
                        _zoomType, _zoomVal
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

            M.mainExif.init(fileInfo2);//初始化exif

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

            M.mainExif.init(fileInfo2);//初始化exif

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

            //縮放方式與對齊方式
            let _zoomType: TieefseeviewZoomType = (<any>TieefseeviewZoomType)[M.config.settings.image.tieefseeviewZoomType];
            let _zoomVal: number = M.config.settings.image.tieefseeviewZoomValue;
            let _alignType: TieefseeviewAlignType = (<any>TieefseeviewAlignType)[M.config.settings.image.tieefseeviewAlignType];
            if (_zoomType === undefined) { _zoomType = TieefseeviewZoomType["full-100%"] }
            if (_alignType === undefined) { _alignType = TieefseeviewAlignType["C"] }
            tieefseeview.zoomFull(_zoomType, _zoomVal);
            tieefseeview.setAlign(_alignType);

            //圖片長寬
            let dom_size = getToolsDom(GroupType.img)?.querySelector(`[data-name="infoSize"]`);
            if (dom_size != null) {
                dom_size.innerHTML = `${tieefseeview.getOriginalWidth()}<br>${tieefseeview.getOriginalHeight()}`;
            }

            //檔案類型
            let dom_type = getToolsDom(GroupType.img)?.querySelector(`[data-name="infoType"]`);
            if (dom_type != null) {
                let fileType = Lib.GetFileType(fileInfo2);
                let fileLength = Lib.getFileLength(fileInfo2.Lenght);
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
         */
        async function openPdf(fileInfo2: FileInfo2) {

            let _path = fileInfo2.Path;

            let fileType = Lib.GetFileType(fileInfo2);//取得檔案類型
            let configItem = M.config.getAllowFileTypeItem(GroupType.pdf, fileType);// ex. { ext:"psd", type:"magick" }
            if (configItem == undefined) {
                configItem = { ext: "", type: "pdf" }
            }
            let configType = configItem.type;

            if (configType == "pdf") {
                setShowType(GroupType.pdf);//改變顯示類型

                let fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
                let encodePath = encodeURIComponent(_path);
                let _url = `${APIURL}/api/getPdf?path=${encodePath}&${fileTime}`
                dom_pdfview.setAttribute("src", _url);
            }

            if (configType == "PDFTronWebviewer") {

                setShowType(GroupType.office);//改變顯示類型
                iframes.setTheme();
                await iframes.pDFTronWebviewer.load(_path);
            }


            //檔案類型
            let dom_type = getToolsDom(GroupType.pdf)?.querySelector(`[data-name="infoType"]`);
            if (dom_type != null) {
                let fileType = Lib.GetFileType(fileInfo2).toLocaleUpperCase();
                let fileLength = Lib.getFileLength(fileInfo2.Lenght);
                dom_type.innerHTML = `${fileType}<br>${fileLength}`;
            }

            //檔案修改時間
            let dom_writeTime = getToolsDom(GroupType.pdf)?.querySelector(`[data-name="infoWriteTime"]`);
            if (dom_writeTime != null) {
                let timeUtc = fileInfo2.LastWriteTimeUtc;
                let time = new Date(timeUtc).format("yyyy-MM-dd<br>hh:mm:ss")
                dom_writeTime.innerHTML = time;
            }

            M.mainExif.init(fileInfo2);//初始化exif
        }


        /**
         * 純文字
         */
        async function openTxt(fileInfo2: FileInfo2) {

            let _path = fileInfo2.Path;

            let fileType = Lib.GetFileType(fileInfo2);//取得檔案類型
            let configItem = M.config.getAllowFileTypeItem(GroupType.txt, fileType);// ex. { ext:"psd", type:"magick" }
            if (configItem == undefined) {
                configItem = { ext: "", type: "auto" }
            }
            let configType = configItem.type;

            if (baseWindow.appInfo === undefined) { return; }

            let txt = await WV_File.GetText(_path);


            if (configType === "md") {

                setShowType(GroupType.md);//改變顯示類型
                iframes.setTheme();
                let dir = Lib.GetDirectoryName(_path) as string;
                dir = Lib.pathToURL(dir) + "/";
                await iframes.cherryMarkdown.setReadonly(M.getIsQuickLook());
                await iframes.cherryMarkdown.loadFile(txt, dir);

            } else if (baseWindow.appInfo.plugin.MonacoEditor) {

                setShowType(GroupType.monacoEditor);//改變顯示類型
                iframes.setTheme();
                await iframes.monacoEditor.setReadonly(M.getIsQuickLook());
                if (configType == "auto") {
                    await iframes.monacoEditor.loadFile(txt, _path);
                } else {
                    await iframes.monacoEditor.loadTxt(txt, configType);
                }

            } else {

                setShowType(GroupType.txt);//改變顯示類型
                iframes.setTheme();
                dom_txtview.value = await WV_File.GetText(_path);
                dom_txtview.scrollTo(0, 0);//捲到最上面
            }

            //檔案類型
            let dom_type = getToolsDom(GroupType.txt)?.querySelector(`[data-name="infoType"]`);
            if (dom_type != null) {
                let fileType = Lib.GetFileType(fileInfo2).toLocaleUpperCase();;
                let fileLength = Lib.getFileLength(fileInfo2.Lenght);
                dom_type.innerHTML = `${fileType}<br>${fileLength}`;
            }

            //檔案修改時間
            let dom_writeTime = getToolsDom(GroupType.txt)?.querySelector(`[data-name="infoWriteTime"]`);
            if (dom_writeTime != null) {
                let timeUtc = fileInfo2.LastWriteTimeUtc;
                let time = new Date(timeUtc).format("yyyy-MM-dd<br>hh:mm:ss")
                dom_writeTime.innerHTML = time;
            }

            M.mainExif.init(fileInfo2);//初始化exif
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


    }
}

