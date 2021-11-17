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
        btn_menu.addEventListener("click", e => {
            //alert()
        });
        btn_topmost.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            this.topMost = yield WV_Window.TopMost;
            if (this.topMost === true) {
                btn_topmost.setAttribute("active", "");
            }
            else {
                btn_topmost.setAttribute("active", "true");
            }
            WV_Window.TopMost = !this.topMost;
        }));
        btn_normal.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            this.normal();
        }));
        btn_minimized.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            this.minimized();
        }));
        btn_maximized.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            this.maximized();
        }));
        btn_close.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            WV_Window.Close();
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
            }));
        }
    }
    SizeChanged(left, top, width, height, windowState) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.windowState = windowState;
        this.initWindowState();
    }
    Move(left, top, width, height, windowState) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.windowState = windowState;
        //this.initWindowState();
    }
    VisibleChanged() {
        console.log("VisibleChanged");
    }
    FormClosing() {
        console.log("FormClosing");
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
     * 取得拖曳進來的檔案路徑
     * @returns
     */
    GetDropPath() {
        return __awaiter(this, void 0, void 0, function* () {
            //觸發拖曳檔案後，C#會修改全域變數temp_dropPath
            let _dropPath = "";
            for (let i = 0; i < 100; i++) {
                yield sleep(10);
                if (temp_dropPath !== "") {
                    _dropPath = temp_dropPath;
                    _dropPath = decodeURIComponent(temp_dropPath);
                    if (_dropPath.indexOf("file:///") === 0) {
                        _dropPath = _dropPath.substr(8);
                    }
                    break;
                }
            }
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
}
//---------------
/**
 * 匯入外部檔案
 */
function initDomImport() {
    return __awaiter(this, void 0, void 0, function* () {
        let ar_dom = document.querySelectorAll("import");
        for (let i = 0; i < ar_dom.length; i++) {
            const _dom = ar_dom[i];
            let src = _dom.getAttribute("src");
            if (src != null)
                yield fetch(src, {
                    "method": "get",
                }).then((response) => {
                    return response.text();
                }).then((html) => {
                    _dom.outerHTML = html;
                }).catch((err) => {
                    console.log("error: ", err);
                });
        }
    });
}
/**
 * html字串 轉 dom物件
 * @param html
 * @returns
 */
function newDiv(html) {
    let div = document.createElement("div");
    div.innerHTML = html;
    return div.getElementsByTagName("div")[0];
}
/**
 * 等待
 * @param ms 毫秒
 */
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise((resolve, reject) => {
            setTimeout(function () {
                resolve(0); //繼續往下執行
            }, ms);
        });
    });
}
/**
 * 轉 number
 */
function toNumber(t) {
    if (typeof (t) === "number") {
        return t;
    } //如果本來就是數字，直接回傳     
    if (typeof t === 'string') {
        return Number(t.replace('px', ''));
    } //如果是string，去掉px後轉型成數字
    return 0;
}
/**
 * 對Date的擴充套件，將 Date 轉化為指定格式的String
 * 月(M)、日(d)、小時(h)、分(m)、秒(s)、季度(q) 可以用 1-2 個佔位符，
 * 年(y)可以用 1-4 個佔位符，毫秒(S)只能用 1 個佔位符(是 1-3 位的數字)
 * 例子：
 * (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 * (new Date()).format("yyyy-M-d h:m:s.S")   ==> 2006-7-2 8:9:4.18
 */
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds() //millisecond
    };
    if (/(y+)/.test(format))
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
};
