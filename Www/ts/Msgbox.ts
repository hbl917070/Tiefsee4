import { I18n } from "./I18n";
import { Lib } from "./Lib";

type MsgboxItem = {
    dom: HTMLElement;
    confirm: () => void;
    cancel: () => void;
};

/**
 * 訊息方塊
 */
export class Msgbox {

    private _i18n: I18n;
    /** 目前由此 Msgbox 管理的訊息框，最後一筆是目前最上層的訊息框。 */
    private _items: MsgboxItem[] = [];

    constructor(i18n: I18n | undefined) {

        if (i18n === undefined) {
            this._i18n = new I18n();
            this._i18n.pushData({
                msg: {
                    yes: { "en": "Yes", },
                    no: { "en": "No", },
                }
            });
        } else {

            this._i18n = i18n
        }
    }

    /**
     * 判斷目前是否有任何顯示中的訊息方塊
     */
    public isShow(): boolean {
        return this._items.length > 0;
    }

    /**
     * 顯示
     * @param json 
     */
    public show(json: {
        txt?: string,
        /** 只有內文刻意包含可信任的 HTML 時才設為 true；預設以純文字顯示。 */
        allowHtml?: boolean,
        type?: ("txt" | "text" | "radio"),
        inputTxt?: string,
        inputType?: ("text" | "password"),
        isAllowClose?: boolean,
        isShowBtn?: boolean,
        arRadio?: { value: string, name: string }[],
        radioValue?: string,
        funcYes?: (dom: HTMLElement, inputTxt: string) => void,
        funcClose?: (dom: HTMLElement) => void,
    }) {

        let txt = ""; // 內容文字
        let type: ("txt" | "text" | "radio") = "txt"; // 類型
        let inputTxt = ""; // 預設的輸入框內容
        let inputType: ("text" | "password") = "text"; // 輸入框顯示型別
        let isAllowClose = true; // 是否允許關閉
        let isShowBtn = true; // 是否顯示按鈕
        let arRadio: { value: string; name: string; }[] = []; // radio選項
        let radioValue: string = ""; // radio預設值
        let funcYes = (dom: HTMLElement, value: string) => { this.close(dom); }
        let funcClose = (dom: HTMLElement) => { this.close(dom); }

        if (json.txt !== undefined) { txt = json.txt }
        if (json.type !== undefined) { type = json.type }
        if (json.inputTxt !== undefined) { inputTxt = json.inputTxt }
        if (json.inputType !== undefined) { inputType = json.inputType }
        if (json.isAllowClose !== undefined) { isAllowClose = json.isAllowClose }
        if (json.isShowBtn !== undefined) { isShowBtn = json.isShowBtn }
        if (json.arRadio !== undefined) { arRadio = json.arRadio }
        if (json.radioValue !== undefined) { radioValue = json.radioValue }
        if (json.funcYes !== undefined) { funcYes = json.funcYes; }
        if (json.funcClose !== undefined) { funcClose = json.funcClose; }

        if (json.allowHtml !== true) {
            txt = Lib.escape(txt).replace(/\r\n|\r|\n/g, "<br>");
        }

        let htmlRadio = "";
        for (let i = 0; i < arRadio.length; i++) {
            const item = arRadio[i];
            const checked = (item.value == radioValue) ? "checked" : ""; //是否選取
            htmlRadio += `
            <label class="msgbox-radio" allowSelection>
                <input class="base-radio" type="radio" name="msgbox-radio" value="${Lib.escape(item.value)}" ${checked}>
                <span allowSelection>${Lib.escape(item.name)}</span>
            </label>`;
        }
        if (arRadio.length > 0) {
            htmlRadio = `
            <div class="msgbox-radioList">
                ${htmlRadio}
            </div>`
        }

        const dom = Lib.newDom(
            `<div class="msgbox">
                <div class="msgbox-box" active="false">
                    <div class="msgbox-close"></div>
                    <div class="msgbox-txt base-scrollbar">${txt}</div>
                    <input class="msgbox-input" type="text">
                   
                    ${htmlRadio}
                
                    <div class="msgbox-bottom">
                        <div class="msgbox-btn msgbox-btn__yes" i18n="msg.yes">${this._i18n.t("msg.yes")}</div>
                        <div class="msgbox-btn msgbox-btn__no" i18n="msg.no">${this._i18n.t("msg.no")}</div>
                    </div>
                </div>
            </div>`)

        const donBox = dom.querySelector(".msgbox-box") as HTMLElement;
        const donInput = dom.querySelector(".msgbox-input") as HTMLInputElement;
        const donBtnClose = dom.querySelector(".msgbox-close") as HTMLElement;
        const donBottom = dom.querySelector(".msgbox-bottom") as HTMLElement;
        const donBtnNo = dom.querySelector(".msgbox-btn__no") as HTMLElement;
        const donBtnYes = dom.querySelector(".msgbox-btn__yes") as HTMLElement;

        setTimeout(() => {
            donBox.setAttribute("active", "true");
        }, 10);

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
        donInput.type = inputType;

        const getInputValue = () => {
            let value = "";
            if (type === "text") {
                value = donInput.value;
            }
            if (type === "radio") {
                const radioChecked = dom.querySelector(".msgbox-radio :checked") as HTMLInputElement;
                if (radioChecked != null) { value = radioChecked.value; }
            }
            return value;
        };

        const item: MsgboxItem = {
            dom: dom,
            confirm: () => {
                funcYes(dom, getInputValue());
            },
            cancel: () => {
                // 先移除 item 與 DOM，再執行外部回呼；即使回呼發生錯誤，
                // 訊息框狀態也已經完成清理，錯誤仍會自然往外拋出。
                if (this.removeItem(item) === false) { return; }
                funcClose(dom);
            },
        };
        this._items.push(item);

        donBtnClose.addEventListener("click", item.cancel)
        donBtnNo.addEventListener("click", item.cancel)
        donBtnYes.addEventListener("click", item.confirm)

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
        const item = this._items.find(item => item.dom === dom);
        if (item !== undefined) {
            this.removeItem(item);
            return;
        }

        // 相容於不是由此 Msgbox 管理的既有 DOM。
        dom.parentNode?.removeChild(dom);
    }

    /**
     * 關閉全部
     */
    public closeAll() {
        // 使用快照，避免關閉回呼建立的新訊息框被同一輪誤關閉。
        const items = [...this._items];
        for (const item of items) {
            item.cancel();
        }
    }

    /**
    * 當前的Msg 關閉
    */
    public closeNow() {
        const item = this._items[this._items.length - 1];
        if (item === undefined) { return; }
        item.cancel();
    }

    /** 從管理清單移除訊息框並移除 DOM，不執行取消回呼。 */
    private removeItem(item: MsgboxItem): boolean {
        const index = this._items.indexOf(item);
        if (index === -1) { return false; }

        this._items.splice(index, 1);
        item.dom.parentNode?.removeChild(item.dom);
        return true;
    }

    /**
     * 當前的Msg 按下
     */
    public clickYes() {
        const item = this._items[this._items.length - 1];
        if (item === undefined) { return; }
        item.confirm();
    }

}
