
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
    public showDeleteMsg() {
        this.M.fileLoad.deleteMsg()
    }

    /** 顯示 重新命名檔案 的對話方塊 */
    public renameMsg() {
        this.M.fileLoad.renameMsg()
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
        setTimeout(() => {
            WV_File.DragDropFile(this.M.fileLoad.getFilePath())
        }, 50);
    }

    /** 顯示檔案原生右鍵選單 */
    public async showContextMenu() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }
        WV_File.ShowContextMenu(filePath, true);
    }

    /** 儲存文字檔 */
    public async save(btn?: HTMLElement) {
        let t = await this.M.fileShow.iframes.getText();
        let path = this.M.fileLoad.getFilePath();
        this.M.msgbox.closeAll();//關閉所有訊息視窗
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
        this.M.menu.open_Button(document.getElementById("menu-file"), btn, "menuActive");
    }

    /** 顯示選單 複製 */
    showMenuCopy(btn: HTMLElement) {
        this.M.menu.open_Button(document.getElementById("menu-copy"), btn, "menuActive");
    }

    /** 顯示選單 Layout */
    showLayout(btn?: HTMLElement) {
        this.M.initMenu.menu_layout.show(btn);
    }

    /** 顯示選單 旋轉與鏡像 */
    showMenuRotation(btn?: HTMLElement) {
        if (btn === undefined) {
            this.M.menu.open_Origin(document.getElementById("menu-rotate"), 0, 0);
        } else {
            this.M.menu.open_Button(document.getElementById("menu-rotate"), btn, "menuActive");
        }
    }

    /** 顯示選單 搜圖 */
    showMenuImageSearch(btn?: HTMLElement) {
        if (btn === undefined) {
            this.M.menu.open_Origin(document.getElementById("menu-imgSearch"), 0, 0);
        } else {
            this.M.menu.open_Button(document.getElementById("menu-imgSearch"), btn, "menuActive");
        }
    }

    /** 顯示選單 排序 */
    showMenuSort(btn?: HTMLElement) {
        if (btn === undefined) {
            this.M.menu.open_Origin(document.getElementById("menu-sort"), 0, 0);
        } else {
            this.M.menu.open_Button(document.getElementById("menu-sort"), btn, "menuActive");
        }
    }

    /** 顯示右鍵選單 圖片 */
    showRightMenuImage() {
        var dom_rightClickImage = document.getElementById("menu-rightMenuImage");
        this.M.menu.open_RightClick(dom_rightClickImage, 0, -85);
        this.M.initMenu.updateRightMenuImageZoomRatioTxt();//更新 右鍵選單的圖片縮放比例
    }

    /** 顯示右鍵選單 輸入框 */
    showRightMenuText() {
        let domInput = document.activeElement;
        if (domInput === null) { return false; }
        let isReadonly = domInput.getAttribute("readonly") != null;
        var dom_cut = document.getElementById("menuitem-text-cut") as HTMLElement;//剪下
        var dom_paste = document.getElementById("menuitem-text-paste") as HTMLElement;//貼上
        if (isReadonly) {
            dom_cut.style.display = "none";
            dom_paste.style.display = "none";
        } else {
            dom_cut.style.display = "flex";
            dom_paste.style.display = "flex";
        }

        var dom = document.getElementById("menu-text");
        this.M.menu.open_RightClick(dom, 0, 0);
    }

    /** 顯示右鍵選單 一般文字 */
    showRightMenuTxt() {
        var dom = document.getElementById("menu-txt");
        this.M.menu.open_RightClick(dom, 0, 0);
    }
}


class ScriptOpen {
    M: MainWindow;
    constructor(_M: MainWindow) {
        this.M = _M;
    }

    /** 載入檔案 */
    public async openFile() {
        let arFile = await WV_File.OpenFileDialog(true, "All files (*.*)|*.*", "開啟檔案")
        if (arFile.length === 0) { return; }
        if (arFile.length === 1) {
            this.M.fileLoad.loadFile(arFile[0]);
        }
        if (arFile.length > 1) {
            this.M.fileLoad.loadFiles(arFile[0], arFile);
        }
    }

    /** 另開視窗 */
    public async openNewWindow() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        let exePath = await WV_Window.GetAppPath();

        if (await WV_File.Exists(filePath)) {
            WV_RunApp.ProcessStart(exePath, `"${filePath}"`, true, false);
        } else {
            WV_RunApp.ProcessStart(exePath, "", true, false);
        }
    }

    /** 在檔案總管顯示 */
    public async revealInFileExplorer() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }
        WV_File.ShowOnExplorer(filePath);
    }

    /** 顯示檔案右鍵選單 */
    public async systemContextMenu() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }
        WV_File.ShowContextMenu(filePath, true);
    }

    /** 列印 */
    public async print() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }
        WV_File.PrintFile(filePath);
    }

    /** 設成桌布 */
    public async setAsDesktop() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }
        WV_System.SetWallpaper(filePath);
    }

    /** 選擇其他應用程式*/
    public async openWith() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }
        WV_RunApp.ShowMenu(filePath);
    }

    /** 以3D小畫家開啟 */
    public async Open3DMSPaint() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }
        WV_RunApp.Open3DMSPaint(filePath);//開啟檔案
    }
}


class ScriptCopy {

    M: MainWindow;
    constructor(_M: MainWindow) {
        this.M = _M;
    }

