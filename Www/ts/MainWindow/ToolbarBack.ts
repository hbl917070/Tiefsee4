/**
 * 頁面的返回按鈕
 */
export class ToolbarBack {

    public visible;
    public getVisible;
    public setEvent;
    public runEvent;

    constructor() {

        const _btn = document.querySelector("#toolbar-back") as HTMLElement;
        var _clickEvent: () => void = () => { }
        var _active = false;

        this.visible = visible;
        this.getVisible = getVisible;
        this.setEvent = setEvent;
        this.runEvent = runEvent;

        _btn.addEventListener("click", () => {
            _clickEvent();
        })

        /** 
         * 設定顯示或隱藏dom
         */
        function visible(val: boolean) {
            if (val === true) {
                _btn.setAttribute("active", "true");
                _active = true;
            } else {
                _btn.setAttribute("active", "");
                _active = false;
            }
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
