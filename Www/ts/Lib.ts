class Lib {

    /**
     * 取得資料夾路徑
     */
    public static getDirectoryName = (path: string) => {
        path = path.replace(/[/]/ig, "\\");

        let count = path.split("\\").length - 1; // 計算斜線數量

        /*if (path.lastIndexOf("\\") === path.length - 1) {
            path = path.substring(0, path.length - 1);
        }*/

        if (count === 0) { return null; } // 沒有斜線表示沒有父親目錄
        if (path.length <= 2) { return null; }

        if (path.substring(0, 2) === "\\\\") { //網路路徑，例如 \\Desktop-abc\AA
            if (count <= 3) { // 網路路徑至少要2層
                return null;
            }
            if (count === 4) {
                if (path.lastIndexOf("\\") === path.length - 1) { // 斜線在最後 例如 \\Desktop-abc\AA\
                    return null;
                }
            }
        } else {
            if (count === 1) {
                if (path.lastIndexOf("\\") === path.length - 1) { // 斜線在最後 例如 D:/
                    return null;
                }
            }
        }

        let name = path.substring(0, path.lastIndexOf("\\")); // 取得資料夾路徑

        // 避免 D:\ 變成 D:
        count = name.split("\\").length - 1; // 計算斜線數量  
        if (count === 0) {
            name = name + "\\";
        }

        return name;
    }

    /**
     * 取得檔名。例如「abc.jpg」
     * @param path 
     * @returns 
     */
    public static getFileName = (path: string) => {
        path = path.replace(/[/]/ig, "\\");
        return path.substring(path.lastIndexOf("\\") + 1); // 取得檔名
    }

    /**
     * 取得附檔名。例如「.jpg」(一律小寫)
     * @param path 
     * @returns 
     */
    public static getExtension = (path: string) => {
        path = path.replace(/[/]/ig, "\\");
        const name = path.substring(path.lastIndexOf("\\") + 1); // 取得檔名
        const index = name.lastIndexOf(".");
        if (index === -1) { return ""; }
        return "." + name.substring(index + 1).toLocaleLowerCase();
    }

    /**
     * 串接路徑
     * @param arPath 
     * @returns 
     */
    public static combine = (arPath: string[]): string => {
        if (arPath.length === 0) { return ""; }
        if (arPath.length === 1) { return arPath[0]; }

        let sum = arPath[0];
        sum = sum.replace(/[\\]+$/, ""); //移除結尾斜線
        sum += "\\";

        for (let i = 1; i < arPath.length; i++) {
            let item = arPath[i];
            item = item.replace(/^([\\])+/, ""); //移除開頭斜線
            item = item.replace(/[\\]+$/, ""); //移除結尾斜線
            sum += item;
            if (i != arPath.length - 1) {
                sum += "\\";
            }
        }
        return sum;
    }

    /**
     * 註冊 double click 事件
     * @param dom 
     * @param func 
     * @param dealy 雙擊的時間 (毫秒)
     */
    public static addEventDblclick(dom: HTMLElement, func: (e: MouseEvent) => void, dealy: number = 400) {

        let clickTimeout = -1;
        let x = 0;
        let y = 0;

        dom.addEventListener("mousedown", async (e: MouseEvent) => {

            if (e.button !== 0) { // 如果不是滑鼠左鍵
                return;
            }

            if (clickTimeout !== -1) { // double click      
                clearTimeout(clickTimeout);
                clickTimeout = -1;
                if (Math.abs(x - e.offsetX) < 4 && Math.abs(y - e.offsetY) < 4) { // 如果點擊位置一樣
                    func(e)
                }
            } else {
                x = e.offsetX;
                y = e.offsetY;
                clickTimeout = setTimeout(() => { // click
                    clickTimeout = -1;
                }, dealy);
            }
        });

    }

    /**
     * 判斷是否為動圖 (gif、apng、webp動圖、svg)
     * @param fileInfo2 
     * @returns 
     */
    public static isAnimation(fileInfo2: FileInfo2) {
        const hex = fileInfo2.HexValue;
        if (Lib.getExtension(fileInfo2.Path) === ".svg") {
            return true;
        }
        if (hex.startsWith("47 49 46 38")) { // gif
            return true;
        }
        if (hex.startsWith("89 50 4E 47 0D 0A 1A 0A")) { // apng
            if (hex.indexOf("08 61 63 54") > 10) { // acTL
                return true;
            }
        }
        if (hex.indexOf("57 45 42 50 56 50 38") > 0) { // WEBPVP8
            if (hex.indexOf("41 4E 49 4D") > 0) { // ANIM
                return true;
            }
        }
        if (hex.includes("66 74 79 70 61 76 69 73")) { // avif
            return true;
        }
        return false;
    }

    /**
     * 取得真實檔案類型
     * @param fileInfo2 
     * @returns 小寫附檔名，例如 jpg
     */
    public static getFileType(fileInfo2: FileInfo2) {

        let fileExt = Lib.getExtension(fileInfo2.FullPath); // 取得附檔名
        fileExt = fileExt.replace(".", "").toLocaleLowerCase();
        let hex = fileInfo2.HexValue;

        /*console.log(fileInfo2.Path);
        let sum = "";
        let sum2 = "";
        hex.split(" ").forEach(item => {
            sum += String.fromCharCode(parseInt(item, 16));
            sum2 += `${item}(${String.fromCharCode(parseInt(item, 16))}) `;
        });
        console.log(hex);
        console.log(sum2);
        console.log(sum);*/

        if (hex.indexOf("FF D8 FF") === 0) {
            return "jpg";
        }
        if (hex.indexOf("42 4D") === 0 && hex.length > 30 && hex.substring(18, 29) === "00 00 00 00") {
            return "bmp";
        }
        if (hex.indexOf("47 49 46 38") === 0) { // GIF8
            return "gif";
        }
        if (hex.indexOf("89 50 4E 47 0D 0A 1A 0A") === 0) {
            if (hex.indexOf("08 61 63 54") > 10) { // acTL
                return "apng";
            } else {
                return "png";
            }
        }
        if (hex.indexOf("57 45 42 50 56 50 38") > 0) { // WEBPVP8
            return "webp";
        }
        if (hex.indexOf("6D 69 6D 65 74 79 70 65 61 70 70 6C 69 63 61 74 69 6F 6E 2F 76 6E 64 2E 61 64 6F 62 65 2E 73 70 61 72 6B 6C 65 72 2E 70 72 6F 6A 65 63 74 2B 64 63 78 75 63 66 50 4B") > 0) {
            // mimetypeapplication/vnd.adobe.sparkler.projectdcxucfPK
            return "xd";
        }
        if (hex.indexOf("25 50 44 46") === 0) { // %PDF
            if (fileExt === "ai") { return "ai"; }
            return "pdf";
        }
        if (hex.indexOf("4C 00 00 00 01 14 02 00") === 0) {
            return "lnk";
        }

        if (hex.indexOf("66 74 79 70 69 73 6F") === 12) { // 00() 00() 00() *(*) 66(f) 74(t) 79(y) 70(p) 69(i) 73(s) 6F(o)
            return "mp4";
        }
        if (hex.indexOf("66 74 79 70 6D 70 34") === 12) { // 00() 00() 00() *(*) 66(f) 74(t) 79(y) 70(p) 6D(m) 70(p) 34(4)
            return "mp4";
        }
        if (hex.indexOf("66 74 79 70 6D 6D 70 34") === 12) { // 00() 00() 00() 18(*) 66(f) 74(t) 79(y) 70(p) 6D(m) 6D(m) 70(p) 34(4)
            return "mp4";
        }
        if (hex.indexOf("66 74 79 70 4D 34 56") === 12) { // 00() 00() 00() 28(() 66(f) 74(t) 79(y) 70(p) 4D(M) 34(4) 56(V)
            return "mp4";
        }
        if (hex.indexOf("66 74 79 70 61 76 69 66") === 12) { // 00() 00() 00() *(*) 66(f) 74(t) 79(y) 70(p) 61(a) 76(v) 69(i) 66(f)
            return "avif";
        }
        /*if (hex.indexOf("66 74 79 70") === 12) { // 00() 00() 00() *(*) 66(f) 74(t) 79(y) 70(p)
            return "mp4"; // 可能將其他影片格式也誤判成mp4
        }*/


        if (hex.indexOf("1A 45 DF A3") === 0) { // 可擴展二進位元語言
            if (hex.indexOf("77 65 62 6D 42 87") > 0) { // 77(w) 65(e) 62(b) 6D(m) 42(B) 87()
                return "webm"
            }
        }
        if (hex.indexOf("4F 67 67 53") === 0) { // 4F(O) 67(g) 67(g) 53(S)
            return "ogv";
        }

        if (hex.indexOf("38 42 50 53") === 0) { // 38(8) 42(B) 50(P) 53(S)
            return "psd";
        }

        return fileExt;
    }

    /**
      * 取得檔案 size，例如 1.2 MB
      * @param path 
      * @returns 
      */
    public static getFileLength(len: number) {
        if (len / 1024 < 1) {
            return len.toFixed(1) + " B";
        }
        else if (len / (1024 * 1024) < 1) {
            return (len / (1024)).toFixed(1) + " KB";
        }
        else if (len / (1024 * 1024 * 1024) < 1) {
            return (len / (1024 * 1024)).toFixed(1) + " MB";
        }
        return (len / (1024 * 1024 * 1024)).toFixed(1) + " GB";
    }

    /**
     * URL 轉 路徑
     */
    public static urlToPath(path: string): string {

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

    /**
     * 路徑 轉 URL
     */
    public static pathToUrl(path: string): string {
        return "file:///" + encodeURIComponent(path)
            .replace(/[%]3A/g, ":")
            .replace(/[%]2F/g, "/")
            .replace(/[%]5C/g, "/");
    }

    /**
     * 移除可能破壞 html 的跳脫符號
     */
    public static escape(htmlStr: string) {

        if (htmlStr === undefined || htmlStr === null) {
            return "";
        }
        // 如果不是 字串
        if (typeof htmlStr !== "string") {
            return htmlStr + "";
        }

        return htmlStr.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    /** 
     * 取得整個頁面目前是否有選取文字
     */
    public static isTxtSelect() {
        let selection = window.getSelection();
        if (selection === null) { return false; }
        // let isElect = selection.anchorOffset !== selection.focusOffset;
        let isElect = selection.toString() !== "";
        return isElect;
    }

    /**
     * 取得目前的焦點是否在文字輸入框上
     */
    public static isTextFocused() {
        const dom = document.activeElement;
        if (dom === null) { return false; }
        const tag = dom.tagName;
        if (tag === "TEXTAREA") {
            return true;
        }
        if (tag === "INPUT" && dom.getAttribute("type") == "text") {
            return true;
        }
        return false;
    }

    /**
     * 判斷物件目前是否有滾動條
     * @param type X | Y
     */
    public static isScrollbarVisible(element: HTMLElement, type = "Y") {
        if (type === "y" || type === "Y") {
            return element.scrollHeight > element.clientHeight;
        } else {
            return element.scrollWidth > element.clientWidth;
        }
    }

    /**
     * 從瀏覽器取得使用者當前使用的語言
     */
    public static getBrowserLang() {
        let browserLang = navigator.language.toLowerCase();
        if (browserLang == "zh" || browserLang.startsWith("zh-")) {
            return "zh-TW";
        }
        if (browserLang.indexOf("ja") === 0) { // 日本
            return "ja";
        }
        /*if (browserLang.indexOf("ko") === 0) { // 韓文
            return "ko";
        }*/
        /*if (browserLang == "en" || browserLang.indexOf("en-") === 0) {
            return "en";
        }*/
        return "en";
    }

    /**
     * html字串 轉 dom物件
     * @param html 
     * @returns 
     */
    public static newDom(html: string) {
        const template = document.createElement("template");
        template.innerHTML = html.trim();
        return template.content.firstChild as HTMLElement;
    }

    /**
     * 送出 GET 的 http 請求
     */
    public static async sendGet(type: ("text" | "json" | "base64"), url: string, timeout = 30000) {

        const controller = new AbortController();

        const timeoutId = setTimeout(() => controller.abort(), timeout);

        if (type === "text") {
            let txt = "";
            await fetch(url, {
                method: "get",
                signal: controller.signal, // 用於取消請求
                priority: "high", // 高優先權
            }).then((response) => {
                return response.text();
            }).then((html) => {
                txt = html;
            }).catch((err) => {
                console.log("error: ", err);
                throw err;
            });
            return txt;
        }

        if (type === "json") {
            let json: any = {};
            await fetch(url, {
                method: "get",
                signal: controller.signal, // 用於取消請求
                priority: "high", // 高優先權
            }).then((response) => {
                return response.json();
            }).then((html) => {
                json = html;
            }).catch((err) => {
                console.log("error: ", err);
                throw err;
            });
            return json;
        }

        if (type === "base64") {
            const base64: string = await new Promise((resolve, _) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    const reader = new FileReader();
                    reader.onloadend = function () {
                        let d = reader.result;
                        if (typeof d === "string") {
                            resolve(d);
                        } else {
                            resolve("");
                        }
                    }
                    reader.readAsDataURL(xhr.response);
                };
                xhr.open("GET", url);
                xhr.responseType = "blob";
                xhr.send();
            });
            return base64;
        }
    }

    /**
     * 等待
     * @param ms 毫秒
     */
    public static async sleep(ms: number) {
        await new Promise((resolve, _) => {
            setTimeout(function () {
                resolve(0);
            }, ms);
        })
    }

    /**
     * 轉 number
     */
    public static toNumber(t: string | number): number {
        if (typeof (t) === "number") { return t } // 如果本來就是數字，直接回傳     
        if (typeof t === "string") { return Number(t.replace("px", "")); } // 如果是 string，去掉 px 後轉型成數字
        return 0;
    }

    /**
     * 防抖 (持續接收到指令時不會執行，停止接收指令後的x毫秒，才會執行)
     */
    public static debounce(func: (...args: any[]) => void, delay = 250) {
        let timer: ReturnType<typeof setTimeout> | null = null;

        return function (this: any, ...args: any[]) {
            let context = this;

            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        }
    }

    /**
     * 折疊面板
     * @param domTitle 標題區塊
     * @param type  "init-true" | "init-false" | "toggle" 
     */
    public static async collapse(domBox: HTMLElement, type: string, funcChange?: (type: boolean) => void) {

        const domContent = domBox.querySelector(".collapse-content") as HTMLElement;
        if (domContent === null) { return; }

        const div = domContent.querySelector("div");
        if (div === null) { return; }

        if (funcChange === undefined) {
            funcChange = (type: boolean) => { };
        }

        // 自動
        if (type === "toggle") {
            if (domBox.getAttribute("open") === "false") {
                type = "true";
            } else {
                type = "false";
            }
        }

        if (type === "false") {
            if (domContent.style.maxHeight === "") {
                domContent.style.maxHeight = div.scrollHeight + "px";
                await Lib.sleep(1);
            }
            domContent.style.maxHeight = 0 + "px";
            domBox.setAttribute("open", "false");
            funcChange(false);
        }

        if (type === "true") {
            domContent.style.maxHeight = div.scrollHeight + "px";
            domBox.setAttribute("open", "true");

            // 把最大高度切換自動
            setTimeout(() => {
                if (domBox.getAttribute("open") === "true") {
                    domContent.style.maxHeight = "";
                }
            }, 300);
            funcChange(true);
        }

        // 無動畫，用於初始化
        if (type === "init-false") {
            domContent.style.maxHeight = 0 + "px";
            domBox.setAttribute("open", "false");
            funcChange(false);
        }
        if (type === "init-true") {
            domContent.style.maxHeight = "";
            domBox.setAttribute("open", "true");
            funcChange(true);
        }
    }

    /**
     * 註冊一個 mousedown ，在移動一定距離後才觸發運行
     * @param domElement 
     * @param thresholdDistance 
     * @param eventHandler 
     */
    public static addDragThresholdListener(domElement: HTMLElement, thresholdDistance: number, eventHandler: (e: MouseEvent) => void) {
        let isDragging = false;
        let startX = 0;

        domElement.addEventListener("mousedown", (e) => {
            if (e.button === 0) {
                isDragging = true;
                startX = e.clientX;
            }
        });

        window.addEventListener("mousemove", (e) => {
            if (isDragging) {
                const deltaX = Math.abs(e.clientX - startX);
                if (deltaX >= thresholdDistance) {
                    eventHandler(e);
                    isDragging = false;
                }
            }
        });

        window.addEventListener("mouseup", () => {
            isDragging = false;
        });

        /*domElement.addEventListener("mouseleave", () => {
            isDragging = false;
        });*/
    }

    /**
     * 格式化成 json 字串
     */
    public static jsonStrFormat(str: string, space?: string | number | undefined) {
        if (space === undefined) { space = 2; }
        let jsonFormat;
        let json;
        let ok = false;
        if (typeof str === "object") {
            jsonFormat = JSON.stringify(str, null, space);
            ok = true;
        } else if (
            (str.startsWith('{') && str.endsWith('}'))
            || (str.startsWith('[') && str.endsWith(']'))
        ) {
            try {
                json = JSON.parse(str);
                jsonFormat = JSON.stringify(json, null, space);
                ok = true;
            } catch (e) {
                jsonFormat = str;
            }
        } else {
            jsonFormat = str;
        }
        return {
            json,
            jsonFormat,
            ok
        }
    }

    /**
     * 單純只處理換行而沒有縮排的格式化
     * @param obj 
     * @param removeBrackets 去除前後的 { }
     * @param removeQuotationMarks 去除"字元
     * @returns 
     */
    public static stringifyWithNewlines(obj: any, removeBrackets: boolean = false, removeQuotationMarks: boolean = false) {

        let jsonFormat = JSON.stringify(obj, null, "\uFDD9");
        jsonFormat = jsonFormat.replace(/\uFDD9/g, "");

        // 去除前後的 { }
        if (removeBrackets) {
            if (jsonFormat.startsWith("{") && jsonFormat.endsWith("}")) {
                jsonFormat = jsonFormat.substring(2, jsonFormat.length - 1);
            }
        }
        // 去除"字元
        if (removeQuotationMarks) {
            jsonFormat = jsonFormat.replace(/"/g, "");
        }
        return jsonFormat;
    }

    /** file 轉 base64 */
    public static async readFileAsDataURL(file: File): Promise<string> {
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target?.result as string);
            };
            reader.onerror = (event) => {
                reject(event.target?.error);
            };
            reader.readAsDataURL(file);
        });
    }
    /** 從 base64 判斷副檔名 */
    public static async getExtensionFromBase64(base64: string) {
        if (base64.length < 100) { return ""; }
        const base64Header = base64.slice(0, 100);
        const mimeMatch = base64Header.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
        if (!mimeMatch) { return ""; }
        const mimeType = mimeMatch[1];
        switch (mimeType) {
            case "image/png":
                return "png";
            case "image/gif":
                return "gif";
            case "image/jpeg":
            case "image/pjpeg":
                return "jpg";
            case "image/bmp":
                return "bmp";
            case "image/tiff":
                return "tiff";
            case "image/svg+xml":
                return "svg";
            case "image/webp":
                return "webp";
            case "image/avif":
                return "avif";
            case "image/x-icon":
            case "image/vnd.microsoft.icon":
                return "ico";
            case "image/octet-stream": // 如果是未知類型
                if (await this.isValidImageBase64(base64)) { // 檢查是否為圖片
                    return "png";
                } else {
                    return "";
                }
            default:
                return "";
        }
    }
    /** 檢測未知類型的 base64 是否為合法的圖片 */
    public static async isValidImageBase64(base64: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = base64;
            img.onload = () => {
                try {
                    const canvas = document.createElement("canvas");
                    canvas.width = 1;
                    canvas.height = 1;
                    const ctx = canvas.getContext("2d") as CanvasDrawImage;
                    ctx.drawImage(img, 0, 0, 1, 1, 0, 0, 1, 1);
                    resolve(true);
                } catch (e) {
                    resolve(false);
                }
            };
            img.onerror = () => {
                resolve(false);
            };
        });
    }

    /**
     * 取得 radio 值
     */
    public static getRadio(queryName: string): string {
        return $(`${queryName}:checked`).val() + "";
    }
    /**
     * 設定 radio 值
     * @param {*} queryName 例如 #rad 、 #aa [name='bb']
     * @param {*} value 
     */
    public static setRadio(queryName: string, value: string) {
        $(`${queryName}[value="${value}"]`).prop("checked", true); // radio 賦值
    }

}

