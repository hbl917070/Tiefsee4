import type { LanguageModule, LocalizedText } from "./language-types";

export const favorites = {
    favorites: {
        title: ({
            "zh-TW": "收藏",
            "zh-CN": "收藏",
            "en": "Favorites",
            "ja": "お気に入り"
        } satisfies LocalizedText),
        add: ({
            "zh-TW": "新增收藏",
            "zh-CN": "添加收藏",
            "en": "Add Favorite",
            "ja": "お気に入りを追加"
        } satisfies LocalizedText),
        saved: ({
            "zh-TW": "已收藏",
            "zh-CN": "已收藏",
            "en": "Saved",
            "ja": "お気に入り"
        } satisfies LocalizedText),
        empty: ({
            "zh-TW": "尚無收藏，使用「＋」新增。",
            "zh-CN": "还没有收藏，使用「＋」添加。",
            "en": "No favorites yet. Use + to add one.",
            "ja": "お気に入りはありません。「＋」から追加できます。"
        } satisfies LocalizedText),
        hint: ({
            "zh-TW": "拖曳項目可排序；拖到中央可建立收藏資料夾。",
            "zh-CN": "拖动项目可排序；拖到中央可创建收藏文件夹。",
            "en": "Drag to reorder. Drop on an item to create a folder.",
            "ja": "ドラッグして並べ替え、項目の上に重ねてフォルダを作成します。"
        } satisfies LocalizedText),
        folderEmpty: ({
            "zh-TW": "將收藏項目拖到這裡。",
            "zh-CN": "将收藏项目拖到这里。",
            "en": "Drag favorites here.",
            "ja": "お気に入りをここにドラッグします。"
        } satisfies LocalizedText),
        folderBack: ({
            "zh-TW": "返回收藏",
            "zh-CN": "返回收藏",
            "en": "Back to Favorites",
            "ja": "お気に入りに戻る"
        } satisfies LocalizedText),
        dragOut: ({
            "zh-TW": "拖曳項目到外部可移出收藏資料夾",
            "zh-CN": "拖动项目到外部可移出收藏文件夹",
            "en": "Drag an item outside to remove it from this folder.",
            "ja": "項目を外へドラッグするとフォルダから移動します。"
        } satisfies LocalizedText),
        addCurrentFile: ({
            "zh-TW": "新增目前檔案",
            "zh-CN": "添加当前文件",
            "en": "Add Current File",
            "ja": "現在のファイルを追加"
        } satisfies LocalizedText),
        addCurrentDirectory: ({
            "zh-TW": "新增目前資料夾",
            "zh-CN": "添加当前文件夹",
            "en": "Add Current Folder",
            "ja": "現在のフォルダを追加"
        } satisfies LocalizedText),
        addCustom: ({
            "zh-TW": "自訂…",
            "zh-CN": "自定义…",
            "en": "Custom…",
            "ja": "カスタム…"
        } satisfies LocalizedText),
        editorTitle: ({
            "zh-TW": "新增收藏",
            "zh-CN": "添加收藏",
            "en": "Add Favorite",
            "ja": "お気に入りを追加"
        } satisfies LocalizedText),
        editTitle: ({
            "zh-TW": "編輯收藏",
            "zh-CN": "编辑收藏",
            "en": "Edit Favorite",
            "ja": "お気に入りを編集"
        } satisfies LocalizedText),
        type: ({
            "zh-TW": "類型",
            "zh-CN": "类型",
            "en": "Type",
            "ja": "種類"
        } satisfies LocalizedText),
        file: ({
            "zh-TW": "檔案",
            "zh-CN": "文件",
            "en": "File",
            "ja": "ファイル"
        } satisfies LocalizedText),
        directory: ({
            "zh-TW": "資料夾",
            "zh-CN": "文件夹",
            "en": "Folder",
            "ja": "フォルダ"
        } satisfies LocalizedText),
        name: ({
            "zh-TW": "名稱（選填）",
            "zh-CN": "名称（可选）",
            "en": "Name (optional)",
            "ja": "名前（任意）"
        } satisfies LocalizedText),
        path: ({
            "zh-TW": "路徑",
            "zh-CN": "路径",
            "en": "Path",
            "ja": "パス"
        } satisfies LocalizedText),
        browse: ({
            "zh-TW": "瀏覽",
            "zh-CN": "浏览",
            "en": "Browse",
            "ja": "参照"
        } satisfies LocalizedText),
        loadContent: ({
            "zh-TW": "載入內容",
            "zh-CN": "加载内容",
            "en": "Load Content",
            "ja": "読み込む内容"
        } satisfies LocalizedText),
        firstFile: ({
            "zh-TW": "第一個檔案",
            "zh-CN": "第一个文件",
            "en": "First File",
            "ja": "最初のファイル"
        } satisfies LocalizedText),
        firstDirectory: ({
            "zh-TW": "第一個資料夾",
            "zh-CN": "第一个文件夹",
            "en": "First Folder",
            "ja": "最初のフォルダ"
        } satisfies LocalizedText),
        save: ({
            "zh-TW": "儲存",
            "zh-CN": "保存",
            "en": "Save",
            "ja": "保存"
        } satisfies LocalizedText),
        cancel:
        ({
            "zh-TW": "取消",
            "zh-CN": "取消",
            "en": "Cancel",
            "ja": "キャンセル"
        } satisfies LocalizedText),
        edit: ({
            "zh-TW": "編輯",
            "zh-CN": "编辑",
            "en": "Edit",
            "ja": "編集"
        } satisfies LocalizedText),
        remove: ({
            "zh-TW": "移除",
            "zh-CN": "移除",
            "en": "Remove",
            "ja": "削除"
        } satisfies LocalizedText),
        itemActions: ({
            "zh-TW": "收藏項目操作",
            "zh-CN": "收藏项目操作",
            "en": "Favorite actions",
            "ja": "お気に入りの操作"
        } satisfies LocalizedText),
        renameGroup: ({
            "zh-TW": "收藏資料夾名稱",
            "zh-CN": "收藏文件夹名称",
            "en": "Favorite folder name",
            "ja": "お気に入りフォルダ名"
        } satisfies LocalizedText),
        selectFile: ({
            "zh-TW": "選擇檔案",
            "zh-CN": "选择文件",
            "en": "Select File",
            "ja": "ファイルを選択"
        } satisfies LocalizedText),
        selectDirectory: ({
            "zh-TW": "選擇資料夾",
            "zh-CN": "选择文件夹",
            "en": "Select Folder",
            "ja": "フォルダを選択"
        } satisfies LocalizedText),
        notFound: ({
            "zh-TW": "找不到收藏的路徑：",
            "zh-CN": "找不到收藏的路径：",
            "en": "The favorite path could not be found:",
            "ja": "お気に入りのパスが見つかりません："
        } satisfies LocalizedText),
        removeQuestion: ({
            "zh-TW": "要從收藏中移除此項目嗎？",
            "zh-CN": "要从收藏中移除此项目吗？",
            "en": "Remove this item from Favorites?",
            "ja": "この項目をお気に入りから削除しますか？"
        } satisfies LocalizedText),
        readFailed: ({
            "zh-TW": "無法讀取收藏資料。",
            "zh-CN": "无法读取收藏数据。",
            "en": "Could not read favorites.",
            "ja": "お気に入りを読み込めませんでした。"
        } satisfies LocalizedText),
        saveFailed: ({
            "zh-TW": "無法儲存收藏資料。",
            "zh-CN": "无法保存收藏数据。",
            "en": "Could not save favorites.",
            "ja": "お気に入りを保存できませんでした。"
        } satisfies LocalizedText),
        quickAddedFile: ({
            "zh-TW": "已將「檔案」加入收藏",
            "zh-CN": "已将「文件」加入收藏",
            "en": "File added to Favorites",
            "ja": "「ファイル」をお気に入りに追加しました"
        } satisfies LocalizedText),
        quickAddedDirectory: ({
            "zh-TW": "已將「資料夾」加入收藏",
            "zh-CN": "已将「文件夹」加入收藏",
            "en": "Folder added to Favorites",
            "ja": "「フォルダ」をお気に入りに追加しました"
        } satisfies LocalizedText),
    }
} satisfies LanguageModule<"favorites">;
