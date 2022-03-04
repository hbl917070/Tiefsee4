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

    constructor() {

        let dom_box = document.getElementById("main-fileList") as HTMLElement;//螢幕看得到的區域
        let dom_dragbar = document.getElementById("dragbar-mainFileList") as HTMLElement;
        let temp_val = 0;
        let hammer_dragbar = new Hammer(dom_dragbar);

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
                dom_dragbar.style.display = "block"
            } else {
                dom_dragbar.style.display = "none"
            }
        }


        /**
         * 初始化
         * @param _dom_box 要被修改size的物件
         * @param _dom_dragbar 拖曳條
         */
        this.init = function init(_dom_box: HTMLElement, _dom_dragbar: HTMLElement) {
            dom_box = _dom_box;
            dom_dragbar = _dom_dragbar;
        }


        //區塊改變大小時
        new ResizeObserver(() => {
            dom_dragbar.style.top = dom_box.getBoundingClientRect().top + "px"
            dom_dragbar.style.left = dom_box.getBoundingClientRect().left + dom_box.getBoundingClientRect().width + "px"
            dom_dragbar.style.height = dom_box.getBoundingClientRect().height + "px";
        }).observe(dom_box)


        //拖曳開始
        dom_dragbar.addEventListener("mousedown", (ev) => {
            ev.preventDefault();
            temp_val = toNumber(dom_dragbar.style.left)
            _eventStart()
        });
        dom_dragbar.addEventListener("touchstart", (ev) => {
            ev.preventDefault();
            temp_val = toNumber(dom_dragbar.style.left)
            _eventStart()
        });

        //拖曳
        hammer_dragbar.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_VERTICAL });
        hammer_dragbar.on("pan", (ev) => {
            dom_dragbar.setAttribute("active", "true");
            let val = temp_val + ev.deltaX;
            _eventMove(val)
        });

        //拖曳 結束
        hammer_dragbar.on("panend", (ev) => {
            dom_dragbar.setAttribute("active", "");
            let val = temp_val + ev.deltaX;
            _eventEnd(val)
        });


    }




}