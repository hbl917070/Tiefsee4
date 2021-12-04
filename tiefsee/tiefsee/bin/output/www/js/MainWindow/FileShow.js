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
        var dom_pdfview = document.querySelector("#main-pdfview");
        var dom_txtview = document.querySelector("#main-txtview");
        var dom_welcomeview = document.querySelector("#main-welcomeview");
        this.openImage = openImage;
        this.openPdf = openPdf;
        this.openTxt = openTxt;
        this.openWelcome = openWelcome;
        this.dom_image = dom_image;
        this.view_image = view_image;
        //openImage("https://wall.bahamut.com.tw/B/40/5328257e8d00594e61f8b815d505cab3_4080425.JPG")
        function setShowType(groupType) {
            var _a, _b, _c, _d;
            let arToolsGroup = document.querySelectorAll(".main-tools-group");
            for (let i = 0; i < arToolsGroup.length; i++) {
                const item = arToolsGroup[i];
                item.setAttribute("active", "");
            }
            if (groupType === GroupType.img) {
                //更換工具列
                (_a = getToolsDom(GroupType.img)) === null || _a === void 0 ? void 0 : _a.setAttribute("active", "true");
                dom_image.style.display = "block";
                dom_pdfview.style.display = "none";
                dom_txtview.style.display = "none";
                dom_welcomeview.style.display = "none";
                dom_pdfview.setAttribute("src", "");
                dom_txtview.value = "";
                //view_image.loadNone();
                return;
            }
            if (groupType === GroupType.imgs) {
                return;
            }
            if (groupType === GroupType.txt) {
                //更換工具列
                (_b = getToolsDom(GroupType.txt)) === null || _b === void 0 ? void 0 : _b.setAttribute("active", "true");
                dom_image.style.display = "none";
                dom_pdfview.style.display = "none";
                dom_txtview.style.display = "block";
                dom_welcomeview.style.display = "none";
                dom_pdfview.setAttribute("src", "");
                //dom_txtview.value = "";
                view_image.loadNone();
                return;
            }
            if (groupType === GroupType.pdf) {
                //更換工具列
                (_c = getToolsDom(GroupType.pdf)) === null || _c === void 0 ? void 0 : _c.setAttribute("active", "true");
                dom_image.style.display = "none";
                dom_pdfview.style.display = "block";
                dom_txtview.style.display = "none";
                dom_welcomeview.style.display = "none";
                //dom_pdfview.setAttribute("src", "");
                dom_txtview.value = "";
                view_image.loadNone();
                return;
            }
            if (groupType === GroupType.welcome) {
                //更換工具列
                (_d = getToolsDom(GroupType.welcome)) === null || _d === void 0 ? void 0 : _d.setAttribute("active", "true");
                dom_image.style.display = "none";
                dom_pdfview.style.display = "none";
                dom_txtview.style.display = "none";
                dom_welcomeview.style.display = "flex";
                dom_pdfview.setAttribute("src", "");
                dom_txtview.value = "";
                view_image.loadNone();
                return;
            }
        }
        function getToolsDom(type) {
            return M.dom_tools.querySelector(`.main-tools-group[data-name="${type}"]`);
        }
        /**
         *
         * @param _path
         */
        function openImage(fileInfo2) {
            var _a, _b, _c;
            return __awaiter(this, void 0, void 0, function* () {
                let _path = fileInfo2.Path;
                console.log(fileInfo2.HexValue);
                setShowType(GroupType.img); //改變顯示類型
                let imgurl = _path; //圖片網址
                if (M.fileLoad.getGroupType() === GroupType.unknown) {
                    imgurl = yield WV_Image.GetFileIcon(_path, 256);
                }
                else {
                    imgurl = "/api/getimg/" + encodeURIComponent(_path);
                }
                view_image.setLoading(true);
                yield view_image.getIsLoaded(imgurl); //預載入
                if (Lib.IsAnimation(fileInfo2) === true) { //動圖
                    yield view_image.loadImg(imgurl); //使用<img>渲染
                }
                else {
                    yield view_image.loadBigimg(imgurl); //使用canvas渲染
                }
                //await view_image.loadImg(imgurl);
                /*if (view_image.getOriginalWidth() * view_image.getOriginalHeight() > 2000 * 2000) {
                    await view_image.loadBigimg(imgurl);
                } else {
                    await view_image.loadImg(imgurl);
                }*/
                view_image.setLoading(false);
                view_image.transformRefresh(false);
                view_image.setEventChangeZoom(((ratio) => {
                    let dom_btnScale = M.dom_tools.querySelector(`[data-name="btnScale"]`);
                    if (dom_btnScale != null) {
                        dom_btnScale.innerHTML = (ratio * 100).toFixed(0) + "%";
                    }
                    //$('#output-overflow').html(`水平：${view_image.getIsOverflowX()}  垂直：${view_image.getIsOverflowY()}`);
                }));
                view_image.zoomFull(TieefseeviewZoomType['full-100%']);
                //圖片長寬
                let dom_size = (_a = getToolsDom(GroupType.img)) === null || _a === void 0 ? void 0 : _a.querySelector(`[data-name="infoSize"]`);
                if (dom_size != null) {
                    dom_size.innerHTML = `${view_image.getOriginalWidth()}<br>${view_image.getOriginalHeight()}`;
                }
                //檔案類型
                let dom_type = (_b = getToolsDom(GroupType.img)) === null || _b === void 0 ? void 0 : _b.querySelector(`[data-name="infoType"]`);
                if (dom_type != null) {
                    let fileType = (yield M.config.getFileType(_path)).toLocaleUpperCase();
                    let fileLength = getFileLength(fileInfo2.Lenght);
                    dom_type.innerHTML = `${fileType}<br>${fileLength}`;
                }
                //檔案修改時間
                let dom_writeTime = (_c = getToolsDom(GroupType.img)) === null || _c === void 0 ? void 0 : _c.querySelector(`[data-name="infoWriteTime"]`);
                if (dom_writeTime != null) {
                    let timeUtc = fileInfo2.LastWriteTimeUtc;
                    let time = new Date(timeUtc).format("yyyy-MM-dd<br>hh:mm:ss");
                    dom_writeTime.innerHTML = time;
                }
            });
        }
        /**
         *
         * @param _url
         */
        function openPdf(fileInfo2) {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                let _path = fileInfo2.Path;
                setShowType(GroupType.pdf); //改變顯示類型
                let _url = "/api/getpdf/" + encodeURIComponent(_path);
                dom_pdfview.setAttribute("src", _url);
                //檔案類型
                let dom_type = (_a = getToolsDom(GroupType.pdf)) === null || _a === void 0 ? void 0 : _a.querySelector(`[data-name="infoType"]`);
                if (dom_type != null) {
                    let fileType = (yield M.config.getFileType(_path)).toLocaleUpperCase();
                    let fileLength = getFileLength(fileInfo2.Lenght);
                    dom_type.innerHTML = `${fileType}<br>${fileLength}`;
                }
                //檔案修改時間
                let dom_writeTime = (_b = getToolsDom(GroupType.pdf)) === null || _b === void 0 ? void 0 : _b.querySelector(`[data-name="infoWriteTime"]`);
                if (dom_writeTime != null) {
                    let timeUtc = fileInfo2.LastWriteTimeUtc;
                    let time = new Date(timeUtc).format("yyyy-MM-dd<br>hh:mm:ss");
                    dom_writeTime.innerHTML = time;
                }
            });
        }
        /**
         *
         * @param _path
         */
        function openTxt(fileInfo2) {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                let _path = fileInfo2.Path;
                setShowType(GroupType.txt); //改變顯示類型
                dom_txtview.value = yield WV_File.GetText(_path);
                //檔案類型
                let dom_type = (_a = getToolsDom(GroupType.txt)) === null || _a === void 0 ? void 0 : _a.querySelector(`[data-name="infoType"]`);
                if (dom_type != null) {
                    let fileType = (yield M.config.getFileType(_path)).toLocaleUpperCase();
                    let fileLength = getFileLength(fileInfo2.Lenght);
                    dom_type.innerHTML = `${fileType}<br>${fileLength}`;
                }
                //檔案修改時間
                let dom_writeTime = (_b = getToolsDom(GroupType.txt)) === null || _b === void 0 ? void 0 : _b.querySelector(`[data-name="infoWriteTime"]`);
                if (dom_writeTime != null) {
                    let timeUtc = fileInfo2.LastWriteTimeUtc;
                    let time = new Date(timeUtc).format("yyyy-MM-dd<br>hh:mm:ss");
                    dom_writeTime.innerHTML = time;
                }
            });
        }
        /**
         *
         */
        function openWelcome() {
            return __awaiter(this, void 0, void 0, function* () {
                baseWindow.setTitle("TiefSee 4");
                setShowType(GroupType.welcome); //改變顯示類型
            });
        }
        /**
         * 取得檔案的大小的文字
         * @param path
         * @returns
         */
        function getFileLength(len) {
            //let len = await WV_File.GetFileInfo(path).Length;
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
    }
}
