declare var chrome: any;
const WV2 = chrome.webview.hostObjects;
const WV_Window: WV_Window = WV2.WV_Window;
const WV_Directory: WV_Directory = WV2.WV_Directory;
const WV_File: WV_File = WV2.WV_File;
const WV_Path: WV_Path = WV2.WV_Path;
const WV_System: WV_System = WV2.WV_System;
const WV_RunApp: WV_RunApp = WV2.WV_RunApp;
const WV_Image: WV_Image = WV2.WV_Image;

const APIURL = "http://127.0.0.1:" + location.hash.replace("#", ""); // api 網址
var temp_dropPath: string[] | undefined = undefined; // 暫存。取得拖曳進視窗的檔案路徑

interface Window {
    /** 網頁的縮放比例，預設值 1.0 */
    zoomFactor: number;
}

class BaseWindow {

    public dom_window: HTMLDivElement;
    public btn_normal: HTMLDivElement;
    public btn_minimized: HTMLDivElement;
    public btn_maximized: HTMLDivElement;
    public btn_close: HTMLDivElement;
    public dom_titlebarTxt: HTMLDivElement;

    public appInfo: AppInfo = undefined as any;

    public topMost: boolean = false;
    public left: number = 0;
    public top: number = 0;
    public width: number = 0;
    public height: number = 0;
    public zoomFactor: number = 1;

    public windowState: ("Maximized" | "Minimized" | "Normal") = "Normal";

    public closingEvents: (() => void)[] = []; // 關閉視窗時執行的 function
    public sizeChangeEvents: (() => void)[] = []; // sizeChange 時執行的 function
    public fileWatcherEvents: ((data: FileWatcherData[]) => void)[] = []; // 檔案發生變化時時執行的 function
    public touchDrop = new TouchDrop(this);

