import { MainWindow } from "./MainWindow";
import { Dragbar } from "./Dragbar";
import { TiefseeScroll } from "../TiefseeScroll";
import { WebAPI } from "../WebAPI";
import { Lib } from "../Lib";

/**
 * 檔案預覽視窗
 */
export class MainFileList {

    public init;
    public select;
    public updateLocation;
    public setStartLocation;
    public setHide;
    public setEnabled;
    public setShowNo;
    public setShowName;
    public setItemWidth;
    public dragbar;

    constructor(M: MainWindow) {

        this.init = init;
        this.select = select;
        this.updateLocation = updateLocation;
        this.setStartLocation = setStartLocation;
        this.setHide = setHide;
        this.setEnabled = setEnabled
        this.setShowNo = setShowNo
        this.setShowName = setShowName
        this.setItemWidth = setItemWidth

        const _domFileList = document.getElementById("main-fileList") as HTMLElement; // 螢幕看得到的區域
        const _domFileListBody = document.getElementById("main-fileListBody") as HTMLElement; // 整體的高
        const _domFileListData = document.getElementById("main-fileListData") as HTMLElement; // 資料
        const _domDragbarMainFileList = document.getElementById("dragbar-mainFileList") as HTMLElement; // 拖曳條

        var _isHide = false; // 暫時隱藏
        var _isEnabled = true; // 啟用 檔案預覽視窗
        var _isShowNo = true; // 顯示編號
        var _isShowName = true; // 顯示檔名
        var _itemWidth = 1; // 單個項目的寬度
        var _itemHeight = 1; // 單個項目的高度

        var _tempLoaded: number[] = []; // 已經載入過的圖片編號
        var _tempStart = 0; // 用於判斷是否需要重新渲染UI
        var _tempCount = 0;
        var _tempItemHeight = 0; // 用於判斷物件高度是否需要更新

        const _sc = new TiefseeScroll(); // 滾動條元件
        _sc.initGeneral(_domFileList, "y");

        // 拖曳改變size
        const _dragbar = this.dragbar = new Dragbar();
        _dragbar.init("right", _domFileList, _domDragbarMainFileList, M.domMainL);
        // 拖曳開始
        _dragbar.setEventStart(() => { })
        // 拖曳
        _dragbar.setEventMove((val: number) => {
            if (val < 10) { // 小於10的話就暫時隱藏
                _domFileList.style.opacity = "0";
                _dragbar.setDragbarPosition(0);
            } else {
                _domFileList.style.opacity = "1";
                setItemWidth(val);
            }
        })
        // 拖曳 結束
        _dragbar.setEventEnd((val: number) => {
            if (val < 10) { // 小於10的話，關閉檔案預覽視窗
                setEnabled(false);
            }
        })

        // 更新畫面
        _domFileList.addEventListener("scroll", () => { // 捲動時
            updateItem()
        })
        new ResizeObserver(() => { // 區塊改變大小時
            updateItem()
        }).observe(_domFileList)

        /**
         * 暫時隱藏(不影響設定值，強制隱藏
         */
        function setHide(val: boolean) {

            if (M.fileLoad.getIsBulkView()) { // 如果當前是大量瀏覽模式
                val = true;
            }

            _isHide = val;
            if (val) {
                _domFileList.setAttribute("hide", "true");
                _dragbar.setEnabled(false);
            } else {
                _domFileList.setAttribute("hide", "");
                _dragbar.setEnabled(M.config.settings.layout.fileListEnabled);
            }
        }

        /**
         * 設定是否啟用
         */
        function setEnabled(val: boolean) {

            if (val) {
                _domFileList.setAttribute("active", "true");
            } else {
                _domFileList.setAttribute("active", "");
            }

            M.config.settings.layout.fileListEnabled = val;
            _dragbar.setEnabled(val);
            _domFileList.style.opacity = "1";

            if (_isEnabled === val) { return; }
            _isEnabled = val;
            _tempStart = -1; // 強制必須重新繪製
            _domFileListData.innerHTML = ""; // 移除之前的所有物件
            updateItem();
            setStartLocation(); // 捲到中間
        }

        /**
         * 設定是否顯示編號
         */
        function setShowNo(val: boolean) {
            if (_isShowNo === val) { return; }
            _isShowNo = val;
            _tempStart = -1; // 強制必須重新繪製
            _domFileListData.innerHTML = ""; // 移除之前的所有物件
            updateItem();
            setStartLocation(); // 捲到中間
        }

        /**
         * 設定是否顯示檔名
         */
        function setShowName(val: boolean) {
            if (_isShowName === val) { return; }
            _isShowName = val;
            _tempStart = -1; // 強制必須重新繪製
            _domFileListData.innerHTML = ""; // 移除之前的所有物件
            updateItem();
            setStartLocation(); // 捲到中間
        }

        /**
         * 設定size
         */
        function setItemWidth(val: number) {

            if (_itemWidth === val) { return; }

            let valMin = 80;
            let valMax = 200;
            if (val <= valMin) { val = valMin; }
            if (val >= valMax) { val = valMax; }

            _itemWidth = val;
            M.config.settings.layout.fileListShowWidth = val;

            const cssRoot = document.body;
            cssRoot.style.setProperty("--fileList-width", val + "px");
            _dragbar.setDragbarPosition(val);

            _tempStart = -1; // 強制必須重新繪製
            updateItem();
            setStartLocation(); // 捲到中間
            // updateLocation()
        }

        /**
         * 刷新UI
         */
        function updateItem() {

            if (_isEnabled === false) {
                _domFileListData.innerHTML = ""; // 移除之前的所有物件
                return;
            }

            let noDelay = _tempStart === -999; // true=首次執行，載入圖片不需要延遲

            // 取得單個項目的高度
            let fileListItem = _domFileListData.querySelector(".fileList-item");
            if (fileListItem === null) {
                newItem(-1, "");
                fileListItem = _domFileListData.querySelector(".fileList-item");
            }

            if (fileListItem !== null) {
                _itemHeight = fileListItem.getBoundingClientRect().height + 6;
            }

            // 重新計算整體的高度
            if (_tempItemHeight !== _itemHeight) {
                let arWaitingFile = M.fileLoad.getWaitingFile();
                _domFileListBody.style.height = (arWaitingFile.length * _itemHeight) + 4 + "px";
            }
            _tempItemHeight = _itemHeight;

            let start = Math.floor(_domFileList.scrollTop / _itemHeight) - 1; // 開始位置
            let count = Math.floor(_domFileList.clientHeight / _itemHeight) + 5; // 抓取數量

            if (start < 0) { start = 0 }
            if (_tempStart === start && _tempCount === count) { // 沒變化就離開
                return;
            }
            _tempStart = start;
            _tempCount = count;

            _domFileListData.innerHTML = ""; // 移除之前的所有物件
            _domFileListData.style.marginTop = (start * _itemHeight) + "px";
            let arWaitingFile = M.fileLoad.getWaitingFile();

            let end = start + count;
            if (end > arWaitingFile.length) { end = arWaitingFile.length; }
            for (let i = start; i < end; i++) {
                const path = arWaitingFile[i];
                newItem(i, path, noDelay);
            }

            select();
        }

        /**
         * 產生一個新項目
         * @param i 
         * @param path 
         * @returns 
         */
        function newItem(i: number, path: string, noDelay = false) {

            const name = Lib.getFileName(path); // 檔名

            let htmlImg = "";

            if (_tempLoaded.indexOf(i) === -1 && noDelay === false) { // 第一次載入圖片，延遲30毫秒，避免快速捲動時載入太多圖片
                if (path !== "") {
                    setTimeout(() => {
                        if (_domFileListData.contains(div) === false) { return; } // 如果物件不在網頁上，就不載入圖片

                        _tempLoaded.push(i); // 加到全域變數，表示已經載入過
                        const _url = getImgUrl(path);
                        const domImg = div.getElementsByClassName("fileList-img")[0] as HTMLImageElement;
                        domImg.innerHTML = `<img src="${_url}" fetchpriority="low"/>`;
                    }, 30);
                }
            } else {

                // 圖片已經載入過了，直接顯示
                const imgUrl = getImgUrl(path);
                htmlImg = `<img src="${imgUrl}" fetchpriority="low">`;
            }

            let htmlNo = ``;
            let htmlName = ``;
            if (_isShowNo === true) {
                htmlNo = `<div class="fileList-no">${i + 1}</div>`;
            }
            if (_isShowName === true) {
                htmlName = `<div class="fileList-name">${name}</div>`;
            }

            const div = Lib.newDom(
                `<div class="fileList-item" data-id="${i}">
                    <div class="fileList-title">
                        ${htmlNo} ${htmlName}
                    </div>
                    <div class="fileList-img"> ${htmlImg} </div>                                                            
                </div>`);
            _domFileListData.append(div);
            div.setAttribute("data-path", path);

            // click 載入圖片
            div.addEventListener("click", () => {
                M.fileLoad.showFile(i);
            })

            // 快速拖曳
            Lib.addDragThresholdListener(div, 5, () => {
                M.script.file.dragDropFile(path);
            })

            return div;
        }

        /**
         * 
         */
        function getImgUrl(path: string) {
            if (Lib.getExtension(path) === ".svg") {
                return WebAPI.getFile(path);
            }
            return WebAPI.Img.fileIcon(path);
        }

        /**
         * 檔案預覽視窗初始化 (重新讀取列表
         */
        function init() {
            _tempStart = -999;
            _tempLoaded = [];
            _tempItemHeight = -1;
            updateItem();
        }

        /**
         * 設定 檔案預覽視窗 目前選中的項目
         * @returns 
         */
        function select() {

            if (_isEnabled === false) { return; }

            // 移除上一次選擇的項目
            document.querySelector(`.fileList-item[active=true]`)?.setAttribute("active", "");

            const id = M.fileLoad.getFlagFile(); // 取得id

            const div = document.querySelector(`.fileList-item[data-id="${id}"]`);
            if (div == null) { return; }
            div.setAttribute("active", "true");
        }

        /**
         * 檔案預覽視窗 捲動到選中項目的中間
         */
        function setStartLocation() {

            if (_isEnabled === false) { return; }

            const id = M.fileLoad.getFlagFile(); // 取得id
            const f = (_domFileList.clientHeight - _itemHeight) / 2 - 0; // 計算距離中心的距離
            _domFileList.scrollTop = id * _itemHeight - f;
        }

        /**
         * 檔案預覽視窗 自動捲動到選中項目的地方
         */
        function updateLocation() {

            if (_isEnabled === false) { return; }

            const id = M.fileLoad.getFlagFile(); // 取得id

            // 如果選中的項目在上面
            const start = Math.floor(_domFileList.scrollTop / _itemHeight); // 開始位置
            if (id <= start) {
                _domFileList.scrollTop = id * _itemHeight;
                return;
            }

            // 如果選中的項目在下面
            const count = Math.floor(_domFileList.clientHeight / _itemHeight); // 抓取數量
            const end = (id - count + 1) * _itemHeight - (_domFileList.clientHeight % _itemHeight) + 3;
            if (_domFileList.scrollTop < end) {
                _domFileList.scrollTop = end;
            }
        }

    }
}
