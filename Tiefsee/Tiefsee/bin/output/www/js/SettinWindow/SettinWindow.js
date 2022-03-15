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
class Setting {
  constructor() {
    baseWindow = new BaseWindow();
    this.saveData = saveSetting;
    var config = new Config();
    var cssRoot = document.documentElement;
    var jqtxt_windowBorderRadius = $("#text-theme-windowBorderRadius");
    var jqtxt_colorWindowBackground = $("#text-theme-colorWindowBackground");
    var jqtxt_colorWindowBorder = $("#text-theme-colorWindowBorder");
    var jqtxt_colorWhite = $("#text-theme-colorWhite");
    var jqtxt_colorBlack = $("#text-theme-colorBlack");
    var jqtxt_colorBlue = $("#text-theme-colorBlue");
    var switch_areo = document.querySelector("#switch-theme-areo");
    var switch_fileListEnabled = document.querySelector("#switch-fileListEnabled");
    var switch_fileListShowNo = document.querySelector("#switch-fileListShowNo");
    var switch_fileListShowName = document.querySelector("#switch-fileListShowName");
    var switch_dirListEnabled = document.querySelector("#switch-dirListEnabled");
    var switch_dirListShowNo = document.querySelector("#switch-dirListShowNo");
    var switch_dirListShowName = document.querySelector("#switch-dirListShowName");
    var select_dirListImgNumber = document.querySelector("#select-dirListImgNumber");
    var jqtxt_zoomFactor = $("#text-theme-zoomFactor");
    var jqselect_fontWeight = $("#select-fontWeight");
    var jqselect_svgWeight = $("#select-svgWeight");
    var txt_imageDpizoom = document.querySelector("#image-dpizoom");
    var select_tieefseeviewImageRendering = document.querySelector("#image-tieefseeviewImageRendering");
    var txt_startPort = document.querySelector("#txt-startPort");
    var txt_serverCache = document.querySelector("#txt-serverCache");
    var btn_openAppData = document.getElementById("btn-openAppData");
    var btn_openWww = document.getElementById("btn-openWww");
    var btn_clearBrowserCache = document.getElementById("btn-clearBrowserCache");
    var btn_openSystemSetting = document.getElementById("btn-openSystemSetting");
    var txt_extension = document.querySelector("#txt-extension");
    var btn_extension = document.querySelector("#btn-extension");
    var dom_applyThemeBtns = document.querySelector("#applyTheme-btns");
    init();
    initDomImport();
    tippy(".img-help", {
      content(reference) {
        const id = reference.getAttribute("data-tooltip");
        if (id === null) {
          return "";
        }
        const template = document.getElementById(id);
        return template == null ? void 0 : template.innerHTML;
      },
      allowHTML: true
    });
    baseWindow.onCreate = (json) => __async(this, null, function* () {
      var _a;
      yield WV_Window.ShowWindow_Center(550 * window.devicePixelRatio, 450 * window.devicePixelRatio);
      var userSetting = {};
      try {
        userSetting = JSON.parse(json.settingTxt);
      } catch (e) {
      }
      $.extend(true, config.settings, userSetting);
      setRadio("[name='radio-startType']", json.startType.toString());
      txt_startPort.value = json.startPort.toString();
      txt_serverCache.value = json.serverCache.toString();
      applySetting();
      (_a = document.querySelector("input")) == null ? void 0 : _a.blur();
    });
    function init() {
      return __async(this, null, function* () {
        var _a;
        WV_Window.SetMinimumSize(400 * window.devicePixelRatio, 300 * window.devicePixelRatio);
        WV_Window.Text = "\u8A2D\u5B9A";
        let iconPath = Lib.Combine([yield WV_Window.GetAppDirPath(), "www\\img\\logo.ico"]);
        WV_Window.SetIcon(iconPath);
        baseWindow.closingEvents.push(() => __async(this, null, function* () {
          yield saveSetting();
        }));
        (() => {
          addEvent(jqtxt_colorWindowBorder, "--color-window-border", true);
          addEvent(jqtxt_colorWindowBackground, "--color-window-background", true);
          addEvent(jqtxt_colorWhite, "--color-white", false);
          addEvent(jqtxt_colorBlack, "--color-black", false);
          addEvent(jqtxt_colorBlue, "--color-blue", false);
          function addEvent(jQdim, name, opacity = false) {
            jQdim.minicolors({
              format: "rgb",
              opacity,
              changeDelay: 10,
              change: function(value, opacity2) {
                let c = jQdim.minicolors("rgbObject");
                config.settings["theme"][name] = c;
                appleSettingOfMain();
              }
            });
          }
        })();
        (() => {
          var tabs = new Tabs();
          tabs.add(document.getElementById("tabsBtn-common"), document.getElementById("tabsPage-common"), () => {
          });
          tabs.add(document.getElementById("tabsBtn-theme"), document.getElementById("tabsPage-theme"), () => {
          });
          tabs.add(document.getElementById("tabsBtn-layout"), document.getElementById("tabsPage-layout"), () => {
          });
          tabs.add(document.getElementById("tabsBtn-tools"), document.getElementById("tabsPage-tools"), () => {
          });
          tabs.add(document.getElementById("tabsBtn-image"), document.getElementById("tabsPage-image"), () => {
          });
          tabs.add(document.getElementById("tabsBtn-shortcutKeys"), document.getElementById("tabsPage-shortcutKeys"), () => {
          });
          tabs.add(document.getElementById("tabsBtn-extension"), document.getElementById("tabsPage-extension"), () => {
          });
          tabs.add(document.getElementById("tabsBtn-advanced"), document.getElementById("tabsPage-advanced"), () => {
          });
          tabs.add(document.getElementById("tabsBtn-about"), document.getElementById("tabsPage-about"), () => {
          });
          tabs.set(document.getElementById("tabsBtn-common"));
        })();
        (() => {
          applyThemeAddBtn(`<div class="btn">\u6DF1\u8272\u4E3B\u984C</div>`, { r: 31, g: 39, b: 43, a: 0.97 }, { r: 255, g: 255, b: 255, a: 0.25 }, { r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 0, g: 200, b: 255 });
          applyThemeAddBtn(`<div class="btn">\u6DFA\u8272\u4E3B\u984C</div>`, { r: 240, g: 242, b: 243, a: 0.97 }, { r: 112, g: 112, b: 112, a: 0.25 }, { r: 0, g: 20, b: 65 }, { r: 255, g: 255, b: 255 }, { r: 0, g: 135, b: 220 });
        })();
        let s_extension = ["JPG", "JPEG", "PNG", "GIF", "BMP", "SVG", "WEBP"];
        txt_extension.value = s_extension.join("\n");
        btn_extension.addEventListener("mousedown", (e) => __async(this, null, function* () {
          Msgbox.show({
            txt: "\u78BA\u5B9A\u7528Tiefsee\u4F86\u958B\u555F\u9019\u4E9B\u6A94\u6848\u55CE\uFF1F<br>" + s_extension.join(", "),
            funcYes: (dom, inputTxt) => __async(this, null, function* () {
              Msgbox.close(dom);
              let ar_extension = txt_extension.value.split("\n");
              let ar = [];
              for (let i = 0; i < ar_extension.length; i++) {
                const item = ar_extension[i].toLocaleLowerCase().trim();
                if (item !== "" && ar.indexOf(item) === -1) {
                  ar.push(item);
                }
              }
              let appPath = yield WV_Window.GetAppPath();
              yield WV_System.SetAssociationExtension(ar, appPath);
              Msgbox.show({ txt: "\u95DC\u806F\u5B8C\u6210" });
            })
          });
        }));
        (_a = document.getElementById("window-left")) == null ? void 0 : _a.addEventListener("mousedown", (e) => __async(this, null, function* () {
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
        jqtxt_windowBorderRadius.change(() => {
          let val = Number(jqtxt_windowBorderRadius.val());
          if (val < 0) {
            val = 0;
          }
          if (val > 15) {
            val = 15;
          }
          config.settings["theme"]["--window-border-radius"] = val;
          appleSettingOfMain();
        });
        jqtxt_zoomFactor.change(() => {
          let val = Number(jqtxt_zoomFactor.val());
          if (isNaN(val)) {
            val = 1;
          }
          if (val === 0) {
            val = 1;
          }
          if (val < 0.5) {
            val = 0.5;
          }
          if (val > 3) {
            val = 3;
          }
          config.settings["theme"]["zoomFactor"] = val;
          appleSettingOfMain();
        });
        jqselect_fontWeight.change(() => {
          let val = jqselect_fontWeight.val();
          config.settings["theme"]["fontWeight"] = val;
          appleSettingOfMain();
        });
        jqselect_svgWeight.change(() => {
          let val = jqselect_svgWeight.val();
          config.settings["theme"]["svgWeight"] = val;
          appleSettingOfMain();
        });
        switch_areo == null ? void 0 : switch_areo.addEventListener("change", () => {
          let val = switch_areo.checked;
          config.settings["theme"]["aero"] = val;
        });
        switch_fileListEnabled == null ? void 0 : switch_fileListEnabled.addEventListener("change", () => {
          let val = switch_fileListEnabled.checked;
          config.settings["layout"]["fileListEnabled"] = val;
          appleSettingOfMain();
        });
        switch_fileListShowNo == null ? void 0 : switch_fileListShowNo.addEventListener("change", () => {
          let val = switch_fileListShowNo.checked;
          config.settings["layout"]["fileListShowNo"] = val;
          appleSettingOfMain();
        });
        switch_fileListShowName == null ? void 0 : switch_fileListShowName.addEventListener("change", () => {
          let val = switch_fileListShowName.checked;
          config.settings["layout"]["fileListShowName"] = val;
          appleSettingOfMain();
        });
        switch_dirListEnabled == null ? void 0 : switch_dirListEnabled.addEventListener("change", () => {
          let val = switch_dirListEnabled.checked;
          config.settings["layout"]["dirListEnabled"] = val;
          appleSettingOfMain();
        });
        switch_dirListShowNo == null ? void 0 : switch_dirListShowNo.addEventListener("change", () => {
          let val = switch_dirListShowNo.checked;
          config.settings["layout"]["dirListShowNo"] = val;
          appleSettingOfMain();
        });
        switch_dirListShowName == null ? void 0 : switch_dirListShowName.addEventListener("change", () => {
          let val = switch_dirListShowName.checked;
          config.settings["layout"]["dirListShowName"] = val;
          appleSettingOfMain();
        });
        select_dirListImgNumber == null ? void 0 : select_dirListImgNumber.addEventListener("change", () => {
          let val = Number(select_dirListImgNumber.value);
          config.settings["layout"]["dirListImgNumber"] = val;
          appleSettingOfMain();
        });
        txt_imageDpizoom == null ? void 0 : txt_imageDpizoom.addEventListener("change", () => {
          let val = txt_imageDpizoom.value;
          config.settings["image"]["dpizoom"] = val;
          appleSettingOfMain();
        });
        select_tieefseeviewImageRendering == null ? void 0 : select_tieefseeviewImageRendering.addEventListener("change", () => {
          let val = select_tieefseeviewImageRendering.value;
          config.settings["image"]["tieefseeviewImageRendering"] = val;
          appleSettingOfMain();
        });
        btn_openAppData == null ? void 0 : btn_openAppData.addEventListener("click", () => __async(this, null, function* () {
          let path = yield WV_Window.GetAppDataPath();
          WV_RunApp.OpenUrl(path);
        }));
        btn_openWww == null ? void 0 : btn_openWww.addEventListener("click", () => __async(this, null, function* () {
          let path = yield WV_Window.GetAppDirPath();
          path = Lib.Combine([path, "www"]);
          WV_RunApp.OpenUrl(path);
        }));
        btn_openSystemSetting == null ? void 0 : btn_openSystemSetting.addEventListener("click", () => __async(this, null, function* () {
          let path = "ms-settings:defaultapps";
          WV_RunApp.OpenUrl(path);
        }));
        btn_clearBrowserCache == null ? void 0 : btn_clearBrowserCache.addEventListener("click", () => __async(this, null, function* () {
          WV_Window.ClearBrowserCache();
          Msgbox.show({ txt: "\u5FEB\u53D6\u8CC7\u6599\u6E05\u7406\u5B8C\u6210" });
        }));
      });
    }
    function applyThemeAddBtn(html, windowBackground, windowBorder, white, black, blue) {
      let btn = newDiv(html);
      btn.onclick = () => {
        config.settings.theme["--color-window-background"] = windowBackground;
        config.settings.theme["--color-window-border"] = windowBorder;
        config.settings.theme["--color-white"] = white;
        config.settings.theme["--color-black"] = black;
        config.settings.theme["--color-blue"] = blue;
        applySetting();
      };
      dom_applyThemeBtns == null ? void 0 : dom_applyThemeBtns.append(btn);
    }
    function appleSettingOfMain() {
      WV_Window.RunJsOfParent(`mainWindow.applySetting(${JSON.stringify(config.settings)})`);
    }
    function applySetting() {
      txt_imageDpizoom.value = config.settings["image"]["dpizoom"];
      select_tieefseeviewImageRendering.value = config.settings["image"]["tieefseeviewImageRendering"];
      jqtxt_windowBorderRadius.val(config.settings.theme["--window-border-radius"]);
      switch_areo.checked = config.settings["theme"]["aero"];
      jqtxt_zoomFactor.val(config.settings.theme["zoomFactor"]);
      jqselect_fontWeight.val(config.settings.theme["fontWeight"]);
      jqselect_svgWeight.val(config.settings.theme["svgWeight"]);
      switch_fileListEnabled.checked = config.settings["layout"]["fileListEnabled"];
      switch_fileListShowNo.checked = config.settings["layout"]["fileListShowNo"];
      switch_fileListShowName.checked = config.settings["layout"]["fileListShowName"];
      switch_dirListEnabled.checked = config.settings["layout"]["dirListEnabled"];
      switch_dirListShowNo.checked = config.settings["layout"]["dirListShowNo"];
      switch_dirListShowName.checked = config.settings["layout"]["dirListShowName"];
      select_dirListImgNumber.value = config.settings["layout"]["dirListImgNumber"] + "";
      appleSettingOfMain();
      function setRgb(jqdom, c) {
        jqdom.minicolors("value", `rgb(${c.r}, ${c.g}, ${c.b})`);
      }
      function setRgba(jqdom, c) {
        jqdom.minicolors("value", `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`);
      }
      setRgba(jqtxt_colorWindowBackground, config.settings.theme["--color-window-background"]);
      setRgba(jqtxt_colorWindowBorder, config.settings.theme["--color-window-border"]);
      setRgb(jqtxt_colorWhite, config.settings.theme["--color-white"]);
      setRgb(jqtxt_colorBlack, config.settings.theme["--color-black"]);
      setRgb(jqtxt_colorBlue, config.settings.theme["--color-blue"]);
    }
    function saveSetting() {
      return __async(this, null, function* () {
        appleSettingOfMain();
        let startPort = parseInt(txt_startPort.value);
        let startType = getRadio("[name='radio-startType']");
        let serverCache = parseInt(txt_serverCache.value);
        if (isNaN(startPort)) {
          startPort = 4876;
        }
        if (startPort > 65535) {
          startPort = 65535;
        }
        if (startPort < 1024) {
          startPort = 1024;
        }
        if (startType.search(/^[1|2|3|4|5]$/) !== 0) {
          startType = 2;
        }
        startType = parseInt(startType);
        if (isNaN(serverCache)) {
          serverCache = 0;
        }
        if (serverCache > 31536e3) {
          serverCache = 31536e3;
        }
        if (serverCache < 0) {
          serverCache = 0;
        }
        yield WV_Window.SetStartIni(startPort, startType, serverCache);
        let s = JSON.stringify(config.settings, null, "	");
        var path = yield WV_Window.GetAppDataPath();
        path = Lib.Combine([path, "setting.json"]);
        yield WV_File.SetText(path, s);
      });
    }
  }
}
class Tabs {
  constructor() {
    this.ar = [];
  }
  activeEvent(btn, page, func) {
    var _a, _b;
    for (let i = 0; i < this.ar.length; i++) {
      const item = this.ar[i];
      (_a = item.btn) == null ? void 0 : _a.setAttribute("active", "");
      (_b = item.page) == null ? void 0 : _b.setAttribute("active", "");
    }
    btn == null ? void 0 : btn.setAttribute("active", "true");
    page == null ? void 0 : page.setAttribute("active", "true");
    func();
  }
  set(btn) {
    for (let i = 0; i < this.ar.length; i++) {
      const item = this.ar[i];
      if (btn === item.btn) {
        this.activeEvent(btn, item.page, item.func);
      }
    }
  }
  add(btn, page, func) {
    this.ar.push({ btn, page, func });
    btn == null ? void 0 : btn.addEventListener("click", () => {
      this.activeEvent(btn, page, func);
    });
  }
}
