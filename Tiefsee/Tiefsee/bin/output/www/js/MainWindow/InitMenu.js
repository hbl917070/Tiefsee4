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
    var dom_rightMenuImage_zoomRatioTxt = document.querySelector("#menu-rightMenuImage .js-zoomRatioTxt");
    this.initOpen = initOpen;
    this.updateRightMenuImageZoomRatioTxt = updateRightMenuImageZoomRatioTxt;
    initCopy();
    initRotate();
    this.menu_layout = new Menu_layout(M);
    initRightMenuImage();
    document.body.addEventListener("mousedown", (e) => {
      if (e.button === 2) {
        M.script.menu.showRightMenuImage();
      }
    });
    function updateRightMenuImageZoomRatioTxt(txt) {
      if (dom_rightMenuImage_zoomRatioTxt === null) {
        return;
      }
      if (txt !== void 0) {
        dom_rightMenuImage_zoomRatioTxt.innerHTML = txt;
      }
      if (dom_rightMenuImage_zoomRatioTxt.clientWidth !== 0) {
        let r = 35 / dom_rightMenuImage_zoomRatioTxt.clientWidth;
        if (r > 1) {
          r = 1;
        }
        dom_rightMenuImage_zoomRatioTxt.style.transform = `scaleX(${r})`;
      }
    }
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
    function initRightMenuImage() {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
      let dom = document.getElementById("menu-rightMenuImage");
      if (dom === null) {
        return;
      }
      (_a = dom.querySelector(".js-prev")) == null ? void 0 : _a.addEventListener("click", () => {
        M.script.fileLoad.prevFile();
      });
      (_b = dom.querySelector(".js-next")) == null ? void 0 : _b.addEventListener("click", () => {
        M.script.fileLoad.nextFile();
      });
      (_c = dom.querySelector(".js-prevDir")) == null ? void 0 : _c.addEventListener("click", () => {
        M.script.fileLoad.prevDir();
      });
      (_d = dom.querySelector(".js-nextDir")) == null ? void 0 : _d.addEventListener("click", () => {
        M.script.fileLoad.nextDir();
      });
      (_e = dom.querySelector(".js-sort")) == null ? void 0 : _e.addEventListener("click", () => {
        M.script.menu.close();
        M.script.menu.showSort();
      });
      (_f = dom.querySelector(".js-rotate")) == null ? void 0 : _f.addEventListener("click", () => {
        M.script.menu.close();
        M.script.menu.showRotate();
      });
      (_g = dom.querySelector(".js-zoomIn")) == null ? void 0 : _g.addEventListener("click", () => {
        M.script.img.zoomIn();
      });
      (_h = dom.querySelector(".js-zoomOut")) == null ? void 0 : _h.addEventListener("click", () => {
        M.script.img.zoomOut();
      });
      (_i = dom.querySelector(".js-full")) == null ? void 0 : _i.addEventListener("click", () => {
        M.script.img.zoomFull();
      });
      (_j = dom.querySelector(".js-zoomRatio")) == null ? void 0 : _j.addEventListener("click", () => {
        M.script.img.zoom100();
      });
      (_k = dom.querySelector(".js-open")) == null ? void 0 : _k.addEventListener("click", () => {
        M.script.menu.close();
        M.script.open.showOnExplorer();
      });
      (_l = dom.querySelector(".js-rightMenu")) == null ? void 0 : _l.addEventListener("click", () => {
        M.script.menu.close();
        M.script.file.ShowContextMenu();
      });
      (_m = dom.querySelector(".js-copy")) == null ? void 0 : _m.addEventListener("click", () => {
        M.script.menu.close();
        M.script.copy.copyImg();
      });
      (_n = dom.querySelector(".js-delete")) == null ? void 0 : _n.addEventListener("click", () => {
        M.script.menu.close();
        M.script.fileLoad.deleteMsg();
      });
      (_o = dom.querySelector(".js-setting")) == null ? void 0 : _o.addEventListener("click", () => {
        M.script.menu.close();
        M.script.setting.OpenSetting();
      });
      (_p = dom.querySelector(".js-help")) == null ? void 0 : _p.addEventListener("click", () => {
        M.script.menu.close();
        WV_RunApp.OpenUrl("https://github.com/hbl917070/Tiefsee4");
      });
      (_q = dom.querySelector(".js-close")) == null ? void 0 : _q.addEventListener("click", () => {
        M.script.menu.close();
        baseWindow.close();
      });
    }
  }
}
class Menu_layout {
  constructor(M) {
    var dom = document.getElementById("menu-layout");
    var dom_topmost = dom.querySelector(".js-topmost");
    var dom_mainTools = dom.querySelector(".js-mainTools");
    var dom_mainDirList = dom.querySelector(".js-mainDirList");
    var dom_mainFileList = dom.querySelector(".js-mainFileList");
    var isTopmost = false;
    var isMainTools = false;
    var isMainDirList = false;
    var isMainFileList = false;
    this.show = show;
    dom_topmost.addEventListener("click", () => __async(this, null, function* () {
      setTopmost();
    }));
    dom_mainTools.addEventListener("click", () => {
      setMainTools();
    });
    dom_mainDirList.addEventListener("click", () => {
      setMainDirList();
    });
    dom_mainFileList.addEventListener("click", () => {
      setMainFileList();
    });
    function show(btn) {
      updateData();
      if (btn === void 0) {
        M.menu.open_Origin(dom, 0, 0);
      } else {
        M.menu.open_Button(dom, btn, "menuActive");
      }
    }
    function updateData() {
      isMainTools = M.config.settings.layout.mainToolsEnabled;
      isMainDirList = M.config.settings.layout.dirListEnabled;
      isMainFileList = M.config.settings.layout.fileListEnabled;
      setCheckState(dom_mainTools, isMainTools);
      setCheckState(dom_mainDirList, isMainDirList);
      setCheckState(dom_mainFileList, isMainFileList);
    }
    function setTopmost(bool) {
      if (bool === void 0) {
        bool = !isTopmost;
      }
      isTopmost = bool;
      baseWindow.topMost = bool;
      setCheckState(dom_topmost, bool);
      WV_Window.TopMost = bool;
    }
    function setMainTools(bool) {
      if (bool === void 0) {
        bool = !isMainTools;
      }
      isMainTools = bool;
      setCheckState(dom_mainTools, bool);
      M.mainTools.setEnabled(bool);
    }
    function setMainDirList(bool) {
      if (bool === void 0) {
        bool = !isMainDirList;
      }
      isMainDirList = bool;
      setCheckState(dom_mainDirList, bool);
      M.mainDirList.setEnabled(bool);
    }
    function setMainFileList(bool) {
      if (bool === void 0) {
        bool = !isMainFileList;
      }
      isMainFileList = bool;
      setCheckState(dom_mainFileList, bool);
      M.mainFileList.setEnabled(bool);
    }
    function setCheckState(dom2, bool) {
      if (bool) {
        dom2.getElementsByClassName("menu-hor-icon")[0].innerHTML = SvgList["yes.svg"];
      } else {
        dom2.getElementsByClassName("menu-hor-icon")[0].innerHTML = "";
      }
    }
  }
}
