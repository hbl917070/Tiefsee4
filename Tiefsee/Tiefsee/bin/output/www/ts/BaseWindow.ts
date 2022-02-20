//@ts-ignore
const WV2 = window.chrome.webview.hostObjects;
const WV_Window: WV_Window = WV2.WV_Window;
const WV_Directory: WV_Directory = WV2.WV_Directory;
const WV_File: WV_File = WV2.WV_File;
const WV_Path: WV_Path = WV2.WV_Path;
const WV_System: WV_System = WV2.WV_System;
const WV_RunApp: WV_RunApp = WV2.WV_RunApp;
const WV_Image: WV_Image = WV2.WV_Image;

const APIURL = "http://127.0.0.1:" + location.hash.replace("#", "");//api網址
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

    public topMost: boolean = false;
    public left: number = 0;
    public top: number = 0;
    public width: number = 0;
    public height: number = 0;

    public windowState: ("Maximized" | "Minimized" | "Normal") = "Normal";

    public closingEvents: (() => void)[] = [];//關閉視窗時執行的function
    public sizeChangeEvents: (() => void)[] = [];//sizeChange時執行的function


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

        (async () => {
            //判斷目前的狀態是視窗化還是最大化
            this.windowState = await WV_Window.WindowState;
            this.initWindowState();
        })()


        btn_menu?.addEventListener("click", e => {
            //alert()
        });
        btn_topmost?.addEventListener("click", async e => {
            this.topMost = await WV_Window.TopMost;
            if (this.topMost === true) {
                btn_topmost.setAttribute("active", "");
            } else {
                btn_topmost.setAttribute("active", "true");
            }
            WV_Window.TopMost = !this.topMost;
        });
        btn_normal?.addEventListener("click", async e => {
            this.normal()
        });
        btn_minimized?.addEventListener("click", async e => {
            this.minimized()
        });
        btn_maximized?.addEventListener("click", async e => {
            this.maximized()
        });
        btn_close?.addEventListener("click", async e => {
            this.close();
        });

        //double click 最大化或視窗化
        Lib.addEventDblclick(dom_titlebarTxt, async () => {//標題列
            let WindowState = this.windowState;
            if (WindowState === "Maximized") {
                this.normal();
            } else {
                setTimeout(() => {
                    this.maximized();
                }, 50);
            }
        });

        //註冊視窗邊框拖曳
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
            _dom.addEventListener("mousedown", async (e) => {
                if (e.button === 0) {//滑鼠左鍵
                    await WV_Window.WindowDrag(_type);
                }
            });

            _dom.addEventListener("touchstart", async (e) => {
                //await WV_Window.WindowDrag(_type);
                //window.chrome.webview.hostObjects.sync.WV_Window.WindowDrag(_type);
                //e.preventDefault();
                //e.stopPropagation();
            });
        }

    }


    /**
     * 取得拖曳進來的檔案路徑
     * @returns 
     */
    public async getDropPath(): Promise<string> {

        //觸發拖曳檔案後，C#會修改全域變數temp_dropPath

        let _dropPath: string = "";
        for (let i = 0; i < 100; i++) {


            if (temp_dropPath !== "") {
                _dropPath = temp_dropPath;
                _dropPath = decodeURIComponent(temp_dropPath)
                if (_dropPath.indexOf("file:///") === 0) {
                    _dropPath = _dropPath.substr(8);
                }
                break;
            }
            await sleep(10);
        }
        temp_dropPath = "";
        _dropPath = _dropPath.replace(/[/]/g, "\\");
        return _dropPath;
    }


    /**
     * 設定視窗標題
     * @param txt 
     */
    public async setTitle(txt: string) {
        WV_Window.Text = txt;
        this.dom_titlebarTxt.innerHTML = `<span>${txt}</span>`;
    }


    /**
     * 開啟新的子視窗
     * @param _name 
     * @returns 
     */
    public async newWindow(_name: string) {
        //let url = location.protocol + '//' + location.host + "/www/" + _name
        let url = _name
        var w = await WV_Window.NewWindow(url, []);
        WV_Window.SetOwner(w);//設為子視窗
        return w;
    }


    /**
     * 關閉視窗
     */
    public async close() {
        for (let i = 0; i < this.closingEvents.length; i++) {
            await this.closingEvents[i]();
        }
        WV_Window.Close()
    }

    /** 最大化 */
    public maximized() {
        WV_Window.WindowState = "Maximized";
        this.initWindowState();
    }

    /** 最小化 */
    public minimized() {
        WV_Window.WindowState = "Minimized";

    }

    /** 視窗化 */
    public normal() {
        WV_Window.WindowState = "Normal";
        this.initWindowState();
    }


    /** 視窗化或最大化時，標題列右邊的按鈕 */
    private initWindowState() {
        if (this.windowState === "Maximized") {
            this.dom_window.classList.add("maximized");
            this.btn_normal.style.display = "flex";
            this.btn_maximized.style.display = "none";
        } else {
            this.dom_window.classList.remove("maximized");
            this.btn_normal.style.display = "none";
            this.btn_maximized.style.display = "flex";
        }
    }


    /**
     * 由C#主動呼叫。建立視窗時，必須覆寫此函數
     * @param jsonTxt 
     */
    public onCreate(json: AppInfo) {
        WV_Window.ShowWindow();//顯示視窗 
    }


    /**
     * 由C#主動呼叫。
     * @param left 
     * @param top 
     * @param width 
     * @param height 
     * @param windowState 
     */
    public async onSizeChanged(left: number, top: number, width: number, height: number, windowState: ("Maximized" | "Minimized" | "Normal")) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.windowState = windowState;

        this.initWindowState();

        for (let i = 0; i < this.sizeChangeEvents.length; i++) {
            await this.sizeChangeEvents[i]();
        }
    }

    //由C#主動呼叫
    public onMove(left: number, top: number, width: number, height: number, windowState: ("Maximized" | "Minimized" | "Normal")) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.windowState = windowState;
    }

    /*public VisibleChanged() {
        console.log("VisibleChanged");
    }
    public FormClosing() {
         console.log("FormClosing");
    }*/
}

//---------------


