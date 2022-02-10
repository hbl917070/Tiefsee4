var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class FileSort {
  constructor(M) {
    this.dom_fileSort_name = document.getElementById("menuitem-fileSort-name");
    this.dom_fileSort_nameDesc = document.getElementById("menuitem-fileSort-nameDesc");
    this.dom_fileSort_editDate = document.getElementById("menuitem-fileSort-editDate");
    this.dom_fileSort_editDateDesc = document.getElementById("menuitem-fileSort-editDateDesc");
    this.dom_dirSort_name = document.getElementById("menuitem-dirSort-name");
    this.dom_dirSort_nameDesc = document.getElementById("menuitem-dirSort-nameDesc");
    this.dom_dirSort_editDate = document.getElementById("menuitem-dirSort-editDate");
    this.dom_dirSort_editDateDesc = document.getElementById("menuitem-dirSort-editDateDesc");
    this.yesSvgTxt = "";
    this.init();
  }
  init() {
    return __async(this, null, function* () {
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
    });
  }
  setFileSortMenu(_type) {
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
