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
            if (M.menu.getIsShow()) {
                if (e.code == "Escape") {
                    M.menu.close();
                    return;
                }

                //選單裡面的輸入框
                if (Lib.isTextFocused()) {
                    return;
                    /*if (e.code === "ArrowRight"
                        || e.code === "ArrowLeft"
                        || e.code === "KeyA"
                        || e.code === "KeyZ"
                        || e.code === "KeyX"
                        || e.code === "KeyC"
                        || e.code === "KeyV"
                        || e.key === "Control"
                        || e.key === "Shift"
                    ) {
                        return;
                    }*/
                }

            }

            //如果有開啟msg視窗
            if (M.msgbox.isShow()) {
                if (e.code == "Escape") {
                    M.msgbox.closeNow();
                    e.preventDefault();
                }
                if (e.code == "Enter" || e.code == "NumpadEnter") {
                    M.msgbox.clickYes();
                    e.preventDefault();
                }
                return;
            }

            //如果可以返回上一頁
            if (M.toolbarBack.getVisible()) {
                if (e.code == "Escape" || e.code == "Backspace") {
                    M.toolbarBack.runEvent();
                    e.preventDefault();
                    return;
                }
            }

            //如果在全螢幕狀態下
            if (M.fullScreen.getEnabled()) {
                if (e.code == "Escape") {
                    M.fullScreen.setEnabled(false);
                    e.preventDefault();
                    return;
                }
            }

            if (e.code === "F11") {
                M.fullScreen.setEnabled();
                return;
            }

            //如果有開啟大量瀏覽模式
            if (M.fileLoad.getIsBulkView()) {

                M.bulkView.setFocus();

                if (e.code === "ArrowRight") {
                    M.script.bulkView.pageNext();
                }
                if (e.code === "ArrowLeft") {
                    M.script.bulkView.pagePrev();
                }
                if (e.code === "Comma") {
                    M.script.fileLoad.prevDir();
                }
                if (e.code === "Period") {
                    M.script.fileLoad.nextDir();
                }
                if (e.code == "Escape") {
                    M.script.bulkView.close();
                }
                if (e.code === "F2") {
                    M.script.fileLoad.showRenameMsg();
                }
                if (e.code === "KeyO") {
                    M.script.open.revealInFileExplorer();
                }
                if (e.code === "KeyM") {
                    M.script.open.systemContextMenu();
                }
                if (e.code === "Space" && M.getIsQuickLook()) { //避免跟快速預覽的空白鍵衝突
                    e.preventDefault();
                }
                for (let i = 1; i <= 8; i++) {
                    if (e.key == i.toString()) {
                        M.script.bulkView.setColumns(i);
                    }
                }

                return;
            }

            //如果顯示的類型是 文字編輯器，則不使用快速鍵
            if (M.fileShow.getGroupType() == GroupType.txt) {
                if (Lib.isTextFocused()) {
                    if (e.code === "KeyS" && e.ctrlKey) {
                        M.script.file.save();
                    }
                    return;
                }
            }

            //允許的名單
            let allow = (e.code === "KeyC" && e.ctrlKey)
                || (e.code === "KeyD" && e.ctrlKey)

            if (allow === false) {
                e.preventDefault();
            }


            if (e.code === "KeyC" && e.ctrlKey) {
                if (Lib.isTxtSelect() === false) {
                    M.script.copy.copyImage();
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
                M.script.img.zoomToFit();
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
                M.script.fileLoad.showRenameMsg();
            }
            if (e.code === "Delete") {
                M.script.fileLoad.showDeleteFileMsg();
            }
            if (e.code === "KeyO") {
                M.script.open.revealInFileExplorer();
            }
            if (e.code === "KeyM") {
                M.script.open.systemContextMenu();
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
            if (e.code === "KeyB") {
                M.script.bulkView.show();
            }
        });


    }
}