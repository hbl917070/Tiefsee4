import { Lib } from "./Lib";

/**
 * 滾動條元件
 */
export class TiefseeScroll {

    public getEventChange;
    public setEventChange;
    public getTop;
    public setTop;
    public setValue;
    public update;
    public initGeneral;
    public initTiefseeScroll;

    constructor() {

        var _domScroll: HTMLElement;
        var _domBg: HTMLElement;
        var _domBox: HTMLElement;
        var _type: ("x" | "y");
        var _contentHeight = 0; // 內容高度(全部的值)
        var _panelHeight = 0; // 容器的高度
        var _eventChange = (val: number, mode: "set" | "wheel" | "pan") => { };
        var _hammerScroll;
        var _startLeft = 0;
        var __startTop = 0;

        this.getEventChange = getEventChange;
        this.setEventChange = setEventChange;
        this.setTop = setTop;
        this.getTop = getTop;
        this.setValue = setValue;
        this.update = update;
        this.initGeneral = initGeneral;
        this.initTiefseeScroll = initTiefseeScroll;

        /**
         * 初始化 - Tiefseeview 的滾動條
         * @param domScroll 
         * @param type 
         */
        function initTiefseeScroll(domScroll: HTMLElement, type: ("x" | "y")) {
            _domScroll = domScroll;
            _type = type;

            init();

            // 在滾動條上面滾動時
            const mouseWheel = (e: WheelEvent) => {
                e.preventDefault(); // 禁止頁面滾動

                // 將內容要移動的距離換算成滾動條需要移動的距離
                const val = 100 * (_panelHeight / _contentHeight);

                if (e.deltaX > 0 || e.deltaY > 0) { // 下
                    setTop(getTop() + val, "wheel");
                } else { // 上
                    setTop(getTop() - val, "wheel");
                }
            }
            _domScroll.addEventListener("wheel", (e) => { mouseWheel(e); }, true);
        }

        /**
         * 初始化 - 一般的滾動條
         * @param domPanel 外層的容器
         * @param type 
         */
        function initGeneral(domPanel: HTMLElement, type: ("x" | "y")) {

            let domContent = domPanel.firstElementChild as HTMLElement;
            if (domContent === null) {
                return;
            }

            _type = type;

            if (_type === "y") {
                _domScroll = Lib.newDom(`
                    <div class="scroll-y js-noDrag">
                        <div class="scroll-bg js-noDrag"></div>
                        <div class="scroll-box js-noDrag"></div>
                    </div>`
                );
            } else {
                _domScroll = Lib.newDom(`
                    <div class="scroll-x js-noDrag">
                        <div class="scroll-bg js-noDrag"></div>
                        <div class="scroll-box js-noDrag"></div>
                    </div>`
                );
            }
            domPanel.appendChild(_domScroll);
            init();

            // 滾動條變化時(主動拖拉滾動條)，同步至容器
            setEventChange((v: number, mode: "set" | "wheel" | "pan") => {
                if (mode === "set") { return; }
                if (_type === "y") {
                    domPanel.scrollTop = v;
                } else {
                    domPanel.scrollLeft = v;
                }
            });

            // 容器發生捲動時，更新滾動條
            domPanel.addEventListener("scroll", () => {
                let val;
                if (_type === "y") {
                    // 避免滾動條超出範圍
                    if (domPanel.scrollTop > domContent.clientHeight - domPanel.clientHeight) {
                        domPanel.scrollTop = domContent.clientHeight - domPanel.clientHeight;
                    }
                    val = domPanel.scrollTop;
                    _domScroll.style.top = val + "px"; // 坐標定位
                } else {
                    if (domPanel.scrollLeft > domContent.clientWidth - domPanel.clientWidth) {
                        domPanel.scrollLeft = domContent.clientWidth - domPanel.clientWidth;
                    }
                    val = domPanel.scrollLeft;
                    _domScroll.style.left = val + "px"; // 坐標定位
                }
                setValue(val);
            })

            // 區塊或body改變大小時，更新拖曳條的坐標
            function updatePosition() {
                requestAnimationFrame(() => {

                    if (_type === "y") {
                        _domScroll.style.height = domPanel.offsetHeight + "px";

                        let val = domPanel.scrollTop;
                        if (val + domPanel.offsetHeight > domContent.offsetHeight) { // 避免滾動條影響高度的計算
                            _domScroll.style.top = "0px";
                            val = domPanel.scrollTop;
                        }
                        _domScroll.style.top = val + "px";

                        update(
                            domContent.offsetHeight,
                            domPanel.offsetHeight,
                            getTop()
                        );

                        setValue(val);

                    } else {
                        _domScroll.style.width = domPanel.offsetWidth + "px";

                        let val = domPanel.scrollLeft;
                        if (val + domPanel.offsetWidth > domContent.offsetWidth) { // 避免滾動條影響高度的計算
                            _domScroll.style.left = "0px";
                            val = domPanel.scrollLeft;
                        }
                        _domScroll.style.left = val + "px";

                        update(
                            domContent.offsetWidth,
                            domPanel.offsetWidth,
                            getTop()
                        );

                        setValue(val);
                    }

                })
            }
            updatePosition();
            new ResizeObserver(updatePosition).observe(domPanel);
            new ResizeObserver(updatePosition).observe(domContent);
        }

        /**
         * 初始化事件
         */
        function init() {
            _domBg = _domScroll.querySelector(".scroll-bg") as HTMLElement;
            _domBox = _domScroll.querySelector(".scroll-box") as HTMLElement;
            _hammerScroll = new Hammer(_domScroll, {});

            // 拖曳開始
            _domScroll.addEventListener("mousedown", (e) => { touchStart(e); });
            _domScroll.addEventListener("touchstart", (e) => { touchStart(e); });
            const touchStart = (e: any) => {
                e.preventDefault();
                _startLeft = toNumber(_domBox.style.left);
                __startTop = toNumber(_domBox.style.top);
            }

            // 拖曳中
            _hammerScroll.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_ALL });
            _hammerScroll.on("pan", (e) => {
                e.preventDefault();
                let deltaX = e["deltaX"];
                let deltaY = e["deltaY"];
                if (_type === "y") {
                    let top = __startTop + deltaY;
                    setTop(top, "pan");
                }
                if (_type === "x") {
                    let left = _startLeft + deltaX;
                    setTop(left, "pan");
                }
                _domScroll.setAttribute("action", "true"); // 表示「拖曳中」，用於CSS樣式
            });

