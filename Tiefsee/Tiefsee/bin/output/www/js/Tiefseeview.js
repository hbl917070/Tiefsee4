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
class Tieefseeview {
  constructor(_dom) {
    _dom.innerHTML = `
            <div class="tiefseeview-loading" ></div>   
            <div class="tiefseeview-dpizoom">
                <div class="tiefseeview-container">
                    <div class="tiefseeview-data" style="width:400px;">
                        <div class="view-bigimg">
                            <canvas class="view-bigimg-canvas"></canvas>
                            <img class="view-bigimg-bg" style="display:none">
                        </div>   
                        <img class="view-img" style="display:none">
                    </div>
                </div>
            </div>
            <div class="scroll-y">
                <div class="scroll-bg"></div>
                <div class="scroll-box"></div>
            </div>
            <div class="scroll-x">
                <div class="scroll-bg"></div>
                <div class="scroll-box"></div>
            </div>`;
    var dom_tiefseeview = _dom;
    var dom_dpizoom = dom_tiefseeview.querySelector(".tiefseeview-dpizoom");
    var dom_con = dom_tiefseeview.querySelector(".tiefseeview-container");
    var dom_data = dom_tiefseeview.querySelector(".tiefseeview-data");
    var dom_img = dom_tiefseeview.querySelector(".view-img");
    var dom_bigimg = dom_tiefseeview.querySelector(".view-bigimg");
    var dom_bigimg_canvas = dom_tiefseeview.querySelector(".view-bigimg-canvas");
    var dom_loading = dom_tiefseeview.querySelector(".tiefseeview-loading");
    var scrollX = new TieefseeviewScroll(dom_tiefseeview.querySelector(".scroll-x"), "x");
    var scrollY = new TieefseeviewScroll(dom_tiefseeview.querySelector(".scroll-y"), "y");
    var url;
    var dataType = "img";
    var dpizoom = 1;
    var isDpizoomAUto = true;
    var degNow = 0;
    var zoomRatio = 1.1;
    var transformDuration = 200;
    var mirrorHorizontal = false;
    var mirrorVertical = false;
    var rendering = TieefseeviewImageRendering["auto"];
    var overflowDistance = 0;
    var marginTop = 10;
    var marginLeft = 10;
    var marginBottom = 10;
    var marginRight = 10;
    var loadingUrl = "img/loading.svg";
    var errerUrl = "img/error.svg";
    var rotateCriticalValue = 15;
    var hammerPan = new Hammer(dom_dpizoom);
    var panStartX = 0;
    var panStartY = 0;
    var isMoving = false;
    var isPaning = false;
    var hammerPlural = new Hammer.Manager(dom_dpizoom);
    var temp_rotateStareDegValue = 0;
    var temp_touchRotateStarting = false;
    var temp_rotateStareDegNow = 0;
    var temp_pinchZoom = 1;
    var temp_pinchCenterX = 0;
    var temp_pinchCenterY = 0;
    var temp_originalWidth = 1;
    var temp_originalHeight = 1;
    var temp_img;
    var temp_can;
    var temp_canvasSN = 0;
    var eventMouseWheel = (_type, offsetX, offsetY) => {
      if (_type === "up") {
        zoomIn(offsetX, offsetY);
      } else {
        zoomOut(offsetX, offsetY);
      }
    };
    var eventChangeZoom = (ratio) => {
    };
    var eventChangeDeg = (deg) => {
    };
    var eventChangeMirror = (isMirrorHorizontal, isMirrorVertica) => {
    };
    var eventChangeXY = (x, y) => {
    };
    var eventLimitMax = () => {
      return _eventLimitMax();
    };
    var eventLimitMin = () => {
      return _eventLimitMin();
    };
    var pinch = new Hammer.Pinch();
    var rotate = new Hammer.Rotate();
    rotate.recognizeWith(pinch);
    hammerPlural.add([pinch, rotate]);
    this.dom_tiefseeview = dom_tiefseeview;
    this.dom_con = dom_con;
    this.dom_data = dom_data;
    this.dom_img = dom_img;
    this.scrollX = scrollX;
    this.scrollY = scrollY;
    this.preload = preload;
    this.loadImg = loadImg;
    this.loadBigimg = loadBigimg;
    this.loadNone = loadNone;
    this.setLoading = setLoading;
    this.getRendering = getRendering;
    this.setRendering = setRendering;
    this.getIsOverflowX = getIsOverflowX;
    this.getIsOverflowY = getIsOverflowY;
    this.zoomFull = zoomFull;
    this.getDeg = getDeg;
    this.setDeg = setDeg;
    this.setDegForward = setDegForward;
    this.setDegReverse = setDegReverse;
    this.getMirrorHorizontal = getMirrorHorizontal;
    this.setMirrorHorizontal = setMirrorHorizontal;
    this.getMirrorVertica = getMirrorVertica;
    this.setMirrorVertica = setMirrorVertica;
    this.getXY = getXY;
    this.setXY = setXY;
    this.move = move;
    this.init_point = init_point;
    this.transformRefresh = transformRefresh;
    this.setAlign = setAlign;
    this.zoomOut = zoomOut;
    this.zoomIn = zoomIn;
    this.setEventMouseWheel = setEventMouseWheel;
    this.getEventMouseWheel = getEventMouseWheel;
    this.getEventLimitMax = getEventLimitMax;
    this.setEventLimitMax = setEventLimitMax;
    this.getEventLimitMin = getEventLimitMin;
    this.setEventLimitMin = setEventLimitMin;
    this.setEventChangeZoom = setEventChangeZoom;
    this.getEventChangeZoom = getEventChangeZoom;
    this.setEventChangeDeg = setEventChangeDeg;
    this.getEventChangeDeg = getEventChangeDeg;
    this.setEventChangeMirror = setEventChangeMirror;
    this.getEventChangeMirror = getEventChangeMirror;
    this.setEventChangeXY = setEventChangeXY;
    this.getEventChangeXY = getEventChangeXY;
    this.getOriginalWidth = getOriginalWidth;
    this.getOriginalHeight = getOriginalHeight;
    this.setMargin = setMargin;
    this.getMargin = getMargin;
    this.getDpizoom = getDpizoom;
    this.setDpizoom = setDpizoom;
    this.getOverflowDistance = getOverflowDistance;
    this.setOverflowDistance = setOverflowDistance;
    this.getLoadingUrl = getLoadingUrl;
    this.setLoadingUrl = setLoadingUrl;
    this.getErrerUrl = getErrerUrl;
    this.setErrerUrl = setErrerUrl;
    this.getUrl = getUrl;
    setLoadingUrl(loadingUrl);
    setLoading(false);
    dom_tiefseeview.classList.add("tiefseeview");
    setTransform(void 0, void 0, false);
    setDpizoom(-1);
    new ResizeObserver(() => {
      init_point(false);
      eventChangeZoom(getZoomRatio());
    }).observe(dom_dpizoom);
    scrollY.setEventChange((v, mode) => {
      if (mode === "set") {
        return;
      }
      v = v * -1 + marginTop;
      setXY(void 0, v, 0);
    });
    scrollX.setEventChange((v, mode) => {
      if (mode === "set") {
        return;
      }
      v = v * -1 + marginLeft;
      setXY(v, void 0, 0);
    });
    hammerPlural.on("rotatestart", (ev) => {
      temp_rotateStareDegNow = degNow;
      temp_rotateStareDegValue = ev.rotation - degNow;
      temp_touchRotateStarting = false;
    });
    hammerPlural.on("rotate", (ev) => __async(this, null, function* () {
      let _deg = ev.rotation - temp_rotateStareDegValue;
      if (temp_touchRotateStarting === false) {
        if (Math.abs(temp_rotateStareDegNow - Math.abs(_deg)) > rotateCriticalValue) {
          temp_rotateStareDegValue -= temp_rotateStareDegNow - _deg;
          _deg += temp_rotateStareDegNow - _deg;
          temp_touchRotateStarting = true;
        }
      }
      if (temp_touchRotateStarting) {
        setDeg(_deg, ev.center.x, ev.center.y, false);
      }
    }));
    hammerPlural.on("rotateend", (ev) => {
      temp_touchRotateStarting = false;
      let r = degNow % 90;
      if (r === 0) {
        return;
      }
      if (r > 45 || r < 0 && r > -45) {
        setDegForward(ev.center.x, ev.center.y, true);
      } else {
        setDegReverse(ev.center.x, ev.center.y, true);
      }
    });
    hammerPlural.on("pinchstart", (ev) => {
      temp_pinchZoom = 1;
      temp_pinchCenterX = ev.center.x;
      temp_pinchCenterY = ev.center.y;
    });
    hammerPlural.on("pinch", (ev) => {
      zoomIn(ev.center.x, ev.center.y, ev.scale / temp_pinchZoom, TieefseeviewImageRendering["pixelated"]);
      setXY(toNumber(dom_con.style.left) - (temp_pinchCenterX - ev.center.x), toNumber(dom_con.style.top) - (temp_pinchCenterY - ev.center.y), 0);
      temp_pinchZoom = ev.scale;
      temp_pinchCenterX = ev.center.x;
      temp_pinchCenterY = ev.center.y;
    });
    hammerPlural.on("pinchend", (ev) => {
      setRendering(rendering);
    });
    dom_dpizoom.addEventListener("wheel", (e) => {
      e.preventDefault();
      e = e || window.event;
      if (e.target !== dom_dpizoom) {
        return;
      }
      $(dom_con).stop(true, false);
      if (e.deltaX < 0 || e.deltaY < 0) {
        eventMouseWheel("up", e.offsetX * dpizoom, e.offsetY * dpizoom);
      } else {
        eventMouseWheel("down", e.offsetX * dpizoom, e.offsetY * dpizoom);
      }
    }, true);
    dom_dpizoom.addEventListener("mousedown", (ev) => {
      ev.preventDefault();
      if (getIsOverflowX() === false && getIsOverflowY() === false) {
        return;
      }
      if (ev.target !== dom_dpizoom) {
        isMoving = false;
        isPaning = false;
        return;
      }
      isMoving = true;
      isPaning = true;
      $(dom_con).stop(true, false);
      panStartX = toNumber(dom_con.style.left);
      panStartY = toNumber(dom_con.style.top);
    });
    dom_dpizoom.addEventListener("touchstart", (ev) => {
      ev.preventDefault();
      if (ev.touches.length > 1) {
        isMoving = false;
        isPaning = false;
        return;
      }
      if (ev.target !== dom_dpizoom) {
        isMoving = false;
        isPaning = false;
        return;
      }
      isMoving = true;
      isPaning = true;
      $(dom_con).stop(true, false);
      panStartX = toNumber(dom_con.style.left);
      panStartY = toNumber(dom_con.style.top);
    });
    hammerPan.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_VERTICAL });
    hammerPan.on("pan", (ev) => {
      if (ev.maxPointers > 1) {
        isMoving = false;
        isPaning = false;
        return;
      }
      if (getIsOverflowX() === false && getIsOverflowY() === false) {
        return;
      }
      if (isMoving === false) {
        return;
      }
      let deltaX = ev["deltaX"];
      let deltaY = ev["deltaY"];
      let left = panStartX + deltaX * dpizoom;
      let top = panStartY + deltaY * dpizoom;
      if (getIsOverflowY()) {
        if (top > marginTop + overflowDistance) {
          top = marginTop + overflowDistance;
        }
        let t = dom_dpizoom.offsetHeight - dom_con.offsetHeight - marginBottom;
        if (top < t - overflowDistance) {
          top = t - overflowDistance;
        }
      } else {
        let t = (dom_dpizoom.offsetHeight - dom_con.offsetHeight) / 2;
        if (top > t + overflowDistance) {
          top = t + overflowDistance;
        }
        if (top < t - overflowDistance) {
          top = t - overflowDistance;
        }
      }
      if (getIsOverflowX()) {
        if (left > marginLeft + overflowDistance) {
          left = marginLeft + overflowDistance;
        }
        let l = dom_dpizoom.offsetWidth - dom_con.offsetWidth - marginRight;
        if (left < l - overflowDistance) {
          left = l - overflowDistance;
        }
      } else {
        let l = (dom_dpizoom.offsetWidth - dom_con.offsetWidth) / 2;
        if (left > l + overflowDistance) {
          left = l + overflowDistance;
        }
        if (left < l - overflowDistance) {
          left = l - overflowDistance;
        }
      }
      setXY(left, top, 0);
    });
    hammerPan.on("panend", (ev) => __async(this, null, function* () {
      if (ev.maxPointers > 1) {
        return;
      }
      if (isMoving === false) {
        return;
      }
      isMoving = false;
      isPaning = true;
      let velocity = ev["velocity"];
      let velocityX = ev["velocityX"];
      let velocityY = ev["velocityY"];
      let sp = 150 + 70 * Math.abs(velocity);
      if (sp > 800)
        sp = 800;
      $(dom_con).stop(true, false);
      if (Math.abs(velocity) < 1) {
        velocity = 0;
        velocityX = 0;
        velocityY = 0;
        sp = 10;
        init_point(true);
        isPaning = false;
        return;
      }
      let top = toNumber(dom_con.style.top) + velocityY * 150;
      let left = toNumber(dom_con.style.left) + velocityX * 150;
      let bool_overflowX = false;
      let bool_overflowY = false;
      if (getIsOverflowY()) {
        if (top > marginTop + overflowDistance) {
          top = marginTop + overflowDistance;
          bool_overflowX = true;
        }
        let t = dom_dpizoom.offsetHeight - dom_con.offsetHeight - marginBottom;
        if (top < t - overflowDistance) {
          top = t - overflowDistance;
          bool_overflowX = true;
        }
      } else {
        let t = (dom_dpizoom.offsetHeight - dom_con.offsetHeight) / 2;
        if (top > t + overflowDistance) {
          top = t + overflowDistance;
          bool_overflowX = true;
        }
        if (top < t - overflowDistance) {
          top = t - overflowDistance;
          bool_overflowX = true;
        }
      }
      if (getIsOverflowX()) {
        if (left > marginLeft + overflowDistance) {
          left = marginLeft + overflowDistance;
          bool_overflowY = true;
        }
        let l = dom_dpizoom.offsetWidth - dom_con.offsetWidth - marginRight;
        if (left < l - overflowDistance) {
          left = l - overflowDistance;
          bool_overflowY = true;
        }
      } else {
        let l = (dom_dpizoom.offsetWidth - dom_con.offsetWidth) / 2;
        if (left > l + overflowDistance) {
          left = l + overflowDistance;
          bool_overflowY = true;
        }
        if (left < l - overflowDistance) {
          left = l - overflowDistance;
          bool_overflowY = true;
        }
      }
      let dep = Math.sqrt(Math.pow(toNumber(dom_con.style.top) - top, 2) + Math.pow(toNumber(dom_con.style.left) - left, 2));
      if ((bool_overflowX || bool_overflowY) && dep < 200) {
        sp = 100;
      }
      yield setXY(left, top, sp);
      isPaning = false;
      init_point(true);
    }));
    function getLoadingUrl() {
      return loadingUrl;
    }
    function setLoadingUrl(_url) {
      loadingUrl = _url;
      dom_loading.style.backgroundImage = `url("${loadingUrl}")`;
    }
    function getErrerUrl() {
      return errerUrl;
    }
    function setErrerUrl(_url) {
      errerUrl = _url;
    }
    function setDataType(_type) {
      dataType = _type;
      if (dataType === "img") {
        dom_img.style.display = "";
        dom_bigimg.style.display = "none";
        return;
      }
      if (dataType === "bigimg") {
        dom_img.style.display = "none";
        dom_bigimg.style.display = "";
        return;
      }
    }
    function getUrl() {
      return url;
    }
    function preload(_url) {
      return __async(this, null, function* () {
        let img = document.createElement("img");
        let p = yield new Promise((resolve, reject) => {
          img.addEventListener("load", (e) => {
            temp_originalWidth = img.naturalWidth;
            temp_originalHeight = img.naturalHeight;
            resolve(true);
          });
          img.addEventListener("error", (e) => {
            temp_originalWidth = 1;
            temp_originalHeight = 1;
            resolve(false);
          });
          img.src = _url;
        });
        temp_img = img;
        return p;
      });
    }
    function loadNone() {
      return __async(this, null, function* () {
        yield loadImg("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
      });
    }
    function loadImg(_url) {
      return __async(this, null, function* () {
        url = _url;
        let p = yield preload(_url);
        setDataType("img");
        if (p === false) {
          yield preload(errerUrl);
          _url = errerUrl;
          dom_img.src = _url;
          return false;
        }
        dom_img.src = _url;
        return true;
      });
    }
    function loadBigimg(_url) {
      return __async(this, null, function* () {
        url = _url;
        let p = yield preload(_url);
        setDataType("bigimg");
        if (p === false) {
          yield preload(errerUrl);
          _url = errerUrl;
          dom_img.src = _url;
          return false;
        }
        temp_drawImage = {
          scale: 1,
          sx: 0,
          sy: 0,
          sWidth: 1,
          sHeight: 1,
          dx: 0,
          dy: 0,
          dWidth: 1,
          dHeight: 1
        };
        dom_img.src = _url;
        temp_can = document.createElement("canvas");
        temp_can.width = dom_img.width;
        temp_can.height = dom_img.height;
        let context0 = temp_can.getContext("2d");
        context0 == null ? void 0 : context0.drawImage(dom_img, 0, 0, dom_img.width, dom_img.height);
        setDataSize(getOriginalWidth());
        return true;
      });
    }
    function setLoading(_b) {
      if (_b) {
        dom_loading.style.display = "block";
      } else {
        dom_loading.style.display = "none";
      }
    }
    function getMargin() {
      return { top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft };
    }
    function setMargin(_top, _right, _bottom, _left) {
      marginTop = _top;
      marginLeft = _left;
      marginBottom = _bottom;
      marginRight = _right;
    }
    function getDpizoom() {
      return dpizoom;
    }
    function setDpizoom(val, isOnlyRun = false) {
      if (val == -1) {
        val = window.devicePixelRatio;
        if (isOnlyRun === false) {
          isDpizoomAUto = true;
        }
      } else {
        if (isOnlyRun === false) {
          isDpizoomAUto = false;
        }
      }
      dom_dpizoom.style.zoom = 1 / val;
      dpizoom = val;
    }
    function getOverflowDistance() {
      return overflowDistance;
    }
    function setOverflowDistance(_v) {
      overflowDistance = _v;
    }
    function getRendering() {
      return rendering;
    }
    function setRendering(_renderin, isOnlyRun = false) {
      if (isOnlyRun === false) {
        rendering = _renderin;
      }
      if (_renderin === TieefseeviewImageRendering["auto"]) {
        dom_data.style.imageRendering = "auto";
      } else if (_renderin === TieefseeviewImageRendering["pixelated"]) {
        dom_data.style.imageRendering = "pixelated";
      } else if (_renderin === TieefseeviewImageRendering["auto-pixelated"]) {
        if (getZoomRatio() > 1) {
          dom_data.style.imageRendering = "pixelated";
        } else {
          dom_data.style.imageRendering = "auto";
        }
      }
    }
    function setEventChangeZoom(_func) {
      eventChangeZoom = _func;
    }
    function getEventChangeZoom() {
      return eventChangeZoom;
    }
    function setEventChangeDeg(_func) {
      eventChangeDeg = _func;
    }
    function getEventChangeDeg() {
      return eventChangeDeg;
    }
    function setEventChangeMirror(_func) {
      eventChangeMirror = _func;
    }
    function getEventChangeMirror() {
      return eventChangeMirror;
    }
    function setEventChangeXY(_func) {
      eventChangeXY = _func;
    }
    function getEventChangeXY() {
      return eventChangeXY;
    }
    function getZoomRatio() {
      return dom_data.offsetWidth / getOriginalWidth();
    }
    function _eventLimitMax() {
      if (getOriginalWidth() > 100 || getOriginalHeight() > 100) {
        if (getZoomRatio() > 50) {
          return true;
        }
      }
      if (dom_data.offsetWidth > 999999 || dom_data.offsetHeight > 999999) {
        return true;
      }
      return false;
    }
    function _eventLimitMin() {
      if (getOriginalWidth() <= 10 || getOriginalHeight() <= 10) {
        if (dom_data.offsetWidth <= 1 || dom_data.offsetHeight <= 1) {
          return true;
        }
      } else {
        if (dom_data.offsetWidth <= 10 || dom_data.offsetHeight <= 10) {
          return true;
        }
      }
      return false;
    }
    function getEventLimitMax() {
      return eventLimitMax;
    }
    function setEventLimitMax(_func) {
      eventLimitMax = _func;
    }
    function getEventLimitMin() {
      return eventLimitMin;
    }
    function setEventLimitMin(_func) {
      eventLimitMin = _func;
    }
    function setAlign(_type) {
      let type_horizontal = "center";
      let type_vertical = "center";
      let x = 0;
      let y = 0;
      if (_type === TieefseeviewAlignType["none"]) {
        return;
      }
      if (_type === TieefseeviewAlignType["T"]) {
        type_horizontal = "center";
        type_vertical = "top";
      }
      if (_type === TieefseeviewAlignType["R"]) {
        type_horizontal = "right";
        type_vertical = "center";
      }
      if (_type === TieefseeviewAlignType["L"]) {
        type_horizontal = "left";
        type_vertical = "center";
      }
      if (_type === TieefseeviewAlignType["B"]) {
        type_horizontal = "center";
        type_vertical = "bottom";
      }
      if (_type === TieefseeviewAlignType["RT"]) {
        type_horizontal = "right";
        type_vertical = "top";
      }
      if (_type === TieefseeviewAlignType["RB"]) {
        type_horizontal = "right";
        type_vertical = "bottom";
      }
      if (_type === TieefseeviewAlignType["LT"]) {
        type_horizontal = "left";
        type_vertical = "top";
      }
      if (_type === TieefseeviewAlignType["LB"]) {
        type_horizontal = "left";
        type_vertical = "bottom";
      }
      if (_type === TieefseeviewAlignType["C"]) {
        type_horizontal = "center";
        type_vertical = "center";
      }
      if (type_horizontal === "left") {
        x = marginLeft;
      }
      if (type_horizontal === "center") {
        x = (dom_dpizoom.offsetWidth - dom_con.offsetWidth) / 2;
      }
      if (type_horizontal === "right") {
        x = dom_dpizoom.offsetWidth - dom_con.offsetWidth - marginRight;
      }
      if (type_vertical === "top") {
        y = marginTop;
      }
      if (type_vertical === "center") {
        y = (dom_dpizoom.offsetHeight - dom_con.offsetHeight) / 2;
      }
      if (type_vertical === "bottom") {
        y = dom_dpizoom.offsetHeight - dom_con.offsetHeight - marginBottom;
      }
      setXY(x, y, 0);
      init_point(false);
    }
    function getOriginalWidth() {
      return temp_originalWidth;
    }
    function getOriginalHeight() {
      return temp_originalHeight;
    }
    function setDataSize(_width) {
      if (dataType === "img") {
        let ratio = getOriginalHeight() / getOriginalWidth();
        dom_data.style.width = _width + "px";
        dom_data.style.height = _width * ratio + "px";
        dom_img.style.width = _width + "px";
        dom_img.style.height = _width * ratio + "px";
      }
      if (dataType === "bigimg") {
        let ratio = getOriginalHeight() / getOriginalWidth();
        let _w = _width;
        let _h = _width * ratio;
        dom_data.style.width = _w + "px";
        dom_data.style.height = _h + "px";
      }
    }
    var temp_drawImage = {
      scale: 1,
      sx: 0,
      sy: 0,
      sWidth: 1,
      sHeight: 1,
      dx: 0,
      dy: 0,
      dWidth: 1,
      dHeight: 1
    };
    function bigimgDraw() {
      return __async(this, null, function* () {
        if (dataType !== "bigimg") {
          return;
        }
        if (getOriginalWidth() === 0) {
          return;
        }
        let _w = toNumber(dom_data.style.width);
        let _h = toNumber(dom_data.style.height);
        let _margin = 35;
        let _scale = _w / getOriginalWidth();
        let radio_can = 1;
        if (_w > getOriginalWidth()) {
          radio_can = _w / getOriginalWidth();
        }
        dom_bigimg.style.width = _w + "px";
        dom_bigimg.style.height = _h + "px";
        let img_left = -toNumber(dom_con.style.left);
        let img_top = -toNumber(dom_con.style.top);
        let origPoint1 = getOrigPoint(img_left, img_top, _w, _h, degNow);
        let origPoint2 = getOrigPoint(img_left + dom_dpizoom.offsetWidth, img_top, _w, _h, degNow);
        let origPoint3 = getOrigPoint(img_left + dom_dpizoom.offsetWidth, img_top + dom_dpizoom.offsetHeight, _w, _h, degNow);
        let origPoint4 = getOrigPoint(img_left, img_top + dom_dpizoom.offsetHeight, _w, _h, degNow);
        function calc(_p) {
          if (mirrorVertical) {
            _p.y = toNumber(dom_data.style.height) - _p.y;
          }
          if (mirrorHorizontal) {
            _p.x = toNumber(dom_data.style.width) - _p.x;
          }
          return _p;
        }
        origPoint1 = calc(origPoint1);
        origPoint2 = calc(origPoint2);
        origPoint3 = calc(origPoint3);
        origPoint4 = calc(origPoint4);
        img_left = origPoint1.x;
        img_top = origPoint1.y;
        if (img_left > origPoint1.x) {
          img_left = origPoint1.x;
        }
        if (img_left > origPoint2.x) {
          img_left = origPoint2.x;
        }
        if (img_left > origPoint3.x) {
          img_left = origPoint3.x;
        }
        if (img_left > origPoint4.x) {
          img_left = origPoint4.x;
        }
        if (img_top > origPoint1.y) {
          img_top = origPoint1.y;
        }
        if (img_top > origPoint2.y) {
          img_top = origPoint2.y;
        }
        if (img_top > origPoint3.y) {
          img_top = origPoint3.y;
        }
        if (img_top > origPoint4.y) {
          img_top = origPoint4.y;
        }
        let viewWidth = 1;
        let viewHeight = 1;
        if (viewWidth < origPoint1.x) {
          viewWidth = origPoint1.x;
        }
        if (viewWidth < origPoint2.x) {
          viewWidth = origPoint2.x;
        }
        if (viewWidth < origPoint3.x) {
          viewWidth = origPoint3.x;
        }
        if (viewWidth < origPoint4.x) {
          viewWidth = origPoint4.x;
        }
        if (viewHeight < origPoint1.y) {
          viewHeight = origPoint1.y;
        }
        if (viewHeight < origPoint2.y) {
          viewHeight = origPoint2.y;
        }
        if (viewHeight < origPoint3.y) {
          viewHeight = origPoint3.y;
        }
        if (viewHeight < origPoint4.y) {
          viewHeight = origPoint4.y;
        }
        viewWidth = viewWidth - img_left;
        viewHeight = viewHeight - img_top;
        let sx = (img_left - _margin) / _scale;
        let sy = (img_top - _margin) / _scale;
        let sWidth = (viewWidth + _margin * 2) / _scale * radio_can;
        let sHeight = (viewHeight + _margin * 2) / _scale * radio_can;
        let dx = img_left - _margin;
        let dy = img_top - _margin;
        let dWidth = viewWidth + _margin * 2;
        let dHeight = viewHeight + _margin * 2;
        if (_scale != temp_drawImage.scale || Math.abs(dx - temp_drawImage.dx) > _margin / 2 || Math.abs(dy - temp_drawImage.dy) > _margin / 2 || Math.abs(sWidth - temp_drawImage.sWidth) > _margin / 2 || Math.abs(sHeight - temp_drawImage.sHeight) > _margin / 2) {
          temp_drawImage = {
            scale: _scale,
            sx,
            sy,
            sWidth,
            sHeight,
            dx,
            dy,
            dWidth,
            dHeight
          };
          dom_bigimg_canvas.width = (viewWidth + _margin * 2) / radio_can;
          dom_bigimg_canvas.height = (viewHeight + _margin * 2) / radio_can;
          dom_bigimg_canvas.style.width = viewWidth + _margin * 2 + "px";
          dom_bigimg_canvas.style.height = viewHeight + _margin * 2 + "px";
          dom_bigimg_canvas.style.left = dx + "px";
          dom_bigimg_canvas.style.top = dy + "px";
          let context = dom_bigimg_canvas.getContext("2d");
          temp_canvasSN += 1;
          let tc = temp_canvasSN;
          let resizeQuality = "medium";
          if (getOriginalWidth() * getOriginalHeight() > 8e3 * 8e3) {
            context.drawImage(temp_can, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight);
          } else if (_scale >= 1) {
            context.drawImage(temp_can, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight);
          } else if (sWidth > getOriginalWidth() && sHeight > getOriginalHeight()) {
            sWidth = getOriginalWidth();
            sHeight = getOriginalHeight();
            sx = dx * -1;
            sy = dy * -1;
            dWidth = getOriginalWidth() * _scale;
            dHeight = getOriginalHeight() * _scale;
            yield createImageBitmap(temp_can, 0, 0, sWidth, sHeight, { resizeWidth: dWidth, resizeHeight: dHeight, resizeQuality }).then(function(sprites) {
              if (tc !== temp_canvasSN) {
                return;
              }
              context.drawImage(sprites, sx, sy);
            });
          } else if (sWidth > getOriginalWidth() == false && sHeight > getOriginalHeight()) {
            sHeight = getOriginalHeight();
            sy = dy * -1;
            dHeight = getOriginalHeight() * _scale;
            yield createImageBitmap(temp_can, sx, 0, sWidth, sHeight, { resizeWidth: dWidth, resizeHeight: dHeight, resizeQuality }).then(function(sprites) {
              if (tc !== temp_canvasSN) {
                return;
              }
              context.drawImage(sprites, 0, sy);
              if (sx < 1) {
                context.clearRect(0, 0, sx * -1 * _scale, dom_bigimg_canvas.height);
              }
              let right = (getOriginalWidth() - sx - sWidth) * _scale;
              if (right * -1 < _margin + marginRight + 1) {
                context.clearRect(dom_bigimg_canvas.width + right, 0, _margin + marginRight, dom_bigimg_canvas.height);
              }
            });
          } else if (sWidth > getOriginalWidth() && sHeight > getOriginalHeight() == false) {
            sWidth = getOriginalWidth();
            sx = dx * -1;
            dWidth = getOriginalWidth() * _scale;
            yield createImageBitmap(temp_can, 0, sy, sWidth, sHeight, { resizeWidth: dWidth, resizeHeight: dHeight, resizeQuality }).then(function(sprites) {
              if (tc !== temp_canvasSN) {
                return;
              }
              context.drawImage(sprites, sx, 0);
              if (sy < 1) {
                context.clearRect(0, 0, dom_bigimg_canvas.width, sy * -1 * _scale);
              }
              let bottom = (getOriginalHeight() - sy - sHeight) * _scale;
              if (bottom * -1 < _margin + marginBottom + 1) {
                context.clearRect(0, dom_bigimg_canvas.height + bottom, dom_bigimg_canvas.width, _margin + marginBottom);
              }
            });
          } else if (sWidth > getOriginalWidth() == false && sHeight > getOriginalHeight() == false) {
            yield createImageBitmap(temp_can, sx, sy, sWidth, sHeight, { resizeWidth: dWidth, resizeHeight: dHeight, resizeQuality }).then(function(sprites) {
              if (tc !== temp_canvasSN) {
                return;
              }
              context.drawImage(sprites, 0, 0);
              if (sx < 1) {
                context.clearRect(0, 0, sx * -1 * _scale, dom_bigimg_canvas.height);
              }
              let right = (getOriginalWidth() - sx - sWidth) * _scale;
              if (right * -1 < _margin + marginRight + 1) {
                context.clearRect(dom_bigimg_canvas.width + right, 0, _margin + marginRight, dom_bigimg_canvas.height);
              }
              if (sy < 1) {
                context.clearRect(0, 0, dom_bigimg_canvas.width, sy * -1 * _scale);
              }
              let bottom = (getOriginalHeight() - sy - sHeight) * _scale;
              if (bottom * -1 < _margin + marginBottom + 1) {
                context.clearRect(0, dom_bigimg_canvas.height + bottom, dom_bigimg_canvas.width, _margin + marginBottom);
              }
            });
          }
        }
      });
    }
    function zoomFull(_type, _val) {
      if (_type === void 0) {
        _type = TieefseeviewZoomType["full-wh"];
      }
      if (_val === void 0) {
        _val = 100;
      }
      let rect = getRotateRect(getOriginalWidth(), getOriginalHeight(), 0, 0, degNow);
      let dom_con_offsetWidth = rect.rectWidth;
      let dom_con_offsetHeight = rect.rectHeight;
      if (_type === TieefseeviewZoomType["full-100%"]) {
        if (getOriginalWidth() > dom_dpizoom.offsetWidth - marginLeft - marginRight || getOriginalHeight() > dom_dpizoom.offsetHeight - marginTop - marginBottom) {
          _type = TieefseeviewZoomType["full-wh"];
        } else {
          _type = TieefseeviewZoomType["100%"];
        }
      }
      if (_type === TieefseeviewZoomType["100%"]) {
        setDataSize(getOriginalWidth());
      }
      if (_type === TieefseeviewZoomType["full-wh"]) {
        let ratio_w = dom_con_offsetWidth / (dom_dpizoom.offsetWidth - marginLeft - marginRight);
        let ratio_h = dom_con_offsetHeight / (dom_dpizoom.offsetHeight - marginTop - marginBottom);
        if (ratio_w > ratio_h) {
          _type = TieefseeviewZoomType["full-w"];
        } else {
          _type = TieefseeviewZoomType["full-h"];
        }
      }
      if (_type === TieefseeviewZoomType["full-w"]) {
        _val = 100;
        _type = TieefseeviewZoomType["%-w"];
      }
      if (_type === TieefseeviewZoomType["full-h"]) {
        _val = 100;
        _type = TieefseeviewZoomType["%-h"];
      }
      if (_type === TieefseeviewZoomType["%-w"]) {
        let w = dom_dpizoom.offsetWidth - marginLeft - marginRight - 5;
        if (w < 10) {
          w = 10;
        }
        let ratio = getOriginalWidth() / dom_con_offsetWidth;
        setDataSize(w * ratio * (_val / 100));
      }
      if (_type === TieefseeviewZoomType["%-h"]) {
        let w = dom_dpizoom.offsetHeight - marginTop - marginBottom - 5;
        if (w < 10) {
          w = 10;
        }
        let ratio = getOriginalWidth() / dom_con_offsetWidth;
        let ratio_xy = dom_con_offsetWidth / dom_con_offsetHeight;
        setDataSize(w * ratio * ratio_xy * (_val / 100));
      }
      if (_type === TieefseeviewZoomType["px-w"]) {
        let ratio = getOriginalWidth() / dom_con_offsetWidth;
        setDataSize(toNumber(_val) * ratio);
      }
      if (_type === TieefseeviewZoomType["px-h"]) {
        let ratio = getOriginalWidth() / dom_con_offsetWidth;
        let ratio_xy = dom_con_offsetWidth / dom_con_offsetHeight;
        setDataSize(toNumber(_val) * ratio * ratio_xy);
      }
      setXY(toNumber(dom_con.style.left), toNumber(dom_con.style.top), 0);
      init_point(false);
      eventChangeZoom(getZoomRatio());
      setRendering(rendering);
    }
    function zoomIn(_x, _y, _zoomRatio, _rendering) {
      if (_x === void 0) {
        _x = dom_dpizoom.offsetWidth / 2;
      }
      if (_y === void 0) {
        _y = dom_dpizoom.offsetHeight / 2;
      }
      if (_zoomRatio === void 0) {
        _zoomRatio = zoomRatio;
      }
      if (_rendering === void 0) {
        _rendering = rendering;
      }
      setRendering(_rendering, true);
      if (_zoomRatio === 1) {
        return;
      }
      if (_zoomRatio > 1 && eventLimitMax()) {
        return;
      }
      if (_zoomRatio < 1 && eventLimitMin()) {
        return;
      }
      let w = dom_data.offsetWidth;
      w *= _zoomRatio;
      setDataSize(w);
      var xxx = _x - toNumber(dom_con.style.left);
      var yyy = _y - toNumber(dom_con.style.top);
      var xx2 = dom_con.offsetWidth - dom_con.offsetWidth / _zoomRatio;
      var yy2 = dom_con.offsetHeight - dom_con.offsetHeight / _zoomRatio;
      setXY(toNumber(dom_con.style.left) - xxx / dom_con.offsetWidth * xx2 * _zoomRatio, toNumber(dom_con.style.top) - yyy / dom_con.offsetHeight * yy2 * _zoomRatio, 0);
      init_point(false);
      eventChangeZoom(getZoomRatio());
    }
    function zoomOut(_x, _y, _zoomRatio) {
      if (_zoomRatio === void 0) {
        _zoomRatio = 1 / zoomRatio;
      }
      zoomIn(_x, _y, _zoomRatio);
    }
    function getEventMouseWheel() {
      return eventMouseWheel;
    }
    function setEventMouseWheel(_func) {
      eventMouseWheel = _func;
    }
    function getIsOverflowX() {
      if (dom_con.offsetWidth + marginLeft + marginRight > dom_dpizoom.offsetWidth) {
        return true;
      }
      return false;
    }
    function getIsOverflowY() {
      if (dom_con.offsetHeight + marginTop + marginBottom > dom_dpizoom.offsetHeight) {
        return true;
      }
      return false;
    }
    function init_scroll() {
      scrollX.init_size(dom_con.offsetWidth + marginLeft + marginRight, dom_dpizoom.offsetWidth, toNumber(dom_con.style.left) * -1 + marginLeft);
      scrollY.init_size(dom_con.offsetHeight + marginTop + marginBottom, dom_dpizoom.offsetHeight, toNumber(dom_con.style.top) * -1 + marginTop);
    }
    function init_point(isAnimation) {
      return __async(this, null, function* () {
        dom_con.style.width = dom_data.getBoundingClientRect().width + "px";
        dom_con.style.height = dom_data.getBoundingClientRect().height + "px";
        init_scroll();
        if (isAnimation === void 0) {
          isAnimation = true;
        }
        let bool_w = getIsOverflowX();
        let bool_h = getIsOverflowY();
        let top = toNumber(dom_con.style.top);
        let left = toNumber(dom_con.style.left);
        if (bool_w && bool_h) {
          if (toNumber(dom_con.style.top) > marginTop) {
            top = marginTop;
          }
          if (toNumber(dom_con.style.left) > marginLeft) {
            left = marginLeft;
          }
          let t = dom_dpizoom.offsetHeight - dom_con.offsetHeight - marginBottom;
          if (toNumber(dom_con.style.top) < t) {
            top = t;
          }
          let l = dom_dpizoom.offsetWidth - dom_con.offsetWidth - marginRight;
          if (toNumber(dom_con.style.left) < l) {
            left = l;
          }
        }
        if (bool_w === false && bool_h) {
          if (toNumber(dom_con.style.top) > marginTop) {
            top = marginTop;
          }
          let t = dom_dpizoom.offsetHeight - dom_con.offsetHeight - marginBottom;
          if (toNumber(dom_con.style.top) < t) {
            top = t;
          }
          left = (dom_dpizoom.offsetWidth - dom_con.offsetWidth) / 2;
        }
        if (bool_w && bool_h === false) {
          if (toNumber(dom_con.style.left) > marginLeft) {
            left = marginLeft;
          }
          let l = dom_dpizoom.offsetWidth - dom_con.offsetWidth - marginRight;
          if (toNumber(dom_con.style.left) < l) {
            left = l;
          }
          top = (dom_dpizoom.offsetHeight - dom_con.offsetHeight) / 2;
        }
        if (bool_w === false && bool_h === false) {
          left = (dom_dpizoom.offsetWidth - dom_con.offsetWidth) / 2;
          top = (dom_dpizoom.offsetHeight - dom_con.offsetHeight) / 2;
        }
        if (isAnimation) {
          yield setXY(left, top, 100);
        } else {
          setXY(left, top, 0);
        }
      });
    }
    function setDegForward(_x, _y, isAnimation = true) {
      return __async(this, null, function* () {
        var deg = degNow;
        deg = (Math.floor(deg / 90) + 1) * 90;
        yield setDeg(deg, _x, _y, isAnimation);
      });
    }
    function setDegReverse(_x, _y, isAnimation = true) {
      return __async(this, null, function* () {
        var deg = degNow;
        deg = (Math.ceil(deg / 90) - 1) * 90;
        yield setDeg(deg, _x, _y, isAnimation);
      });
    }
    function getMirrorHorizontal() {
      return mirrorHorizontal;
    }
    function setMirrorHorizontal(bool, boolAnimation = true) {
      return __async(this, null, function* () {
        if (degNow != 0) {
          setDeg(360 - degNow, void 0, void 0, true);
        }
        mirrorHorizontal = bool;
        eventChangeMirror(mirrorHorizontal, mirrorVertical);
        let left = -toNumber(dom_con.style.left) + dom_dpizoom.offsetWidth / 2;
        let top = -toNumber(dom_con.style.top) + dom_dpizoom.offsetHeight / 2;
        left = dom_data.getBoundingClientRect().width - left;
        let origPoint = getOrigPoint(left, top, toNumber(dom_data.style.width), toNumber(dom_data.style.height), degNow);
        left = origPoint.x;
        top = origPoint.y;
        let rotateRect = getRotateRect(toNumber(dom_data.style.width), toNumber(dom_data.style.height), left, top, degNow);
        left = rotateRect.x;
        top = rotateRect.y;
        top = -top + dom_dpizoom.offsetHeight / 2;
        left = -left + dom_dpizoom.offsetWidth / 2;
        yield setTransform(void 0, void 0, false);
        setXY(left, top, 0);
      });
    }
    function getMirrorVertica() {
      return mirrorVertical;
    }
    function setMirrorVertica(bool, boolAnimation = true) {
      return __async(this, null, function* () {
        if (degNow != 0) {
          setDeg(360 - degNow, void 0, void 0, true);
        }
        mirrorVertical = bool;
        eventChangeMirror(mirrorHorizontal, mirrorVertical);
        let left = -toNumber(dom_con.style.left) + dom_dpizoom.offsetWidth / 2;
        let top = -toNumber(dom_con.style.top) + dom_dpizoom.offsetHeight / 2;
        top = dom_data.getBoundingClientRect().height - top;
        let origPoint = getOrigPoint(left, top, toNumber(dom_data.style.width), toNumber(dom_data.style.height), degNow);
        left = origPoint.x;
        top = origPoint.y;
        let rotateRect = getRotateRect(toNumber(dom_data.style.width), toNumber(dom_data.style.height), left, top, degNow);
        left = rotateRect.x;
        top = rotateRect.y;
        top = -top + dom_dpizoom.offsetHeight / 2;
        left = -left + dom_dpizoom.offsetWidth / 2;
        yield setTransform(void 0, void 0, false);
        setXY(left, top, 0);
      });
    }
    function getDeg() {
      return degNow;
    }
    function setDeg(_deg, _x, _y, isAnimation = true) {
      return __async(this, null, function* () {
        degNow = _deg;
        eventChangeDeg(degNow);
        yield setTransform(_x, _y, isAnimation);
      });
    }
    function getXY() {
      return {
        x: toNumber(dom_con.style.left),
        y: toNumber(dom_con.style.top)
      };
    }
    function setXY(_left, _top, _sp) {
      return __async(this, null, function* () {
        if (_top === void 0) {
          _top = toNumber(dom_con.style.top);
        }
        if (_left === void 0) {
          _left = toNumber(dom_con.style.left);
        }
        eventChangeXY(_left, _top);
        if (_sp <= 0) {
          dom_con.style.top = _top + "px";
          dom_con.style.left = _left + "px";
          init_scroll();
        } else {
          yield new Promise((resolve, reject) => {
            $(dom_con).animate({
              "top": _top,
              "left": _left
            }, {
              step: function(now, fx) {
                let data = $(dom_data).animate()[0];
                dom_con.style.top = data.top + "px";
                dom_con.style.left = data.left + "px";
                bigimgDraw();
                init_scroll();
              },
              duration: _sp,
              start: () => {
              },
              complete: () => {
                dom_con.style.top = _top + "px";
                dom_con.style.left = _left + "px";
                resolve(0);
              },
              easing: "easeOutExpo"
            });
          });
        }
        bigimgDraw();
      });
    }
    function move(type, distance = 100) {
      const point = getXY();
      if (type === "up") {
        setXY(point.x, point.y + distance, 0);
      }
      if (type === "down") {
        setXY(point.x, point.y - distance, 0);
      }
      if (type === "right") {
        setXY(point.x + distance, point.y, 0);
      }
      if (type === "left") {
        setXY(point.x - distance, point.y, 0);
      }
      init_point(false);
    }
    function transformRefresh(boolAnimation = true) {
      return __async(this, null, function* () {
        if (mirrorVertical === true) {
          yield setMirrorVertica(false);
        }
        if (mirrorHorizontal === true) {
          yield setMirrorHorizontal(false);
        }
        yield setDeg(0, void 0, void 0, boolAnimation);
      });
    }
    function setTransform(_x, _y, isAnimation = true) {
      return __async(this, null, function* () {
        $(dom_data).stop(true, false);
        let duration = transformDuration;
        if (isAnimation == false) {
          duration = 0;
        }
        let scaleX = 1;
        if (mirrorHorizontal === true) {
          scaleX = -1;
        }
        let scaleY = 1;
        if (mirrorVertical === true) {
          scaleY = -1;
        }
        yield new Promise((resolve, reject) => {
          $(dom_data).animate({
            "transform_rotate": degNow,
            "transform_scaleX": scaleX,
            "transform_scaleY": scaleY
          }, {
            start: () => {
            },
            step: function(now, fx) {
              let andata = $(dom_data).animate()[0];
              if (_x === void 0) {
                _x = dom_dpizoom.offsetWidth / 2;
              }
              if (_y === void 0) {
                _y = dom_dpizoom.offsetHeight / 2;
              }
              let _x2 = _x - toNumber(dom_con.style.left);
              let _y2 = _y - toNumber(dom_con.style.top);
              let _degNow = dom_data.getAttribute("transform_rotate");
              if (_degNow === null) {
                _degNow = "0";
              }
              let rect0 = getOrigPoint(_x2, _y2, dom_data.offsetWidth, dom_data.offsetHeight, toNumber(_degNow));
              let x4 = rect0.x;
              let y4 = rect0.y;
              let rect2 = getRotateRect(dom_data.offsetWidth, dom_data.offsetHeight, x4, y4, andata.transform_rotate);
              dom_data.style.transform = `rotate(${andata.transform_rotate}deg) scaleX(${andata.transform_scaleX}) scaleY(${andata.transform_scaleY})`;
              dom_data.setAttribute("transform_rotate", andata.transform_rotate);
              setXY(_x - rect2.x, _y - rect2.y, 0);
              init_point(false);
            },
            duration,
            complete: () => {
              if (degNow <= 0 || degNow >= 360) {
                degNow = degNow - Math.floor(degNow / 360) * 360;
              }
              $(dom_data).animate({ "transform_rotate": degNow, "transform_scaleX": scaleX, "transform_scaleY": scaleY }, { duration: 0 });
              dom_data.style.transform = `rotate(${degNow}deg) scaleX(${scaleX}) scaleY(${scaleY})`;
              dom_data.setAttribute("transform_rotate", degNow.toString());
              init_point(false);
              resolve(0);
            },
            easing: "linear"
          });
        });
      });
    }
    EventChangePixelRatio(() => {
      if (isDpizoomAUto === true) {
        setDpizoom(window.devicePixelRatio, true);
      }
    });
    function EventChangePixelRatio(func) {
      let remove = null;
      const updatePixelRatio = () => {
        if (remove != null) {
          remove();
        }
        let mqString = `(resolution: ${window.devicePixelRatio}dppx)`;
        let media = matchMedia(mqString);
        media.addListener(updatePixelRatio);
        remove = function() {
          media.removeListener(updatePixelRatio);
        };
        func();
      };
      updatePixelRatio();
    }
    function toNumber(t) {
      if (typeof t === "number") {
        return t;
      }
      if (typeof t === "string") {
        return Number(t.replace("px", ""));
      }
      return 0;
    }
    function vectorRotate(vector, angle, origin = { x: 0, y: 0 }) {
      angle = angle * Math.PI / 180;
      let cosA = Math.cos(angle);
      let sinA = Math.sin(angle);
      var x1 = (vector.x - origin.x) * cosA - (vector.y - origin.y) * sinA;
      var y1 = (vector.x - origin.x) * sinA + (vector.y - origin.y) * cosA;
      return {
        x: origin.x + x1,
        y: origin.y + y1
      };
    }
    function getRotateRect(width, height, x, y, deg) {
      let div = document.querySelector(".js--tiefseeview-temporary");
      let divsub = document.querySelector(".js--tiefseeview-temporary .js--tiefseeview-temporary_sub");
      if (div === null) {
        div = document.createElement("div");
        div.style.position = "fixed";
        div.style.pointerEvents = "none";
        div.setAttribute("class", "js--tiefseeview-temporary");
        div.innerHTML = `<div class="js--tiefseeview-temporary_sub"></div>`;
        document.body.appendChild(div);
        divsub = document.querySelector(".js--tiefseeview-temporary .js--tiefseeview-temporary_sub");
        divsub.style.position = "absolute";
      }
      divsub.style.left = x + "px";
      divsub.style.top = y + "px";
      div.style.width = width + "px";
      div.style.height = height + "px";
      div.style.transform = `rotate(${deg}deg)`;
      let divRect = div.getBoundingClientRect();
      let divsubRect = divsub.getBoundingClientRect();
      return {
        rectWidth: divRect.width,
        rectHeight: divRect.height,
        x: divsubRect.x - divRect.x,
        y: divsubRect.y - divRect.y
      };
    }
    function rotateVector(vec, deg) {
      let theta = Math.PI * deg / 180;
      let cos = Math.cos(theta), sin = Math.sin(theta);
      return {
        x: vec.x * cos - vec.y * sin,
        y: vec.x * sin + vec.y * cos
      };
    }
    function getRotatedOrig(w, h, deg) {
      let points = [
        { x: 0, y: 0 },
        { x: 0, y: h },
        { x: w, y: 0 },
        { x: w, y: h }
      ].map((p) => rotateVector(p, deg));
      let minX = Math.min.apply(null, points.map((p) => p.x)), minY = Math.min.apply(null, points.map((p) => p.y));
      return {
        x: -minX,
        y: -minY
      };
    }
    function getOrigPoint(x, y, w, h, deg) {
      let p = getRotatedOrig(w, h, deg);
      let v = {
        x: x - p.x,
        y: y - p.y
      };
      return rotateVector(v, -deg);
    }
  }
}
class TieefseeviewScroll {
  constructor(_dom, _type) {
    var dom_scroll = _dom;
    var dom_bg = dom_scroll.querySelector(".scroll-bg");
    var dom_box = dom_scroll.querySelector(".scroll-box");
    var type = _type;
    var contentHeight = 0;
    var panelHeight = 0;
    var _eventChange = (v, mode) => {
    };
    var hammer_scroll = new Hammer(dom_scroll, {});
    var startLeft = 0;
    var startTop = 0;
    this.getEventChange = getEventChange;
    this.setEventChange = setEventChange;
    this.setTop = setTop;
    this.getTop = getTop;
    this.setValue = setValue;
    this.init_size = init_size;
    dom_scroll.addEventListener("wheel", (ev) => {
      MouseWheel(ev);
    }, true);
    const MouseWheel = (e) => {
      e.preventDefault();
      e = e || window.event;
      let v = getTop();
      if (e.deltaX > 0 || e.deltaY > 0) {
        setTop(v + 10, "wheel");
      } else {
        setTop(v - 10, "wheel");
      }
    };
    dom_scroll.addEventListener("mousedown", (ev) => {
      touchStart(ev);
    });
    dom_scroll.addEventListener("touchstart", (ev) => {
      touchStart(ev);
    });
    const touchStart = (ev) => {
      ev.preventDefault();
      startLeft = toNumber(dom_box.style.left);
      startTop = toNumber(dom_box.style.top);
    };
    hammer_scroll.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_VERTICAL });
    hammer_scroll.on("pan", (ev) => {
      ev.preventDefault();
      let deltaX = ev["deltaX"];
      let deltaY = ev["deltaY"];
      if (type === "y") {
        let top = startTop + deltaY;
        setTop(top, "pan");
      }
      if (type === "x") {
        let left = startLeft + deltaX;
        setTop(left, "pan");
      }
      dom_scroll.setAttribute("action", "true");
    });
    hammer_scroll.on("panend", (ev) => {
      dom_scroll.setAttribute("action", "");
    });
    function init_size(_contentHeight, _panelHeight, _top) {
      if (_top === void 0) {
        _top = 0;
      }
      contentHeight = _contentHeight;
      panelHeight = _panelHeight;
      if (type === "y") {
        let h = _panelHeight / _contentHeight * dom_scroll.offsetHeight;
        if (h < 30) {
          h = 30;
        }
        dom_box.style.height = h + "px";
      }
      if (type === "x") {
        let l = _panelHeight / _contentHeight * dom_scroll.offsetWidth;
        if (l < 30) {
          l = 30;
        }
        dom_box.style.width = l + "px";
      }
      if (_contentHeight - 3 >= _panelHeight) {
        dom_scroll.style.opacity = "1";
        dom_scroll.style.pointerEvents = "";
      } else {
        dom_scroll.style.opacity = "0";
        dom_scroll.style.pointerEvents = "none";
      }
      setValue(_top);
    }
    function setValue(v) {
      v = v / (contentHeight - panelHeight);
      if (type === "y") {
        v = v * (dom_scroll.offsetHeight - dom_box.offsetHeight);
      }
      if (type === "x") {
        v = v * (dom_scroll.offsetWidth - dom_box.offsetWidth);
      }
      setTop(v, "set");
    }
    function getTop() {
      if (type === "y") {
        return toNumber(dom_box.style.top);
      }
      if (type === "x") {
        return toNumber(dom_box.style.left);
      }
      return 0;
    }
    function setTop(v, mode) {
      v = toNumber(v);
      if (type === "y") {
        if (v < 0) {
          v = 0;
        }
        if (v > dom_scroll.offsetHeight - dom_box.offsetHeight) {
          v = dom_scroll.offsetHeight - dom_box.offsetHeight;
        }
        dom_box.style.top = v + "px";
      }
      if (type === "x") {
        if (v < 0) {
          v = 0;
        }
        if (v > dom_scroll.offsetWidth - dom_box.offsetWidth) {
          v = dom_scroll.offsetWidth - dom_box.offsetWidth;
        }
        dom_box.style.left = v + "px";
      }
      eventChange(mode);
    }
    function getEventChange() {
      return _eventChange;
    }
    function setEventChange(func = (v, mode) => {
    }) {
      _eventChange = func;
    }
    function eventChange(mode) {
      let x = 0;
      if (type === "y") {
        x = dom_scroll.offsetHeight - dom_box.offsetHeight;
        x = toNumber(dom_box.style.top) / x;
        x = x * (contentHeight - panelHeight);
      }
      if (type === "x") {
        x = dom_scroll.offsetWidth - dom_box.offsetWidth;
        x = toNumber(dom_box.style.left) / x;
        x = x * (contentHeight - panelHeight);
      }
      _eventChange(x, mode);
    }
    function toNumber(t) {
      if (typeof t === "number") {
        return t;
      }
      if (typeof t === "string") {
        return Number(t.replace("px", ""));
      }
      return 0;
    }
  }
}
var TieefseeviewAlignType = /* @__PURE__ */ ((TieefseeviewAlignType2) => {
  TieefseeviewAlignType2[TieefseeviewAlignType2["T"] = 0] = "T";
  TieefseeviewAlignType2[TieefseeviewAlignType2["R"] = 1] = "R";
  TieefseeviewAlignType2[TieefseeviewAlignType2["B"] = 2] = "B";
  TieefseeviewAlignType2[TieefseeviewAlignType2["L"] = 3] = "L";
  TieefseeviewAlignType2[TieefseeviewAlignType2["RT"] = 4] = "RT";
  TieefseeviewAlignType2[TieefseeviewAlignType2["RB"] = 5] = "RB";
  TieefseeviewAlignType2[TieefseeviewAlignType2["LT"] = 6] = "LT";
  TieefseeviewAlignType2[TieefseeviewAlignType2["LB"] = 7] = "LB";
  TieefseeviewAlignType2[TieefseeviewAlignType2["C"] = 8] = "C";
  TieefseeviewAlignType2[TieefseeviewAlignType2["none"] = 9] = "none";
  return TieefseeviewAlignType2;
})(TieefseeviewAlignType || {});
var TieefseeviewZoomType = /* @__PURE__ */ ((TieefseeviewZoomType2) => {
  TieefseeviewZoomType2[TieefseeviewZoomType2["%-w"] = 0] = "%-w";
  TieefseeviewZoomType2[TieefseeviewZoomType2["%-h"] = 1] = "%-h";
  TieefseeviewZoomType2[TieefseeviewZoomType2["px-w"] = 2] = "px-w";
  TieefseeviewZoomType2[TieefseeviewZoomType2["px-h"] = 3] = "px-h";
  TieefseeviewZoomType2[TieefseeviewZoomType2["full-w"] = 4] = "full-w";
  TieefseeviewZoomType2[TieefseeviewZoomType2["full-h"] = 5] = "full-h";
  TieefseeviewZoomType2[TieefseeviewZoomType2["full-wh"] = 6] = "full-wh";
  TieefseeviewZoomType2[TieefseeviewZoomType2["full-100%"] = 7] = "full-100%";
  TieefseeviewZoomType2[TieefseeviewZoomType2["100%"] = 8] = "100%";
  return TieefseeviewZoomType2;
})(TieefseeviewZoomType || {});
var TieefseeviewImageRendering = /* @__PURE__ */ ((TieefseeviewImageRendering2) => {
  TieefseeviewImageRendering2[TieefseeviewImageRendering2["auto"] = 0] = "auto";
  TieefseeviewImageRendering2[TieefseeviewImageRendering2["pixelated"] = 1] = "pixelated";
  TieefseeviewImageRendering2[TieefseeviewImageRendering2["auto-pixelated"] = 2] = "auto-pixelated";
  return TieefseeviewImageRendering2;
})(TieefseeviewImageRendering || {});
