var baseWindow: BaseWindow;

var mainWindow: MainWindow;
document.addEventListener("DOMContentLoaded", async () => {
    mainWindow = new MainWindow();
});

class MainWindow {

    public quickLookUp;

    public dom_toolbar: HTMLElement;
    public dom_mainL: HTMLElement;
    public dom_mainR: HTMLElement;

    public db: IndexedDBManager | null = null;
    public i18n;
    public config;
    public mainToolbar;
    public fileLoad;
    public fileShow;
    public fileSort;
    public dirSort;
    public mainFileList;
    public mainDirList;
    public imgSearch;
    public mainExif;
    public menu;
    public mainMenu;
    public largeBtn;
    public script;
    public msgbox;
    public bulkView;
    public toolbarBack;
    public fullScreen;
    public textEditor;
    public updateDomVisibility;

    public applySetting;
    public saveSetting;
    public getIsQuickLook;
    public downloadFileFromUrl;

    constructor() {

        baseWindow = new BaseWindow(); // 初始化視窗

        this.quickLookUp = quickLookUp;

        var dom_toolbar = <HTMLElement>document.getElementById("main-toolbar"); // 工具列
        var dom_mainL = <HTMLElement>document.getElementById("main-L"); // 左邊區域
        var dom_mainR = <HTMLElement>document.getElementById("main-R"); // 左邊區域
        var btn_layout = <HTMLDivElement>document.querySelector(".titlebar-toolbar-layout"); // 開啟layout選單

        let firstRun = true; // 用於判斷是否為第一次執行
        let startType = 0; // 1=直接啟動  2=快速啟動  3=快速啟動+常駐  4=單一執行個體  5=單一執行個體+常駐

        /** 是否為快速預覽 */
        var isQuickLook = false;

        this.dom_toolbar = dom_toolbar;
        this.dom_mainL = dom_mainL;
        this.dom_mainR = dom_mainR;

        var db: IndexedDBManager;
        var config = this.config = new Config(baseWindow);
        var i18n = this.i18n = new I18n();
        i18n.pushData(langData);
        var msgbox = this.msgbox = new Msgbox(i18n);
        var fileLoad = this.fileLoad = new FileLoad(this);
        var fileShow = this.fileShow = new FileShow(this);
        var fileSort = this.fileSort = new FileSort(this);
        var dirSort = this.dirSort = new DirSort(this);
        var mainFileList = this.mainFileList = new MainFileList(this);
        var mainDirList = this.mainDirList = new MainDirList(this);
        var imgSearch = this.imgSearch = new ImgSearch(this);
        var mainExif = this.mainExif = new MainExif(this);
        var mainToolbar = this.mainToolbar = new MainToolbar(this);
        var menu = this.menu = new Menu(this);
        var mainMenu = this.mainMenu = new MainMenu(this);
        var largeBtn = this.largeBtn = new LargeBtn(this);
        var script = this.script = new Script(this);
        var bulkView = this.bulkView = new BulkView(this);
        var toolbarBack = this.toolbarBack = new ToolbarBack();
        var fullScreen = this.fullScreen = new FullScreen(this);
        var textEditor = this.textEditor = new TextEditor(this);

        this.applySetting = applySetting;
        this.saveSetting = saveSetting;
        this.getIsQuickLook = getIsQuickLook;
        this.updateDomVisibility = updateDomVisibility;
        this.downloadFileFromUrl = downloadFileFromUrl;

        new Hotkey(this);

        (async () => {

            db = await new IndexedDBManager("tiefseeDB", 1);
            this.db = db;

            fileShow.openNone(); // 不顯示任何東西

            WV_Window.SetMinimumSize(250 * window.devicePixelRatio, 250 * window.devicePixelRatio); // 設定視窗最小size

            fileShow.tiefseeview.setMargin(0, 10, 10, 0);

            // 視窗改變大小時觸發
            baseWindow.sizeChangeEvents.push(async () => {
                // 必須在視窗化的狀態下記錄size，不可以在最大化的時候記錄size
                if (baseWindow.windowState === "Normal") {
                    config.settings.position.width = baseWindow.width;
                    config.settings.position.height = baseWindow.height;
                }
            });

            // 關閉視窗前觸發
            baseWindow.closingEvents.push(async () => {

                if (getIsQuickLook() === false) { // 正常視窗(不是快速預覽)
                    if (script.setting.temp_setting != null) { // 如果有開啟 設定視窗
                        if (await script.setting.temp_setting.Visible === true) {
                            await script.setting.temp_setting.RunJs("setting.saveData();"); // 關閉前先儲存設定
                            await Lib.sleep(30); // js無法呼叫C#的非同步函數，所以必須加上延遲，避免執行js前程式就被關閉
                        }
                    }
                    WV_System.DeleteTemp(100, 300); // 刪除圖片暫存
                    await saveSetting(); // 儲存 setting.json
                    return true;

                } else {
                    quickLookUp(); // 關閉 快速預覽
                    return false;
                }
            });

            // 設定icon
            async function initIcon() {
                let path = Lib.Combine([await WV_Window.GetAppDirPath(), "Www\\img\\logo.ico"]);
                WV_Window.SetIcon(path);
            }
            initIcon();

            // 開啟layout選單
            btn_layout.addEventListener("click", function (e) {
                script.menu.showLayout(btn_layout);
            })

            // 封鎖原生右鍵選單
            document.addEventListener("contextmenu", function (e) {
                // if (Lib.isTextFocused() === false) { // 焦點不在輸入框上          
                // }
                e.preventDefault();
            })

            // 圖片區域也允許拖曳視窗
            fileShow.dom_imgview.addEventListener("mousedown", async (e) => {
                // 圖片沒有出現滾動條
                if (fileShow.tiefseeview.getIsOverflowX() === false && fileShow.tiefseeview.getIsOverflowY() === false) {
                    if (e.button === 0) { // 滑鼠左鍵
                        let WindowState = baseWindow.windowState;
                        if (WindowState === "Normal") {
                            WV_Window.WindowDrag("move");
                        }
                    }
                }
                window.focus();
            });
            /*fileShow.dom_imgview.addEventListener("touchstart", async (e) => { // 雙指縮放時可能衝突
                // 圖片沒有出現滾動條
                if (fileShow.tiefseeview.getIsOverflowX() === false && fileShow.tiefseeview.getIsOverflowY() === false) {
                    let WindowState = baseWindow.windowState;
                    if (WindowState === "Normal") {
                        baseWindow.touchDrop.start(fileShow.dom_imgview, e, "move");
                    }
                }
            });*/

            // double click 最大化或視窗化
            Lib.addEventDblclick(dom_toolbar, async (e) => { // 工具列
                // 如果是按鈕就不雙擊全螢幕
                let _dom = e.target as HTMLDivElement;
                if (_dom) {
                    if (_dom.classList.contains("js-noDrag")) { return; }
                }
                let WindowState = baseWindow.windowState
                if (WindowState === "Maximized" && fullScreen.getEnabled() === false) {
                    baseWindow.normal();
                } else {
                    setTimeout(() => {
                        baseWindow.maximized();
                    }, 50);
                }
            });
            Lib.addEventDblclick(fileShow.iframes.welcomeview.dom, async () => { // 歡迎頁面
                let WindowState = baseWindow.windowState
                if (WindowState === "Maximized" && fullScreen.getEnabled() === false) {
                    baseWindow.normal();
                } else {
                    setTimeout(() => {
                        baseWindow.maximized();
                    }, 50);
                }
            });

            // 讓工具列允許拖曳視窗
            dom_toolbar.addEventListener("mousedown", async (e) => {
                if (fullScreen.getEnabled() === true) { return; }
                let _dom = e.target as HTMLDivElement;
                if (_dom) {
                    if (_dom.classList.contains("js-noDrag")) { return; }
                }
                if (e.button === 0) { // 滑鼠左鍵
                    await WV_Window.WindowDrag("move");
                }
            });
            dom_toolbar.addEventListener("touchstart", async (e) => {
                if (fullScreen.getEnabled() === true) { return; }
                let _dom = e.target as HTMLDivElement;
                if (_dom) {
                    if (_dom.classList.contains("js-noDrag")) { return; }
                }
                let isShowScroll = dom_toolbar.scrollWidth > dom_toolbar.clientWidth; // 判斷當前是否有滾動條
                if (isShowScroll === false) {
                    baseWindow.touchDrop.start(dom_toolbar, e, "move");
                }
            });

            // 在工具列滾動時，進行水平移動
            dom_toolbar.addEventListener("wheel", (e: WheelEvent) => {

                let scrollLeft = dom_toolbar.scrollLeft;
                let deltaY = e.deltaY; // 上下滾動的量

                if (deltaY > 0) { // 往右
                    dom_toolbar.scroll(scrollLeft + 20, 0);
                }
                if (deltaY < 0) { // 往左
                    dom_toolbar.scroll(scrollLeft - 20, 0);
                }
            }, false);

            new TiefseeScroll().initGeneral(dom_toolbar, "x"); // 滾動條元件


            // 讓歡迎畫面允許拖曳視窗
            fileShow.iframes.welcomeview.dom.addEventListener("mousedown", async (e) => {

                // 排除不允許拖拉的物件
                let _dom = e.target as HTMLDivElement;
                if (_dom) {
                    if (_dom.classList.contains("js-noDrag")) { return; }
                }
                e.preventDefault();

                if (e.button === 0) { // 滑鼠左鍵
                    let WindowState = baseWindow.windowState;
                    if (WindowState === "Normal") {
                        WV_Window.WindowDrag("move");
                    }
                }
            });

            // #region 自定義滑鼠

            // 按下
            fileShow.dom_imgview.addEventListener("mousedown", (e) => {
                let sc = "";
                let type = e.button;
                if (type === 1) { // 滾輪鍵
                    sc = config.settings.mouse.scrollWheelButton;
                }
                if (type === 3) { // 按鍵4
                    sc = config.settings.mouse.mouseButton4;
                }
                if (type === 4) { // 按鍵5
                    sc = config.settings.mouse.mouseButton5;
                }

                // let offsetX = e.offsetX;
                // let offsetY = e.offsetY;
                let offsetX = e.x - fileShow.dom_imgview.getBoundingClientRect().left;
                let offsetY = e.y - fileShow.dom_imgview.getBoundingClientRect().top;
                script.run(sc, { x: offsetX, y: offsetY });
            })

            // 雙擊左鍵
            Lib.addEventDblclick(fileShow.dom_imgview, async (e: MouseEvent) => { // 圖片物件
                let sc = config.settings.mouse.leftDoubleClick;
                let offsetX = e.x - fileShow.dom_imgview.getBoundingClientRect().left;
                let offsetY = e.y - fileShow.dom_imgview.getBoundingClientRect().top;
                script.run(sc, { x: offsetX, y: offsetY });
            });

            // 覆寫滾動事件
            fileShow.tiefseeview.setEventMouseWheel((type: ("up" | "down"), e: WheelEvent, offsetX: number, offsetY: number) => {

                let sc = "";
                if (type === "up") {
                    if (e.ctrlKey) {
                        sc = config.settings.mouse.scrollUpCtrl;
                    } else if (e.shiftKey) {
                        sc = config.settings.mouse.scrollUpShift;
                    } else if (e.altKey) {
                        sc = config.settings.mouse.scrollUpAlt;
                    } else {
                        sc = config.settings.mouse.scrollUp;
                    }
                } else {
                    if (e.ctrlKey) {
                        sc = config.settings.mouse.scrollDownCtrl;
                    } else if (e.shiftKey) {
                        sc = config.settings.mouse.scrollDownShift;
                    } else if (e.altKey) {
                        sc = config.settings.mouse.scrollDownAlt;
                    } else {
                        sc = config.settings.mouse.scrollDown;
                    }
                }

                script.run(sc, { x: offsetX, y: offsetY });
            });

            // #endregion

            window.addEventListener("dragenter", dragenter, false);
            window.addEventListener("dragover", dragover, false);
            window.addEventListener("drop", drop, false);

            function dragenter(e: DragEvent) {
                e.stopPropagation();
                e.preventDefault();
            }

            function dragover(e: DragEvent) {
                e.stopPropagation();
                e.preventDefault();
            }
            async function drop(e: DragEvent) {

                // e.stopPropagation();

                // 如果是直接從 iframe子頁面 強制觸發的事件
                const e2 = (e.detail as any).event;
                if (e2 !== undefined) { e = e2; }

                if (e.dataTransfer === null) { return; }

                let files = e.dataTransfer.files;
                let text = e.dataTransfer.getData("text/plain"); // 取得拖曳進來的文字，或圖片的網址
                let textUrl = e.dataTransfer.getData("text/uri-list");
                /*console.log(e.dataTransfer.types)
                console.log(text)
                console.log(textUrl)
                console.log(e.dataTransfer.getData("text/html"))
                console.log(files)*/

                // 下載檔案後，判斷是否需要重新載入圖片 
                async function reloadImageAfterDownload(path: string) {
                    if (fileLoad.getIsBulkView() === false) { // 一般圖片模式，直接重新載入
                        await fileLoad.loadFile(path);
                    } else { // 大量瀏覽模式，與目前所在目錄不同才重新載入
                        if (Lib.GetDirectoryName(path) !== fileLoad.getDirPath()) {
                            await fileLoad.loadFile(path);
                        }
                    }
                }

                if (text.search(/^http:\/\/127\.0\.0\.1:\d+\/file=/) === 0) { // 如果是 Stable Diffusion webui 的圖片，則直接開啟檔案

                    // ex: http://127.0.0.1:7860/file=D:/ai/a.png

                    e.preventDefault();

                    var path = text.match(/file=(.+)/)?.[1] || "";
                    path = Lib.URLToPath(path);
                    await fileLoad.loadFile(path);

                } else if (text.search(/^http:\/\/127\.0\.0\.1:\d+\/.*\?filename=([^&]+).*$/) === 0) { // 如果是 Stable Diffusion webui 的圖片，則直接開啟檔案

                    // ex: http://127.0.0.1:7860/sd_extra_networks/thumb?filename=D%3A/ai/stable-diffusion-webui/models/Lora/aaa.png&mtime=1676408109.8893292

                    e.preventDefault();

                    const regex = /^http:\/\/127\.0\.0\.1:\d+\/.*\?filename=([^&]+).*$/;
                    const match = text.match(regex);
                    if (match) {
                        path = decodeURIComponent(match[1]);
                        path = Lib.URLToPath(path);
                        await fileLoad.loadFile(path);
                    }

                } else if (text.indexOf("https://cdn.discordapp.com/attachments/") === 0) { // 如果是 discord 的圖片

                    e.preventDefault();

                    let file = await downloadFileFromUrl(text);
                    if (file != null) {
                        let base64 = await Lib.readFileAsDataURL(file);
                        let extension = await Lib.getExtensionFromBase64(base64); // 取得副檔名
                        if (extension !== "") {
                            let path = await WV_File.Base64ToTempFile(base64, extension);
                            await reloadImageAfterDownload(path); // 下載檔案後，判斷是否需要重新載入圖片
                        }
                    }
                } else if (text.search(/^((blob:)?http[s]?|file):[/][/]/) === 0 && files.length > 0) { // 網頁的圖片

                    e.preventDefault();

                    let base64 = await Lib.readFileAsDataURL(files[0]);
                    let extension = await Lib.getExtensionFromBase64(base64); // 取得副檔名

                    if (extension !== "") {
                        let path = await WV_File.Base64ToTempFile(base64, extension);
                        await reloadImageAfterDownload(path); // 下載檔案後，判斷是否需要重新載入圖片
                    } else { // 檔案解析失敗的話，嘗試從網址下載
                        let file = await downloadFileFromUrl(text);
                        if (file != null) {
                            let base64 = await Lib.readFileAsDataURL(file);
                            let extension = await Lib.getExtensionFromBase64(base64); // 取得副檔名
                            if (extension !== "") {
                                let path = await WV_File.Base64ToTempFile(base64, extension);
                                await reloadImageAfterDownload(path); // 下載檔案後，判斷是否需要重新載入圖片
                            }
                        }
                        // Toast.show(i18n.t("msg.unsupportedFileTypes"), 1000 * 3); // 不支援的檔案類型
                    }

                } else if (text.indexOf("data:image/") === 0) { // base64

                    e.preventDefault();

                    let base64 = text;
                    let extension = await Lib.getExtensionFromBase64(base64); // 取得副檔名
                    if (extension !== "") {
                        let path = await WV_File.Base64ToTempFile(base64, extension);
                        await reloadImageAfterDownload(path); // 下載檔案後，判斷是否需要重新載入圖片
                    }

                } else if (text.search(/^http[s]:[/][/]/) === 0) { // 如果是超連結

                    e.preventDefault();

                    let file = await downloadFileFromUrl(text);
                    if (file != null) {
                        let base64 = await Lib.readFileAsDataURL(file);
                        let extension = await Lib.getExtensionFromBase64(base64); // 取得副檔名
                        if (extension !== "") {
                            let path = await WV_File.Base64ToTempFile(base64, extension);
                            await reloadImageAfterDownload(path); // 下載檔案後，判斷是否需要重新載入圖片
                        }
                    }
                } else if (textUrl.search(/^file:[/][/]/) === 0) { // 某些應用程式的檔案連結，例如vscode

                    e.preventDefault();
                    let path = Lib.URLToPath(textUrl);
                    await fileLoad.loadFile(path);

                } else if ((text === "" || text.indexOf("file://") === 0) && files.length > 0) { // 本機的檔案

                    // 取得拖曳進來的檔案路徑
                    chrome.webview.postMessageWithAdditionalObjects("FilesDropped", files);
                    let arFile = await baseWindow.getDropPath();

                    if (arFile === undefined) { return; }
                    await fileLoad.loadDropFile(arFile);
                    e.preventDefault();

                }
            }

            // ----------------

            // 如果點擊google map的超連結，就用瀏覽器打開
            baseWindow.onNewWindowRequested = (url: string) => {
                if (url.indexOf("https://maps.google.com/") === 0) {
                    WV_RunApp.OpenUrl(url);
                }
            }

            // 按下右鍵時
            baseWindow.onRightClick = (x: number, y: number) => {
                // console.log(x, y);
                x = x / window.devicePixelRatio;
                y = y / window.devicePixelRatio;
                if (y <= 30) {
                    mainMenu.showMenu(new MouseEvent("mouseup"), x, y);
                }
            }

        })();

        /**
         * 下載檔案
         */
        async function downloadFileFromUrl(imageUrl: string): Promise<File | null> {
            const timeout = 20 * 1000; // 逾時
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            script.window.enabledLoading(true);

            try {
                const response = await fetch(imageUrl, { signal: controller.signal });

                // 判斷請求是否成功
                if (response.status !== 200) {
                    Toast.show(i18n.t("msg.fileDownloadFailed") + ` (code:${response.status})`, 1000 * 3); // 檔案下載失敗
                    return null;
                }

                // 判斷檔案大小
                const contentLength = response.headers.get("content-length");
                if (contentLength && parseInt(contentLength, 10) > 50 * 1000 * 1000) { // 50m
                    Toast.show(i18n.t("msg.fileSizeExceededLimit"), 1000 * 3); // 檔案大小超過限制
                    return null;
                }

                // 判斷檔案類型是否為圖片
                const contentType = response.headers.get("content-type");
                // console.log(contentType)
                if (!contentType || !contentType.startsWith("image/")) {
                    Toast.show(i18n.t("msg.unsupportedFileTypes"), 1000 * 3); // 不支援的檔案類型
                    return null;
                }

                const blob = await response.blob();
                const fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
                return new File([blob], fileName, { type: response.headers.get("content-type") ?? "application/octet-stream" });
            } catch (error) {
                Toast.show(i18n.t("msg.fileDownloadFailed"), 1000 * 3); // 檔案下載失敗
                console.error(error);
                return null;
            } finally {
                clearTimeout(timeoutId);
                script.window.enabledLoading(false);
            }
        }

        /**
         * 覆寫 onCreate (由C#呼叫)
         * @param json 
         */
        baseWindow.onCreate = async (json: AppInfo) => {

            baseWindow.appInfo = json;
            startType = json.startType;

            isQuickLook = false;

            if (json.quickLookRunType === 0) { // 一般啟動

                if (firstRun === true) { // 首次開啟視窗

                    firstRun = false;

                    initSetting(json.settingTxt); // 初始讀取設定
                    await initLastPosition(); // 初始 套用上次的視窗狀態與坐標
                    initLoad(json.args); // 初始 載入檔案
                    initAERO(); // 初始 套用aero毛玻璃效果

                } else { // 單純開啟圖片(用於 單一執行個體)

                    WV_Window.ShowWindow(); // 顯示視窗 
                    initLoad(json.args); // 初始載入檔案
                }
            }

            if (json.quickLookRunType !== 0) { // 快速預覽

                msgbox.closeAll();
                initSetting(json.settingTxt); // 初始讀取設定

                let isKeyboardSpace = json.quickLookRunType === 1; // 按著空白鍵
                let isMouseMiddle = json.quickLookRunType === 2; // 按著滑鼠中鍵(滾輪)

                if ((isKeyboardSpace && config.settings.quickLook.keyboardSpaceRun) ||
                    (isMouseMiddle && config.settings.quickLook.mouseMiddleRun)) {

                    if (startType == 4 || startType == 5) { // 單純開啟圖片(用於 單一執行個體)
                        WV_Window.ShowWindow(); // 顯示視窗 
                        initLoad(json.args); // 初始載入檔案
                    } else {
                        isQuickLook = true;
                        fileShow.openNone(); // 避免卡在上一張圖片
                        await initQuickLookPosition(); // 初始 快速啟動的坐標   
                        initLoad(json.args); // 初始 載入檔案
                        initAERO(); // 初始 套用aero毛玻璃效果
                    }
                    checkDownKey();
                }
            }

            window.focus();

            setTimeout(() => { // 延遲執行，避免剛啟動視窗時，因被搶走焦點導致右鍵選單被關閉
                window.onblur = function () { // 視窗失去焦點
                    menu.close(); // 關閉menu
                };
            }, 1000);
        }

        /**
         * 關閉 快速預覽 (由C#呼叫)
         */
        async function quickLookUp() {
            // 如果是單一執行個體，就不關閉視窗
            if (startType === 2 || startType === 3) {
                fileShow.openNone();
                await WV_Window.Hide();
            }
            // console.log("關閉 快速預覽")
        }

        /** 
         * 初始 快速預覽的視窗坐標
         */
        async function initQuickLookPosition() {

            // 取得滑鼠所在的螢幕資訊
            let mousePosition = await WV_System.GetMousePosition();
            let screen = await WV_System.GetScreenFromPoint(mousePosition[0], mousePosition[1]);
            let screenX = screen[0];
            let screenY = screen[1];
            let screenW = screen[2];
            let screenH = screen[3];

            let rate = 0.8; // 全螢幕的80%

            // 置中的坐標與size
            let width = screenW * rate;
            let height = screenH * rate;
            let left = screenX + ((screenW - width) / 2);
            let top = screenY + ((screenH - height) / 2);

            await WV_Window.ShowWindowAtPosition(left, top, width, height, "Normal"); // 顯示視窗 
        }

        /** 
         * 初始 套用上次的視窗狀態與坐標
         */
        async function initLastPosition() {
            let txtPosition = config.settings.position;
            if (txtPosition.left !== -9999) {
                if (txtPosition.windowState == "Maximized") {
                    await WV_Window.ShowWindowAtPosition(
                        txtPosition.left, txtPosition.top,
                        // 800 * window.devicePixelRatio, 600 * window.devicePixelRatio,
                        txtPosition.width, txtPosition.height,
                        "Maximized"
                    ); // 顯示視窗 
                } else if (txtPosition.windowState == "Normal") {
                    await WV_Window.ShowWindowAtPosition(
                        txtPosition.left, txtPosition.top,
                        txtPosition.width, txtPosition.height,
                        "Normal"
                    ); // 顯示視窗 
                } else {
                    await WV_Window.ShowWindow(); // 顯示視窗 
                    await WV_Window.SetSize(800 * window.devicePixelRatio, 600 * window.devicePixelRatio); // 初始化視窗大小
                }

            } else {

                await WV_Window.ShowWindow(); // 顯示視窗 
                await WV_Window.SetSize(800 * window.devicePixelRatio, 600 * window.devicePixelRatio); // 初始化視窗大小

            }
        }

        /** 
         * 初始 載入檔案
         */
        async function initLoad(args: string[]) {
            msgbox.closeAll(); // 關閉所有訊息視窗
            menu.close();

            // 如果是長路經，路徑開頭會是「\\?\」，將其去除
            args = args.map(arg => arg.startsWith("\\\\?\\") ? arg.slice(4) : arg);

            if (args.length > 0 && args[0] === "none") {
                args.shift(); // 把陣列的第一個元素從其中刪除
            }

            // 解析多幀圖片
            if (args.length >= 2 && args[0] === "showFrames") {
                script.window.enabledLoading(true);
                args.shift(); // 把陣列的第一個元素從其中刪除
                try {
                    let dirPath = await WebAPI.extractFrames(args[0]);
                    script.bulkView.show();
                    await fileLoad.loadFile(dirPath); // 載入單張圖片
                } catch {
                    fileShow.openWelcome();
                    Toast.show(i18n.t("msg.imageAnalysisFailed"), 1000 * 3); // 圖片解析失敗
                }

                script.window.enabledLoading(false);
                return;
            }

            if (args.length === 0) {
                fileShow.openWelcome();

            } else if (args.length === 1) {
                if (args[0] === "") {
                    fileShow.openWelcome();
                } else {
                    await fileLoad.loadFile(args[0]); // 載入單張圖片
                }

            } else {

                let arPath = await WebAPI.Directory.getFiles2(args);
                await fileLoad.loadFiles(arPath); // 載入多張圖片

            }

            // 在圖片載入完成後，更新「用其他APP開啟檔案」的列表
            setTimeout(() => {
                mainMenu.updateOtherAppList(undefined);
            }, 1000 * 2);
        }

        /** 
         * 初始 讀取設定
         */
        function initSetting(settingTxt: string) {
            var userSetting = {};
            try {
                userSetting = JSON.parse(settingTxt);
            } catch (e) { }
            $.extend(true, config.settings, userSetting);
            applySetting(config.settings, true);
        }

        var isInitAERO = false; // 避免重複套用AERO
        /** 
         * 初始 套用aero毛玻璃效果
         */
        function initAERO() {
            if (isInitAERO) { return; }

            let aeroType = config.settings["theme"]["aeroType"];
            if (aeroType == "win10") {
                WV_Window.SetAERO("win10");
                isInitAERO = true;
            } else if (aeroType == "win7") {
                WV_Window.SetAERO("win7");
                isInitAERO = true;
            }
        }

        /**
         * 再次檢查目前是否按著空白鍵或滑鼠中鍵
         */
        async function checkDownKey() {

            let json = JSON.parse(await WV_System.GetDownKey());
            let keyboardSpaceRun = config.settings.quickLook.keyboardSpaceRun;
            let mouseMiddleRun = config.settings.quickLook.mouseMiddleRun;
            if ((json.isKeyboardSpace && keyboardSpaceRun) || (json.isMouseMiddle && mouseMiddleRun)) {

            } else {
                quickLookUp(); // 關閉 快速預覽
            }
        }

        /**
         * 目前是否為快速預覽
         */
        function getIsQuickLook() {
            return isQuickLook;
        }

        /**
         * 更新元素顯示或隱藏
         * <div show-not="img,txt,"> 表示在img或txt的狀態下，不顯示此元素
         * <div show-only="img,txt,"> 表示僅在img或txt的狀態下，顯示此元素
         * 結尾一定要「,」
         */
        function updateDomVisibility() {

            let bodyShowType = document.body.getAttribute("showType");
            if (bodyShowType === null) { return; }

            function getShowType(dom: Element) {
                while (true) { // 取得 bulkView-item 的 data-path
                    let showType = dom.getAttribute("showType");
                    if (showType !== null && showType !== "") {
                        return showType;
                    }
                    if (dom === document.body) { break; }
                    dom = dom.parentNode as HTMLElement; // 往往上層找
                }
                return bodyShowType;
            }

            let arDom = document.querySelectorAll(`[show-not]`);
            for (let i = 0; i < arDom.length; i++) {
                const dom = arDom[i];
                let showType = getShowType(dom);
                if (dom.getAttribute("show-not")?.indexOf(showType + ",") !== -1) {
                    dom.classList.add("js-showType-none");
                } else {
                    dom.classList.remove("js-showType-none");
                }
            }

            arDom = document.querySelectorAll(`[show-only]`);
            for (let i = 0; i < arDom.length; i++) {
                const dom = arDom[i];
                let showType = getShowType(dom);
                if (dom.getAttribute("show-only")?.indexOf(showType + ",") !== -1) {
                    dom.classList.remove("js-showType-none");
                } else {
                    dom.classList.add("js-showType-none");
                }
            }
        }

        /**
         * 套用設定
         * @param _settings 
         * @param isStart 是否為第一次呼叫
         */
        function applySetting(_settings: any, isStart = false) {

            let cssRoot = document.body;

            config.settings = _settings;

            // -----------

            // 語言
            let lang = script.window.getLang();
            i18n.setLang(lang);

            // -----------
            let dpizoom = Number(config.settings["image"]["dpizoom"]); // 圖片DPI縮放
            if (dpizoom == -1 || isNaN(dpizoom)) { dpizoom = -1; }
            fileShow.tiefseeview.setDpizoom(dpizoom);

            let tiefseeviewImageRendering = Number(config.settings["image"]["tiefseeviewImageRendering"]); // 設定 圖片的渲染模式
            fileShow.tiefseeview.setRendering(tiefseeviewImageRendering);

            baseWindow.setZoomFactor(config.settings["theme"]["zoomFactor"]); // 視窗縮放
            cssRoot.style.setProperty("--svgWeight", config.settings["theme"]["svgWeight"]); // 圖示粗細

            // document.body.style.fontWeight = config.settings["theme"]["fontWeight"]; // 文字粗細
            let fontWeight = Number.parseInt(config.settings["theme"]["fontWeight"]);
            let fontWeightBole = Number.parseInt(config.settings["theme"]["fontWeight"]) + 200;
            cssRoot.style.setProperty("--fontWeight", fontWeight.toString()); // 文字粗細(一般)
            cssRoot.style.setProperty("--fontWeightBold", fontWeightBole.toString()); // 文字粗細(粗體)

            // -----------

            mainToolbar.setEnabled(config.settings.layout.mainToolbarEnabled); // 工具列
            dom_toolbar.setAttribute("toolbarAlign", config.settings.layout.mainToolbarAlign); // 工具列對齊

            mainFileList.setEnabled(config.settings.layout.fileListEnabled); // 檔案預覽視窗
            mainFileList.setShowNo(config.settings.layout.fileListShowNo);
            mainFileList.setShowName(config.settings.layout.fileListShowName);
            if (isStart) { mainFileList.setItemWidth(config.settings.layout.fileListShowWidth); }

            mainDirList.setEnabled(config.settings.layout.dirListEnabled); // 資料夾預覽視窗
            mainDirList.setShowNo(config.settings.layout.dirListShowNo);
            mainDirList.setShowName(config.settings.layout.dirListShowName);
            mainDirList.setImgNumber(config.settings.layout.dirListImgNumber);
            if (isStart) { mainDirList.setItemWidth(config.settings.layout.dirListShowWidth); }

            mainExif.setEnabled(config.settings.layout.mainExifEnabled); // 詳細資料視窗
            if (isStart) { mainExif.setItemWidth(config.settings.layout.mainExifShowWidth); }
            cssRoot.style.setProperty("--mainExifMaxLine", config.settings.layout.mainExifMaxLine + ""); // 顯示的最大行數(1~1000)
            mainExif.setHorizontal(config.settings.layout.mainExifHorizontal); // 寬度足夠時，橫向排列
            mainExif.setRelatedFilesEnabled(config.settings.layout.relatedFilesEnabled); // 顯示相關檔案

            // -----------

            // 工具列順序與是否顯示
            const arGroupName = ["img", "pdf", "txt", "bulkView"];
            arGroupName.map((gn) => {
                let groupName = gn as ("img" | "pdf" | "txt" | "bulkView");

                let dom_group = dom_toolbar.querySelector(`.main-toolbar-group[data-name=${groupName}]`) as HTMLElement;
                let arMainToolbar = config.settings.mainToolbar[groupName];
                for (let i = 0; i < arMainToolbar.length; i++) {
                    const item = arMainToolbar[i];
                    let dom_btn = dom_group.querySelector(`[data-name="${item.n}"]`) as HTMLElement;
                    if (dom_btn === null) { continue; }
                    if (dom_btn.getAttribute("data-name") == "showBulkViewSetting") { continue; } // 大量瀏覽模式設定

                    dom_btn.style.order = i + ""; // 排序
                    dom_btn.style.display = (item.v) ? "" : "none"; // 顯示或隱藏
                }
            })

            // -----------

            // 大型切換按鈕
            largeBtn.setShowType(config.settings.layout.largeBtn);

            // -----------

            // 大量瀏覽模式一頁顯示的圖片數量
            bulkView.setImgMaxCount(config.settings.bulkView.imgMaxCount);

            // -----------

            // 圖片面積大於這個數值的平方，就禁用高品質縮放
            let imageArea = Number(config.settings.advanced.highQualityLimit);
            if (imageArea == -1) { imageArea = 999999; }
            imageArea = imageArea * imageArea;
            fileShow.tiefseeview.setEventHighQualityLimit(() => { return imageArea; })

            // -----------

            // 套用顏色
            cssRoot.style.setProperty("--window-border-radius", config.settings.theme["--window-border-radius"] + "px");
            initColor("--color-window-background", true);
            initColor("--color-window-border", true);
            initColor("--color-white");
            initColor("--color-black");
            initColor("--color-blue");
            // initColor("--color-grey");
            function initColor(name: string, opacity: boolean = false) {
                // @ts-ignore
                let c = config.settings.theme[name];

                if (opacity) {
                    cssRoot.style.setProperty(name, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a} )`);
                } else {
                    for (let i = 1; i < 9; i++) {
                        cssRoot.style.setProperty(name + `${i}0`, `rgba(${c.r}, ${c.g}, ${c.b}, ${(i / 10)} )`)
                    }
                    cssRoot.style.setProperty(name, `rgba(${c.r}, ${c.g}, ${c.b}, 1 )`);
                }
            }

            fileShow.iframes.setTheme();
        }

        /**
         * 儲存 setting.json
         */
        async function saveSetting() {

            // 視窗目前的狀態
            config.settings.position.left = baseWindow.left;
            config.settings.position.top = baseWindow.top;
            // config.settings.position.width = baseWindow.width;
            // config.settings.position.height = baseWindow.height;
            config.settings.position.windowState = baseWindow.windowState;

            // 儲存 setting.json
            let s = JSON.stringify(config.settings, null, "\t");
            var path = await WV_Window.GetAppDataPath(); // 程式的暫存資料夾
            path = Lib.Combine([path, "Setting.json"]);
            await WV_File.SetText(path, s);
        }

    }
}

/**
 * 頁面的返回按鈕
 */
class ToolbarBack {

    public visible;
    public getVisible;
    public setEvent;
    public runEvent;

    constructor() {

        var btn = document.querySelector("#toolbar-back") as HTMLElement;
        var clickEvent: () => void = () => { }
        var active = false;

        this.visible = visible;
        this.getVisible = getVisible;
        this.setEvent = setEvent;
        this.runEvent = runEvent;

        btn.addEventListener("click", () => {
            clickEvent();
        })

        /** 
         * 設定顯示或隱藏dom
         */
        function visible(val: boolean) {
            if (val === true) {
                btn.setAttribute("active", "true");
                active = true;
            } else {
                btn.setAttribute("active", "");
                active = false;
            }
        }

        function getVisible() {
            return active;
        }

        /**
         * 設定新的click事件
         * @param func 
         */
        function setEvent(func: () => void) {
            clickEvent = func;
        }

        /**
         * 執行click事件
         */
        function runEvent() {
            clickEvent();
        }

    }
}


/**
 * 全螢幕
 */
class FullScreen {

    M: MainWindow;

    /** 是否啟用全螢幕 */
    private enabled = false;
    /** 當前是否顯示標題列 */
    private showTitlebar = false;
    /** 標題列 */
    private domTitleBar = document.querySelector("#window-titlebar") as HTMLDivElement;
    /** 工具列 */
    private domMainT = document.querySelector("#main-T") as HTMLDivElement;
    /** 標題列 - 離開全螢幕 */
    private btnExitFullScreen = document.querySelector(".titlebar-toolbar-exitFullScreen") as HTMLDivElement;

    /** 滑鼠移到視窗頂端時，顯示標題列與工具列 */
    private mousemoveEvent = (e: MouseEvent) => {
        // if (this.M.menu.getIsShow()) { return; }
        if (this.showTitlebar === false && e.clientY <= 5) {
            this.showTitlebar = true;
            document.body.setAttribute("showTitlebar", "true");
        } else if (this.showTitlebar === true && e.clientY < this.domTitleBar.offsetHeight + this.domMainT.offsetHeight + 10) {
            this.showTitlebar = true;
            document.body.setAttribute("showTitlebar", "true");
        } else {
            this.showTitlebar = false;
            document.body.setAttribute("showTitlebar", "false");
        }
    };

    /** 視窗化後就結束全螢幕 */
    private exitEvent = async () => {
        if (this.getEnabled() === true && baseWindow.windowState !== "Maximized") {
            this.setEnabled(false);
        }
    }

    /**
     * 
     */
    constructor(M: MainWindow) {
        this.M = M;

        // 結束全螢幕
        this.btnExitFullScreen.addEventListener("click", () => {
            this.setEnabled(false);
        });
    }

    /**
     * 取得 是否啟用全螢幕
     */
    public getEnabled() {
        return this.enabled;
    }

    /**
     * 啟用或關閉全螢幕
     * @param val 
     */
    public async setEnabled(val?: boolean) {
        if (val === undefined) {
            val = !this.enabled;
        }
        this.enabled = val;
        this.M.menu.close();

        await WV_Window.SetFullScreen(val);

        if (val) {
            document.body.setAttribute("fullScreen", "true");
            document.addEventListener("mousemove", this.mousemoveEvent);
            baseWindow.sizeChangeEvents.push(this.exitEvent);
        } else {
            document.body.setAttribute("fullScreen", "false");
            document.removeEventListener("mousemove", this.mousemoveEvent);
            // 移除事件
            const index = baseWindow.sizeChangeEvents.indexOf(this.exitEvent);
            if (index > -1) {
                baseWindow.sizeChangeEvents.splice(index, 1);
            }
        }

    }
}
