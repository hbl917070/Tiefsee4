/** 對應設定視窗的「設為預設程式」頁面。 */
import { SettingWindowContext } from "./SettingWindowContext";


// 關聯副檔名
export function initFileAssociationSettings({ _i18n, _msgbox, getDom }: Pick<SettingWindowContext, "_i18n" | "_msgbox" | "getDom">) {
    const text_extension = getDom("#text-extension") as HTMLTextAreaElement;
    const btn_extension = getDom("#btn-extension") as HTMLElement;
    const text_disassociate = getDom("#text-disassociate") as HTMLTextAreaElement;
    const btn_disassociate = getDom("#btn-disassociate") as HTMLElement;

    const s_extension = ["JPG", "JPEG", "PNG", "GIF", "BMP", "SVG", "WEBP",];
    text_extension.value = s_extension.join("\n"); // 預設顯示的文字
    text_disassociate.value = s_extension.join("\n"); // 預設顯示的文字

    // 關聯副檔名
    btn_extension.addEventListener("click", async (e) => {
        const arExtension = text_extension.value.split("\n");
        let ar: string[] = [];
        for (let i = 0; i < arExtension.length; i++) {
            const item = arExtension[i].toLocaleLowerCase().trim();
            if (item !== "" && ar.indexOf(item) === -1) {
                ar.push(item);
            }
        }

        _msgbox.show({
            txt: _i18n.t("msg.associationExtension") + "\n" // 確定用Tiefsee來開啟這些檔案嗎？
                + ar.join(", "),
            funcYes: async (dom: HTMLElement, inputTxt: string) => {
                _msgbox.close(dom);
                let appPath = await WV_Window.GetTiefseePath();
                await WV_System.AssociationExtension(ar, appPath);
                _msgbox.show({ txt: _i18n.t("msg.done"), }); // 處理完成
            }
        });
    });

    // 解除關聯副檔名
    btn_disassociate.addEventListener("click", async (e) => {
        const arExtension = text_disassociate.value.split("\n");
        let ar: string[] = [];
        for (let i = 0; i < arExtension.length; i++) {
            const item = arExtension[i].toLocaleLowerCase().trim();
            if (item !== "" && ar.indexOf(item) === -1) {
                ar.push(item);
            }
        }

        _msgbox.show({
            txt: _i18n.t("msg.removeAssociationExtension") + "\n" // 確定要解除這些檔案與Tiefsee的關聯嗎？
                + ar.join(", "),
            funcYes: async (dom: HTMLElement, inputTxt: string) => {
                _msgbox.close(dom);
                let appPath = await WV_Window.GetTiefseePath();
                await WV_System.RemoveAssociationExtension(ar, appPath);
                _msgbox.show({ txt: _i18n.t("msg.done"), }); // 處理完成
            }
        });
    });
}

// 開啟 系統設定
export function initSystemSettingsSettings({ getDom }: Pick<SettingWindowContext, "getDom">) {
    const btn = getDom("#btn-openSystemSettings") as HTMLElement;

    btn.addEventListener("click", async () => {
        let path = "ms-settings:defaultapps";
        WV_RunApp.OpenUrl(path)
    });
}
