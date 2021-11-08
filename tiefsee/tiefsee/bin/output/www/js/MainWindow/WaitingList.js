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
        this.getArray = () => { return arWaitingList; };
        this.loadFile = loadFile;
        this.loadFiles = loadFiles;
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
                        if (yield WV_File.Exists(filePath)) {
                            arWaitingList.push(filePath);
                        }
                    }
                }
                flag = 0;
                show();
            });
        }
        function loadFile(path) {
            return __awaiter(this, void 0, void 0, function* () {
                arWaitingList = [];
                if ((yield WV_Directory.Exists(path)) === true) {
                    arWaitingList = yield WV_Directory.GetFiles(path, "*.*");
                }
                else if ((yield WV_File.Exists(path)) === true) {
                    let p = yield WV_Path.GetDirectoryName(path);
                    arWaitingList = yield WV_Directory.GetFiles(p, "*.*");
                }
                flag = 0;
                show();
            });
        }
        function show(_flag) {
            return __awaiter(this, void 0, void 0, function* () {
                if (_flag !== undefined) {
                    flag = _flag;
                }
            });
        }
        function next() {
            return __awaiter(this, void 0, void 0, function* () {
                flag += 1;
                if (flag >= arWaitingList.length) {
                    flag = 0;
                }
            });
        }
        function Prev() {
            return __awaiter(this, void 0, void 0, function* () {
                flag -= 1;
                if (flag < 0) {
                    flag = arWaitingList.length - 1;
                }
            });
        }
        function loadurl(_url) {
            return __awaiter(this, void 0, void 0, function* () {
                //let _url = ;
                //  await M.tv.loadImg(_url);
                //  tv.transformRefresh(false)
                //  tv.zoomFull(TieefseeviewZoomType['full-100%']);
                //  $('#output-size').html(`${tv.getOriginalWidth()} , ${tv.getOriginalHeight()}`);
            });
        }
    }
}
