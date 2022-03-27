class Menu {
  constructor(M) {
    this.open_Button = open_Button;
    this.open_RightClick = open_RightClick;
    this.open_Origin = open_Origin;
    var temp_closeList = [];
    this.close = close;
    var mouseX = 0;
    var mouseY = 0;
    document.body.addEventListener("mousemove", (e) => {
      mouseX = e.x;
      mouseY = e.y;
    });
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
      let domMenuBg = _domMenu.parentNode;
      if (domMenuBg === null) {
        return;
      }
      domMenuBg.setAttribute("active", "true");
      _domMenu.style.bottom = "";
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
      _domMenu.style.bottom = "0";
      _domBtn.classList.add(_css);
      let func_close = () => {
        domMenuBg.setAttribute("active", "");
        _domBtn.classList.remove(_css);
        temp_closeList = temp_closeList.filter((item) => {
          return item !== func_close;
        });
      };
      temp_closeList.push(func_close);
      domMenuBg.onmousedown = (sender) => {
        let domClick = sender.target;
        if (domClick.classList.contains("menu") || domClick.classList.contains("menu-content")) {
          func_close();
        }
      };
      window.onblur = function() {
        func_close();
      };
    }
    function open_RightClick(_domMenu, offsetX = 0, offsetY = 0) {
      if (_domMenu === null) {
        return;
      }
      let domMenuBg = _domMenu.parentNode;
      if (domMenuBg === null) {
        return;
      }
      domMenuBg.setAttribute("active", "true");
      _domMenu.style.bottom = "";
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
      if (left < 0) {
        left = 0;
      }
      if (menuHeight + top + offsetY > bodyHeight) {
        top = top - menuHeight + 5;
      } else {
        top = top + offsetY;
      }
      if (top < 0) {
        top = 0;
      }
      _domMenu.style.left = left + "px";
      _domMenu.style.top = top + "px";
      _domMenu.style.bottom = "0";
      let func_close = () => {
        domMenuBg.setAttribute("active", "");
        temp_closeList = temp_closeList.filter((item) => {
          return item !== func_close;
        });
      };
      temp_closeList.push(func_close);
      domMenuBg.onmousedown = (sender) => {
        let domClick = sender.target;
        if (domClick.classList.contains("menu") || domClick.classList.contains("menu-content")) {
          func_close();
        }
      };
      window.onblur = function() {
        func_close();
      };
    }
    function open_Origin(_domMenu, offsetX = 0, offsetY = 0) {
      if (_domMenu === null) {
        return;
      }
      let domMenuBg = _domMenu.parentNode;
      if (domMenuBg === null) {
        return;
      }
      domMenuBg.setAttribute("active", "true");
      _domMenu.style.bottom = "";
      let menuWidth = _domMenu.getBoundingClientRect().width;
      let menuHeight = _domMenu.getBoundingClientRect().height;
      let bodyWidth = document.body.getBoundingClientRect().width;
      let bodyHeight = document.body.getBoundingClientRect().height;
      let left = mouseX;
      let top = mouseY;
      left = left - menuWidth / 2 + offsetX;
      if (left + menuWidth > bodyWidth) {
        left = bodyWidth - menuWidth;
      }
      if (left < 0) {
        left = 0;
      }
      top = top + offsetY;
      if (top + menuHeight > bodyHeight) {
        top = bodyHeight - menuHeight;
      }
      if (top < 0) {
        top = 0;
      }
      _domMenu.style.left = left + "px";
      _domMenu.style.top = top + "px";
      _domMenu.style.bottom = "0";
      let func_close = () => {
        domMenuBg.setAttribute("active", "");
        temp_closeList = temp_closeList.filter((item) => {
          return item !== func_close;
        });
      };
      temp_closeList.push(func_close);
      domMenuBg.onmousedown = (sender) => {
        let domClick = sender.target;
        if (domClick.classList.contains("menu") || domClick.classList.contains("menu-content")) {
          func_close();
        }
      };
      window.onblur = function() {
        func_close();
      };
    }
  }
}