    constructor() {

        var dom_window = <HTMLDivElement>document.querySelector(".window");
        var btn_normal = <HTMLDivElement>document.querySelector(".titlebar-toolbar-normal");
        var btn_minimized = <HTMLDivElement>document.querySelector(".titlebar-toolbar-minimized");
        var btn_maximized = <HTMLDivElement>document.querySelector(".titlebar-toolbar-maximized");
        var btn_close = <HTMLDivElement>document.querySelector(".titlebar-toolbar-close");
        var dom_titlebarTxt = <HTMLDivElement>document.querySelector(".titlebar-txt");

        this.dom_window = dom_window;
        this.btn_normal = btn_normal;
        this.btn_minimized = btn_minimized;
        this.btn_maximized = btn_maximized;
        this.btn_close = btn_close;
        this.dom_titlebarTxt = dom_titlebarTxt;

        /*// 判斷作業系統類型
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
            // 判斷目前的狀態是視窗化還是最大化
            this.windowState = await WV_Window.WindowState;
            this.updateWindowState();
        })()


        btn_normal?.addEventListener("click", async e => {
            this.normal();
        });
        btn_minimized?.addEventListener("click", async e => {
            this.minimized();
        });
        btn_maximized?.addEventListener("click", async e => {
            this.maximized();
        });
        btn_close?.addEventListener("click", async e => {
            this.close();
        });

        // double click 最大化或視窗化
        Lib.addEventDblclick(dom_titlebarTxt, async () => { // 標題列
            let WindowState = this.windowState;
            if (WindowState === "Maximized") {
                this.normal();
            } else {
                setTimeout(() => {
                    this.maximized();
                }, 50);
            }
        });

        // 禁止頁面縮放
        dom_window.addEventListener("wheel", (e: WheelEvent) => {
            if (e.ctrlKey === true) {
                e.preventDefault();
            }
        }, true);
        dom_window.addEventListener("touchstart", (e) => {
            if (e.touches.length > 1) { // 多指
                e.preventDefault();
            }
        }, false);

        // 註冊視窗邊框拖曳
        windowBorder(<HTMLDivElement>document.querySelector(".window-CT"), "CT"); // 上
        windowBorder(<HTMLDivElement>document.querySelector(".window-RC"), "RC"); // 右
        windowBorder(<HTMLDivElement>document.querySelector(".window-CB"), "CB"); // 下
        windowBorder(<HTMLDivElement>document.querySelector(".window-LC"), "LC"); // 左
        windowBorder(<HTMLDivElement>document.querySelector(".window-LT"), "LT"); // 左上
        windowBorder(<HTMLDivElement>document.querySelector(".window-RT"), "RT"); // 右上
        windowBorder(<HTMLDivElement>document.querySelector(".window-LB"), "LB"); // 左下
        windowBorder(<HTMLDivElement>document.querySelector(".window-RB"), "RB"); // 右下
        // windowBorder(<HTMLDivElement>document.querySelector(".window-titlebar .titlebar-txt"), "move");

        function windowBorder(_dom: HTMLDivElement, _type: ("CT" | "RC" | "CB" | "LC" | "LT" | "RT" | "LB" | "RB" | "move")) {
            _dom.addEventListener("mousedown", async (e) => {
                if (e.button === 0) { // 滑鼠左鍵
                    await WV_Window.WindowDrag(_type);
                }
            });

            _dom.addEventListener("touchstart", async (e) => {
                // await WV_Window.WindowDrag(_type);
                // window.chrome.webview.hostObjects.sync.WV_Window.WindowDrag(_type);
                // e.preventDefault();
                // e.stopPropagation();
            });
            _dom.addEventListener("touchstart", async (e) => {
                baseWindow.touchDrop.start(_dom, e, _type);
            });
        }
    }

    /**
     * 取得拖曳進來的檔案路徑
     */
    public async getDropPath() {

        // 觸發拖曳檔案後，C#會修改全域變數temp_dropPath
        let _dropPath: string[] | undefined = undefined;
        for (let i = 0; i < 100; i++) {
            if (temp_dropPath !== undefined) {
                _dropPath = temp_dropPath;
                break;
            }
            await Lib.sleep(10);
        }
        temp_dropPath = undefined;
        return _dropPath;
    }

    /**
     * 設定視窗標題
     */
    public async setTitle(txt: string) {
        WV_Window.Text = txt;
        this.dom_titlebarTxt.innerHTML = `<span>${txt}</span>`;
    }

    /**
     * 關閉視窗
     */
    public async close() {
        let isClose = true;
        for (let i = 0; i < this.closingEvents.length; i++) {
            let val: any = await this.closingEvents[i]();
            if (val === false) { isClose = false; }
        }
        if (isClose) { // 只要其中一個 closingEvents return false，就不關閉視窗
            WV_Window.Close();
        }
    }

    /**
     * 設定縮放倍率，預設 1.0
     */
    public setZoomFactor(d: number) {
        this.zoomFactor = d;
        WV_Window.SetZoomFactor(d);
        window.zoomFactor = d;
    }

    /** 最大化 */
    public maximized() {
        WV_Window.WindowState = "Maximized";
        this.updateWindowState();
    }

    /** 最小化 */
    public minimized() {
        WV_Window.WindowState = "Minimized";
    }

    /** 視窗化 */
    public normal() {
        WV_Window.WindowState = "Normal";
        this.updateWindowState();
    }

    private _isInitWindowAttribute = false; // 避免重複套用視窗效果
    /**  套用 套用視窗效果  */
    public async setWindowAttribute(type: string) {
        if (this._isInitWindowAttribute) { return; }

        if (baseWindow.appInfo.isWin11) {

            if (type === "none") {
                await WV_Window.WindowRoundedCorners(false);
                this.dom_window.classList.remove("windowRoundedCorners");
            }
            else {
                await WV_Window.WindowRoundedCorners(true);
                this.dom_window.classList.add("windowRoundedCorners");
            }

            await WV_Window.WindowStyle(type);

        } else {
            await WV_Window.WindowStyle(type);
            this._isInitWindowAttribute = true;
        }

    }

    /** 視窗化或最大化時，標題列右邊的按鈕 */
    private updateWindowState() {
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
        WV_Window.ShowWindow(); //顯示視窗 
    }

    /**
     * 由C#主動呼叫。視窗改變大小時
     */
    public async onSizeChanged(left: number, top: number, width: number, height: number, windowState: ("Maximized" | "Minimized" | "Normal")) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.windowState = windowState;

        this.updateWindowState();

        for (let i = 0; i < this.sizeChangeEvents.length; i++) {
            await this.sizeChangeEvents[i]();
        }
    }

    /**
     * 由C#主動呼叫。視窗移動
     */
    public onMove(left: number, top: number, width: number, height: number, windowState: ("Maximized" | "Minimized" | "Normal")) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.windowState = windowState;
    }

    /**
     * 由C#主動呼叫。檔案發生變化時
     */
    public async onFileWatcher(arData: FileWatcherData[]) {
        for (let i = 0; i < this.fileWatcherEvents.length; i++) {
            let newArDate = arData.map(a => { return { ...a } }); // 複製一個新的陣列(避免被修改)
            await this.fileWatcherEvents[i](newArDate);
        }
    }

    /**
     * 由C#主動呼叫。按下右鍵時。必要時覆寫此函數
     */
    public onRightClick(x: number, y: number) {
        //console.log(x, y);
    }

    /**
     * 由C#主動呼叫。wewbview2新建視窗時呼叫。必要時覆寫此函數
     * @param url 
     */
    public onNewWindowRequested(url: string) {
        console.log("onNewWindowRequested：" + url)
    }

    /*public VisibleChanged() {
        console.log("VisibleChanged");
    }
    public FormClosing() {
         console.log("FormClosing");
    }*/
}

/**
 * 讓觸控也能拖曳視窗
 */
class TouchDrop {

    public start;

