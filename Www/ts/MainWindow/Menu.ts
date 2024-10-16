import { Lib } from "../Lib";
import { MainWindow } from "./MainWindow";

export class Menu {

    public openAtButton;
    public openAtMouse;
    public openAtPoint;
    public openAtOrigin;
    public close;
    public getIsShow;

    constructor(M: MainWindow) {

        this.openAtButton = openAtButton;
        this.openAtMouse = openAtMouse;
        this.openAtPoint = openAtPoint;
        this.openAtOrigin = openAtOrigin;
        this.getIsShow = getIsShow;
        this.close = close;

        var _tempCloseList: any[] = []; // 記錄所有被開過的menu
        var _mouseX = 0;
        var _mouseY = 0;

        document.body.addEventListener("mouseup", (e) => {
            _mouseX = e.x;
            _mouseY = e.y;
        });

        /**
         * 判斷目前是否有開啟選單
         */
        function getIsShow() {
            return _tempCloseList.length > 0;
        }

        /**
         * 關閉 menu
         */
        function close() {
            for (let i = 0; i < _tempCloseList.length; i++) {
                _tempCloseList[i]();
            }
        }

        /**
         * 
         * @param domMenu 
         * @param _funcPosition 定位用的函數
         * @param _funcClose 關閉時呼叫的函數
         * @returns 
         */
        function openBase(domMenu: HTMLElement | null, _funcPosition: () => void, _funcClose: () => void) {

            if (domMenu === null) { return; }

            let domMenuBg = domMenu.parentNode as HTMLElement;
            if (domMenuBg === null) { return; }

            M.updateDomVisibility(); // 更新元素顯示或隱藏

            domMenuBg.setAttribute("active", "true");
            domMenu.style.bottom = ""; // 避免高度計算錯誤

            _funcPosition();

            const funcClose = () => {
                domMenuBg.setAttribute("active", ""); // 關閉menu
                _tempCloseList = _tempCloseList.filter((item) => {
                    return item !== funcClose;
                });
                domMenuBg.removeEventListener("touchstart", onmousedown);
                domMenuBg.removeEventListener("mousedown", onmousedown);
                _funcClose();
            }
            _tempCloseList.push(funcClose);

            const onmousedown = (sender: TouchEvent | MouseEvent) => {
                let dom = sender.target as HTMLElement;
                let isScroll = Lib.isScrollbarVisible(domMenu); // 判斷是否有捲軸
                if (
                    dom.classList.contains("menu") // 透明背景
                    || (isScroll === false && dom.classList.contains("menu-content")) // 避免出現捲動條後，無法點擊捲動條
                ) {
                    sender.preventDefault();
                    funcClose(); // 關閉menu
                }
            }
            domMenuBg.addEventListener("touchstart", onmousedown);
            domMenuBg.addEventListener("mousedown", onmousedown);

            // 在非選單的區域捲動，就關閉選單
            domMenuBg.onwheel = (sender) => {
                const dom = sender.target as HTMLElement;
                const isScroll = Lib.isScrollbarVisible(domMenu); // 判斷是否有捲軸
                if (dom.classList.contains("menu") ||// 透明背景
                    (isScroll === false && dom.classList.contains("menu-content")) // 避免出現捲動條後，無法點擊捲動條
                ) {
                    funcClose(); // 關閉menu
                }
            }
        }

        /**
         * 開啟 - 下拉選單
         * @param domMenu 
         * @param domBtn 
         * @param css 
         */
        function openAtButton(domMenu: HTMLElement | null, domBtn: HTMLElement | null, css: string) {
            if (domMenu === null) { return; }
            if (domBtn === null) { return; }

            const funcPosition = () => {
                let left = 0;
                let top = 0;
                top = domBtn.getBoundingClientRect().top + domBtn.getBoundingClientRect().height;
                left = domBtn.getBoundingClientRect().left + (domBtn.getBoundingClientRect().width / 2) - (domMenu.getBoundingClientRect().width / 2);
                if (left < 0) { left = 0; }
                if (left > document.body.getBoundingClientRect().width - domMenu.getBoundingClientRect().width) {
                    left = document.body.getBoundingClientRect().width - domMenu.getBoundingClientRect().width;
                }

                domMenu.style.left = left + "px";
                domMenu.style.top = top + "px";
                domMenu.style.bottom = "0";
                domBtn.classList.add(css);
            };
            let funcClose = () => {
                domBtn.classList.remove(css);
            };
            openBase(domMenu, funcPosition, funcClose);
        }

        /**
         * 開啟 - 滑鼠右鍵
         */
        function openAtMouse(domMenu: HTMLElement | null, offsetX = 0, offsetY = 0) {

            if (domMenu === null) { return; }

            const funcPosition = () => {
                const menuHeight = domMenu.getBoundingClientRect().height;
                const menuWidth = domMenu.getBoundingClientRect().width;
                const bodyHeight = document.body.getBoundingClientRect().height;
                const bodyWidth = document.body.getBoundingClientRect().width;

                let left = _mouseX;
                let top = _mouseY;

                if (menuWidth + left + offsetX > bodyWidth) {
                    left = left - menuWidth + 10;
                } else {
                    left = left + offsetX;
                }
                if (left < 0) { left = 0; }

                if (menuHeight + top + offsetY > bodyHeight) {
                    // top = top - menuHeight + 5; //在滑鼠上方顯示
                    top = bodyHeight - menuHeight - 5; // 靠齊視窗下面
                } else {
                    top = top + offsetY;
                }
                if (top < 0) { top = 0; }

                domMenu.style.left = left + "px";
                domMenu.style.top = top + "px";
                domMenu.style.bottom = "0";
            };
            let funcClose = () => { };
            openBase(domMenu, funcPosition, funcClose);
        }

        /**
         * 開啟 - 指定坐標
         */
        function openAtPoint(domMenu: HTMLElement | null, X = 0, Y = 0) {

            if (domMenu === null) { return; }

            const funcPosition = () => {
                const menuHeight = domMenu.getBoundingClientRect().height;
                const menuWidth = domMenu.getBoundingClientRect().width;
                const bodyHeight = document.body.getBoundingClientRect().height;
                const bodyWidth = document.body.getBoundingClientRect().width;

                let left = X;
                let top = Y;

                if (menuWidth + left > bodyWidth) {
                    left = left - menuWidth + 10;
                } else {
                    left = left;
                }
                if (left < 0) { left = 0; }

                if (menuHeight + top > bodyHeight) {
                    // top = top - menuHeight + 5; // 在滑鼠上方顯示
                    top = bodyHeight - menuHeight - 5; // 靠齊視窗下面
                } else {
                    top = top;
                }
                if (top < 0) { top = 0; }

                domMenu.style.left = left + "px";
                domMenu.style.top = top + "px";
                domMenu.style.bottom = "0";
            };
            let funcClose = () => { };
            openBase(domMenu, funcPosition, funcClose);
        }

        /**
         * 開啟 - 原地
         */
        function openAtOrigin(domMenu: HTMLElement | null, offsetX = 0, offsetY = 0) {

            if (domMenu === null) { return; }

            const funcPosition = () => {
                const menuWidth = domMenu.getBoundingClientRect().width; // menu 寬度
                const menuHeight = domMenu.getBoundingClientRect().height;
                const bodyWidth = document.body.getBoundingClientRect().width; // 視窗 寬度
                const bodyHeight = document.body.getBoundingClientRect().height;

                let left = _mouseX;
                let top = _mouseY;

                left = left - (menuWidth / 2) + offsetX;
                if (left + menuWidth > bodyWidth) {
                    left = bodyWidth - menuWidth;
                }
                if (left < 0) { left = 0; }

                top = top + offsetY;
                if (top + menuHeight > bodyHeight) {
                    top = bodyHeight - menuHeight;
                }
                if (top < 0) { top = 0; }

                domMenu.style.left = left + "px";
                domMenu.style.top = top + "px";
                domMenu.style.bottom = "0";
            };
            let funcClose = () => { };
            openBase(domMenu, funcPosition, funcClose);
        }

    }
}
