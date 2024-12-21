class LibIframe {

    public appInfo: AppInfo;
    public APIURL: string;

    constructor() {

        this.appInfo = this.getAppInfo();
        this.APIURL = "http://127.0.0.1:" + this.appInfo.mainPort;

        //處理唯讀
        window.addEventListener("keydown", (e) => {

            if (this.isReadonly === false) { return; }

            //只允許 Ctrl+C 跟 Ctrl+A ，其餘的按鍵都攔截
            if (e.code == "KeyC" && e.ctrlKey === true) {
            } else if (e.code == "KeyA" && e.ctrlKey === true) {
            } else {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true)

    }

    /**
     * 嘗試關閉輸入法
     */
    public async closeIME() {

        const domFocus = document.activeElement as HTMLElement | null; // 當前擁有焦點的dom

        const text = document.createElement("input");
        text.setAttribute("type", "url");
        text.style.position = "relative";
        text.style.opacity = "0";
        text.style.pointerEvents = "none";

        document.body.appendChild(text);
        text.focus();

        await new Promise((resolve, reject) => {
            setTimeout(() => {
                text.blur();
                document.body.removeChild(text);
                if (domFocus !== null) {
                    domFocus.focus(); // 把焦點設定回去
                }
                resolve(0);
            }, 10);
        })
    }

    /**
     * 註冊 drop 事件，拖曳檔案進來時 開啟檔案
     */
    public initEventDrop(dom: HTMLElement) {

        dom.addEventListener("dragenter", (e: DragEvent) => {
            e.stopPropagation();
            e.preventDefault();
        }, false);

        dom.addEventListener("dragover", (e: DragEvent) => {
            e.stopPropagation();
            e.preventDefault();
        }, false);

        dom.addEventListener("drop", (e: DragEvent) => {
            // 直接把 drop 傳遞給父頁面
            const dropEvent = new CustomEvent("drop", {
                bubbles: true,
                detail: {
                    event: e
                }
            });
            window.parent.dispatchEvent(dropEvent);
        }, true);
    }

    /**
     * 按 ctrl + S 時，儲存文字檔
     */
    public initTextHotkey() {
        window.addEventListener("keydown", async (e) => {
            if (e.code === "KeyS" && e.ctrlKey) {
                this.postMsg({
                    type: "saveText",
                });
            }
        }, true);
    }

    /**
     * 傳送資料給父物件
     */
    public postMsg(json: any) {
        parent.postMessage(json, "*");
    }

    /**
     * 取得 AppInfo
     */
    public getAppInfo(): AppInfo {
        const getUrlString = location.href;
        const url = new URL(getUrlString);
        const appInfo = url.searchParams.get("appInfo");
        if (appInfo == null) { throw new Error("appInfo is null"); }
        return JSON.parse(appInfo);
    }

    /**
     * 取得 Plugin 的路徑
     */
    public getPluginPath() {
        return this.APIURL + "/Plugin";
    }

    /**
     * 取得使用者選擇的語言
     */
    public getLang() {
        const getUrlString = location.href;
        const url = new URL(getUrlString);
        const lang = url.searchParams.get("lang");
        return lang;
    }

    _theme: any = {}
    /**
     * 初始化 Theme
     */
    public initTheme() {
        const strTheme = window.localStorage.getItem("settings.theme");
        if (strTheme === null) { return null; }

        const theme = JSON.parse(strTheme);

        // 用背景色判斷是淺色還是深色主題
        function getTheme(): "light" | "dark" {
            let bg = theme["--color-window-background"];
            // 判斷顏色接近黑色還是白色
            let n = ((bg.r > 127) ? 1 : 0) + ((bg.g > 127) ? 1 : 0) + ((bg.b > 127) ? 1 : 0);
            if (n >= 2) { return "light"; }
            return "dark";
        }

        theme["windowBackground"] = theme["--color-window-background"];
        theme["windowBorder"] = theme["--color-window-border"];
        theme["white"] = theme["--color-white"];
        theme["black"] = theme["--color-black"];
        theme["blue"] = theme["--color-blue"];
        theme["grey"] = theme["--color-grey"];
        theme["theme"] = getTheme();

        this._theme = theme;
        return theme;
    }

    /**
     * {r, g, b} to 16進制
     */
    public colorToHex(color: any) {
        return this.decimalToHex(color.r, 2)
            + this.decimalToHex(color.g, 2)
            + this.decimalToHex(color.b, 2);
    }

    /**
     * 10進制 to 16進制
     */
    public decimalToHex(d: string, padding: number) {
        let hex = Number(d).toString(16);
        padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
        while (hex.length < padding) {
            hex = "0" + hex;
        }
        return hex;
    }

    private isReadonly = false; // 是否為唯讀
    /**
     * 設定是否為唯讀
     * @param val 
     */
    public setReadonly(val: boolean): void {
        this.isReadonly = val;
    }

    /**
     * 載入新的 JS
     */
    public async addScript(src: string) {
        const script = document.createElement("script");
        script.src = src;
        document.head.appendChild(script);

        await new Promise((resolve, _) => {
            script.onload = function () {
                resolve(1);
            };
        })
    }

    /**
     * 開啟網址或檔案
     */
    public openUrl(url: string) {
        if (url.startsWith("http:") || url.startsWith("https:")) { // 開啟網址    
            this.postMsg({
                type: "openUrl",
                data: url,
            });
        } else { // 開啟檔案  
            this.postMsg({
                type: "openFile",
                data: url,
            });
        }
    }

    /**
     * 路徑 轉 URL
     */
    public pathToUrl(path: string, encode = true): string {
        if (encode) {
            return this.APIURL + `/api/getFile?path=${encodeURIComponent(path)}`;
        }
        return this.APIURL + `/file/${path.replace(/\\/g, "/")}`;

        /*return "file:///" + encodeURIComponent(path)
            .replace(/[%]3A/g, ":")
            .replace(/[%]2F/g, "/")
            .replace(/[%]5C/g, "/");*/
    }

    /**
     * URL 轉 路徑
     */
    public urlToPath(path: string): string {

        path = path.split("?")[0]; // 刪除 URL 中的查詢參數

        if (path.indexOf("file:///") === 0) { // 一般檔案
            path = path.substring(8);
        }
        else if (path.indexOf("file://") === 0) { // 網路路徑，例如 \\Desktop-abc\AA
            path = path.substring(5);
        }
        path = decodeURIComponent(path).replace(/[/]/g, "\\");
        return path;
    }
}
