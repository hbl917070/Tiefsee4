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
class WaitingList {
    constructor(M) {
        var ar = [];
        this.getArray = () => { return ar; };
        this.init = init;
        function init(path) {
            return __awaiter(this, void 0, void 0, function* () {
                if ((yield WV_Directory.Exists(path)) === true) {
                    ar = WV_Directory.GetFiles(path, "*.*");
                }
                else if ((yield WV_File.Exists(path)) === true) {
                    let p = yield WV_Path.GetDirectoryName(path);
                    ar = WV_Directory.GetFiles(p, "*.*");
                }
                else {
                    ar = [];
                }
            });
        }
    }
}
