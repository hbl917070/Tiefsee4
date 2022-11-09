
class MainTools {

    public setEnabled;
    public getArrray;

    constructor(M: MainWindow | null) {

        var ar: {
            type: ("button" | "html" | "hr"),
            group: string,
            i18n: string,
            name: string,
            icon: string,
            html: string,
            func: (domBtn: HTMLElement) => void
        }[] = []

        this.setEnabled = setEnabled;
        this.getArrray = getArrray;

        init();

        //-----------------

        /**
         * 初始化
         * @returns 
         */
        function init() {

            initToolsImg();
            initToolsPdf();
            initToolsTxt();
            initToolsWelcome();

            //產生UI
            if (M === null) { return }
            for (let i = 0; i < ar.length; i++) {
                const item = ar[i];

                if (item.type === "html") {
                    addToolsHtml({
                        group: item.group,
                        html: item.html,
                        i18n: item.i18n,
                        func: item.func
                    })
                }

                if (item.type === "hr") {
                    addToolsHr({ group: item.group, })
                }

                if (item.type === "button") {

                    addToolsBtn({
                        group: item.group,
                        name: item.name,
                        icon: item.icon,
                        i18n: item.i18n,
                        func: item.func
                    })
                }
            }
        }


        /**
         * 
         * @returns 
         */
        function getArrray() {
            return ar;
        }


        /**
         * 設定是否啟用
         * @param val 
         */
        function setEnabled(val: boolean) {
            if (M == null) { return; }
            if (val) {
                M.dom_tools.style.display = "";
            } else {
                M.dom_tools.style.display = "none";
            }
            M.config.settings.layout.mainToolsEnabled = val;
        }


        /**
         * 初始化 工具列 圖片
         */
        function initToolsImg() {

            //上一張
            ar.push({
                type: "button", html: "",
                i18n: "上一張",
                group: GroupType.img,
                name: "prevFile",
                icon: "tool-prev.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.prevFile();
                    });
                },
            })

            //下一張
            ar.push({
                type: "button", html: "",
                i18n: "下一張",
                group: GroupType.img,
                name: "nextFile",
                icon: "tool-next.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.nextFile();
                    });
                },
            })


            // 開啟檔案
            ar.push({
                type: "button", html: "",
                i18n: "開啟檔案",
                group: GroupType.img,
                name: "showOpen",
                icon: "tool-open.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showOpen(btn);
                    });
                },
            })

            //上一個資料夾
            ar.push({
                type: "button", html: "",
                i18n: "上一個資料夾",
                group: GroupType.img,
                name: "prevDir",
                icon: "tool-prevDir.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.prevDir();
                    });
                },
            })

            //下一個資料夾
            ar.push({
                type: "button", html: "",
                i18n: "下一個資料夾",
                group: GroupType.img,
                name: "nextDir",
                icon: "tool-nextDir.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.nextDir();
                    });
                },
            })

            //排序
            ar.push({
                type: "button", html: "",
                i18n: "排序",
                group: GroupType.img,
                name: "showSort",
                icon: "tool-sort.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showSort(btn);
                    });
                },
            })

            //複製
            ar.push({
                type: "button", html: "",
                i18n: "複製",
                group: GroupType.img,
                name: "showCopy",
                icon: "tool-copy.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showCopy(btn);
                    });
                },
            })

            //快速拖曳
            ar.push({
                type: "button", html: "",
                i18n: "快速拖曳",
                group: GroupType.img,
                name: "dragDropFile",
                icon: "tool-dragDropFile.svg",
                func: (btn) => {
                    btn.addEventListener("mousedown", (e) => {
                        if (e.button === 0) {//滑鼠左鍵
                            M?.script.file.dragDropFile();
                        }
                    });
                    btn.addEventListener("mousedown", (e) => {
                        if (e.button === 2) {//滑鼠右鍵
                            M?.script.file.showContextMenu();
                        }
                    });
                    btn.setAttribute("data-menu", "none");//避免顯示右鍵選單
                },
            })

            //刪除
            ar.push({
                type: "button", html: "",
                i18n: "刪除",
                group: GroupType.img,
                name: "showDeleteMsg",
                icon: "tool-delete.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.showDeleteMsg();
                    });
                },
            })

            //搜圖
            ar.push({
                type: "button", html: "",
                i18n: "搜圖",
                group: GroupType.img,
                name: "searchImage",
                icon: "tool-search.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showImgSearch(btn);
                    });
                },
            })

            //大量瀏覽模式
            /*ar.push({
                type: "button", html: "",
                i18n: "大量瀏覽模式",
                group: GroupType.img,
                name: "allBrowse",
                icon: "tool-allBrowse.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {

                    });
                },
            })*/

            //設定
            ar.push({
                type: "button", html: "",
                i18n: "設定",
                group: GroupType.img,
                name: "showSetting",
                icon: "tool-setting.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.setting.showSetting();
                    });
                },
            })

            //旋轉與鏡像
            ar.push({
                type: "button", html: "",
                i18n: "旋轉與鏡像",
                group: GroupType.img,
                name: "showRotate",
                icon: "tool-rotate.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showRotate(btn);
                    });
                },
            })

            //全滿
            ar.push({
                type: "button", html: "",
                i18n: "全滿",
                group: GroupType.img,
                name: "zoomFull",
                icon: "tool-full.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.img.zoomFull();
                    });
                },
            })

            //----------------   

            //縮放比例
            ar.push({
                type: "html",
                html: `
                    <div class="main-tools-btn js-noDrag">
                        <div style="margin:0 3px; user-select:none; pointer-events:none;" data-name="btnScale">100%</div>
                    </div>
                `,
                i18n: "縮放比例",
                group: GroupType.img,
                name: "zoomTxt",
                icon: "",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.img.zoom100();
                    });
                },
            })

            //圖片長寬
            ar.push({
                type: "html",
                html: `
                    <div class="main-tools-txt" data-name="infoSize">
                        <!-- 100<br>200 -->
                    </div>
                `,
                i18n: "圖片長寬",
                group: GroupType.img,
                name: "infoSize",
                icon: "",
                func: (btn) => { },
            })

            // 檔案類型、檔案大小
            ar.push({
                type: "html",
                html: `
                    <div class="main-tools-txt" data-name="infoType">
                        <!-- JPG<br>123.4MB -->
                    </div>
                `,
                i18n: "檔案類型、檔案大小",
                group: GroupType.img,
                name: "infoType",
                icon: "",
                func: (btn) => { },
            })

            // 檔案修改時間
            ar.push({
                type: "html",
                html: `
                    <div class="main-tools-txt" data-name="infoWriteTime">
                        <!--2022-05-02<br>01:19:49 -->
                    </div>
                `,
                i18n: "檔案修改時間",
                group: GroupType.img,
                name: "infoWriteTime",
                icon: "",
                func: (btn) => { },
            })


        }


        /**
        * 初始化 工具列 pdf
        */
        function initToolsPdf() {

            //上一張
            ar.push({
                type: "button", html: "",
                i18n: "上一張",
                group: GroupType.pdf,
                name: "prevFile",
                icon: "tool-prev.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.prevFile();
                    });
                },
            })

            //下一張
            ar.push({
                type: "button", html: "",
                i18n: "下一張",
                group: GroupType.pdf,
                name: "nextFile",
                icon: "tool-next.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.nextFile();
                    });
                },
            })

            // 開啟檔案
            ar.push({
                type: "button", html: "",
                i18n: "開啟檔案",
                group: GroupType.pdf,
                name: "showOpen",
                icon: "tool-open.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showOpen(btn);
                    });
                },
            })

            //上一個資料夾
            ar.push({
                type: "button", html: "",
                i18n: "上一個資料夾",
                group: GroupType.pdf,
                name: "prevDir",
                icon: "tool-prevDir.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.prevDir();
                    });
                },
            })

            //下一個資料夾
            ar.push({
                type: "button", html: "",
                i18n: "下一個資料夾",
                group: GroupType.pdf,
                name: "nextDir",
                icon: "tool-nextDir.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.nextDir();
                    });
                },
            })

            //排序
            ar.push({
                type: "button", html: "",
                i18n: "排序",
                group: GroupType.pdf,
                name: "showSort",
                icon: "tool-sort.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showSort(btn);
                    });
                },
            })

            //複製
            ar.push({
                type: "button", html: "",
                i18n: "複製",
                group: GroupType.pdf,
                name: "showCopy",
                icon: "tool-copy.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showCopy(btn);
                    });
                },
            })

            //快速拖曳
            ar.push({
                type: "button", html: "",
                i18n: "快速拖曳",
                group: GroupType.pdf,
                name: "dragDropFile",
                icon: "tool-dragDropFile.svg",
                func: (btn) => {
                    btn.addEventListener("mousedown", (e) => {
                        if (e.button === 0) {//滑鼠左鍵
                            M?.script.file.dragDropFile();
                        }
                    });
                    btn.addEventListener("mousedown", (e) => {
                        if (e.button === 2) {//滑鼠右鍵
                            M?.script.file.showContextMenu();
                        }
                    });
                    btn.setAttribute("data-menu", "none");//避免顯示右鍵選單
                },
            })

            //刪除
            ar.push({
                type: "button", html: "",
                i18n: "刪除",
                group: GroupType.pdf,
                name: "showDeleteMsg",
                icon: "tool-delete.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.showDeleteMsg();
                    });
                },
            })

            //設定
            ar.push({
                type: "button", html: "",
                i18n: "設定",
                group: GroupType.pdf,
                name: "showSetting",
                icon: "tool-setting.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.setting.showSetting();
                    });
                },
            })


            //----------------------------------

            // 檔案類型、檔案大小
            ar.push({
                type: "html",
                html: `
                    <div class="main-tools-txt" data-name="infoType">
                        <!-- JPG<br>123.4MB -->
                    </div>
                `,
                i18n: "檔案類型、檔案大小",
                group: GroupType.pdf,
                name: "infoType",
                icon: "",
                func: (btn) => { },
            })

            // 檔案修改時間
            ar.push({
                type: "html",
                html: `
                    <div class="main-tools-txt" data-name="infoWriteTime">
                        <!--2022-05-02<br>01:19:49 -->
                    </div>
                `,
                i18n: "檔案修改時間",
                group: GroupType.pdf,
                name: "infoWriteTime",
                icon: "",
                func: (btn) => { },
            })


        }


        /**
        * 初始化 工具列 txt
        */
        function initToolsTxt() {

            //上一張
            ar.push({
                type: "button", html: "",
                i18n: "上一張",
                group: GroupType.txt,
                name: "prevFile",
                icon: "tool-prev.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.prevFile();
                    });
                },
            })

            //下一張
            ar.push({
                type: "button", html: "",
                i18n: "下一張",
                group: GroupType.txt,
                name: "nextFile",
                icon: "tool-next.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.nextFile();
                    });
                },
            })


            // 開啟檔案
            ar.push({
                type: "button", html: "",
                i18n: "開啟檔案",
                group: GroupType.txt,
                name: "showOpen",
                icon: "tool-open.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showOpen(btn);
                    });
                },
            })

            // 儲存檔案
            ar.push({
                type: "button", html: "",
                i18n: "儲存檔案",
                group: GroupType.txt,
                name: "showSave",
                icon: "tool-save.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.file.save(btn);
                    });
                },
            })

            //上一個資料夾
            ar.push({
                type: "button", html: "",
                i18n: "上一個資料夾",
                group: GroupType.txt,
                name: "prevDir",
                icon: "tool-prevDir.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.prevDir();
                    });
                },
            })

            //下一個資料夾
            ar.push({
                type: "button", html: "",
                i18n: "下一個資料夾",
                group: GroupType.txt,
                name: "nextDir",
                icon: "tool-nextDir.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.nextDir();
                    });
                },
            })

            //排序
            ar.push({
                type: "button", html: "",
                i18n: "排序",
                group: GroupType.txt,
                name: "showSort",
                icon: "tool-sort.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showSort(btn);
                    });
                },
            })

            //複製
            ar.push({
                type: "button", html: "",
                i18n: "複製",
                group: GroupType.txt,
                name: "showCopy",
                icon: "tool-copy.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showCopy(btn);
                    });
                },
            })

            //快速拖曳
            ar.push({
                type: "button", html: "",
                i18n: "快速拖曳",
                group: GroupType.txt,
                name: "dragDropFile",
                icon: "tool-dragDropFile.svg",
                func: (btn) => {
                    btn.addEventListener("mousedown", (e) => {
                        if (e.button === 0) {//滑鼠左鍵
                            M?.script.file.dragDropFile();
                        }
                    });
                    btn.addEventListener("mousedown", (e) => {
                        if (e.button === 2) {//滑鼠右鍵
                            M?.script.file.showContextMenu();
                        }
                    });
                    btn.setAttribute("data-menu", "none");//避免顯示右鍵選單
                },
            })

            //刪除
            ar.push({
                type: "button", html: "",
                i18n: "刪除",
                group: GroupType.txt,
                name: "showDeleteMsg",
                icon: "tool-delete.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.showDeleteMsg();
                    });
                },
            })

            //設定
            ar.push({
                type: "button", html: "",
                i18n: "設定",
                group: GroupType.txt,
                name: "showSetting",
                icon: "tool-setting.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.setting.showSetting();
                    });
                },
            })


            //---------------------

            // 檔案類型、檔案大小
            ar.push({
                type: "html",
                html: `
                    <div class="main-tools-txt" data-name="infoType">
                        <!-- JPG<br>123.4MB -->
                    </div>
                `,
                i18n: "檔案類型、檔案大小",
                group: GroupType.txt,
                name: "infoType",
                icon: "",
                func: (btn) => { },
            })

            // 檔案修改時間
            ar.push({
                type: "html",
                html: `
                    <div class="main-tools-txt" data-name="infoWriteTime">
                        <!--2022-05-02<br>01:19:49 -->
                    </div>
                `,
                i18n: "檔案修改時間",
                group: GroupType.txt,
                name: "infoWriteTime",
                icon: "",
                func: (btn) => { },
            })

        }


        /**
        * 初始化 工具列 welcome
        */
        function initToolsWelcome() {

            // 開啟檔案
            ar.push({
                type: "button", html: "",
                i18n: "開啟檔案",
                group: GroupType.welcome,
                name: "openFile",
                icon: "tool-open.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.open.openFile();
                    });
                },
            })

            //設定
            ar.push({
                type: "button", html: "",
                i18n: "設定",
                group: GroupType.welcome,
                name: "showSetting",
                icon: "tool-setting.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.setting.showSetting();
                    });
                },
            })

        }

        //---------------------

        /**
         * 新增 html
         * @param item 
         */
        function addToolsHtml(item: {
            group: string,
            html: string,
            i18n: string,
            func: (domBtn: HTMLElement) => void,
        }) {
            let div = newDiv(item.html);
            div.setAttribute("title", item.i18n);
            div.style.order = "999";
            addToolsDom({
                group: item.group,
                dom: div,
                func: item.func,
            });
        }


        /**
         * 新增 垂直線
         * @param item 
         */
        function addToolsHr(item: { group: string, }) {
            let div = newDiv(`<div class="main-tools-hr"> </div>`);
            div.style.order = "999";
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
            group: string,
            name: string,
            icon: string,
            i18n: string,
            func: (domBtn: HTMLElement) => void,
        }) {

            //產生按鈕
            let div = newDiv(`
                <div class="main-tools-btn js-noDrag" data-name="${item.name}" title="${item.i18n}">
                    ${SvgList[item.icon]}
                </div>`);
            div.style.order = "888";//未定義順序的按鈕就放在最後面
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

            if (M === null) { return }

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


