class ImgSearch {

    constructor(M: MainWindow) {

        const _arData = M.config.imgSearch.list;

        initMenu();

        function initMenu() {

            const domMenu = document.getElementById("menu-imgSearch") as HTMLElement;
            const domMenuList = document.getElementById("menu-imgSearch-list") as HTMLElement;

            function getPath() {
                const path = domMenu.getAttribute("data-path");
                if (path !== null && path !== "") {
                    return path;
                } else {
                    return M.fileLoad.getFilePath();
                }
            }

            for (let i = 0; i < _arData.length; i++) {

                const item = _arData[i];
                const name = item.name; // 顯示的名稱
                const icon = item.icon; // 圖示
                const url = item.url;

                const dom = Lib.newDom(`
                    <div class="menu-hor-item">
                        <div class="menu-hor-icon">
                            <img src="${icon}">
                        </div>
                        <div class="menu-hor-txt">${name}</div>
                    </div>
                `);

                dom.onclick = async () => {
                    // let filePath = M.fileLoad.getFilePath(); // 目前顯示的檔案
                    // if (await WV_File.Exists(filePath) === false) { return; }
                    M.menu.close();

                    if (url == "googleSearch") {
                        const imgSearchUrl = await googleSearch(getPath());
                        if (imgSearchUrl === "") {
                            M.msgbox.show({ txt: M.i18n.t("msg.imageSearchFailed") }); // 圖片搜尋失敗
                            return;
                        }
                        WV_RunApp.OpenUrl(imgSearchUrl);

                    } else {
                        const imgUrl = await getWebUrl(getPath());
                        if (imgUrl === "") {
                            M.msgbox.show({ txt: M.i18n.t("msg.imageSearchFailed") }); // 圖片搜尋失敗
                            return;
                        }
                        const imgSearchUrl = url.replace("{url}", imgUrl);
                        WV_RunApp.OpenUrl(imgSearchUrl);
                    }
                };
                domMenuList?.append(dom);
            }

        }

        /**
         * 
         * @param path 檔案路徑
         * @returns Blob
         */
        async function getBlob(path: string) {

            // 壓縮圖片
            const max = 1000; // 圖片最大面積不可以超過這個值的平方
            let blob: Blob | null;
            if (M.fileLoad.getIsBulkView() === false && path === M.fileLoad.getFilePath()) {
                const w = M.fileShow.tiefseeview.getOriginalWidth();
                const h = M.fileShow.tiefseeview.getOriginalHeight();
                let zoom = 1;
                if (w * h > max * max) {
                    zoom = Math.sqrt((max * max) / (w * h));
                }
                blob = await M.fileShow.tiefseeview.getCanvasBlob(zoom, "medium", "jpg");

            } else {

                const fileInfo2 = await WebAPI.getFileInfo2(path);
                const imgData = await M.script.img.getImgData(fileInfo2);
                const w = imgData.width;
                const h = imgData.height;
                let zoom = 1;
                if (w * h > max * max) {
                    zoom = Math.sqrt((max * max) / (w * h));
                }
                const imtUrl = imgData.arUrl[0].url;
                const p = await M.script.img.preloadImg(imtUrl);
                if (p === false) {
                    console.log("搜圖失敗。無法載入圖片");
                    return null;
                }
                const canvas = await M.script.img.urlToCanvas(imtUrl);
                blob = await M.script.img.getCanvasBlob(canvas, zoom, "medium", "jpg", 0.8, "#FFFFFF");
            }

            if (blob === undefined) { return null; }
            return blob;
        }

        /**
         * Google搜圖 (高機率失敗)
         */
        async function googleSearch(path: string) {

            const blob = await getBlob(path);
            if (blob === null) { return ""; }

            const formData = new FormData();
            formData.append("encoded_image", blob, "image.jpg");
            formData.append("sbisrc", "Google Chrome 110.0.5481.78 (Official) Windows");
            const rsp = await fetch("https://www.google.com/searchbyimage/upload", {
                "body": formData,
                "method": "POST",
            });

            let retUrl = "";
            if (rsp.status === 200) {
                retUrl = rsp.url;
                const q = retUrl.indexOf("?");
                if (q !== -1) {
                    retUrl = "https://www.google.com/search" + retUrl.substring(q);
                }
            }
            return retUrl;
        }

        /**
         * 把當前的圖片壓縮後上傳到伺服器，取得圖片的網址
         * @returns 
         */
        async function getWebUrl(path: string) {

            const blob = await getBlob(path);
            if (blob === null) { return ""; }

            // 上傳圖片
            let retUrl = "";
            const imgServer = M.config.imgSearch.imgServer;
            for (let i = 0; i < imgServer.length; i++) {
                const url = imgServer[i].url;
                const timeout = imgServer[i].timeout;

                const formData = new FormData();
                formData.append("media", blob, "image.jpg");

                retUrl = await submitPost(url, formData, timeout);
                if (retUrl !== "") { return retUrl; }
            }
            return "";
        }

        /**
         * 送出請求(上傳圖片)
         * @param imgServer 
         * @param formData 
         * @param timeout 
         * @returns 
         */
        async function submitPost(imgServer: string, formData: FormData, timeout: number) {

            const json = await WebAPI.forwardPost(imgServer, formData, timeout)

            if (json === "") { return ""; }
            if (json.status != 200) { return ""; }

            let url = json.data.media as string;
            if (url.indexOf("http:") == 0) {
                url = url.replace(/^http:\/\//i, "https://");
            }

            return url;
        }

    }
}
