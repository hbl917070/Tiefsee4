"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class MainWindow {
    constructor() {
        baseWindow = new BaseWindow(); //初始化視窗
        var dom_tools = document.getElementById("main-tools");
        var dom_maxBtnLeft = document.getElementById("maxBtnLeft");
        var dom_maxBtnRight = document.getElementById("maxBtnRight");
        var config = new Config();
        var fileLoad = new FileLoad(this);
        var fileShow = new FileShow(this);
        var menu = new Menu(this);
        var script = new Script(this);
        let firstRun = true; //用於判斷是否為第一次執行
        this.dom_tools = dom_tools;
        this.dom_maxBtnLeft = dom_maxBtnLeft;
        this.dom_maxBtnRight = dom_maxBtnRight;
        this.fileLoad = fileLoad;
        this.fileShow = fileShow;
        this.menu = menu;
        this.config = config;
        this.script = script;
        this.readSetting = applySetting;
        new MainTools(this);
        init();
        //WV_Window.ShowWindow();//顯示視窗 
        //關閉視窗前觸發
        baseWindow.closingEvents.push(() => __awaiter(this, void 0, void 0, function* () {
            //視窗目前的狀態
            let jsonPosition = {
                left: baseWindow.left,
                top: baseWindow.top,
                width: baseWindow.width,
                height: baseWindow.height,
                windowState: baseWindow.windowState
            };
            //window.localStorage.setItem("position", JSON.stringify(jsonPosition));
            config.settings.position = jsonPosition;
            //儲存 setting.json
            let s = JSON.stringify(config.settings, null, '\t');
            var path = yield WV_Window.GetAppDataPath(); //程式的暫存資料夾
            path = Lib.Combine([path, "setting.json"]);
            yield WV_File.SetText(path, s);
        }));
        /**
         * 覆寫 onCreate
         * @param json
         */
        baseWindow.onCreate = (json) => __awaiter(this, void 0, void 0, function* () {
            //document.body.style.opacity = "0";
            if (firstRun === true) { //首次開啟視窗
                firstRun = false;
                //讀取設定
                var userSetting = {};
                try {
                    userSetting = JSON.parse(json.settingTxt);
                }
                catch (e) { }
                $.extend(true, config.settings, userSetting);
                applySetting(config.settings);
                let txtPosition = config.settings.position;
                if (txtPosition.left !== -9999) {
                    if (txtPosition.windowState == "Maximized") {
                        yield WV_Window.ShowWindow_SetSize(txtPosition.left, txtPosition.top, 800 * window.devicePixelRatio, 600 * window.devicePixelRatio, "Maximized"); //顯示視窗 
                    }
                    else if (txtPosition.windowState == "Normal") {
                        yield WV_Window.ShowWindow_SetSize(txtPosition.left, txtPosition.top, txtPosition.width, txtPosition.height, "Normal"); //顯示視窗 
                    }
                    else {
                        yield WV_Window.ShowWindow(); //顯示視窗 
                        yield WV_Window.SetSize(800 * window.devicePixelRatio, 600 * window.devicePixelRatio); //初始化視窗大小
                    }
                }
                else {
                    yield WV_Window.ShowWindow(); //顯示視窗 
                    yield WV_Window.SetSize(800 * window.devicePixelRatio, 600 * window.devicePixelRatio); //初始化視窗大小
                }
                //document.body.style.opacity = "1";
                //await sleep(100);
                new InitMenu(this);
                // baseWindow.dom_window.style.opacity ="1";
                //取得命令列參數
                let args = json.args;
                if (args.length === 0) {
                    fileShow.openWelcome();
                }
                else if (args.length === 1) {
                    fileLoad.loadFile(args[0]); //載入單張圖片
                }
                else {
                    fileLoad.loadFiles(args[0], args); //載入多張圖片
                }
                //baseWindow.dom_titlebarTxt.focus();
                if (config.settings["theme"]["aero"]) {
                    WV_Window.SetAERO(); // aero毛玻璃效果
                }
                /*setTimeout(async () => {
                    await WV_Window.This().Focus()
                    console.log("Focus")
                }, 500);*/
            }
            else { //單純開啟圖片(用於 單一執行個體)
                WV_Window.ShowWindow(); //顯示視窗 
                //取得命令列參數
                let args = json.args;
                if (args.length === 0) {
                    fileShow.openWelcome();
                }
                else if (args.length === 1) {
                    fileLoad.loadFile(args[0]); //載入單張圖片
                }
                else {
                    fileLoad.loadFiles(args[0], args); //載入多張圖片
                }
            }
        });
        /**
         *
         */
        function init() {
            return __awaiter(this, void 0, void 0, function* () {
                fileShow.openNone(); //不顯示任何東西
                initDomImport();
                WV_Window.SetMinimumSize(250 * window.devicePixelRatio, 250 * window.devicePixelRatio); //設定視窗最小size
                //設定icon
                function initIcon() {
                    return __awaiter(this, void 0, void 0, function* () {
                        let path = Lib.Combine([yield WV_Window.GetAppDirPath(), "www\\img\\logo.ico"]);
                        WV_Window.SetIcon(path);
                    });
                }
                initIcon();
                //大型換頁按鈕
                dom_maxBtnLeft.addEventListener('click', function (e) {
                    script.fileLoad.prev();
                });
                dom_maxBtnRight.addEventListener('click', function (e) {
                    script.fileLoad.next();
                });
                //封鎖原生右鍵選單
                document.addEventListener('contextmenu', function (e) {
                    e.preventDefault();
                });
                //關閉視窗前觸發
                baseWindow.closingEvents.push(() => __awaiter(this, void 0, void 0, function* () {
                    if (script.steting.temp_setting != null) { //如果有開啟 設定視窗
                        if ((yield script.steting.temp_setting.Visible) === true) {
                            yield script.steting.temp_setting.RunJs("setting.saveData();"); //關閉前先儲存設定
                            yield sleep(30); // js無法呼叫C#的非同步函數，所以必須加上延遲，避免執行js前程式就被關閉
                        }
                    }
                }));
                //圖片區域也允許拖曳視窗
                fileShow.dom_imgview.addEventListener("mousedown", (e) => __awaiter(this, void 0, void 0, function* () {
                    //圖片沒有出現捲動軸
                    if (fileShow.tieefseeview.getIsOverflowX() === false && fileShow.tieefseeview.getIsOverflowY() === false) {
                        if (e.button === 0) { //滑鼠左鍵
                            let WindowState = baseWindow.windowState;
                            if (WindowState === "Normal") {
                                WV_Window.WindowDrag("move");
                            }
                        }
                    }
                }));
                //double click 最大化或視窗化
                Lib.addEventDblclick(dom_tools, (e) => __awaiter(this, void 0, void 0, function* () {
                    //如果是按鈕就不雙擊全螢幕
                    let _dom = e.target;
                    if (_dom) {
                        if (_dom.classList.contains("js-noDrag")) {
                            return;
                        }
                    }
                    let WindowState = baseWindow.windowState;
                    if (WindowState === "Maximized") {
                        baseWindow.normal();
                    }
                    else {
                        setTimeout(() => {
                            baseWindow.maximized();
                        }, 50);
                    }
                }));
                Lib.addEventDblclick(fileShow.dom_imgview, () => __awaiter(this, void 0, void 0, function* () {
                    let WindowState = baseWindow.windowState;
                    if (WindowState === "Maximized") {
                        baseWindow.normal();
                    }
                    else {
                        setTimeout(() => {
                            baseWindow.maximized();
                        }, 50);
                    }
                }));
                Lib.addEventDblclick(fileShow.dom_welcomeview, () => __awaiter(this, void 0, void 0, function* () {
                    let WindowState = baseWindow.windowState;
                    if (WindowState === "Maximized") {
                        baseWindow.normal();
                    }
                    else {
                        setTimeout(() => {
                            baseWindow.maximized();
                        }, 50);
                    }
                }));
                //讓工具列允許拖曳視窗
                dom_tools.addEventListener("mousedown", (e) => __awaiter(this, void 0, void 0, function* () {
                    let _dom = e.target;
                    if (_dom) {
                        if (_dom.classList.contains("js-noDrag")) {
                            return;
                        }
                    }
                    if (e.button === 0) { //滑鼠左鍵
                        yield WV_Window.WindowDrag("move");
                    }
                }));
                //在工具列滾動時，進行水平移動
                dom_tools.addEventListener("mousewheel", (e) => {
                    let scrollLeft = dom_tools.scrollLeft;
                    let deltaY = 0; //上下滾動的量
                    if (e.deltaY) {
                        deltaY = e.deltaY;
                    }
                    if (deltaY > 0) { //往右
                        dom_tools.scroll(scrollLeft + 20, 0);
                    }
                    if (deltaY < 0) { //往左
                        dom_tools.scroll(scrollLeft - 20, 0);
                    }
                }, false);
                //讓歡迎畫面允許拖曳視窗
                fileShow.dom_welcomeview.addEventListener("mousedown", (e) => __awaiter(this, void 0, void 0, function* () {
                    //排除不允許拖拉的物件
                    let _dom = e.target;
                    if (_dom) {
                        if (_dom.classList.contains("js-noDrag")) {
                            return;
                        }
                    }
                    e.preventDefault();
                    if (e.button === 0) { //滑鼠左鍵
                        let WindowState = baseWindow.windowState;
                        if (WindowState === "Normal") {
                            WV_Window.WindowDrag("move");
                        }
                    }
                }));
                window.addEventListener("dragenter", dragenter, false);
                window.addEventListener("dragover", dragover, false);
                window.addEventListener('drop', drop, false);
                function dragenter(e) {
                    e.stopPropagation();
                    e.preventDefault();
                }
                function dragover(e) {
                    e.stopPropagation();
                    e.preventDefault();
                }
                function drop(e) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (e.dataTransfer === null) {
                            return;
                        }
                        let files = e.dataTransfer.files;
                        //console.log(files);
                        //取得拖曳進來的檔案路徑
                        let _dropPath = yield baseWindow.getDropPath();
                        if (_dropPath === "") {
                            return;
                        }
                        if (files.length > 1) {
                            let arFile = [];
                            for (let i = 0; i < files.length; i++) {
                                const item = files[i];
                                arFile.push(item.name);
                            }
                            _dropPath = yield WV_Path.GetDirectoryName(_dropPath);
                            yield fileLoad.loadFiles(_dropPath, arFile);
                        }
                        else {
                            yield fileLoad.loadFile(_dropPath);
                        }
                        e.stopPropagation();
                        e.preventDefault();
                    });
                }
            });
        }
        /**
         * 套用設定
         * @param setting
         */
        function applySetting(setting) {
            var cssRoot = document.documentElement;
            //@ts-ignore
            config.settings = setting;
            //-----------
            let dpizoom = Number(config.settings["image"]["dpizoom"]); //圖片DPI縮放
            if (dpizoom == -1 || isNaN(dpizoom)) {
                dpizoom = -1;
            }
            fileShow.tieefseeview.setDpizoom(dpizoom);
            let tieefseeviewImageRendering = Number(config.settings["image"]["tieefseeviewImageRendering"]); //圖片縮放模式
            fileShow.tieefseeview.setRendering(tieefseeviewImageRendering);
            WV_Window.SetZoomFactor(config.settings["theme"]["zoomFactor"]); //視窗縮放
            document.body.style.fontWeight = config.settings["theme"]["fontWeight"]; //文字粗細
            cssRoot.style.setProperty("--svgWeight", config.settings["theme"]["svgWeight"]); //圖示粗細
            //-----------
            cssRoot.style.setProperty("--window-border-radius", config.settings.theme["--window-border-radius"] + "px");
            initColor("--color-window-background", true);
            initColor("--color-window-border", true);
            initColor("--color-white");
            initColor("--color-black");
            initColor("--color-blue");
            //initColor("--color-grey");
            function initColor(name, opacity = false) {
                //@ts-ignore
                let c = config.settings.theme[name];
                if (opacity) {
                    cssRoot.style.setProperty(name, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a} )`);
                }
                else {
                    for (let i = 1; i < 9; i++) {
                        cssRoot.style.setProperty(name + `${i}0`, `rgba(${c.r}, ${c.g}, ${c.b}, ${(i / 10)} )`);
                    }
                    cssRoot.style.setProperty(name, `rgba(${c.r}, ${c.g}, ${c.b}, 1 )`);
                }
            }
        }
    }
}
