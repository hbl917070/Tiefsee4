class Menu {

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

        var temp_closeList: any[] = []; //記錄所有被開過的menu
        var mouseX = 0;
        var mouseY = 0;

        document.body.addEventListener("mouseup", (e) => {
            mouseX = e.x;
            mouseY = e.y;
        });


        /**
         * 判斷目前是否有開啟選單
         */
        function getIsShow() {
            let bool = temp_closeList.length > 0;
            return bool;
        }

        /**
         * 關閉 menu
         */
        function close() {
            for (let i = 0; i < temp_closeList.length; i++) {
                temp_closeList[i]();
            }
        }


        /**
         * 
         * @param _domMenu 
         * @param _funcPosition 定位用的函數
         * @param _funcClose 關閉時呼叫的函數
         * @returns 
         */
        function openBase(_domMenu: HTMLElement | null, _funcPosition: () => void, _funcClose: () => void) {

            if (_domMenu === null) { return; }

            let domMenuBg = _domMenu.parentNode as HTMLElement;
            if (domMenuBg === null) { return; }

            M.updateDomVisibility(); //更新元素顯示或隱藏

            domMenuBg.setAttribute("active", "true");
            _domMenu.style.bottom = ""; //避免高度計算錯誤

            _funcPosition();

            let funcClose = () => {
                domMenuBg.setAttribute("active", ""); //關閉menu
                temp_closeList = temp_closeList.filter((item) => {
                    return item !== funcClose;
                });
                domMenuBg.removeEventListener("touchstart", onmousedown);
                domMenuBg.removeEventListener("mousedown", onmousedown);
                _funcClose();
            }
            temp_closeList.push(funcClose);

            let onmousedown = (sender: TouchEvent | MouseEvent) => {
                let dom = sender.target as HTMLElement;
                let isScroll = Lib.isScrollbarVisible(_domMenu); //判斷是否有捲軸
                if (
                    dom.classList.contains("menu") //透明背景
                    || (isScroll === false && dom.classList.contains("menu-content")) //避免出現捲動條後，無法點擊捲動條
                ) {
                    sender.preventDefault();
                    funcClose(); //關閉menu
                }
            }
            domMenuBg.addEventListener("touchstart", onmousedown);
            domMenuBg.addEventListener("mousedown", onmousedown);

            //在非選單的區域捲動，就關閉選單
            domMenuBg.onwheel = (sender) => {
                let dom = sender.target as HTMLElement;
                let isScroll = Lib.isScrollbarVisible(_domMenu); //判斷是否有捲軸
                if (
                    dom.classList.contains("menu") //透明背景
                    || (isScroll === false && dom.classList.contains("menu-content")) //避免出現捲動條後，無法點擊捲動條
                ) {
                    funcClose(); //關閉menu
                }
            }
        }


        /**
         * 開啟 - 下拉選單
         * @param _domMenu 
         * @param _domBtn 
         * @param _css 
         */
        function openAtButton(_domMenu: HTMLElement | null, _domBtn: HTMLElement | null, _css: string) {
            if (_domMenu === null) { return; }
            if (_domBtn === null) { return; }

            let funcPosition = () => {
                let left = 0;
                let top = 0;
                top = _domBtn.getBoundingClientRect().top + _domBtn.getBoundingClientRect().height;
                left = _domBtn.getBoundingClientRect().left + (_domBtn.getBoundingClientRect().width / 2) - (_domMenu.getBoundingClientRect().width / 2);
                if (left < 0) { left = 0; }
                if (left > document.body.getBoundingClientRect().width - _domMenu.getBoundingClientRect().width) {
                    left = document.body.getBoundingClientRect().width - _domMenu.getBoundingClientRect().width;
                }

                _domMenu.style.left = left + "px";
                _domMenu.style.top = top + "px";
                _domMenu.style.bottom = "0";
                _domBtn.classList.add(_css);
            };
            let funcClose = () => {
                _domBtn.classList.remove(_css);
            };
            openBase(_domMenu, funcPosition, funcClose);

        }


        /**
         * 開啟 - 滑鼠右鍵
         */
        function openAtMouse(_domMenu: HTMLElement | null, offsetX = 0, offsetY = 0) {

            if (_domMenu === null) { return; }

            let funcPosition = () => {
                let menuHeight = _domMenu.getBoundingClientRect().height;
                let menuWidth = _domMenu.getBoundingClientRect().width;
                let bodyHeight = document.body.getBoundingClientRect().height;
                let bodyWidth = document.body.getBoundingClientRect().width;

                let left = mouseX;
                let top = mouseY;

                if (menuWidth + left + offsetX > bodyWidth) {
                    left = left - menuWidth + 10;
                } else {
                    left = left + offsetX;
                }
                if (left < 0) { left = 0; }

                if (menuHeight + top + offsetY > bodyHeight) {
                    //top = top - menuHeight + 5; //在滑鼠上方顯示
                    top = bodyHeight - menuHeight - 5; //靠齊視窗下面
                } else {
                    top = top + offsetY;
                }
                if (top < 0) { top = 0; }

                _domMenu.style.left = left + "px";
                _domMenu.style.top = top + "px";
                _domMenu.style.bottom = "0";
            };
            let funcClose = () => { };
            openBase(_domMenu, funcPosition, funcClose);

        }


        /**
        * 開啟 - 指定坐標
        */
        function openAtPoint(_domMenu: HTMLElement | null, X = 0, Y = 0) {

            if (_domMenu === null) { return; }

            let funcPosition = () => {
                let menuHeight = _domMenu.getBoundingClientRect().height;
                let menuWidth = _domMenu.getBoundingClientRect().width;
                let bodyHeight = document.body.getBoundingClientRect().height;
                let bodyWidth = document.body.getBoundingClientRect().width;

                let left = X;
                let top = Y;

                if (menuWidth + left > bodyWidth) {
                    left = left - menuWidth + 10;
                } else {
                    left = left;
                }
                if (left < 0) { left = 0; }

                if (menuHeight + top > bodyHeight) {
                    //top = top - menuHeight + 5; //在滑鼠上方顯示
                    top = bodyHeight - menuHeight - 5; //靠齊視窗下面
                } else {
                    top = top;
                }
                if (top < 0) { top = 0; }

                _domMenu.style.left = left + "px";
                _domMenu.style.top = top + "px";
                _domMenu.style.bottom = "0";
            };
            let funcClose = () => { };
            openBase(_domMenu, funcPosition, funcClose);
        }


        /**
         * 開啟 - 原地
         */
        function openAtOrigin(_domMenu: HTMLElement | null, offsetX = 0, offsetY = 0) {

            if (_domMenu === null) { return; }

            let funcPosition = () => {
                let menuWidth = _domMenu.getBoundingClientRect().width; //menu 寬度
                let menuHeight = _domMenu.getBoundingClientRect().height;
                let bodyWidth = document.body.getBoundingClientRect().width; //視窗 寬度
                let bodyHeight = document.body.getBoundingClientRect().height;

                let left = mouseX;
                let top = mouseY;

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

                _domMenu.style.left = left + "px";
                _domMenu.style.top = top + "px";
                _domMenu.style.bottom = "0";
            };
            let funcClose = () => { };
            openBase(_domMenu, funcPosition, funcClose);

        }


    }
}