class MainTools {
  constructor(M) {
    initToolsImg();
    initToolsPdf();
    initToolsTxt();
    initToolsWelcome();
    function initToolsImg() {
      addToolsBtn({
        group: GroupType.img,
        name: "file",
        icon: "tool-open.svg",
        func: (btn) => {
          btn.addEventListener("click", () => {
            M.script.menu.showOpen(btn);
          });
        }
      });
      addToolsBtn({
        group: GroupType.img,
        name: "file",
        icon: "tool-copy.svg",
        func: (btn) => {
          btn.addEventListener("click", () => {
            M.script.menu.showCopy(btn);
          });
        }
      });
      addToolsBtn({
        group: GroupType.img,
        name: "dragDropFile",
        icon: "tool-dragDropFile.svg",
        func: (btn) => {
          btn.addEventListener("mousedown", (e) => {
            if (e.button === 0) {
              M.script.file.DragDropFile();
            }
          });
          btn.addEventListener("mousedown", (e) => {
            if (e.button === 2) {
              M.script.file.ShowContextMenu();
            }
          });
        }
      });
      addToolsBtn({
        group: GroupType.img,
        name: "file",
        icon: "tool-delete.svg",
        func: (btn) => {
          btn.addEventListener("click", () => {
            M.script.fileLoad.deleteMsg();
          });
        }
      });
      addToolsBtn({
        group: GroupType.img,
        name: "file",
        icon: "tool-setting.svg",
        func: (btn) => {
          btn.addEventListener("click", () => {
            M.script.setting.OpenSetting();
          });
        }
      });
      addToolsBtn({
        group: GroupType.img,
        name: "file",
        icon: "tool-rotate.svg",
        func: (btn) => {
          btn.addEventListener("click", () => {
            M.script.menu.showRotate(btn);
          });
        }
      });
      addToolsBtn({
        group: GroupType.img,
        name: "file",
        icon: "tool-full.svg",
        func: (btn) => {
          btn.addEventListener("click", () => {
            M.script.img.zoomFull();
          });
        }
      });
      addToolsHtml({
        group: GroupType.img,
        html: `
                <div class="main-tools-btn js-noDrag">
                    <div style="margin:0 3px; user-select:none; pointer-events:none;" data-name="btnScale">1%</div>
                </div>
                `,
        func: (btn) => {
          btn.addEventListener("click", () => {
            M.script.img.zoom100();
          });
        }
      });
      addToolsHr({ group: GroupType.img });
      addToolsHtml({
        group: GroupType.img,
        html: `
                <div class="main-tools-txt" data-name="infoSize">
                   100<br>200
                </div>
            `,
        func: (btn) => {
        }
      });
      addToolsHr({ group: GroupType.img });
      addToolsHtml({
        group: GroupType.img,
        html: `
                <div class="main-tools-txt" data-name="infoType">
                    JPG<br>123.4MB
                </div>
            `,
        func: (btn) => {
        }
      });
      addToolsHr({ group: GroupType.img });
      addToolsHtml({
        group: GroupType.img,
        html: `
                <div class="main-tools-txt" data-name="infoWriteTime">
                    2021
                </div>
            `,
        func: (btn) => {
        }
      });
    }
    function initToolsPdf() {
      addToolsBtn({
        group: GroupType.pdf,
        name: "prev",
        icon: "tool-prev.svg",
        func: (btn) => {
          btn.addEventListener("click", () => {
            M.script.fileLoad.prevFile();
          });
        }
      });
      addToolsBtn({
        group: GroupType.pdf,
        name: "next",
        icon: "tool-next.svg",
        func: (btn) => {
          btn.addEventListener("click", () => {
            M.script.fileLoad.nextFile();
          });
        }
      });
      addToolsBtn({
        group: GroupType.pdf,
        name: "file",
        icon: "tool-open.svg",
        func: (btn) => {
          btn.addEventListener("click", () => {
            M.script.menu.showOpen(btn);
          });
        }
      });
      addToolsBtn({
        group: GroupType.pdf,
        name: "file",
        icon: "tool-copy.svg",
        func: (btn) => {
          btn.addEventListener("click", () => {
            M.script.menu.showCopy(btn);
          });
        }
      });
      addToolsBtn({
        group: GroupType.pdf,
        name: "dragDropFile",
        icon: "tool-dragDropFile.svg",
        func: (btn) => {
          btn.addEventListener("mousedown", (e) => {
            if (e.button === 0) {
              M.script.file.DragDropFile();
            }
          });
          btn.addEventListener("mousedown", (e) => {
            if (e.button === 2) {
              M.script.file.ShowContextMenu();
            }
          });
        }
      });
      addToolsBtn({
        group: GroupType.pdf,
        name: "file",
        icon: "tool-setting.svg",
        func: (btn) => {
          btn.addEventListener("click", () => {
            M.script.setting.OpenSetting();
          });
        }
      });
      addToolsHr({ group: GroupType.pdf });
      addToolsHtml({
        group: GroupType.pdf,
        html: `
                <div class="main-tools-txt" data-name="infoType">
                    JPG<br>123.4MB
                </div>
            `,
        func: (btn) => {
        }
      });
      addToolsHr({ group: GroupType.pdf });
      addToolsHtml({
        group: GroupType.pdf,
        html: `
                <div class="main-tools-txt" data-name="infoWriteTime">
                    2021
                </div>
            `,
        func: (btn) => {
        }
      });
    }
    function initToolsTxt() {
      addToolsBtn({
        group: GroupType.txt,
        name: "prev",
        icon: "tool-prev.svg",
        func: (btn) => {
          btn.addEventListener("click", () => {
            M.script.fileLoad.prevFile();
          });
        }
      });
      addToolsBtn({
        group: GroupType.txt,
        name: "next",
        icon: "tool-next.svg",
        func: (btn) => {
          btn.addEventListener("click", () => {
            M.script.fileLoad.nextFile();
          });
        }
      });
      addToolsBtn({
        group: GroupType.txt,
        name: "file",
        icon: "tool-open.svg",
        func: (btn) => {
          btn.addEventListener("click", () => {
            M.script.menu.showOpen(btn);
          });
        }
      });
      addToolsBtn({
        group: GroupType.txt,
        name: "file",
        icon: "tool-copy.svg",
        func: (btn) => {
          btn.addEventListener("click", () => {
            M.script.menu.showCopy(btn);
          });
        }
      });
      addToolsBtn({
        group: GroupType.txt,
        name: "dragDropFile",
        icon: "tool-dragDropFile.svg",
        func: (btn) => {
          btn.addEventListener("mousedown", (e) => {
            if (e.button === 0) {
              M.script.file.DragDropFile();
            }
          });
          btn.addEventListener("mousedown", (e) => {
            if (e.button === 2) {
              M.script.file.ShowContextMenu();
            }
          });
        }
      });
      addToolsBtn({
        group: GroupType.txt,
        name: "file",
        icon: "tool-setting.svg",
        func: (btn) => {
          btn.addEventListener("click", () => {
            M.script.setting.OpenSetting();
          });
        }
      });
      addToolsHr({ group: GroupType.txt });
      addToolsHtml({
        group: GroupType.txt,
        html: `
                <div class="main-tools-txt" data-name="infoType">
                    JPG<br>123.4MB
                </div>
            `,
        func: (btn) => {
        }
      });
      addToolsHr({ group: GroupType.txt });
      addToolsHtml({
        group: GroupType.txt,
        html: `
                <div class="main-tools-txt" data-name="infoWriteTime">
                    2021
                </div>
            `,
        func: (btn) => {
        }
      });
    }
    function initToolsWelcome() {
      addToolsBtn({
        group: GroupType.welcome,
        name: "file",
        icon: "tool-open.svg",
        func: (btn) => {
          btn.addEventListener("click", () => {
            M.script.open.openFile();
          });
        }
      });
      addToolsBtn({
        group: GroupType.welcome,
        name: "file",
        icon: "tool-setting.svg",
        func: (btn) => {
          btn.addEventListener("click", () => {
            M.script.setting.OpenSetting();
          });
        }
      });
    }
    function addToolsHtml(item) {
      addToolsDom({
        group: item.group,
        dom: newDiv(item.html),
        func: item.func
      });
    }
    function addToolsHr(item) {
      let div = newDiv(`<div class="main-tools-hr"> </div>`);
      addToolsDom({
        group: item.group,
        dom: div,
        func: () => {
        }
      });
    }
    function addToolsBtn(item) {
      let div = newDiv(`
                <div class="main-tools-btn js-noDrag" data-name="${item.name}">
                    ${SvgList[item.icon]}
                </div>`);
      addToolsDom({
        group: item.group,
        dom: div,
        func: item.func
      });
    }
    function addToolsDom(item) {
      let dom_group = M.dom_tools.querySelector(`.main-tools-group[data-name=${item.group}]`);
      if (dom_group === null) {
        let div = newDiv(`<div class="main-tools-group" data-name="${item.group}">  </div>`);
        M.dom_tools.appendChild(div);
        dom_group = M.dom_tools.querySelector(`.main-tools-group[data-name=${item.group}]`);
      }
      item.func(item.dom);
      if (dom_group !== null) {
        dom_group.appendChild(item.dom);
      }
    }
  }
}
