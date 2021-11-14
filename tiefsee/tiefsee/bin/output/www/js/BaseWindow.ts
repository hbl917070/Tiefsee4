//@ts-ignore
var cef = window.chrome.webview.hostObjects;
var WV_Window: WV_Window = cef.WV_Window;
var WV_Directory: WV_Directory = cef.WV_Directory;
var WV_File: WV_File = cef.WV_File;
var WV_Path: WV_Path = cef.WV_Path;
var WV_System: WV_System = cef.WV_System;
var WV_UseOtherAppOpen: WV_UseOtherAppOpen = cef.WV_UseOtherAppOpen;
var WV_Image: WV_Image = cef.WV_Image;


var baseWindow: BaseWindow;

var temp_dropPath = "";//暫存。取得拖曳進視窗的檔案路徑

class BaseWindow {

    public dom_window: HTMLDivElement;
    public btn_menu: HTMLDivElement;
    public btn_topmost: HTMLDivElement;
    public btn_normal: HTMLDivElement;
    public btn_minimized: HTMLDivElement;
    public btn_maximized: HTMLDivElement;
    public btn_close: HTMLDivElement;
    public dom_titlebarTxt: HTMLDivElement;

    public maximized;
    public minimized;
    public normal;



    private initWindowState;

    async SizeChanged() {
        //console.log("SizeChanged:"+ await WV_Window.WindowState);
        this.initWindowState();
    }

