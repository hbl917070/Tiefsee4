declare const chrome: any;
const WV2 = chrome.webview.hostObjects;
const WV_Window: WV_Window = WV2.WV_Window;
const WV_Directory: WV_Directory = WV2.WV_Directory;
const WV_File: WV_File = WV2.WV_File;
const WV_Path: WV_Path = WV2.WV_Path;
const WV_System: WV_System = WV2.WV_System;
const WV_RunApp: WV_RunApp = WV2.WV_RunApp;
const WV_Image: WV_Image = WV2.WV_Image;

const APIURL = "http://127.0.0.1:" + location.hash.replace("#", ""); // api 網址
var _dropPath: string[] | undefined = undefined; // 暫存。取得拖曳進視窗的檔案路徑

interface Window {
    /** 網頁的縮放比例，預設值 1.0 */
    zoomFactor: number;
}

class BaseWindow {

    public domWindow: HTMLDivElement;
    public btnNormal: HTMLDivElement;
    public btnMinimized: HTMLDivElement;
    public btnMaximized: HTMLDivElement;
    public btnClose: HTMLDivElement;
    public domTitlebarText: HTMLDivElement;

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

        const _domWindow = document.querySelector(".window") as HTMLDivElement;
        const _btnNormal = document.querySelector(".titlebar-toolbar-normal") as HTMLDivElement;
        const _btnMinimized = document.querySelector(".titlebar-toolbar-minimized") as HTMLDivElement;
        const _btnMaximized = document.querySelector(".titlebar-toolbar-maximized") as HTMLDivElement;
        const _btnClose = document.querySelector(".titlebar-toolbar-close") as HTMLDivElement;
        const _domTitlebarText = document.querySelector(".titlebar-text") as HTMLDivElement;

        this.domWindow = _domWindow;
        this.btnNormal = _btnNormal;
        this.btnMinimized = _btnMinimized;
        this.btnMaximized = _btnMaximized;
        this.btnClose = _btnClose;
        this.domTitlebarText = _domTitlebarText;

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

        _btnNormal?.addEventListener("click", async e => {
            this.normal();
        });
        _btnMinimized?.addEventListener("click", async e => {
            this.minimized();
        });
        _btnMaximized?.addEventListener("click", async e => {
            this.maximized();
        });
        _btnClose?.addEventListener("click", async e => {
            this.close();
        });

        // double click 最大化或視窗化
        Lib.addEventDblclick(_domTitlebarText, async () => { // 標題列
            const WindowState = this.windowState;
            if (WindowState === "Maximized") {
                this.normal();
            } else {
                setTimeout(() => {
                    this.maximized();
                }, 50);
            }
        });

