import { Lib } from "./Lib";

export class WebAPI {

    static Directory = class {

        /**
         * 取得跟自己同層的資料夾內的檔案資料(自然排序的前4筆)
         * @param path 
         * @param arExt 副檔名
         * @param maxCount 資料夾允許處理的最大數量
         */
        static async getSiblingDir(path: string, arExt: string[], maxCount: number) {
            let url = APIURL + "/api/directory/getSiblingDir";
            let postData = { path: path, arExt: arExt, maxCount: maxCount };
            let retJson = await WebAPI.sendPost(url, postData);

            let parentPath = Lib.getDirectoryName(path) ?? path;

            // 為了減少資料傳輸量，所以返回的資料只有資料夾名跟檔名，要把他們處理回絕對路徑
            let json: any = {};
            for (const key in retJson) {
                if (retJson.hasOwnProperty(key) == false) { continue; }
                var newKey = Lib.combine([parentPath, key]);
                json[newKey] = retJson[key].map((value: string) => {
                    // return newKey + "\\" + value;
                    return value;
                })
            }

            return json;
        }

        /**
         * 傳入路徑集合，回傳每個資料夾内的檔案
         * @param arPath 路徑集合
         */
        static async getFiles2(arPath: string[]) {
            // 取得共同的開頭(通常是資料夾路徑)
            let dirPath = Lib.getDirectoryName(arPath[0]);
            if (dirPath === null) { return []; }
            // 處理成檔名
            let arName = arPath.map(arg => Lib.getFileName(arg));

            let url = APIURL + "/api/directory/getFiles2";
            let postData = { dirPath: dirPath, arName: arName };
            let retAr: string[] = await WebAPI.sendPost(url, postData);
            for (let i = 0; i < retAr.length; i++) { // 把檔名轉成完整路徑
                retAr[i] = dirPath + retAr[i];
            }
            return retAr;
        }

        /**
         * 回傳資料夾裡面的檔案
         */
        static async getFiles(path: string, searchPattern: string) {
            let url = APIURL + "/api/directory/getFiles";
            let postData = { path: path, searchPattern: searchPattern };
            let retAr: string[] = await WebAPI.sendPost(url, postData);
            for (let i = 0; i < retAr.length; i++) { // 把檔名轉成完整路徑
                retAr[i] = path + retAr[i];
            }
            return retAr;
        }

        /**
         * 回傳資料夾裡面的子資料夾
         */
        static async getDirectories(path: string, searchPattern: string) {
            let url = APIURL + "/api/directory/getDirectories";
            let postData = { path: path, searchPattern: searchPattern };
            let retAr: string[] = await WebAPI.sendPost(url, postData);
            for (let i = 0; i < retAr.length; i++) { // 把檔名轉成完整路徑
                retAr[i] = path + retAr[i];
            }
            return retAr;
        }
    }