            _hammerScroll.on("panend", (e) => {
                _domScroll.setAttribute("action", ""); // 表示「結束拖曳」，用於CSS樣式
            });
        }

        /**
         * 
         * @param contentHeight 內容高度(全部的值)
         * @param panelHeight 容器高度
         * @param top 目前的值
         */
        function update(contentHeight: number, panelHeight: number, top: number) {

            if (top === undefined) {
                top = 0;
            }

            _contentHeight = contentHeight;
            _panelHeight = panelHeight;

            if (_type === "y") {
                let h = panelHeight / contentHeight * _domScroll.offsetHeight;
                if (h < 50) { h = 50; }
                _domBox.style.height = h + "px";
            }

            if (_type === "x") {
                let l = panelHeight / contentHeight * _domScroll.offsetWidth;
                if (l < 50) { l = 50; }
                _domBox.style.width = l + "px";
            }

            // 不需要時，自動隱藏
            if (contentHeight - 3 >= panelHeight) {
                _domScroll.style.opacity = "1";
                _domScroll.style.pointerEvents = "";
            } else {
                _domScroll.style.opacity = "0";
                _domScroll.style.pointerEvents = "none";
            }

            setValue(top);
        }

        /**
         * 捲動到指定的 值
         * @param val 
         */
        function setValue(val: number) {

            val = val / (_contentHeight - _panelHeight); // 換算成百分比

            if (_type === "y") {
                val = val * (_domScroll.offsetHeight - _domBox.offsetHeight);
            }

            if (_type === "x") {
                val = val * (_domScroll.offsetWidth - _domBox.offsetWidth);
            }

            setTop(val, "set");
        }

        /**
         * 取得目前的位置(px)
         * @returns 
         */
        function getTop() {
            if (_type === "y") {
                return toNumber(_domBox.style.top);
            }
            if (_type === "x") {
                return toNumber(_domBox.style.left);
            }
            return 0;
        }

        /**
         * 捲動到指定的位置(px)
         * @param val 
         * @param mode set/pan/wheel
         */
        function setTop(val: number, mode: ("set" | "pan" | "wheel")) {

            val = toNumber(val);

            if (_type === "y") {
                if (val < 0) {
                    val = 0;
                }
                if (val > _domScroll.offsetHeight - _domBox.offsetHeight) {
                    val = _domScroll.offsetHeight - _domBox.offsetHeight;
                }
                _domBox.style.top = val + "px";
            }

            if (_type === "x") {
                if (val < 0) {
                    val = 0;
                }
                if (val > _domScroll.offsetWidth - _domBox.offsetWidth) {
                    val = _domScroll.offsetWidth - _domBox.offsetWidth;
                }
                _domBox.style.left = val + "px";
            }
            eventChange(mode);
        }

        /**
         * 取得 捲動時的事件
         * @returns 
         */
        function getEventChange() {
            return _eventChange;
        }

        /**
         * 設定 捲動時的事件
         * @param func 
         */
        function setEventChange(func = (val: number, mode: "set" | "wheel" | "pan") => { }) {
            _eventChange = func;
        }

        /**
         * 捲動時呼叫此函數
         * @param mode 
         */
        function eventChange(mode: ("set" | "pan" | "wheel")) {
            let x = 0;
            if (_type === "y") {
                x = _domScroll.offsetHeight - _domBox.offsetHeight; // 計算剩餘空間
                x = toNumber(_domBox.style.top) / x; // 計算比例
                x = x * (_contentHeight - _panelHeight)
            }

            if (_type === "x") {
                x = _domScroll.offsetWidth - _domBox.offsetWidth; // 計算剩餘空間
                x = toNumber(_domBox.style.left) / x; // 計算比例
                x = x * (_contentHeight - _panelHeight)
            }

            _eventChange(x, mode);
        }

        /**
         * 轉 number
         */
        function toNumber(t: string | number) {
            if (typeof (t) === "number") { return t } // 如果本來就是數字，直接回傳
            if (typeof t === "string") { return Number(t.replace("px", "")); } // 如果是 string，去掉 "px" 再轉數字
            return 0;
        }

    }
}
