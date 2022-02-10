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
class InitMenu {
  constructor(M) {
    initOpen();
    initCopy();
    initRotate();
    function initOpen() {
      return __async(this, null, function* () {
        var dom_OpenFile = document.getElementById("menuitem-openFile");
        if (dom_OpenFile !== null) {
          dom_OpenFile.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.open.openFile();
          });
        }
        var dom_newWindow = document.getElementById("menuitem-newWindow");
        if (dom_newWindow !== null) {
          dom_newWindow.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.open.newWindow();
          });
        }
        var dom_ShowOnExplorer = document.getElementById("menuitem-showOnExplorer");
        if (dom_ShowOnExplorer !== null) {
          dom_ShowOnExplorer.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.open.showOnExplorer();
          });
        }
        var dom_ShowSystemMenu = document.getElementById("menuitem-showSystemMenu");
        if (dom_ShowSystemMenu !== null) {
          dom_ShowSystemMenu.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.open.ShowContextMenu();
          });
        }
        var dom_ShowSystemMenu = document.getElementById("menuitem-renameFile");
        if (dom_ShowSystemMenu !== null) {
          dom_ShowSystemMenu.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.fileLoad.renameMsg();
          });
        }
        var dom_PrintFile = document.getElementById("menuitem-printFile");
        if (dom_PrintFile !== null) {
          dom_PrintFile.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.open.PrintFile();
          });
        }
        var dom_SetWallpaper = document.getElementById("menuitem-setWallpaper");
        if (dom_SetWallpaper !== null) {
          dom_SetWallpaper.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.open.SetWallpaper();
          });
        }
        var dom_RunApp = document.getElementById("menuitem-runApp");
        if (dom_RunApp !== null) {
          dom_RunApp.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.open.RunApp();
          });
        }
        var dom_Open3DMSPaint = document.getElementById("menuitem-open3DMSPaint");
        if (dom_Open3DMSPaint !== null) {
          dom_Open3DMSPaint.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.open.Open3DMSPaint();
          });
        }
        var dom_menuOtherAppOpen = document.getElementById("menu-otherAppOpen");
        (() => __async(this, null, function* () {
          let arExe = [];
          for (let i = 0; i < M.config.OtherAppOpenList.absolute.length; i++) {
            let exePath = M.config.OtherAppOpenList.absolute[i].path;
            let exeName = M.config.OtherAppOpenList.absolute[i].name;
            let type = M.config.OtherAppOpenList.absolute[i].type.join(",");
            exePath = exePath.replace(/[/]/g, "\\");
            if (arExe.some((e) => e.path === exePath) === false) {
              arExe.push({ path: exePath, name: exeName, type });
            }
          }
          let arLnk = yield WV_RunApp.GetStartMenuList();
          for (let i = 0; i < arLnk.length; i++) {
            const lnk = arLnk[i];
            let name = lnk.substr(lnk.lastIndexOf("\\") + 1);
            name = name.substr(0, name.length - 4);
            for (let j = 0; j < M.config.OtherAppOpenList.startMenu.length; j++) {
              const item = M.config.OtherAppOpenList.startMenu[j];
              if (name.toLocaleLowerCase().indexOf(item.name.toLocaleLowerCase()) !== -1) {
                let exePath = yield WV_System.LnkToExePath(lnk);
                if (arExe.some((e) => e.path === exePath) === false) {
                  arExe.push({ path: exePath, name, type: item.type.join(",") });
                }
              }
            }
          }
          for (let i = 0; i < arExe.length; i++) {
            const exe = arExe[i];
            let name = exe.name;
            let imgBase64 = yield WV_Image.GetFileIcon(exe.path, 32);
            if (imgBase64 === "") {
              continue;
            }
            let dom = newDiv(`
                        <div class="menu-hor-item">
                            <div class="menu-hor-icon">
                                <img src="${imgBase64}">
                            </div>
                            <div class="menu-hor-txt" i18n="">${name}</div>
                        </div>
                    `);
            dom.onclick = () => __async(this, null, function* () {
              let filePath = M.fileLoad.getFilePath();
              if ((yield WV_File.Exists(filePath)) === false) {
                return;
              }
              M.menu.close();
              WV_RunApp.ProcessStart(exe.path, `"${filePath}"`, true, false);
            });
            dom_menuOtherAppOpen == null ? void 0 : dom_menuOtherAppOpen.append(dom);
          }
        }))();
      });
    }
    function initCopy() {
      return __async(this, null, function* () {
        var dom_copyFile = document.getElementById("menuitem-img-copyFile");
        if (dom_copyFile !== null) {
          dom_copyFile.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.copy.copyFile();
          });
        }
        var dom_copyName = document.getElementById("menuitem-img-copyName");
        if (dom_copyName !== null) {
          dom_copyName.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.copy.copyName();
          });
        }
        var dom_copyPath = document.getElementById("menuitem-img-copyPath");
        if (dom_copyPath !== null) {
          dom_copyPath.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.copy.copyPath();
          });
        }
        var dom_copyImg = document.getElementById("menuitem-img-copyImg");
        if (dom_copyImg !== null) {
          dom_copyImg.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.copy.copyImg();
          });
        }
        var dom_copyBase64 = document.getElementById("menuitem-img-copyBase64");
        if (dom_copyBase64 !== null) {
          dom_copyBase64.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.copy.copyBase64();
          });
        }
        var dom_copyPng = document.getElementById("menuitem-img-copyPng");
        if (dom_copyPng !== null) {
          dom_copyPng.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.copy.copyPng();
          });
        }
        var dom_copyTxt = document.getElementById("menuitem-img-copyTxt");
        if (dom_copyTxt !== null) {
          dom_copyTxt.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.copy.copyTxt();
          });
        }
      });
    }
    function initRotate() {
      return __async(this, null, function* () {
        var dom_rotateCw = document.getElementById("menuitem-img-rotateCw");
        if (dom_rotateCw !== null) {
          dom_rotateCw.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.img.degForward();
          });
        }
        var dom_rotateCcw = document.getElementById("menuitem-img-rotateCcw");
        if (dom_rotateCcw !== null) {
          dom_rotateCcw.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.img.degReverse();
          });
        }
        var dom_mirroringH = document.getElementById("menuitem-img-mirroringH");
        if (dom_mirroringH !== null) {
          dom_mirroringH.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.img.mirrorHorizontal();
          });
        }
        var dom_mirroringV = document.getElementById("menuitem-img-mirroringV");
        if (dom_mirroringV !== null) {
          dom_mirroringV.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.img.mirrorVertica();
          });
        }
        var dom_initRotate = document.getElementById("menuitem-img-initRotate");
        if (dom_initRotate !== null) {
          dom_initRotate.onclick = () => __async(this, null, function* () {
            M.menu.close();
            M.script.img.transformRefresh();
          });
        }
      });
    }
  }
}
