import type { LanguageModule, LocalizedText } from "./language-types";

export const script = {
    script: {

        none: ({
            "zh-TW": "無",
            "zh-CN": "无",
            "en": "None",
            "ru": "Нет",
            "ja": "なし",
        } satisfies LocalizedText),

        imageViewportPan: ({
            "zh-TW": "圖片檢視區，可拖曳平移；快速放開後會繼續移動",
            "zh-CN": "图片检视区，可拖拽平移；快速放开后会继续移动",
            "en": "Image viewport. Drag to pan; a quick release continues the motion.",
            "ru": "Область просмотра изображения: перетаскивайте изображение для перемещения. После быстрого отпускания оно продолжит движение по инерции.",
            "ja": "画像表示領域。ドラッグで移動し、素早く離すと慣性で動き続けます。",
        } satisfies LocalizedText),

        movePage: ({
            "zh-TW": "移動頁面",
            "zh-CN": "移动页面",
            "en": "Move page",
            "ru": "Перемещение изображения",
            "ja": "ページを移動",
        } satisfies LocalizedText),

        distancePx: ({
            "zh-TW": "距離(px)",
            "zh-CN": "距离(px)",
            "en": "Distance(px)",
            "ru": "Расстояние (пикс.)",
            "ja": "距離(px)",
        } satisfies LocalizedText),
        path: ({
            "zh-TW": "路徑",
            "zh-CN": "路径",
            "en": "Path",
            "ru": "Путь",
            "ja": "パス",
        } satisfies LocalizedText),
        folderPath: ({
            "zh-TW": "資料夾路徑",
            "zh-CN": "文件夹路径",
            "en": "Folder Path",
            "ru": "Путь к папке",
            "ja": "フォルダーパス",
        } satisfies LocalizedText),
        filePath: ({
            "zh-TW": "檔案路徑",
            "zh-CN": "文件路径",
            "en": "File Path",
            "ru": "Путь к файлу",
            "ja": "ファイルパス",
        } satisfies LocalizedText),
        numberValue: ({
            "zh-TW": "數值",
            "zh-CN": "数值",
            "en": "Value",
            "ru": "Значение",
            "ja": "値",
        } satisfies LocalizedText),

        //#region 圖片
        image: ({
            "zh-TW": "圖片",
            "zh-CN": "图片",
            "en": "Image",
            "ru": "Изображение",
            "ja": "画像",
        } satisfies LocalizedText),
        imageFitWindowOrImageOriginal: ({
            "zh-TW": "縮放至適合視窗 or 圖片原始大小",
            "zh-CN": "缩放至适合窗口 or 图片原始大小",
            "en": "Zoom to Fit or Image Original Size",
            "ru": "Вписать в окно / исходный размер",
            "ja": "ズームトゥフィット or 画像原寸大",
        } satisfies LocalizedText),
        switchFitWindowAndOriginal: ({
            "zh-TW": "縮放至適合視窗/圖片原始大小 切換",
            "zh-CN": "缩放至适合窗口/图片原始大小 切换",
            "en": `Switch between "Zoom to Fit" and "Image Original Size"`,
            "ru": "Переключить режим: вписать в окно / исходный размер",
            "ja": "ズームトゥフィット/画像原寸大 切り替え",
        } satisfies LocalizedText),
        imageFitWindow: ({
            "zh-TW": "強制縮放至適合視窗",
            "zh-CN": "强制缩放至适合窗口",
            "en": "Always Zoom to Fit",
            "ru": "Всегда вписывать в окно",
            "ja": "常にズームトゥフィット",
        } satisfies LocalizedText),
        imageOriginal: ({
            "zh-TW": "圖片原始大小",
            "zh-CN": "图片原始大小",
            "en": "Image Original Size",
            "ru": "Исходный размер изображения",
            "ja": "画像原寸大",
        } satisfies LocalizedText),
        imageZoomIn: "menu.zoomIn", //放大
        imageZoomOut: "menu.zoomOut", //縮小
        imageRotateCw: "menu.rotateCw", //順時針90°
        imageRotateCcw: "menu.rotateCcw", //逆時針90°
        imageFlipHorizontal: "menu.flipHorizontal", //水平鏡像
        imageFlipVertical: "menu.flipVertical", //垂直鏡像
        imageInitialRotation: "menu.initialRotation", //圖初始化旋轉
        imageMoveUp: ({
            "zh-TW": "圖片向上移動",
            "zh-CN": "图片向上移动",
            "en": "Move Image Up",
            "ru": "Сдвинуть изображение вверх",
            "ja": "画像を上に移動"
        } satisfies LocalizedText),
        imageMoveDown: ({
            "zh-TW": "圖片向下移動",
            "zh-CN": "图片向下移动",
            "en": "Move Image Down",
            "ru": "Сдвинуть изображение вниз",
            "ja": "画像を下に移動"
        } satisfies LocalizedText),
        imageMoveLeft: ({
            "zh-TW": "圖片向左移動",
            "zh-CN": "图片向左移动",
            "en": "Move Image Left",
            "ru": "Сдвинуть изображение влево",
            "ja": "画像を左に移動"
        } satisfies LocalizedText),
        imageMoveRight: ({
            "zh-TW": "圖片向右移動",
            "zh-CN": "图片向右移动",
            "en": "Move Image Right",
            "ru": "Сдвинуть изображение вправо",
            "ja": "画像を右に移動"
        } satisfies LocalizedText),
        imageMoveUpOrPrevFile: ({
            "zh-TW": "圖片向上移動 or 上一個檔案",
            "zh-CN": "图片向上移动 or 上一个文件",
            "en": "Move Image Up or Prev File",
            "ru": "Вверх / предыдущий файл",
            "ja": "画像を上に移動 or 前のファイル"
        } satisfies LocalizedText),
        imageMoveDownOrNextFile: ({
            "zh-TW": "圖片向下移動 or 下一個檔案",
            "zh-CN": "图片向下移动 or 下一个文件",
            "en": "Move Image Down or Next File",
            "ru": "Вниз / следующий файл",
            "ja": "画像を下に移動 or 次のファイル"
        } satisfies LocalizedText),

        imageMoveLeftOrPrevFile: ({
            "zh-TW": "圖片向左移動 or 上一個檔案",
            "zh-CN": "图片向左移动 or 上一个文件",
            "en": "Move Image Left or Prev File",
            "ru": "Влево / предыдущий файл",
            "ja": "画像を左に移動 or 前のファイル"
        } satisfies LocalizedText),
        imageMoveRightOrNextFile: ({
            "zh-TW": "圖片向右移動 or 下一個檔案",
            "zh-CN": "图片向右移动 or 下一个文件",
            "en": "Move Image Right or Next File",
            "ru": "Вправо / следующий файл",
            "ja": "画像を右に移動 or 次のファイル"
        } satisfies LocalizedText),
        imageMoveRightOrPrevFile: ({
            "zh-TW": "圖片向右移動 or 上一個檔案",
            "zh-CN": "图片向右移动 or 上一个文件",
            "en": "Move Image Right or Prev File",
            "ru": "Вправо / предыдущий файл",
            "ja": "画像を右に移動 or 前のファイル"
        } satisfies LocalizedText),
        imageMoveLeftOrNextFile: ({
            "zh-TW": "圖片向左移動 or 下一個檔案",
            "zh-CN": "图片向左移动 or 下一个文件",
            "en": "Move Image Left or Next File",
            "ru": "Влево / следующий файл",
            "ja": "画像を左に移動 or 次のファイル"
        } satisfies LocalizedText),
        toggleCheckerboardBackground: "sw.other.checkerboardBackground", // 使用格子背景
        //#endregion

        //#region 檔案
        file: ({
            "zh-TW": "檔案",
            "zh-CN": "文件",
            "en": "File",
            "ru": "Файл",
            "ja": "ファイル",
        } satisfies LocalizedText),
        newWindow: "menu.openNewWindow", //另開視窗
        prevFile: "menu.prevFile", //上一個檔案
        nextFile: "menu.nextFile", //下一個檔案
        prevDir: "menu.prevDir", //上一個資料夾
        nextDir: "menu.nextDir", //下一個資料夾
        firstFile: ({
            "zh-TW": "第一個檔案",
            "zh-CN": "第一个文件",
            "en": "First File",
            "ru": "Первый файл",
            "ja": "最初のファイル"
        } satisfies LocalizedText),
        lastFile: ({
            "zh-TW": "最後一個檔案",
            "zh-CN": "最后一个文件",
            "en": "Last File",
            "ru": "Последний файл",
            "ja": "最後のファイル"
        } satisfies LocalizedText),
        firstDir: ({
            "zh-TW": "第一個資料夾",
            "zh-CN": "第一个文件夹",
            "en": "First Folder",
            "ru": "Первая папка",
            "ja": "最初のフォルダ"
        } satisfies LocalizedText),
        lastDir: ({
            "zh-TW": "最後一個資料夾",
            "zh-CN": "最后一个文件夹",
            "en": "Last Folder",
            "ru": "Последняя папка",
            "ja": "最後のフォルダ"
        } satisfies LocalizedText),
        revealInFileExplorer: "menu.revealInFileExplorer", //在檔案總管中顯示
        systemContextMenu: "menu.systemContextMenu", //系統選單
        renameFile: "menu.renameFile", //重新命名
        openWith: "menu.openWith", //用其他程式開啟
        fileToRecycleBin: "msg.fileToRecycleBin", //移至資源回收桶
        fileToPermanentlyDelete: "msg.fileToPermanentlyDelete", //永久刪除
        reloadAll: "menu.reload", //重新載入
        loadPath: ({
            "zh-TW": "載入檔案/資料夾",
            "zh-CN": "加载文件/文件夹",
            "en": "Load File/Folder",
            "ru": "Открыть файл или папку",
            "ja": "ファイル/フォルダーを読み込む",
        } satisfies LocalizedText),
        openClipboard: "menu.openClipboard", //載入剪貼簿內容
        moveFileTo: ({
            "zh-TW": "移動檔案至",
            "zh-CN": "移动文件至",
            "en": "Move File To",
            "ru": "Переместить файл в",
            "ja": "ファイルを移動",
        } satisfies LocalizedText),
        copyFileTo: ({
            "zh-TW": "複製檔案至",
            "zh-CN": "复制文件至",
            "en": "Copy File To",
            "ru": "Копировать файл в",
            "ja": "ファイルをコピー",
        } satisfies LocalizedText),
        openWithSpecifiedApp: ({
            "zh-TW": "用指定程式開啟",
            "zh-CN": "用指定程序开启",
            "en": "Open with Specified App",
            "ru": "Открыть в указанной программе",
            "ja": "指定したアプリで開く",
        } satisfies LocalizedText),
        addFileToFavorites: ({
            "zh-TW": "將檔案加入收藏",
            "zh-CN": "将文件加入收藏",
            "en": "Add File to Favorites",
            "ru": "Добавить файл в избранное",
            "ja": "ファイルをお気に入りに追加",
        } satisfies LocalizedText),
        addDirectoryToFavorites: ({
            "zh-TW": "將資料夾加入收藏",
            "zh-CN": "将文件夹加入收藏",
            "en": "Add Folder to Favorites",
            "ru": "Добавить папку в избранное",
            "ja": "フォルダーをお気に入りに追加",
        } satisfies LocalizedText),
        //#endregion

        //#region 複製
        copy: ({
            "zh-TW": "複製",
            "zh-CN": "复制",
            "en": "Copy",
            "ru": "Копировать",
            "ja": "コピー",
        } satisfies LocalizedText),
        copyFile: "menu.copyFile", //複製檔案
        copyFileName: "menu.copyFileName", //複製檔名
        copyDirName: "menu.copyDirName", //複製資料夾名
        copyFilePath: "menu.copyFilePath", //複製檔案路徑
        copyDirPath: "menu.copyDirPath", //複製資料夾路徑
        copyImage: "menu.copyImage", //複製影像
        copyImageBase64: "menu.copyImageBase64", //複製影像 Base64
        copyText: "menu.copyText", //複製文字
        copyPrompt: ({
            "zh-TW": "複製 Prompt",
            "zh-CN": "复制 Prompt",
            "en": "Copy Prompt",
            "ru": "Копировать промпт",
            "ja": "Prompt をコピー",
        } satisfies LocalizedText),
        //#endregion

        //#region 佈局
        layout: ({
            "zh-TW": "佈局",
            "zh-CN": "布局",
            "en": "Layout",
            "ru": "Расположение",
            "ja": "レイアウト",
        } satisfies LocalizedText),
        maximizeWindow: ({
            "zh-TW": "視窗最大化",
            "zh-CN": "窗口最大化",
            "en": "Maximize Window",
            "ru": "Развернуть окно",
            "ja": "ウィンドウを最大化",
        } satisfies LocalizedText),
        minimizeWindow: ({
            "zh-TW": "最小化視窗",
            "zh-CN": "最小化窗口",
            "en": "Minimize Window",
            "ru": "Свернуть окно",
            "ja": "ウィンドウを最小化",
        } satisfies LocalizedText),
        restoreWindow: ({
            "zh-TW": "還原視窗",
            "zh-CN": "还原窗口",
            "en": "Restore Window",
            "ru": "Восстановить окно",
            "ja": "ウィンドウを元に戻す",
        } satisfies LocalizedText),
        topmost: "menu.topmost", //視窗固定最上層
        fullScreen: "menu.fullScreen", //全螢幕
        showToolbar: "menu.showToolbar", //工具列
        showFilePanel: "menu.showFilePanel", //檔案預覽面板
        showDirectoryPanel: "menu.showDirectoryPanel", //資料夾預覽面板
        showInformationPanel: "menu.showInformationPanel", //詳細資料面板
        closeWindow: ({
            "zh-TW": "關閉程式",
            "zh-CN": "关闭程序",
            "en": "Close Program",
            "ru": "Закрыть программу",
            "ja": "アプリを閉じる",
        } satisfies LocalizedText),
        developerTools: ({
            "zh-TW": "開發人員工具",
            "zh-CN": "开发人员工具",
            "en": "Developer Tools",
            "ru": "Инструменты разработчика",
            "ja": "開発者ツール",
        } satisfies LocalizedText),
        //#endregion

        //#region 其他
        "other": ({
            "zh-TW": "其他",
            "zh-CN": "其他",
            "en": "Other",
            "ru": "Другое",
            "ja": "その他",
        } satisfies LocalizedText),
        interaction: ({
            "zh-TW": "互動",
            "zh-CN": "交互",
            "en": "Interaction",
            "ru": "Взаимодействие",
            "ja": "操作",
        } satisfies LocalizedText),
        back: "menu.back", //返回
        showSetting: "menu.showSetting", //設定
        cancel: ({
            "zh-TW": "取消 / 返回",
            "zh-CN": "取消 / 返回",
            "en": "Cancel / Back",
            "ru": "Отмена / Назад",
            "ja": "キャンセル / 戻る",
        } satisfies LocalizedText),
        confirm: ({
            "zh-TW": "確認",
            "zh-CN": "确认",
            "en": "Confirm",
            "ru": "Подтвердить",
            "ja": "確認",
        } satisfies LocalizedText),
        //#endregion

        //#region 文字編輯器
        textEditor: ({
            "zh-TW": "文字編輯器",
            "zh-CN": "文字编辑器",
            "en": "Text Editor",
            "ru": "Текстовый редактор",
            "ja": "テキストエディタ"
        } satisfies LocalizedText),
        save: ({
            "zh-TW": "儲存檔案",
            "zh-CN": "保存文件",
            "en": "Save",
            "ru": "Сохранить файл",
            "ja": "アーカイブ",
        } satisfies LocalizedText),
        saveTextEditor: ({
            "zh-TW": "儲存編輯內容",
            "zh-CN": "保存编辑内容",
            "en": "Save Edited Content",
            "ru": "Сохранить изменения",
            "ja": "編集内容を保存",
        } satisfies LocalizedText),
        doubleClickOpenNewWindow: ({
            "zh-TW": "雙擊以在新視窗開啟 {v}",
            "zh-CN": "双击以在新窗口中打开 {v}",
            "en": "Double-click to open {v} in a new window",
            "ru": "Дважды щёлкните, чтобы открыть {v} в новом окне",
            "ja": "ダブルクリックして {v} を新しいウィンドウで開く",
        } satisfies LocalizedText),
        //#endregion

        //#region 大量瀏覽模式

        bulkView: "menu.bulkView", //大量瀏覽模式
        closeBulkView: ({
            "zh-TW": "退出大量瀏覽模式",
            "zh-CN": "退出批量浏览模式",
            "en": "Exit Bulk View",
            "ru": "Выйти из галереи",
            "ja": "バルクビューを終了",
        } satisfies LocalizedText),
        prevRow: ({
            "zh-TW": "上一行",
            "zh-CN": "上一行",
            "en": "Previous Row",
            "ru": "Предыдущая строка",
            "ja": "前の行",
        } satisfies LocalizedText),
        nextRow: ({
            "zh-TW": "下一行",
            "zh-CN": "下一行",
            "en": "Next Row",
            "ru": "Следующая строка",
            "ja": "次の行",
        } satisfies LocalizedText),
        prevPage: ({
            "zh-TW": "上一頁",
            "zh-CN": "上一页",
            "en": "Previous Page",
            "ru": "Предыдущая страница",
            "ja": "前のページ",
        } satisfies LocalizedText),
        prevPageTop: ({
            "zh-TW": "上方上一頁",
            "zh-CN": "上方上一页",
            "en": "Previous Page (Top)",
            "ru": "Предыдущая страница (сверху)",
            "ja": "上部の前のページ",
        } satisfies LocalizedText),
        prevPageBottom: ({
            "zh-TW": "下方上一頁",
            "zh-CN": "下方上一页",
            "en": "Previous Page (Bottom)",
            "ru": "Предыдущая страница (снизу)",
            "ja": "下部の前のページ",
        } satisfies LocalizedText),
        nextPage: ({
            "zh-TW": "下一頁",
            "zh-CN": "下一页",
            "en": "Next Page",
            "ru": "Следующая страница",
            "ja": "次のページ",
        } satisfies LocalizedText),
        nextPageTop: ({
            "zh-TW": "上方下一頁",
            "zh-CN": "上方下一页",
            "en": "Next Page (Top)",
            "ru": "Следующая страница (сверху)",
            "ja": "上部の次のページ",
        } satisfies LocalizedText),
        nextPageBottom: ({
            "zh-TW": "下方下一頁",
            "zh-CN": "下方下一页",
            "en": "Next Page (Bottom)",
            "ru": "Следующая страница (снизу)",
            "ja": "下部の次のページ",
        } satisfies LocalizedText),
        firstPage: ({
            "zh-TW": "移至第一頁",
            "zh-CN": "移至第一页",
            "en": "Go to First Page",
            "ru": "Перейти на первую страницу",
            "ja": "最初のページへ移動",
        } satisfies LocalizedText),
        lastPage: ({
            "zh-TW": "移至最後一頁",
            "zh-CN": "移至最后一页",
            "en": "Go to Last Page",
            "ru": "Перейти на последнюю страницу",
            "ja": "最後のページへ移動",
        } satisfies LocalizedText),
        pageNumber: ({
            "zh-TW": "頁碼",
            "zh-CN": "页码",
            "en": "Page number",
            "ru": "Номер страницы",
            "ja": "ページ番号",
        } satisfies LocalizedText),
        pageNumberTop: ({
            "zh-TW": "上方頁碼",
            "zh-CN": "上方页码",
            "en": "Page number (Top)",
            "ru": "Номер страницы (сверху)",
            "ja": "上部のページ番号",
        } satisfies LocalizedText),
        pageNumberBottom: ({
            "zh-TW": "下方頁碼",
            "zh-CN": "下方页码",
            "en": "Page number (Bottom)",
            "ru": "Номер страницы (снизу)",
            "ja": "下部のページ番号",
        } satisfies LocalizedText),
        setBulkViewColumns: ({
            "zh-TW": "設定欄數為 1~8",
            "zh-CN": "设置列数为 1~8",
            "en": "Set Columns to 1-8",
            "ru": "Столбцы: 1–8",
            "ja": "列数を 1〜8 に設定",
        } satisfies LocalizedText),
        incrColumns: ({
            "zh-TW": "增加「每行圖片數」",
            "zh-CN": "增加「每行图片数」",
            "en": "Increase 'Images per Row'",
            "ru": "Увеличить число изображений в строке",
            "ja": "「行ごとの画像数」を増やす",
        } satisfies LocalizedText),
        decColumns: ({
            "zh-TW": "減少「每行圖片數」",
            "zh-CN": "减少「每行图片数」",
            "en": "Decrease 'Images per Row'",
            "ru": "Уменьшить число изображений в строке",
            "ja": "「行ごとの画像数」を減らす",
        } satisfies LocalizedText),
        incrFixedWidth: ({
            "zh-TW": "增加「鎖定寬度」",
            "zh-CN": "增加「锁定宽度」",
            "en": "Increase 'Fixed Width'",
            "ru": "Увеличить ширину",
            "ja": "「固定幅」を増やす",
        } satisfies LocalizedText),
        decFixedWidth: ({
            "zh-TW": "減少「鎖定寬度」",
            "zh-CN": "减少「锁定宽度」",
            "en": "Decrease 'Fixed Width'",
            "ru": "Уменьшить ширину",
            "ja": "「固定幅」を減らす",
        } satisfies LocalizedText)
        //#endregion

    }
} satisfies LanguageModule<"script">;