    static Img = class {

        /**
         * 取得檔案圖示的網址
         */
        static fileIcon(path: string) {
            return APIURL + "/api/getFileIcon?size=256&path=" + encodeURIComponent(path);
        }

        /**
         *  從網路下載圖片後，返回圖片的 icon
         */
        static webIcon(url: string, path: string) {
            const encodePath = encodeURIComponent(path);
            const encodeUrl = encodeURIComponent(url);
            const r = 0; // Math.random(); // 避免快取
            return APIURL + `/api/getWebIcon?size=256&url=${encodeUrl}&path=${encodePath}&r=${r}`;
        }

        /**
         * 取得圖片網址
         */
        static async getUrl(type: string, fileInfo2: FileInfo2) {
            const path = fileInfo2.Path;
            const encodePath = encodeURIComponent(path);
            const fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;

            if (type === "web") {
                return WebAPI.getFile(fileInfo2);
            }
            if (type === "webIcc") {
                return APIURL + `/api/img/webIcc?path=${encodePath}&${fileTime}`;
            }
            if (type === "icon") {
                return this.fileIcon(path);
            }
            if (type === "uwp") {
                return APIURL + `/api/img/uwp?path=${encodePath}&${fileTime}`;
            }
            if (type === "magick" || type === "magickBmp") {
                return APIURL + `/api/img/magick?type=bmp&path=${encodePath}&${fileTime}`;
            }
            if (type === "magickPng") {
                return APIURL + `/api/img/magick?type=png&path=${encodePath}&${fileTime}`;
            }
            if (type === "rawThumbnail") {
                return APIURL + `/api/img/rawThumbnail?path=${encodePath}&${fileTime}`;
            }
            if (type === "nconvert" || type === "nconvertBmp") {
                let url = APIURL + `/api/img/nconvert?type=bmp&path=${encodePath}&${fileTime}`;
                url = Lib.pathToUrl(await Lib.sendGet("text", url));
                return url;
            }
            if (type === "nconvertPng") {
                let url = APIURL + `/api/img/nconvert?type=png&path=${encodePath}&${fileTime}`;
                url = Lib.pathToUrl(await Lib.sendGet("text", url));
                return url;
            }
            return APIURL + `/api/img/magick?path=${encodePath}&${fileTime}`;
        }

        /**
         * 取得圖片的 size，然後把檔案處理成 vips 可以載入的格式，寫入到暫存資料夾
         */
        static async vipsInit(vipsType: string, fileInfo2: FileInfo2) {
            const path = fileInfo2.Path;
            const encodePath = encodeURIComponent(path);
            const fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
            const u = APIURL + `/api/img/vipsInit?path=${encodePath}&type=${vipsType}&${fileTime}`;
            const imgInitInfo = await Lib.sendGet("json", u);
            return imgInitInfo as {
                code: string, // 1=成功 -1=失敗
                path: string,
                width: number,
                height: number,
                vipsType: string,
            };
        }

        /**
         * 取得圖片網址 (以 vips 縮放過的圖片)
         */
        static vipsResize(scale: number, fileInfo2: FileInfo2, fileType: string, vipsType: string) {
            const path = fileInfo2.Path;
            const encodePath = encodeURIComponent(path);
            const fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
            const imgU = APIURL + `/api/img/vipsResize?path=${encodePath}&scale=${scale}&fileType=${fileType}&vipsType=${vipsType}&${fileTime}`;
            return imgU;
        }

        /**
         * 載入圖片，並取得圖片的 size
         */
        static async webInit(data: FileInfo2 | string) {

            let url = "";
            if (typeof data === "string") {
                url = data;
            } else {
                let fileInfo2 = data;
                url = WebAPI.getFile(fileInfo2);
            }

            let code: string = "-1"; // 1=成功 -1=失敗
            let width: number = 1;
            let height: number = 1;

            let img = document.createElement("img");
            await new Promise((resolve, reject) => {
                img.addEventListener("load", (e) => {
                    code = "1";
                    width = img.naturalWidth; // 初始化圖片 size
                    height = img.naturalHeight;
                    resolve(true);
                });
                img.addEventListener("error", (e) => {
                    code = "-1";
                    width = 1;
                    height = 1;
                    resolve(false);
                });
                img.src = url;
            })

            return {
                code: code,
                path: url,
                width: width,
                height: height,
            };
        }
    }

    /**
     * 
     */
    static async sendPost(url: string, postData: any) {
        let json: any;
        await fetch(url, {
            body: JSON.stringify(postData),
            method: "POST",
            priority: "high", // 高優先權
        }).then((response) => {
            return response.json();
        }).then((t) => {
            json = t;
        }).catch((err) => {
            console.log("sendPost Error: ", err);
        });
        return json;
    }

    /**
     * 排序
     */
    static async sort(ar: string[], type: string) {
        const url = APIURL + "/api/sort";
        const postData = { ar: ar, type: type };
        return WebAPI.sendPost(url, postData);
    }

    /**
     * 排序 (專用於排序路徑)
     */
    static async sort2(ar: string[], type: string) {

        if (ar.length === 0) { return [] }

        // 取得共同的開頭(通常是資料夾路徑)
        let dirPath = Lib.getDirectoryName(ar[0]) as string;
        if (dirPath === null) { return [] }

        for (let i = 0; i < ar.length; i++) {
            const path = ar[i];
            if (path.indexOf(dirPath) !== 0) {
                dirPath = Lib.getDirectoryName(dirPath) as string;
            }
        }

        let retAr = [];
        // 把每一筆資料都剪成只有結尾的部分(通常是檔名)
        let dirPathLen = dirPath.length;
        for (let i = 0; i < ar.length; i++) {
            retAr.push(ar[i].substring(dirPathLen));
        }

        if (type === "name" || type === "nameDesc") {
            retAr = await this.sort(retAr, type);
        } else {
            let url = APIURL + "/api/sort2";
            let postData = { dir: dirPath, ar: retAr, type: type };
            retAr = await WebAPI.sendPost(url, postData);
        }

        // 把排序後的資料恢復到完整路徑
        for (let i = 0; i < retAr.length; i++) {
            retAr[i] = dirPath + retAr[i];
        }

        return retAr;
    }

    /**
     * 取得 文字檔內容
     */
    static async getText(path: string) {
        const encodePath = encodeURIComponent(path);
        const url = APIURL + `/api/getText?path=${encodePath}&r=${Math.random()}`;
        const ret = await Lib.sendGet("text", url);
        return ret;
    }

    /**
     * 取得 pdf的網址
     */
    static getPdf(fileInfo2: FileInfo2) {
        const path = fileInfo2.Path;
        const fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
        const encodePath = encodeURIComponent(path);
        const url = `${APIURL}/api/getPdf?path=${encodePath}&${fileTime}`
        return url;
    }

