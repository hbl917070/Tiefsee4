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
var baseWindow;
class MainWindow {
  constructor() {
    baseWindow = new BaseWindow();
    var dom_tools = document.getElementById("main-tools");
    var dom_maxBtnLeft = document.getElementById("maxBtnLeft");
    var dom_maxBtnRight = document.getElementById("maxBtnRight");
    var config = new Config();
    var fileLoad = new FileLoad(this);
    var fileShow = new FileShow(this);
    var fileSort = new FileSort(this);
    var mainFileList = new MainFileList(this);
    var menu = new Menu(this);
    var script = new Script(this);
    let firstRun = true;
    this.dom_tools = dom_tools;
    this.dom_maxBtnLeft = dom_maxBtnLeft;
    this.dom_maxBtnRight = dom_maxBtnRight;
    this.fileLoad = fileLoad;
    this.fileShow = fileShow;
    this.fileSort = fileSort;
    this.mainFileList = mainFileList;
    this.menu = menu;
    this.config = config;
    this.script = script;
    this.applySetting = applySetting;
    this.saveSetting = saveSetting;
    new MainTools(this);
    new Hotkey(this);
    init();
    baseWindow.sizeChangeEvents.push(() => __async(this, null, function* () {
      if (baseWindow.windowState === "Normal") {
        config.settings.position.width = baseWindow.width;
        config.settings.position.height = baseWindow.height;
      }
    }));
    baseWindow.closingEvents.push(() => __async(this, null, function* () {
      yield saveSetting();
    }));
    baseWindow.onCreate = (json) => __async(this, null, function* () {
      if (firstRun === true) {
        firstRun = false;
        var userSetting = {};
        try {
          userSetting = JSON.parse(json.settingTxt);
        } catch (e) {
        }
        $.extend(true, config.settings, userSetting);
        applySetting(config.settings, true);
        let txtPosition = config.settings.position;
        if (txtPosition.left !== -9999) {
          if (txtPosition.windowState == "Maximized") {
            yield WV_Window.ShowWindow_SetSize(txtPosition.left, txtPosition.top, txtPosition.width, txtPosition.height, "Maximized");
          } else if (txtPosition.windowState == "Normal") {
            yield WV_Window.ShowWindow_SetSize(txtPosition.left, txtPosition.top, txtPosition.width, txtPosition.height, "Normal");
          } else {
            yield WV_Window.ShowWindow();
            yield WV_Window.SetSize(800 * window.devicePixelRatio, 600 * window.devicePixelRatio);
          }
        } else {
          yield WV_Window.ShowWindow();
          yield WV_Window.SetSize(800 * window.devicePixelRatio, 600 * window.devicePixelRatio);
        }
        new InitMenu(this);
        let args = json.args;
        if (args.length === 0) {
          fileShow.openWelcome();
        } else if (args.length === 1) {
          fileLoad.loadFile(args[0]);
        } else {
          fileLoad.loadFiles(args[0], args);
        }
        if (config.settings["theme"]["aero"]) {
          WV_Window.SetAERO();
        }
      } else {
        WV_Window.ShowWindow();
        let args = json.args;
        if (args.length === 0) {
          fileShow.openWelcome();
        } else if (args.length === 1) {
          fileLoad.loadFile(args[0]);
        } else {
          fileLoad.loadFiles(args[0], args);
        }
      }
    });
    function init() {
      return __async(this, null, function* () {
        fileShow.openNone();
        initDomImport();
        WV_Window.SetMinimumSize(250 * window.devicePixelRatio, 250 * window.devicePixelRatio);
        function initIcon() {
          return __async(this, null, function* () {
            let path = Lib.Combine([yield WV_Window.GetAppDirPath(), "www\\img\\logo.ico"]);
            WV_Window.SetIcon(path);
          });
        }
        initIcon();
        dom_maxBtnLeft.addEventListener("click", function(e) {
          script.fileLoad.prev();
        });
        dom_maxBtnRight.addEventListener("click", function(e) {
          script.fileLoad.next();
        });
        document.addEventListener("contextmenu", function(e) {
          e.preventDefault();
        });
        baseWindow.closingEvents.push(() => __async(this, null, function* () {
          if (script.setting.temp_setting != null) {
            if ((yield script.setting.temp_setting.Visible) === true) {
              yield script.setting.temp_setting.RunJs("setting.saveData();");
              yield sleep(30);
            }
          }
        }));
        fileShow.dom_imgview.addEventListener("mousedown", (e) => __async(this, null, function* () {
          if (fileShow.tieefseeview.getIsOverflowX() === false && fileShow.tieefseeview.getIsOverflowY() === false) {
            if (e.button === 0) {
              let WindowState = baseWindow.windowState;
              if (WindowState === "Normal") {
                WV_Window.WindowDrag("move");
              }
            }
          }
        }));
        Lib.addEventDblclick(dom_tools, (e) => __async(this, null, function* () {
          let _dom = e.target;
          if (_dom) {
            if (_dom.classList.contains("js-noDrag")) {
              return;
            }
          }
          let WindowState = baseWindow.windowState;
          if (WindowState === "Maximized") {
            baseWindow.normal();
          } else {
            setTimeout(() => {
              baseWindow.maximized();
            }, 50);
          }
        }));
        Lib.addEventDblclick(fileShow.dom_imgview, () => __async(this, null, function* () {
          let WindowState = baseWindow.windowState;
          if (WindowState === "Maximized") {
            baseWindow.normal();
          } else {
            setTimeout(() => {
              baseWindow.maximized();
            }, 50);
          }
        }));
        Lib.addEventDblclick(fileShow.dom_welcomeview, () => __async(this, null, function* () {
          let WindowState = baseWindow.windowState;
          if (WindowState === "Maximized") {
            baseWindow.normal();
          } else {
            setTimeout(() => {
              baseWindow.maximized();
            }, 50);
          }
        }));
        dom_tools.addEventListener("mousedown", (e) => __async(this, null, function* () {
          let _dom = e.target;
          if (_dom) {
            if (_dom.classList.contains("js-noDrag")) {
              return;
            }
          }
          if (e.button === 0) {
            yield WV_Window.WindowDrag("move");
          }
        }));
        dom_tools.addEventListener("mousewheel", (e) => {
          let scrollLeft = dom_tools.scrollLeft;
          let deltaY = 0;
          if (e.deltaY) {
            deltaY = e.deltaY;
          }
          if (deltaY > 0) {
            dom_tools.scroll(scrollLeft + 20, 0);
          }
          if (deltaY < 0) {
            dom_tools.scroll(scrollLeft - 20, 0);
          }
        }, false);
        fileShow.dom_welcomeview.addEventListener("mousedown", (e) => __async(this, null, function* () {
          let _dom = e.target;
          if (_dom) {
            if (_dom.classList.contains("js-noDrag")) {
              return;
            }
          }
          e.preventDefault();
          if (e.button === 0) {
            let WindowState = baseWindow.windowState;
            if (WindowState === "Normal") {
              WV_Window.WindowDrag("move");
            }
          }
        }));
        window.addEventListener("dragenter", dragenter, false);
        window.addEventListener("dragover", dragover, false);
        window.addEventListener("drop", drop, false);
        function dragenter(e) {
          e.stopPropagation();
          e.preventDefault();
        }
        function dragover(e) {
          e.stopPropagation();
          e.preventDefault();
        }
        function drop(e) {
          return __async(this, null, function* () {
            if (e.dataTransfer === null) {
              return;
            }
            let files = e.dataTransfer.files;
            let _dropPath = yield baseWindow.getDropPath();
            if (_dropPath === "") {
              return;
            }
            if (files.length > 1) {
              let arFile = [];
              for (let i = 0; i < files.length; i++) {
                const item = files[i];
                arFile.push(item.name);
              }
              _dropPath = yield WV_Path.GetDirectoryName(_dropPath);
              yield fileLoad.loadFiles(_dropPath, arFile);
            } else {
              yield fileLoad.loadFile(_dropPath);
            }
            e.stopPropagation();
            e.preventDefault();
          });
        }
      });
    }
    function applySetting(_settings, isStart = false) {
      let cssRoot = document.body;
      config.settings = _settings;
      let dpizoom = Number(config.settings["image"]["dpizoom"]);
      if (dpizoom == -1 || isNaN(dpizoom)) {
        dpizoom = -1;
      }
      fileShow.tieefseeview.setDpizoom(dpizoom);
      let tieefseeviewImageRendering = Number(config.settings["image"]["tieefseeviewImageRendering"]);
      fileShow.tieefseeview.setRendering(tieefseeviewImageRendering);
      WV_Window.SetZoomFactor(config.settings["theme"]["zoomFactor"]);
      document.body.style.fontWeight = config.settings["theme"]["fontWeight"];
      cssRoot.style.setProperty("--svgWeight", config.settings["theme"]["svgWeight"]);
      mainFileList.setEnabled(config.settings.layout.fileListEnabled);
      mainFileList.setShowNo(config.settings.layout.fileListShowNo);
      mainFileList.setShowName(config.settings.layout.fileListShowName);
      if (isStart)
        mainFileList.setItemWidth(config.settings.layout.fileListShowWidth);
      cssRoot.style.setProperty("--window-border-radius", config.settings.theme["--window-border-radius"] + "px");
      initColor("--color-window-background", true);
      initColor("--color-window-border", true);
      initColor("--color-white");
      initColor("--color-black");
      initColor("--color-blue");
      function initColor(name, opacity = false) {
        let c = config.settings.theme[name];
        if (opacity) {
          cssRoot.style.setProperty(name, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a} )`);
        } else {
          for (let i = 1; i < 9; i++) {
            cssRoot.style.setProperty(name + `${i}0`, `rgba(${c.r}, ${c.g}, ${c.b}, ${i / 10} )`);
          }
          cssRoot.style.setProperty(name, `rgba(${c.r}, ${c.g}, ${c.b}, 1 )`);
        }
      }
    }
    function saveSetting() {
      return __async(this, null, function* () {
        config.settings.position.left = baseWindow.left;
        config.settings.position.top = baseWindow.top;
        config.settings.position.windowState = baseWindow.windowState;
        let s = JSON.stringify(config.settings, null, "	");
        var path = yield WV_Window.GetAppDataPath();
        path = Lib.Combine([path, "setting.json"]);
        yield WV_File.SetText(path, s);
      });
    }
  }
}
