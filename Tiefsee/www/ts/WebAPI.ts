class WebAPI {

    /**
     * 
     */
    static async sendPost(url: string, postData: any,) {
        let json: any;
        await fetch(url, {
            "body": JSON.stringify(postData),
            "method": "POST",
        }).then((response) => {
            return response.json();
        }).then((html) => {
            json = html;
            //console.log(html);
        }).catch((err) => {
            console.log("sendPost Error: ", err);
        });
        return json;
    }


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

            let parentPath = Lib.GetDirectoryName(path) ?? path;

            // 為了減少資料傳輸量，所以返回的資料只有資料夾名跟檔名，要把他們處理回絕對路徑
            let json: any = {};
            for (const key in retJson) {
                if (retJson.hasOwnProperty(key) == false) { continue; }
                var newKey = Lib.Combine([parentPath, key]);
                json[newKey] = retJson[key].map((value: string) => {
                    //return newKey + "\\" + value;
                    return value;
                })
            }

            return json;
        }

        /**
         * 檔名陣列 轉 路徑陣列 (用於載入複數檔案
         * @param dirPath 資料夾路徑
         * @param arName 檔名陣列
         */
        static async getFiles2(dirPath: string, arName: string[]) {
            let url = APIURL + "/api/directory/getFiles2";
            let postData = { dirPath: dirPath, arName: arName };
            let retAr: string[] = await WebAPI.sendPost(url, postData);
            for (let i = 0; i < retAr.length; i++) { //把檔名轉成完整路徑
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
            for (let i = 0; i < retAr.length; i++) { //把檔名轉成完整路徑
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
            for (let i = 0; i < retAr.length; i++) { //把檔名轉成完整路徑
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
         * 取得圖片網址
         */
        static async getUrl(type: string, fileInfo2: FileInfo2) {
            let _path = fileInfo2.Path;
            let encodePath = encodeURIComponent(_path);
            let fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;

            if (type === "web") {
                return Lib.pathToURL(_path) + `?${fileTime}`;
            }
            if (type === "webIcc") {
                return APIURL + `/api/img/webIcc?path=${encodePath}&${fileTime}`;
            }
            if (type === "icon") {
                return this.fileIcon(_path);
            }
            if (type === "wpf") {
                return APIURL + `/api/img/wpf?path=${encodePath}&${fileTime}`;
            }
            if (type === "magick" || type === "magickBmp") {
                return APIURL + `/api/img/magick?type=bmp&path=${encodePath}&${fileTime}`;
            }
            if (type === "magickPng") {
                return APIURL + `/api/img/magick?type=png&path=${encodePath}&${fileTime}`;
            }
            if (type === "dcraw") {
                return APIURL + `/api/img/dcraw?path=${encodePath}&${fileTime}`;
            }
            if (type === "nconvert" || type === "nconvertBmp") {
                let url = APIURL + `/api/img/nconvert?type=bmp&path=${encodePath}&${fileTime}`;
                url = Lib.pathToURL(await Lib.sendGet("text", url));
                return url;
            }
            if (type === "nconvertPng") {
                let url = APIURL + `/api/img/nconvert?type=png&path=${encodePath}&${fileTime}`;
                url = Lib.pathToURL(await Lib.sendGet("text", url));
                return url;
            }
            return APIURL + `/api/img/magick?path=${encodePath}&${fileTime}`;
        }

        /**
         * 取得圖片的size，然後把檔案處理成vips可以載入的格式，寫入到暫存資料夾
         */
        static async vipsInit(vipsType: string, fileInfo2: FileInfo2) {
            let _path = fileInfo2.Path;
            let encodePath = encodeURIComponent(_path);
            let fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
            let u = APIURL + `/api/img/vipsInit?path=${encodePath}&type=${vipsType}&${fileTime}`;
            let imgInitInfo = await Lib.sendGet("json", u);
            return imgInitInfo as {
                code: string, // 1=成功 -1=失敗
                path: string,
                width: number,
                height: number,
            };
        }

        /**
         * 取得圖片網址 (以vips縮放過的圖片)
         */
        static vipsResize(scale: number, fileInfo2: FileInfo2) {
            let _path = fileInfo2.Path;
            let encodePath = encodeURIComponent(_path);
            let fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
            let imgU = APIURL + `/api/img/vipsResize?path=${encodePath}&scale=${scale}&${fileTime}`;
            return imgU;
        }

        /**
         * 載入圖片，並取得圖片的size
         */
        static async webInit(data: FileInfo2 | string) {

            let url = "";
            if (typeof data === "string") {
                url = data;
            } else {
                let fileInfo2 = data;
                let path = fileInfo2.Path;
                let fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
                url = Lib.pathToURL(path) + `?${fileTime}`;
            }

            let code: string = "-1"; // 1=成功 -1=失敗
            let width: number = 1;
            let height: number = 1;

            let img = document.createElement("img");
            await new Promise((resolve, reject) => {
                img.addEventListener("load", (e) => {
                    code = "1";
                    width = img.naturalWidth; //初始化圖片size
                    height = img.naturalHeight;
                    resolve(true); //繼續往下執行
                });
                img.addEventListener("error", (e) => {
                    code = "-1";
                    width = 1;
                    height = 1;
                    resolve(false); //繼續往下執行
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
     * 排序
     */
    static async sort(ar: string[], type: string) {
        let url = APIURL + "/api/sort";
        let postData = { ar: ar, type: type };
        return WebAPI.sendPost(url, postData);
    }

    /**
     * 排序 (專用於排序路徑)
     */
    static async sort2(ar: string[], type: string) {

        if (ar.length === 0) { return [] }

        //取得共同的開頭(通常是資料夾路徑)
        let dirPath = Lib.GetDirectoryName(ar[0]) as string;
        if (dirPath === null) { return [] }

        for (let i = 0; i < ar.length; i++) {
            const path = ar[i];
            if (path.indexOf(dirPath) !== 0) {
                dirPath = Lib.GetDirectoryName(dirPath) as string;
            }
        }

        let retAr = [];
        //把每一筆資料都剪成只有結尾的部分(通常是檔名)
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

        //把排序後的資料恢復到完整路徑
        for (let i = 0; i < retAr.length; i++) {
            retAr[i] = dirPath + retAr[i];
        }

        return retAr;
    }

    /**
     * 取得文字檔內容
     */
    static async getText(path: string) {
        let encodePath = encodeURIComponent(path);
        let url = APIURL + `/api/getText?path=${encodePath}&r=${Math.random()}`;
        let ret = await Lib.sendGet("text", url);
        return ret;
    }

    /**
     * 取得pdf的網址
     */
    static getPdf(fileInfo2: FileInfo2) {
        let path = fileInfo2.Path;
        let fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
        let encodePath = encodeURIComponent(path);
        let url = `${APIURL}/api/getPdf?path=${encodePath}&${fileTime}`
        return url;
    }

    /**
     * 取得檔案exif
     */
    static async getExif(fileInfo2: FileInfo2, maxLength: number) {
        let path = fileInfo2.Path;
        let fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
        let encodePath = encodeURIComponent(path);
        let url = APIURL + `/api/getExif?maxLength=${maxLength}&path=${encodePath}&${fileTime}`;
        let json = await Lib.sendGet("json", url);
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
     * 取得檔案基本資料
     */
    static async getFileInfo2(path: string) {
        let s = await WV_File.GetFileInfo2(path);
        let json: FileInfo2 = JSON.parse(s);
        json.FullPath = json.Path;
        return json;
        /*let encodePath = encodeURIComponent(path);
        let url = APIURL + `/api/getFileInfo2?path=${encodePath}&r=${Math.random()}`;
        let json: FileInfo2 = await fetchGet_json(url);
        return json;*/
    }


    /**
    * 取得多筆檔案基本資料
    */
    static async getFileInfo2List(arPath: string[]) {
        let url = APIURL + "/api/getFileInfo2List";
        let postData = { ar: arPath };
        let retAr = await WebAPI.sendPost(url, postData);
        for (let i = 0; i < retAr.length; i++) {
            retAr[i].FullPath = retAr[i].Path;
        }
        return retAr as FileInfo2[];
    }

    
    /**
     * 取得UWP列表
     */
    static async getUwpList() {
        let url = APIURL + "/api/getUwpList";
        let postData = {};
        let ret = await WebAPI.sendPost(url, postData);
        return ret as { Logo: string, Name: string, Id: string }[];
    }
}
