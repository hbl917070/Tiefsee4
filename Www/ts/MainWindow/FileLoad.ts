import { GroupType } from "../Config";
import { Lib } from "../Lib";
import { Throttle } from "../Throttle";
import { Toast } from "../Toast";
import { WebAPI } from "../WebAPI";
import { MainWindow } from "./MainWindow";

/**
 * 載入檔案
 */
export class FileLoad {

    public getWaitingFile: () => string[];
    public setWaitingFile: (ar: string[]) => void;
    public getFlagFile: () => number;
    public setFlagFile: (n: number) => void;

    public showDir;
    public prevDir;
    public nextDir;
    public getWaitingDir;
    public setWaitingDir;
    public getFlagDir;
    public setFlagDir;
    public getWaitingDirKey;
    public updateFlagDir;
    public getDirPath;
    public reloadDirPanel;

    public loadDropFile;
    public loadFile;
    public loadFiles;
    public reloadFilePanel;

    public nextFile;
    public prevFile;
    public showFile;
    public getFilePath;
    public getFileShortPath;
    public getGroupType;
    public setGroupType;
    public getFileLoadType;
    public showDeleteFileMsg;
    public showDeleteDirMsg;
    public showRenameFileMsg;
    public showRenameDirMsg;
    public updateTitle;

    public enableBulkView;
    public getIsBulkView;
    public setIsBulkViewSub;

    public fileExtToGroupType;

    public stopFileWatcher;

