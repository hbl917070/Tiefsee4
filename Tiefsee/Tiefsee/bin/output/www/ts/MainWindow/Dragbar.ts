/**
 * 改變物件size的拖曳條
 */
class Dragbar {

    public init;
    public getEventStart;
    public setEventStart;
    public getEventMove;
    public setEventMove;
    public getEventEnd;
    public setEventEnd;
    public setEnabled;
    public setPosition;

    constructor() {

        let dom_windowBody = document.getElementById("window-body") as HTMLElement;
        let dom_box: HTMLElement;//螢幕看得到的區域
        let dom_dragbar: HTMLElement;
        let dom_observe: HTMLElement;
        let temp_val = 0;
        let temp_width = 0;
        let hammer_dragbar: HammerManager;
        let type: ("left" | "right") = "right";

        let _eventStart = () => { };
        let _eventMove = (val: number) => { };
        let _eventEnd = (val: number) => { };
        this.getEventStart = function () { return _eventStart }
        this.setEventStart = function (func: () => void) { _eventStart = func }
        this.getEventMove = function () { return _eventMove }
        this.setEventMove = function (func: (val: number) => void) { _eventMove = func }
        this.getEventEnd = function () { return _eventEnd }
        this.setEventEnd = function (func: (val: number) => void) { _eventEnd = func }
        this.setEnabled = function (val: boolean) {
            if (val) {
                dom_dragbar.style.display = "block";
            } else {
                dom_dragbar.style.display = "none";
            }
        }
        /** 設定 拉條的位置 */
        this.setPosition = function (val: number) {
            if (type === "left") {
                dom_dragbar.style.left = (dom_box.getBoundingClientRect().left) + "px";
            }
            if (type === "right") {
                dom_dragbar.style.left = (dom_box.getBoundingClientRect().left + val) + "px";
            }
        }


        /**
         * 初始化
         * @param _dom_box 要被修改size的物件
         * @param _dom_dragbar 拖曳條
         */
        this.init = function init(_type: ("left" | "right"), _dom_box: HTMLElement, _dom_dragbar: HTMLElement, _dom_observe: HTMLElement) {
            type = _type;
            dom_box = _dom_box;
            dom_dragbar = _dom_dragbar;
            dom_observe = _dom_observe;
            hammer_dragbar = new Hammer(dom_dragbar);

            //區塊改變大小時
            new ResizeObserver(() => {
                if (type === "left") {
                    dom_dragbar.style.top = dom_box.getBoundingClientRect().top + "px"
                    dom_dragbar.style.left = dom_box.getBoundingClientRect().left + "px"
                    dom_dragbar.style.height = dom_box.getBoundingClientRect().height + "px";
                }
                if (type === "right") {
                    dom_dragbar.style.top = dom_box.getBoundingClientRect().top + "px"
                    dom_dragbar.style.left = dom_box.getBoundingClientRect().left + dom_box.getBoundingClientRect().width + "px"
                    dom_dragbar.style.height = dom_box.getBoundingClientRect().height + "px";
                }
            }).observe(dom_observe)


            //拖曳開始
            dom_dragbar.addEventListener("pointerdown", (ev) => {//mousedown + touchstart
                ev.preventDefault();
                dom_windowBody.style.pointerEvents = "none";//避免畫面上的iframe造成無法識別滑鼠事件
                temp_val = toNumber(dom_dragbar.style.left);
                temp_width = dom_box.getBoundingClientRect().width;
                _eventStart();
            });
            //拖曳 結束
            dom_dragbar.addEventListener("pointerup", () => {
                dom_windowBody.style.pointerEvents = "";//解除鎖定
            })

            //拖曳
            hammer_dragbar.get("pan").set({ pointers: 0, threshold: 0, direction: Hammer.DIRECTION_ALL });
            hammer_dragbar.on("pan", (ev: HammerInput) => {
                dom_dragbar.setAttribute("active", "true");
                let val = update(ev);
                _eventMove(val);

            });

            //拖曳 結束
            hammer_dragbar.on("panend", (ev: HammerInput) => {
                dom_windowBody.style.pointerEvents = "";//解除鎖定
                dom_dragbar.setAttribute("active", "");
                let val = update(ev);
                _eventEnd(val);
            });


            function update(ev: HammerInput) {
                let val = 0;
                if (type === "left") {
                    val = temp_val * 0 - ev.deltaX - dom_box.getBoundingClientRect().left * 0 + temp_width;
                }
                if (type === "right") {
                    val = temp_val + ev.deltaX - dom_box.getBoundingClientRect().left;
                }
                return val;
            }


        }
    }




}