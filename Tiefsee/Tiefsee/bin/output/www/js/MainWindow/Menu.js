class Menu {
  constructor(M) {
    this.open_Button = open_Button;
    var temp_closeList = [];
    this.close = close;
    function close() {
      for (let i = 0; i < temp_closeList.length; i++) {
        temp_closeList[i]();
      }
    }
    function open_Button(_domMenu, _domBtn, _css) {
      if (_domMenu === null) {
        return;
      }
      if (_domBtn === null) {
        return;
      }
      let left = 0;
      let top = 0;
      top = _domBtn.getBoundingClientRect().top + _domBtn.getBoundingClientRect().height;
      left = _domBtn.getBoundingClientRect().left + _domBtn.getBoundingClientRect().width / 2 - _domMenu.getBoundingClientRect().width / 2;
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
      let func_close = () => {
        domMenuBg.setAttribute("active", "");
        _domBtn.classList.remove(_css);
        temp_closeList = temp_closeList.filter((item) => {
          return item !== func_close;
        });
      };
      temp_closeList.push(func_close);
      domMenuBg.onclick = (sender) => {
        let domClick = sender.target;
        if (domClick.classList.contains("menu") || domClick.classList.contains("menu-content")) {
          func_close();
        }
      };
      window.onblur = function() {
        func_close();
      };
    }
    function open_RightClick(_domMenu) {
    }
    function open_Origin(_domMenu) {
    }
  }
}
