/**
 * 在下面或兩側的 大型切換按鈕
 */
class LargeBtn {

    public domLargeBtnLeft: HTMLElement;
    public domLargeBtnRight: HTMLElement;
    public setShowType;
    public setHide;

    constructor(M: MainWindow) {

        var domMainV = document.querySelector(".main-V") as HTMLElement;
        var domLargeBtnLeft = domMainV.querySelector("#largeBtnLeft") as HTMLElement; //上一頁大按鈕
        var domLargeBtnRight = domMainV.querySelector("#largeBtnRight") as HTMLElement;

        this.domLargeBtnLeft = domLargeBtnLeft;
        this.domLargeBtnRight = domLargeBtnRight;
        this.setShowType = setShowType;
        this.setHide = setHide;

        //大型換頁按鈕
        domLargeBtnLeft.addEventListener("click", function (e) {
            M.script.fileLoad.prevFile();
        });
        domLargeBtnRight.addEventListener("click", function (e) {
            M.script.fileLoad.nextFile();
        });


        // 把滑鼠的滾動事件傳遞給 tiefseeview
        ([domLargeBtnLeft, domLargeBtnRight]).forEach(btn => {
            btn.addEventListener("wheel", (event) => {

                event.preventDefault();

                if (M.script.img.isImg() === false) { return; }

                let newEvent = new WheelEvent("wheel", {
                    clientX: event.x,
                    clientY: event.y,
                    deltaX: event.deltaX,
                    deltaY: event.deltaY,
                    deltaZ: event.deltaZ,
                    deltaMode: event.deltaMode
                });
                M.fileShow.tiefseeview.sendWheelEvent(newEvent);
            });
        });


        /**
         * 改變顯示類型
         */
        function setShowType(type: string) {
            if (type == "leftRight") {
                domLargeBtnLeft.setAttribute("data-style", "leftRight-L");
                domLargeBtnRight.setAttribute("data-style", "leftRight-R");
            } else if (type == "leftRight2") {
                domLargeBtnLeft.setAttribute("data-style", "leftRight2-L");
                domLargeBtnRight.setAttribute("data-style", "leftRight2-R");
            } else if (type == "bottom") {
                domLargeBtnLeft.setAttribute("data-style", "bottom-L");
                domLargeBtnRight.setAttribute("data-style", "bottom-R");
            } else {
                domLargeBtnLeft.setAttribute("data-style", "none-L");
                domLargeBtnRight.setAttribute("data-style", "none-R");
            }
        }


        /** 
         * 暫時隱藏 
         */
        function setHide(val: boolean) {
            if (val) {
                domLargeBtnLeft.setAttribute("hide", "true");
                domLargeBtnRight.setAttribute("hide", "true");
            } else {
                domLargeBtnLeft.setAttribute("hide", "");
                domLargeBtnRight.setAttribute("hide", "");
            }
        }

    }
}