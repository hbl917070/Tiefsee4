class ImgSearch {

    constructor(M: MainWindow) {

        let arData = M.config.imgSearch.list;

        initMenu();

        function initMenu() {

            let domMenu = document.getElementById("menu-imgSearch") as HTMLElement;
            var domMenuList = document.getElementById("menu-imgSearch-list") as HTMLElement;

            function getPath() {
                let path = domMenu.getAttribute("data-path");
                if (path !== null && path !== "") {
                    return path;
                } else {
                    return M.fileLoad.getFilePath();
                }
            }

            for (let i = 0; i < arData.length; i++) {

                const item = arData[i];
                let name = item.name; // 顯示的名稱
                let icon = item.icon; // 圖示
                let url = item.url;

                let dom = Lib.newDom(`
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
                        let imgSearchUrl = await googleSearch(getPath());
                        if (imgSearchUrl === "") {
                            M.msgbox.show({ txt: M.i18n.t("msg.imageSearchFailed") }); // 圖片搜尋失敗
                            return;
                        }
                        WV_RunApp.OpenUrl(imgSearchUrl);

                    } else {
                        let imgUrl = await getWebUrl(getPath());
                        if (imgUrl === "") {
                            M.msgbox.show({ txt: M.i18n.t("msg.imageSearchFailed") }); // 圖片搜尋失敗
                            return;
                        }
                        let imgSearchUrl = url.replace("{url}", imgUrl);
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
            let max = 1000; // 圖片最大面積不可以超過這個值的平方
            let blob: Blob | null;
            if (M.fileLoad.getIsBulkView() === false && path === M.fileLoad.getFilePath()) {
                let w = M.fileShow.tiefseeview.getOriginalWidth();
                let h = M.fileShow.tiefseeview.getOriginalHeight();
                let zoom = 1;
                if (w * h > max * max) {
                    zoom = Math.sqrt((max * max) / (w * h));
                }
                blob = await M.fileShow.tiefseeview.getCanvasBlob(zoom, "medium", "jpg");

            } else {

                let fileInfo2 = await WebAPI.getFileInfo2(path);
                let imgData = await M.script.img.getImgData(fileInfo2);
                let w = imgData.width;
                let h = imgData.height;
                let zoom = 1;
                if (w * h > max * max) {
                    zoom = Math.sqrt((max * max) / (w * h));
                }
                let imtUrl = imgData.arUrl[0].url;
                let p = await M.script.img.preloadImg(imtUrl);
                if (p === false) {
                    console.log("搜圖失敗。無法載入圖片");
                    return null;
                }
                let canvas = await M.script.img.urlToCanvas(imtUrl);
                blob = await M.script.img.getCanvasBlob(canvas, zoom, "medium", "jpg", 0.8, "#FFFFFF");
            }

            if (blob === undefined) { return null; }
            return blob;
        }

        /**
         * Google搜圖 (高機率失敗)
         */
        async function googleSearch(path: string) {

            let blob = await getBlob(path);
            if (blob === null) { return ""; }

            let formData = new FormData();
            formData.append("encoded_image", blob, "image.jpg");
            formData.append("sbisrc", "Google Chrome 110.0.5481.78 (Official) Windows");
            let rsp = await fetch("https://www.google.com/searchbyimage/upload", {
                "body": formData,
                "method": "POST",
            });

            let retUrl = "";
            if (rsp.status === 200) {
                retUrl = rsp.url;
                let q = retUrl.indexOf("?");
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

            let blob = await getBlob(path);
            if (blob === null) { return ""; }

            // 上傳圖片
            let retUrl = "";
            let imgServer = M.config.imgSearch.imgServer;
            for (let i = 0; i < imgServer.length; i++) {
                const url = imgServer[i].url;
                const timeout = imgServer[i].timeout;

                var formData = new FormData();
                formData.append("key", url);
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

            let json: any = "";
            const controller = new AbortController(); // 建立一個新的中止控制器    
            const signal = controller.signal;
            const timeoutId = setTimeout(() => controller.abort(), timeout); // 設定5秒後取消fetch()請求

            try {
                await fetch(imgServer, {
                    "body": formData,
                    "method": "POST",
                    signal,
                }).then((response) => {
                    return response.json();
                }).then((html) => {
                    json = html;
                })
            } catch (error) {
                json = "";
            } finally {
                clearTimeout(timeoutId); // 清除 timeoutId 以防止記憶體洩漏
            }

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
