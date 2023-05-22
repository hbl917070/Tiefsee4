
class Script {

    //private M: MainWindow;
    public img: ScriptImg;
    public fileLoad: ScriptFileLoad;
    public fileShow: ScriptFileShow;
    public file: ScriptFile;
    public menu: ScriptMenu;
    public open: ScriptOpen;
    public copy: ScriptCopy;
    public setting: ScriptSetting;
    public window: ScriptWindow;
    public bulkView: ScriptBulkView;

    constructor(M: MainWindow) {
        this.img = new ScriptImg(M);
        this.fileLoad = new ScriptFileLoad(M);
        this.fileShow = new ScriptFileShow(M);
        this.file = new ScriptFile(M);
        this.menu = new ScriptMenu(M);
        this.open = new ScriptOpen(M);
        this.copy = new ScriptCopy(M);
        this.setting = new ScriptSetting(M);
        this.window = new ScriptWindow(M);
        this.bulkView = new ScriptBulkView(M);
    }

}


class ScriptImg {
    M: MainWindow;
    constructor(_M: MainWindow) {
        this.M = _M;
    }

    /** 檢查當前顯示的類型是否為圖片 */
    public isImg() {
        if (this.M.fileLoad.getGroupType() === GroupType.img) {
            return true;
        }
        if (this.M.fileLoad.getGroupType() === GroupType.imgs) {
            return true;
        }
        if (this.M.fileLoad.getGroupType() === GroupType.video) {
            return true;
        }
        if (this.M.fileLoad.getGroupType() === GroupType.unknown) {
            return true;
        }
        return false;
    }

    /** 全滿 */
    public zoomToFit() {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.zoomFull(TiefseeviewZoomType["fitWindow"]);
    }

    /** 原始大小 */
    public zoomTo100() {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.zoomFull(TiefseeviewZoomType["imageOriginal"]);
    }

    /** 順時針90° */
    public degForward() {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.setDegForward(undefined, undefined);
    }

    /** 逆時針90° */
    public degReverse() {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.setDegReverse(undefined, undefined);
    }

    /** 水平鏡像 */
    public mirrorHorizontal() {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.setMirrorHorizontal(!this.M.fileShow.tiefseeview.getMirrorHorizontal());
    }

    /** 垂直鏡像 */
    public mirrorVertica() {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.setMirrorVertica(!this.M.fileShow.tiefseeview.getMirrorVertica())
    }

    /** 初始化旋轉 */
    public transformRefresh() {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.transformRefresh(true);
    }

    /** 放大 */
    public zoomIn() {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.zoomIn();
    }

    /** 縮小 */
    public zoomOut() {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.zoomOut();
    }

    /** 向特定方向移動圖片 */
    public move(type: "up" | "right" | "down" | "left", distance?: number) {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.move(type, distance);
    }

}

class ScriptFileLoad {
    M: MainWindow;
    constructor(_M: MainWindow) {
        this.M = _M;
    }

    /** 第一個檔案 */
    public firstFile() {
        this.M.fileLoad.showFile(0)
    }

    /** 最後一個檔案 */
    public lastFile() {
        this.M.fileLoad.showFile(this.M.fileLoad.getWaitingFile().length - 1)
    }

    /** 上一張檔案 */
    public prevFile() {
        this.M.fileLoad.prevFile()
    }

    /** 下一張檔案 */
    public nextFile() {
        this.M.fileLoad.nextFile()
    }

    /** 上一個資料夾 */
    public prevDir() {
        this.M.fileLoad.prevDir()
    }

    /** 下一個資料夾 */
    public nextDir() {
        this.M.fileLoad.nextDir()
    }

    /** 顯示 刪除檔案 的對話方塊 */
    public showDeleteFileMsg() {
        this.M.fileLoad.showDeleteFileMsg()
    }
    /** 顯示 刪除資料夾 的對話方塊 */
    public showDeleteDirMsg() {
        this.M.fileLoad.showDeleteDirMsg()
    }
    /** 顯示 刪除當前檔案或資料夾 的對話方塊 */
    public showDeleteMsg() {
        if (this.M.fileLoad.getIsBulkView()) {
            this.showDeleteDirMsg()
        } else {
            this.showDeleteFileMsg()
        }
    }

