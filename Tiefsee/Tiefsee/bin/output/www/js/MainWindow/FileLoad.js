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
class FileLoad {
  constructor(M) {
    var groupType = "img";
    var fileLoadType;
    var arFile = [];
    var flagFile;
    var dirPath = "";
    var arDir = {};
    var arDirKey = [];
    var flagDir;
    this.getWaitingFile = () => {
      return arFile;
    };
    this.setWaitingFile = (ar) => {
      arFile = ar;
    };
    this.getFlagFile = () => {
      return flagFile;
    };
    this.setFlagFile = (n) => {
      flagFile = n;
    };
    this.getWaitingDir = () => {
      return arDir;
    };
    this.getWaitingDirKey = () => {
      return arDirKey;
    };
    this.getFlagDir = () => {
      return flagDir;
    };
    this.setFlagDir = (n) => {
      flagDir = n;
    };
    this.loadFile = loadFile;
    this.loadFiles = loadFiles;
    this.nextFile = nextFile;
    this.prevFile = prevFile;
    this.showFile = showFile;
    this.getFilePath = getFilePath;
    this.getGroupType = getGroupType;
    this.setGroupType = setGroupType;
    this.getFileLoadType = getFileLoadType;
    this.deleteMsg = deleteMsg;
    this.renameMsg = renameMsg;
    this.updateTitle = updateTitle;
    this.showDir = showDir;
    function initFlagDir() {
    }
    var temp_dirParent = "";
    function initDirList(_dirPath) {
      return __async(this, null, function* () {
        if (dirPath === _dirPath) {
          return;
        }
        dirPath = _dirPath;
        let dirParent = yield WV_Path.GetDirectoryName(_dirPath);
        if (temp_dirParent == dirParent) {
          return;
        }
        temp_dirParent = dirParent;
        let json = yield WV_Directory.GetSiblingDir(dirPath, ["jpg", "png"]);
        if (dirPath !== _dirPath) {
          return;
        }
        arDir = JSON.parse(json);
        arDirKey = Object.keys(arDir);
        for (let i = 0; i < arDirKey.length; i++) {
          const path = arDirKey[i];
          if (path === _dirPath) {
            flagDir = i;
            break;
          }
        }
        M.mainDirList.initDirList();
        M.mainDirList.setStartLocation();
      });
    }
    function loadFiles(_0) {
      return __async(this, arguments, function* (dirPath2, arName = []) {
        fileLoadType = FileLoadType.userDefined;
        arFile = yield WV_Directory.GetFiles2(dirPath2, arName);
        let path = arFile[0];
        M.fileSort.sortType = M.fileSort.getFileSortType(dirPath2);
        M.fileSort.setFileSortMenu(M.fileSort.sortType);
        arFile = yield M.fileSort.sort(arFile, M.fileSort.sortType);
        flagFile = 0;
        for (let i = 0; i < arFile.length; i++) {
          if (arFile[i] == path) {
            flagFile = i;
            break;
          }
        }
        M.mainFileList.initFileList();
        yield showFile();
        M.mainFileList.setStartLocation();
      });
    }
    function loadFile(path) {
      return __async(this, null, function* () {
        fileLoadType = FileLoadType.dir;
        let dirPath2 = "";
        arFile = [];
        if ((yield WV_Directory.Exists(path)) === true) {
          dirPath2 = path;
          arFile = yield WV_Directory.GetFiles(path, "*.*");
          M.fileSort.sortType = M.fileSort.getFileSortType(path);
          M.fileSort.setFileSortMenu(M.fileSort.sortType);
          arFile = yield M.fileSort.sort(arFile, M.fileSort.sortType);
          groupType = GroupType.img;
          arFile = yield filter();
        } else if ((yield WV_File.Exists(path)) === true) {
          dirPath2 = yield WV_Path.GetDirectoryName(path);
          arFile = yield WV_Directory.GetFiles(dirPath2, "*.*");
          let fileInfo2 = yield Lib.GetFileInfo2(path);
          groupType = fileToGroupType(fileInfo2);
          arFile = yield filter();
          if (arFile.indexOf(path) === -1) {
            arFile.splice(0, 0, path);
          }
          M.fileSort.sortType = M.fileSort.getFileSortType(dirPath2);
          M.fileSort.setFileSortMenu(M.fileSort.sortType);
          arFile = yield M.fileSort.sort(arFile, M.fileSort.sortType);
        }
        flagFile = 0;
        for (let i = 0; i < arFile.length; i++) {
          if (arFile[i] == path) {
            flagFile = i;
            break;
          }
        }
        M.mainFileList.initFileList();
        yield showFile();
        M.mainFileList.setStartLocation();
        yield initDirList(dirPath2);
        M.mainDirList.select();
        M.mainDirList.updataLocation();
      });
    }
    function getFilePath() {
      var p = arFile[flagFile];
      return p;
    }
    function getFileLoadType() {
      return fileLoadType;
    }
    var _show = () => __async(this, null, function* () {
    });
    function timer01() {
      return __async(this, null, function* () {
        let func = _show;
        _show = () => __async(this, null, function* () {
        });
        yield func();
        setTimeout(() => {
          timer01();
        }, 5);
      });
    }
    timer01();
    function showFile(_flag) {
      return __async(this, null, function* () {
        if (_flag !== void 0) {
          flagFile = _flag;
        }
        if (flagFile < 0) {
          flagFile = 0;
        }
        if (flagFile >= arFile.length) {
          flagFile = arFile.length - 1;
        }
        if (arFile.length === 0) {
          M.fileShow.openWelcome();
          _show = () => __async(this, null, function* () {
          });
          return;
        }
        M.mainFileList.setHide(false);
        M.mainFileList.select();
        M.mainFileList.updataLocation();
        let path = getFilePath();
        let fileInfo2 = yield Lib.GetFileInfo2(path);
        if (fileInfo2.Type === "none") {
          arFile.splice(flagFile, 1);
          M.mainFileList.initFileList();
          showFile(flagFile);
          _show = () => __async(this, null, function* () {
          });
          return;
        }
        updateTitle();
        if (fileLoadType === FileLoadType.userDefined) {
          groupType = fileToGroupType(fileInfo2);
        }
        _show = () => __async(this, null, function* () {
          if (groupType === GroupType.img || groupType === GroupType.unknown) {
            yield M.fileShow.openImage(fileInfo2);
          }
          if (groupType === GroupType.pdf) {
            yield M.fileShow.openPdf(fileInfo2);
          }
          if (groupType === GroupType.txt) {
            yield M.fileShow.openTxt(fileInfo2);
          }
        });
      });
    }
    function showDir(_flag) {
      return __async(this, null, function* () {
        if (_flag !== void 0) {
          flagDir = _flag;
        }
        if (flagDir < 0) {
          flagDir = 0;
        }
        if (flagDir >= arDirKey.length) {
          flagDir = arDirKey.length - 1;
        }
        let path = arDirKey[flagDir];
        loadFile(path);
      });
    }
    function updateTitle() {
      let title = `\u300C${flagFile + 1}/${arFile.length}\u300D ${Lib.GetFileName(getFilePath())}`;
      baseWindow.setTitle(title);
    }
    function nextFile() {
      return __async(this, null, function* () {
        flagFile += 1;
        if (flagFile >= arFile.length) {
          flagFile = 0;
        }
        showFile();
      });
    }
    function prevFile() {
      return __async(this, null, function* () {
        flagFile -= 1;
        if (flagFile < 0) {
          flagFile = arFile.length - 1;
        }
        showFile();
      });
    }
    function fileToGroupType(fileInfo2) {
      let fileExt = Lib.GetFileType(fileInfo2);
      for (var type in GroupType) {
        for (let j = 0; j < M.config.allowFileType(type).length; j++) {
          const fileType = M.config.allowFileType(type)[j];
          if (fileExt == fileType["ext"]) {
            return type;
          }
        }
      }
      return GroupType.unknown;
    }
    function getGroupType() {
      return groupType;
    }
    function setGroupType(type) {
      groupType = type;
    }
    function filter() {
      return __async(this, null, function* () {
        let ar = [];
        for (let i = 0; i < arFile.length; i++) {
          let path = arFile[i];
          let fileExt = Lib.GetExtension(path).toLocaleLowerCase();
          for (let j = 0; j < M.config.allowFileType(groupType).length; j++) {
            const fileType = M.config.allowFileType(groupType)[j];
            if (fileExt == "." + fileType["ext"]) {
              ar.push(path);
              break;
            }
          }
        }
        return ar;
      });
    }
    function deleteMsg() {
      return __async(this, null, function* () {
        let path = getFilePath();
        Msgbox.show({
          type: "radio",
          txt: `\u522A\u9664\u6A94\u6848<br>` + Lib.GetFileName(path),
          arRadio: [
            { value: "1", name: "\u79FB\u81F3\u8CC7\u6E90\u56DE\u6536\u6876" },
            { value: "2", name: "\u6C38\u4E45\u522A\u9664\u6A94\u6848" }
          ],
          radioValue: "1",
          funcYes: (dom, value) => __async(this, null, function* () {
            Msgbox.close(dom);
            let state = true;
            if (value == "1") {
              state = yield WV_File.MoveToRecycle(path);
            }
            if (value == "2") {
              state = yield WV_File.Delete(path);
            }
            if (state === false) {
              Msgbox.show({ txt: "\u522A\u9664\u5931\u6557" });
            } else {
              yield showFile();
              M.mainFileList.initFileList();
              M.mainFileList.select();
              M.mainFileList.updataLocation();
            }
          })
        });
      });
    }
    function renameMsg() {
      return __async(this, null, function* () {
        let path = getFilePath();
        let fileName = Lib.GetFileName(path);
        let msg = Msgbox.show({
          txt: "\u91CD\u65B0\u547D\u540D\u6A94\u6848",
          type: "text",
          inputTxt: fileName,
          funcYes: (dom, inputTxt) => __async(this, null, function* () {
            if (inputTxt.trim() == "") {
              Msgbox.show({ txt: "\u5FC5\u9808\u8F38\u5165\u6A94\u540D" });
              return;
            }
            if (inputTxt.search(/[\\]|[/]|[:]|[*]|[?]|["]|[<]|[>]|[|]/) != -1) {
              Msgbox.show({ txt: '\u6A94\u6848\u540D\u7A31\u4E0D\u53EF\u4EE5\u5305\u542B\u4E0B\u5217\u4EFB\u610F\u5B57\u5143\uFF1A<br>\\ / : * ? " < > |' });
              return;
            }
            if (fileName == inputTxt) {
              Msgbox.close(dom);
              return;
            }
            let newName = Lib.Combine([yield WV_Path.GetDirectoryName(path), inputTxt]);
            let err = yield WV_File.Move(path, newName);
            if (err != "") {
              Msgbox.show({ txt: "\u91CD\u65B0\u547D\u540D\u5931\u6557\uFF1A<br>" + err });
              return;
            }
            arFile[flagFile] = newName;
            updateTitle();
            M.mainFileList.initFileList();
            M.mainFileList.select();
            M.mainFileList.updataLocation();
            Msgbox.close(dom);
          })
        });
        const len = fileName.length - Lib.GetExtension(path).length;
        msg.domInput.setSelectionRange(0, len);
      });
    }
  }
}
var FileLoadType = /* @__PURE__ */ ((FileLoadType2) => {
  FileLoadType2[FileLoadType2["dir"] = 0] = "dir";
  FileLoadType2[FileLoadType2["userDefined"] = 1] = "userDefined";
  return FileLoadType2;
})(FileLoadType || {});
