import { initLanguageSettings, initImageZoomSettings, initSharpenSettings, initSortSettings, initImagePixelsSettings, initAutoStartSettings, initOtherSettings } from "./GeneralSettings";
import { initToolbarSettings } from "./ToolbarSettings";
import { initHotkeySettings } from "./HotkeySettings";
import { initThemeSettings, initWindowBorderSettings, initZoomFactorSettings, initFontWeightSettings, initIconWeightSettings, initWindowStyleSettings } from "./AppearanceSettings";
import { initFileAssociationSettings, initSystemSettingsSettings } from "./AssociationSettings";
import { initToolbarVisibilitySettings, initFilePanelSettings, initDirectoryPanelSettings, initInformationPanelSettings, initLargeButtonsSettings, initPanelOrderSettings } from "./LayoutSettings";
import { initMouseSettings } from "./MouseSettings";
import { initImageResamplingSettings, initBulkViewLimitSettings, initRendererSettings, initPathsSettings, initCacheSettings, initDirectoryLimitSettings, initQualityLimitSettings, initStartupPortSettings, initResetSettings } from "./AdvancedSettings";
import { initPluginSettings } from "./PluginSettings";
import { initQuickLookSettings } from "./QuickLookSettings";
import { initAboutSettings } from "./AboutSettings";
import { BaseWindow } from "../BaseWindow";
import { Config } from "../Config";
import { cloneToolbarCustomization, restoreToolbarCustomization } from "../Toolbar/ToolbarCustomization";
import { I18n } from "../I18n";
import { Lib } from "../Lib";
import { MainToolbar } from "../MainWindow/MainToolbar";
import { Msgbox } from "../Msgbox";
import { SelectionManager } from "../SelectionManager";
import tippy from "tippy.js";

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
        const _defaultToolbarCustomization = cloneToolbarCustomization(_defaultConfig.toolbarCustomization);

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

        let settingsGroupContentId = 0;
        function initSettingsGroups(root: ParentNode) {
            const domGroups = root.querySelectorAll(".js-settingsGroup");
            domGroups.forEach((domGroup) => {
                const domBox = domGroup as HTMLElement;
                if (domBox.getAttribute("data-collapse-init") === "true") { return; }
                domBox.setAttribute("data-collapse-init", "true");

                const domTitle = domBox.querySelector(".settings-groupTitle") as HTMLElement | null;
                if (domTitle === null) { return; }

                Lib.collapse(domBox, "init-true");
                domTitle.setAttribute("role", "button");
                domTitle.setAttribute("aria-expanded", "true");
                const domContent = domBox.querySelector<HTMLElement>(".collapse-content");
                if (domContent !== null) {
                    domContent.id ||= `settings-group-content-${++settingsGroupContentId}`;
                    domTitle.setAttribute("aria-controls", domContent.id);
                }
                domTitle.addEventListener("click", () => {
                    Lib.collapse(domBox, "toggle", isOpen => {
                        domTitle.setAttribute("aria-expanded", String(isOpen));
                    });
                });
            });
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

            const width = 800;
            const height = 600;
            await WV_Window.ShowWindowAtCenter(width, height); // 顯示視窗

            // .NET 8+ PerMonitorV2 會依目前 DPI 縮放頂層 Form 的 MinimumSize，傳入邏輯像素即可。
            WV_Window.SetMinimumSize(800, 300); // 設定視窗最小寬度

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
            Lib.addDragThresholdListener(domLeftBox, 1, async (e) => { // 移動一定距離後觸發
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
            restoreToolbarCustomization(_config.settings.toolbarCustomization, userSetting, _defaultToolbarCustomization);

            // 執行
            _loadEvent.forEach(func => {
                func()
            });

            // getDom("input")?.focus();
            // getDom("input")?.blur(); // 失去焦點
        }

        // 初始化多國語言
        addLoadEvent(() => initLanguageSettings({ _config, _i18n, getDom, appleSettingOfMain }));

        // 自訂工具列
        addLoadEvent(() => initToolbarSettings({ _config, _i18n, _mainToolbar, _defaultToolbarCustomization, _msgbox, getDom, appleSettingOfMain }));

        // 快速鍵
        addLoadEvent(() => initHotkeySettings({ _config, _i18n, _msgbox, getDom, initSettingsGroups, appleSettingOfMain }));

        // 主題
        addLoadEvent(() => initThemeSettings({ _config, _i18n, getDom, isDarkMode, appleSettingOfMain }));

        // 圖片預設 縮放模式、對齊位置
        addLoadEvent(() => initImageZoomSettings({ _config, getDom, appleSettingOfMain }));

        // 銳化圖片
        addLoadEvent(() => initSharpenSettings({ _config, getDom, appleSettingOfMain }));

        // 預設排序
        addLoadEvent(() => initSortSettings({ _config, getDom, appleSettingOfMain }));

        // 關聯副檔名 
        addLoadEvent(() => initFileAssociationSettings({ _i18n, _msgbox, getDom }));

        // 開啟 系統設定
        addLoadEvent(() => initSystemSettingsSettings({ getDom }));

        // 視窗 圓角
        addLoadEvent(() => initWindowBorderSettings({ _config, getDom, appleSettingOfMain }));

        // 視窗 縮放比例
        addLoadEvent(() => initZoomFactorSettings({ _config, getDom, appleSettingOfMain }));

        // 文字粗細
        addLoadEvent(() => initFontWeightSettings({ _config, getDom, appleSettingOfMain }));

        // 圖示粗細
        addLoadEvent(() => initIconWeightSettings({ _config, getDom, appleSettingOfMain }));

        // 視窗效果
        addLoadEvent(() => initWindowStyleSettings({ _config, getDom, isDarkMode, appleSettingOfMain, restartTiefsee }));

        // 工具列
        addLoadEvent(() => initToolbarVisibilitySettings({ _config, getDom, appleSettingOfMain }));

        // 滑鼠按鍵 + 滑鼠滾輪
        addLoadEvent(() => initMouseSettings({ _config, _i18n, _msgbox, getDom, initSettingsGroups, appleSettingOfMain }));

        // 檔案預覽視窗
        addLoadEvent(() => initFilePanelSettings({ _config, getDom, appleSettingOfMain }));

        // 資料夾預覽視窗
        addLoadEvent(() => initDirectoryPanelSettings({ _config, getDom, appleSettingOfMain }));

        // 詳細資料面板
        addLoadEvent(() => initInformationPanelSettings({ _config, getDom, appleSettingOfMain }));

        // 大型切換按鈕
        addLoadEvent(() => initLargeButtonsSettings({ _config, getDom, appleSettingOfMain }));

        // 佈局順序
        addLoadEvent(() => initPanelOrderSettings({ _config, appleSettingOfMain }));

        // 縮小至特定比例以下，就使用libvips重新處理圖片
        addLoadEvent(() => initImageResamplingSettings({ _config, getDom, appleSettingOfMain }));

        // 大量瀏覽模式一頁顯示的圖片數量
        addLoadEvent(() => initBulkViewLimitSettings({ _config, getDom, appleSettingOfMain }));

        // 圖片 縮放模式
        addLoadEvent(() => initImagePixelsSettings({ _config, getDom, appleSettingOfMain }));

        // 靜態圖片 Renderer 選擇；獨立於畫質插值設定，於下一張圖片載入時生效。
        addLoadEvent(() => initRendererSettings({ _config, _i18n, _msgbox, getDom, appleSettingOfMain }));

        // 相關路徑
        addLoadEvent(() => initPathsSettings({ getDom }));

        // 清理暫存資料
        addLoadEvent(() => initCacheSettings({ _i18n, _msgbox, getDom }));

        // 資料夾數量太多時，禁用資料夾預覽視窗
        addLoadEvent(() => initDirectoryLimitSettings({ _config, getDom, appleSettingOfMain }));

        // 圖片面積太大時，禁用高品質縮放
        addLoadEvent(() => initQualityLimitSettings({ _config, getDom, appleSettingOfMain }));

        // 啟動模式 、 Port
        addLoadEvent(() => initStartupPortSettings({ _appInfo, getDom, restartTiefsee }));

        // 重設設定 
        addLoadEvent(() => initResetSettings({ _config, _i18n, _defaultConfig, _msgbox, getDom, restartTiefsee }));

        // 開機後自動啟動
        addLoadEvent(() => initAutoStartSettings({ _i18n, _appInfo, _msgbox, getDom }));

        // 擴充套件 
        addLoadEvent(() => initPluginSettings({ getDom, restartTiefsee }));

        // 快速預覽
        addLoadEvent(() => initQuickLookSettings({ _config, getDom, saveSetting }));

        // 其他
        addLoadEvent(() => initOtherSettings({ _config, getDom, appleSettingOfMain }));

        // 關於
        addLoadEvent(() => initAboutSettings({ getDom }));

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
            tabs.add(getDom("#tabsBtn-hotkey"), getDom("#tabsPage-hotkey"), () => { goTop() }); // 快速鍵
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
            item.btn?.setAttribute("aria-selected", "false");
            item.page?.setAttribute("active", "");
        }
        btn?.setAttribute("active", "true");
        btn?.setAttribute("aria-selected", "true");
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