    /** 顯示 重新命名檔案 的對話方塊 */
    public showRenameFileMsg() {
        this.M.fileLoad.showRenameFileMsg()
    }
    /** 顯示 重新命名資料夾 的對話方塊 */
    public showRenameDirMsg() {
        this.M.fileLoad.showRenameDirMsg()
    }
    /** 顯示 重新命名當前檔案或資料夾 的對話方塊 */
    public showRenameMsg() {
        if (this.M.fileLoad.getIsBulkView()) {
            this.showRenameDirMsg()
        } else {
            this.showRenameFileMsg()
        }
    }

}

class ScriptFileShow {
    M: MainWindow;
    constructor(_M: MainWindow) {
        this.M = _M;
    }
}

class ScriptFile {
    M: MainWindow;
    constructor(_M: MainWindow) {
        this.M = _M;
    }

    /** 快速拖曳(拖出檔案) */
    public dragDropFile() {
        setTimeout(async () => {
            let path;
            if (this.M.fileLoad.getIsBulkView()) {
                path = this.M.fileLoad.getDirPath();
            } else {
                path = this.M.fileLoad.getFilePath();
            }
            if (path.length > 255) {
                path = await WV_Path.GetShortPath(path); //把長路經轉回虛擬路徑，避免某些程式不支援長路經
            }
            WV_File.DragDropFile(path);
        }, 50);
    }

    /** 顯示檔案原生右鍵選單 */
    public async showContextMenu() {
        let filePath = ""; //目前顯示的檔案
        if (this.M.fileLoad.getIsBulkView()) {
            filePath = this.M.fileLoad.getDirPath();
        } else {
            filePath = this.M.fileLoad.getFilePath();
        }
        WV_File.ShowContextMenu(filePath, true);
    }

    /** 儲存文字檔 */
    public async save(btn?: HTMLElement) {
        let t = await this.M.fileShow.iframes.getText();
        let path = this.M.fileLoad.getFilePath();
        this.M.msgbox.closeAll(); //關閉所有訊息視窗
        if (t == null) {
            Toast.show(this.M.i18n.t("msg.saveFailed"), 1000 * 3); //儲存失敗
            return;
        }
        try {
            await WV_File.SetText(path, t);
            Toast.show(this.M.i18n.t("msg.saveComplete"), 1000 * 3); //儲存完成
        } catch (e) {
            Toast.show(this.M.i18n.t("msg.saveFailed") + ":\n" + e, 1000 * 3);
        }
    }
}

class ScriptMenu {
    M: MainWindow;
    constructor(_M: MainWindow) {
        this.M = _M;
    }

    /** 關閉所有 menu */
    close() {
        this.M.menu.close();
    }

    /** 顯示選單 開啟 */
    showMenuFile(btn: HTMLElement) {
        this.M.menu.openAtButton(document.getElementById("menu-file"), btn, "menuActive");
    }

    /** 顯示選單 複製 */
    showMenuCopy(btn: HTMLElement) {
        this.M.menu.openAtButton(document.getElementById("menu-copy"), btn, "menuActive");
    }

    /** 顯示選單 Layout */
    showLayout(btn?: HTMLElement) {
        this.M.mainMenu.updateMenuLayoutCheckState();
        let dom = document.getElementById("menu-layout");
        if (btn === undefined) {
            this.M.menu.openAtOrigin(dom, 0, 0);
        } else {
            this.M.menu.openAtButton(dom, btn, "menuActive");
        }
    }

    /** 顯示選單 旋轉與鏡像 */
    showMenuRotation(btn?: HTMLElement) {
        if (btn === undefined) {
            this.M.menu.openAtOrigin(document.getElementById("menu-rotate"), 0, 0);
        } else {
            this.M.menu.openAtButton(document.getElementById("menu-rotate"), btn, "menuActive");
        }
    }

    /** 顯示選單 搜圖 */
    showMenuImageSearch(btn?: HTMLElement) {
        if (btn === undefined) {
            this.M.menu.openAtOrigin(document.getElementById("menu-imgSearch"), 0, 0);
        } else {
            this.M.menu.openAtButton(document.getElementById("menu-imgSearch"), btn, "menuActive");
        }
    }

    /** 顯示選單 排序 */
    showMenuSort(btn?: HTMLElement) {
        if (btn === undefined) {
            this.M.menu.openAtOrigin(document.getElementById("menu-sort"), 0, 0);
        } else {
            this.M.menu.openAtButton(document.getElementById("menu-sort"), btn, "menuActive");
        }
    }

