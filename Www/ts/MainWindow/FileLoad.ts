import { GroupType } from "../Config";
import { Lib } from "../Lib";
import { Throttle } from "../Throttle";
import { Toast } from "../Toast";
import { WebAPI } from "../WebAPI";
import { ArchiveApiError, ArchiveEntryItem, ArchiveSessionResponse, FileRef, getArchiveFileName, getArchiveLogicalPath, isSupportedArchivePath } from "../Archive/ArchiveTypes";
import { ArchiveSourceManager } from "../Archive/ArchiveSource";
import { ArchiveResolver } from "../Archive/ArchiveResolver";
import { MainWindow } from "./MainWindow";

/**
 * 載入檔案
 */
export class FileLoad {

    public getWaitingFile: () => string[];
    public setWaitingFile: (ar: string[]) => void;
    /** 取得目前列表 UI 使用的統一 item，隔離一般路徑與 archive entry 差異。 */
    public getFileListItems;
    /** 取得目前項目的 filesystem 或 archive FileRef。 */
    public getCurrentFileRef;
    /** 判斷目前來源是否已進入 archive mode。 */
    public getIsArchiveMode;
    /** 依 entry metadata 排序 archive 清單，不保存一般檔案排序設定。 */
    public sortArchiveItems;
    /** 取得目前 archive entry 的 metadata 清單，供 BulkView 使用。 */
    public getArchiveEntryItems;
    /** 取得 archive entry thumbnail/icon URL；禁止 materialize 的 entry 不建立實體暫存檔。 */
    public getArchiveEntryImageUrl;
    /** 取得可交給既有 BulkView/newItem 流程的 archive FileInfo2。 */
    public resolveArchiveEntryFileInfo;
    /** 取得 archive entry 對應的實體暫存路徑；不接受未識別的 logical path。 */
    public resolveArchiveEntryPhysicalPath;
    /** 判斷指定路徑是否為目前 archive source 的 entry logical path。 */
    public isArchiveEntryPath;
    /** 取得目前預覽中的 archive entry 修改日期；沒有時間時回傳 0。 */
    public getArchiveLastWriteTimeUtc;
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
        /** archive mode 的扁平 entry 列表；一般檔案模式不使用此欄位。 */
        var _arArchiveItem: ArchiveEntryItem[] = [];
        /** 是否已通過整組來源判斷並進入壓縮檔預覽模式。 */
        var _isArchiveMode = false;
        /** 管理目前視窗持有的一個或多個 archive session。 */
        var _archiveSource = new ArchiveSourceManager(WebAPI.Archive);
        /** 將 archive entry 解析成既有 viewer 可讀取的實體暫存檔。 */
        var _archiveResolver = new ArchiveResolver(_archiveSource, WebAPI.Archive, WebAPI.getFileInfo2);
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
        /** 目前正在顯示 archive 密碼輸入框時，供拖曳開檔取消等待中的輸入流程。 */
        var _cancelArchivePasswordInput: (() => void) | undefined;

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
        this.getFileListItems = getFileListItems;
        this.getCurrentFileRef = getCurrentFileRef;
        this.getIsArchiveMode = () => _isArchiveMode;
        this.sortArchiveItems = sortArchiveItems;
        this.getArchiveEntryItems = () => Array.from(_arArchiveItem);
        this.getArchiveEntryImageUrl = (item: ArchiveEntryItem, size = 256) =>
            _archiveResolver.getThumbnailUrl(item, size);
        this.resolveArchiveEntryFileInfo = async (item: ArchiveEntryItem) =>
            (await _archiveResolver.resolvePreviewFile(item)).fileInfo;
        this.resolveArchiveEntryPhysicalPath = resolveArchiveEntryPhysicalPath;
        this.isArchiveEntryPath = isArchiveEntryPath;
        this.getArchiveLastWriteTimeUtc = getArchiveLastWriteTimeUtc;
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
            if (_isArchiveMode) {
                loadArchiveParentDir(getDirPath());
            } else {
                loadDir(getDirPath()); // 處理資料夾預覽視窗
            }
        }

        /**
         * 取得當前資料夾
         */
        function getDirPath() {
            return _dirPathNow;
        }

        /** 取得目前預覽中的 archive entry 修改日期。 */
        async function getArchiveLastWriteTimeUtc(): Promise<number> {
            return _arArchiveItem[_flagFile]?.lastWriteTimeUtc ?? 0;
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

            // archive mode 的資料夾面板只代表原始壓縮檔的上一層實體資料夾；
            // 點擊唯一項目不能把目前來源切換成一般資料夾，否則 session 與 entry identity 會失效。
            if (_isArchiveMode && _arDirKey.length === 1 && path === _dirPathNow) {
                await updateFlagDir(path);
                M.mainDirList.select();
                M.mainDirList.updateLocation();
                return;
            }

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

        /**
         * archive mode 的資料夾面板只顯示壓縮檔上一層實體資料夾。
         *
         * MainDirList 仍沿用原本的縮圖元件，因此這裡只準備實體資料夾內的
         * 圖片檔名，不把 archive entry 混入 `_arDir`，也不啟動一般資料夾 watcher。
         */
        async function loadArchiveParentDir(dirPath: string) {
            _dirPathNow = dirPath;

            const arExt = M.config.allowFileType(GroupType.img).map(item => item["ext"]);
            const maxCount = M.config.settings.advanced.dirListMaxCount;
            let arPath: string[] = [];

            try {
                const json = await WebAPI.Directory.getSiblingDir(dirPath, arExt, maxCount);
                if (_isArchiveMode === false || _dirPathNow !== dirPath) { return; }
                arPath = json[dirPath] ?? [];
            }
            catch (error) {
                // sibling directory 失敗時仍嘗試直接讀取目前資料夾，避免面板整個消失。
                console.warn("[Archive] 讀取上一層資料夾縮圖清單失敗。", error);
            }

            if (arPath.length === 0) {
                try {
                    const files = await WebAPI.Directory.getFiles(dirPath, "*.*");
                    const extensionSet = new Set(arExt.map(ext => ext.toLocaleLowerCase().replace(/^\./, "")));
                    arPath = files
                        .filter(path => extensionSet.has(Lib.getExtension(path).replace(/^\./, "").toLocaleLowerCase()))
                        .slice(0, maxCount)
                        .map(path => Lib.getFileName(path));
                }
                catch (error) {
                    console.warn("[Archive] 讀取上一層資料夾檔案清單失敗。", error);
                }
            }

            if (_isArchiveMode === false || _dirPathNow !== dirPath) { return; }
            _arDir = { [dirPath]: arPath };
            _arDirKey = [dirPath];
            _flagDir = 0;
            M.mainDirList.init();
            M.mainDirList.setStartLocation();
        }

        //#endregion ---------------------

        /**
         * 用於拖曳開啟檔案
         * @param files 檔名陣列
         */
        async function loadDropFile(files: string[]) {

            // archive 載入可能正等待密碼輸入。拖曳新檔案進來時，先取消該等待，
            // 再等原本的載入流程完成清理，避免 _isLoadFileFinish 一直維持 false。
            if (_isLoadFileFinish === false && _cancelArchivePasswordInput !== undefined) {
                _cancelArchivePasswordInput();
                while (_isLoadFileFinish === false) {
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }

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
         * 載入檔案陣列。
         * 多檔案永遠維持一般檔案模式；archive mode 僅由單一檔案入口建立。
         */
        async function loadFiles(ar: string[] = []) {

            if (ar.length === 0) { return; }
            if (_isLoadFileFinish === false) {
                console.log("loadFiles處理中");
                return;
            }

            await WV_System.NewFileWatcher("fileList", ""); // 取消偵測檔案變化

            await leaveArchiveMode();

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
         * 開啟一組壓縮檔並建立扁平 entry 清單。
         *
         * 這個函數只負責來源 session 與列表，不會在列表初始化時解壓 entry；
         * entry 只有在 showArchiveEntry 真正切換到該項目時，才交給 resolver
         * materialize，再沿用既有圖片、影片、PDF 或文字 viewer。
         */
        async function loadArchiveFiles(archivePaths: string[]) {

            const uniquePaths = Array.from(new Set(archivePaths));
            if (uniquePaths.length === 0) { return; }

            _isLoadFileFinish = false;
            M.script.window.enabledLoading(true);

            try {
                let sessions: ArchiveSessionResponse[];
                let password: string | undefined;

                // 密碼錯誤時保持在同一個載入流程中重試；取消輸入則走一般失敗 fallback。
                while (true) {
                    try {
                        sessions = await _archiveSource.openMany(uniquePaths, password);

                        // ZIP 等格式可能先完成目錄讀取，再以 response 欄位表示密碼尚未驗證；
                        // 此時若直接建立列表，使用者會看到列表卻沒有輸入密碼的機會。
                        const unverifiedSession = sessions.find(session =>
                            session.hasEncryptedEntries && session.isPasswordVerified !== true);
                        if (unverifiedSession !== undefined) {
                            const errorCode = password === undefined
                                ? "passwordRequired"
                                : "passwordIncorrect";
                            console.info("[Archive] sessions/open 需要密碼驗證", {
                                archivePath: unverifiedSession.archivePath,
                                errorCode,
                                sessionId: unverifiedSession.sessionId,
                            });

                            // openMany 已完成整組 session 建立；重試前先釋放這一代，
                            // 避免同一個視窗留下未驗證 session 或累積持有次數。
                            await _archiveSource.close().catch(closeError => {
                                console.warn("[Archive] 釋放未驗證 session 失敗。", closeError);
                            });
                            throw new ArchiveApiError(
                                errorCode,
                                errorCode === "passwordRequired"
                                    ? M.i18n.t("msg.archivePasswordRequired")
                                    : M.i18n.t("msg.archivePasswordIncorrect"),
                                401,
                                unverifiedSession.archivePath,
                            );
                        }
                        break;
                    }
                    catch (error) {
                        if (error instanceof ArchiveApiError
                            && (error.errorCode === "passwordRequired" || error.errorCode === "passwordIncorrect")) {
                            console.info("[Archive] 顯示密碼輸入框", {
                                archivePath: error.archivePath ?? uniquePaths[0],
                                reason: error.errorCode,
                            });
                            const nextPassword = await requestArchivePassword(error.errorCode === "passwordIncorrect");
                            if (nextPassword === null) {
                                throw new ArchiveApiError(
                                    "passwordCancelled",
                                    M.i18n.t("msg.archiveLoadCancelled"),
                                    0,
                                    error.archivePath,
                                );
                            }
                            password = nextPassword;
                            continue;
                        }
                        throw error;
                    }
                }

                let archiveItems = _archiveSource
                    .getEntryItems(sessions)
                    .filter(item => item.isDirectory === false);
                if (M.config.settings.other.archiveLoadMode === "imageOnly") {
                    const imageExtensions = new Set(
                        M.config.allowFileType(GroupType.img)
                            .map(item => item.ext.toLocaleLowerCase().replace(/^\./, "")),
                    );
                    archiveItems = archiveItems.filter(item =>
                        imageExtensions.has(Lib.getExtension(item.displayName).replace(/^\./, "")));
                }
                if (archiveItems.length === 0) {
                    await leaveArchiveMode();
                    await M.fileShow.openWelcome();
                    Toast.show(M.i18n.t("msg.archiveEmpty"), 1000 * 3);
                    return;
                }

                _isArchiveMode = true;
                _arArchiveItem = archiveItems;
                _arFile = _arArchiveItem.map(item => getArchiveLogicalPath(item));
                _fileLoadType = FileLoadType.userDefined;
                _groupType = GroupType.unknown;
                _atLoadingGroupType = _groupType;
                _atLoadingExt = undefined;
                _dirPathNow = Lib.getDirectoryName(uniquePaths[0]) ?? "";
                _flagFile = 0;

                // archive entry 不使用原始檔案 watcher；原始壓縮檔在開啟期間視為固定來源。
                await WV_System.NewFileWatcher("fileList", "");
                await WV_System.NewFileWatcher("dirList", "");
                // 只讀取一般模式的既有預設，後續 archive 點選排序不會回寫此設定。
                M.fileSort.readSortType(_dirPathNow);
                M.fileSort.updateMenu();
                // updateMenu 可能已將不可用的舊設定 fallback 成 name，必須同步重排清單。
                // 初次建立列表不保留排序前的 entry 身份，固定選取排序後第一筆。
                sortArchiveItems(M.fileSort.getSortType(), false);

                console.debug("[Archive] entry list ready", {
                    archiveCount: sessions.length,
                    entryCount: _arArchiveItem.length,
                    flagFile: _flagFile,
                    currentPath: _arArchiveItem[_flagFile]?.logicalPath,
                });

                M.mainFileList.setHide(false);
                M.mainFileList.init();
                M.mainFileList.setStartLocation();

                await showFile();

                await loadArchiveParentDir(_dirPathNow);
            }
            catch (error) {
                await showArchiveLoadFailure(uniquePaths, error);
            }
            finally {
                _isLoadFileFinish = true;
                M.script.window.enabledLoading(false);
            }
        }

        /**
         * 顯示密碼輸入框並等待使用者決定。
         * 回傳 null 代表取消；空白密碼仍照原值送給後端，讓後端統一判斷。
         */
        function requestArchivePassword(isRetry: boolean): Promise<string | null> {
            return new Promise(resolve => {
                let isResolved = false;
                let cancelInput: () => void;
                const resolveOnce = (value: string | null) => {
                    if (isResolved) { return; }
                    isResolved = true;
                    if (_cancelArchivePasswordInput === cancelInput) {
                        _cancelArchivePasswordInput = undefined;
                    }
                    resolve(value);
                };
                cancelInput = () => resolveOnce(null);
                _cancelArchivePasswordInput = cancelInput;

                M.msgbox.show({
                    type: "text",
                    inputType: "password",
                    txt: isRetry
                        ? M.i18n.t("msg.archivePasswordIncorrect")
                        : M.i18n.t("msg.archivePasswordRequired"),
                    funcYes: (dom: HTMLElement, inputTxt: string) => {
                        M.msgbox.close(dom);
                        resolveOnce(inputTxt);
                    },
                    funcClose: (dom: HTMLElement) => {
                        M.msgbox.close(dom);
                        resolveOnce(null);
                    },
                });
            });
        }

        /**
         * archive 初始化失敗時回到一般檔案模式。
         *
         * 這裡不把失敗候選檔案塞回 archive list，因為 session 並未建立成功；
         * 回到歡迎畫面，並以穩定 errorCode 轉成 Toast。
         */
        async function showArchiveLoadFailure(archivePaths: string[], error: unknown) {
            await leaveArchiveMode().catch(closeError => {
                console.warn("清理失敗的 archive session 時發生錯誤。", closeError);
            });

            const archiveError = error instanceof ArchiveApiError ? error : undefined;
            const failedPath = archiveError?.archivePath ?? archivePaths[0];
            _isArchiveMode = false;
            _arArchiveItem = [];
            await M.fileShow.openWelcome();

            const errorText = getArchiveLoadErrorText(archiveError);
            Toast.show(M.i18n.t("msg.archiveLoadFailed", {
                name: getArchiveFileName(failedPath),
                reason: errorText,
            }), 1000 * 4);
        }

        /** 將 API 錯誤代碼轉成不依賴後端 message 的使用者提示。 */
        function getArchiveLoadErrorText(error: ArchiveApiError | undefined): string {
            if (error === undefined) { return ""; }
            if (error.errorCode === "passwordCancelled") { return M.i18n.t("msg.archiveLoadCancelled"); }
            if (error.errorCode === "passwordIncorrect") { return M.i18n.t("msg.archivePasswordError"); }
            if (error.errorCode === "archiveNotFound") { return M.i18n.t("msg.archiveNotFound"); }
            if (error.errorCode === "archiveOpenFailed") { return M.i18n.t("msg.archiveOpenFailed"); }
            if (error.errorCode === "solidArchiveSizeLimitExceeded") {
                return M.i18n.t("msg.archiveSolidSizeLimitExceeded");
            }
            return "";
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

            // 單一支援格式檔案直接進入 archive mode；後端會再驗證檔案內容是否真的是壓縮檔。
            if (isSupportedArchivePath(path)) {
                await loadArchiveFiles([path]);
                return;
            }

            _fileLoadType = FileLoadType.dir; // 名單類型，資料夾內的檔案

            await leaveArchiveMode();

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
        function getFilePath(): string {
            if (_isArchiveMode) {
                return getCurrentArchiveLogicalPath();
            }
            let p = _arFile[_flagFile];
            return p;
        }

        /**
         * 將目前 archive entry 組成顯示與識別用的完整 logical path。
         * 這不是 Windows 實體檔案；需要實體檔案的功能要等後續 resolver 接入。
         */
        function getCurrentArchiveLogicalPath(): string {
            return getArchiveLogicalPath(_arArchiveItem[_flagFile]);
        }

        /**
         * 判斷 path 是否是目前清單中的 archive entry logical path。
         *
         * archive 的 logical path 可能看起來像 Windows 路徑，但不能因為
         * 找不到 entry 就把它交給 Windows API；外部操作必須先通過這個
         * 明確的身份判斷，再呼叫 entry-path。
         */
        function isArchiveEntryPath(path: string | undefined): boolean {
            if (_isArchiveMode === false || path === undefined) { return false; }
            return _arArchiveItem.some(item => getArchiveLogicalPath(item) === path);
        }

        /**
         * 取得指定 archive entry 的實體暫存路徑。
         * path 未指定時使用目前選取的 entry；指定但不屬於目前 source 時
         * 回傳 undefined，避免把 logical path 誤當成實體檔案交給 Windows。
         */
        async function resolveArchiveEntryPhysicalPath(path?: string): Promise<string | undefined> {
            if (_isArchiveMode === false) { return undefined; }

            const item = path === undefined
                ? _arArchiveItem[_flagFile]
                : _arArchiveItem.find(entry => getArchiveLogicalPath(entry) === path);
            if (item === undefined) { return undefined; }

            return await _archiveResolver.resolvePhysicalPath(item);
        }

        /** 取得目前檔案的來源身份，供後續 preview/resolver 階段使用。 */
        function getCurrentFileRef(): FileRef | undefined {
            if (_isArchiveMode) {
                return _arArchiveItem[_flagFile]?.ref;
            }
            const path = _arFile[_flagFile];
            return path === undefined ? undefined : { kind: "filesystem", path };
        }

        /**
         * 產生檔案列表 UI 使用的資料。
         * archive entry 只請求後端縮圖 URL，不取得 entry-path，避免列表初始化
         * 把每一筆 entry 都解壓成實體暫存檔；真正開啟項目時才由 resolver materialize。
         */
        function getFileListItems() {
            if (_isArchiveMode) {
                return _arArchiveItem.map(item => ({
                    key: `${item.ref.sessionId}:${item.ref.entryId}`,
                    displayName: item.displayName,
                    iconUrl: _archiveResolver.getThumbnailUrl(item),
                    // 這是 UI logical path；拖曳時由 ScriptFile 透過 entry-path 解析。
                    path: getArchiveLogicalPath(item),
                    // 仍允許觸發拖曳流程，讓 ScriptOpen.resolvePhysicalPath 顯示
                    // 「此類型的檔案不支援此操作」，而不是讓拖曳看起來沒有反應。
                    canDrag: true,
                }));
            }

            return _arFile.map(path => ({
                key: path,
                displayName: Lib.getFileName(path),
                iconUrl: Lib.getExtension(path).toLocaleLowerCase() === ".svg"
                    ? WebAPI.getFile(path)
                    : WebAPI.Img.fileIcon(path),
                path,
                canDrag: true,
            }));
        }

        /**
         * 在 archive entry metadata 上執行本地排序。
         *
         * archive logical path 不是真實 Windows 目錄，不能使用 WebAPI.sort2；
         * 這裡只使用已由後端回傳的名稱、大小與修改時間，並且不寫入一般檔案排序設定。
         */
        function sortArchiveItems(sortType: string, preserveCurrent = true) {
            if (_isArchiveMode === false) { return; }

            // 先保存目前 entry 的穩定身份，再排序；不能用列表 index 找回選取項目。
            const currentKey = preserveCurrent ? _arArchiveItem[_flagFile]?.ref : undefined;
            const isDesc = sortType.endsWith("Desc");
            const baseType = isDesc ? sortType.substring(0, sortType.length - 4) : sortType;

            if (baseType === "random") {
                // Fisher-Yates 產生真正的隨機排列，避免依賴後端理解 logical path。
                for (let i = _arArchiveItem.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [_arArchiveItem[i], _arArchiveItem[j]] = [_arArchiveItem[j], _arArchiveItem[i]];
                }
            }
            else {
                _arArchiveItem.sort((left, right) => {
                    let result = 0;
                    if (baseType === "length") {
                        result = left.size - right.size;
                    }
                    else if (baseType === "lastWriteTime") {
                        result = left.lastWriteTimeUtc - right.lastWriteTimeUtc;
                        if (result === 0) {
                            result = left.displayName.localeCompare(right.displayName, undefined, {
                                numeric: true,
                                sensitivity: "base",
                            });
                            if (result === 0) {
                                result = left.logicalPath.localeCompare(right.logicalPath, undefined, {
                                    numeric: true,
                                    sensitivity: "base",
                                });
                            }
                        }
                    }
                    else {
                        result = left.displayName.localeCompare(right.displayName, undefined, {
                            numeric: true,
                            sensitivity: "base",
                        });
                        if (result === 0) {
                            result = left.logicalPath.localeCompare(right.logicalPath, undefined, {
                                numeric: true,
                                sensitivity: "base",
                            });
                        }
                    }
                    return isDesc ? -result : result;
                });
            }

            _arFile = _arArchiveItem.map(item => getArchiveLogicalPath(item));
            _flagFile = currentKey === undefined
                ? 0
                : Math.max(0, _arArchiveItem.findIndex(item =>
                    item.ref.sessionId === currentKey.sessionId && item.ref.entryId === currentKey.entryId));

            M.mainFileList.init();
            M.mainFileList.updateLocation();
            updateTitle();
        }

        /**
         * 結束 archive mode 並釋放目前視窗對所有 session 的持有。
         * generation 會在 close 中遞增，使尚未完成的 archive open 回應失效。
         */
        async function leaveArchiveMode() {
            const sourceState = _archiveSource.getState();
            if (_isArchiveMode || sourceState.status !== "closed" || sourceState.sessions.length > 0) {
                await _archiveSource.close();
            }
            _isArchiveMode = false;
            _arArchiveItem = [];
        }

        /** 
         * 重新載入檔案預覽面板
         */
        function reloadFilePanel() {
            if (_isArchiveMode) {
                // archive entry 清單由 session metadata 維持，不能把 logical path 當成一般檔案重載。
                M.mainFileList.init();
                M.mainFileList.setStartLocation();
                return;
            }
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
            if (path === undefined) { return path; }
            if (_isArchiveMode) {
                // logical path 不是實體路徑，不能交給 Windows 的短路徑 API 處理。
                return path;
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

            if (_isLoadFileFinish === false && _isArchiveMode === false) {
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

            if (_isArchiveMode) {
                await showArchiveEntry();
                return;
            }

            let path = getFilePath();
            let fileInfo2 = await WebAPI.getFileInfo2(path);
            if (fileInfo2.Type !== "none") {
                M.mainExif.init(fileInfo2); // 初始化exif
                await showFileUpdataUI();
            }
            await showFileUpdataImg(fileInfo2);
        }

        /**
         * 解析並顯示目前的 archive entry。
         *
         * 先更新列表與標題，再由 resolver 取得 materialized entry；解析完成後
         * 仍沿用既有 showFileUpdataImg，因此圖片、影片、PDF 與文字各自的 viewer
         * 不需要知道來源是否為 archive。若 entry 在載入過程中被切換，resolver
         * 會以 staleRequest 中止，避免舊檔案覆蓋目前畫面。
         */
        async function showArchiveEntry() {
            const item = _arArchiveItem[_flagFile];
            if (item === undefined) { return; }

            await showFileUpdataUI();
            try {
                if (item.isHighRisk) {
                    const fileInfo: FileInfo2 = {
                        Type: "file",
                        Path: _archiveResolver.getThumbnailUrl(item),
                        FullPath: getArchiveLogicalPath(item),
                        Lenght: item.size,
                        CreationTimeUtc: 0,
                        LastWriteTimeUtc: item.lastWriteTimeUtc,
                        HexValue: "",
                    };
                    _groupType = GroupType.img;
                    // 高風險 entry 不會經過一般 materialize preview 流程，
                    // 仍需初始化 MainExif，讓 archive mode 隱藏「相關檔案」頁籤。
                    M.mainExif.init(fileInfo, true);
                    if (_isBulkView) {
                        // 高風險 entry 不能直接進入圖片 viewer，否則會繞過
                        // showFileUpdataImg 的大量瀏覽分流，造成工具列與內容不同步。
                        await M.fileShow.openBulkView();
                        return;
                    }
                    await M.fileShow.openIconImage(fileInfo.Path, fileInfo, () => isCurrentArchiveItem(item));
                    return;
                }

                const resolved = await _archiveResolver.resolvePreviewFile(item);
                if (isCurrentArchiveItem(item) === false) {
                    return;
                }

                // archive mode 的列表是 userDefined；在真正取得 entry 類型後，
                // 讓影片/PDF/文字走原本的 dispatch，而不是沿用 archive 的 unknown。
                _groupType = fileToGroupType(resolved.fileInfo);
                M.mainExif.init(resolved.fileInfo);
                await showFileUpdataImg(resolved.fileInfo);
            }
            catch (error) {
                if (error instanceof ArchiveApiError && error.errorCode === "staleRequest") {
                    return;
                }
                await showArchiveEntryFailure(item, error);
            }
        }

        /** 判斷非同步預覽完成時，列表目前是否仍選取同一個 entry。 */
        function isCurrentArchiveItem(item: ArchiveEntryItem): boolean {
            const current = _arArchiveItem[_flagFile];
            return current?.ref.sessionId === item.ref.sessionId
                && current?.ref.entryId === item.ref.entryId;
        }

        /**
         * entry materialize 或暫存檔讀取失敗時，顯示固定錯誤圖片並提示使用者。
         * 這裡不移除 entry，因為後端下次 entry-path 可能可以重新復原暫存檔。
         */
        async function showArchiveEntryFailure(item: ArchiveEntryItem, error: unknown) {
            if (isCurrentArchiveItem(item) === false) {
                return;
            }
            console.warn("[Archive] entry preview failed", {
                archivePath: item.ref.archivePath,
                entryPath: item.logicalPath,
                sessionId: item.ref.sessionId,
                entryId: item.ref.entryId,
                error,
            });

            _groupType = GroupType.unknown;
            try {
                if (isCurrentArchiveItem(item)) {
                    const archiveInfo = await WebAPI.getFileInfo2(item.ref.archivePath);
                    await M.fileShow.openErrorImage(archiveInfo.Type === "none" ? undefined : archiveInfo);
                }
            }
            catch (iconError) {
                console.warn("[Archive] fallback icon 載入失敗。", iconError);
            }
            if (isCurrentArchiveItem(item)) {
                const message = M.i18n.t("msg.archiveEntryLoadFailed", { name: item.displayName });
                Toast.show(message, 1000 * 4);
            }
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
            if (_isArchiveMode) {
                const item = _arArchiveItem[_flagFile];
                if (item === undefined) { return; }
                const archiveName = getArchiveFileName(item.ref.archivePath);
                const logicalPath = getArchiveLogicalPath(item);
                baseWindow.setTitle(`${archiveName} / ${item.displayName}`, logicalPath);
                return;
            }
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

        /** 顯示 archive preview mode 不支援檔案系統修改操作的提示。 */
        function showArchiveUnsupportedOperationToast() {
            Toast.show(M.i18n.t("msg.archiveOperationNotSupported"), 1000 * 3);
        }

        /**
         * 顯示 刪除檔案 的對話方塊
         */
        async function showDeleteFileMsg(type?: undefined | "delete" | "moveToRecycle", path?: string) {

            // archive entry 的 getFilePath 是 logical path，不能交給 Windows 刪除 API。
            if (_isArchiveMode) {
                showArchiveUnsupportedOperationToast();
                return;
            }
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

            // archive mode 的資料夾面板不代表可修改的 archive 內部資料夾。
            if (_isArchiveMode) {
                showArchiveUnsupportedOperationToast();
                return;
            }
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

            // archive entry 是唯讀來源，且目前 path 為 logical path。
            if (_isArchiveMode) {
                showArchiveUnsupportedOperationToast();
                return;
            }
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

            // archive mode 的資料夾不應被誤當成 Windows 實體資料夾。
            if (_isArchiveMode) {
                showArchiveUnsupportedOperationToast();
                return;
            }
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
