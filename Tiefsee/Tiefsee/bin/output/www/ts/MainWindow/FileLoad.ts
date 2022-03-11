
/**
 * 開啟檔案
 */
class FileLoad {

    public getWaitingFile: () => string[];
    public setWaitingFile: (ar: string[]) => void;
    public getFlagFile: () => number;
    public setFlagFile: (n: number) => void;

    public getWaitingDir
    //public setWaitingDir
    public getFlagDir
    public setFlagDir
    public getWaitingDirKey

    public loadFile;
    public loadFiles;

    public nextFile;
    public prevFile;
    public showFile;
    public getFilePath;
    public getGroupType;
    public setGroupType;
    public getFileLoadType;
    public deleteMsg;
    public renameMsg;
    public updateTitle;

    public showDir

    //public setSort;

    constructor(M: MainWindow) {

        /** unknown=未知 img=圖片  pdf=pdf、ai  movie=影片  imgs=多幀圖片  txt=文字 */
        var groupType: string = "img";
        var fileLoadType: FileLoadType //資料夾或自定名單
        var arFile: string[] = [];//待載入名單
        var flagFile: number;//目前在哪一張圖片

        var dirPath: string = "";
        var arDir: { [key: string]: string[] } = {};
        var arDirKey: string[] = [];
        var flagDir: number;//目前在哪一個資料夾

        this.getWaitingFile = () => { return arFile; };
        this.setWaitingFile = (ar: string[]) => { arFile = ar };
        this.getFlagFile = () => { return flagFile; };
        this.setFlagFile = (n: number) => { flagFile = n };

        this.getWaitingDir = () => { return arDir; };
        //this.setWaitingDir = (ar: string[]) => { arDir = ar };
        this.getWaitingDirKey = () => { return arDirKey; };
        this.getFlagDir = () => { return flagDir; };
        this.setFlagDir = (n: number) => { flagDir = n };

        this.loadFile = loadFile;
        this.loadFiles = loadFiles;
        this.nextFile = nextFile;
        this.prevFile = prevFile;
        this.showFile = showFile;
        this.getFilePath = getFilePath;
        this.getGroupType = getGroupType;
        this.setGroupType = setGroupType;
        this.getFileLoadType = getFileLoadType;
        this.deleteMsg = deleteMsg;
        this.renameMsg = renameMsg;
        this.updateTitle = updateTitle;

        this.showDir = showDir
        //this.setSort = setSort;



        function initFlagDir() {




        }


        var temp_dirParent = ""

        /**
         * 檔案預覽列表初始化 (重新讀取列表
         */
        async function initDirList(_dirPath: string) {


            if (dirPath === _dirPath) { return; }
            dirPath = _dirPath;

            let dirParent = await WV_Path.GetDirectoryName(_dirPath)

            if (temp_dirParent == dirParent) {
                return;
            }
            temp_dirParent = dirParent

            let json = await WV_Directory.GetSiblingDir(dirPath, ["jpg", "png"]);

            if (dirPath !== _dirPath) { return; }

            arDir = JSON.parse(json);
            arDirKey = Object.keys(arDir);

            for (let i = 0; i < arDirKey.length; i++) {
                const path = arDirKey[i];
                if (path === _dirPath) {
                    flagDir = i;
                    break;
                }
            }

            M.mainDirList.initDirList();
            M.mainDirList.setStartLocation();//資料夾預覽列表 捲動到選中項目的中間

        }






        /**
         * 載入檔案陣列
         * @param dirPath 
         * @param arName 
         */
        async function loadFiles(dirPath: string, arName: string[] = []) {

            fileLoadType = FileLoadType.userDefined;//名單類型，自定義

            //改用C#處理，增加執行效率
            arFile = await WV_Directory.GetFiles2(dirPath, arName);

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

            M.fileSort.sortType = M.fileSort.getFileSortType(dirPath);//取得該資料夾設定的檔案排序方式
            M.fileSort.setFileSortMenu(M.fileSort.sortType);//更新menu選單
            arFile = await M.fileSort.sort(arFile, M.fileSort.sortType);

            //目前檔案位置
            flagFile = 0;
            for (let i = 0; i < arFile.length; i++) {
                if (arFile[i] == path) {
                    flagFile = i;
                    break;
                }
            }

            M.mainFileList.initFileList();//檔案預覽列表 初始化
            await showFile();//載入圖片
            M.mainFileList.setStartLocation();//檔案預覽列表 捲動到選中項目的中間
        }


        /**
         * 載入單一檔案
         * @param path 
         */
        async function loadFile(path: string) {

            fileLoadType = FileLoadType.dir;//名單類型，資料夾內所有檔案

            let dirPath = "";
            arFile = [];

            if (await WV_Directory.Exists(path) === true) {//如果是資料夾

                dirPath = path;
                arFile = await WV_Directory.GetFiles(path, "*.*");//取得資料夾內所有檔案

                M.fileSort.sortType = M.fileSort.getFileSortType(path);//取得該資料夾設定的檔案排序方式
                M.fileSort.setFileSortMenu(M.fileSort.sortType);//更新menu選單
                arFile = await M.fileSort.sort(arFile, M.fileSort.sortType);
                groupType = GroupType.img;
                //groupType = await fileToGroupType(arWaitingList[0])
                arFile = await filter();

            } else if (await WV_File.Exists(path) === true) {//如果是檔案

                dirPath = await WV_Path.GetDirectoryName(path);//取得檔案所在的資料夾路徑
                arFile = await WV_Directory.GetFiles(dirPath, "*.*");

                let fileInfo2 = await Lib.GetFileInfo2(path);
                groupType = fileToGroupType(fileInfo2)
                arFile = await filter();
                if (arFile.indexOf(path) === -1) {
                    arFile.splice(0, 0, path);
                }

                M.fileSort.sortType = M.fileSort.getFileSortType(dirPath);//取得該資料夾設定的檔案排序方式
                M.fileSort.setFileSortMenu(M.fileSort.sortType);//更新menu選單
                arFile = await M.fileSort.sort(arFile, M.fileSort.sortType);
            }

            /*var time = new Date();
            var int_毫秒 = (new Date()).getTime() - time.getTime();
            var s_輸出時間差 = (int_毫秒) + "ms";
            console.log(s_輸出時間差)*/

            //目前檔案位置
            flagFile = 0;
            for (let i = 0; i < arFile.length; i++) {
                if (arFile[i] == path) {
                    flagFile = i;
                    break;
                }
            }

            M.mainFileList.initFileList();//檔案預覽列表 初始化
            await showFile();//載入圖片
            M.mainFileList.setStartLocation();//檔案預覽列表 捲動到選中項目的中間

            await initDirList(dirPath);//取得資料夾名單
            
      
            M.mainDirList.select();//
            M.mainDirList.updataLocation();//

        }


        /**
         * 取得目前檔案的路徑
         * @returns 
         */
        function getFilePath() {
            var p = arFile[flagFile];
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
        var _show = async () => { };
        async function timer01() {
            let func = _show;
            _show = async () => { };
            await func();

            setTimeout(() => { timer01(); }, 5);  //遞迴
        }
        timer01();

        /**
         * 
         * @param _flag 
         */
        async function showFile(_flag?: number) {

            if (_flag !== undefined) { flagFile = _flag; }
            if (flagFile < 0) { flagFile = 0; }
            if (flagFile >= arFile.length) { flagFile = arFile.length - 1; }

            if (arFile.length === 0) {//如果資料夾裡面沒有圖片
                M.fileShow.openWelcome();
                _show = async () => { }
                return;
            }

            M.mainFileList.setHide(false);//解除隱藏 檔案預覽列表
            M.mainFileList.select();//設定檔案預覽列表 目前選中的項目
            M.mainFileList.updataLocation();//檔案預覽列表 自動捲動到選中項目的地方

            let path = getFilePath();
            let fileInfo2 = await Lib.GetFileInfo2(path);

            if (fileInfo2.Type === "none") {//如果檔案不存在
                arFile.splice(flagFile, 1);//刪除此筆
                M.mainFileList.initFileList();//檔案預覽列表 初始化
                showFile(flagFile);
                _show = async () => { }
                return;
            }

            updateTitle();//更新視窗標題

            if (fileLoadType === FileLoadType.userDefined) { //如果是自定名單
                groupType = fileToGroupType(fileInfo2);//根據檔案類型判斷要用什麼方式顯示檔案
            }

            _show = async () => {
                if (groupType === GroupType.img || groupType === GroupType.unknown) {
                    await M.fileShow.openImage(fileInfo2);
                }
                if (groupType === GroupType.pdf) {
                    await M.fileShow.openPdf(fileInfo2);
                }
                if (groupType === GroupType.txt) {
                    await M.fileShow.openTxt(fileInfo2);
                }
            }

        }


        async function showDir(_flag?: number) {

            if (_flag !== undefined) { flagDir = _flag; }
            if (flagDir < 0) { flagDir = 0; }
            if (flagDir >= arDirKey.length) { flagDir = arDirKey.length - 1; }

            let path = arDirKey[flagDir]
            loadFile(path);

            /*
            if (arDirKey.length === 0) {//如果資料夾裡面沒有圖片
                M.fileShow.openWelcome();
                _show = async () => { }
                return;
            }     
            M.mainFileList.setHide(false);//解除隱藏 檔案預覽列表
            M.mainFileList.select();//設定檔案預覽列表 目前選中的項目
            M.mainFileList.updataLocation();//檔案預覽列表 自動捲動到選中項目的地方

            let path = getFilePath();
            let fileInfo2 = await Lib.GetFileInfo2(path);

            if (fileInfo2.Type === "none") {//如果檔案不存在
                arFile.splice(flagFile, 1);//刪除此筆
                M.mainFileList.initFileList();//檔案預覽列表 初始化
                showFile(flagFile);
                _show = async () => { }
                return;
            }

            updateTitle();//更新視窗標題

            if (fileLoadType === FileLoadType.userDefined) { //如果是自定名單
                groupType = fileToGroupType(fileInfo2);//根據檔案類型判斷要用什麼方式顯示檔案
            }*/



        }


        /**
         * 更新視窗標題
         */
        function updateTitle() {
            let title = `「${flagFile + 1}/${arFile.length}」 ${Lib.GetFileName(getFilePath())}`;
            baseWindow.setTitle(title);
        }


        /**
         * 載入下一個檔案
         */
        async function nextFile() {
            flagFile += 1;
            if (flagFile >= arFile.length) { flagFile = 0; }
            showFile();
        }


        /**
         * 載入上一個檔案
         */
        async function prevFile() {
            flagFile -= 1;
            if (flagFile < 0) { flagFile = arFile.length - 1; }
            showFile();
        }



        /**
         * 從檔案類型判斷，要使用什麼用什麼類型來顯示
         * @returns 
         */
        function fileToGroupType(fileInfo2: FileInfo2) {

            //let fileExt = await M.config.getFileType(path)
            let fileExt = Lib.GetFileType(fileInfo2)

            for (var type in GroupType) {
                for (let j = 0; j < M.config.allowFileType(type).length; j++) {
                    const fileType = M.config.allowFileType(type)[j];
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
        async function filter() {

            let ar = [];

            for (let i = 0; i < arFile.length; i++) {

                let path = arFile[i];
                let fileExt = (Lib.GetExtension(path)).toLocaleLowerCase();

                for (let j = 0; j < M.config.allowFileType(groupType).length; j++) {
                    const fileType = M.config.allowFileType(groupType)[j];
                    if (fileExt == "." + fileType["ext"]) {
                        ar.push(path);
                        break;
                    }
                }
            }

            return ar;

        }


        /**
         * 顯示 刪除檔案 的對話方塊
         */
        async function deleteMsg() {

            let path = getFilePath();

            Msgbox.show({
                type: "radio",
                txt: `刪除檔案` + "<br>" + Lib.GetFileName(path),
                arRadio: [
                    { value: "1", name: "移至資源回收桶" },
                    { value: "2", name: "永久刪除檔案" },
                ],
                radioValue: "1",
                funcYes: async (dom: HTMLElement, value: string) => {

                    Msgbox.close(dom);

                    let state = true;
                    if (value == "1") {
                        state = await WV_File.MoveToRecycle(path);
                    }
                    if (value == "2") {
                        state = await WV_File.Delete(path);
                    }


                    if (state === false) {
                        Msgbox.show({ txt: "刪除失敗" })
                    } else {
                        await showFile();

                        M.mainFileList.initFileList();//檔案預覽列表 初始化
                        M.mainFileList.select();//設定 檔案預覽列表 目前選中的項目
                        M.mainFileList.updataLocation();//檔案預覽列表 自動捲動到選中項目的地方  
                    }

                    //alert(value)
                }
            });

        }


        /**
         * 顯示 重新命名檔案 的對話方塊
         */
        async function renameMsg() {

            let path = getFilePath();
            let fileName = Lib.GetFileName(path);

            let msg = Msgbox.show({
                txt: "重新命名檔案",
                type: "text",
                inputTxt: fileName,
                funcYes: async (dom: HTMLElement, inputTxt: string) => {
                    if (inputTxt.trim() == "") {
                        Msgbox.show({ txt: "必須輸入檔名" });
                        return;
                    }
                    if (inputTxt.search(/[\\]|[/]|[:]|[*]|[?]|["]|[<]|[>]|[|]/) != -1) {
                        Msgbox.show({ txt: "檔案名稱不可以包含下列任意字元：" + "<br>" + "\\ / : * ? \" < > |" });
                        return;
                    }
                    if (fileName == inputTxt) {
                        Msgbox.close(dom);
                        return;
                    }

                    let newName = Lib.Combine([await WV_Path.GetDirectoryName(path), inputTxt]);
                    let err = await WV_File.Move(path, newName);
                    if (err != "") {
                        Msgbox.show({ txt: "重新命名失敗：" + "<br>" + err });
                        return;
                    }

                    arFile[flagFile] = newName;
                    updateTitle();
                    M.mainFileList.initFileList();//檔案預覽列表 初始化
                    M.mainFileList.select();//設定 檔案預覽列表 目前選中的項目
                    M.mainFileList.updataLocation();//檔案預覽列表 自動捲動到選中項目的地方  

                    Msgbox.close(dom);
                }
            });

            const len = fileName.length - Lib.GetExtension(path).length;
            msg.domInput.setSelectionRange(0, len);
        }





    }

}


/** 
 * 名單類型
 */
enum FileLoadType {

    /** 資料夾內的全部檔案 */
    "dir",

    /** 自定名單 */
    "userDefined"
}


