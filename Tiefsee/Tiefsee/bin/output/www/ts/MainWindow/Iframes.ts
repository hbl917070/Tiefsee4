class Iframes {

    public getTxt;
    public monacoEditor;
    public pDFTronWebviewer;
    public cherryMarkdown;
    public setTheme;

    constructor(M: MainWindow) {

        var monacoEditor = new MonacoEditor(M);
        var pDFTronWebviewer = new PDFTronWebviewer(M);
        var cherryMarkdown = new CherryMarkdown(M);

        this.getTxt = getTxt;
        this.monacoEditor = monacoEditor;
        this.pDFTronWebviewer = pDFTronWebviewer;
        this.cherryMarkdown = cherryMarkdown;
        this.setTheme = setTheme;

        window.addEventListener("message", (e) => {

            //console.log(e)

            //只開放特定網域呼叫
            /*if (e.origin !== "null") {
                console.error("錯誤的請求來源：" + e.origin)
                return;
            }*/

            //接收到的資料
            let type = e.data.type;
            let data = e.data.data;

            if (type === "getTxt") {
                _txt = data;
            }

        });

        var _txt: null | string = null;
        async function getTxt() {

            let groupType = M.fileShow.getGroupType()

            if (groupType === GroupType.txt) {

            } else if (groupType === GroupType.monacoEditor) {
                monacoEditor.getTxt();
            } else if (groupType === GroupType.md) {
                cherryMarkdown.getTxt();
            } else {
                return "";
            }

            for (let i = 0; i < 2000; i++) {//等待套件初始化
                if (_txt !== null) {
                    break;
                }
                await sleep(10);
            }
            let txt = _txt
            _txt = null;
            return txt;
        }


        function setTheme() {

            let strTheme = JSON.stringify(M.config.settings.theme);
            window.localStorage.setItem("settings.theme", strTheme);

            let groupType = M.fileShow.getGroupType()

            if (groupType === GroupType.txt) {

            }
            if (groupType === GroupType.monacoEditor) {
                monacoEditor.setTheme();
            }
            if (groupType === GroupType.md) {
                cherryMarkdown.setTheme();
            }
            if (groupType === GroupType.office) {
                pDFTronWebviewer.setTheme();
            }
        }
    }


}


class PDFTronWebviewer {
    public visible;
    public load;
    public loadNone;
    public setTheme;

    constructor(M: MainWindow) {

        var dom_pdftronWebviewer = document.querySelector("#mView-pdftronWebviewer") as HTMLIFrameElement;

        /** PDFTronWebviewer 是否初始化完成 */
        var isInitPDFTronWebviewer = false;

        this.visible = visible;
        this.load = load;
        this.loadNone = loadNone;
        this.setTheme = setTheme;

        window.addEventListener("message", (e) => {

            //console.log(e)

            //只開放特定網域呼叫
            /*if (e.origin !== "null") {
                console.error("錯誤的請求來源：" + e.origin)
                return;
            }*/

            //接收到的資料
            let type = e.data.type;
            let data = e.data.data;

            if (type === "PDFTronWebviewer.initFinish") {
                isInitPDFTronWebviewer = true;
            }

        });

        /** 
         * 顯示或隱藏dom
         */
        function visible(val: boolean) {
            if (val === true) {
                dom_pdftronWebviewer.style.display = "block";
            } else {
                dom_pdftronWebviewer.style.display = "none";
            }
        }

        /**
         * 載入檔案
         */
        async function load(path: string) {

            if (dom_pdftronWebviewer.src == "") {
                let appInfoJson = encodeURIComponent(JSON.stringify(baseWindow.appInfo));
                dom_pdftronWebviewer.src = "./iframe/PDFTronWebviewer.html?appInfo=" + appInfoJson;
            }

            for (let i = 0; i < 2000; i++) {//等待套件初始化
                if (isInitPDFTronWebviewer === true) {
                    break;
                }
                await sleep(10);
            }

            let json = {
                type: "load",
                data: path,
            };
            dom_pdftronWebviewer.contentWindow?.postMessage(json, "*");
        }

        /**
         * 清空內容
         */
        function loadNone() {
            if (isInitPDFTronWebviewer === false) { return; }
            let json = {
                type: "loadNone",
                data: "",
            };
            postMsg(json);
        }

        /**
         * 套用主題
         */
        function setTheme() {
            let json = {
                type: "setTheme",
                data: null,
            };
            postMsg(json);
        }

        function postMsg(json: any) {
            if (isInitPDFTronWebviewer) {
                dom_pdftronWebviewer.contentWindow?.postMessage(json, "*");
            } else {
                console.log("PDFTronWebviewer 尚未載入完成");
            }
        }
    }
}


class MonacoEditor {

    public visible;
    public loadFile;
    public loadTxt;
    public loadNone;
    public setReadonly;
    public getTxt;
    public setTheme;

