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
    var arWaitingFile = [];
    var flag;
    var sortType = FileSortType.name;
    var groupType = "img";
    var fileLoadType;
    this.getArray = () => {
      return arWaitingFile;
    };
    this.loadFile = loadFile;
    this.loadFiles = loadFiles;
    this.next = next;
    this.prev = prev;
    this.getFilePath = getFilePath;
    this.getGroupType = getGroupType;
    this.setGroupType = setGroupType;
    this.getFileLoadType = getFileLoadType;
    this.deleteMsg = deleteMsg;
    this.renameMsg = renameMsg;
    this.setSort = setSort;
    function loadFiles(_0) {
      return __async(this, arguments, function* (dirPath, arName = []) {
        fileLoadType = FileLoadType.userDefined;
        arWaitingFile = yield WV_Directory.GetFiles2(dirPath, arName);
        let path = arWaitingFile[0];
        arWaitingFile = yield sort(sortType);
        flag = 0;
        for (let i = 0; i < arWaitingFile.length; i++) {
          if (arWaitingFile[i] == path) {
            flag = i;
            break;
          }
        }
        show();
      });
    }
    function loadFile(path) {
      return __async(this, null, function* () {
        fileLoadType = FileLoadType.dir;
        arWaitingFile = [];
        if ((yield WV_Directory.Exists(path)) === true) {
          arWaitingFile = yield WV_Directory.GetFiles(path, "*.*");
          arWaitingFile = yield sort(sortType);
          groupType = GroupType.img;
          arWaitingFile = yield filter();
        } else if ((yield WV_File.Exists(path)) === true) {
          let p = yield WV_Path.GetDirectoryName(path);
          arWaitingFile = yield WV_Directory.GetFiles(p, "*.*");
          let fileInfo2 = yield Lib.GetFileInfo2(path);
          groupType = fileToGroupType(fileInfo2);
          arWaitingFile = yield filter();
          if (arWaitingFile.indexOf(path) === -1) {
            arWaitingFile.splice(0, 0, path);
          }
          arWaitingFile = yield sort(sortType);
        }
        flag = 0;
        for (let i = 0; i < arWaitingFile.length; i++) {
          if (arWaitingFile[i] == path) {
            flag = i;
            break;
          }
        }
        show();
      });
    }
    function getFilePath() {
      var p = arWaitingFile[flag];
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
    function show(_flag) {
      return __async(this, null, function* () {
        if (_flag !== void 0) {
          flag = _flag;
        }
        if (flag < 0) {
          flag = 0;
        }
        if (flag >= arWaitingFile.length) {
          flag = arWaitingFile.length - 1;
        }
        if (arWaitingFile.length === 0) {
          M.fileShow.openWelcome();
          _show = () => __async(this, null, function* () {
          });
          return;
        }
        let path = getFilePath();
        let fileInfo2 = yield Lib.GetFileInfo2(path);
        if (fileInfo2.Type === "none") {
          arWaitingFile.splice(flag, 1);
          show(flag);
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
    function updateTitle() {
      let title = `\u300C${flag + 1}/${arWaitingFile.length}\u300D ${Lib.GetFileName(getFilePath())}`;
      baseWindow.setTitle(title);
    }
    function next() {
      return __async(this, null, function* () {
        flag += 1;
        if (flag >= arWaitingFile.length) {
          flag = 0;
        }
        show();
      });
    }
    function prev() {
      return __async(this, null, function* () {
        flag -= 1;
        if (flag < 0) {
          flag = arWaitingFile.length - 1;
        }
        show();
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
        for (let i = 0; i < arWaitingFile.length; i++) {
          let path = arWaitingFile[i];
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
    function sort(_type) {
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
            show();
            if (state === false) {
              Msgbox.show({ txt: "\u522A\u9664\u5931\u6557" });
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
            arWaitingFile[flag] = newName;
            updateTitle();
            Msgbox.close(dom);
          })
        });
        const len = fileName.length - Lib.GetExtension(path).length;
        msg.domInput.setSelectionRange(0, len);
      });
    }
    function setSort(type) {
      return __async(this, null, function* () {
        sortType = type;
        let path = getFilePath();
        let ar = yield sort(sortType);
        flag = 0;
        for (let i = 0; i < ar.length; i++) {
          if (ar[i] == path) {
            flag = i;
            break;
          }
        }
        arWaitingFile = ar;
        updateTitle();
      });
    }
  }
}
var FileLoadType = /* @__PURE__ */ ((FileLoadType2) => {
  FileLoadType2[FileLoadType2["dir"] = 0] = "dir";
  FileLoadType2[FileLoadType2["userDefined"] = 1] = "userDefined";
  return FileLoadType2;
})(FileLoadType || {});
var FileSortType = /* @__PURE__ */ ((FileSortType2) => {
  FileSortType2[FileSortType2["name"] = 0] = "name";
  FileSortType2[FileSortType2["nameDesc"] = 1] = "nameDesc";
  FileSortType2[FileSortType2["lastWriteTime"] = 2] = "lastWriteTime";
  FileSortType2[FileSortType2["lastWriteTimeDesc"] = 3] = "lastWriteTimeDesc";
  return FileSortType2;
})(FileSortType || {});
