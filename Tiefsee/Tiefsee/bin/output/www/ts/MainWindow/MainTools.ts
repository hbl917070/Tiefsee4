
class MainTools {



    constructor(M: MainWindow) {

        initToolsImg();
        initToolsPdf();
        initToolsTxt();
        initToolsWelcome();

        //-----------------



        /**
         * 初始化 工具列 圖片
         */
        function initToolsImg() {


            //上一張
            /*addToolsBtn({
                group: GroupType.img,
                name: "prev",
                icon: "tool-prev.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.fileLoad.prev()
                    });
                },
            });

            //下一張
            addToolsBtn({
                group: GroupType.img,
                name: "next",
                icon: "tool-next.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.fileLoad.next()
                    });
                },
            });*/

            // 開啟檔案
            addToolsBtn({
                group: GroupType.img,
                name: "file",
                icon: "tool-open.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.menu.showOpen(btn);
                    });
                },
            });

            //上一個資料夾
            addToolsBtn({
                group: GroupType.img,
                name: "file",
                icon: "tool-prevDir.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {

                    });
                },
            });

            //下一個資料夾
            addToolsBtn({
                group: GroupType.img,
                name: "file",
                icon: "tool-nextDir.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {

                    });
                },
            });

            //排序
            addToolsBtn({
                group: GroupType.img,
                name: "file",
                icon: "tool-sort.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.menu.showSort(btn);
                    });
                },
            });

            //複製
            addToolsBtn({
                group: GroupType.img,
                name: "file",
                icon: "tool-copy.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.menu.showCopy(btn);
                    });
                },
            });


            //快速拖曳
            addToolsBtn({
                group: GroupType.img,
                name: "dragDropFile",
                icon: "tool-dragDropFile.svg",
                func: (btn) => {
                    btn.addEventListener("mousedown", (e) => {
                        if (e.button === 0) {//滑鼠左鍵
                            M.script.file.DragDropFile();
                        }
                    });
                    btn.addEventListener("mousedown", (e) => {
                        if (e.button === 2) {//滑鼠左鍵
                            M.script.file.ShowContextMenu();
                        }
                    });
                },
            });


            //刪除
            addToolsBtn({
                group: GroupType.img,
                name: "file",
                icon: "tool-delete.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.fileLoad.deleteMsg();
                    });
                },
            });

            //搜圖
            /*addToolsBtn({
                group: GroupType.img,
                name: "file",
                icon: "tool-search.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {

                    });
                },
            });*/

            //大量瀏覽模式
            /*addToolsBtn({
                group: GroupType.img,
                name: "file",
                icon: "tool-allBrowse.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {

                    });
                },
            });*/

            //設定
            addToolsBtn({
                group: GroupType.img,
                name: "file",
                icon: "tool-setting.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.setting.OpenSetting();
                    });
                },
            });

            //旋轉與鏡像
            addToolsBtn({
                group: GroupType.img,
                name: "file",
                icon: "tool-rotate.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.menu.showRotate(btn);
                    });
                },
            });

            //全滿
            addToolsBtn({
                group: GroupType.img,
                name: "file",
                icon: "tool-full.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.img.zoomFull();
                    });
                },
            });



            //縮放比例
            addToolsHtml({
                group: GroupType.img,
                html: `
                <div class="main-tools-btn js-noDrag">
                    <div style="margin:0 3px; user-select:none; pointer-events:none;" data-name="btnScale">1%</div>
                </div>
                `,
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.img.zoom100();
                    });
                },
            });


            addToolsHr({ group: GroupType.img, });

            //圖片size
            addToolsHtml({
                group: GroupType.img,
                html: `
                <div class="main-tools-txt" data-name="infoSize">
                   100<br>200
                </div>
            `,
                func: (btn) => { },
            });

            addToolsHr({ group: GroupType.img, });

            // 檔案類型、檔案大小
            addToolsHtml({
                group: GroupType.img,
                html: `
                <div class="main-tools-txt" data-name="infoType">
                    JPG<br>123.4MB
                </div>
            `,
                func: (btn) => { },
            });

            addToolsHr({ group: GroupType.img, });

            // 檔案修改時間
            addToolsHtml({
                group: GroupType.img,
                html: `
                <div class="main-tools-txt" data-name="infoWriteTime">
                    2021
                </div>
            `,
                func: (btn) => { },
            });

        }


        /**
        * 初始化 工具列 pdf
        */
        function initToolsPdf() {

            //上一張
            addToolsBtn({
                group: GroupType.pdf,
                name: "prev",
                icon: "tool-prev.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.fileLoad.prev()
                    });
                },
            });

            //下一張
            addToolsBtn({
                group: GroupType.pdf,
                name: "next",
                icon: "tool-next.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.fileLoad.next()
                    });
                },
            });

            // 開啟檔案
            addToolsBtn({
                group: GroupType.pdf,
                name: "file",
                icon: "tool-open.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.menu.showOpen(btn);
                    });
                },
            });

            //複製
            addToolsBtn({
                group: GroupType.pdf,
                name: "file",
                icon: "tool-copy.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.menu.showCopy(btn);
                    });
                },
            });


            //快速拖曳
            addToolsBtn({
                group: GroupType.pdf,
                name: "dragDropFile",
                icon: "tool-dragDropFile.svg",
                func: (btn) => {
                    btn.addEventListener("mousedown", (e) => {
                        if (e.button === 0) {//滑鼠左鍵
                            M.script.file.DragDropFile();
                        }
                    });
                    btn.addEventListener("mousedown", (e) => {
                        if (e.button === 2) {//滑鼠左鍵
                            M.script.file.ShowContextMenu();
                        }
                    });
                },
            });

            //設定
            addToolsBtn({
                group: GroupType.pdf,
                name: "file",
                icon: "tool-setting.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.setting.OpenSetting();
                    });
                },
            });

            addToolsHr({ group: GroupType.pdf, });

            // 檔案類型、檔案大小
            addToolsHtml({
                group: GroupType.pdf,
                html: `
                <div class="main-tools-txt" data-name="infoType">
                    JPG<br>123.4MB
                </div>
            `,
                func: (btn) => { },
            });

            addToolsHr({ group: GroupType.pdf, });

            // 檔案修改時間
            addToolsHtml({
                group: GroupType.pdf,
                html: `
                <div class="main-tools-txt" data-name="infoWriteTime">
                    2021
                </div>
            `,
                func: (btn) => { },
            });

        }


        /**
        * 初始化 工具列 txt
        */
        function initToolsTxt() {

            //上一張
            addToolsBtn({
                group: GroupType.txt,
                name: "prev",
                icon: "tool-prev.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.fileLoad.prev()
                    });
                },
            });

            //下一張
            addToolsBtn({
                group: GroupType.txt,
                name: "next",
                icon: "tool-next.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.fileLoad.next()
                    });
                },
            });

            // 開啟檔案
            addToolsBtn({
                group: GroupType.txt,
                name: "file",
                icon: "tool-open.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.menu.showOpen(btn);
                    });
                },
            });

            //複製
            addToolsBtn({
                group: GroupType.txt,
                name: "file",
                icon: "tool-copy.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.menu.showCopy(btn);
                    });
                },
            });


            //快速拖曳
            addToolsBtn({
                group: GroupType.txt,
                name: "dragDropFile",
                icon: "tool-dragDropFile.svg",
                func: (btn) => {
                    btn.addEventListener("mousedown", (e) => {
                        if (e.button === 0) {//滑鼠左鍵
                            M.script.file.DragDropFile();
                        }
                    });
                    btn.addEventListener("mousedown", (e) => {
                        if (e.button === 2) {//滑鼠左鍵
                            M.script.file.ShowContextMenu();
                        }
                    });
                },
            });

            //設定
            addToolsBtn({
                group: GroupType.txt,
                name: "file",
                icon: "tool-setting.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.setting.OpenSetting();
                    });
                },
            });

            addToolsHr({ group: GroupType.txt, });

            // 檔案類型、檔案大小
            addToolsHtml({
                group: GroupType.txt,
                html: `
                <div class="main-tools-txt" data-name="infoType">
                    JPG<br>123.4MB
                </div>
            `,
                func: (btn) => { },
            });

            addToolsHr({ group: GroupType.txt, });

            // 檔案修改時間
            addToolsHtml({
                group: GroupType.txt,
                html: `
                <div class="main-tools-txt" data-name="infoWriteTime">
                    2021
                </div>
            `,
                func: (btn) => { },
            });

        }


        /**
        * 初始化 工具列 welcome
        */
        function initToolsWelcome() {

            // 開啟檔案
            addToolsBtn({
                group: GroupType.welcome,
                name: "file",
                icon: "tool-open.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.open.openFile();
                    });
                },
            });


            //設定
            addToolsBtn({
                group: GroupType.welcome,
                name: "file",
                icon: "tool-setting.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M.script.setting.OpenSetting();
                    });
                },
            });
        }

        //---------------------

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
                    ${SvgList[item.icon]}
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


