

class Setting {

    public saveData;

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
        var switch_areo = document.querySelector("#switch-theme-areo") as HTMLInputElement;
        var jqtxt_zoomFactor = $("#text-theme-zoomFactor");

        var txt_imageDpizoom = document.querySelector("#image-dpizoom") as HTMLInputElement;
        var select_tieefseeviewImageRendering = document.querySelector("#image-tieefseeviewImageRendering") as HTMLInputElement;

        var txt_startPort = document.querySelector("#txt-startPort") as HTMLInputElement;
        var switch_serverCache = document.querySelector("#switch-serverCache") as HTMLInputElement;
        var btn_openAppData = document.getElementById("btn-openAppData") as HTMLElement;
        var btn_openWww = document.getElementById("btn-openWww") as HTMLElement;

        var btn_openSystemSetting = document.getElementById("btn-openSystemSetting") as HTMLElement;
        var txt_extension = document.querySelector("#txt-extension") as HTMLTextAreaElement;
        var btn_extension = document.querySelector("#btn-extension") as HTMLElement;




        var dom_applyThemeBtns = document.querySelector("#applyTheme-btns");


        baseWindow = new BaseWindow();//初始化視窗
        init();

        initDomImport();//初始化圖示

        tippy(".img-help", {
            content(reference: HTMLElement) {
                const id = reference.getAttribute("data-tooltip");
                if (id === null) { return ""; }
                const template = document.getElementById(id);
                return template?.innerHTML;
            },
            allowHTML: true,
        });


        /**
          * 覆寫 onCreate
          * @param json 
          */
        baseWindow.onCreate = async (json: AppInfo) => {

            await WV_Window.ShowWindow_Center(550 * window.devicePixelRatio, 450 * window.devicePixelRatio);//顯示視窗 


            //讀取設定檔
            var userSetting = {};
            try {
                userSetting = JSON.parse(json.settingTxt);
            } catch (e) { }
            $.extend(true, config.settings, userSetting);

            setRadio("[name='radio-startType']", json.startType.toString())
            txt_startPort.value = json.startPort.toString();
            switch_serverCache.checked = (json.serverCache == 1);

            applySetting();//套用設置值

            //document.querySelector("input")?.focus();
            document.querySelector("input")?.blur();//失去焦點
        }


