import { MainWindow } from "./MainWindow";

/**
 * 全螢幕
 */
export class FullScreen {

    M: MainWindow;

    /** 是否啟用全螢幕 */
    private enabled = false;
    /** 當前是否顯示標題列與工具列 */
    private showTitlebar = false;
    private domTitleBar = document.querySelector("#window-titlebar") as HTMLDivElement;
    /** 標題列 - 離開全螢幕 */
    private btnExitFullScreen = document.querySelector(".titlebar-toolbar-exitFullScreen") as HTMLDivElement;

    /** 滑鼠移到視窗頂端時，顯示標題列與工具列。 */
    private mousemoveEvent = (e: MouseEvent) => {
        if (!this.showTitlebar && e.clientY <= 5) {
            this.showTitlebar = true;
        } else if (this.showTitlebar && e.clientY < this.domTitleBar.offsetHeight + 10) {
            this.showTitlebar = true;
        } else {
            this.showTitlebar = false;
        }
        document.body.setAttribute("showTitlebar", String(this.showTitlebar));
    };

    /** 視窗化後就結束全螢幕 */
    private exitEvent = async () => {
        if (this.getEnabled() === true && baseWindow.windowState !== "Maximized") {
            this.setEnabled(false);
        }
    }

    /**
     * 
     */
    constructor(M: MainWindow) {
        this.M = M;

        // 結束全螢幕
        this.btnExitFullScreen.addEventListener("click", () => {
            this.setEnabled(false);
        });
    }

    /**
     * 取得 是否啟用全螢幕
     */
    public getEnabled() {
        return this.enabled;
    }

    /**
     * 啟用或關閉全螢幕
     * @param val 
     */
    public async setEnabled(val?: boolean) {
        if (val === undefined) {
            val = !this.enabled;
        }
        this.enabled = val;
        this.M.menu.close();

        await WV_Window.SetFullScreen(val);

        if (val) {
            this.showTitlebar = false;
            document.body.removeAttribute("showTitlebar");
            document.body.setAttribute("fullScreen", "true");
            document.addEventListener("mousemove", this.mousemoveEvent);
            baseWindow.sizeChangeEvents.push(this.exitEvent);
        } else {
            document.body.setAttribute("fullScreen", "false");
            document.removeEventListener("mousemove", this.mousemoveEvent);
            this.showTitlebar = false;
            document.body.removeAttribute("showTitlebar");
            // 移除事件
            const index = baseWindow.sizeChangeEvents.indexOf(this.exitEvent);
            if (index > -1) {
                baseWindow.sizeChangeEvents.splice(index, 1);
            }
        }

    }
}