/**
 * 對Date的擴充套件，將 Date 轉化為指定格式的String
 * 月(M)、日(d)、小時(h)、分(m)、秒(s)、季度(q) 可以用 1-2 個佔位符，
 * 年(y)可以用 1-4 個佔位符，毫秒(S)只能用 1 個佔位符(是 1-3 位的數字)
 * 例子：
 * (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 * (new Date()).format("yyyy-M-d h:m:s.S")   ==> 2006-7-2 8:9:4.18
 */
Date.prototype.format = function (this: Date, format: string): string {
    const o: { [key: string]: number } = {
        "M+": this.getMonth() + 1, // month
        "d+": this.getDate(), // day
        "h+": this.getHours(), // hour
        "m+": this.getMinutes(), // minute
        "s+": this.getSeconds(), // second
        "q+": Math.floor((this.getMonth() + 3) / 3), // quarter
        "S": this.getMilliseconds() // millisecond
    }

    format = format.replace(/(y+)/, (match) => {
        return (this.getFullYear() + "").substring(4 - match.length);
    });
    for (const k in o) {
        format = format.replace(new RegExp("(" + k + ")"), (match) => {
            return match.length == 1 ? o[k].toString() : ("00" + o[k]).substring(("" + o[k]).length);
        });
    }
    return format;
}
interface Date {
    format(format: string): string;
}

