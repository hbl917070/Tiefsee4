import { GroupType } from "../Config";
import { hotkeyActionKeys, HotkeyAction, hotkeyDefinitionItems, HotkeySubOption } from "../HotkeyDefinitions";
import { Lib } from "../Lib";
import { Toast } from "../Toast";
import { MainWindow } from "./MainWindow";

type HotkeyConfigItem = {
    key: HotkeyAction;
    hotkey: string;
    subOptions?: string[];
};

type HotkeyOption = {
    distancePx?: number;
    path?: string;
    folderPath?: string;
    filePath?: string;
    numberValue?: number;
};

/**
 * 快速鍵
 */
export class Hotkey {

    constructor(M: MainWindow) {

        // 由定義表建立索引，方便後續依 key 取得分類與參數資訊
        const definitionMap = new Map(hotkeyDefinitionItems.map(item => [item.key, item]));

        window.addEventListener("keydown", async (e) => {

            // 將鍵盤事件轉成設定檔使用的快速鍵字串，例如「Ctrl + C」
            const hotkey = Lib.keyboardEventToHotkeyString(e);
            if (hotkey === "") { return; }

            // 最高優先級：在訊息視窗開啟時，Enter 和 Escape 直接對應到確認和取消
            if (M.msgbox.isShow()) {
                if ((e.code === "Enter" || e.code === "NumpadEnter")) {
                    e.preventDefault();
                    M.msgbox.clickYes();
                    return;
                }

                if (e.code === "Escape") {
                    e.preventDefault();
                    M.msgbox.closeNow();
                    return;
                }
            }

            // 最高優先級：一旦選取文字，就是要允許使用 Ctrl + C 複製文字
            if (e.code === "KeyC" && e.ctrlKey) {
                if (Lib.isTxtSelect()) {
                    return;
                }
            }

            // 取得目前按鍵命中的所有自訂快速鍵
            const hotkeyItems = getMatchedHotkeys(hotkey);

            // 最高優先級：如果有開啟選單，只允許處理互動類快速鍵
            if (M.menu.getIsShow()) {
                const interactionItems = filterHotkeys(hotkeyItems, [hotkeyActionKeys.cancel]);
                if (interactionItems.length > 0) {
                    e.preventDefault();
                    await executeHotkeyItems(interactionItems);
                }
                return;
            }

            // 最高優先級：只要焦點在輸入框，就不對輸入做任何處理，避免干擾打字
            if (Lib.isTextFocused()) {
                // 如果是文字編輯器 或 側邊的文字編輯器，則另外處理儲存編輯內容的快速鍵
                if (M.fileShow.getGroupType() == GroupType.txt || M.textEditor.getIsShow()) {
                    const textEditorItems = filterHotkeys(hotkeyItems, [hotkeyActionKeys.saveTextEditor]);
                    if (textEditorItems.length > 0) {
                        e.preventDefault();
                        await executeHotkeyItems(textEditorItems);
                    }
                }
                return;
            }

            // 最高優先級：如果有開啟訊息視窗，只允許處理確認/取消
            if (M.msgbox.isShow()) {
                const interactionItems = filterHotkeys(hotkeyItems, [hotkeyActionKeys.cancel, hotkeyActionKeys.confirm]);
                if (interactionItems.length > 0) {
                    e.preventDefault();
                    await executeHotkeyItems(interactionItems);
                }
                return;
            }

            // 攔截瀏覽器本身的快捷鍵
            if (shouldBlockBrowserHotkey(e)) {
                e.preventDefault();
            }

            // 第二優先級：大量瀏覽模式只處理安全且明確支援的快速鍵
            if (M.fileLoad.getIsBulkView()) {
                if (e.key === "Alt") { // 避免焦點被搶走
                    e.preventDefault();
                }

                M.bulkView.setFocus();

                const bulkAllowKeys: HotkeyAction[] = [
                    // 大量瀏覽模式本身的操作
                    hotkeyActionKeys.bulkView,
                    hotkeyActionKeys.prevPage,
                    hotkeyActionKeys.nextPage,
                    hotkeyActionKeys.firstPage,
                    hotkeyActionKeys.lastPage,
                    hotkeyActionKeys.setBulkViewColumns,
                    hotkeyActionKeys.incrColumns,
                    hotkeyActionKeys.decColumns,
                    hotkeyActionKeys.incrFixedWidth,
                    hotkeyActionKeys.decFixedWidth,

                    // 大量瀏覽模式下仍然有意義的檔案/資料夾操作
                    hotkeyActionKeys.prevDir,
                    hotkeyActionKeys.nextDir,
                    hotkeyActionKeys.firstDir,
                    hotkeyActionKeys.lastDir,
                    hotkeyActionKeys.renameFile,
                    hotkeyActionKeys.revealInFileExplorer,
                    hotkeyActionKeys.systemContextMenu,
                    hotkeyActionKeys.reloadAll,

                    // 視窗與互動控制
                    hotkeyActionKeys.maximizeWindow,
                    hotkeyActionKeys.topmost,
                    hotkeyActionKeys.fullScreen,
                    hotkeyActionKeys.showToolbar,
                    hotkeyActionKeys.showFilePanel,
                    hotkeyActionKeys.showDirectoryPanel,
                    hotkeyActionKeys.showInformationPanel,
                    hotkeyActionKeys.showSetting,
                    hotkeyActionKeys.developerTools,
                    hotkeyActionKeys.closeWindow,
                    hotkeyActionKeys.cancel,
                    hotkeyActionKeys.confirm,
                ];

                const bulkItems = filterHotkeys(hotkeyItems, bulkAllowKeys);
                if (bulkItems.length > 0) {
                    e.preventDefault();
                    await executeHotkeyItems(bulkItems);
                }
                return;
            }

            // 一般情況：依照設定逐一執行所有命中的快速鍵
            if (hotkeyItems.length > 0) {
                e.preventDefault();
                await executeHotkeyItems(hotkeyItems);
            }
        });

        /**
         * 取得目前按鍵命中的所有快速鍵設定
         */
        function getMatchedHotkeys(hotkey: string) {
            const hotkeys = normalizeHotkeys(M.config.settings.hotkeys);
            return hotkeys.filter(item => item.hotkey === hotkey);
        }

        /**
         * 將設定檔內的 hotkeys 正規化成可執行的資料
         */
        function normalizeHotkeys(hotkeys: any): HotkeyConfigItem[] {
            if (Array.isArray(hotkeys) === false) { return []; }

            return hotkeys
                .filter((item: any) => item && typeof item === "object")
                .filter((item: any) => typeof item.key === "string" && typeof item.hotkey === "string")
                .map((item: any) => {
                    const hotkeyItem = {
                        key: item.key,
                        hotkey: item.hotkey,
                    } as HotkeyConfigItem;

                    if (Array.isArray(item.subOptions)) {
                        hotkeyItem.subOptions = item.subOptions.map((sub: any) => String(sub));
                    }

                    return hotkeyItem;
                })
                .filter((item): item is HotkeyConfigItem => definitionMap.has(item.key as HotkeyAction))
                .map(item => ({ ...item, key: item.key as HotkeyAction }));
        }

        /**
         * 在特殊情境下，只保留允許執行的快速鍵
         */
        function filterHotkeys(hotkeys: HotkeyConfigItem[], allowKeys: HotkeyAction[]) {
            return hotkeys.filter(item => allowKeys.includes(item.key));
        }

        /**
         * 連續執行同一個按鍵命中的所有快速鍵
         */
        async function executeHotkeyItems(hotkeys: HotkeyConfigItem[]) {
            for (const item of hotkeys) {
                await executeHotkeyItem(item);
            }
        }

        /**
         * 執行單一快速鍵
         */
        async function executeHotkeyItem(item: HotkeyConfigItem) {
            const option = getHotkeyOption(item);

            // 特殊互動類動作，不走 Script.run，而是在這裡依目前情境處理
            if (item.key === hotkeyActionKeys.cancel) {
                if (M.msgbox.isShow()) {
                    M.msgbox.closeNow();
                    return;
                }
                if (M.menu.getIsShow()) {
                    M.menu.close();
                    return;
                }
                if (M.toolbarBack.getVisible()) {
                    M.toolbarBack.runEvent();
                    return;
                }
                if (M.fullScreen.getEnabled()) {
                    M.fullScreen.setEnabled(false);
                    return;
                }
                baseWindow.close();
                return;
            }

            // 特殊互動類動作：目前只在訊息視窗存在時有意義
            if (item.key === hotkeyActionKeys.confirm) {
                if (M.msgbox.isShow()) {
                    M.msgbox.clickYes();
                }
                return;
            }

            // 特殊互動類動作：根據目前是否為文字編輯器決定儲存目標
            if (item.key === hotkeyActionKeys.saveTextEditor) {
                await M.script.run(item.key, option);
                return;
            }

            // 已接上 Script.run 的快速鍵
            const implementedKeys: HotkeyAction[] = [
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
                hotkeyActionKeys.imageMoveLeftOrNextFile,
                hotkeyActionKeys.imageMoveRightOrPrevFile,
                hotkeyActionKeys.imageMoveRightOrNextFile,
                hotkeyActionKeys.newWindow,
                hotkeyActionKeys.prevFile,
                hotkeyActionKeys.nextFile,
                hotkeyActionKeys.prevDir,
                hotkeyActionKeys.nextDir,
                hotkeyActionKeys.firstFile,
                hotkeyActionKeys.lastFile,
                hotkeyActionKeys.firstDir,
                hotkeyActionKeys.lastDir,
                hotkeyActionKeys.revealInFileExplorer,
                hotkeyActionKeys.systemContextMenu,
                hotkeyActionKeys.renameFile,
                hotkeyActionKeys.openWith,
                hotkeyActionKeys.fileToRecycleBin,
                hotkeyActionKeys.fileToPermanentlyDelete,
                hotkeyActionKeys.reloadAll,
                hotkeyActionKeys.loadPath,
                hotkeyActionKeys.moveFileTo,
                hotkeyActionKeys.copyFileTo,
                hotkeyActionKeys.openClipboard,
                hotkeyActionKeys.openWithSpecifiedApp,
                hotkeyActionKeys.copyFile,
                hotkeyActionKeys.copyFileName,
                hotkeyActionKeys.copyFilePath,
                hotkeyActionKeys.copyImage,
                hotkeyActionKeys.copyImageBase64,
                hotkeyActionKeys.copyText,
                hotkeyActionKeys.copyPrompt,
                hotkeyActionKeys.maximizeWindow,
                hotkeyActionKeys.topmost,
                hotkeyActionKeys.fullScreen,
                hotkeyActionKeys.showToolbar,
                hotkeyActionKeys.showFilePanel,
                hotkeyActionKeys.showDirectoryPanel,
                hotkeyActionKeys.showInformationPanel,
                hotkeyActionKeys.closeWindow,
                hotkeyActionKeys.showSetting,
                hotkeyActionKeys.developerTools,
                hotkeyActionKeys.bulkView,
                hotkeyActionKeys.prevPage,
                hotkeyActionKeys.nextPage,
                hotkeyActionKeys.firstPage,
                hotkeyActionKeys.lastPage,
                hotkeyActionKeys.setBulkViewColumns,
                hotkeyActionKeys.incrColumns,
                hotkeyActionKeys.decColumns,
                hotkeyActionKeys.incrFixedWidth,
                hotkeyActionKeys.decFixedWidth,
            ];

            if (implementedKeys.includes(item.key)) {
                await M.script.run(item.key, option);
                return;
            }

            Toast.show("未知操作: " + item.key, 3000);
        }

        /**
         * 將 subOptions 轉成 Script.run 可使用的參數
         */
        function getHotkeyOption(item: HotkeyConfigItem): HotkeyOption {
            const definition = definitionMap.get(item.key);
            const option: HotkeyOption = {};
            const itemSubOptions = item.subOptions;

            if (
                definition === undefined ||
                !("subOptions" in definition) ||
                definition.subOptions === undefined ||
                itemSubOptions === undefined
            ) {
                return option;
            }

            definition.subOptions.forEach((subOption: HotkeySubOption, index: number) => {
                const value = itemSubOptions[index] ?? "";
                setHotkeyOption(option, subOption, value);
            });

            return option;
        }

        /**
         * 根據參數型別寫入對應欄位
         */
        function setHotkeyOption(option: HotkeyOption, subOption: HotkeySubOption, value: string) {
            if (subOption === "distancePx") {
                const n = Number(value);
                option.distancePx = isNaN(n) ? undefined : n;
            }
            else if (subOption === "path") {
                option.path = value;
            }
            else if (subOption === "folderPath") {
                option.folderPath = value;
            }
            else if (subOption === "filePath") {
                option.filePath = value;
            }
            else if (subOption === "numberValue") {
                const n = Number(value);
                option.numberValue = isNaN(n) ? undefined : n;
            }
        }

        /**
         * 判斷是否需要攔截 WebView/瀏覽器內建快捷鍵
         */
        function shouldBlockBrowserHotkey(e: KeyboardEvent) {
            if (e.ctrlKey || e.altKey || e.metaKey) {
                return true;
            }

            const browserFunctionKeys = ["F1", "F3", "F5", "F11", "F12"];
            if (browserFunctionKeys.includes(e.code)) {
                return true;
            }

            return false;
        }
    }
}
