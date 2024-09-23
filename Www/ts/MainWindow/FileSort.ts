class FileSort {

    public readSortType;
    public updateMenu;
    public sort;
    public getSortType;
    public getOrderbyType;

    constructor(M: MainWindow) {
        const _domFileSortName = document.getElementById("menuitem-fileSort-name") as HTMLInputElement;
        const _domFileSortLastWriteTime = document.getElementById("menuitem-fileSort-lastWriteTime") as HTMLInputElement;
        const _domFileSortLength = document.getElementById("menuitem-fileSort-length") as HTMLInputElement;
        const _domFileSortLastAccessTime = document.getElementById("menuitem-fileSort-lastAccessTime") as HTMLInputElement;
        const _domFileSortCreationTime = document.getElementById("menuitem-fileSort-creationTime") as HTMLInputElement;
        const _domFileSortRandom = document.getElementById("menuitem-fileSort-random") as HTMLInputElement;

        const _domFileSortAsc = document.getElementById("menuitem-fileSort-asc") as HTMLInputElement;
        const _domFileSortDesc = document.getElementById("menuitem-fileSort-desc") as HTMLInputElement;

        const _yesSvgTxt = SvgList["yes.svg"];
        var _sortType = FileSortType.name; //排序方式
        var _orderbyType = FileOrderbyType.asc;

        this.readSortType = readSortType;
        this.updateMenu = updateMenu;
        this.sort = sort;
        this.getSortType = () => { return _sortType; }
        this.getOrderbyType = () => { return _orderbyType; }

        _domFileSortName.addEventListener("click", () => {
            _sortType = FileSortType.name;
            updateSort();
        });
        _domFileSortLastWriteTime.addEventListener("click", () => {
            _sortType = FileSortType.lastWriteTime;
            updateSort();
        });
        _domFileSortLength.addEventListener("click", () => {
            _sortType = FileSortType.length;
            updateSort();
        });
        _domFileSortLastAccessTime.addEventListener("click", () => {
            _sortType = FileSortType.lastAccessTime;
            updateSort();
        });
        _domFileSortCreationTime.addEventListener("click", () => {
            _sortType = FileSortType.creationTime;
            updateSort();
        });
        _domFileSortRandom.addEventListener("click", () => {
            _sortType = FileSortType.random;
            updateSort();
        });

        _domFileSortAsc.addEventListener("click", () => {
            _orderbyType = FileOrderbyType.asc;
            updateSort();
        });
        _domFileSortDesc.addEventListener("click", () => {
            _orderbyType = FileOrderbyType.desc;
            updateSort();
        });

        /**
         * 不重新載入圖片，只更新排序(用於排序選單的按鈕
         */
        async function updateSort() {

            if (_orderbyType === FileOrderbyType.desc) {
                if (_sortType === FileSortType.name) { _sortType = FileSortType.nameDesc; }
                if (_sortType === FileSortType.lastWriteTime) { _sortType = FileSortType.lastWriteTimeDesc; }
                if (_sortType === FileSortType.length) { _sortType = FileSortType.lengthDesc; }
                if (_sortType === FileSortType.lastAccessTime) { _sortType = FileSortType.lastAccessTimeDesc; }
                if (_sortType === FileSortType.creationTime) { _sortType = FileSortType.creationTimeDesc; }
            }
            if (_orderbyType === FileOrderbyType.asc) {
                if (_sortType === FileSortType.nameDesc) { _sortType = FileSortType.name; }
                if (_sortType === FileSortType.lastWriteTimeDesc) { _sortType = FileSortType.lastWriteTime; }
                if (_sortType === FileSortType.lengthDesc) { _sortType = FileSortType.length; }
                if (_sortType === FileSortType.lastAccessTimeDesc) { _sortType = FileSortType.lastAccessTime; }
                if (_sortType === FileSortType.creationTimeDesc) { _sortType = FileSortType.creationTime; }
            }

            const path = M.fileLoad.getFilePath();
            const dirPath = Lib.getDirectoryName(path);
            if (dirPath === null) { return; }
            setFileSortType(dirPath);

            const ar = await sort(M.fileLoad.getWaitingFile())
            // 目前檔案位置
            M.fileLoad.setFlagFile(0);
            for (let i = 0; i < ar.length; i++) {
                if (ar[i] == path) {
                    M.fileLoad.setFlagFile(i);
                    break;
                }
            }

            M.fileLoad.setWaitingFile(ar);
            M.fileLoad.updateTitle(); // 更新視窗標題

            M.mainFileList.init(); // 檔案預覽視窗 初始化
            M.mainFileList.updateLocation(); // 檔案預覽視窗 自動捲動到選中項目的地方

            updateMenu();

            if (M.fileLoad.getIsBulkView()) { // 如果是在大量瀏覽模式，則重新載入名單
                M.bulkView.load();
            }
        }

        /**
         * 更新 menu 選單
         */
        function updateMenu() {

            _domFileSortName.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            _domFileSortLastWriteTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            _domFileSortLength.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            _domFileSortLastAccessTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            _domFileSortCreationTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            _domFileSortRandom.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";

            _domFileSortAsc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
            _domFileSortDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";

            if (_sortType === FileSortType.name || _sortType === FileSortType.nameDesc) {
                _domFileSortName.getElementsByClassName("menu-hor-icon")[0].innerHTML = _yesSvgTxt;
            }
            if (_sortType === FileSortType.lastWriteTime || _sortType === FileSortType.lastWriteTimeDesc) {
                _domFileSortLastWriteTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = _yesSvgTxt;
            }
            if (_sortType === FileSortType.length || _sortType === FileSortType.lengthDesc) {
                _domFileSortLength.getElementsByClassName("menu-hor-icon")[0].innerHTML = _yesSvgTxt;
            }
            if (_sortType === FileSortType.lastAccessTime || _sortType === FileSortType.lastAccessTimeDesc) {
                _domFileSortLastAccessTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = _yesSvgTxt;
            }
            if (_sortType === FileSortType.creationTime || _sortType === FileSortType.creationTimeDesc) {
                _domFileSortCreationTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = _yesSvgTxt;
            }
            if (_sortType === FileSortType.random) {
                _domFileSortRandom.getElementsByClassName("menu-hor-icon")[0].innerHTML = _yesSvgTxt;
            }

            if (_orderbyType === FileOrderbyType.asc) {
                _domFileSortAsc.getElementsByClassName("menu-hor-icon")[0].innerHTML = _yesSvgTxt;
            }
            if (_orderbyType === FileOrderbyType.desc) {
                _domFileSortDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = _yesSvgTxt;
            }
        }

        /**
         * 排序檔案
         * @param arWaitingFile 等待排序的檔案 
         * @returns 排序後的陣列
         */
        async function sort(arWaitingFile: string[]) {
            arWaitingFile = await WebAPI.sort2(arWaitingFile, _sortType);
            return arWaitingFile;
        }

        /**
         * 設定該資料夾設定的檔案排序方式
         * @param dirPath 
         */
        function setFileSortType(dirPath: string) {

            // 取得原來的排序
            let t = window.localStorage.getItem("sortFile");
            let json: any = {};
            if (t !== null) {
                json = JSON.parse(t);
            }

            // 儲存排序
            json[dirPath] = _sortType;
            window.localStorage.setItem("sortFile", JSON.stringify(json));
        }

        /**
         * 取得該資料夾設定的檔案排序方式
         * @param dirPath 
         * @returns 
         */
        function readSortType(dirPath: string) {

            let t = window.localStorage.getItem("sortFile");

            if (t === null) { t = "{}" } // 避免從來沒有儲存過
            let json = JSON.parse(t);
            let sortType = json[dirPath];

            if (sortType !== undefined) {
                _sortType = sortType;
            } else {
                let defaultSort = M.config.settings.sort["fileSort"];
                if (Object.keys(FileSortType).indexOf(defaultSort) === -1) { // 如果找不到
                    defaultSort = FileSortType.name;
                }
                _sortType = defaultSort;
            }

            if (_sortType.indexOf("Desc") !== -1) {
                _orderbyType = FileOrderbyType.desc;
            } else {
                _orderbyType = FileOrderbyType.asc;
            }
        }

    }

}

/**
 * 排序類型
 */
const FileSortType = {
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
const FileOrderbyType = {
    desc: "desc",
    asc: "asc",
}
