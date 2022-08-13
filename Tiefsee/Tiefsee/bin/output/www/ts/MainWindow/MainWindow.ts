var baseWindow: BaseWindow;

var mainWindow: MainWindow;
document.addEventListener("DOMContentLoaded", async () => {
    mainWindow = new MainWindow();
});

class MainWindow {

    public quickLookUp;

    public dom_tools: HTMLElement;

    public dom_mainL: HTMLElement;
    public dom_mainR: HTMLElement;

    public i18n;
    public config;
    public mainTools;
    public fileLoad;
    public fileShow;
    public fileSort;
    public dirSort;
    public mainFileList;
    public mainDirList;
    public imgSearch;
    public mainExif;
    public menu;
    public initMenu;
    public largeBtn;
    public script;
    public applySetting;
    public saveSetting;

    constructor() {

        baseWindow = new BaseWindow();//初始化視窗

        this.quickLookUp = quickLookUp;

        var dom_tools = <HTMLElement>document.getElementById("main-tools");//工具列
        var dom_mainL = <HTMLElement>document.getElementById("main-L");//左邊區域
        var dom_mainR = <HTMLElement>document.getElementById("main-R");//左邊區域
        var btn_layout = <HTMLDivElement>document.querySelector(".titlebar-tools-layout");//開啟layout選單

        let firstRun = true;//用於判斷是否為第一次執行
        let startType = 0;//1=直接啟動  2=快速啟動  3=快速啟動+常駐  4=單一執行個體  5=單一執行個體+常駐

        this.dom_tools = dom_tools;
        this.dom_mainL = dom_mainL;
        this.dom_mainR = dom_mainR;

        var config = this.config = new Config(baseWindow);
        var fileLoad = this.fileLoad = new FileLoad(this);
        var fileShow = this.fileShow = new FileShow(this);
        var fileSort = this.fileSort = new FileSort(this);
        var dirSort = this.dirSort = new DirSort(this);
        var mainFileList = this.mainFileList = new MainFileList(this);
        var mainDirList = this.mainDirList = new MainDirList(this);
        var imgSearch = this.imgSearch = new ImgSearch(this);
        var mainExif = this.mainExif = new MainExif(this);
        var mainTools = this.mainTools = new MainTools(this);
        var menu = this.menu = new Menu(this);
        var initMenu = this.initMenu = new InitMenu(this);
        var largeBtn = this.largeBtn = new LargeBtn(this);
        var script = this.script = new Script(this);

        var i18n = this.i18n = new I18n();
        i18n.pushList(langExif);
        i18n.pushList(langUi);

        this.applySetting = applySetting;
        this.saveSetting = saveSetting;

        new Hotkey(this);
        init();

        //視窗改變大小時觸發
        baseWindow.sizeChangeEvents.push(async () => {
            //必須在視窗化的狀態下記錄size，不可以在最大化的時候記錄size
            if (baseWindow.windowState === "Normal") {
                config.settings.position.width = baseWindow.width;
                config.settings.position.height = baseWindow.height;
            }
        });


        //關閉視窗前觸發
        baseWindow.closingEvents.push(async () => {
            WV_System.DeleteTemp(100, 300);//刪除圖片暫存
            await saveSetting();//儲存 setting.json
        });


        /**
         * 覆寫 onCreate (由C#呼叫)
         * @param json 
         */
        baseWindow.onCreate = async (json: AppInfo) => {

            baseWindow.appInfo = json;
            startType = json.startType;

            if (json.quickLookRunType === 0) {//一般啟動

                if (firstRun === true) { //首次開啟視窗

                    firstRun = false;

                    initSetting(json.settingTxt);//初始讀取設定
                    await initLastPosition();//初始 套用上次的視窗狀態與坐標
                    initMenu.initOpen();//初始化「開啟檔案」的menu
                    initLoad(json.args);//初始 載入檔案
                    initAERO();//初始 套用aero毛玻璃效果

                } else {//單純開啟圖片(用於 單一執行個體)

                    WV_Window.ShowWindow();//顯示視窗 
                    initLoad(json.args);//初始載入檔案
                }

            }

            if (json.quickLookRunType !== 0) {//快速啟動

                initSetting(json.settingTxt);//初始讀取設定

                let isKeyboardSpace = json.quickLookRunType === 1;//按著空白鍵
                let isMouseMiddle = json.quickLookRunType === 2;//按著滑鼠中鍵(滾輪)
                let keyboardSpaceRun = config.settings.quickLook.keyboardSpaceRun;
                let mouseMiddleRun = config.settings.quickLook.mouseMiddleRun;

                if ((isKeyboardSpace && keyboardSpaceRun) || (isMouseMiddle && mouseMiddleRun)) {
                    if (startType == 4 || startType == 5) {//單純開啟圖片(用於 單一執行個體)
                        WV_Window.ShowWindow();//顯示視窗 
                        initLoad(json.args);//初始載入檔案
                    } else {
                        await initQuickLookPosition();//初始 快速啟動的坐標
                        initMenu.initOpen();//初始化「開啟檔案」的menu
                        initLoad(json.args);//初始 載入檔案
                        //initAERO();//初始 套用aero毛玻璃效果
                    }
                    checkDownKey();
                }

            }

        }


        /** 初始 快速預覽的視窗坐標 */
        async function initQuickLookPosition() {

            //取得滑鼠所在的螢幕資訊
            let mousePosition = await WV_System.GetMousePosition();
            let screen = await WV_System.GetScreenFromPoint(mousePosition[0], mousePosition[1]);
            let screenX = screen[0];
            let screenY = screen[1];
            let screenW = screen[2];
            let screenH = screen[3];

            let rate = 0.8;//全螢幕的80%

            //置中的坐標與size
            let width = screenW * rate;
            let height = screenH * rate;
            let left = screenX + ((screenW - width) / 2);
            let top = screenY + ((screenH - height) / 2);

            await WV_Window.ShowWindow_SetSize(left, top, width, height, "Normal");//顯示視窗 
        }

        /** 初始 套用上次的視窗狀態與坐標 */
        async function initLastPosition() {
            let txtPosition = config.settings.position;
            if (txtPosition.left !== -9999) {
                if (txtPosition.windowState == "Maximized") {
                    await WV_Window.ShowWindow_SetSize(
                        txtPosition.left, txtPosition.top,
                        //800 * window.devicePixelRatio, 600 * window.devicePixelRatio,
                        txtPosition.width, txtPosition.height,
                        "Maximized"
                    );//顯示視窗 
                } else if (txtPosition.windowState == "Normal") {
                    await WV_Window.ShowWindow_SetSize(
                        txtPosition.left, txtPosition.top,
                        txtPosition.width, txtPosition.height,
                        "Normal"
                    );//顯示視窗 
                } else {
                    await WV_Window.ShowWindow();//顯示視窗 
                    await WV_Window.SetSize(800 * window.devicePixelRatio, 600 * window.devicePixelRatio);//初始化視窗大小
                }

            } else {

                await WV_Window.ShowWindow();//顯示視窗 
                await WV_Window.SetSize(800 * window.devicePixelRatio, 600 * window.devicePixelRatio);//初始化視窗大小

            }
        }

        /** 初始 載入檔案 */
        function initLoad(args: string[]) {
            Msgbox.closeAll();//關閉所有訊息視窗
            menu.close();
            if (args.length === 0) {
                fileShow.openWelcome();
            } else if (args.length === 1) {
                fileLoad.loadFile(args[0]);//載入單張圖片
            } else {
                fileLoad.loadFiles(args[0], args);//載入多張圖片
            }
        }

        /** 初始 讀取設定 */
        function initSetting(settingTxt: string) {
            var userSetting = {};
            try {
                userSetting = JSON.parse(settingTxt);
            } catch (e) { }
            $.extend(true, config.settings, userSetting);
            applySetting(config.settings, true);
        }

        /** 初始 套用aero毛玻璃效果 */
        function initAERO() {
            let aeroType = config.settings["theme"]["aeroType"];
            if (aeroType == "win10") {
                WV_Window.SetAERO("win10");
            } else if (aeroType == "win7") {
                WV_Window.SetAERO("win7");
            }
        }

        /** 再次檢查目前是否按著空白鍵或滑鼠中鍵 */
        async function checkDownKey() {

            let json = JSON.parse(await WV_System.GetDownKey());
            let keyboardSpaceRun = config.settings.quickLook.keyboardSpaceRun;
            let mouseMiddleRun = config.settings.quickLook.mouseMiddleRun;
            if ((json.isKeyboardSpace && keyboardSpaceRun) || (json.isMouseMiddle && mouseMiddleRun)) {

            } else {
                quickLookUp();//關閉 快速啟動
                //console.log("checkDownKey")
            }
        }

        /**
         * 關閉 快速啟動 (由C#呼叫)
         */
        function quickLookUp() {
            //如果是單一執行個體，就不關閉視窗
            if (startType === 2 || startType === 3) {
                fileShow.openNone();
                WV_Window.Hide();
            }
        }

        /**
         * 
         */
        async function init() {

            fileShow.openNone();//不顯示任何東西
            initDomImport();

            WV_Window.SetMinimumSize(250 * window.devicePixelRatio, 250 * window.devicePixelRatio);//設定視窗最小size

            //設定icon
            async function initIcon() {
                let path = Lib.Combine([await WV_Window.GetAppDirPath(), "www\\img\\logo.ico"]);
                WV_Window.SetIcon(path);
            }
            initIcon();

            //開啟layout選單
            btn_layout.addEventListener("click", function (e) {
                script.menu.showLayout(btn_layout);
            })



            //封鎖原生右鍵選單
            document.addEventListener("contextmenu", function (e) {
                //if (Lib.isTextFocused() === false) {//焦點不在輸入框上          
                //}
                e.preventDefault();
            })

            //關閉視窗前觸發
            baseWindow.closingEvents.push(async () => {
                if (script.setting.temp_setting != null) {//如果有開啟 設定視窗
                    if (await script.setting.temp_setting.Visible === true) {
                        await script.setting.temp_setting.RunJs("setting.saveData();");//關閉前先儲存設定
                        await sleep(30);// js無法呼叫C#的非同步函數，所以必須加上延遲，避免執行js前程式就被關閉
                    }
                }
            });

            //圖片區域也允許拖曳視窗
            fileShow.dom_imgview.addEventListener("mousedown", async (e) => {
                //圖片沒有出現捲動軸
                if (fileShow.tieefseeview.getIsOverflowX() === false && fileShow.tieefseeview.getIsOverflowY() === false) {
                    if (e.button === 0) {//滑鼠左鍵
                        let WindowState = baseWindow.windowState;
                        if (WindowState === "Normal") {
                            WV_Window.WindowDrag("move");
                        }
                    }
                }
            });
            /*fileShow.dom_imgview.addEventListener("touchstart", async (e) => {//雙指縮放時可能衝突
                //圖片沒有出現捲動軸
                if (fileShow.tieefseeview.getIsOverflowX() === false && fileShow.tieefseeview.getIsOverflowY() === false) {
                    let WindowState = baseWindow.windowState;
                    if (WindowState === "Normal") {
                        baseWindow.touchDrop.start(fileShow.dom_imgview, e, "move");
                    }
                }
            });*/

            //double click 最大化或視窗化
            Lib.addEventDblclick(dom_tools, async (e) => {//工具列
                //如果是按鈕就不雙擊全螢幕
                let _dom = e.target as HTMLDivElement;
                if (_dom) {
                    if (_dom.classList.contains("js-noDrag")) { return; }
                }
                let WindowState = baseWindow.windowState
                if (WindowState === "Maximized") {
                    baseWindow.normal();
                } else {
                    setTimeout(() => {
                        baseWindow.maximized();
                    }, 50);
                }
            });
            Lib.addEventDblclick(fileShow.dom_imgview, async () => {//圖片物件
                let WindowState = baseWindow.windowState
                if (WindowState === "Maximized") {
                    baseWindow.normal();
                } else {
                    setTimeout(() => {
                        baseWindow.maximized();
                    }, 50);
                }
            });
            Lib.addEventDblclick(fileShow.dom_welcomeview, async () => {//歡迎頁面
                let WindowState = baseWindow.windowState
                if (WindowState === "Maximized") {
                    baseWindow.normal();
                } else {
                    setTimeout(() => {
                        baseWindow.maximized();
                    }, 50);
                }
            });

            //讓工具列允許拖曳視窗
            dom_tools.addEventListener("mousedown", async (e) => {
                let _dom = e.target as HTMLDivElement;
                if (_dom) {
                    if (_dom.classList.contains("js-noDrag")) { return; }
                }
                if (e.button === 0) {//滑鼠左鍵
                    await WV_Window.WindowDrag("move");
                }
            });
            dom_tools.addEventListener("touchstart", async (e) => {
                let _dom = e.target as HTMLDivElement;
                if (_dom) {
                    if (_dom.classList.contains("js-noDrag")) { return; }
                }
                let isShowScroll = dom_tools.scrollWidth > dom_tools.clientWidth;//判斷當前是否有捲動軸
                if (isShowScroll === false) {
                    baseWindow.touchDrop.start(dom_tools, e, "move");
                }
            });

            //在工具列滾動時，進行水平移動
            dom_tools.addEventListener("mousewheel", (e: WheelEventInit) => {

                let scrollLeft = dom_tools.scrollLeft;
                let deltaY: number = 0;//上下滾動的量
                if (e.deltaY) { deltaY = e.deltaY }

                if (deltaY > 0) {//往右
                    dom_tools.scroll(scrollLeft + 20, 0)
                }
                if (deltaY < 0) {//往左
                    dom_tools.scroll(scrollLeft - 20, 0)
                }
            }, false)


            //讓歡迎畫面允許拖曳視窗
            fileShow.dom_welcomeview.addEventListener("mousedown", async (e) => {

                //排除不允許拖拉的物件
                let _dom = e.target as HTMLDivElement;
                if (_dom) {
                    if (_dom.classList.contains("js-noDrag")) { return; }
                }
                e.preventDefault();

                if (e.button === 0) {//滑鼠左鍵
                    let WindowState = baseWindow.windowState;
                    if (WindowState === "Normal") {
                        WV_Window.WindowDrag("move");
                    }
                }
            });

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

                if (e.dataTransfer === null) { return; }

                let files = e.dataTransfer.files;

                //取得拖曳進來的檔案路徑
                let _dropPath = await baseWindow.getDropPath();
                if (_dropPath === "") { return; }

                Msgbox.closeAll();//關閉所有訊息視窗
                menu.close();

                if (files.length > 1) {
                    let arFile = [];
                    for (let i = 0; i < files.length; i++) {
                        const item = files[i];
                        arFile.push(item.name);
                    }
                    let dirPath = Lib.GetDirectoryName(_dropPath);
                    if (dirPath !== null) {
                        await fileLoad.loadFiles(dirPath, arFile);
                    }
                } else {

                    await fileLoad.loadFile(_dropPath);
                }

                e.stopPropagation();
                e.preventDefault();
            }


            //----------------

            //如果點擊google map的超連結，就用瀏覽器打開
            baseWindow.onNewWindowRequested = (url: string) => {
                if (url.indexOf("https://maps.google.com/") === 0) {
                    WV_RunApp.OpenUrl(url);
                    temp_dropPath = "";
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

            //@ts-ignore
            config.settings = _settings;

            //-----------

            let dpizoom = Number(config.settings["image"]["dpizoom"]);//圖片DPI縮放
            if (dpizoom == -1 || isNaN(dpizoom)) { dpizoom = -1; }
            fileShow.tieefseeview.setDpizoom(dpizoom);

            let tieefseeviewImageRendering = Number(config.settings["image"]["tieefseeviewImageRendering"]);//圖片縮放模式
            fileShow.tieefseeview.setRendering(tieefseeviewImageRendering);

            baseWindow.setZoomFactor(config.settings["theme"]["zoomFactor"]);//視窗縮放
            document.body.style.fontWeight = config.settings["theme"]["fontWeight"];//文字粗細
            cssRoot.style.setProperty("--svgWeight", config.settings["theme"]["svgWeight"]);//圖示粗細

            //-----------

            mainTools.setEnabled(config.settings.layout.mainToolsEnabled);//工具列

            mainFileList.setEnabled(config.settings.layout.fileListEnabled);//檔案預覽列表
            mainFileList.setShowNo(config.settings.layout.fileListShowNo);
            mainFileList.setShowName(config.settings.layout.fileListShowName);
            if (isStart) { mainFileList.setItemWidth(config.settings.layout.fileListShowWidth); }

            mainDirList.setEnabled(config.settings.layout.dirListEnabled);//資料夾預覽列表
            mainDirList.setShowNo(config.settings.layout.dirListShowNo);
            mainDirList.setShowName(config.settings.layout.dirListShowName);
            mainDirList.setImgNumber(config.settings.layout.dirListImgNumber);
            if (isStart) { mainDirList.setItemWidth(config.settings.layout.dirListShowWidth); }

            mainExif.setEnabled(config.settings.layout.mainExifEnabled);//詳細資料視窗
            if (isStart) { mainExif.setItemWidth(config.settings.layout.mainExifShowWidth); }

            //-----------

            //工具列順序與是否顯示
            const arGroupName = ["img", "pdf", "txt"];
            arGroupName.map((gn) => {
                let groupName = gn as ("img" | "pdf" | "txt");

                let dom_group = dom_tools.querySelector(`.main-tools-group[data-name=${groupName}]`) as HTMLElement;
                let arMainTools = config.settings.mainTools[groupName];
                for (let i = 0; i < arMainTools.length; i++) {
                    const item = arMainTools[i];
                    let dom_btn = dom_group.querySelector(`[data-name="${item.n}"]`) as HTMLElement;
                    if (dom_btn == null) { continue; }
                    dom_btn.style.order = i + "";//排序
                    dom_btn.style.display = (item.v) ? "" : "none";//顯示或隱藏
                }

            })

            //-----------

            //大型切換按鈕
            largeBtn.setShowType(config.settings.layout.largeBtn);

            //-----------

            //圖片面積大於這個數值的平方，就禁用高品質縮放
            let imageArea = Number(config.settings.advanced.highQualityLimit);
            if (imageArea == -1) { imageArea = 999999; }
            imageArea = imageArea * imageArea;
            fileShow.tieefseeview.setEventHighQualityLimit(() => { return imageArea; })

            //-----------

            //套用顏色
            cssRoot.style.setProperty("--window-border-radius", config.settings.theme["--window-border-radius"] + "px");
            initColor("--color-window-background", true);
            initColor("--color-window-border", true);
            initColor("--color-white");
            initColor("--color-black");
            initColor("--color-blue");
            //initColor("--color-grey");
            function initColor(name: string, opacity: boolean = false) {
                //@ts-ignore
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

        }


        /**
         * 儲存 setting.json
         */
        async function saveSetting() {

            //視窗目前的狀態
            config.settings.position.left = baseWindow.left;
            config.settings.position.top = baseWindow.top;
            //config.settings.position.width = baseWindow.width;
            //config.settings.position.height = baseWindow.height;
            config.settings.position.windowState = baseWindow.windowState;

            //儲存 setting.json
            let s = JSON.stringify(config.settings, null, "\t");
            var path = await WV_Window.GetAppDataPath();//程式的暫存資料夾
            path = Lib.Combine([path, "Setting.json"]);
            await WV_File.SetText(path, s);
        }


    

    }
}

