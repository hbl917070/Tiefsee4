



class MainWindow {

    public dom_tools: HTMLDivElement;

    //public waitingList: WaitingList;

    public config;
    public fileLoad;
    public fileShow;
    public menu;

    constructor() {

        baseWindow = new BaseWindow();//初始化視窗

        var dom_tools = <HTMLDivElement>document.getElementById("main-tools");

        var config = new Config(this);
        var fileLoad = new FileLoad(this);
        var fileShow = new FileShow(this);
        var menu = new Menu(this);
        new InitMenu(this);

        this.dom_tools = dom_tools;
        this.fileLoad = fileLoad;
        this.fileShow = fileShow;
        this.menu = menu;
        this.config = config;


        new MainTools(this);
        init();


        async function init() {

            initDomImport();

            //取得命令列參數
            let args = await WV_Window.GetArguments()
            if (args.length === 0) {
                fileShow.openWelcome();

            } else if (args.length === 1) {
                fileLoad.loadFile(args[0]);
            } else {
                fileLoad.loadFiles(args[0], args);
            }


            //封鎖原生右鍵選單
            document.addEventListener('contextmenu', function (e) {
                e.preventDefault();
            })


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
            Lib.AddEventDblclick(baseWindow.dom_titlebarTxt, async () => {//標題列
                let WindowState = baseWindow.windowState
                if (WindowState === "Maximized") {
                    baseWindow.normal();
                } else {
                    baseWindow.maximized();
                }
            });
            Lib.AddEventDblclick(dom_tools, async (e) => {//工具列
                //如果是按鈕就不雙擊全螢幕
                let _dom = e.target as HTMLDivElement;
                if (_dom) {
                    if (_dom.classList.contains("js-noDrag")) { return; }
                }

                let WindowState = baseWindow.windowState
                if (WindowState === "Maximized") {
                    baseWindow.normal();
                } else {
                    baseWindow.maximized();
                }
            });
            Lib.AddEventDblclick(fileShow.dom_image, async () => {//圖片物件

                let WindowState = baseWindow.windowState
                if (WindowState === "Maximized") {
                    baseWindow.normal();
                } else {
                    baseWindow.maximized();
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
                let _dropPath = await baseWindow.GetDropPath();
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




    }
}






