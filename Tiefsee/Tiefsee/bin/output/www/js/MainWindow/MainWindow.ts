



class MainWindow {

    public dom_tools: HTMLElement;
    public dom_maxBtnLeft: HTMLElement;
    public dom_maxBtnRight: HTMLElement;

    //public waitingList: WaitingList;

    public config;
    public fileLoad;
    public fileShow;
    public menu;
    public script;
    public readSetting;

    constructor() {

        baseWindow = new BaseWindow();//初始化視窗

        var dom_tools = <HTMLElement>document.getElementById("main-tools");
        var dom_maxBtnLeft = <HTMLElement>document.getElementById("maxBtnLeft");
        var dom_maxBtnRight = <HTMLElement>document.getElementById("maxBtnRight");

        var config = new Config();
        var fileLoad = new FileLoad(this);
        var fileShow = new FileShow(this);
        var menu = new Menu(this);
        var script = new Script(this);
        new InitMenu(this);

        this.dom_tools = dom_tools;
        this.dom_maxBtnLeft = dom_maxBtnLeft;
        this.dom_maxBtnRight = dom_maxBtnRight;

        this.fileLoad = fileLoad;
        this.fileShow = fileShow;
        this.menu = menu;
        this.config = config;
        this.script = script;
        this.readSetting = readSetting;

        new MainTools(this);
        init();



        async function init() {

            initDomImport();

            //讀取設定
            await getSettingFile();
            readSetting(config.settings);


            WV_Window.SetSize(600 * window.devicePixelRatio, 500 * window.devicePixelRatio);//初始化視窗大小
            WV_Window.SetMinimumSize(250 * window.devicePixelRatio, 250 * window.devicePixelRatio);//設定視窗最小size
            WV_Window.ShowWindow();//顯示視窗

            if (config.settings["theme"]["aero"]) {
                WV_Window.SetAERO();// aero毛玻璃效果
            }

            //取得命令列參數
            let args = await WV_Window.GetArguments()
            if (args.length === 0) {
                fileShow.openWelcome();
            } else if (args.length === 1) {
                fileLoad.loadFile(args[0]);//載入單張圖片
            } else {
                fileLoad.loadFiles(args[0], args);//載入多張圖片
            }

            //設定icon
            async function initIcon() {
                let path = Lib.Combine([await WV_Window.GetAppDirPath(), "www\\img\\logo.ico"]);
                WV_Window.SetIcon(path);
            }
            initIcon();

            //大型換頁按鈕
            dom_maxBtnLeft.addEventListener('click', function (e) {
                script.fileLoad.prev();
            })
            dom_maxBtnRight.addEventListener('click', function (e) {
                script.fileLoad.next();
            })

            //封鎖原生右鍵選單
            document.addEventListener('contextmenu', function (e) {
                e.preventDefault();
            })


            //關閉視窗前觸發
            baseWindow.closingEvents.push(async () => {
                if (script.steting.temp_setting != null) {//如果有開啟 設定視窗
                    if (await script.steting.temp_setting.Visible === true) {
                        await script.steting.temp_setting.RunJs("setting.saveData();");//關閉前先儲存設定
                        await sleep(30);// js無法呼叫C#的非同步函數，所以必須加上延遲，避免執行js前程式就被關閉
                    }
                }
            });



            //圖片區域也允許拖曳視窗
            fileShow.dom_image.addEventListener("mousedown", async (e) => {
                //圖片沒有出現捲動軸
                if (fileShow.view_image.getIsOverflowX() === false && fileShow.view_image.getIsOverflowY() === false) {
                    if (e.button === 0) {//滑鼠左鍵
                        let WindowState = baseWindow.windowState;
                        if (WindowState === "Normal") {
                            WV_Window.WindowDrag("move");
                        }
                    }
                }
            });

            //double click 最大化或視窗化
            Lib.addEventDblclick(dom_tools, async (e) => {//工具列
                //如果是按鈕就不雙擊全螢幕
                let _dom = e.target as HTMLDivElement;
                if (_dom) {
                    if (_dom.classList.contains("js-noDrag")) { return; }
                }

                let WindowState = baseWindow.windowState
                if (WindowState === "Maximized") {
                    baseWindow.normal();
                } else {
                    setTimeout(() => {
                        baseWindow.maximized();
                    }, 50);
                }
            });
            Lib.addEventDblclick(fileShow.dom_image, async () => {//圖片物件
                let WindowState = baseWindow.windowState
                if (WindowState === "Maximized") {
                    baseWindow.normal();
                } else {
                    setTimeout(() => {
                        baseWindow.maximized();
                    }, 50);
                }
            });
            Lib.addEventDblclick(fileShow.dom_welcomeview, async () => {//歡迎頁面
                let WindowState = baseWindow.windowState
                if (WindowState === "Maximized") {
                    baseWindow.normal();
                } else {
                    setTimeout(() => {
                        baseWindow.maximized();
                    }, 50);
                }
            });

            //讓工具列允許拖曳視窗
            dom_tools.addEventListener("mousedown", async (e) => {
                let _dom = e.target as HTMLDivElement;
                if (_dom) {
                    if (_dom.classList.contains("js-noDrag")) { return; }
                }
                if (e.button === 0) {//滑鼠左鍵
                    await WV_Window.WindowDrag("move");
                }
            });

            //在工具列滾動時，進行水平移動
            dom_tools.addEventListener("mousewheel", (e: WheelEventInit) => {

                let scrollLeft = dom_tools.scrollLeft;
                let deltaY: number = 0;//上下滾動的量
                if (e.deltaY) { deltaY = e.deltaY }

                if (deltaY > 0) {//往右
                    dom_tools.scroll(scrollLeft + 20, 0)
                }
                if (deltaY < 0) {//往左
                    dom_tools.scroll(scrollLeft - 20, 0)
                }
            }, false)



            //讓歡迎畫面允許拖曳視窗
            fileShow.dom_welcomeview.addEventListener("mousedown", async (e) => {

                //排除不允許拖拉的物件
                let _dom = e.target as HTMLDivElement;
                if (_dom) {
                    if (_dom.classList.contains("js-noDrag")) { return; }
                }
                e.preventDefault();

                if (e.button === 0) {//滑鼠左鍵
                    let WindowState = baseWindow.windowState;
                    if (WindowState === "Normal") {
                        WV_Window.WindowDrag("move");
                    }
                }
            });

            window.addEventListener("dragenter", dragenter, false);
            window.addEventListener("dragover", dragover, false);
            window.addEventListener('drop', drop, false);

            function dragenter(e: DragEvent) {
                e.stopPropagation();
                e.preventDefault();
            }

            function dragover(e: DragEvent) {
                e.stopPropagation();
                e.preventDefault();
            }
            async function drop(e: DragEvent) {

                if (e.dataTransfer === null) { return; }

                let files = e.dataTransfer.files;
                //console.log(files);

                //取得拖曳進來的檔案路徑
                let _dropPath = await baseWindow.getDropPath();
                if (_dropPath === "") { return; }


                if (files.length > 1) {
                    let arFile = [];
                    for (let i = 0; i < files.length; i++) {
                        const item = files[i];
                        arFile.push(item.name);
                    }
                    _dropPath = await WV_Path.GetDirectoryName(_dropPath);
                    await fileLoad.loadFiles(_dropPath, arFile);
                } else {

                    await fileLoad.loadFile(_dropPath);
                }

                e.stopPropagation();
                e.preventDefault();

            }

        }



        function readSetting(setting: any) {

            //@ts-ignore
            config.settings = setting;

            //-----------

            let dpizoom = Number(config.settings["image"]["dpizoom"]);
            if (dpizoom == -1 || isNaN(dpizoom)) {
                //dpizoom = baseWindow.dpiX;
                dpizoom = -1;
            }
            fileShow.view_image.setDpizoom(dpizoom);


            let tieefseeviewImageRendering = Number(config.settings["image"]["tieefseeviewImageRendering"]);
            fileShow.view_image.setRendering(tieefseeviewImageRendering);

            //-----------

            var cssRoot = document.documentElement;

            cssRoot.style.setProperty("--window-border-radius", config.settings.theme["--window-border-radius"] + "px");

            initColor("--color-window-background", true);
            initColor("--color-window-border", true);
            initColor("--color-white");
            initColor("--color-black");
            initColor("--color-blue");
            //initColor("--color-grey");


            function initColor(name: string, opacity: boolean = false) {
                //@ts-ignore
                let c = config.settings.theme[name];

                if (opacity) {
                    cssRoot.style.setProperty(name, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a} )`);
                } else {
                    for (let i = 1; i < 9; i++) {
                        cssRoot.style.setProperty(name + `${i}0`, `rgba(${c.r}, ${c.g}, ${c.b}, ${(i / 10)} )`)
                    }
                    cssRoot.style.setProperty(name, `rgba(${c.r}, ${c.g}, ${c.b}, 1 )`);
                }
            }


        }


        /**
         * 讀取設定
         */
        async function getSettingFile() {
            let s = JSON.stringify(config.settings, null, '\t');
            var path = Lib.Combine([await WV_Window.GetAppDirPath(), "www\\userData"])
            if (await WV_Directory.Exists(path) === false) {
                await WV_Directory.CreateDirectory(path);
            }
            path = Lib.Combine([path, "setting.json"]);

            let txt = await WV_File.GetText(path);
            let json = JSON.parse(txt);
            config.settings = json;
        }

    }
}






