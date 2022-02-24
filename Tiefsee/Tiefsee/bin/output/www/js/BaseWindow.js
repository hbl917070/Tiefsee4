var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const WV2 = window.chrome.webview.hostObjects;
const WV_Window = WV2.WV_Window;
const WV_Directory = WV2.WV_Directory;
const WV_File = WV2.WV_File;
const WV_Path = WV2.WV_Path;
const WV_System = WV2.WV_System;
const WV_RunApp = WV2.WV_RunApp;
const WV_Image = WV2.WV_Image;
const APIURL = "http://127.0.0.1:" + location.hash.replace("#", "");
var temp_dropPath = "";
class BaseWindow {
  constructor() {
    this.topMost = false;
    this.left = 0;
    this.top = 0;
    this.width = 0;
    this.height = 0;
    this.windowState = "Normal";
    this.closingEvents = [];
    this.sizeChangeEvents = [];
    var dom_window = document.querySelector(".window");
    var btn_menu = document.querySelector(".titlebar-tools-menu");
    var btn_topmost = document.querySelector(".titlebar-tools-topmost");
    var btn_normal = document.querySelector(".titlebar-tools-normal");
    var btn_minimized = document.querySelector(".titlebar-tools-minimized");
    var btn_maximized = document.querySelector(".titlebar-tools-maximized");
    var btn_close = document.querySelector(".titlebar-tools-close");
    var dom_titlebarTxt = document.querySelector(".titlebar-txt");
    this.dom_window = dom_window;
    this.btn_menu = btn_menu;
    this.btn_topmost = btn_topmost;
    this.btn_normal = btn_normal;
    this.btn_minimized = btn_minimized;
    this.btn_maximized = btn_maximized;
    this.btn_close = btn_close;
    this.dom_titlebarTxt = dom_titlebarTxt;
    (() => __async(this, null, function* () {
      this.windowState = yield WV_Window.WindowState;
      this.initWindowState();
    }))();
    btn_menu == null ? void 0 : btn_menu.addEventListener("click", (e) => {
    });
    btn_topmost == null ? void 0 : btn_topmost.addEventListener("click", (e) => __async(this, null, function* () {
      this.topMost = yield WV_Window.TopMost;
      if (this.topMost === true) {
        btn_topmost.setAttribute("active", "");
      } else {
        btn_topmost.setAttribute("active", "true");
      }
      WV_Window.TopMost = !this.topMost;
    }));
    btn_normal == null ? void 0 : btn_normal.addEventListener("click", (e) => __async(this, null, function* () {
      this.normal();
    }));
    btn_minimized == null ? void 0 : btn_minimized.addEventListener("click", (e) => __async(this, null, function* () {
      this.minimized();
    }));
    btn_maximized == null ? void 0 : btn_maximized.addEventListener("click", (e) => __async(this, null, function* () {
      this.maximized();
    }));
    btn_close == null ? void 0 : btn_close.addEventListener("click", (e) => __async(this, null, function* () {
      this.close();
    }));
    Lib.addEventDblclick(dom_titlebarTxt, () => __async(this, null, function* () {
      let WindowState = this.windowState;
      if (WindowState === "Maximized") {
        this.normal();
      } else {
        setTimeout(() => {
          this.maximized();
        }, 50);
      }
    }));
    windowBorder(document.querySelector(".window-CT"), "CT");
    windowBorder(document.querySelector(".window-RC"), "RC");
    windowBorder(document.querySelector(".window-CB"), "CB");
    windowBorder(document.querySelector(".window-LC"), "LC");
    windowBorder(document.querySelector(".window-LT"), "LT");
    windowBorder(document.querySelector(".window-RT"), "RT");
    windowBorder(document.querySelector(".window-LB"), "LB");
    windowBorder(document.querySelector(".window-RB"), "RB");
    windowBorder(document.querySelector(".window-titlebar .titlebar-txt"), "move");
    function windowBorder(_dom, _type) {
      _dom.addEventListener("mousedown", (e) => __async(this, null, function* () {
        if (e.button === 0) {
          yield WV_Window.WindowDrag(_type);
        }
      }));
      _dom.addEventListener("touchstart", (e) => __async(this, null, function* () {
      }));
    }
  }
  getDropPath() {
    return __async(this, null, function* () {
      let _dropPath = "";
      for (let i = 0; i < 100; i++) {
        if (temp_dropPath !== "") {
          _dropPath = temp_dropPath;
          _dropPath = decodeURIComponent(temp_dropPath);
          if (_dropPath.indexOf("file:///") === 0) {
            _dropPath = _dropPath.substr(8);
          } else if (_dropPath.indexOf("file://") === 0) {
            _dropPath = _dropPath.substr(5);
          }
          break;
        }
        yield sleep(10);
      }
      temp_dropPath = "";
      _dropPath = _dropPath.replace(/[/]/g, "\\");
      return _dropPath;
    });
  }
  setTitle(txt) {
    return __async(this, null, function* () {
      WV_Window.Text = txt;
      this.dom_titlebarTxt.innerHTML = `<span>${txt}</span>`;
    });
  }
  newWindow(_name) {
    return __async(this, null, function* () {
      let url = _name;
      var w = yield WV_Window.NewWindow(url, []);
      WV_Window.SetOwner(w);
      return w;
    });
  }
  close() {
    return __async(this, null, function* () {
      for (let i = 0; i < this.closingEvents.length; i++) {
        yield this.closingEvents[i]();
      }
      WV_Window.Close();
    });
  }
  maximized() {
    WV_Window.WindowState = "Maximized";
    this.initWindowState();
  }
  minimized() {
    WV_Window.WindowState = "Minimized";
  }
  normal() {
    WV_Window.WindowState = "Normal";
    this.initWindowState();
  }
  initWindowState() {
    if (this.windowState === "Maximized") {
      this.dom_window.classList.add("maximized");
      this.btn_normal.style.display = "flex";
      this.btn_maximized.style.display = "none";
    } else {
      this.dom_window.classList.remove("maximized");
      this.btn_normal.style.display = "none";
      this.btn_maximized.style.display = "flex";
    }
  }
  onCreate(json) {
    WV_Window.ShowWindow();
  }
  onSizeChanged(left, top, width, height, windowState) {
    return __async(this, null, function* () {
      this.left = left;
      this.top = top;
      this.width = width;
      this.height = height;
      this.windowState = windowState;
      this.initWindowState();
      for (let i = 0; i < this.sizeChangeEvents.length; i++) {
        yield this.sizeChangeEvents[i]();
      }
    });
  }
  onMove(left, top, width, height, windowState) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.windowState = windowState;
  }
}
