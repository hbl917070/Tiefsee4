import { contains } from "jquery";

var baseWindow: BaseWindow;

class Setting {

    public saveData;

    constructor() {

        baseWindow = new BaseWindow();//初始化視窗

        this.saveData = saveSetting;

        var appInfo: AppInfo;

        var config = new Config();
        var mainTools = new MainTools(null);//取得工具列

        var loadEvent: (() => void)[] = [];
        /**
         * 讀取設定完成後執行的工作
         * @param func 
         */
        function addLoadEvent(func: () => void) {
            loadEvent.push(func);
        }

        //initDomImport();//初始化圖示

        /**
          * 覆寫 onCreate
          * @param json 
          */
        baseWindow.onCreate = async (json: AppInfo) => {

            await WV_Window.ShowWindow_Center(550 * window.devicePixelRatio, 450 * window.devicePixelRatio);//顯示視窗 
            WV_Window.SetMinimumSize(400 * window.devicePixelRatio, 300 * window.devicePixelRatio);//設定視窗最小size
            WV_Window.Text = "設定";
            let iconPath = Lib.Combine([await WV_Window.GetAppDirPath(), "www\\img\\logo.ico"]);
            WV_Window.SetIcon(iconPath);

            //關閉視窗前觸發
            baseWindow.closingEvents.push(async () => {
                await saveSetting();
            });

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

            tippy(".img-help", {
                content(reference: HTMLElement) {
                    const id = reference.getAttribute("data-tooltip");
                    if (id === null) { return ""; }
                    const template = document.getElementById(id);
                    return template?.innerHTML;
                },
                allowHTML: true,
            });

            //-------------

            appInfo = json;

            //讀取設定檔
            var userSetting = {};
            try {
                userSetting = JSON.parse(json.settingTxt);
            } catch (e) { }
            $.extend(true, config.settings, userSetting);

            //執行
            loadEvent.forEach(func => {
                func()
            });

            //document.querySelector("input")?.focus();
            document.querySelector("input")?.blur();//失去焦點
        }

        //初始化頁面分頁
        addLoadEvent(() => {
            var tabs = new Tabs();
            tabs.add(document.getElementById("tabsBtn-common"), document.getElementById("tabsPage-common"), () => { });
            tabs.add(document.getElementById("tabsBtn-theme"), document.getElementById("tabsPage-theme"), () => { });
            tabs.add(document.getElementById("tabsBtn-layout"), document.getElementById("tabsPage-layout"), () => { });
            tabs.add(document.getElementById("tabsBtn-tools"), document.getElementById("tabsPage-tools"), () => { });
            tabs.add(document.getElementById("tabsBtn-image"), document.getElementById("tabsPage-image"), () => { });
            tabs.add(document.getElementById("tabsBtn-shortcutKeys"), document.getElementById("tabsPage-shortcutKeys"), () => { });
            tabs.add(document.getElementById("tabsBtn-extension"), document.getElementById("tabsPage-extension"), () => { });
            tabs.add(document.getElementById("tabsBtn-advanced"), document.getElementById("tabsPage-advanced"), () => { });
            tabs.add(document.getElementById("tabsBtn-about"), document.getElementById("tabsPage-about"), () => { });

            tabs.set(document.getElementById("tabsBtn-common"));//預設選擇的頁面
        })

        //自訂工具列
        addLoadEvent(() => {

            var mainToolsArray = mainTools.getArrray();

            const arGroupName = ["img", "pdf", "txt"];
            arGroupName.map((gn) => {

                let groupName = gn as ("img" | "pdf" | "txt");
                var dom_toolsList = document.getElementById(`toolsList-${groupName}`) as HTMLElement;

                //產生html
                var html = "";
                for (let i = 0; i < mainToolsArray.length; i++) {
                    const item = mainToolsArray[i];

                    if (item.type !== "button") { continue; }
                    let h = `
                        <div class="toolsList-item" data-name="${item.name}">
                            <input class="toolsList-checkbox" type="checkbox" data-name="${item.name}" checked>
                            ${SvgList[item.icon]}
                            <span>${item.i18n}</span>
                        </div>`
                    if (item.group == groupName) { html += h; }
                }
                dom_toolsList.innerHTML = html;

                //初始化 排序
                let arMainTools = config.settings.mainTools[groupName];
                for (let i = 0; i < arMainTools.length; i++) {
                    let item = arMainTools[i];
                    let ardomToolsList = dom_toolsList.querySelectorAll(".toolsList-item");
                    let d1 = ardomToolsList[i];
                    let d2 = dom_toolsList.querySelector(`[data-name=${item.n}]`);
                    if (d1 == undefined) { break; }
                    if (d2 === null) { continue; }
                    swapDom(d1, d2); //dom 交換順序
                }

                //初始化 checkbox狀態
                for (let i = 0; i < arMainTools.length; i++) {
                    let item = arMainTools[i];
                    let d2 = dom_toolsList.querySelector(`[data-name=${item.n}]`);
                    if (d2 === null) { continue; }
                    if (item.v === true) {
                        const domCheckbox = d2.querySelector(".toolsList-checkbox") as HTMLInputElement;
                        domCheckbox.checked = true;
                    }
                }

                //給每一個checkbox都註冊onchange
                let domAr_checkbox = dom_toolsList.querySelectorAll(".toolsList-checkbox");
                for (let i = 0; i < domAr_checkbox.length; i++) {
                    const domCheckbox = domAr_checkbox[i] as HTMLInputElement;
                    domCheckbox.onchange = () => {
                        let data = getToolsListData();
                        config.settings.mainTools = data;
                        appleSettingOfMain();
                    }
                }

                //初始化拖曳功能
                new Sortable(dom_toolsList, {
                    animation: 150,
                    onEnd: (evt) => {
                        let data = getToolsListData();
                        config.settings.mainTools = data;
                        appleSettingOfMain();
                    }
                });

            })

            /** 取得排序與顯示狀態 */
            function getToolsListData() {
                function getItem(type: string) {
                    let ar = [];
                    let dom_toolsList = document.getElementById(`toolsList-${type}`) as HTMLElement;
                    let domAr = dom_toolsList.querySelectorAll(".toolsList-checkbox");

                    for (let i = 0; i < domAr.length; i++) {
                        const domCheckbox = domAr[i] as HTMLInputElement;
                        let name = domCheckbox.getAttribute("data-name") + "";
                        let val = domCheckbox.checked;
                        ar.push({
                            n: name,
                            v: val
                        })
                    }
                    return ar;
                }

                let data = {
                    img: getItem("img"),
                    pdf: getItem("pdf"),
                    txt: getItem("txt"),
                };
                return data
            }

            //------------

            //切換下拉選單時，顯示對應的內容
            var select_toolsListType = document.getElementById("select-toolsListType") as HTMLSelectElement;
            var dom_toolsList_img = document.getElementById("toolsList-img") as HTMLElement;
            var dom_toolsList_pdf = document.getElementById("toolsList-pdf") as HTMLElement;
            var dom_toolsList_txt = document.getElementById("toolsList-txt") as HTMLElement;
            let eventChange = () => {
                let val = select_toolsListType.value;
                if (val == "img") {
                    dom_toolsList_img.style.display = "block";
                    dom_toolsList_pdf.style.display = "none";
                    dom_toolsList_txt.style.display = "none";
                }
                if (val == "pdf") {
                    dom_toolsList_img.style.display = "none";
                    dom_toolsList_pdf.style.display = "block";
                    dom_toolsList_txt.style.display = "none";
                }
                if (val == "txt") {
                    dom_toolsList_img.style.display = "none";
                    dom_toolsList_pdf.style.display = "none";
                    dom_toolsList_txt.style.display = "block";
                }
            }
            select_toolsListType.onchange = eventChange;
            eventChange();

        });


        //主題
        addLoadEvent(() => {

            //var cssRoot = document.documentElement;
            var jqtxt_colorWindowBackground = $("#text-theme-colorWindowBackground");//視窗顏色
            var jqtxt_colorWindowBorder = $("#text-theme-colorWindowBorder");//邊框顏色
            var jqtxt_colorWhite = $("#text-theme-colorWhite");//文字顏色
            var jqtxt_colorBlack = $("#text-theme-colorBlack");//區塊底色
            var jqtxt_colorBlue = $("#text-theme-colorBlue");//主顏色
            var dom_applyThemeBtns = document.querySelector("#applyTheme-btns") as HTMLElement;

            //初始化顏色選擇器物件
            addEvent(jqtxt_colorWindowBackground, "--color-window-background", true);
            addEvent(jqtxt_colorWindowBorder, "--color-window-border", true);
            addEvent(jqtxt_colorWhite, "--color-white", false);
            addEvent(jqtxt_colorBlack, "--color-black", false);
            addEvent(jqtxt_colorBlue, "--color-blue", false);
            //add(jQdom_theme_colorGrey, "--color-grey", false);

            applyTheme()

            //初始化顏色選擇器物件
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
                        appleSettingOfMain();
                    }
                });
            }

            //讀取設定，套用顏色
            function applyTheme() {
                //修改輸入框的文字
                function setRgb(jqdom: JQuery<HTMLElement>, c: { r: number, g: number, b: number, }) {
                    //@ts-ignore
                    jqdom.minicolors("value", `rgb(${c.r}, ${c.g}, ${c.b})`);
                }
                function setRgba(jqdom: JQuery<HTMLElement>, c: { r: number, g: number, b: number, a: number, }) {
                    //@ts-ignore
                    jqdom.minicolors("value", `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`);
                }
                //修改輸入框的文字
                setRgba(jqtxt_colorWindowBackground, config.settings.theme["--color-window-background"]);
                setRgba(jqtxt_colorWindowBorder, config.settings.theme["--color-window-border"]);
                setRgb(jqtxt_colorWhite, config.settings.theme["--color-white"]);
                setRgb(jqtxt_colorBlack, config.settings.theme["--color-black"]);
                setRgb(jqtxt_colorBlue, config.settings.theme["--color-blue"]);
            }

            //-------------

            //初始化主題按鈕
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
                { r: 238, g: 238, b: 238, },
                { r: 0, g: 135, b: 220, } ,
            )

            //產生 套用主題 的按鈕
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
                    applyTheme()
                };
                dom_applyThemeBtns.append(btn);
            }
        });

        //關聯副檔名 
        addLoadEvent(() => {
            var txt_extension = document.querySelector("#txt-extension") as HTMLTextAreaElement;
            var btn_extension = document.querySelector("#btn-extension") as HTMLElement;

            let s_extension = ["JPG", "JPEG", "PNG", "GIF", "BMP", "SVG", "WEBP",];
            txt_extension.value = s_extension.join("\n");//預設顯示的文字
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
        })

        //開啟 系統設定
        addLoadEvent(() => {
            var btn_openSystemSetting = document.getElementById("btn-openSystemSetting") as HTMLElement;

            btn_openSystemSetting.addEventListener("click", async () => {
                let path = "ms-settings:defaultapps";
                WV_RunApp.OpenUrl(path)
            });
        })

        //視窗 圓角
        addLoadEvent(() => {
            var jqtxt_windowBorderRadius = $("#text-theme-windowBorderRadius");
            jqtxt_windowBorderRadius.val(config.settings.theme["--window-border-radius"]);

            jqtxt_windowBorderRadius.change(() => {
                let val = Number(jqtxt_windowBorderRadius.val());
                if (val < 0) { val = 0; }
                if (val > 15) { val = 15; }

                config.settings["theme"]["--window-border-radius"] = val;
                appleSettingOfMain();
            });
        })

        //視窗 縮放比例
        addLoadEvent(() => {
            var jqtxt_zoomFactor = $("#text-theme-zoomFactor");
            jqtxt_zoomFactor.val(config.settings.theme["zoomFactor"]);

            jqtxt_zoomFactor.change(() => {
                let val = Number(jqtxt_zoomFactor.val());
                if (isNaN(val)) { val = 1; }
                if (val === 0) { val = 1; }
                if (val < 0.5) { val = 0.5; }
                if (val > 3) { val = 3; }

                config.settings["theme"]["zoomFactor"] = val;
                appleSettingOfMain();
            });
        })

        //文字粗細
        addLoadEvent(() => {
            var jqselect_fontWeight = $("#select-fontWeight");
            jqselect_fontWeight.val(config.settings.theme["fontWeight"]);

            jqselect_fontWeight.change(() => {
                let val = jqselect_fontWeight.val() as string;
                config.settings["theme"]["fontWeight"] = val;
                appleSettingOfMain();
            });
        })

        //圖示粗細
        addLoadEvent(() => {
            var jqselect_svgWeight = $("#select-svgWeight");
            jqselect_svgWeight.val(config.settings.theme["svgWeight"]);

            jqselect_svgWeight.change(() => {
                let val = jqselect_svgWeight.val() as string;
                config.settings["theme"]["svgWeight"] = val;
                appleSettingOfMain();
            });
        })

        // 視窗 aero毛玻璃
        addLoadEvent(() => {
            var switch_areo = document.querySelector("#select-aeroType") as HTMLSelectElement;
            switch_areo.value = config.settings["theme"]["aeroType"];

            switch_areo.addEventListener("change", () => {
                let val = switch_areo.value;
                config.settings["theme"]["aeroType"] = val;
            });
        })

        //檔案預覽列表
        addLoadEvent(() => {
            var switch_fileListEnabled = document.querySelector("#switch-fileListEnabled") as HTMLInputElement;
            var switch_fileListShowNo = document.querySelector("#switch-fileListShowNo") as HTMLInputElement;
            var switch_fileListShowName = document.querySelector("#switch-fileListShowName") as HTMLInputElement;
            switch_fileListEnabled.checked = config.settings["layout"]["fileListEnabled"];//啟用 檔案預覽列表
            switch_fileListShowNo.checked = config.settings["layout"]["fileListShowNo"];//顯示編號
            switch_fileListShowName.checked = config.settings["layout"]["fileListShowName"];//顯示檔名

            switch_fileListEnabled.addEventListener("change", () => {//啟用 檔案預覽列表
                let val = switch_fileListEnabled.checked;
                config.settings["layout"]["fileListEnabled"] = val;
                appleSettingOfMain();
            });
            switch_fileListShowNo.addEventListener("change", () => {//顯示編號
                let val = switch_fileListShowNo.checked;
                config.settings["layout"]["fileListShowNo"] = val;
                appleSettingOfMain();
            });
            switch_fileListShowName.addEventListener("change", () => {//顯示檔名
                let val = switch_fileListShowName.checked;
                config.settings["layout"]["fileListShowName"] = val;
                appleSettingOfMain();
            });
        })

        //資料夾預覽列表
        addLoadEvent(() => {
            var switch_dirListEnabled = document.querySelector("#switch-dirListEnabled") as HTMLInputElement;
            var switch_dirListShowNo = document.querySelector("#switch-dirListShowNo") as HTMLInputElement;
            var switch_dirListShowName = document.querySelector("#switch-dirListShowName") as HTMLInputElement;
            var select_dirListImgNumber = document.querySelector("#select-dirListImgNumber") as HTMLInputElement;
            switch_dirListEnabled.checked = config.settings["layout"]["dirListEnabled"];//啟用 資料夾預覽列表
            switch_dirListShowNo.checked = config.settings["layout"]["dirListShowNo"];//顯示編號
            switch_dirListShowName.checked = config.settings["layout"]["dirListShowName"];//顯示檔名
            select_dirListImgNumber.value = config.settings["layout"]["dirListImgNumber"] + "";//圖片數量

            switch_dirListEnabled.addEventListener("change", () => {//啟用 資料夾預覽列表
                let val = switch_dirListEnabled.checked;
                config.settings["layout"]["dirListEnabled"] = val;
                appleSettingOfMain();
            });
            switch_dirListShowNo.addEventListener("change", () => {//顯示編號
                let val = switch_dirListShowNo.checked;
                config.settings["layout"]["dirListShowNo"] = val;
                appleSettingOfMain();
            });
            switch_dirListShowName.addEventListener("change", () => {//顯示檔名
                let val = switch_dirListShowName.checked;
                config.settings["layout"]["dirListShowName"] = val;
                appleSettingOfMain();
            });
            select_dirListImgNumber.addEventListener("change", () => {//圖片數量
                let val = Number(select_dirListImgNumber.value);
                config.settings["layout"]["dirListImgNumber"] = val;
                appleSettingOfMain();
            });
        })

        // 圖片 dpi
        addLoadEvent(() => {
            var select_imageDpizoom = document.querySelector("#select-imageDpizoom") as HTMLInputElement;
            select_imageDpizoom.value = config.settings["image"]["dpizoom"];

            select_imageDpizoom.addEventListener("change", () => {
                let val = select_imageDpizoom.value;
                config.settings["image"]["dpizoom"] = val;
                appleSettingOfMain();
            });
        })

        // 圖片 縮放模式
        addLoadEvent(() => {
            var select_tieefseeviewImageRendering = document.querySelector("#select-tieefseeviewImageRendering") as HTMLInputElement;
            select_tieefseeviewImageRendering.value = config.settings["image"]["tieefseeviewImageRendering"];

            select_tieefseeviewImageRendering.addEventListener("change", () => {
                let val = select_tieefseeviewImageRendering.value;
                config.settings["image"]["tieefseeviewImageRendering"] = val;
                appleSettingOfMain();
            });
        })

        //相關路徑
        addLoadEvent(() => {
            var btn_openAppData = document.getElementById("btn-openAppData") as HTMLElement;
            var btn_openWww = document.getElementById("btn-openWww") as HTMLElement;

            //開啟 AppData(使用者資料)
            btn_openAppData.addEventListener("click", async () => {
                let path = await WV_Window.GetAppDataPath();
                WV_RunApp.OpenUrl(path)
            });

            //開啟 www(原始碼)
            btn_openWww.addEventListener("click", async () => {
                let path = await WV_Window.GetAppDirPath();
                path = Lib.Combine([path, "www"]);
                WV_RunApp.OpenUrl(path)
            });
        })

        //清理快取資料
        addLoadEvent(() => {
            var btn_clearBrowserCache = document.getElementById("btn-clearBrowserCache") as HTMLElement;

            btn_clearBrowserCache.addEventListener("click", async () => {
                WV_Window.ClearBrowserCache();
                Msgbox.show({ txt: "快取資料清理完成" });
            });
        })

        //資料夾數量太多時，禁用資料夾預覽列表
        addLoadEvent(() => {
            var select_dirListMaxCount = document.querySelector("#select-dirListMaxCount") as HTMLInputElement;
            select_dirListMaxCount.value = config.settings["advanced"]["dirListMaxCount"] + "";

            select_dirListMaxCount.addEventListener("change", () => {
                let val = Number(select_dirListMaxCount.value);
                config.settings["advanced"]["dirListMaxCount"] = val;
                appleSettingOfMain();
            });
        })

        //圖片面積太大時，禁用高品質縮放
        addLoadEvent(() => {
            var select_highQualityLimit = document.querySelector("#select-highQualityLimit") as HTMLInputElement;
            select_highQualityLimit.value = config.settings["advanced"]["highQualityLimit"] + "";

            select_highQualityLimit.addEventListener("change", () => {
                let val = Number(select_highQualityLimit.value);
                config.settings["advanced"]["highQualityLimit"] = val;
                appleSettingOfMain();
            });
        })

        //進階設定 Port 
        addLoadEvent(() => {

            var txt_startPort = document.querySelector("#text-startPort") as HTMLInputElement;
            var txt_serverCache = document.querySelector("#text-serverCache") as HTMLInputElement;

            setRadio("[name='radio-startType']", appInfo.startType.toString())
            txt_startPort.value = appInfo.startPort.toString();
            txt_serverCache.value = appInfo.serverCache.toString();

            //關閉視窗前觸發
            baseWindow.closingEvents.push(async () => {
                //儲存 start.ini
                let startPort = parseInt(txt_startPort.value);
                let startType: any = getRadio("[name='radio-startType']");
                let serverCache = parseInt(txt_serverCache.value);

                if (isNaN(startPort)) { startPort = 4876; }
                if (startPort > 65535) { startPort = 65535; }
                if (startPort < 1024) { startPort = 1024; }

                if (startType.search(/^[1|2|3|4|5]$/) !== 0) { startType = 2; }
                startType = parseInt(startType);

                if (isNaN(serverCache)) { serverCache = 0; }
                if (serverCache > 31536000) { serverCache = 31536000; }
                if (serverCache < 0) { serverCache = 0; }

                await WV_Window.SetStartIni(startPort, startType, serverCache);
            });
        })


        /** 
         * dom 交換順序
         */
        function swapDom(a: Element, b: Element) {
            if (a.parentNode === null || b.parentNode === null) { return; }
            if (a == b) { return }
            var aParent = a.parentNode;
            var bParent = b.parentNode;
            var aHolder = document.createElement("div");
            var bHolder = document.createElement("div");
            aParent.replaceChild(aHolder, a);
            bParent.replaceChild(bHolder, b);
            aParent.replaceChild(b, aHolder);
            bParent.replaceChild(a, bHolder);
        }


        /**
         * 將設定套用至 mainwiwndow
         */
        function appleSettingOfMain() {
            WV_Window.RunJsOfParent(`mainWindow.applySetting(${JSON.stringify(config.settings)})`);
        }


        /**
         * 儲存設定(關閉視窗時呼叫)
         */
        async function saveSetting() {

            appleSettingOfMain();//將設定套用至 mainwiwndow

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
