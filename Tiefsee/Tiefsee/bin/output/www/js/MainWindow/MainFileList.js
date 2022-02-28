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
console.log(18);
class MainFileList {
  constructor(M) {
    let dom_fileList = document.getElementById("main-fileList");
    let dom_fileListBody = document.getElementById("main-fileListBody");
    let dom_fileListData = document.getElementById("main-fileListData");
    let itemHeight = 135;
    var temp_start = 0;
    var temp_count = 0;
    var temp_loaded = [];
    this.initFileList = initFileList;
    dom_fileList.addEventListener("scroll", () => {
      updateItem();
    });
    new ResizeObserver(() => {
      updateItem();
    }).observe(dom_fileList);
    function updateItem() {
      let start = Math.floor(dom_fileList.scrollTop / itemHeight);
      let count = Math.floor(dom_fileList.clientHeight / itemHeight) + 5;
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
            let _url = APIURL + "/api/getFileIcon?size=128&path=" + encodeURIComponent(path);
            let domImg = div.getElementsByClassName("fileList-img")[0];
            domImg.style.backgroundImage = `url("${_url}")`;
          }, 30);
        } else {
          let imgUrl = APIURL + "/api/getFileIcon?size=128&path=" + encodeURIComponent(path);
          style = `background-image:url('${imgUrl}')`;
        }
        let div = newDiv(`<div class="fileList-item">
                        <div class="fileList-no">${i + 1}</div>
                        <div class="fileList-img" style="${style}"> </div>
                        <div class="fileList-title">${name}</div>                                                 
                    </div>`);
        dom_fileListData.append(div);
        div.addEventListener("click", () => {
          $(".fileList-item").attr("active", "");
          div.setAttribute("active", "true");
          M.fileLoad.show(i);
        });
      }
      dom_fileListData.style.marginTop = start * itemHeight + "px";
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
  }
}
