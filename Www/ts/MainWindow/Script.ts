class Script {

    private M: MainWindow;
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
        this.M = M;
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

    public async run(s: string, option?: { x?: number, y?: number }) {

        if (option === undefined) { option = {} }

        // #region 圖片
        if (s === "imageFitWindowOrImageOriginal") { // 縮放至適合視窗 或 圖片原始大小
            this.img.fitWindowOrImageOriginal();
        }
        else if (s === "switchFitWindowAndOriginal") { // 縮放至適合視窗/圖片原始大小 切換
            this.img.switchFitWindowAndOriginal(option.x, option.y);
        }
        else if (s === "imageFitWindow") { // 強制縮放至適合視窗
            this.img.zoomToFit();
        }
        else if (s === "imageOriginal") { // 圖片原始大小
            this.img.zoomTo100(option.x, option.y);
        }
        else if (s === "imageZoomIn") { // 放大
            this.img.zoomIn(option.x, option.y);
        }
        else if (s === "imageZoomOut") { // 縮小
            this.img.zoomOut(option.x, option.y);
        }
        else if (s === "imageRotateCw") { // 順時針90°
            this.img.degForward(option.x, option.y);
        }
        else if (s === "imageRotateCcw") { // 逆時針90°
            this.img.degReverse(option.x, option.y);
        }
        else if (s === "imageFlipHorizontal") { // 水平鏡像
            this.img.mirrorHorizontal(option.x, option.y);
        }
        else if (s === "imageFlipVertical") { // 垂直鏡像
            this.img.mirrorVertica(option.x, option.y);
        }
        else if (s === "imageInitialRotation") { // 圖初始化旋轉
            this.img.transformRefresh();
        }

        else if (s === "imageMoveUp") { // 圖片向上移動
            this.img.move("up");
        }
        else if (s === "imageMoveDown") { // 圖片向下移動
            this.img.move("down");
        }
        else if (s === "imageMoveLeft") { // 圖片向左移動
            this.img.move("left");
        }
        else if (s === "imageMoveRight") { // 圖片向右移動
            this.img.move("right");
        }

        else if (s === "imageMoveUpOrPrevFile") { // 圖片向上移動 or 上一個檔案
            if (this.M.fileShow.tiefseeview.getIsOverflowY()) {
                this.img.move("up");
            } else {
                this.fileLoad.prevFile();
            }
        }
        else if (s === "imageMoveDownOrNextFile") { // 圖片向下移動 or 下一個檔案
            if (this.M.fileShow.tiefseeview.getIsOverflowY()) {
                this.img.move("down");
            } else {
                this.fileLoad.nextFile();
            }
        }
        else if (s === "imageMoveLeftOrPrevFile") { // 圖片向左移動 or 上一個檔案
            if (this.M.fileShow.tiefseeview.getIsOverflowX()) {
                this.img.move("left");
            } else {
                this.fileLoad.prevFile();
            }
        }
        else if (s === "imageMoveLeftOrNextFile") { // 圖片向左移動 or 下一個檔案
            if (this.M.fileShow.tiefseeview.getIsOverflowX()) {
                this.img.move("left");
            } else {
                this.fileLoad.nextFile();
            }
        }
        else if (s === "imageMoveRightOrPrevFile") { // 圖片向右移動 or 上一個檔案
            if (this.M.fileShow.tiefseeview.getIsOverflowX()) {
                this.img.move("right");
            } else {
                this.fileLoad.prevFile();
            }
        }
        else if (s === "imageMoveRightOrNextFile") { // 圖片向右移動 or 下一個檔案
            if (this.M.fileShow.tiefseeview.getIsOverflowX()) {
                this.img.move("right");
            } else {
                this.fileLoad.nextFile();
            }
        }
        // #endregion 

        // #region 檔案
        else if (s === "newWindow") { // 另開視窗
            await this.open.openNewWindow();
        }
        else if (s === "prevFile") { // 上一個檔案
            this.fileLoad.prevFile();
        }
        else if (s === "nextFile") { // 下一個檔案
            this.fileLoad.nextFile();
        }
        else if (s === "prevDir") { // 上一個資料夾
            this.fileLoad.prevDir();
        }
        else if (s === "nextDir") { // 下一個資料夾
            this.fileLoad.nextDir();
        }
        else if (s === "firstFile") { // 第一個檔案
            this.fileLoad.firstFile();
        }
        else if (s === "lastFile") { // 最後一個檔案
            this.fileLoad.lastFile();
        }
        else if (s === "firstDir") { // 第一個資料夾
            this.fileLoad.firstDir();
        }
        else if (s === "lastDir") { // 最後一個資料夾
            this.fileLoad.lastDir();
        }
        else if (s === "revealInFileExplorer") { // 在檔案總管中顯示
            this.open.revealInFileExplorer();
        }
        else if (s === "systemContextMenu") { // 系統選單
            this.open.systemContextMenu();
        }
        else if (s === "renameFile") { // 重新命名
            this.fileLoad.showRenameMsg();
        }
        else if (s === "openWith") { // 用其他程式開啟
            this.open.openWith();
        }
        else if (s === "fileToRecycleBin") { // 移至資源回收桶
            this.fileLoad.showDeleteMsg("moveToRecycle");
        }
        else if (s === "fileToPermanentlyDelete") { // 永久刪除
            this.fileLoad.showDeleteMsg("delete");
        }
        // #endregion

        // #region 複製
        else if (s === "copyFile") { // 複製檔案
            this.copy.copyFile();
        }
        else if (s === "copyFileName") { // 複製檔名
            this.copy.copyName();
        }
        else if (s === "copyFilePath") { // 複製檔案路徑
            this.copy.copyPath();
        }
        else if (s === "copyImage") { // 複製影像
            this.copy.copyImage();
        }
        else if (s === "copyImageBase64") { // 複製影像 Base64
            this.copy.copyImageBase64();
        }
        else if (s === "copyText") { // 複製文字
            this.copy.copyText();
        }
        // #endregion

        // #region layout
        else if (s === "maximizeWindow") { // 視窗最大化
            this.window.maximizeWindow();
        }
        else if (s === "topmost") { // 視窗固定最上層
            this.window.enabledTopmost();
        }
        else if (s === "fullScreen") { // 全螢幕
            this.window.enabledFullScreen();
        }
        else if (s === "showToolbar") { // 工具列
            this.window.enabledMainToolbar();
        }
        else if (s === "showFilePanel") { // 檔案預覽面板
            this.window.enabledMainFileList();
        }
        else if (s === "showDirectoryPanel") { // 資料夾預覽面板
            this.window.enabledMainDirList();
        }
        else if (s === "showInformationPanel") { // 詳細資料面板
            this.window.enabledMainExif();
        }
        // #endregion

        // #region 大量瀏覽模式
        else if (s === "bulkView") { // 開啟大量瀏覽模式
            this.M.script.bulkView.show();
        }
        else if (s === "prevPage") { // 上一頁
            this.M.bulkView.pagePrev();
        }
        else if (s === "nextPage") { // 下一頁
            this.M.bulkView.pageNext();
        }
        else if (s === "incrColumns") { // 增加「每行圖片數」
            this.M.bulkView.incrColumns();
        }
        else if (s === "decColumns") { // 減少「每行圖片數」
            this.M.bulkView.decColumns();
        }
        else if (s === "incrFixedWidth") { // 增加「鎖定寬度」
            this.M.bulkView.incrFixedWidth();
        }
        else if (s === "decFixedWidth") { // 減少「鎖定寬度」
            this.M.bulkView.decFixedWidth();
        }
        // #endregion 
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

    /** 縮放至適合視窗 */
    public zoomToFit() {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.zoomFull(TiefseeviewZoomType["fitWindow"]);
    }

    /** 縮放至圖片原始大小 */
    public zoomTo100(x?: number, y?: number) {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.zoomFull(TiefseeviewZoomType["imageOriginal"], undefined, x, y);
    }

    /** 縮放至適合視窗 或 圖片原始大小 */
    public fitWindowOrImageOriginal() {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.zoomFull(TiefseeviewZoomType["fitWindowOrImageOriginal"]);
    }

    /** 縮放至適合視窗/圖片原始大小 切換 */
    public switchFitWindowAndOriginal(x?: number, y?: number) {
        if (this.isImg() === false) { return; }
        if (Math.abs(this.M.fileShow.tiefseeview.getZoomRatio() - 1) < 0.05) { // 100%
            this.zoomToFit();
        } else { // 不是100%
            this.zoomTo100(x, y);
        }
    }

    /** 順時針90° */
    public degForward(x?: number, y?: number) {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.setDegForward(x, y);
    }

    /** 逆時針90° */
    public degReverse(x?: number, y?: number) {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.setDegReverse(x, y);
    }

    /** 水平鏡像 */
    public mirrorHorizontal(x?: number, y?: number) {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.setMirrorHorizontal(!this.M.fileShow.tiefseeview.getMirrorHorizontal(), x, y);
    }

    /** 垂直鏡像 */
    public mirrorVertica(x?: number, y?: number) {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.setMirrorVertica(!this.M.fileShow.tiefseeview.getMirrorVertica(), x, y)
    }

    /** 初始化旋轉 */
    public transformRefresh() {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.transformRefresh(true);
    }

    /** 放大 */
    public zoomIn(x?: number, y?: number) {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.zoomIn(x, y);
    }

    /** 縮小 */
    public zoomOut(x?: number, y?: number) {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.zoomOut(x, y);
    }

    /** 向特定方向移動圖片 */
    public move(type: "up" | "right" | "down" | "left", distance?: number) {
        if (this.isImg() === false) { return; }
        this.M.fileShow.tiefseeview.move(type, distance);
    }


    public async getImgData(fileInfo2: FileInfo2) {

        let fileTime = `LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
        let fileType = Lib.GetFileType(fileInfo2); // 取得檔案類型
        let configItem = this.M.config.getAllowFileTypeItem(GroupType.img, fileType); // ex. { ext:"psd", type:"magick" }
        if (configItem === null) {
            configItem = { ext: "", type: "vips", vipsType: "magick" }
        }
        let configType = configItem.type;

        let vipsType = configItem.vipsType as string;
        let arUrl: { scale: number, url: string }[] = [];
        let width = -1;
        let height = -1;
        let isAnimation = Lib.IsAnimation(fileInfo2); // 判斷是否為動圖
        let isFail = false; // true表示圖片載入失敗，回傳 icon

        if (isAnimation) {

            let imgInitInfo = await WebAPI.Img.webInit(fileInfo2);
            if (imgInitInfo.code == "1") {
                width = imgInitInfo.width;
                height = imgInitInfo.height;
                arUrl.push({ scale: 1, url: imgInitInfo.path });
            }

        } else if (configType === "vips") {

            let imgInitInfo = await WebAPI.Img.vipsInit(vipsType, fileInfo2);
            if (imgInitInfo.code == "1") {

                width = imgInitInfo.width;
                height = imgInitInfo.height;

                let ratio = Number(this.M.config.settings.image.tiefseeviewBigimgscaleRatio);
                if (isNaN(ratio)) { ratio = 0.8; }
                if (ratio > 0.95) { ratio = 0.95; }
                if (ratio < 0.5) { ratio = 0.5; }

                // 設定縮放的比例
                arUrl.push({ scale: 1, url: Lib.pathToURL(imgInitInfo.path) + `?${fileTime}` });
                for (let i = 1; i <= 30; i++) {
                    let scale = Number(Math.pow(ratio, i).toFixed(3));
                    if (imgInitInfo.width * scale < 200 || imgInitInfo.height * scale < 200) { // 如果圖片太小就不處理
                        break;
                    }
                    let imgU = WebAPI.Img.vipsResize(scale, fileInfo2, fileType);
                    arUrl.push({ scale: scale, url: imgU })
                }

            }

        } else { // 直接開啟網址

            let url = await WebAPI.Img.getUrl(configType, fileInfo2); // 取得圖片網址
            let imgInitInfo = await WebAPI.Img.webInit(url);
            if (imgInitInfo.code == "1") {
                width = imgInitInfo.width;
                height = imgInitInfo.height;
                arUrl.push({ scale: 1, url: imgInitInfo.path });
            }

        }

        if (width === -1) {
            isFail = true;

            let url = await WebAPI.Img.getUrl("icon", fileInfo2); // 取得圖片網址
            width = 256;
            height = 256;
            arUrl.push({ scale: 1, url: url });
        }

        return {
            fileType: fileType,
            isAnimation: isAnimation,
            width: width,
            height: height,
            configItem: configItem,
            arUrl: arUrl,
            isFail: isFail
        }
    }

    /**
     * 預載入圖片資源
     * @param _url 圖片網址
     * @returns true=載入完成、false=載入失敗
     */
    public async preloadImg(_url: string): Promise<boolean> {
        let img = document.createElement("img");
        let p = await new Promise((resolve, reject) => {
            img.addEventListener("load", (e) => {
                resolve(true);
            });
            img.addEventListener("error", (e) => {
                resolve(false);
            });
            img.src = _url;
        })

        img.src = "";
        // @ts-ignore
        img = null;
        return <boolean>p;
    }

    /**
     * url 轉 Canvas 。只能在網址已經載入完成的情況下使用
     * @param url 圖片網址
     * @returns HTMLCanvasElement
     */
    public urlToCanvas(url: string) {

        let domImg = document.createElement("img");
        domImg.src = url;

        let domCan = document.createElement("canvas");
        domCan.width = domImg.width;
        domCan.height = domImg.height;
        let context0 = domCan.getContext("2d");
        context0?.drawImage(domImg, 0, 0, domImg.width, domImg.height);

        return domCan;
    }

    /** 取得縮放後的Canvas*/
    public getCanvasZoom(img: HTMLCanvasElement | HTMLImageElement | ImageBitmap, zoom: number, quality: ("high" | "low" | "medium")) {

        let width = Math.floor(img.width * zoom);
        let height = Math.floor(img.height * zoom);

        let cs = document.createElement("canvas");
        cs.width = width;
        cs.height = height;
        let context0 = cs.getContext("2d") as CanvasRenderingContext2D;

        context0.imageSmoothingQuality = quality;
        context0.drawImage(img, 0, 0, width, height);
        return cs;
    }

    /**
     * 從Canvas取得Blob
     */
    public async getCanvasBlob(can: HTMLCanvasElement, zoom: number, quality: "high" | "low" | "medium", type = "png", q = 0.8) {

        // let can = await getCanvas();
        if (can === null) { return null; }

        if (zoom < 1) {
            can = this.getCanvasZoom(can, zoom, quality);
        }

        let blob: Blob | null = null;

        await new Promise((resolve, reject) => {
            if (can === null) { return null; }

            let outputType = "image/png";

            if (type === "webp") {
                outputType = "image/webp";
            }
            if (type === "jpg" || type === "jpeg") {
                outputType = "image/jpeg";

                // 背景色改成白色
                let cc = document.createElement("canvas");
                cc.width = can.width;
                cc.height = can.height;
                let context = cc.getContext("2d") as CanvasRenderingContext2D;
                context.fillStyle = "#FFFFFF"; // 填滿顏色
                context.fillRect(0, 0, can.width, can.height);
                context.drawImage(can, 0, 0, can.width, can.height);
                can = cc;
            }

            can.toBlob((b) => {
                blob = b;
                resolve(true);
            }, outputType, q);

        })

        return blob;
    }

    /**
     * blob to Base64
     */
    public async blobToBase64(blob: Blob): Promise<string | ArrayBuffer | null> {
        return new Promise((resolve, _) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }


}

class ScriptFileLoad {
    M: MainWindow;
    constructor(_M: MainWindow) {
        this.M = _M;
    }

    /** 第一個檔案 */
    public firstFile() {
        this.M.fileLoad.showFile(0);
    }

    /** 最後一個檔案 */
    public lastFile() {
        this.M.fileLoad.showFile(this.M.fileLoad.getWaitingFile().length - 1);
    }

    /** 上一張檔案 */
    public prevFile() {
        this.M.fileLoad.prevFile();
    }

    /** 下一張檔案 */
    public nextFile() {
        this.M.fileLoad.nextFile();
    }

    /** 上一個資料夾 */
    public prevDir() {
        this.M.fileLoad.prevDir();
    }

    /** 下一個資料夾 */
    public nextDir() {
        this.M.fileLoad.nextDir();
    }

    /** 第一個資料夾 */
    public firstDir() {
        this.M.fileLoad.showDir(0);
    }

    /** 最後一個資料夾 */
    public lastDir() {
        this.M.fileLoad.showDir(this.M.fileLoad.getWaitingDirKey().length - 1)
    }

    /** 顯示 刪除當前檔案或資料夾 的對話方塊 */
    public showDeleteMsg(type?: undefined | "delete" | "moveToRecycle") {
        if (this.M.fileLoad.getIsBulkView()) {
            this.showDeleteDirMsg(type);
        } else {
            this.showDeleteFileMsg(type);
        }
    }
    /** 顯示 刪除檔案 的對話方塊 */
    public showDeleteFileMsg(type?: undefined | "delete" | "moveToRecycle", path?: string) {
        this.M.fileLoad.showDeleteFileMsg(type, path);
    }
    /** 顯示 刪除資料夾 的對話方塊 */
    public showDeleteDirMsg(type?: undefined | "delete" | "moveToRecycle", path?: string) {
        this.M.fileLoad.showDeleteDirMsg(type, path);
    }

    /** 顯示 重新命名當前檔案或資料夾 的對話方塊 */
    public async showRenameMsg(path?: string) {
        if (path === undefined) {
            if (this.M.fileLoad.getIsBulkView()) {
                this.showRenameDirMsg(path);
            } else {
                this.showRenameFileMsg(path);
            }
        } else { // 如果有指定路徑，則根據路徑類型來處理
            if (await WV_Directory.Exists(path)) {
                this.showRenameDirMsg(path);
            }
            if (await WV_File.Exists(path)) {
                this.showRenameFileMsg(path);
            }
        }
    }
    /** 顯示 重新命名檔案 的對話方塊 */
    public showRenameFileMsg(path?: string) {
        this.M.fileLoad.showRenameFileMsg(path);
    }
    /** 顯示 重新命名資料夾 的對話方塊 */
    public showRenameDirMsg(path?: string) {
        this.M.fileLoad.showRenameDirMsg(path);
    }

    /** 重新載入 檔案+檔案預覽面板+資料夾預覽面板 */
    public async reloadAll() {
        this.M.msgbox.closeAll();
        this.M.menu.close();
        await this.M.fileLoad.loadFile(this.M.fileLoad.getFilePath());
        await this.reloadDirPanel();
    }

    /** 重新載入 檔案預覽面板 */
    public async reloadFilePanel() {
        await this.M.fileLoad.reloadFilePanel();
    }

    /** 重新載入 資料夾預覽面板 */
    public async reloadDirPanel() {
        await this.M.fileLoad.reloadDirPanel();
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
    public dragDropFile(path?: string) {
        setTimeout(async () => {
            if (path === undefined) {
                if (this.M.fileLoad.getIsBulkView()) {
                    path = this.M.fileLoad.getDirPath();
                } else {
                    path = this.M.fileLoad.getFilePath();
                }
            }
            if (path.length > 255) {
                path = await WV_Path.GetShortPath(path); // 把長路經轉回虛擬路徑，避免某些程式不支援長路經
            }
            WV_File.DragDropFile(path);
        }, 50);
    }

    /** 顯示檔案原生右鍵選單 */
    public async showContextMenu(path?: string) {
        if (path === undefined) {
            if (this.M.fileLoad.getIsBulkView()) {
                path = this.M.fileLoad.getDirPath();
            } else {
                path = this.M.fileLoad.getFilePath();
            }
        }
        WV_File.ShowContextMenu(path, true);
    }

    /** 儲存文字檔 */
    public async save(btn?: HTMLElement) {
        let t = await this.M.fileShow.iframes.getText();
        let path = this.M.fileLoad.getFilePath();
        this.M.msgbox.closeAll(); // 關閉所有訊息視窗
        if (t == null) {
            Toast.show(this.M.i18n.t("msg.saveFailed"), 1000 * 3); // 儲存失敗
            return;
        }
        try {
            await WV_File.SetText(path, t);
            Toast.show(this.M.i18n.t("msg.saveComplete"), 1000 * 3); // 儲存完成
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

    /** 顯示選單 檔案 */
    async showMenuFile(btn?: HTMLElement, path?: string, type?: "file" | "dir") {
        let domMenu = document.getElementById("menu-file") as HTMLElement;
        let domOpenFileBox = domMenu.querySelector(".js-openFileBox") as HTMLElement; // 載入檔案

        if (path !== undefined) { // 指定路徑
            domMenu.setAttribute("data-path", path);
            domOpenFileBox.style.display = "none"; // 隱藏「另開視窗」

            if (type === "dir") {
                domMenu.setAttribute("showType", GroupType.bulkView);
            } else {
                let fileExt = Lib.GetExtension(path).replace(".", "");
                let showType = this.M.fileLoad.fileExtToGroupType(fileExt);
                domMenu.setAttribute("showType", showType);
            }
            await this.M.mainMenu.updateOtherAppList(path);
        } else {
            domMenu.setAttribute("data-path", "");
            domMenu.setAttribute("showType", "");
            domOpenFileBox.style.display = "";
            await this.M.mainMenu.updateOtherAppList(this.M.fileLoad.getFilePath());
        }

        if (btn === undefined) {
            this.M.menu.openAtOrigin(domMenu, 0, 0);
        } else {
            this.M.menu.openAtButton(domMenu, btn, "menuActive");
        }

    }

    /** 顯示選單 開啟檔案 (用於 起始畫面) */
    async showMenuOpenFile(btn?: HTMLElement) {
        let domMenu = document.getElementById("menu-openfile") as HTMLElement;

        if (btn === undefined) {
            this.M.menu.openAtOrigin(domMenu, 0, 0);
        } else {
            this.M.menu.openAtButton(domMenu, btn, "menuActive");
        }
    }


    /** 顯示選單 複製 */
    showMenuCopy(btn?: HTMLElement, path?: string, type?: "file" | "dir") {
        let domMenu = document.getElementById("menu-copy") as HTMLElement;
        let domMenuCopyText = domMenu.querySelector(".js-copyText") as HTMLElement;

        let showType = "";
        let fileExt = "";
        if (path !== undefined) {

            domMenu.setAttribute("data-path", path);
            if (type === "dir") {
                domMenu.setAttribute("showType", GroupType.bulkView);
            } else {
                fileExt = Lib.GetExtension(path).replace(".", "");
                showType = this.M.fileLoad.fileExtToGroupType(fileExt);
                domMenu.setAttribute("showType", showType);
            }

        } else {
            fileExt = Lib.GetExtension(this.M.fileLoad.getFilePath()).replace(".", "");
            showType = this.M.fileLoad.fileExtToGroupType(fileExt);
            domMenu.setAttribute("showType", "");
            domMenu.setAttribute("data-path", "");
        }

        // 顯示或隱藏複製文字
        if (fileExt === "svg" || showType === GroupType.txt) {
            domMenuCopyText.style.display = "";
        } else {
            domMenuCopyText.style.display = "none";
        }

        if (btn === undefined) {
            this.M.menu.openAtOrigin(domMenu, 0, 0);
        } else {
            this.M.menu.openAtButton(domMenu, btn, "menuActive");
        }
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
    showMenuImageSearch(btn?: HTMLElement, path?: string) {
        let domMenu = document.getElementById("menu-imgSearch") as HTMLElement;
        if (path !== undefined) {
            domMenu.setAttribute("data-path", path);
        } else {
            domMenu.setAttribute("data-path", "");
        }

        if (btn === undefined) {
            this.M.menu.openAtOrigin(domMenu, 0, 0);
        } else {
            this.M.menu.openAtButton(domMenu, btn, "menuActive");
        }
    }

    /** 顯示選單 排序 */
    showMenuSort(btn?: HTMLElement, type?: ("file" | "dir" | undefined)) {

        let domMenu = document.querySelector("#menu-sort") as HTMLElement;
        let domMenuFilebox = domMenu.querySelector(".js-filebox") as HTMLElement;
        let domMenuDirbox = domMenu.querySelector(".js-dirbox") as HTMLElement;

        if (type === "file") {
            domMenuFilebox.style.display = "";
            domMenuDirbox.style.display = "none";
        } else if (type === "dir") {
            domMenuFilebox.style.display = "none";
            domMenuDirbox.style.display = "";
        } else {
            domMenuFilebox.style.display = "";
            domMenuDirbox.style.display = "";
        }

        if (btn === undefined) {
            this.M.menu.openAtOrigin(domMenu, 0, 0);
        } else {
            this.M.menu.openAtButton(domMenu, btn, "menuActive");
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
    showRightMenuImage(x?: number, y?: number) {
        let dom = document.getElementById("menu-rightMenuImage");
        if (x !== undefined && y !== undefined) {
            this.M.menu.openAtPoint(dom, x, y);
        } else {
            this.M.menu.openAtMouse(dom, 0, -85);
        }
        this.M.mainMenu.updateRightMenuImageZoomRatioTxt(); // 更新 右鍵選單的圖片縮放比例
    }
    /** 顯示右鍵選單 起始畫面 */
    showRightMenuWelcome(x?: number, y?: number) {
        let dom = document.getElementById("menu-rightMenuWelcome");
        if (x !== undefined && y !== undefined) {
            this.M.menu.openAtPoint(dom, x, y);
        } else {
            this.M.menu.openAtMouse(dom, 0, 0);
        }
    }
    /** 顯示右鍵選單 大量瀏覽模式 */
    showRightMenuBulkView(e: MouseEvent, x?: number, y?: number) {

        let dom = e.target as HTMLElement;
        let path = null;

        if (dom !== null) {
            while (true) { // 取得 bulkView-item 的 data-path
                if (dom.classList.contains("bulkView-item")) {
                    path = dom.getAttribute("data-path");
                    break;
                }
                if (dom === document.body) { break; }
                dom = dom.parentNode as HTMLElement; // 往往上層找
            }
        }

        let domMenu = document.querySelector("#menu-rightMenuBulkView") as HTMLElement;
        let domFileBox = document.querySelector("#menu-fileBox") as HTMLElement;
        let domFileName = domFileBox.querySelector(".js-fileName") as HTMLInputElement;
        if (path !== null) {
            domFileBox.style.display = "";
            domMenu.appendChild(domFileBox);
            domFileBox.setAttribute("data-path", path);
            domFileName.value = Lib.GetFileName(path); // 顯示檔名
        } else {
            domFileBox.style.display = "none"; // 隱藏檔案區塊
        }

        if (x !== undefined && y !== undefined) {
            this.M.menu.openAtPoint(domMenu, x, y);
        } else {
            this.M.menu.openAtMouse(domMenu, 0, 0);
        }
    }

    /** 顯示右鍵選單 檔案預覽面板 */
    showRightMenuFilePanel(e: MouseEvent) {

        let dom = e.target as HTMLElement;
        let path = null;

        while (true) { // 取得 bulkView-item 的 data-path
            if (dom.classList.contains("fileList-item")) {
                path = dom.getAttribute("data-path");
                break;
            }
            if (dom === document.body) { break; }
            dom = dom.parentNode as HTMLElement; // 往往上層找
        }

        let domMenu = document.querySelector("#menu-rightMenuFilePanel") as HTMLElement;
        let domFileBox = document.querySelector("#menu-fileBox") as HTMLElement;
        let domFileName = domFileBox.querySelector(".js-fileName") as HTMLInputElement;
        if (path !== null) {
            domFileBox.style.display = "";
            domMenu.appendChild(domFileBox);
            domFileBox.setAttribute("data-path", path);
            domFileName.value = Lib.GetFileName(path); // 顯示檔名
        } else {
            domFileBox.style.display = "none"; // 隱藏檔案區塊
        }
        this.M.menu.openAtMouse(domMenu, 0, 0);
    }

    /** 顯示右鍵選單 檔案 */
    showRightMenuFile(e: MouseEvent) {

        let dom = e.target as HTMLElement;
        let path = null;

        while (true) { // 取得 data-path
            let p = dom.getAttribute("data-path");
            if (p !== null) {
                path = p;
                break;
            }
            if (dom === document.body) { break; }
            dom = dom.parentNode as HTMLElement; // 往往上層找
        }

        let domMenu = document.querySelector("#menu-rightMenuFile") as HTMLElement;
        let domFileBox = document.querySelector("#menu-fileBox") as HTMLElement;
        let domFileName = domFileBox.querySelector(".js-fileName") as HTMLInputElement;
        if (path !== null) {
            domFileBox.style.display = "";
            domMenu.appendChild(domFileBox);
            domFileBox.setAttribute("data-path", path);
            domFileName.value = Lib.GetFileName(path); // 顯示檔名
        } else {
            domFileBox.style.display = "none"; // 隱藏檔案區塊
        }
        this.M.menu.openAtMouse(domMenu, 0, 0);
    }

    /** 顯示右鍵選單 資料夾預覽面板 */
    showRightMenuDirPanel(e: MouseEvent) {

        let dom = e.target as HTMLElement;
        let path = null;

        while (true) { // 取得 bulkView-item 的 data-path
            if (dom.classList.contains("dirList-item")) {
                path = dom.getAttribute("data-path");
                break;
            }
            if (dom === document.body) { break; }
            dom = dom.parentNode as HTMLElement; // 往往上層找
        }

        let domMenu = document.querySelector("#menu-rightMenuDirPanel") as HTMLElement;
        let domFileBox = document.querySelector("#menu-dirBox") as HTMLElement;
        let domFileName = domFileBox.querySelector(".js-fileName") as HTMLInputElement;
        if (path !== null) {
            domFileBox.style.display = "";
            domMenu.appendChild(domFileBox);
            domFileBox.setAttribute("data-path", path);
            domFileName.value = Lib.GetFileName(path); // 顯示檔名
        } else {
            domFileBox.style.display = "none"; // 隱藏檔案區塊
        }
        this.M.menu.openAtMouse(domMenu, 0, 0);
    }

    /** 顯示右鍵選單 預設 */
    showRightMenuDefault() {
        let dom = document.getElementById("menu-rightMenuDefault");
        this.M.menu.openAtMouse(dom, 0, -55);
    }

    /** 顯示右鍵選單 輸入框 */
    showRightMenuTextbox(x?: number, y?: number) {
        let domInput = document.activeElement;
        if (domInput === null) { return false; }
        let isReadonly = domInput.getAttribute("readonly") != null;
        var dom_cut = document.getElementById("menuitem-text-cut") as HTMLElement; // 剪下
        var dom_paste = document.getElementById("menuitem-text-paste") as HTMLElement; // 貼上
        if (isReadonly) {
            dom_cut.style.display = "none";
            dom_paste.style.display = "none";
        } else {
            dom_cut.style.display = "flex";
            dom_paste.style.display = "flex";
        }

        var dom = document.getElementById("menu-text");
        if (x !== undefined && y !== undefined) {
            this.M.menu.openAtPoint(dom, x, y);
        } else {
            this.M.menu.openAtMouse(dom, 0, 0);
        }
    }

    /** 顯示右鍵選單 一般文字 */
    showRightMenuTxt(x?: number, y?: number) {
        var dom = document.getElementById("menu-txt");
        if (x !== undefined && y !== undefined) {
            this.M.menu.openAtPoint(dom, x, y);
        } else {
            this.M.menu.openAtMouse(dom, 0, 0);
        }
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

    /** 載入剪貼簿內容 */
    public async openClipboard() {

        // if (M.fileLoad.getIsBulkView()) { return; }

        let clipboardContent = await WebAPI.getClipboardContent();

        if (clipboardContent.Type == "url") {
            let file = await this.M.downloadFileFromUrl(clipboardContent.Data);
            if (file != null) {
                let base64 = await Lib.readFileAsDataURL(file);
                let extension = await Lib.getExtensionFromBase64(base64); // 取得副檔名
                if (extension !== "") {
                    let path = await WV_File.Base64ToTempFile(base64, extension);
                    await this.M.fileLoad.loadFile(path); // 下載檔案後，重新載入圖片
                }
            }
        }

        else if (clipboardContent.Type == "file" || clipboardContent.Type == "dir") {
            await this.M.fileLoad.loadFile(clipboardContent.Data); // 重新載入圖片
        }

        else if (clipboardContent.Type == "img") {
            let base64 = clipboardContent.Data;
            let extension = await Lib.getExtensionFromBase64(base64); // 取得副檔名
            if (extension !== "") {
                let path = await WV_File.Base64ToTempFile(base64, extension);
                await this.M.fileLoad.loadFile(path); // 重新載入圖片
            }
        }

        else {
            Toast.show(this.M.i18n.t("msg.cannotOpenClipboard"), 1000 * 3); // 無法開啟剪貼簿的內容
        }
    }

    /** 另開視窗 */
    public async openNewWindow(path?: string) {
        if (path === undefined) {
            path = this.M.fileLoad.getFilePath(); // 目前顯示的檔案
        }
        let exePath = await WV_Window.GetAppPath();
        await this.M.saveSetting();
        WV_RunApp.ProcessStart(exePath, `"${path}"`, true, false);
    }

    /** 在檔案總管顯示 */
    public async revealInFileExplorer(path?: string) {
        if (path === undefined) {
            if (this.M.fileLoad.getIsBulkView()) {
                path = this.M.fileLoad.getDirPath();
                if (await WV_Directory.Exists(path) === false) { return; }
            } else {
                path = this.M.fileLoad.getFilePath();
                if (await WV_File.Exists(path) === false) { return; }
            }
        }
        // 把長路經轉回虛擬路徑
        if (path.length > 255) {
            path = await WV_Path.GetShortPath(path);
        }
        WV_File.ShowOnExplorer(path);
    }

    /** 顯示檔案右鍵選單 */
    public async systemContextMenu(path?: string) {
        if (path === undefined) {
            if (this.M.fileLoad.getIsBulkView()) {
                path = this.M.fileLoad.getDirPath();
                if (await WV_Directory.Exists(path) === false) { return; }
            } else {
                path = this.M.fileLoad.getFilePath();
                if (await WV_File.Exists(path) === false) { return; }
            }
        }
        // 把長路經轉回虛擬路徑
        if (path.length > 255) {
            path = await WV_Path.GetShortPath(path);
        }
        WV_File.ShowContextMenu(path, true);
    }

    /** 列印 */
    public async print(path?: string) {
        if (path === undefined) {
            path = await this.M.fileLoad.getFileShortPath(); // 目前顯示的檔案
        }
        // if (await WV_File.Exists(path) === false) { return; }
        WV_File.PrintFile(path);
    }

    /** 設成桌布 */
    public async setAsDesktop(path?: string) {
        if (path === undefined) {
            path = await this.M.fileLoad.getFileShortPath(); // 目前顯示的檔案
        }
        if (await WV_File.Exists(path) === false) { return; }
        WV_System.SetWallpaper(path);
    }

    /** 選擇其他應用程式*/
    public async openWith(path?: string) {
        if (path === undefined) {
            path = await this.M.fileLoad.getFileShortPath(); // 目前顯示的檔案
        }
        if (await WV_File.Exists(path) === false) { return; }
        WV_RunApp.ShowMenu(path);
    }

}


class ScriptCopy {

    M: MainWindow;
    constructor(_M: MainWindow) {
        this.M = _M;
    }

    /** 複製 檔案 */
    public async copyFile(path?: string) {
        if (path === undefined) {
            path = this.M.fileLoad.getFilePath(); // 目前顯示的檔案
        }
        if (await WV_File.Exists(path) === false) { return; }
        await WV_System.SetClipboard_File(path);
        Toast.show(this.M.i18n.t("msg.copyFile"), 1000 * 3); // 已將「檔案」複製至剪貼簿
    }

    /** 複製 檔名或資料夾名 */
    public async copyName(path?: string) {
        if (this.M.fileLoad.getIsBulkView()) {
            await this.copyDirName(path);
        } else {
            await this.copyFileName(path);
        }
    }
    /** 複製 檔名 */
    public async copyFileName(path?: string) {
        if (path === undefined) {
            path = this.M.fileLoad.getFilePath();
        }
        let name = Lib.GetFileName(path);
        await WV_System.SetClipboard_Text(name);
        Toast.show(this.M.i18n.t("msg.copyFileName"), 1000 * 3); // 已將「檔案名稱」複製至剪貼簿
    }
    /** 複製 資料夾名 */
    public async copyDirName(path?: string) {
        if (path === undefined) {
            path = this.M.fileLoad.getDirPath();
        }
        let name = Lib.GetFileName(path);
        await WV_System.SetClipboard_Text(name);
        Toast.show(this.M.i18n.t("msg.copyDirName"), 1000 * 3); // 已將「資料夾名稱」複製至剪貼簿
    }

    /** 複製 檔案路徑 或 資料夾路徑 */
    public async copyPath(path?: string) {
        if (this.M.fileLoad.getIsBulkView()) {
            await this.copyFilePath(path);
        } else {
            await this.copyDirPath(path);
        }
    }
    /** 複製 檔案路徑 */
    public async copyFilePath(path?: string) {
        if (path === undefined) {
            path = this.M.fileLoad.getFilePath();
        }
        await WV_System.SetClipboard_Text(path);
        Toast.show(this.M.i18n.t("msg.copyFilePath"), 1000 * 3); // 已將「檔案路徑」複製至剪貼簿
    }
    /** 複製 資料夾路徑 */
    public async copyDirPath(path?: string) {
        if (path === undefined) {
            path = this.M.fileLoad.getDirPath();
        }
        await WV_System.SetClipboard_Text(path);
        Toast.show(this.M.i18n.t("msg.copyDirPath"), 1000 * 3); // 已將「資料夾路徑」複製至剪貼簿
    }

    /** 複製 影像 */
    public async copyImage(path?: string) {
        if (path === undefined) {
            path = this.M.fileLoad.getFilePath(); // 目前顯示的檔案
        }

        let fileInfo2 = await WebAPI.getFileInfo2(path);
        if (fileInfo2.Type === "none") { return; } // 如果檔案不存在
        let imgType = Lib.GetFileType(fileInfo2); // 取得檔案類型

        if (this.M.fileLoad.getIsBulkView() === false
            && this.M.fileLoad.getFilePath() === path
            && this.M.fileLoad.getGroupType() === GroupType.video
        ) {
            let base64 = await this.M.fileShow.tiefseeview.getCanvasBase64(1, "medium"); // 把圖片繪製到canvas上面，在取得base64
            await WV_System.SetClipboard_Base64ToImage(base64, false);

        } else if (imgType === "jpg") {
            await WV_System.SetClipboard_FileToImage(path, false); // 直接用C#讀取圖片

        } else if (imgType === "png" || imgType === "gif" || imgType === "bmp") {
            await WV_System.SetClipboard_FileToImage(path, true);

        } else {
            let imgData = await this.M.script.img.getImgData(fileInfo2);
            let imtUrl = imgData.arUrl[0].url;
            let p = await this.M.script.img.preloadImg(imtUrl);
            if (p === false) {
                console.log(" 複製影像失敗。無法載入圖片");
                return null;
            }
            let canvas = await this.M.script.img.urlToCanvas(imtUrl);
            let blob = await this.M.script.img.getCanvasBlob(canvas, 1, "medium", "png");
            if (blob === null) { return; }
            let base64 = await this.M.script.img.blobToBase64(blob);
            if (typeof base64 !== "string") { return; }
            await WV_System.SetClipboard_Base64ToImage(base64, true);
        }

        let msg = this.M.i18n.t("msg.copyImage"); // 已將「影像」複製至剪貼簿
        Toast.show(msg, 1000 * 3);

        /*if (this.M.fileLoad.getGroupType() === GroupType.img) {
            if (imgType === "apng" || imgType === "webp" || imgType === "svg") { // 只有瀏覽器支援的圖片格式
                let base64 = await this.M.fileShow.tiefseeview.getCanvasBase64(1, "medium"); // 把圖片繪製到canvas上面，再取得base64
                await WV_System.SetClipboard_Base64ToImage(base64, true);
            } else if (imgType === "jpg") {
                await WV_System.SetClipboard_FileToImage(path, false); // 直接用C#讀取圖片
            } else if (imgType === "png" || imgType === "gif" || imgType === "bmp") {
                await WV_System.SetClipboard_FileToImage(path, true);
            } else {
                let imgUrl = this.M.fileShow.tiefseeview.getUrl(); // 取得圖片網址
                let base64: string = await Lib.sendGet("base64", imgUrl); // 取得檔案的base64
                await WV_System.SetClipboard_Base64ToImage(base64, true);
            }
            Toast.show(msg, 1000 * 3);
        }
        if (this.M.fileLoad.getGroupType() === GroupType.unknown) {
            let imgUrl = this.M.fileShow.tiefseeview.getUrl(); // 取得圖片網址
            let base64: string = await Lib.sendGet("base64", imgUrl); // 取得檔案的base64
            await WV_System.SetClipboard_Base64ToImage(base64, true);
            Toast.show(msg, 1000 * 3);
        }
        if (this.M.fileLoad.getGroupType() === GroupType.video) {
            let base64 = await this.M.fileShow.tiefseeview.getCanvasBase64(1, "medium"); // 把圖片繪製到canvas上面，在取得base64
            await WV_System.SetClipboard_Base64ToImage(base64, false);
            Toast.show(msg, 1000 * 3);
        }*/
    }

    /** 複製 影像 Base64  */
    public async copyImageBase64(path?: string) {
        if (path === undefined) {
            path = this.M.fileLoad.getFilePath(); // 目前顯示的檔案
        }
        let fileInfo2 = await WebAPI.getFileInfo2(path);
        if (fileInfo2.Type === "none") { return; } // 如果檔案不存在
        let imgType = Lib.GetFileType(fileInfo2); // 取得檔案類型

        if (this.M.fileLoad.getIsBulkView() === false
            && this.M.fileLoad.getFilePath() === path
            && this.M.fileLoad.getGroupType() === GroupType.video
        ) {

            let base64 = await this.M.fileShow.tiefseeview.getCanvasBase64(1, "medium"); // 把圖片繪製到canvas上面，再取得base64
            await WV_System.SetClipboard_Text(base64);

        } else if (imgType === "svg") {
            // await WV_System.SetClipboard_FileToImage(path, false); // 直接用C#讀取圖片
            let base64: string = await Lib.sendGet("base64", path); // 取得檔案的base64
            await WV_System.SetClipboard_Text(base64);

        } else {
            let imgData = await this.M.script.img.getImgData(fileInfo2);
            let imtUrl = imgData.arUrl[0].url;
            let p = await this.M.script.img.preloadImg(imtUrl);
            if (p === false) {
                console.log(" 複製影像Base64 失敗。無法載入圖片");
                return null;
            }
            let canvas = await this.M.script.img.urlToCanvas(imtUrl);
            let blob = await this.M.script.img.getCanvasBlob(canvas, 1, "medium", "png");
            if (blob === null) { return; }
            let base64 = await this.M.script.img.blobToBase64(blob);
            if (typeof base64 !== "string") { return; }
            await WV_System.SetClipboard_Text(base64);
        }

        Toast.show(this.M.i18n.t("msg.copyIamgeBase64"), 1000 * 3); // 已將「影像base64」複製至剪貼簿
    }

    /** 複製 Base64  */
    public async copyTextBase64(path?: string) {
        if (path === undefined) {
            path = this.M.fileLoad.getFilePath(); // 目前顯示的檔案
        }
        if (await WV_File.Exists(path) === false) { return; }

        let base64: string = await Lib.sendGet("base64", path); // 取得檔案的base64
        await WV_System.SetClipboard_Text(base64);

        // WV_System.SetClipboard_FileToBase64(path);

        Toast.show(this.M.i18n.t("msg.copyBase64"), 1000 * 3); // 已將「base64」複製至剪貼簿
    }

    /** 複製 文字 */
    public async copyText(path?: string) {
        if (path === undefined) {
            path = this.M.fileLoad.getFilePath(); // 目前顯示的檔案
        }
        if (await WV_File.Exists(path) === false) { return; }
        await WV_System.SetClipboard_FileToText(path);
        Toast.show(this.M.i18n.t("msg.copyText"), 1000 * 3); // 已將「文字」複製至剪貼簿

    }
}


class ScriptSetting {

    M: MainWindow;
    constructor(_M: MainWindow) {
        this.M = _M;
    }

    temp_setting: WebWindow | null = null; // 用於判斷視窗是否已經開啟

    /**
     * 開啟 設定 視窗
     * @param toPage 開啟指定的頁簽
     * @param toDom 捲動到特定的標題
     */
    public async showSetting(toPage = "", toDom = "") {

        // 如果視窗已經存在，就不再新開
        if (this.temp_setting != null) {
            if (await this.temp_setting.Visible === true) {
                this.temp_setting.WindowState = 0; // 視窗化
                return;
            }
        }

        // 顯示loading畫面，避免短時間內重複開啟setting
        let domLoading = document.querySelector("#loadingSetting") as HTMLElement;
        if (domLoading.getAttribute("active") == "true") {
            return;
        } else {
            domLoading.setAttribute("active", "true");
            setTimeout(() => {
                domLoading.setAttribute("active", "");
            }, 1000);
        }

        await this.M.saveSetting(); // 先儲存目前的設定值

        // 新開視窗
        this.temp_setting = await baseWindow.newWindow(`SettingWindow.html?toPage=${toPage}&toDom=${toDom}`);
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
        // 語言
        let lang = this.M.config.settings.other.lang;
        if (lang === "") { // 如果未設定過語言
            lang = Lib.getBrowserLang(); // 從瀏覽器取得使用者當前使用的語言
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

    /** 啟用或關閉 視窗最大化 */
    public maximizeWindow(val?: boolean) {
        if (val === undefined) {
            let WindowState = baseWindow.windowState;
            val = WindowState === "Maximized" && this.M.fullScreen.getEnabled() === false;
            val = !val;
        }
        if (val) {
            setTimeout(() => {
                baseWindow.maximized();
            }, 50);
        } else {
            baseWindow.normal();
        }
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

        // 剛關閉大量瀏覽模式時，檔案預覽面板尚未顯示無法進行初始化，所以等待一段時間後才執行捲動
        await Lib.sleep(10);
        this.M.mainFileList.setStartLocation(); // 檔案預覽視窗 捲動到選中項目的中間
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
