



class MainWindow {

    public dom_tools: HTMLDivElement;

    //public waitingList: WaitingList;

    public fileLoad;
    public fileShow;
    public menu;

    constructor() {

        baseWindow = new BaseWindow();//初始化視窗

        var dom_tools = <HTMLDivElement>document.getElementById("main-tools");
        var fileLoad = new FileLoad(this);
        var fileShow = new FileShow(this);
        var menu = new Menu(this)

        this.dom_tools = dom_tools;
        this.fileLoad = fileLoad;
        this.fileShow = fileShow;
        this.menu = menu;

        new MainTools(this);




        loadSvg();


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
            console.log(files);

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



            //console.log(await WV_File.GetFileInfo(_dropPath).Length)
            //console.log(await WV_File.GetCreationTimeUtc(_dropPath))

            //console.log(await WV_Directory.GetFiles(_dropPath, "*.*"))

        }



        /**
         * 載入svg
         */
        async function loadSvg() {

            let ar_domSvg = document.querySelectorAll("[to_dom]");
            for (let i = 0; i < ar_domSvg.length; i++) {
                const _dom = ar_domSvg[i];
                let src = _dom.getAttribute("src");
                if (src != null)
                    await fetch(src, {
                        "method": "get",
                    }).then((response) => {
                        return response.text();
                    }).then((html) => {
                        _dom.outerHTML = html;
                    }).catch((err) => {
                        console.log("error: ", err);
                    });
            }
        }


    }
}