    /** 顯示選單 大量瀏覽模式設定 */
    showMenuBulkView(btn?: HTMLElement) {
        if (btn === undefined) {
            this.M.menu.openAtOrigin(document.getElementById("menu-bulkView"), 0, 0);
        } else {
            this.M.menu.openAtButton(document.getElementById("menu-bulkView"), btn, "menuActive");
        }
    }

    /** 顯示右鍵選單 圖片 */
    showRightMenuImage() {
        let dom = document.getElementById("menu-rightMenuImage");
        this.M.menu.openAtPosition(dom, 0, -85);
        this.M.mainMenu.updateRightMenuImageZoomRatioTxt(); //更新 右鍵選單的圖片縮放比例
    }
    /** 顯示右鍵選單 起始畫面 */
    showRightMenuWelcome() {
        let dom = document.getElementById("menu-rightMenuWelcome");
        this.M.menu.openAtPosition(dom, 0, 0);
    }
    /** 顯示右鍵選單 大量瀏覽模式 */
    showRightMenuBulkView() {
        let dom = document.getElementById("menu-rightMenuBulkView");
        this.M.menu.openAtPosition(dom, 0, -50);
    }

    /** 顯示右鍵選單 預設 */
    showRightMenuDefault() {
        let dom = document.getElementById("menu-rightMenuDefault");
        this.M.menu.openAtPosition(dom, 0, -55);
    }

    /** 顯示右鍵選單 輸入框 */
    showRightMenuText() {
        let domInput = document.activeElement;
        if (domInput === null) { return false; }
        let isReadonly = domInput.getAttribute("readonly") != null;
        var dom_cut = document.getElementById("menuitem-text-cut") as HTMLElement; //剪下
        var dom_paste = document.getElementById("menuitem-text-paste") as HTMLElement; //貼上
        if (isReadonly) {
            dom_cut.style.display = "none";
            dom_paste.style.display = "none";
        } else {
            dom_cut.style.display = "flex";
            dom_paste.style.display = "flex";
        }

        var dom = document.getElementById("menu-text");
        this.M.menu.openAtPosition(dom, 0, 0);
    }

    /** 顯示右鍵選單 一般文字 */
    showRightMenuTxt() {
        var dom = document.getElementById("menu-txt");
        this.M.menu.openAtPosition(dom, 0, 0);
    }


}


class ScriptOpen {
    M: MainWindow;
    constructor(_M: MainWindow) {
        this.M = _M;
    }

    /** 載入檔案 */
    public async openFile() {
        let arFile = await WV_File.OpenFileDialog(true, "All files (*.*)|*.*", this.M.i18n.get("menu.openFile"));
        if (arFile.length === 0) { return; }
        if (arFile.length === 1) {
            this.M.fileLoad.loadFile(arFile[0]);
        }
        if (arFile.length > 1) {
            let arName = [];
            for (let i = 0; i < arFile.length; i++) {
                arName.push(Lib.GetFileName(arFile[i]));
            }
            let dirPath = Lib.GetDirectoryName(arFile[0]);
            if (dirPath == null) { return; }
            this.M.fileLoad.loadFiles(dirPath, arName);
        }
    }

    /** 另開視窗 */
    public async openNewWindow() {
        let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
        let exePath = await WV_Window.GetAppPath();
        await this.M.saveSetting();
        if (await WV_File.Exists(filePath)) {
            WV_RunApp.ProcessStart(exePath, `"${filePath}"`, true, false);
        } else {
            WV_RunApp.ProcessStart(exePath, "", true, false);
        }
    }

