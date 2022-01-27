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
class Script {
    constructor(M) {
        this.img = new ScriptImg(M);
        this.fileLoad = new ScriptFileLoad(M);
        this.fileShow = new ScriptFileShow(M);
        this.file = new ScriptFile(M);
        this.menu = new ScriptMenu(M);
        this.open = new ScriptOpen(M);
        this.copy = new ScriptCopy(M);
        this.setting = new ScriptSetting(M);
    }
}
class ScriptImg {
    constructor(_M) {
        this.M = _M;
    }
    /** 全滿 */
    zoomFull() {
        this.M.fileShow.tieefseeview.zoomFull(TieefseeviewZoomType['full-wh']);
    }
    /** 原始大小 */
    zoom100() {
        this.M.fileShow.tieefseeview.zoomFull(TieefseeviewZoomType['100%']);
    }
    /** 順時針90° */
    degForward() {
        this.M.fileShow.tieefseeview.setDegForward(undefined, undefined);
    }
    /** 逆時針90° */
    degReverse() {
        this.M.fileShow.tieefseeview.setDegReverse(undefined, undefined);
    }
    /** 水平鏡像 */
    mirrorHorizontal() {
        this.M.fileShow.tieefseeview.setMirrorHorizontal(!this.M.fileShow.tieefseeview.getMirrorHorizontal());
    }
    /** 垂直鏡像 */
    mirrorVertica() {
        this.M.fileShow.tieefseeview.setMirrorVertica(!this.M.fileShow.tieefseeview.getMirrorVertica());
    }
    /** 初始化旋轉 */
    transformRefresh() {
        this.M.fileShow.tieefseeview.transformRefresh(true);
    }
    /** 放大 */
    zoomIn() {
        this.M.fileShow.tieefseeview.zoomIn();
    }
    /** 縮小 */
    zoomOut() {
        this.M.fileShow.tieefseeview.zoomOut();
    }
    /** 向特定方向移動圖片 */
    move(type, distance) {
        this.M.fileShow.tieefseeview.move(type, distance);
    }
}
class ScriptFileLoad {
    constructor(_M) {
        this.M = _M;
    }
    /** 上一張 */
    prev() {
        this.M.fileLoad.prev();
    }
    /** 下一張 */
    next() {
        this.M.fileLoad.next();
    }
    /** 顯示 刪除檔案 的對話方塊 */
    deleteMsg() {
        this.M.fileLoad.deleteMsg();
    }
    /** 顯示 重新命名檔案 的對話方塊 */
    renameMsg() {
        this.M.fileLoad.renameMsg();
    }
}
class ScriptFileShow {
    constructor(_M) {
        this.M = _M;
    }
}
class ScriptFile {
    constructor(_M) {
        this.M = _M;
    }
    /** 快速拖曳(拖出檔案) */
    DragDropFile() {
        setTimeout(() => {
            WV_File.DragDropFile(this.M.fileLoad.getFilePath());
        }, 50);
    }
    /** 顯示檔案原生右鍵選單 */
    ShowContextMenu() {
        WV_File.ShowContextMenu(this.M.fileLoad.getFilePath(), true);
    }
}
class ScriptMenu {
    constructor(_M) {
        this.M = _M;
    }
    /** 顯示選單 開啟 */
    showOpen(btn) {
        this.M.menu.open_Button(document.getElementById("menu-open"), btn, "menuActive");
    }
    /** 顯示選單 複製 */
    showCopy(btn) {
        this.M.menu.open_Button(document.getElementById("menu-copy"), btn, "menuActive");
    }
    /** 顯示選單 旋轉與鏡像 */
    showRotate(btn) {
        this.M.menu.open_Button(document.getElementById("menu-rotate"), btn, "menuActive");
    }
}
class ScriptOpen {
    constructor(_M) {
        this.M = _M;
    }
    /** 載入檔案 */
    openFile() {
        return __awaiter(this, void 0, void 0, function* () {
            let arFile = yield WV_File.OpenFileDialog(true, "All files (*.*)|*.*", "開啟檔案");
            if (arFile.length === 0) {
                return;
            }
            if (arFile.length === 1) {
                this.M.fileLoad.loadFile(arFile[0]);
            }
            if (arFile.length > 1) {
                this.M.fileLoad.loadFiles(arFile[0], arFile);
            }
        });
    }
    /** 另開視窗 */
    newWindow() {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
            let exePath = yield WV_Window.GetAppPath();
            if (yield WV_File.Exists(filePath)) {
                WV_RunApp.ProcessStart(exePath, `"${filePath}"`, true, false);
            }
            else {
                WV_RunApp.ProcessStart(exePath, "", true, false);
            }
        });
    }
    /** 開啟檔案位置 */
    showOnExplorer() {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
            if ((yield WV_File.Exists(filePath)) === false) {
                return;
            }
            WV_File.ShowOnExplorer(filePath);
        });
    }
    /** 顯示檔案右鍵選單 */
    ShowContextMenu() {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
            if ((yield WV_File.Exists(filePath)) === false) {
                return;
            }
            WV_File.ShowContextMenu(filePath, true);
        });
    }
    /** 列印 */
    PrintFile() {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
            if ((yield WV_File.Exists(filePath)) === false) {
                return;
            }
            WV_File.PrintFile(filePath);
        });
    }
    /** 設成桌布 */
    SetWallpaper() {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
            if ((yield WV_File.Exists(filePath)) === false) {
                return;
            }
            WV_System.SetWallpaper(filePath);
        });
    }
    /** 選擇其他應用程式*/
    RunApp() {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
            if ((yield WV_File.Exists(filePath)) === false) {
                return;
            }
            WV_RunApp.ShowMenu(filePath);
        });
    }
    /** 以3D小畫家開啟 */
    Open3DMSPaint() {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
            if ((yield WV_File.Exists(filePath)) === false) {
                return;
            }
            WV_RunApp.Open3DMSPaint(filePath); //開啟檔案
        });
    }
}
class ScriptCopy {
    constructor(_M) {
        this.M = _M;
    }
    /** 複製 檔案 */
    copyFile() {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
            if ((yield WV_File.Exists(filePath)) === false) {
                return;
            }
            WV_System.SetClipboard_File(filePath);
        });
    }
    /** 複製 檔名 */
    copyName() {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
            if ((yield WV_File.Exists(filePath)) === false) {
                return;
            }
            let name = Lib.GetFileName(filePath);
            WV_System.SetClipboard_Txt(name);
        });
    }
    /** 複製 完整路徑 */
    copyPath() {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
            if ((yield WV_File.Exists(filePath)) === false) {
                return;
            }
            WV_System.SetClipboard_Txt(filePath);
        });
    }
    /** 複製 影像 */
    copyImg() {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
            if ((yield WV_File.Exists(filePath)) === false) {
                return;
            }
            WV_System.SetClipboard_FileToImg(filePath);
        });
    }
    /** 複製 base64  */
    copyBase64() {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
            if ((yield WV_File.Exists(filePath)) === false) {
                return;
            }
            WV_System.SetClipboard_FileToBase64(filePath);
        });
    }
    /** 複製 影像(含透明色) */
    copyPng() {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
            if ((yield WV_File.Exists(filePath)) === false) {
                return;
            }
            WV_System.SetClipboard_FileToPng(filePath);
        });
    }
    /** 複製 SVG 文字 */
    copyTxt() {
        return __awaiter(this, void 0, void 0, function* () {
            let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
            if ((yield WV_File.Exists(filePath)) === false) {
                return;
            }
            WV_System.SetClipboard_FileToTxt(filePath);
        });
    }
}
class ScriptSetting {
    constructor(_M) {
        this.temp_setting = null; //用於判斷視窗是否已經開啟
        this.M = _M;
    }
    /** 開啟 設定 視窗 */
    OpenSetting() {
        return __awaiter(this, void 0, void 0, function* () {
            //如果視窗已經存在，就不再新開
            if (this.temp_setting != null) {
                if ((yield this.temp_setting.Visible) === true) {
                    this.temp_setting.WindowState = 0; //視窗化
                    return;
                }
            }
            //新開視窗
            this.temp_setting = yield baseWindow.newWindow("SettingWindow.html");
            /*await this.temp_setting.SetSize(500 * window.devicePixelRatio, 450 * window.devicePixelRatio);//初始化視窗大小
    
            //設定坐標，從父視窗的中間開啟
            let w = await this.temp_setting.Width - baseWindow.width;
            let h = await this.temp_setting.Height - baseWindow.height;
            this.temp_setting.SetPosition(
                baseWindow.left - (w / 2),
                baseWindow.top - (h / 2)
            )*/
        });
    }
}
