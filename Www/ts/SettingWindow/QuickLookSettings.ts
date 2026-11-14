/** 對應設定視窗的「快速預覽」頁面。 */
import { SettingWindowContext } from "./SettingWindowContext";


// 快速預覽
export function initQuickLookSettings({ _config, getDom, saveSetting }: Pick<SettingWindowContext, "_config" | "getDom" | "saveSetting">) {
    const switch_keyboardSpaceRun = getDom("#switch-keyboardSpaceRun") as HTMLInputElement;
    const switch_mouseMiddleRun = getDom("#switch-mouseMiddleRun") as HTMLInputElement;

    switch_keyboardSpaceRun.checked = _config.settings.quickLook.keyboardSpaceRun;
    switch_mouseMiddleRun.checked = _config.settings.quickLook.mouseMiddleRun;

    switch_keyboardSpaceRun.addEventListener("change", () => {
        const val = switch_keyboardSpaceRun.checked;
        _config.settings.quickLook.keyboardSpaceRun = val;
        saveSetting();
    });

    switch_mouseMiddleRun.addEventListener("change", () => {
        const val = switch_mouseMiddleRun.checked;
        _config.settings.quickLook.mouseMiddleRun = val;
        saveSetting();
    });
}
