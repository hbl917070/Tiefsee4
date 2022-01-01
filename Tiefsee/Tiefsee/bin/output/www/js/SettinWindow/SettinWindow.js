"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Setting {
    constructor() {
        /*(async () => {
            await WV_Window.ShowWindow();//顯示視窗
            baseWindow.dom_window.style.transform = "none";
        })()*/
        this.saveData = saveSetting;
        var config = new Config();
        var cssRoot = document.documentElement;
        var jqtxt_windowBorderRadius = $("#text-theme-windowBorderRadius");
        var jqtxt_colorWindowBackground = $("#text-theme-colorWindowBackground");
        var jqtxt_colorWindowBorder = $("#text-theme-colorWindowBorder");
        var jqtxt_colorWhite = $("#text-theme-colorWhite");
        var jqtxt_colorBlack = $("#text-theme-colorBlack");
        var jqtxt_colorBlue = $("#text-theme-colorBlue");
        var switch_areo = document.querySelector("#switch-theme-areo");
        var txt_imageDpizoom = document.querySelector("#image-dpizoom");
        var select_tieefseeviewImageRendering = document.querySelector("#image-tieefseeviewImageRendering");
        var txt_startPort = document.querySelector("#txt-startPort");
        var btn_openAppData = document.getElementById("btn-openAppData");
        var btn_openWww = document.getElementById("btn-openWww");
        var btn_openSystemSetting = document.getElementById("btn-openSystemSetting");
        var txt_extension = document.querySelector("#txt-extension");
        var btn_extension = document.querySelector("#btn-extension");
        var dom_applyThemeBtns = document.querySelector("#applyTheme-btns");
        baseWindow = new BaseWindow(); //初始化視窗
        init();
        initDomImport(); //初始化圖示
        tippy(".img-help", {
            content(reference) {
                const id = reference.getAttribute("data-tooltip");
                if (id === null) {
                    return "";
                }
                const template = document.getElementById(id);
                return template === null || template === void 0 ? void 0 : template.innerHTML;
            },
            allowHTML: true,
        });
        /**
          * 覆寫 onCreate
          * @param json
          */
        baseWindow.onCreate = (json) => {
            WV_Window.ShowWindow(); //顯示視窗 
            //讀取設定檔
            var userSetting = {};
            try {
                userSetting = JSON.parse(json.settingTxt);
            }
            catch (e) { }
            $.extend(true, config.settings, userSetting);
            setRadio("[name='radio-startType']", json.startType.toString());
            txt_startPort.value = json.startPort.toString();
            setTimeout(() => {
                applySetting(); //套用設置值
            }, 100);
        };
        /**
         *
         */
        function init() {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                WV_Window.SetMinimumSize(400 * window.devicePixelRatio, 300 * window.devicePixelRatio); //設定視窗最小size
                WV_Window.Text = "設定";
                let iconPath = Lib.Combine([yield WV_Window.GetAppDirPath(), "www\\img\\logo.ico"]);
                WV_Window.SetIcon(iconPath);
                //關閉視窗前觸發
                baseWindow.closingEvents.push(() => __awaiter(this, void 0, void 0, function* () {
                    yield saveSetting();
                }));
                //初始化顏色選擇器物件
                (() => {
                    addEvent(jqtxt_colorWindowBorder, "--color-window-border", true); //邊框顏色
                    addEvent(jqtxt_colorWindowBackground, "--color-window-background", true); //視窗顏色
                    addEvent(jqtxt_colorWhite, "--color-white", false); //
                    addEvent(jqtxt_colorBlack, "--color-black", false); //
                    addEvent(jqtxt_colorBlue, "--color-blue", false); //
                    //add(jQdom_theme_colorGrey, "--color-grey", false);//
                    function addEvent(jQdim, name, opacity = false) {
                        //@ts-ignore
                        jQdim.minicolors({
                            format: "rgb",
                            opacity: opacity,
                            changeDelay: 10,
                            change: function (value, opacity) {
                                //@ts-ignore
                                let c = jQdim.minicolors("rgbObject"); //取得顏色 
                                //設定本身視窗的主題
                                /*for (let i = 1; i < 9; i++) {
                                    cssRoot.style.setProperty(name + `${i}0`, `rgba(${c.r}, ${c.g}, ${c.b}, ${(i / 10)} )`)
                                }
                                cssRoot.style.setProperty(name, value);*/
                                //設定父親視窗的主題
                                //@ts-ignore
                                config.settings["theme"][name] = c;
                                WV_Window.RunJsOfParent(`mainWindow.readSetting(${JSON.stringify(config.settings)})`);
                            }
                        });
                    }
                })();
                //初始化頁面分頁
                (() => {
                    var tabs = new Tabs();
                    tabs.add(document.getElementById("tabsBtn-common"), document.getElementById("tabsPage-common"), () => { });
                    tabs.add(document.getElementById("tabsBtn-theme"), document.getElementById("tabsPage-theme"), () => { });
                    tabs.add(document.getElementById("tabsBtn-tools"), document.getElementById("tabsPage-tools"), () => { });
                    tabs.add(document.getElementById("tabsBtn-image"), document.getElementById("tabsPage-image"), () => { });
                    tabs.add(document.getElementById("tabsBtn-shortcutKeys"), document.getElementById("tabsPage-shortcutKeys"), () => { });
                    tabs.add(document.getElementById("tabsBtn-extension"), document.getElementById("tabsPage-extension"), () => { });
                    tabs.add(document.getElementById("tabsBtn-advanced"), document.getElementById("tabsPage-advanced"), () => { });
                    tabs.add(document.getElementById("tabsBtn-about"), document.getElementById("tabsPage-about"), () => { });
                    tabs.set(document.getElementById("tabsBtn-common")); //預設選擇的頁面
                })();
                //初始化主題按鈕
                (() => {
                    applyThemeAddBtn(`<div class="btn">深色主題</div>`, { r: 31, g: 39, b: 43, a: 0.97 }, { r: 255, g: 255, b: 255, a: 0.25 }, { r: 255, g: 255, b: 255, }, { r: 0, g: 0, b: 0, }, { r: 0, g: 200, b: 255, });
                    applyThemeAddBtn(`<div class="btn">淺色主題</div>`, { r: 255, g: 255, b: 255, a: 0.97 }, { r: 112, g: 112, b: 112, a: 0.25 }, { r: 0, g: 0, b: 0, }, { r: 255, g: 255, b: 255, }, { r: 0, g: 125, b: 170, });
                })();
                //關聯副檔名 預設顯示文字
                let s_extension = ["JPG", "JPEG", "PNG", "GIF", "BMP", "SVG", "WEBP",];
                txt_extension.value = s_extension.join("\n");
                btn_extension.addEventListener("mousedown", (e) => __awaiter(this, void 0, void 0, function* () {
                    Msgbox.show({
                        txt: "確定用Tiefsee來開啟這些檔案嗎？<br>" + s_extension.join(", "),
                        funcYes: (dom, inputTxt) => __awaiter(this, void 0, void 0, function* () {
                            Msgbox.close(dom);
                            //let msgboxLoading = Msgbox.show({ txt: "處理中...", isAllowClose: false, isShowBtn: false });
                            let ar_extension = txt_extension.value.split("\n");
                            let ar = [];
                            for (let i = 0; i < ar_extension.length; i++) {
                                const item = ar_extension[i].toLocaleLowerCase().trim();
                                if (item !== "" && ar.indexOf(item) === -1) {
                                    ar.push(item);
                                }
                            }
                            let appPath = yield WV_Window.GetAppPath();
                            yield WV_System.SetAssociationExtension(ar, appPath);
                            //Msgbox.close(msgboxLoading);
                            Msgbox.show({ txt: "關聯完成", });
                        })
                    });
                }));
                //拖曳視窗
                (_a = document.getElementById("window-left")) === null || _a === void 0 ? void 0 : _a.addEventListener("mousedown", (e) => __awaiter(this, void 0, void 0, function* () {
                    let _dom = e.target;
                    if (_dom) {
                        if (_dom.classList.contains("js-noDrag")) {
                            return;
                        }
                    }
                    if (e.button === 0) { //滑鼠左鍵
                        yield WV_Window.WindowDrag("move");
                    }
                }));
                //視窗 圓角
                jqtxt_windowBorderRadius.change(() => {
                    let val = Number(jqtxt_windowBorderRadius.val());
                    if (val < 0) {
                        val = 0;
                    }
                    if (val > 15) {
                        val = 15;
                    }
                    config.settings["theme"]["--window-border-radius"] = val;
                    appleSettingOfMain();
                });
                // 視窗 aero毛玻璃
                switch_areo === null || switch_areo === void 0 ? void 0 : switch_areo.addEventListener("change", () => {
                    let val = switch_areo.checked;
                    config.settings["theme"]["aero"] = val;
                });
                // 圖片 dpi
                txt_imageDpizoom === null || txt_imageDpizoom === void 0 ? void 0 : txt_imageDpizoom.addEventListener("change", () => {
                    let val = txt_imageDpizoom.value;
                    config.settings["image"]["dpizoom"] = val;
                    appleSettingOfMain();
                });
                // 圖片 縮放模式
                select_tieefseeviewImageRendering === null || select_tieefseeviewImageRendering === void 0 ? void 0 : select_tieefseeviewImageRendering.addEventListener("change", () => {
                    let val = select_tieefseeviewImageRendering.value;
                    config.settings["image"]["tieefseeviewImageRendering"] = val;
                    appleSettingOfMain();
                });
                //開啟 AppData(使用者資料)
                btn_openAppData === null || btn_openAppData === void 0 ? void 0 : btn_openAppData.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                    let path = yield WV_Window.GetAppDataPath();
                    WV_RunApp.OpenUrl(path);
                }));
                //開啟 www(原始碼)
                btn_openWww === null || btn_openWww === void 0 ? void 0 : btn_openWww.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                    let path = yield WV_Window.GetAppDirPath();
                    path = Lib.Combine([path, "www"]);
                    WV_RunApp.OpenUrl(path);
                }));
                //開啟 系統設定
                btn_openSystemSetting === null || btn_openSystemSetting === void 0 ? void 0 : btn_openSystemSetting.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                    let path = "ms-settings:defaultapps";
                    WV_RunApp.OpenUrl(path);
                }));
            });
        }
        /**
         * 產生 套用主題 的按鈕
         * @param html
         * @param windowBackground
         * @param windowBorder
         * @param white
         * @param black
         * @param blue
         */
        function applyThemeAddBtn(html, windowBackground, windowBorder, white, black, blue) {
            let btn = newDiv(html);
            btn.onclick = () => {
                config.settings.theme["--color-window-background"] = windowBackground;
                config.settings.theme["--color-window-border"] = windowBorder;
                config.settings.theme["--color-white"] = white;
                config.settings.theme["--color-black"] = black;
                config.settings.theme["--color-blue"] = blue;
                applySetting();
            };
            dom_applyThemeBtns === null || dom_applyThemeBtns === void 0 ? void 0 : dom_applyThemeBtns.append(btn);
        }
        /**
         * 將設定套用至 mainwiwndow
         */
        function appleSettingOfMain() {
            WV_Window.RunJsOfParent(`mainWindow.readSetting(${JSON.stringify(config.settings)})`);
        }
        /**
         * 讀取設置值
         */
        function applySetting() {
            txt_imageDpizoom.value = config.settings["image"]["dpizoom"];
            select_tieefseeviewImageRendering.value = config.settings["image"]["tieefseeviewImageRendering"];
            jqtxt_windowBorderRadius.val(config.settings.theme["--window-border-radius"]).change();
            switch_areo.checked = config.settings["theme"]["aero"];
            //-------------
            function setRgb(jqdom, c) {
                //@ts-ignore
                jqdom.minicolors("value", `rgb(${c.r}, ${c.g}, ${c.b})`);
            }
            function setRgba(jqdom, c) {
                //@ts-ignore
                jqdom.minicolors("value", `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`);
            }
            setRgba(jqtxt_colorWindowBackground, config.settings.theme["--color-window-background"]);
            setRgba(jqtxt_colorWindowBorder, config.settings.theme["--color-window-border"]);
            setRgb(jqtxt_colorWhite, config.settings.theme["--color-white"]);
            setRgb(jqtxt_colorBlack, config.settings.theme["--color-black"]);
            setRgb(jqtxt_colorBlue, config.settings.theme["--color-blue"]);
        }
        /**
         * 儲存設定(關閉視窗時呼叫)
         */
        function saveSetting() {
            return __awaiter(this, void 0, void 0, function* () {
                //儲存 start.ini
                let startPort = parseInt(txt_startPort.value);
                let startType = getRadio("[name='radio-startType']");
                if (isNaN(startPort) || startPort > 65535 || startPort < 1024) {
                    startPort = 4876;
                }
                if (startType.search(/^[1|2|3|4|5]$/) !== 0) {
                    startType = 2;
                }
                startType = parseInt(startType);
                yield WV_Window.SetStartIni(startPort, startType);
                //儲存 setting.json
                let s = JSON.stringify(config.settings, null, '\t');
                var path = yield WV_Window.GetAppDataPath(); //程式的暫存資料夾
                path = Lib.Combine([path, "setting.json"]);
                yield WV_File.SetText(path, s);
            });
        }
    }
}
/**
 * 頁籤
 */
