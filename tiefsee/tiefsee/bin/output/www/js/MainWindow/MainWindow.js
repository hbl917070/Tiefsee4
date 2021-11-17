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
        var config = new Config(this);
        var fileLoad = new FileLoad(this);
        var fileShow = new FileShow(this);
        var menu = new Menu(this);
        var script = new Script(this);
        new InitMenu(this);
        this.dom_tools = dom_tools;
        this.fileLoad = fileLoad;
        this.fileShow = fileShow;
        this.menu = menu;
        this.config = config;
        this.script = script;
        new MainTools(this);
        init();
        function init() {
            return __awaiter(this, void 0, void 0, function* () {
                initDomImport();
                //取得命令列參數
                let args = yield WV_Window.GetArguments();
                if (args.length === 0) {
                    fileShow.openWelcome();
                }
                else if (args.length === 1) {
                    fileLoad.loadFile(args[0]);
                }
                else {
                    fileLoad.loadFiles(args[0], args);
                }
                //封鎖原生右鍵選單
                document.addEventListener('contextmenu', function (e) {
                    e.preventDefault();
                });
                //設定icon
                function initIcon() {
                    return __awaiter(this, void 0, void 0, function* () {
                        let path = Lib.Combine([yield WV_Window.GetAppDirPath(), "www\\img\\logo.ico"]);
                        WV_Window.SetIcon(path);
                    });
                }
                initIcon();
                //圖片區域也允許拖曳視窗
                fileShow.dom_image.addEventListener("mousedown", (e) => __awaiter(this, void 0, void 0, function* () {
                    //圖片沒有出現捲動軸
                    if (fileShow.view_image.getIsOverflowX() === false && fileShow.view_image.getIsOverflowY() === false) {
                        if (e.button === 0) { //滑鼠左鍵
                            let WindowState = baseWindow.windowState;
                            if (WindowState === "Normal") {
                                WV_Window.WindowDrag("move");
                            }
                        }
                    }
                }));
                //double click 最大化或視窗化
                Lib.AddEventDblclick(baseWindow.dom_titlebarTxt, () => __awaiter(this, void 0, void 0, function* () {
                    let WindowState = baseWindow.windowState;
                    if (WindowState === "Maximized") {
                        baseWindow.normal();
                    }
                    else {
                        baseWindow.maximized();
                    }
                }));
                Lib.AddEventDblclick(dom_tools, (e) => __awaiter(this, void 0, void 0, function* () {
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
                        baseWindow.maximized();
                    }
                }));
                Lib.AddEventDblclick(fileShow.dom_image, () => __awaiter(this, void 0, void 0, function* () {
                    let WindowState = baseWindow.windowState;
                    if (WindowState === "Maximized") {
                        baseWindow.normal();
                    }
                    else {
                        baseWindow.maximized();
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
                        let _dropPath = yield baseWindow.GetDropPath();
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
    }
}