    /**
     * 取得檔案
     */
    static getFile(file: string | FileInfo2) {

        if (typeof file === "string") {
            const encodePath = encodeURIComponent(file);
            return APIURL + `/api/getFile?path=${encodePath}`;
        }

        const fileInfo2 = file;
        const path = fileInfo2.Path;
        const encodePath = encodeURIComponent(path);
        const fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
        return APIURL + `/api/getFile?path=${encodePath}&${fileTime}`;
    }

    // 用於區別影片來自哪個視窗
    private static windowId = Math.random();

    /**
     * 取得影片
     */
    static getVideo(path: string) {
        const encodePath = encodeURIComponent(path);
        return APIURL + `/api/getVideo?path=${encodePath}&windowId=${this.windowId}`;
    }

    /**
     * 取得 檔案exif
     */
    static async getExif(fileInfo2: FileInfo2, maxLength: number) {
        const path = fileInfo2.Path;
        const fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
        const encodePath = encodeURIComponent(path);
        const url = APIURL + `/api/getExif?maxLength=${maxLength}&path=${encodePath}&${fileTime}`;
        const json = await Lib.sendGet("json", url);
        return json as {
            code: string,
            data: {
                group: string,
                name: string,
                value: string,
            }[]
        };
    }

    /**
     * 取得 檔案基本資料
     */
    static async getFileInfo2(path: string) {
        const s = await WV_File.GetFileInfo2(path);
        const json: FileInfo2 = JSON.parse(s);
        json.FullPath = json.Path;
        return json;
        /*let encodePath = encodeURIComponent(path);
        let url = APIURL + `/api/getFileInfo2?path=${encodePath}&r=${Math.random()}`;
        let json: FileInfo2 = await fetchGet_json(url);
        return json;*/
    }

    /**
    * 取得 多筆檔案基本資料
    */
    static async getFileInfo2List(arPath: string[]) {
        const url = APIURL + "/api/getFileInfo2List";
        const postData = { ar: arPath };
        const retAr = await WebAPI.sendPost(url, postData);
        for (let i = 0; i < retAr.length; i++) {
            retAr[i].FullPath = retAr[i].Path;
        }
        return retAr as FileInfo2[];
    }

    /**
     * 取得 UWP 列表
     */
    static async getUwpList() {
        const url = APIURL + "/api/getUwpList";
        const postData = {};
        const ret = await WebAPI.sendPost(url, postData);
        return ret as { Logo: string, Name: string, Id: string }[];
    }

    /**
      * 取得 相關檔案
      */
    static async getRelatedFileList(path: string, arTextExt: string[]) {
        //let arTextExt = ["txt", "json", "xml", "info", "ini", "config"];
        const textExt = arTextExt.join(",")
        const encodePath = encodeURIComponent(path);
        const url = APIURL + `/api/getRelatedFileList?path=${encodePath}&textExt=${textExt}&r=${Math.random()}`;
        const json = await Lib.sendGet("json", url);
        return json as { path: string, text: string | null }[];
    }

    /**
     * 檢查檔案是否為二進制檔
     */
    static async isBinary(fileInfo2: FileInfo2) {

        // 如果檔案大於 10M，就直接視為二進制檔
        if (fileInfo2.Lenght > 1024 * 1024 * 10) {
            return true;
        }
        const path = fileInfo2.Path;
        const fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
        const encodePath = encodeURIComponent(path);
        const url = APIURL + `/api/isBinary?path=${encodePath}&${fileTime}`;
        const ret = await Lib.sendGet("text", url);
        return ret === "True";
    }

    /**
     * 取得剪貼簿內容
     */
    static async getClipboardContent() {
        const maxTextLength = 1000;
        const url = APIURL + `/api/getClipboardContent?maxTextLength=${maxTextLength}`;
        const ret = await Lib.sendGet("json", url);
        return ret as { Type: string, Data: string };
    }

    /**
    * 解析多幀圖片
    */
    static async extractFrames(path: string) {
        const url = APIURL + "/api/extractFrames";
        const postData = { imgPath: path, outputDir: "" };
        const retAr = await WebAPI.sendPost(url, postData);
        return retAr as string;
    }

    /**
     * 轉送 post
     */
    static async forwardPost(url: string, formData: FormData, timeout: number) {
        let json: any = "";
        const controller = new AbortController(); // 建立一個新的中止控制器    
        const signal = controller.signal;
        const timeoutId = setTimeout(() => controller.abort(), timeout); // 設定n秒後取消fetch()請求

        try {
            await fetch(APIURL + "/api/forwardRequest", {
                "body": formData,
                "method": "POST",
                headers: { targetUrl: url, },
                signal,
            }).then((response) => {
                return response.json();
            }).then((html) => {
                json = html;
            })
        } catch (error) {
            json = "";
        } finally {
            clearTimeout(timeoutId); // 清除 timeoutId 以防止記憶體洩漏
        }

        return json;
    }

    /**
     * 轉送 get
     */
    static forwardGet(url: string) {
        return APIURL + "/api/forwardRequest?targetUrl=" + encodeURIComponent(url);
    }
}