class Tabs {
    constructor() {
        /**
         * 所有頁籤
         */
        this.ar = [];
    }
    /**
     *
     * @param btn
     * @param page
     * @param func
     */
    activeEvent(btn, page, func) {
        var _a, _b;
        for (let i = 0; i < this.ar.length; i++) {
            const item = this.ar[i];
            (_a = item.btn) === null || _a === void 0 ? void 0 : _a.setAttribute("active", "");
            (_b = item.page) === null || _b === void 0 ? void 0 : _b.setAttribute("active", "");
        }
        btn === null || btn === void 0 ? void 0 : btn.setAttribute("active", "true");
        page === null || page === void 0 ? void 0 : page.setAttribute("active", "true");
        func();
    }
    /**
     * 顯示選擇的頁籤
     */
    set(btn) {
        for (let i = 0; i < this.ar.length; i++) {
            const item = this.ar[i];
            if (btn === item.btn) {
                this.activeEvent(btn, item.page, item.func);
            }
        }
    }
    /**
     * 新增頁籤(用於初始化)
     * @param btn
     * @param page
     * @param func 選中時觸發
     */
    add(btn, page, func) {
        this.ar.push({ btn, page, func });
        btn === null || btn === void 0 ? void 0 : btn.addEventListener("click", () => {
            this.activeEvent(btn, page, func);
        });
    }
}
