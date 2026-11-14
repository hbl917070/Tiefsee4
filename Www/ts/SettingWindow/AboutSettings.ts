/** 對應設定視窗的「關於」頁面。 */
import { SettingWindowContext } from "./SettingWindowContext";


// 關於
export async function initAboutSettings({ getDom }: Pick<SettingWindowContext, "getDom">) {
    const webViewVersion = getDom("#span-webViewVersion") as HTMLInputElement;
    webViewVersion.innerHTML = await WV_Window.GetBrowserVersionString();

    const serverPort = getDom("#span-serverPort") as HTMLInputElement;
    serverPort.innerHTML = PORT;
}
