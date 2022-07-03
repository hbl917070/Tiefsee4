class ImgSearch {


    constructor(M: MainWindow) {

        let arData = [
            { name: "sauceNAO", icon: "./img/imgSearch/saucenao.png", url: "https://saucenao.com/search.php?db=999&url={url}" },
            { name: "Yandex", icon: "./img/imgSearch/yandex.png", url: "https://yandex.com/images/search?rpt=imageview&url={url}" },
            { name: "Google", icon: "./img/imgSearch/google.png", url: "https://www.google.com/searchbyimage?image_url={url}" },
            { name: "Ascii2d", icon: "./img/imgSearch/ascii2d.png", url: "https://ascii2d.net/search/url/{url}" },
            { name: "Bing", icon: "./img/imgSearch/bing.png", url: "https://www.bing.com/images/search?view=detailv2&iss=sbi&FORM=SBIIDP&sbisrc=UrlPaste&idpbck=1&q=imgurl:{url}" },
            { name: "IQDB", icon: "./img/imgSearch/iqdb.png", url: "https://iqdb.org/?url={url}" },
        ];

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
                    console.log(imgUrl)
                    WV_RunApp.OpenUrl(imgSearchUrl)
                };
                dom_menuImgSearch?.append(dom);
            }

        }




        async function getWebUrl() {

            //壓縮圖片
            let max = 1000;//圖片最大面積不可以超過這個值的平方
            let w = M.fileShow.tieefseeview.getOriginalWidth();
            let h = M.fileShow.tieefseeview.getOriginalHeight();
            let zoom = 1;
            if (w * h > max * max) {
                zoom = Math.sqrt((max * max) / (w * h));
            }

            let blob = await M.fileShow.tieefseeview.getCanvasBlob(zoom, "medium", "jpg");
            if (blob === null) { return ""; }

            let json = await updateThumbsnap(blob);
            if (json.status != 200) {
                return "";
            }
            let url = json.data.media as string;
            return url;
        }


        async function updateThumbsnap(blob: Blob) {

            var formData = new FormData();
            formData.append("key", "00001bfd3de40a19b62672faeb3fa564");
            formData.append("media", blob, 'aa.jpg');

            let json: any;
            await fetch(`https://thumbsnap.com/api/upload`, {
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
