import { GroupType, ToolbarCustomization, ToolbarCustomizationItem } from "../Config";
import { Lib } from "../Lib";
import { MainWindow } from "./MainWindow";

export class MainToolbar {

    public setEnabled;
    public getArrray;
    public applyCustomization;
    public setActiveType;

    constructor(M: MainWindow | null) {

        const _ar: {
            type: ("button" | "html" | "hr"),
            group: string,
            i18n: string,
            name: string,
            icon: string,
            html: string,
            func: (domBtn: HTMLElement) => void
        }[] = []
        const _specialDom: { [key: string]: HTMLElement } = {};

        this.setEnabled = setEnabled;
        this.getArrray = getArrray;
        this.applyCustomization = applyCustomization;
        this.setActiveType = setActiveType;

        init();

        //-----------------

        /**
         * 初始化
         * @returns 
         */
        function init() {

            initToolbarImg();
            initToolbarPdf();
            initToolbarTxt();
            initToolbarWelcome();
            initBulkView();

            //產生UI
            if (M === null) { return }
            for (let i = 0; i < _ar.length; i++) {
                const item = _ar[i];

                if (item.type === "html") {
                    addToolbarHtml({
                        group: item.group,
                        html: item.html,
                        i18n: item.i18n,
                        func: item.func
                    })
                }

                if (item.type === "hr") {
                    addToolbarHr({
                        group: item.group,
                        func: item.func
                    })
                }

                if (item.type === "button") {
                    addToolbarBtn({
                        group: item.group,
                        name: item.name,
                        icon: item.icon,
                        i18n: item.i18n,
                        func: item.func
                    })
                }
            }

            ensureTitlebarGroups();
        }

        /**
         * 
         * @returns 
         */
        function getArrray() {
            return _ar;
        }

        function ensureTitlebarGroups() {
            if (M === null) { return; }
            const roots = {
                left: document.querySelector<HTMLElement>("#titlebar-custom-toolbar-left"),
                right: document.querySelector<HTMLElement>("#titlebar-custom-toolbar-right"),
            };
            Object.values(roots).forEach(root => {
                if (root === null) { return; }
                [GroupType.img, GroupType.pdf, GroupType.txt, GroupType.bulkView, GroupType.welcome].forEach(group => {
                    if (root.querySelector(`.titlebar-custom-group[data-name="${group}"]`) !== null) { return; }
                    const dom = document.createElement("div");
                    dom.className = "titlebar-custom-group";
                    dom.setAttribute("data-name", group);
                    root.appendChild(dom);
                });
            });
        }

        function updateLeftResizeCorner() {
            const activeLeftGroup = document.querySelector<HTMLElement>('.titlebar-custom-toolbar-left .titlebar-custom-group[active="true"]');
            const hasVisibleItems = activeLeftGroup !== null && Array.from(activeLeftGroup.children)
                .some(item => getComputedStyle(item).display !== "none");
            document.querySelector(".window")?.classList.toggle("has-titlebar-left-custom-items", hasVisibleItems);
        }

        function setActiveType(type: string) {
            if (M === null) { return; }
            const groups = document.querySelectorAll<HTMLElement>(".titlebar-custom-group");
            groups.forEach(group => group.setAttribute("active", group.getAttribute("data-name") === type ? "true" : ""));
            updateLeftResizeCorner();
        }

        function applyCustomization(customization: ToolbarCustomization) {
            if (M === null || customization === null || typeof customization !== "object") { return; }

            const types: (keyof ToolbarCustomization)[] = ["img", "pdf", "txt", "bulkView", "welcome"];
            for (const type of types) {
                const config = customization[type];
                const toolbarGroup = M.domToolbar.querySelector<HTMLElement>(`.main-toolbar-group[data-name="${type}"]`);
                const titlebarGroups = {
                    left: document.querySelector<HTMLElement>(`#titlebar-custom-toolbar-left .titlebar-custom-group[data-name="${type}"]`),
                    right: document.querySelector<HTMLElement>(`#titlebar-custom-toolbar-right .titlebar-custom-group[data-name="${type}"]`),
                };
                if (config === undefined || toolbarGroup === null || titlebarGroups.left === null || titlebarGroups.right === null) { continue; }

                const currentSpecialKeys = new Set<string>();
                [
                    ...config.titlebar.left,
                    ...config.titlebar.right,
                    ...config.toolbar.left,
                    ...config.toolbar.center,
                    ...config.toolbar.right,
                ].forEach(item => {
                    if (item.type === "separator" || item.type === "spacer") {
                        currentSpecialKeys.add(`${type}:${item.id}`);
                    }
                });
                Object.keys(_specialDom).forEach(key => {
                    if (key.startsWith(`${type}:`) && !currentSpecialKeys.has(key)) {
                        _specialDom[key].remove();
                        delete _specialDom[key];
                    }
                });

                const elements = new Set<HTMLElement>();
                toolbarGroup.querySelectorAll<HTMLElement>(".main-toolbar-alignment > [data-name], :scope > [data-name]").forEach(item => elements.add(item));
                Object.values(titlebarGroups).forEach(group => {
                    if (group === null) { return; }
                    group.querySelectorAll<HTMLElement>(":scope > [data-name]").forEach(item => elements.add(item));
                });
                Object.keys(_specialDom).forEach(key => {
                    if (key.startsWith(`${type}:`)) { elements.add(_specialDom[key]); }
                });
                const placed = new Set<HTMLElement>();

                const appendItems = (target: HTMLElement, items: ToolbarCustomizationItem[], inTitlebar: boolean) => {
                    if (!Array.isArray(items)) { return; }
                    items.forEach((item, index) => {
                        let dom: HTMLElement | undefined;
                        if (item.type === "button" || item.type === "info") {
                            dom = Array.from(elements).find(element => element.getAttribute("data-name") === item.name);
                        } else if (item.type === "separator" || item.type === "spacer") {
                            const key = `${type}:${item.id}`;
                            dom = _specialDom[key];
                            if (dom === undefined) {
                                dom = document.createElement("div");
                                dom.className = item.type === "separator" ? "main-toolbar-hr" : "main-toolbar-spacer";
                                dom.setAttribute("data-toolbar-layout-item", item.id);
                                dom.setAttribute("data-layout-type", item.type);
                                dom.setAttribute("aria-hidden", "true");
                                _specialDom[key] = dom;
                                elements.add(dom);
                            }
                        }
                        if (dom === undefined || placed.has(dom)) { return; }
                        target.appendChild(dom);
                        dom.style.display = "";
                        dom.style.order = index.toString();
                        dom.classList.toggle("titlebar-custom-item", inTitlebar);
                        if (dom.classList.contains("main-toolbar-txt")) {
                            if (inTitlebar) {
                                dom.dataset.regularHtml ||= dom.innerHTML;
                                const lineSeparator = dom.getAttribute("data-name") === "infoSize" ? "×" : " ";
                                dom.innerHTML = dom.dataset.regularHtml.replace(/<br\s*\/?\s*>/gi, lineSeparator);
                            } else if (dom.dataset.regularHtml !== undefined) {
                                dom.innerHTML = dom.dataset.regularHtml;
                            }
                        }
                        placed.add(dom);
                    });
                };

                appendItems(titlebarGroups.left, config.titlebar.left, true);
                appendItems(titlebarGroups.right, config.titlebar.right, true);

                const alignments = ["left", "center", "right"] as const;
                alignments.forEach(alignment => {
                    const lane = toolbarGroup.querySelector<HTMLElement>(`.main-toolbar-alignment[data-align="${alignment}"]`);
                    if (lane !== null) {
                        appendItems(lane, config.toolbar[alignment] || [], false);
                        const hasVisibleItem = Array.from(lane.children).some(child => (child as HTMLElement).style.display !== "none");
                        lane.classList.toggle("is-empty", !hasVisibleItem);
                    }
                });

                elements.forEach(element => {
                    if (placed.has(element)) { return; }
                    const center = toolbarGroup.querySelector<HTMLElement>('.main-toolbar-alignment[data-align="center"]');
                    (center || toolbarGroup).appendChild(element);
                    element.style.display = "none";
                    element.classList.remove("titlebar-custom-item");
                });
            }
            updateLeftResizeCorner();
        }

        /** 在各工具列群組中，將收藏放在檔案按鈕之前。 */
        function addFavoritesButton(group: string) {
            _ar.push({
                type: "button", html: "",
                i18n: "menu.favorites",
                group,
                name: "favorites",
                icon: "star_line_horizontal_3_20_regular.svg",
                func: (btn) => {
                    btn.classList.add("main-toolbar-favorites");
                    btn.setAttribute("aria-label", "menu.favorites");
                    btn.setAttribute("tabindex", "0");
                    btn.setAttribute("aria-haspopup", "dialog");
                    btn.setAttribute("aria-expanded", "false");
                    btn.setAttribute("aria-controls", "favorites-panel");
                    btn.addEventListener("click", () => { void M?.favorites?.toggle(btn); });
                    btn.addEventListener("keydown", event => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            void M?.favorites?.toggle(btn);
                        }
                    });
                },
            });
        }

        /** 新增可自訂的佈局按鈕。 */
        function addLayoutButton(group: string) {
            _ar.push({
                type: "button", html: "",
                i18n: "menu.layout",
                group,
                name: "layout",
                icon: "panel_left_header_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => { M?.script.menu.showLayout(btn); });
                },
            });
        }

        /**
         * 設定是否啟用
         * @param val 
         */
        function setEnabled(val: boolean) {
            if (M == null) { return; }
            if (val) {
                M.domToolbar.style.display = "";
            } else {
                M.domToolbar.style.display = "none";
            }
            M.config.settings.layout.mainToolbarEnabled = val;
        }

        /**
         * 初始化 工具列 圖片
         */
        function initToolbarImg() {

            addBackButton(GroupType.img);

            // 上一個檔案
            _ar.push({
                type: "button", html: "",
                i18n: "menu.prevFile",
                group: GroupType.img,
                name: "prevFile",
                icon: "arrow_left_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.prevFile();
                    });
                },
            })

            // 下一個檔案
            _ar.push({
                type: "button", html: "",
                i18n: "menu.nextFile",
                group: GroupType.img,
                name: "nextFile",
                icon: "arrow_right_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.nextFile();
                    });
                },
            })

            addFavoritesButton(GroupType.img);

            // 檔案
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuFile",
                group: GroupType.img,
                name: "showMenuFile",
                icon: "folder_open_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuFile(btn);
                    });
                },
            })

            // 上一個資料夾
            _ar.push({
                type: "button", html: "",
                i18n: "menu.prevDir",
                group: GroupType.img,
                name: "prevDir",
                icon: "previous_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.prevDir();
                    });
                },
            })

            // 下一個資料夾
            _ar.push({
                type: "button", html: "",
                i18n: "menu.nextDir",
                group: GroupType.img,
                name: "nextDir",
                icon: "next_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.nextDir();
                    });
                },
            })

            // 排序
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuSort",
                group: GroupType.img,
                name: "showMenuSort",
                icon: "arrow_sort_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuSort(btn);
                    });
                },
            })

            // 複製
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuCopy",
                group: GroupType.img,
                name: "showMenuCopy",
                icon: "copy_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuCopy(btn);
                    });
                },
            })

            // 快速拖曳
            _ar.push({
                type: "button", html: "",
                i18n: "menu.dragDropFile",
                group: GroupType.img,
                name: "dragDropFile",
                icon: "cursor_hover_20_regular.svg",
                func: (btn) => {
                    Lib.addDragThresholdListener(btn, 3, () => {
                        M?.script.file.dragDropFile();
                    });
                    btn.addEventListener("mousedown", (e) => {
                        if (e.button === 2) { //滑鼠右鍵
                            M?.script.file.showContextMenu();
                        }
                    });
                    btn.setAttribute("data-menu", "none"); // 避免顯示右鍵選單
                },
            })

            // 刪除
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showDeleteFileMsg",
                group: GroupType.img,
                name: "showDeleteMsg",
                icon: "delete_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.showDeleteMsg();
                    });
                },
            })

            // 搜圖
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuImageSearch",
                group: GroupType.img,
                name: "showMenuImageSearch",
                icon: "search_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuImageSearch(btn);
                    });
                },
            })

            // 進入 大量瀏覽模式
            _ar.push({
                type: "button", html: "",
                i18n: "menu.bulkView",
                group: GroupType.img,
                name: "bulkView",
                icon: "app_folder_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", async () => {
                        M?.script.bulkView.show();
                    });
                },
            })

            // 設定
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showSetting",
                group: GroupType.img,
                name: "showSetting",
                icon: "settings_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.setting.showSetting();
                    });
                },
            })

            // 旋轉與鏡像
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuRotation",
                group: GroupType.img,
                name: "showMenuRotation",
                icon: "arrow_clockwise_dashes_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuRotation(btn);
                    });
                },
            })

            // 縮放至適合視窗
            _ar.push({
                type: "button", html: "",
                i18n: "menu.zoomToFit",
                group: GroupType.img,
                name: "zoomToFit",
                icon: "arrow_expand_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.img.zoomToFit();
                    });
                },
            })

            addLayoutButton(GroupType.img);

            //----------------   

            // 縮放比例
            _ar.push({
                type: "html",
                html: `
                    <div class="main-toolbar-btn js-noDrag" data-name="infoZoomRatio" role="button">
                        <div style="margin:0 3px; user-select:none; pointer-events:none;" data-name="btnScale">100%</div>
                    </div>
                `,
                i18n: "menu.infoZoomRatio",
                group: GroupType.img,
                name: "infoZoomRatio",
                icon: "",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.img.switchFitWindowAndOriginal();
                    });
                },
            })

            // 圖片長寬
            _ar.push({
                type: "html",
                html: `
                    <div class="main-toolbar-txt" data-name="infoSize">
                        <!-- 100<br>200 -->
                    </div>
                `,
                i18n: "menu.infoSize",
                group: GroupType.img,
                name: "infoSize",
                icon: "",
                func: (btn) => { },
            })

            // 檔案類型、檔案大小
            _ar.push({
                type: "html",
                html: `
                    <div class="main-toolbar-txt" data-name="infoType">
                        <!-- JPG<br>123.4MB -->
                    </div>
                `,
                i18n: "menu.infoType",
                group: GroupType.img,
                name: "infoType",
                icon: "",
                func: (btn) => { },
            })

            // 檔案修改時間
            _ar.push({
                type: "html",
                html: `
                    <div class="main-toolbar-txt" data-name="infoWriteTime">
                        <!--2022-05-02<br>01:19:49 -->
                    </div>
                `,
                i18n: "menu.infoWriteTime",
                group: GroupType.img,
                name: "infoWriteTime",
                icon: "",
                func: (btn) => { },
            })
        }

        /**
        * 初始化 工具列 pdf
        */
        function initToolbarPdf() {

            addBackButton(GroupType.pdf);

            // 上一張
            _ar.push({
                type: "button", html: "",
                i18n: "menu.prevFile",
                group: GroupType.pdf,
                name: "prevFile",
                icon: "arrow_left_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.prevFile();
                    });
                },
            })

            // 下一張
            _ar.push({
                type: "button", html: "",
                i18n: "menu.nextFile",
                group: GroupType.pdf,
                name: "nextFile",
                icon: "arrow_right_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.nextFile();
                    });
                },
            })

            // 開啟檔案
            addFavoritesButton(GroupType.pdf);
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuFile",
                group: GroupType.pdf,
                name: "showMenuFile",
                icon: "folder_open_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuFile(btn);
                    });
                },
            })

            // 上一個資料夾
            _ar.push({
                type: "button", html: "",
                i18n: "menu.prevDir",
                group: GroupType.pdf,
                name: "prevDir",
                icon: "previous_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.prevDir();
                    });
                },
            })

            // 下一個資料夾
            _ar.push({
                type: "button", html: "",
                i18n: "menu.nextDir",
                group: GroupType.pdf,
                name: "nextDir",
                icon: "next_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.nextDir();
                    });
                },
            })

            // 排序
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuSort",
                group: GroupType.pdf,
                name: "showMenuSort",
                icon: "arrow_sort_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuSort(btn);
                    });
                },
            })

            // 複製
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuCopy",
                group: GroupType.pdf,
                name: "showMenuCopy",
                icon: "copy_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuCopy(btn);
                    });
                },
            })

            // 快速拖曳
            _ar.push({
                type: "button", html: "",
                i18n: "menu.dragDropFile",
                group: GroupType.pdf,
                name: "dragDropFile",
                icon: "cursor_hover_20_regular.svg",
                func: (btn) => {
                    Lib.addDragThresholdListener(btn, 3, () => {
                        M?.script.file.dragDropFile();
                    });
                    btn.addEventListener("mousedown", (e) => {
                        if (e.button === 2) { // 滑鼠右鍵
                            M?.script.file.showContextMenu();
                        }
                    });
                    btn.setAttribute("data-menu", "none"); // 避免顯示右鍵選單
                },
            })

            // 刪除
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showDeleteFileMsg",
                group: GroupType.pdf,
                name: "showDeleteMsg",
                icon: "delete_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.showDeleteMsg();
                    });
                },
            })

            // 進入 大量瀏覽模式
            _ar.push({
                type: "button", html: "",
                i18n: "menu.bulkView",
                group: GroupType.pdf,
                name: "bulkView",
                icon: "app_folder_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", async () => {
                        M?.script.bulkView.show();
                    });
                },
            })

            // 設定
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showSetting",
                group: GroupType.pdf,
                name: "showSetting",
                icon: "settings_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.setting.showSetting();
                    });
                },
            })

            addLayoutButton(GroupType.pdf);


            //----------------------------------

            // 檔案類型、檔案大小
            _ar.push({
                type: "html",
                html: `
                    <div class="main-toolbar-txt" data-name="infoType">
                        <!-- JPG<br>123.4MB -->
                    </div>
                `,
                i18n: "menu.infoType",
                group: GroupType.pdf,
                name: "infoType",
                icon: "",
                func: (btn) => { },
            })

            // 檔案修改時間
            _ar.push({
                type: "html",
                html: `
                    <div class="main-toolbar-txt" data-name="infoWriteTime">
                        <!--2022-05-02<br>01:19:49 -->
                    </div>
                `,
                i18n: "menu.infoWriteTime",
                group: GroupType.pdf,
                name: "infoWriteTime",
                icon: "",
                func: (btn) => { },
            })
        }

        /**
         * 初始化 工具列 txt
         */
        function initToolbarTxt() {

            addBackButton(GroupType.txt);

            // 上一個檔案
            _ar.push({
                type: "button", html: "",
                i18n: "menu.prevFile",
                group: GroupType.txt,
                name: "prevFile",
                icon: "arrow_left_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.prevFile();
                    });
                },
            })

            // 下一個檔案
            _ar.push({
                type: "button", html: "",
                i18n: "menu.nextFile",
                group: GroupType.txt,
                name: "nextFile",
                icon: "arrow_right_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.nextFile();
                    });
                },
            })

            addFavoritesButton(GroupType.txt);

            // 檔案
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuFile",
                group: GroupType.txt,
                name: "showMenuFile",
                icon: "folder_open_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuFile(btn);
                    });
                },
            })

            // 儲存檔案
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showSave",
                group: GroupType.txt,
                name: "showSave",
                icon: "save_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.file.save(btn);
                    });
                },
            })

            // 上一個資料夾
            _ar.push({
                type: "button", html: "",
                i18n: "menu.prevDir",
                group: GroupType.txt,
                name: "prevDir",
                icon: "previous_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.prevDir();
                    });
                },
            })

            // 下一個資料夾
            _ar.push({
                type: "button", html: "",
                i18n: "menu.nextDir",
                group: GroupType.txt,
                name: "nextDir",
                icon: "next_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.nextDir();
                    });
                },
            })

            // 排序
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuSort",
                group: GroupType.txt,
                name: "showMenuSort",
                icon: "arrow_sort_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuSort(btn);
                    });
                },
            })

            // 複製
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuCopy",
                group: GroupType.txt,
                name: "showMenuCopy",
                icon: "copy_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuCopy(btn);
                    });
                },
            })

            // 快速拖曳
            _ar.push({
                type: "button", html: "",
                i18n: "menu.dragDropFile",
                group: GroupType.txt,
                name: "dragDropFile",
                icon: "cursor_hover_20_regular.svg",
                func: (btn) => {
                    Lib.addDragThresholdListener(btn, 3, () => {
                        M?.script.file.dragDropFile();
                    });
                    btn.addEventListener("mousedown", (e) => {
                        if (e.button === 2) { // 滑鼠右鍵
                            M?.script.file.showContextMenu();
                        }
                    });
                    btn.setAttribute("data-menu", "none"); // 避免顯示右鍵選單
                },
            })

            // 刪除
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showDeleteFileMsg",
                group: GroupType.txt,
                name: "showDeleteMsg",
                icon: "delete_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.showDeleteMsg();
                    });
                },
            })

            // 進入 大量瀏覽模式
            _ar.push({
                type: "button", html: "",
                i18n: "menu.bulkView",
                group: GroupType.txt,
                name: "bulkView",
                icon: "app_folder_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", async () => {
                        M?.script.bulkView.show();
                    });
                },
            })

            // 設定
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showSetting",
                group: GroupType.txt,
                name: "showSetting",
                icon: "settings_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.setting.showSetting();
                    });
                },
            })

            addLayoutButton(GroupType.txt);


            //---------------------

            // 檔案類型、檔案大小
            _ar.push({
                type: "html",
                html: `
                    <div class="main-toolbar-txt" data-name="infoType">
                        <!-- JPG<br>123.4MB -->
                    </div>
                `,
                i18n: "menu.infoType",
                group: GroupType.txt,
                name: "infoType",
                icon: "",
                func: (btn) => { },
            })

            // 檔案修改時間
            _ar.push({
                type: "html",
                html: `
                    <div class="main-toolbar-txt" data-name="infoWriteTime">
                        <!--2022-05-02<br>01:19:49 -->
                    </div>
                `,
                i18n: "menu.infoWriteTime",
                group: GroupType.txt,
                name: "infoWriteTime",
                icon: "",
                func: (btn) => { },
            })

        }

        /**
        * 初始化 工具列 welcome
        */
        function initToolbarWelcome() {

            addBackButton(GroupType.welcome);

            addFavoritesButton(GroupType.welcome);

            // 顯示選單 開啟檔案
            _ar.push({
                type: "button", html: "",
                i18n: "menu.openFile",
                group: GroupType.welcome,
                name: "openFile",
                icon: "folder_open_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuOpenFile(btn);
                    });
                },
            })

            // 設定
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showSetting",
                group: GroupType.welcome,
                name: "showSetting",
                icon: "settings_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.setting.showSetting();
                    });
                },
            })

            addLayoutButton(GroupType.welcome);
        }

        /**
         * 初始化 工具列 BulkView
         */
        function initBulkView() {

            addBackButton(GroupType.bulkView);

            // 開啟檔案
            addFavoritesButton(GroupType.bulkView);
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuFile",
                group: GroupType.bulkView,
                name: "showMenuFile",
                icon: "folder_open_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuFile(btn);
                    });
                },
            })

            // 上一個資料夾
            _ar.push({
                type: "button", html: "",
                i18n: "menu.prevDir",
                group: GroupType.bulkView,
                name: "prevDir",
                icon: "previous_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.prevDir();
                    });
                },
            })

            // 下一個資料夾
            _ar.push({
                type: "button", html: "",
                i18n: "menu.nextDir",
                group: GroupType.bulkView,
                name: "nextDir",
                icon: "next_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.nextDir();
                    });
                },
            })

            // 排序
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuSort",
                group: GroupType.bulkView,
                name: "showMenuSort",
                icon: "arrow_sort_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuSort(btn);
                    });
                },
            })

            // 複製
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showMenuCopy",
                group: GroupType.bulkView,
                name: "showMenuCopy",
                icon: "copy_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuCopy(btn);
                    });
                },
            })

            // 快速拖曳
            _ar.push({
                type: "button", html: "",
                i18n: "menu.dragDropFile",
                group: GroupType.bulkView,
                name: "dragDropFile",
                icon: "cursor_hover_20_regular.svg",
                func: (btn) => {
                    Lib.addDragThresholdListener(btn, 3, () => {
                        M?.script.file.dragDropFile();
                    });
                    btn.addEventListener("mousedown", (e) => {
                        if (e.button === 2) { // 滑鼠右鍵
                            M?.script.file.showContextMenu();
                        }
                    });
                    btn.setAttribute("data-menu", "none"); // 避免顯示右鍵選單
                },
            })

            // 刪除
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showDeleteDirMsg",
                group: GroupType.bulkView,
                name: "showDeleteMsg",
                icon: "delete_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.fileLoad.showDeleteMsg();
                    });
                },
            })

            // 設定
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showSetting",
                group: GroupType.bulkView,
                name: "showSetting",
                icon: "settings_20_regular.svg",
                func: (btn) => {
                    btn.addEventListener("click", () => {
                        M?.script.setting.showSetting();
                    });
                },
            })

            addLayoutButton(GroupType.bulkView);

            // 檔案修改時間
            _ar.push({
                type: "html",
                html: `
                    <div class="main-toolbar-txt" data-name="infoWriteTime">
                        <!--2022-05-02<br>01:19:49 -->
                    </div>
                `,
                i18n: "menu.infoWriteTime",
                group: GroupType.bulkView,
                name: "infoWriteTime",
                icon: "",
                func: (btn) => { },
            })

            // 大量瀏覽模式設定
            _ar.push({
                type: "button", html: "",
                i18n: "menu.showBulkViewSetting",
                group: GroupType.bulkView,
                name: "showBulkViewSetting",
                icon: "options_20_regular.svg",
                func: (btn) => {
                    btn.style.order = "2001"; // 靠右對齊

                    btn.addEventListener("click", () => {
                        M?.script.menu.showMenuBulkView(btn);
                    });
                },
            })
        }

        //---------------------

        /** 新增可自訂的返回按鈕。各工具列類型保有自己的 DOM，避免切換類型時搬移同一節點。 */
        function addBackButton(group: string) {
            _ar.push({
                type: "button", html: "",
                i18n: "menu.back",
                group,
                name: "back",
                icon: "arrow_hook_up_left_20_regular.svg",
                func: (btn) => {
                    btn.classList.add("main-toolbar-back");
                    btn.setAttribute("aria-label", M?.i18n?.t("menu.back") || "Back");
                    btn.setAttribute("tabindex", "0");
                    btn.addEventListener("click", () => { M?.toolbarBack?.runEvent(); });
                    btn.addEventListener("keydown", event => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            M?.toolbarBack?.runEvent();
                        }
                    });
                },
            });
        }

        /**
         * 新增 html
         * @param item 
         */
        function addToolbarHtml(item: {
            group: string,
            html: string,
            i18n: string,
            func: (domBtn: HTMLElement) => void,
        }) {
            const div = Lib.newDom(item.html);
            div.setAttribute("title", item.i18n);
            div.setAttribute("i18n", item.i18n);
            div.style.order = "999";
            addToolbarDom({
                group: item.group,
                dom: div,
                func: item.func,
            });
        }

        /**
         * 新增 垂直線
         * @param item 
         */
        function addToolbarHr(item: {
            group: string,
            func: (domBtn: HTMLElement) => void,
        }) {
            const div = Lib.newDom(`<div class="main-toolbar-hr"> </div>`);
            div.style.order = "888";
            addToolbarDom({
                group: item.group,
                dom: div,
                func: item.func,
            });
        }

        /**
         * 新增 button
         * @param item 
         */
        function addToolbarBtn(item: {
            group: string,
            name: string,
            icon: string,
            i18n: string,
            func: (domBtn: HTMLElement) => void,
        }) {

            // 產生按鈕
            const div = Lib.newDom(`
                <div class="main-toolbar-btn js-noDrag" data-name="${item.name}" title="${item.i18n}" i18n="${item.i18n}" role="button">
                    ${SvgList[item.icon]}
                </div>`);
            div.style.order = "888"; // 未定義順序的按鈕就放在最後面
            addToolbarDom({
                group: item.group,
                dom: div,
                func: item.func,
            });
        }

        /**
         * 
         * @param item 
         */
        function addToolbarDom(item: {
            group: string, dom: HTMLElement,
            func: (domBtn: HTMLElement) => void,
        }) {

            if (M === null) { return }

            // 如果群組不存在，就先產生群組
            let domGroup = M.domToolbar.querySelector(`.main-toolbar-group[data-name=${item.group}]`);
            if (domGroup === null) {
                const div = Lib.newDom(`<div class="main-toolbar-group" data-name="${item.group}">
                    <div class="main-toolbar-alignment" data-align="left"></div>
                    <div class="main-toolbar-alignment" data-align="center"></div>
                    <div class="main-toolbar-alignment" data-align="right"></div>
                </div>`);
                M.domToolbar.querySelector("#toolbar-content")?.appendChild(div);
                domGroup = M.domToolbar.querySelector(`.main-toolbar-group[data-name=${item.group}]`);
            }

            item.func(item.dom)
            if (domGroup !== null) {
                const center = domGroup.querySelector<HTMLElement>('.main-toolbar-alignment[data-align="center"]');
                (center || domGroup).appendChild(item.dom);
            }
        }

    }
}
