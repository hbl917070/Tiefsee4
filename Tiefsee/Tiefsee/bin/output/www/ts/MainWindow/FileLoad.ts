
/**
 * 開啟檔案
 */
class FileLoad {

    public getArray: () => string[];
    public loadFile;
    public loadFiles;

    public next;
    public prev;
    public getFilePath;
    public getGroupType;
    public setGroupType;
    public getFileLoadType;
    public deleteMsg;
    public renameMsg;

    constructor(M: MainWindow) {


        var arWaitingList: string[] = [];//待載入名單
        var flag: number;//目前在哪一張圖片
        var sortType = FileSortType.name;//排序方式

        /** unknown=未知 img=圖片  pdf=pdf、ai  movie=影片  imgs=多幀圖片  txt=文字 */
        var groupType: string = "img";
        var fileLoadType: FileLoadType //資料夾或自定名單


        this.getArray = () => { return arWaitingList; };
        this.loadFile = loadFile;
        this.loadFiles = loadFiles;
        this.next = next;
        this.prev = prev;
        this.getFilePath = getFilePath;
        this.getGroupType = getGroupType;
        this.setGroupType = setGroupType;
        this.getFileLoadType = getFileLoadType;
        this.deleteMsg = deleteMsg;
        this.renameMsg = renameMsg;

        /**
         * 載入檔案陣列
         * @param dirPath 
         * @param arName 
         */
        async function loadFiles(dirPath: string, arName: string[] = []) {

            fileLoadType = FileLoadType.userDefined;//名單類型，自定義

            //改用C#處理，增加執行效率
            arWaitingList = await WV_Directory.GetFiles2(dirPath, arName);

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

            let path = arWaitingList[0];//以拖曳進來的第一個檔案為開啟對象

            //arWaitingList = await filter();
            arWaitingList = await sort(sortType);

            //目前檔案位置
            flag = 0;
            for (let i = 0; i < arWaitingList.length; i++) {
                if (arWaitingList[i] == path) {
                    flag = i;
                    break;
                }
            }

            show();

        }


        /**
         * 載入單一檔案
         * @param path 
         */
        async function loadFile(path: string) {

            fileLoadType = FileLoadType.dir;//名單類型，資料夾內所有檔案

            arWaitingList = [];

            if (await WV_Directory.Exists(path) === true) {//如果是資料夾

                arWaitingList = await WV_Directory.GetFiles(path, "*.*");//取得資料夾內所有檔案

                arWaitingList = await sort(sortType);
                groupType = GroupType.img;
                //groupType = await fileToGroupType(arWaitingList[0])
                arWaitingList = await filter();

            } else if (await WV_File.Exists(path) === true) {//如果是檔案

                let p: string = await WV_Path.GetDirectoryName(path);//取得檔案所在的資料夾路徑
                arWaitingList = await WV_Directory.GetFiles(p, "*.*");

                let fileInfo2 = await Lib.GetFileInfo2(path);
                groupType = fileToGroupType(fileInfo2)
                arWaitingList = await filter();
                if (arWaitingList.indexOf(path) === -1) {
                    arWaitingList.splice(0, 0, path);
                }
                arWaitingList = await sort(sortType);
            }

            /*var time = new Date();
            var int_毫秒 = (new Date()).getTime() - time.getTime();
            var s_輸出時間差 = (int_毫秒) + "ms";
            console.log(s_輸出時間差)*/

            //目前檔案位置
            flag = 0;
            for (let i = 0; i < arWaitingList.length; i++) {
                if (arWaitingList[i] == path) {
                    flag = i;
                    break;
                }
            }

            show();
        }



        /**
         * 取得目前檔案的路徑
         * @returns 
         */
        function getFilePath() {
            var p = arWaitingList[flag];
            return p;
        }


        /**
         * 取得名單類型
         * @returns 
         */
        function getFileLoadType() {
            return fileLoadType;
        }


        /**
         * 
         * @param _flag 
         */
        async function show(_flag?: number) {

            if (_flag !== undefined) { flag = _flag; }
            if (flag < 0) { flag = 0; }
            if (flag >= arWaitingList.length) { flag = arWaitingList.length - 1; }

            if (arWaitingList.length === 0) {//如果資料夾裡面沒有圖片
                M.fileShow.openWelcome();
                return;
            }

            let path = getFilePath();
            let fileInfo2 = await Lib.GetFileInfo2(path);
            //console.log(Lib.GetFileType(fileInfo2))

            if (fileInfo2.Type === "none") {//如果檔案不存在
                arWaitingList.splice(flag, 1);//刪除此筆
                show(flag);
                return;
            }



            if (fileLoadType === FileLoadType.userDefined) { //如果是自定名單
                groupType = fileToGroupType(fileInfo2);//根據檔案類型判斷要用什麼方式顯示檔案
            }
            if (groupType === GroupType.img || groupType === GroupType.unknown) {
                M.fileShow.openImage(fileInfo2);
            }
            if (groupType === GroupType.pdf) {
                M.fileShow.openPdf(fileInfo2);
            }
            if (groupType === GroupType.txt) {
                M.fileShow.openTxt(fileInfo2);
            }

            //修改視窗標題
            let title = `「${flag + 1}/${arWaitingList.length}」 ${Lib.GetFileName(path)}`;
            baseWindow.setTitle(title);

        }


        /**
         * 載入下一個檔案
         */
        async function next() {
            flag += 1;
            if (flag >= arWaitingList.length) { flag = 0; }
            show();
        }


        /**
         * 載入上一個檔案
         */
        async function prev() {
            flag -= 1;
            if (flag < 0) { flag = arWaitingList.length - 1; }
            show();
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

            for (let i = 0; i < arWaitingList.length; i++) {

                let path = arWaitingList[i];
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
         * 排序檔案
         * @param _type 排序類型
         * @returns 排序後的陣列
         */
        async function sort(_type: FileSortType): Promise<string[]> {

            //檔名自然排序
            if (_type === FileSortType.name) {
                return arWaitingList.sort(function (a, b) {
                    return a.localeCompare(b, undefined, {
                        numeric: true,
                        sensitivity: 'base'
                    });
                });
            }

            //檔名自然排序(逆)
            if (_type === FileSortType.nameDesc) {
                return arWaitingList.sort(function (a, b) {
                    return -1 * a.localeCompare(b, undefined, {
                        numeric: true,
                        sensitivity: 'base'
                    });
                });
            }


            return [];
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
                    show();

                    if (state === false) {
                        Msgbox.show({ txt: "刪除失敗" })
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

            Msgbox.show({
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

                    let newName = Lib.Combine([await WV_Path.GetDirectoryName(path), inputTxt]);
                    let err = await WV_File.Move(path, newName);
                    if (err != "") {
                        Msgbox.show({ txt: "重新命名失敗：" + "<br>" + err });
                        return;
                    }

                    arWaitingList[flag] = newName;
                    show();
                    Msgbox.close(dom);
                }
            });
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


/**
 * 排序類型
 */
enum FileSortType {

    /** 檔名自然排序 */
    "name",

    /** 檔名自然排序(逆) */
    "nameDesc",

    /** 修改時間排序 */
    "editDate",

    /** 修改時間排序(逆) */
    "editDateDesc",
}