    /** 在檔案總管顯示 */
    public async revealInFileExplorer() {
        let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }
        //把長路經轉回虛擬路徑
        if (filePath.length > 255) {
            filePath = await WV_Path.GetShortPath(filePath);
        }
        WV_File.ShowOnExplorer(filePath);
    }

    /** 顯示檔案右鍵選單 */
    public async systemContextMenu() {
        let filePath = "";
        if (this.M.fileLoad.getIsBulkView()) {
            filePath = this.M.fileLoad.getDirPath();
            if (await WV_Directory.Exists(filePath) === false) { return; }
        } else {
            filePath = this.M.fileLoad.getFilePath();
            if (await WV_File.Exists(filePath) === false) { return; }
        }
        //把長路經轉回虛擬路徑
        if (filePath.length > 255) {
            filePath = await WV_Path.GetShortPath(filePath);
        }
        WV_File.ShowContextMenu(filePath, true);
    }

    /** 列印 */
    public async print() {
        let filePath = await this.M.fileLoad.getFileShortPath(); //目前顯示的檔案
        //if (await WV_File.Exists(filePath) === false) { return; }
        WV_File.PrintFile(filePath);
    }

    /** 設成桌布 */
    public async setAsDesktop() {
        let filePath = await this.M.fileLoad.getFileShortPath(); //目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }
        WV_System.SetWallpaper(filePath);
    }

    /** 選擇其他應用程式*/
    public async openWith() {
        let filePath = await this.M.fileLoad.getFileShortPath(); //目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }
        WV_RunApp.ShowMenu(filePath);
    }

    /** 以3D小畫家開啟 */
    public async Open3DMSPaint() {
        let filePath = await this.M.fileLoad.getFileShortPath(); //目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }
        WV_RunApp.Open3DMSPaint(filePath); //開啟檔案
    }
}


class ScriptCopy {

    M: MainWindow;
    constructor(_M: MainWindow) {
        this.M = _M;
    }

    /** 複製 檔案 */
    public async copyFile() {
        let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }
        await WV_System.SetClipboard_File(filePath);
        Toast.show(this.M.i18n.t("msg.copyFile"), 1000 * 3); //已將「檔案」複製至剪貼簿
    }

    /** 複製 檔名 */
    public async copyName() {
        let filePath = "";
        if (this.M.fileLoad.getIsBulkView()) {
            filePath = this.M.fileLoad.getDirPath();
            if (await WV_Directory.Exists(filePath) === false) { return; }
        } else {
            filePath = this.M.fileLoad.getFilePath();
            if (await WV_File.Exists(filePath) === false) { return; }
        }
        let name = Lib.GetFileName(filePath)
        await WV_System.SetClipboard_Txt(name);
        if (this.M.fileLoad.getIsBulkView()) {
            Toast.show(this.M.i18n.t("msg.copyDirName"), 1000 * 3); //已將「檔案名稱」複製至剪貼簿
        } else {
            Toast.show(this.M.i18n.t("msg.copyFileName"), 1000 * 3); //已將「資料夾名稱」複製至剪貼簿
        }
    }

    /** 複製 完整路徑 */
    public async copyPath() {
        let filePath = "";
        if (this.M.fileLoad.getIsBulkView()) {
            filePath = this.M.fileLoad.getDirPath();
            if (await WV_Directory.Exists(filePath) === false) { return; }
        } else {
            filePath = this.M.fileLoad.getFilePath();
            if (await WV_File.Exists(filePath) === false) { return; }
        }
        await WV_System.SetClipboard_Txt(filePath);
        if (this.M.fileLoad.getIsBulkView()) {
            Toast.show(this.M.i18n.t("msg.copyDirPath"), 1000 * 3); //已將「檔案路徑」複製至剪貼簿
        } else {
            Toast.show(this.M.i18n.t("msg.copyFilePath"), 1000 * 3); //已將「資料夾路徑」複製至剪貼簿
        }
    }

    /** 複製 影像 */
    public async copyImg() {

        let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
        let fileInfo2 = await WebAPI.getFileInfo2(filePath);
        if (fileInfo2.Type === "none") { return; } //如果檔案不存在
        let imgType = Lib.GetFileType(fileInfo2); //取得檔案類型
        let msg = this.M.i18n.t("msg.copyImage"); //已將「影像」複製至剪貼簿

        if (this.M.fileLoad.getGroupType() === GroupType.img) {
            if (imgType === "apng" || imgType === "webp" || imgType === "svg") { //只有瀏覽器支援的圖片格式
                let base64 = await this.M.fileShow.tiefseeview.getCanvasBase64(1, "medium"); //把圖片繪製到canvas上面，再取得base64
                await WV_System.SetClipboard_Base64ToImage(base64, true);
            } else if (imgType === "jpg") {
                await WV_System.SetClipboard_FileToImage(filePath, false); //直接用C#讀取圖片
            } else if (imgType === "png" || imgType === "gif" || imgType === "bmp") {
                await WV_System.SetClipboard_FileToImage(filePath, true);
            } else {
                let imgUrl = this.M.fileShow.tiefseeview.getUrl(); //取得圖片網址
                let base64: string = await Lib.sendGet("base64", imgUrl); //取得檔案的base64
                await WV_System.SetClipboard_Base64ToImage(base64, true);
            }
            Toast.show(msg, 1000 * 3);
        }

        if (this.M.fileLoad.getGroupType() === GroupType.unknown) {
            let imgUrl = this.M.fileShow.tiefseeview.getUrl(); //取得圖片網址
            let base64: string = await Lib.sendGet("base64", imgUrl); //取得檔案的base64
            await WV_System.SetClipboard_Base64ToImage(base64, true);
            Toast.show(msg, 1000 * 3);
        }

        if (this.M.fileLoad.getGroupType() === GroupType.video) {
            let base64 = await this.M.fileShow.tiefseeview.getCanvasBase64(1, "medium"); //把圖片繪製到canvas上面，在取得base64
            await WV_System.SetClipboard_Base64ToImage(base64, false);
            Toast.show(msg, 1000 * 3);
        }


    }

    /** 複製 base64  */
    public async copyImageBase64() {

        let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
        let fileInfo2 = await WebAPI.getFileInfo2(filePath);
        if (fileInfo2.Type === "none") { return; } //如果檔案不存在
        //let imgType = Lib.GetFileType(fileInfo2); //取得檔案類型

        if (this.M.fileLoad.getGroupType() === GroupType.img) {
            let imgUrl = this.M.fileShow.tiefseeview.getUrl(); //取得圖片網址
            let base64: string = await Lib.sendGet("base64", imgUrl); //取得檔案的base64
            await WV_System.SetClipboard_Txt(base64);
        }

        if (this.M.fileLoad.getGroupType() === GroupType.txt) {
            let base64: string = await Lib.sendGet("base64", filePath); //取得檔案的base64
            await WV_System.SetClipboard_Txt(base64);
        }

        if (this.M.fileLoad.getGroupType() === GroupType.video) {
            let base64 = await this.M.fileShow.tiefseeview.getCanvasBase64(1, "medium"); //把圖片繪製到canvas上面，再取得base64
            await WV_System.SetClipboard_Txt(base64);
        }
        Toast.show(this.M.i18n.t("msg.copyIamgeBase64"), 1000 * 3); //已將「影像base64」複製至剪貼簿

    }

    public async copyFileBase64() {
        let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }

        WV_System.SetClipboard_FileToBase64(filePath);
    }

    /** 複製 SVG 文字 */
    public async copyTxt() {
        let filePath = this.M.fileLoad.getFilePath(); //目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }
        await WV_System.SetClipboard_FileToTxt(filePath);
        Toast.show(this.M.i18n.t("msg.copyText"), 1000 * 3); //已將「文字」複製至剪貼簿

    }
}


