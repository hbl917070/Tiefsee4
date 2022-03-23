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
    this.defaultFileSort = FileSortType.name;
    this.defaultDirSort = FileSortType.name;
    this.sortType = FileSortType.name;
    this.M = _M;
    this.init();
  }
  init() {
    return __async(this, null, function* () {
      this.yesSvgTxt = SvgList["yes.svg"];
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
    });
  }
  updateSort(_sortType) {
    return __async(this, null, function* () {
      this.sortType = _sortType;
      let path = this.M.fileLoad.getFilePath();
      let dirPath = Lib.GetDirectoryName(path);
      if (dirPath === null) {
        return;
      }
      this.setFileSortType(dirPath, this.sortType);
      let ar = yield this.sort(this.M.fileLoad.getWaitingFile(), this.sortType);
      this.M.fileLoad.setFlagFile(0);
      for (let i = 0; i < ar.length; i++) {
        if (ar[i] == path) {
          this.M.fileLoad.setFlagFile(i);
          break;
        }
      }
      this.M.fileLoad.setWaitingFile(ar);
      this.M.fileLoad.updateTitle();
      this.M.mainFileList.select();
      this.M.mainFileList.updataLocation();
      this.setFileSortMenu(_sortType);
      this.M.menu.close();
    });
  }
  setFileSortMenu(_sortType) {
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
  }
  sort(arWaitingFile, _type) {
    return __async(this, null, function* () {
      if (_type === FileSortType.name) {
        return yield WV_System.Sort(arWaitingFile, "name");
      }
      if (_type === FileSortType.nameDesc) {
        return yield WV_System.Sort(arWaitingFile, "nameDesc");
      }
      if (_type === FileSortType.lastWriteTime) {
        return yield WV_System.Sort(arWaitingFile, "lastWriteTime");
      }
      if (_type === FileSortType.lastWriteTimeDesc) {
        return yield WV_System.Sort(arWaitingFile, "lastWriteTimeDesc");
      }
      return [];
    });
  }
  setFileSortType(dirPath, _sortType) {
    let t = window.localStorage.getItem("sortFile");
    let json = {};
    if (t !== null) {
      json = JSON.parse(t);
    }
    json[dirPath] = _sortType;
    window.localStorage.setItem("sortFile", JSON.stringify(json));
    console.log(`\u8A2D\u5B9A\uFF1A${dirPath}  + ${_sortType}`);
  }
  getFileSortType(dirPath) {
    let t = window.localStorage.getItem("sortFile");
    if (t === null) {
      t = "{}";
    }
    let json = JSON.parse(t);
    let _sortType = json[dirPath];
    if (_sortType !== void 0) {
      return _sortType;
    } else {
      return this.defaultFileSort;
    }
  }
}
var FileSortType = {
  name: "name",
  nameDesc: "nameDesc",
  lastWriteTime: "lastWriteTime",
  lastWriteTimeDesc: "lastWriteTimeDesc"
};
