class Msgbox {
  constructor() {
  }
  static isShow() {
    return this._isShow;
  }
  static show(json) {
    this._isShow = true;
    let txt = "";
    let type = "txt";
    let inputTxt = "";
    let isAllowClose = true;
    let isShowBtn = true;
    let arRadio = [];
    let radioValue = "";
    let funcYes = (dom2, value) => {
      this.close(dom2);
    };
    if (json.txt !== void 0) {
      txt = json.txt;
    }
    if (json.type !== void 0) {
      type = json.type;
    }
    if (json.inputTxt !== void 0) {
      inputTxt = json.inputTxt;
    }
    if (json.isAllowClose !== void 0) {
      isAllowClose = json.isAllowClose;
    }
    if (json.isShowBtn !== void 0) {
      isShowBtn = json.isShowBtn;
    }
    if (json.arRadio !== void 0) {
      arRadio = json.arRadio;
    }
    if (json.radioValue !== void 0) {
      radioValue = json.radioValue;
    }
    if (json.funcYes !== void 0) {
      funcYes = json.funcYes;
    }
    let htmlRadio = "";
    for (let i = 0; i < arRadio.length; i++) {
      const item = arRadio[i];
      let checked = item.value == radioValue ? "checked" : "";
      htmlRadio += `
            <label class="msgbox-radio">
                <input type="radio" name="msgbox-radio" value="${item.value}" ${checked}>
                <span>${item.name}</span>
            </label>`;
    }
    if (arRadio.length > 0) {
      htmlRadio = `
            <div class="msgbox-radioList">
                ${htmlRadio}
            </div>`;
    }
    let dom = newDiv(`<div class="msgbox">
                <div class="msgbox-box" active="false">
                    <div class="msgbox-close"></div>
                    <div class="msgbox-txt base-scrollbar">${txt}</div>
                    <input class="msgbox-input" type="text">
                   
                    ${htmlRadio}
                
                    <div class="msgbox-bottom">
                        <div class="msgbox-btn msgbox-btn__no">\u53D6\u6D88</div>
                        <div class="msgbox-btn msgbox-btn__yes">\u78BA\u5B9A</div>
                    </div>
                </div>
            </div>`);
    let donBox = dom.querySelector(".msgbox-box");
    let donInput = dom.querySelector(".msgbox-input");
    let donBtnClose = dom.querySelector(".msgbox-close");
    let donBottom = dom.querySelector(".msgbox-bottom");
    let donBtnNo = dom.querySelector(".msgbox-btn__no");
    let donBtnYes = dom.querySelector(".msgbox-btn__yes");
    setTimeout(() => {
      donBox.setAttribute("active", "true");
    }, 1);
    if (json.funcYes === void 0) {
      donBtnNo.style.display = "none";
    }
    if (isAllowClose === false) {
      donBtnClose.style.display = "none";
      donBtnNo.style.display = "none";
    }
    if (isShowBtn === false) {
      donBottom.style.display = "none";
    }
    if (type !== "text") {
      donInput.style.display = "none";
    }
    donInput.value = inputTxt;
    donBtnClose.addEventListener("click", () => {
      this.close(dom);
    });
    donBtnNo.addEventListener("click", () => {
      this.close(dom);
    });
    donBtnYes.addEventListener("click", () => {
      let value = "";
      if (type === "txt") {
      }
      if (type === "text") {
        value = donInput.value;
      }
      if (type === "radio") {
        let radioChecked = dom.querySelector(".msgbox-radio :checked");
        if (radioChecked != null) {
          value = radioChecked.value;
        }
      }
      funcYes(dom, value);
    });
    document.body.appendChild(dom);
    if (type === "text") {
      donInput.focus();
      donInput.select();
    }
    return {
      domMsg: dom,
      domInput: donInput,
      close: () => {
        this.close(dom);
      }
    };
  }
  static close(dom) {
    var _a;
    (_a = dom.parentNode) == null ? void 0 : _a.removeChild(dom);
    let arMsgbox = document.querySelectorAll(".msgbox-box");
    for (let i = 0; i < arMsgbox.length; i++) {
      const item = arMsgbox[i];
      if (item.getAttribute("active") == "true") {
        this._isShow = true;
        return;
      }
    }
    this._isShow = false;
  }
  static closeAll() {
    var _a;
    let arMsgbox = document.querySelectorAll(".msgbox");
    for (let i = 0; i < arMsgbox.length; i++) {
      const dom = arMsgbox[i];
      (_a = dom.parentNode) == null ? void 0 : _a.removeChild(dom);
    }
    this._isShow = false;
  }
  static closeNow() {
    var _a;
    let arMsgbox = document.querySelectorAll(".msgbox");
    if (arMsgbox.length === 0) {
      return;
    }
    if (arMsgbox.length === 1) {
      this._isShow = false;
    }
    const dom = arMsgbox[arMsgbox.length - 1];
    (_a = dom.parentNode) == null ? void 0 : _a.removeChild(dom);
  }
  static clickYes() {
    let arMsgbox = document.querySelectorAll(".msgbox");
    if (arMsgbox.length === 0) {
      return;
    }
    const dom = arMsgbox[arMsgbox.length - 1];
    const btnYes = dom.querySelector(".msgbox-btn__yes");
    btnYes.click();
  }
}
Msgbox._isShow = false;