class ScriptSetting {

    M: MainWindow;
    constructor(_M: MainWindow) {
        this.M = _M;
    }

    temp_setting: WebWindow | null = null; //用於判斷視窗是否已經開啟

    /** 開啟 設定 視窗 */
    public async showSetting() {

        //如果視窗已經存在，就不再新開
        if (this.temp_setting != null) {
            if (await this.temp_setting.Visible === true) {
                this.temp_setting.WindowState = 0; //視窗化
                return;
            }
        }

        //顯示loading畫面，避免短時間內重複開啟setting
        let domLoading = document.querySelector("#loadingSetting") as HTMLElement;
        if (domLoading.getAttribute("active") == "true") {
            return;
        } else {
            domLoading.setAttribute("active", "true");
            setTimeout(() => {
                domLoading.setAttribute("active", "");
            }, 1000);
        }

        await this.M.saveSetting(); //先儲存目前的設定值

        //新開視窗
        this.temp_setting = await baseWindow.newWindow("SettingWindow.html");
    }

}


class ScriptWindow {

    domLoading = document.querySelector("#loadingWindow") as HTMLElement;
    btnTopmost = document.querySelector("#menu-layout .js-topmost") as HTMLElement;
    btnMainToolbar = document.querySelector("#menu-layout .js-mainToolbar") as HTMLElement;
    btnMainDirList = document.querySelector("#menu-layout .js-mainDirList") as HTMLElement;
    btnMainFileList = document.querySelector("#menu-layout .js-mainFileList") as HTMLElement;
    btnMainExif = document.querySelector("#menu-layout .js-mainExif") as HTMLElement;
    btnFullScreen = document.querySelector("#menu-layout .js-fullScreen") as HTMLDivElement;

