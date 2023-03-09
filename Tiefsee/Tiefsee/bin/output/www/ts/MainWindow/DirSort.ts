class DirSort {

    //public getSortType;
    public getDirSortType;
    public setDirSortMenu;
    public sort;

    constructor(M: MainWindow) {

        var dom_dirSort_name = document.getElementById("menuitem-dirSort-name") as HTMLInputElement;
        var dom_dirSort_lastWriteTime = document.getElementById("menuitem-dirSort-lastWriteTime") as HTMLInputElement;
        var dom_dirSort_lastAccessTime = document.getElementById("menuitem-dirSort-lastAccessTime") as HTMLInputElement;
        var dom_dirSort_creationTime = document.getElementById("menuitem-dirSort-creationTime") as HTMLInputElement;
        var dom_dirSort_random = document.getElementById("menuitem-dirSort-random") as HTMLInputElement;

        var dom_dirSort_asc = document.getElementById("menuitem-dirSort-asc") as HTMLInputElement;
        var dom_dirSort_desc = document.getElementById("menuitem-dirSort-desc") as HTMLInputElement;

        var yesSvgTxt = SvgList["yes.svg"];
        var sortType = DirSortType.name;//排序方式
        var orderbyType = DirOrderbyType.asc;

        //this.getSortType = () => { return sortType }
        //this.setSortType = (val: string) => { sortType = val; }
        this.getDirSortType = getDirSortType;
        //this.setDirSortType = setDirSortType;
        this.setDirSortMenu = setDirSortMenu;
        this.sort = sort;

        dom_dirSort_name.addEventListener("click", () => {
            sortType = DirSortType.name;
            updateSort();
        });
        dom_dirSort_lastWriteTime.addEventListener("click", () => {
            sortType = DirSortType.lastWriteTime;
            updateSort();
        });
        dom_dirSort_lastAccessTime.addEventListener("click", () => {
            sortType = DirSortType.lastAccessTime;
            updateSort();
        });
        dom_dirSort_creationTime.addEventListener("click", () => {
            sortType = DirSortType.creationTime;
            updateSort();
        });
        dom_dirSort_random.addEventListener("click", () => {
            sortType = DirSortType.random;
            updateSort();
        });

        dom_dirSort_asc.addEventListener("click", () => {
            orderbyType = DirOrderbyType.asc
            updateSort();
        });
        dom_dirSort_desc.addEventListener("click", () => {
            orderbyType = DirOrderbyType.desc
            updateSort();
        });


        /**
         * 不重新載入圖片，只更新排序(用於排序選單的按鈕
         * @param _sortType 
         */
        async function updateSort() {

            //sortType = _sortType;
            if (orderbyType === DirOrderbyType.desc) {
                if (sortType === DirSortType.name) { sortType = DirSortType.nameDesc; }
                if (sortType === DirSortType.lastWriteTime) { sortType = DirSortType.lastWriteTimeDesc; }
                if (sortType === DirSortType.lastAccessTime) { sortType = DirSortType.lastAccessTimeDesc; }
                if (sortType === DirSortType.creationTime) { sortType = DirSortType.creationTimeDesc; }
            }
            if (orderbyType === DirOrderbyType.asc) {
                if (sortType === DirSortType.nameDesc) { sortType = DirSortType.name; }
                if (sortType === DirSortType.lastWriteTimeDesc) { sortType = DirSortType.lastWriteTime; }
                if (sortType === DirSortType.lastAccessTimeDesc) { sortType = DirSortType.lastAccessTime; }
                if (sortType === DirSortType.creationTimeDesc) { sortType = DirSortType.creationTime; }
            }

            await sort()

            //使用 父親資料夾 當做key來記錄排序
            let dirPath = M.fileLoad.getDirPath()
            let dirParentPath = Lib.GetDirectoryName(dirPath)
            if (dirParentPath === null) {
                dirParentPath = dirPath;
            }
            setDirSortType(dirParentPath, sortType);

            M.fileLoad.updateTitle();//更新視窗標題
            M.mainDirList.init();//設定 檔案預覽視窗 目前選中的項目
            M.mainDirList.updateLocation();//檔案預覽視窗 自動捲動到選中項目的地方

            setDirSortMenu();
            //M.menu.close();//關閉menu
        }


        /**
         * 更新menu選單
         * @param _sortType 
         */
        function setDirSortMenu() {

            dom_dirSort_name.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_dirSort_lastWriteTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_dirSort_lastAccessTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_dirSort_creationTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_dirSort_random.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";

            dom_dirSort_asc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_dirSort_desc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";

            if (sortType === DirSortType.name || sortType === DirSortType.nameDesc) {
                dom_dirSort_name.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
            if (sortType === DirSortType.lastWriteTime || sortType === DirSortType.lastWriteTimeDesc) {
                dom_dirSort_lastWriteTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
            if (sortType === DirSortType.lastAccessTime || sortType === DirSortType.lastAccessTimeDesc) {
                dom_dirSort_lastAccessTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
            if (sortType === DirSortType.creationTime || sortType === DirSortType.creationTimeDesc) {
                dom_dirSort_creationTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
            if (sortType === DirSortType.random) {
                dom_dirSort_random.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }

            if (orderbyType === DirOrderbyType.asc) {
                dom_dirSort_asc.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
            if (orderbyType === DirOrderbyType.desc) {
                dom_dirSort_desc.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
            //M.menu.close();//關閉menu
        }


        /**
         * 排序檔案
         * @param _type 排序類型
         * @returns 排序後的陣列
         */
        async function sort() {

            let path = M.fileLoad.getDirPath();
            let arDir = M.fileLoad.getWaitingDir();
            let arKey = M.fileLoad.getWaitingDirKey();

            if (arKey.length <= 1) { return; } //只有1筆資料就不需要排序

            arKey = await WebAPI.sort2(arKey, sortType);

            //排序後把資料放回 WaitingDir
            let ar: { [key: string]: string[] } = {}
            for (let i = 0; i < arKey.length; i++) {
                const dirPath = arKey[i];
                ar[dirPath] = arDir[dirPath];
            }
            M.fileLoad.setWaitingDir(ar);

            //更新 flagDir (目前在哪一個資料夾
            await M.fileLoad.updateFlagDir(path);
        }


        /**
         * 設定該資料夾設定的檔案排序方式
         * @param dirPath 
         * @param _sortType 
         */
        function setDirSortType(dirPath: string, _sortType: string) {

            //取得原來的排序
            let t = window.localStorage.getItem("sortDir");
            let json: any = {};
            if (t !== null) {
                json = JSON.parse(t);
            }

            //儲存排序
            json[dirPath] = sortType;
            window.localStorage.setItem("sortDir", JSON.stringify(json));

            //console.log(`Dir set ` + sortType)
        }


        /**
         * 取得該資料夾設定的檔案排序方式
         * @param dirPath 
         * @returns 
         */
        function getDirSortType(dirPath: string) {

            let t = window.localStorage.getItem("sortDir");

            if (t === null) { t = "{}" } //避免從來沒有儲存過
            let json = JSON.parse(t);
            let _sortType = json[dirPath];
            if (_sortType !== undefined) {
                sortType = _sortType;
            } else {
                let defaultSort = M.config.settings.sort["dirSort"];
                if (Object.keys(DirSortType).indexOf(defaultSort) === -1) {//如果找不到
                    defaultSort = DirSortType.name;
                }
                sortType = defaultSort;
            }

            //console.log(`Dir get ` + sortType + " " + dirPath)
            if (sortType.indexOf("Desc") !== -1) {
                orderbyType = DirOrderbyType.desc;
            } else {
                orderbyType = DirOrderbyType.asc;
            }

        }

    }

}

/**
 * 排序類型
 */
var DirSortType = {
    /** 檔名自然排序 */
    name: "name",

    /** 檔名自然排序(逆) */
    nameDesc: "nameDesc",

    /** 修改時間排序 */
    lastWriteTime: "lastWriteTime",

    /** 修改時間排序(逆) */
    lastWriteTimeDesc: "lastWriteTimeDesc",

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
var DirOrderbyType = {
    desc: "desc",
    asc: "asc",
}
