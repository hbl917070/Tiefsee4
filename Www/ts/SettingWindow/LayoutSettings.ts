/** 對應設定視窗的「佈局」頁面。 */
import { SettingWindowContext } from "./SettingWindowContext";
import { Lib } from "../Lib";
import Sortable from "sortablejs";

// 工具列
export function initToolbarVisibilitySettings({ _config, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "getDom" | "appleSettingOfMain">) {
    const switch_mainToolbarEnabled = getDom("#switch-mainToolbarEnabled") as HTMLInputElement;

    switch_mainToolbarEnabled.checked = _config.settings["layout"]["mainToolbarEnabled"]; // 顯示工具列

    switch_mainToolbarEnabled.addEventListener("change", () => { // 顯示工具列
        const val = switch_mainToolbarEnabled.checked;
        _config.settings["layout"]["mainToolbarEnabled"] = val;
        appleSettingOfMain();
    });

}

// 檔案預覽視窗
export function initFilePanelSettings({ _config, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "getDom" | "appleSettingOfMain">) {
    const switch_fileListEnabled = getDom("#switch-fileListEnabled") as HTMLInputElement;
    const switch_fileListShowNo = getDom("#switch-fileListShowNo") as HTMLInputElement;
    const switch_fileListShowName = getDom("#switch-fileListShowName") as HTMLInputElement;
    switch_fileListEnabled.checked = _config.settings["layout"]["fileListEnabled"]; // 啟用 檔案預覽視窗
    switch_fileListShowNo.checked = _config.settings["layout"]["fileListShowNo"]; // 顯示編號
    switch_fileListShowName.checked = _config.settings["layout"]["fileListShowName"]; // 顯示檔名

    switch_fileListEnabled.addEventListener("change", () => { // 啟用 檔案預覽視窗
        const val = switch_fileListEnabled.checked;
        _config.settings["layout"]["fileListEnabled"] = val;
        appleSettingOfMain();
    });
    switch_fileListShowNo.addEventListener("change", () => { // 顯示編號
        const val = switch_fileListShowNo.checked;
        _config.settings["layout"]["fileListShowNo"] = val;
        appleSettingOfMain();
    });
    switch_fileListShowName.addEventListener("change", () => { // 顯示檔名
        const val = switch_fileListShowName.checked;
        _config.settings["layout"]["fileListShowName"] = val;
        appleSettingOfMain();
    });
}

// 資料夾預覽視窗
export function initDirectoryPanelSettings({ _config, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "getDom" | "appleSettingOfMain">) {
    const switch_dirListEnabled = getDom("#switch-dirListEnabled") as HTMLInputElement;
    const switch_dirListShowNo = getDom("#switch-dirListShowNo") as HTMLInputElement;
    const switch_dirListShowName = getDom("#switch-dirListShowName") as HTMLInputElement;
    const select_dirListImgNumber = getDom("#select-dirListImgNumber") as HTMLInputElement;

    switch_dirListEnabled.checked = _config.settings["layout"]["dirListEnabled"]; // 啟用 資料夾預覽視窗
    switch_dirListShowNo.checked = _config.settings["layout"]["dirListShowNo"]; // 顯示編號
    switch_dirListShowName.checked = _config.settings["layout"]["dirListShowName"]; // 顯示檔名
    select_dirListImgNumber.value = _config.settings["layout"]["dirListImgNumber"] + ""; // 圖片數量

    switch_dirListEnabled.addEventListener("change", () => { // 啟用 資料夾預覽視窗
        const val = switch_dirListEnabled.checked;
        _config.settings["layout"]["dirListEnabled"] = val;
        appleSettingOfMain();
    });
    switch_dirListShowNo.addEventListener("change", () => { // 顯示編號
        const val = switch_dirListShowNo.checked;
        _config.settings["layout"]["dirListShowNo"] = val;
        appleSettingOfMain();
    });
    switch_dirListShowName.addEventListener("change", () => { // 顯示檔名
        const val = switch_dirListShowName.checked;
        _config.settings["layout"]["dirListShowName"] = val;
        appleSettingOfMain();
    });
    select_dirListImgNumber.addEventListener("change", () => { // 圖片數量
        const val = Number(select_dirListImgNumber.value);
        _config.settings["layout"]["dirListImgNumber"] = val;
        appleSettingOfMain();
    });
}

// 詳細資料面板
export function initInformationPanelSettings({ _config, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "getDom" | "appleSettingOfMain">) {
    // 顯示 詳細資料面板
    const switch_mainExifEnabled = getDom("#switch-mainExifEnabled") as HTMLInputElement;
    switch_mainExifEnabled.checked = _config.settings["layout"]["mainExifEnabled"];
    switch_mainExifEnabled.addEventListener("change", () => {
        let val = switch_mainExifEnabled.checked;
        _config.settings["layout"]["mainExifEnabled"] = val;
        appleSettingOfMain();
    });

    // 寬度足夠時，橫向排列
    const switch_mainExifHorizontal = getDom("#switch-mainExifHorizontal") as HTMLInputElement;
    switch_mainExifHorizontal.checked = _config.settings["layout"]["mainExifHorizontal"];
    switch_mainExifHorizontal.addEventListener("change", () => {
        let val = switch_mainExifHorizontal.checked;
        _config.settings["layout"]["mainExifHorizontal"] = val;
        appleSettingOfMain();
    });

    // 顯示相關檔案
    const switch_relatedFilesEnabled = getDom("#switch-relatedFilesEnabled") as HTMLInputElement;
    switch_relatedFilesEnabled.checked = _config.settings["layout"]["relatedFilesEnabled"];
    switch_relatedFilesEnabled.addEventListener("change", () => {
        let val = switch_relatedFilesEnabled.checked;
        _config.settings["layout"]["relatedFilesEnabled"] = val;
        appleSettingOfMain();
    });

    // 顯示的最大行數(1~100)
    const text_mainExifMaxLine = getDom("#text-mainExifMaxLine") as HTMLInputElement;
    text_mainExifMaxLine.value = _config.settings["layout"]["mainExifMaxLine"] + "";
    text_mainExifMaxLine.addEventListener("change", () => {
        let val = Math.floor(Number(text_mainExifMaxLine.value));
        if (val > 1000) { val = 1000; }
        if (val <= 0) { val = 1; }
        text_mainExifMaxLine.value = val + "";
        _config.settings["layout"]["mainExifMaxLine"] = val;
        appleSettingOfMain();
    });

    const text_a1111Models = getDom("#text-a1111Models") as HTMLInputElement;
    text_a1111Models.value = _config.settings.layout.a1111Models;
    text_a1111Models.addEventListener("change", () => {
        // 取出每一行，去除前後空白，並且不重複
        const ar = text_a1111Models.value.split("\n")
            .map(item => item.trim())
            .filter((item, index, self) => self.indexOf(item) === index);
        const t = ar.join("\n");
        text_a1111Models.value = t;
        _config.settings.layout.a1111Models = t;
        appleSettingOfMain();
    });

    // 顯示 Civitai Resources
    const divCivitaiBox = getDom("#civitaiBox") as HTMLElement;
    function updateCivitaiBox() {
        if (switch_civitaiResourcesEnabled.checked) {
            divCivitaiBox.setAttribute("active", "true");
        } else {
            divCivitaiBox.removeAttribute("active");
        }
    }
    const switch_civitaiResourcesEnabled = getDom("#switch-civitaiResourcesEnabled") as HTMLInputElement;
    switch_civitaiResourcesEnabled.checked = _config.settings["layout"]["civitaiResourcesEnabled"];
    updateCivitaiBox();
    switch_civitaiResourcesEnabled.addEventListener("change", () => {
        const val = switch_civitaiResourcesEnabled.checked;
        _config.settings["layout"]["civitaiResourcesEnabled"] = val;
        appleSettingOfMain();
        updateCivitaiBox();
    });

    // 圖片預設狀態
    const select_civitaiResourcesDefault = getDom("#select-civitaiResourcesDefault") as HTMLSelectElement;
    select_civitaiResourcesDefault.value = _config.settings.layout.civitaiResourcesDefault.toString();
    select_civitaiResourcesDefault.addEventListener("change", () => {
        const val = select_civitaiResourcesDefault.value;
        _config.settings.layout.civitaiResourcesDefault = val === "true";
        appleSettingOfMain();
    });

    // 圖片數量
    const select_civitaiResourcesImgNumber = getDom("#select-civitaiResourcesImgNumber") as HTMLSelectElement;
    select_civitaiResourcesImgNumber.value = _config.settings.layout.civitaiResourcesImgNumber.toString();
    select_civitaiResourcesImgNumber.addEventListener("change", () => {
        const val = Number(select_civitaiResourcesImgNumber.value);
        _config.settings.layout.civitaiResourcesImgNumber = val;
        appleSettingOfMain();
    });

    // Civitai 網域
    const select_civitaiResourcesDomain = getDom("#select-civitaiResourcesDomain") as HTMLSelectElement;
    select_civitaiResourcesDomain.value = _config.settings.layout.civitaiResourcesDomain;
    select_civitaiResourcesDomain.addEventListener("change", () => {
        _config.settings.layout.civitaiResourcesDomain = select_civitaiResourcesDomain.value;
        appleSettingOfMain();
    });

    // 允許 NSFW 圖片
    const switch_civitaiResourcesNsfwLevel = getDom("#switch-civitaiResourcesNsfwLevel") as HTMLInputElement;
    switch_civitaiResourcesNsfwLevel.checked = _config.settings.layout.civitaiResourcesNsfwLevel == 99;
    switch_civitaiResourcesNsfwLevel.addEventListener("change", () => {
        const val = switch_civitaiResourcesNsfwLevel.checked;
        _config.settings.layout.civitaiResourcesNsfwLevel = val ? 99 : 3;
        appleSettingOfMain();
    });
}

// 大型切換按鈕
export function initLargeButtonsSettings({ _config, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "getDom" | "appleSettingOfMain">) {
    // 初始化設定
    Lib.setRadio("[name='largeBtn']", _config.settings.layout.largeBtn);

    // 變更時
    const domRadio = getDom("#largeBtn-group") as HTMLElement;
    domRadio.addEventListener("change", () => {
        let val = Lib.getRadio("[name='largeBtn']");
        _config.settings.layout.largeBtn = val;
        appleSettingOfMain();
    });
}

// 佈局順序
export function initPanelOrderSettings({ _config, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "appleSettingOfMain">) {
    const dom_toolbarList = document.querySelector("#layoutOrder-list") as HTMLElement;
    const dom_layoutOrderItem = dom_toolbarList.querySelectorAll(".layoutOrder-item");

    const dirPanelOrder = _config.settings.layout.dirPanelOrder;
    const filePanelOrder = _config.settings.layout.filePanelOrder;
    const imagePanelOrder = _config.settings.layout.imagePanelOrder;
    const infoPanelOrder = _config.settings.layout.infoPanelOrder;

    const dirPanelString = "sw.layoutOrder.dirPanel";
    const filePanelString = "sw.layoutOrder.filePanel";
    const imagePanelString = "sw.layoutOrder.imagePanel";
    const infoPanelString = "sw.layoutOrder.infoPanel";
    dom_layoutOrderItem[dirPanelOrder].setAttribute("i18n", dirPanelString);
    dom_layoutOrderItem[filePanelOrder].setAttribute("i18n", filePanelString);
    dom_layoutOrderItem[imagePanelOrder].setAttribute("i18n", imagePanelString);
    dom_layoutOrderItem[infoPanelOrder].setAttribute("i18n", infoPanelString);

    // 初始化拖曳功能
    new Sortable(dom_toolbarList, {
        animation: 150,
        onEnd: (evt) => {

            // 取得目前 dom 的順序
            const doms = dom_toolbarList.querySelectorAll(".layoutOrder-item");
            let ar = [];
            for (let i = 0; i < doms.length; i++) {
                ar.push(doms[i].getAttribute("i18n"));
            }

            // 設定 config
            for (let i = 0; i < ar.length; i++) {
                switch (ar[i]) {
                    case dirPanelString:
                        _config.settings.layout.dirPanelOrder = i;
                        break;
                    case filePanelString:
                        _config.settings.layout.filePanelOrder = i;
                        break;
                    case imagePanelString:
                        _config.settings.layout.imagePanelOrder = i;
                        break;
                    case infoPanelString:
                        _config.settings.layout.infoPanelOrder = i;
                        break;
                }
            }

            appleSettingOfMain();
        }
    });
}
