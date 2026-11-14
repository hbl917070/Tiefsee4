/** 對應設定視窗的「滑鼠」頁面。 */
import { Config } from "../Config";
import { SettingWindowContext } from "./SettingWindowContext";
import { hasActionInput, hotkeyActionKeys, hotkeyDefinitions } from "../HotkeyDefinitions";

// 滑鼠按鍵 + 滑鼠滾輪
export function initMouseSettings({ _config, _i18n, _msgbox, getDom, initSettingsGroups, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "_i18n" | "_msgbox" | "getDom" | "initSettingsGroups" | "appleSettingOfMain">) {
    const mousePage = getDom("#tabsPage-mouse") as HTMLElement;
    const btnResetAllMouse = getDom("#btn-mouse-resetAll") as HTMLElement;

    const normalMouseItems = [
        { dom: getDom("#select-leftDoubleClick") as HTMLSelectElement, config: "leftDoubleClick" },
        { dom: getDom("#select-scrollWheelButton") as HTMLSelectElement, config: "scrollWheelButton" },
        { dom: getDom("#select-mouseButton4") as HTMLSelectElement, config: "mouseButton4" },
        { dom: getDom("#select-mouseButton5") as HTMLSelectElement, config: "mouseButton5" },
        { dom: getDom("#select-scrollUp") as HTMLSelectElement, config: "scrollUp" },
        { dom: getDom("#select-scrollDown") as HTMLSelectElement, config: "scrollDown" },
        { dom: getDom("#select-scrollUpCtrl") as HTMLSelectElement, config: "scrollUpCtrl" },
        { dom: getDom("#select-scrollDownCtrl") as HTMLSelectElement, config: "scrollDownCtrl" },
        { dom: getDom("#select-scrollUpShift") as HTMLSelectElement, config: "scrollUpShift" },
        { dom: getDom("#select-scrollDownShift") as HTMLSelectElement, config: "scrollDownShift" },
        { dom: getDom("#select-scrollUpAlt") as HTMLSelectElement, config: "scrollUpAlt" },
        { dom: getDom("#select-scrollDownAlt") as HTMLSelectElement, config: "scrollDownAlt" },
    ] as const;

    const bulkViewScrollWheelButtonItems = [
        { dom: getDom("#select-bulkViewScrollWheelButton") as HTMLSelectElement, config: "bulkViewScrollWheelButton" },
    ] as const;

    const bulkViewMouseButtonItems = [
        { dom: getDom("#select-bulkViewMouseButton4") as HTMLSelectElement, config: "bulkViewMouseButton4" },
        { dom: getDom("#select-bulkViewMouseButton5") as HTMLSelectElement, config: "bulkViewMouseButton5" },
    ] as const;

    const bulkViewMouseItems = [
        { dom: getDom("#select-bulkViewScrollUpCtrl") as HTMLSelectElement, config: "bulkViewScrollUpCtrl" },
        { dom: getDom("#select-bulkViewScrollDownCtrl") as HTMLSelectElement, config: "bulkViewScrollDownCtrl" },
        { dom: getDom("#select-bulkViewScrollUpShift") as HTMLSelectElement, config: "bulkViewScrollUpShift" },
        { dom: getDom("#select-bulkViewScrollDownShift") as HTMLSelectElement, config: "bulkViewScrollDownShift" },
        { dom: getDom("#select-bulkViewScrollUpAlt") as HTMLSelectElement, config: "bulkViewScrollUpAlt" },
        { dom: getDom("#select-bulkViewScrollDownAlt") as HTMLSelectElement, config: "bulkViewScrollDownAlt" },
    ] as const;

    const normalMouseData: { [key: string]: string[] } = {
        "image": [
            hotkeyActionKeys.imageFitWindowOrImageOriginal,
            hotkeyActionKeys.switchFitWindowAndOriginal,
            hotkeyActionKeys.imageFitWindow,
            hotkeyActionKeys.imageOriginal,
            hotkeyActionKeys.imageZoomIn,
            hotkeyActionKeys.imageZoomOut,
            hotkeyActionKeys.imageRotateCw,
            hotkeyActionKeys.imageRotateCcw,
            hotkeyActionKeys.imageFlipHorizontal,
            hotkeyActionKeys.imageFlipVertical,
            hotkeyActionKeys.imageInitialRotation,
            hotkeyActionKeys.imageMoveUp,
            hotkeyActionKeys.imageMoveDown,
            hotkeyActionKeys.imageMoveLeft,
            hotkeyActionKeys.imageMoveRight,
            hotkeyActionKeys.imageMoveUpOrPrevFile,
            hotkeyActionKeys.imageMoveDownOrNextFile,
            hotkeyActionKeys.imageMoveLeftOrPrevFile,
            hotkeyActionKeys.imageMoveRightOrNextFile,
            hotkeyActionKeys.imageMoveRightOrPrevFile,
            hotkeyActionKeys.imageMoveLeftOrNextFile,
            hotkeyActionKeys.toggleCheckerboardBackground,
        ],
        "file": [
            hotkeyActionKeys.prevFile,
            hotkeyActionKeys.nextFile,
            hotkeyActionKeys.firstFile,
            hotkeyActionKeys.lastFile,
            hotkeyActionKeys.prevDir,
            hotkeyActionKeys.nextDir,
            hotkeyActionKeys.firstDir,
            hotkeyActionKeys.lastDir,
            hotkeyActionKeys.newWindow,
            hotkeyActionKeys.revealInFileExplorer,
            hotkeyActionKeys.systemContextMenu,
            hotkeyActionKeys.openWith,
            hotkeyActionKeys.renameFile,
            hotkeyActionKeys.fileToRecycleBin,
            hotkeyActionKeys.fileToPermanentlyDelete,
            hotkeyActionKeys.reloadAll,
            hotkeyActionKeys.openClipboard,
            hotkeyActionKeys.addFileToFavorites,
            hotkeyActionKeys.addDirectoryToFavorites,
        ],
        "copy": [
            hotkeyActionKeys.copyFile,
            hotkeyActionKeys.copyFileName,
            hotkeyActionKeys.copyFilePath,
            hotkeyActionKeys.copyImage,
            hotkeyActionKeys.copyImageBase64,
            hotkeyActionKeys.copyText,
            hotkeyActionKeys.copyPrompt,
        ],
        "layout": [
            hotkeyActionKeys.maximizeWindow,
            hotkeyActionKeys.topmost,
            hotkeyActionKeys.fullScreen,
            hotkeyActionKeys.showToolbar,
            hotkeyActionKeys.showDirectoryPanel,
            hotkeyActionKeys.showFilePanel,
            hotkeyActionKeys.showInformationPanel,
        ],
        "other": [
            hotkeyActionKeys.bulkView,
            hotkeyActionKeys.closeWindow,
        ],
    };

    const bulkViewActions = [
        hotkeyActionKeys.prevRow,
        hotkeyActionKeys.nextRow,
        hotkeyActionKeys.prevPage,
        hotkeyActionKeys.nextPage,
        hotkeyActionKeys.firstPage,
        hotkeyActionKeys.lastPage,
        hotkeyActionKeys.incrColumns,
        hotkeyActionKeys.decColumns,
        hotkeyActionKeys.incrFixedWidth,
        hotkeyActionKeys.decFixedWidth,
    ];

    const bulkViewMouseData: { [key: string]: string[] } = {
        "bulkView": bulkViewActions,
    };

    const bulkViewMouseButtonData: { [key: string]: string[] } = {
        "bulkView": bulkViewActions,
        "other": [
            hotkeyActionKeys.closeBulkView,
            hotkeyActionKeys.closeWindow,
        ],
    };

    const bulkViewScrollWheelButtonData: { [key: string]: string[] } = {
        "bulkView": bulkViewMouseButtonData["bulkView"],
        "other": [
            hotkeyActionKeys.movePage,
            ...bulkViewMouseButtonData["other"],
        ],
    };

    function buildOptionHtml(data: { [key: string]: string[] }, showNone: boolean) {
        let htmlString = "";
        if (showNone) {
            htmlString = `
                <optgroup label="-">
                    <option value="none" i18n="script.none"></option>
                </optgroup>
            `;
        }

        for (const key in data) {
            htmlString += `<optgroup label="" i18n="script.${key}">`;
            for (const value of data[key]) {
                htmlString += `<option value="${value}" i18n="script.${value}"></option>`;
            }
            htmlString += `</optgroup>`;
        }
        return htmlString;
    }

    function setMouseOptionAccessibleNames() {
        const items = [...normalMouseItems, ...bulkViewScrollWheelButtonItems, ...bulkViewMouseButtonItems, ...bulkViewMouseItems];
        items.forEach(item => {
            const optionTitle = item.dom.closest(".settings-option")?.querySelector(".settings-optionTitle") as HTMLElement | null;
            const groupTitle = item.dom.closest(".js-settingsGroup")?.querySelector(".settings-groupTitle") as HTMLElement | null;
            if (optionTitle === null) { return; }

            optionTitle.id ||= `${item.dom.id}-label`;
            const labelIds = [optionTitle.id];
            if (groupTitle !== null) {
                groupTitle.id ||= `${item.dom.id}-group-label`;
                labelIds.unshift(groupTitle.id);
            }
            item.dom.setAttribute("aria-labelledby", labelIds.join(" "));
        });
    }

    function applyMouseConfigToDom() {
        const normalHtml = buildOptionHtml(normalMouseData, true);
        normalMouseItems.forEach((item) => {
            item.dom.innerHTML = normalHtml;
            // @ts-ignore
            item.dom.value = _config.settings.mouse[item.config];
        });

        const bulkViewScrollWheelButtonHtml = buildOptionHtml(bulkViewScrollWheelButtonData, false);
        bulkViewScrollWheelButtonItems.forEach((item) => {
            item.dom.innerHTML = bulkViewScrollWheelButtonHtml;
            // @ts-ignore
            item.dom.value = _config.settings.mouse[item.config];
        });

        const bulkViewMouseButtonHtml = buildOptionHtml(bulkViewMouseButtonData, false);
        bulkViewMouseButtonItems.forEach((item) => {
            item.dom.innerHTML = bulkViewMouseButtonHtml;
            // @ts-ignore
            item.dom.value = _config.settings.mouse[item.config];
        });

        const bulkViewHtml = buildOptionHtml(bulkViewMouseData, false);
        bulkViewMouseItems.forEach((item) => {
            item.dom.innerHTML = bulkViewHtml;
            // @ts-ignore
            item.dom.value = _config.settings.mouse[item.config];
        });

        _i18n.setAll();
        setMouseOptionAccessibleNames();
    }

    [...normalMouseItems, ...bulkViewScrollWheelButtonItems, ...bulkViewMouseButtonItems, ...bulkViewMouseItems].forEach((item) => {
        item.dom.addEventListener("change", () => {
            // @ts-ignore
            _config.settings.mouse[item.config] = item.dom.value;
            appleSettingOfMain();
        });
    });

    btnResetAllMouse.addEventListener("click", () => {
        _msgbox.show({
            txt: _i18n.t("msg.mouseResetAll"),
            funcYes: (domMsg: HTMLElement) => {
                _msgbox.close(domMsg);
                _config.settings.mouse = JSON.parse(JSON.stringify(new Config(baseWindow).settings.mouse));
                applyMouseConfigToDom();
                appleSettingOfMain();
            }
        });
    });

    applyMouseConfigToDom();
    initSettingsGroups(mousePage);
}