/**
 * 節流 (定時執行，時間內重複執行，則只會執行最後一個指令)
 */
class Throttle {
    public run: (() => Promise<void>) | undefined = undefined;

    constructor(timeout = 50) {

        let isAsyncTaskRunning = false;

        setInterval(() => {

            if (this.run === undefined) { return; }
            if (isAsyncTaskRunning) { return; }

            let func = this.run;
            this.run = undefined;
            isAsyncTaskRunning = true;

            func().then(() => {
                isAsyncTaskRunning = false;
            }).catch(() => {
                console.error();
                isAsyncTaskRunning = false;
            });

        }, timeout);
    }
}

/**
 * 限制最大同時連線數。Chrome最大連線數為6
 */
class RequestLimiter {
    private queue: [HTMLImageElement, string][];
    private inProgress: number; // 目前正在進行的請求數
    private maxRequests: number;

    constructor(maxRequests: number) {
        this.queue = [];
        this.inProgress = 0;
        this.maxRequests = Math.min(maxRequests, 6); // 設置上限
    }

    public addRequest(img: HTMLImageElement, url: string) {

        // 檢查 img 元素是否仍然存在於文檔中
        if (!document.body.contains(img)) {
            return;
        }

        // 檢查佇列中是否已經存在相同的 img 元素和網址
        const index = this.queue.findIndex(([i, u]) => i === img && u === url);
        if (index !== -1) { // 如果存在，則忽略這個請求
            return;
        }

        // 檢查佇列中是否存在相同的 img 元素但不同的網址
        const index2 = this.queue.findIndex(([i, u]) => i === img && u !== url);
        if (index2 !== -1) { // 如果存在，則將舊的請求從佇列中移除
            this.queue.splice(index2, 1);
        }

        // 添加新的請求
        this.queue.push([img, url]);
        this.processQueue();
    }