    /** 複製 檔案 */
    public async copyFile() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }
        await WV_System.SetClipboard_File(filePath);
        Toast.show(this.M.i18n.t("msg.copyFile"), 1000 * 3); //已將「檔案」複製至剪貼簿
    }

    /** 複製 檔名 */
    public async copyName() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }
        let name = Lib.GetFileName(filePath)
        await WV_System.SetClipboard_Txt(name);
        Toast.show(this.M.i18n.t("msg.copyName"), 1000 * 3); //已將「檔名」複製至剪貼簿
    }

    /** 複製 完整路徑 */
    public async copyPath() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }
        await WV_System.SetClipboard_Txt(filePath);
        Toast.show(this.M.i18n.t("msg.copyPath"), 1000 * 3); //已將「路徑」複製至剪貼簿
    }

    /** 複製 影像 */
    public async copyImg() {

        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        let fileInfo2 = await WebAPI.getFileInfo2(filePath);
        if (fileInfo2.Type === "none") { return; } //如果檔案不存在
        let imgType = Lib.GetFileType(fileInfo2);//取得檔案類型
        let msg = this.M.i18n.t("msg.copyImage"); //已將「影像」複製至剪貼簿

        if (this.M.fileLoad.getGroupType() === GroupType.img) {
            if (imgType === "apng" || imgType === "webp" || imgType === "svg") {//只有瀏覽器支援的圖片格式
                let base64 = await this.M.fileShow.tiefseeview.getCanvasBase64(1, "medium");//把圖片繪製到canvas上面，再取得base64
                await WV_System.SetClipboard_Base64ToImage(base64, true);
            } else if (imgType === "jpg") {
                await WV_System.SetClipboard_FileToImage(filePath, false);//直接用C#讀取圖片
            } else if (imgType === "png" || imgType === "gif" || imgType === "bmp") {
                await WV_System.SetClipboard_FileToImage(filePath, true);
            } else {
                let imgUrl = this.M.fileShow.tiefseeview.getUrl();//取得圖片網址
                let base64: string = await fetchGet_base64(imgUrl);//取得檔案的base64
                await WV_System.SetClipboard_Base64ToImage(base64, true);
            }
            Toast.show(msg, 1000 * 3);
        }

        if (this.M.fileLoad.getGroupType() === GroupType.unknown) {
            let imgUrl = this.M.fileShow.tiefseeview.getUrl();//取得圖片網址
            let base64: string = await fetchGet_base64(imgUrl);//取得檔案的base64
            await WV_System.SetClipboard_Base64ToImage(base64, true);
            Toast.show(msg, 1000 * 3);
        }

        if (this.M.fileLoad.getGroupType() === GroupType.video) {
            let base64 = await this.M.fileShow.tiefseeview.getCanvasBase64(1, "medium");//把圖片繪製到canvas上面，在取得base64
            await WV_System.SetClipboard_Base64ToImage(base64, false);
            Toast.show(msg, 1000 * 3);
        }


    }

    /** 複製 base64  */
    public async copyImageBase64() {

        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        let fileInfo2 = await WebAPI.getFileInfo2(filePath);
        if (fileInfo2.Type === "none") { return; } //如果檔案不存在
        //let imgType = Lib.GetFileType(fileInfo2);//取得檔案類型

        if (this.M.fileLoad.getGroupType() === GroupType.img) {
            let imgUrl = this.M.fileShow.tiefseeview.getUrl();//取得圖片網址
            let base64: string = await fetchGet_base64(imgUrl);//取得檔案的base64
            await WV_System.SetClipboard_Txt(base64);
        }

        if (this.M.fileLoad.getGroupType() === GroupType.txt) {
            let base64: string = await fetchGet_base64(filePath);//取得檔案的base64
            await WV_System.SetClipboard_Txt(base64);
        }

        if (this.M.fileLoad.getGroupType() === GroupType.video) {
            let base64 = await this.M.fileShow.tiefseeview.getCanvasBase64(1, "medium");//把圖片繪製到canvas上面，再取得base64
            await WV_System.SetClipboard_Txt(base64);
        }
        Toast.show(this.M.i18n.t("msg.copyIamgeBase64"), 1000 * 3); //已將「影像base64」複製至剪貼簿

    }

    public async copyFileBase64() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }

        WV_System.SetClipboard_FileToBase64(filePath);
    }

    /** 複製 SVG 文字 */
    public async copyTxt() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
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

    temp_setting: WebWindow | null = null;//用於判斷視窗是否已經開啟

    /** 開啟 設定 視窗 */
    public async showSetting() {

        //如果視窗已經存在，就不再新開
        if (this.temp_setting != null) {
            if (await this.temp_setting.Visible === true) {
                this.temp_setting.WindowState = 0;//視窗化
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

        await this.M.saveSetting();//先儲存目前的設定值

        //新開視窗
        this.temp_setting = await baseWindow.newWindow("SettingWindow.html");
    }

}


class ScriptWindow {

    domLoading = document.querySelector("#loadingWindow") as HTMLElement;

    M: MainWindow;
    constructor(_M: MainWindow) {
        this.M = _M;
    }

    /** 顯示或隱藏 loading */
    public loadingShow(val: boolean) {
        if (val) {
            this.domLoading.style.display = "flex";
        } else {
            this.domLoading.style.display = "none";
        }
    }
}