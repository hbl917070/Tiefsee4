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
class Script {
  constructor(M) {
    this.img = new ScriptImg(M);
    this.fileLoad = new ScriptFileLoad(M);
    this.fileShow = new ScriptFileShow(M);
    this.file = new ScriptFile(M);
    this.menu = new ScriptMenu(M);
    this.open = new ScriptOpen(M);
    this.copy = new ScriptCopy(M);
    this.setting = new ScriptSetting(M);
  }
}
class ScriptImg {
  constructor(_M) {
    this.M = _M;
  }
  zoomFull() {
    this.M.fileShow.tieefseeview.zoomFull(TieefseeviewZoomType["full-wh"]);
  }
  zoom100() {
    this.M.fileShow.tieefseeview.zoomFull(TieefseeviewZoomType["100%"]);
  }
  degForward() {
    this.M.fileShow.tieefseeview.setDegForward(void 0, void 0);
  }
  degReverse() {
    this.M.fileShow.tieefseeview.setDegReverse(void 0, void 0);
  }
  mirrorHorizontal() {
    this.M.fileShow.tieefseeview.setMirrorHorizontal(!this.M.fileShow.tieefseeview.getMirrorHorizontal());
  }
  mirrorVertica() {
    this.M.fileShow.tieefseeview.setMirrorVertica(!this.M.fileShow.tieefseeview.getMirrorVertica());
  }
  transformRefresh() {
    this.M.fileShow.tieefseeview.transformRefresh(true);
  }
  zoomIn() {
    this.M.fileShow.tieefseeview.zoomIn();
  }
  zoomOut() {
    this.M.fileShow.tieefseeview.zoomOut();
  }
  move(type, distance) {
    this.M.fileShow.tieefseeview.move(type, distance);
  }
}
class ScriptFileLoad {
  constructor(_M) {
    this.M = _M;
  }
  firstFile() {
    this.M.fileLoad.showFile(0);
  }
  lastFile() {
    this.M.fileLoad.showFile(this.M.fileLoad.getWaitingFile().length - 1);
  }
  prevFile() {
    this.M.fileLoad.prevFile();
  }
  nextFile() {
    this.M.fileLoad.nextFile();
  }
  prevDir() {
    this.M.fileLoad.prevDir();
  }
  nextDir() {
    this.M.fileLoad.nextDir();
  }
  deleteMsg() {
    this.M.fileLoad.deleteMsg();
  }
  renameMsg() {
    this.M.fileLoad.renameMsg();
  }
}
class ScriptFileShow {
  constructor(_M) {
    this.M = _M;
  }
}
class ScriptFile {
  constructor(_M) {
    this.M = _M;
  }
  DragDropFile() {
    setTimeout(() => {
      WV_File.DragDropFile(this.M.fileLoad.getFilePath());
    }, 50);
  }
  ShowContextMenu() {
    WV_File.ShowContextMenu(this.M.fileLoad.getFilePath(), true);
  }
}
class ScriptMenu {
  constructor(_M) {
    this.M = _M;
  }
  close() {
    this.M.menu.close();
  }
  showOpen(btn) {
    this.M.menu.open_Button(document.getElementById("menu-open"), btn, "menuActive");
  }
  showCopy(btn) {
    this.M.menu.open_Button(document.getElementById("menu-copy"), btn, "menuActive");
  }
  showRotate(btn) {
    if (btn === void 0) {
      this.M.menu.open_Origin(document.getElementById("menu-rotate"), 0, -20);
    } else {
      this.M.menu.open_Button(document.getElementById("menu-rotate"), btn, "menuActive");
    }
  }
  showSort(btn) {
    if (btn === void 0) {
      this.M.menu.open_Origin(document.getElementById("menu-sort"), 0, -20);
    } else {
      this.M.menu.open_Button(document.getElementById("menu-sort"), btn, "menuActive");
    }
  }
}
class ScriptOpen {
  constructor(_M) {
    this.M = _M;
  }
  openFile() {
    return __async(this, null, function* () {
      let arFile = yield WV_File.OpenFileDialog(true, "All files (*.*)|*.*", "\u958B\u555F\u6A94\u6848");
      if (arFile.length === 0) {
        return;
      }
      if (arFile.length === 1) {
        this.M.fileLoad.loadFile(arFile[0]);
      }
      if (arFile.length > 1) {
        this.M.fileLoad.loadFiles(arFile[0], arFile);
      }
    });
  }
  newWindow() {
    return __async(this, null, function* () {
      let filePath = this.M.fileLoad.getFilePath();
      let exePath = yield WV_Window.GetAppPath();
      if (yield WV_File.Exists(filePath)) {
        WV_RunApp.ProcessStart(exePath, `"${filePath}"`, true, false);
      } else {
        WV_RunApp.ProcessStart(exePath, "", true, false);
      }
    });
  }
  showOnExplorer() {
    return __async(this, null, function* () {
      let filePath = this.M.fileLoad.getFilePath();
      if ((yield WV_File.Exists(filePath)) === false) {
        return;
      }
      WV_File.ShowOnExplorer(filePath);
    });
  }
  ShowContextMenu() {
    return __async(this, null, function* () {
      let filePath = this.M.fileLoad.getFilePath();
      if ((yield WV_File.Exists(filePath)) === false) {
        return;
      }
      WV_File.ShowContextMenu(filePath, true);
    });
  }
  PrintFile() {
    return __async(this, null, function* () {
      let filePath = this.M.fileLoad.getFilePath();
      if ((yield WV_File.Exists(filePath)) === false) {
        return;
      }
      WV_File.PrintFile(filePath);
    });
  }
  SetWallpaper() {
    return __async(this, null, function* () {
      let filePath = this.M.fileLoad.getFilePath();
      if ((yield WV_File.Exists(filePath)) === false) {
        return;
      }
      WV_System.SetWallpaper(filePath);
    });
  }
  RunApp() {
    return __async(this, null, function* () {
      let filePath = this.M.fileLoad.getFilePath();
      if ((yield WV_File.Exists(filePath)) === false) {
        return;
      }
      WV_RunApp.ShowMenu(filePath);
    });
  }
  Open3DMSPaint() {
    return __async(this, null, function* () {
      let filePath = this.M.fileLoad.getFilePath();
      if ((yield WV_File.Exists(filePath)) === false) {
        return;
      }
      WV_RunApp.Open3DMSPaint(filePath);
    });
  }
}
class ScriptCopy {
  constructor(_M) {
    this.M = _M;
  }
  copyFile() {
    return __async(this, null, function* () {
      let filePath = this.M.fileLoad.getFilePath();
      if ((yield WV_File.Exists(filePath)) === false) {
        return;
      }
      WV_System.SetClipboard_File(filePath);
    });
  }
  copyName() {
    return __async(this, null, function* () {
      let filePath = this.M.fileLoad.getFilePath();
      if ((yield WV_File.Exists(filePath)) === false) {
        return;
      }
      let name = Lib.GetFileName(filePath);
      WV_System.SetClipboard_Txt(name);
    });
  }
  copyPath() {
    return __async(this, null, function* () {
      let filePath = this.M.fileLoad.getFilePath();
      if ((yield WV_File.Exists(filePath)) === false) {
        return;
      }
      WV_System.SetClipboard_Txt(filePath);
    });
  }
  copyImg() {
    return __async(this, null, function* () {
      let filePath = this.M.fileLoad.getFilePath();
      if ((yield WV_File.Exists(filePath)) === false) {
        return;
      }
      WV_System.SetClipboard_FileToImg(filePath);
    });
  }
  copyBase64() {
    return __async(this, null, function* () {
      let filePath = this.M.fileLoad.getFilePath();
      if ((yield WV_File.Exists(filePath)) === false) {
        return;
      }
      WV_System.SetClipboard_FileToBase64(filePath);
    });
  }
  copyPng() {
    return __async(this, null, function* () {
      let filePath = this.M.fileLoad.getFilePath();
      if ((yield WV_File.Exists(filePath)) === false) {
        return;
      }
      WV_System.SetClipboard_FileToPng(filePath);
    });
  }
  copyTxt() {
    return __async(this, null, function* () {
      let filePath = this.M.fileLoad.getFilePath();
      if ((yield WV_File.Exists(filePath)) === false) {
        return;
      }
      WV_System.SetClipboard_FileToTxt(filePath);
    });
  }
}
class ScriptSetting {
  constructor(_M) {
    this.temp_setting = null;
    this.M = _M;
  }
  OpenSetting() {
    return __async(this, null, function* () {
      if (this.temp_setting != null) {
        if ((yield this.temp_setting.Visible) === true) {
          this.temp_setting.WindowState = 0;
          return;
        }
      }
      yield this.M.saveSetting();
      this.temp_setting = yield baseWindow.newWindow("SettingWindow.html");
    });
  }
}
