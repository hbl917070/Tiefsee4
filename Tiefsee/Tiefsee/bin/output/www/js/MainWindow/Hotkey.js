class Hotkey {
  constructor(M) {
    window.addEventListener("keydown", (e) => {
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
      if (e.code == "ArrowRight") {
        M.script.fileLoad.next();
      }
      if (e.code == "ArrowLeft") {
        M.script.fileLoad.prev();
      }
      if (e.code == "ArrowUp") {
        M.script.img.move("up");
      }
      if (e.code == "ArrowDown") {
        M.script.img.move("down");
      }
      if (e.code == "Escape") {
        baseWindow.close();
      }
      if (e.code == "KeyR") {
        M.script.img.degForward();
      }
      if (e.code == "KeyF") {
        M.script.img.zoomFull();
      }
      if (e.code == "KeyH") {
        M.script.img.mirrorHorizontal();
      }
      if (e.code == "KeyV") {
        M.script.img.mirrorVertica();
      }
      if (e.code == "ShiftRight") {
        M.script.img.zoomIn();
      }
      if (e.code == "ControlRight") {
        M.script.img.zoomOut();
      }
      if (e.code == "F2") {
        M.script.fileLoad.renameMsg();
      }
      if (e.code == "Delete") {
        M.script.fileLoad.deleteMsg();
      }
      if (e.code == "KeyO") {
        M.script.open.showOnExplorer();
      }
      if (e.code == "KeyC" && e.ctrlKey) {
        M.script.copy.copyImg();
      }
      if (e.code == "KeyM") {
        M.script.open.ShowContextMenu();
      }
    });
  }
}
