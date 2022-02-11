
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


    M: MainWindow;

    constructor(_M: MainWindow) {
        this.M = _M;
        this.init()
    }


    async init() {
        this.yesSvgTxt = SvgList["yes.svg"];

        //this.setFileSortMenu(FileSortType.lastWriteTimeDesc);

        this.dom_fileSort_name.addEventListener("click", () => {
            this.setFileSortMenu(FileSortType.name);
        });
        this.dom_fileSort_nameDesc.addEventListener("click", () => {
            this.setFileSortMenu(FileSortType.nameDesc);
        });
        this.dom_fileSort_lastWriteTime.addEventListener("click", () => {
            this.setFileSortMenu(FileSortType.lastWriteTime);
        });
        this.dom_fileSort_lastWriteTimeDesc.addEventListener("click", () => {
            this.setFileSortMenu(FileSortType.lastWriteTimeDesc);
        });

    }


    public setFileSortMenu(_type: FileSortType) {

        this.dom_fileSort_name.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
        this.dom_fileSort_nameDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
        this.dom_fileSort_lastWriteTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
        this.dom_fileSort_lastWriteTimeDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";

        if (_type === FileSortType.name) {
            this.dom_fileSort_name.getElementsByClassName("menu-hor-icon")[0].innerHTML = this.yesSvgTxt;
            this.M.fileLoad.setSort(FileSortType.name);
            this. M.menu.close();//關閉menu
        }
        if (_type === FileSortType.nameDesc) {
            this.dom_fileSort_nameDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = this.yesSvgTxt;
            this.M.fileLoad.setSort(FileSortType.nameDesc);
            this. M.menu.close();//關閉menu
        }
        if (_type === FileSortType.lastWriteTime) {
            this.dom_fileSort_lastWriteTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = this.yesSvgTxt;
            this.M.fileLoad.setSort(FileSortType.lastWriteTime);
            this. M.menu.close();//關閉menu
        }
        if (_type === FileSortType.lastWriteTimeDesc) {
            this.dom_fileSort_lastWriteTimeDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = this.yesSvgTxt;
            this.M.fileLoad.setSort(FileSortType.lastWriteTimeDesc);
            this. M.menu.close();//關閉menu
        }
    }

}