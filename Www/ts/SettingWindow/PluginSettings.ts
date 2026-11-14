/** 對應設定視窗的「擴充套件」頁面。 */
import { SettingWindowContext } from "./SettingWindowContext";
import { Lib } from "../Lib";

// 擴充套件
export function initPluginSettings({ getDom, restartTiefsee }: Pick<SettingWindowContext, "getDom" | "restartTiefsee">) {

    function getHtml(val: boolean) {
        if (val) {
            return `<div class="pluginLiet-status color-success">Installed</div>`;
        } else {
            return `<div class="pluginLiet-status color-warning">Not Installed</div>`;
        }
    }
    if (baseWindow.appInfo !== undefined) {

        // 初始化 擴充套件清單
        const dom_QuickLook = getDom("#pluginLiet-QuickLook") as HTMLInputElement;
        // const dom_NConvert = getDom("#pluginLiet-NConvert") as HTMLInputElement;
        const dom_PDFTronWebviewer = getDom("#pluginLiet-PDFTronWebviewer") as HTMLInputElement;
        const dom_MonacoEditor = getDom("#pluginLiet-MonacoEditor") as HTMLInputElement;
        const dom_hdrfix = getDom("#pluginLiet-hdrfix") as HTMLInputElement;

        dom_QuickLook.innerHTML = getHtml(baseWindow.appInfo.plugin.QuickLook);
        // dom_NConvert.innerHTML = getHtml(baseWindow.appInfo.plugin.NConvert);
        dom_PDFTronWebviewer.innerHTML = getHtml(baseWindow.appInfo.plugin.PDFTronWebviewer);
        dom_MonacoEditor.innerHTML = getHtml(baseWindow.appInfo.plugin.MonacoEditor);
        dom_hdrfix.innerHTML = getHtml(baseWindow.appInfo.plugin.Hdrfix);

        // 同步更新「快速預覽」頁；如果未安裝 QuickLook 擴充套件，就顯示提示文字，並且禁止編輯
        const dom_noInstalled = getDom("#quickLook-noInstalled") as HTMLInputElement;
        const dom_box = getDom("#quickLook-box") as HTMLInputElement;
        if (baseWindow.appInfo.plugin.QuickLook) {
            dom_noInstalled.style.display = "none";
            dom_box.style.opacity = "1";
            dom_box.style.pointerEvents = "";
        } else {
            dom_noInstalled.style.display = "block";
            dom_box.style.opacity = "0.5";
            dom_box.style.pointerEvents = "none";
        }
    }

    // 開啟「Tiefsee Plugin」頁面
    getDom("#btn-openPluginDownload")?.addEventListener("click", () => {
        WV_RunApp.OpenUrl("https://hbl917070.github.io/aeropic/plugin.html");
    });

    // 開啟「Plugin」資料夾
    getDom("#btn-openPluginDir")?.addEventListener("click", async () => {
        let path = await WV_Window.GetAppDataPath();
        path = Lib.combine([path, "Plugin"]);
        if (await WV_Directory.Exists(path) === false) { // 如果不存在就新建
            await WV_Directory.CreateDirectory(path);
        }
        WV_RunApp.OpenUrl(path);
    });

    // 重新啟動
    const btn_restart = getDom("#btn-plugin-restart") as HTMLButtonElement;
    btn_restart.addEventListener("click", () => {
        restartTiefsee();
    });
}
