class MainFileList {
  constructor(M) {
    this.initFileList = initFileList;
    this.select = select;
    this.updataLocation = updataLocation;
    this.setStartLocation = setStartLocation;
    this.setHide = setHide;
    this.setEnabled = setEnabled;
    this.setShowNo = setShowNo;
    this.setShowName = setShowName;
    this.setItemWidth = setItemWidth;
    let dom_fileList = document.getElementById("main-fileList");
    let dom_fileListBody = document.getElementById("main-fileListBody");
    let dom_fileListData = document.getElementById("main-fileListData");
    var dom_dragbar_mainFileList = document.getElementById("dragbar-mainFileList");
    var isHide = false;
    var isEnabled = true;
    var isShowNo = true;
    var isShowName = true;
    var itemWidth = 1;
    var itemHeight = 1;
    var temp_loaded = [];
    var temp_start = 0;
    var temp_count = 0;
    var temp_itemHeight = 0;
    var dragbar = new Dragbar();
    dragbar.init(dom_fileList, dom_dragbar_mainFileList);
    dragbar.setEventStart(() => {
    });
    dragbar.setEventMove((val) => {
      if (val < 10) {
        dom_dragbar_mainFileList.style.left = "0px";
        dom_fileList.style.opacity = "0";
      } else {
        dom_fileList.style.opacity = "1";
        setItemWidth(val);
      }
    });
    dragbar.setEventEnd((val) => {
      if (val < 10) {
        setEnabled(false);
      }
    });
    dom_fileList.addEventListener("scroll", () => {
      updateItem();
    });
    new ResizeObserver(() => {
      updateItem();
    }).observe(dom_fileList);
    function setHide(val) {
      isHide = val;
      if (val) {
        dom_fileList.setAttribute("hide", "true");
        dragbar.setEnabled(false);
      } else {
        dom_fileList.setAttribute("hide", "");
        dragbar.setEnabled(M.config.settings.layout.fileListEnabled);
      }
    }
    function setEnabled(val) {
      if (val) {
        dom_fileList.setAttribute("active", "true");
      } else {
        dom_fileList.setAttribute("active", "");
      }
      M.config.settings.layout.fileListEnabled = val;
      dragbar.setEnabled(val);
      dom_fileList.style.opacity = "1";
      if (isEnabled === val) {
        return;
      }
      isEnabled = val;
      temp_start = -1;
      dom_fileListData.innerHTML = "";
      updateItem();
      setStartLocation();
    }
    function setShowNo(val) {
      if (isShowNo === val) {
        return;
      }
      isShowNo = val;
      temp_start = -1;
      dom_fileListData.innerHTML = "";
      updateItem();
      setStartLocation();
    }
    function setShowName(val) {
      if (isShowName === val) {
        return;
      }
      isShowName = val;
      temp_start = -1;
      dom_fileListData.innerHTML = "";
      updateItem();
      setStartLocation();
    }
    function setItemWidth(val) {
      if (itemWidth === val) {
        return;
      }
      let valMin = 80;
      let valMax = 200;
      if (val <= valMin) {
        val = valMin;
      }
      if (val >= valMax) {
        val = valMax;
      }
      itemWidth = val;
      M.config.settings.layout.fileListShowWidth = val;
      var cssRoot = document.body;
      cssRoot.style.setProperty("--fileList-width", val + "px");
      dom_dragbar_mainFileList.style.left = val + "px";
      temp_start = -1;
      updateItem();
      setStartLocation();
    }
    function updateItem() {
      if (isEnabled === false) {
        dom_fileListData.innerHTML = "";
        return;
      }
      let fileListItem = dom_fileListData.querySelector(".fileList-item");
      if (fileListItem === null) {
        newItem(-1, "");
        fileListItem = dom_fileListData.querySelector(".fileList-item");
      }
      if (fileListItem !== null) {
        itemHeight = fileListItem.getBoundingClientRect().height + 5;
      }
      if (temp_itemHeight !== itemHeight) {
        let arWaitingFile2 = M.fileLoad.getWaitingFile();
        dom_fileListBody.style.height = arWaitingFile2.length * itemHeight + "px";
      }
      temp_itemHeight = itemHeight;
      let start = Math.floor(dom_fileList.scrollTop / itemHeight) - 1;
      let count = Math.floor(dom_fileList.clientHeight / itemHeight) + 5;
      if (start < 0) {
        start = 0;
      }
      if (temp_start === start && temp_count === count) {
        return;
      }
      temp_start = start;
      temp_count = count;
      dom_fileListData.innerHTML = "";
      dom_fileListData.style.marginTop = start * itemHeight + "px";
      let arWaitingFile = M.fileLoad.getWaitingFile();
      let end = start + count;
      if (end > arWaitingFile.length) {
        end = arWaitingFile.length;
      }
      for (let i = start; i < end; i++) {
        const path = arWaitingFile[i];
        newItem(i, path);
      }
      select();
    }
    function newItem(i, path) {
      let name = Lib.GetFileName(path);
      let style = "";
      if (temp_loaded.indexOf(i) === -1) {
        if (path !== "") {
          setTimeout(() => {
            if (dom_fileListData.contains(div) === false) {
              return;
            }
            temp_loaded.push(i);
            let _url = getImgUrl(path);
            let domImg = div.getElementsByClassName("fileList-img")[0];
            domImg.style.backgroundImage = `url("${_url}")`;
          }, 30);
        }
      } else {
        let imgUrl = getImgUrl(path);
        style = `background-image:url('${imgUrl}')`;
      }
      let htmlNo = ``;
      let htmlName = ``;
      if (isShowNo === true) {
        htmlNo = `<div class="fileList-no">${i + 1}</div>`;
      }
      if (isShowName === true) {
        htmlName = ` <div class="fileList-name">${name}</div> `;
      }
      let div = newDiv(`<div class="fileList-item" data-id="${i}">
                    ${htmlNo}
                    <div class="fileList-img" style="${style}"> </div>
                    ${htmlName}                                               
                </div>`);
      dom_fileListData.append(div);
      div.addEventListener("click", () => {
        M.fileLoad.show(i);
      });
      return div;
    }
    function getImgUrl(path) {
      if (Lib.GetExtension(path) === ".svg") {
        return Lib.pathToURL(path);
      }
      return APIURL + "/api/getFileIcon?size=128&path=" + encodeURIComponent(path);
    }
    function initFileList() {
      temp_start = -999;
      temp_loaded = [];
      temp_itemHeight = -1;
      updateItem();
    }
    function select() {
      var _a;
      if (isEnabled === false) {
        return;
      }
      (_a = document.querySelector(`.fileList-item[active=true]`)) == null ? void 0 : _a.setAttribute("active", "");
      let id = M.fileLoad.getFlag();
      let div = document.querySelector(`.fileList-item[data-id="${id}"]`);
      if (div == null) {
        return;
      }
      div.setAttribute("active", "true");
    }
    function setStartLocation() {
      if (isEnabled === false) {
        return;
      }
      let id = M.fileLoad.getFlag();
      let f = (dom_fileList.clientHeight - itemHeight) / 2 - 15;
      dom_fileList.scrollTop = id * itemHeight - f;
    }
    function updataLocation() {
      if (isEnabled === false) {
        return;
      }
      let id = M.fileLoad.getFlag();
      let start = Math.floor(dom_fileList.scrollTop / itemHeight);
      if (id <= start) {
        dom_fileList.scrollTop = id * itemHeight;
        return;
      }
      let count = Math.floor(dom_fileList.clientHeight / itemHeight);
      let end = (id - count + 1) * itemHeight - dom_fileList.clientHeight % itemHeight;
      if (dom_fileList.scrollTop < end) {
        dom_fileList.scrollTop = end;
      }
    }
  }
}
