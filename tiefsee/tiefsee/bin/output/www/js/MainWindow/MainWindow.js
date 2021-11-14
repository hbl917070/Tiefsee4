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
        initDomImport();
        var OtherAppOpenList = {
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
        function initOtherAppOpen() {
            return __awaiter(this, void 0, void 0, function* () {
                var dom_Open3DMSPaint = document.getElementById("menu-Open3DMSPaint");
                if (dom_Open3DMSPaint !== null) {
                    dom_Open3DMSPaint.onclick = () => __awaiter(this, void 0, void 0, function* () {
                        let filePath = fileLoad.getFilePath(); //目前顯示的檔案
                        if ((yield WV_File.Exists(filePath)) === false) {
                            return;
                        }
                        menu.close(); //關閉menu
                        WV_UseOtherAppOpen.Open3DMSPaint(filePath); //開啟檔案
                    });
                }
                var dom_menuOtherAppOpen = document.getElementById("menu-otherAppOpen");
                let ar_lnk = yield WV_UseOtherAppOpen.GetStartMenuList();
                for (let i = 0; i < ar_lnk.length; i++) {
                    const lnk = ar_lnk[i];
                    let name = lnk.substr(lnk.lastIndexOf("\\") + 1); //取得檔名
                    name = name.substr(0, name.length - 4);
                    if (yield OtherAppOpenCheck(lnk, name)) {
                        let exePath = yield WV_System.LnkToExePath(lnk);
                        //let imgBase64 = await WV_Image.GetExeIcon_32(exePath);
                        let imgBase64 = yield WV_Image.GetFileIcon(exePath, 32);
                        let dom = newDiv(`
                        <div class="menu-hor-item">
                            <div class="menu-hor-icon">
                                <img src="${imgBase64}">
                            </div>
                            <div class="menu-hor-txt" i18n="">${name}</div>
                        </div>
                    `);
                        dom.onclick = () => __awaiter(this, void 0, void 0, function* () {
                            let filePath = fileLoad.getFilePath(); //目前顯示的檔案
                            if ((yield WV_File.Exists(filePath)) === false) {
                                return;
                            }
                            menu.close(); //關閉menu
                            WV_UseOtherAppOpen.ProcessStart(exePath, filePath, true, false); //開啟檔案
                        });
                        dom_menuOtherAppOpen === null || dom_menuOtherAppOpen === void 0 ? void 0 : dom_menuOtherAppOpen.append(dom);
                    }
                }
            });
        }
        initOtherAppOpen();
        function OtherAppOpenCheck(lnk, name) {
            return __awaiter(this, void 0, void 0, function* () {
                //let name = await WV_Path.GetFileNameWithoutExtension(lnk);
                for (let i = 0; i < OtherAppOpenList.startMenu.length; i++) {
                    const item = OtherAppOpenList.startMenu[i];
                    if (name.toLocaleLowerCase().indexOf(item.name.toLocaleLowerCase()) > -1) {
                        return true;
                    }
                }
                return false;
            });
        }
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
            });
        }
    }
}