    private processQueue() {
        while (this.inProgress < this.maxRequests && this.queue.length > 0) {
            const [img, url] = this.queue.shift()!;
            this.inProgress++; // 圖片開始加載時增加 inProgress
            this.loadImage(img, url).then(() => {
                this.inProgress--;
                this.processQueue();
            }).catch((error) => {
                // console.error(error);
                this.inProgress--; // 當錯誤發生時，減少 inProgress 的值
                this.processQueue(); // 繼續處理隊列中的下一個請求
            });
        }
    }

    private loadImage(img: HTMLImageElement, url: string) {
        return new Promise<void>((resolve, reject) => {

            // 如果圖片已經不存在
            let intervalTimer = setInterval(() => {
                if (!document.body.contains(img)) {
                    // console.log("Image element has been removed from the document.");
                    clearInterval(intervalTimer);
                    clearTimeout(timeoutTimer);
                    reject("Image element has been removed from the document.");
                }
            }, 50);

            // 載入超時
            let timeoutTimer = setTimeout(() => {
                clearInterval(intervalTimer);
                reject("Loading image timed out.");
            }, 30 * 1000);

            img.src = url;
            img.onload = img.onerror = () => {
                clearInterval(intervalTimer);
                clearTimeout(timeoutTimer);
                resolve();
            };
        });
    }
}

/**
 * 指定哪些元素允許被選取
 */
class SelectionManager {
    private mode: "whitelist" | "blacklist";
    private filter: string[] = [];

    constructor(mode: "whitelist" | "blacklist") {
        this.mode = mode;
        this.init();
    }

    private init() {
        document.addEventListener("mousedown", (event: MouseEvent) => {
            // 點擊的不是左鍵
            if (event.button !== 0) {
                return;
            }

            const target = event.target as Element;
            // 如果點擊的是文字輸入框
            if (target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target instanceof HTMLSelectElement
            ) {
                return;
            }
            const isMatch = this.filter.some(selector => target.matches(selector));
            if ((this.mode === "blacklist" && isMatch) || (this.mode === "whitelist" && !isMatch)) {
                event.preventDefault();
            }
        });
    }

    public add(selector: string) {
        this.filter.push(selector);
    }
}
