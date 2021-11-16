
class MainTools {



    constructor(M: MainWindow) {

        initTools();


        //-----------------



        /**
         * 初始化 工具列
         */
        function initTools() {

            //快速拖曳
            addToolsBtn({
                group: "img",
                name: "dragDropFile",
                icon: "/img/default/tool-dragDropFile.svg",
                func: (btn) => {

                    btn.addEventListener("mousedown", (e) => {
                        if (e.button === 0) {//滑鼠左鍵
                            setTimeout(() => {
                                WV_File.DragDropFile(M.fileLoad.getFilePath())
                            }, 50);
                        }
                    });

                    btn.addEventListener("mousedown", (e) => {
                        console.log(e.button )
                        if (e.button === 2) {//滑鼠左鍵
                           WV_File.ShowContextMenu(M.fileLoad.getFilePath(),true);
                        }
                    });
                },
            });

            // 開啟檔案
            addToolsBtn({
                group: "img",
                name: "file",
                icon: "/img/default/tool-open.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.menu.open_Button(document.getElementById("menu-open"), btn, "menuActive");
                    });
                },
            });


            //上一張
            addToolsBtn({
                group: "img",
                name: "prev",
                icon: "/img/default/tool-prev.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.fileLoad.prev()
                    });
                },

            });

            //下一張
            addToolsBtn({
                group: "img",
                name: "next",
                icon: "/img/default/tool-next.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.fileLoad.next()
                    });
                },

            });

            //複製
            addToolsBtn({
                group: "img",
                name: "file",
                icon: "/img/default/tool-copy.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.menu.open_Button(document.getElementById("menu-copy"), btn, "menuActive");
                    });
                },
            });

            //刪除
            /*addToolsBtn({
                group: "img",
                name: "file",
                icon: "/img/default/tool-delete.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {

                    });
                },
            });*/

            //搜圖
            /*addToolsBtn({
                group: "img",
                name: "file",
                icon: "/img/default/tool-search.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {

                    });
                },
            });*/

            //大量瀏覽模式
            /*addToolsBtn({
                group: "img",
                name: "file",
                icon: "/img/default/tool-allBrowse.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {

                    });
                },
            });*/

            //旋轉與鏡像
            addToolsBtn({
                group: "img",
                name: "file",
                icon: "/img/default/tool-rotate.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.menu.open_Button(document.getElementById("menu-rotate"), btn, "menuActive");

                    });
                },
            });

            //全滿
            addToolsBtn({
                group: "img",
                name: "file",
                icon: "/img/default/tool-full.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.fileShow.view_image.zoomFull(TieefseeviewZoomType['full-100%']);
                    });
                },
            });



            //縮放比例
            addToolsHtml({
                group: "img",
                html: `
                <div class="main-tools-btn js-noDrag">
                    <div style="margin:0 3px; pointer-events:none;" data-name="btnScale">1%</div>
                </div>
            `,
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.fileShow.view_image.zoomFull(TieefseeviewZoomType['100%']);
                    });
                },
            });


            addToolsHr({ group: "img", });

            //圖片size
            addToolsHtml({
                group: "img",
                html: `
                <div class="main-tools-txt" data-name="infoSize">
                   100<br>200
                </div>
            `,
                func: (btn) => { },
            });

            addToolsHr({ group: "img", });

            // 檔案類型、檔案大小
            addToolsHtml({
                group: "img",
                html: `
                <div class="main-tools-txt" data-name="infoType">
                    JPG<br>123.4MB
                </div>
            `,
                func: (btn) => { },
            });

            addToolsHr({ group: "img", });

            // 檔案修改時間
            addToolsHtml({
                group: "img",
                html: `
                <div class="main-tools-txt" data-name="infoWriteTime">
                    2021
                </div>
            `,
                func: (btn) => { },
            });

        }



        /**
         * 新增 html
         * @param item 
         */
        function addToolsHtml(item: {
            group: string, html: string,
            func: (domBtn: HTMLElement) => void,
        }) {

            addToolsDom({
                group: item.group,
                dom: newDiv(item.html),
                func: item.func,
            });
        }


        /**
         * 新增 垂直線
         * @param item 
         */
        function addToolsHr(item: { group: string, }) {
            let div = newDiv(`<div class="main-tools-hr"> </div>`);
            addToolsDom({
                group: item.group,
                dom: div,
                func: () => { },
            });
        }


        /**
         * 新增 button
         * @param item 
         */
        function addToolsBtn(item: {
            group: string, name: string, icon: string,
            func: (domBtn: HTMLElement) => void,
        }) {

            //產生按鈕
            let div = newDiv(`
                <div class="main-tools-btn js-noDrag" data-name="${item.name}">
                    <import type="svg" src="${item.icon}"> </import>
                </div>`);

            addToolsDom({
                group: item.group,
                dom: div,
                func: item.func,
            });
        }


        /**
         * 
         * @param item 
         */
        function addToolsDom(item: {
            group: string, dom: HTMLElement,
            func: (domBtn: HTMLElement) => void,
        }) {

            //如果群組不存在，就先產生群組
            let dom_group = M.dom_tools.querySelector(`.main-tools-group[data-name=${item.group}]`);
            if (dom_group === null) {
                let div = newDiv(`<div class="main-tools-group" data-name="${item.group}">  </div>`);
                M.dom_tools.appendChild(div);
                dom_group = M.dom_tools.querySelector(`.main-tools-group[data-name=${item.group}]`);
            }

            item.func(item.dom)

            if (dom_group !== null) {
                dom_group.appendChild(item.dom);
            }
        }




    }

}





//export { MainTools };