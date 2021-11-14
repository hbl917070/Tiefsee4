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
class FileShow {
    constructor(M) {
        var view_image = new Tieefseeview(document.querySelector("#main-tiefseeview"));
        var dom_image = document.querySelector("#main-tiefseeview");
        var dom_pdf = document.querySelector("#main-pdfview");
        this.openImage = openImage;
        this.openPdf = openPdf;
        this.view_image = view_image;
        openImage("https://wall.bahamut.com.tw/B/40/5328257e8d00594e61f8b815d505cab3_4080425.JPG");
        function openImage(_path) {
            return __awaiter(this, void 0, void 0, function* () {
                //let _url = ;
                dom_image.style.display = "block";
                dom_pdf.style.display = "none";
                let imgurl = _path; //圖片網址
                if ((yield WV_File.Exists(_path)) === true) {
                    imgurl = "/api/getimg/" + encodeURIComponent(_path);
                }
                //await view_image.loadImg(imgurl);
                view_image.setLoading(true);
                yield view_image.getIsLoaded(imgurl); //預載入
                if (view_image.getOriginalWidth() * view_image.getOriginalHeight() > 2000 * 2000) {
                    yield view_image.loadBigimg(imgurl);
                }
                else {
                    yield view_image.loadImg(imgurl);
                }
                view_image.setLoading(false);
                view_image.transformRefresh(false);
                view_image.zoomFull(TieefseeviewZoomType['full-100%']);
                //圖片長寬
                let dom_size = M.dom_tools.querySelector(`[data-name="infoSize"]`);
                if (dom_size != null) {
                    dom_size.innerHTML = `${view_image.getOriginalWidth()}<br>${view_image.getOriginalHeight()}`;
                }
                if ((yield WV_File.Exists(_path)) === true) {
                    //檔案類型
                    let dom_type = M.dom_tools.querySelector(`[data-name="infoType"]`);
                    if (dom_type != null) {
                        let fileType = (yield getFileType(_path)).toLocaleUpperCase();
                        let fileLength = yield getFileLength(_path);
                        dom_type.innerHTML = `${fileType}<br>${fileLength}`;
                    }
                    //檔案修改時間
                    let dom_writeTime = M.dom_tools.querySelector(`[data-name="infoWriteTime"]`);
                    if (dom_writeTime != null) {
                        let timeUtc = yield WV_File.GetLastWriteTimeUtc(_path);
                        let time = new Date(timeUtc).format("yyyy-MM-dd<br>hh:mm:ss");
                        dom_writeTime.innerHTML = time;
                    }
                }
                view_image.setEventChangeZoom(((ratio) => {
                    let dom_btnScale = M.dom_tools.querySelector(`[data-name="btnScale"]`);
                    if (dom_btnScale != null) {
                        dom_btnScale.innerHTML = (ratio * 100).toFixed(0) + "%";
                    }
                    //$('#output-overflow').html(`水平：${view_image.getIsOverflowX()}  垂直：${view_image.getIsOverflowY()}`);
                }));
            });
        }
        function getFileLength(path) {
            return __awaiter(this, void 0, void 0, function* () {
                let len = yield WV_File.GetFileInfo(path).Length;
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
            });
        }
        function openPdf(_url) {
            return __awaiter(this, void 0, void 0, function* () {
                dom_image.style.display = "none";
                dom_pdf.style.display = "block";
                dom_pdf.setAttribute("src", _url);
                //dom_pdf.setAttribute("src", "file:///C:/Users/wen/Desktop/dd.html");
            });
        }
        function getFileType(path) {
            return __awaiter(this, void 0, void 0, function* () {
                let fileType = yield WV_File.GetFIleType(path); //取得檔案類型
                let fileExt = yield WV_Path.GetExtension(path); //取得附檔名
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
}
