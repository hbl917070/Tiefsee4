import { Lib } from "../Lib";
import { WebAPI } from "../WebAPI";
import { MainWindow } from "./MainWindow";

export class MainMenu {

    public updateRightMenuImageZoomRatioTxt;
    public updateMenuLayoutCheckState;
    public setMenuLayoutCheckState;
    public showMenu;
    public updateOtherAppList;
    //public menu_layout;

    constructor(M: MainWindow) {

        const _domRightMenuImageZoomRatioTxt = document.querySelector("#menu-rightMenuImage .js-zoomRatioTxt") as HTMLElement; //右鍵選單的圖片縮放比例

        const _btnTopmost = document.querySelector("#menu-layout .js-topmost") as HTMLElement;
        const _btnMainToolbar = document.querySelector("#menu-layout .js-mainToolbar") as HTMLElement;
        const _btnMainDirList = document.querySelector("#menu-layout .js-mainDirList") as HTMLElement;
        const _btnMainFileList = document.querySelector("#menu-layout .js-mainFileList") as HTMLElement;
        const _btnMainExif = document.querySelector("#menu-layout .js-mainExif") as HTMLElement;
        const _btnFullScreen = document.querySelector("#menu-layout .js-fullScreen") as HTMLDivElement;

        this.updateRightMenuImageZoomRatioTxt = updateRightMenuImageZoomRatioTxt;
        this.updateMenuLayoutCheckState = updateMenuLayoutCheckState;
        this.setMenuLayoutCheckState = setMenuLayoutCheckState;
        this.showMenu = showMenu;
        this.updateOtherAppList = updateOtherAppList;

        initFile();
        initOpenFile();
        initCopy();
        initRotate();
        initRightMenuImage();
        initRightMenuWelcome();
        initRightMenuBulkView();
        initRightMenuFilePanel();
        initRightMenuDirPanel();
        initRightMenuFileBox();
        initRightMenuDirBox();
        initTextbox();
        initText();
        initLayout();

        var _dataMenu = "";

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
                const targetElement = e.target as Element;
                const userSelect = window.getComputedStyle(targetElement).getPropertyValue("user-select");
                if (userSelect === "none") {
                    window.getSelection()?.removeAllRanges(); //取消文字的選取狀態
                }
            }

