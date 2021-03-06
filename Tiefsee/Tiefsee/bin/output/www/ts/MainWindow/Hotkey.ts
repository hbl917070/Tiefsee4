/**
 * 快速鍵
 */
class Hotkey {

    constructor(M: MainWindow) {


        //快速鍵處理(暫時)
        window.addEventListener("keydown", async (e) => {

            //console.log(e)

            if (e.code == "F5") { return; }
            if (e.code == "F12") { return; }

            //如果有開啟選單
            if (M.menu.isShow()) {
                if (e.code == "Escape") {
                    M.menu.close();
                    return;
                }
            }

            //如果有開啟msg視窗
            if (Msgbox.isShow()) {
                if (e.code == "Escape") {
                    Msgbox.closeNow();
                }
                if (e.code == "Enter" || e.code == "NumpadEnter") {
                    Msgbox.clickYes();
                }
                return;
            }

            //允許的名單
            let allow = (e.code === "KeyC" && e.ctrlKey)
                || (e.code === "KeyD" && e.ctrlKey)

            if (allow === false) {
                e.preventDefault();
            }


            if (e.code === "KeyC" && e.ctrlKey) {
                if (Lib.isTxtSelect() === false) {
                    M.script.copy.copyImg();
                }
            }
            if (e.code === "ArrowRight") {
                M.script.fileLoad.nextFile();
            }
            if (e.code === "ArrowLeft") {
                M.script.fileLoad.prevFile();
            }
            if (e.code === "ArrowUp") {
                M.script.img.move("up");
            }
            if (e.code === "ArrowDown") {
                M.script.img.move("down");
            }
            if (e.code === "Escape") {
                baseWindow.close();
            }
            if (e.code === "KeyR") {
                M.script.img.degForward();
            }
            if (e.code === "KeyF") {
                M.script.img.zoomFull();
            }
            if (e.code === "KeyH") {
                M.script.img.mirrorHorizontal();
            }
            if (e.code === "KeyV") {
                M.script.img.mirrorVertica();
            }
            if (e.code === "ShiftRight") {
                M.script.img.zoomIn();
            }
            if (e.code === "ControlRight") {
                M.script.img.zoomOut();
            }
            if (e.code === "F2") {
                M.script.fileLoad.renameMsg();
            }
            if (e.code === "Delete") {
                M.script.fileLoad.showDeleteMsg();
            }
            if (e.code === "KeyO") {
                M.script.open.showOnExplorer();
            }

            if (e.code === "KeyM") {
                M.script.open.ShowContextMenu();
            }
            if (e.code === "Comma") {
                M.script.fileLoad.prevDir();
            }
            if (e.code === "Period") {
                M.script.fileLoad.nextDir();
            }
            if (e.code === "Home") {
                M.script.fileLoad.firstFile();
            }
            if (e.code === "End") {
                M.script.fileLoad.lastFile();
            }
        });


    }
}