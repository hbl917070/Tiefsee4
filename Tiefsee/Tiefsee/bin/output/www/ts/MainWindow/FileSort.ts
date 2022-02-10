
class FileSort {

    dom_fileSort_name = document.getElementById("menuitem-fileSort-name") as HTMLInputElement;
    dom_fileSort_nameDesc = document.getElementById("menuitem-fileSort-nameDesc") as HTMLInputElement;
    dom_fileSort_editDate = document.getElementById("menuitem-fileSort-editDate") as HTMLInputElement;
    dom_fileSort_editDateDesc = document.getElementById("menuitem-fileSort-editDateDesc") as HTMLInputElement;

    dom_dirSort_name = document.getElementById("menuitem-dirSort-name") as HTMLInputElement;
    dom_dirSort_nameDesc = document.getElementById("menuitem-dirSort-nameDesc") as HTMLInputElement;
    dom_dirSort_editDate = document.getElementById("menuitem-dirSort-editDate") as HTMLInputElement;
    dom_dirSort_editDateDesc = document.getElementById("menuitem-dirSort-editDateDesc") as HTMLInputElement;

    yesSvgTxt: string = "";


    constructor(M: MainWindow) {

        this.init()
    }


    async init() {
        this.yesSvgTxt = SvgList["yes.svg"];

        this.setFileSortMenu(FileSortType.editDateDesc);
        this.setFileSortMenu(FileSortType.editDate);

        this.dom_fileSort_name.addEventListener("click", () => {
            this.setFileSortMenu(FileSortType.name);
        });
        this.dom_fileSort_nameDesc.addEventListener("click", () => {
            this.setFileSortMenu(FileSortType.nameDesc);
        });
        this.dom_fileSort_editDate.addEventListener("click", () => {
            this.setFileSortMenu(FileSortType.editDate);
        });
        this.dom_fileSort_editDateDesc.addEventListener("click", () => {
            this.setFileSortMenu(FileSortType.editDateDesc);
        });

    }


    public setFileSortMenu(_type: FileSortType) {

        this.dom_fileSort_name.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
        this.dom_fileSort_nameDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
        this.dom_fileSort_editDate.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
        this.dom_fileSort_editDateDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";

        if (_type === FileSortType.name) {
            this.dom_fileSort_name.getElementsByClassName("menu-hor-icon")[0].innerHTML = this.yesSvgTxt;
        }
        if (_type === FileSortType.nameDesc) {
            this.dom_fileSort_nameDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = this.yesSvgTxt;
        }
        if (_type === FileSortType.editDate) {
            this.dom_fileSort_editDate.getElementsByClassName("menu-hor-icon")[0].innerHTML = this.yesSvgTxt;
        }
        if (_type === FileSortType.editDateDesc) {
            this.dom_fileSort_editDateDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = this.yesSvgTxt;
        }
    }

}