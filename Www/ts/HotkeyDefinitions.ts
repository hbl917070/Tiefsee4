export type HotkeySubOption = "distancePx" | "path" | "folderPath" | "filePath" | "numberValue";
export type ActionInput = "hotkey" | "mouse";

export type HotkeyCategoryKey = "image" | "file" | "copy" | "layout" | "interaction" | "bulkView";

export type HotkeyDefinition = {
    category: HotkeyCategoryKey;
    title: string;
    content: readonly {
        key: string;
        inputs: readonly ActionInput[];
        subOptions?: readonly HotkeySubOption[];
    }[];
};

export const hotkeyDefinitions = [
    {
        category: "image",
        title: "image", // 圖片
        content: [
            { key: "imageFitWindowOrImageOriginal", inputs: ["hotkey", "mouse"] }, // 縮放至適合視窗 or 圖片原始大小
            { key: "switchFitWindowAndOriginal", inputs: ["hotkey", "mouse"] }, // 縮放至適合視窗/圖片原始大小 切換
            { key: "imageFitWindow", inputs: ["hotkey", "mouse"] }, // 強制縮放至適合視窗
            { key: "imageOriginal", inputs: ["hotkey", "mouse"] }, // 圖片原始大小
            { key: "imageZoomIn", inputs: ["hotkey", "mouse"] }, // 放大
            { key: "imageZoomOut", inputs: ["hotkey", "mouse"] }, // 縮小
            { key: "imageRotateCw", inputs: ["hotkey", "mouse"] }, // 順時針90°
            { key: "imageRotateCcw", inputs: ["hotkey", "mouse"] }, // 逆時針90°
            { key: "imageFlipHorizontal", inputs: ["hotkey", "mouse"] }, // 水平鏡像
            { key: "imageFlipVertical", inputs: ["hotkey", "mouse"] }, // 垂直鏡像
            { key: "imageInitialRotation", inputs: ["hotkey", "mouse"] }, // 圖初始化旋轉
            { key: "imageMoveUp", inputs: ["hotkey", "mouse"], subOptions: ["distancePx"] }, // 圖片向上移動
            { key: "imageMoveDown", inputs: ["hotkey", "mouse"], subOptions: ["distancePx"] }, // 圖片向下移動
            { key: "imageMoveLeft", inputs: ["hotkey", "mouse"], subOptions: ["distancePx"] }, // 圖片向左移動
            { key: "imageMoveRight", inputs: ["hotkey", "mouse"], subOptions: ["distancePx"] }, // 圖片向右移動
            { key: "imageMoveUpOrPrevFile", inputs: ["hotkey", "mouse"], subOptions: ["distancePx"] }, // 圖片向上移動 or 上一個檔案
            { key: "imageMoveDownOrNextFile", inputs: ["hotkey", "mouse"], subOptions: ["distancePx"] }, // 圖片向下移動 or 下一個檔案
            { key: "imageMoveLeftOrPrevFile", inputs: ["hotkey", "mouse"], subOptions: ["distancePx"] }, // 圖片向左移動 or 上一個檔案
            { key: "imageMoveRightOrNextFile", inputs: ["hotkey", "mouse"], subOptions: ["distancePx"] }, // 圖片向右移動 or 下一個檔案
            { key: "imageMoveLeftOrNextFile", inputs: ["hotkey", "mouse"], subOptions: ["distancePx"] }, // 圖片向左移動 or 下一個檔案
            { key: "imageMoveRightOrPrevFile", inputs: ["hotkey", "mouse"], subOptions: ["distancePx"] }, // 圖片向右移動 or 上一個檔案
            { key: "toggleCheckerboardBackground", inputs: ["hotkey", "mouse"] }, // 切換格子背景
        ]
    },
    {
        category: "file",
        title: "file", // 檔案
        content: [
            { key: "newWindow", inputs: ["hotkey", "mouse"] }, // 另開視窗
            { key: "prevFile", inputs: ["hotkey", "mouse"] }, // 上一個檔案
            { key: "nextFile", inputs: ["hotkey", "mouse"] }, // 下一個檔案
            { key: "prevDir", inputs: ["hotkey", "mouse"] }, // 上一個資料夾
            { key: "nextDir", inputs: ["hotkey", "mouse"] }, // 下一個資料夾
            { key: "firstFile", inputs: ["hotkey", "mouse"] }, // 第一個檔案
            { key: "lastFile", inputs: ["hotkey", "mouse"] }, // 最後一個檔案
            { key: "firstDir", inputs: ["hotkey", "mouse"] }, // 第一個資料夾
            { key: "lastDir", inputs: ["hotkey", "mouse"] }, // 最後一個資料夾
            { key: "revealInFileExplorer", inputs: ["hotkey", "mouse"] }, // 在檔案總管中顯示
            { key: "systemContextMenu", inputs: ["hotkey", "mouse"] }, // 系統選單
            { key: "renameFile", inputs: ["hotkey", "mouse"] }, // 重新命名
            { key: "openWith", inputs: ["hotkey", "mouse"] }, // 用其他程式開啟
            { key: "fileToRecycleBin", inputs: ["hotkey", "mouse"] }, // 移至資源回收桶
            { key: "fileToPermanentlyDelete", inputs: ["hotkey", "mouse"] }, // 永久刪除
            { key: "reloadAll", inputs: ["hotkey", "mouse"] }, // 重新載入
            { key: "openClipboard", inputs: ["hotkey", "mouse"] }, // 載入剪貼簿內容
            { key: "loadPath", inputs: ["hotkey"], subOptions: ["path"] }, // 載入檔案/資料夾
            { key: "moveFileTo", inputs: ["hotkey"], subOptions: ["folderPath"] }, // 移動檔案至
            { key: "copyFileTo", inputs: ["hotkey"], subOptions: ["folderPath"] }, // 複製檔案至
            { key: "openWithSpecifiedApp", inputs: ["hotkey"], subOptions: ["filePath"] }, // 用指定程式開啟
        ]
    },
    {
        category: "copy",
        title: "copy", // 複製
        content: [
            { key: "copyFile", inputs: ["hotkey", "mouse"] }, // 複製檔案
            { key: "copyFileName", inputs: ["hotkey", "mouse"] }, // 複製檔名
            { key: "copyFilePath", inputs: ["hotkey", "mouse"] }, // 複製檔案路徑
            { key: "copyImage", inputs: ["hotkey", "mouse"] }, // 複製影像
            { key: "copyImageBase64", inputs: ["hotkey", "mouse"] }, // 複製影像 Base64
            { key: "copyText", inputs: ["hotkey", "mouse"] }, // 複製文字
            { key: "copyPrompt", inputs: ["hotkey", "mouse"] }, // 複製 Prompt
        ]
    },
    {
        category: "layout",
        title: "layout", // 佈局
        content: [
            { key: "maximizeWindow", inputs: ["hotkey", "mouse"] }, // 視窗最大化
            { key: "topmost", inputs: ["hotkey", "mouse"] }, // 視窗固定最上層
            { key: "fullScreen", inputs: ["hotkey", "mouse"] }, // 全螢幕
            { key: "showToolbar", inputs: ["hotkey", "mouse"] }, // 工具列
            { key: "showFilePanel", inputs: ["hotkey", "mouse"] }, // 檔案預覽面板
            { key: "showDirectoryPanel", inputs: ["hotkey", "mouse"] }, // 資料夾預覽面板
            { key: "showInformationPanel", inputs: ["hotkey", "mouse"] }, // 詳細資料面板
            { key: "closeWindow", inputs: ["hotkey", "mouse"] }, // 關閉程式
            { key: "showSetting", inputs: ["hotkey"] }, // 開啟設定
            { key: "developerTools", inputs: ["hotkey"] }, // 開發人員工具
        ]
    },
    {
        category: "interaction",
        title: "interaction", // 互動
        content: [
            { key: "cancel", inputs: ["hotkey"] }, // 取消 / 返回
            { key: "confirm", inputs: ["hotkey"] }, // 確認
            { key: "saveTextEditor", inputs: ["hotkey"] }, // 儲存編輯內容
        ]
    },
    {
        category: "bulkView",
        title: "bulkView", // 大量瀏覽模式
        content: [
            { key: "bulkView", inputs: ["hotkey", "mouse"] }, // 切換大量瀏覽模式
            { key: "closeBulkView", inputs: ["mouse"] }, // 退出大量瀏覽模式
            { key: "movePage", inputs: ["mouse"] }, // 移動頁面 (瀏覽器預設功能，實則不做任何事情)
            { key: "prevPage", inputs: ["hotkey", "mouse"] }, // 上一頁
            { key: "nextPage", inputs: ["hotkey", "mouse"] }, // 下一頁
            { key: "firstPage", inputs: ["hotkey", "mouse"] }, // 移至第一頁
            { key: "lastPage", inputs: ["hotkey", "mouse"] }, // 移至最後一頁
            { key: "setBulkViewColumns", inputs: ["hotkey"], subOptions: ["numberValue"] }, // 設定欄數為 1~8
            { key: "incrColumns", inputs: ["hotkey", "mouse"] }, // 增加每行圖片數
            { key: "decColumns", inputs: ["hotkey", "mouse"] }, // 減少每行圖片數
            { key: "incrFixedWidth", inputs: ["hotkey", "mouse"] }, // 增加鎖定寬度
            { key: "decFixedWidth", inputs: ["hotkey", "mouse"] }, // 減少鎖定寬度
        ]
    },
] as const satisfies readonly HotkeyDefinition[];

type ActionDefinitionItem = (typeof hotkeyDefinitions)[number]["content"][number];

export const actionDefinitionItems: readonly ActionDefinitionItem[] =
    hotkeyDefinitions.flatMap((item): readonly ActionDefinitionItem[] => item.content); // 攤平所有 action 定義

export function hasActionInput(item: ActionDefinitionItem, input: ActionInput) {
    return (item.inputs as readonly ActionInput[]).includes(input);
}

export const hotkeyDefinitionItems: readonly ActionDefinitionItem[] =
    actionDefinitionItems.filter(item => hasActionInput(item, "hotkey")); // 快速鍵可用的 action

export type HotkeyAction = typeof actionDefinitionItems[number]["key"];

export const hotkeyActionKeys = Object.fromEntries(
    actionDefinitionItems.map(item => [item.key, item.key]),
) as { [K in HotkeyAction]: K }; // 由所有 action 定義推導出的 key 常數表
