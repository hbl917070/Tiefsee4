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
class MainFileList {
  constructor(M) {
    this.initFileList = initFileList;
    this.select = select;
    this.updataLocation = updataLocation;
    this.setStartLocation = setStartLocation;
    let dom_fileList = document.getElementById("main-fileList");
    let dom_fileListBody = document.getElementById("main-fileListBody");
    let dom_fileListData = document.getElementById("main-fileListData");
    let itemHeight = 80 + 40 + 10;
    var temp_loaded = [];
    var temp_start = 0;
    var temp_count = 0;
    dom_fileList.addEventListener("scroll", () => {
      updateItem();
    });
    new ResizeObserver(() => {
      updateItem();
    }).observe(dom_fileList);
    function updateItem() {
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
      let arWaitingFile = M.fileLoad.getWaitingFile();
      let end = start + count;
      if (end > arWaitingFile.length) {
        end = arWaitingFile.length;
      }
      for (let i = start; i < end; i++) {
        const path = arWaitingFile[i];
        let name = Lib.GetFileName(path);
        let style = "";
        if (temp_loaded.indexOf(i) === -1) {
          setTimeout(() => {
            if (dom_fileListData.contains(div) === false) {
              return;
            }
            temp_loaded.push(i);
            let _url = getImgUrl(path);
            let domImg = div.getElementsByClassName("fileList-img")[0];
            domImg.style.backgroundImage = `url("${_url}")`;
          }, 30);
        } else {
          let imgUrl = getImgUrl(path);
          style = `background-image:url('${imgUrl}')`;
        }
        let div = newDiv(`<div class="fileList-item" data-id="${i}">
                        <div class="fileList-no">${i + 1}</div>
                        <div class="fileList-img" style="${style}"> </div>
                        <div class="fileList-title">${name}</div>                                                 
                    </div>`);
        dom_fileListData.append(div);
        div.addEventListener("click", () => {
          M.fileLoad.show(i);
        });
      }
      dom_fileListData.style.marginTop = start * itemHeight + "px";
      select();
    }
    function getImgUrl(path) {
      if (Lib.GetExtension(path) === ".svg") {
        return Lib.pathToURL(path);
      }
      return APIURL + "/api/getFileIcon?size=128&path=" + encodeURIComponent(path);
    }
    function initFileList() {
      return __async(this, null, function* () {
        let arWaitingFile = M.fileLoad.getWaitingFile();
        dom_fileListBody.style.height = arWaitingFile.length * itemHeight + "px";
        temp_start = -999;
        temp_loaded = [];
        updateItem();
      });
    }
    function select() {
      var _a;
      (_a = document.querySelector(`.fileList-item[active=true]`)) == null ? void 0 : _a.setAttribute("active", "");
      let id = M.fileLoad.getFlag();
      let div = document.querySelector(`.fileList-item[data-id="${id}"]`);
      if (div == null) {
        return;
      }
      div.setAttribute("active", "true");
    }
    function setStartLocation() {
      let id = M.fileLoad.getFlag();
      let f = (dom_fileList.clientHeight - itemHeight) / 2 - 15;
      dom_fileList.scrollTop = id * itemHeight - f;
    }
    function updataLocation() {
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
