
/**
 * 開啟檔案
 */
class FileLoad {

    public getArray: () => string[];
    public loadFile;
    public loadFiles;

    public next;
    public prev;
    public getFilePath;
    public getGroupType;
    public setGroupType;


    constructor(M: MainWindow) {


        var arWaitingList: string[] = [];//待載入名單
        var flag: number;//目前在哪一張圖片
        var sortType = FileSortType.name;//排序方式

        //img=圖片  pdf=pdf、ai  movie=影片  frames=多幀圖片  txt=文字
        var groupType: string = "img";



        this.getArray = () => { return arWaitingList; };
        this.loadFile = loadFile;
        this.loadFiles = loadFiles;
        this.next = next;
        this.prev = prev;
        this.getFilePath = getFilePath;
        this.getGroupType = getGroupType;
        this.setGroupType = setGroupType;

        async function loadFiles(DirPath: string, ar: string[] = []) {

            arWaitingList = [];

            /*if (await WV_File.Exists(DirPath) === true) {
                DirPath = await WV_Path.GetDirectoryName(DirPath);
            }*/

            if (ar.length > 0) {
                for (let i = 0; i < ar.length; i++) {
                    let item = ar[i];
                    let filePath = await WV_Path.Combine([DirPath, item]);
                    if (await WV_File.Exists(filePath)) {//如果是檔案
                        arWaitingList.push(filePath);

                    } else if (await WV_Directory.Exists(filePath)) {//如果是資料夾
                        let arFile = await WV_Directory.GetFiles(filePath, "*.*");//取得資料夾內所有檔案
                        for (let j = 0; j < arFile.length; j++) {
                            arWaitingList.push(arFile[j]);
                        }
                    }
                }
            }

            let path = arWaitingList[0];//以拖曳進來的第一個檔案為開啟對象

            //arWaitingList = await filter();
            arWaitingList = await sort(sortType);


            //目前檔案位置
            flag = 0;
            for (let i = 0; i < arWaitingList.length; i++) {
                if (arWaitingList[i] == path) {
                    flag = i;
                    break;
                }
            }

            show();

        }





        async function loadFile(path: string) {

            arWaitingList = [];

            if (await WV_Directory.Exists(path) === true) {//如果是資料夾

                arWaitingList = await WV_Directory.GetFiles(path, "*.*");//取得資料夾內所有檔案


                arWaitingList = await sort(sortType);
                groupType = await fileToGroupType(arWaitingList[0])
                arWaitingList = await filter();

            } else if (await WV_File.Exists(path) === true) {//如果是檔案

                let p: string = await WV_Path.GetDirectoryName(path);//取得檔案所在的資料夾路徑
                arWaitingList = await WV_Directory.GetFiles(p, "*.*");

                groupType = await fileToGroupType(path)

                arWaitingList = await filter();
                arWaitingList = await sort(sortType);
            }



            //目前檔案位置
            flag = 0;
            for (let i = 0; i < arWaitingList.length; i++) {
                if (arWaitingList[i] == path) {
                    flag = i;
                    break;
                }
            }

            show();
        }




        function getFilePath() {
            var p = arWaitingList[flag];
            return p;
        }

        async function show(_flag?: number) {

            if (_flag !== undefined) { flag = _flag; }

            // M.fileShow.loadurl()
            if (groupType == GroupType.img) {
                M.fileShow.openImage(getFilePath())

            }

            if (groupType == GroupType.pdf) {
                let imgurl = "/api/getpdf/" + encodeURIComponent(getFilePath())
                M.fileShow.openPdf(imgurl)
            }

            let title = `「${flag + 1}/${arWaitingList.length}」 ${await WV_Path.GetFileName(getFilePath())}`;
            baseWindow.setTitle(title);
        }

        /**
         * 載入下一個檔案
         */
        async function next() {

            flag += 1;
            if (flag >= arWaitingList.length) { flag = 0; }
            show();
        }


        /**
         * 載入上一個檔案
         */
        async function prev() {

            flag -= 1;
            if (flag < 0) { flag = arWaitingList.length - 1; }

            show();

        }






        /**
         * 
         * @returns 
         */
        async function fileToGroupType(path: string) {

            let fileExt = (await WV_Path.GetExtension(path)).toLocaleLowerCase();

            for (var type in GroupType) {
                for (let j = 0; j < allowFileType(type).length; j++) {
                    const fileType = allowFileType(type)[j];
                    if (fileExt == "." + fileType["ext"]) {
                        return type;
                    }
                }
            }

            return ""
        }

        function getGroupType() {
            return groupType;
        }
        function setGroupType(type: string) {
            groupType = type;
        }

        /**
         * 篩選檔案
         * @returns 
         */
        async function filter() {

            let ar = [];

            for (let i = 0; i < arWaitingList.length; i++) {

                let path = arWaitingList[i];
                let fileExt = (await WV_Path.GetExtension(path)).toLocaleLowerCase();

                for (let j = 0; j < allowFileType(groupType).length; j++) {
                    const fileType = allowFileType(groupType)[j];
                    if (fileExt == "." + fileType["ext"]) {
                        ar.push(path);
                        break;
                    }
                }
            }

            return ar;

        }


        /**
         * 排序檔案
         * @param _type 排序類型
         * @returns 排序後的陣列
         */
        async function sort(_type: FileSortType): Promise<string[]> {

            //檔名自然排序
            if (_type === FileSortType.name) {
                return arWaitingList.sort(function (a, b) {
                    return a.localeCompare(b, undefined, {
                        numeric: true,
                        sensitivity: 'base'
                    });
                });
            }

            //檔名自然排序(逆)
            if (_type === FileSortType.nameDesc) {
                return arWaitingList.sort(function (a, b) {
                    return -1 * a.localeCompare(b, undefined, {
                        numeric: true,
                        sensitivity: 'base'
                    });
                });
            }


            return [];
        }



    }

}

const GroupType = {
    img: "img",
    pdf: "pdf",
    movie: "movie",
    frames: "frames",
    txt: "txt"
}



function allowFileType(type: string) {

    if (type === GroupType.img) {
        return [
            { ext: "jpg", type: ["image"] },
            { ext: "png", type: ["image"] },
            { ext: "gif", type: ["image"] },
            { ext: "bmp", type: ["image"] },
            { ext: "webp", type: ["image"] },
            { ext: "jpeg", type: ["image"] },
            { ext: "tif", type: ["image"] },
            { ext: "svg", type: ["image"] },
            { ext: "", type: ["image"] },
            { ext: "", type: ["image"] },
            { ext: "", type: ["image"] },
            { ext: "", type: ["image"] },
        ]
    }

    if (type === GroupType.pdf) {
        return [
            { ext: "pdf", type: ["pdf"] },
            { ext: "ai", type: ["pdf"] },
        ]
    }

    return []
}






/**
 * 排序類型
 */
enum FileSortType {

    /** 檔名自然排序 */
    "name",

    /** 檔名自然排序(逆) */
    "nameDesc",

    /** 修改時間排序 */
    "editDate",

    /** 修改時間排序(逆) */
    "editDateDesc",
}

