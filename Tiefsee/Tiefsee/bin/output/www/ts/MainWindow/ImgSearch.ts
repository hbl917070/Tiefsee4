class ImgSearch {


    constructor(M: MainWindow) {

        let arData = M.config.settings.imgSearch.list;

        initMenu()

        function initMenu() {

            var dom_menuImgSearch = document.getElementById("menu-imgSearch-list");

            for (let i = 0; i < arData.length; i++) {

                const item = arData[i];
                let name = item.name;//顯示的名稱
                let icon = item.icon;//圖示
                let url = item.url;

                let dom = newDiv(`
                    <div class="menu-hor-item">
                        <div class="menu-hor-icon">
                            <img src="${icon}">
                        </div>
                        <div class="menu-hor-txt" i18n="">${name}</div>
                    </div>
                `);

                dom.onclick = async () => {
                    //let filePath = M.fileLoad.getFilePath();//目前顯示的檔案
                    //if (await WV_File.Exists(filePath) === false) { return; }
                    M.menu.close();//關閉menu

                    let imgUrl = await getWebUrl();
                    if (imgUrl == "") {
                        alert("error");
                        return;
                    }
                    let imgSearchUrl = url.replace("{url}", imgUrl);
                    WV_RunApp.OpenUrl(imgSearchUrl)
                };
                dom_menuImgSearch?.append(dom);
            }

        }


        /**
         * 把當前的圖片壓縮後上傳到伺服器，取得圖片的網址
         * @returns 
         */
        async function getWebUrl() {

            //壓縮圖片
            let max = 1000;//圖片最大面積不可以超過這個值的平方
            let w = M.fileShow.tiefseeview.getOriginalWidth();
            let h = M.fileShow.tiefseeview.getOriginalHeight();
            let zoom = 1;
            if (w * h > max * max) {
                zoom = Math.sqrt((max * max) / (w * h));
            }

            let blob = await M.fileShow.tiefseeview.getCanvasBlob(zoom, "medium", "jpg");
            if (blob === null) { return ""; }

            let json = await updateThumbsnap(blob);
            if (json.status != 200) {
                return "";
            }
            let url = json.data.media as string;
            return url;
        }

        /**
         * 上傳檔案
         * @param blob 
         * @returns 
         */
        async function updateThumbsnap(blob: Blob) {

            let imgServer = M.config.settings.imgSearch.imgServer;//圖片伺服器的網址
            let imgServerKey = M.config.settings.imgSearch.imgServerKey;//api key

            var formData = new FormData();
            formData.append("key", imgServerKey);
            formData.append("media", blob, "aa.jpg");

            let json: any;
            await fetch(imgServer, {
                "body": formData,
                "method": "POST",
            }).then((response) => {
                return response.json();
            }).then((html) => {
                json = html;
                //console.log(html);
            }).catch((err) => {
                console.log('錯誤:', err);
            });

            return json;
        }

    }
}