    constructor(baseWindow: BaseWindow) {
        this.start = start;

        let temp_touchX = 0; // 觸控的坐標
        let temp_touchY = 0;
        let temp_touchWindowX = 0; // 視窗的坐標
        let temp_touchWindowY = 0;
        let temp_touchWindowW = 0; // 視窗的size
        let temp_touchWindowH = 0;
        let temp_start = false; // 是否開始執行了

        var touchMoveThrottle = new Throttle(20); // 節流

        /**
         * 
         * @param _dom 
         */
        function start(_dom: HTMLElement, e: TouchEvent, _type: ("CT" | "RC" | "CB" | "LC" | "LT" | "RT" | "LB" | "RB" | "move")) {

            touchstart(e);
            // _dom.addEventListener("touchstart", touchstart);

            async function touchstart(e: TouchEvent) {
                // e.preventDefault();
                // e.stopPropagation();

                if (baseWindow.windowState !== "Normal") { return; } // 不是視窗化的話
                if (e.changedTouches.length !== 1) { // 觸控點不是一個的話
                    end();
                    return;
                }

                _dom.addEventListener("touchmove", touchmove);
                _dom.addEventListener("touchend", touchend);

                temp_touchX = e.changedTouches[0].screenX;
                temp_touchY = e.changedTouches[0].screenY;
                temp_touchWindowX = baseWindow.left;
                temp_touchWindowY = baseWindow.top;
                temp_touchWindowW = baseWindow.width;
                temp_touchWindowH = baseWindow.height;
                temp_start = true;
            }

            async function touchmove(e: TouchEvent) {
                if (temp_start !== true) { return; }
                if (e.changedTouches.length !== 1) { // 觸控點不是一個的話
                    end();
                    return;
                }

                let x = e.changedTouches[0].screenX - temp_touchX;
                let y = e.changedTouches[0].screenY - temp_touchY;

                touchMoveThrottle.run = async () => {

                    if (_type === "move") {
                        await WV_Window.SetPosition(temp_touchWindowX + x, temp_touchWindowY + y)
                        temp_touchWindowX = temp_touchWindowX + x;
                        temp_touchWindowY = temp_touchWindowY + y;
                    }
                    else if (_type === "RB") { // 右下
                        await WV_Window.SetSize(temp_touchWindowW + x, temp_touchWindowH + y);
                    }
                    else if (_type === "CB") { // 下
                        await WV_Window.SetSize(temp_touchWindowW, temp_touchWindowH + y);
                    }
                    else if (_type === "RC") { // 右
                        await WV_Window.SetSize(temp_touchWindowW + x, temp_touchWindowH);
                    }
                    else if (_type === "CT") { // 上
                        await WV_Window.SetSize(temp_touchWindowW, temp_touchWindowH - y);
                        await WV_Window.SetPosition(temp_touchWindowX, temp_touchWindowY + y);
                        temp_touchWindowY = temp_touchWindowY + y;
                        temp_touchWindowH = temp_touchWindowH - y;
                    }
                    else if (_type === "LC") { // 左
                        await WV_Window.SetSize(temp_touchWindowW - x, temp_touchWindowH);
                        await WV_Window.SetPosition(temp_touchWindowX + x, temp_touchWindowY);
                        temp_touchWindowX = temp_touchWindowX + x;
                        temp_touchWindowW = temp_touchWindowW - x;
                    }
                    else if (_type === "LT") { // 左上
                        await WV_Window.SetSize(temp_touchWindowW - x, temp_touchWindowH - y);
                        await WV_Window.SetPosition(temp_touchWindowX + x, temp_touchWindowY + y);
                        temp_touchWindowX = temp_touchWindowX + x;
                        temp_touchWindowY = temp_touchWindowY + y;
                        temp_touchWindowW = temp_touchWindowW - x;
                        temp_touchWindowH = temp_touchWindowH - y;
                    }
                    else if (_type === "LB") { // 左下
                        await WV_Window.SetSize(temp_touchWindowW - x, temp_touchWindowH + y);
                        await WV_Window.SetPosition(temp_touchWindowX + x, temp_touchWindowY);
                        temp_touchWindowX = temp_touchWindowX + x;
                        temp_touchWindowW = temp_touchWindowW - x;
                    }
                    else if (_type === "RT") { // 右上
                        await WV_Window.SetSize(temp_touchWindowW + x, temp_touchWindowH - y);
                        await WV_Window.SetPosition(temp_touchWindowX, temp_touchWindowY + y);
                        temp_touchWindowY = temp_touchWindowY + y;
                        temp_touchWindowH = temp_touchWindowH - y;
                    }

                }
            }

            async function touchend(e: TouchEvent) {
                end();
            }

            // 結束拖曳，並釋放註冊的事件
            function end() {
                temp_start = false;
                _dom.removeEventListener("touchmove", touchmove);
                _dom.removeEventListener("touchend", touchend);
            }
        }
    }

}
