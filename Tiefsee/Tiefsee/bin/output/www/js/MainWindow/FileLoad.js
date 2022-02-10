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
    var arWaitingList = [];
    var flag;
    var sortType = FileSortType.name;
    var groupType = "img";
    var fileLoadType;
    this.getArray = () => {
      return arWaitingList;
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
    function loadFiles(_0) {
      return __async(this, arguments, function* (dirPath, arName = []) {
        fileLoadType = FileLoadType.userDefined;
        arWaitingList = yield WV_Directory.GetFiles2(dirPath, arName);
        let path = arWaitingList[0];
        arWaitingList = yield sort(sortType);
        flag = 0;
        for (let i = 0; i < arWaitingList.length; i++) {
          if (arWaitingList[i] == path) {
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
        arWaitingList = [];
        if ((yield WV_Directory.Exists(path)) === true) {
          arWaitingList = yield WV_Directory.GetFiles(path, "*.*");
          arWaitingList = yield sort(sortType);
          groupType = GroupType.img;
          arWaitingList = yield filter();
        } else if ((yield WV_File.Exists(path)) === true) {
          let p = yield WV_Path.GetDirectoryName(path);
          arWaitingList = yield WV_Directory.GetFiles(p, "*.*");
          let fileInfo2 = yield Lib.GetFileInfo2(path);
          groupType = fileToGroupType(fileInfo2);
          arWaitingList = yield filter();
          if (arWaitingList.indexOf(path) === -1) {
            arWaitingList.splice(0, 0, path);
          }
          arWaitingList = yield sort(sortType);
        }
        flag = 0;
        for (let i = 0; i < arWaitingList.length; i++) {
          if (arWaitingList[i] == path) {
            flag = i;
            break;
          }
        }
        show();
      });
    }
    function getFilePath() {
      var p = arWaitingList[flag];
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
        if (flag >= arWaitingList.length) {
          flag = arWaitingList.length - 1;
        }
        if (arWaitingList.length === 0) {
          M.fileShow.openWelcome();
          _show = () => __async(this, null, function* () {
          });
          return;
        }
        let path = getFilePath();
        let fileInfo2 = yield Lib.GetFileInfo2(path);
        if (fileInfo2.Type === "none") {
          arWaitingList.splice(flag, 1);
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
      let title = `\u300C${flag + 1}/${arWaitingList.length}\u300D ${Lib.GetFileName(getFilePath())}`;
      baseWindow.setTitle(title);
    }
    function next() {
      return __async(this, null, function* () {
        flag += 1;
        if (flag >= arWaitingList.length) {
          flag = 0;
        }
        show();
      });
    }
    function prev() {
      return __async(this, null, function* () {
        flag -= 1;
        if (flag < 0) {
          flag = arWaitingList.length - 1;
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
        for (let i = 0; i < arWaitingList.length; i++) {
          let path = arWaitingList[i];
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
          return arWaitingList.sort(function(a, b) {
            return a.localeCompare(b, void 0, {
              numeric: true,
              sensitivity: "base"
            });
          });
        }
        if (_type === FileSortType.nameDesc) {
          return arWaitingList.sort(function(a, b) {
            return -1 * a.localeCompare(b, void 0, {
              numeric: true,
              sensitivity: "base"
            });
          });
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
            arWaitingList[flag] = newName;
            updateTitle();
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
var FileSortType = /* @__PURE__ */ ((FileSortType2) => {
  FileSortType2[FileSortType2["name"] = 0] = "name";
  FileSortType2[FileSortType2["nameDesc"] = 1] = "nameDesc";
  FileSortType2[FileSortType2["editDate"] = 2] = "editDate";
  FileSortType2[FileSortType2["editDateDesc"] = 3] = "editDateDesc";
  return FileSortType2;
})(FileSortType || {});
