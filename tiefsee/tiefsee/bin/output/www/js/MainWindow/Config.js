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
class Config {
    constructor() {
        this.OtherAppOpenList = {
            absolute: [
                { name: "小畫家", path: "C:/Windows/system32/mspaint.exe", type: ["img"] },
                { name: "Google Chrome", path: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe", type: ["*"] },
                { name: "Google Chrome", path: "C:/Program Files/Google/Chrome/Application/chrome.exe", type: "img" },
            ],
            startMenu: [
                { name: "photoshop", type: ["img"] },
                { name: "illustrator", type: ["img"] },
                { name: "Lightroom", type: ["img"] },
                { name: "Paint", type: ["img"] },
                { name: "photo", type: ["img"] },
                { name: "gimp", type: ["img"] },
                { name: "FireAlpaca", type: ["img"] },
                { name: "openCanvas", type: ["img"] },
                { name: "SAI", type: ["img"] },
                { name: "Pixia", type: ["img"] },
                { name: "AzPainter2", type: ["img"] },
                { name: "CorelDRAW", type: ["img"] },
                { name: "Krita", type: ["img"] },
                { name: "Artweaver", type: ["img"] },
                { name: "Lightroom", type: ["img"] },
                { name: "Perfect Effects", type: ["img"] },
                { name: "Artweaver ", type: ["img"] },
                { name: "Honeyview", type: ["img"] },
                { name: "ACDSee", type: ["img"] },
                { name: "IrfanView", type: ["img"] },
                { name: "XnView", type: ["img"] },
                { name: "FastStone", type: ["img"] },
                { name: "Hamana", type: ["img"] },
                { name: "Vieas", type: ["img"] },
                { name: "FreeVimager", type: ["img"] },
                { name: "Imagine", type: ["img"] },
                { name: "XnConvert", type: ["img"] },
                { name: "FotoSketcher", type: ["img"] },
                { name: "PhoXo", type: ["img"] },
            ]
        };
        this.settings = {
            theme: {
                "--window-border-radius": 10,
                "--color-window-background": { r: 31, g: 39, b: 43, a: 0.97 },
                "--color-window-border": { r: 255, g: 255, b: 255, a: 0.25 },
                "--color-white": { r: 255, g: 255, b: 255, },
                "--color-black": { r: 0, g: 0, b: 0, },
                "--color-blue": { r: 0, g: 200, b: 255, },
                "--color-grey": { r: 30, g: 30, b: 30, },
            }
        };
    }
    allowFileType(type) {
        if (type === GroupType.img) {
            return [
                { ext: "jpg", type: ["image"] },
                { ext: "png", type: ["image"] },
                { ext: "gif", type: ["image"] },
                { ext: "bmp", type: ["image"] },
                { ext: "webp", type: ["image"] },
                { ext: "jpeg", type: ["image"] },
                //{ ext: "tif", type: ["image"] },
                { ext: "svg", type: ["image"] },
                { ext: "", type: ["image"] },
                { ext: "", type: ["image"] },
                { ext: "", type: ["image"] },
                { ext: "", type: ["image"] },
            ];
        }
        if (type === GroupType.pdf) {
            return [
                { ext: "pdf", type: ["pdf"] },
                { ext: "ai", type: ["pdf"] },
            ];
        }
        if (type === GroupType.txt) {
            return [
                { ext: "txt", type: ["txt"] },
                { ext: "css", type: ["css"] },
                { ext: "scss", type: ["scss"] },
                { ext: "sass", type: ["sass"] },
                { ext: "less", type: ["less"] },
                { ext: "js", type: ["js"] },
                { ext: "ts", type: ["ts"] },
                { ext: "xml", type: ["xml"] },
                { ext: "html", type: ["html"] },
                { ext: "php", type: ["php"] },
                { ext: "py", type: ["py"] },
                { ext: "java", type: ["java"] },
                { ext: "cs", type: ["cs"] },
                { ext: "c", type: ["c"] },
                { ext: "cpp", type: ["cpp"] },
                { ext: "go", type: ["go"] },
                { ext: "r", type: ["r"] },
                { ext: "ini", type: ["ini"] },
                { ext: "log", type: ["log"] },
                { ext: "json", type: ["json"] },
                { ext: "sql", type: ["sql"] },
            ];
        }
        return [];
    }
    /**
     * 取得檔案類型
     * @param path
     * @returns 小寫附檔名，例如「jpg」
     */
    getFileType(path) {
        return __awaiter(this, void 0, void 0, function* () {
            let fileType = yield WV_File.GetFIleType(path); //取得檔案類型
            //console.log("fileType  " + fileType)
            let fileExt = Lib.GetExtension(path); //取得附檔名
            fileExt = fileExt.replace(".", "").toLocaleLowerCase();
            if (fileType == "255216") {
                return "jpg";
            }
            if (fileType == "7173") {
                return "gif";
            }
            if (fileType == "13780") {
                return "png";
            }
            if (fileType == "6787") {
                return "swf";
            }
            if (fileType == "6677") {
                return "bmp";
            }
            if (fileType == "5666") {
                return "psd";
            }
            if (fileType == "4838") {
                return "wmv";
            }
            if (fileType == "2669") {
                return "mkv";
            }
            if (fileType == "7076") {
                return "flv";
            }
            if (fileType == "1") {
                return "ttf";
            }
            if (fileType == "8297") {
                return "rar";
            }
            if (fileType == "55122") {
                return "7z";
            }
            if (fileType == "8075") {
                if (fileExt == "docx") {
                    return "docx";
                }
                if (fileExt == "pptx") {
                    return "pptx";
                }
                if (fileExt == "xlsx") {
                    return "xlsx";
                }
                if (fileExt == "xlsm") {
                    return "xlsm";
                }
                if (fileExt == "apk") {
                    return "apk";
                }
                if (fileExt == "xd") {
                    return "xd";
                }
                return "zip";
            }
            if (fileType == "3780") {
                if (fileExt == "ai") {
                    return "ai";
                }
                return "pdf";
            }
            if (fileType == "8273") {
                if (fileExt == "avi") {
                    return "avi";
                }
                if (fileExt == "wav") {
                    return "wav";
                }
                return "webp";
            }
            return fileExt; //無法辨識，則直接回傳附檔名
        });
    }
}
var GroupType = {
    unknown: "unknown",
    img: "img",
    imgs: "imgs",
    pdf: "pdf",
    movie: "movie",
    txt: "txt",
    welcome: "welcome",
};
