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
class FileShow {
    constructor(M) {
        var tv;
        this.load = load;
        this.loadurl = loadurl;
        tv = new Tieefseeview(document.querySelector('#tiefseeview'));
        loadurl("https://wall.bahamut.com.tw/B/40/5328257e8d00594e61f8b815d505cab3_4080425.JPG");
        function load(path) {
        }
        function loadurl(_url) {
            return __awaiter(this, void 0, void 0, function* () {
                //let _url = ;
                yield tv.loadImg(_url);
                tv.transformRefresh(false);
                tv.zoomFull(TieefseeviewZoomType['full-100%']);
                $('#output-size').html(`${tv.getOriginalWidth()} , ${tv.getOriginalHeight()}`);
            });
        }
    }
}
