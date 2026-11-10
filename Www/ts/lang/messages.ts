import type { LanguageModule, LocalizedText } from "./language-types";

export const msg = {
    msg: {

        yes: ({
            "zh-TW": "是",
            "zh-CN": "是",
            "en": "Yes",
            "ru": "Да",
            "ja": "はい",
        } satisfies LocalizedText),
        no: ({
            "zh-TW": "否",
            "zh-CN": "否",
            "en": "No",
            "ru": "Нет",
            "ja": "いいえ",
        } satisfies LocalizedText),
        close: ({
            "zh-TW": "關閉",
            "zh-CN": "关闭",
            "en": "Close",
            "ru": "Закрыть",
            "ja": "閉じる",
        } satisfies LocalizedText),

        imageNotFound: ({
            "zh-TW": "未檢測到圖片",
            "zh-CN": "未检测到图片",
            "en": "Image not found",
            "ru": "Изображение не найдено",
            "ja": "画像が検出されない",
        } satisfies LocalizedText),

        fileReadFailed: ({
            "zh-TW": "檔案讀取失敗：{message}",
            "zh-CN": "文件读取失败：{message}",
            "en": "Failed to read the file: {message}",
            "ru": "Не удалось прочитать файл: {message}",
            "ja": "ファイルの読み込みに失敗しました：{message}",
        } satisfies LocalizedText),
        videoPlaybackFailed: ({
            "zh-TW": "影片無法正常顯示。可能缺少對應的影片解碼器（例如 AV1 或 HEVC 視訊延伸模組）、影片格式不支援、檔案已損毀，或讀取逾時。",
            "zh-CN": "视频无法正常显示。可能缺少对应的视频解码器（例如 AV1 或 HEVC 视频扩展）、视频格式不受支持、文件已损坏，或读取超时。",
            "en": "The video could not be displayed. A required video decoder (such as the AV1 or HEVC Video Extension) may be missing, or the format may be unsupported, the file may be damaged, or loading may have timed out.",
            "ru": "Не удалось воспроизвести видео. Возможно, отсутствует кодек (например, расширение AV1 или HEVC), формат не поддерживается, файл повреждён или превышено время ожидания.",
            "ja": "動画を正常に表示できません。AV1 や HEVC のビデオ拡張機能など、必要なデコーダーがないか、形式が未対応、ファイルが破損、または読み込みがタイムアウトした可能性があります。",
        } satisfies LocalizedText),
        directoryReadFailed: ({
            "zh-TW": "資料夾清單讀取失敗：{message}",
            "zh-CN": "文件夹列表读取失败：{message}",
            "en": "Failed to read the folder list: {message}",
            "ru": "Не удалось прочитать список папок: {message}",
            "ja": "フォルダ一覧の読み込みに失敗しました：{message}",
        } satisfies LocalizedText),
        fileListReadFailed: ({
            "zh-TW": "檔案清單讀取失敗，僅顯示目前檔案：{message}",
            "zh-CN": "文件列表读取失败，仅显示当前文件：{message}",
            "en": "Failed to read the file list. Showing only the current file: {message}",
            "ru": "Не удалось прочитать список файлов. Отображается только текущий файл: {message}",
            "ja": "ファイル一覧の読み込みに失敗したため、現在のファイルのみ表示します：{message}",
        } satisfies LocalizedText),
        fileSortFailed: ({
            "zh-TW": "檔案排序失敗，改用檔名排序：{message}",
            "zh-CN": "文件排序失败，改用文件名排序：{message}",
            "en": "File sorting failed. Falling back to name sorting: {message}",
            "ru": "Не удалось отсортировать файлы. Используется сортировка по имени: {message}",
            "ja": "ファイルの並べ替えに失敗したため、名前順に切り替えます：{message}",
        } satisfies LocalizedText),
        directorySortFallback: ({
            "zh-TW": "資料夾排序失敗，改用檔名排序：{message}",
            "zh-CN": "文件夹排序失败，改用文件名排序：{message}",
            "en": "Folder sorting failed. Falling back to name sorting: {message}",
            "ru": "Не удалось отсортировать папки. Используется сортировка по имени: {message}",
            "ja": "フォルダの並べ替えに失敗したため、名前順に切り替えます：{message}",
        } satisfies LocalizedText),
        directoryPanelReadFailed: ({
            "zh-TW": "資料夾預覽清單讀取失敗：{message}",
            "zh-CN": "文件夹预览列表读取失败：{message}",
            "en": "Failed to read the folder preview list: {message}",
            "ru": "Не удалось прочитать список папок для просмотра: {message}",
            "ja": "フォルダプレビュー一覧の読み込みに失敗しました：{message}",
        } satisfies LocalizedText),

        notFound: ({
            "zh-TW": "未找到",
            "zh-CN": "未找到",
            "en": "Not found",
            "ru": "Не найдено",
            "ja": "検出されない",
        } satisfies LocalizedText),

        reloadFile: ({
            "zh-TW": "檔案已被修改，要重新載入此檔案嗎？",
            "zh-CN": "文件已被修改，要重新加载此文件吗？",
            "en": "The file has been changed, do you want to reload this file?",
            "ru": "Файл изменён. Перезагрузить его?",
            "ja": "ファイルが変更されました。このファイルを再読み込みしますか？",
        } satisfies LocalizedText),

        cannotOpenClipboard: ({
            "zh-TW": "無法開啟剪貼簿的內容",
            "zh-CN": "无法开启剪贴板的内容",
            "en": "Cannot open the contents of the clipboard",
            "ru": "Не удалось открыть содержимое буфера обмена",
            "ja": "クリップボードの内容を開くことができません",
        } satisfies LocalizedText),

        imageAnalysisFailed: ({
            "zh-TW": "圖片解析失敗",
            "zh-CN": "图片解析失败",
            "en": "Image analysis failed",
            "ru": "Не удалось обработать изображение",
            "ja": "画像解析に失敗しました",
        } satisfies LocalizedText),

        promptNotFound: ({
            "zh-TW": "未找到 Prompt",
            "zh-CN": "未找到 Prompt",
            "en": `"Prompt" not found`,
            "ru": "Промпт не найден",
            "ja": `"Prompt" が見つかりません`,
        } satisfies LocalizedText),

        //#region 壓縮檔
        archiveEmpty: ({
            "zh-TW": "壓縮檔內沒有可瀏覽的檔案",
            "zh-CN": "压缩文件内没有可浏览的文件",
            "en": "The archive contains no browsable files",
            "ru": "В архиве нет файлов для просмотра",
            "ja": "圧縮ファイル内に閲覧できるファイルがありません",
        } satisfies LocalizedText),
        archivePasswordRequired: ({
            "zh-TW": "此壓縮檔需要密碼：",
            "zh-CN": "此压缩文件需要密码：",
            "en": "This archive requires a password:",
            "ru": "Для этого архива требуется пароль:",
            "ja": "この圧縮ファイルにはパスワードが必要です：",
        } satisfies LocalizedText),
        archivePasswordIncorrect: ({
            "zh-TW": "壓縮檔密碼錯誤，請重新輸入：",
            "zh-CN": "压缩文件密码错误，请重新输入：",
            "en": "The archive password is incorrect. Please try again:",
            "ru": "Неверный пароль архива. Повторите ввод:",
            "ja": "圧縮ファイルのパスワードが正しくありません。再入力してください：",
        } satisfies LocalizedText),
        archiveLoadCancelled: ({
            "zh-TW": "（已取消）",
            "zh-CN": "（已取消）",
            "en": " (Cancelled)",
            "ru": " (Отменено)",
            "ja": "（キャンセル）",
        } satisfies LocalizedText),
        archivePasswordError: ({
            "zh-TW": "（密碼錯誤）",
            "zh-CN": "（密码错误）",
            "en": " (Incorrect password)",
            "ru": " (Неверный пароль)",
            "ja": "（パスワードが正しくありません）",
        } satisfies LocalizedText),
        archiveNotFound: ({
            "zh-TW": "（找不到檔案）",
            "zh-CN": "（找不到文件）",
            "en": " (File not found)",
            "ru": " (Файл не найден)",
            "ja": "（ファイルが見つかりません）",
        } satisfies LocalizedText),
        archiveOpenFailed: ({
            "zh-TW": "（無法開啟壓縮檔）",
            "zh-CN": "（无法打开压缩文件）",
            "en": " (Cannot open archive)",
            "ru": " (Не удалось открыть архив)",
            "ja": "（圧縮ファイルを開けません）",
        } satisfies LocalizedText),
        archiveSolidSizeLimitExceeded: ({
            "zh-TW": "（無法瀏覽超過 100 MB 的固實壓縮檔）",
            "zh-CN": "（无法浏览超过 100 MB 的固实压缩文件）",
            "en": " (Solid archives over 100 MB cannot be browsed)",
            "ru": " (Нельзя просматривать архивы со сплошным сжатием размером более 100 МБ)",
            "ja": "（100 MB を超えるソリッド圧縮ファイルは閲覧できません）",
        } satisfies LocalizedText),
        archiveLoadFailed: ({
            "zh-TW": "壓縮檔載入失敗：{name}{reason}",
            "zh-CN": "压缩文件加载失败：{name}{reason}",
            "en": "Failed to load archive: {name}{reason}",
            "ru": "Не удалось открыть архив: {name}{reason}",
            "ja": "圧縮ファイルの読み込みに失敗しました：{name}{reason}",
        } satisfies LocalizedText),
        archiveEntryLoadFailed: ({
            "zh-TW": "壓縮檔內檔案載入失敗：{name}",
            "zh-CN": "压缩文件内文件加载失败：{name}",
            "en": "Failed to load archive file: {name}",
            "ru": "Не удалось открыть файл из архива: {name}",
            "ja": "圧縮ファイル内のファイルの読み込みに失敗しました：{name}",
        } satisfies LocalizedText),
        archiveHighRiskOperationNotSupported: ({
            "zh-TW": "此類型的檔案不支援此操作",
            "zh-CN": "此类型的文件不支持此操作",
            "en": "This file type does not support this operation",
            "ru": "Для файлов этого типа эта операция не поддерживается",
            "ja": "この種類のファイルではこの操作をサポートしていません",
        } satisfies LocalizedText),
        archiveFileNotReady: ({
            "zh-TW": "壓縮檔檔案已不存在或尚未準備好。",
            "zh-CN": "压缩文件文件已不存在或尚未准备好。",
            "en": "The archive file no longer exists or is not ready.",
            "ru": "Архив больше не существует или ещё не готов.",
            "ja": "圧縮ファイルが存在しないか、まだ準備できていません。",
        } satisfies LocalizedText),
        archiveFilePrepareFailed: ({
            "zh-TW": "無法準備壓縮檔檔案。",
            "zh-CN": "无法准备压缩文件文件。",
            "en": "Unable to prepare the archive file.",
            "ru": "Не удалось подготовить архив.",
            "ja": "圧縮ファイルを準備できません。",
        } satisfies LocalizedText),
        archiveOperationNotSupported: ({
            "zh-TW": "壓縮檔預覽模式不支援此操作",
            "zh-CN": "压缩文件预览模式不支持此操作",
            "en": "This operation is not supported in archive preview mode",
            "ru": "Эта операция недоступна в режиме просмотра архива",
            "ja": "圧縮ファイルのプレビューモードではこの操作はサポートされていません",
        } satisfies LocalizedText),

        //#endregion

        //#region download
        fileDownloadFailed: ({
            "zh-TW": "檔案下載失敗",
            "zh-CN": "文件下载失败",
            "en": "File download failed",
            "ru": "Не удалось загрузить файл",
            "ja": "ファイルのダウンロードに失敗",
        } satisfies LocalizedText),
        unsupportedFileTypes: ({
            "zh-TW": "不支援的檔案類型",
            "zh-CN": "不支持的文件类型",
            "en": "Unsupported file types",
            "ru": "Неподдерживаемый тип файла",
            "ja": "対応していないファイル形式です",
        } satisfies LocalizedText),
        fileSizeExceededLimit: ({
            "zh-TW": "檔案大小超過限制",
            "zh-CN": "文件大小超过限制",
            "en": "File size exceeded limit",
            "ru": "Размер файла превышает ограничение",
            "ja": "ファイルサイズが制限を超えた",
        } satisfies LocalizedText),
        downloadImages: ({
            "zh-TW": "此操作將下載 {n} 張圖片，是否繼續？",
            "zh-CN": "此操作将下载 {n} 张图片，是否继续？",
            "en": "This operation will download {n} images, do you want to continue?",
            "ru": "Будут загружены изображения ({n} шт.). Продолжить?",
            "ja": "{n} 枚の画像をダウンロードしますか？",
        } satisfies LocalizedText),
        //#endregion

        //#region 文字編輯器
        saveComplete: ({
            "zh-TW": "儲存完成",
            "zh-CN": "保存完成",
            "en": "Save complete",
            "ru": "Сохранение завершено",
            "ja": "保存完了",
        } satisfies LocalizedText),
        saveFailed: ({
            "zh-TW": "儲存失敗",
            "zh-CN": "保存失败",
            "en": "Save failed",
            "ru": "Не удалось сохранить",
            "ja": "保存に失敗",
        } satisfies LocalizedText),
        formattingFailed: ({
            "zh-TW": "格式化失敗",
            "zh-CN": "格式化失败",
            "en": "Formatting Failed",
            "ru": "Не удалось форматировать",
            "ja": "フォーマットに失敗しました",
        } satisfies LocalizedText),
        //#endregion

        //#region copy
        copyFile: ({
            "zh-TW": "已將「檔案」複製至剪貼簿",
            "zh-CN": "已将「文件」复制至剪贴板",
            "en": ` "File" copying completed`,
            "ru": "Файл скопирован в буфер обмена",
            "ja": "コピー「ファイル」完了",
        } satisfies LocalizedText),
        copyFileName: ({
            "zh-TW": "已將「檔案名稱」複製至剪貼簿",
            "zh-CN": "已将「文件名」复制至剪贴板",
            "en": `"File Name" copying completed`,
            "ru": "Имя файла скопировано в буфер обмена",
            "ja": "コピー「ファイル名」完了",
        } satisfies LocalizedText),
        copyDirName: ({
            "zh-TW": "已將「資料夾名稱」複製至剪貼簿",
            "zh-CN": "已将「文件夹名称」复制至剪贴板",
            "en": `"Folder Name" copying completed`,
            "ru": "Имя папки скопировано в буфер обмена",
            "ja": "コピー「フォルダ名」完了",
        } satisfies LocalizedText),
        copyImage: ({
            "zh-TW": "已將「影像」複製至剪貼簿",
            "zh-CN": "已将「影像」复制至剪贴板",
            "en": `"Image" copying completed`,
            "ru": "Изображение скопировано в буфер обмена",
            "ja": "コピー「画像」完了",
        } satisfies LocalizedText),
        copyFilePath: ({
            "zh-TW": "已將「檔案路徑」複製至剪貼簿",
            "zh-CN": "已将「文件路径」复制至剪贴板",
            "en": `"File Path" copying completed`,
            "ru": "Путь к файлу скопирован в буфер обмена",
            "ja": "コピー「ファイルパス」完了",
        } satisfies LocalizedText),
        copyDirPath: ({
            "zh-TW": "已將「資料夾路徑」複製至剪貼簿",
            "zh-CN": "已将「文件夹路径」复制至剪贴板",
            "en": `"Folder Path" copying completed`,
            "ru": "Путь к папке скопирован в буфер обмена",
            "ja": "コピー「フォルダパス」完了",
        } satisfies LocalizedText),
        copyIamgeBase64: ({
            "zh-TW": "已將「影像 Base64」複製至剪貼簿",
            "zh-CN": "已将「影像 Base64」复制至剪贴板",
            "en": `"Iamge Base64" copying completed`,
            "ru": "Изображение скопировано как Base64",
            "ja": "コピー「画像 Base64」完了",
        } satisfies LocalizedText),
        copyBase64: ({
            "zh-TW": "已將「Base64」複製至剪貼簿",
            "zh-CN": "已将「Base64」复制至剪贴板",
            "en": `"Base64" copying completed`,
            "ru": "Данные Base64 скопированы в буфер обмена",
            "ja": "コピー「Base64」完了",
        } satisfies LocalizedText),
        copyText: ({
            "zh-TW": "已將「文字」複製至剪貼簿",
            "zh-CN": "已将「文字」复制至剪贴板",
            "en": `"Text" copying completed`,
            "ru": "Текст скопирован в буфер обмена",
            "ja": "コピー「テキスト」完了",
        } satisfies LocalizedText),
        copyExif: ({
            "zh-TW": "已將「{v}」複製至剪貼簿",
            "zh-CN": "已将「{v}」复制至剪贴板",
            "en": `"{v}" copying completed`,
            "ru": "«{v}» скопировано в буфер обмена",
            "ja": "コピー「{v}」完了",
        } satisfies LocalizedText),
        copyPrompt: ({
            "zh-TW": "已將「Prompt」複製至剪貼簿",
            "zh-CN": "已将「Prompt」复制至剪贴板",
            "en": `"Prompt" copying completed`,
            "ru": "Промпт скопирован в буфер обмена",
            "ja": "コピー「Prompt」完了",
        } satisfies LocalizedText),
        //#endregion

        //#region 重新命名
        renameFile: ({
            "zh-TW": "重新命名檔案",
            "zh-CN": "重新命名文件",
            "en": "Rename File",
            "ru": "Переименовать файл",
            "ja": "ファイルの名前を変更",
        } satisfies LocalizedText),
        renameDir: ({
            "zh-TW": "重新命名資料夾",
            "zh-CN": "重新命名文件夹",
            "en": "Rename Folder",
            "ru": "Переименовать папку",
            "ja": "フォルダの名前を変更",
        } satisfies LocalizedText),
        nameIsEmpty: ({
            "zh-TW": "必須輸入檔名",
            "zh-CN": "必须输入文件名",
            "en": "Must have file name",
            "ru": "Введите имя файла",
            "ja": "ファイル名が必要です",
        } satisfies LocalizedText),
        nameContainsUnavailableChar: ({
            "zh-TW": "檔案名稱不可以包含下列任意字元：",
            "zh-CN": "文件名不可以包含下列任意字符：",
            "en": "The file name cannot contain the following characters:",
            "ru": "Имя файла не может содержать следующие символы:",
            "ja": "ファイル名に次の文字は使えません：",
        } satisfies LocalizedText),
        renamingFailure: ({
            "zh-TW": "重新命名失敗：",
            "zh-CN": "重新命名失败：",
            "en": "Renaming Failure:",
            "ru": "Не удалось переименовать:",
            "ja": "名前変更が失敗：",
        } satisfies LocalizedText),
        wrongPath: ({
            "zh-TW": "路徑異常",
            "zh-CN": "路径异常",
            "en": "Wrong path",
            "ru": "Недопустимый путь",
            "ja": "無効なパス",
        } satisfies LocalizedText),
        //#endregion

        //#region 刪除檔案
        deleteFile: ({
            "zh-TW": "刪除檔案",
            "zh-CN": "删除文件",
            "en": "Delete File",
            "ru": "Удалить файл",
            "ja": "ファイルを削除",
        } satisfies LocalizedText),
        deleteDir: ({
            "zh-TW": "刪除資料夾",
            "zh-CN": "删除文件夹",
            "en": "Delete Folder",
            "ru": "Удалить папку",
            "ja": "フォルダを削除",
        } satisfies LocalizedText),
        fileToRecycleBin: ({
            "zh-TW": "移至資源回收桶",
            "zh-CN": "移至回收站",
            "en": "Move to Recycle Bin",
            "ru": "Переместить в корзину",
            "ja": "ごみ箱へ移動",
        } satisfies LocalizedText),
        fileToPermanentlyDelete: ({
            "zh-TW": "永久刪除",
            "zh-CN": "永久删除",
            "en": "Permanently Delete",
            "ru": "Удалить без возможности восстановления",
            "ja": "完全に削除",
        } satisfies LocalizedText),
        fileToRecycleBinCompleted: ({
            "zh-TW": "已完成「移至資源回收桶」",
            "zh-CN": "已完成「移至回收站」",
            "en": `"Move to Tecycle Bin" completed`,
            "ru": "Файл перемещён в корзину",
            "ja": "「ごみ箱へ移動」完了",
        } satisfies LocalizedText),
        fileToPermanentlyDeleteCompleted: ({
            "zh-TW": "已完成「永久刪除」",
            "zh-CN": "已完成「永久删除」",
            "en": `"Permanently Delete" completed`,
            "ru": "Файл удалён без возможности восстановления",
            "ja": "「完全に削除」完了",
        } satisfies LocalizedText),
        moveFileToCompleted: ({
            "zh-TW": "檔案已移動至「{name}」",
            "zh-CN": "文件已移动至「{name}」",
            "en": `File moved to "{name}"`,
            "ru": "Файл перемещён в «{name}»",
            "ja": "ファイルを「{name}」へ移動しました",
        } satisfies LocalizedText),
        copyFileToCompleted: ({
            "zh-TW": "檔案已複製至「{name}」",
            "zh-CN": "文件已复制至「{name}」",
            "en": `File copied to "{name}"`,
            "ru": "Файл скопирован в «{name}»",
            "ja": "ファイルを「{name}」へコピーしました",
        } satisfies LocalizedText),
        openWithSpecifiedAppCompleted: ({
            "zh-TW": "已用「{name}」開啟",
            "zh-CN": "已用「{name}」开启",
            "en": `Opened with "{name}"`,
            "ru": "Открыто с помощью «{name}»",
            "ja": "「{name}」で開きました",
        } satisfies LocalizedText),
        openWithSpecifiedAppFailed: ({
            "zh-TW": "無法用「{name}」開啟",
            "zh-CN": "无法用「{name}」开启",
            "en": `Unable to open with "{name}"`,
            "ru": "Не удалось открыть с помощью «{name}»",
            "ja": "「{name}」で開けませんでした",
        } satisfies LocalizedText),
        fileDeletionFailed: ({
            "zh-TW": "刪除失敗",
            "zh-CN": "删除失败",
            "en": "deletion failed",
            "ru": "Удаление не удалось",
            "ja": "削除失敗",
        } satisfies LocalizedText),
        //#endregion

        //#region 搜圖
        imageSearchFailed: ({
            "zh-TW": "圖片搜尋失敗",
            "zh-CN": "图片搜索失败",
            "en": "Image search failed",
            "ru": "Поиск изображений не удался",
            "ja": "画像検索に失敗",
        } satisfies LocalizedText),
        //#endregion

        //#region setting
        associationExtension: ({
            "zh-TW": "確定用 Tiefsee 來開啟這些檔案嗎？",
            "zh-CN": "确定用 Tiefsee 来开启这些文件吗？",
            "en": "Are you sure you want to open these files with Tiefsee?",
            "ru": "Открыть эти файлы с помощью Tiefsee?",
            "ja": "これらのファイルを開くのに Tiefsee を使用するのは確かですか？",
        } satisfies LocalizedText),
        removeAssociationExtension: ({
            "zh-TW": "確定要解除這些檔案與 Tiefsee 的關聯嗎？",
            "zh-CN": "确定要解除这些文件与 Tiefsee 的关联吗？",
            "en": "Are you sure you want to remove the association of these files with Tiefsee?",
            "ru": "Удалить ассоциацию этих файлов с Tiefsee?",
            "ja": "これらのファイルを Tiefsee との関連付けから解除してよろしいですか？",
        } satisfies LocalizedText),
        done: ({
            "zh-TW": "完成！",
            "zh-CN": "完成！",
            "en": "Done!",
            "ru": "Готово!",
            "ja": "完了！",
        } satisfies LocalizedText),
        tempDeleteCompleted: ({
            "zh-TW": "暫存資料清理完成",
            "zh-CN": "缓存数据清理完成",
            "en": "Temporary data cleanup completed",
            "ru": "Временные файлы очищены",
            "ja": "キャッシュ削除完了",
        } satisfies LocalizedText),

        enabledByPolicy: ({
            "zh-TW": "變更失敗，此設定被系統政策啟用",
            "zh-CN": "变更失败，此设置被系统策略启用",
            "en": "Change failed, this setting is enabled by system policy",
            "ru": "Не удалось изменить параметр: он управляется системной политикой.",
            "ja": "変更に失敗しました。この設定はシステムポリシーによって有効になっています",
        } satisfies LocalizedText),
        disabledByPolicy: ({
            "zh-TW": "變更失敗，此設定被系統政策禁用",
            "zh-CN": "变更失败，此设置被系统策略禁用",
            "en": "Change failed, this setting is disabled by system policy",
            "ru": "Не удалось изменить параметр: он отключён системной политикой.",
            "ja": "変更に失敗しました。この設定はシステムポリシーによって無効になっています",
        } satisfies LocalizedText),
        disabledByUser: ({
            "zh-TW": "變更失敗，此設定被使用者禁用",
            "zh-CN": "变更失败，此设置被用户禁用",
            "en": "Change failed, this setting is disabled by the user",
            "ru": "Не удалось изменить параметр: он отключён пользователем.",
            "ja": "変更に失敗しました。この設定はユーザーによって無効にされています",
        } satisfies LocalizedText),

        resetSettings: ({
            "zh-TW": "確定要將 Tiefsee 的所有設定恢復成預設值嗎？\n(不會影響擴充套件與檔案排序)",
            "zh-CN": "确定要将 Tiefsee 的所有设置恢复成默认值吗？\n(不会影响扩展插件与文件排序)",
            "en": "Are you sure you want to restore all Tiefsee settings to their default values? \n(This will not affect Plugin and File Sorting)",
            "ru": "Восстановить все настройки Tiefsee по умолчанию?\n(Расширения и порядок сортировки файлов не изменятся.)",
            "ja": "Tiefsee のすべての設定をデフォルト値に戻してもよろしいですか？\n（プラグインやファイルソートには影響しません）",
        } satisfies LocalizedText),
        hotkeyResetAll: ({
            "zh-TW": "確定要將所有快速鍵恢復成初始設定嗎？\n(只會影響快速鍵，不會變更其他設定)",
            "zh-CN": "确定要将所有快捷键恢复成初始设置吗？\n(只会影响快捷键，不会变更其他设置)",
            "en": "Are you sure you want to restore all hotkeys to their default settings?\n(Only hotkeys will be changed.)",
            "ru": "Восстановить сочетания клавиш по умолчанию?\n(Другие настройки не изменятся.)",
            "ja": "すべてのホットキーを初期設定に戻してもよろしいですか？\n（変更されるのはホットキーのみです）",
        } satisfies LocalizedText),
        toolbarReset: ({
            "zh-TW": "確定要將目前選取的工具列恢復成預設排列嗎？\n（只會重設此工具列）",
            "zh-CN": "确定要将当前选中的工具栏恢复为默认排列吗？\n（只会重置此工具栏）",
            "en": "Restore the selected toolbar to its default layout?\n(Only this toolbar will be reset.)",
            "ru": "Восстановить панель инструментов по умолчанию?\n(Будет сброшена только эта панель.)",
            "ja": "選択中のツールバーを初期配置に戻しますか？\n（このツールバーのみリセットされます）",
        } satisfies LocalizedText),
        mouseResetAll: ({
            "zh-TW": "確定要將所有滑鼠設定恢復成初始設定嗎？\n(只會影響滑鼠設定，不會變更其他設定)",
            "zh-CN": "确定要将所有鼠标设置恢复成初始设置吗？\n(只会影响鼠标设置，不会变更其他设置)",
            "en": "Are you sure you want to restore all mouse settings to their default settings?\n(Only mouse settings will be changed.)",
            "ru": "Восстановить настройки мыши по умолчанию?\n(Другие параметры не изменятся.)",
            "ja": "すべてのマウス設定を初期設定に戻してもよろしいですか？\n（変更されるのはマウス設定のみです）",
        } satisfies LocalizedText),
        //#endregion

        //#region 到達最後一個檔案時
        reachLastFile: ({
            "zh-TW": "已經是最後一個檔案",
            "zh-CN": "已经是最后一个文件",
            "en": "This is the last file",
            "ru": "Это последний файл",
            "ja": "これが最後のファイルです",
        } satisfies LocalizedText),
        reachFirstFile: ({
            "zh-TW": "已經是第一個檔案",
            "zh-CN": "已经是第一个文件",
            "en": "This is the first file",
            "ru": "Это первый файл",
            "ja": "これが最初のファイルです",
        } satisfies LocalizedText),
        firstFile: ({
            "zh-TW": "載入第一個檔案",
            "zh-CN": "加载第一个文件",
            "en": "Load the first file",
            "ru": "Открыть первый файл",
            "ja": "最初のファイルを読み込む",
        } satisfies LocalizedText),
        lastFile: ({
            "zh-TW": "載入最後一個檔案",
            "zh-CN": "加载最后一个文件",
            "en": "Load the last file",
            "ru": "Открыть последний файл",
            "ja": "最後のファイルを読み込む",
        } satisfies LocalizedText),
        nextDir: ({
            "zh-TW": "載入下一個資料夾",
            "zh-CN": "加载下一个文件夹",
            "en": "Load the next folder",
            "ru": "Открыть следующую папку",
            "ja": "次のフォルダを読み込む",
        } satisfies LocalizedText),
        prevDir: ({
            "zh-TW": "載入上一個資料夾",
            "zh-CN": "加载上一个文件夹",
            "en": "Load the previous folder",
            "ru": "Открыть предыдущую папку",
            "ja": "前のフォルダを読み込む",
        } satisfies LocalizedText),
        reachLastDir: ({
            "zh-TW": "已經是最後一個資料夾",
            "zh-CN": "已经是最后一个文件夹",
            "en": "This is the last folder",
            "ru": "Это последняя папка",
            "ja": "これが最後のフォルダです",
        } satisfies LocalizedText),
        reachFirstDir: ({
            "zh-TW": "已經是第一個資料夾",
            "zh-CN": "已经是第一个文件夹",
            "en": "This is the first folder",
            "ru": "Это первая папка",
            "ja": "これが最初のフォルダです",
        } satisfies LocalizedText),
        firstDir: ({
            "zh-TW": "載入第一個資料夾",
            "zh-CN": "加载第一个文件夹",
            "en": "Load the first folder",
            "ru": "Открыть первую папку",
            "ja": "最初のフォルダを読み込む",
        } satisfies LocalizedText),
        lastDir: ({
            "zh-TW": "載入最後一個資料夾",
            "zh-CN": "加载最后一个文件夹",
            "en": "Load the last folder",
            "ru": "Открыть последнюю папку",
            "ja": "最後のフォルダを読み込む",
        } satisfies LocalizedText),
        //#endregion

        //#region LoRA
        notFoundFile: ({
            "zh-TW": "未找到檔案",
            "zh-CN": "未找到文件",
            "en": "File not found",
            "ru": "Файл не найден",
            "ja": "ファイルが見つかりません",
        } satisfies LocalizedText),
        searchCivitai: ({
            "zh-TW": "從 Civitai 搜尋",
            "zh-CN": "从 Civitai 搜索",
            "en": "Search from Civitai",
            "ru": "Искать на Civitai",
            "ja": "Civitai から検索",
        } satisfies LocalizedText),
        notSpecifiedA1111Models: ({
            "zh-TW": "未指定 A1111 models 路徑",
            "zh-CN": "未指定 A1111 models 路径",
            "en": "Not specified A1111 models path",
            "ru": "Путь к моделям A1111 не указан",
            "ja": "A1111 models パスが指定されていません",
        } satisfies LocalizedText),
        goToSetting: ({
            "zh-TW": "前往設定",
            "zh-CN": "前往设置",
            "en": "Go to setting",
            "ru": "Перейти к настройкам",
            "ja": "設定に移動",
        } satisfies LocalizedText),
        //#endregion

    }
} satisfies LanguageModule<"msg">;
