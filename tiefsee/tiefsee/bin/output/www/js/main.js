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
var cef_window;
var baseWindow;
class MainWindow {
    constructor() {
        var tv;
        document.addEventListener("DOMContentLoaded", () => __awaiter(this, void 0, void 0, function* () {
            baseWindow = new BaseWindow();
            //載入svg
            let ar_domSvg = document.querySelectorAll("[to_dom]");
            for (let i = 0; i < ar_domSvg.length; i++) {
                const _dom = ar_domSvg[i];
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
            tv = new Tieefseeview(document.querySelector('#tiefseeview'));
            loadurl();
        }));
        function loadurl() {
            return __awaiter(this, void 0, void 0, function* () {
                let _url = "https://wall.bahamut.com.tw/B/40/5328257e8d00594e61f8b815d505cab3_4080425.JPG";
                yield tv.loadImg(_url);
                tv.transformRefresh(false);
                tv.zoomFull(TieefseeviewZoomType['full-100%']);
                $('#output-size').html(`${tv.getOriginalWidth()} , ${tv.getOriginalHeight()}`);
            });
        }
    }
}
class BaseWindow {
    constructor() {
        cef_window = cef.cef_window;
        var dom_window = document.querySelector('.window');
        var btn_menu = document.querySelector(".titlebar-tools-menu");
        var btn_topmost = document.querySelector(".titlebar-tools-topmost");
        var btn_normal = document.querySelector(".titlebar-tools-normal");
        var btn_minimized = document.querySelector(".titlebar-tools-minimized");
        var btn_maximized = document.querySelector(".titlebar-tools-maximized");
        var btn_close = document.querySelector(".titlebar-tools-close");
        this.dom_window = dom_window;
        this.btn_menu = btn_menu;
        this.btn_topmost = btn_topmost;
        this.btn_normal = btn_normal;
        this.btn_minimized = btn_minimized;
        this.btn_maximized = btn_maximized;
        this.btn_close = btn_close;
        this.maximized = maximized;
        this.minimized = minimized;
        this.normal = normal;
        btn_menu.addEventListener("click", e => {
            alert();
        });
        btn_topmost.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            cef_window.TopMost = !(yield cef_window.TopMost);
        }));
        btn_normal.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            normal();
        }));
        btn_minimized.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            minimized();
        }));
        btn_maximized.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            maximized();
        }));
        btn_close.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            cef_window.Close();
        }));
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
            _dom.addEventListener("mousedown", (e) => {
                if (e.button === 0) { //滑鼠左鍵
                    cef_window.WindowDrag(_type);
                }
            });
            _dom.addEventListener("touchstart", (e) => {
                e.preventDefault();
                cef_window.WindowDrag(_type);
            });
        }
        function maximized() {
            cef_window.WindowState = "Maximized";
            btn_normal.style.display = "flex";
            btn_maximized.style.display = "none";
        }
        function minimized() {
            cef_window.WindowState = "Minimized";
        }
        function normal() {
            cef_window.WindowState = "Normal";
            btn_normal.style.display = "none";
            btn_maximized.style.display = "flex";
        }
    }
    SizeChanged() {
        return __awaiter(this, void 0, void 0, function* () {
            //console.log("SizeChanged:"+ await cef_window.WindowState);
            if ((yield cef_window.WindowState) === "Maximized") {
                $(this.dom_window).addClass("maximized");
                this.btn_normal.style.display = "flex";
                this.btn_maximized.style.display = "none";
            }
            else {
                $(this.dom_window).removeClass("maximized");
                this.btn_normal.style.display = "none";
                this.btn_maximized.style.display = "flex";
            }
        });
    }
    Move() {
        console.log("Move");
    }
    VisibleChanged() {
        console.log("VisibleChanged");
    }
    FormClosing() {
        console.log("FormClosing");
    }
    GotFocus() {
        console.log("GotFocus");
    }
    LostFocus() {
        console.log("LostFocus");
    }
}
