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
class MainWindow {
    constructor() {
        baseWindow = new BaseWindow(); //初始化視窗
        var dom_tools = document.getElementById("main-tools");
        var fileLoad = new FileLoad(this);
        var fileShow = new FileShow(this);
        var menu = new Menu(this);
        this.dom_tools = dom_tools;
        this.fileLoad = fileLoad;
        this.fileShow = fileShow;
        this.menu = menu;
        new MainTools(this);
        loadSvg();
        window.addEventListener("dragenter", dragenter, false);
        window.addEventListener("dragover", dragover, false);
        window.addEventListener('drop', drop, false);
        function dragenter(e) {
            e.stopPropagation();
            e.preventDefault();
        }
        function dragover(e) {
            e.stopPropagation();
            e.preventDefault();
        }
        function drop(e) {
            return __awaiter(this, void 0, void 0, function* () {
                if (e.dataTransfer === null) {
                    return;
                }
                let files = e.dataTransfer.files;
                console.log(files);
                //取得拖曳進來的檔案路徑
                let _dropPath = yield baseWindow.GetDropPath();
                if (_dropPath === "") {
                    return;
                }
                if (files.length > 1) {
                    let arFile = [];
                    for (let i = 0; i < files.length; i++) {
                        const item = files[i];
                        arFile.push(item.name);
                    }
                    _dropPath = yield WV_Path.GetDirectoryName(_dropPath);
                    yield fileLoad.loadFiles(_dropPath, arFile);
                }
                else {
                    yield fileLoad.loadFile(_dropPath);
                }
                e.stopPropagation();
                e.preventDefault();
                //console.log(await WV_File.GetFileInfo(_dropPath).Length)
                //console.log(await WV_File.GetCreationTimeUtc(_dropPath))
                //console.log(await WV_Directory.GetFiles(_dropPath, "*.*"))
            });
        }
        /**
         * 載入svg
         */
        function loadSvg() {
            return __awaiter(this, void 0, void 0, function* () {
                let ar_domSvg = document.querySelectorAll("[to_dom]");
                for (let i = 0; i < ar_domSvg.length; i++) {
                    const _dom = ar_domSvg[i];
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
    }
}
