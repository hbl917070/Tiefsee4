"use strict";
class Menu {
    constructor(M) {
        this.openDropDown = openDropDown;
        /**
         * 下拉選單
         * @param _domMenu
         * @param _domBtn
         * @param _css
         */
        function openDropDown(_domMenu, _domBtn, _css) {
            if (_domMenu === null) {
                return;
            }
            if (_domBtn === null) {
                return;
            }
            let left = 0;
            let top = 0;
            top = _domBtn.getBoundingClientRect().top + _domBtn.getBoundingClientRect().height;
            left = _domBtn.getBoundingClientRect().left + (_domBtn.getBoundingClientRect().width / 2) - (_domMenu.getBoundingClientRect().width / 2);
            if (left < 0) {
                left = 0;
            }
            if (left > document.body.getBoundingClientRect().width - _domMenu.getBoundingClientRect().width) {
                left = document.body.getBoundingClientRect().width - _domMenu.getBoundingClientRect().width;
            }
            _domMenu.style.left = left + "px";
            _domMenu.style.top = top + "px";
            _domBtn.classList.add(_css);
            let domMenuBg = _domMenu.parentNode;
            if (domMenuBg === null) {
                return;
            }
            domMenuBg.setAttribute("active", "true");
            domMenuBg.onclick = (sender) => {
                let domClick = sender.target;
                if (domClick.classList.contains("menu") || domClick.classList.contains("menu-content")) { //點擊透明背景時
                    domMenuBg.setAttribute("active", ""); //關閉menu
                    _domBtn.classList.remove(_css);
                }
            };
            window.onblur = function () {
                domMenuBg.setAttribute("active", ""); //關閉menu
                _domBtn.classList.remove(_css);
            };
        }
        /**
         * 開啟 - 滑鼠右鍵
         */
        function openRightClick(_domMenu) {
        }
        /**
         * 開啟 - 原地
         */
        function openOrigin(_domMenu) {
        }
    }
}
