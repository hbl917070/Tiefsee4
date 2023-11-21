/**
 * 訊息方塊
 */
class Msgbox {

    private _isShow = false;
    private i18n: I18n;

    constructor(_i18n: I18n | undefined) {

        if (_i18n === undefined) {
            this.i18n = new I18n();
            this.i18n.pushData({
                msg: {
                    yes: { "en": "Yes", },
                    no: { "en": "No", },
                }
            });
        } else {

            this.i18n = _i18n
        }
    }

    /**
     * 判斷目前是否有任何顯示中的訊息方塊
     */
    public isShow(): boolean {
        return this._isShow;
    }

    /**
     * 顯示
     * @param json 
     */
    public show(json: {
        txt?: string,
        type?: ("txt" | "text" | "radio"),
        inputTxt?: string,
        isAllowClose?: boolean,
        isShowBtn?: boolean,
        arRadio?: { value: string, name: string }[],
        radioValue?: string,
        funcYes?: (dom: HTMLElement, inputTxt: string) => void,
        funcClose?: (dom: HTMLElement) => void,
    }) {

        this._isShow = true;

        let txt = ""; // 內容文字
        let type: ("txt" | "text" | "radio") = "txt"; // 類型
        let inputTxt = ""; // 預設的輸入框內容
        let isAllowClose = true; // 是否允許關閉
        let isShowBtn = true; // 是否顯示按鈕
        let arRadio: { value: string; name: string; }[] = []; // radio選項
        let radioValue: string = ""; // radio預設值
        let funcYes = (dom: HTMLElement, value: string) => { this.close(dom); }
        let funcClose = (dom: HTMLElement) => { this.close(dom); }

        if (json.txt !== undefined) { txt = json.txt }
        if (json.type !== undefined) { type = json.type }
        if (json.inputTxt !== undefined) { inputTxt = json.inputTxt }
        if (json.isAllowClose !== undefined) { isAllowClose = json.isAllowClose }
        if (json.isShowBtn !== undefined) { isShowBtn = json.isShowBtn }
        if (json.arRadio !== undefined) { arRadio = json.arRadio }
        if (json.radioValue !== undefined) { radioValue = json.radioValue }
        if (json.funcYes !== undefined) { funcYes = json.funcYes; }
        if (json.funcClose !== undefined) { funcClose = json.funcClose; }

        let htmlRadio = "";
        for (let i = 0; i < arRadio.length; i++) {
            const item = arRadio[i];
            let checked = (item.value == radioValue) ? "checked" : ""; //是否選取
            htmlRadio += `
            <label class="msgbox-radio">
                <input class="base-radio" type="radio" name="msgbox-radio" value="${item.value}" ${checked}>
                <span>${item.name}</span>
            </label>`;
        }
        if (arRadio.length > 0) {
            htmlRadio = `
            <div class="msgbox-radioList">
                ${htmlRadio}
            </div>`
        }

        let dom = Lib.newDom(
            `<div class="msgbox">
                <div class="msgbox-box" active="false">
                    <div class="msgbox-close"></div>
                    <div class="msgbox-txt base-scrollbar">${txt}</div>
                    <input class="msgbox-input" type="text">
                   
                    ${htmlRadio}
                
                    <div class="msgbox-bottom">
                        <div class="msgbox-btn msgbox-btn__yes" i18n="msg.yes">${this.i18n.t("msg.yes")}</div>
                        <div class="msgbox-btn msgbox-btn__no" i18n="msg.no">${this.i18n.t("msg.no")}</div>
                    </div>
                </div>
            </div>`)

        let donBox = dom.querySelector(".msgbox-box") as HTMLElement;
        let donInput = dom.querySelector(".msgbox-input") as HTMLInputElement;
        let donBtnClose = dom.querySelector(".msgbox-close") as HTMLElement;
        let donBottom = dom.querySelector(".msgbox-bottom") as HTMLElement;
        let donBtnNo = dom.querySelector(".msgbox-btn__no") as HTMLElement;
        let donBtnYes = dom.querySelector(".msgbox-btn__yes") as HTMLElement;

        setTimeout(() => {
            donBox.setAttribute("active", "true");
        }, 1);

        if (json.funcYes === undefined) { // 如果沒有指定按下「確定」的事件，就隱藏「取消」按鈕
            donBtnNo.style.display = "none";
        }
        if (isAllowClose === false) { // 禁止關閉
            donBtnClose.style.display = "none";
            donBtnNo.style.display = "none";
        }
        if (isShowBtn === false) {
            donBottom.style.display = "none"; // 不顯示按鈕
        }
        if (type !== "text") {
            donInput.style.display = "none"; // 隱藏輸入框
        }

        donInput.value = inputTxt;

        donBtnClose.addEventListener("click", () => { funcClose(dom) })
        donBtnNo.addEventListener("click", () => { funcClose(dom) })
        donBtnYes.addEventListener("click", () => { // 按下確認時
            let value: string = "";
            if (type === "txt") { }
            if (type === "text") {
                value = donInput.value;
            }
            if (type === "radio") {
                let radioChecked = dom.querySelector(".msgbox-radio :checked") as HTMLInputElement;
                if (radioChecked != null) { value = radioChecked.value }
            }
            funcYes(dom, value);
        })

        document.body.appendChild(dom);

        if (type === "text") {
            donInput.focus(); // 取得焦點
            donInput.select();
        }

        return {
            domMsg: dom,
            domInput: donInput,
            // close: () => { this.close(dom) }
        };
    }

    /**
     * 關閉特定的訊息方塊
     * @param dom 
     */
    public close(dom: HTMLElement) {
        dom.parentNode?.removeChild(dom); // 移除dom

        // 判斷是否還有其他的 訊息方塊
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

    /**
     * 關閉全部
     */
    public closeAll() {
        let arMsgbox = document.querySelectorAll(".msgbox");
        for (let i = 0; i < arMsgbox.length; i++) {
            const dom = arMsgbox[i];
            dom.parentNode?.removeChild(dom);
        }
        this._isShow = false;
    }

    /**
    * 當前的Msg 關閉
    */
    public closeNow() {

        let arMsgbox = document.querySelectorAll(".msgbox");

        if (arMsgbox.length === 0) { return }
        if (arMsgbox.length === 1) { this._isShow = false; }

        const dom = arMsgbox[arMsgbox.length - 1];
        dom.parentNode?.removeChild(dom);
    }

    /**
     * 當前的Msg 按下
     */
    public clickYes() {

        let arMsgbox = document.querySelectorAll(".msgbox");

        if (arMsgbox.length === 0) { return }

        const dom = arMsgbox[arMsgbox.length - 1];
        const btnYes = dom.querySelector(".msgbox-btn__yes") as HTMLElement;
        btnYes.click();
    }

}
