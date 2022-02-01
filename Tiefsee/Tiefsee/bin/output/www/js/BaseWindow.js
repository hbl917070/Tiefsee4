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
//@ts-ignore
var cef = window.chrome.webview.hostObjects;
var WV_Window = cef.WV_Window;
var WV_Directory = cef.WV_Directory;
var WV_File = cef.WV_File;
var WV_Path = cef.WV_Path;
var WV_System = cef.WV_System;
var WV_RunApp = cef.WV_RunApp;
var WV_Image = cef.WV_Image;
var baseWindow;
var temp_dropPath = ""; //暫存。取得拖曳進視窗的檔案路徑
class BaseWindow {
    constructor() {
        this.topMost = false;
        this.left = 0;
        this.top = 0;
        this.width = 0;
        this.height = 0;
        this.windowState = "Normal";
        this.closingEvents = []; //關閉視窗時執行的function
        this.sizeChangeEvents = []; //sizeChange時執行的function
        var dom_window = document.querySelector('.window');
        var btn_menu = document.querySelector(".titlebar-tools-menu");
        var btn_topmost = document.querySelector(".titlebar-tools-topmost");
        var btn_normal = document.querySelector(".titlebar-tools-normal");
        var btn_minimized = document.querySelector(".titlebar-tools-minimized");
        var btn_maximized = document.querySelector(".titlebar-tools-maximized");
        var btn_close = document.querySelector(".titlebar-tools-close");
        var dom_titlebarTxt = document.querySelector(".titlebar-txt");
        this.dom_window = dom_window;
        this.btn_menu = btn_menu;
        this.btn_topmost = btn_topmost;
        this.btn_normal = btn_normal;
        this.btn_minimized = btn_minimized;
        this.btn_maximized = btn_maximized;
        this.btn_close = btn_close;
        this.dom_titlebarTxt = dom_titlebarTxt;
        /*//判斷作業系統類型
        //@ts-ignore
        navigator.userAgentData.getHighEntropyValues(["platformVersion"]).then(ua => {
            //@ts-ignore
            if (navigator.userAgentData.platform === "Windows") {
                const majorPlatformVersion = parseInt(ua.platformVersion.split('.')[0]);
                if (majorPlatformVersion >= 13) {
                    console.log("Windows 11 or later");
                    dom_window.setAttribute("os","win11");
                }
            }
        });*/
        (() => __awaiter(this, void 0, void 0, function* () {
            //判斷目前的狀態是視窗化還是最大化
            this.windowState = yield WV_Window.WindowState;
            this.initWindowState();
        }))();
        btn_menu === null || btn_menu === void 0 ? void 0 : btn_menu.addEventListener("click", e => {
            //alert()
        });
        btn_topmost === null || btn_topmost === void 0 ? void 0 : btn_topmost.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            this.topMost = yield WV_Window.TopMost;
            if (this.topMost === true) {
                btn_topmost.setAttribute("active", "");
            }
            else {
                btn_topmost.setAttribute("active", "true");
            }
            WV_Window.TopMost = !this.topMost;
        }));
        btn_normal === null || btn_normal === void 0 ? void 0 : btn_normal.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            this.normal();
        }));
        btn_minimized === null || btn_minimized === void 0 ? void 0 : btn_minimized.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            this.minimized();
        }));
        btn_maximized === null || btn_maximized === void 0 ? void 0 : btn_maximized.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            this.maximized();
        }));
        btn_close === null || btn_close === void 0 ? void 0 : btn_close.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            this.close();
        }));
        //double click 最大化或視窗化
        Lib.addEventDblclick(dom_titlebarTxt, () => __awaiter(this, void 0, void 0, function* () {
            let WindowState = this.windowState;
            if (WindowState === "Maximized") {
                this.normal();
            }
            else {
                setTimeout(() => {
                    this.maximized();
                }, 50);
            }
        }));
        //註冊視窗邊框拖曳
        windowBorder(document.querySelector(".window-CT"), "CT");
        windowBorder(document.querySelector(".window-RC"), "RC");
        windowBorder(document.querySelector(".window-CB"), "CB");
        windowBorder(document.querySelector(".window-LC"), "LC");
        windowBorder(document.querySelector(".window-LT"), "LT");
        windowBorder(document.querySelector(".window-RT"), "RT");
        windowBorder(document.querySelector(".window-LB"), "LB");
        windowBorder(document.querySelector(".window-RB"), "RB");
        windowBorder(document.querySelector(".window-titlebar .titlebar-txt"), "move");
        function windowBorder(_dom, _type) {
            _dom.addEventListener("mousedown", (e) => __awaiter(this, void 0, void 0, function* () {
                if (e.button === 0) { //滑鼠左鍵
                    yield WV_Window.WindowDrag(_type);
                }
            }));
            _dom.addEventListener("touchstart", (e) => __awaiter(this, void 0, void 0, function* () {
                //await WV_Window.WindowDrag(_type);
                //window.chrome.webview.hostObjects.sync.WV_Window.WindowDrag(_type);
                //e.preventDefault();
                //e.stopPropagation();
            }));
        }
    }
    /**
     * 取得拖曳進來的檔案路徑
     * @returns
     */
    getDropPath() {
        return __awaiter(this, void 0, void 0, function* () {
            //觸發拖曳檔案後，C#會修改全域變數temp_dropPath
            let _dropPath = "";
            for (let i = 0; i < 100; i++) {
                if (temp_dropPath !== "") {
                    _dropPath = temp_dropPath;
                    _dropPath = decodeURIComponent(temp_dropPath);
                    if (_dropPath.indexOf("file:///") === 0) {
                        _dropPath = _dropPath.substr(8);
                    }
                    break;
                }
                yield sleep(10);
            }
            temp_dropPath = "";
            _dropPath = _dropPath.replace(/[/]/g, "\\");
            return _dropPath;
        });
    }
    /**
     * 設定視窗標題
     * @param txt
     */
    setTitle(txt) {
        return __awaiter(this, void 0, void 0, function* () {
            WV_Window.Text = txt;
            this.dom_titlebarTxt.innerHTML = `<span>${txt}</span>`;
        });
    }
    /**
     * 開啟新的子視窗
     * @param _name
     * @returns
     */
    newWindow(_name) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = location.protocol + '//' + location.host + "/www/" + _name;
            var w = yield WV_Window.NewWindow(url, []);
            WV_Window.SetOwner(w); //設為子視窗
            //w.Focus();//取得焦點
            return w;
        });
    }
    /**
     * 關閉視窗
     */
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < this.closingEvents.length; i++) {
                yield this.closingEvents[i]();
            }
            WV_Window.Close();
        });
    }
    /** 最大化 */
    maximized() {
        WV_Window.WindowState = "Maximized";
        this.initWindowState();
    }
    /** 最小化 */
    minimized() {
        WV_Window.WindowState = "Minimized";
    }
    /** 視窗化 */
    normal() {
        WV_Window.WindowState = "Normal";
        this.initWindowState();
    }
    initWindowState() {
        if (this.windowState === "Maximized") {
            this.dom_window.classList.add("maximized");
            this.btn_normal.style.display = "flex";
            this.btn_maximized.style.display = "none";
        }
        else {
            this.dom_window.classList.remove("maximized");
            this.btn_normal.style.display = "none";
            this.btn_maximized.style.display = "flex";
        }
    }
    /**
     * 由C#主動呼叫。建立視窗時，必須覆寫此函數
     * @param jsonTxt
     */
    onCreate(json) {
        WV_Window.ShowWindow(); //顯示視窗 
    }
    //
    onSizeChanged(left, top, width, height, windowState) {
        return __awaiter(this, void 0, void 0, function* () {
            this.left = left;
            this.top = top;
            this.width = width;
            this.height = height;
            this.windowState = windowState;
            this.initWindowState();
            for (let i = 0; i < this.sizeChangeEvents.length; i++) {
                yield this.sizeChangeEvents[i]();
            }
        });
    }
    //由C#主動呼叫
    onMove(left, top, width, height, windowState) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.windowState = windowState;
    }
}
//---------------
