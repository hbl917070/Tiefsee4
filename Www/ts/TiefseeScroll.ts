/**
 * 滾動條元件
 */
class TiefseeScroll {

    public getEventChange;
    public setEventChange;
    public getTop;
    public setTop;
    public setValue;
    public update;
    public initGeneral;
    public initTiefseeScroll;

    constructor() {

        var domScroll: HTMLElement;
        var domBg: HTMLElement;
        var domBox: HTMLElement;
        var type: ("x" | "y");
        var contentHeight: number = 0; // 內容高度(全部的值)
        var panelHeight: number = 0; // 容器的高度
        var _eventChange = (v: number, mode: "set" | "wheel" | "pan") => { };
        var hammerScroll;
        var startLeft: number = 0;
        var startTop: number = 0;

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
         * @param _domScroll 
         * @param _type 
         */
        function initTiefseeScroll(_domScroll: HTMLElement, _type: ("x" | "y")) {
            domScroll = _domScroll;
            type = _type;

            init();

            // 在滾動條上面滾動時
            domScroll.addEventListener("wheel", (ev) => { MouseWheel(ev); }, true);
            const MouseWheel = (e: WheelEvent) => {
                e.preventDefault(); // 禁止頁面滾動
                let v = getTop();
                if (e.deltaX > 0 || e.deltaY > 0) { // 下
                    setTop(v + 10, "wheel");
                } else { // 上
                    setTop(v - 10, "wheel");
                }
            }
        }

        /**
         * 初始化 - 一般的滾動條
         * @param domPanel 外層的容器
         * @param _type 
         */
        function initGeneral(domPanel: HTMLElement, _type: ("x" | "y")) {

            let domContent = domPanel.firstElementChild as HTMLElement;
            if (domContent === null) {
                return;
            }

            type = _type;

            if (type === "y") {
                domScroll = Lib.newDom(`
                    <div class="scroll-y js-noDrag">
                        <div class="scroll-bg js-noDrag"></div>
                        <div class="scroll-box js-noDrag"></div>
                    </div>`
                );
            } else {
                domScroll = Lib.newDom(`
                    <div class="scroll-x js-noDrag">
                        <div class="scroll-bg js-noDrag"></div>
                        <div class="scroll-box js-noDrag"></div>
                    </div>`
                );
            }
            domPanel.appendChild(domScroll);
            init();

            // 滾動條變化時(主動拖拉滾動條)，同步至容器
            setEventChange((v: number, mode: "set" | "wheel" | "pan") => {
                if (mode === "set") { return; }
                if (type === "y") {
                    domPanel.scrollTop = v;
                } else {
                    domPanel.scrollLeft = v;
                }
            });

            // 容器發生捲動時，更新滾動條
            domPanel.addEventListener("scroll", () => {
                let v;
                if (type === "y") {
                    v = domPanel.scrollTop;
                    domScroll.style.top = v + "px"; // 坐標定位
                } else {
                    v = domPanel.scrollLeft;
                    domScroll.style.left = v + "px"; // 坐標定位
                }
                setValue(v);
            })

            // 區塊或body改變大小時，更新拖曳條的坐標
            function updatePosition() {
                requestAnimationFrame(() => {

                    if (type === "y") {
                        domScroll.style.height = domPanel.offsetHeight + "px";
                        
                        let v = domPanel.scrollTop;
                        if (v + domPanel.offsetHeight > domContent.offsetHeight) { // 避免滾動條影響高度的計算
                            domScroll.style.top =  "0px";
                            v = domPanel.scrollTop;
                        } 
                        domScroll.style.top = v + "px";          

                        update(
                            domContent.offsetHeight,
                            domPanel.offsetHeight,
                            getTop()
                        );

                        setValue(v);

                    } else {
                        domScroll.style.width = domPanel.offsetWidth + "px";
                   
                        let v = domPanel.scrollLeft;
                        if (v + domPanel.offsetWidth > domContent.offsetWidth) { // 避免滾動條影響高度的計算
                            domScroll.style.left =  "0px";
                            v = domPanel.scrollLeft;
                        } 
                        domScroll.style.left = v + "px";

                        update(
                            domContent.offsetWidth,
                            domPanel.offsetWidth,
                            getTop()
                        );
                        
                        setValue(v);
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
            domBg = <HTMLElement>domScroll.querySelector(".scroll-bg");
            domBox = <HTMLElement>domScroll.querySelector(".scroll-box");
            hammerScroll = new Hammer(domScroll, {});

            // 拖曳開始
            domScroll.addEventListener("mousedown", (ev) => { touchStart(ev); });
            domScroll.addEventListener("touchstart", (ev) => { touchStart(ev); });
            const touchStart = (ev: any) => {
                ev.preventDefault();
                startLeft = toNumber(domBox.style.left);
                startTop = toNumber(domBox.style.top);
            }

            // 拖曳中
            hammerScroll.get("pan").set({ threshold: 0, direction: Hammer.DIRECTION_ALL });
            hammerScroll.on("pan", (ev) => {
                ev.preventDefault();
                let deltaX = ev["deltaX"];
                let deltaY = ev["deltaY"];
                if (type === "y") {
                    let top = startTop + deltaY;
                    setTop(top, "pan");
                }
                if (type === "x") {
                    let left = startLeft + deltaX;
                    setTop(left, "pan");
                }
                domScroll.setAttribute("action", "true"); // 表示「拖曳中」，用於CSS樣式
            });

            hammerScroll.on("panend", (ev) => {
                domScroll.setAttribute("action", ""); // 表示「結束拖曳」，用於CSS樣式
            });
        }

        /**
         * 
         * @param _contentHeight 內容高度(全部的值)
         * @param _panelHeight 容器高度
         * @param _top 目前的值
         */
        function update(_contentHeight: number, _panelHeight: number, _top: number): void {

            if (_top === undefined) {
                _top = 0;
            }

            contentHeight = _contentHeight;
            panelHeight = _panelHeight;

            if (type === "y") {
                let h = _panelHeight / _contentHeight * domScroll.offsetHeight;
                if (h < 50) { h = 50; }
                domBox.style.height = h + "px";
            }

            if (type === "x") {
                let l = _panelHeight / _contentHeight * domScroll.offsetWidth;
                if (l < 50) { l = 50; }
                domBox.style.width = l + "px";
            }

            // 不需要時，自動隱藏
            if (_contentHeight - 3 >= _panelHeight) {
                domScroll.style.opacity = "1";
                domScroll.style.pointerEvents = "";
            } else {
                domScroll.style.opacity = "0";
                domScroll.style.pointerEvents = "none";
            }

            setValue(_top);
        }

        /**
         * 捲動到指定的 值
         * @param v 
         */
        function setValue(v: number): void {

            v = v / (contentHeight - panelHeight); // 換算成百分比

            if (type === "y") {
                v = v * (domScroll.offsetHeight - domBox.offsetHeight);
            }

            if (type === "x") {
                v = v * (domScroll.offsetWidth - domBox.offsetWidth);
            }

            setTop(v, "set");
        }

        /**
         * 取得目前的位置(px)
         * @returns 
         */
        function getTop(): number {
            if (type === "y") {
                return toNumber(domBox.style.top);
            }
            if (type === "x") {
                return toNumber(domBox.style.left);
            }
            return 0;
        }

        /**
         * 捲動到指定的位置(px)
         * @param v 
         * @param mode set/pan/wheel
         */
        function setTop(v: number, mode: ("set" | "pan" | "wheel")): void {

            v = toNumber(v);

            if (type === "y") {
                if (v < 0) {
                    v = 0;
                }
                if (v > domScroll.offsetHeight - domBox.offsetHeight) {
                    v = domScroll.offsetHeight - domBox.offsetHeight;
                }
                domBox.style.top = v + "px";
            }

            if (type === "x") {
                if (v < 0) {
                    v = 0;
                }
                if (v > domScroll.offsetWidth - domBox.offsetWidth) {
                    v = domScroll.offsetWidth - domBox.offsetWidth;
                }
                domBox.style.left = v + "px";
            }
            eventChange(mode);
        }

        /**
         * 取得 捲動時的事件
         * @returns 
         */
        function getEventChange(): (v: number, mode: "set" | "wheel" | "pan") => void {
            return _eventChange;
        }

        /**
         * 設定 捲動時的事件
         * @param func 
         */
        function setEventChange(func = (v: number, mode: "set" | "wheel" | "pan") => { }) {
            _eventChange = func;
        }

        /**
         * 捲動時呼叫此函數
         * @param mode 
         */
        function eventChange(mode: ("set" | "pan" | "wheel")): void {
            let x = 0;
            if (type === "y") {
                x = domScroll.offsetHeight - domBox.offsetHeight; // 計算剩餘空間
                x = toNumber(domBox.style.top) / x; // 計算比例
                x = x * (contentHeight - panelHeight)
            }

            if (type === "x") {
                x = domScroll.offsetWidth - domBox.offsetWidth; // 計算剩餘空間
                x = toNumber(domBox.style.left) / x; // 計算比例
                x = x * (contentHeight - panelHeight)
            }

            _eventChange(x, mode);
        }


        /**
         * 轉 number
         * @param t 
         * @returns 
         */
        function toNumber(t: string | number): number {
            if (typeof (t) === "number") { return t } // 如果本來就是數字，直接回傳
            if (typeof t === "string") { return Number(t.replace("px", "")); } // 如果是string，去掉px後轉型成數字
            return 0;
        }

    }
}
