import { BaseWindow } from "../BaseWindow";
import { Config } from "../Config";
import { I18n } from "../I18n";
import { Lib } from "../Lib";
import { MainToolbar } from "../MainWindow/MainToolbar";
import { Msgbox } from "../Msgbox";
import { SelectionManager } from "../SelectionManager";

declare global {
    var settingWindow: SettingWindow;
}

document.addEventListener("DOMContentLoaded", async () => {
    BaseWindow.init();
    window.settingWindow = new SettingWindow();
});

class SettingWindow {

    public saveData;

    constructor() {

        this.saveData = saveSetting;

        var _appInfo: AppInfo;
        const _config = new Config(baseWindow);
        const _mainToolbar = new MainToolbar(null); // 取得工具列
        const _i18n = new I18n();
        _i18n.initNone(); // 有翻譯的地方都顯示空白(用於翻譯前)
        _i18n.pushData(langData);
        const _msgbox = new Msgbox(_i18n);

        /** 初始設定 */
        const _defaultConfig = new Config(baseWindow).settings;

        const _loadEvent: (() => void)[] = [];
        /**
         * 讀取設定完成後執行的工作
         * @param func 
         */
        function addLoadEvent(func: () => void) {
            _loadEvent.push(func);
        }

        function getDom(selectors: string) {
            return document.querySelector(selectors) as HTMLElement;
        }

        // 指定不能被選取的元素
        const selectionManager = new SelectionManager("blacklist");
        selectionManager.add(".btn");
        selectionManager.add(".switch");

        /**
          * 覆寫 onCreate
          * @param json 
          */
        baseWindow.onCreate = async (json: AppInfo) => {

            baseWindow.appInfo = json;
            _appInfo = json;

            const width = 600;
            const height = 450;
            await WV_Window.ShowWindowAtCenter(width, height); // 顯示視窗

            // win11 指定視窗的大小是未乘以縮放比例的，所以網頁寬度與指定的寬度不同，就重新設定視窗大小
            if (Math.abs(document.body.clientWidth - width) > 10) {
                let ratio = window.devicePixelRatio; // 獲取瀏覽器的縮放比例，必須在視窗顯示後才能獲取
                await WV_Window.SetSize(width * ratio, height * ratio);
            }
            const ratio = window.devicePixelRatio;
            WV_Window.SetMinimumSize(400 * ratio, 300 * ratio); // 設定視窗最小 size

            WV_Window.Text = "Setting";
            let iconPath = Lib.combine([await WV_Window.GetAppDirPath(), "Www\\img\\logo.ico"]);
            WV_Window.SetIcon(iconPath);

            // 如果是商店APP版，就隱藏某些區塊
            if (json.isStoreApp) {
                document.body.setAttribute("showType", "storeApp");
            }

            // 關閉視窗前觸發
            baseWindow.closingEvents.push(async () => {
                await saveSetting();
            });

            // 拖曳視窗
            const domLeftBox = getDom("#window-left .pagetab") as HTMLElement;
            domLeftBox.addEventListener("mousedown", async (e) => {

                // 如果有滾動條，就禁止拖曳(避免無法點擊滾動條)
                if (Lib.isScrollbarVisible(domLeftBox)) { return; }

                const dom = e.target as HTMLElement;
                if (dom) {
                    if (dom.classList.contains("js-noDrag")) { return; }
                }
                if (e.button === 0) { // 滑鼠左鍵
                    await WV_Window.WindowDrag("move");
                }
            })
            domLeftBox.addEventListener("touchstart", async (e) => {

                // 如果有滾動條，就禁止拖曳(避免無法點擊滾動條)
                if (Lib.isScrollbarVisible(domLeftBox)) { return; }

                const dom = e.target as HTMLDivElement;
                if (dom) {
                    if (dom.classList.contains("js-noDrag")) { return; }
                }
                baseWindow.touchDrop.start(domLeftBox, e, "move");
            });

            tippy(".img-help", {
                /*content(reference: HTMLElement) {
                    const id = reference.getAttribute("data-tooltip");
                    if (id === null) { return ""; }
                    const template = document.getElementById(id);
                    return template?.innerHTML;
                },*/
                onShow(instance: any) {
                    const dataI18n = instance.reference.getAttribute("data-i18n");
                    let t = dataI18n;
                    if (t !== null) {
                        t = _i18n.t(dataI18n)
                    }
                    instance.setContent(t);
                },
                allowHTML: true,
                animation: "tippyMyAnimation",
                theme: "tippyMyTheme",
                arrow: false, // 箭頭
            });

            // -------------

            // 讀取設定檔
            let userSetting = {};
            try {
                userSetting = JSON.parse(json.settingTxt);
            } catch (e) { }
            $.extend(true, _config.settings, userSetting);

            // 執行
            _loadEvent.forEach(func => {
                func()
            });

            // getDom("input")?.focus();
            // getDom("input")?.blur(); // 失去焦點
        }

        // 初始化多國語言
        addLoadEvent(() => {

            const select_lang = getDom("#select-lang") as HTMLSelectElement;

            let configLang = _config.settings.other.lang;
            if (configLang == "") {
                configLang = Lib.getBrowserLang();
            }
            select_lang.value = configLang;
            _i18n.setLang(configLang); // 更新畫面的語言

            select_lang.addEventListener("change", () => {
                let val = select_lang.value;
                _config.settings.other.lang = val;
                appleSettingOfMain();
                _i18n.setLang(val); // 更新畫面的語言
            });

        })

        // 自訂工具列
        addLoadEvent(() => {

            const mainToolbarArray = _mainToolbar.getArrray();

            const arGroupName = ["img", "pdf", "txt", "bulkView"];
            arGroupName.map((gn) => {

                const groupName = gn as ("img" | "pdf" | "txt" | "bulkView");
                const dom_toolbarList = getDom(`#toolbarList-${groupName}`) as HTMLElement;

                // 產生html
                let html = "";
                for (let i = 0; i < mainToolbarArray.length; i++) {
                    const item = mainToolbarArray[i];

                    if (item.type !== "button") { continue; }
                    const h = `
                        <div class="toolbarList-item" data-name="${item.name}">
                            <input class="toolbarList-checkbox base-checkbox" type="checkbox" data-name="${item.name}" checked>
                            ${SvgList[item.icon]}
                            ${_i18n.tSpan(item.i18n)}
                        </div>`;
                    if (item.group == groupName) { html += h; }
                }
                dom_toolbarList.innerHTML = html;

                // 初始化 排序
                const arMainToolbar = _config.settings.mainToolbar[groupName];
                for (let i = 0; i < arMainToolbar.length; i++) {
                    const item = arMainToolbar[i];
                    const ardomToolbarList = dom_toolbarList.querySelectorAll(".toolbarList-item");
                    const d1 = ardomToolbarList[i];
                    const d2 = dom_toolbarList.querySelector(`[data-name=${item.n}]`);
                    if (d1 == undefined) { break; }
                    if (d2 === null) { continue; }
                    swapDom(d1, d2); // dom 交換順序
                }

                // 初始化 checkbox狀態
                for (let i = 0; i < arMainToolbar.length; i++) {
                    const item = arMainToolbar[i];
                    const d2 = dom_toolbarList.querySelector(`[data-name=${item.n}]`);
                    if (d2 === null) { continue; }
                    const domCheckbox = d2.querySelector(".toolbarList-checkbox") as HTMLInputElement;
                    domCheckbox.checked = item.v;
                }

                // 給每一個checkbox都註冊onchange
                const domAr_checkbox = dom_toolbarList.querySelectorAll(".toolbarList-checkbox");
                for (let i = 0; i < domAr_checkbox.length; i++) {
                    const domCheckbox = domAr_checkbox[i] as HTMLInputElement;
                    domCheckbox.onchange = () => {
                        let data = getToolbarListData();
                        _config.settings.mainToolbar = data;
                        appleSettingOfMain();
                    }
                }

                // 初始化拖曳功能
                new Sortable(dom_toolbarList, {
                    animation: 150,
                    onEnd: (evt) => {
                        let data = getToolbarListData();
                        _config.settings.mainToolbar = data;
                        appleSettingOfMain();
                    }
                });

            })

            /** 取得排序與顯示狀態 */
            function getToolbarListData() {
                function getItem(type: string) {
                    const ar = [];
                    const domToolbarList = getDom(`#toolbarList-${type}`) as HTMLElement;
                    const domAr = domToolbarList.querySelectorAll(".toolbarList-checkbox");

                    for (let i = 0; i < domAr.length; i++) {
                        const domCheckbox = domAr[i] as HTMLInputElement;
                        const name = domCheckbox.getAttribute("data-name") + "";
                        const val = domCheckbox.checked;
                        ar.push({
                            n: name,
                            v: val
                        })
                    }
                    return ar;
                }

                return {
                    img: getItem("img"),
                    pdf: getItem("pdf"),
                    txt: getItem("txt"),
                    bulkView: getItem("bulkView"),
                };
            }

            // ------------

            // 切換下拉選單時，顯示對應的內容
            const select_toolbarListType = getDom("#select-toolbarListType") as HTMLSelectElement;
            const dom_toolbarList_img = getDom("#toolbarList-img") as HTMLElement;
            const dom_toolbarList_pdf = getDom("#toolbarList-pdf") as HTMLElement;
            const dom_toolbarList_txt = getDom("#toolbarList-txt") as HTMLElement;
            const dom_toolbarList_bulkView = getDom("#toolbarList-bulkView") as HTMLElement;
            const eventChange = () => {
                const val = select_toolbarListType.value;
                if (val == "img") {
                    dom_toolbarList_img.style.display = "block";
                    dom_toolbarList_pdf.style.display = "none";
                    dom_toolbarList_txt.style.display = "none";
                    dom_toolbarList_bulkView.style.display = "none";
                }
                if (val == "pdf") {
                    dom_toolbarList_img.style.display = "none";
                    dom_toolbarList_pdf.style.display = "block";
                    dom_toolbarList_txt.style.display = "none";
                    dom_toolbarList_bulkView.style.display = "none";
                }
                if (val == "txt") {
                    dom_toolbarList_img.style.display = "none";
                    dom_toolbarList_pdf.style.display = "none";
                    dom_toolbarList_txt.style.display = "block";
                    dom_toolbarList_bulkView.style.display = "none";
                }
                if (val == "bulkView") {
                    dom_toolbarList_img.style.display = "none";
                    dom_toolbarList_pdf.style.display = "none";
                    dom_toolbarList_txt.style.display = "none";
                    dom_toolbarList_bulkView.style.display = "block";
                }
            }
            select_toolbarListType.onchange = eventChange;
            eventChange();
        });

        // 主題
        addLoadEvent(() => {

            const jq_colorWindowBackground = $("#text-colorWindowBackground"); // 視窗顏色
            const jq_colorWindowBorder = $("#text-colorWindowBorder"); // 邊框顏色
            const jq_colorWhite = $("#text-colorWhite"); // 文字顏色
            const jq_colorBlack = $("#text-colorBlack"); // 區塊底色
            const jq_colorBlue = $("#text-colorBlue"); // 主顏色
            const dom_applyThemeBtns = getDom("#applyTheme-btns") as HTMLElement;
            const select_windowStyle = getDom("#select-windowStyle") as HTMLSelectElement;
            const btnApplyColor = getDom("#btn-applySuggestedColor") as HTMLButtonElement; // 套用建議配色

            // 初始化顏色選擇器物件
            addEvent(jq_colorWindowBackground, "--color-window-background", true);
            addEvent(jq_colorWindowBorder, "--color-window-border", true);
            addEvent(jq_colorWhite, "--color-white", false);
            addEvent(jq_colorBlack, "--color-black", false);
            addEvent(jq_colorBlue, "--color-blue", false);
            // add(jQdom_theme_colorGrey, "--color-grey", false);

            applyTheme();

            // 初始化顏色選擇器物件
            function addEvent(jQdim: JQuery, name: string, opacity: boolean = false) {

                // @ts-ignore
                jQdim.minicolors({
                    format: "rgb",
                    opacity: opacity,
                    changeDelay: 10, // change時間的更新延遲
                    change: function (value: string, opacity: number) {

                        // @ts-ignore
                        let c = jQdim.minicolors("rgbObject"); // 取得顏色 

                        // 設定本身視窗的主題
                        /*for (let i = 1; i < 9; i++) {
                            cssRoot.style.setProperty(name + `${i}0`, `rgba(${c.r}, ${c.g}, ${c.b}, ${(i / 10)} )`)
                        }
                        cssRoot.style.setProperty(name, value);*/

                        // 設定父親視窗的主題
                        // @ts-ignore
                        _config.settings["theme"][name] = c;
                        appleSettingOfMain();
                    }
                });
            }

            // 讀取設定，套用顏色
            function applyTheme() {
                // 修改輸入框的文字
                function setRgb(jqdom: JQuery<HTMLElement>, c: { r: number, g: number, b: number, }) {
                    // @ts-ignore
                    jqdom.minicolors("value", `rgb(${c.r}, ${c.g}, ${c.b})`);
                }
                function setRgba(jqdom: JQuery<HTMLElement>, c: { r: number, g: number, b: number, a: number, }) {
                    // @ts-ignore
                    jqdom.minicolors("value", `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`);
                }
                // 修改輸入框的文字
                setRgba(jq_colorWindowBackground, _config.settings.theme["--color-window-background"]);
                setRgba(jq_colorWindowBorder, _config.settings.theme["--color-window-border"]);
                setRgb(jq_colorWhite, _config.settings.theme["--color-white"]);
                setRgb(jq_colorBlack, _config.settings.theme["--color-black"]);
                setRgb(jq_colorBlue, _config.settings.theme["--color-blue"]);
            }

            // -------------

            // 初始化主題按鈕
            applyThemeAddBtn( // 深色主題
                `<div class="btn js-btn-darkTheme" i18n="sw.theme.darkTheme">${_i18n.t("sw.theme.darkTheme")}</div>`,
                { r: 31, g: 39, b: 43, a: 0.97 },
                { r: 255, g: 255, b: 255, a: 0.25 },
                { r: 255, g: 255, b: 255, },
                { r: 0, g: 0, b: 0, },
                { r: 0, g: 200, b: 255, },
            )
            applyThemeAddBtn( // 淺色主題
                `<div class="btn js-btn-lightTheme" i18n="sw.theme.lightTheme">${_i18n.t("sw.theme.lightTheme")}</div>`,
                { r: 255, g: 255, b: 255, a: 0.97 },
                { r: 112, g: 112, b: 112, a: 0.25 },
                { r: 0, g: 0, b: 0, },
                { r: 238, g: 238, b: 238, },
                { r: 0, g: 135, b: 220, },
            )

            // 產生 套用主題 的按鈕
            function applyThemeAddBtn(html: string,
                windowBackground: { r: number, g: number, b: number, a: number },
                windowBorder: { r: number, g: number; b: number, a: number },
                white: { r: number, g: number, b: number },
                black: { r: number, g: number, b: number },
                blue: { r: number, g: number, b: number }) {

                const btn = Lib.newDom(html);

                btn.addEventListener("mouseup", () => {
                    // 根據選擇的主題來調整 視窗效果
                    const windowStyle = select_windowStyle.value;
                    if (baseWindow.appInfo.isWin11) {
                        let isDark = isDarkMode(windowBackground);
                        if (isDark) {
                            if (windowStyle == "acrylicLight") { select_windowStyle.value = "acrylicDark"; }
                            if (windowStyle == "micaLight") { select_windowStyle.value = "micaDark"; }
                            if (windowStyle == "micaAltLight") { select_windowStyle.value = "micaAltDark"; }
                            if (windowStyle.includes("Light")) {
                                // 主動觸發 switchWindowStyle 的 change 事件
                                select_windowStyle.dispatchEvent(new Event("change"));
                                btnApplyColor.style.display = "none";
                            }
                        } else {
                            if (windowStyle == "acrylicDark") { select_windowStyle.value = "acrylicLight"; }
                            if (windowStyle == "micaDark") { select_windowStyle.value = "micaLight"; }
                            if (windowStyle == "micaAltDark") { select_windowStyle.value = "micaAltLight"; }
                            if (windowStyle.includes("Dark")) {
                                select_windowStyle.dispatchEvent(new Event("change"));
                                btnApplyColor.style.display = "none";
                            }
                        }
                    }
                });

                btn.onclick = () => {

                    // 根據選擇的主題來調整 背景透明度
                    const windowStyle = select_windowStyle.value;
                    if (windowStyle === "none" || windowStyle === "default") {
                        windowBackground.a = 0.97;
                    }
                    else if (windowStyle === "aero") {
                        windowBackground.a = 0.8;
                    }
                    else if (windowStyle === "acrylic") {
                        windowBackground.a = 0.7;
                    }
                    else if (windowStyle === "acrylicDark" || windowStyle === "acrylicLight") {
                        windowBackground.a = 0.7;
                    }
                    else if (windowStyle === "micaDark" || windowStyle === "micaLight" ||
                        windowStyle === "micaAltDark" || windowStyle === "micaAltLight"
                    ) {
                        windowBackground.a = 0;
                    }

                    _config.settings.theme["--color-window-background"] = windowBackground;
                    _config.settings.theme["--color-window-border"] = windowBorder;
                    _config.settings.theme["--color-white"] = white;
                    _config.settings.theme["--color-black"] = black;
                    _config.settings.theme["--color-blue"] = blue;
                    applyTheme();
                };
                dom_applyThemeBtns.append(btn);
            }
        });

        // 圖片預設 縮放模式、對齊位置
        addLoadEvent(() => {
            const select_tiefseeviewZoomType = getDom("#select-tiefseeviewZoomType") as HTMLSelectElement;
            const text_tiefseeviewZoomValue = getDom("#text-tiefseeviewZoomValue") as HTMLInputElement;
            const select_tiefseeviewAlignType = getDom("#select-tiefseeviewAlignType") as HTMLSelectElement;

            select_tiefseeviewZoomType.value = _config.settings.image["tiefseeviewZoomType"];
            text_tiefseeviewZoomValue.value = _config.settings.image["tiefseeviewZoomValue"].toString();
            select_tiefseeviewAlignType.value = _config.settings.image["tiefseeviewAlignType"];

            // 避免出現下拉選單沒有的值
            if (select_tiefseeviewZoomType.value == "") {
                select_tiefseeviewZoomType.value = "fitWindowOrImageOriginal";
            }
            if (select_tiefseeviewAlignType.value == "") {
                select_tiefseeviewAlignType.value = "center";
            }

            showValue();

            // 顯示或隱藏 「圖片預設縮放模式」的附加欄位
            function showValue() {
                const val = select_tiefseeviewZoomType.value;
                const ar = ["imageWidthPx", "imageHeightPx", "windowWidthRatio", "windowHeightRatio"];
                if (ar.indexOf(val) !== -1) {
                    text_tiefseeviewZoomValue.style.display = "block";
                } else {
                    text_tiefseeviewZoomValue.style.display = "none";
                }
            }

            select_tiefseeviewZoomType.addEventListener("change", () => {
                showValue();
                const val = select_tiefseeviewZoomType.value;
                _config.settings.image["tiefseeviewZoomType"] = val;
                appleSettingOfMain();
            });
            text_tiefseeviewZoomValue.addEventListener("change", () => {
                let val = Number(text_tiefseeviewZoomValue.value);
                if (isNaN(val)) { val = 100; }
                if (val > 99999) { val = 99999; }
                if (val < 1) { val = 1; }
                text_tiefseeviewZoomValue.value = val.toString();
                _config.settings.image["tiefseeviewZoomValue"] = val;
                appleSettingOfMain();
            });
            select_tiefseeviewAlignType.addEventListener("change", () => {
                const val = select_tiefseeviewAlignType.value;
                _config.settings.image["tiefseeviewAlignType"] = val;
                appleSettingOfMain();
            });
        })

        // 銳化圖片
        addLoadEvent(() => {
            const select_sharpen = getDom("#select-sharpen") as HTMLSelectElement;

            select_sharpen.value = _config.settings.image.sharpenValue.toString();

            select_sharpen.addEventListener("change", () => {
                let val = select_sharpen.value;
                _config.settings.image.sharpenValue = Number(val);
                appleSettingOfMain();
            });
        })

        // 預設排序
        addLoadEvent(() => {
            const select_fileSort = getDom("#select-fileSort") as HTMLSelectElement;
            const select_dirSort = getDom("#select-dirSort") as HTMLSelectElement;

            select_fileSort.value = _config.settings.sort["fileSort"];
            select_dirSort.value = _config.settings.sort["dirSort"];

            select_fileSort.addEventListener("change", () => {
                const val = select_fileSort.value;
                _config.settings.sort["fileSort"] = val;
                appleSettingOfMain();
            });
            select_dirSort.addEventListener("change", () => {
                const val = select_dirSort.value;
                _config.settings.sort["dirSort"] = val;
                appleSettingOfMain();
            });
        })

        // 關聯副檔名 
        addLoadEvent(() => {
            const text_extension = getDom("#text-extension") as HTMLTextAreaElement;
            const btn_extension = getDom("#btn-extension") as HTMLElement;
            const text_disassociate = getDom("#text-disassociate") as HTMLTextAreaElement;
            const btn_disassociate = getDom("#btn-disassociate") as HTMLElement;

            const s_extension = ["JPG", "JPEG", "PNG", "GIF", "BMP", "SVG", "WEBP",];
            text_extension.value = s_extension.join("\n"); // 預設顯示的文字
            text_disassociate.value = s_extension.join("\n"); // 預設顯示的文字

            // 關聯副檔名
            btn_extension.addEventListener("click", async (e) => {
                const arExtension = text_extension.value.split("\n");
                let ar: string[] = [];
                for (let i = 0; i < arExtension.length; i++) {
                    const item = arExtension[i].toLocaleLowerCase().trim();
                    if (item !== "" && ar.indexOf(item) === -1) {
                        ar.push(item);
                    }
                }

                _msgbox.show({
                    txt: _i18n.t("msg.associationExtension") + "<br>" // 確定用Tiefsee來開啟這些檔案嗎？
                        + ar.join(", "),
                    funcYes: async (dom: HTMLElement, inputTxt: string) => {
                        _msgbox.close(dom);
                        let appPath = await WV_Window.GetTiefseePath();
                        await WV_System.AssociationExtension(ar, appPath);
                        _msgbox.show({ txt: _i18n.t("msg.done"), }); // 處理完成
                    }
                });
            });

            // 解除關聯副檔名
            btn_disassociate.addEventListener("click", async (e) => {
                const arExtension = text_disassociate.value.split("\n");
                let ar: string[] = [];
                for (let i = 0; i < arExtension.length; i++) {
                    const item = arExtension[i].toLocaleLowerCase().trim();
                    if (item !== "" && ar.indexOf(item) === -1) {
                        ar.push(item);
                    }
                }

                _msgbox.show({
                    txt: _i18n.t("msg.removeAssociationExtension") + "<br>" // 確定要解除這些檔案與Tiefsee的關聯嗎？
                        + ar.join(", "),
                    funcYes: async (dom: HTMLElement, inputTxt: string) => {
                        _msgbox.close(dom);
                        let appPath = await WV_Window.GetTiefseePath();
                        await WV_System.RemoveAssociationExtension(ar, appPath);
                        _msgbox.show({ txt: _i18n.t("msg.done"), }); // 處理完成
                    }
                });
            });
        })

        // 開啟 系統設定
        addLoadEvent(() => {
            const btn = getDom("#btn-openSystemSettings") as HTMLElement;

            btn.addEventListener("click", async () => {
                let path = "ms-settings:defaultapps";
                WV_RunApp.OpenUrl(path)
            });
        })

        // 視窗 圓角
        addLoadEvent(() => {
            const domText = getDom("#text-windowBorderRadius") as HTMLInputElement;
            domText.value = _config.settings.theme["--window-border-radius"].toString();

            domText.addEventListener("change", () => {
                let val = Number(domText.value);
                if (val < 0) { val = 0; }
                if (val > 15) { val = 15; }
                domText.value = val.toString();

                _config.settings["theme"]["--window-border-radius"] = val;
                appleSettingOfMain();
            });
        })

        // 視窗 縮放比例
        addLoadEvent(() => {
            const domText = getDom("#text-zoomFactor") as HTMLInputElement;
            domText.value = _config.settings.theme["zoomFactor"].toString();
            domText.addEventListener("change", () => {
                let val = Number(domText.value);
                if (isNaN(val)) { val = 1; }
                if (val === 0) { val = 1; }
                if (val < 0.5) { val = 0.5; }
                if (val > 3) { val = 3; }
                domText.value = val.toString();

                _config.settings["theme"]["zoomFactor"] = val;
                appleSettingOfMain();
            })
        })

        // 文字粗細
        addLoadEvent(() => {
            const domSelect = getDom("#select-fontWeight") as HTMLInputElement;
            domSelect.value = _config.settings.theme["fontWeight"];

            domSelect.addEventListener("change", () => {
                let val = domSelect.value;
                _config.settings["theme"]["fontWeight"] = val;
                appleSettingOfMain();
            });
        })

        // 圖示粗細
        addLoadEvent(() => {
            const domSelect = getDom("#select-svgWeight") as HTMLInputElement;
            domSelect.value = _config.settings.theme["svgWeight"];

            domSelect.addEventListener("change", () => {
                let val = domSelect.value;
                _config.settings["theme"]["svgWeight"] = val;
                appleSettingOfMain();
            });
        })

        // 視窗效果
        addLoadEvent(() => {

            const switchWindowStyle = getDom("#select-windowStyle") as HTMLSelectElement;
            switchWindowStyle.value = _config.settings["theme"]["windowStyle"];

            switchWindowStyle.addEventListener("change", () => {
                let val = switchWindowStyle.value;
                _config.settings["theme"]["windowStyle"] = val;
            });

            // 顯示名單
            let options: string[] = [];
            if (baseWindow.appInfo.isWin11) {
                options = [
                    "none",
                    "default",
                    "acrylicDark", "acrylicLight",
                    "micaDark", "micaLight",
                    "micaAltDark", "micaAltLight"
                ];
            } else {
                options = ["none", "aero", "acrylic"];
            }

            // 隱藏不支援的選項
            for (let i = 0; i < switchWindowStyle.options.length; i++) {
                const item = switchWindowStyle.options[i];
                if (options.indexOf(item.value) === -1) {
                    item.style.display = "none";
                }
            }

            // 如果選擇的選項不在支援的名單中，就指定為 None
            if (options.indexOf(switchWindowStyle.value) === -1) {
                switchWindowStyle.value = "none";
            }

            const btnRestart = getDom("#btn-windowStyle-restart") as HTMLButtonElement;
            const btnApplyColor = getDom("#btn-applySuggestedColor") as HTMLButtonElement;
            const jqWindowBg = $("#text-colorWindowBackground"); // 視窗顏色
            btnRestart.style.display = "none";
            btnApplyColor.style.display = "none";
            switchWindowStyle.addEventListener("change", () => {

                if (baseWindow.appInfo.isWin11) { // win11
                    // 調整選項後，直接套用
                    appleSettingOfMain();
                } else { // win10
                    // 調整選項後，顯示「重新啟動」的按鈕
                    btnRestart.style.display = "";
                }

                if (baseWindow.appInfo.isWin11) {
                    // @ts-ignore
                    const windowBg = jqWindowBg.minicolors("rgbObject"); // 取得顏色 
                    const isDark = isDarkMode(windowBg);
                    const val = switchWindowStyle.value;

                    // 如果背景透明度不符
                    if (val === "none" || val === "default") {
                        if (windowBg.a < 0.9) {
                            btnApplyColor.style.display = "";
                        }
                    }
                    else if (val === "acrylicDark" || val === "acrylicLight") {
                        if (windowBg.a < 0.5 || windowBg.a > 0.8) {
                            btnApplyColor.style.display = "";
                        }
                    }
                    else if (val === "micaDark" || val === "micaLight" ||
                        val === "micaAltDark" || val === "micaAltLight") {
                        if (windowBg.a > 0.1) {
                            btnApplyColor.style.display = "";
                        }
                    }

                    // 如果主題不符
                    if (isDark) {
                        if (val === "acrylicLight" || val === "micaLight" || val === "micaAltLight") {
                            btnApplyColor.style.display = "";
                        }
                    } else {
                        if (val === "acrylicDark" || val === "micaDark" || val === "micaAltDark") {
                            btnApplyColor.style.display = "";
                        }
                    }
                }
            });
            btnRestart.addEventListener("click", () => {
                restartTiefsee();
            });
            btnApplyColor.addEventListener("click", () => {

                const val = switchWindowStyle.value;

                if (val === "acrylicLight" || val === "micaLight" || val === "micaAltLight") {
                    getDom(".js-btn-lightTheme")?.click();
                }
                else if (val === "acrylicDark" || val === "micaDark" || val === "micaAltDark") {
                    getDom(".js-btn-darkTheme")?.click();
                }
                else {
                    //@ts-ignore
                    const windowBg = jqWindowBg.minicolors("rgbObject"); // 取得顏色 
                    const isDark = isDarkMode(windowBg);
                    if (isDark) {
                        getDom(".js-btn-darkTheme")?.click();
                    } else {
                        getDom(".js-btn-lightTheme")?.click();
                    }
                }

                btnApplyColor.style.display = "none";
            });
        })

        // 工具列
        addLoadEvent(() => {
            const switch_mainToolbarEnabled = getDom("#switch-mainToolbarEnabled") as HTMLInputElement;
            const select_mainToolbarAlign = getDom("#select-mainToolbarAlign") as HTMLInputElement;

            switch_mainToolbarEnabled.checked = _config.settings["layout"]["mainToolbarEnabled"]; // 顯示工具列
            select_mainToolbarAlign.value = _config.settings["layout"]["mainToolbarAlign"]; // 工具列對齊

            switch_mainToolbarEnabled.addEventListener("change", () => { // 顯示工具列
                const val = switch_mainToolbarEnabled.checked;
                _config.settings["layout"]["mainToolbarEnabled"] = val;
                appleSettingOfMain();
            });

            select_mainToolbarAlign.addEventListener("change", () => { // 工具列對齊
                const val = select_mainToolbarAlign.value;
                _config.settings["layout"]["mainToolbarAlign"] = val;
                appleSettingOfMain();
            });
        })

        // 滑鼠按鍵 + 滑鼠滾輪
        addLoadEvent(() => {

            const select_leftDoubleClick = getDom("#select-leftDoubleClick") as HTMLSelectElement;
            const select_scrollWheelButton = getDom("#select-scrollWheelButton") as HTMLSelectElement;
            const select_mouseButton4 = getDom("#select-mouseButton4") as HTMLSelectElement;
            const select_mouseButton5 = getDom("#select-mouseButton5") as HTMLSelectElement;
            const select_scrollUp = getDom("#select-scrollUp") as HTMLSelectElement;
            const select_scrollDown = getDom("#select-scrollDown") as HTMLSelectElement;
            const select_scrollUpCtrl = getDom("#select-scrollUpCtrl") as HTMLSelectElement;
            const select_scrollDownCtrl = getDom("#select-scrollDownCtrl") as HTMLSelectElement;
            const select_scrollUpShift = getDom("#select-scrollUpShift") as HTMLSelectElement;
            const select_scrollDownShift = getDom("#select-scrollDownShift") as HTMLSelectElement;
            const select_scrollUpAlt = getDom("#select-scrollUpAlt") as HTMLSelectElement;
            const select_scrollDownAlt = getDom("#select-scrollDownAlt") as HTMLSelectElement;

            const arDom = [
                { dom: select_leftDoubleClick, config: "leftDoubleClick" },
                { dom: select_scrollWheelButton, config: "scrollWheelButton" },
                { dom: select_mouseButton4, config: "mouseButton4" },
                { dom: select_mouseButton5, config: "mouseButton5" },
                { dom: select_scrollUp, config: "scrollUp" },
                { dom: select_scrollDown, config: "scrollDown" },
                { dom: select_scrollUpCtrl, config: "scrollUpCtrl" },
                { dom: select_scrollDownCtrl, config: "scrollDownCtrl" },
                { dom: select_scrollUpShift, config: "scrollUpShift" },
                { dom: select_scrollDownShift, config: "scrollDownShift" },
                { dom: select_scrollUpAlt, config: "scrollUpAlt" },
                { dom: select_scrollDownAlt, config: "scrollDownAlt" },
            ];

            const data: { [key: string]: string[] } = {
                "image": [
                    "imageFitWindowOrImageOriginal", // 縮放至適合視窗 或 圖片原始大小
                    "switchFitWindowAndOriginal", // 縮放至適合視窗/圖片原始大小 切換
                    "imageFitWindow", // 強制縮放至適合視窗
                    "imageOriginal", // 圖片原始大小
                    "imageZoomIn", // 放大
                    "imageZoomOut", // 縮小
                    "imageRotateCw", // 順時針90°
                    "imageRotateCcw", // 逆時針90°
                    "imageFlipHorizontal", // 水平鏡像
                    "imageFlipVertical", // 垂直鏡像
                    "imageInitialRotation", // 圖初始化旋轉
                    "imageMoveUp", // 圖片向上移動
                    "imageMoveDown", // 圖片向下移動
                    "imageMoveLeft", // 圖片向左移動
                    "imageMoveRight", // 圖片向右移動
                    "imageMoveUpOrPrevFile", // 圖片向上移動 or 上一個檔案
                    "imageMoveDownOrNextFile", // 圖片向下移動 or 下一個檔案
                    "imageMoveLeftOrPrevFile", // 圖片向左移動 or 上一個檔案
                    "imageMoveRightOrNextFile", // 圖片向右移動 or 下一個檔案
                    "imageMoveRightOrPrevFile", // 圖片向右移動 or 上一個檔案
                    "imageMoveLeftOrNextFile", // 圖片向左移動 or 下一個檔案
                ],
                "file": [
                    "prevFile", // 上一個檔案
                    "nextFile", // 下一個檔案
                    "firstFile", // 第一個檔案
                    "lastFile", // 最後一個檔案
                    "prevDir", // 上一個資料夾
                    "nextDir", // 下一個資料夾
                    "firstDir", // 第一個資料夾
                    "lastDir", // 最後一個資料夾
                    "newWindow", // 另開視窗
                    "revealInFileExplorer", // 在檔案總管中顯示
                    "systemContextMenu", // 系統選單
                    "openWith", // 用其他程式開啟
                    "renameFile", // 重新命名
                    "fileToRecycleBin", // 移至資源回收桶
                    "fileToPermanentlyDelete", // 永久刪除
                ],
                "copy": [
                    "copyFile", // 複製檔案
                    "copyFileName", // 複製檔名
                    // "copyDirName", // 複製資料夾名
                    "copyFilePath", // 複製檔案路徑
                    // "copyDirPath", // 複製資料夾路徑
                    "copyImage", // 複製影像
                    "copyImageBase64", // 複製影像 Base64
                    "copyText", // 複製文字
                ],
                "layout": [
                    "maximizeWindow", // 視窗最大化
                    "topmost", // 視窗固定最上層
                    "fullScreen", // 全螢幕
                    "showToolbar", // 工具列
                    "showDirectoryPanel", // 資料夾預覽面板
                    "showFilePanel", // 檔案預覽面板
                    "showInformationPanel", // 詳細資料面板
                ],
                "other": [
                    "bulkView", // 大量瀏覽模式
                    // "back", // 返回
                    // "showSetting", // 設定
                ],
                // "textEditor":[
                //    "save", // 儲存檔案
                // ],
            }
            let htmlString = `
                <optgroup label="-">
                    <option value="none" i18n="script.none"></option>
                </optgroup>
            `;
            for (const key in data) {
                htmlString += `<optgroup label="" i18n="script.${key}">`;
                for (const value of data[key]) {
                    htmlString += `<option value="${value}" i18n="script.${value}"></option>`;
                }
                htmlString += `</optgroup>`;
            }

            arDom.forEach(item => {

                const dom = item.dom;

                // 初始化設定值
                dom.innerHTML = htmlString;
                // @ts-ignore
                dom.value = _config.settings.mouse[item.config];

                dom.addEventListener("change", () => {
                    // @ts-ignore
                    _config.settings.mouse[item.config] = dom.value;
                    appleSettingOfMain();
                });

            })

        })

        // 大量瀏覽模式 - 滑鼠滾輪
        addLoadEvent(() => {

            const select_scrollUpCtrl = getDom("#select-bulkViewScrollUpCtrl") as HTMLSelectElement;
            const select_scrollDownCtrl = getDom("#select-bulkViewScrollDownCtrl") as HTMLSelectElement;
            const select_scrollUpShift = getDom("#select-bulkViewScrollUpShift") as HTMLSelectElement;
            const select_scrollDownShift = getDom("#select-bulkViewScrollDownShift") as HTMLSelectElement;
            const select_scrollUpAlt = getDom("#select-bulkViewScrollUpAlt") as HTMLSelectElement;
            const select_scrollDownAlt = getDom("#select-bulkViewScrollDownAlt") as HTMLSelectElement;

            const arDom = [
                { dom: select_scrollUpCtrl, config: "bulkViewScrollUpCtrl" },
                { dom: select_scrollDownCtrl, config: "bulkViewScrollDownCtrl" },
                { dom: select_scrollUpShift, config: "bulkViewScrollUpShift" },
                { dom: select_scrollDownShift, config: "bulkViewScrollDownShift" },
                { dom: select_scrollUpAlt, config: "bulkViewScrollUpAlt" },
                { dom: select_scrollDownAlt, config: "bulkViewScrollDownAlt" },
            ];

            const data: { [key: string]: string[] } = {
                "bulkView": [
                    "prevPage", // 上一頁
                    "nextPage", // 下一頁
                    "incrColumns", // 增加「每行圖片數」
                    "decColumns", // 減少「每行圖片數」
                    "incrFixedWidth", // 增加「鎖定寬度」
                    "decFixedWidth", // 減少「鎖定寬度」
                ],
            }
            let htmlString = ``;
            for (const key in data) {
                htmlString += `<optgroup label="" i18n="script.${key}">`;
                for (const value of data[key]) {
                    htmlString += `<option value="${value}" i18n="script.${value}"></option>`;
                }
                htmlString += `</optgroup>`;
            }

            arDom.forEach(item => {

                const dom = item.dom;

                // 初始化設定值
                dom.innerHTML = htmlString;
                // @ts-ignore
                dom.value = _config.settings.mouse[item.config];

                dom.addEventListener("change", () => {
                    // @ts-ignore
                    _config.settings.mouse[item.config] = dom.value;
                    appleSettingOfMain();
                });
            })

        })

        // 檔案預覽視窗
        addLoadEvent(() => {
            const switch_fileListEnabled = getDom("#switch-fileListEnabled") as HTMLInputElement;
            const switch_fileListShowNo = getDom("#switch-fileListShowNo") as HTMLInputElement;
            const switch_fileListShowName = getDom("#switch-fileListShowName") as HTMLInputElement;
            switch_fileListEnabled.checked = _config.settings["layout"]["fileListEnabled"]; // 啟用 檔案預覽視窗
            switch_fileListShowNo.checked = _config.settings["layout"]["fileListShowNo"]; // 顯示編號
            switch_fileListShowName.checked = _config.settings["layout"]["fileListShowName"]; // 顯示檔名

            switch_fileListEnabled.addEventListener("change", () => { // 啟用 檔案預覽視窗
                const val = switch_fileListEnabled.checked;
                _config.settings["layout"]["fileListEnabled"] = val;
                appleSettingOfMain();
            });
            switch_fileListShowNo.addEventListener("change", () => { // 顯示編號
                const val = switch_fileListShowNo.checked;
                _config.settings["layout"]["fileListShowNo"] = val;
                appleSettingOfMain();
            });
            switch_fileListShowName.addEventListener("change", () => { // 顯示檔名
                const val = switch_fileListShowName.checked;
                _config.settings["layout"]["fileListShowName"] = val;
                appleSettingOfMain();
            });
        })

        // 資料夾預覽視窗
        addLoadEvent(() => {
            const switch_dirListEnabled = getDom("#switch-dirListEnabled") as HTMLInputElement;
            const switch_dirListShowNo = getDom("#switch-dirListShowNo") as HTMLInputElement;
            const switch_dirListShowName = getDom("#switch-dirListShowName") as HTMLInputElement;
            const select_dirListImgNumber = getDom("#select-dirListImgNumber") as HTMLInputElement;

            switch_dirListEnabled.checked = _config.settings["layout"]["dirListEnabled"]; // 啟用 資料夾預覽視窗
            switch_dirListShowNo.checked = _config.settings["layout"]["dirListShowNo"]; // 顯示編號
            switch_dirListShowName.checked = _config.settings["layout"]["dirListShowName"]; // 顯示檔名
            select_dirListImgNumber.value = _config.settings["layout"]["dirListImgNumber"] + ""; // 圖片數量

            switch_dirListEnabled.addEventListener("change", () => { // 啟用 資料夾預覽視窗
                const val = switch_dirListEnabled.checked;
                _config.settings["layout"]["dirListEnabled"] = val;
                appleSettingOfMain();
            });
            switch_dirListShowNo.addEventListener("change", () => { // 顯示編號
                const val = switch_dirListShowNo.checked;
                _config.settings["layout"]["dirListShowNo"] = val;
                appleSettingOfMain();
            });
            switch_dirListShowName.addEventListener("change", () => { // 顯示檔名
                const val = switch_dirListShowName.checked;
                _config.settings["layout"]["dirListShowName"] = val;
                appleSettingOfMain();
            });
            select_dirListImgNumber.addEventListener("change", () => { // 圖片數量
                const val = Number(select_dirListImgNumber.value);
                _config.settings["layout"]["dirListImgNumber"] = val;
                appleSettingOfMain();
            });
        })

        // 詳細資料面板
        addLoadEvent(() => {
            // 顯示 詳細資料面板
            const switch_mainExifEnabled = getDom("#switch-mainExifEnabled") as HTMLInputElement;
            switch_mainExifEnabled.checked = _config.settings["layout"]["mainExifEnabled"];
            switch_mainExifEnabled.addEventListener("change", () => {
                let val = switch_mainExifEnabled.checked;
                _config.settings["layout"]["mainExifEnabled"] = val;
                appleSettingOfMain();
            });

            // 寬度足夠時，橫向排列
            const switch_mainExifHorizontal = getDom("#switch-mainExifHorizontal") as HTMLInputElement;
            switch_mainExifHorizontal.checked = _config.settings["layout"]["mainExifHorizontal"];
            switch_mainExifHorizontal.addEventListener("change", () => {
                let val = switch_mainExifHorizontal.checked;
                _config.settings["layout"]["mainExifHorizontal"] = val;
                appleSettingOfMain();
            });

            // 顯示相關檔案
            const switch_relatedFilesEnabled = getDom("#switch-relatedFilesEnabled") as HTMLInputElement;
            switch_relatedFilesEnabled.checked = _config.settings["layout"]["relatedFilesEnabled"];
            switch_relatedFilesEnabled.addEventListener("change", () => {
                let val = switch_relatedFilesEnabled.checked;
                _config.settings["layout"]["relatedFilesEnabled"] = val;
                appleSettingOfMain();
            });

            // 顯示的最大行數(1~100)
            const text_mainExifMaxLine = getDom("#text-mainExifMaxLine") as HTMLInputElement;
            text_mainExifMaxLine.value = _config.settings["layout"]["mainExifMaxLine"] + "";
            text_mainExifMaxLine.addEventListener("change", () => {
                let val = Math.floor(Number(text_mainExifMaxLine.value));
                if (val > 1000) { val = 1000; }
                if (val <= 0) { val = 1; }
                text_mainExifMaxLine.value = val + "";
                _config.settings["layout"]["mainExifMaxLine"] = val;
                appleSettingOfMain();
            });

            const text_a1111Models = getDom("#text-a1111Models") as HTMLInputElement;
            text_a1111Models.value = _config.settings.layout.a1111Models;
            text_a1111Models.addEventListener("change", () => {
                // 取出每一行，去除前後空白，並且不重複
                const ar = text_a1111Models.value.split("\n")
                    .map(item => item.trim())
                    .filter((item, index, self) => self.indexOf(item) === index);
                const t = ar.join("\n");
                text_a1111Models.value = t;
                _config.settings.layout.a1111Models = t;
                appleSettingOfMain();
            });

            // 顯示 Civitai Resources 
            const divCivitaiBox = getDom("#civitaiBox") as HTMLElement;
            function updateCivitaiBox() {
                if (switch_civitaiResourcesEnabled.checked) {
                    divCivitaiBox.setAttribute("active", "true");
                } else {
                    divCivitaiBox.removeAttribute("active");
                }
            }
            const switch_civitaiResourcesEnabled = getDom("#switch-civitaiResourcesEnabled") as HTMLInputElement;
            switch_civitaiResourcesEnabled.checked = _config.settings["layout"]["civitaiResourcesEnabled"];
            updateCivitaiBox();
            switch_civitaiResourcesEnabled.addEventListener("change", () => {
                const val = switch_civitaiResourcesEnabled.checked;
                _config.settings["layout"]["civitaiResourcesEnabled"] = val;
                appleSettingOfMain();
                updateCivitaiBox();
            });

            // 圖片預設狀態
            const select_civitaiResourcesDefault = getDom("#select-civitaiResourcesDefault") as HTMLSelectElement;
            select_civitaiResourcesDefault.value = _config.settings.layout.civitaiResourcesDefault.toString();
            select_civitaiResourcesDefault.addEventListener("change", () => {
                const val = select_civitaiResourcesDefault.value;
                _config.settings.layout.civitaiResourcesDefault = val === "true";
                appleSettingOfMain();
            });

            // 圖片數量
            const select_civitaiResourcesImgNumber = getDom("#select-civitaiResourcesImgNumber") as HTMLSelectElement;
            select_civitaiResourcesImgNumber.value = _config.settings.layout.civitaiResourcesImgNumber.toString();
            select_civitaiResourcesImgNumber.addEventListener("change", () => {
                const val = Number(select_civitaiResourcesImgNumber.value);
                _config.settings.layout.civitaiResourcesImgNumber = val;
                appleSettingOfMain();
            });

            // 允許 NSFW 圖片
            const switch_civitaiResourcesNsfwLevel = getDom("#switch-civitaiResourcesNsfwLevel") as HTMLInputElement;
            switch_civitaiResourcesNsfwLevel.checked = _config.settings.layout.civitaiResourcesNsfwLevel == 99;
            switch_civitaiResourcesNsfwLevel.addEventListener("change", () => {
                const val = switch_civitaiResourcesNsfwLevel.checked;
                _config.settings.layout.civitaiResourcesNsfwLevel = val ? 99 : 3;
                appleSettingOfMain();
            });
        })

        // 大型切換按鈕
        addLoadEvent(() => {
            // 初始化設定
            Lib.setRadio("[name='largeBtn']", _config.settings.layout.largeBtn);

            // 變更時
            const domRadio = getDom("#largeBtn-group") as HTMLElement;
            domRadio.addEventListener("change", () => {
                let val = Lib.getRadio("[name='largeBtn']");
                _config.settings.layout.largeBtn = val;
                appleSettingOfMain();
            });
        })

        // 佈局順序
        addLoadEvent(() => {
            const dom_toolbarList = document.querySelector("#layoutOrder-list") as HTMLElement;
            const dom_layoutOrderItem = dom_toolbarList.querySelectorAll(".layoutOrder-item");

            const dirPanelOrder = _config.settings.layout.dirPanelOrder;
            const filePanelOrder = _config.settings.layout.filePanelOrder;
            const imagePanelOrder = _config.settings.layout.imagePanelOrder;
            const infoPanelOrder = _config.settings.layout.infoPanelOrder;

            const dirPanelString = "sw.layoutOrder.dirPanel";
            const filePanelString = "sw.layoutOrder.filePanel";
            const imagePanelString = "sw.layoutOrder.imagePanel";
            const infoPanelString = "sw.layoutOrder.infoPanel";
            dom_layoutOrderItem[dirPanelOrder].setAttribute("i18n", dirPanelString);
            dom_layoutOrderItem[filePanelOrder].setAttribute("i18n", filePanelString);
            dom_layoutOrderItem[imagePanelOrder].setAttribute("i18n", imagePanelString);
            dom_layoutOrderItem[infoPanelOrder].setAttribute("i18n", infoPanelString);

            // 初始化拖曳功能
            new Sortable(dom_toolbarList, {
                animation: 150,
                onEnd: (evt) => {

                    // 取得目前 dom 的順序
                    const doms = dom_toolbarList.querySelectorAll(".layoutOrder-item");
                    let ar = [];
                    for (let i = 0; i < doms.length; i++) {
                        ar.push(doms[i].getAttribute("i18n"));
                    }

                    // 設定 config
                    for (let i = 0; i < ar.length; i++) {
                        switch (ar[i]) {
                            case dirPanelString:
                                _config.settings.layout.dirPanelOrder = i;
                                break;
                            case filePanelString:
                                _config.settings.layout.filePanelOrder = i;
                                break;
                            case imagePanelString:
                                _config.settings.layout.imagePanelOrder = i;
                                break;
                            case infoPanelString:
                                _config.settings.layout.infoPanelOrder = i;
                                break;
                        }
                    }

                    appleSettingOfMain();
                }
            });
        })

        // 縮小至特定比例以下，就使用libvips重新處理圖片
        addLoadEvent(() => {
            const select_tiefseeviewBigimgscaleRatio = getDom("#select-tiefseeviewBigimgscaleRatio") as HTMLInputElement;
            select_tiefseeviewBigimgscaleRatio.value = _config.settings["image"]["tiefseeviewBigimgscaleRatio"].toString();

            select_tiefseeviewBigimgscaleRatio.addEventListener("change", () => {
                let val = select_tiefseeviewBigimgscaleRatio.value;
                _config.settings["image"]["tiefseeviewBigimgscaleRatio"] = Number(val);
                appleSettingOfMain();
            });
        })

        // 大量瀏覽模式一頁顯示的圖片數量
        addLoadEvent(() => {
            const domText = getDom("#text-bulkViewImgMaxCount") as HTMLInputElement;
            domText.value = _config.settings.bulkView.imgMaxCount.toString();

            domText.addEventListener("change", () => {
                let val = Number(domText.value);
                if (isNaN(val)) { val = 100; }
                if (val > 300) { val = 300; }
                if (val < 1) { val = 1; }
                val = Math.floor(val);
                domText.value = val.toString();
                _config.settings.bulkView.imgMaxCount = val;
                appleSettingOfMain();
            });
        })

        // 圖片 縮放模式
        addLoadEvent(() => {

            const switch_imageShowPixels = getDom("#switch-imageShowPixels") as HTMLInputElement;
            switch_imageShowPixels.checked = _config.settings["image"]["tiefseeviewImageRendering"] == "2"

            switch_imageShowPixels.addEventListener("change", () => {
                let val = switch_imageShowPixels.checked;
                if (val) {
                    _config.settings["image"]["tiefseeviewImageRendering"] = "2";
                } else {
                    _config.settings["image"]["tiefseeviewImageRendering"] = "0";
                }
                appleSettingOfMain();
            });
        })

        // 相關路徑
        addLoadEvent(() => {
            const btn_openAppData = getDom("#btn-openAppData") as HTMLElement;
            const btn_openWww = getDom("#btn-openWww") as HTMLElement;
            const btn_openTemp = getDom("#btn-openTemp") as HTMLElement;

            // 開啟 AppData(使用者資料)
            btn_openAppData.addEventListener("click", async () => {
                let path = await WV_Window.GetAppDataPath();
                WV_RunApp.OpenUrl(path);
            });

            // 開啟 www(原始碼)
            btn_openWww.addEventListener("click", async () => {
                let path = await WV_Window.GetAppDirPath();
                path = Lib.combine([path, "Www"]);
                WV_RunApp.OpenUrl(path);
            });

            // 開啟 暫存資料夾
            btn_openTemp.addEventListener("click", async () => {
                let path = await WV_Path.GetTempPath();
                path = Lib.combine([path, "Tiefsee"]);
                if (await WV_Directory.Exists(path) === false) { // 如果不存在就新建
                    await WV_Directory.CreateDirectory(path);
                }
                WV_RunApp.OpenUrl(path);
            });
        })

        // 清理暫存資料
        addLoadEvent(() => {
            const btn_clearBrowserCache = getDom("#btn-clearBrowserCache") as HTMLElement;

            btn_clearBrowserCache.addEventListener("click", async () => {
                await WV_System.DeleteAllTemp(); // 立即刪除所有圖片暫存
                await WV_Window.ClearBrowserCache(); // 清理webview2的暫存
                _msgbox.show({ txt: _i18n.t("msg.tempDeleteCompleted") }); // 暫存資料清理完成
            });
        })

        // 資料夾數量太多時，禁用資料夾預覽視窗
        addLoadEvent(() => {
            const select_dirListMaxCount = getDom("#select-dirListMaxCount") as HTMLInputElement;
            select_dirListMaxCount.value = _config.settings["advanced"]["dirListMaxCount"] + "";

            select_dirListMaxCount.addEventListener("change", () => {
                let val = Number(select_dirListMaxCount.value);
                _config.settings["advanced"]["dirListMaxCount"] = val;
                appleSettingOfMain();
            });
        })

        // 圖片面積太大時，禁用高品質縮放
        addLoadEvent(() => {
            const select_highQualityLimit = getDom("#select-highQualityLimit") as HTMLInputElement;
            select_highQualityLimit.value = _config.settings["advanced"]["highQualityLimit"] + "";

            select_highQualityLimit.addEventListener("change", () => {
                let val = Number(select_highQualityLimit.value);
                _config.settings["advanced"]["highQualityLimit"] = val;
                appleSettingOfMain();
            });
        })

        // 啟動模式 、 Port
        addLoadEvent(() => {

            const text_startPort = getDom("#text-startPort") as HTMLInputElement;
            const btn_restart = getDom("#btn-startupMode-restart") as HTMLButtonElement;

            Lib.setRadio("[name='radio-startType']", _appInfo.startType.toString())
            text_startPort.value = _appInfo.startPort.toString();

            // 調整選項後，顯示「重新啟動」的按鈕
            btn_restart.style.display = "none";
            $("[name='radio-startType']").on("change", () => {
                btn_restart.style.display = "";
            });

            text_startPort.addEventListener("change", () => {
                let startPort = parseInt(text_startPort.value);
                if (isNaN(startPort)) { startPort = 4876; }
                if (startPort > 65535) { startPort = 65535; }
                if (startPort < 1024) { startPort = 1024; }
                text_startPort.value = startPort.toString();
            })

            // 關閉視窗前觸發
            baseWindow.closingEvents.push(async () => {
                // 儲存 start.ini
                let startPort = parseInt(text_startPort.value);
                let startType: any = Lib.getRadio("[name='radio-startType']");

                if (isNaN(startPort)) { startPort = 4876; }
                if (startPort > 65535) { startPort = 65535; }
                if (startPort < 1024) { startPort = 1024; }

                if (startType.search(/^[1|2|3|4|5]$/) !== 0) { startType = 2; }
                startType = parseInt(startType);

                await WV_Window.SetStartIni(startPort, startType);
            });

            // 重新啟動Tiefsee
            btn_restart.addEventListener("click", async () => {
                restartTiefsee();
            })
        })

        // 重設設定 
        addLoadEvent(() => {

            const btn_resetSettings = getDom("#btn-resetSettings") as HTMLElement;
            btn_resetSettings.addEventListener("click", async (e) => {

                _msgbox.show({
                    txt: _i18n.t("msg.resetSettings"),  // 確定要將 Tiefsee 的所有設定恢復成預設值嗎？<br>(不會影響擴充套件與檔案排序)

                    funcYes: async (dom: HTMLElement, inputTxt: string) => {
                        _msgbox.close(dom);

                        _config.settings = _defaultConfig;

                        // 啟動模式
                        Lib.setRadio("[name='radio-startType']", "3");

                        // Port
                        let text_startPort = getDom("#text-startPort") as HTMLInputElement;
                        text_startPort.value = "4876";

                        // 開機後自動啟動
                        var switch_autoStart = getDom("#switch-autoStart") as HTMLInputElement;
                        switch_autoStart.checked = false;
                        switch_autoStart.dispatchEvent(new Event("change"));

                        await Lib.sleep(300);

                        await WV_System.DeleteAllTemp(); // 立即刪除所有圖片暫存
                        await WV_Window.ClearBrowserCache(); // 清理webview2的暫存

                        restartTiefsee(); // 重新啟動 Tiefsee
                    }
                });
            });

        })

        // 開機後自動啟動
        addLoadEvent(async () => {

            const switch_autoStart = getDom("#switch-autoStart") as HTMLInputElement;

            if (_appInfo.isStoreApp) { // 商店版 APP

                const tiefseTask = await WV_System.GetTiefseTask(); // 取得當前是否有啟用「開機自動啟動」的服務
                if (tiefseTask === "Enabled" || tiefseTask === "EnabledByPolicy") {
                    switch_autoStart.checked = true;
                } else {
                    switch_autoStart.checked = false;
                }

                switch_autoStart.addEventListener("change", async () => {

                    const val = switch_autoStart.checked;
                    const tiefseTask = await WV_System.SetTiefseTask(val);

                    let msg = null;
                    if (tiefseTask === "EnabledByPolicy") { // 被系統政策啟用
                        msg = _i18n.t("msg.enabledByPolicy");
                        switch_autoStart.checked = true;
                    }
                    if (tiefseTask === "DisabledByPolicy") { // 被系統政策禁用
                        msg = _i18n.t("msg.disabledByPolicy");
                        switch_autoStart.checked = false;
                    }
                    if (tiefseTask === "DisabledByUser") { // 被使用者禁用
                        msg = _i18n.t("msg.disabledByUser");
                        switch_autoStart.checked = false;
                    }

                    if (msg !== null) {
                        _msgbox.show({ txt: msg });
                    }
                });

            } else {

                const startupPath = await WV_Path.GetFolderPathStartup();
                const linkPath = Lib.combine([startupPath, "Tiefsee.lnk"]);
                const isAutoStart = await WV_File.Exists(linkPath);
                switch_autoStart.checked = isAutoStart;

                switch_autoStart.addEventListener("change", async () => {
                    const val = switch_autoStart.checked;
                    if (val) { // 產生捷徑
                        const exePath = await WV_Window.GetTiefseePath();
                        WV_System.NewLnk(exePath, linkPath, "none");
                    } else { // 刪除捷徑
                        WV_File.Delete(linkPath);
                    }
                });

                // 開啟Windows的「啟動資料夾
                const btn_openStartup = getDom("#btn-openStartup") as HTMLElement;
                btn_openStartup.addEventListener("click", async () => {
                    WV_RunApp.OpenUrl(startupPath);
                });
            }
        })

        // 擴充套件 
        addLoadEvent(() => {

            function getHtml(val: boolean) {
                if (val) {
                    return `<div class="pluginLiet-status color-success">Installed</div>`;
                } else {
                    return `<div class="pluginLiet-status color-warning">Not Installed</div>`;
                }
            }
            if (baseWindow.appInfo !== undefined) {

                // 初始化 擴充套件清單
                const dom_QuickLook = getDom("#pluginLiet-QuickLook") as HTMLInputElement;
                // const dom_NConvert = getDom("#pluginLiet-NConvert") as HTMLInputElement;
                const dom_PDFTronWebviewer = getDom("#pluginLiet-PDFTronWebviewer") as HTMLInputElement;
                const dom_MonacoEditor = getDom("#pluginLiet-MonacoEditor") as HTMLInputElement;
                const dom_hdrfix = getDom("#pluginLiet-hdrfix") as HTMLInputElement;

                dom_QuickLook.innerHTML = getHtml(baseWindow.appInfo.plugin.QuickLook);
                // dom_NConvert.innerHTML = getHtml(baseWindow.appInfo.plugin.NConvert);
                dom_PDFTronWebviewer.innerHTML = getHtml(baseWindow.appInfo.plugin.PDFTronWebviewer);
                dom_MonacoEditor.innerHTML = getHtml(baseWindow.appInfo.plugin.MonacoEditor);
                dom_hdrfix.innerHTML = getHtml(baseWindow.appInfo.plugin.Hdrfix);

                // 如果未安裝QuickLook擴充套件，就顯示提示文字，並且禁止編輯
                const dom_noInstalled = getDom("#quickLook-noInstalled") as HTMLInputElement;
                const dom_box = getDom("#quickLook-box") as HTMLInputElement;
                if (baseWindow.appInfo.plugin.QuickLook) {
                    dom_noInstalled.style.display = "none";
                    dom_box.style.opacity = "1";
                    dom_box.style.pointerEvents = "";
                } else {
                    dom_noInstalled.style.display = "block";
                    dom_box.style.opacity = "0.5";
                    dom_box.style.pointerEvents = "none";
                }
            }

            // 開啟「Tiefsee Plugin」頁面
            getDom("#btn-openPluginDownload")?.addEventListener("click", () => {
                WV_RunApp.OpenUrl("https://hbl917070.github.io/aeropic/plugin.html");
            });

            // 開啟「Plugin」資料夾
            getDom("#btn-openPluginDir")?.addEventListener("click", async () => {
                let path = await WV_Window.GetAppDataPath();
                path = Lib.combine([path, "Plugin"]);
                if (await WV_Directory.Exists(path) === false) { // 如果不存在就新建
                    await WV_Directory.CreateDirectory(path);
                }
                WV_RunApp.OpenUrl(path);
            });

            // 重新啟動
            const btn_restart = getDom("#btn-plugin-restart") as HTMLButtonElement;
            btn_restart.addEventListener("click", () => {
                restartTiefsee();
            });
        })

        // 快速預覽
        addLoadEvent(() => {
            const switch_keyboardSpaceRun = getDom("#switch-keyboardSpaceRun") as HTMLInputElement;
            const switch_mouseMiddleRun = getDom("#switch-mouseMiddleRun") as HTMLInputElement;

            switch_keyboardSpaceRun.checked = _config.settings.quickLook.keyboardSpaceRun;
            switch_mouseMiddleRun.checked = _config.settings.quickLook.mouseMiddleRun;

            switch_keyboardSpaceRun.addEventListener("change", () => {
                const val = switch_keyboardSpaceRun.checked;
                _config.settings.quickLook.keyboardSpaceRun = val;
                saveSetting();
            });

            switch_mouseMiddleRun.addEventListener("change", () => {
                const val = switch_mouseMiddleRun.checked;
                _config.settings.quickLook.mouseMiddleRun = val;
                saveSetting();
            });
        })

        // 其他
        addLoadEvent(() => {

            // 開啟 RAW 圖片時，顯示內嵌的預覽圖
            const switch_rawImageThumbnail = getDom("#switch-rawImageThumbnail") as HTMLInputElement;
            switch_rawImageThumbnail.checked = _config.settings["other"]["rawImageThumbnail"];
            switch_rawImageThumbnail.addEventListener("change", () => {
                let val = switch_rawImageThumbnail.checked;
                _config.settings["other"]["rawImageThumbnail"] = val;
                appleSettingOfMain();
            });

            // 檔案刪除前顯示確認視窗
            const switch_fileDeletingShowCheckMsg = getDom("#switch-fileDeletingShowCheckMsg") as HTMLInputElement;
            switch_fileDeletingShowCheckMsg.checked = _config.settings["other"]["fileDeletingShowCheckMsg"];
            switch_fileDeletingShowCheckMsg.addEventListener("change", () => {
                let val = switch_fileDeletingShowCheckMsg.checked;
                _config.settings["other"]["fileDeletingShowCheckMsg"] = val;
                appleSettingOfMain();
            });

            // 偵測到檔案新增時，插入於
            const select_whenInsertingFile = getDom("#select-whenInsertingFile") as HTMLSelectElement;
            select_whenInsertingFile.value = _config.settings["other"]["whenInsertingFile"];
            select_whenInsertingFile.addEventListener("change", () => {
                let val = select_whenInsertingFile.value;
                _config.settings["other"]["whenInsertingFile"] = val;
                appleSettingOfMain();
            });

            // 到達最後一個檔案時
            const select_reachLastFile = getDom("#select-reachLastFile") as HTMLSelectElement;
            select_reachLastFile.value = _config.settings.other.reachLastFile;
            select_reachLastFile.addEventListener("change", () => {
                _config.settings.other.reachLastFile = select_reachLastFile.value;
                appleSettingOfMain();
            });

            // 到達最後一個資料夾時
            const select_reachLastDir = getDom("#select-reachLastDir") as HTMLSelectElement;
            select_reachLastDir.value = _config.settings.other.reachLastDir;
            select_reachLastDir.addEventListener("change", () => {
                _config.settings.other.reachLastDir = select_reachLastDir.value;
                appleSettingOfMain();
            });

            // 啟用觸控板手勢
            const switch_touchpadGesture = getDom("#switch-enableTouchpadGestures") as HTMLInputElement;
            switch_touchpadGesture.checked = _config.settings.other.enableTouchpadGestures;
            switch_touchpadGesture.addEventListener("change", () => {
                let val = switch_touchpadGesture.checked;
                _config.settings.other.enableTouchpadGestures = val;
                appleSettingOfMain();
            });

        })

        // 關於
        addLoadEvent(async () => {
            const webViewVersion = getDom("#span-webViewVersion") as HTMLInputElement;
            webViewVersion.innerHTML = await WV_Window.GetBrowserVersionString();

            const serverPort = getDom("#span-serverPort") as HTMLInputElement;
            serverPort.innerHTML = PORT;
        })

        addLoadEvent(() => {
            _i18n.setAll();
        })

        // 初始化頁面分頁
        addLoadEvent(() => {

            // 捲到最上面
            function goTop() {
                getDom("#window-body")?.scrollTo(0, 0)
            }

            const tabs = new Tabs();
            tabs.add(getDom("#tabsBtn-general"), getDom("#tabsPage-general"), () => { goTop() }); // 一般
            tabs.add(getDom("#tabsBtn-appearance"), getDom("#tabsPage-appearance"), () => { goTop() }); // 外觀
            tabs.add(getDom("#tabsBtn-layout"), getDom("#tabsPage-layout"), () => { goTop() }); // 版面
            tabs.add(getDom("#tabsBtn-toolbar"), getDom("#tabsPage-toolbar"), () => { goTop() }); // 工具列
            tabs.add(getDom("#tabsBtn-mouse"), getDom("#tabsPage-mouse"), () => { goTop() }); // 滑鼠
            // tabs.add(getDom("#tabsBtn-image"), getDom("#tabsPage-image"), () => { goTop() });
            // tabs.add(getDom("#tabsBtn-shortcutKeys"),getDom("#tabsPage-hotkey"), () => { goTop() });/快速鍵
            tabs.add(getDom("#tabsBtn-extension"), getDom("#tabsPage-extension"), () => { goTop() }); // 設為預設程式
            tabs.add(getDom("#tabsBtn-advanced"), getDom("#tabsPage-advanced"), () => { goTop() }); // 進階設定
            tabs.add(getDom("#tabsBtn-about"), getDom("#tabsPage-about"), () => { goTop() }); // 關於
            tabs.add(getDom("#tabsBtn-plugin"), getDom("#tabsPage-plugin"), () => { goTop() }); // 擴充套件
            tabs.add(getDom("#tabsBtn-quickLook"), getDom("#tabsPage-quickLook"), () => { goTop() }); // 快速預覽

            tabs.set(getDom("#tabsBtn-general")); // 預設選擇的頁面

            // ----------

            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const toPage = urlParams.get("toPage");
            const toDom = urlParams.get("toDom");
            // 指定預設頁面
            if (toPage !== null && toPage !== "") {
                tabs.set(getDom(`#tabsBtn-${toPage}`)); // 預設選擇的頁面
            }
            // 捲動到指定的dom的位置
            if (toDom !== null && toDom !== "") {
                const element = document.querySelector(`[data-toDom="${toDom}"]`);
                element?.scrollIntoView();
            }
        })

        /**
         * 取得瀏覽器版本資訊
         */
        function getBrowserInfo() {
            var ua = navigator.userAgent, tem,
                M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if (/trident/i.test(M[1])) {
                tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                return { name: 'IE', version: (tem[1] || '') };
            }
            if (M[1] === 'Chrome') {
                tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
                if (tem != null) return { name: tem[1].replace('OPR', 'Opera'), version: tem[2] };
            }
            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
            return {
                name: M[0],
                version: M[1]
            };
        }

        /** 
         * dom 交換順序
         */
        function swapDom(a: Element, b: Element) {
            if (a.parentNode === null || b.parentNode === null) { return; }
            if (a == b) { return }
            const aParent = a.parentNode;
            const bParent = b.parentNode;
            const aHolder = document.createElement("div");
            const bHolder = document.createElement("div");
            aParent.replaceChild(aHolder, a);
            bParent.replaceChild(bHolder, b);
            aParent.replaceChild(b, aHolder);
            bParent.replaceChild(a, bHolder);
        }

        /**
         * 判斷是否為深色模式
         * @param bg { r:number, g:number, b:number } 
         * @returns true=深色模式 false=淺色模式
         */
        function isDarkMode(bg: any) {
            // 判斷顏色接近黑色還是白色
            const n = ((bg.r > 127) ? 1 : 0) + ((bg.g > 127) ? 1 : 0) + ((bg.b > 127) ? 1 : 0);
            if (n >= 2) { return false; }
            return true;
        }

        /**
         * 將設定套用至 mainwiwndow
         */
        function appleSettingOfMain() {
            WV_Window.RunJsOfParent(`mainWindow.applySetting(${JSON.stringify(_config.settings)})`);
        }

        /**
         * 儲存設定(關閉視窗時呼叫)
         */
        async function saveSetting() {

            appleSettingOfMain(); // 將設定套用至 mainwiwndow

            // 儲存 setting.json
            const s = JSON.stringify(_config.settings, null, "\t");
            let path = await WV_Window.GetAppDataPath(); // 程式的暫存資料夾
            path = Lib.combine([path, "Setting.json"]);
            await WV_File.SetText(path, s);
        }

        /**
         * 重新啟動 Tiefsee
         */
        async function restartTiefsee() {

            // 清理 webview2 的暫存
            await WV_Window.ClearBrowserCache();

            // 儲存 ini、Setting.json
            const arFunc = baseWindow.closingEvents;
            for (let i = 0; i < arFunc.length; i++) {
                await arFunc[i]();
            }
            let imgPath = JSON.parse(await WV_Window.RunJsOfParent(`mainWindow.fileLoad.getFilePath()`)); // 取得目前顯示的圖片
            if (imgPath === null) { imgPath = "" }
            imgPath = `"${imgPath}"`;
            const exePath = await WV_Window.GetAppPath();
            WV_RunApp.ProcessStart(exePath, imgPath, true, false);
            WV_Window.Exit();
        }

    }
}


/**
 * 頁籤
 */
class Tabs {

    /**
     * 所有頁籤
     */
    public ar: { btn: Element | null, page: Element | null, func: () => void }[] = [];

    /**
     * 
     * @param btn 
     * @param page 
     * @param func 
     */
    private activeEvent(btn: Element | null, page: Element | null, func: () => void) {
        for (let i = 0; i < this.ar.length; i++) {
            const item = this.ar[i];
            item.btn?.setAttribute("active", "");
            item.page?.setAttribute("active", "");
        }
        btn?.setAttribute("active", "true");
        page?.setAttribute("active", "true");
        func();
    }

    /**
     * 顯示選擇的頁籤
     */
    public set(btn: Element | null) {
        for (let i = 0; i < this.ar.length; i++) {
            const item = this.ar[i];
            if (btn === item.btn) {
                this.activeEvent(btn, item.page, item.func)
            }
        }
    }

    /**
     * 新增頁籤(用於初始化)
     * @param btn 
     * @param page 
     * @param func 選中時觸發
     */
    public add(btn: Element | null, page: Element | null, func: () => void) {
        this.ar.push({ btn, page, func })
        btn?.addEventListener("click", () => {
            this.activeEvent(btn, page, func)
        })
    }

    constructor() { }
}
