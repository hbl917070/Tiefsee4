
class Menu {



    public open_Button;
    public open_RightClick;
    public open_Origin;
    public close;

    constructor(M: MainWindow) {

        this.open_Button = open_Button;
        this.open_RightClick = open_RightClick;
        this.open_Origin = open_Origin;

        var temp_closeList: any[] = [];//記錄所有被開過的menu
        this.close = close;

        var mouseX = 0;
        var mouseY = 0;
        document.body.addEventListener("mousemove", (e) => {
            mouseX = e.x
            mouseY = e.y
        });


        /**
         * 關閉 menu
         */
        function close() {
            for (let i = 0; i < temp_closeList.length; i++) {
                temp_closeList[i]()
            }
        }


        /**
         * 下拉選單
         * @param _domMenu 
         * @param _domBtn 
         * @param _css 
         */
        function open_Button(_domMenu: HTMLElement | null, _domBtn: HTMLElement | null, _css: string) {
            if (_domMenu === null) { return }
            if (_domBtn === null) { return }

            let domMenuBg = _domMenu.parentNode as HTMLElement;
            if (domMenuBg === null) { return }

            domMenuBg.setAttribute("active", "true");
            _domMenu.style.bottom = "";

            let left = 0;
            let top = 0;
            top = _domBtn.getBoundingClientRect().top + _domBtn.getBoundingClientRect().height
            left = _domBtn.getBoundingClientRect().left + (_domBtn.getBoundingClientRect().width / 2) - (_domMenu.getBoundingClientRect().width / 2)
            if (left < 0) { left = 0 }
            if (left > document.body.getBoundingClientRect().width - _domMenu.getBoundingClientRect().width) {
                left = document.body.getBoundingClientRect().width - _domMenu.getBoundingClientRect().width
            }

            _domMenu.style.left = left + "px";
            _domMenu.style.top = top + "px";
            _domMenu.style.bottom = "0";

            _domBtn.classList.add(_css);

            let func_close = () => {//關閉menu
                domMenuBg.setAttribute("active", "");//關閉menu
                _domBtn.classList.remove(_css);

                temp_closeList = temp_closeList.filter((item) => {
                    return item !== func_close
                });
            }
            temp_closeList.push(func_close);

            domMenuBg.onmousedown = (sender) => {
                let domClick = sender.target as HTMLElement;
                if (domClick.classList.contains("menu") || domClick.classList.contains("menu-content")) {//點擊透明背景時
                    sender.preventDefault();
                    func_close();//關閉menu
                }
            }

            window.onblur = function () { //視窗失去焦點
                func_close();//關閉menu
            };

        }


        /**
         * 開啟 - 滑鼠右鍵
         */
        function open_RightClick(_domMenu: HTMLElement | null, offsetX = 0, offsetY = 0) {

            if (_domMenu === null) { return }

            let domMenuBg = _domMenu.parentNode as HTMLElement;
            if (domMenuBg === null) { return }

            domMenuBg.setAttribute("active", "true");
            _domMenu.style.bottom = "";//避免高度計算錯誤

            let menuHeight = _domMenu.getBoundingClientRect().height;
            let menuWidth = _domMenu.getBoundingClientRect().width;
            let bodyHeight = document.body.getBoundingClientRect().height;
            let bodyWidth = document.body.getBoundingClientRect().width;

            let left = mouseX
            let top = mouseY
            
            if (menuWidth + left + offsetX > bodyWidth) {
                left = left - menuWidth + 10
            } else {
                left = left + offsetX
            }
            if (left < 0) { left = 0 }

            if (menuHeight + top + offsetY > bodyHeight) {
                top = top - menuHeight + 5
            } else {
                top = top + offsetY
            }
            if (top < 0) { top = 0 }

            _domMenu.style.left = left + "px";
            _domMenu.style.top = top + "px";
            _domMenu.style.bottom = "0";


            let func_close = () => {//關閉menu
                domMenuBg.setAttribute("active", "");//關閉menu
                temp_closeList = temp_closeList.filter((item) => {
                    return item !== func_close
                });
            }
            temp_closeList.push(func_close);

            domMenuBg.onmousedown = (sender) => {
                let domClick = sender.target as HTMLElement;
                if (domClick.classList.contains("menu") || domClick.classList.contains("menu-content")) {//點擊透明背景時
                    sender.preventDefault();
                    func_close();//關閉menu
                }
            }

            window.onblur = function () { //視窗失去焦點
                func_close();//關閉menu
            };

        }


        /**
         * 開啟 - 原地
         */
        function open_Origin(_domMenu: HTMLElement | null, offsetX = 0, offsetY = 0) {

            if (_domMenu === null) { return }

            let domMenuBg = _domMenu.parentNode as HTMLElement;
            if (domMenuBg === null) { return }

            domMenuBg.setAttribute("active", "true");
            _domMenu.style.bottom = "";//避免高度計算錯誤

            let menuWidth = _domMenu.getBoundingClientRect().width;//menu 寬度
            let menuHeight = _domMenu.getBoundingClientRect().height;
            let bodyWidth = document.body.getBoundingClientRect().width;//視窗 寬度
            let bodyHeight = document.body.getBoundingClientRect().height;

            let left = mouseX
            let top = mouseY

            left = left - (menuWidth / 2) + offsetX
            if (left + menuWidth > bodyWidth) {
                left = bodyWidth - menuWidth
            }
            if (left < 0) { left = 0 }

            top = top + offsetY
            if (top + menuHeight > bodyHeight) {
                top = bodyHeight - menuHeight
            }
            if (top < 0) { top = 0 }

            _domMenu.style.left = left + "px";
            _domMenu.style.top = top + "px";
            _domMenu.style.bottom = "0";

            let func_close = () => {//關閉menu
                domMenuBg.setAttribute("active", "");//關閉menu
                temp_closeList = temp_closeList.filter((item) => {
                    return item !== func_close
                });
            }
            temp_closeList.push(func_close);

            domMenuBg.onmousedown = (sender) => {
                let domClick = sender.target as HTMLElement;
                if (domClick.classList.contains("menu") || domClick.classList.contains("menu-content")) {//點擊透明背景時
                    sender.preventDefault();
                    func_close();//關閉menu
                }
            }

            window.onblur = function () { //視窗失去焦點
                func_close();//關閉menu
            };
        }


    }
}