        /**
         * 
         */
        async function init() {

            WV_Window.SetMinimumSize(400 * window.devicePixelRatio, 300 * window.devicePixelRatio);//設定視窗最小size
            WV_Window.Text = "設定";
            let iconPath = Lib.Combine([await WV_Window.GetAppDirPath(), "www\\img\\logo.ico"]);
            WV_Window.SetIcon(iconPath);

            //關閉視窗前觸發
            baseWindow.closingEvents.push(async () => {
                await saveSetting();
            });


            //初始化顏色選擇器物件
            (() => {

                addEvent(jqtxt_colorWindowBorder, "--color-window-border", true);//邊框顏色
                addEvent(jqtxt_colorWindowBackground, "--color-window-background", true);//視窗顏色
                addEvent(jqtxt_colorWhite, "--color-white", false);//
                addEvent(jqtxt_colorBlack, "--color-black", false);//
                addEvent(jqtxt_colorBlue, "--color-blue", false);//
                //add(jQdom_theme_colorGrey, "--color-grey", false);//

                function addEvent(jQdim: JQuery, name: string, opacity: boolean = false) {

                    //@ts-ignore
                    jQdim.minicolors({
                        format: "rgb",
                        opacity: opacity,
                        changeDelay: 10,//change時間的更新延遲
                        change: function (value: string, opacity: number) {

                            //@ts-ignore
                            let c = jQdim.minicolors("rgbObject");//取得顏色 

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

                tabs.set(document.getElementById("tabsBtn-common"));//預設選擇的頁面
            })();


            //初始化主題按鈕
            (() => {
                applyThemeAddBtn(
                    `<div class="btn">深色主題</div>`,
                    { r: 31, g: 39, b: 43, a: 0.97 },
                    { r: 255, g: 255, b: 255, a: 0.25 },
                    { r: 255, g: 255, b: 255, },
                    { r: 0, g: 0, b: 0, },
                    { r: 0, g: 200, b: 255, } ,
                )
                applyThemeAddBtn(
                    `<div class="btn">淺色主題</div>`,
                    { r: 255, g: 255, b: 255, a: 0.97 },
                    { r: 112, g: 112, b: 112, a: 0.25 },
                    { r: 0, g: 0, b: 0, },
                    { r: 255, g: 255, b: 255, },
                    { r: 0, g: 125, b: 170, } ,
                )
            })();


            //關聯副檔名 預設顯示文字
            let s_extension = ["JPG", "JPEG", "PNG", "GIF", "BMP", "SVG", "WEBP",];
            txt_extension.value = s_extension.join("\n");
            btn_extension.addEventListener("mousedown", async (e) => {

                Msgbox.show({
                    txt: "確定用Tiefsee來開啟這些檔案嗎？<br>" + s_extension.join(", "),
                    funcYes: async (dom: HTMLElement, inputTxt: string) => {

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
                        let appPath = await WV_Window.GetAppPath();
                        await WV_System.SetAssociationExtension(ar, appPath);

                        //Msgbox.close(msgboxLoading);

                        Msgbox.show({ txt: "關聯完成", });

                    }
                });



            })


            //拖曳視窗
            document.getElementById("window-left")?.addEventListener("mousedown", async (e) => {
                let _dom = e.target as HTMLDivElement;
                if (_dom) {
                    if (_dom.classList.contains("js-noDrag")) { return; }
                }
                if (e.button === 0) {//滑鼠左鍵
                    await WV_Window.WindowDrag("move");
                }
            })


            //視窗 圓角
            jqtxt_windowBorderRadius.change(() => {
                let val = Number(jqtxt_windowBorderRadius.val());
                if (val < 0) { val = 0; }
                if (val > 15) { val = 15; }

                config.settings["theme"]["--window-border-radius"] = val;
                appleSettingOfMain();
            });

            //視窗縮放
            jqtxt_zoomFactor.change(() => {
                let val = Number(jqtxt_zoomFactor.val());
                if (isNaN(val)) { val = 1; }
                if (val === 0) { val = 1; }
                if (val < 0.5) { val = 0.5; }
                if (val > 3) { val = 3; }

                config.settings["theme"]["zoomFactor"] = val;
                appleSettingOfMain();
            });

            // 視窗 aero毛玻璃
            switch_areo?.addEventListener("change", () => {
                let val = switch_areo.checked;
                config.settings["theme"]["aero"] = val;
            });

            // 圖片 dpi
            txt_imageDpizoom?.addEventListener("change", () => {
                let val = txt_imageDpizoom.value;
                config.settings["image"]["dpizoom"] = val;
                appleSettingOfMain();
            });

            // 圖片 縮放模式
            select_tieefseeviewImageRendering?.addEventListener("change", () => {
                let val = select_tieefseeviewImageRendering.value;
                config.settings["image"]["tieefseeviewImageRendering"] = val;
                appleSettingOfMain();
            });

            //開啟 AppData(使用者資料)
            btn_openAppData?.addEventListener("click", async () => {
                let path = await WV_Window.GetAppDataPath();
                WV_RunApp.OpenUrl(path)
            });

            //開啟 www(原始碼)
            btn_openWww?.addEventListener("click", async () => {
                let path = await WV_Window.GetAppDirPath();
                path = Lib.Combine([path, "www"]);
                WV_RunApp.OpenUrl(path)
            });

            //開啟 系統設定
            btn_openSystemSetting?.addEventListener("click", async () => {
                let path = "ms-settings:defaultapps";
                WV_RunApp.OpenUrl(path)
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
        function applyThemeAddBtn(html: string,
            windowBackground: { r: number, g: number, b: number, a: number },
            windowBorder: { r: number, g: number; b: number, a: number },
            white: { r: number, g: number, b: number },
            black: { r: number, g: number, b: number },
            blue: { r: number, g: number, b: number }) {

            let btn = newDiv(html);
            btn.onclick = () => {
                config.settings.theme["--color-window-background"] = windowBackground;
                config.settings.theme["--color-window-border"] = windowBorder;
                config.settings.theme["--color-white"] = white;
                config.settings.theme["--color-black"] = black;
                config.settings.theme["--color-blue"] = blue;
                applySetting()
            };
            dom_applyThemeBtns?.append(btn);
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

            jqtxt_windowBorderRadius.val(config.settings.theme["--window-border-radius"]);//圓角
            switch_areo.checked = config.settings["theme"]["aero"];//毛玻璃
            jqtxt_zoomFactor.val(config.settings.theme["zoomFactor"]);//視窗縮放

            appleSettingOfMain();//將設定套用至 mainwiwndow

            //-------------

            function setRgb(jqdom: JQuery<HTMLElement>, c: { r: number, g: number, b: number, }) {
                //@ts-ignore
                jqdom.minicolors("value", `rgb(${c.r}, ${c.g}, ${c.b})`);
            }
            function setRgba(jqdom: JQuery<HTMLElement>, c: { r: number, g: number, b: number, a: number, }) {
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
        async function saveSetting() {

            //儲存 start.ini
            let startPort = parseInt(txt_startPort.value);
            let startType: any = getRadio("[name='radio-startType']");
            let serverCache = switch_serverCache.checked ? 1 : 0;
            if (isNaN(startPort) || startPort > 65535 || startPort < 1024) {
                startPort = 4876;
            }
            if (startType.search(/^[1|2|3|4|5]$/) !== 0) {
                startType = 2;
            }
            startType = parseInt(startType);

            await WV_Window.SetStartIni(startPort, startType, serverCache);


            //儲存 setting.json
            let s = JSON.stringify(config.settings, null, '\t');
            var path = await WV_Window.GetAppDataPath();//程式的暫存資料夾
            path = Lib.Combine([path, "setting.json"]);
            await WV_File.SetText(path, s);
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
    public ar: { btn: HTMLElement | null, page: HTMLElement | null, func: () => void }[] = [];

    /**
     * 
     * @param btn 
     * @param page 
     * @param func 
     */
    private activeEvent(btn: HTMLElement | null, page: HTMLElement | null, func: () => void) {
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
    public set(btn: HTMLElement | null) {
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
    public add(btn: HTMLElement | null, page: HTMLElement | null, func: () => void) {
        this.ar.push({ btn, page, func })
        btn?.addEventListener("click", () => {
            this.activeEvent(btn, page, func)
        })
    }

    constructor() { }
}
