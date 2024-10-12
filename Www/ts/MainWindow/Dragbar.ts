/**
 * 改變物件 size 的拖曳條
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
    public setDragbarPosition;
    public setType;

    constructor() {
        const _domWindowBody = document.getElementById("window-body") as HTMLElement;
        let _domBox: HTMLElement; // 螢幕看得到的區域
        let _domDragbar: HTMLElement;
        let _domObserve: HTMLElement;
        let _tempVal = 0;
        let _tempWidth = 0;
        let _hammerDragbar: HammerManager;
        let _type: ("left" | "right") = "right";
        let _enable = true;
        let _tempBoxRect: DOMRect = new DOMRect();

        let _eventStart = () => { };
        let _eventMove = (val: number) => { };
        let _eventEnd = (val: number) => { };

        this.getEventStart = () => { return _eventStart }
        this.setEventStart = (func: () => void) => { _eventStart = func }
        this.getEventMove = () => { return _eventMove }
        this.setEventMove = (func: (val: number) => void) => { _eventMove = func }
        this.getEventEnd = () => { return _eventEnd }
        this.setEventEnd = (func: (val: number) => void) => { _eventEnd = func }

        /**
         * 設定 拖曳條是否啟用
         */
        this.setEnabled = (val: boolean) => {
            _enable = val;
            if (val) {
                _domDragbar.style.display = "block";
                updatePosition();
            } else {
                _domDragbar.style.display = "none";
            }
        }

        /** 
         * 設定 拉條的位置
         */
        this.setDragbarPosition = (val: number) => {
            if (_enable === false) { return; }
            if (_type === "left") {
                _domDragbar.style.left = (_domBox.getBoundingClientRect().left) + "px";
            }
            if (_type === "right") {
                _domDragbar.style.left = (_domBox.getBoundingClientRect().left + val) + "px";
            }
        }

        /**
         * 設定 拖曳條的類型
         */
        this.setType = (type: ("left" | "right")) => {
            _type = type;
            updatePosition();
        }

        /**
         * 初始化
         * @param domBox 要被修改 size 的物件
         * @param domDragbar 拖曳條
         */
        this.init = (type: ("left" | "right"), domBox: HTMLElement, domDragbar: HTMLElement, domObserve: HTMLElement) => {
            _type = type;
            _domBox = domBox;
            _domDragbar = domDragbar;
            _domObserve = domObserve;
            _hammerDragbar = new Hammer(_domDragbar);

            // 區塊 或 body 改變大小時，更新拖曳條的坐標
            new ResizeObserver(updatePosition).observe(_domObserve);
            new ResizeObserver(updatePosition).observe(document.body);

            // 拖曳開始
            _domDragbar.addEventListener("pointerdown", (ev) => { // mousedown + touchstart
                // 點擊的不是左鍵
                if (ev.button !== 0) {
                    return;
                }
                ev.preventDefault();
                _domWindowBody.style.pointerEvents = "none"; // 避免畫面上的 iframe 造成無法識別滑鼠事件
                _tempVal = Lib.toNumber(_domDragbar.style.left);
                _tempWidth = _domBox.getBoundingClientRect().width;
                _eventStart();
            });
            // 拖曳 結束
            _domDragbar.addEventListener("pointerup", () => {
                _domWindowBody.style.pointerEvents = ""; // 解除鎖定
            })

            // 拖曳
            _hammerDragbar.get("pan").set({ pointers: 0, threshold: 0, direction: Hammer.DIRECTION_ALL });
            _hammerDragbar.on("pan", (ev: HammerInput) => {
                _domDragbar.setAttribute("active", "true");
                let val = update(ev);
                _eventMove(val);
            });

            // 拖曳 結束
            _hammerDragbar.on("panend", (ev: HammerInput) => {
                _domWindowBody.style.pointerEvents = ""; // 解除鎖定
                _domDragbar.setAttribute("active", "");
                let val = update(ev);
                _eventEnd(val);
            });

            function update(ev: HammerInput) {
                let val = 0;
                if (_type === "left") {
                    val = _tempVal * 0 - ev.deltaX - _domBox.getBoundingClientRect().left * 0 + _tempWidth;
                }
                if (_type === "right") {
                    val = _tempVal + ev.deltaX - _domBox.getBoundingClientRect().left;
                }
                return val;
            }
        }

        /**
         * 更新拖曳條的坐標
         */
        function updatePosition() {

            if (_enable === false) {
                _tempBoxRect = new DOMRect();
                return;
            }

            const rect = _domBox.getBoundingClientRect();

            // 如果位置沒有改變，就不更新
            if (rect.left === _tempBoxRect.left &&
                rect.top === _tempBoxRect.top &&
                rect.width === _tempBoxRect.width &&
                rect.height === _tempBoxRect.height
            ) {
                return;
            }
            _tempBoxRect = rect;

            requestAnimationFrame(() => {
                if (_type === "left") {
                    _domDragbar.style.top = rect.top + "px"
                    _domDragbar.style.left = rect.left + "px"
                    _domDragbar.style.height = rect.height + "px";
                }
                if (_type === "right") {
                    _domDragbar.style.top = rect.top + "px"
                    _domDragbar.style.left = rect.left + rect.width + "px"
                    _domDragbar.style.height = rect.height + "px";
                }
            });
        }

    }
}
