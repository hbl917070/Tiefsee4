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
class MainDirList {
  constructor(M) {
    this.init = init;
    this.select = select;
    this.updataLocation = updataLocation;
    this.setStartLocation = setStartLocation;
    this.setHide = setHide;
    this.setEnabled = setEnabled;
    this.setShowNo = setShowNo;
    this.setShowName = setShowName;
    this.setItemWidth = setItemWidth;
    this.setImgNumber = setImgNumber;
    let dom_dirList = document.getElementById("main-dirList");
    let dom_dirListBody = document.getElementById("main-dirListBody");
    let dom_dirListData = document.getElementById("main-dirListData");
    var dom_dragbar_mainDirList = document.getElementById("dragbar-mainDirList");
    var isHide = false;
    var isEnabled = true;
    var isShowNo = true;
    var isShowName = true;
    var itemWidth = 1;
    var itemHeight = 1;
    var imgNumber = 3;
    var temp_loaded = [];
    var temp_start = 0;
    var temp_count = 0;
    var temp_itemHeight = 0;
    var dragbar = new Dragbar();
    dragbar.init(dom_dirList, dom_dragbar_mainDirList, M.dom_mainL);
    dragbar.setEventStart(() => {
    });
    dragbar.setEventMove((val) => {
      if (val < 10) {
        dom_dirList.style.opacity = "0";
        dragbar.setPosition(0);
      } else {
        dom_dirList.style.opacity = "1";
        setItemWidth(val);
      }
    });
    dragbar.setEventEnd((val) => {
      if (val < 10) {
        setEnabled(false);
      }
    });
    dom_dirList.addEventListener("scroll", () => {
      updateItem();
    });
    new ResizeObserver(() => {
      updateItem();
    }).observe(dom_dirList);
    function init() {
      return __async(this, null, function* () {
        temp_start = -999;
        temp_loaded = [];
        temp_itemHeight = -1;
        updateItem();
      });
    }
    function setHide(val) {
      isHide = val;
      if (val) {
        dom_dirList.setAttribute("hide", "true");
        dragbar.setEnabled(false);
      } else {
        dom_dirList.setAttribute("hide", "");
        dragbar.setEnabled(M.config.settings.layout.dirListEnabled);
      }
    }
    function setEnabled(val) {
      if (val) {
        dom_dirList.setAttribute("active", "true");
      } else {
        dom_dirList.setAttribute("active", "");
      }
      M.config.settings.layout.dirListEnabled = val;
      dragbar.setEnabled(val);
      dom_dirList.style.opacity = "1";
      if (isEnabled === val) {
        return;
      }
      isEnabled = val;
      temp_start = -1;
      dom_dirListData.innerHTML = "";
      updateItem();
      setStartLocation();
    }
    function setShowNo(val) {
      if (isShowNo === val) {
        return;
      }
      isShowNo = val;
      temp_start = -1;
      dom_dirListData.innerHTML = "";
      updateItem();
      setStartLocation();
    }
    function setShowName(val) {
      if (isShowName === val) {
        return;
      }
      isShowName = val;
      temp_start = -1;
      dom_dirListData.innerHTML = "";
      updateItem();
      setStartLocation();
    }
    function setImgNumber(val) {
      if (imgNumber === val) {
        return;
      }
      imgNumber = val;
      temp_start = -1;
      dom_dirListData.innerHTML = "";
      updateItem();
      setStartLocation();
    }
    function setItemWidth(val) {
      if (itemWidth === val) {
        return;
      }
      let valMin = 100;
      let valMax = 400;
      if (val <= valMin) {
        val = valMin;
      }
      if (val >= valMax) {
        val = valMax;
      }
      itemWidth = val;
      M.config.settings.layout.dirListShowWidth = val;
      var cssRoot = document.body;
      cssRoot.style.setProperty("--dirList-width", val + "px");
      dragbar.setPosition(val);
      temp_start = -1;
      updateItem();
      setStartLocation();
    }
    function updateItem() {
      if (isEnabled === false) {
        dom_dirListData.innerHTML = "";
        return;
      }
      let arDir = M.fileLoad.getWaitingDir();
      let arDirKey = M.fileLoad.getWaitingDirKey();
      if (arDirKey.length === 0) {
        dom_dirListData.innerHTML = "";
        return;
      }
      let dirListItem = dom_dirListData.querySelector(".dirList-item");
      if (dirListItem === null) {
        newItem(-1, "", []);
        dirListItem = dom_dirListData.querySelector(".dirList-item");
      }
      if (dirListItem !== null) {
        itemHeight = dirListItem.getBoundingClientRect().height + 5;
      }
      if (temp_itemHeight !== itemHeight) {
        dom_dirListBody.style.height = arDirKey.length * itemHeight + 4 + "px";
      }
      temp_itemHeight = itemHeight;
      let start = Math.floor(dom_dirList.scrollTop / itemHeight) - 1;
      let count = Math.floor(dom_dirList.clientHeight / itemHeight) + 5;
      if (start < 0) {
        start = 0;
      }
      if (temp_start === start && temp_count === count) {
        return;
      }
      temp_start = start;
      temp_count = count;
      dom_dirListData.innerHTML = "";
      dom_dirListData.style.marginTop = start * itemHeight + "px";
      let end = start + count;
      if (end > arDirKey.length) {
        end = arDirKey.length;
      }
      for (let i = start; i < end; i++) {
        newItem(i, arDirKey[i], arDir[arDirKey[i]]);
      }
      select();
    }
    function newItem(n, _dirPath, arPath) {
      let len = arPath.length;
      if (len > imgNumber) {
        len = imgNumber;
      }
      let imgHtml = "";
      for (let i = 0; i < len; i++) {
        const path = arPath[i];
        let style = "";
        if (temp_loaded.indexOf(n + "-" + i) !== -1) {
          let imgUrl = getImgUrl(path);
          style = `background-image:url('${imgUrl}')`;
        }
        imgHtml += `<div class="dirList-img dirList-img__${imgNumber}" data-imgid="${i}" style="${style}"></div>`;
      }
      if (len === 0) {
        imgHtml += `<div class="dirList-img dirList-img__${imgNumber}" data-imgid="" style=""></div>`;
      }
      let name = Lib.GetFileName(_dirPath);
      let htmlNo = ``;
      let htmlName = ``;
      if (isShowNo === true) {
        htmlNo = `<div class="dirList-no">${n + 1}</div>`;
      }
      if (isShowName === true) {
        htmlName = `<div class="dirList-name">${name}</div> `;
      }
      let div = newDiv(`
                <div class="dirList-item" data-id="${n}">
                    <div class="dirList-title">
                        ${htmlNo} ${htmlName}
                    </div>
                    <div class="dirList-imgbox">
                        ${imgHtml}   
                    </div>
                </div>
            `);
      dom_dirListData.append(div);
      div.addEventListener("click", () => {
        M.fileLoad.showDir(n);
      });
      if (arPath.length !== 0) {
        setTimeout(() => {
          if (dom_dirListData.contains(div) === false) {
            return;
          }
          for (let i = 0; i < len; i++) {
            const path = arPath[i];
            if (temp_loaded.indexOf(n + "-" + i) === -1) {
              temp_loaded.push(n + "-" + i);
              let _url = getImgUrl(path);
              let domImg = div.getElementsByClassName("dirList-img")[i];
              domImg.style.backgroundImage = `url("${_url}")`;
            }
          }
        }, 30);
      }
      return div;
    }
    function getImgUrl(path) {
      if (Lib.GetExtension(path) === ".svg") {
        return Lib.pathToURL(path);
      }
      return APIURL + "/api/getFileIcon?size=256&path=" + encodeURIComponent(path).replace(/[']/g, "\\'");
    }
    function select() {
      var _a;
      if (isEnabled === false) {
        return;
      }
      (_a = document.querySelector(`.dirList-item[active=true]`)) == null ? void 0 : _a.setAttribute("active", "");
      let id = M.fileLoad.getFlagDir();
      let div = document.querySelector(`.dirList-item[data-id="${id}"]`);
      if (div == null) {
        return;
      }
      div.setAttribute("active", "true");
    }
    function setStartLocation() {
      if (isEnabled === false) {
        return;
      }
      let id = M.fileLoad.getFlagDir();
      let f = (dom_dirList.clientHeight - itemHeight) / 2;
      dom_dirList.scrollTop = id * itemHeight - f;
    }
    function updataLocation() {
      if (isEnabled === false) {
        return;
      }
      let id = M.fileLoad.getFlagDir();
      let start = Math.floor(dom_dirList.scrollTop / itemHeight);
      if (id <= start) {
        dom_dirList.scrollTop = id * itemHeight;
        return;
      }
      let count = Math.floor(dom_dirList.clientHeight / itemHeight);
      let end = (id - count + 1) * itemHeight - dom_dirList.clientHeight % itemHeight + 5;
      if (dom_dirList.scrollTop < end) {
        dom_dirList.scrollTop = end;
      }
    }
  }
}
