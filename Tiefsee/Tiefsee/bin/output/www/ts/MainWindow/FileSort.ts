class FileSort {

    public getFileSortType;
    public setFileSortMenu;
    public sort;

    constructor(M: MainWindow) {
        var dom_fileSort_name = document.getElementById("menuitem-fileSort-name") as HTMLInputElement;
        var dom_fileSort_lastWriteTime = document.getElementById("menuitem-fileSort-lastWriteTime") as HTMLInputElement;
        var dom_fileSort_length = document.getElementById("menuitem-fileSort-length") as HTMLInputElement;
        var dom_fileSort_lastAccessTime = document.getElementById("menuitem-fileSort-lastAccessTime") as HTMLInputElement;
        var dom_fileSort_creationTime = document.getElementById("menuitem-fileSort-creationTime") as HTMLInputElement;
        var dom_fileSort_random = document.getElementById("menuitem-fileSort-random") as HTMLInputElement;

        var dom_fileSort_asc = document.getElementById("menuitem-fileSort-asc") as HTMLInputElement;
        var dom_fileSort_desc = document.getElementById("menuitem-fileSort-desc") as HTMLInputElement;

        var yesSvgTxt = SvgList["yes.svg"];
        var sortType = FileSortType.name;//排序方式
        var orderbyType = FileOrderbyType.asc;

        this.getFileSortType = getFileSortType;
        this.setFileSortMenu = setFileSortMenu;
        this.sort = sort;


        dom_fileSort_name.addEventListener("click", () => {
            sortType = FileSortType.name;
            updateSort();
        });
        dom_fileSort_lastWriteTime.addEventListener("click", () => {
            sortType = FileSortType.lastWriteTime;
            updateSort();
        });
        dom_fileSort_length.addEventListener("click", () => {
            sortType = FileSortType.length;
            updateSort();
        });
        dom_fileSort_lastAccessTime.addEventListener("click", () => {
            sortType = FileSortType.lastAccessTime;
            updateSort();
        });
        dom_fileSort_creationTime.addEventListener("click", () => {
            sortType = FileSortType.creationTime;
            updateSort();
        });
        dom_fileSort_random.addEventListener("click", () => {
            sortType = FileSortType.random;
            updateSort();
        });

        dom_fileSort_asc.addEventListener("click", () => {
            orderbyType = FileOrderbyType.asc;
            updateSort();
        });
        dom_fileSort_desc.addEventListener("click", () => {
            orderbyType = FileOrderbyType.desc;
            updateSort();
        });


        /**
         * 不重新載入圖片，只更新排序(用於排序選單的按鈕
         * @param _sortType 
         */
        async function updateSort() {

            //sortType = _sortType;
            if (orderbyType === FileOrderbyType.desc) {
                if (sortType === FileSortType.name) { sortType = FileSortType.nameDesc; }
                if (sortType === FileSortType.lastWriteTime) { sortType = FileSortType.lastWriteTimeDesc; }
                if (sortType === FileSortType.length) { sortType = FileSortType.lengthDesc; }
                if (sortType === FileSortType.lastAccessTime) { sortType = FileSortType.lastAccessTimeDesc; }
                if (sortType === FileSortType.creationTime) { sortType = FileSortType.creationTimeDesc; }
            }
            if (orderbyType === FileOrderbyType.asc) {
                if (sortType === FileSortType.nameDesc) { sortType = FileSortType.name; }
                if (sortType === FileSortType.lastWriteTimeDesc) { sortType = FileSortType.lastWriteTime; }
                if (sortType === FileSortType.lengthDesc) { sortType = FileSortType.length; }
                if (sortType === FileSortType.lastAccessTimeDesc) { sortType = FileSortType.lastAccessTime; }
                if (sortType === FileSortType.creationTimeDesc) { sortType = FileSortType.creationTime; }
            }

            let path = M.fileLoad.getFilePath();
            let dirPath = Lib.GetDirectoryName(path);
            if (dirPath === null) { return; }
            setFileSortType(dirPath);

            let ar = await sort(M.fileLoad.getWaitingFile())
            //目前檔案位置
            M.fileLoad.setFlagFile(0);
            for (let i = 0; i < ar.length; i++) {
                if (ar[i] == path) {
                    M.fileLoad.setFlagFile(i);
                    break;
                }
            }

            M.fileLoad.setWaitingFile(ar);
            M.fileLoad.updateTitle();//更新視窗標題

            M.mainFileList.init();//檔案預覽視窗 初始化
            M.mainFileList.updateLocation();//檔案預覽視窗 自動捲動到選中項目的地方

            setFileSortMenu();

            if (M.fileLoad.getIsBulkView()) { //如果是在大量瀏覽模式，則重新載入名單
                M.bulkView.load();
            }

            //M.menu.close();//關閉menu
        }


        /**
         * 更新menu選單
         * @param _sortType 
         */
        function setFileSortMenu() {

            dom_fileSort_name.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_fileSort_lastWriteTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_fileSort_length.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_fileSort_lastAccessTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_fileSort_creationTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_fileSort_random.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";

            dom_fileSort_asc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_fileSort_desc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";

            if (sortType === FileSortType.name || sortType === FileSortType.nameDesc) {
                dom_fileSort_name.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
            if (sortType === FileSortType.lastWriteTime || sortType === FileSortType.lastWriteTimeDesc) {
                dom_fileSort_lastWriteTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
            if (sortType === FileSortType.length || sortType === FileSortType.lengthDesc) {
                dom_fileSort_length.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
            if (sortType === FileSortType.lastAccessTime || sortType === FileSortType.lastAccessTimeDesc) {
                dom_fileSort_lastAccessTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
            if (sortType === FileSortType.creationTime || sortType === FileSortType.creationTimeDesc) {
                dom_fileSort_creationTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
            if (sortType === FileSortType.random) {
                dom_fileSort_random.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }

            if (orderbyType === FileOrderbyType.asc) {
                dom_fileSort_asc.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
            if (orderbyType === FileOrderbyType.desc) {
                dom_fileSort_desc.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
        }


        /**
         * 排序檔案
         * @param _type 排序類型
         * @returns 排序後的陣列
         */
        async function sort(arWaitingFile: string[]): Promise<string[]> {
            arWaitingFile = await WebAPI.sort2(arWaitingFile, sortType);
            return arWaitingFile;
        }


        /**
         * 設定該資料夾設定的檔案排序方式
         * @param dirPath 
         * @param _sortType 
         */
        function setFileSortType(dirPath: string) {

            //取得原來的排序
            let t = window.localStorage.getItem("sortFile");
            let json: any = {};
            if (t !== null) {
                json = JSON.parse(t);
            }

            //儲存排序
            json[dirPath] = sortType;
            window.localStorage.setItem("sortFile", JSON.stringify(json));

            //console.log(`set ` + sortType)
        }


        /**
         * 取得該資料夾設定的檔案排序方式
         * @param dirPath 
         * @returns 
         */
        function getFileSortType(dirPath: string) {

            let t = window.localStorage.getItem("sortFile");

            if (t === null) { t = "{}" } //避免從來沒有儲存過
            let json = JSON.parse(t);
            let _sortType = json[dirPath];

            if (_sortType !== undefined) {
                sortType = _sortType;
            } else {
                let defaultSort = M.config.settings.sort["fileSort"];
                if (Object.keys(FileSortType).indexOf(defaultSort) === -1) {//如果找不到
                    defaultSort = FileSortType.name;
                }
                sortType = defaultSort;
            }

            //console.log(`get ` + sortType)
            if (sortType.indexOf("Desc") !== -1) {
                orderbyType = FileOrderbyType.desc;
            } else {
                orderbyType = FileOrderbyType.asc;
            }

        }

    }

}


/**
 * 排序類型
 */
var FileSortType = {
    /** 檔名自然排序 */
    name: "name",

    /** 檔名自然排序(逆) */
    nameDesc: "nameDesc",

    /** 修改時間排序 */
    lastWriteTime: "lastWriteTime",

    /** 修改時間排序(逆) */
    lastWriteTimeDesc: "lastWriteTimeDesc",

    /** 檔案大小排序  */
    length: "length",

    /** 檔案大小排序(逆)  */
    lengthDesc: "lengthDesc",

    /** 檔案存取時間排序 */
    lastAccessTime: "lastAccessTime",

    /** 檔案存取時間排序(逆)   */
    lastAccessTimeDesc: "lastAccessTimeDesc",

    /** 檔案建立時間排序 */
    creationTime: "creationTime",

    /** 檔案建立時間排序(逆)  */
    creationTimeDesc: "creationTimeDesc",

    /** 隨機排序 */
    random: "random",
}

/**
 * 遞增或遞減
 */
var FileOrderbyType = {
    desc: "desc",
    asc: "asc",
}
