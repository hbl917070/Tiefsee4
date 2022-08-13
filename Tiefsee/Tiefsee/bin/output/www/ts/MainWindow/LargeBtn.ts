/**
 * 在下面或兩側的 大型切換按鈕
 */
class LargeBtn {

    public dom_largeBtnLeft: HTMLElement;
    public dom_largeBtnRight: HTMLElement;
    public setShowType;
    public setHide;

    constructor(M: MainWindow) {
        var dom_largeBtnLeft = document.getElementById("largeBtnLeft") as HTMLElement;//上一頁大按鈕
        var dom_largeBtnRight = document.getElementById("largeBtnRight") as HTMLElement;

        this.dom_largeBtnLeft = dom_largeBtnLeft;
        this.dom_largeBtnRight = dom_largeBtnRight;
        this.setShowType = setShowType;
        this.setHide = setHide;

        //大型換頁按鈕
        dom_largeBtnLeft.addEventListener("click", function (e) {
            M.script.fileLoad.prevFile();
        })
        dom_largeBtnRight.addEventListener("click", function (e) {
            M.script.fileLoad.nextFile();
        })


        /**
         * 改變顯示類型
         */
        function setShowType(type: string) {
            if (type == "leftRight") {
                dom_largeBtnLeft.setAttribute("data-style", "leftRight-L");
                dom_largeBtnRight.setAttribute("data-style", "leftRight-R");
            } else if (type == "bottom") {
                dom_largeBtnLeft.setAttribute("data-style", "bottom-L");
                dom_largeBtnRight.setAttribute("data-style", "bottom-R");
            } else {
                dom_largeBtnLeft.setAttribute("data-style", "none-L");
                dom_largeBtnRight.setAttribute("data-style", "none-R");
            }
        }


        /** 
         * 暫時隱藏 
         */
        function setHide(val: boolean) {
            if (val) {
                dom_largeBtnLeft.setAttribute("hide", "true");
                dom_largeBtnRight.setAttribute("hide", "true");
            } else {
                dom_largeBtnLeft.setAttribute("hide", "");
                dom_largeBtnRight.setAttribute("hide", "");
            }
        }

    }
}