    isTopmost: boolean = false;

    M: MainWindow;
    constructor(_M: MainWindow) {
        this.M = _M;
    }


    /** 取得當前的語言 */
    public getLang() {
        //語言
        let lang = this.M.config.settings.other.lang;
        if (lang === "") { //如果未設定過語言
            lang = Lib.getBrowserLang(); //從瀏覽器取得使用者當前使用的語言
        }
        return lang;
    }

    /** 顯示或隱藏 loading */
    public enabledLoading(val: boolean) {
        if (val) {
            this.domLoading.style.display = "flex";
        } else {
            this.domLoading.style.display = "none";
        }
    }

    /** 啟用或關閉 全螢幕 */
    public enabledFullScreen(val?: boolean) {
        this.M.fullScreen.setEnabled(val);
    }

    /** 啟用或關閉 視窗固定最上層 */
    public enabledTopmost(val?: boolean) {
        if (val === undefined) { val = !this.isTopmost }
        this.isTopmost = val;
        baseWindow.topMost = val;
        this.M.mainMenu.setMenuLayoutCheckState(this.btnTopmost, val);
        WV_Window.TopMost = val;
    }

    /** 啟用或關閉 工具列 */
    public enabledMainToolbar(val?: boolean) {
        if (val === undefined) { val = !this.M.config.settings.layout.mainToolbarEnabled }
        this.M.mainMenu.setMenuLayoutCheckState(this.btnMainToolbar, val);
        this.M.mainToolbar.setEnabled(val);
    }

    /** 啟用或關閉 資料夾預覽視窗 */
    public enabledMainDirList(val?: boolean) {
        if (val === undefined) { val = !this.M.config.settings.layout.dirListEnabled }
        this.M.mainMenu.setMenuLayoutCheckState(this.btnMainDirList, val);
        this.M.mainDirList.setEnabled(val);
    }

    /** 啟用或關閉 檔案預覽視窗 */
    public enabledMainFileList(val?: boolean) {
        if (val === undefined) { val = !this.M.config.settings.layout.fileListEnabled }
        this.M.mainMenu.setMenuLayoutCheckState(this.btnMainFileList, val);
        this.M.mainFileList.setEnabled(val);
    }

    /** 啟用或關閉 詳細資料視窗 */
    public enabledMainExif(val?: boolean) {
        if (val === undefined) { val = !this.M.config.settings.layout.mainExifEnabled }
        this.M.mainMenu.setMenuLayoutCheckState(this.btnMainExif, val);
        this.M.mainExif.setEnabled(val);
    }
}


class ScriptBulkView {

    M: MainWindow;
    constructor(_M: MainWindow) {
        this.M = _M;
    }

    /** 進入 大量瀏覽模式 */
    public show() {
        if (this.M.fileLoad.getIsBulkView() === true) { return; }
        if (this.M.fileLoad.getGroupType() === GroupType.welcome) { return; }
        if (this.M.fileLoad.getGroupType() === GroupType.none) { return; }
        this.M.fileLoad.enableBulkView(true);
        this.M.fileLoad.showFile();
    }

    /** 結束 大量瀏覽模式 */
    public async close(_flag?: number | undefined) {
        if (this.M.fileLoad.getIsBulkView() === false) { return; }
        this.M.bulkView.saveCurrentState();
        this.M.fileLoad.enableBulkView(false);
        await this.M.fileLoad.showFile(_flag);
    }

    /** 下一頁 */
    public pageNext() {
        if (this.M.fileLoad.getIsBulkView() === false) { return; }
        this.M.bulkView.pageNext();
    }

    /** 上一頁 */
    public pagePrev() {
        if (this.M.fileLoad.getIsBulkView() === false) { return; }
        this.M.bulkView.pagePrev();
    }

    /** 設定 欄數 */
    public setColumns(val: number) {
        if (this.M.fileLoad.getIsBulkView() === false) { return; }
        this.M.bulkView.setColumns(val);
    }
}