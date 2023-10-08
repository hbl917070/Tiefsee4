/**
 * 載入檔案
 */
class FileLoad {

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
        var groupType: string = "img";
        /** 資料夾或自訂名單 */
        var fileLoadType: FileLoadType;
        /** 檔案列表(待載入檔案名單) */
        var arFile: string[] = [];
        /** 目前在檔案列表的編號 */
        var flagFile: number;
        /** loadFile是否正在處理中 */
        var isLoadFileFinish = true;
        /** 當前是否為 大量瀏覽模式 */
        var isBulkView = false;
        /** 當前是否為 大量瀏覽模式子視窗 */
        var isBulkViewSub = false;
        /** 如果使用者關閉「重新載入檔案的對話方塊」，則同一個檔案不再次詢問*/
        var temp_reloadFilePath = "";

        /** 目前的資料夾路徑 */
        var dirPathNow: string = "";
        var arDir: { [key: string]: string[] } = {};
        var arDirKey: string[] = [];
        /** 目前在資料夾列表的編號 */
        var flagDir: number;

        /** 用於判斷是否需要重新讀取資料夾列表 */
        var atLoadingDirParent = "";
        /** 載入檔案時，記錄GroupType群組類型 */
        var atLoadingGroupType = "";
        /** 載入檔案時，記錄檔案副檔名，用於判斷要關聯哪些類型的資料夾 */
        var atLoadingExt: string | undefined = "";

        this.getWaitingFile = () => { return arFile; };
        this.setWaitingFile = (ar: string[]) => { arFile = ar; };
        this.getFlagFile = () => { return flagFile; };
        this.setFlagFile = (n: number) => { flagFile = n; };

        this.showDir = showDir;
        this.prevDir = prevDir;
        this.nextDir = nextDir;
        this.getWaitingDir = () => { return arDir; };
        this.setWaitingDir = (ar: { [key: string]: string[] }) => {
            arDir = ar;
            arDirKey = Object.keys(arDir);
        };
        this.getWaitingDirKey = () => { return arDirKey; };
        this.getFlagDir = () => { return flagDir; };
        this.setFlagDir = (n: number) => { flagDir = n };
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
        this.getIsBulkView = function () { return isBulkView; };
        /** 設定當前是否為大量瀏覽模式子視窗 */
        this.setIsBulkViewSub = function (val: boolean) { isBulkViewSub = val; };

        this.fileExtToGroupType = fileExtToGroupType;

        this.stopFileWatcher = stopFileWatcher;

        //#region Dir

        /**
         * 重新載入 資料夾預覽面板
         */
        function reloadDirPanel() {
            atLoadingDirParent = "";
            loadDir(getDirPath()); //處理資料夾預覽視窗
        }


        /**
         * 取得當前資料夾
         */
        function getDirPath() {
            return dirPathNow;
            /*let path = arDirKey[flagDir];
            if (path === undefined) {
                //path = Lib.GetDirectoryName(getFilePath()) ?? "";
                console.error("辨識失敗：" + flagDir);
                console.error(arDirKey);
            }
            return path;*/
        }


        /**
         * 重新計算 flagDir
         */
        async function updateFlagDir(_dirPath: string) {

            if (_dirPath === undefined) { return; }

            flagDir = 0;
            for (let i = 0; i < arDirKey.length; i++) {
                const path = arDirKey[i];
                if (path === _dirPath) {
                    flagDir = i;
                    return;
                }
            }

            if (arDirKey.length === 0) { return; }

            //如果找不到資料夾，就重新讀取名單
            await initDirList(dirPathNow); //取得資料夾名單
            await M.dirSort.sort();
            M.mainDirList.init();

            for (let i = 0; i < arDirKey.length; i++) {
                const path = arDirKey[i];
                if (path === _dirPath) {
                    flagDir = i;
                    return;
                }
            }

        }


        /**
         * 判斷是否需要重新讀取資料夾名單
         * @param _dirPath 
         * @returns 
         */
        async function isUpdateDirList(_dirPath: string) {

            //if (dirPath === _dirPath) { return false; }
            //dirPath = _dirPath;

            let dirParent = Lib.GetDirectoryName(_dirPath);
            if (dirParent === null) { dirParent = _dirPath }
            dirParent = dirParent + atLoadingGroupType;

            if (atLoadingDirParent === dirParent) { return false; }
            atLoadingDirParent = dirParent;

            return true;
        }


        /**
         * 資料夾預覽視窗初始化 (重新讀取列表
         */
        async function initDirList(_dirPath: string) {

            let arExt: string[] = [];
            //let ar = M.config.allowFileType(GroupType.img);
            let ar = M.config.allowFileType(atLoadingGroupType);

            for (let i = 0; i < ar.length; i++) {
                arExt.push(ar[i]["ext"]);
            }

            //如果載入的檔案副檔名是未知類型，則把相同副檔名的檔案也納入關聯
            if (atLoadingExt !== undefined && atLoadingExt !== "") {
                let ext = atLoadingExt.replace(".", "");
                if (arExt.indexOf(ext) === -1) {
                    arExt.push(ext);
                }
            }

            let maxCount = M.config.settings.advanced.dirListMaxCount;
            let json = await WebAPI.Directory.getSiblingDir(dirPathNow, arExt, maxCount);

            if (dirPathNow !== _dirPath) { return; }

            arDir = json;
            arDirKey = Object.keys(arDir);
        }


