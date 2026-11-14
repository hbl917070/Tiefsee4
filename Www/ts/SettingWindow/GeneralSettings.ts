/** 對應設定視窗的「一般」頁面。 */
import { SettingWindowContext } from "./SettingWindowContext";
import { Lib } from "../Lib";

// 初始化多國語言
export function initLanguageSettings({ _config, _i18n, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "_i18n" | "getDom" | "appleSettingOfMain">) {

    const select_lang = getDom("#select-lang") as HTMLSelectElement;

    let configLang = _config.settings.other.lang;
    if (configLang == "") {
        configLang = Lib.getBrowserLang();
    }
    select_lang.value = configLang;
    _i18n.setLang(configLang); // 更新畫面的語言

    select_lang.addEventListener("change", () => {
        let val = select_lang.value;
        _config.settings.other.lang = val;
        appleSettingOfMain();
        _i18n.setLang(val); // 更新畫面的語言
    });

}

// 圖片預設 縮放模式、對齊位置
export function initImageZoomSettings({ _config, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "getDom" | "appleSettingOfMain">) {
    const select_tiefseeviewZoomType = getDom("#select-tiefseeviewZoomType") as HTMLSelectElement;
    const text_tiefseeviewZoomValue = getDom("#text-tiefseeviewZoomValue") as HTMLInputElement;
    const select_tiefseeviewAlignType = getDom("#select-tiefseeviewAlignType") as HTMLSelectElement;

    select_tiefseeviewZoomType.value = _config.settings.image["tiefseeviewZoomType"];
    text_tiefseeviewZoomValue.value = _config.settings.image["tiefseeviewZoomValue"].toString();
    select_tiefseeviewAlignType.value = _config.settings.image["tiefseeviewAlignType"];

    // 避免出現下拉選單沒有的值
    if (select_tiefseeviewZoomType.value == "") {
        select_tiefseeviewZoomType.value = "fitWindowOrImageOriginal";
    }
    if (select_tiefseeviewAlignType.value == "") {
        select_tiefseeviewAlignType.value = "center";
    }

    showValue();

    // 顯示或隱藏 「圖片預設縮放模式」的附加欄位
    function showValue() {
        const val = select_tiefseeviewZoomType.value;
        const ar = ["imageWidthPx", "imageHeightPx", "windowWidthRatio", "windowHeightRatio"];
        if (ar.indexOf(val) !== -1) {
            text_tiefseeviewZoomValue.style.display = "block";
        } else {
            text_tiefseeviewZoomValue.style.display = "none";
        }
    }

    select_tiefseeviewZoomType.addEventListener("change", () => {
        showValue();
        const val = select_tiefseeviewZoomType.value;
        _config.settings.image["tiefseeviewZoomType"] = val;
        appleSettingOfMain();
    });
    text_tiefseeviewZoomValue.addEventListener("change", () => {
        let val = Number(text_tiefseeviewZoomValue.value);
        if (isNaN(val)) { val = 100; }
        if (val > 99999) { val = 99999; }
        if (val < 1) { val = 1; }
        text_tiefseeviewZoomValue.value = val.toString();
        _config.settings.image["tiefseeviewZoomValue"] = val;
        appleSettingOfMain();
    });
    select_tiefseeviewAlignType.addEventListener("change", () => {
        const val = select_tiefseeviewAlignType.value;
        _config.settings.image["tiefseeviewAlignType"] = val;
        appleSettingOfMain();
    });
}

// 銳化圖片
export function initSharpenSettings({ _config, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "getDom" | "appleSettingOfMain">) {
    const select_sharpen = getDom("#select-sharpen") as HTMLSelectElement;

    select_sharpen.value = _config.settings.image.sharpenValue.toString();

    select_sharpen.addEventListener("change", () => {
        let val = select_sharpen.value;
        _config.settings.image.sharpenValue = Number(val);
        appleSettingOfMain();
    });
}

// 預設排序
export function initSortSettings({ _config, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "getDom" | "appleSettingOfMain">) {
    const select_fileSort = getDom("#select-fileSort") as HTMLSelectElement;
    const select_dirSort = getDom("#select-dirSort") as HTMLSelectElement;

    select_fileSort.value = _config.settings.sort["fileSort"];
    select_dirSort.value = _config.settings.sort["dirSort"];

    select_fileSort.addEventListener("change", () => {
        const val = select_fileSort.value;
        _config.settings.sort["fileSort"] = val;
        appleSettingOfMain();
    });
    select_dirSort.addEventListener("change", () => {
        const val = select_dirSort.value;
        _config.settings.sort["dirSort"] = val;
        appleSettingOfMain();
    });
}

// 圖片 縮放模式
export function initImagePixelsSettings({ _config, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "getDom" | "appleSettingOfMain">) {

    const switch_imageShowPixels = getDom("#switch-imageShowPixels") as HTMLInputElement;
    switch_imageShowPixels.checked = _config.settings["image"]["tiefseeviewImageRendering"] == "2"

    switch_imageShowPixels.addEventListener("change", () => {
        let val = switch_imageShowPixels.checked;
        if (val) {
            _config.settings["image"]["tiefseeviewImageRendering"] = "2";
        } else {
            _config.settings["image"]["tiefseeviewImageRendering"] = "0";
        }
        appleSettingOfMain();
    });
}

// 開機後自動啟動
export async function initAutoStartSettings({ _i18n, _appInfo, _msgbox, getDom }: Pick<SettingWindowContext, "_i18n" | "_appInfo" | "_msgbox" | "getDom">) {

    const switch_autoStart = getDom("#switch-autoStart") as HTMLInputElement;

    if (_appInfo.isStoreApp) { // 商店版 APP

        const tiefseTask = await WV_System.GetTiefseTask(); // 取得當前是否有啟用「開機自動啟動」的服務
        if (tiefseTask === "Enabled" || tiefseTask === "EnabledByPolicy") {
            switch_autoStart.checked = true;
        } else {
            switch_autoStart.checked = false;
        }

        switch_autoStart.addEventListener("change", async () => {

            const val = switch_autoStart.checked;
            const tiefseTask = await WV_System.SetTiefseTask(val);

            let msg = null;
            if (tiefseTask === "EnabledByPolicy") { // 被系統政策啟用
                msg = _i18n.t("msg.enabledByPolicy");
                switch_autoStart.checked = true;
            }
            if (tiefseTask === "DisabledByPolicy") { // 被系統政策禁用
                msg = _i18n.t("msg.disabledByPolicy");
                switch_autoStart.checked = false;
            }
            if (tiefseTask === "DisabledByUser") { // 被使用者禁用
                msg = _i18n.t("msg.disabledByUser");
                switch_autoStart.checked = false;
            }

            if (msg !== null) {
                _msgbox.show({ txt: msg });
            }
        });

    } else {

        const startupPath = await WV_Path.GetFolderPathStartup();
        const linkPath = Lib.combine([startupPath, "Tiefsee.lnk"]);
        const isAutoStart = await WV_File.Exists(linkPath);
        switch_autoStart.checked = isAutoStart;

        switch_autoStart.addEventListener("change", async () => {
            const val = switch_autoStart.checked;
            if (val) { // 產生捷徑
                const exePath = await WV_Window.GetTiefseePath();
                WV_System.NewLnk(exePath, linkPath, "none");
            } else { // 刪除捷徑
                WV_File.Delete(linkPath);
            }
        });

        // 開啟Windows的「啟動資料夾
        const btn_openStartup = getDom("#btn-openStartup") as HTMLElement;
        btn_openStartup.addEventListener("click", async () => {
            WV_RunApp.OpenUrl(startupPath);
        });
    }
}

// 其他
export function initOtherSettings({ _config, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "getDom" | "appleSettingOfMain">) {

    // 使用格子背景
    const switch_checkerboardBackground = getDom("#switch-checkerboardBackground") as HTMLInputElement;
    switch_checkerboardBackground.checked = _config.settings.other.checkerboardBackground;
    switch_checkerboardBackground.addEventListener("change", () => {
        _config.settings.other.checkerboardBackground = switch_checkerboardBackground.checked;
        appleSettingOfMain();
    });

    // 開啟 RAW 圖片時，顯示內嵌的預覽圖
    const switch_rawImageThumbnail = getDom("#switch-rawImageThumbnail") as HTMLInputElement;
    switch_rawImageThumbnail.checked = _config.settings["other"]["rawImageThumbnail"];
    switch_rawImageThumbnail.addEventListener("change", () => {
        let val = switch_rawImageThumbnail.checked;
        _config.settings["other"]["rawImageThumbnail"] = val;
        appleSettingOfMain();
    });

    // 載入壓縮檔時
    const select_archiveLoadMode = getDom("#select-archiveLoadMode") as HTMLSelectElement;
    select_archiveLoadMode.value = _config.settings.other.archiveLoadMode;
    select_archiveLoadMode.addEventListener("change", () => {
        _config.settings.other.archiveLoadMode = select_archiveLoadMode.value;
        appleSettingOfMain();
    });

    // 檔案刪除前顯示確認視窗
    const switch_fileDeletingShowCheckMsg = getDom("#switch-fileDeletingShowCheckMsg") as HTMLInputElement;
    switch_fileDeletingShowCheckMsg.checked = _config.settings["other"]["fileDeletingShowCheckMsg"];
    switch_fileDeletingShowCheckMsg.addEventListener("change", () => {
        let val = switch_fileDeletingShowCheckMsg.checked;
        _config.settings["other"]["fileDeletingShowCheckMsg"] = val;
        appleSettingOfMain();
    });

    // 偵測到檔案新增時，插入於
    const select_whenInsertingFile = getDom("#select-whenInsertingFile") as HTMLSelectElement;
    select_whenInsertingFile.value = _config.settings["other"]["whenInsertingFile"];
    select_whenInsertingFile.addEventListener("change", () => {
        let val = select_whenInsertingFile.value;
        _config.settings["other"]["whenInsertingFile"] = val;
        appleSettingOfMain();
    });

    // 到達最後一個檔案時
    const select_reachLastFile = getDom("#select-reachLastFile") as HTMLSelectElement;
    select_reachLastFile.value = _config.settings.other.reachLastFile;
    select_reachLastFile.addEventListener("change", () => {
        _config.settings.other.reachLastFile = select_reachLastFile.value;
        appleSettingOfMain();
    });

    // 到達最後一個資料夾時
    const select_reachLastDir = getDom("#select-reachLastDir") as HTMLSelectElement;
    select_reachLastDir.value = _config.settings.other.reachLastDir;
    select_reachLastDir.addEventListener("change", () => {
        _config.settings.other.reachLastDir = select_reachLastDir.value;
        appleSettingOfMain();
    });

    // 啟用觸控板手勢
    const switch_touchpadGesture = getDom("#switch-enableTouchpadGestures") as HTMLInputElement;
    switch_touchpadGesture.checked = _config.settings.other.enableTouchpadGestures;
    switch_touchpadGesture.addEventListener("change", () => {
        let val = switch_touchpadGesture.checked;
        _config.settings.other.enableTouchpadGestures = val;
        appleSettingOfMain();
    });

    // 在檔案預覽面板透過滑鼠滾輪切換圖片
    const select_filePanelMouseWheel = getDom("#select-filePanelMouseWheel") as HTMLSelectElement;
    select_filePanelMouseWheel.value = _config.settings.other.filePanelMouseWheel;
    select_filePanelMouseWheel.addEventListener("change", () => {
        _config.settings.other.filePanelMouseWheel = select_filePanelMouseWheel.value;
        appleSettingOfMain();
    });

}
