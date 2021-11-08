"use strict";
class MainTools {
    constructor(M) {
        addToolsBtn({
            group: "img",
            name: "file",
            icon: "/img/default/file.svg",
            func: (btn) => {
                btn.addEventListener("click", () => {
                    M.menu.openDropDown(document.getElementById("menu01"), document.querySelector("[data-name=file]"), "menuActive");
                });
            },
            type: MainToolsType.button,
        });
        addToolsBtn({
            group: "img",
            name: "prev",
            icon: "/img/default/prev.svg",
            func: (btn) => {
                btn.addEventListener("click", () => {
                    M.fileLoad.prev();
                });
            },
            type: MainToolsType.button,
        });
        addToolsBtn({
            group: "img",
            name: "next",
            icon: "/img/default/next.svg",
            func: (btn) => {
                btn.addEventListener("click", () => {
                    M.fileLoad.next();
                });
            },
            type: MainToolsType.button,
        });
        addToolsBtn({
            group: "img",
            name: "file2",
            icon: "/img/default/file.svg",
            func: (btn) => {
                btn.addEventListener("click", () => {
                    M.menu.openDropDown(document.getElementById("menu01"), document.querySelector("[data-name=file2]"), "menuActive");
                });
            },
            type: MainToolsType.button,
        });
        addToolsBtn({
            group: "img",
            name: "DragDropFile",
            icon: "/img/default/DragDropFile.svg",
            func: (btn) => {
                btn.addEventListener("mousedown", () => {
                    setTimeout(() => {
                        WV_File.DragDropFile(M.fileLoad.getFilePath());
                    }, 50);
                });
            },
            type: MainToolsType.button,
        });
        function addToolsBtn(item) {
            //如果群組不存在，就先產生群組
            let dom_group = M.dom_tools.querySelector(`.main-tools-group[data-name=${item.group}]`);
            if (dom_group === null) {
                let div = newDiv(`<div class="main-tools-group" data-name="${item.group}">  </dib>`);
                M.dom_tools.appendChild(div);
                dom_group = M.dom_tools.querySelector(`.main-tools-group[data-name=${item.group}]`);
            }
            //產生按鈕
            let div = newDiv(`
                <div class="main-tools-btn" data-name="${item.name}">
                    <div to_dom="svg" src="${item.icon}"></div>
                </dib>`);
            //div.addEventListener("click", item.click);
            item.func(div);
            if (dom_group !== null) {
                dom_group.appendChild(div);
            }
        }
        function newDiv(html) {
            let div = document.createElement("div");
            div.innerHTML = html;
            return div.getElementsByTagName("div")[0];
        }
    }
}
var MainToolsType;
(function (MainToolsType) {
    MainToolsType[MainToolsType["button"] = 0] = "button";
    MainToolsType[MainToolsType["html"] = 1] = "html";
    MainToolsType[MainToolsType["fastDrag"] = 2] = "fastDrag";
})(MainToolsType || (MainToolsType = {}));
//export { MainTools };
