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
class DirSort {
  constructor(M) {
    var dom_dirSort_name = document.getElementById("menuitem-dirSort-name");
    var dom_dirSort_nameDesc = document.getElementById("menuitem-dirSort-nameDesc");
    var dom_dirSort_lastWriteTime = document.getElementById("menuitem-dirSort-lastWriteTime");
    var dom_dirSort_lastWriteTimeDesc = document.getElementById("menuitem-dirSort-lastWriteTimeDesc");
    var yesSvgTxt = SvgList["yes.svg"];
    var defaultSort = DirSortType.name;
    var sortType = DirSortType.name;
    this.getSortType = () => {
      return sortType;
    };
    this.setSortType = (val) => {
      sortType = val;
    };
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
    function updateSort(_sortType) {
      return __async(this, null, function* () {
        sortType = _sortType;
        yield sort(sortType);
        let dirPath = M.fileLoad.getDirPath();
        let dirParentPath = Lib.GetDirectoryName(dirPath);
        if (dirParentPath === null) {
          dirParentPath = dirPath;
        }
        setDirSortType(dirParentPath, sortType);
        M.fileLoad.updateTitle();
        M.mainDirList.init();
        M.mainDirList.updataLocation();
        setDirSortMenu(_sortType);
      });
    }
    function setDirSortMenu(_sortType) {
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
      M.menu.close();
    }
    function sort(_type) {
      return __async(this, null, function* () {
        let path = M.fileLoad.getDirPath();
        let arDir = M.fileLoad.getWaitingDir();
        let arKey;
        if (_type === DirSortType.name) {
          arKey = yield WV_System.Sort(M.fileLoad.getWaitingDirKey(), "name");
        }
        if (_type === DirSortType.nameDesc) {
          arKey = yield WV_System.Sort(M.fileLoad.getWaitingDirKey(), "nameDesc");
        }
        if (_type === DirSortType.lastWriteTime) {
          arKey = yield WV_System.Sort(M.fileLoad.getWaitingDirKey(), "lastWriteTime");
        }
        if (_type === DirSortType.lastWriteTimeDesc) {
          arKey = yield WV_System.Sort(M.fileLoad.getWaitingDirKey(), "lastWriteTimeDesc");
        }
        let ar = {};
        for (let i = 0; i < arKey.length; i++) {
          const dirPath = arKey[i];
          ar[dirPath] = arDir[dirPath];
        }
        M.fileLoad.setWaitingDir(ar);
        yield M.fileLoad.updateFlagDir(path);
      });
    }
    function setDirSortType(dirPath, _sortType) {
      let t = window.localStorage.getItem("sortDir");
      let json = {};
      if (t !== null) {
        json = JSON.parse(t);
      }
      json[dirPath] = _sortType;
      window.localStorage.setItem("sortDir", JSON.stringify(json));
      console.log(`\u8A2D\u5B9A\uFF1A${dirPath}  + ${_sortType}`);
    }
    function getDirSortType(dirPath) {
      let t = window.localStorage.getItem("sortDir");
      if (t === null) {
        t = "{}";
      }
      let json = JSON.parse(t);
      let _sortType = json[dirPath];
      if (_sortType !== void 0) {
        return _sortType;
      } else {
        return defaultSort;
      }
    }
  }
}
var DirSortType = {
  name: "name",
  nameDesc: "nameDesc",
  lastWriteTime: "lastWriteTime",
  lastWriteTimeDesc: "lastWriteTimeDesc"
};