        /**
         * 清空 檔案預覽視窗
         */
        function clearDir() {
            arDir = {};
            arDirKey = Object.keys(arDir);
            M.mainDirList.init();
        }


        var showDirThrottle = new Throttle(5); //節流
        /**
         * 
         * @param _flag 
         * @returns 
         */
        async function showDir(_flag?: number) {

            if (groupType === GroupType.none || groupType === GroupType.welcome) {
                return;
            }

            if (_flag !== undefined) { flagDir = _flag; }
            if (flagDir < 0) { flagDir = 0; }
            if (flagDir >= arDirKey.length) { flagDir = arDirKey.length - 1; }

            if (arDirKey.length === 0) { //如果已經沒有沒有資料夾
                //M.fileShow.openWelcome();
                //_show = async () => { }
                showDirThrottle.run = async () => { };
                return;
            }

            let path = arDirKey[flagDir];

            if (await WV_Directory.Exists(path) === false) { //如果資料夾不存在
                delete arDir[path]; //刪除此筆
                arDirKey = Object.keys(arDir);

                showDir(_flag);
                //_showDir = async () => { };
                //updateFlagDir(dirPath);
                M.mainDirList.init(); //資料夾預覽視窗 初始化
                //M.mainDirList.select(); //
                //M.mainDirList.updateLocation(); //
                return;
            }

            //更新UI
            await updateFlagDir(path); //重新計算 flagDir
            M.mainDirList.select(); //
            M.mainDirList.updateLocation(); //

            showDirThrottle.run = async () => {
                await loadFile(path, atLoadingGroupType);
            };

        }


        /**
         * 載入下一個資料夾
         */
        async function nextDir() {
            flagDir += 1;
            if (flagDir >= arDirKey.length) { flagDir = 0; }
            showDir();
        }


        /**
         * 載入上一個資料夾
         */
        async function prevDir() {
            flagDir -= 1;
            if (flagDir < 0) { flagDir = arDirKey.length - 1; }
            showDir();
        }


