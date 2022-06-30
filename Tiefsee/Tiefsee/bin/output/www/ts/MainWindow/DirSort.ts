class DirSort {

    public getSortType;
    public setSortType;
    public getDirSortType;
    public setDirSortType;
    public setDirSortMenu;
    public sort;

    constructor(M: MainWindow) {

        var dom_dirSort_name = document.getElementById("menuitem-dirSort-name") as HTMLInputElement;
        var dom_dirSort_nameDesc = document.getElementById("menuitem-dirSort-nameDesc") as HTMLInputElement;
        var dom_dirSort_lastWriteTime = document.getElementById("menuitem-dirSort-lastWriteTime") as HTMLInputElement;
        var dom_dirSort_lastWriteTimeDesc = document.getElementById("menuitem-dirSort-lastWriteTimeDesc") as HTMLInputElement;

        var yesSvgTxt = SvgList["yes.svg"];
        //var defaultSort = DirSortType.name;
        var sortType = DirSortType.name;//排序方式

        this.getSortType = () => { return sortType }
        this.setSortType = (val: string) => { sortType = val; }
        this.getDirSortType = getDirSortType;
        this.setDirSortType = setDirSortType;
        this.setDirSortMenu = setDirSortMenu;
        this.sort = sort;

        dom_dirSort_name.addEventListener("click", () => {
            updateSort(DirSortType.name);
        });
        dom_dirSort_nameDesc.addEventListener("click", () => {
            updateSort(DirSortType.nameDesc);
        });
        dom_dirSort_lastWriteTime.addEventListener("click", () => {
            updateSort(DirSortType.lastWriteTime);
        });
        dom_dirSort_lastWriteTimeDesc.addEventListener("click", () => {
            updateSort(DirSortType.lastWriteTimeDesc);
        });


        /**
         * 不重新載入圖片，只更新排序(用於排序選單的按鈕
         * @param _sortType 
         */
        async function updateSort(_sortType: string) {

            sortType = _sortType;

            await sort(sortType)

            //使用 父親資料夾 當做key來記錄排序
            let dirPath = M.fileLoad.getDirPath()
            let dirParentPath = Lib.GetDirectoryName(dirPath)
            if (dirParentPath === null) {
                dirParentPath = dirPath;
            }
            setDirSortType(dirParentPath, sortType);

            M.fileLoad.updateTitle();//更新視窗標題
            M.mainDirList.init();//設定 檔案預覽列表 目前選中的項目
            M.mainDirList.updateLocation();//檔案預覽列表 自動捲動到選中項目的地方

            setDirSortMenu(_sortType);

            M.menu.close();//關閉menu
        }


        /**
         * 更新menu選單
         * @param _sortType 
         */
        function setDirSortMenu(_sortType: string) {

            dom_dirSort_name.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_dirSort_nameDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_dirSort_lastWriteTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            dom_dirSort_lastWriteTimeDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";

            if (_sortType === DirSortType.name) {
                dom_dirSort_name.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
            if (_sortType === DirSortType.nameDesc) {
                dom_dirSort_nameDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
            if (_sortType === DirSortType.lastWriteTime) {
                dom_dirSort_lastWriteTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }
            if (_sortType === DirSortType.lastWriteTimeDesc) {
                dom_dirSort_lastWriteTimeDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = yesSvgTxt;
            }

            //M.menu.close();//關閉menu
        }


        /**
         * 排序檔案
         * @param _type 排序類型
         * @returns 排序後的陣列
         */
        async function sort(_type: string) {

            let path = M.fileLoad.getDirPath();
            let arDir = M.fileLoad.getWaitingDir();
            let arKey
            if (_type === DirSortType.name) {
                arKey = await WV_System.Sort(M.fileLoad.getWaitingDirKey(), "name");
            }
            if (_type === DirSortType.nameDesc) {
                arKey = await WV_System.Sort(M.fileLoad.getWaitingDirKey(), "nameDesc");
            }
            if (_type === DirSortType.lastWriteTime) {
                arKey = await WV_System.Sort(M.fileLoad.getWaitingDirKey(), "lastWriteTime");
            }
            if (_type === DirSortType.lastWriteTimeDesc) {
                arKey = await WV_System.Sort(M.fileLoad.getWaitingDirKey(), "lastWriteTimeDesc");
            }

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
            json[dirPath] = _sortType;
            window.localStorage.setItem("sortDir", JSON.stringify(json));

            console.log(`設定：${dirPath}  + ${_sortType}`)
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
                return _sortType;
            } else {
                let defaultSort = M.config.settings.sort["dirSort"];
                if (Object.keys(DirSortType).indexOf(defaultSort) === -1) {//如果找不到
                    defaultSort = DirSortType.name;
                }
                return defaultSort;
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
}
