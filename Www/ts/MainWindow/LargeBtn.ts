import { MainWindow } from "./MainWindow";

/**
 * 在下面或兩側的 大型切換按鈕
 */
export class LargeBtn {

    public domLargeBtnLeft: HTMLElement;
    public domLargeBtnRight: HTMLElement;
    public setShowType;
    public setHide;

    constructor(M: MainWindow) {

        const _domMainV = document.querySelector(".main-V") as HTMLElement;
        const _domLargeBtnLeft = _domMainV.querySelector("#largeBtnLeft") as HTMLElement; // 上一頁大按鈕
        const _domLargeBtnRight = _domMainV.querySelector("#largeBtnRight") as HTMLElement;

        this.domLargeBtnLeft = _domLargeBtnLeft;
        this.domLargeBtnRight = _domLargeBtnRight;
        this.setShowType = setShowType;
        this.setHide = setHide;

        // 大型換頁按鈕
        _domLargeBtnLeft.addEventListener("click", (e) => {
            M.script.fileLoad.prevFile();
        });
        _domLargeBtnRight.addEventListener("click", (e) => {
            M.script.fileLoad.nextFile();
        });

        // 把滑鼠的滾動事件傳遞給 tiefseeview
        ([_domLargeBtnLeft, _domLargeBtnRight]).forEach(btn => {
            btn.addEventListener("wheel", (event) => {
                event.preventDefault();
                if (M.script.img.isImg() === false) { return; }
                M.fileShow.tiefseeview.sendWheelEvent(event);
            });
        });

        /**
         * 改變顯示類型
         */
        function setShowType(type: string) {
            if (type == "leftRight") {
                _domLargeBtnLeft.setAttribute("data-style", "leftRight-L");
                _domLargeBtnRight.setAttribute("data-style", "leftRight-R");
            } else if (type == "leftRight2") {
                _domLargeBtnLeft.setAttribute("data-style", "leftRight2-L");
                _domLargeBtnRight.setAttribute("data-style", "leftRight2-R");
            } else if (type == "bottom") {
                _domLargeBtnLeft.setAttribute("data-style", "bottom-L");
                _domLargeBtnRight.setAttribute("data-style", "bottom-R");
            } else {
                _domLargeBtnLeft.setAttribute("data-style", "none-L");
                _domLargeBtnRight.setAttribute("data-style", "none-R");
            }
        }

        /** 
         * 暫時隱藏 
         */
        function setHide(val: boolean) {
            if (val) {
                _domLargeBtnLeft.setAttribute("hide", "true");
                _domLargeBtnRight.setAttribute("hide", "true");
            } else {
                _domLargeBtnLeft.setAttribute("hide", "");
                _domLargeBtnRight.setAttribute("hide", "");
            }
        }

    }
}
