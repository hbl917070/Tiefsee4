//@ts-ignore
var cef = window.chrome.webview.hostObjects;
var cef_window: cef_window;
var baseWindow;

class MainWindow {

    constructor() {

        var tv:Tieefseeview;

        document.addEventListener("DOMContentLoaded", async () => {

            baseWindow = new BaseWindow();

            //載入svg
            let ar_domSvg = document.querySelectorAll("[to_dom]");
            for (let i = 0; i < ar_domSvg.length; i++) {
                const _dom = ar_domSvg[i];
                let src = _dom.getAttribute("src");
                if (src != null)
                    await fetch(src, {
                        "method": "get",
                    }).then((response) => {
                        return response.text();
                    }).then((html) => {
                        _dom.outerHTML = html;
                    }).catch((err) => {
                        console.log("error: ", err);
                    });
            }


          
            tv = new Tieefseeview(<HTMLDivElement>document.querySelector('#tiefseeview'));
         
           
            loadurl()

        });


        async function loadurl() {
    
            let _url = "https://wall.bahamut.com.tw/B/40/5328257e8d00594e61f8b815d505cab3_4080425.JPG";

            await tv.loadImg(_url);
            tv.transformRefresh(false)
            tv.zoomFull(TieefseeviewZoomType['full-100%']);
            $('#output-size').html(`${tv.getOriginalWidth()} , ${tv.getOriginalHeight()}`);
        }
    }
}



class BaseWindow {

    public dom_window: HTMLDivElement;
    public btn_menu: HTMLDivElement;
    public btn_topmost: HTMLDivElement;
    public btn_normal: HTMLDivElement;
    public btn_minimized: HTMLDivElement;
    public btn_maximized: HTMLDivElement;
    public btn_close: HTMLDivElement;

    public maximized;
    public minimized;
    public normal;





    async SizeChanged() {
        //console.log("SizeChanged:"+ await cef_window.WindowState);
        if (await cef_window.WindowState === "Maximized") {
            $(this.dom_window).addClass("maximized");
            this.btn_normal.style.display = "flex";
            this.btn_maximized.style.display = "none";
        } else {
            $(this.dom_window).removeClass("maximized");
            this.btn_normal.style.display = "none";
            this.btn_maximized.style.display = "flex";
        }
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


    constructor() {

        cef_window = cef.cef_window;

        var dom_window = <HTMLDivElement>document.querySelector('.window');
        var btn_menu = <HTMLDivElement>document.querySelector(".titlebar-tools-menu");
        var btn_topmost = <HTMLDivElement>document.querySelector(".titlebar-tools-topmost");
        var btn_normal = <HTMLDivElement>document.querySelector(".titlebar-tools-normal");
        var btn_minimized = <HTMLDivElement>document.querySelector(".titlebar-tools-minimized");
        var btn_maximized = <HTMLDivElement>document.querySelector(".titlebar-tools-maximized");
        var btn_close = <HTMLDivElement>document.querySelector(".titlebar-tools-close");

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
            alert()
        });
        btn_topmost.addEventListener("click", async e => {
            cef_window.TopMost = ! await cef_window.TopMost;
        });
        btn_normal.addEventListener("click", async e => {
            normal()
        });
        btn_minimized.addEventListener("click", async e => {
            minimized()
        });
        btn_maximized.addEventListener("click", async e => {
            maximized()
        });
        btn_close.addEventListener("click", async e => {
            cef_window.Close()
        });


        windowBorder(<HTMLDivElement>document.querySelector(".window-CT"), "CT");
        windowBorder(<HTMLDivElement>document.querySelector(".window-RC"), "RC");
        windowBorder(<HTMLDivElement>document.querySelector(".window-CB"), "CB");
        windowBorder(<HTMLDivElement>document.querySelector(".window-LC"), "LC");
        windowBorder(<HTMLDivElement>document.querySelector(".window-LT"), "LT");
        windowBorder(<HTMLDivElement>document.querySelector(".window-RT"), "RT");
        windowBorder(<HTMLDivElement>document.querySelector(".window-LB"), "LB");
        windowBorder(<HTMLDivElement>document.querySelector(".window-RB"), "RB");
        windowBorder(<HTMLDivElement>document.querySelector(".window-titlebar .titlebar-txt"), "move");


        function windowBorder(_dom: HTMLDivElement, _type: ("CT" | "RC" | "CB" | "LC" | "LT" | "RT" | "LB" | "RB" | "move")) {
            _dom.addEventListener("mousedown", (e) => {
                if (e.button === 0) {//滑鼠左鍵
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

}



