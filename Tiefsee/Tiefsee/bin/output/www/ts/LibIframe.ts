class LibIframe {

    constructor() {

        //處理唯讀
        window.addEventListener("keydown", (e) => {
            if (this.isReadonly === false) { return; }

            //只允許 Ctrl+C 跟 Ctrl+A ，其餘的按鍵都攔截
            if (e.code == "KeyC" && e.ctrlKey === true) {
            } else if (e.code == "KeyA" && e.ctrlKey === true) {
            } else {
                e.preventDefault();
            }
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

            if (e.dataTransfer === null) { return; }

            let files = e.dataTransfer.files;

            let arFile = [];
            for (let i = 0; i < files.length; i++) {
                const item = files[i];
                arFile.push(item.name);
            }
            console.log(arFile)
            let json = {
                type: "loadDropFile",
                data: arFile,
            };
            this.postMsg(json);

            //  e.stopPropagation();
            //  e.preventDefault();
        }, false);
    }


    /**
     * 傳送資料給父物件
     */
    public postMsg(json: any) {
        parent.postMessage(json, "*");
    }

    /**
     * 取得 Plugin 的路徑
     */
    public getPluginPath() {
        let getUrlString = location.href;
        let url = new URL(getUrlString);
        let appInfo = url.searchParams.get("appInfo");
        if (appInfo == null) {
            return "";
        }
        let json = JSON.parse(appInfo);
        let appDataPath = json.appDataPath.replace(/\\/g, "/");
        let pathLib = "file:///" + appDataPath + "/Plugin";
        return pathLib;
    }


    _theme: any = {}

    /**
     * 初始化 Theme
     */
    public initTheme() {
        let strTheme = window.localStorage.getItem("settings.theme");
        if (strTheme === null) { return null; }

        let theme = JSON.parse(strTheme);

        //用背景色判斷是淺色還是深色主題
        function getTheme(): "light" | "dark" {
            let bg = theme["--color-window-background"];
            //判斷顏色接近黑色還是白色
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
        let c = this.decimalToHex(color.r, 2)
            + this.decimalToHex(color.g, 2)
            + this.decimalToHex(color.b, 2);
        return c;
    }
    /**
     * 10進制 to 16進制
     */
    public decimalToHex(d: string, padding: number) {
        var hex = Number(d).toString(16);
        padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
        while (hex.length < padding) {
            hex = "0" + hex;
        }
        return hex;
    }


    private isReadonly = false;//是否為唯讀
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
        var script = document.createElement("script");
        script.src = src;
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
            script.onload = function () {
                resolve(1);
            };
        })
    }


}