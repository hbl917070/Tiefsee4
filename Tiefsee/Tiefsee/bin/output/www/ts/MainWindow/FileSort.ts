class FileSort {

    public getSortType;
    public setSortType;
    public getFileSortType;
    public setFileSortType;
    public setFileSortMenu;
    public sort;

    constructor(M: MainWindow) {
        var dom_fileSort_name = document.getElementById("menuitem-fileSort-name") as HTMLInputElement;
        var dom_fileSort_nameDesc = document.getElementById("menuitem-fileSort-nameDesc") as HTMLInputElement;
        var dom_fileSort_lastWriteTime = document.getElementById("menuitem-fileSort-lastWriteTime") as HTMLInputElement;
        var dom_fileSort_lastWriteTimeDesc = document.getElementById("menuitem-fileSort-lastWriteTimeDesc") as HTMLInputElement;
        var dom_fileSort_length = document.getElementById("menuitem-fileSort-length") as HTMLInputElement;
        var dom_fileSort_lengthDesc = document.getElementById("menuitem-fileSort-lengthDesc") as HTMLInputElement;

        var dom_fileSort_lastAccessTime = document.getElementById("menuitem-fileSort-lastAccessTime") as HTMLInputElement;
        var dom_fileSort_lastAccessTimeDesc = document.getElementById("menuitem-fileSort-lastAccessTimeDesc") as HTMLInputElement;
        var dom_fileSort_creationTime = document.getElementById("menuitem-fileSort-creationTime") as HTMLInputElement;
        var dom_fileSort_creationTimeDesc = document.getElementById("menuitem-fileSort-creationTimeDesc") as HTMLInputElement;
        var dom_fileSort_random = document.getElementById("menuitem-fileSort-random") as HTMLInputElement;


        var yesSvgTxt: string = "";
        //defaultFileSort = FileSortType.name;
        var sortType = FileSortType.name;//排序方式


        this.getSortType = () => { return sortType }
        this.setSortType = (val: string) => { sortType = val; }
        this.getFileSortType = getFileSortType;
        this.setFileSortType = setFileSortType;
        this.setFileSortMenu = setFileSortMenu;
        this.sort = sort;


        init()



        async function init() {
            yesSvgTxt = SvgList["yes.svg"];

            //setFileSortMenu(FileSortType.lastWriteTimeDesc);


            dom_fileSort_name.addEventListener("click", () => {
                updateSort(FileSortType.name);
            });
            dom_fileSort_nameDesc.addEventListener("click", () => {
                updateSort(FileSortType.nameDesc);
            });
            dom_fileSort_lastWriteTime.addEventListener("click", () => {
                updateSort(FileSortType.lastWriteTime);
            });
            dom_fileSort_lastWriteTimeDesc.addEventListener("click", () => {
                updateSort(FileSortType.lastWriteTimeDesc);
            });
            dom_fileSort_length.addEventListener("click", () => {
                updateSort(FileSortType.length);
            });
            dom_fileSort_lengthDesc.addEventListener("click", () => {
                updateSort(FileSortType.lengthDesc);
            });

            dom_fileSort_lastAccessTime.addEventListener("click", () => {
                updateSort(FileSortType.lastAccessTime);
            });
            dom_fileSort_lastAccessTimeDesc.addEventListener("click", () => {
                updateSort(FileSortType.lastAccessTimeDesc);
            });
            dom_fileSort_creationTime.addEventListener("click", () => {
                updateSort(FileSortType.creationTime);
            });
            dom_fileSort_creationTimeDesc.addEventListener("click", () => {
                updateSort(FileSortType.creationTimeDesc);
            });
            dom_fileSort_random.addEventListener("click", () => {
                updateSort(FileSortType.random);
            });
        }


        /**
         * 不重新載入圖片，只更新排序(用於排序選單的按鈕
         * @param _sortType 
         */
        async function updateSort(_sortType: string) {

            sortType = _sortType;

            let path = M.fileLoad.getFilePath();
            let dirPath = Lib.GetDirectoryName(path);
            if (dirPath === null) { return; }
            setFileSortType(dirPath, sortType);

            let ar = await sort(M.fileLoad.getWaitingFile(), sortType)
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
            M.mainFileList.select();//設定 檔案預覽視窗 目前選中的項目
            M.mainFileList.updateLocation();//檔案預覽視窗 自動捲動到選中項目的地方

            setFileSortMenu(_sortType);
            //M.menu.close();//關閉menu
        }


        /**
         * 更新menu選單
         * @param _sortType 
         */
        function setFileSortMenu(_sortType: string) {
            dom_fileSort_name.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_fileSort_nameDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_fileSort_lastWriteTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_fileSort_lastWriteTimeDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_fileSort_length.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_fileSort_lengthDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_fileSort_lastAccessTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_fileSort_lastAccessTimeDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_fileSort_creationTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_fileSort_creationTimeDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_fileSort_random.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";

            if (_sortType === FileSortType.name) {
                dom_fileSort_name.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
            if (_sortType === FileSortType.nameDesc) {
                dom_fileSort_nameDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }

            if (_sortType === FileSortType.lastWriteTime) {
                dom_fileSort_lastWriteTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
            if (_sortType === FileSortType.lastWriteTimeDesc) {
                dom_fileSort_lastWriteTimeDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }

            if (_sortType === FileSortType.length) {
                dom_fileSort_length.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
            if (_sortType === FileSortType.lengthDesc) {
                dom_fileSort_lengthDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }

            if (_sortType === FileSortType.lastAccessTime) {
                dom_fileSort_lastAccessTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
            if (_sortType === FileSortType.lastAccessTimeDesc) {
                dom_fileSort_lastAccessTimeDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }

            if (_sortType === FileSortType.creationTime) {
                dom_fileSort_creationTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
            if (_sortType === FileSortType.creationTimeDesc) {
                dom_fileSort_creationTimeDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }

            if (_sortType === FileSortType.random) {
                dom_fileSort_random.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
        }


        /**
         * 排序檔案
         * @param _type 排序類型
         * @returns 排序後的陣列
         */
        async function sort(arWaitingFile: string[], _type: string): Promise<string[]> {
            arWaitingFile = await WebAPI.sort2(arWaitingFile, _type);
            return arWaitingFile;
        }


        /**
         * 設定該資料夾設定的檔案排序方式
         * @param dirPath 
         * @param _sortType 
         */
        function setFileSortType(dirPath: string, _sortType: string) {

            //取得原來的排序
            let t = window.localStorage.getItem("sortFile");
            let json: any = {};
            if (t !== null) {
                json = JSON.parse(t);
            }

            //儲存排序
            json[dirPath] = _sortType;
            window.localStorage.setItem("sortFile", JSON.stringify(json));
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
                return _sortType;
            } else {
                //return defaultFileSort;
                let defaultSort = M.config.settings.sort["fileSort"];
                if (Object.keys(FileSortType).indexOf(defaultSort) === -1) {//如果找不到
                    defaultSort = FileSortType.name;
                }
                return defaultSort;
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



