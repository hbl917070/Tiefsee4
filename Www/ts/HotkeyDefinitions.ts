export type HotkeySubOption = "distancePx" | "path" | "folderPath" | "filePath" | "numberValue";

export type HotkeyCategoryKey = "image" | "file" | "copy" | "layout" | "interaction" | "bulkView";

export type HotkeyDefinition = {
    category: HotkeyCategoryKey;
    title: string;
    content: {
        key: string;
        subOptions?: HotkeySubOption[];
    }[];
};

export const hotkeyDefinitions = [
    {
        category: "image",
        title: "image", // 圖片
        content: [
            { key: "imageFitWindowOrImageOriginal" }, // 縮放至適合視窗 or 圖片原始大小
            { key: "switchFitWindowAndOriginal" }, // 縮放至適合視窗/圖片原始大小 切換
            { key: "imageFitWindow" }, // 強制縮放至適合視窗
            { key: "imageOriginal" }, // 圖片原始大小
            { key: "imageZoomIn" }, // 放大
            { key: "imageZoomOut" }, // 縮小
            { key: "imageRotateCw" }, // 順時針90°
            { key: "imageRotateCcw" }, // 逆時針90°
            { key: "imageFlipHorizontal" }, // 水平鏡像
            { key: "imageFlipVertical" }, // 垂直鏡像
            { key: "imageInitialRotation" }, // 圖初始化旋轉
            { key: "imageMoveUp", subOptions: ["distancePx"] }, // 圖片向上移動
            { key: "imageMoveDown", subOptions: ["distancePx"] }, // 圖片向下移動
            { key: "imageMoveLeft", subOptions: ["distancePx"] }, // 圖片向左移動
            { key: "imageMoveRight", subOptions: ["distancePx"] }, // 圖片向右移動
            { key: "imageMoveUpOrPrevFile", subOptions: ["distancePx"] }, // 圖片向上移動 or 上一個檔案
            { key: "imageMoveDownOrNextFile", subOptions: ["distancePx"] }, // 圖片向下移動 or 下一個檔案
            { key: "imageMoveLeftOrPrevFile", subOptions: ["distancePx"] }, // 圖片向左移動 or 上一個檔案
            { key: "imageMoveRightOrNextFile", subOptions: ["distancePx"] }, // 圖片向右移動 or 下一個檔案
            { key: "imageMoveLeftOrNextFile", subOptions: ["distancePx"] }, // 圖片向左移動 or 下一個檔案
            { key: "imageMoveRightOrPrevFile", subOptions: ["distancePx"] }, // 圖片向右移動 or 上一個檔案
        ]
    },
    {
        category: "file",
        title: "file", // 檔案
        content: [
            { key: "newWindow" }, // 另開視窗
            { key: "prevFile" }, // 上一個檔案
            { key: "nextFile" }, // 下一個檔案
            { key: "prevDir" }, // 上一個資料夾
            { key: "nextDir" }, // 下一個資料夾
            { key: "firstFile" }, // 第一個檔案
            { key: "lastFile" }, // 最後一個檔案
            { key: "firstDir" }, // 第一個資料夾
            { key: "lastDir" }, // 最後一個資料夾
            { key: "revealInFileExplorer" }, // 在檔案總管中顯示
            { key: "systemContextMenu" }, // 系統選單
            { key: "renameFile" }, // 重新命名
            { key: "openWith" }, // 用其他程式開啟
            { key: "fileToRecycleBin" }, // 移至資源回收桶
            { key: "fileToPermanentlyDelete" }, // 永久刪除
            { key: "reloadAll" }, // 重新載入
            { key: "openClipboard" }, // 載入剪貼簿內容
            { key: "loadPath", subOptions: ["path"] }, // 載入檔案/資料夾
            { key: "moveFileTo", subOptions: ["folderPath"] }, // 移動檔案至
            { key: "copyFileTo", subOptions: ["folderPath"] }, // 複製檔案至
            { key: "openWithSpecifiedApp", subOptions: ["filePath"] }, // 用指定程式開啟
        ]
    },
    {
        category: "copy",
        title: "copy", // 複製
        content: [
            { key: "copyFile" }, // 複製檔案
            { key: "copyFileName" }, // 複製檔名
            { key: "copyFilePath" }, // 複製檔案路徑
            { key: "copyImage" }, // 複製影像
            { key: "copyImageBase64" }, // 複製影像 Base64
            { key: "copyText" }, // 複製文字
            { key: "copyPrompt" }, // 複製 Prompt
        ]
    },
    {
        category: "layout",
        title: "layout", // 佈局
        content: [
            { key: "maximizeWindow" }, // 視窗最大化
            { key: "topmost" }, // 視窗固定最上層
            { key: "fullScreen" }, // 全螢幕
            { key: "showToolbar" }, // 工具列
            { key: "showFilePanel" }, // 檔案預覽面板
            { key: "showDirectoryPanel" }, // 資料夾預覽面板
            { key: "showInformationPanel" }, // 詳細資料面板
            { key: "closeWindow" }, // 關閉程式
            { key: "showSetting" }, // 開啟設定
            { key: "developerTools" }, // 開發人員工具
        ]
    },
    {
        category: "interaction",
        title: "interaction", // 互動
        content: [
            { key: "cancel" }, // 取消 / 返回
            { key: "confirm" }, // 確認
            { key: "saveTextEditor" }, // 儲存編輯內容
        ]
    },
    {
        category: "bulkView",
        title: "bulkView", // 大量瀏覽模式
        content: [
            { key: "bulkView" }, // 切換大量瀏覽模式
            { key: "prevPage" }, // 上一頁
            { key: "nextPage" }, // 下一頁
            { key: "firstPage" }, // 移至第一頁
            { key: "lastPage" }, // 移至最後一頁
            { key: "setBulkViewColumns", subOptions: ["numberValue"] }, // 設定欄數為 1~8
            { key: "incrColumns" }, // 增加每行圖片數
            { key: "decColumns" }, // 減少每行圖片數
            { key: "incrFixedWidth" }, // 增加鎖定寬度
            { key: "decFixedWidth" }, // 減少鎖定寬度
        ]
    },
] as const satisfies readonly HotkeyDefinition[];

type HotkeyDefinitionItem = (typeof hotkeyDefinitions)[number]["content"][number];

export const hotkeyDefinitionItems: readonly HotkeyDefinitionItem[] =
    hotkeyDefinitions.flatMap((item): readonly HotkeyDefinitionItem[] => item.content); // 攤平後的快速鍵定義

export type HotkeyAction = typeof hotkeyDefinitionItems[number]["key"];

export const hotkeyActionKeys = Object.fromEntries(
    hotkeyDefinitionItems.map(item => [item.key, item.key]),
) as { [K in HotkeyAction]: K }; // 由 definitions 推導出的 key 常數表
