import { Lib } from "../Lib";
import { WebAPI } from "../WebAPI";
import { MainWindow } from "./MainWindow";

export class DirSort {

    // public getSortType;
    public readSortType;
    public updateMenu;
    public sort;

    constructor(M: MainWindow) {

        const _domDirSort_name = document.getElementById("menuitem-dirSort-name") as HTMLInputElement;
        const _domDirSortLastWriteTime = document.getElementById("menuitem-dirSort-lastWriteTime") as HTMLInputElement;
        const _domDirSortLastAccessTime = document.getElementById("menuitem-dirSort-lastAccessTime") as HTMLInputElement;
        const _domDirSortCreationTime = document.getElementById("menuitem-dirSort-creationTime") as HTMLInputElement;
        const _domDirSortRandom = document.getElementById("menuitem-dirSort-random") as HTMLInputElement;

        const _domDirSortAsc = document.getElementById("menuitem-dirSort-asc") as HTMLInputElement;
        const _domDirSortDesc = document.getElementById("menuitem-dirSort-desc") as HTMLInputElement;

        const _yesSvgTxt = SvgList["yes.svg"];
        var _sortType = DirSortType.name; // 排序方式
        var _orderbyType = DirOrderbyType.asc;

        // this.getSortType = () => { return sortType }
        // this.setSortType = (val: string) => { sortType = val; }
        this.readSortType = readSortType;
        // this.setDirSortType = setDirSortType;
        this.updateMenu = updateMenu;
        this.sort = sort;

        _domDirSort_name.addEventListener("click", () => {
            _sortType = DirSortType.name;
            updateSort();
        });
        _domDirSortLastWriteTime.addEventListener("click", () => {
            _sortType = DirSortType.lastWriteTime;
            updateSort();
        });
        _domDirSortLastAccessTime.addEventListener("click", () => {
            _sortType = DirSortType.lastAccessTime;
            updateSort();
        });
        _domDirSortCreationTime.addEventListener("click", () => {
            _sortType = DirSortType.creationTime;
            updateSort();
        });
        _domDirSortRandom.addEventListener("click", () => {
            _sortType = DirSortType.random;
            updateSort();
        });

        _domDirSortAsc.addEventListener("click", () => {
            _orderbyType = DirOrderbyType.asc
            updateSort();
        });
        _domDirSortDesc.addEventListener("click", () => {
            _orderbyType = DirOrderbyType.desc
            updateSort();
        });

        /**
         * 不重新載入圖片，只更新排序(用於排序選單的按鈕
         * @param _sortType 
         */
        async function updateSort() {

            // sortType = _sortType;
            if (_orderbyType === DirOrderbyType.desc) {
                if (_sortType === DirSortType.name) { _sortType = DirSortType.nameDesc; }
                if (_sortType === DirSortType.lastWriteTime) { _sortType = DirSortType.lastWriteTimeDesc; }
                if (_sortType === DirSortType.lastAccessTime) { _sortType = DirSortType.lastAccessTimeDesc; }
                if (_sortType === DirSortType.creationTime) { _sortType = DirSortType.creationTimeDesc; }
            }
            if (_orderbyType === DirOrderbyType.asc) {
                if (_sortType === DirSortType.nameDesc) { _sortType = DirSortType.name; }
                if (_sortType === DirSortType.lastWriteTimeDesc) { _sortType = DirSortType.lastWriteTime; }
                if (_sortType === DirSortType.lastAccessTimeDesc) { _sortType = DirSortType.lastAccessTime; }
                if (_sortType === DirSortType.creationTimeDesc) { _sortType = DirSortType.creationTime; }
            }

            await sort()

            // 使用 父親資料夾 當做key來記錄排序
            let dirPath = M.fileLoad.getDirPath()
            let dirParentPath = Lib.getDirectoryName(dirPath)
            if (dirParentPath === null) {
                dirParentPath = dirPath;
            }
            setDirSortType(dirParentPath, _sortType);

            M.fileLoad.updateTitle(); // 更新視窗標題
            M.mainDirList.init(); // 設定 檔案預覽視窗 目前選中的項目
            M.mainDirList.updateLocation(); // 檔案預覽視窗 自動捲動到選中項目的地方

            updateMenu();
            // M.menu.close(); // 關閉menu
        }

        /**
         * 更新menu選單
         * @param _sortType 
         */
        function updateMenu() {

            _domDirSort_name.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            _domDirSortLastWriteTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            _domDirSortLastAccessTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            _domDirSortCreationTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            _domDirSortRandom.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";

            _domDirSortAsc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            _domDirSortDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";

            if (_sortType === DirSortType.name || _sortType === DirSortType.nameDesc) {
                _domDirSort_name.getElementsByClassName("menu-hor-icon")[0].innerHTML = _yesSvgTxt;
            }
            if (_sortType === DirSortType.lastWriteTime || _sortType === DirSortType.lastWriteTimeDesc) {
                _domDirSortLastWriteTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = _yesSvgTxt;
            }
            if (_sortType === DirSortType.lastAccessTime || _sortType === DirSortType.lastAccessTimeDesc) {
                _domDirSortLastAccessTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = _yesSvgTxt;
            }
            if (_sortType === DirSortType.creationTime || _sortType === DirSortType.creationTimeDesc) {
                _domDirSortCreationTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = _yesSvgTxt;
            }
            if (_sortType === DirSortType.random) {
                _domDirSortRandom.getElementsByClassName("menu-hor-icon")[0].innerHTML = _yesSvgTxt;
            }

            if (_orderbyType === DirOrderbyType.asc) {
                _domDirSortAsc.getElementsByClassName("menu-hor-icon")[0].innerHTML = _yesSvgTxt;
            }
            if (_orderbyType === DirOrderbyType.desc) {
                _domDirSortDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = _yesSvgTxt;
            }
            // M.menu.close(); // 關閉menu
        }

        /**
         * 排序檔案
         * @param _type 排序類型
         * @returns 排序後的陣列
         */
        async function sort(path?: string) {

            if (path === undefined) {
                path = M.fileLoad.getDirPath();
            }
            let arDir = M.fileLoad.getWaitingDir();
            let arKey = M.fileLoad.getWaitingDirKey();

            if (arKey.length <= 1) { return; } // 只有1筆資料就不需要排序

            arKey = await WebAPI.sort2(arKey, _sortType);

            // 排序後把資料放回 WaitingDir
            let ar: { [key: string]: string[] } = {}
            for (let i = 0; i < arKey.length; i++) {
                const dirPath = arKey[i];
                ar[dirPath] = arDir[dirPath];
            }
            M.fileLoad.setWaitingDir(ar);

            // 更新 flagDir (目前在哪一個資料夾
            await M.fileLoad.updateFlagDir(path);
        }

        /**
         * 設定該資料夾設定的檔案排序方式
         * @param dirPath 
         * @param sortType 
         */
        function setDirSortType(dirPath: string, sortType: string) {

            // 取得原來的排序
            let t = window.localStorage.getItem("sortDir");
            let json: any = {};
            if (t !== null) {
                json = JSON.parse(t);
            }

            // 儲存排序
            json[dirPath] = sortType;
            window.localStorage.setItem("sortDir", JSON.stringify(json));
        }

        /**
         * 取得該資料夾設定的檔案排序方式
         * @param dirPath 
         * @returns 
         */
        function readSortType(dirPath: string) {

            let t = window.localStorage.getItem("sortDir");

            if (t === null) { t = "{}" } // 避免從來沒有儲存過
            const json = JSON.parse(t);
            let sortType = json[dirPath];
            if (sortType !== undefined) {
                _sortType = sortType;
            } else {
                let defaultSort = M.config.settings.sort["dirSort"];
                if (Object.keys(DirSortType).indexOf(defaultSort) === -1) { //如果找不到
                    defaultSort = DirSortType.name;
                }
                _sortType = defaultSort;
            }

            if (_sortType.indexOf("Desc") !== -1) {
                _orderbyType = DirOrderbyType.desc;
            } else {
                _orderbyType = DirOrderbyType.asc;
            }
        }

    }

}

/**
 * 排序類型
 */
export const DirSortType = {
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
export const DirOrderbyType = {
    desc: "desc",
    asc: "asc",
}