        /**
         * 處理資料夾預覽視窗
         * @param _dirPath 
         */
        async function loadDir(_dirPath: string) {

            dirPathNow = _dirPath;

            if (await isUpdateDirList(_dirPath)) { //載入不同資料夾，需要重新讀取

                //clearDir();


                await initDirList(_dirPath); //取得資料夾名單

                let dirParentPath = Lib.GetDirectoryName(_dirPath); //使用 父親資料夾 當做key來取得排序
                if (dirParentPath === null) {
                    dirParentPath = _dirPath;
                }

                await WV_System.NewFileWatcher("dirList", dirParentPath); //偵測資料夾變化

                M.dirSort.readSortType(dirParentPath); //取得該資料夾設定的檔案排序方式
                M.dirSort.updateMenu(); //更新menu選單
                await M.dirSort.sort(_dirPath);

                await updateFlagDir(_dirPath); //重新計算 flagDir
                M.mainDirList.init();
                M.mainDirList.setStartLocation(); //資料夾預覽視窗 捲動到選中項目的中間

            } else { //直接從 資料夾預覽視窗 切換，不需要重新讀取
                await updateFlagDir(_dirPath); //重新計算 flagDir
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

            //取得拖曳進來的檔案路徑
            let _dropPath = await baseWindow.getDropPath();
            if (_dropPath === "") { return; }

            M.msgbox.closeAll(); //關閉所有訊息視窗
            M.menu.close();
            M.textEditor.close();

            if (files.length > 1) {
                let dirPath = Lib.GetDirectoryName(_dropPath);
                if (dirPath === null) { return; }
                if (dirPath !== null) {
                    await loadFiles(dirPath, files);
                }
            } else {
                //let filePath = Lib.Combine([dirPath, files[0]]);
                await loadFile(_dropPath);
            }
        }

        /**
         * 載入檔案陣列
         * @param dirPath 
         * @param arName 
         */
        async function loadFiles(dirPath: string, arName: string[] = []) {

            await WV_System.NewFileWatcher("fileList", ""); //取消偵測檔案變化

            dirPath = await WV_Path.GetFullPath(dirPath); //避免長路經被轉換成虛擬路徑

            dirPathNow = dirPath;
            fileLoadType = FileLoadType.userDefined; //名單類型，自訂義

            //改用C#處理，增加執行效率
            arFile = await WebAPI.Directory.getFiles2(dirPath, arName);

            let path = arFile[0]; //以拖曳進來的第一個檔案為開啟對象

            let fileInfo2 = await WebAPI.getFileInfo2(path);
            atLoadingGroupType = fileToGroupType(fileInfo2);
            atLoadingExt = Lib.GetExtension(path);

            M.fileSort.readSortType(dirPath); //取得該資料夾設定的檔案排序方式
            M.fileSort.updateMenu(); //更新menu選單
            arFile = await M.fileSort.sort(arFile);

            //目前檔案位置
            flagFile = arFile.indexOf(path);

            M.mainFileList.setHide(false); //顯示檔案預覽視窗(必須顯示出物件才能計算高度)
            M.mainFileList.init(); //檔案預覽視窗 初始化
            M.mainFileList.setStartLocation(); //檔案預覽視窗 捲動到選中項目的中間
            await showFile(); //載入圖片

            loadDir(dirPath); //處理資料夾預覽視窗
        }

        /**
         * 載入單一檔案
         * @param path 
         */
        async function loadFile(path: string, _dirGroupType?: string, noLoad = false) {

            if (isLoadFileFinish === false) {
                console.log("loadFile處理中");
                return;
            }
            isLoadFileFinish = false;

            fileLoadType = FileLoadType.dir; //名單類型，資料夾內的檔案

            let fileInfo2 = await WebAPI.getFileInfo2(path);
            path = fileInfo2.Path; //避免長路經被轉成虛擬路徑

            //let dirPath = "";
            arFile = [];

            let isFile = true;

            if (fileInfo2.Type === "dir") { //如果是資料夾

                isFile = false;

                dirPathNow = path;
                arFile = await WebAPI.Directory.getFiles(path, "*.*"); //取得資料夾內所有檔案

                await WV_System.NewFileWatcher("fileList", dirPathNow); //偵測檔案變化

                M.fileSort.readSortType(path); //取得該資料夾設定的檔案排序方式
                M.fileSort.updateMenu(); //更新menu選單
                arFile = await M.fileSort.sort(arFile);

                if (_dirGroupType === undefined) {
                    groupType = GroupType.img;
                    atLoadingExt = undefined;
                } else {
                    groupType = _dirGroupType;
                }
                atLoadingGroupType = groupType;

                let _arFile = await filter(atLoadingExt);

                //如果資料夾內沒有圖片，就直接當成「自訂名單」，然後載入所有檔案
                if (_arFile.length !== 0) {
                    arFile = _arFile;
                } else {
                    filterOfficeTemp(arFile);
                    fileLoadType = FileLoadType.userDefined;
                }

            } else if (fileInfo2.Type === "file") { //如果是檔案

                let _dirPath = Lib.GetDirectoryName(path); //取得檔案所在的資料夾路徑
                if (_dirPath === null) {
                    isLoadFileFinish = true;
                    return;
                }
                dirPathNow = _dirPath;
                groupType = fileToGroupType(fileInfo2);
                atLoadingGroupType = groupType;
                atLoadingExt = Lib.GetExtension(path);

                await WV_System.NewFileWatcher("fileList", dirPathNow); //偵測檔案變化

                arFile = [path];
                flagFile = 0;
                //M.mainFileList.init(); //檔案預覽視窗 初始化 
                if (isBulkView === false && noLoad === false) { //在讀取完資料夾名單前，先顯示圖片
                    await showFileUpdataImg(fileInfo2);
                    M.mainExif.init(fileInfo2, true); //初始化exif
                }
                arFile = await WebAPI.Directory.getFiles(dirPathNow, "*.*");
                arFile = await filter(Lib.GetExtension(path));
                if (arFile.indexOf(path) === -1) {
                    arFile.splice(0, 0, path);
                }

                M.fileSort.readSortType(dirPathNow); //取得該資料夾設定的檔案排序方式
                M.fileSort.updateMenu(); //更新menu選單
                arFile = await M.fileSort.sort(arFile);
            } else { //不存在

                M.fileShow.openWelcome();
                isLoadFileFinish = true;
                return;

            }

            //目前檔案位置
            flagFile = arFile.indexOf(path);
            isLoadFileFinish = true;
            M.mainFileList.setHide(false); //顯示檔案預覽視窗(必須顯示出物件才能計算高度)
            M.mainFileList.init(); //檔案預覽視窗 初始化
            M.mainFileList.setStartLocation(); //檔案預覽視窗 捲動到選中項目的中間
            //await showFile(); //載入圖片

            if (noLoad === false) {
                if (isBulkView) {
                    await showFile(); //載入圖片
                } else if (isFile) {
                    await showFileUpdataUI(); //載入圖片(僅更新檔案列表)
                } else {
                    await showFile(); //載入圖片
                }

                loadDir(dirPathNow); //處理資料夾預覽視窗
            }
        }

        /**
         * 取得目前檔案的路徑
         */
        function getFilePath() {
            let p = arFile[flagFile];
            return p;
        }

        /** 
         * 重新載入檔案預覽面板
         */
        function reloadFilePanel() {

            if (fileLoadType === FileLoadType.dir) {
                loadFile(getFilePath(), atLoadingExt, true);
            } else {
                M.mainFileList.init(); //檔案預覽視窗 初始化
                M.mainFileList.setStartLocation(); //檔案預覽視窗 捲動到選中項目的中間
            }

        }

        /**
         * 取得目前檔案的路徑 (如果是長路經，則自動轉成虛擬路徑)
         */
        async function getFileShortPath(path?: string) {
            if (path === undefined) {
                path = getFilePath();
            }
            //把長路經轉回虛擬路徑
            if (path.length > 255) {
                path = await WV_Path.GetShortPath(path);
            }
            return path;
        }

        /**
         * 取得名單類型
         */
        function getFileLoadType() {
            return fileLoadType;
        }

        /**
         * 
         */
        function getGroupType() {
            return groupType;
        }
        /**
         * 
         */
        function setGroupType(type: string) {
            groupType = type;
        }

        /**
         * 設定大量瀏覽模式是否啟用 (重新載入檔案才會生效)
         */
        function enableBulkView(val: boolean) {
            isBulkView = val;
        }


        var showFileThrottle = new Throttle(5); //節流
        /**
         * 載入圖片
         * @param _flag 
         */
        async function showFile(_flag?: number) {

            if (isBulkView === false && isBulkViewSub === false) {
                M.toolbarBack.visible(false); //隱藏返回按鈕
            }
            isBulkViewSub = false;

            if (isLoadFileFinish === false) {
                console.log("loadFile處理中");
                return;
            }
            if (arFile.length === 0) { //如果資料夾裡面沒有圖片
                Toast.show(M.i18n.t("msg.imageNotFound"), 1000 * 3); //未檢測到圖片     
                M.fileShow.openWelcome();
                showFileThrottle.run = async () => {
                    atLoadingDirParent = "";
                    arDir = {};
                    arDirKey = [];
                }
                return;
            }

            if (_flag !== undefined || _flag === -1) { flagFile = _flag; }
            if (flagFile < 0) { flagFile = 0; }
            if (flagFile >= arFile.length) { flagFile = arFile.length - 1; }

            let path = getFilePath();
            let fileInfo2 = await WebAPI.getFileInfo2(path);
            if (fileInfo2.Type !== "none") {
                M.mainExif.init(fileInfo2); //初始化exif
                await showFileUpdataUI();
            }
            await showFileUpdataImg(fileInfo2);
        }
        /** 更新 檔案預覽視窗 */
        async function showFileUpdataUI() {
            updateTitle(); //更新視窗標題
            M.mainFileList.select(); //設定檔案預覽視窗 目前選中的項目
            M.mainFileList.updateLocation(); //檔案預覽視窗 自動捲動到選中項目的地方
        }
        /** 更新 圖片 */
        async function showFileUpdataImg(fileInfo2: FileInfo2) {

            if (fileInfo2.Type === "none") { //如果檔案不存在
                arFile.splice(flagFile, 1); //刪除此筆
                M.mainFileList.init(); //檔案預覽視窗 初始化
                showFile(flagFile);
                showFileThrottle.run = async () => { }
                return;
            }

            updateTitle(); //更新視窗標題

            if (fileLoadType === FileLoadType.userDefined) { //如果是自訂名單
                groupType = fileToGroupType(fileInfo2); //從檔案類型判斷，要使用什麼用什麼類型來顯示
            }

            showFileThrottle.run = async () => {

                if (isBulkView) {
                    await M.fileShow.openBulkView();

                } else {

                    //把長路經轉回虛擬路徑，避免瀏覽器無法載入圖片
                    if (fileInfo2.Path.length > 255) {
                        fileInfo2.Path = await WV_Path.GetShortPath(fileInfo2.Path);
                    }

                    if (groupType === GroupType.img || groupType === GroupType.unknown) {
                        await M.fileShow.openImage(fileInfo2);
                    }
                    if (groupType === GroupType.video) {
                        await M.fileShow.openVideo(fileInfo2);
                    }
                    if (groupType === GroupType.pdf) {
                        await M.fileShow.openPdf(fileInfo2);
                    }
                    if (groupType === GroupType.txt) {
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
            if (isLoadFileFinish === false) {
                console.log("loadFile處理中");
                return;
            }
            if (groupType === GroupType.none || groupType === GroupType.welcome) {
                return;
            }
            flagFile += 1;
            if (flagFile >= arFile.length) { flagFile = 0; }
            showFile();
        }

        /**
         * 載入上一個檔案
         */
        async function prevFile() {
            if (isLoadFileFinish === false) {
                console.log("loadFile處理中");
                return;
            }
            if (groupType === GroupType.none || groupType === GroupType.welcome) {
                return;
            }
            flagFile -= 1;
            if (flagFile < 0) { flagFile = arFile.length - 1; }
            showFile();
        }

        /**
          * 更新視窗標題
          */
        function updateTitle() {
            if (isBulkView) {
                let filePath = getFilePath();
                if (filePath === undefined) { return; }
                let title = Lib.GetDirectoryName(filePath) ?? "";
                title = Lib.GetFileName(title);
                baseWindow.setTitle(title);
            } else {
                let filePath = getFilePath();
                if (filePath === undefined) { return; }
                let title = `「${flagFile + 1}/${arFile.length}」 ${Lib.GetFileName(filePath)}`;
                baseWindow.setTitle(title);
            }
        }

        /**
         * 從檔案類型判斷，要使用什麼用什麼類型來顯示
         * @returns GroupType
         */
        function fileToGroupType(fileInfo2: FileInfo2) {
            let fileExt = Lib.GetFileType(fileInfo2)
            return fileExtToGroupType(fileExt);
        }
        /**
         * 從副檔名判斷，要使用什麼用什麼類型來顯示
         * @returns GroupType
         */
        function fileExtToGroupType(fileExt: string) {

            for (var type in GroupType) {
                let allowFileType = M.config.allowFileType(type);
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
            let ar = [];
            for (let i = 0; i < arFile.length; i++) {
                let path = arFile[i];
                let fileExt = (Lib.GetExtension(path)).toLocaleLowerCase();
                let allowFileType = M.config.allowFileType(groupType);
                for (let j = 0; j < allowFileType.length; j++) {
                    const fileType = allowFileType[j];
                    if (fileExt == "." + fileType["ext"]) {
                        ar.push(path);
                        break;
                    }
                }
            }

            //如果是「office文件臨時檔」，就從名單內排除
            if (groupType === GroupType.pdf) {
                filterOfficeTemp(ar);
            }

            //如果載入的是未知類型的副檔名，則把其他相同副檔名的檔案也載入
            if (ar.length === 0) {
                if (extraExt !== undefined) {
                    let fileExt = extraExt.toLocaleLowerCase();
                    for (let i = 0; i < arFile.length; i++) {
                        let path = arFile[i];
                        if (fileExt == Lib.GetExtension(path).toLocaleLowerCase()) {
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
            let arOfficeExt = [".doc", ".docx", ".ppt", ".pptx"];
            for (let i = ar.length - 1; i >= 0; i--) {
                let path = ar[i];
                let fileExt = (Lib.GetExtension(path)).toLocaleLowerCase();
                let fileName = Lib.GetFileName(path);
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

            let path = getFilePath();

            //如果使用者關閉詢問視窗，則同一個檔案不再次詢問
            if (path === temp_reloadFilePath) { return; }

            M.msgbox.show({
                txt: M.i18n.t("msg.reloadFile"), //檔案已被修改，你要重新載入此檔案嗎？
                funcYes: async (dom: HTMLElement, inputTxt: string) => {
                    M.msgbox.close(dom);

                    if (fileType === "file") {
                        showFile(); //重新載入檔案
                    } else {
                        showDir(); //重新載入資料夾
                    }
                },
                funcClose: async (dom: HTMLElement) => {
                    M.msgbox.close(dom);
                    temp_reloadFilePath = path;
                }
            });

        }

        /**
         * 顯示 刪除檔案 的對話方塊
         */
        async function showDeleteFileMsg(type?: undefined | "delete" | "moveToRecycle", path?: string) {

            if (groupType === GroupType.none || groupType === GroupType.welcome) {
                return;
            }

            let _type;
            if (type === "delete") {
                _type = "2";
            } else {
                _type = "1";
            }
            if (path === undefined) {
                path = getFilePath();
            }

            //執行刪除
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
                    M.msgbox.show({ txt: M.i18n.t("msg.fileDeletionFailed") + "<br>" + err }); //檔案刪除失敗
                } else {

                    if (path === getFilePath() && isBulkView === false) {
                        let index = arFile.indexOf(path); //從名單移除這筆資料
                        if (index !== -1) {
                            arFile.splice(index, 1); //刪除此筆
                            M.mainFileList.init(); //檔案預覽視窗 初始化
                            await showFile(index);
                        }
                    }

                    //如果是自定義名單，就主動觸發檔案變更的事件
                    if (fileLoadType === FileLoadType.userDefined) {
                        let fwd: FileWatcherData = {
                            Key: "fileList",
                            FullPath: path,
                            OldFullPath: "",
                            ChangeType: "deleted",
                            FileType: "file"
                        };
                        baseWindow.onFileWatcher([fwd]);
                    }

                    if (value == "1") {
                        Toast.show(M.i18n.t("msg.fileToRecycleBinCompleted"), 1000 * 3); //已將檔案「移至資源回收桶」
                    } else {
                        Toast.show(M.i18n.t("msg.fileToPermanentlyDeleteCompleted"), 1000 * 3); //已將檔案「永久刪除」
                    }
                }
            }

            if (M.config.settings.other.fileDeletingShowCheckMsg) {
                M.msgbox.show({
                    type: "radio",
                    txt: `
                        <div class="msgbox-title">${M.i18n.t("msg.deleteFile")}</div>
                        <div style="word-break:break-all;">${Lib.GetFileName(path)}</div>
                    `, //刪除檔案
                    arRadio: [
                        { value: "1", name: M.i18n.t("msg.fileToRecycleBin") }, //移至資源回收桶
                        { value: "2", name: M.i18n.t("msg.fileToPermanentlyDelete") }, //永久刪除檔案
                    ],
                    radioValue: _type,
                    funcYes: async (dom: HTMLElement, value: string) => {
                        M.msgbox.close(dom);
                        await runDelete(value);
                    }
                });

            } else {

                await runDelete(_type);

            }

        }

        /**
         * 顯示 刪除資料夾 的對話方塊
         */
        async function showDeleteDirMsg(type?: undefined | "delete" | "moveToRecycle", path?: string) {

            if (groupType === GroupType.none || groupType === GroupType.welcome) {
                return;
            }

            let _type;
            if (type === "delete") {
                _type = "2";
            } else {
                _type = "1";
            }

            if (path === undefined) {
                path = getDirPath();
            }

            //執行刪除
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
                    M.msgbox.show({ txt: M.i18n.t("msg.fileDeletionFailed") + "<br>" + err }); //檔案刪除失敗
                } else {
                    if (path === getDirPath()) {
                        await showDir();
                    } else {
                        delete arDir[path]; //刪除此筆
                        arDirKey = Object.keys(arDir);

                        //showDir();
                        //_showDir = async () => { };
                        //updateFlagDir(dirPath);
                        M.mainDirList.init(); //資料夾預覽視窗 初始化
                        //M.mainDirList.select(); //
                        //M.mainDirList.updateLocation(); //
                    }


                    if (value == "1") {
                        Toast.show(M.i18n.t("msg.fileToRecycleBinCompleted"), 1000 * 3); //已將檔案「移至資源回收桶」
                    } else {
                        Toast.show(M.i18n.t("msg.fileToPermanentlyDeleteCompleted"), 1000 * 3); //已將檔案「永久刪除」
                    }
                    //M.mainFileList.init(); //檔案預覽視窗 初始化
                    //M.mainFileList.select(); //設定 檔案預覽視窗 目前選中的項目
                    //M.mainFileList.updateLocation(); //檔案預覽視窗 自動捲動到選中項目的地方  
                }
            }

            if (M.config.settings.other.fileDeletingShowCheckMsg) {
                M.msgbox.show({
                    type: "radio",
                    txt: `
                        <div class="msgbox-title">${M.i18n.t("msg.deleteDir")}</div>
                        <div style="word-break:break-all;">${Lib.GetFileName(path)}</div>
                    `, //刪除資料夾
                    arRadio: [
                        { value: "1", name: M.i18n.t("msg.fileToRecycleBin") }, //移至資源回收桶
                        { value: "2", name: M.i18n.t("msg.fileToPermanentlyDelete") }, //永久刪除檔案
                    ],
                    radioValue: _type,
                    funcYes: async (dom: HTMLElement, value: string) => {
                        M.msgbox.close(dom);
                        await runDelete(value);
                    }
                });

            } else {

                await runDelete(_type);

            }

        }

        /**
         * 顯示 重新命名檔案 的對話方塊
         */
        async function showRenameFileMsg(path?: string) {

            if (groupType === GroupType.none || groupType === GroupType.welcome) {
                return;
            }

            if (path === undefined) {
                path = getFilePath();
            }
            let fileName = Lib.GetFileName(path);

            let msg = M.msgbox.show({
                txt: `<div class="msgbox-title">${M.i18n.t("msg.renameFile")}</div>`, //重新命名檔案
                type: "text",
                inputTxt: fileName,
                funcYes: async (dom: HTMLElement, inputTxt: string) => {
                    if (path === undefined) { return; }

                    if (inputTxt.trim() === "") {
                        M.msgbox.show({ txt: M.i18n.t("msg.nameIsEmpty") }); //必須輸入檔名
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
                    let dirPath = Lib.GetDirectoryName(path);
                    if (dirPath === null) {
                        M.msgbox.show({ txt: M.i18n.t("msg.renamingFailure") + M.i18n.t("msg.wrongPath") }); //重新命名失敗：路徑異常
                        return;
                    }

                    let newName = Lib.Combine([dirPath, inputTxt]);
                    let err = await WV_File.Move(path, newName);
                    if (err != "") {
                        M.msgbox.show({ txt: M.i18n.t("msg.renamingFailure") + "<br>" + err }); //重新命名失敗：
                        return;
                    }

                    /*if (path === getFilePath() && isBulkView === false) {
                        arFile[flagFile] = newName;
                        updateTitle();
                        showFile(); //重新載入檔案
                        M.mainFileList.init(); //檔案預覽視窗 初始化
                    }*/
                    //檔案重新命名後會觸發fileWatcher，所以不需要處理

                    //如果是自定義名單，就主動觸發檔案變更的事件
                    if (fileLoadType === FileLoadType.userDefined) {
                        let fwd: FileWatcherData = {
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

            const len = fileName.length - Lib.GetExtension(path).length;
            msg.domInput.setSelectionRange(0, len);
        }

        /**
          * 顯示 重新命名資料夾 的對話方塊
          */
        async function showRenameDirMsg(path?: string) {

            if (groupType === GroupType.none || groupType === GroupType.welcome) {
                return;
            }

            if (path === undefined) {
                path = getDirPath();
            }
            let fileName = Lib.GetFileName(path);

            let msg = M.msgbox.show({
                txt: `<div class="msgbox-title">${M.i18n.t("msg.renameDir")}</div>`, //重新命名資料夾
                type: "text",
                inputTxt: fileName,
                funcYes: async (dom: HTMLElement, inputTxt: string) => {
                    if (path === undefined) { return; }

                    if (inputTxt.trim() === "") {
                        M.msgbox.show({ txt: M.i18n.t("msg.nameIsEmpty") }); //必須輸入檔名
                        return;
                    }
                    if (inputTxt.search(/[\\]|[/]|[:]|[*]|[?]|["]|[<]|[>]|[|]/) !== -1) {
                        M.msgbox.show({ txt: M.i18n.t("msg.nameContainsUnavailableChar") + "<br>" + "\\ / : * ? \" < > |" }); //檔案名稱不可以包含下列任意字元
                        return;
                    }
                    if (fileName == inputTxt) {
                        M.msgbox.close(dom);
                        return;
                    }
                    let dirPath = Lib.GetDirectoryName(path);
                    if (dirPath === null) {
                        M.msgbox.show({ txt: M.i18n.t("msg.renamingFailure") + M.i18n.t("msg.wrongPath") }); //重新命名失敗：路徑異常
                        return;
                    }

                    let newName = Lib.Combine([dirPath, inputTxt]);
                    let err = await WV_Directory.Move(path, newName);
                    if (err !== "") {
                        M.msgbox.show({ txt: M.i18n.t("msg.renamingFailure") + "<br>" + err }); //重新命名失敗：
                        return;
                    }

                    let isReload = path === getDirPath(); //判斷是否為當前顯示的資料夾

                    arDir = changeKey(arDir, path, newName);
                    arDirKey = Object.keys(arDir);

                    M.mainDirList.init();

                    if (isReload) {
                        //showDir();
                        //載入新資料夾內的同一張圖片
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
            await WV_System.NewFileWatcher("fileList", ""); //偵測檔案變化
            await WV_System.NewFileWatcher("dirList", ""); //偵測資料夾變化
        }

        //偵測檔案變化 - 資料夾預覽面板
        baseWindow.fileWatcherEvents.push((arData: FileWatcherData[]) => {

            arData.forEach(async data => {

                if (data.Key !== "dirList") { return; }
                if (data.FileType === "file") { return; }

                if (data.ChangeType === "deleted") { //刪除檔案

                    let flag = arDirKey.indexOf(data.FullPath);

                    if (flag !== -1) {

                        let path = arDirKey[flag];
                        let p = getDirPath();
                        delete arDir[path]; //刪除此筆
                        arDirKey = Object.keys(arDir);
                        flagDir = arDirKey.indexOf(p); //更新當前檔案位置

                        M.mainDirList.init(); //資料夾預覽視窗 初始化

                        if (data.FullPath === getDirPath()) {
                            showReloadFileMsg("delete", "dir");
                        }

                    } else {
                        return;
                    }

                } else if (data.ChangeType === "renamed") { //檔案重新命名

                    let flag = arDirKey.indexOf(data.OldFullPath);
                    if (flag !== -1) { //名單中存在
                        arFile[flag] = data.FullPath;

                        arDir = changeKey(arDir, data.OldFullPath, data.FullPath);
                        arDirKey = Object.keys(arDir);

                        M.mainDirList.init();
                        if (data.OldFullPath === getDirPath()) {

                            if (isBulkView) {
                                showReloadFileMsg("reload", "dir");
                            } else {
                                //showDir();
                                //載入新資料夾內的同一張圖片
                                let p = getFilePath();
                                p = p.replace(data.OldFullPath, data.FullPath);
                                loadFile(p);
                            }

                        }

                    } else {
                        //data.ChangeType = "created";
                    }

                } else if (data.ChangeType === "changed") { //檔案被修改

                }

                else if (data.ChangeType === "created") { //新增檔案

                }



            });

        })

        //偵測檔案變化 - 檔案預覽面板
        baseWindow.fileWatcherEvents.push((arData: FileWatcherData[]) => {

            if (isBulkView) { return; }

            let isMainFileListInit = false; //檔案預覽視窗 初始化
            let isUpdateTitle = false; //更新視窗標題
            let isShowReloadFileMsgDelete = false; //顯示 重新載入檔案 的對話方塊
            let isShowReloadFileMsgReload = false; //顯示 重新載入檔案 的對話方塊
            let isShowFile = false; //重新載入檔案

            arData.forEach(async data => {

                if (data.Key !== "fileList") { return; }

                M.mainExif.updateFileWatcher(data);

                if (data.ChangeType === "deleted") { //刪除檔案

                    if (data.FullPath === getFilePath()) {

                        isShowReloadFileMsgDelete = true; //顯示 重新載入檔案 的對話方塊

                    } else {

                        let flag = arFile.indexOf(data.FullPath);
                        if (flag !== -1) {
                            let p = getFilePath();
                            arFile.splice(flag, 1); //刪除此筆
                            flagFile = arFile.indexOf(p); //更新當前檔案位置
                            isMainFileListInit = true; //檔案預覽視窗 初始化
                            isUpdateTitle = true; //更新視窗標題
                        } else {
                            return;
                        }

                    }

                } else if (data.ChangeType === "renamed") { //檔案重新命名

                    if (data.FileType === "dir") { return; }

                    let flag = arFile.indexOf(data.OldFullPath);
                    if (flag !== -1) { //名單中存在
                        if (data.OldFullPath === getFilePath()) { //當前開啟
                            arFile[flag] = data.FullPath;
                            isUpdateTitle = true; //更新視窗標題
                            isShowFile = true; //重新載入檔案
                        } else {
                            arFile[flag] = data.FullPath;
                        }
                        isMainFileListInit = true; //檔案預覽視窗 初始化
                    } else {
                        data.ChangeType = "created";
                    }

                } else if (data.ChangeType === "changed") { //檔案被修改

                    if (groupType === GroupType.img && data.FullPath === getFilePath()) {
                        isShowReloadFileMsgReload = true; //顯示 重新載入檔案 的對話方塊
                    } else {
                        return;
                    }

                }

                if (data.ChangeType === "created") { //新增檔案

                    if (data.FileType !== "file") { return; }
                    if (arFile.indexOf(data.FullPath) !== -1) { return; } //如果檔案已經存在於列表中

                    let fileExt = Lib.GetExtension(data.FullPath).replace(".", ""); //取得副檔名
                    let gt = fileExtToGroupType(fileExt); //根據副檔名判斷GroupType
                    if (groupType === gt) {

                        //判斷要插入到最前面還是最後面
                        let isEnd = false;
                        let whenInsertingFile = M.config.settings.other.whenInsertingFile;
                        if (whenInsertingFile === "end") {
                            isEnd = true;
                        } else if (whenInsertingFile === "auto" && M.fileSort.getOrderbyType() === "asc") {
                            isEnd = true;
                        }
                        if (isEnd) {
                            arFile.push(data.FullPath);
                        } else {
                            let p = getFilePath();
                            arFile.unshift(data.FullPath);
                            flagFile = arFile.indexOf(p); //更新當前檔案位置
                        }

                        isMainFileListInit = true; //檔案預覽視窗 初始化
                        isUpdateTitle = true; //更新視窗標題
                    } else {
                        return;
                    }

                }

            });

            if (isMainFileListInit) {
                M.mainFileList.init(); //檔案預覽視窗 初始化
            }
            if (isUpdateTitle) {
                updateTitle(); //更新視窗標題
            }
            if (isShowReloadFileMsgDelete) {
                showReloadFileMsg("delete", "file"); //顯示 重新載入檔案 的對話方塊
            } else if (isShowReloadFileMsgReload) {
                showReloadFileMsg("reload", "file"); //顯示 重新載入檔案 的對話方塊
            } else if (isShowFile) {
                showFile(); //重新載入檔案
            }
        })

        //偵測檔案變化 - 大量瀏覽模式
        baseWindow.fileWatcherEvents.push((arData: FileWatcherData[]) => {

            if (isBulkView === false) { return; }

            arData.forEach(async data => {

                if (data.Key !== "fileList") { return; }

                if (data.ChangeType === "deleted") { //刪除檔案

                    let flag = arFile.indexOf(data.FullPath);
                    if (flag !== -1) {
                        arFile.splice(flag, 1); //刪除此筆
                    } else {
                        return;
                    }

                } else if (data.ChangeType === "renamed") { //檔案重新命名

                    if (data.FileType === "dir") { return; }

                    let flag = arFile.indexOf(data.OldFullPath);
                    if (flag !== -1) { //名單中存在
                        arFile[flag] = data.FullPath;
                    } else {
                        data.ChangeType = "created";
                    }

                } else if (data.ChangeType === "changed") { //檔案被修改

                }

                if (data.ChangeType === "created") { //新增檔案

                    if (data.FileType !== "file") { return; }
                    if (arFile.indexOf(data.FullPath) !== -1) { return; } //如果檔案已經存在於列表中

                    let fileExt = Lib.GetExtension(data.FullPath).replace(".", ""); //取得副檔名
                    let gt = fileExtToGroupType(fileExt); //根據副檔名判斷GroupType
                    if (groupType === gt) {

                        //判斷要插入到最前面還是最後面
                        let isEnd = false;
                        let whenInsertingFile = M.config.settings.other.whenInsertingFile;
                        if (whenInsertingFile === "end") {
                            isEnd = true;
                        } else if (whenInsertingFile === "auto" && M.fileSort.getOrderbyType() === "asc") {
                            isEnd = true;
                        }
                        if (isEnd) {
                            arFile.push(data.FullPath);
                        } else {
                            arFile.unshift(data.FullPath);
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


