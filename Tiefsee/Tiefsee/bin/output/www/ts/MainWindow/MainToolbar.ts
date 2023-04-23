
class MainToolbar {

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

            initToolbarImg();
            initToolbarPdf();
            initToolbarTxt();
            initToolbarWelcome();
            initBulkView();

            //產生UI
            if (M === null) { return }
            for (let i = 0; i < ar.length; i++) {
                const item = ar[i];

                if (item.type === "html") {
                    addToolbarHtml({
                        group: item.group,
                        html: item.html,
                        i18n: item.i18n,
                        func: item.func
                    })
                }

                if (item.type === "hr") {
                    addToolbarHr({
                        group: item.group,
                        func: item.func
                    })
                }

                if (item.type === "button") {

                    addToolbarBtn({
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
                M.dom_toolbar.style.display = "";
            } else {
                M.dom_toolbar.style.display = "none";
            }
            M.config.settings.layout.mainToolbarEnabled = val;
        }


        /**
         * 初始化 工具列 圖片
         */
        function initToolbarImg() {

            //上一個檔案
            ar.push({
                type: "button", html: "",
                i18n: "menu.prevFile",
                group: GroupType.img,
                name: "prevFile",
                icon: "tool-prev.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.prevFile();
                    });
                },
            })

            //下一個檔案
            ar.push({
                type: "button", html: "",
                i18n: "menu.nextFile",
                group: GroupType.img,
                name: "nextFile",
                icon: "tool-next.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.nextFile();
                    });
                },
            })


            // 檔案
            ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuFile",
                group: GroupType.img,
                name: "showMenuFile",
                icon: "tool-open.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuFile(btn);
                    });
                },
            })

            //上一個資料夾
            ar.push({
                type: "button", html: "",
                i18n: "menu.prevDir",
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
                i18n: "menu.nextDir",
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
                i18n: "menu.showMenuSort",
                group: GroupType.img,
                name: "showMenuSort",
                icon: "tool-sort.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuSort(btn);
                    });
                },
            })

            //複製
            ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuCopy",
                group: GroupType.img,
                name: "showMenuCopy",
                icon: "tool-copy.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuCopy(btn);
                    });
                },
            })

            //快速拖曳
            ar.push({
                type: "button", html: "",
                i18n: "menu.dragDropFile",
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
                i18n: "menu.showDeleteMsg",
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
                i18n: "menu.showMenuImageSearch",
                group: GroupType.img,
                name: "showMenuImageSearch",
                icon: "tool-search.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuImageSearch(btn);
                    });
                },
            })

            //進入 大量瀏覽模式
            ar.push({
                type: "button", html: "",
                i18n: "menu.bulkView",
                group: GroupType.img,
                name: "bulkView",
                icon: "tool-bulkView.svg",
                func: (btn) => {
                    btn.addEventListener("click", async () => {
                        M?.script.bulkView.show();
                    });
                },
            })

            //設定
            ar.push({
                type: "button", html: "",
                i18n: "menu.showSetting",
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
                i18n: "menu.showMenuRotation",
                group: GroupType.img,
                name: "showMenuRotation",
                icon: "tool-rotate.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuRotation(btn);
                    });
                },
            })

            //縮放至適合視窗
            ar.push({
                type: "button", html: "",
                i18n: "menu.zoomToFit",
                group: GroupType.img,
                name: "zoomToFit",
                icon: "tool-full.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.img.zoomToFit();
                    });
                },
            })

            //----------------   

            //縮放比例
            ar.push({
                type: "html",
                html: `
                    <div class="main-toolbar-btn js-noDrag">
                        <div style="margin:0 3px; user-select:none; pointer-events:none;" data-name="btnScale">100%</div>
                    </div>
                `,
                i18n: "menu.infoZoomRatio",
                group: GroupType.img,
                name: "infoZoomRatio",
                icon: "",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.img.zoomTo100();
                    });
                },
            })

            //圖片長寬
            ar.push({
                type: "html",
                html: `
                    <div class="main-toolbar-txt" data-name="infoSize">
                        <!-- 100<br>200 -->
                    </div>
                `,
                i18n: "menu.infoSize",
                group: GroupType.img,
                name: "infoSize",
                icon: "",
                func: (btn) => { },
            })

            // 檔案類型、檔案大小
            ar.push({
                type: "html",
                html: `
                    <div class="main-toolbar-txt" data-name="infoType">
                        <!-- JPG<br>123.4MB -->
                    </div>
                `,
                i18n: "menu.infoType",
                group: GroupType.img,
                name: "infoType",
                icon: "",
                func: (btn) => { },
            })

            // 檔案修改時間
            ar.push({
                type: "html",
                html: `
                    <div class="main-toolbar-txt" data-name="infoWriteTime">
                        <!--2022-05-02<br>01:19:49 -->
                    </div>
                `,
                i18n: "menu.infoWriteTime",
                group: GroupType.img,
                name: "infoWriteTime",
                icon: "",
                func: (btn) => { },
            })


        }


        /**
        * 初始化 工具列 pdf
        */
        function initToolbarPdf() {

            //上一張
            ar.push({
                type: "button", html: "",
                i18n: "menu.prevFile",
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
                i18n: "menu.nextFile",
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
                i18n: "menu.showMenuFile",
                group: GroupType.pdf,
                name: "showMenuFile",
                icon: "tool-open.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuFile(btn);
                    });
                },
            })

            //上一個資料夾
            ar.push({
                type: "button", html: "",
                i18n: "menu.prevDir",
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
                i18n: "menu.nextDir",
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
                i18n: "menu.showMenuSort",
                group: GroupType.pdf,
                name: "showMenuSort",
                icon: "tool-sort.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuSort(btn);
                    });
                },
            })

            //複製
            ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuCopy",
                group: GroupType.pdf,
                name: "showMenuCopy",
                icon: "tool-copy.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuCopy(btn);
                    });
                },
            })

            //快速拖曳
            ar.push({
                type: "button", html: "",
                i18n: "menu.dragDropFile",
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
                i18n: "menu.showDeleteMsg",
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
                i18n: "menu.showSetting",
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
                    <div class="main-toolbar-txt" data-name="infoType">
                        <!-- JPG<br>123.4MB -->
                    </div>
                `,
                i18n: "menu.infoType",
                group: GroupType.pdf,
                name: "infoType",
                icon: "",
                func: (btn) => { },
            })

            // 檔案修改時間
            ar.push({
                type: "html",
                html: `
                    <div class="main-toolbar-txt" data-name="infoWriteTime">
                        <!--2022-05-02<br>01:19:49 -->
                    </div>
                `,
                i18n: "menu.infoWriteTime",
                group: GroupType.pdf,
                name: "infoWriteTime",
                icon: "",
                func: (btn) => { },
            })


        }


        /**
         * 初始化 工具列 txt
         */
        function initToolbarTxt() {

            //上一個檔案
            ar.push({
                type: "button", html: "",
                i18n: "menu.prevFile",
                group: GroupType.txt,
                name: "prevFile",
                icon: "tool-prev.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.prevFile();
                    });
                },
            })

            //下一個檔案
            ar.push({
                type: "button", html: "",
                i18n: "menu.nextFile",
                group: GroupType.txt,
                name: "nextFile",
                icon: "tool-next.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.nextFile();
                    });
                },
            })


            // 檔案
            ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuFile",
                group: GroupType.txt,
                name: "showMenuFile",
                icon: "tool-open.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuFile(btn);
                    });
                },
            })

            // 儲存檔案
            ar.push({
                type: "button", html: "",
                i18n: "menu.showSave",
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
                i18n: "menu.prevDir",
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
                i18n: "menu.nextDir",
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
                i18n: "menu.showMenuSort",
                group: GroupType.txt,
                name: "showMenuSort",
                icon: "tool-sort.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuSort(btn);
                    });
                },
            })

            //複製
            ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuCopy",
                group: GroupType.txt,
                name: "showMenuCopy",
                icon: "tool-copy.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuCopy(btn);
                    });
                },
            })

            //快速拖曳
            ar.push({
                type: "button", html: "",
                i18n: "menu.dragDropFile",
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
                i18n: "menu.showDeleteMsg",
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
                i18n: "menu.showSetting",
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
                    <div class="main-toolbar-txt" data-name="infoType">
                        <!-- JPG<br>123.4MB -->
                    </div>
                `,
                i18n: "menu.infoType",
                group: GroupType.txt,
                name: "infoType",
                icon: "",
                func: (btn) => { },
            })

            // 檔案修改時間
            ar.push({
                type: "html",
                html: `
                    <div class="main-toolbar-txt" data-name="infoWriteTime">
                        <!--2022-05-02<br>01:19:49 -->
                    </div>
                `,
                i18n: "menu.infoWriteTime",
                group: GroupType.txt,
                name: "infoWriteTime",
                icon: "",
                func: (btn) => { },
            })

        }


        /**
        * 初始化 工具列 welcome
        */
        function initToolbarWelcome() {

            // 載入檔案
            ar.push({
                type: "button", html: "",
                i18n: "menu.openFile",
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
                i18n: "menu.showSetting",
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


        /**
         * 初始化 工具列 BulkView
         */
        function initBulkView() {

            //結束 大量瀏覽模式
            ar.push({
                type: "button", html: "",
                i18n: "menu.closeBulkView",
                group: GroupType.bulkView,
                name: "closeBulkView",
                icon: "tool-back.svg",
                func: (btn) => {
                    btn.style.width = "50px";
                    btn.addEventListener("click", () => {
                        M?.script.bulkView.close();
                    });
                },
            })

            ar.push({
                type: "hr",
                group: GroupType.bulkView,
                i18n: "",
                name: "hr",
                icon: "",
                html: "",
                func: (domHr: HTMLElement) => {
                    //domHr.style.marginLeft = "6px";
                    //domHr.style.marginRight = "6px";
                    //domHr.style.height = "20px";
                }
            })

            // 開啟檔案
            ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuFile",
                group: GroupType.bulkView,
                name: "showMenuFile",
                icon: "tool-open.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuFile(btn);
                    });
                },
            })

            //上一個資料夾
            ar.push({
                type: "button", html: "",
                i18n: "menu.prevDir",
                group: GroupType.bulkView,
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
                i18n: "menu.nextDir",
                group: GroupType.bulkView,
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
                i18n: "menu.showMenuSort",
                group: GroupType.bulkView,
                name: "showMenuSort",
                icon: "tool-sort.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuSort(btn);
                    });
                },
            })


            //複製
            ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuCopy",
                group: GroupType.bulkView,
                name: "showMenuCopy",
                icon: "tool-copy.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuCopy(btn);
                    });
                },
            })

            //快速拖曳
            ar.push({
                type: "button", html: "",
                i18n: "menu.dragDropFile",
                group: GroupType.bulkView,
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
                i18n: "menu.showDeleteMsg",
                group: GroupType.bulkView,
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
                i18n: "menu.showSetting",
                group: GroupType.bulkView,
                name: "showSetting",
                icon: "tool-setting.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.setting.showSetting();
                    });
                },
            })

            // 檔案修改時間
            ar.push({
                type: "html",
                html: `
                    <div class="main-toolbar-txt" data-name="infoWriteTime">
                        <!--2022-05-02<br>01:19:49 -->
                    </div>
                `,
                i18n: "menu.infoWriteTime",
                group: GroupType.bulkView,
                name: "infoWriteTime",
                icon: "",
                func: (btn) => { },
            })

            //大量瀏覽模式設定
            ar.push({
                type: "button", html: "",
                i18n: "menu.showBulkViewSetting",
                group: GroupType.bulkView,
                name: "showBulkViewSetting",
                icon: "tool-setting2.svg",
                func: (btn) => {
                    btn.style.marginLeft = "auto"; //靠右對齊
                    btn.style.order = "1000";

                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuBulkView(btn);
                    });
                },
            })
        }


        //---------------------

        /**
         * 新增 html
         * @param item 
         */
        function addToolbarHtml(item: {
            group: string,
            html: string,
            i18n: string,
            func: (domBtn: HTMLElement) => void,
        }) {
            let div = newDom(item.html);
            div.setAttribute("title", item.i18n);
            div.setAttribute("i18n", item.i18n);
            div.style.order = "999";
            addToolbarDom({
                group: item.group,
                dom: div,
                func: item.func,
            });
        }


        /**
         * 新增 垂直線
         * @param item 
         */
        function addToolbarHr(item: {
            group: string,
            func: (domBtn: HTMLElement) => void,
        }) {
            let div = newDom(`<div class="main-toolbar-hr"> </div>`);
            div.style.order = "888";
            addToolbarDom({
                group: item.group,
                dom: div,
                func: item.func,
            });
        }


        /**
         * 新增 button
         * @param item 
         */
        function addToolbarBtn(item: {
            group: string,
            name: string,
            icon: string,
            i18n: string,
            func: (domBtn: HTMLElement) => void,
        }) {

            //產生按鈕
            let div = newDom(`
                <div class="main-toolbar-btn js-noDrag" data-name="${item.name}" title="${item.i18n}" i18n="${item.i18n}">
                    ${SvgList[item.icon]}
                </div>`);
            div.style.order = "888";//未定義順序的按鈕就放在最後面
            addToolbarDom({
                group: item.group,
                dom: div,
                func: item.func,
            });
        }


        /**
         * 
         * @param item 
         */
        function addToolbarDom(item: {
            group: string, dom: HTMLElement,
            func: (domBtn: HTMLElement) => void,
        }) {

            if (M === null) { return }

            //如果群組不存在，就先產生群組
            let dom_group = M.dom_toolbar.querySelector(`.main-toolbar-group[data-name=${item.group}]`);
            if (dom_group === null) {
                let div = newDom(`<div class="main-toolbar-group" data-name="${item.group}">  </div>`);
                M.dom_toolbar.appendChild(div);
                dom_group = M.dom_toolbar.querySelector(`.main-toolbar-group[data-name=${item.group}]`);
            }

            item.func(item.dom)

            if (dom_group !== null) {
                dom_group.appendChild(item.dom);
            }
        }



    }

}


