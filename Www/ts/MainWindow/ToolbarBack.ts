/**
 * 頁面的返回按鈕
 */
export class ToolbarBack {

    public visible;
    public getVisible;
    public setEvent;
    public runEvent;

    constructor() {

        const _buttons = document.querySelectorAll<HTMLElement>(".main-toolbar-back");
        var _clickEvent: () => void = () => { }
        var _active = false;

        this.visible = visible;
        this.getVisible = getVisible;
        this.setEvent = setEvent;
        this.runEvent = runEvent;

        _buttons.forEach(button => button.addEventListener("click", () => {
            _clickEvent();
        }));

        /** 
         * 設定顯示或隱藏dom
         */
        function visible(val: boolean) {
            _buttons.forEach(button => button.setAttribute("active", val ? "true" : ""));
            _active = val;
        }

        function getVisible() {
            return _active;
        }

        /**
         * 設定新的click事件
         * @param func 
         */
        function setEvent(func: () => void) {
            _clickEvent = func;
        }

        /**
         * 執行click事件
         */
        function runEvent() {
            _clickEvent();
        }

    }
}
