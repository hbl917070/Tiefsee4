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
/**
 * 開啟檔案
 */
class FileLoad {
    constructor(M) {
        var arWaitingList = []; //待載入名單
        var flag; //目前在哪一張圖片
        var sortType = FileSortType.name; //排序方式
        //img=圖片  pdf=pdf、ai  movie=影片  frames=多幀圖片  txt=文字
        var groupType = "img";
        this.getArray = () => { return arWaitingList; };
        this.loadFile = loadFile;
        this.loadFiles = loadFiles;
        this.next = next;
        this.prev = prev;
        this.getFilePath = getFilePath;
        this.getGroupType = getGroupType;
        this.setGroupType = setGroupType;
        function loadFiles(DirPath, ar = []) {
            return __awaiter(this, void 0, void 0, function* () {
                arWaitingList = [];
                /*if (await WV_File.Exists(DirPath) === true) {
                    DirPath = await WV_Path.GetDirectoryName(DirPath);
                }*/
                if (ar.length > 0) {
                    for (let i = 0; i < ar.length; i++) {
                        let item = ar[i];
                        let filePath = yield WV_Path.Combine([DirPath, item]);
                        if (yield WV_File.Exists(filePath)) { //如果是檔案
                            arWaitingList.push(filePath);
                        }
                        else if (yield WV_Directory.Exists(filePath)) { //如果是資料夾
                            let arFile = yield WV_Directory.GetFiles(filePath, "*.*"); //取得資料夾內所有檔案
                            for (let j = 0; j < arFile.length; j++) {
                                arWaitingList.push(arFile[j]);
                            }
                        }
                    }
                }
                let path = arWaitingList[0]; //以拖曳進來的第一個檔案為開啟對象
                //arWaitingList = await filter();
                arWaitingList = yield sort(sortType);
                //目前檔案位置
                flag = 0;
                for (let i = 0; i < arWaitingList.length; i++) {
                    if (arWaitingList[i] == path) {
                        flag = i;
                        break;
                    }
                }
                show();
            });
        }
        function loadFile(path) {
            return __awaiter(this, void 0, void 0, function* () {
                arWaitingList = [];
                if ((yield WV_Directory.Exists(path)) === true) { //如果是資料夾
                    arWaitingList = yield WV_Directory.GetFiles(path, "*.*"); //取得資料夾內所有檔案
                    arWaitingList = yield sort(sortType);
                    groupType = yield fileToGroupType(arWaitingList[0]);
                    arWaitingList = yield filter();
                }
                else if ((yield WV_File.Exists(path)) === true) { //如果是檔案
                    let p = yield WV_Path.GetDirectoryName(path); //取得檔案所在的資料夾路徑
                    arWaitingList = yield WV_Directory.GetFiles(p, "*.*");
                    groupType = yield fileToGroupType(path);
                    arWaitingList = yield filter();
                    arWaitingList = yield sort(sortType);
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
            });
        }
        function getFilePath() {
            var p = arWaitingList[flag];
            return p;
        }
        function show(_flag) {
            return __awaiter(this, void 0, void 0, function* () {
                if (_flag !== undefined) {
                    flag = _flag;
                }
                // M.fileShow.loadurl()
                if (groupType == GroupType.img) {
                    M.fileShow.openImage(getFilePath());
                }
                if (groupType == GroupType.pdf) {
                    let imgurl = "/api/getpdf/" + encodeURIComponent(getFilePath());
                    M.fileShow.openPdf(imgurl);
                }
                let title = `「${flag + 1}/${arWaitingList.length}」 ${yield WV_Path.GetFileName(getFilePath())}`;
                baseWindow.setTitle(title);
            });
        }
        /**
         * 載入下一個檔案
         */
        function next() {
            return __awaiter(this, void 0, void 0, function* () {
                flag += 1;
                if (flag >= arWaitingList.length) {
                    flag = 0;
                }
                show();
            });
        }
        /**
         * 載入上一個檔案
         */
        function prev() {
            return __awaiter(this, void 0, void 0, function* () {
                flag -= 1;
                if (flag < 0) {
                    flag = arWaitingList.length - 1;
                }
                show();
            });
        }
        /**
         *
         * @returns
         */
        function fileToGroupType(path) {
            return __awaiter(this, void 0, void 0, function* () {
                let fileExt = (yield WV_Path.GetExtension(path)).toLocaleLowerCase();
                for (var type in GroupType) {
                    for (let j = 0; j < allowFileType(type).length; j++) {
                        const fileType = allowFileType(type)[j];
                        if (fileExt == "." + fileType["ext"]) {
                            return type;
                        }
                    }
                }
                return "";
            });
        }
        function getGroupType() {
            return groupType;
        }
        function setGroupType(type) {
            groupType = type;
        }
        /**
         * 篩選檔案
         * @returns
         */
        function filter() {
            return __awaiter(this, void 0, void 0, function* () {
                let ar = [];
                for (let i = 0; i < arWaitingList.length; i++) {
                    let path = arWaitingList[i];
                    let fileExt = (yield WV_Path.GetExtension(path)).toLocaleLowerCase();
                    for (let j = 0; j < allowFileType(groupType).length; j++) {
                        const fileType = allowFileType(groupType)[j];
                        if (fileExt == "." + fileType["ext"]) {
                            ar.push(path);
                            break;
                        }
                    }
                }
                return ar;
            });
        }
        /**
         * 排序檔案
         * @param _type 排序類型
         * @returns 排序後的陣列
         */
        function sort(_type) {
            return __awaiter(this, void 0, void 0, function* () {
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
            });
        }
    }
}
const GroupType = {
    img: "img",
    pdf: "pdf",
    movie: "movie",
    frames: "frames",
    txt: "txt"
};
function allowFileType(type) {
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
        ];
    }
    if (type === GroupType.pdf) {
        return [
            { ext: "pdf", type: ["pdf"] },
            { ext: "ai", type: ["pdf"] },
        ];
    }
    return [];
}
/**
 * 排序類型
 */
var FileSortType;
(function (FileSortType) {
    /** 檔名自然排序 */
    FileSortType[FileSortType["name"] = 0] = "name";
    /** 檔名自然排序(逆) */
    FileSortType[FileSortType["nameDesc"] = 1] = "nameDesc";
    /** 修改時間排序 */
    FileSortType[FileSortType["editDate"] = 2] = "editDate";
    /** 修改時間排序(逆) */
    FileSortType[FileSortType["editDateDesc"] = 3] = "editDateDesc";
})(FileSortType || (FileSortType = {}));
