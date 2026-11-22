/** 對應設定視窗的「外觀」頁面。 */
import { SettingWindowContext } from "./SettingWindowContext";
import { Lib } from "../Lib";

// 主題
export function initThemeSettings({ _config, _i18n, getDom, isDarkMode, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "_i18n" | "getDom" | "isDarkMode" | "appleSettingOfMain">) {

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
        `<div class="btn js-btn-darkTheme" role="button" i18n="sw.theme.darkTheme">${_i18n.t("sw.theme.darkTheme")}</div>`,
        { r: 31, g: 39, b: 43, a: 0.97 },
        { r: 255, g: 255, b: 255, a: 0.25 },
        { r: 255, g: 255, b: 255, },
        { r: 0, g: 0, b: 0, },
        { r: 0, g: 200, b: 255, },
    )
    applyThemeAddBtn( // 淺色主題
        `<div class="btn js-btn-lightTheme" role="button" i18n="sw.theme.lightTheme">${_i18n.t("sw.theme.lightTheme")}</div>`,
        { r: 255, g: 255, b: 255, a: 0.97 },
        { r: 112, g: 112, b: 112, a: 0.25 },
        { r: 0, g: 0, b: 0, },
        { r: 255, g: 255, b: 255, },
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
}

// 視窗 圓角
export function initWindowBorderSettings({ _config, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "getDom" | "appleSettingOfMain">) {
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
}

// 視窗 縮放比例
export function initZoomFactorSettings({ _config, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "getDom" | "appleSettingOfMain">) {
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
}

// 文字粗細
export function initFontWeightSettings({ _config, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "getDom" | "appleSettingOfMain">) {
    const domSelect = getDom("#select-fontWeight") as HTMLInputElement;
    domSelect.value = _config.settings.theme["fontWeight"];

    domSelect.addEventListener("change", () => {
        let val = domSelect.value;
        _config.settings["theme"]["fontWeight"] = val;
        appleSettingOfMain();
    });
}

// 圖示粗細
export function initIconWeightSettings({ _config, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "getDom" | "appleSettingOfMain">) {
    const domSelect = getDom("#select-svgWeight") as HTMLInputElement;
    domSelect.value = _config.settings.theme["svgWeight"];

    domSelect.addEventListener("change", () => {
        let val = domSelect.value;
        _config.settings["theme"]["svgWeight"] = val;
        appleSettingOfMain();
    });
}

// 視窗效果
export function initWindowStyleSettings({ _config, getDom, isDarkMode, appleSettingOfMain, restartTiefsee }: Pick<SettingWindowContext, "_config" | "getDom" | "isDarkMode" | "appleSettingOfMain" | "restartTiefsee">) {

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
}
