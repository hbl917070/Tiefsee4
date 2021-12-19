"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Lib {
    /**
     * 註冊 double click 事件
     * @param dom
     * @param func
     * @param dealy 雙擊的時間(毫秒)
     */
    static addEventDblclick(dom, func, dealy = 400) {
        var clickTimeout = -1;
        var _x = 0;
        var _y = 0;
        dom.addEventListener("mousedown", (e) => __awaiter(this, void 0, void 0, function* () {
            if (e.button !== 0) { //如果不是滑鼠左鍵
                return;
            }
            if (clickTimeout !== -1) {
                // double click!
                clearTimeout(clickTimeout);
                clickTimeout = -1;
                if (Math.abs(_x - e.offsetX) < 4 && Math.abs(_y - e.offsetY) < 4) { //如果點擊位置一樣
                    func(e);
                }
            }
            else {
                _x = e.offsetX;
                _y = e.offsetY;
                clickTimeout = setTimeout(function () {
                    // click!
                    clickTimeout = -1;
                }, dealy);
            }
        }));
    }
    /**
     * 取得檔案基本資料
     * @param path
     * @returns FileInfo2
     */
    static GetFileInfo2(path) {
        return __awaiter(this, void 0, void 0, function* () {
            let s = yield WV_File.GetFileInfo2(path);
            let json = JSON.parse(s);
            return json;
        });
    }
    /**
     * 判斷是否為動圖(gif、apng、webp動圖、svg)
     * @param fileInfo2
     * @returns
     */
    static IsAnimation(fileInfo2) {
        let hex = fileInfo2.HexValue;
        if (Lib.GetExtension(fileInfo2.Path) === ".svg") {
            return true;
        }
        if (hex.indexOf("47 49 46 38 39 61") === 0) { //gif
            return true;
        }
        if (hex.indexOf("89 50 4E 47 0D 0A 1A 0A") === 0) { //apng
            if (hex.indexOf("08 61 63 54") > 10) { //acTL
                return true;
            }
        }
        if (hex.indexOf("57 45 42 50 56 50 38 58 0A") > 0) { //WEBPVP8X 動圖
            return true;
        }
        return false;
    }
    /**
     * 取得真實檔案類型
     * @param fileInfo2
     * @returns 小寫附檔名，例如「jpg」
     */
    static GetFileType(fileInfo2) {
        let fileExt = Lib.GetExtension(fileInfo2.Path); //取得附檔名
        fileExt = fileExt.replace(".", "").toLocaleLowerCase();
        let hex = fileInfo2.HexValue;
        if (hex.indexOf("FF D8 FF") === 0) {
            return "jpg";
        }
        if (hex.indexOf("42 4D") === 0 && hex.length > 30 && hex.substr(18, 11) === "00 00 00 00") {
            return "bmp";
        }
        if (hex.indexOf("47 49 46 38") === 0) { //GIF8
            return "gif";
        }
        if (hex.indexOf("89 50 4E 47 0D 0A 1A 0A") === 0) {
            if (hex.indexOf("08 61 63 54") > 10) { //acTL
                return "apng";
            }
            else {
                return "png";
            }
        }
        if (hex.indexOf("57 45 42 50 56 50 38 58 0A") > 0) { //WEBPVP8X 動圖
            return "webp";
        }
        if (hex.indexOf("57 45 42 50 56 50 38") > 0) { //WEBPVP8 靜態
            return "webp";
        }
        if (hex.indexOf("6D 69 6D 65 74 79 70 65 61 70 70 6C 69 63 61 74 69 6F 6E 2F 76 6E 64 2E 61 64 6F 62 65 2E 73 70 61 72 6B 6C 65 72 2E 70 72 6F 6A 65 63 74 2B 64 63 78 75 63 66 50 4B") > 0) {
            //mimetypeapplication/vnd.adobe.sparkler.projectdcxucfPK
            return "xd";
        }
        if (hex.indexOf("25 50 44 46") === 0) { // %PDF
            if (fileExt === "ai") {
                return "ai";
            }
            return "pdf";
        }
        if (hex.indexOf("4C 00 00 00 01 14 02 00") === 0) {
            return "lnk";
        }
        console.log("檔案類型辨識失敗: " + fileInfo2.Path);
        console.log(hex);
        return fileExt;
    }
}
/**
 * 取得檔名。例如「abc.jpg」
 * @param path
 * @returns
 */
Lib.GetFileName = (path) => {
    path = path.replace(/[/]/ig, "\\");
    let name = path.substr(path.lastIndexOf("\\") + 1); //取得檔名
    return name;
};
/**
 * 取得附檔名。例如「.jpg」(一律小寫)
 * @param path
 * @returns
 */
Lib.GetExtension = (path) => {
    path = path.replace(/[/]/ig, "\\");
    let name = path.substr(path.lastIndexOf("\\") + 1); //取得檔名
    let index = name.lastIndexOf(".");
    if (index === -1) {
        return "";
    }
    return "." + name.substr(index + 1).toLocaleLowerCase();
};
/**
 * 串接路徑
 * @param arPath
 * @returns
 */
Lib.Combine = (arPath) => {
    if (arPath.length === 0) {
        return "";
    }
    if (arPath.length === 1) {
        return arPath[0];
    }
    let sum = arPath[0];
    sum = sum.replace(/[\\]+$/, ''); //移除結尾斜線
    sum += "\\";
    for (let i = 1; i < arPath.length; i++) {
        let item = arPath[i];
        item = item.replace(/^([\\])+/, ''); //移除開頭斜線
        item = item.replace(/[\\]+$/, ''); //移除結尾斜線
        sum += item;
        if (i != arPath.length - 1) {
            sum += "\\";
        }
    }
    return sum;
};
/**
 * 匯入外部檔案
 */
function initDomImport() {
    return __awaiter(this, void 0, void 0, function* () {
        let ar_dom = document.querySelectorAll("import");
        for (let i = 0; i < ar_dom.length; i++) {
            const _dom = ar_dom[i];
            let src = _dom.getAttribute("src");
            if (src != null)
                yield fetch(src, {
                    "method": "get",
                }).then((response) => {
                    return response.text();
                }).then((html) => {
                    _dom.outerHTML = html;
                }).catch((err) => {
                    console.log("error: ", err);
                });
        }
    });
}
/**
 * html字串 轉 dom物件
 * @param html
 * @returns
 */
function newDiv(html) {
    let div = document.createElement("div");
    div.innerHTML = html;
    return div.getElementsByTagName("div")[0];
}
/**
 * 等待
 * @param ms 毫秒
 */
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise((resolve, reject) => {
            setTimeout(function () {
                resolve(0); //繼續往下執行
            }, ms);
        });
    });
}
/**
 * 轉 number
 */
function toNumber(t) {
    if (typeof (t) === "number") {
        return t;
    } //如果本來就是數字，直接回傳     
    if (typeof t === 'string') {
        return Number(t.replace('px', ''));
    } //如果是string，去掉px後轉型成數字
    return 0;
}
/**
 * 對Date的擴充套件，將 Date 轉化為指定格式的String
 * 月(M)、日(d)、小時(h)、分(m)、秒(s)、季度(q) 可以用 1-2 個佔位符，
 * 年(y)可以用 1-4 個佔位符，毫秒(S)只能用 1 個佔位符(是 1-3 位的數字)
 * 例子：
 * (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 * (new Date()).format("yyyy-M-d h:m:s.S")   ==> 2006-7-2 8:9:4.18
 */
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds() //millisecond
    };
    if (/(y+)/.test(format))
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
};
