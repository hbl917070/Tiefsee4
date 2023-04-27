class Iframes {

    public monacoEditor;
    public pDFTronWebviewer;
    public cherryMarkdown;
    public textView;
    public pdfview;
    public welcomeview;
    public getText;
    public setTheme;

    constructor(M: MainWindow) {

        var monacoEditor = new MonacoEditor(M);
        var pDFTronWebviewer = new PDFTronWebviewer(M);
        var cherryMarkdown = new CherryMarkdown(M);
        var textview = new Textview(M);
        var pdfview = new Pdfview(M);
        var welcomeview = new Welcomeview(M);

        this.monacoEditor = monacoEditor;
        this.pDFTronWebviewer = pDFTronWebviewer;
        this.cherryMarkdown = cherryMarkdown;
        this.textView = textview;
        this.pdfview = pdfview;
        this.welcomeview = welcomeview;
        this.getText = getText;
        this.setTheme = setTheme;

        window.addEventListener("message", async (e) => {

            //只開放特定網域呼叫
            if (e.origin !== "file://") {
                console.error("錯誤的請求來源：" + e.origin)
                return;
            }

            //接收到的資料
            let type = e.data.type;
            let data = e.data.data;

            if (type === "getText") {
                _txt = data;
            }

            if (type === "openUrl") {
                WV_RunApp.OpenUrl(data);
            }
            if (type === "openFile") {
                let exePath = await WV_Window.GetAppPath();
                let filePath = Lib.URLToPath(data);

                if (await WV_File.Exists(filePath)) {
                    WV_RunApp.ProcessStart(exePath, `"${filePath}"`, true, false);
                } else {
                    M.msgbox.show({ txt: M.i18n.t("msg.notFound") + "<br>" + filePath });
                }
            }
            if (type === "loadDropFile") {
                await M.fileLoad.loadDropFile(data);
            }
            if (type === "saveText") {
                await M.script.file.save();
            }
        });

        var _txt: null | string = null;
        async function getText() {

            let groupType = M.fileShow.getGroupType()

            if (groupType === GroupType.txt) {
                _txt = textview.getText();
            } else if (groupType === GroupType.monacoEditor) {
                monacoEditor.getText();
            } else if (groupType === GroupType.md) {
                cherryMarkdown.getText();
            } else {
                return "";
            }

            for (let i = 0; i < 2000; i++) { //等待套件初始化
                if (_txt !== null) {
                    break;
                }
                await Lib.sleep(10);
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
    public loadFile;
    public loadNone;
    public setTheme;

    constructor(M: MainWindow) {

        var dom_pdftronWebviewer = document.querySelector("#mView-pdftronWebviewer") as HTMLIFrameElement;

        /** PDFTronWebviewer 是否初始化完成 */
        var isInitPDFTronWebviewer = false;

        this.visible = visible;
        this.loadFile = loadFile;
        this.loadNone = loadNone;
        this.setTheme = setTheme;

        window.addEventListener("message", (e) => {

            //只開放特定網域呼叫
            if (e.origin !== "file://") {
                console.error("錯誤的請求來源：" + e.origin)
                return;
            }

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
        async function loadFile(path: string) {

            if (dom_pdftronWebviewer.src == "") {
                let appInfoJson = encodeURIComponent(JSON.stringify(baseWindow.appInfo));
                dom_pdftronWebviewer.src = `./iframe/PDFTronWebviewer.html?appInfo=${appInfoJson}&lang=${M.config.settings.other.lang}`;
            }

            for (let i = 0; i < 2000; i++) { //等待套件初始化
                if (isInitPDFTronWebviewer === true) {
                    break;
                }
                await Lib.sleep(10);
            }

            let json = {
                type: "loadFile",
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
    public getText;
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
        this.getText = getText;
        this.setTheme = setTheme;

        window.addEventListener("message", (e) => {

            //只開放特定網域呼叫
            if (e.origin !== "file://") {
                console.error("錯誤的請求來源：" + e.origin)
                return;
            }

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
                dom_monacoEditor.src = `./iframe/MonacoEditor.html?appInfo=${appInfoJson}&lang=${M.config.settings.other.lang}`;
            }

            for (let i = 0; i < 2000; i++) { //等待套件初始化
                if (isInitMonacoEditor === true) {
                    break;
                }
                await Lib.sleep(10);
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
         * @param text 
         * @param fileType 檔案類型，例如 javascript / html
         */
        async function loadTxt(text: string, fileType: string) {
            await awaitInit();
            let json = {
                type: "loadTxt",
                data: {
                    txt: text,
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
         * 送出 getText 的請求
         */
        function getText() {
            let json = {
                type: "getText",
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
    public getText;
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
        this.getText = getText;
        this.setTheme = setTheme;

        window.addEventListener("message", (e) => {

            //只開放特定網域呼叫
            if (e.origin !== "file://") {
                console.error("錯誤的請求來源：" + e.origin)
                return;
            }

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
                dom_iframe.src = `./iframe/CherryMarkdown.html?appInfo=${appInfoJson}&lang=${M.config.settings.other.lang}`;
            }

            for (let i = 0; i < 2000; i++) { //等待套件初始化
                if (isInitCherryMarkdown === true) {
                    break;
                }
                await Lib.sleep(10);
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
         * 送出 getText 的請求
         */
        function getText() {
            let json = {
                type: "getText",
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
            }
        }

    }
}


class Textview {
    public visible;
    //public loadFile;
    public loadTxt;
    public loadNone;
    public setReadonly;
    public getText;
    //public setTheme;

    constructor(M: MainWindow) {

        var dom_text = document.querySelector("#mView-txt") as HTMLTextAreaElement;

        this.visible = visible;
        //this.loadFile = loadFile;
        this.loadTxt = loadText;
        this.loadNone = loadNone;
        this.setReadonly = setReadonly;
        this.getText = getText;
        //this.setTheme = setTheme;


        //處理唯讀
        dom_text.addEventListener("keydown", (e) => {
            if (isReadonly === false) { return; }

            //只允許 Ctrl+C 跟 Ctrl+A ，其餘的按鍵都攔截
            if (e.code == "KeyC" && e.ctrlKey === true) {
            } else if (e.code == "KeyA" && e.ctrlKey === true) {
            } else {
                e.preventDefault();
            }
        })

        /** 
          * 顯示或隱藏dom
          */
        function visible(val: boolean) {
            if (val === true) {
                dom_text.style.display = "block";
            } else {
                dom_text.style.display = "none";
            }
        }


        /**
         * 載入文字
         */
        async function loadText(text: string) {
            dom_text.scrollTo(0, 0); //捲到最上面
            dom_text.value = text;
        }

        var isReadonly = false; //是否為唯讀
        /**
          * 設定是否唯讀
          */
        async function setReadonly(val: boolean) {
            isReadonly = val;
            if (val) {
                dom_text.setAttribute("readonly", "readonly");
            } else {
                dom_text.removeAttribute("readonly");
            }
        }

        /**
         * 清空內容
         */
        function loadNone() {
            loadText("");
        }

        function getText() {
            return dom_text.value;
        }

    }


}


class Pdfview {
    public visible;
    public loadFile;
    public loadNone;

    constructor(M: MainWindow) {

        var dom_iframe = document.querySelector("#mView-pdf") as HTMLTextAreaElement;

        this.visible = visible;
        this.loadFile = loadFile;
        this.loadNone = loadNone;

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

        /**
         * 載入檔案
         */
        async function loadFile(fileInfo2: FileInfo2) {
            let _url = WebAPI.getPdf(fileInfo2);
            dom_iframe.setAttribute("src", _url);
        }

        /**
         * 清空內容
         */
        function loadNone() {
            dom_iframe.setAttribute("src", "");
        }
    }
}


class Welcomeview {

    public visible;
    public dom;

    constructor(M: MainWindow) {

        var dom_welcomeview = document.querySelector("#mView-welcome") as HTMLDivElement;
        this.visible = visible;
        this.dom = dom_welcomeview;

        /** 
        * 顯示或隱藏dom
        */
        function visible(val: boolean) {
            if (val === true) {
                dom_welcomeview.style.display = "flex";
            } else {
                dom_welcomeview.style.display = "none";
            }
        }
    }
}