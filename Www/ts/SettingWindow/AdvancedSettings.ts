/** 對應設定視窗的「進階設定」頁面。 */
import { SettingWindowContext } from "./SettingWindowContext";
import { Lib } from "../Lib";
import { TiefseeviewLanczosRenderer } from "../Tiefseeview/TiefseeviewLanczosRenderer";

// 縮小至特定比例以下，就使用libvips重新處理圖片
export function initImageResamplingSettings({ _config, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "getDom" | "appleSettingOfMain">) {
    const select_tiefseeviewBigimgscaleRatio = getDom("#select-tiefseeviewBigimgscaleRatio") as HTMLInputElement;
    select_tiefseeviewBigimgscaleRatio.value = _config.settings["image"]["tiefseeviewBigimgscaleRatio"].toString();

    select_tiefseeviewBigimgscaleRatio.addEventListener("change", () => {
        let val = select_tiefseeviewBigimgscaleRatio.value;
        _config.settings["image"]["tiefseeviewBigimgscaleRatio"] = Number(val);
        appleSettingOfMain();
    });
}

// 大量瀏覽模式一頁顯示的圖片數量
export function initBulkViewLimitSettings({ _config, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "getDom" | "appleSettingOfMain">) {
    const domText = getDom("#text-bulkViewImgMaxCount") as HTMLInputElement;
    domText.value = _config.settings.bulkView.imgMaxCount.toString();

    domText.addEventListener("change", () => {
        let val = Number(domText.value);
        if (isNaN(val)) { val = 100; }
        if (val > 300) { val = 300; }
        if (val < 1) { val = 1; }
        val = Math.floor(val);
        domText.value = val.toString();
        _config.settings.bulkView.imgMaxCount = val;
        appleSettingOfMain();
    });
}

// 靜態圖片 Renderer 選擇；獨立於畫質插值設定，於下一張圖片載入時生效。
export function initRendererSettings({ _config, _i18n, _msgbox, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "_i18n" | "_msgbox" | "getDom" | "appleSettingOfMain">) {
    const switch_webglRenderer = getDom("#switch-webglRenderer") as HTMLInputElement;
    switch_webglRenderer.checked = _config.settings.image.tiefseeviewRenderer === "webgl";
    let supportCheck: Promise<boolean> | null = null;
    switch_webglRenderer.addEventListener("change", async () => {
        if (!switch_webglRenderer.checked) {
            _config.settings.image.tiefseeviewRenderer = "canvas";
            appleSettingOfMain();
            return;
        }

        // 驗證 WebGL 2 預覽與 WebGPU Lanczos/銳化管線，通過後才套用設定。
        switch_webglRenderer.checked = false;
        switch_webglRenderer.disabled = true;
        try {
            if (supportCheck === null) {
                supportCheck = (async () => {
                    const webglCanvas = document.createElement("canvas");
                    const gl = webglCanvas.getContext("webgl2");
                    if (gl === null) return false;
                    gl.getExtension("WEBGL_lose_context")?.loseContext();
                    return TiefseeviewLanczosRenderer.checkSupport();
                })();
            }

            if (await supportCheck) {
                switch_webglRenderer.checked = true;
                _config.settings.image.tiefseeviewRenderer = "webgl";
                appleSettingOfMain();
            } else {
                _msgbox.show({ txt: _i18n.t("sw.performance.webglRendererUnsupported") });
            }
        } finally {
            switch_webglRenderer.disabled = false;
        }
    });
}

// 相關路徑
export function initPathsSettings({ getDom }: Pick<SettingWindowContext, "getDom">) {
    const btn_openAppData = getDom("#btn-openAppData") as HTMLElement;
    const btn_openWww = getDom("#btn-openWww") as HTMLElement;
    const btn_openTemp = getDom("#btn-openTemp") as HTMLElement;

    // 開啟 AppData(使用者資料)
    btn_openAppData.addEventListener("click", async () => {
        let path = await WV_Window.GetAppDataPath();
        WV_RunApp.OpenUrl(path);
    });

    // 開啟 www(原始碼)
    btn_openWww.addEventListener("click", async () => {
        let path = await WV_Window.GetAppDirPath();
        path = Lib.combine([path, "Www"]);
        WV_RunApp.OpenUrl(path);
    });

    // 開啟 暫存資料夾
    btn_openTemp.addEventListener("click", async () => {
        let path = await WV_Path.GetTempPath();
        path = Lib.combine([path, "Tiefsee"]);
        if (await WV_Directory.Exists(path) === false) { // 如果不存在就新建
            await WV_Directory.CreateDirectory(path);
        }
        WV_RunApp.OpenUrl(path);
    });
}

// 清理暫存資料
export function initCacheSettings({ _i18n, _msgbox, getDom }: Pick<SettingWindowContext, "_i18n" | "_msgbox" | "getDom">) {
    const btn_clearBrowserCache = getDom("#btn-clearBrowserCache") as HTMLElement;

    btn_clearBrowserCache.addEventListener("click", async () => {
        await WV_System.DeleteAllTemp(); // 立即刪除所有圖片暫存
        await WV_Window.ClearBrowserCache(); // 清理webview2的暫存
        _msgbox.show({ txt: _i18n.t("msg.tempDeleteCompleted") }); // 暫存資料清理完成
    });
}

// 資料夾數量太多時，禁用資料夾預覽視窗
export function initDirectoryLimitSettings({ _config, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "getDom" | "appleSettingOfMain">) {
    const select_dirListMaxCount = getDom("#select-dirListMaxCount") as HTMLInputElement;
    select_dirListMaxCount.value = _config.settings["advanced"]["dirListMaxCount"] + "";

    select_dirListMaxCount.addEventListener("change", () => {
        let val = Number(select_dirListMaxCount.value);
        _config.settings["advanced"]["dirListMaxCount"] = val;
        appleSettingOfMain();
    });
}

// 圖片面積太大時，禁用高品質縮放
export function initQualityLimitSettings({ _config, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "getDom" | "appleSettingOfMain">) {
    const select_highQualityLimit = getDom("#select-highQualityLimit") as HTMLInputElement;
    select_highQualityLimit.value = _config.settings["advanced"]["highQualityLimit"] + "";

    select_highQualityLimit.addEventListener("change", () => {
        let val = Number(select_highQualityLimit.value);
        _config.settings["advanced"]["highQualityLimit"] = val;
        appleSettingOfMain();
    });
}

// 啟動模式位於「一般」頁，Port 位於「進階設定」頁，兩者共用 start.ini。
export function initStartupPortSettings({ _appInfo, getDom, restartTiefsee }: Pick<SettingWindowContext, "_appInfo" | "getDom" | "restartTiefsee">) {

    const text_startPort = getDom("#text-startPort") as HTMLInputElement;
    const btn_restart = getDom("#btn-startupMode-restart") as HTMLButtonElement;

    Lib.setRadio("[name='radio-startType']", _appInfo.startType.toString())
    text_startPort.value = _appInfo.startPort.toString();

    // 調整選項後，顯示「重新啟動」的按鈕
    btn_restart.style.display = "none";
    $("[name='radio-startType']").on("change", () => {
        btn_restart.style.display = "";
    });

    text_startPort.addEventListener("change", () => {
        let startPort = parseInt(text_startPort.value);
        if (isNaN(startPort)) { startPort = 4876; }
        if (startPort > 65535) { startPort = 65535; }
        if (startPort < 1024) { startPort = 1024; }
        text_startPort.value = startPort.toString();
    })

    // 關閉視窗前觸發
    baseWindow.closingEvents.push(async () => {
        // 儲存 start.ini
        let startPort = parseInt(text_startPort.value);
        let startType: any = Lib.getRadio("[name='radio-startType']");

        if (isNaN(startPort)) { startPort = 4876; }
        if (startPort > 65535) { startPort = 65535; }
        if (startPort < 1024) { startPort = 1024; }

        if (startType.search(/^[1|2|3|4|5]$/) !== 0) { startType = 2; }
        startType = parseInt(startType);

        await WV_Window.SetStartIni(startPort, startType);
    });

    // 重新啟動Tiefsee
    btn_restart.addEventListener("click", async () => {
        restartTiefsee();
    })
}

// 重設會同步更新「一般」頁的啟動模式與自動啟動。
export function initResetSettings({ _config, _i18n, _defaultConfig, _msgbox, getDom, restartTiefsee }: Pick<SettingWindowContext, "_config" | "_i18n" | "_defaultConfig" | "_msgbox" | "getDom" | "restartTiefsee">) {

    const btn_resetSettings = getDom("#btn-resetSettings") as HTMLElement;
    btn_resetSettings.addEventListener("click", async (e) => {

        _msgbox.show({
            txt: _i18n.t("msg.resetSettings"),  // 確定要將 Tiefsee 的所有設定恢復成預設值嗎？\n(不會影響擴充套件與檔案排序)

            funcYes: async (dom: HTMLElement, inputTxt: string) => {
                _msgbox.close(dom);

                _config.settings = _defaultConfig;

                // 啟動模式
                Lib.setRadio("[name='radio-startType']", "3");

                // Port
                let text_startPort = getDom("#text-startPort") as HTMLInputElement;
                text_startPort.value = "4876";

                // 開機後自動啟動
                var switch_autoStart = getDom("#switch-autoStart") as HTMLInputElement;
                switch_autoStart.checked = false;
                switch_autoStart.dispatchEvent(new Event("change"));

                await Lib.sleep(300);

                await WV_System.DeleteAllTemp(); // 立即刪除所有圖片暫存
                await WV_Window.ClearBrowserCache(); // 清理webview2的暫存

                restartTiefsee(); // 重新啟動 Tiefsee
            }
        });
    });

}
