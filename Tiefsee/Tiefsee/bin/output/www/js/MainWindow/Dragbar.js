class Dragbar {
  constructor() {
    let dom_box = document.getElementById("main-fileList");
    let dom_dragbar = document.getElementById("dragbar-mainFileList");
    let temp_val = 0;
    let hammer_dragbar = new Hammer(dom_dragbar);
    let _eventStart = () => {
    };
    let _eventMove = (val) => {
    };
    let _eventEnd = (val) => {
    };
    this.getEventStart = function() {
      return _eventStart;
    };
    this.setEventStart = function(func) {
      _eventStart = func;
    };
    this.getEventMove = function() {
      return _eventMove;
    };
    this.setEventMove = function(func) {
      _eventMove = func;
    };
    this.getEventEnd = function() {
      return _eventEnd;
    };
    this.setEventEnd = function(func) {
      _eventEnd = func;
    };
    this.setEnabled = function(val) {
      if (val) {
        dom_dragbar.style.display = "block";
      } else {
        dom_dragbar.style.display = "none";
      }
    };
    this.init = function init(_dom_box, _dom_dragbar) {
      dom_box = _dom_box;
      dom_dragbar = _dom_dragbar;
    };
    new ResizeObserver(() => {
      dom_dragbar.style.top = dom_box.getBoundingClientRect().top + "px";
      dom_dragbar.style.left = dom_box.getBoundingClientRect().left + dom_box.getBoundingClientRect().width + "px";
      dom_dragbar.style.height = dom_box.getBoundingClientRect().height + "px";
    }).observe(dom_box);
    dom_dragbar.addEventListener("mousedown", (ev) => {
      ev.preventDefault();
      temp_val = toNumber(dom_dragbar.style.left);
      _eventStart();
    });
    dom_dragbar.addEventListener("touchstart", (ev) => {
      ev.preventDefault();
      temp_val = toNumber(dom_dragbar.style.left);
      _eventStart();
    });
    hammer_dragbar.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_VERTICAL });
    hammer_dragbar.on("pan", (ev) => {
      dom_dragbar.setAttribute("active", "true");
      let val = temp_val + ev.deltaX;
      _eventMove(val);
    });
    hammer_dragbar.on("panend", (ev) => {
      dom_dragbar.setAttribute("active", "");
      let val = temp_val + ev.deltaX;
      _eventEnd(val);
    });
  }
}