    constructor(M: MainWindow) {

        /** unknown=未知 img=圖片  pdf=pdf、ai  video=影片  imgs=多幀圖片  txt=文字 */
        var _groupType: string = "img";
        /** 資料夾或自訂名單 */
        var _fileLoadType: FileLoadType;
        /** 檔案列表(待載入檔案名單) */
        var _arFile: string[] = [];
        /** 目前在檔案列表的編號 */
        var _flagFile: number;
        /** loadFile是否正在處理中 */
        var _isLoadFileFinish = true;
        /** 當前是否為 大量瀏覽模式 */
        var _isBulkView = false;
        /** 當前是否為 大量瀏覽模式子視窗 */
        var _isBulkViewSub = false;
        /** 如果使用者關閉「重新載入檔案的對話方塊」，則同一個檔案不再次詢問*/
        var _tempReloadFilePath = "";

        /** 目前的資料夾路徑 */
        var _dirPathNow: string = "";
        var _arDir: { [key: string]: string[] } = {};
        var _arDirKey: string[] = [];
        /** 目前在資料夾列表的編號 */
        var _flagDir: number;

        /** 用於判斷是否需要重新讀取資料夾列表 */
        var _atLoadingDirParent = "";
        /** 載入檔案時，記錄GroupType群組類型 */
        var _atLoadingGroupType = "";
        /** 載入檔案時，記錄檔案副檔名，用於判斷要關聯哪些類型的資料夾 */
        var _atLoadingExt: string | undefined = "";

        this.getWaitingFile = () => { return _arFile; };
        this.setWaitingFile = (ar: string[]) => { _arFile = ar; };
        this.getFlagFile = () => { return _flagFile; };
        this.setFlagFile = (n: number) => { _flagFile = n; };

        this.showDir = showDir;
        this.prevDir = prevDir;
        this.nextDir = nextDir;
        this.getWaitingDir = () => { return _arDir; };
        this.setWaitingDir = (ar: { [key: string]: string[] }) => {
            _arDir = ar;
            _arDirKey = Object.keys(_arDir);
        };
        this.getWaitingDirKey = () => { return _arDirKey; };
        this.getFlagDir = () => { return _flagDir; };
        this.setFlagDir = (n: number) => { _flagDir = n };
        this.updateFlagDir = updateFlagDir;
        this.getDirPath = getDirPath;
        this.reloadDirPanel = reloadDirPanel;

        this.loadDropFile = loadDropFile;
        this.loadFile = loadFile;
        this.loadFiles = loadFiles;
        this.reloadFilePanel = reloadFilePanel;
        this.nextFile = nextFile;
        this.prevFile = prevFile;
        this.showFile = showFile;
        this.getFilePath = getFilePath;
        this.getFileShortPath = getFileShortPath;
        this.getGroupType = getGroupType;
        this.setGroupType = setGroupType;
        this.getFileLoadType = getFileLoadType;
        this.showDeleteFileMsg = showDeleteFileMsg;
        this.showDeleteDirMsg = showDeleteDirMsg;
        this.showRenameFileMsg = showRenameFileMsg;
        this.showRenameDirMsg = showRenameDirMsg;
        this.updateTitle = updateTitle;
        this.enableBulkView = enableBulkView;
        this.getIsBulkView = function () { return _isBulkView; };
        /** 設定當前是否為大量瀏覽模式子視窗 */
        this.setIsBulkViewSub = function (val: boolean) { _isBulkViewSub = val; };

        this.fileExtToGroupType = fileExtToGroupType;

        this.stopFileWatcher = stopFileWatcher;

        //#region Dir

        /**
         * 重新載入 資料夾預覽面板
         */
        function reloadDirPanel() {
            _atLoadingDirParent = "";
            loadDir(getDirPath()); // 處理資料夾預覽視窗
        }

        /**
         * 取得當前資料夾
         */
        function getDirPath() {
            return _dirPathNow;
        }

        /**
         * 重新計算 flagDir
         */
        async function updateFlagDir(dirPath: string) {

            if (dirPath === undefined) { return; }

            _flagDir = 0;
            for (let i = 0; i < _arDirKey.length; i++) {
                const path = _arDirKey[i];
                if (path === dirPath) {
                    _flagDir = i;
                    return;
                }
            }

            if (_arDirKey.length === 0) { return; }

            // 如果找不到資料夾，就重新讀取名單
            await initDirList(_dirPathNow); // 取得資料夾名單
            await M.dirSort.sort();
            M.mainDirList.init();

            for (let i = 0; i < _arDirKey.length; i++) {
                const path = _arDirKey[i];
                if (path === dirPath) {
                    _flagDir = i;
                    return;
                }
            }
        }

        /**
         * 判斷是否需要重新讀取資料夾名單
         * @param dirPath 
         * @returns 
         */
        async function isUpdateDirList(dirPath: string) {
            let dirParent = Lib.getDirectoryName(dirPath);
            if (dirParent === null) { dirParent = dirPath }
            dirParent = dirParent + _atLoadingGroupType;

            if (_atLoadingDirParent === dirParent) { return false; }
            _atLoadingDirParent = dirParent;

            return true;
        }

        /**
         * 資料夾預覽視窗初始化 (重新讀取列表
         */
        async function initDirList(dirPath: string) {

            const arExt: string[] = [];
            // let ar = M.config.allowFileType(GroupType.img);
            const ar = M.config.allowFileType(_atLoadingGroupType);

            for (let i = 0; i < ar.length; i++) {
                arExt.push(ar[i]["ext"]);
            }

            // 如果載入的檔案副檔名是未知類型，則把相同副檔名的檔案也納入關聯
            if (_atLoadingExt !== undefined && _atLoadingExt !== "") {
                const ext = _atLoadingExt.replace(".", "");
                if (arExt.indexOf(ext) === -1) {
                    arExt.push(ext);
                }
            }

            const maxCount = M.config.settings.advanced.dirListMaxCount;
            const json = await WebAPI.Directory.getSiblingDir(_dirPathNow, arExt, maxCount);

            if (_dirPathNow !== dirPath) { return; }

            _arDir = json;
            _arDirKey = Object.keys(_arDir);
        }

        /**
         * 清空 檔案預覽視窗
         */
        function clearDir() {
            _arDir = {};
            _arDirKey = Object.keys(_arDir);
            M.mainDirList.init();
        }

        const _showDirThrottle = new Throttle(5); // 節流
        /**
         * 
         * @param flag 
         * @returns 
         */
        async function showDir(flag?: number, flagFile: number = 0) {

            if (_groupType === GroupType.none || _groupType === GroupType.welcome) {
                return;
            }

            if (flag !== undefined) { _flagDir = flag; }
            if (_flagDir < 0) { _flagDir = 0; }
            if (_flagDir >= _arDirKey.length) { _flagDir = _arDirKey.length - 1; }

            if (_arDirKey.length === 0) { // 如果已經沒有沒有資料夾
                // M.fileShow.openWelcome();
                // _show = async () => { }
                _showDirThrottle.run = undefined;
                return;
            }

            let path = _arDirKey[_flagDir];

            if (await WV_Directory.Exists(path) === false) { // 如果資料夾不存在
                delete _arDir[path]; // 刪除此筆
                _arDirKey = Object.keys(_arDir);

                showDir(flag);
                // _showDir = async () => { };
                // updateFlagDir(dirPath);
                M.mainDirList.init(); // 資料夾預覽視窗 初始化
                // M.mainDirList.select();
                // M.mainDirList.updateLocation();
                return;
            }

            // 更新 UI
            await updateFlagDir(path); // 重新計算 flagDir
            M.mainDirList.select();
            M.mainDirList.updateLocation();

            _showDirThrottle.run = async () => {
                await loadFile(path, _atLoadingGroupType, false, flagFile);
            };
        }

        /**
         * 載入下一個資料夾
         */
        async function nextDir(type?: string) {

            _flagDir += 1;

            if (_flagDir >= _arDirKey.length) {

                if (type === undefined) {
                    type = M.config.settings.other.reachLastDir;
                }

                // 不做任何事情
                if (type === "none") {
                    _flagDir = _arDirKey.length - 1;
                }
                // 回到第一個資料夾
                else if (type === "firstDir") {
                    _flagDir = 0;
                    showDir();
                }
                // 不做任何事情，並顯示提示
                else if (type === "noneWithPrompt") {
                    Toast.show(M.i18n.t("msg.reachLastDir"), 1000 * 3); // 已經是最後一個資料夾
                    _flagDir = _arDirKey.length - 1;
                }
                // 回到第一個資料夾，並顯示提示
                else if (type === "firstDirWithPrompt") {
                    Toast.show(M.i18n.t("msg.firstDir"), 1000 * 3); // 載入第一個資料夾
                    _flagDir = 0;
                    showDir();
                }
            } else {
                showDir();
            }
        }

        /**
         * 載入上一個資料夾
         */
        async function prevDir(type?: string) {

            _flagDir -= 1;

            if (_flagDir < 0) {

                if (type === undefined) {
                    type = M.config.settings.other.reachLastDir;
                }

                // 不做任何事情
                if (type === "none" || type === "lastFile") {
                    _flagDir = 0;
                }
                // 前往最後一個資料夾
                else if (type === "firstDir") {
                    _flagDir = _arDirKey.length - 1;
                    showDir();
                }
                // 不做任何事情，並顯示提示
                else if (type === "noneWithPrompt") {
                    Toast.show(M.i18n.t("msg.reachFirstDir"), 1000 * 3); // 已經是第一個資料夾
                    _flagDir = 0;
                }
                // 前往最後一個資料夾，並顯示提示
                else if (type === "firstDirWithPrompt") {
                    Toast.show(M.i18n.t("msg.lastDir"), 1000 * 3); // 載入最後一個資料夾
                    _flagDir = _arDirKey.length - 1;
                    showDir();
                }
            } else {
                if (type === "lastFile") {
                    showDir(undefined, Number.MAX_VALUE);
                } else {
                    showDir();
                }
            }
        }

        /**
         * 處理資料夾預覽視窗
         * @param dirPath 
         */
        async function loadDir(dirPath: string) {

            _dirPathNow = dirPath;

            if (await isUpdateDirList(dirPath)) { // 載入不同資料夾，需要重新讀取

                await initDirList(dirPath); // 取得資料夾名單

                let dirParentPath = Lib.getDirectoryName(dirPath); // 使用 父親資料夾 當做key來取得排序
                if (dirParentPath === null) {
                    dirParentPath = dirPath;
                }

                await WV_System.NewFileWatcher("dirList", dirParentPath); // 偵測資料夾變化

                M.dirSort.readSortType(dirParentPath); // 取得該資料夾設定的檔案排序方式
                M.dirSort.updateMenu(); // 更新menu選單
                await M.dirSort.sort(dirPath);

                await updateFlagDir(dirPath); // 重新計算 flagDir
                M.mainDirList.init();
                M.mainDirList.setStartLocation(); // 資料夾預覽視窗 捲動到選中項目的中間

            } else { // 直接從 資料夾預覽視窗 切換，不需要重新讀取
                await updateFlagDir(dirPath); // 重新計算 flagDir
                M.mainDirList.select();
                M.mainDirList.updateLocation();
            }

        }

        //#endregion ---------------------

        /**
         * 用於拖曳開啟檔案
         * @param files 檔名陣列
         */
        async function loadDropFile(files: string[]) {

            M.msgbox.closeAll(); // 關閉所有訊息視窗
            M.menu.close();
            M.textEditor.close();

            if (files.length > 1) {
                await loadFiles(files);
            } else {
                await loadFile(files[0]);
            }
        }

        /**
         * 載入檔案陣列
         * @param dirPath 
         * @param arName 
         */
        async function loadFiles(ar: string[] = []) {

            await WV_System.NewFileWatcher("fileList", ""); // 取消偵測檔案變化

            _arFile = ar;
            let dirPath = Lib.getDirectoryName(_arFile[0]);
            if (dirPath === null) { return }

            _fileLoadType = FileLoadType.userDefined; // 名單類型，自訂義

            let path = _arFile[0]; // 以拖曳進來的第一個檔案為開啟對象

            let fileInfo2 = await WebAPI.getFileInfo2(path);
            _atLoadingGroupType = fileToGroupType(fileInfo2);
            _atLoadingExt = Lib.getExtension(path);

            M.fileSort.readSortType(dirPath); // 取得該資料夾設定的檔案排序方式
            M.fileSort.updateMenu(); // 更新menu選單
            _arFile = await M.fileSort.sort(_arFile);

            // 目前檔案位置
            _flagFile = _arFile.indexOf(path);

            M.mainFileList.setHide(false); // 顯示檔案預覽視窗(必須顯示出物件才能計算高度)
            M.mainFileList.init(); // 檔案預覽視窗 初始化
            M.mainFileList.setStartLocation(); // 檔案預覽視窗 捲動到選中項目的中間
            await showFile(); // 載入圖片

            loadDir(dirPath); // 處理資料夾預覽視窗
        }

        /**
         * 載入單一檔案
         * @param path 
         * @param dirGroupType 
         * @param noLoad true 表示不重新載入圖片，單純更新列表
         * @param flagFile 載入資料夾內的第幾個檔案(僅在載入資料夾時使用)
         */
        async function loadFile(path: string, dirGroupType?: string, noLoad = false, flagFile: number = 0) {

            if (_isLoadFileFinish === false) {
                console.log("loadFile處理中");
                return;
            }
            _isLoadFileFinish = false;

            _fileLoadType = FileLoadType.dir; // 名單類型，資料夾內的檔案

            const fileInfo2 = await WebAPI.getFileInfo2(path);
            path = fileInfo2.Path; // 避免長路經被轉成虛擬路徑

            //let dirPath = "";
            _arFile = [];

            let isFile = true;

            if (fileInfo2.Type === "dir") { // 如果是資料夾

                isFile = false;

                _dirPathNow = path;
                _arFile = await WebAPI.Directory.getFiles(path, "*.*"); // 取得資料夾內所有檔案

                await WV_System.NewFileWatcher("fileList", _dirPathNow); // 偵測檔案變化

                M.fileSort.readSortType(path); // 取得該資料夾設定的檔案排序方式
                M.fileSort.updateMenu(); // 更新menu選單
                _arFile = await M.fileSort.sort(_arFile);

                if (dirGroupType === undefined) {
                    _groupType = GroupType.img;
                    _atLoadingExt = undefined;
                } else {
                    _groupType = dirGroupType;
                }
                _atLoadingGroupType = _groupType;

                const filteredFiles = await filter(_atLoadingExt);

                // 如果資料夾內沒有圖片，就直接當成「自訂名單」，然後載入所有檔案
                if (filteredFiles.length !== 0) {
                    _arFile = filteredFiles;
                } else {
                    filterOfficeTemp(_arFile);
                    _fileLoadType = FileLoadType.userDefined;
                }

                // 目前檔案位置
                _flagFile = flagFile;
                if (_flagFile >= _arFile.length) {
                    _flagFile = _arFile.length - 1;
                }

            } else if (fileInfo2.Type === "file") { // 如果是檔案

                let dirPath = Lib.getDirectoryName(path); // 取得檔案所在的資料夾路徑
                if (dirPath === null) {
                    _isLoadFileFinish = true;
                    return;
                }
                _dirPathNow = dirPath;
                _groupType = fileToGroupType(fileInfo2);
                _atLoadingGroupType = _groupType;
                _atLoadingExt = Lib.getExtension(path);

                await WV_System.NewFileWatcher("fileList", _dirPathNow); // 偵測檔案變化

                _arFile = [path];
                _flagFile = 0;
                //M.mainFileList.init(); // 檔案預覽視窗 初始化 
                if (_isBulkView === false && noLoad === false) { // 在讀取完資料夾名單前，先顯示圖片
                    await showFileUpdataImg(fileInfo2);
                    M.mainExif.init(fileInfo2, true); // 初始化exif
                }
                _arFile = await WebAPI.Directory.getFiles(_dirPathNow, "*.*");
                _arFile = await filter(Lib.getExtension(path));
                if (_arFile.indexOf(path) === -1) {
                    _arFile.splice(0, 0, path);
                }

                M.fileSort.readSortType(_dirPathNow); // 取得該資料夾設定的檔案排序方式
                M.fileSort.updateMenu(); // 更新menu選單
                _arFile = await M.fileSort.sort(_arFile);

                _flagFile = _arFile.indexOf(path);

            } else { // 不存在

                M.fileShow.openWelcome();
                _isLoadFileFinish = true;
                return;
            }

            _isLoadFileFinish = true;
            M.mainFileList.setHide(false); // 顯示檔案預覽視窗(必須顯示出物件才能計算高度)
            M.mainFileList.init(); // 檔案預覽視窗 初始化
            M.mainFileList.setStartLocation(); // 檔案預覽視窗 捲動到選中項目的中間
            // await showFile(); // 載入圖片

            if (noLoad === false) {
                if (_isBulkView) {
                    await showFile(); // 載入圖片
                } else if (isFile) {
                    await showFileUpdataUI(); // 載入圖片(僅更新檔案列表)
                } else {
                    await showFile(); // 載入圖片
                }

                loadDir(_dirPathNow); // 處理資料夾預覽視窗
            }
        }

        /**
         * 取得目前檔案的路徑
         */
        function getFilePath() {
            let p = _arFile[_flagFile];
            return p;
        }

        /** 
         * 重新載入檔案預覽面板
         */
        function reloadFilePanel() {
            if (_fileLoadType === FileLoadType.dir) {
                loadFile(getFilePath(), _atLoadingExt, true);
            } else {
                M.mainFileList.init(); // 檔案預覽視窗 初始化
                M.mainFileList.setStartLocation(); // 檔案預覽視窗 捲動到選中項目的中間
            }
        }

        /**
         * 取得目前檔案的路徑 (如果是長路經，則自動轉成虛擬路徑)
         */
        async function getFileShortPath(path?: string) {
            if (path === undefined) {
                path = getFilePath();
            }
            // 把長路經轉回虛擬路徑
            if (path.length > 255) {
                path = await WV_Path.GetShortPath(path);
            }
            return path;
        }

        /**
         * 取得名單類型
         */
        function getFileLoadType() {
            return _fileLoadType;
        }

        /**
         * 
         */
        function getGroupType() {
            return _groupType;
        }
        /**
         * 
         */
        function setGroupType(type: string) {
            _groupType = type;
        }

        /**
         * 設定大量瀏覽模式是否啟用 (重新載入檔案才會生效)
         */
        function enableBulkView(val: boolean) {
            _isBulkView = val;
        }

        var _showFileThrottle = new Throttle(5); // 節流
        /**
         * 載入圖片
         * @param flag 
         */
        async function showFile(flag?: number) {

            if (_isBulkView === false && _isBulkViewSub === false) {
                M.toolbarBack.visible(false); // 隱藏返回按鈕
            }
            _isBulkViewSub = false;

            if (_isLoadFileFinish === false) {
                console.log("loadFile處理中");
                return;
            }
            if (_arFile.length === 0) { // 如果資料夾裡面沒有圖片
                Toast.show(M.i18n.t("msg.imageNotFound"), 1000 * 3); // 未檢測到圖片     
                M.fileShow.openWelcome();
                _showFileThrottle.run = async () => {
                    _atLoadingDirParent = "";
                    _arDir = {};
                    _arDirKey = [];
                }
                return;
            }

            if (flag !== undefined || flag === -1) { _flagFile = flag; }
            if (_flagFile < 0) { _flagFile = 0; }
            if (_flagFile >= _arFile.length) { _flagFile = _arFile.length - 1; }

            let path = getFilePath();
            let fileInfo2 = await WebAPI.getFileInfo2(path);
            if (fileInfo2.Type !== "none") {
                M.mainExif.init(fileInfo2); // 初始化exif
                await showFileUpdataUI();
            }
            await showFileUpdataImg(fileInfo2);
        }
        /** 更新 檔案預覽視窗 */
        async function showFileUpdataUI() {
            updateTitle(); // 更新視窗標題
            M.mainFileList.select(); // 設定檔案預覽視窗 目前選中的項目
            M.mainFileList.updateLocation(); // 檔案預覽視窗 自動捲動到選中項目的地方
        }
        /** 更新 圖片 */
        async function showFileUpdataImg(fileInfo2: FileInfo2) {

            if (fileInfo2.Type === "none") { // 如果檔案不存在
                _arFile.splice(_flagFile, 1); // 刪除此筆
                M.mainFileList.init(); // 檔案預覽視窗 初始化
                showFile(_flagFile);
                _showFileThrottle.run = undefined;
                return;
            }

            updateTitle(); // 更新視窗標題

            if (_fileLoadType === FileLoadType.userDefined) { // 如果是自訂名單
                _groupType = fileToGroupType(fileInfo2); // 從檔案類型判斷，要使用什麼用什麼類型來顯示
            }

            _showFileThrottle.run = async () => {

                if (_isBulkView) {
                    await M.fileShow.openBulkView();

                } else {

                    // 把長路經轉回虛擬路徑，避免瀏覽器無法載入圖片
                    if (fileInfo2.Path.length > 255) {
                        fileInfo2.Path = await WV_Path.GetShortPath(fileInfo2.Path);
                    }

                    if (_groupType === GroupType.img || _groupType === GroupType.unknown) {
                        await M.fileShow.openImage(fileInfo2);
                    }
                    if (_groupType === GroupType.video) {
                        await M.fileShow.openVideo(fileInfo2);
                    }
                    if (_groupType === GroupType.pdf) {
                        await M.fileShow.openPdf(fileInfo2);
                    }
                    if (_groupType === GroupType.txt) {
                        await M.fileShow.openTxt(fileInfo2);
                    }
                    /*if (path !== getFilePath()) {
                        console.error(`${path}  ${getFilePath()}`);
                    }*/
                }

            }
        }

        /**
         * 載入下一個檔案
         */
        async function nextFile() {
            if (_isLoadFileFinish === false) {
                console.log("loadFile處理中");
                return;
            }
            if (_groupType === GroupType.none || _groupType === GroupType.welcome) {
                return;
            }

            _flagFile += 1;

            if (_flagFile >= _arFile.length) {
                const reachLastFile = M.config.settings.other.reachLastFile;
                // 不做任何事情
                if (reachLastFile === "none") {
                    _flagFile = _arFile.length - 1;
                }
                // 回到第一個檔案
                else if (reachLastFile === "firstFile") {
                    _flagFile = 0;
                    showFile();
                }
                // 前往下一個資料夾
                else if (reachLastFile === "nextDir") {
                    if (_flagDir >= _arDirKey.length - 1) {
                        Toast.show(M.i18n.t("msg.reachLastDir"), 1000 * 3); // 已經是最後一個資料夾
                        _flagFile = _arFile.length - 1;
                    } else {
                        nextDir("none");
                    }
                }
                // 不做任何事情，並顯示提示
                else if (reachLastFile === "noneWithPrompt") {
                    Toast.show(M.i18n.t("msg.reachLastFile"), 1000 * 3); // 已經是最後一個檔案
                    _flagFile = _arFile.length - 1;
                }
                // 回到第一個檔案，並顯示提示
                else if (reachLastFile === "firstFileWithPrompt") {
                    Toast.show(M.i18n.t("msg.firstFile"), 1000 * 3); // 載入第一個檔案
                    _flagFile = 0;
                    showFile();
                }
                // 前往下一個資料夾，並顯示提示
                else if (reachLastFile === "nextDirWithPrompt") {
                    if (_flagDir >= _arDirKey.length - 1) {
                        Toast.show(M.i18n.t("msg.reachLastDir"), 1000 * 3); // 已經是最後一個資料夾
                        _flagFile = _arFile.length - 1;
                    } else {
                        Toast.show(M.i18n.t("msg.nextDir"), 1000 * 3); // 載入下一個資料夾
                        nextDir("none");
                    }
                }
            } else {
                showFile();
            }
        }

        /**
         * 載入上一個檔案
         */
        async function prevFile() {
            if (_isLoadFileFinish === false) {
                console.log("loadFile處理中");
                return;
            }
            if (_groupType === GroupType.none || _groupType === GroupType.welcome) {
                return;
            }

            _flagFile -= 1;

            if (_flagFile < 0) {
                const reachLastFile = M.config.settings.other.reachLastFile;
                // 不做任何事情
                if (reachLastFile === "none") {
                    _flagFile = 0;
                }
                // 回到最後一個檔案
                else if (reachLastFile === "firstFile") {
                    _flagFile = _arFile.length - 1;
                    showFile();
                }
                // 前往上一個資料夾的最後一個檔案
                else if (reachLastFile === "nextDir") {
                    if (_flagDir === 0) {
                        // 已經是第一個資料夾
                        Toast.show(M.i18n.t("msg.reachFirstDir"), 1000 * 3);
                        _flagFile = 0;
                    } else {
                        prevDir("lastFile");
                    }
                }
                // 不做任何事情，並顯示提示
                else if (reachLastFile === "noneWithPrompt") {
                    Toast.show(M.i18n.t("msg.reachFirstFile"), 1000 * 3); // 已經是第一個檔案
                    _flagFile = 0;
                }
                // 回到最後一個檔案，並顯示提示
                else if (reachLastFile === "firstFileWithPrompt") {
                    Toast.show(M.i18n.t("msg.lastFile"), 1000 * 3); // 載入最後一個檔案
                    _flagFile = _arFile.length - 1;
                    showFile();
                }
                // 前往上一個資料夾的最後一個檔案，並顯示提示
                else if (reachLastFile === "nextDirWithPrompt") {
                    if (_flagDir === 0) {
                        Toast.show(M.i18n.t("msg.reachFirstDir"), 1000 * 3); // 已經是第一個資料夾
                        _flagFile = 0;
                    } else {
                        Toast.show(M.i18n.t("msg.prevDir"), 1000 * 3); // 載入上一個資料夾
                        prevDir("lastFile");
                    }
                }
            } else {
                showFile();
            }
        }

        /**
          * 更新視窗標題
          */
        function updateTitle() {
            if (_isBulkView) {
                const filePath = getFilePath();
                if (filePath === undefined) { return; }
                let dirPath = Lib.getDirectoryName(filePath) ?? "";
                let fileName = Lib.getFileName(dirPath);
                baseWindow.setTitle(fileName, dirPath);
            } else {
                const filePath = getFilePath();
                if (filePath === undefined) { return; }
                const text = `「${_flagFile + 1}/${_arFile.length}」 ${Lib.getFileName(filePath)}`;
                baseWindow.setTitle(text, filePath);
            }
        }

        /**
         * 從檔案類型判斷，要使用什麼用什麼類型來顯示
         * @returns GroupType
         */
        function fileToGroupType(fileInfo2: FileInfo2) {
            let fileExt = Lib.getFileType(fileInfo2)
            return fileExtToGroupType(fileExt);
        }
        /**
         * 從副檔名判斷，要使用什麼用什麼類型來顯示
         * @returns GroupType
         */
        function fileExtToGroupType(fileExt: string) {

            for (let type in GroupType) {
                const allowFileType = M.config.allowFileType(type);
                for (let j = 0; j < allowFileType.length; j++) {
                    const fileType = allowFileType[j];
                    if (fileExt == fileType["ext"]) {
                        return type;
                    }
                }
            }

            return GroupType.unknown;
        }

        /**
         * 篩選檔案
         * @returns 
         */
        async function filter(extraExt?: string) {
            const ar = [];
            for (let i = 0; i < _arFile.length; i++) {
                const path = _arFile[i];
                const fileExt = Lib.getExtension(path).toLocaleLowerCase();
                const allowFileType = M.config.allowFileType(_groupType);
                for (let j = 0; j < allowFileType.length; j++) {
                    const fileType = allowFileType[j];
                    if (fileExt == "." + fileType["ext"]) {
                        ar.push(path);
                        break;
                    }
                }
            }

            // 如果是「office文件臨時檔」，就從名單內排除
            if (_groupType === GroupType.pdf) {
                filterOfficeTemp(ar);
            }

            // 如果載入的是未知類型的副檔名，則把其他相同副檔名的檔案也載入
            if (ar.length === 0) {
                if (extraExt !== undefined) {
                    const fileExt = extraExt.toLocaleLowerCase();
                    for (let i = 0; i < _arFile.length; i++) {
                        const path = _arFile[i];
                        if (fileExt == Lib.getExtension(path).toLocaleLowerCase()) {
                            ar.push(path);
                        }
                    }
                }
            }

            return ar;
        }

        /**
         * 過濾「office文件臨時檔」
         */
        function filterOfficeTemp(ar: any[]) {
            const arOfficeExt = [".doc", ".docx", ".ppt", ".pptx"];
            for (let i = ar.length - 1; i >= 0; i--) {
                const path = ar[i];
                const fileExt = Lib.getExtension(path).toLocaleLowerCase();
                const fileName = Lib.getFileName(path);
                if (arOfficeExt.indexOf(fileExt) !== -1) {
                    if (fileName.substring(0, 2) === "~$") {
                        ar.splice(i, 1);
                    }
                }
            }
        }


        //#region 對話方塊

        /**
          * 顯示 重新載入檔案 的對話方塊
          */
        function showReloadFileMsg(changeType: "delete" | "reload", fileType: "file" | "dir") {

            if (M.msgbox.isShow()) { return; }

            const path = getFilePath();

            // 如果使用者關閉詢問視窗，則同一個檔案不再次詢問
            if (path === _tempReloadFilePath) { return; }

            M.msgbox.show({
                txt: M.i18n.t("msg.reloadFile"), // 檔案已被修改，你要重新載入此檔案嗎？
                funcYes: async (dom: HTMLElement, inputTxt: string) => {
                    M.msgbox.close(dom);

                    if (fileType === "file") {
                        showFile(); // 重新載入檔案
                    } else {
                        showDir(); // 重新載入資料夾
                    }
                },
                funcClose: async (dom: HTMLElement) => {
                    M.msgbox.close(dom);
                    _tempReloadFilePath = path;
                }
            });

        }

        /**
         * 顯示 刪除檔案 的對話方塊
         */
        async function showDeleteFileMsg(type?: undefined | "delete" | "moveToRecycle", path?: string) {

            if (_groupType === GroupType.none || _groupType === GroupType.welcome) {
                return;
            }

            let newType;
            if (type === "delete") {
                newType = "2";
            } else {
                newType = "1";
            }
            if (path === undefined) {
                path = getFilePath();
            }

            // 執行刪除
            async function runDelete(value: string) {
                if (path === undefined) { return; }

                let err = "";
                if (value == "1") {
                    err = await WV_File.MoveToRecycle(path);
                }
                if (value == "2") {
                    err = await WV_File.Delete(path);
                }

                if (err !== "") {
                    M.msgbox.show({ txt: M.i18n.t("msg.fileDeletionFailed") + "<br>" + err }); // 檔案刪除失敗
                } else {

                    if (path === getFilePath() && _isBulkView === false) {
                        let index = _arFile.indexOf(path); // 從名單移除這筆資料
                        if (index !== -1) {
                            _arFile.splice(index, 1); // 刪除此筆
                            M.mainFileList.init(); // 檔案預覽視窗 初始化
                            await showFile(index);
                        }
                    }

                    // 如果是自定義名單，就主動觸發檔案變更的事件
                    if (_fileLoadType === FileLoadType.userDefined) {
                        const fwd: FileWatcherData = {
                            Key: "fileList",
                            FullPath: path,
                            OldFullPath: "",
                            ChangeType: "deleted",
                            FileType: "file"
                        };
                        baseWindow.onFileWatcher([fwd]);
                    }

                    if (value == "1") {
                        Toast.show(M.i18n.t("msg.fileToRecycleBinCompleted"), 1000 * 3); // 已將檔案「移至資源回收桶」
                    } else {
                        Toast.show(M.i18n.t("msg.fileToPermanentlyDeleteCompleted"), 1000 * 3); // 已將檔案「永久刪除」
                    }
                }
            }

            // 刪除前顯示詢問視窗
            if (M.config.settings.other.fileDeletingShowCheckMsg) {
                M.msgbox.show({
                    type: "radio",
                    txt: `
                        <div class="msgbox-title">${M.i18n.t("msg.deleteFile")}</div>
                        <div style="word-break:break-all;">${Lib.getFileName(path)}</div>
                    `, // 刪除檔案
                    arRadio: [
                        { value: "1", name: M.i18n.t("msg.fileToRecycleBin") }, // 移至資源回收桶
                        { value: "2", name: M.i18n.t("msg.fileToPermanentlyDelete") }, // 永久刪除檔案
                    ],
                    radioValue: newType,
                    funcYes: async (dom: HTMLElement, value: string) => {
                        M.msgbox.close(dom);
                        await runDelete(value);
                    }
                });
            }
            // 不顯示詢問視窗直接執行
            else {
                await runDelete(newType);
            }

        }

        /**
         * 顯示 刪除資料夾 的對話方塊
         */
        async function showDeleteDirMsg(type?: undefined | "delete" | "moveToRecycle", path?: string) {

            if (_groupType === GroupType.none || _groupType === GroupType.welcome) {
                return;
            }

            let newType;
            if (type === "delete") {
                newType = "2";
            } else {
                newType = "1";
            }

            if (path === undefined) {
                path = getDirPath();
            }

            // 執行刪除
            async function runDelete(value: string) {
                if (path === undefined) { return; }

                let err = "";
                if (value == "1") {
                    err = await WV_Directory.MoveToRecycle(path);
                }
                if (value == "2") {
                    err = await WV_Directory.Delete(path);
                }

                if (err !== "") {
                    M.msgbox.show({ txt: M.i18n.t("msg.fileDeletionFailed") + "<br>" + err }); // 檔案刪除失敗
                } else {
                    if (path === getDirPath()) {
                        await showDir();
                    } else {
                        delete _arDir[path]; // 刪除此筆
                        _arDirKey = Object.keys(_arDir);

                        // showDir();
                        // _showDir = async () => { };
                        // updateFlagDir(dirPath);
                        M.mainDirList.init(); // 資料夾預覽視窗 初始化
                        // M.mainDirList.select();
                        // M.mainDirList.updateLocation();
                    }


                    if (value == "1") {
                        Toast.show(M.i18n.t("msg.fileToRecycleBinCompleted"), 1000 * 3); // 已將檔案「移至資源回收桶」
                    } else {
                        Toast.show(M.i18n.t("msg.fileToPermanentlyDeleteCompleted"), 1000 * 3); // 已將檔案「永久刪除」
                    }
                    // M.mainFileList.init(); // 檔案預覽視窗 初始化
                    // M.mainFileList.select(); // 設定 檔案預覽視窗 目前選中的項目
                    // M.mainFileList.updateLocation(); // 檔案預覽視窗 自動捲動到選中項目的地方  
                }
            }

            if (M.config.settings.other.fileDeletingShowCheckMsg) {
                M.msgbox.show({
                    type: "radio",
                    txt: `
                        <div class="msgbox-title">${M.i18n.t("msg.deleteDir")}</div>
                        <div style="word-break:break-all;">${Lib.getFileName(path)}</div>
                    `, // 刪除資料夾
                    arRadio: [
                        { value: "1", name: M.i18n.t("msg.fileToRecycleBin") }, // 移至資源回收桶
                        { value: "2", name: M.i18n.t("msg.fileToPermanentlyDelete") }, // 永久刪除檔案
                    ],
                    radioValue: newType,
                    funcYes: async (dom: HTMLElement, value: string) => {
                        M.msgbox.close(dom);
                        await runDelete(value);
                    }
                });

            } else {

                await runDelete(newType);

            }

        }

        /**
         * 顯示 重新命名檔案 的對話方塊
         */
        async function showRenameFileMsg(path?: string) {

            if (_groupType === GroupType.none || _groupType === GroupType.welcome) {
                return;
            }

            if (path === undefined) {
                path = getFilePath();
            }
            let fileName = Lib.getFileName(path);

            let msg = M.msgbox.show({
                txt: `<div class="msgbox-title">${M.i18n.t("msg.renameFile")}</div>`, // 重新命名檔案
                type: "text",
                inputTxt: fileName,
                funcYes: async (dom: HTMLElement, inputTxt: string) => {
                    if (path === undefined) { return; }

                    if (inputTxt.trim() === "") {
                        M.msgbox.show({ txt: M.i18n.t("msg.nameIsEmpty") }); // 必須輸入檔名
                        return;
                    }
                    if (inputTxt.search(/[\\]|[/]|[:]|[*]|[?]|["]|[<]|[>]|[|]/) !== -1) {
                        M.msgbox.show({ txt: M.i18n.t("msg.nameContainsUnavailableChar") + "<br>" + "\\ / : * ? \" < > |" }); //檔案名稱不可以包含下列任意字元
                        return;
                    }
                    if (fileName === inputTxt) {
                        M.msgbox.close(dom);
                        return;
                    }
                    const dirPath = Lib.getDirectoryName(path);
                    if (dirPath === null) {
                        M.msgbox.show({ txt: M.i18n.t("msg.renamingFailure") + M.i18n.t("msg.wrongPath") }); // 重新命名失敗：路徑異常
                        return;
                    }

                    const newName = Lib.combine([dirPath, inputTxt]);
                    const err = await WV_File.Move(path, newName);
                    if (err != "") {
                        M.msgbox.show({ txt: M.i18n.t("msg.renamingFailure") + "<br>" + err }); // 重新命名失敗：
                        return;
                    }

                    /*if (path === getFilePath() && isBulkView === false) {
                        arFile[flagFile] = newName;
                        updateTitle();
                        showFile(); // 重新載入檔案
                        M.mainFileList.init(); // 檔案預覽視窗 初始化
                    }*/
                    // 檔案重新命名後會觸發fileWatcher，所以不需要處理

                    // 如果是自定義名單，就主動觸發檔案變更的事件
                    if (_fileLoadType === FileLoadType.userDefined) {
                        const fwd: FileWatcherData = {
                            Key: "fileList",
                            FullPath: newName,
                            OldFullPath: path,
                            ChangeType: "renamed",
                            FileType: "file"
                        };
                        baseWindow.onFileWatcher([fwd]);
                    }

                    M.msgbox.close(dom);
                }
            });

            const len = fileName.length - Lib.getExtension(path).length;
            msg.domInput.setSelectionRange(0, len);
        }

        /**
          * 顯示 重新命名資料夾 的對話方塊
          */
        async function showRenameDirMsg(path?: string) {

            if (_groupType === GroupType.none || _groupType === GroupType.welcome) {
                return;
            }

            if (path === undefined) {
                path = getDirPath();
            }
            const fileName = Lib.getFileName(path);

            const msg = M.msgbox.show({
                txt: `<div class="msgbox-title">${M.i18n.t("msg.renameDir")}</div>`, // 重新命名資料夾
                type: "text",
                inputTxt: fileName,
                funcYes: async (dom: HTMLElement, inputTxt: string) => {
                    if (path === undefined) { return; }

                    if (inputTxt.trim() === "") {
                        M.msgbox.show({ txt: M.i18n.t("msg.nameIsEmpty") }); // 必須輸入檔名
                        return;
                    }
                    if (inputTxt.search(/[\\]|[/]|[:]|[*]|[?]|["]|[<]|[>]|[|]/) !== -1) {
                        M.msgbox.show({ txt: M.i18n.t("msg.nameContainsUnavailableChar") + "<br>" + "\\ / : * ? \" < > |" }); // 檔案名稱不可以包含下列任意字元
                        return;
                    }
                    if (fileName == inputTxt) {
                        M.msgbox.close(dom);
                        return;
                    }
                    const dirPath = Lib.getDirectoryName(path);
                    if (dirPath === null) {
                        M.msgbox.show({ txt: M.i18n.t("msg.renamingFailure") + M.i18n.t("msg.wrongPath") }); // 重新命名失敗：路徑異常
                        return;
                    }

                    const newName = Lib.combine([dirPath, inputTxt]);
                    const err = await WV_Directory.Move(path, newName);
                    if (err !== "") {
                        M.msgbox.show({ txt: M.i18n.t("msg.renamingFailure") + "<br>" + err }); // 重新命名失敗：
                        return;
                    }

                    const isReload = path === getDirPath(); // 判斷是否為當前顯示的資料夾

                    _arDir = changeKey(_arDir, path, newName);
                    _arDirKey = Object.keys(_arDir);

                    M.mainDirList.init();

                    if (isReload) {
                        // showDir();
                        // 載入新資料夾內的同一張圖片
                        let p = getFilePath();
                        p = p.replace(path, newName);
                        loadFile(p);
                    }

                    M.msgbox.close(dom);
                }
            });

            const len = fileName.length;
            msg.domInput.setSelectionRange(0, len);
        }

        function changeKey(arDir: { [key: string]: string[] }, oldKey: string, newKey: string) {
            const keys = Object.keys(arDir);
            const index = keys.indexOf(oldKey);
            const newArDir: { [key: string]: string[] } = {};
            for (let i = 0; i < keys.length; i++) {
                if (i === index) {
                    newArDir[newKey] = arDir[oldKey];
                } else {
                    newArDir[keys[i]] = arDir[keys[i]];
                }
            }
            return newArDir;
        }

        //#endregion

        //#region 監控檔案變化

        /**
         * 停止監控檔案變化
         */
        async function stopFileWatcher() {
            await WV_System.NewFileWatcher("fileList", ""); // 偵測檔案變化
            await WV_System.NewFileWatcher("dirList", ""); // 偵測資料夾變化
        }

        // 偵測檔案變化 - 資料夾預覽面板
        baseWindow.fileWatcherEvents.push((arData: FileWatcherData[]) => {

            arData.forEach(async data => {

                if (data.Key !== "dirList") { return; }
                if (data.FileType === "file") { return; }

                if (data.ChangeType === "deleted") { // 刪除檔案

                    const flag = _arDirKey.indexOf(data.FullPath);

                    if (flag !== -1) {

                        const path = _arDirKey[flag];
                        const p = getDirPath();
                        delete _arDir[path]; // 刪除此筆
                        _arDirKey = Object.keys(_arDir);
                        _flagDir = _arDirKey.indexOf(p); // 更新當前檔案位置

                        M.mainDirList.init(); // 資料夾預覽視窗 初始化

                        if (data.FullPath === getDirPath()) {
                            showReloadFileMsg("delete", "dir");
                        }

                    } else {
                        return;
                    }

                } else if (data.ChangeType === "renamed") { // 檔案重新命名

                    const flag = _arDirKey.indexOf(data.OldFullPath);
                    if (flag !== -1) { // 名單中存在
                        _arFile[flag] = data.FullPath;

                        _arDir = changeKey(_arDir, data.OldFullPath, data.FullPath);
                        _arDirKey = Object.keys(_arDir);

                        M.mainDirList.init();
                        if (data.OldFullPath === getDirPath()) {

                            if (_isBulkView) {
                                showReloadFileMsg("reload", "dir");
                            } else {
                                // showDir();
                                // 載入新資料夾內的同一張圖片
                                let p = getFilePath();
                                p = p.replace(data.OldFullPath, data.FullPath);
                                loadFile(p);
                            }

                        }

                    } else {
                        //data.ChangeType = "created";
                    }

                } else if (data.ChangeType === "changed") { // 檔案被修改
                }

                else if (data.ChangeType === "created") { // 新增檔案
                }
            });

        })

        // 偵測檔案變化 - 檔案預覽面板
        baseWindow.fileWatcherEvents.push((arData: FileWatcherData[]) => {

            if (_isBulkView) { return; }

            let isMainFileListInit = false; // 檔案預覽視窗 初始化
            let isUpdateTitle = false; // 更新視窗標題
            let isShowReloadFileMsgDelete = false; // 顯示 重新載入檔案 的對話方塊
            let isShowReloadFileMsgReload = false; // 顯示 重新載入檔案 的對話方塊
            let isShowFile = false; // 重新載入檔案

            arData.forEach(async data => {

                if (data.Key !== "fileList") { return; }

                M.mainExif.updateFileWatcher(data);

                if (data.ChangeType === "deleted") { // 刪除檔案

                    if (data.FullPath === getFilePath()) {

                        isShowReloadFileMsgDelete = true; // 顯示 重新載入檔案 的對話方塊

                    } else {

                        const flag = _arFile.indexOf(data.FullPath);
                        if (flag !== -1) {
                            const p = getFilePath();
                            _arFile.splice(flag, 1); // 刪除此筆
                            _flagFile = _arFile.indexOf(p); // 更新當前檔案位置
                            isMainFileListInit = true; // 檔案預覽視窗 初始化
                            isUpdateTitle = true; // 更新視窗標題
                        } else {
                            return;
                        }

                    }

                } else if (data.ChangeType === "renamed") { // 檔案重新命名

                    if (data.FileType === "dir") { return; }

                    const flag = _arFile.indexOf(data.OldFullPath);
                    if (flag !== -1) { // 名單中存在
                        if (data.OldFullPath === getFilePath()) { // 當前開啟
                            _arFile[flag] = data.FullPath;
                            isUpdateTitle = true; // 更新視窗標題
                            isShowFile = true; // 重新載入檔案
                        } else {
                            _arFile[flag] = data.FullPath;
                        }
                        isMainFileListInit = true; // 檔案預覽視窗 初始化
                    } else {
                        data.ChangeType = "created";
                    }

                } else if (data.ChangeType === "changed") { // 檔案被修改

                    if (_groupType === GroupType.img && data.FullPath === getFilePath()) {
                        isShowReloadFileMsgReload = true; // 顯示 重新載入檔案 的對話方塊
                    } else {
                        return;
                    }

                }

                if (data.ChangeType === "created") { // 新增檔案

                    if (data.FileType !== "file") { return; }
                    if (_arFile.indexOf(data.FullPath) !== -1) { return; } // 如果檔案已經存在於列表中

                    const fileExt = Lib.getExtension(data.FullPath).replace(".", ""); // 取得副檔名
                    const gt = fileExtToGroupType(fileExt); // 根據副檔名判斷GroupType
                    if (_groupType === gt) {

                        // 判斷要插入到最前面還是最後面
                        let isEnd = false;
                        let whenInsertingFile = M.config.settings.other.whenInsertingFile;
                        if (whenInsertingFile === "end") {
                            isEnd = true;
                        } else if (whenInsertingFile === "auto" && M.fileSort.getOrderbyType() === "asc") {
                            isEnd = true;
                        }
                        if (isEnd) {
                            _arFile.push(data.FullPath);
                        } else {
                            const p = getFilePath();
                            _arFile.unshift(data.FullPath);
                            _flagFile = _arFile.indexOf(p); // 更新當前檔案位置
                        }

                        isMainFileListInit = true; // 檔案預覽視窗 初始化
                        isUpdateTitle = true; // 更新視窗標題
                    } else {
                        return;
                    }

                }

            });

            if (isMainFileListInit) {
                M.mainFileList.init(); // 檔案預覽視窗 初始化
            }
            if (isUpdateTitle) {
                updateTitle(); // 更新視窗標題
            }
            if (isShowReloadFileMsgDelete) {
                showReloadFileMsg("delete", "file"); // 顯示 重新載入檔案 的對話方塊
            } else if (isShowReloadFileMsgReload) {
                showReloadFileMsg("reload", "file"); // 顯示 重新載入檔案 的對話方塊
            } else if (isShowFile) {
                showFile(); // 重新載入檔案
            }
        })

        // 偵測檔案變化 - 大量瀏覽模式
        baseWindow.fileWatcherEvents.push((arData: FileWatcherData[]) => {

            if (_isBulkView === false) { return; }

            arData.forEach(async data => {

                if (data.Key !== "fileList") { return; }

                if (data.ChangeType === "deleted") { // 刪除檔案

                    let flag = _arFile.indexOf(data.FullPath);
                    if (flag !== -1) {
                        _arFile.splice(flag, 1); // 刪除此筆
                    } else {
                        return;
                    }

                } else if (data.ChangeType === "renamed") { // 檔案重新命名

                    if (data.FileType === "dir") { return; }

                    const flag = _arFile.indexOf(data.OldFullPath);
                    if (flag !== -1) { // 名單中存在
                        _arFile[flag] = data.FullPath;
                    } else {
                        data.ChangeType = "created";
                    }

                } else if (data.ChangeType === "changed") { // 檔案被修改

                }

                if (data.ChangeType === "created") { // 新增檔案

                    if (data.FileType !== "file") { return; }
                    if (_arFile.indexOf(data.FullPath) !== -1) { return; } // 如果檔案已經存在於列表中

                    const fileExt = Lib.getExtension(data.FullPath).replace(".", ""); // 取得副檔名
                    const gt = fileExtToGroupType(fileExt); // 根據副檔名判斷GroupType
                    if (_groupType === gt) {

                        // 判斷要插入到最前面還是最後面
                        let isEnd = false;
                        let whenInsertingFile = M.config.settings.other.whenInsertingFile;
                        if (whenInsertingFile === "end") {
                            isEnd = true;
                        } else if (whenInsertingFile === "auto" && M.fileSort.getOrderbyType() === "asc") {
                            isEnd = true;
                        }
                        if (isEnd) {
                            _arFile.push(data.FullPath);
                        } else {
                            _arFile.unshift(data.FullPath);
                        }

                    } else {
                        return;
                    }

                }

                await M.bulkView.updateFileWatcher(data);

            });

        })

        //#endregion
    }
}

/** 
 * 名單類型
 */
enum FileLoadType {
    /** 資料夾內的檔案 */
    "dir",
    /** 自訂名單 */
    "userDefined"
}
