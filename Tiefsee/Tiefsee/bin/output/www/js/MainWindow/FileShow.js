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
class FileShow {
  constructor(M) {
    var tieefseeview = new Tieefseeview(document.querySelector("#main-tiefseeview"));
    var dom_imgview = document.querySelector("#main-tiefseeview");
    var dom_pdfview = document.querySelector("#main-pdfview");
    var dom_txtview = document.querySelector("#main-txtview");
    var dom_welcomeview = document.querySelector("#main-welcomeview");
    var isLoaded = true;
    var _groupType = GroupType.none;
    this.openImage = openImage;
    this.openPdf = openPdf;
    this.openTxt = openTxt;
    this.openWelcome = openWelcome;
    this.openNone = openNone;
    this.getIsLoaded = getIsLoaded;
    this.getGroupType = getGroupType;
    this.dom_welcomeview = dom_welcomeview;
    this.dom_imgview = dom_imgview;
    this.tieefseeview = tieefseeview;
    function getGroupType() {
      return _groupType;
    }
    function setShowType(groupType) {
      var _a, _b, _c, _d, _e;
      _groupType = groupType;
      let arToolsGroup = document.querySelectorAll(".main-tools-group");
      for (let i = 0; i < arToolsGroup.length; i++) {
        const item = arToolsGroup[i];
        item.setAttribute("active", "");
      }
      if (groupType === GroupType.none) {
        (_a = getToolsDom(GroupType.none)) == null ? void 0 : _a.setAttribute("active", "true");
        M.mainFileList.setHide(true);
        dom_imgview.style.display = "none";
        dom_pdfview.style.display = "none";
        dom_txtview.style.display = "none";
        dom_welcomeview.style.display = "none";
        dom_pdfview.setAttribute("src", "");
        dom_txtview.value = "";
        tieefseeview.loadNone();
        return;
      }
      if (groupType === GroupType.welcome) {
        (_b = getToolsDom(GroupType.welcome)) == null ? void 0 : _b.setAttribute("active", "true");
        M.mainFileList.setHide(true);
        dom_imgview.style.display = "none";
        dom_pdfview.style.display = "none";
        dom_txtview.style.display = "none";
        dom_welcomeview.style.display = "flex";
        dom_pdfview.setAttribute("src", "");
        dom_txtview.value = "";
        tieefseeview.loadNone();
        return;
      }
      if (groupType === GroupType.img) {
        (_c = getToolsDom(GroupType.img)) == null ? void 0 : _c.setAttribute("active", "true");
        M.mainFileList.setHide(false);
        dom_imgview.style.display = "block";
        dom_pdfview.style.display = "none";
        dom_txtview.style.display = "none";
        dom_welcomeview.style.display = "none";
        dom_pdfview.setAttribute("src", "");
        dom_txtview.value = "";
        return;
      }
      if (groupType === GroupType.imgs) {
        return;
      }
      if (groupType === GroupType.txt) {
        (_d = getToolsDom(GroupType.txt)) == null ? void 0 : _d.setAttribute("active", "true");
        M.mainFileList.setHide(false);
        dom_imgview.style.display = "none";
        dom_pdfview.style.display = "none";
        dom_txtview.style.display = "block";
        dom_welcomeview.style.display = "none";
        dom_pdfview.setAttribute("src", "");
        tieefseeview.loadNone();
        return;
      }
      if (groupType === GroupType.pdf) {
        (_e = getToolsDom(GroupType.pdf)) == null ? void 0 : _e.setAttribute("active", "true");
        M.mainFileList.setHide(false);
        dom_imgview.style.display = "none";
        dom_pdfview.style.display = "block";
        dom_txtview.style.display = "none";
        dom_welcomeview.style.display = "none";
        dom_txtview.value = "";
        tieefseeview.loadNone();
        return;
      }
    }
    function getToolsDom(type) {
      return M.dom_tools.querySelector(`.main-tools-group[data-name="${type}"]`);
    }
    function getIsLoaded() {
      return isLoaded;
    }
    function openImage(fileInfo2) {
      return __async(this, null, function* () {
        var _a, _b, _c;
        isLoaded = false;
        let _path = fileInfo2.Path;
        setShowType(GroupType.img);
        let imgurl = _path;
        if (M.fileLoad.getGroupType() === GroupType.unknown) {
          imgurl = yield WV_Image.GetFileIcon(_path, 256);
        } else {
          imgurl = Lib.pathToURL(_path) + `?LastWriteTimeUtc=${fileInfo2.LastWriteTimeUtc}`;
        }
        tieefseeview.setLoading(true);
        yield tieefseeview.preload(imgurl);
        if (Lib.IsAnimation(fileInfo2) === true) {
          yield tieefseeview.loadImg(imgurl);
        } else {
          yield tieefseeview.loadBigimg(imgurl);
        }
        tieefseeview.setLoading(false);
        tieefseeview.transformRefresh(false);
        tieefseeview.setEventChangeZoom((ratio) => {
          let dom_btnScale = M.dom_tools.querySelector(`[data-name="btnScale"]`);
          if (dom_btnScale != null) {
            dom_btnScale.innerHTML = (ratio * 100).toFixed(0) + "%";
          }
        });
        tieefseeview.zoomFull(TieefseeviewZoomType["full-100%"]);
        let dom_size = (_a = getToolsDom(GroupType.img)) == null ? void 0 : _a.querySelector(`[data-name="infoSize"]`);
        if (dom_size != null) {
          dom_size.innerHTML = `${tieefseeview.getOriginalWidth()}<br>${tieefseeview.getOriginalHeight()}`;
        }
        let dom_type = (_b = getToolsDom(GroupType.img)) == null ? void 0 : _b.querySelector(`[data-name="infoType"]`);
        if (dom_type != null) {
          let fileType = Lib.GetFileType(fileInfo2).toLocaleUpperCase();
          ;
          let fileLength = getFileLength(fileInfo2.Lenght);
          dom_type.innerHTML = `${fileType}<br>${fileLength}`;
        }
        let dom_writeTime = (_c = getToolsDom(GroupType.img)) == null ? void 0 : _c.querySelector(`[data-name="infoWriteTime"]`);
        if (dom_writeTime != null) {
          let timeUtc = fileInfo2.LastWriteTimeUtc;
          let time = new Date(timeUtc).format("yyyy-MM-dd<br>hh:mm:ss");
          dom_writeTime.innerHTML = time;
        }
        isLoaded = true;
      });
    }
    function openPdf(fileInfo2) {
      return __async(this, null, function* () {
        var _a, _b;
        let _path = fileInfo2.Path;
        setShowType(GroupType.pdf);
        let _url = APIURL + "/api/getPdf/" + encodeURIComponent(_path);
        dom_pdfview.setAttribute("src", _url);
        let dom_type = (_a = getToolsDom(GroupType.pdf)) == null ? void 0 : _a.querySelector(`[data-name="infoType"]`);
        if (dom_type != null) {
          let fileType = Lib.GetFileType(fileInfo2).toLocaleUpperCase();
          let fileLength = getFileLength(fileInfo2.Lenght);
          dom_type.innerHTML = `${fileType}<br>${fileLength}`;
        }
        let dom_writeTime = (_b = getToolsDom(GroupType.pdf)) == null ? void 0 : _b.querySelector(`[data-name="infoWriteTime"]`);
        if (dom_writeTime != null) {
          let timeUtc = fileInfo2.LastWriteTimeUtc;
          let time = new Date(timeUtc).format("yyyy-MM-dd<br>hh:mm:ss");
          dom_writeTime.innerHTML = time;
        }
      });
    }
    function openTxt(fileInfo2) {
      return __async(this, null, function* () {
        var _a, _b;
        let _path = fileInfo2.Path;
        setShowType(GroupType.txt);
        dom_txtview.value = yield WV_File.GetText(_path);
        let dom_type = (_a = getToolsDom(GroupType.txt)) == null ? void 0 : _a.querySelector(`[data-name="infoType"]`);
        if (dom_type != null) {
          let fileType = Lib.GetFileType(fileInfo2).toLocaleUpperCase();
          ;
          let fileLength = getFileLength(fileInfo2.Lenght);
          dom_type.innerHTML = `${fileType}<br>${fileLength}`;
        }
        let dom_writeTime = (_b = getToolsDom(GroupType.txt)) == null ? void 0 : _b.querySelector(`[data-name="infoWriteTime"]`);
        if (dom_writeTime != null) {
          let timeUtc = fileInfo2.LastWriteTimeUtc;
          let time = new Date(timeUtc).format("yyyy-MM-dd<br>hh:mm:ss");
          dom_writeTime.innerHTML = time;
        }
      });
    }
    function openWelcome() {
      return __async(this, null, function* () {
        baseWindow.setTitle("Tiefsee 4");
        setShowType(GroupType.welcome);
      });
    }
    function openNone() {
      baseWindow.setTitle("Tiefsee 4");
      setShowType(GroupType.none);
    }
    function getFileLength(len) {
      if (len / 1024 < 1) {
        return len.toFixed(1) + " B";
      } else if (len / (1024 * 1024) < 1) {
        return (len / 1024).toFixed(1) + " KB";
      } else if (len / (1024 * 1024 * 1024) < 1) {
        return (len / (1024 * 1024)).toFixed(1) + " MB";
      }
      return (len / (1024 * 1024 * 1024)).toFixed(1) + " GB";
    }
  }
}