    constructor(M: MainWindow) {

        var dom_monacoEditor = document.querySelector("#mView-monacoEditor") as HTMLIFrameElement;

        /** MonacoEditor 是否初始化完成 */
        var isInitMonacoEditor = false;

        this.visible = visible;
        this.loadFile = loadFile;
        this.loadTxt = loadTxt;
        this.loadNone = loadNone;
        this.setReadonly = setReadonly;
        this.getTxt = getTxt;
        this.setTheme = setTheme;

        window.addEventListener("message", (e) => {

            //console.log(e)

            //只開放特定網域呼叫
            /*if (e.origin !== "null") {
                console.error("錯誤的請求來源：" + e.origin)
                return;
            }*/

            //接收到的資料
            let type = e.data.type;
            let data = e.data.data;

            if (type === "MonacoEditor.initFinish") {
                isInitMonacoEditor = true;
            }

        });

        /** 
         * 顯示或隱藏dom
         */
        function visible(val: boolean) {
            if (val === true) {
                dom_monacoEditor.style.display = "block";
            } else {
                dom_monacoEditor.style.display = "none";
            }
        }

        async function awaitInit() {
            if (dom_monacoEditor.src == "") {
                let appInfoJson = encodeURIComponent(JSON.stringify(baseWindow.appInfo));
                dom_monacoEditor.src = "./iframe/MonacoEditor.html?appInfo=" + appInfoJson;
            }

            for (let i = 0; i < 2000; i++) {//等待套件初始化
                if (isInitMonacoEditor === true) {
                    break;
                }
                await sleep(10);
            }
        }


        /**
         * 載入檔案
         * @param txt 
         * @param path 檔案路徑
         */
        async function loadFile(txt: string, path: string) {

            await awaitInit();

            let json = {
                type: "loadFile",
                data: {
                    txt: txt,
                    path: path,
                },
            };
            postMsg(json);
        }


        /**
         * 載入文字
         * @param txt 
         * @param fileType 檔案類型，例如 javascript / html
         */
        async function loadTxt(txt: string, fileType: string) {
            await awaitInit();
            let json = {
                type: "loadTxt",
                data: {
                    txt: txt,
                    fileType: fileType,
                },
            };
            postMsg(json);
        }

        /**
         * 設定是否唯讀
         */
        async function setReadonly(val: boolean) {
            await awaitInit();
            let json = {
                type: "setReadonly",
                data: {
                    val: val,
                },
            };
            postMsg(json);
        }

        /**
         * 清空內容
         */
        function loadNone() {
            let json = {
                type: "loadNone",
                data: null,
            };
            postMsg(json);
        }

        /**
         * 送出 getTxt 的請求
         */
        function getTxt() {
            let json = {
                type: "getTxt",
                data: null,
            };
            postMsg(json);
        }

        /**
         * 套用主題
         */
        function setTheme() {
            let json = {
                type: "setTheme",
                data: null,
            };
            postMsg(json);
        }

        function postMsg(json: any) {
            if (isInitMonacoEditor) {
                dom_monacoEditor.contentWindow?.postMessage(json, "*");
            } else {
                console.log("monacoEditor 尚未載入完成");
            }
        }

    }
}


class CherryMarkdown {
    public visible;
    public loadFile;
    public loadTxt;
    public loadNone;
    public setReadonly;
    public getTxt;
    public setTheme;

    constructor(M: MainWindow) {

        var dom_iframe = document.querySelector("#mView-cherryMarkdown") as HTMLIFrameElement;

        /** MonacoEditor 是否初始化完成 */
        var isInitCherryMarkdown = false;

        this.visible = visible;
        this.loadFile = loadFile;
        this.loadTxt = loadTxt;
        this.loadNone = loadNone;
        this.setReadonly = setReadonly;
        this.getTxt = getTxt;
        this.setTheme = setTheme;

        window.addEventListener("message", (e) => {

            //console.log(e)

            //只開放特定網域呼叫
            /*if (e.origin !== "null") {
                console.error("錯誤的請求來源：" + e.origin)
                return;
            }*/

            //接收到的資料
            let type = e.data.type;
            let data = e.data.data;

            if (type === "CherryMarkdown.initFinish") {
                isInitCherryMarkdown = true;
            }

        });

        /** 
         * 顯示或隱藏dom
         */
        function visible(val: boolean) {
            if (val === true) {
                dom_iframe.style.display = "block";
            } else {
                dom_iframe.style.display = "none";
            }
        }

        async function awaitInit() {
            if (dom_iframe.src == "") {
                let appInfoJson = encodeURIComponent(JSON.stringify(baseWindow.appInfo));
                dom_iframe.src = "./iframe/CherryMarkdown.html?appInfo=" + appInfoJson;
            }

            for (let i = 0; i < 2000; i++) {//等待套件初始化
                if (isInitCherryMarkdown === true) {
                    break;
                }
                await sleep(10);
            }
        }


        /**
         * 載入檔案並且設定目錄
         */
        async function loadFile(txt: string, dir: string) {
            await awaitInit();
            let json = {
                type: "loadFile",
                data: {
                    txt: txt,
                    dir: dir,
                },
            };
            postMsg(json);
        }


        /**
         * 載入文字
         */
        async function loadTxt(txt: string) {
            await awaitInit();
            let json = {
                type: "loadTxt",
                data: {
                    txt: txt,
                },
            };
            postMsg(json);
        }


        /**
         * 設定是否唯讀
         */
        async function setReadonly(val: boolean) {
            await awaitInit();
            let json = {
                type: "setReadonly",
                data: {
                    val: val,
                },
            };
            postMsg(json);
        }


        /**
         * 清空內容
         */
        function loadNone() {
            let json = {
                type: "loadNone",
                data: null,
            };
            postMsg(json);
        }

        /**
         * 送出 getTxt 的請求
         */
        function getTxt() {
            let json = {
                type: "getTxt",
                data: null,
            };
            postMsg(json);
        }

        /**
         * 套用主題
         */
        function setTheme() {
            let json = {
                type: "setTheme",
                data: null,
            };
            postMsg(json);
        }

        function postMsg(json: any) {
            if (isInitCherryMarkdown) {
                dom_iframe.contentWindow?.postMessage(json, "*");
            } else {
                console.log("CherryMarkdown 尚未載入完成");
            }
        }

    }
}