    Move() {
        this.dom_window.classList.remove("maximized");
        this.btn_normal.style.display = "none";
        this.btn_maximized.style.display = "flex";
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

    /**
     * 取得拖曳進來的檔案路徑
     * @returns 
     */
    async GetDropPath(): Promise<string> {

        //觸發拖曳檔案後，C#會修改全域變數temp_dropPath

        let _dropPath: string = "";
        for (let i = 0; i < 100; i++) {
            await sleep(10);

            if (temp_dropPath !== "") {
                _dropPath = temp_dropPath;
                _dropPath = decodeURIComponent(temp_dropPath)
                if (_dropPath.indexOf("file:///") === 0) {
                    _dropPath = _dropPath.substr(8);
                }
                break;
            }
        }

        _dropPath = _dropPath.replace(/[/]/g, "\\");
        return _dropPath;
    }


    async setTitle(txt: string) {
        WV_Window.Text = txt;
        this.dom_titlebarTxt.innerHTML = `<span>${txt}</span>`;
    }

    constructor() {

        var dom_window = <HTMLDivElement>document.querySelector('.window');
        var btn_menu = <HTMLDivElement>document.querySelector(".titlebar-tools-menu");
        var btn_topmost = <HTMLDivElement>document.querySelector(".titlebar-tools-topmost");
        var btn_normal = <HTMLDivElement>document.querySelector(".titlebar-tools-normal");
        var btn_minimized = <HTMLDivElement>document.querySelector(".titlebar-tools-minimized");
        var btn_maximized = <HTMLDivElement>document.querySelector(".titlebar-tools-maximized");
        var btn_close = <HTMLDivElement>document.querySelector(".titlebar-tools-close");
        var dom_titlebarTxt = <HTMLDivElement>document.querySelector(".titlebar-txt");


        this.dom_window = dom_window;
        this.btn_menu = btn_menu;
        this.btn_topmost = btn_topmost;
        this.btn_normal = btn_normal;
        this.btn_minimized = btn_minimized;
        this.btn_maximized = btn_maximized;
        this.btn_close = btn_close;
        this.dom_titlebarTxt = dom_titlebarTxt;

        this.maximized = maximized;
        this.minimized = minimized;
        this.normal = normal;
        this.initWindowState = initWindowState;

        initWindowState();

        btn_menu.addEventListener("click", e => {
            //alert()
        });
        btn_topmost.addEventListener("click", async e => {
            WV_Window.TopMost = ! await WV_Window.TopMost;
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
            WV_Window.Close()
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

        (<HTMLDivElement>document.querySelector(".window-titlebar .titlebar-txt"))
            .addEventListener("touchend", (e) => {
                console.log('touchend--')
                //WV_Window.WindowDragUp();
            });

        function windowBorder(_dom: HTMLDivElement, _type: ("CT" | "RC" | "CB" | "LC" | "LT" | "RT" | "LB" | "RB" | "move")) {
            _dom.addEventListener("mousedown", async (e) => {
                if (e.button === 0) {//滑鼠左鍵
                    await WV_Window.WindowDrag(_type);
                }
            });

            _dom.addEventListener("touchstart", async (e) => {
                //  e.preventDefault();
                //WV_Window.WindowDrag(_type);
                //@ts-ignore
                //chrome.webview.hostObjects.sync.WV_Window.WindowDrag(_type);

            });

            _dom.addEventListener("touchend", async (e) => {

            });


            //----------

            var cx = 0;
            var cy = 0;
            var tcx = 0;
            var tcy = 0;
            _dom.addEventListener("touchstart", async (e) => {
                //  e.preventDefault();
                cx = await WV_Window.Left;
                cy = await WV_Window.Top;
                tcx = e.changedTouches[0]["clientX"]
                tcy = e.changedTouches[0]["clientY"]
                console.log("start")
                //@ts-ignore
                //chrome.webview.hostObjects.sync.WV_Window.WindowDrag_touchStart();
            });
            _dom.addEventListener("touchmove", async (e) => {
                //  e.preventDefault();
                //WV_Window.Left = cx + e.changedTouches[0]["clientX"]-tcx
                //WV_Window.Top = cy + e.changedTouches[0]["clientY"]-tcy

                WV_Window.Text = await WV_Window.GetMousePoint()[0];

                console.log(e)
                //@ts-ignore
                //chrome.webview.hostObjects.WV_Window.WindowDrag_touchMove();
            });
            _dom.addEventListener("touchend", async (e) => {
                // e.preventDefault();
                //@ts-ignore
                //chrome.webview.hostObjects.sync.WV_Window.WindowDrag_touchEnd();
            });


        }


        function maximized() {
            WV_Window.WindowState = "Maximized";
            initWindowState();
        }
        function minimized() {
            WV_Window.WindowState = "Minimized";
        }
        function normal() {
            WV_Window.WindowState = "Normal";
            initWindowState();
        }



        async function initWindowState() {
            if (await WV_Window.WindowState === "Maximized") {
                dom_window.classList.add("maximized");
                btn_normal.style.display = "flex";
                btn_maximized.style.display = "none";
            } else {
                dom_window.classList.remove("maximized");
                btn_normal.style.display = "none";
                btn_maximized.style.display = "flex";
            }
        }

    }

}



//---------------


/**
 * 匯入外部檔案
 */
async function initDomImport() {

    let ar_dom = document.querySelectorAll("import");
    for (let i = 0; i < ar_dom.length; i++) {
        const _dom = ar_dom[i];
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
}

/**
 * html字串 轉 dom物件
 * @param html 
 * @returns 
 */
function newDiv(html: string): HTMLDivElement {
    let div = document.createElement("div");
    div.innerHTML = html

    return <HTMLDivElement>div.getElementsByTagName("div")[0];
}


/**
 * 等待
 * @param ms 毫秒
 */
async function sleep(ms: number) {
    await new Promise((resolve, reject) => {
        setTimeout(function () {
            resolve(0);//繼續往下執行
        }, ms);
    })
}

/**
 * 轉 number
 */
function toNumber(t: string | number): number {
    if (typeof (t) === "number") { return t }//如果本來就是數字，直接回傳     
    if (typeof t === 'string') { return Number(t.replace('px', '')); } //如果是string，去掉px後轉型成數字
    return 0;
}


interface Date {
    format(format: string): string;
}


/**
 * 對Date的擴充套件，將 Date 轉化為指定格式的String
 * 月(M)、日(d)、小時(h)、分(m)、秒(s)、季度(q) 可以用 1-2 個佔位符，
 * 年(y)可以用 1-4 個佔位符，毫秒(S)只能用 1 個佔位符(是 1-3 位的數字)
 * 例子：
 * (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 * (new Date()).format("yyyy-M-d h:m:s.S")   ==> 2006-7-2 8:9:4.18
 */
Date.prototype.format = function (format: string) {
    var o: any = {
        "M+": this.getMonth() + 1,//month
        "d+": this.getDate(),//day
        "h+": this.getHours(),//hour
        "m+": this.getMinutes(),//minute
        "s+": this.getSeconds(),//second
        "q+": Math.floor((this.getMonth() + 3) / 3),//quarter
        "S": this.getMilliseconds()//millisecond
    }

    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}

