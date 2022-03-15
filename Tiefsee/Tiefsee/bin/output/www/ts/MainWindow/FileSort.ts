
class FileSort {

    dom_fileSort_name = document.getElementById("menuitem-fileSort-name") as HTMLInputElement;
    dom_fileSort_nameDesc = document.getElementById("menuitem-fileSort-nameDesc") as HTMLInputElement;
    dom_fileSort_lastWriteTime = document.getElementById("menuitem-fileSort-lastWriteTime") as HTMLInputElement;
    dom_fileSort_lastWriteTimeDesc = document.getElementById("menuitem-fileSort-lastWriteTimeDesc") as HTMLInputElement;

    dom_dirSort_name = document.getElementById("menuitem-dirSort-name") as HTMLInputElement;
    dom_dirSort_nameDesc = document.getElementById("menuitem-dirSort-nameDesc") as HTMLInputElement;
    dom_dirSort_lastWriteTime = document.getElementById("menuitem-dirSort-lastWriteTime") as HTMLInputElement;
    dom_dirSort_lastWriteTimeDesc = document.getElementById("menuitem-dirSort-lastWriteTimeDesc") as HTMLInputElement;

    yesSvgTxt: string = "";

    defaultFileSort = FileSortType.name;
    defaultDirSort = FileSortType.name;

    sortType = FileSortType.name;//排序方式

    M: MainWindow;

    constructor(_M: MainWindow) {
        this.M = _M;
        this.init()
    }


    async init() {
        this.yesSvgTxt = SvgList["yes.svg"];

        //this.setFileSortMenu(FileSortType.lastWriteTimeDesc);

        this.dom_fileSort_name.addEventListener("click", () => {
            this.updateSort(FileSortType.name);
        });
        this.dom_fileSort_nameDesc.addEventListener("click", () => {
            this.updateSort(FileSortType.nameDesc);
        });
        this.dom_fileSort_lastWriteTime.addEventListener("click", () => {
            this.updateSort(FileSortType.lastWriteTime);
        });
        this.dom_fileSort_lastWriteTimeDesc.addEventListener("click", () => {
            this.updateSort(FileSortType.lastWriteTimeDesc);
        });

    }


    /**
     * 不重新載入圖片，只更新排序(用於排序選單的按鈕
     * @param _sortType 
     */
    async updateSort(_sortType: string) {

        this.sortType = _sortType;

        let path = this.M.fileLoad.getFilePath();
        let dirPath = Lib.GetDirectoryName(path);
        if (dirPath === null) { return; }
        this.setFileSortType(dirPath, this.sortType);

        let ar = await this.sort(this.M.fileLoad.getWaitingFile(), this.sortType)
        //目前檔案位置
        this.M.fileLoad.setFlagFile(0);
        for (let i = 0; i < ar.length; i++) {
            if (ar[i] == path) {
                this.M.fileLoad.setFlagFile(i);
                break;
            }
        }

        this.M.fileLoad.setWaitingFile(ar);
        this.M.fileLoad.updateTitle();//更新視窗標題
        this.M.mainFileList.select();//設定 檔案預覽列表 目前選中的項目
        this.M.mainFileList.updataLocation();//檔案預覽列表 自動捲動到選中項目的地方

        this.setFileSortMenu(_sortType);
    }


    /**
     * 更新menu選單
     * @param _sortType 
     */
    public setFileSortMenu(_sortType: string) {

        this.dom_fileSort_name.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
        this.dom_fileSort_nameDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
        this.dom_fileSort_lastWriteTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
        this.dom_fileSort_lastWriteTimeDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";

        if (_sortType === FileSortType.name) {
            this.dom_fileSort_name.getElementsByClassName("menu-hor-icon")[0].innerHTML = this.yesSvgTxt;
        }
        if (_sortType === FileSortType.nameDesc) {
            this.dom_fileSort_nameDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = this.yesSvgTxt;
        }
        if (_sortType === FileSortType.lastWriteTime) {
            this.dom_fileSort_lastWriteTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = this.yesSvgTxt;
        }
        if (_sortType === FileSortType.lastWriteTimeDesc) {
            this.dom_fileSort_lastWriteTimeDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = this.yesSvgTxt;
        }

        this.M.menu.close();//關閉menu
    }


    /**
     * 排序檔案
     * @param _type 排序類型
     * @returns 排序後的陣列
     */
    public async sort(arWaitingFile: string[], _type: string): Promise<string[]> {

        if (_type === FileSortType.name) {
            return await WV_System.Sort(arWaitingFile, "name");
        }
        if (_type === FileSortType.nameDesc) {
            return await WV_System.Sort(arWaitingFile, "nameDesc");
        }
        if (_type === FileSortType.lastWriteTime) {
            return await WV_System.Sort(arWaitingFile, "lastWriteTime");
        }
        if (_type === FileSortType.lastWriteTimeDesc) {
            return await WV_System.Sort(arWaitingFile, "lastWriteTimeDesc");
        }

        /*
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
        }*/


        return [];
    }


    /**
     * 設定該資料夾設定的檔案排序方式
     * @param dirPath 
     * @param _sortType 
     */
    public setFileSortType(dirPath: string, _sortType: string) {

        //取得原來的排序
        let t = window.localStorage.getItem("sortFile");
        let json: any = {};
        if (t !== null) {
            json = JSON.parse(t);
        }

        //儲存排序
        json[dirPath] = _sortType;
        window.localStorage.setItem("sortFile", JSON.stringify(json));

        console.log(`設定：${dirPath}  + ${_sortType}`)
    }


    /**
     * 取得該資料夾設定的檔案排序方式
     * @param dirPath 
     * @returns 
     */
    public getFileSortType(dirPath: string) {

        let t = window.localStorage.getItem("sortFile");

        if (t === null) { t = "{}" }//避免從來沒有儲存過
        let json = JSON.parse(t);
        let _sortType = json[dirPath];
        if (_sortType !== undefined) {
            return _sortType;
        } else {
            return this.defaultFileSort;
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
}
