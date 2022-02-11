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
  constructor(_M) {
    this.dom_fileSort_name = document.getElementById("menuitem-fileSort-name");
    this.dom_fileSort_nameDesc = document.getElementById("menuitem-fileSort-nameDesc");
    this.dom_fileSort_lastWriteTime = document.getElementById("menuitem-fileSort-lastWriteTime");
    this.dom_fileSort_lastWriteTimeDesc = document.getElementById("menuitem-fileSort-lastWriteTimeDesc");
    this.dom_dirSort_name = document.getElementById("menuitem-dirSort-name");
    this.dom_dirSort_nameDesc = document.getElementById("menuitem-dirSort-nameDesc");
    this.dom_dirSort_lastWriteTime = document.getElementById("menuitem-dirSort-lastWriteTime");
    this.dom_dirSort_lastWriteTimeDesc = document.getElementById("menuitem-dirSort-lastWriteTimeDesc");
    this.yesSvgTxt = "";
    this.M = _M;
    this.init();
  }
  init() {
    return __async(this, null, function* () {
      this.yesSvgTxt = SvgList["yes.svg"];
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
    });
  }
  setFileSortMenu(_type) {
    this.dom_fileSort_name.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
    this.dom_fileSort_nameDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
    this.dom_fileSort_lastWriteTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
    this.dom_fileSort_lastWriteTimeDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
    if (_type === FileSortType.name) {
      this.dom_fileSort_name.getElementsByClassName("menu-hor-icon")[0].innerHTML = this.yesSvgTxt;
      this.M.fileLoad.setSort(FileSortType.name);
      this.M.menu.close();
    }
    if (_type === FileSortType.nameDesc) {
      this.dom_fileSort_nameDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = this.yesSvgTxt;
      this.M.fileLoad.setSort(FileSortType.nameDesc);
      this.M.menu.close();
    }
    if (_type === FileSortType.lastWriteTime) {
      this.dom_fileSort_lastWriteTime.getElementsByClassName("menu-hor-icon")[0].innerHTML = this.yesSvgTxt;
      this.M.fileLoad.setSort(FileSortType.lastWriteTime);
      this.M.menu.close();
    }
    if (_type === FileSortType.lastWriteTimeDesc) {
      this.dom_fileSort_lastWriteTimeDesc.getElementsByClassName("menu-hor-icon")[0].innerHTML = this.yesSvgTxt;
      this.M.fileLoad.setSort(FileSortType.lastWriteTimeDesc);
      this.M.menu.close();
    }
  }
}
