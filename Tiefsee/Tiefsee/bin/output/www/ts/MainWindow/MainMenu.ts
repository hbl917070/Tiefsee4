
class MainMenu {

    public initOpen;
    public updateRightMenuImageZoomRatioTxt;
    public updateMenuLayoutCheckState;
    public setMenuLayoutCheckState;
    //public menu_layout;

    constructor(M: MainWindow) {

        var dom_rightMenuImage_zoomRatioTxt = document.querySelector("#menu-rightMenuImage .js-zoomRatioTxt") as HTMLElement; //右鍵選單的圖片縮放比例

        var btnTopmost = document.querySelector("#menu-layout .js-topmost") as HTMLElement;
        var btnMainToolbar = document.querySelector("#menu-layout .js-mainToolbar") as HTMLElement;
        var btnMainDirList = document.querySelector("#menu-layout .js-mainDirList") as HTMLElement;
        var btnMainFileList = document.querySelector("#menu-layout .js-mainFileList") as HTMLElement;
        var btnMainExif = document.querySelector("#menu-layout .js-mainExif") as HTMLElement;
        var btnFullScreen = document.querySelector("#menu-layout .js-fullScreen") as HTMLDivElement;


        this.initOpen = initOpen;
        this.updateRightMenuImageZoomRatioTxt = updateRightMenuImageZoomRatioTxt;
        this.updateMenuLayoutCheckState = updateMenuLayoutCheckState;
        this.setMenuLayoutCheckState = setMenuLayoutCheckState;


        initCopy();
        initRotate();
        initRightMenuImage();
        initRightMenuWelcome();
        initRightMenuDefault();
        initRightMenuBulkView();
        initText();
        initTxt();
        initLayout();

        var dataMenu = "";


        document.body.addEventListener("mousedown", (e) => {

            //點擊左鍵時
            if (e.button === 0) {
                if (Lib.isTextFocused()) { //焦點在輸入框上
                    return;
                }
                if (M.menu.getIsShow()) {
                    return;
                }
                //避免CSS設定過user-select:none的元素，無法透過點擊來讓文字取消選取狀態
                let targetElement = e.target as Element;
                let userSelect = window.getComputedStyle(targetElement).getPropertyValue("user-select");
                if (userSelect === "none") {
                    window.getSelection()?.removeAllRanges(); //取消文字的選取狀態
                }
            }

            //點擊右鍵時
            if (e.button === 2) {
                let target = e.target as HTMLElement;
                let dom = target as HTMLElement;
                //取得 data-menu ，如果當前的dom沒有設定，則往往上層找
                while (true) {
                    let _dataMenu = dom.getAttribute("data-menu");
                    if (dom === document.body) {
                        dataMenu = "auto"
                        break;
                    }
                    if (_dataMenu != null) {
                        dataMenu = _dataMenu;
                        break;
                    }
                    dom = dom.parentNode as HTMLElement;
                }
            }
        });

        document.body.addEventListener("mouseup", (e) => {

            //點擊右鍵時
            if (e.button === 2) {
                e.preventDefault();
                e.stopPropagation();

                if (dataMenu === "") {

                } if (dataMenu === "none") {

                } else if (Lib.isTextFocused()) { //焦點在輸入框上
                    M.script.menu.showRightMenuText();
                } else if (Lib.isTxtSelect()) { //有選取文字的話
                    M.script.menu.showRightMenuTxt();
                } else {
                    //根據當前的顯示類型來決定右鍵選單
                    let showType = document.body.getAttribute("showType") ?? "";
                    if (showType === "img" || showType === "imgs" || showType === "video") {
                        M.script.menu.showRightMenuImage();
                    } else if (showType === "bulkView") {
                        M.script.menu.showRightMenuBulkView();
                    } else if (showType === "welcome") {
                        M.script.menu.showRightMenuWelcome();
                    } else {
                        M.script.menu.showRightMenuDefault();
                    }
                }
                dataMenu = "";
            }

        });



        /**
         * 更新 右鍵選單的圖片縮放比例
         * @param txt 
         */
        function updateRightMenuImageZoomRatioTxt(txt?: string) {

            if (dom_rightMenuImage_zoomRatioTxt === null) { return; }

            if (txt !== undefined) { //如果有傳入文字，就更新文字內容
                dom_rightMenuImage_zoomRatioTxt.innerHTML = txt;
            }

            if (dom_rightMenuImage_zoomRatioTxt.clientWidth !== 0) {
                let r = 35 / dom_rightMenuImage_zoomRatioTxt.clientWidth;
                if (r > 1) { r = 1; }
                dom_rightMenuImage_zoomRatioTxt.style.transform = `scaleX(${r})`
            }
        }


        //-----------------

        let isInit = false;

        /**
         * 初始化 menu-開啟檔案
         */
        async function initOpen() {

            if (isInit) { return; } //避免重複執行
            isInit = true;

            //載入檔案
            var dom_OpenFile = document.getElementById("menuitem-openFile");
            if (dom_OpenFile !== null) {
                dom_OpenFile.onclick = async () => {
                    M.menu.close(); //關閉menu
                    M.script.open.openFile();
                }
            }


            //另開視窗
            var dom_newWindow = document.getElementById("menuitem-openNewWindow");
            if (dom_newWindow !== null) {
                dom_newWindow.onclick = async () => {
                    M.menu.close(); //關閉menu
                    M.script.open.openNewWindow();
                }
            }

            //開啟檔案位置
            var dom_RevealInFileExplorer = document.getElementById("menuitem-RevealInFileExplorer");
            if (dom_RevealInFileExplorer !== null) {
                dom_RevealInFileExplorer.onclick = async () => {
                    M.menu.close(); //關閉menu
                    M.script.open.revealInFileExplorer();
                }
            }

            //顯示檔案右鍵選單
            var dom_systemContextMenu = document.getElementById("menuitem-systemContextMenu");
            if (dom_systemContextMenu !== null) {
                dom_systemContextMenu.onclick = async () => {
                    M.menu.close(); //關閉menu
                    M.script.open.systemContextMenu();
                }
            }

            //重新命名檔案
            var dom_renameFile = document.getElementById("menuitem-renameFile");
            if (dom_renameFile !== null) {
                dom_renameFile.onclick = async () => {
                    M.menu.close(); //關閉menu
                    M.script.fileLoad.showRenameMsg();
                }
            }

            //列印
            var dom_print = document.getElementById("menuitem-print");
            if (dom_print !== null) {
                dom_print.onclick = async () => {
                    M.menu.close(); //關閉menu
                    M.script.open.print();
                }
            }

            //設成桌布
            var dom_setAsDesktop = document.getElementById("menuitem-setAsDesktop");
            if (dom_setAsDesktop !== null) {
                dom_setAsDesktop.onclick = async () => {
                    M.menu.close(); //關閉menu
                    M.script.open.setAsDesktop();
                }
            }

            //選擇其他應用程式
            var dom_openWith = document.getElementById("menuitem-openWith");
            if (dom_openWith !== null) {
                dom_openWith.onclick = async () => {
                    M.menu.close(); //關閉menu
                    M.script.open.openWith();
                }
            }

            //以3D小畫家開啟
            var dom_Open3DMSPaint = document.getElementById("menuitem-open3DMSPaint");
            if (dom_Open3DMSPaint !== null) {
                dom_Open3DMSPaint.onclick = async () => {
                    M.menu.close(); //關閉menu
                    M.script.open.Open3DMSPaint();
                }
                if (await WV_System.IsWindows10() === false) { //不是win10就隱藏
                    dom_Open3DMSPaint.style.display = "none";
                }
            }


            //以第三方程式開啟
            var dom_menuOtherAppOpen = document.getElementById("menu-otherAppOpen");
            (async () => {

                let arExe: { path: string, name: string, type: string }[] = [];

                //加入絕對路徑的exe
                for (let i = 0; i < M.config.otherAppOpenList.absolute.length; i++) {
                    let exePath = M.config.otherAppOpenList.absolute[i].path;
                    let exeName = M.config.otherAppOpenList.absolute[i].name;
                    let type = M.config.otherAppOpenList.absolute[i].type.join(",");
                    exePath = exePath.replace(/[/]/g, "\\");
                    if (arExe.some(e => e.path === exePath) === false) {
                        arExe.push({ path: exePath, name: exeName, type: type });
                    }
                }

                //加入lnk
                let arLnk = await WV_RunApp.GetStartMenuList(); //取得開始選單裡面的所有lnk
                for (let i = 0; i < arLnk.length; i++) {
                    const lnk = arLnk[i];
                    let name = lnk.substr(lnk.lastIndexOf("\\") + 1); //取得檔名
                    name = name.substr(0, name.length - 4);

                    for (let j = 0; j < M.config.otherAppOpenList.startMenu.length; j++) {
                        const item = M.config.otherAppOpenList.startMenu[j];
                        if (name.toLocaleLowerCase().indexOf(item.name.toLocaleLowerCase()) !== -1) {
                            let exePath = await WV_System.LnkToExePath(lnk);
                            if (arExe.some(e => e.path === exePath) === false) {
                                arExe.push({ path: exePath, name: name, type: item.type.join(",") });
                            }
                        }
                    }
                }

                for (let i = 0; i < arExe.length; i++) {

                    const exe = arExe[i];
                    let name = exe.name; //顯示的名稱
                    let imgBase64 = await WV_Image.GetFileIcon(exe.path, 32); //圖示

                    if (imgBase64 === "") { continue; } //如果沒有圖示，表示檔案不存在

                    let dom = Lib.newDom(`
                        <div class="menu-hor-item">
                            <div class="menu-hor-icon">
                                <img src="${imgBase64}">
                            </div>
                            <div class="menu-hor-txt">${name}</div>
                        </div>
                    `);

                    dom.onclick = async () => {
                        let filePath = M.fileLoad.getFilePath(); //目前顯示的檔案
                        if (await WV_File.Exists(filePath) === false) { return; }
                        M.menu.close(); //關閉menu
                        WV_RunApp.ProcessStart(exe.path, `"${filePath}"`, true, false); //開啟檔案
                    };
                    dom_menuOtherAppOpen?.append(dom);
                }

            })();

        }


        /**
         * 初始化 menu-複製
         */
        async function initCopy() {

            //複製 檔案
            var dom_copyFile = document.getElementById("menuitem-img-copyFile");
            if (dom_copyFile !== null) {
                dom_copyFile.onclick = async () => {
                    M.menu.close(); //關閉menu
                    M.script.copy.copyFile();
                }
            }

            //複製 檔名
            var dom_copyName = document.getElementById("menuitem-img-copyName");
            if (dom_copyName !== null) {
                dom_copyName.onclick = async () => {
                    M.menu.close(); //關閉menu
                    M.script.copy.copyName();
                }
            }

            //複製 完整路徑
            var dom_copyPath = document.getElementById("menuitem-img-copyPath");
            if (dom_copyPath !== null) {
                dom_copyPath.onclick = async () => {
                    M.menu.close(); //關閉menu
                    M.script.copy.copyPath();
                }
            }

            //複製 影像
            var dom_copyImg = document.getElementById("menuitem-img-copyImg");
            if (dom_copyImg !== null) {
                dom_copyImg.onclick = async () => {
                    M.menu.close(); //關閉menu
                    M.script.copy.copyImg();
                }
            }

            //複製 base64
            var dom_copyBase64 = document.getElementById("menuitem-img-copyBase64");
            if (dom_copyBase64 !== null) {
                dom_copyBase64.onclick = async () => {
                    M.menu.close(); //關閉menu      
                    M.script.copy.copyImageBase64();
                }
            }

            //複製 SVG 文字
            var dom_copyTxt = document.getElementById("menuitem-img-copyTxt");
            if (dom_copyTxt !== null) {
                dom_copyTxt.onclick = async () => {
                    M.menu.close(); //關閉menu
                    M.script.copy.copyTxt();
                }
            }

        }


        /**
         * 初始化 menu-旋轉與鏡像
         */
        function initRotate() {

            //順時針90°
            var dom_rotateCw = document.getElementById("menuitem-img-rotateCw");
            if (dom_rotateCw !== null) {
                dom_rotateCw.onclick = async () => {
                    M.menu.close(); //關閉menu
                    M.script.img.degForward();
                }
            }

            //逆時針90°
            var dom_rotateCcw = document.getElementById("menuitem-img-rotateCcw");
            if (dom_rotateCcw !== null) {
                dom_rotateCcw.onclick = async () => {
                    M.menu.close(); //關閉menu
                    M.script.img.degReverse();
                }
            }

            //水平鏡像
            var dom_mirroringH = document.getElementById("menuitem-img-mirroringH");
            if (dom_mirroringH !== null) {
                dom_mirroringH.onclick = async () => {
                    M.menu.close(); //關閉menu
                    M.script.img.mirrorHorizontal();
                }
            }

            //垂直鏡像
            var dom_mirroringV = document.getElementById("menuitem-img-mirroringV");
            if (dom_mirroringV !== null) {
                dom_mirroringV.onclick = async () => {
                    M.menu.close(); //關閉menu
                    M.script.img.mirrorVertica();
                }
            }

            //初始化旋轉
            var dom_initRotate = document.getElementById("menuitem-img-initRotate");
            if (dom_initRotate !== null) {
                dom_initRotate.onclick = async () => {
                    M.menu.close(); //關閉menu
                    M.script.img.transformRefresh();
                }
            }
        }


        /**
         *  初始化 右鍵選單 - 圖片
         */
        function initRightMenuImage() {

            let dom = document.getElementById("menu-rightMenuImage")
            if (dom === null) { return; }

            dom.querySelector(".js-prev")?.addEventListener("click", () => {
                M.script.fileLoad.prevFile();
            });
            dom.querySelector(".js-next")?.addEventListener("click", () => {
                M.script.fileLoad.nextFile();
            });
            dom.querySelector(".js-prevDir")?.addEventListener("click", () => {
                M.script.fileLoad.prevDir();
            });
            dom.querySelector(".js-nextDir")?.addEventListener("click", () => {
                M.script.fileLoad.nextDir();
            });
            dom.querySelector(".js-sort")?.addEventListener("click", () => {
                M.script.menu.close();
                M.script.menu.showMenuSort();
            });

            dom.querySelector(".js-rotate")?.addEventListener("click", () => {
                M.script.menu.close();
                M.script.menu.showMenuRotation();
            });
            dom.querySelector(".js-zoomIn")?.addEventListener("click", () => {
                M.script.img.zoomIn();
            });
            dom.querySelector(".js-zoomOut")?.addEventListener("click", () => {
                M.script.img.zoomOut();
            });
            dom.querySelector(".js-full")?.addEventListener("click", () => {
                M.script.img.zoomToFit();
            });
            dom.querySelector(".js-zoomRatio")?.addEventListener("click", () => {
                M.script.img.zoomTo100();
            });

            dom.querySelector(".js-open")?.addEventListener("click", () => { //在檔案總管中顯示
                M.script.menu.close();
                M.script.open.revealInFileExplorer();
            });
            dom.querySelector(".js-rightMenu")?.addEventListener("click", () => { //檔案右鍵選單
                M.script.menu.close();
                M.script.file.showContextMenu();
            });
            dom.querySelector(".js-copy")?.addEventListener("click", () => { //複製影像
                M.script.menu.close();
                M.script.copy.copyImg();
            });
            dom.querySelector(".js-delete")?.addEventListener("click", () => { //刪除圖片
                M.script.menu.close();
                M.script.fileLoad.showDeleteFileMsg();
            });
            dom.querySelector(".js-setting")?.addEventListener("click", () => { //設定
                M.script.menu.close();
                M.script.setting.showSetting();
            });
            dom.querySelector(".js-help")?.addEventListener("click", () => { //說明
                M.script.menu.close();
                WV_RunApp.OpenUrl('https://github.com/hbl917070/Tiefsee4')
            });
            dom.querySelector(".js-close")?.addEventListener("click", () => { //關閉程式
                M.script.menu.close();
                baseWindow.close();
            });
        }


        /**
         *  初始化 右鍵選單 - 起始畫面
         */
        function initRightMenuWelcome() {

            let dom = document.getElementById("menu-rightMenuWelcome")
            if (dom === null) { return; }

            dom.querySelector(".js-open")?.addEventListener("click", () => { //設定
                M.script.menu.close();
                M.script.open.openFile();
            });
            dom.querySelector(".js-setting")?.addEventListener("click", () => { //設定
                M.script.menu.close();
                M.script.setting.showSetting();
            });
            dom.querySelector(".js-help")?.addEventListener("click", () => { //說明
                M.script.menu.close();
                WV_RunApp.OpenUrl('https://github.com/hbl917070/Tiefsee4')
            });
            dom.querySelector(".js-close")?.addEventListener("click", () => { //關閉程式
                M.script.menu.close();
                baseWindow.close();
            });
        }


        /**
         * 初始化 右鍵選單 - 預設
         */
        function initRightMenuDefault() {

            let dom = document.getElementById("menu-rightMenuDefault")
            if (dom === null) { return; }

            dom.querySelector(".js-prev")?.addEventListener("click", () => {
                M.script.fileLoad.prevFile();
            });
            dom.querySelector(".js-next")?.addEventListener("click", () => {
                M.script.fileLoad.nextFile();
            });
            dom.querySelector(".js-prevDir")?.addEventListener("click", () => {
                M.script.fileLoad.prevDir();
            });
            dom.querySelector(".js-nextDir")?.addEventListener("click", () => {
                M.script.fileLoad.nextDir();
            });
            dom.querySelector(".js-sort")?.addEventListener("click", () => {
                M.script.menu.close();
                M.script.menu.showMenuSort();
            });

            dom.querySelector(".js-open")?.addEventListener("click", () => { //在檔案總管中顯示
                M.script.menu.close();
                M.script.open.revealInFileExplorer();
            });
            dom.querySelector(".js-rightMenu")?.addEventListener("click", () => { //檔案右鍵選單
                M.script.menu.close();
                M.script.file.showContextMenu();
            });
            dom.querySelector(".js-copy")?.addEventListener("click", () => { //複製影像
                M.script.menu.close();
                M.script.copy.copyImg();
            });
            dom.querySelector(".js-delete")?.addEventListener("click", () => { //刪除圖片
                M.script.menu.close();
                M.script.fileLoad.showDeleteFileMsg();
            });
            dom.querySelector(".js-setting")?.addEventListener("click", () => { //設定
                M.script.menu.close();
                M.script.setting.showSetting();
            });
            dom.querySelector(".js-close")?.addEventListener("click", () => { //關閉程式
                M.script.menu.close();
                baseWindow.close();
            });
        }


        /**
         *  初始化 右鍵選單 - 大量瀏覽模式
         */
        function initRightMenuBulkView() {

            let dom = document.getElementById("menu-rightMenuBulkView")
            if (dom === null) { return; }

            dom.querySelector(".js-back")?.addEventListener("click", () => { //返回
                M.script.menu.close();
                M.toolbarBack.runEvent();
            });

            dom.querySelector(".js-showBulkViewSetting")?.addEventListener("click", () => { //大量瀏覽模式設定
                M.script.menu.close();
                M.script.menu.showMenuBulkView();
            });
            dom.querySelector(".js-open")?.addEventListener("click", () => { //在檔案總管中顯示
                M.script.menu.close();
                M.script.open.revealInFileExplorer();
            });
            dom.querySelector(".js-rightMenu")?.addEventListener("click", () => { //檔案右鍵選單
                M.script.menu.close();
                M.script.file.showContextMenu();
            });
            dom.querySelector(".js-copy")?.addEventListener("click", () => { //複製路徑
                M.script.menu.close();
                M.script.copy.copyPath();
            });
            dom.querySelector(".js-delete")?.addEventListener("click", () => { //刪除圖片
                M.script.menu.close();
                M.script.fileLoad.showDeleteDirMsg();
            });
            dom.querySelector(".js-setting")?.addEventListener("click", () => { //設定
                M.script.menu.close();
                M.script.setting.showSetting();
            });
            dom.querySelector(".js-close")?.addEventListener("click", () => { //關閉程式
                M.script.menu.close();
                baseWindow.close();
            });
        }

        /**
         *  初始化 右鍵選單 - 輸入框
         */
        async function initText() {

            var dom_menu = document.getElementById("menu-text");
            if (dom_menu !== null) {
                dom_menu.addEventListener("mousedown", (e) => {
                    e.preventDefault(); //避免搶走輸入框的焦點
                });
            }

            var dom_cut = document.getElementById("menuitem-text-cut"); //剪下
            if (dom_cut !== null) {
                dom_cut.onclick = async () => {
                    await WV_System.SendKeys_CtrlAnd("x");
                    M.menu.close(); //關閉menu

                    /*let dom_input = document.activeElement as HTMLInputElement;
                    if (dom_input === null) { return; }
                    let start = dom_input.selectionStart;
                    let end = dom_input.selectionEnd;
                    if (start === null || end === null) { return; }
                    if (start === end) { return; }

                    let txt = dom_input.value;
                    let select = txt.substring(start, end);
                    WV_System.SetClipboard_Txt(select); //存入剪貼簿

                    dom_input.value = txt.substring(0, start) + txt.substring(end); //去除中間的文字
                    dom_input.setSelectionRange(start, start); //把焦點放回開頭*/
                }
            }

            var dom_copy = document.getElementById("menuitem-text-copy"); //複製
            if (dom_copy !== null) {
                dom_copy.onclick = async () => {
                    let selection = document.getSelection();
                    if (selection === null) { return; }
                    WV_System.SetClipboard_Txt(selection.toString()); //存入剪貼簿
                    M.menu.close(); //關閉menu
                }
            }

            var dom_paste = document.getElementById("menuitem-text-paste"); //貼上
            if (dom_paste !== null) {
                dom_paste.onclick = async () => {
                    await Lib.sleep(10);
                    await WV_System.SendKeys_CtrlAnd("v");
                    M.menu.close(); //關閉menu
                }
            }

            var dom_selectAll = document.getElementById("menuitem-text-selectAll"); //全選
            if (dom_selectAll !== null) {
                dom_selectAll.onclick = async () => {
                    M.menu.close(); //關閉menu
                    let dom_input = document.activeElement as HTMLInputElement;
                    if (dom_input === null) { return; }
                    dom_input.setSelectionRange(0, dom_input.value.length)
                }
            }
        }


        /**
         *  初始化 右鍵選單 - 一般文字
         */
        async function initTxt() {

            var dom_menu = document.getElementById("menu-txt");
            if (dom_menu !== null) {
                dom_menu.addEventListener("mousedown", (e) => {
                    e.preventDefault(); //避免搶走輸入框的焦點
                });
            }

            var dom_copy = document.getElementById("menuitem-txt-copy"); //複製
            if (dom_copy !== null) {
                dom_copy.onclick = async () => {

                    M.menu.close(); //關閉menu

                    let selection = document.getSelection();
                    if (selection === null) { return; }
                    WV_System.SetClipboard_Txt(selection.toString()); //存入剪貼簿
                }
            }
        }

        //-----------------------------

        /**
         * 初始化 menu-版面
         */
        async function initLayout() {

            btnTopmost.addEventListener("click", async () => {
                M.script.window.enabledTopmost();
            });
            btnFullScreen.addEventListener("click", () => {
                M.script.window.enabledFullScreen();
            });
            btnMainToolbar.addEventListener("click", () => {
                M.script.window.enabledMainToolbar();
            });
            btnMainDirList.addEventListener("click", () => {
                M.script.window.enabledMainDirList();
            });
            btnMainFileList.addEventListener("click", () => {
                M.script.window.enabledMainFileList();
            });
            btnMainExif.addEventListener("click", () => {
                M.script.window.enabledMainExif();
            });

        }

        /**
         * 判斷哪些選項要被勾選，於開啟選單時呼叫
         */
        function updateMenuLayoutCheckState() {
            setMenuLayoutCheckState(btnMainToolbar, M.config.settings.layout.mainToolbarEnabled);
            setMenuLayoutCheckState(btnMainDirList, M.config.settings.layout.dirListEnabled);
            setMenuLayoutCheckState(btnMainFileList, M.config.settings.layout.fileListEnabled);
            setMenuLayoutCheckState(btnMainExif, M.config.settings.layout.mainExifEnabled);
            setMenuLayoutCheckState(btnFullScreen, M.fullScreen.getEnabled());
        }

        /**
         * 設定是否勾選
         * @param dom 
         * @param bool 
         */
        function setMenuLayoutCheckState(dom: HTMLElement, bool: boolean) {
            if (bool) {
                dom.getElementsByClassName("menu-hor-icon")[0].innerHTML = SvgList["yes.svg"];
            } else {
                dom.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            }
        }

    }
}