            //點擊右鍵時
            if (e.button === 2) {
                const target = e.target as HTMLElement;
                let dom = target as HTMLElement;
                //取得 data-menu ，如果當前的dom沒有設定，則往往上層找
                while (true) {
                    let dataMenu = dom.getAttribute("data-menu");
                    if (dom === document.body) {
                        _dataMenu = "auto"
                        break;
                    }
                    if (dataMenu != null) {
                        _dataMenu = dataMenu;
                        break;
                    }
                    dom = dom.parentNode as HTMLElement;
                }
            }
        });

        document.body.addEventListener("mouseup", (e: MouseEvent) => {
            if (e.button === 2) { //點擊右鍵時
                e.preventDefault();
                e.stopPropagation();

                showMenu(e);

                _dataMenu = "";
            }
        });

        /** 
         * 根據當前的狀態來顯示對應的選單
         */
        function showMenu(e: MouseEvent, x?: number, y?: number) {

            if (Lib.isTextFocused()) { // 焦點在輸入框上
                M.script.menu.showRightMenuTextbox(x, y);
                return;
            }
            else if (Lib.isTxtSelect()) { // 有選取文字
                M.script.menu.showRightMenuTxt(x, y);
                return;
            }

            if (M.menu.getIsShow()) { return; }

            if (_dataMenu === "") {

            } if (_dataMenu === "none") {

            } else if (_dataMenu === "filePanel") { // 檔案預覽面板
                M.script.menu.showRightMenuFilePanel(e);

            } else if (_dataMenu === "dirPanel") { // 資料夾預覽面板
                M.script.menu.showRightMenuDirPanel(e);

            } else if (_dataMenu === "file") { // 純檔案
                M.script.menu.showRightMenuFile(e);

            } else {
                // 根據當前的顯示類型來決定右鍵選單
                const showType = document.body.getAttribute("showType") ?? "";
                if (showType === "img" || showType === "imgs" || showType === "video") {
                    M.script.menu.showRightMenuImage(x, y);
                } else if (showType === "bulkView") {
                    M.script.menu.showRightMenuBulkView(e, x, y);
                } else if (showType === "welcome") {
                    M.script.menu.showRightMenuWelcome(x, y);
                } else {
                    M.script.menu.showRightMenuImage(x, y);
                }
            }
        }

        /**
         * 更新 右鍵選單的圖片縮放比例
         * @param text 
         */
        function updateRightMenuImageZoomRatioTxt(text?: string) {

            if (_domRightMenuImageZoomRatioTxt === null) { return; }

            if (text !== undefined) { // 如果有傳入文字，就更新文字內容
                _domRightMenuImageZoomRatioTxt.innerHTML = text;
            }

            if (_domRightMenuImageZoomRatioTxt.clientWidth !== 0) {
                let r = 35 / _domRightMenuImageZoomRatioTxt.clientWidth;
                if (r > 1) { r = 1; }
                _domRightMenuImageZoomRatioTxt.style.transform = `scaleX(${r})`
            }
        }

        //-----------------

        /**
         * 初始化 menu-檔案
         */
        async function initFile() {

            const dom = document.getElementById("menu-file") as HTMLElement;

            function getPath() {
                const path = dom.getAttribute("data-path");
                if (path !== null && path !== "") {
                    return path;
                } else {
                    return undefined;
                }
            }

            // 載入檔案
            dom.querySelector(".js-openFile")?.addEventListener("click", () => {
                M.menu.close();
                M.script.open.openFile();
            })

            // 載入剪貼簿內容
            dom.querySelector(".js-openClipboard")?.addEventListener("click", async () => {
                M.menu.close();
                await M.script.open.openClipboard();
            })

            // 另開視窗
            dom.querySelector(".js-openNewWindow")?.addEventListener("click", () => {
                M.menu.close();
                M.script.open.openNewWindow(getPath());
            })

            // 開啟檔案位置
            dom.querySelector(".js-revealInFileExplorer")?.addEventListener("click", () => {
                M.menu.close();
                M.script.open.revealInFileExplorer(getPath());
            })

            // 顯示檔案右鍵選單
            dom.querySelector(".js-systemContextMenu")?.addEventListener("click", () => {
                M.menu.close();
                M.script.open.systemContextMenu(getPath());
            })

            // 重新命名檔案
            dom.querySelector(".js-renameFile")?.addEventListener("click", () => {
                M.menu.close();
                M.script.fileLoad.showRenameFileMsg(getPath());
            })

            // 重新命名資料夾
            dom.querySelector(".js-renameDir")?.addEventListener("click", () => {
                M.menu.close();
                M.script.fileLoad.showRenameDirMsg(getPath());
            })

            // 列印
            dom.querySelector(".js-print")?.addEventListener("click", () => {
                M.menu.close();
                M.script.open.print(getPath());
            })

            // 設成桌布
            dom.querySelector(".js-setAsDesktop")?.addEventListener("click", () => {
                M.menu.close();
                M.script.open.setAsDesktop(getPath());
            })

            // 選擇其他應用程式
            dom.querySelector(".js-openWith")?.addEventListener("click", () => {
                M.menu.close();
                M.script.open.openWith(getPath());
            })
        }

        var _isInitOtherAppList = false;
        const _otherAppList: {
            dom: HTMLElement,
            isInit?: boolean,
            imgUrl: string,
            menuConfig: { name: RegExp | string, path: string, groupType?: string[], fileExt?: string[] }
        }[] = [];
        /**
         * 初始化「用其他APP開啟檔案」的列表，只會執行一次
         */
        async function initOtherAppList() {

            if (_isInitOtherAppList) { return; }
            _isInitOtherAppList = true;

            let dom = document.getElementById("menu-file") as HTMLElement;

            function getPath() {
                let path = dom.getAttribute("data-path");
                if (path !== null && path !== "") {
                    return path;
                } else {
                    return undefined;
                }
            }

            // 以第三方程式開啟
            const domMenuOtherAppOpen = document.getElementById("menu-otherAppOpen");
            // 讀取開始選單裡面的捷徑
            async function funcExe() {

                let arExe: {
                    path: string,
                    name: string,
                    menuConfig: { name: RegExp | string, path: string, groupType?: string[], fileExt?: string[] }
                }[] = [];

                // 加入絕對路徑的exe
                for (let i = 0; i < M.config.otherAppOpenList.absolute.length; i++) {
                    let menuConfig = M.config.otherAppOpenList.absolute[i];
                    let exePath = menuConfig.path;
                    let exeName = menuConfig.name;
                    exePath = exePath.replace(/[/]/g, "\\");
                    if (arExe.some(e => e.path === exePath) === false) {
                        arExe.push({ path: exePath, name: exeName, menuConfig: menuConfig });
                    }
                }

                // 加入lnk
                let arLnk = await WV_RunApp.GetStartMenuList(); // 取得開始選單裡面的所有lnk
                for (let i = 0; i < arLnk.length; i++) {
                    const lnk = arLnk[i];
                    let name = lnk.substring(lnk.lastIndexOf("\\") + 1); // 取得檔名
                    name = name.substring(0, name.length - 4);

                    for (let j = 0; j < M.config.otherAppOpenList.startMenu.length; j++) {
                        const menuConfig = M.config.otherAppOpenList.startMenu[j];
                        if (name.search(menuConfig.name) !== -1) {
                            let exePath = await WV_System.LnkToExePath(lnk);
                            if (arExe.some(e => e.path === exePath) === false) {
                                arExe.push({ path: exePath, name: name, menuConfig: menuConfig });
                            }
                        }
                    }
                }

                for (let i = 0; i < arExe.length; i++) {

                    const exe = arExe[i];
                    let name = exe.name; // 顯示的名稱
                    let imgBase64 = await WV_Image.GetFileIcon(exe.path, 32); // 圖示

                    if (imgBase64 === "") { continue; } // 如果沒有圖示，表示檔案不存在

                    const dom = Lib.newDom(`
                        <div class="menu-hor-item">
                            <div class="menu-hor-icon">
                                <img>
                            </div>
                            <div class="menu-hor-txt">${name}</div>
                        </div>
                    `);

                    dom.onclick = async () => {
                        let filePath = await M.fileLoad.getFileShortPath(getPath()); // 目前顯示的檔案
                        if (await WV_File.Exists(filePath) === false) { return; }
                        M.menu.close();
                        WV_RunApp.ProcessStart(exe.path, `"${filePath}"`, true, false); // 開啟檔案
                    };
                    domMenuOtherAppOpen?.append(dom);
                    _otherAppList.push({ dom: dom, menuConfig: exe.menuConfig, imgUrl: imgBase64 });
                }

            }
            // 讀取UWP列表
            async function funcUwp() {
                let arUwp: {
                    id: string,
                    path: string,
                    name: string,
                    menuConfig: { name: RegExp, path: string, groupType?: string[], fileExt?: string[] }
                }[] = [];

                // 加入uwp
                const arLnk = await WebAPI.getUwpList();
                for (let i = 0; i < arLnk.length; i++) {
                    const uwpItem = arLnk[i];

                    for (let j = 0; j < M.config.otherAppOpenList.startMenu.length; j++) {
                        const item = M.config.otherAppOpenList.startMenu[j];
                        if (uwpItem.Name.search(item.name) !== -1 ||
                            uwpItem.Id.search(item.name) !== -1) {
                            if (arUwp.some(e => e.id === uwpItem.Id) === false) {
                                arUwp.push({ id: uwpItem.Id, path: uwpItem.Logo, name: uwpItem.Name, menuConfig: item });
                            }
                        }
                    }
                }

                for (let i = 0; i < arUwp.length; i++) {

                    const uwpItem = arUwp[i];
                    const name = uwpItem.name; // 顯示的名稱
                    const logo = WebAPI.getFile(Lib.urlToPath(uwpItem.path));
                    const dom = Lib.newDom(`
                        <div class="menu-hor-item">
                            <div class="menu-hor-icon">
                                <img>
                            </div>
                            <div class="menu-hor-txt">${name}</div>
                        </div>
                    `);

                    dom.onclick = async () => {
                        let filePath = await M.fileLoad.getFileShortPath(getPath()); // 目前顯示的檔案
                        if (await WV_File.Exists(filePath) === false) { return; }
                        M.menu.close();
                        WV_RunApp.RunUwp(uwpItem.id, filePath); // 開啟檔案
                    };
                    domMenuOtherAppOpen?.append(dom);
                    _otherAppList.push({ dom: dom, menuConfig: uwpItem.menuConfig, imgUrl: logo });
                }
            }

            await funcUwp();
            await funcExe();

        }
        /**
         * 更新「用其他APP開啟檔案」的列表，於開啟選單時呼叫
         */
        async function updateOtherAppList(path: string | undefined) {

            await initOtherAppList();

            if (path === undefined) { return; }

            _otherAppList.forEach(item => {
                const fileExt = Lib.getExtension(path).replace(".", ""); // 取得副檔名
                const configFileExt = item.menuConfig.fileExt ?? [];
                const isExtOK = configFileExt.includes(fileExt);

                const groupType = M.fileLoad.fileExtToGroupType(fileExt);
                const configGroupType = item.menuConfig.groupType ?? [];
                const isGroupTypeOK = configGroupType.includes(groupType);

                if (isExtOK || isGroupTypeOK) {

                    item.dom.style.display = "";

                    if (item.isInit !== true) { // 如果是首次顯示，則載入圖片
                        item.isInit = true;

                        let imgDom = item.dom.querySelector(".menu-hor-icon img") as HTMLImageElement;

                        // 如果圖示載入失敗，表示是不可用的捷徑
                        imgDom.onerror = () => {
                            item.dom.remove();
                        }

                        if (imgDom !== null) {
                            imgDom.src = item.imgUrl;
                        }
                    }
                } else {
                    item.dom.style.display = "none";
                }
            });
        }

        /**
          * 初始化 menu-開啟檔案 (用於 起始畫面)
          */
        function initOpenFile() {

            const dom = document.getElementById("menu-openfile") as HTMLElement;

            // 載入檔案
            dom.querySelector(".js-openFile")?.addEventListener("click", () => {
                M.menu.close();
                M.script.open.openFile();
            })

            // 載入剪貼簿內容
            dom.querySelector(".js-openClipboard")?.addEventListener("click", async () => {
                M.menu.close();
                await M.script.open.openClipboard();
            })
        }

        /**
         * 初始化 menu-複製
         */
        async function initCopy() {

            const dom = document.getElementById("menu-copy") as HTMLElement;

            function getPath() {
                const path = dom.getAttribute("data-path");
                if (path !== null && path !== "") {
                    return path;
                } else {
                    return undefined;
                }
            }

            // 複製 檔案
            dom.querySelector(".js-copyFile")?.addEventListener("click", () => {
                M.menu.close();
                M.script.copy.copyFile(getPath());
            })

            // 複製 檔名
            dom.querySelector(".js-copyFileName")?.addEventListener("click", () => {
                M.menu.close();
                M.script.copy.copyFileName(getPath());
            })
            // 複製 檔案路徑
            dom.querySelector(".js-copyFilePath")?.addEventListener("click", () => {
                M.menu.close();
                M.script.copy.copyFilePath(getPath());
            })

            // 複製 資料夾名
            dom.querySelector(".js-copyDirName")?.addEventListener("click", () => {
                M.menu.close();
                M.script.copy.copyDirName(getPath());
            })
            // 複製 資料夾路徑
            dom.querySelector(".js-copyDirPath")?.addEventListener("click", () => {
                M.menu.close();
                M.script.copy.copyDirPath(getPath());
            })

            // 複製 影像
            dom.querySelector(".js-copyImage")?.addEventListener("click", () => {
                M.menu.close();
                M.script.copy.copyImage(getPath());
            })

            // 複製 影像Base64
            dom.querySelector(".js-copyImageBase64")?.addEventListener("click", () => {
                M.menu.close();
                M.script.copy.copyImageBase64(getPath());
            })

            // 複製 檔案Base64
            dom.querySelector(".js-copyBase64")?.addEventListener("click", () => {
                M.menu.close();
                M.script.copy.copyTextBase64(getPath());
            })

            // 複製 SVG 文字
            dom.querySelector(".js-copyText")?.addEventListener("click", () => {
                M.menu.close();
                M.script.copy.copyText(getPath());
            })

        }

        /**
         * 初始化 menu-旋轉與鏡像
         */
        function initRotate() {

            // 順時針90°
            const dom_rotateCw = document.getElementById("menuitem-img-rotateCw");
            if (dom_rotateCw !== null) {
                dom_rotateCw.onclick = async () => {
                    M.menu.close();
                    M.script.img.degForward();
                }
            }

            // 逆時針90°
            const dom_rotateCcw = document.getElementById("menuitem-img-rotateCcw");
            if (dom_rotateCcw !== null) {
                dom_rotateCcw.onclick = async () => {
                    M.menu.close();
                    M.script.img.degReverse();
                }
            }

            // 水平鏡像
            const dom_mirroringH = document.getElementById("menuitem-img-mirroringH");
            if (dom_mirroringH !== null) {
                dom_mirroringH.onclick = async () => {
                    M.menu.close();
                    M.script.img.mirrorHorizontal();
                }
            }

            // 垂直鏡像
            const dom_mirroringV = document.getElementById("menuitem-img-mirroringV");
            if (dom_mirroringV !== null) {
                dom_mirroringV.onclick = async () => {
                    M.menu.close();
                    M.script.img.mirrorVertica();
                }
            }

            // 初始化旋轉
            const dom_initRotate = document.getElementById("menuitem-img-initRotate");
            if (dom_initRotate !== null) {
                dom_initRotate.onclick = async () => {
                    M.menu.close();
                    M.script.img.transformRefresh();
                }
            }
        }

        /**
         *  初始化 右鍵選單 - 圖片
         */
        function initRightMenuImage() {

            const dom = document.getElementById("menu-rightMenuImage")
            if (dom === null) { return; }

            dom.querySelector(".js-bulkView")?.addEventListener("click", () => { // 大量瀏覽模式
                M.script.menu.close();
                M.script.bulkView.show();
            });
            dom.querySelector(".js-prev")?.addEventListener("click", () => {
                M.script.fileLoad.prevFile();
            });
            dom.querySelector(".js-next")?.addEventListener("click", () => {
                M.script.fileLoad.nextFile();
            });
            dom.querySelector(".js-prevDir")?.addEventListener("click", () => { // 上一資料夾
                M.script.fileLoad.prevDir();
            });
            dom.querySelector(".js-nextDir")?.addEventListener("click", () => { // 下一資料夾
                M.script.fileLoad.nextDir();
            });

            const dragDropFile = dom.querySelector(".js-dragDropFile") as HTMLElement; // 快速拖曳
            if (dragDropFile !== null) {
                Lib.addDragThresholdListener(dragDropFile, 3, () => {
                    M.script.file.dragDropFile();
                });
                dragDropFile.addEventListener("mousedown", (e) => {
                    if (e.button === 2) { //滑鼠右鍵
                        M?.script.file.showContextMenu();
                    }
                });
            }

            dom.querySelector(".js-showMenuFile")?.addEventListener("click", () => { // 檔案 選單
                M.script.menu.close();
                M.script.menu.showMenuFile();
            });
            dom.querySelector(".js-showMenuCopy")?.addEventListener("click", () => { // 複製 選單
                M.script.menu.close();
                M.script.menu.showMenuCopy();
            });
            dom.querySelector(".js-showMenuSort")?.addEventListener("click", () => { // 排序 選單
                M.script.menu.close();
                M.script.menu.showMenuSort();
            });
            dom.querySelector(".js-showMenuImageSearch")?.addEventListener("click", () => { // 搜圖
                M.script.menu.close();
                M.script.menu.showMenuImageSearch();
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

            dom.querySelector(".js-openNewWindow")?.addEventListener("click", () => { // 另開視窗
                M.script.menu.close();
                M.script.open.openNewWindow();
            });
            dom.querySelector(".js-revealInFileExplorer")?.addEventListener("click", () => { // 在檔案總管中顯示
                M.script.menu.close();
                M.script.open.revealInFileExplorer();
            });
            dom.querySelector(".js-systemContextMenu")?.addEventListener("click", () => { // 檔案右鍵選單
                M.script.menu.close();
                M.script.file.showContextMenu();
            });
            dom.querySelector(".js-renameFile")?.addEventListener("click", () => { // 重新命名
                M.script.menu.close();
                M.script.fileLoad.showRenameFileMsg();
            });
            dom.querySelector(".js-showDeleteFileMsg")?.addEventListener("click", () => { // 刪除圖片
                M.script.menu.close();
                M.script.fileLoad.showDeleteFileMsg();
            });

            dom.querySelector(".js-setting")?.addEventListener("click", () => { // 設定
                M.script.menu.close();
                M.script.setting.showSetting();
            });

            dom.querySelector(".js-copyFile")?.addEventListener("click", () => { // 複製檔案
                M.script.menu.close();
                M.script.copy.copyFile();
            });
            dom.querySelector(".js-copyFileName")?.addEventListener("click", () => { // 複製檔名
                M.script.menu.close();
                M.script.copy.copyName();
            });
            dom.querySelector(".js-copyFilePath")?.addEventListener("click", () => { // 複製檔案路徑
                M.script.menu.close();
                M.script.copy.copyFilePath();
            });
            dom.querySelector(".js-copyImage")?.addEventListener("click", () => { // 複製影像
                M.script.menu.close();
                M.script.copy.copyImage();
            });
            /*dom.querySelector(".js-help")?.addEventListener("click", () => { // 說明
                M.script.menu.close();
                WV_RunApp.OpenUrl('https://github.com/hbl917070/Tiefsee4')
            });
            dom.querySelector(".js-close")?.addEventListener("click", () => { // 關閉程式
                M.script.menu.close();
                baseWindow.close();
            });*/
        }

        /**
         *  初始化 右鍵選單 - 起始畫面
         */
        function initRightMenuWelcome() {

            const dom = document.getElementById("menu-rightMenuWelcome")
            if (dom === null) { return; }

            dom.querySelector(".js-open")?.addEventListener("click", () => { // 設定
                M.script.menu.close();
                M.script.open.openFile();
            });
            dom.querySelector(".js-setting")?.addEventListener("click", () => { // 設定
                M.script.menu.close();
                M.script.setting.showSetting();
            });
            dom.querySelector(".js-help")?.addEventListener("click", () => { // 說明
                M.script.menu.close();
                WV_RunApp.OpenUrl('https://github.com/hbl917070/Tiefsee4')
            });
            dom.querySelector(".js-close")?.addEventListener("click", () => { // 關閉程式
                M.script.menu.close();
                baseWindow.close();
            });
        }

        /**
         *  初始化 右鍵選單 - 大量瀏覽模式
         */
        function initRightMenuBulkView() {

            const dom = document.getElementById("menu-rightMenuBulkView");
            if (dom === null) { return; }

            dom.querySelector(".js-back")?.addEventListener("click", () => { // 返回
                M.script.menu.close();
                M.toolbarBack.runEvent();
            });

            const dragDropFile = dom.querySelector(".js-dragDropFile") as HTMLElement; // 快速拖曳
            if (dragDropFile !== null) {
                Lib.addDragThresholdListener(dragDropFile, 3, () => {
                    M.script.file.dragDropFile();
                });
                dragDropFile.addEventListener("mousedown", (e) => {
                    if (e.button === 2) { // 滑鼠右鍵
                        M?.script.file.showContextMenu();
                    }
                });
            }

            dom.querySelector(".js-showMenuFile")?.addEventListener("click", () => { // 檔案 選單
                M.script.menu.close();
                M.script.menu.showMenuFile();
            });
            dom.querySelector(".js-showMenuCopy")?.addEventListener("click", () => { // 複製 選單
                M.script.menu.close();
                M.script.menu.showMenuCopy();
            });
            dom.querySelector(".js-showMenuSort")?.addEventListener("click", () => { // 排序 選單
                M.script.menu.close();
                M.script.menu.showMenuSort();
            });
            dom.querySelector(".js-prevDir")?.addEventListener("click", () => { // 上一資料夾
                M.script.fileLoad.prevDir();
            });
            dom.querySelector(".js-nextDir")?.addEventListener("click", () => { // 下一資料夾
                M.script.fileLoad.nextDir();
            });

            dom.querySelector(".js-showBulkViewSetting")?.addEventListener("click", () => { // 大量瀏覽模式設定
                M.script.menu.close();
                M.script.menu.showMenuBulkView();
            });
            dom.querySelector(".js-revealInFileExplorer")?.addEventListener("click", () => { // 在檔案總管中顯示
                M.script.menu.close();
                M.script.open.revealInFileExplorer();
            });
            dom.querySelector(".js-systemContextMenu")?.addEventListener("click", () => { // 檔案右鍵選單
                M.script.menu.close();
                M.script.file.showContextMenu();
            });
            dom.querySelector(".js-showRenameDirMsg")?.addEventListener("click", () => { // 重新命名
                M.script.menu.close();
                M.script.fileLoad.showRenameDirMsg();
            });
            dom.querySelector(".js-showDeleteDirMsg")?.addEventListener("click", () => { // 刪除
                M.script.menu.close();
                M.script.fileLoad.showDeleteDirMsg();
            });

            dom.querySelector(".js-setting")?.addEventListener("click", () => { // 設定
                M.script.menu.close();
                M.script.setting.showSetting();
            });

            dom.querySelector(".js-copyDirName")?.addEventListener("click", () => { // 複製資料夾名
                M.script.menu.close();
                M.script.copy.copyDirName();
            });
            dom.querySelector(".js-copyDirPath")?.addEventListener("click", () => { // 複製資料夾路徑
                M.script.menu.close();
                M.script.copy.copyDirPath();
            });

            /*dom.querySelector(".js-close")?.addEventListener("click", () => { // 關閉程式
                M.script.menu.close();
                baseWindow.close();
            });*/
        }

        /**
         *  初始化 右鍵選單 - filebox
         */
        function initRightMenuFileBox() {

            const dom = document.querySelector("#menu-fileBox");
            if (dom === null) { return; }

            function getPath() {
                if (dom === null) { return ""; }
                const path = dom.getAttribute("data-path");
                if (path === null) { return ""; }
                return path;
            }

            const dragDropFile = dom.querySelector(".js-dragDropFile") as HTMLElement; // 快速拖曳
            if (dragDropFile !== null) {
                Lib.addDragThresholdListener(dragDropFile, 3, () => {
                    M.script.file.dragDropFile(getPath());
                });
                dragDropFile.addEventListener("mousedown", (e) => {
                    if (e.button === 2) { // 滑鼠右鍵
                        M?.script.file.showContextMenu(getPath());
                    }
                });
            }

            dom.querySelector(".js-showMenuFile")?.addEventListener("click", () => { // 檔案 選單
                M.script.menu.close();
                M.script.menu.showMenuFile(undefined, getPath());
            });
            dom.querySelector(".js-showMenuCopy")?.addEventListener("click", () => { // 複製 選單
                M.script.menu.close();
                M.script.menu.showMenuCopy(undefined, getPath());
            });
            dom.querySelector(".js-showMenuImageSearch")?.addEventListener("click", () => { // 搜圖
                M.script.menu.close();
                M.script.menu.showMenuImageSearch(undefined, getPath());
            });

            dom.querySelector(".js-openNewWindow")?.addEventListener("click", () => { // 另開視窗
                M.script.menu.close();
                M.script.open.openNewWindow(getPath());
            });
            dom.querySelector(".js-revealInFileExplorer")?.addEventListener("click", () => { // 在檔案總管中顯示
                M.script.menu.close();
                M.script.open.revealInFileExplorer(getPath());
            });
            dom.querySelector(".js-systemContextMenu")?.addEventListener("click", () => { // 檔案右鍵選單
                M.script.menu.close();
                M.script.file.showContextMenu(getPath());
            });
            dom.querySelector(".js-renameFile")?.addEventListener("click", () => { // 重新命名
                M.script.menu.close();
                M.script.fileLoad.showRenameFileMsg(getPath());
            });
            dom.querySelector(".js-showDeleteFileMsg")?.addEventListener("click", () => { // 刪除圖片
                M.script.menu.close();
                M.script.fileLoad.showDeleteFileMsg(undefined, getPath());
            });

            dom.querySelector(".js-copyFile")?.addEventListener("click", () => { // 複製檔案
                M.script.menu.close();
                M.script.copy.copyFile(getPath());
            });
            dom.querySelector(".js-copyFileName")?.addEventListener("click", () => { // 複製檔名
                M.script.menu.close();
                M.script.copy.copyFileName(getPath());
            });
            dom.querySelector(".js-copyFilePath")?.addEventListener("click", () => { // 複製檔案路徑
                M.script.menu.close();
                M.script.copy.copyFilePath(getPath());
            });
            dom.querySelector(".js-copyImage")?.addEventListener("click", () => { // 複製影像
                M.script.menu.close();
                M.script.copy.copyImage(getPath());
            });
        }

        /**
         *  初始化 右鍵選單 - dirbox
         */
        function initRightMenuDirBox() {
            const dom = document.querySelector("#menu-dirBox");
            if (dom === null) { return; }

            function getPath() {
                if (dom === null) { return ""; }
                const path = dom.getAttribute("data-path");
                if (path === null) { return ""; }
                return path;
            }

            const dragDropFile = dom.querySelector(".js-dragDropFile") as HTMLElement; // 快速拖曳
            if (dragDropFile !== null) {
                Lib.addDragThresholdListener(dragDropFile, 3, () => {
                    M?.script.file.dragDropFile(getPath());
                });
                dragDropFile.addEventListener("mousedown", (e) => {
                    if (e.button === 2) { // 滑鼠右鍵
                        M?.script.file.showContextMenu(getPath());
                    }
                });
            }
            dom.querySelector(".js-showMenuFile")?.addEventListener("click", () => { // 檔案 選單
                M.script.menu.close();
                M.script.menu.showMenuFile(undefined, getPath(), "dir");
            });
            dom.querySelector(".js-showMenuCopy")?.addEventListener("click", () => { // 複製 選單
                M.script.menu.close();
                M.script.menu.showMenuCopy(undefined, getPath(), "dir");
            });

            dom.querySelector(".js-revealInFileExplorer")?.addEventListener("click", () => { // 在檔案總管中顯示
                M.script.menu.close();
                M.script.open.revealInFileExplorer(getPath());
            });
            dom.querySelector(".js-systemContextMenu")?.addEventListener("click", () => { // 檔案右鍵選單
                M.script.menu.close();
                M.script.file.showContextMenu(getPath());
            });
            dom.querySelector(".js-renameDir")?.addEventListener("click", () => { // 重新命名資料夾
                M.script.menu.close();
                M.script.fileLoad.showRenameDirMsg(getPath());
            });
            dom.querySelector(".js-showDeleteDirMsg")?.addEventListener("click", () => { // 刪除資料夾
                M.script.menu.close();
                M.script.fileLoad.showDeleteDirMsg(undefined, getPath());
            });

            dom.querySelector(".js-copyDirName")?.addEventListener("click", () => { // 複製資料夾名
                M.script.menu.close();
                M.script.copy.copyDirName(getPath());
            });
            dom.querySelector(".js-copyDirPath")?.addEventListener("click", () => { // 複製資料夾路徑
                M.script.menu.close();
                M.script.copy.copyDirPath(getPath());
            });
        }

        /**
         * 初始化 右鍵選單 - 檔案預覽面板
         */
        function initRightMenuFilePanel() {
            const dom = document.querySelector("#menu-rightMenuFilePanel");
            if (dom === null) { return; }

            dom.querySelector(".js-reload")?.addEventListener("click", () => { // 重新載入
                M.script.menu.close();
                M.script.fileLoad.reloadFilePanel();
            });
            dom.querySelector(".js-showMenuSort")?.addEventListener("click", () => { // 排序 選單
                M.script.menu.close();
                M.script.menu.showMenuSort(undefined, "file");
            });
            dom.querySelector(".js-setting")?.addEventListener("click", () => { // 設定
                M.script.menu.close();
                M.script.setting.showSetting("layout", "filePanel");
            });
        }

        /**
         * 初始化 右鍵選單 - 資料夾預覽面板
         */
        function initRightMenuDirPanel() {
            const dom = document.querySelector("#menu-rightMenuDirPanel");
            if (dom === null) { return; }

            dom.querySelector(".js-reload")?.addEventListener("click", () => { // 重新載入
                M.script.menu.close();
                M.script.fileLoad.reloadDirPanel();
            });
            dom.querySelector(".js-showMenuSort")?.addEventListener("click", () => { // 排序 選單
                M.script.menu.close();
                M.script.menu.showMenuSort(undefined, "dir");
            });
            dom.querySelector(".js-setting")?.addEventListener("click", () => { // 設定
                M.script.menu.close();
                M.script.setting.showSetting("layout", "dirPanel");
            });
        }

        /**
         *  初始化 右鍵選單 - 輸入框
         */
        async function initTextbox() {

            const domMenu = document.getElementById("menu-text") as HTMLElement;
            if (domMenu !== null) {
                domMenu.addEventListener("mousedown", (e) => {
                    e.preventDefault(); // 避免搶走輸入框的焦點
                });
            }

            const domCut = document.getElementById("menuitem-text-cut"); // 剪下
            if (domCut !== null) {
                domCut.onclick = async () => {
                    await WV_System.SendKeys_CtrlAnd("x");
                    M.menu.close(domMenu);
                }
            }

            const domCopy = document.getElementById("menuitem-text-copy"); // 複製
            if (domCopy !== null) {
                domCopy.onclick = async () => {
                    let selection = document.getSelection();
                    if (selection === null) { return; }
                    WV_System.SetClipboard_Text(selection.toString()); // 存入剪貼簿
                    M.menu.close(domMenu);
                }
            }

            const domPaste = document.getElementById("menuitem-text-paste"); //貼上
            if (domPaste !== null) {
                domPaste.onclick = async () => {
                    await Lib.sleep(10);
                    await WV_System.SendKeys_CtrlAnd("v");
                    M.menu.close(domMenu);
                }

                const domSelectAll = document.getElementById("menuitem-text-selectAll"); // 全選
                if (domSelectAll !== null) {
                    domSelectAll.onclick = async () => {
                        M.menu.close(domMenu);
                        const domInput = document.activeElement as HTMLInputElement;
                        if (domInput === null) { return; }
                        domInput.setSelectionRange(0, domInput.value.length)
                    }
                }
            }
        }

        /**
         *  初始化 右鍵選單 - 一般文字
         */
        async function initText() {

            const domMenu = document.getElementById("menu-txt") as HTMLElement;
            if (domMenu !== null) {
                domMenu.addEventListener("mousedown", (e) => {
                    e.preventDefault(); // 避免搶走輸入框的焦點
                });
            }

            const domCopy = document.getElementById("menuitem-txt-copy"); // 複製
            if (domCopy !== null) {
                domCopy.onclick = async () => {
                    M.menu.close(domMenu);
                    const selection = document.getSelection();
                    if (selection === null) { return; }
                    WV_System.SetClipboard_Text(selection.toString()); // 存入剪貼簿
                }
            }
        }

        /**
         * 初始化 menu-版面
         */
        async function initLayout() {
            _btnTopmost.addEventListener("click", async () => {
                M.script.window.enabledTopmost();
            });
            _btnFullScreen.addEventListener("click", () => {
                M.script.window.enabledFullScreen();
            });
            _btnMainToolbar.addEventListener("click", () => {
                M.script.window.enabledMainToolbar();
            });
            _btnMainDirList.addEventListener("click", () => {
                M.script.window.enabledMainDirList();
            });
            _btnMainFileList.addEventListener("click", () => {
                M.script.window.enabledMainFileList();
            });
            _btnMainExif.addEventListener("click", () => {
                M.script.window.enabledMainExif();
            });
        }

        /**
         * 判斷哪些選項要被勾選，於開啟選單時呼叫
         */
        function updateMenuLayoutCheckState() {
            setMenuLayoutCheckState(_btnMainToolbar, M.config.settings.layout.mainToolbarEnabled);
            setMenuLayoutCheckState(_btnMainDirList, M.config.settings.layout.dirListEnabled);
            setMenuLayoutCheckState(_btnMainFileList, M.config.settings.layout.fileListEnabled);
            setMenuLayoutCheckState(_btnMainExif, M.config.settings.layout.mainExifEnabled);
            setMenuLayoutCheckState(_btnFullScreen, M.fullScreen.getEnabled());
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
