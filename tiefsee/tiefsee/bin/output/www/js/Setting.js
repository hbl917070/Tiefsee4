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
        var _a;
        var config = new Config();
        var cssRoot = document.documentElement;
        var jQdom_theme_windowBorderRadius = $("#text-theme-windowBorderRadius");
        var jQdom_theme_colorWindowBackground = $("#text-theme-colorWindowBackground");
        var jQdom_theme_colorWindowBorder = $("#text-theme-colorWindowBorder");
        var jQdom_theme_colorWhite = $("#text-theme-colorWhite");
        var jQdom_theme_colorBlack = $("#text-theme-colorBlack");
        var jQdom_theme_colorBlue = $("#text-theme-colorBlue");
        //var jQdom_theme_colorGrey = $("#text-theme-colorGrey");
        var dom_applyTheme_btns = document.querySelector("#applyTheme-btns");
        baseWindow = new BaseWindow(); //初始化視窗
        initDomImport(); //初始化圖示
        init();
        baseWindow.closingEvents.push(() => __awaiter(this, void 0, void 0, function* () {
            yield saveData();
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
        //初始化頁面分頁
        var tabs = new Tabs();
        tabs.add(document.getElementById("tabsBtn-theme"), document.getElementById("tabsPage-theme"), () => { });
        tabs.add(document.getElementById("tabsBtn-tools"), document.getElementById("tabsPage-tools"), () => { });
        tabs.add(document.getElementById("tabsBtn-shortcutKeys"), document.getElementById("tabsPage-shortcutKeys"), () => { });
        tabs.add(document.getElementById("tabsBtn-about"), document.getElementById("tabsPage-about"), () => { });
        tabs.set(document.getElementById("tabsBtn-theme")); //預設選擇的頁面
        function init() {
            return __awaiter(this, void 0, void 0, function* () {
                initTheme(); //初始化顏色選擇器物件
                yield getSettingFile();
                yield readSetting();
                //var  W = await  WV_Window.This;
                WV_Window.SetMinimumSize(400, 300); //設定視窗最小size
                WV_Window.Text = "設定";
                let iconPath = Lib.Combine([yield WV_Window.GetAppDirPath(), "www\\img\\logo.ico"]);
                WV_Window.SetIcon(iconPath);
            });
        }
        applyThemeAddBtn(`<div class="btn">深色主題</div>`, { r: 31, g: 39, b: 43, a: 0.97 }, { r: 255, g: 255, b: 255, a: 0.25 }, { r: 255, g: 255, b: 255, }, { r: 0, g: 0, b: 0, }, { r: 0, g: 200, b: 255, });
        applyThemeAddBtn(`<div class="btn">淺色主題</div>`, { r: 255, g: 255, b: 255, a: 0.97 }, { r: 112, g: 112, b: 112, a: 0.25 }, { r: 0, g: 0, b: 0, }, { r: 255, g: 255, b: 255, }, { r: 0, g: 125, b: 170, });
        /** 初始化顏色選擇器物件 */
        function initTheme() {
            addEvent(jQdom_theme_colorWindowBackground, "--color-window-background", true); //視窗顏色
            addEvent(jQdom_theme_colorWindowBorder, "--color-window-border", true); //邊框顏色
            addEvent(jQdom_theme_colorWhite, "--color-white", false); //
            addEvent(jQdom_theme_colorBlack, "--color-black", false); //
            addEvent(jQdom_theme_colorBlue, "--color-blue", false); //
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
        }
        jQdom_theme_windowBorderRadius.change(() => {
            let val = Number(jQdom_theme_windowBorderRadius.val());
            if (val < 0) {
                val = 0;
            }
            if (val > 15) {
                val = 15;
            }
            config.settings["theme"]["--window-border-radius"] = val;
            WV_Window.RunJsOfParent(`mainWindow.readSetting(${JSON.stringify(config.settings)})`);
        });
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
                readSetting();
            };
            dom_applyTheme_btns === null || dom_applyTheme_btns === void 0 ? void 0 : dom_applyTheme_btns.append(btn);
        }
        function readSetting() {
            jQdom_theme_windowBorderRadius.val(config.settings.theme["--window-border-radius"]).change();
            function setRgb(jqdom, c) {
                //@ts-ignore
                jqdom.minicolors("value", `rgba(${c.r}, ${c.g}, ${c.b})`);
            }
            function setRgba(jqdom, c) {
                //@ts-ignore
                jqdom.minicolors("value", `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`);
            }
            setRgba(jQdom_theme_colorWindowBackground, config.settings.theme["--color-window-background"]);
            setRgba(jQdom_theme_colorWindowBorder, config.settings.theme["--color-window-border"]);
            setRgb(jQdom_theme_colorWhite, config.settings.theme["--color-white"]);
            setRgb(jQdom_theme_colorBlack, config.settings.theme["--color-black"]);
            setRgb(jQdom_theme_colorBlue, config.settings.theme["--color-blue"]);
        }
        /**
         * 讀取設定檔
         */
        function getSettingFile() {
            return __awaiter(this, void 0, void 0, function* () {
                let s = JSON.stringify(config.settings, null, '\t');
                var path = Lib.Combine([yield WV_Window.GetAppDirPath(), "www\\userData"]);
                if ((yield WV_Directory.Exists(path)) === false) {
                    yield WV_Directory.CreateDirectory(path);
                }
                path = Lib.Combine([path, "setting.json"]);
                let txt = yield WV_File.GetText(path);
                let json = JSON.parse(txt);
                config.settings = json;
            });
        }
        /**
         * 儲存設定
         */
        function saveData() {
            return __awaiter(this, void 0, void 0, function* () {
                let s = JSON.stringify(config.settings, null, '\t');
                var path = Lib.Combine([yield WV_Window.GetAppDirPath(), "www\\userData"]);
                if ((yield WV_Directory.Exists(path)) === false) {
                    yield WV_Directory.CreateDirectory(path);
                }
                path = Lib.Combine([path, "setting.json"]);
                yield WV_File.SetText(path, s);
            });
        }
    }
}
class Tabs {
    constructor() {
        this.ar = [];
    }
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
    set(btn) {
        for (let i = 0; i < this.ar.length; i++) {
            const item = this.ar[i];
            if (btn === item.btn) {
                this.activeEvent(btn, item.page, item.func);
            }
        }
    }
    add(btn, page, func) {
        this.ar.push({ btn, page, func });
        btn === null || btn === void 0 ? void 0 : btn.addEventListener("click", () => {
            this.activeEvent(btn, page, func);
        });
    }
}