        // 禁止頁面縮放
        _domWindow.addEventListener("wheel", (e: WheelEvent) => {
            if (e.ctrlKey === true) {
                e.preventDefault();
            }
        }, true);
        _domWindow.addEventListener("touchstart", (e) => {
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
        // windowBorder(<HTMLDivElement>document.querySelector(".window-titlebar .titlebar-text"), "move");

        function windowBorder(dom: HTMLDivElement, type: ("CT" | "RC" | "CB" | "LC" | "LT" | "RT" | "LB" | "RB" | "move")) {
            dom.addEventListener("mousedown", async (e) => {
                if (e.button === 0) { // 滑鼠左鍵
                    await WV_Window.WindowDrag(type);
                }
            });

            dom.addEventListener("touchstart", async (e) => {
                // await WV_Window.WindowDrag(_type);
                // window.chrome.webview.hostObjects.sync.WV_Window.WindowDrag(_type);
                // e.preventDefault();
                // e.stopPropagation();
            });
            dom.addEventListener("touchstart", async (e) => {
                baseWindow.touchDrop.start(dom, e, type);
            });
        }
    }

    /**
     * 取得拖曳進來的檔案路徑
     */
    public async getDropPath() {

        // 觸發拖曳檔案後，C#會修改全域變數 _dropPath
        let dropPath: string[] | undefined = undefined;
        for (let i = 0; i < 100; i++) {
            if (_dropPath !== undefined) {
                dropPath = _dropPath;
                break;
            }
            await Lib.sleep(10);
        }
        _dropPath = undefined;
        return dropPath;
    }

    /**
     * 設定視窗標題
     */
    public async setTitle(text: string) {
        WV_Window.Text = text;
        this.domTitlebarText.innerHTML = `<span>${text}</span>`;
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
                this.domWindow.classList.remove("windowRoundedCorners");
            }
            else {
                await WV_Window.WindowRoundedCorners(true);
                this.domWindow.classList.add("windowRoundedCorners");
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
            this.domWindow.classList.add("maximized");
            this.btnNormal.style.display = "flex";
            this.btnMaximized.style.display = "none";
        } else {
            this.domWindow.classList.remove("maximized");
            this.btnNormal.style.display = "none";
            this.btnMaximized.style.display = "flex";
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
            const newArDate = arData.map(a => { return { ...a } }); // 複製一個新的陣列(避免被修改)
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

        let _tempTouchX = 0; // 觸控的坐標
        let _tempTouchY = 0;
        let _tempTouchWindowX = 0; // 視窗的坐標
        let _tempTouchWindowY = 0;
        let _tempTouchWindowW = 0; // 視窗的size
        let _tempTouchWindowH = 0;
        let _tempStart = false; // 是否開始執行了

        const _touchMoveThrottle = new Throttle(20); // 節流

        /**
         * 
         * @param dom 
         */
        function start(dom: HTMLElement, e: TouchEvent, type: ("CT" | "RC" | "CB" | "LC" | "LT" | "RT" | "LB" | "RB" | "move")) {

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

                dom.addEventListener("touchmove", touchmove);
                dom.addEventListener("touchend", touchend);

                _tempTouchX = e.changedTouches[0].screenX;
                _tempTouchY = e.changedTouches[0].screenY;
                _tempTouchWindowX = baseWindow.left;
                _tempTouchWindowY = baseWindow.top;
                _tempTouchWindowW = baseWindow.width;
                _tempTouchWindowH = baseWindow.height;
                _tempStart = true;
            }

            async function touchmove(e: TouchEvent) {
                if (_tempStart !== true) { return; }
                if (e.changedTouches.length !== 1) { // 觸控點不是一個的話
                    end();
                    return;
                }

                let x = e.changedTouches[0].screenX - _tempTouchX;
                let y = e.changedTouches[0].screenY - _tempTouchY;

                _touchMoveThrottle.run = async () => {

                    if (type === "move") {
                        await WV_Window.SetPosition(_tempTouchWindowX + x, _tempTouchWindowY + y)
                        _tempTouchWindowX = _tempTouchWindowX + x;
                        _tempTouchWindowY = _tempTouchWindowY + y;
                    }
                    else if (type === "RB") { // 右下
                        await WV_Window.SetSize(_tempTouchWindowW + x, _tempTouchWindowH + y);
                    }
                    else if (type === "CB") { // 下
                        await WV_Window.SetSize(_tempTouchWindowW, _tempTouchWindowH + y);
                    }
                    else if (type === "RC") { // 右
                        await WV_Window.SetSize(_tempTouchWindowW + x, _tempTouchWindowH);
                    }
                    else if (type === "CT") { // 上
                        await WV_Window.SetSize(_tempTouchWindowW, _tempTouchWindowH - y);
                        await WV_Window.SetPosition(_tempTouchWindowX, _tempTouchWindowY + y);
                        _tempTouchWindowY = _tempTouchWindowY + y;
                        _tempTouchWindowH = _tempTouchWindowH - y;
                    }
                    else if (type === "LC") { // 左
                        await WV_Window.SetSize(_tempTouchWindowW - x, _tempTouchWindowH);
                        await WV_Window.SetPosition(_tempTouchWindowX + x, _tempTouchWindowY);
                        _tempTouchWindowX = _tempTouchWindowX + x;
                        _tempTouchWindowW = _tempTouchWindowW - x;
                    }
                    else if (type === "LT") { // 左上
                        await WV_Window.SetSize(_tempTouchWindowW - x, _tempTouchWindowH - y);
                        await WV_Window.SetPosition(_tempTouchWindowX + x, _tempTouchWindowY + y);
                        _tempTouchWindowX = _tempTouchWindowX + x;
                        _tempTouchWindowY = _tempTouchWindowY + y;
                        _tempTouchWindowW = _tempTouchWindowW - x;
                        _tempTouchWindowH = _tempTouchWindowH - y;
                    }
                    else if (type === "LB") { // 左下
                        await WV_Window.SetSize(_tempTouchWindowW - x, _tempTouchWindowH + y);
                        await WV_Window.SetPosition(_tempTouchWindowX + x, _tempTouchWindowY);
                        _tempTouchWindowX = _tempTouchWindowX + x;
                        _tempTouchWindowW = _tempTouchWindowW - x;
                    }
                    else if (type === "RT") { // 右上
                        await WV_Window.SetSize(_tempTouchWindowW + x, _tempTouchWindowH - y);
                        await WV_Window.SetPosition(_tempTouchWindowX, _tempTouchWindowY + y);
                        _tempTouchWindowY = _tempTouchWindowY + y;
                        _tempTouchWindowH = _tempTouchWindowH - y;
                    }

                }
            }

            async function touchend(e: TouchEvent) {
                end();
            }

            // 結束拖曳，並釋放註冊的事件
            function end() {
                _tempStart = false;
                dom.removeEventListener("touchmove", touchmove);
                dom.removeEventListener("touchend", touchend);
            }
        }
    }

}
