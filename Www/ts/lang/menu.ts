import type { LanguageModule, LocalizedText } from "./language-types";

export const menu = {
    menu: {
        favorites: ({
            "zh-TW": "收藏",
            "zh-CN": "收藏",
            "en": "Favorites",
            "ja": "お気に入り",
        } satisfies LocalizedText),
        addToFavorites: ({
            "zh-TW": "加入收藏",
            "zh-CN": "加入收藏",
            "en": "Add to Favorites",
            "ja": "お気に入りに追加",
        } satisfies LocalizedText),

        //#region 工具列
        layout: ({
            "zh-TW": "佈局",
            "zh-CN": "布局",
            "en": "Layout",
            "ja": "レイアウト",
        } satisfies LocalizedText),
        back: ({
            "zh-TW": "返回",
            "zh-CN": "返回",
            "en": "Back",
            "ja": "戻る",
        } satisfies LocalizedText),
        exitFullScreen: ({
            "zh-TW": "結束全螢幕",
            "zh-CN": "结束全屏",
            "en": "Exit Full Screen",
            "ja": "全画面表示を終了する",
        } satisfies LocalizedText),
        close: ({
            "zh-TW": "關閉",
            "zh-CN": "关闭",
            "en": "Close",
            "ja": "閉じる",
        } satisfies LocalizedText),

        prevFile: ({
            "zh-TW": "上一個檔案",
            "zh-CN": "上一个文件",
            "en": "Prev File",
            "ja": "前のファイル",
        } satisfies LocalizedText),
        nextFile: ({
            "zh-TW": "下一個檔案",
            "zh-CN": "下一个文件",
            "en": "Next File",
            "ja": "次のファイル",
        } satisfies LocalizedText),
        openFile: ({
            "zh-TW": "載入檔案",
            "zh-CN": "加载文件",
            "en": "Open File",
            "ja": "ファイルを開く",
        } satisfies LocalizedText),
        openClipboard: ({
            "zh-TW": "載入剪貼簿內容",
            "zh-CN": "加载剪贴板内容",
            "en": "Open Clipboard",
            "ja": "クリップボードを開く",
        } satisfies LocalizedText),
        showMenuFile: ({
            "zh-TW": "檔案",
            "zh-CN": "文件",
            "en": "File",
            "ja": "ファイル",
        } satisfies LocalizedText),
        prevDir: ({
            "zh-TW": "上一個資料夾",
            "zh-CN": "上一个文件夹",
            "en": "Prev Folder",
            "ja": "前のフォルダ",
        } satisfies LocalizedText),
        nextDir: ({
            "zh-TW": "下一個資料夾",
            "zh-CN": "下一个文件夹",
            "en": "Next Folder",
            "ja": "次のフォルダ",
        } satisfies LocalizedText),
        showMenuSort: ({
            "zh-TW": "排序",
            "zh-CN": "排序",
            "en": "Sort",
            "ja": "ソート",
        } satisfies LocalizedText),
        showMenuCopy: ({
            "zh-TW": "複製",
            "zh-CN": "复制",
            "en": "Copy",
            "ja": "コピー",
        } satisfies LocalizedText),
        dragDropFile: ({
            "zh-TW": "快速拖曳",
            "zh-CN": "快速拖拽",
            "en": "Quick Drag File",
            "ja": "クイックドラッグ",
        } satisfies LocalizedText),
        showDeleteFileMsg: ({
            "zh-TW": "刪除檔案",
            "zh-CN": "删除文件",
            "en": "Delete File",
            "ja": "ファイルの削除",
        } satisfies LocalizedText),
        showDeleteDirMsg: ({
            "zh-TW": "刪除資料夾",
            "zh-CN": "删除文件夹",
            "en": "Delete Folder",
            "ja": "フォルダを削除",
        } satisfies LocalizedText),
        showMenuImageSearch: ({
            "zh-TW": "搜圖",
            "zh-CN": "搜图",
            "en": "Image Search",
            "ja": "画像検索",
        } satisfies LocalizedText),
        bulkView: ({
            "zh-TW": "大量瀏覽模式",
            "zh-CN": "批量浏览模式",
            "en": "Bulk View",
            "ja": "バルクビュー",
        } satisfies LocalizedText),
        showSetting: ({
            "zh-TW": "設定",
            "zh-CN": "设置",
            "en": "Setting",
            "ja": "設定",
        } satisfies LocalizedText),
        showMenuRotation: ({
            "zh-TW": "旋轉與鏡像",
            "zh-CN": "旋转与镜像",
            "en": "Rotation",
            "ja": "回転",
        } satisfies LocalizedText),
        zoomToFit: ({
            "zh-TW": "縮放至適合視窗",
            "zh-CN": "缩放至适合窗口",
            "en": "Zoom to Fit",
            "ja": "ズームトゥフィット",
        } satisfies LocalizedText),
        zoomIn: ({
            "zh-TW": "放大",
            "zh-CN": "放大",
            "en": "Zoom In",
            "ja": "拡大",
        } satisfies LocalizedText),
        zoomOut: ({
            "zh-TW": "縮小",
            "zh-CN": "缩小",
            "en": "Zoom Out",
            "ja": "縮小",
        } satisfies LocalizedText),
        infoZoomRatio: ({
            "zh-TW": "縮放比例",
            "zh-CN": "缩放比例",
            "en": "Zoom Ratio",
            "ja": "ズーム倍率",
        } satisfies LocalizedText),
        infoSize: ({
            "zh-TW": "寬度 / 高度",
            "zh-CN": "宽度 / 高度",
            "en": "Width / Height",
            "ja": "幅 / 高さ",
        } satisfies LocalizedText),
        infoType: ({
            "zh-TW": "檔案類型 / 檔案大小",
            "zh-CN": "文件类型 / 文件大小",
            "en": "File Format / File Size",
            "ja": "ファイル形式 / ファイルサイズ",
        } satisfies LocalizedText),
        infoWriteTime: ({
            "zh-TW": "修改日期",
            "zh-CN": "修改日期",
            "en": "Last Write Time",
            "ja": "更新日時",
        } satisfies LocalizedText),
        showSave: ({
            "zh-TW": "儲存檔案",
            "zh-CN": "保存文件",
            "en": "Save",
            "ja": "アーカイブ",
        } satisfies LocalizedText),
        showBulkViewSetting: ({
            "zh-TW": "大量瀏覽模式設定",
            "zh-CN": "批量浏览模式设置",
            "en": "Bulk View Settings",
            "ja": "バルクビュー設定",
        } satisfies LocalizedText),
        reload: ({
            "zh-TW": "重新載入",
            "zh-CN": "重新载入",
            "en": "Reload",
            "ja": "リロード",
        } satisfies LocalizedText),
        //#endregion


        //#region 下拉選單 檔案
        openNewWindow: ({
            "zh-TW": "另開視窗",
            "zh-CN": "另开窗口",
            "en": "Open New Window",
            "ja": "新しいウィンドウで開く",
        } satisfies LocalizedText),

        revealInFileExplorer: ({
            "zh-TW": "在檔案總管中顯示",
            "zh-CN": "在资源管理器中显示",
            "en": "Reveal in File Explorer",
            "ja": "エクスプローラーで表示",
        } satisfies LocalizedText),
        revealInFileExplorerFile: ({
            "zh-TW": "在檔案總管中顯示檔案",
            "zh-CN": "在资源管理器中显示文件",
            "en": "Reveal File in File Explorer",
            "ja": `
                <span style="letter-spacing:-2px">
                    ファイルをエクスプローラーで表示
                </span>`,
        } satisfies LocalizedText),
        revealInFileExplorerDir: ({
            "zh-TW": "在檔案總管中顯示資料夾",
            "zh-CN": "在资源管理器中显示文件夹",
            "en": "Reveal Folder in File Explorer",
            "ja": `
                <span style="letter-spacing:-2px">
                    フォルダをエクスプローラーで表示
                </span>`,
        } satisfies LocalizedText),

        systemContextMenu: ({
            "zh-TW": "系統選單",
            "zh-CN": "系统菜单",
            "en": "System Context Menu",
            "ja": "コンテキストメニュー",
        } satisfies LocalizedText),
        systemContextMenuFile: ({
            "zh-TW": "檔案系統選單",
            "zh-CN": "文件系统菜单",
            "en": "File System Context Menu",
            "ja": `
                <span style="letter-spacing:-4px">
                    ファイルのシステムコンテキストメニュー
                </span>`,
        } satisfies LocalizedText),
        systemContextMenuDir: ({
            "zh-TW": "資料夾系統選單",
            "zh-CN": "文件夹系统菜单",
            "en": "Folder System Context Menu",
            "ja": `
                <span style="letter-spacing:-4px;">
                    フォルダのシステムコンテキストメニュー
                </span>`,
        } satisfies LocalizedText),

        renameFile: ({
            "zh-TW": "重新命名檔案",
            "zh-CN": "重新命名文件",
            "en": "Rename File",
            "ja": "ファイルの名前を変更",
        } satisfies LocalizedText),
        renameDir: ({
            "zh-TW": "重新命名資料夾",
            "zh-CN": "重新命名文件夹",
            "en": "Rename Folder",
            "ja": "フォルダの名前を変更",
        } satisfies LocalizedText),
        print: ({
            "zh-TW": "列印",
            "zh-CN": "打印",
            "en": "Print",
            "ja": "印刷",
        } satisfies LocalizedText),
        setAsDesktop: ({
            "zh-TW": "設成桌布",
            "zh-CN": "设成桌面壁纸",
            "en": "Set as Desktop Background",
            "ja": "壁紙に設定",
        } satisfies LocalizedText),
        openWith: ({
            "zh-TW": "用其他程式開啟",
            "zh-CN": "用其他程序开启",
            "en": "Open with…",
            "ja": "別のアプリで開く…",
        } satisfies LocalizedText),
        //#endregion


        //#region 下拉選單 複製
        copyFile: ({
            "zh-TW": "複製檔案",
            "zh-CN": "复制文件",
            "en": "Copy File",
            "ja": "コピーファイル",
        } satisfies LocalizedText),
        copyFileName: ({
            "zh-TW": "複製檔名",
            "zh-CN": "复制文件名",
            "en": "Copy File Name",
            "ja": "コピーファイル名",
        } satisfies LocalizedText),
        copyDirName: ({
            "zh-TW": "複製資料夾名",
            "zh-CN": "复制文件夹名",
            "en": "Copy Folder Name",
            "ja": "コピーフォルダ名",
        } satisfies LocalizedText),
        copyFilePath: ({
            "zh-TW": "複製檔案路徑",
            "zh-CN": "复制文件路径",
            "en": "Copy File Path",
            "ja": "コピーファイルパス",
        } satisfies LocalizedText),
        copyDirPath: ({
            "zh-TW": "複製資料夾路徑",
            "zh-CN": "复制文件夹路径",
            "en": "Copy Folder Path",
            "ja": "コピーフォルダパス",
        } satisfies LocalizedText),
        copyImage: ({
            "zh-TW": "複製影像",
            "zh-CN": "复制影像",
            "en": "Copy Image",
            "ja": "コピー画像",
        } satisfies LocalizedText),
        copyImageBase64: ({
            "zh-TW": "複製影像 Base64",
            "zh-CN": "复制影像 Base64",
            "en": "Copy Image Base64",
            "ja": "コピー画像 Base64",
        } satisfies LocalizedText),
        copyBase64: ({
            "zh-TW": "複製 Base64",
            "zh-CN": "复制 Base64",
            "en": "Copy Base64",
            "ja": "コピー Base64",
        } satisfies LocalizedText),
        copyText: ({
            "zh-TW": "複製文字",
            "zh-CN": "复制文字",
            "en": "Copy Text",
            "ja": "コピーテキスト",
        } satisfies LocalizedText),
        //#endregion


        //#region 下拉選單 複製
        rotateCw: ({
            "zh-TW": "順時針90°",
            "zh-CN": "顺时针90°",
            "en": "90° Clockwise",
            "ja": "右に回転",
        } satisfies LocalizedText),
        rotateCcw: ({
            "zh-TW": "逆時針90°",
            "zh-CN": "逆时针90°",
            "en": "90° Counter Clockwise",
            "ja": "左に回転",
        } satisfies LocalizedText),
        flipHorizontal: ({
            "zh-TW": "水平鏡像",
            "zh-CN": "水平镜像",
            "en": "Flip Horizontal",
            "ja": "水平方向に反転",
        } satisfies LocalizedText),
        flipVertical: ({
            "zh-TW": "垂直鏡像",
            "zh-CN": "垂直镜像",
            "en": "Flip Vertical",
            "ja": "垂直方向に反転",
        } satisfies LocalizedText),
        initialRotation: ({
            "zh-TW": "初始化旋轉",
            "zh-CN": "初始化旋转",
            "en": "Initial Rotation",
            "ja": "回転をリセットする",
        } satisfies LocalizedText),
        //#endregion


        //#region 下拉選單 排序
        fileSortBy: ({
            "zh-TW": "檔案排序方式",
            "zh-CN": "文件排序方式",
            "en": "File Sort by",
            "ja": "ファイルソート方式",
        } satisfies LocalizedText),
        directorySortBy: ({
            "zh-TW": "資料夾排序方式",
            "zh-CN": "文件夹排序方式",
            "en": "Folder Sort by",
            "ja": "フォルダソート方式",
        } satisfies LocalizedText),
        name: ({
            "zh-TW": "檔名",
            "zh-CN": "文件名",
            "en": "File Name",
            "ja": "ファイル名",
        } satisfies LocalizedText),
        lastWriteTime: ({
            "zh-TW": "修改日期",
            "zh-CN": "修改日期",
            "en": "Last Write Time",
            "ja": "更新日時",
        } satisfies LocalizedText),
        lastAccessTime: ({
            "zh-TW": "存取日期",
            "zh-CN": "访问日期",
            "en": "Last Access Time",
            "ja": "アクセス日時",
        } satisfies LocalizedText),
        creationTime: ({
            "zh-TW": "建立日期",
            "zh-CN": "创建日期",
            "en": "Creation Time",
            "ja": "作成日時",
        } satisfies LocalizedText),
        length: ({
            "zh-TW": "檔案大小",
            "zh-CN": "文件大小",
            "en": "File Size",
            "ja": "ファイルサイズ",
        } satisfies LocalizedText),
        random: ({
            "zh-TW": "隨機",
            "zh-CN": "随机",
            "en": "Random",
            "ja": "ランダム",
        } satisfies LocalizedText),
        asc: ({
            "zh-TW": "遞增",
            "zh-CN": "升序",
            "en": "Ascending",
            "ja": "昇順",
        } satisfies LocalizedText),
        desc: ({
            "zh-TW": "遞減",
            "zh-CN": "降序",
            "en": "Descending",
            "ja": "降順",
        } satisfies LocalizedText),
        //#endregion


        //#region 右鍵選單 圖片
        deleteFile: ({
            "zh-TW": "刪除檔案",
            "zh-CN": "删除文件",
            "en": "Delete File",
            "ja": "ファイルを削除",
        } satisfies LocalizedText),
        deleteDir: ({
            "zh-TW": "刪除資料夾",
            "zh-CN": "删除文件夹",
            "en": "Delete Folder",
            "ja": "フォルダを削除",
        } satisfies LocalizedText),
        setting: ({
            "zh-TW": "設定",
            "zh-CN": "设置",
            "en": "Setting",
            "ja": "設定",
        } satisfies LocalizedText),
        help: ({
            "zh-TW": "說明",
            "zh-CN": "说明",
            "en": "Help",
            "ja": "ヘルプ",
        } satisfies LocalizedText),
        exit: ({
            "zh-TW": "關閉程式",
            "zh-CN": "关闭程序",
            "en": "Exit",
            "ja": "退出",
        } satisfies LocalizedText),
        //#endregion


        //#region 下拉選單 layout
        fullScreen: ({
            "zh-TW": "全螢幕",
            "zh-CN": "全屏",
            "en": "Full Screen",
            "ja": "全画面表示",
        } satisfies LocalizedText),
        topmost: ({
            "zh-TW": "視窗固定最上層",
            "zh-CN": "窗口固定最上层",
            "en": "Window Always on Top",
            "ja": "ウィンドウを常に最前面に表示",
        } satisfies LocalizedText),
        showToolbar: ({
            "zh-TW": "工具列",
            "zh-CN": "工具条",
            "en": "Toolbar",
            "ja": "ツールバー",
        } satisfies LocalizedText),
        showFilePanel: ({
            "zh-TW": "檔案預覽面板",
            "zh-CN": "文件预览面板",
            "en": "File Panel",
            "ja": "ファイルパネル",
        } satisfies LocalizedText),
        showDirectoryPanel: ({
            "zh-TW": "資料夾預覽面板",
            "zh-CN": "文件夹预览面板",
            "en": "Folder Panel",
            "ja": "フォルダパネル",
        } satisfies LocalizedText),
        showInformationPanel: ({
            "zh-TW": "詳細資料面板",
            "zh-CN": "详细信息面板",
            "en": "Information Panel",
            "ja": "情報パネル",
        } satisfies LocalizedText),
        //#endregion


        //#region 右鍵選單 輸入框
        cut: ({
            "zh-TW": "剪下",
            "zh-CN": "剪切",
            "en": "Cut",
            "ja": "切り取り",
        } satisfies LocalizedText),
        copy: ({
            "zh-TW": "複製",
            "zh-CN": "复制",
            "en": "Copy",
            "ja": "コピー",
        } satisfies LocalizedText),
        paste: ({
            "zh-TW": "貼上",
            "zh-CN": "粘贴",
            "en": "Paste",
            "ja": "貼り付け",
        } satisfies LocalizedText),
        selectAll: ({
            "zh-TW": "全選",
            "zh-CN": "全选",
            "en": "Select All",
            "ja": "すべて選択",
        } satisfies LocalizedText),
        //#endregion


        //#region 詳細資料面板
        information: ({
            "zh-TW": "資訊",
            "zh-CN": "信息",
            "en": "Information",
            "ja": "情報",
        } satisfies LocalizedText),
        relatedFiles: ({
            "zh-TW": "相關檔案",
            "zh-CN": "相关文件",
            "en": "Related Files",
            "ja": "関連ファイル",
        } satisfies LocalizedText),
        new: ({
            "zh-TW": "新增",
            "zh-CN": "新增",
            "en": "New",
            "ja": "新機能",
        } satisfies LocalizedText),
        edit: ({
            "zh-TW": "編輯",
            "zh-CN": "编辑",
            "en": "Edit",
            "ja": "編集",
        } satisfies LocalizedText),
        formatJson: ({
            "zh-TW": "格式化 JSON",
            "zh-CN": "格式化 JSON",
            "en": "Format JSON",
            "ja": "JSON をフォーマット",
        } satisfies LocalizedText),
        expand: ({
            "zh-TW": "展開",
            "zh-CN": "展开",
            "en": "Expand",
            "ja": "展開する",
        } satisfies LocalizedText),
        collapse: ({
            "zh-TW": "折疊",
            "zh-CN": "折叠",
            "en": "Collapse",
            "ja": "折りたたむ",
        } satisfies LocalizedText),
        export: ({
            "zh-TW": "匯出",
            "zh-CN": "导出",
            "en": "Export",
            "ja": "エクスポート",
        } satisfies LocalizedText),
        //#endregion

    }
} satisfies LanguageModule<"menu">;
