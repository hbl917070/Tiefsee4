
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

    constructor(M: MainWindow) {

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
    M: MainWindow;
    constructor(_M: MainWindow) {
        this.M = _M;
    }

    /** 全滿 */
    public zoomFull() {
        this.M.fileShow.tieefseeview.zoomFull(TieefseeviewZoomType['full-wh']);
    }

    /** 原始大小 */
    public zoom100() {
        this.M.fileShow.tieefseeview.zoomFull(TieefseeviewZoomType['100%']);
    }

    /** 順時針90° */
    public degForward() {
        this.M.fileShow.tieefseeview.setDegForward(undefined, undefined);
    }

    /** 逆時針90° */
    public degReverse() {
        this.M.fileShow.tieefseeview.setDegReverse(undefined, undefined);
    }

    /** 水平鏡像 */
    public mirrorHorizontal() {
        this.M.fileShow.tieefseeview.setMirrorHorizontal(!this.M.fileShow.tieefseeview.getMirrorHorizontal());
    }

    /** 垂直鏡像 */
    public mirrorVertica() {
        this.M.fileShow.tieefseeview.setMirrorVertica(!this.M.fileShow.tieefseeview.getMirrorVertica())
    }

    /** 初始化旋轉 */
    public transformRefresh() {
        this.M.fileShow.tieefseeview.transformRefresh(true);
    }

    /** 放大 */
    public zoomIn() {
        this.M.fileShow.tieefseeview.zoomIn();
    }

    /** 縮小 */
    public zoomOut() {
        this.M.fileShow.tieefseeview.zoomOut();
    }

    /** 向特定方向移動圖片 */
    public move(type: "up" | "right" | "down" | "left", distance?: number) {
        this.M.fileShow.tieefseeview.move(type, distance);
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
    public showContextMenu() {
        WV_File.ShowContextMenu(this.M.fileLoad.getFilePath(), true);
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
    showOpen(btn: HTMLElement) {
        this.M.menu.open_Button(document.getElementById("menu-open"), btn, "menuActive");
    }

    /** 顯示選單 複製 */
    showCopy(btn: HTMLElement) {
        this.M.menu.open_Button(document.getElementById("menu-copy"), btn, "menuActive");
    }

    /** 顯示選單 Layout */
    showLayout(btn?: HTMLElement) {
        this.M.initMenu.menu_layout.show(btn);
    }

    /** 顯示選單 旋轉與鏡像 */
    showRotate(btn?: HTMLElement) {
        if (btn === undefined) {
            this.M.menu.open_Origin(document.getElementById("menu-rotate"), 0, 0);
        } else {
            this.M.menu.open_Button(document.getElementById("menu-rotate"), btn, "menuActive");
        }
    }

    /** 顯示選單 排序 */
    showSort(btn?: HTMLElement) {
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
    public async newWindow() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        let exePath = await WV_Window.GetAppPath();

        if (await WV_File.Exists(filePath)) {
            WV_RunApp.ProcessStart(exePath, `"${filePath}"`, true, false);
        } else {
            WV_RunApp.ProcessStart(exePath, "", true, false);
        }
    }

    /** 開啟檔案位置 */
    public async showOnExplorer() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }
        WV_File.ShowOnExplorer(filePath);
    }

    /** 顯示檔案右鍵選單 */
    public async ShowContextMenu() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }
        WV_File.ShowContextMenu(filePath, true);
    }

    /** 列印 */
    public async PrintFile() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }
        WV_File.PrintFile(filePath);
    }

    /** 設成桌布 */
    public async SetWallpaper() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }
        WV_System.SetWallpaper(filePath);
    }

    /** 選擇其他應用程式*/
    public async RunApp() {
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

        WV_System.SetClipboard_File(filePath);
    }

    /** 複製 檔名 */
    public async copyName() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }

        let name = Lib.GetFileName(filePath)
        WV_System.SetClipboard_Txt(name);
    }

    /** 複製 完整路徑 */
    public async copyPath() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }

        WV_System.SetClipboard_Txt(filePath);
    }

    /** 複製 影像 */
    public async copyImg() {

        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        let fileInfo2 = await Lib.GetFileInfo2(filePath);
        if (fileInfo2.Type === "none") { return; } //如果檔案不存在
        let imgType = Lib.GetFileType(fileInfo2);//取得檔案類型

        if (this.M.fileLoad.getGroupType() === GroupType.img) {
            if (imgType === "apng" || imgType === "webp" || imgType === "svg") {//只有瀏覽器支援的圖片格式
                let base64 = await this.M.fileShow.tieefseeview.getCanvasBase64();//把圖片繪製到canvas上面，再取得base64
                WV_System.SetClipboard_Base64ToImage(base64, true);
            } else if (imgType === "jpg") {
                WV_System.SetClipboard_FileToImage(filePath, false);//直接用C#讀取圖片
            } else if (imgType === "png" || imgType === "gif" || imgType === "bmp") {
                WV_System.SetClipboard_FileToImage(filePath, true);
            } else {
                let imgUrl = this.M.fileShow.tieefseeview.getUrl();//取得圖片網址
                let base64: string = await fetchGet_base64(imgUrl);//取得檔案的base64
                WV_System.SetClipboard_Base64ToImage(base64, true);
            }
        }

        if (this.M.fileLoad.getGroupType() === GroupType.video) {
            let base64 = await this.M.fileShow.tieefseeview.getCanvasBase64();//把圖片繪製到canvas上面，再取得base64
            WV_System.SetClipboard_Base64ToImage(base64, false);
        }

    }

    /** 複製 base64  */
    public async copyImageBase64() {

        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        let fileInfo2 = await Lib.GetFileInfo2(filePath);
        if (fileInfo2.Type === "none") { return; } //如果檔案不存在
        //let imgType = Lib.GetFileType(fileInfo2);//取得檔案類型

        if (this.M.fileLoad.getGroupType() === GroupType.img) {
            let imgUrl = this.M.fileShow.tieefseeview.getUrl();//取得圖片網址
            let base64: string = await fetchGet_base64(imgUrl);//取得檔案的base64
            WV_System.SetClipboard_Txt(base64);
        }

        if (this.M.fileLoad.getGroupType() === GroupType.txt) {
            let base64: string = await fetchGet_base64(filePath);//取得檔案的base64
            WV_System.SetClipboard_Txt(base64);
        }

        if (this.M.fileLoad.getGroupType() === GroupType.video) {
            let base64 = await this.M.fileShow.tieefseeview.getCanvasBase64();//把圖片繪製到canvas上面，再取得base64
            WV_System.SetClipboard_Txt(base64);
        }

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

        WV_System.SetClipboard_FileToTxt(filePath);
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

        await this.M.saveSetting();//先儲存目前的設定值

        //新開視窗
        this.temp_setting = await baseWindow.newWindow("SettingWindow.html");
    }

}