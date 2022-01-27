
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

    /** 上一張 */
    public prev() {
        this.M.fileLoad.prev()
    }

    /** 下一張 */
    public next() {
        this.M.fileLoad.next()
    }

    /** 顯示 刪除檔案 的對話方塊 */
    public deleteMsg() {
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
    public DragDropFile() {
        setTimeout(() => {
            WV_File.DragDropFile(this.M.fileLoad.getFilePath())
        }, 50);
    }

    /** 顯示檔案原生右鍵選單 */
    public ShowContextMenu() {
        WV_File.ShowContextMenu(this.M.fileLoad.getFilePath(), true);
    }
}

class ScriptMenu {
    M: MainWindow;
    constructor(_M: MainWindow) {
        this.M = _M;
    }

    /** 顯示選單 開啟 */
    showOpen(btn: HTMLElement) {
        this.M.menu.open_Button(document.getElementById("menu-open"), btn, "menuActive");
    }

    /** 顯示選單 複製 */
    showCopy(btn: HTMLElement) {
        this.M.menu.open_Button(document.getElementById("menu-copy"), btn, "menuActive");
    }

    /** 顯示選單 旋轉與鏡像 */
    showRotate(btn: HTMLElement) {
        this.M.menu.open_Button(document.getElementById("menu-rotate"), btn, "menuActive");
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
        if (await WV_File.Exists(filePath) === false) { return; }

        WV_System.SetClipboard_FileToImg(filePath);
    }

    /** 複製 base64  */
    public async copyBase64() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }

        WV_System.SetClipboard_FileToBase64(filePath);
    }

    /** 複製 影像(含透明色) */
    public async copyPng() {
        let filePath = this.M.fileLoad.getFilePath();//目前顯示的檔案
        if (await WV_File.Exists(filePath) === false) { return; }

        WV_System.SetClipboard_FileToPng(filePath);
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
    public async OpenSetting() {

        //如果視窗已經存在，就不再新開
        if (this.temp_setting != null) {
            if (await this.temp_setting.Visible === true) {
                this.temp_setting.WindowState = 0;//視窗化
                return;
            }
        }

        //新開視窗
        this.temp_setting = await baseWindow.newWindow("SettingWindow.html");

        /*await this.temp_setting.SetSize(500 * window.devicePixelRatio, 450 * window.devicePixelRatio);//初始化視窗大小

        //設定坐標，從父視窗的中間開啟
        let w = await this.temp_setting.Width - baseWindow.width;
        let h = await this.temp_setting.Height - baseWindow.height;
        this.temp_setting.SetPosition(
            baseWindow.left - (w / 2),
            baseWindow.top - (h / 2)
        )*/

    }

}