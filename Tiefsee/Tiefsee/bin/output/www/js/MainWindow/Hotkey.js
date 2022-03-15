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
class Hotkey {
  constructor(M) {
    window.addEventListener("keydown", (e) => __async(this, null, function* () {
      if (e.code == "F5") {
        return;
      }
      if (e.code == "F12") {
        return;
      }
      if (Msgbox.isShow()) {
        if (e.code == "Escape") {
          Msgbox.closeNow();
        }
        if (e.code == "Enter" || e.code == "NumpadEnter") {
          Msgbox.clickYes();
        }
        return;
      }
      e.preventDefault();
      if (e.code === "ArrowRight") {
        M.script.fileLoad.nextFile();
      }
      if (e.code === "ArrowLeft") {
        M.script.fileLoad.prevFile();
      }
      if (e.code === "ArrowUp") {
        M.script.img.move("up");
      }
      if (e.code === "ArrowDown") {
        M.script.img.move("down");
      }
      if (e.code === "Escape") {
        baseWindow.close();
      }
      if (e.code === "KeyR") {
        M.script.img.degForward();
      }
      if (e.code === "KeyF") {
        M.script.img.zoomFull();
      }
      if (e.code === "KeyH") {
        M.script.img.mirrorHorizontal();
      }
      if (e.code === "KeyV") {
        M.script.img.mirrorVertica();
      }
      if (e.code === "ShiftRight") {
        M.script.img.zoomIn();
      }
      if (e.code === "ControlRight") {
        M.script.img.zoomOut();
      }
      if (e.code === "F2") {
        M.script.fileLoad.renameMsg();
      }
      if (e.code === "Delete") {
        M.script.fileLoad.deleteMsg();
      }
      if (e.code === "KeyO") {
        M.script.open.showOnExplorer();
      }
      if (e.code === "KeyC" && e.ctrlKey) {
        M.script.copy.copyImg();
      }
      if (e.code === "KeyM") {
        M.script.open.ShowContextMenu();
      }
      if (e.code === "Comma") {
        M.script.fileLoad.prevDir();
      }
      if (e.code === "Period") {
        M.script.fileLoad.nextDir();
      }
      if (e.code === "Home") {
        M.script.fileLoad.firstFile();
      }
      if (e.code === "End") {
        M.script.fileLoad.lastFile();
      }
    }));
  }
}
