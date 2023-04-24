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

    public loadDropFile;
    public loadFile;
    public loadFiles;

    public nextFile;
    public prevFile;
    public showFile;
    public getFilePath;
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

        /** 目前的資料夾路徑 */
        var dirPath: string = "";
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

        this.loadDropFile = loadDropFile;
        this.loadFile = loadFile;
        this.loadFiles = loadFiles;
        this.nextFile = nextFile;
        this.prevFile = prevFile;
        this.showFile = showFile;
        this.getFilePath = getFilePath;
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

        //#region Dir

        /**
         * 取得當前資料夾
         * @returns 
         */
        function getDirPath() {
            return arDirKey[flagDir];
        }


        /**
         * 重新計算 flagDir
         * @param _dirPath 
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
            await initDirList(dirPath);//取得資料夾名單
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
         * 檔案預覽視窗初始化 (重新讀取列表
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
            let json = await WebAPI.Directory.getSiblingDir(dirPath, arExt, maxCount);

            if (dirPath !== _dirPath) { return; }

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


        //以定時的方式執行 show() ，如果在圖片載入完成前接受到多次指令，則只會執行最後一個指令
        var _showDir = async () => { };
        async function timerDir() {
            let func = _showDir;
            _showDir = async () => { };
            await func();

            setTimeout(() => { timerDir(); }, 5);  //遞迴
        }
        timerDir();

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

            if (arDirKey.length === 0) {//如果已經沒有沒有資料夾
                //M.fileShow.openWelcome();
                //_show = async () => { }
                _showDir = async () => { };
                return;
            }

            let path = arDirKey[flagDir];

            if (await WV_Directory.Exists(path) === false) {//如果資料夾不存在
                delete arDir[path];//刪除此筆
                arDirKey = Object.keys(arDir);

                showDir(_flag);
                //_showDir = async () => { };
                //updateFlagDir(dirPath);
                M.mainDirList.init();//資料夾預覽視窗 初始化
                //M.mainDirList.select();//
                //M.mainDirList.updateLocation();//
                return;
            }

            //更新UI
            await updateFlagDir(path);//重新計算 flagDir
            M.mainDirList.select();//
            M.mainDirList.updateLocation();//

            _showDir = async () => {
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

            dirPath = _dirPath;

            if (await isUpdateDirList(_dirPath)) {//載入不同資料夾，需要重新讀取

                clearDir();
                await initDirList(_dirPath);//取得資料夾名單

                let dirParentPath = Lib.GetDirectoryName(_dirPath);//使用 父親資料夾 當做key來取得排序
                if (dirParentPath === null) {
                    dirParentPath = _dirPath;
                }
                M.dirSort.readSortType(dirParentPath);//取得該資料夾設定的檔案排序方式
                M.dirSort.updateMenu();//更新menu選單
                await M.dirSort.sort();

                await updateFlagDir(_dirPath);//重新計算 flagDir
                M.mainDirList.init();
                M.mainDirList.setStartLocation();//資料夾預覽視窗 捲動到選中項目的中間

            } else {//直接從 資料夾預覽視窗 切換，不需要重新讀取
                await updateFlagDir(_dirPath);//重新計算 flagDir
                M.mainDirList.select();//
                M.mainDirList.updateLocation();//
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

            M.msgbox.closeAll();//關閉所有訊息視窗
            M.menu.close();

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

            fileLoadType = FileLoadType.userDefined;//名單類型，自訂義

            //改用C#處理，增加執行效率
            arFile = await WebAPI.Directory.getFiles2(dirPath, arName);

            /*if (await WV_File.Exists(DirPath) === true) {
                DirPath = await WV_Path.GetDirectoryName(DirPath);
            }*/
            /*if (arName.length > 0) {
                for (let i = 0; i < arName.length; i++) {
                    let item = arName[i];
                    let filePath =  WV_Path.Combine([dirPath, item]);
                    if (await WV_File.Exists(filePath)) {//如果是檔案
                        arWaitingList.push(filePath);

                    } else if (await WV_Directory.Exists(filePath)) {//如果是資料夾
                        let arFile = await WV_Directory.GetFiles(filePath, "*.*");//取得資料夾內所有檔案
                        for (let j = 0; j < arFile.length; j++) {
                            arWaitingList.push(arFile[j]);
                        }
                    }
                }
            }*/

            let path = arFile[0];//以拖曳進來的第一個檔案為開啟對象

            let fileInfo2 = await WebAPI.getFileInfo2(path);
            atLoadingGroupType = fileToGroupType(fileInfo2);
            atLoadingExt = Lib.GetExtension(path);

            M.fileSort.readSortType(dirPath);//取得該資料夾設定的檔案排序方式
            M.fileSort.updateMenu();//更新menu選單
            arFile = await M.fileSort.sort(arFile);

            //目前檔案位置
            flagFile = 0;
            for (let i = 0; i < arFile.length; i++) {
                if (arFile[i] == path) {
                    flagFile = i;
                    break;
                }
            }

            M.mainFileList.setHide(false);//顯示檔案預覽視窗(必須顯示出物件才能計算高度)
            M.mainFileList.init();//檔案預覽視窗 初始化
            M.mainFileList.setStartLocation();//檔案預覽視窗 捲動到選中項目的中間
            await showFile();//載入圖片

            loadDir(dirPath);//處理資料夾預覽視窗
        }


        /**
         * 載入單一檔案
         * @param path 
         */
        async function loadFile(path: string, _dirGroupType?: string) {

            if (isLoadFileFinish === false) {
                console.log("loadFile處理中");
                return;
            }
            isLoadFileFinish = false;

            fileLoadType = FileLoadType.dir;//名單類型，資料夾內的檔案

            let fileInfo2 = await WebAPI.getFileInfo2(path);
            let dirPath = "";
            arFile = [];

            let isFile = true;

            if (fileInfo2.Type === "dir") {//如果是資料夾

                isFile = false;

                dirPath = path;
                arFile = await WebAPI.Directory.getFiles(path, "*.*");//取得資料夾內所有檔案

                M.fileSort.readSortType(path);//取得該資料夾設定的檔案排序方式
                M.fileSort.updateMenu();//更新menu選單
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

            } else if (fileInfo2.Type === "file") {//如果是檔案

                let _dirPath = Lib.GetDirectoryName(path);//取得檔案所在的資料夾路徑
                if (_dirPath === null) { return; }
                dirPath = _dirPath;
                groupType = fileToGroupType(fileInfo2);
                atLoadingGroupType = groupType;
                atLoadingExt = Lib.GetExtension(path);

                arFile = [path];
                flagFile = 0;
                //M.mainFileList.init();//檔案預覽視窗 初始化 
                if (isBulkView === false) {
                    await showFileUpdataImg(fileInfo2);
                    M.mainExif.init(fileInfo2, true);//初始化exif
                }
                arFile = await WebAPI.Directory.getFiles(dirPath, "*.*");
                arFile = await filter(Lib.GetExtension(path));
                if (arFile.indexOf(path) === -1) {
                    arFile.splice(0, 0, path);
                }

                M.fileSort.readSortType(dirPath);//取得該資料夾設定的檔案排序方式
                M.fileSort.updateMenu();//更新menu選單
                arFile = await M.fileSort.sort(arFile);
            }

            //目前檔案位置
            flagFile = 0;
            for (let i = 0; i < arFile.length; i++) {
                if (arFile[i] === path) {
                    flagFile = i;
                    break;
                }
            }
            isLoadFileFinish = true;
            M.mainFileList.setHide(false);//顯示檔案預覽視窗(必須顯示出物件才能計算高度)
            M.mainFileList.init();//檔案預覽視窗 初始化
            M.mainFileList.setStartLocation();//檔案預覽視窗 捲動到選中項目的中間
            //await showFile();//載入圖片

            if (isBulkView) {
                await showFile(); //載入圖片
            } else if (isFile) {
                await showFileUpdataUI();//載入圖片(僅更新檔案列表)
            } else {
                await showFile(); //載入圖片
            }

            loadDir(dirPath);//處理資料夾預覽視窗

        }


        /**
         * 取得目前檔案的路徑
         * @returns 
         */
        function getFilePath() {
            let p = arFile[flagFile];
            return p;
        }


        /**
         * 取得名單類型
         * @returns 
         */
        function getFileLoadType() {
            return fileLoadType;
        }

        //以定時的方式執行 show() ，如果在圖片載入完成前接受到多次指令，則只會執行最後一個指令
        var _showFile = async () => { };
        async function timerFile() {
            let func = _showFile;
            _showFile = async () => { };
            await func();

            setTimeout(() => { timerFile(); }, 5);  //遞迴
        }
        timerFile();


        /**
         * 載入圖片
         * @param _flag 
         */
        async function showFile(_flag?: number) {
            
            M.toolbarBack.visible(false); //隱藏返回按鈕

            if (isLoadFileFinish === false) {
                console.log("loadFile處理中");
                return;
            }
            if (arFile.length === 0) {//如果資料夾裡面沒有圖片
                Toast.show(M.i18n.t("msg.imageNotFound"), 1000 * 3); //未找到圖片
                M.fileShow.openWelcome();
                _showFile = async () => { }
                return;
            }

            if (_flag !== undefined) { flagFile = _flag; }
            if (flagFile < 0) { flagFile = 0; }
            if (flagFile >= arFile.length) { flagFile = arFile.length - 1; }

            let path = getFilePath();
            let fileInfo2 = await WebAPI.getFileInfo2(path);
            M.mainExif.init(fileInfo2); //初始化exif

            await showFileUpdataUI();
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
                _showFile = async () => { }
                return;
            }

            updateTitle(); //更新視窗標題

            if (fileLoadType === FileLoadType.userDefined) { //如果是自訂名單
                groupType = fileToGroupType(fileInfo2); //從檔案類型判斷，要使用什麼用什麼類型來顯示
            }

            _showFile = async () => {

                if (isBulkView) {
                    await M.fileShow.openBulkView();
                } else {
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
         * 
         */
        function enableBulkView(val: boolean) {
            isBulkView = val;
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
         * @returns 
         */
        function fileToGroupType(fileInfo2: FileInfo2) {

            let fileExt = Lib.GetFileType(fileInfo2)

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

        function getGroupType() {
            return groupType;
        }
        function setGroupType(type: string) {
            groupType = type;
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


        /**
         * 顯示 刪除檔案 的對話方塊
         */
        async function showDeleteFileMsg() {

            if (groupType === GroupType.none || groupType === GroupType.welcome) {
                return;
            }

            //執行刪除
            async function runDelete(value: string) {
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
                    await showFile();

                    if (value == "1") {
                        Toast.show(M.i18n.t("msg.fileToRecycleBinCompleted"), 1000 * 3); //已將檔案「移至資源回收桶」
                    } else {
                        Toast.show(M.i18n.t("msg.fileToPermanentlyDeleteCompleted"), 1000 * 3); //已將檔案「永久刪除」
                    }
                    //M.mainFileList.init();//檔案預覽視窗 初始化
                    //M.mainFileList.select();//設定 檔案預覽視窗 目前選中的項目
                    //M.mainFileList.updateLocation();//檔案預覽視窗 自動捲動到選中項目的地方  
                }
            }

            let path = getFilePath();

            if (M.config.settings.other.fileDeletingShowCheckMsg) {
                M.msgbox.show({
                    type: "radio",
                    txt: M.i18n.t("msg.deleteFile") + "<br>" +
                        `<span style="word-break:break-all;">${Lib.GetFileName(path)}</span>`, //刪除檔案
                    arRadio: [
                        { value: "1", name: M.i18n.t("msg.fileToRecycleBin") }, //移至資源回收桶
                        { value: "2", name: M.i18n.t("msg.fileToPermanentlyDelete") }, //永久刪除檔案
                    ],
                    radioValue: "1",
                    funcYes: async (dom: HTMLElement, value: string) => {
                        M.msgbox.close(dom);
                        await runDelete(value);//
                    }
                });

            } else {

                await runDelete("1");

            }

        }

        /**
         * 顯示 刪除資料夾 的對話方塊
         */
        async function showDeleteDirMsg() {

            if (groupType === GroupType.none || groupType === GroupType.welcome) {
                return;
            }

            //執行刪除
            async function runDelete(value: string) {
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
                    await showDir();

                    if (value == "1") {
                        Toast.show(M.i18n.t("msg.fileToRecycleBinCompleted"), 1000 * 3); //已將檔案「移至資源回收桶」
                    } else {
                        Toast.show(M.i18n.t("msg.fileToPermanentlyDeleteCompleted"), 1000 * 3); //已將檔案「永久刪除」
                    }
                    //M.mainFileList.init();//檔案預覽視窗 初始化
                    //M.mainFileList.select();//設定 檔案預覽視窗 目前選中的項目
                    //M.mainFileList.updateLocation();//檔案預覽視窗 自動捲動到選中項目的地方  
                }
            }

            let path = getDirPath();

            if (M.config.settings.other.fileDeletingShowCheckMsg) {
                M.msgbox.show({
                    type: "radio",
                    txt: M.i18n.t("msg.deleteFile") + "<br>" +
                        `<span style="word-break:break-all;">${Lib.GetFileName(path)}</span>`, //刪除檔案
                    arRadio: [
                        { value: "1", name: M.i18n.t("msg.fileToRecycleBin") }, //移至資源回收桶
                        { value: "2", name: M.i18n.t("msg.fileToPermanentlyDelete") }, //永久刪除檔案
                    ],
                    radioValue: "1",
                    funcYes: async (dom: HTMLElement, value: string) => {
                        M.msgbox.close(dom);
                        await runDelete(value);
                    }
                });

            } else {

                await runDelete("1");

            }

        }


        /**
         * 顯示 重新命名檔案 的對話方塊
         */
        async function showRenameFileMsg() {

            if (groupType === GroupType.none || groupType === GroupType.welcome) {
                return;
            }

            let path = getFilePath();
            let fileName = Lib.GetFileName(path);

            let msg = M.msgbox.show({
                txt: M.i18n.t("msg.renameFile"), //重新命名檔案
                type: "text",
                inputTxt: fileName,
                funcYes: async (dom: HTMLElement, inputTxt: string) => {
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

                    arFile[flagFile] = newName;
                    M.mainFileList.init();//檔案預覽視窗 初始化
                    showFile(); //重新載入檔案
                    //updateTitle();
                    //M.mainFileList.init();//檔案預覽視窗 初始化
                    //M.mainFileList.select();//設定 檔案預覽視窗 目前選中的項目
                    //M.mainFileList.updateLocation();//檔案預覽視窗 自動捲動到選中項目的地方  

                    M.msgbox.close(dom);
                }
            });

            const len = fileName.length - Lib.GetExtension(path).length;
            msg.domInput.setSelectionRange(0, len);
        }

        /**
          * 顯示 重新命名資料夾 的對話方塊
          */
        async function showRenameDirMsg() {

            if (groupType === GroupType.none || groupType === GroupType.welcome) {
                return;
            }

            let path = getDirPath();
            let fileName = Lib.GetFileName(path);

            let msg = M.msgbox.show({
                txt: M.i18n.t("msg.renameFile"), //重新命名檔案
                type: "text",
                inputTxt: fileName,
                funcYes: async (dom: HTMLElement, inputTxt: string) => {
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

                    arDir = changeKey(arDir, path, newName);
                    arDirKey = Object.keys(arDir);

                    M.mainDirList.init()
                    showDir();

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


