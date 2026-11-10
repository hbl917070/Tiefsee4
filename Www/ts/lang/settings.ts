import type { LanguageModule, LocalizedText } from "./language-types";

export const sw = {
    sw: {

        reloadRequired: ({
            "zh-TW": "需要重新載入",
            "zh-CN": "需要重新加载",
            "en": "Reload Required",
            "ru": "Требуется перезагрузка",
            "ja": "再読み込みが必要です",
        } satisfies LocalizedText),
        none: ({
            "zh-TW": "無",
            "zh-CN": "无",
            "en": "None",
            "ru": "Нет",
            "ja": "なし",
        } satisfies LocalizedText),

        default: ({
            "zh-TW": "預設",
            "zh-CN": "默认",
            "en": "Default",
            "ru": "По умолчанию",
            "ja": "プリセット",
        } satisfies LocalizedText),
        disable: ({
            "zh-TW": "停用",
            "zh-CN": "禁用",
            "en": "Disable",
            "ru": "Отключить",
            "ja": "無効",
        } satisfies LocalizedText),
        language: ({
            "zh-TW": "語言",
            "zh-CN": "语言",
            "en": "Language",
            "ru": "Язык",
            "ja": "言語",
        } satisfies LocalizedText),

        //#region tabs
        tabs: {
            general: ({
                "zh-TW": "一般",
                "zh-CN": "常规",
                "en": "General",
                "ru": "Общие",
                "ja": "一般",
            } satisfies LocalizedText),
            appearance: ({
                "zh-TW": "外觀",
                "zh-CN": "外观",
                "en": "Appearance",
                "ru": "Внешний вид",
                "ja": "外観",
            } satisfies LocalizedText),
            layout: ({
                "zh-TW": "佈局",
                "zh-CN": "布局",
                "en": "Layout",
                "ru": "Расположение",
                "ja": "レイアウト",
            } satisfies LocalizedText),
            toolbar: ({
                "zh-TW": "工具列",
                "zh-CN": "工具条",
                "en": "Toolbar",
                "ru": "Панель инструментов",
                "ja": "ツールバー",
            } satisfies LocalizedText),
            hotkey: ({
                "zh-TW": "快速鍵",
                "zh-CN": "快捷键",
                "en": "Hotkey",
                "ru": "Сочетания клавиш",
                "ja": "ホットキー",
            } satisfies LocalizedText),
            mouse: ({
                "zh-TW": "滑鼠",
                "zh-CN": "鼠标",
                "en": "Mouse",
                "ru": "Мышь",
                "ja": "マウス",
            } satisfies LocalizedText),
            association: ({
                "zh-TW": "設為預設程式",
                "zh-CN": "设为默认程序",
                "en": "Association",
                "ru": "Ассоциации файлов",
                "ja": "関連付け",
            } satisfies LocalizedText),
            advanced: ({
                "zh-TW": "進階設定",
                "zh-CN": "高级设置",
                "en": "Advanced",
                "ru": "Дополнительно",
                "ja": "アドバンスド設定",
            } satisfies LocalizedText),
            about: ({
                "zh-TW": "關於",
                "zh-CN": "关于",
                "en": "About",
                "ru": "О программе",
                "ja": "について",
            } satisfies LocalizedText),
            plugin: ({
                "zh-TW": "擴充套件",
                "zh-CN": "扩展插件",
                "en": "Plugin",
                "ru": "Расширение",
                "ja": "プラグイン",
            } satisfies LocalizedText),
            quickLook: ({
                "zh-TW": "QuickLook",
                "zh-CN": "QuickLook",
                "en": "QuickLook",
                "ru": "QuickLook",
                "ja": "QuickLook",
            } satisfies LocalizedText),
        },
        //#endregion

        //#region 一般

        // 圖片設定
        imageSettings: {
            title: ({
                "zh-TW": "圖片設定",
                "zh-CN": "图片设置",
                "en": "Image Settings",
                "ru": "Настройки изображения",
                "ja": "画像設定",
            } satisfies LocalizedText),

            imageShowPixels: ({
                "zh-TW": "圖片縮放比例大於 100% 時，呈現像素",
                "zh-CN": "图片缩放比例大于 100% 时，呈现像素",
                "en": "Show pixels if the image zoom ratio is above 100%",
                "ru": "Показывать пиксели при масштабе выше 100%",
                "ja": "画像の拡大率が 100% 以上の場合、画素を表示します",
            } satisfies LocalizedText),

            imageSharpen: ({
                "zh-TW": "圖片銳化",
                "zh-CN": "图片锐化",
                "en": "Image Sharpen",
                "ru": "Резкость изображения",
                "ja": "画像のシャープ化",
            } satisfies LocalizedText),
            imageSharpenTooltip: ({
                "zh-TW": "增強邊緣，適合用於插圖或是含有文字的圖片",
                "zh-CN": "增强边缘，适合用于插图或是含有文字的图片",
                "en": "Enhance the edges, suitable for illustrations or images containing text",
                "ru": "Повышает резкость границ. Подходит для иллюстраций и изображений с текстом.",
                "ja": "エッジを強調し、イラストやテキストを含む画像に適しています",
            } satisfies LocalizedText),
        },

        // 圖片預設縮放模式
        zoomMode: {
            title: ({
                "zh-TW": "圖片預設縮放模式",
                "zh-CN": "图片默认缩放模式",
                "en": "Image Default Zoom Mode",
                "ru": "Режим масштабирования",
                "ja": "画像のデフォルトズームモード",
            } satisfies LocalizedText),

            fitWindowOrImageOriginal: ({
                "zh-TW": "縮放至適合視窗 or 圖片原始大小",
                "zh-CN": "缩放至适合窗口 or 图片原始大小",
                "en": "Zoom to Fit or Image Original Size",
                "ru": "Вписать в окно / исходный размер",
                "ja": "ズームトゥフィット or 画像原寸大",
            } satisfies LocalizedText),
            fitWindow: ({
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
            imageWidthPx: ({
                "zh-TW": "圖片寬度 (px)",
                "zh-CN": "图片宽度 (px)",
                "en": "Image Width (px)",
                "ru": "Ширина изображения (пикс.)",
                "ja": "画像の幅 (px)",
            } satisfies LocalizedText),
            imageHeightPx: ({
                "zh-TW": "圖片高度 (px)",
                "zh-CN": "图片高度 (px)",
                "en": "Image Height (px)",
                "ru": "Высота изображения (пикс.)",
                "ja": "画像の高さ (px)",
            } satisfies LocalizedText),
            windowWidthRatio: ({
                "zh-TW": "視窗寬度 (%)",
                "zh-CN": "窗口宽度 (%)",
                "en": "Window Width (%)",
                "ru": "Ширина окна (%)",
                "ja": "ウィンドウの幅 (%)",
            } satisfies LocalizedText),
            windowHeightRatio: ({
                "zh-TW": "視窗高度 (%)",
                "zh-CN": "窗口高度 (%)",
                "en": "Window Height (%)",
                "ru": "Высота окна (%)",
                "ja": "ウィンドウの高さ (%)",
            } satisfies LocalizedText),
        },

        // 圖片預設對齊位置
        imageAlign: {
            title: ({
                "zh-TW": "圖片預設對齊位置",
                "zh-CN": "图片默认对齐位置",
                "en": "Image default alignment",
                "ru": "Выравнивание изображения",
                "ja": "画像のデフォルトアライメント",
            } satisfies LocalizedText),
            center: ({
                "zh-TW": "中央",
                "zh-CN": "中央",
                "en": "Center",
                "ru": "По центру",
                "ja": "中央",
            } satisfies LocalizedText),
            topLeft: ({
                "zh-TW": "左上",
                "zh-CN": "左上",
                "en": "Top Left",
                "ru": "Слева вверху",
                "ja": "左上",
            } satisfies LocalizedText),
            top: ({
                "zh-TW": "上",
                "zh-CN": "上",
                "en": "Top",
                "ru": "Сверху",
                "ja": "上",
            } satisfies LocalizedText),
            topRight: ({
                "zh-TW": "右上",
                "zh-CN": "右上",
                "en": "Top Right",
                "ru": "Справа вверху",
                "ja": "右上",
            } satisfies LocalizedText),
            right: ({
                "zh-TW": "右",
                "zh-CN": "右",
                "en": "Right",
                "ru": "Справа",
                "ja": "右",
            } satisfies LocalizedText),
            bottomRight: ({
                "zh-TW": "右下",
                "zh-CN": "右下",
                "en": "Bottom Right",
                "ru": "Справа внизу",
                "ja": "右下",
            } satisfies LocalizedText),
            bottom: ({
                "zh-TW": "下",
                "zh-CN": "下",
                "en": "Bottom",
                "ru": "Снизу",
                "ja": "下",
            } satisfies LocalizedText),
            bottomLeft: ({
                "zh-TW": "左下",
                "zh-CN": "左下",
                "en": "Bottom Left",
                "ru": "Слева внизу",
                "ja": "左下",
            } satisfies LocalizedText),
            left: ({
                "zh-TW": "左",
                "zh-CN": "左",
                "en": "Left",
                "ru": "Слева",
                "ja": "左",
            } satisfies LocalizedText),
        },

        // 預設排序
        sortMode: {
            title: ({
                "zh-TW": "預設排序",
                "zh-CN": "默认排序",
                "en": "Default Sort",
                "ru": "Сортировка по умолчанию",
                "ja": "デフォルトのソート",
            } satisfies LocalizedText),
            fileDefaultSort: ({
                "zh-TW": "檔案預設排序",
                "zh-CN": "文件默认排序",
                "en": "File default sort",
                "ru": "Сортировка файлов",
                "ja": "ファイルのデフォルトソート",
            } satisfies LocalizedText),
            directoryDefaultSort: ({
                "zh-TW": "資料夾預設排序",
                "zh-CN": "文件夹默认排序",
                "en": "Folder default sort",
                "ru": "Сортировка папок",
                "ja": "フォルダのデフォルトソート",
            } satisfies LocalizedText),
            name: ({
                "zh-TW": "檔名",
                "zh-CN": "文件名",
                "en": "File Name",
                "ru": "Имя файла",
                "ja": "ファイル名",
            } satisfies LocalizedText),
            nameDesc: ({
                "zh-TW": "檔名 (遞減)",
                "zh-CN": "文件名 (降序)",
                "en": "File Name (Desc)",
                "ru": "Имя файла (по убыванию)",
                "ja": "ファイル名 (降順)",
            } satisfies LocalizedText),
            lastWriteTime: ({
                "zh-TW": "修改日期",
                "zh-CN": "修改日期",
                "en": "Last Write Time",
                "ru": "Дата изменения",
                "ja": "更新日時",
            } satisfies LocalizedText),
            lastWriteTimeDesc: ({
                "zh-TW": "修改日期 (遞減)",
                "zh-CN": "修改日期 (降序)",
                "en": "Last Write Time (Desc)",
                "ru": "Дата изменения (по убыванию)",
                "ja": "更新日時 (降順)",
            } satisfies LocalizedText),
            lastAccessTime: ({
                "zh-TW": "存取日期",
                "zh-CN": "访问日期",
                "en": "Last Access Time",
                "ru": "Дата доступа",
                "ja": "アクセス日時",
            } satisfies LocalizedText),
            lastAccessTimeDesc: ({
                "zh-TW": "存取日期 (遞減)",
                "zh-CN": "访问日期 (降序)",
                "en": "Last Access Time (Desc)",
                "ru": "Дата доступа (по убыванию)",
                "ja": "アクセス日時 (降順)",
            } satisfies LocalizedText),
            creationTime: ({
                "zh-TW": "建立日期",
                "zh-CN": "创建日期",
                "en": "Creation time",
                "ru": "Дата создания",
                "ja": "作成日時",
            } satisfies LocalizedText),
            creationTimeDesc: ({
                "zh-TW": "建立日期 (遞減)",
                "zh-CN": "创建日期 (降序)",
                "en": "Creation Time (Desc)",
                "ru": "Дата создания (по убыванию)",
                "ja": "作成日時 (降順)",
            } satisfies LocalizedText),
            length: ({
                "zh-TW": "檔案大小",
                "zh-CN": "文件大小",
                "en": "File Size",
                "ru": "Размер файла",
                "ja": "ファイルサイズ",
            } satisfies LocalizedText),
            lengthDesc: ({
                "zh-TW": "檔案大小 (遞減)",
                "zh-CN": "文件大小 (降序)",
                "en": "File Size (Desc)",
                "ru": "Размер файла (по убыванию)",
                "ja": "ファイルサイズ (降順)",
            } satisfies LocalizedText),
            random: ({
                "zh-TW": "隨機",
                "zh-CN": "随机",
                "en": "Random",
                "ru": "В случайном порядке",
                "ja": "ランダム",
            } satisfies LocalizedText),
        },

        //啟動模式
        startupMode: {
            title: ({
                "zh-TW": "啟動模式",
                "zh-CN": "启动模式",
                "en": "Startup Mode",
                "ru": "Режим запуска",
                "ja": "起動モード",
            } satisfies LocalizedText),

            mode_1: ({
                "zh-TW": "直接啟動",
                "zh-CN": "直接启动",
                "en": "Normal Startup",
                "ru": "Обычный запуск",
                "ja": "通常起動",
            } satisfies LocalizedText),
            mode_2: ({
                "zh-TW": "快速啟動",
                "zh-CN": "快速启动",
                "en": "Fast Startup",
                "ru": "Быстрый запуск",
                "ja": "高速起動",
            } satisfies LocalizedText),
            mode_3: ({
                "zh-TW": "快速啟動 + 常駐背景",
                "zh-CN": "快速启动 + 常驻后台",
                "en": "Fast Startup + Background Task",
                "ru": "Быстрый запуск + фон",
                "ja": "高速起動 + バックグラウンドに常駐",
            } satisfies LocalizedText),
            mode_4: ({
                "zh-TW": "只允許一個 Tiefsee",
                "zh-CN": "只允许一个 Tiefsee",
                "en": "Single Instances",
                "ru": "Один экземпляр Tiefsee",
                "ja": "複数の Tiefsee を起動しない",
            } satisfies LocalizedText),
            mode_5: ({
                "zh-TW": "只允許一個 Tiefsee + 常駐背景",
                "zh-CN": "只允许一个 Tiefsee + 常驻后台",
                "en": "Single Instances + Background Task",
                "ru": "Один экземпляр + фон",
                "ja": "複数の Tiefsee を起動しない + バックグラウンドに常駐",
            } satisfies LocalizedText),

            tooltip_1: ({
                "zh-TW": "每個 Tiefsee 視窗都是一個新的執行個體，需要較長的啟動時間",
                "zh-CN": "每个 Tiefsee 窗口都是一个新的执行实例，需要较长的启动时间",
                "en": "Each Tiefsee window is a new instances, the startup speed is slower",
                "ru": "Каждое окно Tiefsee запускается в отдельном экземпляре, поэтому запуск занимает больше времени.",
                "ja": "Tiefsee ウィンドウはそれぞれ新しいインスタンスであるため、起動速度が遅くなる",
            } satisfies LocalizedText),
            tooltip_2: ({
                "zh-TW": "所有的 Tiefsee 共用同一個執行個體。只要 Tiefsee 的視窗尚未全部關閉，就能快速啟動 Tiefsee",
                "zh-CN": "所有的 Tiefsee 共用同一个执行实例。只要 Tiefsee 的窗口尚未全部关闭，就能快速启动 Tiefsee",
                "en": "All Tiefsee window share the same instances. As long as the Tiefsee window is not all closed, you can quickly startup Tiefsee",
                "ru": "Все окна Tiefsee используют один экземпляр программы. Пока открыто хотя бы одно окно, новые окна запускаются быстрее.",
                "ja": `すべての Tiefsee ウィンドウは同じインスタンスを共有しています。Tiefsee ウィンドウが閉じていない限り、Tiefsee を高速起動することができます`,
            } satisfies LocalizedText),
            tooltip_3: ({
                "zh-TW": "所有視窗共用同一個執行個體。Tiefsee 會常駐在背景，隨時都能以極快的速度啟動",
                "zh-CN": "所有窗口共用同一个执行实例。Tiefsee 会常驻在后台，随时都能以极快的速度启动",
                "en": `All Tiefsee window share the same instances. Tiefsee will Running in the background, you can quickly startup Tiefsee at any time`,
                "ru": "Все окна используют один экземпляр программы. Tiefsee остаётся работать в фоновом режиме, поэтому его можно быстро открыть в любое время.",
                "ja": `Tiefsee のウィンドウはすべて同じインスタンスを共有しています。Tiefsee はバックグラウンドで動作し、いつでも高速起動が可能です`,
            } satisfies LocalizedText),
            tooltip_4: ({
                "zh-TW": "只允許存在一個 Tiefsee 視窗",
                "zh-CN": "只允许存在一个 Tiefsee 窗口",
                "en": "Not allowed to have multiple Tiefsee window",
                "ru": "Разрешено только одно окно Tiefsee.",
                "ja": "複数の Tiefsee ウィンドウを持つことはできません",
            } satisfies LocalizedText),
            tooltip_5: ({
                "zh-TW": "只允許存在一個 Tiefsee 視窗。程式會常駐在背景，隨時都能以極快的速度啟動",
                "zh-CN": "只允许存在一个 Tiefsee 窗口。程序会常驻在后台，随时都能以极快的速度启动",
                "en": `
                    Not allowed to have multiple Tiefsee window.<br>
                    Tiefsee will Running in the background, you can quickly startup Tiefsee at any time
                    `,
                "ru": "Разрешено только одно окно Tiefsee. Программа остаётся работать в фоновом режиме и быстро открывается в любое время.",
                "ja": `
                    複数の Tiefsee ウィンドウを持つことはできません。<br>
                    Tiefsee はバックグラウンドで動作し、いつでも高速起動が可能です
                `,
            } satisfies LocalizedText),
        },

        //開機後自動啟動
        startupRunTiefsee: {
            title: ({
                "zh-TW": "開機後自動啟動",
                "zh-CN": "开机后自动启动",
                "en": "Start with OS",
                "ru": "Запускать при входе в Windows",
                "ja": "OSの起動後に自動で起動",
            } satisfies LocalizedText),
            subtitle: ({
                "zh-TW": "電腦開機後，讓 Tiefsee 常駐在背景 (啟動模式必須是「常駐背景」才會生效)",
                "zh-CN": "电脑开机后，让 Tiefsee 常驻在后台 (启动模式必须是「常驻后台」才会生效)",
                "en": "After the computer is turned on, let Tiefsee Running in the background",
                "ru": "После запуска Windows Tiefsee останется работать в фоновом режиме. Для этого выберите соответствующий режим запуска.",
                "ja": "パソコンの電源を入れた後、バックグラウンドで Tiefsee を起動させます",
            } satisfies LocalizedText),
            openStartup: ({
                "zh-TW": "開啟 Windows 的「Startup」",
                "zh-CN": "开启 Windows 的「Startup」",
                "en": `Open Windows "Startup"`,
                "ru": "Открыть автозагрузку",
                "ja": "Windows の「Startup」を開く",
            } satisfies LocalizedText),
        },

        //其他
        other: {
            title: ({
                "zh-TW": "其他",
                "zh-CN": "其他",
                "en": "Other",
                "ru": "Другое",
                "ja": "その他",
            } satisfies LocalizedText),
            checkerboardBackground: ({
                "zh-TW": "使用格子背景",
                "zh-CN": "使用格子背景",
                "en": "Use checkerboard background",
                "ru": "Шахматный фон",
                "ja": "市松模様の背景を使用する",
            } satisfies LocalizedText),
            rawImageThumbnail: ({
                "zh-TW": "開啟 RAW 圖片時，顯示內嵌的預覽圖",
                "zh-CN": "开启 RAW 图片时，显示内嵌的预览图",
                "en": "Show embedded preview when opening RAW image",
                "ru": "Показывать встроенную миниатюру RAW-файла",
                "ja": "RAW 画像を開くときに埋め込みプレビューを表示する",
            } satisfies LocalizedText),

            archiveLoadMode: ({
                "zh-TW": "載入壓縮檔時",
                "zh-CN": "加载压缩文件时",
                "en": "When loading an archive",
                "ru": "При открытии архива",
                "ja": "圧縮ファイルを読み込むとき",
            } satisfies LocalizedText),
            archiveLoadModeImageOnly: ({
                "zh-TW": "僅瀏覽圖片",
                "zh-CN": "仅浏览图片",
                "en": "Browse images only",
                "ru": "Только изображения",
                "ja": "画像のみ閲覧する",
            } satisfies LocalizedText),
            archiveLoadModeAllFiles: ({
                "zh-TW": "瀏覽所有檔案",
                "zh-CN": "浏览所有文件",
                "en": "Browse all files",
                "ru": "Показывать все файлы",
                "ja": "すべてのファイルを閲覧する",
            } satisfies LocalizedText),


            displayDeleteConfirmationDialog: ({
                "zh-TW": "檔案刪除前顯示確認視窗",
                "zh-CN": "文件删除前显示确认窗口",
                "en": "Display Delete confirmation dialog",
                "ru": "Подтверждать удаление файла",
                "ja": "削除の確認メッセージを表示する",
            } satisfies LocalizedText),
            whenInsertingFile: ({
                "zh-TW": "偵測到檔案新增時，插入於",
                "zh-CN": "检测到文件新增时，插入于",
                "en": "When a new file is detected, insert it at",
                "ru": "Добавлять новый файл в",
                "ja": "新しいファイルが検出されたとき、挿入する場所",
            } satisfies LocalizedText),
            auto: ({
                "zh-TW": "自動",
                "zh-CN": "自动",
                "en": "Auto",
                "ru": "Автоматически",
                "ja": "自動",
            } satisfies LocalizedText),
            start: ({
                "zh-TW": "最前面",
                "zh-CN": "最前面",
                "en": "Insert to the start",
                "ru": "В начало",
                "ja": "先頭に挿入",
            } satisfies LocalizedText),
            end: ({
                "zh-TW": "最後面",
                "zh-CN": "最后面",
                "en": "Insert to the end",
                "ru": "В конец",
                "ja": "最後に挿入",
            } satisfies LocalizedText),

            reachLastFile: ({
                "zh-TW": "到達最後一個檔案時",
                "zh-CN": "到达最后一个文件时",
                "en": "When reaching the last file",
                "ru": "При достижении конца",
                "ja": "最後のファイルに到達したとき",
            } satisfies LocalizedText),
            doNothing: ({
                "zh-TW": "不做任何事情",
                "zh-CN": "不做任何事情",
                "en": "Do nothing",
                "ru": "Ничего не делать",
                "ja": "何もしない",
            } satisfies LocalizedText),
            firstFile: ({
                "zh-TW": "回到第一個檔案",
                "zh-CN": "回到第一个文件",
                "en": "Back to the first file",
                "ru": "Перейти к первому файлу",
                "ja": "最初のファイルに戻る",
            } satisfies LocalizedText),
            nextDir: ({
                "zh-TW": "前往下一個資料夾",
                "zh-CN": "前往下一个文件夹",
                "en": "Go to the next folder",
                "ru": "Перейти к следующей папке",
                "ja": "次のフォルダに移動",
            } satisfies LocalizedText),
            noneWithPrompt: ({
                "zh-TW": "不做任何事情，並顯示提示",
                "zh-CN": "不做任何事情，并显示提示",
                "en": "Do nothing and show prompt",
                "ru": "Ничего не делать и показать уведомление",
                "ja": "何もせず、プロンプトを表示する",
            } satisfies LocalizedText),
            firstFileWithPrompt: ({
                "zh-TW": "回到第一個檔案，並顯示提示",
                "zh-CN": "回到第一个文件，并显示提示",
                "en": "Back to the first file and show prompt",
                "ru": "Перейти к первому файлу и показать уведомление",
                "ja": "最初のファイルに戻り、プロンプトを表示する",
            } satisfies LocalizedText),
            nextDirWithPrompt: ({
                "zh-TW": "前往下一個資料夾，並顯示提示",
                "zh-CN": "前往下一个文件夹，并显示提示",
                "en": "Go to the next folder and show prompt",
                "ru": "Перейти к следующей папке и показать уведомление",
                "ja": "次のフォルダに移動し、プロンプトを表示する",
            } satisfies LocalizedText),

            reachLastDir: ({
                "zh-TW": "到達最後一個資料夾時",
                "zh-CN": "到达最后一个文件夹时",
                "en": "When reaching the last folder",
                "ru": "При переходе к последней папке",
                "ja": "最後のフォルダに到達したとき",
            } satisfies LocalizedText),
            firstDir: ({
                "zh-TW": "回到第一個資料夾",
                "zh-CN": "回到第一个文件夹",
                "en": "Back to the first folder",
                "ru": "Перейти к первой папке",
                "ja": "最初のフォルダに戻る",
            } satisfies LocalizedText),
            firstDirWithPrompt: ({
                "zh-TW": "回到第一個資料夾，並顯示提示",
                "zh-CN": "回到第一个文件夹，并显示提示",
                "en": "Back to the first folder and show prompt",
                "ru": "Перейти к первой папке и показать уведомление",
                "ja": "最初のフォルダに戻り、プロンプトを表示する",
            } satisfies LocalizedText),

            enableTouchpadGestures: ({
                "zh-TW": "啟用觸控板手勢",
                "zh-CN": "启用触控板手势",
                "en": "Enable touchpad gestures",
                "ru": "Включить жесты сенсорной панели",
                "ja": "タッチパッドジェスチャを有効にする",
            } satisfies LocalizedText),
            enableTouchpadGesturesTooltip: ({
                "zh-TW": `
                    1. 雙指滑動：移動圖片<br>
                    2. 雙指捏合：縮放圖片<br>
                    (啟用後可能與滑鼠滾輪衝突)
                `,
                "zh-CN": `
                    1. 双指滑动：移动图片<br>
                    2. 双指捏合：缩放图片<br>
                    (启用后可能与鼠标滚轮冲突)
                `,
                "en": `
                    1. Two-finger swipe: Move the image<br>
                    2. Two-finger pinch: Zoom the image<br>
                    (May conflict with mouse wheel after enabling)
                `,
                "ru": `
                    1. Проведите двумя пальцами, чтобы переместить изображение.<br>
                    2. Сведите или разведите пальцы, чтобы изменить масштаб изображения.<br>
                    (При включении этой функции жесты могут конфликтовать с прокруткой колёсиком мыши.)
                `,
                "ja": `
                    1. 2本指スワイプ：画像を移動する<br>
                    2. 2本指ピンチ：画像をズームする<br>
                    (有効にした後、マウスホイールと競合する可能性があります)
                `,
            } satisfies LocalizedText),

            filePanelMouseWheel: ({
                "zh-TW": "在檔案預覽面板透過滑鼠滾輪切換圖片",
                "zh-CN": "在文件预览面板通过鼠标滚轮切换图片",
                "en": "Switch images with the mouse wheel over the file preview panel",
                "ru": "Переключать изображения колесом мыши над панелью просмотра файлов",
                "ja": "ファイルプレビューパネル上でマウスホイールを使って画像を切り替える",
            } satisfies LocalizedText),
            filePanelMouseWheelNone: ({
                "zh-TW": "不啟用",
                "zh-CN": "不启用",
                "en": "Disabled",
                "ru": "Отключено",
                "ja": "無効",
            } satisfies LocalizedText),
            filePanelMouseWheelEnable: ({
                "zh-TW": "啟用",
                "zh-CN": "启用",
                "en": "Enabled",
                "ru": "Включить",
                "ja": "有効",
            } satisfies LocalizedText),
            filePanelMouseWheelReverse: ({
                "zh-TW": "啟用（反向）",
                "zh-CN": "启用（反向）",
                "en": "Enabled (reverse)",
                "ru": "Включено (в обратном направлении)",
                "ja": "有効（反転）",
            } satisfies LocalizedText),

        },

        //#endregion

        //#region 外觀

        //主題
        theme: {
            defaultTheme: ({
                "zh-TW": "主題",
                "zh-CN": "主题",
                "en": " Theme",
                "ru": "Тема",
                "ja": "テーマ",
            } satisfies LocalizedText),
            darkTheme: ({
                "zh-TW": "深色主題",
                "zh-CN": "深色主题",
                "en": "Dark Theme",
                "ru": "Тёмная тема",
                "ja": "ダークテーマ",
            } satisfies LocalizedText),
            lightTheme: ({
                "zh-TW": "淺色主題",
                "zh-CN": "浅色主题",
                "en": "Light Theme",
                "ru": "Светлая тема",
                "ja": "ライトテーマ",
            } satisfies LocalizedText),
            customTheme: ({
                "zh-TW": "自訂主題",
                "zh-CN": "自定义主题",
                "en": "Custom Theme",
                "ru": "Пользовательская тема",
                "ja": "カスタムテーマ",
            } satisfies LocalizedText),
            windowBackgroundColor: ({
                "zh-TW": "視窗背景色",
                "zh-CN": "窗口背景色",
                "en": "Window background color",
                "ru": "Цвет фона окна",
                "ja": "ウィンドウの背景色",
            } satisfies LocalizedText),
            windowBorderColor: ({
                "zh-TW": "視窗邊框色",
                "zh-CN": "窗口边框色",
                "en": "Window border color",
                "ru": "Цвет границы окна",
                "ja": "ウィンドウのボーダー色",
            } satisfies LocalizedText),
            textColor: ({
                "zh-TW": "文字顏色",
                "zh-CN": "文字颜色",
                "en": "Text color",
                "ru": "Цвет текста",
                "ja": "テキスト色",
            } satisfies LocalizedText),
            accentColor: ({
                "zh-TW": "強調顏色",
                "zh-CN": "强调颜色",
                "en": "Accent color",
                "ru": "Цвет акцента",
                "ja": "アクセント色",
            } satisfies LocalizedText),
            blockColor: ({
                "zh-TW": "區塊底色",
                "zh-CN": "区块底色",
                "en": "Block color",
                "ru": "Цвет фона блока",
                "ja": "ブロックの色",
            } satisfies LocalizedText),
        },

        //文字與圖示
        textAndIcon: {
            title: ({
                "zh-TW": "文字與圖示",
                "zh-CN": "文字与图标",
                "en": "Text and Icon",
                "ru": "Текст и значки",
                "ja": "テキストとアイコン",
            } satisfies LocalizedText),

            textStrokeWidth: ({
                "zh-TW": "文字粗細",
                "zh-CN": "文字粗细",
                "en": "Text stroke width",
                "ru": "Толщина текста",
                "ja": "テキストストロークの幅",
            } satisfies LocalizedText),
            text_1: ({
                "zh-TW": "1(最細)",
                "zh-CN": "1(最细)",
                "en": "1 (Thin)",
                "ru": "1 (тонкий)",
                "ja": "1 (シン)",
            } satisfies LocalizedText),
            text_4: ({
                "zh-TW": "4(預設)",
                "zh-CN": "4(默认)",
                "en": "4 (Default)",
                "ru": "4 (по умолчанию)",
                "ja": "4 (デフォルト)",
            } satisfies LocalizedText),
            text_9: ({
                "zh-TW": "9(最粗)",
                "zh-CN": "9(最粗)",
                "en": "9 (Bold)",
                "ru": "9 (жирный)",
                "ja": "9 (太字)",
            } satisfies LocalizedText),

            iconStrokeWidth: ({
                "zh-TW": "圖示粗細",
                "zh-CN": "图标粗细",
                "en": "Icon stroke width",
                "ru": "Толщина значков",
                "ja": "アイコンのストローク幅",
            } satisfies LocalizedText),
            icon_0: ({
                "zh-TW": "0(最細、預設)",
                "zh-CN": "0(最细、默认)",
                "en": "0 (Thin, Default)",
                "ru": "0 (тонкий, по умолчанию)",
                "ja": "0 (シン、デフォルト)",
            } satisfies LocalizedText),
            icon_10: ({
                "zh-TW": "10(最粗)",
                "zh-CN": "10(最粗)",
                "en": "10 (Bold)",
                "ru": "10 (жирный)",
                "ja": "10 (太字)",
            } satisfies LocalizedText),
        },

        // 視窗設定
        windowSetting: {
            title: ({
                "zh-TW": "視窗設定",
                "zh-CN": "窗口设置",
                "en": "Window Setting",
                "ru": "Настройки окна",
                "ja": "ウィンドウの設定",
            } satisfies LocalizedText),
            zoom: ({
                "zh-TW": "視窗縮放 (0.5 ~ 3.0)",
                "zh-CN": "窗口缩放 (0.5 ~ 3.0)",
                "en": "Window zoom (0.5 ~ 3.0)",
                "ru": "Масштаб окна (0,5–3,0)",
                "ja": "ウィンドウの拡大縮小 (0.5 ~ 3.0)",
            } satisfies LocalizedText),
            roundedCorners: ({
                "zh-TW": "視窗圓角 (0 ~ 15)",
                "zh-CN": "窗口圆角 (0 ~ 15)",
                "en": "Window rounded corners (0 ~ 15)",
                "ru": "Скругление углов окна (0–15)",
                "ja": "ウィンドウの円角 (0 ~ 15)",
            } satisfies LocalizedText),
            windowStyle: ({
                "zh-TW": "視窗效果",
                "zh-CN": "窗口效果",
                "en": " Window effect",
                "ru": "Оформление окна",
                "ja": "ウィンドウ効果",
            } satisfies LocalizedText),

            tooltip: ({
                "zh-TW": `
                    修改此選項後，還必須調整「視窗背景色」的透明度，才能達到最佳視覺效果
                `,
                "zh-CN": `
                    修改此选项后，还必须调整「窗口背景色」的透明度，才能达到最佳视觉效果
                `,
                "en": `
                    After changing this option, you must also adjust the transparency of the "Window background color" to achieve the best visual effect
                `,
                "ru": "После изменения этого параметра настройте прозрачность фона окна, чтобы добиться нужного эффекта.",
                "ja": `
                    このオプションを変更した後、最適な視覚効果を得るために「ウィンドウの背景色」の透明度も調整する必要があります
                `,
            } satisfies LocalizedText),
            applySuggestedColor: ({
                "zh-TW": "套用建議配色",
                "zh-CN": "套用建议配色",
                "en": "Apply Suggested Color",
                "ru": "Применить рекомендуемые цвета",
                "ja": "提案された色を適用",
            } satisfies LocalizedText),
        },

        //#endregion

        //#region layout

        // 檔案預覽面板
        filePanel: {
            title: ({
                "zh-TW": "檔案預覽面板",
                "zh-CN": "文件预览面板",
                "en": "File Panel",
                "ru": "Панель просмотра файлов",
                "ja": "ファイルパネル",
            } satisfies LocalizedText),
            resizeWidth: ({
                "zh-TW": "調整檔案預覽面板寬度",
                "zh-CN": "调整文件预览面板宽度",
                "en": "Resize file preview panel width",
                "ru": "Изменить ширину панели просмотра файлов",
                "ja": "ファイルパネルの幅を調整",
            } satisfies LocalizedText),
            displayPanel: ({
                "zh-TW": "顯示檔案預覽面板",
                "zh-CN": "显示文件预览面板",
                "en": "Display file panel",
                "ru": "Показывать панель просмотра файлов",
                "ja": "ファイルパネルを表示する",
            } satisfies LocalizedText),
            displayNumber: ({
                "zh-TW": "顯示編號",
                "zh-CN": "显示编号",
                "en": "Display number",
                "ru": "Показывать номер",
                "ja": "番号を表示する",
            } satisfies LocalizedText),
            displayName: ({
                "zh-TW": "顯示檔名",
                "zh-CN": "显示文件名",
                "en": "Display file name",
                "ru": "Показывать имя файла",
                "ja": "ファイル名を表示する",
            } satisfies LocalizedText),
        },

        // 資料夾預覽面板
        directoryPanel: {
            title: ({
                "zh-TW": "資料夾預覽面板",
                "zh-CN": "文件夹预览面板",
                "en": "Folder Panel",
                "ru": "Панель просмотра папок",
                "ja": "フォルダパネル",
            } satisfies LocalizedText),
            resizeWidth: ({
                "zh-TW": "調整資料夾預覽面板寬度",
                "zh-CN": "调整文件夹预览面板宽度",
                "en": "Resize folder preview panel width",
                "ru": "Изменить ширину панели просмотра папок",
                "ja": "フォルダパネルの幅を調整",
            } satisfies LocalizedText),
            displayPanel: ({
                "zh-TW": "顯示資料夾預覽面板",
                "zh-CN": "显示文件夹预览面板",
                "en": "Display folder panel",
                "ru": "Показывать панель просмотра папок",
                "ja": "フォルダパネルを表示する",
            } satisfies LocalizedText),
            displayNumber: ({
                "zh-TW": "顯示編號",
                "zh-CN": "显示编号",
                "en": "Display number",
                "ru": "Показывать номер",
                "ja": "番号を表示する",
            } satisfies LocalizedText),
            displayName: ({
                "zh-TW": "顯示資料夾名",
                "zh-CN": "显示文件夹名",
                "en": "Display folder name",
                "ru": "Показывать имя папки",
                "ja": "フォルダ名を表示する",
            } satisfies LocalizedText),
            numberOfImages: ({
                "zh-TW": "圖片數量",
                "zh-CN": "图片数量",
                "en": "Number of images",
                "ru": "Количество изображений",
                "ja": "画像枚数",
            } satisfies LocalizedText),
        },

        // 詳細資料面板
        informationPanel: {
            title: ({
                "zh-TW": "詳細資料面板",
                "zh-CN": "详细信息面板",
                "en": "Information Panel",
                "ru": "Панель сведений",
                "ja": "情報パネル",
            } satisfies LocalizedText),
            resizeWidth: ({
                "zh-TW": "調整詳細資料面板寬度",
                "zh-CN": "调整详细信息面板宽度",
                "en": "Resize information panel width",
                "ru": "Изменить ширину панели сведений",
                "ja": "情報パネルの幅を調整",
            } satisfies LocalizedText),
            displayPanel: ({
                "zh-TW": "顯示詳細資料面板",
                "zh-CN": "显示详细信息面板",
                "en": "Display information panel",
                "ru": "Показывать панель сведений",
                "ja": "情報パネルを表示する",
            } satisfies LocalizedText),
            maxLine: ({
                "zh-TW": "顯示的最大行數 (1~1000)",
                "zh-CN": "显示的最大行数 (1~1000)",
                "en": "Maximum number of lines displayed (1~1000)",
                "ru": "Максимальное число строк (1–1000)",
                "ja": "最大表示行数 (1~1000)",
            } satisfies LocalizedText),
            a1111Models: ({
                "zh-TW": "A1111 models 路徑",
                "zh-CN": "A1111 models 路径",
                "en": "A1111 models path",
                "ru": "Путь к моделям A1111",
                "ja": "A1111 models パス",
            } satisfies LocalizedText),
            a1111ModelsTooltip: ({
                "zh-TW": `
                    指定 A1111 models 的路徑後，Prompt 裡面的 &lt;LoRA&gt; 就能顯示預覽圖。 <br>
                    如果有多個路徑，則一行一個路徑。
                `,
                "zh-CN": `
                    指定 A1111 models 的路径后，Prompt 里面的 &lt;LoRA&gt; 就能显示预览图。 <br>
                    如果有多个路径，则一行一个路径。
                `,
                "en": `
                    After specifying the path of A1111 models, the preview image of &lt;LoRA&gt; in the Prompt can be displayed. <br>
                    If there are multiple paths, one path per line.
                `,
                "ru": `
                    Укажите путь к моделям A1111, чтобы показывать миниатюры LoRA.<br>
                    Если путей несколько, укажите каждый с новой строки.
                `,
                "ja": `
                    A1111モデルのパスを指定すると、プロンプト内の&lt;LoRA&gt;のプレビュー画像が表示されます。 <br>
                    複数のパスがある場合は、1行に1つのパスを記載してください。
                `,
            } satisfies LocalizedText),
            horizontal: ({
                "zh-TW": "寬度足夠時，橫向排列",
                "zh-CN": "宽度足够时，横向排列",
                "en": "Horizontal arrangement when width enough",
                "ru": "Горизонтально при достаточной ширине",
                "ja": "横幅配置、幅の十分なとき",
            } satisfies LocalizedText),
            relatedFiles: ({
                "zh-TW": "顯示相關檔案",
                "zh-CN": "显示相关文件",
                "en": "Display related files",
                "ru": "Показывать связанные файлы",
                "ja": "関連ファイルを表示"
            } satisfies LocalizedText),
            relatedFilesTooltip: ({
                "zh-TW": `自動找出相同檔名的檔案。<br> 例如 "dog.jpg", "dog.txt", "dog.preview.png"`,
                "zh-CN": `自动找出相同文件名的文件。<br> 例如 "dog.jpg", "dog.txt", "dog.preview.png"`,
                "en": `Automatically find files with the same file name. <br> For example, "dog.jpg", "dog.txt", "dog.preview.png"`,
                "ru": "Автоматически находить файлы с одинаковым именем, например dog.jpg, dog.txt и dog.preview.png.",
                "ja": `同じファイル名のファイルを自動的に見つけます。<br> 例えば、"dog.jpg", "dog.txt", "dog.preview.png"`
            } satisfies LocalizedText),

            civitaiResourcesEnabled: ({
                "zh-TW": `顯示 Civitai Resources`,
                "zh-CN": `显示 Civitai Resources`,
                "en": `Display Civitai Resources`,
                "ru": "Показывать сведения о ресурсах Civitai",
                "ja": `Civitai Resources を表示する`
            } satisfies LocalizedText),
            civitaiResourcesDefault: ({
                "zh-TW": `圖片預設狀態`,
                "zh-CN": `图片默认状态`,
                "en": `Default image state`,
                "ru": "Состояние по умолчанию",
                "ja": `画像のデフォルト状態`,
            } satisfies LocalizedText),
            civitaiResourcesImgNumber: ({
                "zh-TW": `圖片數量`,
                "zh-CN": `图片数量`,
                "en": `Number of images`,
                "ru": "Число изображений",
                "ja": `画像の数`,
            } satisfies LocalizedText),
            civitaiResourcesDomain: ({
                "zh-TW": `Civitai 網域`,
                "zh-CN": `Civitai 域名`,
                "en": `Civitai domain`,
                "ru": "Домен Civitai",
                "ja": `Civitai ドメイン`,
            } satisfies LocalizedText),
            civitaiResourcesNsfwLevel: ({
                "zh-TW": `允許 NSFW 圖片`,
                "zh-CN": `允许 NSFW 图片`,
                "en": `Allow NSFW images`,
                "ru": "Уровень NSFW-контента",
                "ja": `NSFW 画像を許可する`,
            } satisfies LocalizedText),
        },

        // 工具列
        mainToolbar: {
            title: ({
                "zh-TW": "工具列",
                "zh-CN": "工具条",
                "en": "Toolbar",
                "ru": "Панель инструментов",
                "ja": "ツールバー",
            } satisfies LocalizedText),
            displayPanel: ({
                "zh-TW": "顯示工具列",
                "zh-CN": "显示工具条",
                "en": "Display toolbar",
                "ru": "Показать панель инструментов",
                "ja": "ツールバーを表示する",
            } satisfies LocalizedText),
            toolbarAlignment: ({
                "zh-TW": "工具列對齊",
                "zh-CN": "工具条对齐",
                "en": "Toolbar alignment",
                "ru": "Выравнивание панели инструментов",
                "ja": "ツールバーの配置",
            } satisfies LocalizedText),
            left: ({
                "zh-TW": "靠左",
                "zh-CN": "靠左",
                "en": "Left",
                "ru": "Слева",
                "ja": "左",
            } satisfies LocalizedText),
            center: ({
                "zh-TW": "置中",
                "zh-CN": "居中",
                "en": "Center",
                "ru": "По центру",
                "ja": "中央",
            } satisfies LocalizedText),
        },

        //大型切換按鈕
        largeBtn: {
            title: ({
                "zh-TW": "大型選擇按鈕",
                "zh-CN": "大型选择按钮",
                "en": "Large Select Button",
                "ru": "Большая кнопка выбора",
                "ja": "大型セレクトボタン",
            } satisfies LocalizedText),
            noDisplay: ({
                "zh-TW": "不顯示",
                "zh-CN": "不显示",
                "en": "Do not display",
                "ru": "Не показывать",
                "ja": "表示しない",
            } satisfies LocalizedText),
            bottom: ({
                "zh-TW": "底部",
                "zh-CN": "底部",
                "en": "Bottom",
                "ru": "Снизу",
                "ja": "底面",
            } satisfies LocalizedText),
            bothSides: ({
                "zh-TW": "左右兩側",
                "zh-CN": "左右两侧",
                "en": "Both sides",
                "ru": "С обеих сторон",
                "ja": "左右両側",
            } satisfies LocalizedText),
            bothSidesContraction: ({
                "zh-TW": "左右兩側(內縮)",
                "zh-CN": "左右两侧(内缩)",
                "en": "Both sides (contraction)",
                "ru": "С обеих сторон (со сдвигом внутрь)",
                "ja": "左右両側(収縮)",
            } satisfies LocalizedText),
        },

        // 面板順序
        layoutOrder: {
            title: ({
                "zh-TW": "面板順序",
                "zh-CN": "面板顺序",
                "en": "Panel Order",
                "ru": "Порядок панелей",
                "ja": "パネルの順序",
            } satisfies LocalizedText),
            filePanel: "menu.showFilePanel",
            dirPanel: "menu.showDirectoryPanel",
            infoPanel: "menu.showInformationPanel",
            imagePanel: ({
                "zh-TW": "圖片面板",
                "zh-CN": "图片面板",
                "en": "Image Panel",
                "ru": "Панель изображения",
                "ja": "画像パネル",
            } satisfies LocalizedText),
        },

        //#endregion

        //#region 工具列

        //顯示與排序
        customToolbar: {
            resetToolbarPrefix: ({
                "zh-TW": "重設",
                "zh-CN": "重置",
                "en": "Reset ",
                "ru": "Сбросить: ",
                "ja": "リセット：",
            } satisfies LocalizedText),
            title: ({
                "zh-TW": "工具列自訂",
                "zh-CN": "工具栏自定义",
                "en": "Customize Toolbar",
                "ru": "Настройка панели инструментов",
                "ja": "ツールバーのカスタマイズ",
            } satisfies LocalizedText),
            imageToolbar: ({
                "zh-TW": "圖片工具列",
                "zh-CN": "图片工具条",
                "en": "Image Toolbar",
                "ru": "Панель изображения",
                "ja": "画像ツールバー",
            } satisfies LocalizedText),
            officeToolbar: ({
                "zh-TW": "Office 文件工具列",
                "zh-CN": "Office 文件工具条",
                "en": "Office Document Toolbar",
                "ru": "Панель документов Office",
                "ja": "Office 文書ツールバー",
            } satisfies LocalizedText),
            textToolbar: ({
                "zh-TW": "文字工具列",
                "zh-CN": "文字工具条",
                "en": "Text Toolbar",
                "ru": "Панель текста",
                "ja": "テキストツールバー",
            } satisfies LocalizedText),
            bulkViewToolbar: ({
                "zh-TW": "大量瀏覽模式工具列",
                "zh-CN": "批量浏览模式工具条",
                "en": "Bulk View Toolbar",
                "ru": "Панель галереи",
                "ja": "バルクビューツールバー",
            } satisfies LocalizedText),
            welcomeToolbar: ({
                "zh-TW": "歡迎畫面工具列",
                "zh-CN": "欢迎界面工具栏",
                "en": "Welcome Toolbar",
                "ru": "Панель приветственного экрана",
                "ja": "ウェルカム画面ツールバー",
            } satisfies LocalizedText),
            editToolbar: ({
                "zh-TW": "選擇要編輯的工具列",
                "zh-CN": "选择要编辑的工具栏",
                "en": "Choose a toolbar to edit",
                "ru": "Выберите панель для настройки",
                "ja": "編集するツールバーを選択",
            } satisfies LocalizedText),
            available: ({
                "zh-TW": "可用項目",
                "zh-CN": "可用项目",
                "en": "Available items",
                "ru": "Доступные элементы",
                "ja": "使用可能な項目",
            } satisfies LocalizedText),
            tipTitle: ({
                "zh-TW": "操作說明",
                "zh-CN": "操作说明",
                "en": "Instructions",
                "ru": "Инструкция",
                "ja": "操作方法",
            } satisfies LocalizedText),
            tipAdd: ({
                "zh-TW": "把下方項目拖到上方預覽的標題列，或工具列的靠左、置中、靠右區域。",
                "zh-CN": "把下方项目拖到上方预览的标题栏，或工具栏的靠左、居中、靠右区域。",
                "en": "Drag an item from below into the title bar or one of the toolbar's Left, Center, or Right areas.",
                "ru": "Перетащите элемент снизу в область заголовка вверху или в левую, центральную либо правую область панели инструментов.",
                "ja": "下の項目を上のプレビューにドラッグし、タイトルバーまたはツールバーの左・中央・右のエリアに配置します。",
            } satisfies LocalizedText),
            tipMove: ({
                "zh-TW": "在上方預覽拖曳可調整順序；拖回下方可移除。",
                "zh-CN": "在上方预览中拖拽可调整顺序；拖回下方可移除。",
                "en": "Drag an item in the preview to reorder it. Drag it back below to remove it.",
                "ru": "Перетаскивайте элементы в области предварительного просмотра, чтобы изменить порядок. Перетащите элемент вниз, чтобы удалить его.",
                "ja": "プレビュー内でドラッグすると順序を変更できます。下の項目一覧に戻すと削除できます。",
            } satisfies LocalizedText),
            tipReusable: ({
                "zh-TW": "分隔線和空白可以重複加入。",
                "zh-CN": "分隔线和空白可以重复添加。",
                "en": "Separators and spaces can be added more than once.",
                "ru": "Разделители и пустые места можно добавлять несколько раз.",
                "ja": "区切り線と空白は何度でも追加できます。",
            } satisfies LocalizedText),
            tipToolbarSelect: ({
                "zh-TW": "用上方選單切換要編輯的工具列；各工具列分開設定。",
                "zh-CN": "用上方菜单切换要编辑的工具栏；各工具栏分别设置。",
                "en": "Choose a toolbar from the menu above. Each toolbar has its own layout.",
                "ru": "Выберите панель для настройки в меню выше. Настройки каждой панели сохраняются отдельно.",
                "ja": "上のメニューからツールバーを選択して編集します。設定はツールバーごとに保存されます。",
            } satisfies LocalizedText),
            titlebarZone: ({
                "zh-TW": "標題列自訂按鈕",
                "zh-CN": "标题栏自定义按钮",
                "en": "Title bar buttons",
                "ru": "Настраиваемые кнопки заголовка окна",
                "ja": "タイトルバーのボタン",
            } satisfies LocalizedText),
            toolbarZone: ({
                "zh-TW": "主工具列按鈕",
                "zh-CN": "主工具栏按钮",
                "en": "Main toolbar buttons",
                "ru": "Кнопки главной панели инструментов",
                "ja": "メインツールバーのボタン",
            } satisfies LocalizedText),
            leftZone: ({
                "zh-TW": "靠左",
                "zh-CN": "靠左",
                "en": "Left",
                "ru": "Слева",
                "ja": "左寄せ",
            } satisfies LocalizedText),
            centerZone: ({
                "zh-TW": "置中",
                "zh-CN": "居中",
                "en": "Center",
                "ru": "По центру",
                "ja": "中央",
            } satisfies LocalizedText),
            rightZone: ({
                "zh-TW": "靠右",
                "zh-CN": "靠右",
                "en": "Right",
                "ru": "Справа",
                "ja": "右寄せ",
            } satisfies LocalizedText),
            separator: ({
                "zh-TW": "分隔線",
                "zh-CN": "分隔线",
                "en": "Separator",
                "ru": "Разделитель",
                "ja": "区切り線",
            } satisfies LocalizedText),
            spacer: ({
                "zh-TW": "空白",
                "zh-CN": "空白",
                "en": "Space",
                "ru": "Пустое место",
                "ja": "空白",
            } satisfies LocalizedText),
            adjustOrderByDragging: ({
                "zh-TW": "(可拖曳調整順序)",
                "zh-CN": "(可拖拽调整顺序)",
                "en": "(Adjust order by dragging)",
                "ru": "(Перетащите, чтобы изменить порядок)",
                "ja": "(ドラッグで順番を調整)",
            } satisfies LocalizedText),
        },

        //#endregion

        //#region 快捷鍵

        hotkey: {
            restoreDefaultValue: ({
                "zh-TW": "恢復初始值",
                "zh-CN": "恢复初始值",
                "en": "Restore default value",
                "ru": "Восстановить значения по умолчанию",
                "ja": "初期値に戻す",
            } satisfies LocalizedText),
            resetAll: ({
                "zh-TW": "重置所有快速鍵",
                "zh-CN": "重置所有快捷键",
                "en": "Reset all hotkeys",
                "ru": "Сбросить все сочетания клавиш",
                "ja": "すべてのホットキーをリセット",
            } satisfies LocalizedText),
            add: ({
                "zh-TW": "新增",
                "zh-CN": "新增",
                "en": "Add",
                "ru": "Добавить",
                "ja": "追加",
            } satisfies LocalizedText),
            delete: ({
                "zh-TW": "刪除",
                "zh-CN": "删除",
                "en": "Delete",
                "ru": "Удалить",
                "ja": "削除",
            } satisfies LocalizedText),
            tipTitle: ({
                "zh-TW": "操作說明",
                "zh-CN": "操作说明",
                "en": "Instructions",
                "ru": "Инструкция",
                "ja": "操作説明",
            } satisfies LocalizedText),
            tipEdit: ({
                "zh-TW": "點一下快速鍵欄位後，就會開始編輯，直接按下想設定的按鍵即可。",
                "zh-CN": "点一下快捷键栏位后，就会开始编辑，直接按下想设定的按键即可。",
                "en": "Click a hotkey field to start editing, then press the key combination you want to assign.",
                "ru": "Щёлкните поле сочетания клавиш и нажмите нужную клавишу или комбинацию.",
                "ja": "ホットキー欄をクリックすると編集が始まるので、そのまま割り当てたいキーを押してください。",
            } satisfies LocalizedText),
            tipModifier: ({
                "zh-TW": "支援 Ctrl、Shift、Alt 等組合鍵。",
                "zh-CN": "支持 Ctrl、Shift、Alt 等组合键。",
                "en": "Supports combinations such as Ctrl, Shift, and Alt.",
                "ru": "Поддерживаются сочетания с Ctrl, Shift, Alt и другими клавишами.",
                "ja": "Ctrl、Shift、Alt などの組み合わせキーに対応しています。",
            } satisfies LocalizedText),
            tipCombine: ({
                "zh-TW": "同一組按鍵可以綁定到不同設定，會依序一起觸發。",
                "zh-CN": "同一组按键可以绑定到不同设定，会依序一起触发。",
                "en": "The same key combination can be bound to multiple actions, and they will run in sequence.",
                "ru": "Одно сочетание клавиш можно назначить нескольким действиям. Они будут выполнены по порядку.",
                "ja": "同じキーの組み合わせを複数の設定に割り当てることができ、順番に実行されます。",
            } satisfies LocalizedText),
            tipExample: ({
                "zh-TW": "例如「圖片往上」和「圖片往右」同時綁定時，會變成圖片往右上；「下一個檔案」如果綁 5 次，會變成往後切換 5 個檔案。",
                "zh-CN": "例如“图片往上”和“图片往右”同时绑定时，会变成图片往右上；“下一个文件”如果绑 5 次，会变成向后切换 5 个文件。",
                "en": "For example, binding both Move Up and Move Right will move the image diagonally up-right. Binding Next File five times will advance by five files.",
                "ru": "Например, сочетания «Сдвинуть изображение вверх» и «Сдвинуть изображение вправо» вместе сдвинут его по диагонали. Если назначить действие «Следующий файл» пять раз, оно переключит сразу на пять файлов.",
                "ja": "例えば「画像を上へ」と「画像を右へ」を同時に割り当てると、画像は右上へ移動します。「次のファイル」を 5 回割り当てると、5 ファイル先へ進みます。",
            } satisfies LocalizedText),
        },

        //#endregion

        //#region 滑鼠

        mouse: {
            mouseButton: ({
                "zh-TW": "滑鼠按鍵",
                "zh-CN": "鼠标按键",
                "en": "Mouse button",
                "ru": "Кнопка мыши",
                "ja": "マウスボタン"
            } satisfies LocalizedText),
            leftDoubleClick: ({
                "zh-TW": "左鍵雙擊",
                "zh-CN": "左键双击",
                "en": "Left double-click",
                "ru": "Двойной щелчок левой кнопкой мыши",
                "ja": "左ダブルクリック"
            } satisfies LocalizedText),
            scrollWheelButton: ({
                "zh-TW": "滾輪鍵",
                "zh-CN": "滚轮键",
                "en": "Scroll wheel button",
                "ru": "Нажатие колеса мыши",
                "ja": "スクロールホイールボタン"
            } satisfies LocalizedText),
            mouseButton4: ({
                "zh-TW": "滑鼠按鍵 4",
                "zh-CN": "鼠标按键 4",
                "en": "Mouse button 4",
                "ru": "Кнопка мыши 4",
                "ja": "マウスボタン 4"
            } satisfies LocalizedText),
            mouseButton5: ({
                "zh-TW": "滑鼠按鍵 5",
                "zh-CN": "鼠标按键 5",
                "en": "Mouse button 5",
                "ru": "Кнопка мыши 5",
                "ja": "マウスボタン 5"
            } satisfies LocalizedText),
            mouseScrollWheel: ({
                "zh-TW": "滑鼠滾輪",
                "zh-CN": "鼠标滚轮",
                "en": "Mouse scroll wheel",
                "ru": "Колесо мыши",
                "ja": "スクロールホイール"
            } satisfies LocalizedText),
            scrollUp: ({
                "zh-TW": "向上捲動",
                "zh-CN": "向上滚动",
                "en": "Scroll up",
                "ru": "Прокрутка вверх",
                "ja": "上にスクロール"
            } satisfies LocalizedText),
            scrollDown: ({
                "zh-TW": "向下捲動",
                "zh-CN": "向下滚动",
                "en": "Scroll down",
                "ru": "Прокрутка вниз",
                "ja": "下にスクロール"
            } satisfies LocalizedText),
            scrollUpCtrl: ({
                "zh-TW": "Ctrl + 向上捲動",
                "zh-CN": "Ctrl + 向上滚动",
                "en": "Ctrl + Scroll up",
                "ru": "Ctrl + прокрутка вверх",
                "ja": "Ctrl + 上にスクロール"
            } satisfies LocalizedText),
            scrollDownCtrl: ({
                "zh-TW": "Ctrl + 向下捲動",
                "zh-CN": "Ctrl + 向下滚动",
                "en": "Ctrl + Scroll down",
                "ru": "Ctrl + прокрутка вниз",
                "ja": "Ctrl + 下にスクロール"
            } satisfies LocalizedText),
            scrollUpShift: ({
                "zh-TW": "Shift + 向上捲動",
                "zh-CN": "Shift + 向上滚动",
                "en": "Shift + Scroll up",
                "ru": "Shift + прокрутка вверх",
                "ja": "Shift + 上にスクロール"
            } satisfies LocalizedText),
            scrollDownShift: ({
                "zh-TW": "Shift + 向下捲動",
                "zh-CN": "Shift + 向下滚动",
                "en": "Shift + Scroll down",
                "ru": "Shift + прокрутка вниз",
                "ja": "Shift + 下にスクロール"
            } satisfies LocalizedText),
            scrollUpAlt: ({
                "zh-TW": "Alt + 向上捲動",
                "zh-CN": "Alt + 向上滚动",
                "en": "Alt + Scroll up",
                "ru": "Alt + прокрутка вверх",
                "ja": "Alt + 上にスクロール"
            } satisfies LocalizedText),
            scrollDownAlt: ({
                "zh-TW": "Alt + 向下捲動",
                "zh-CN": "Alt + 向下滚动",
                "en": "Alt + Scroll down",
                "ru": "Alt + прокрутка вниз",
                "ja": "Alt + 下にスクロール"
            } satisfies LocalizedText),
            bulkViewMouseScrollWheel: ({
                "zh-TW": "大量瀏覽模式 - 滑鼠滾輪",
                "zh-CN": "批量浏览模式 - 鼠标滚轮",
                "en": "Bulk View - Mouse scroll wheel",
                "ru": "Галерея — колесо мыши",
                "ja": "バルクビュー - スクロールホイール"
            } satisfies LocalizedText),
            bulkViewMouseButton: ({
                "zh-TW": "大量瀏覽模式 - 滑鼠按鍵",
                "zh-CN": "批量浏览模式 - 鼠标按键",
                "en": "Bulk View - Mouse button",
                "ru": "Галерея — кнопка мыши",
                "ja": "バルクビュー - マウスボタン"
            } satisfies LocalizedText),
            resetAll: ({
                "zh-TW": "重置所有滑鼠設定",
                "zh-CN": "重置所有鼠标设置",
                "en": "Reset all mouse settings",
                "ru": "Сбросить настройки мыши",
                "ja": "すべてのマウス設定をリセット"
            } satisfies LocalizedText),
        },

        //#endregion

        //#region 設為預設程式
        association: {
            step1: ({
                "zh-TW": "步驟1、把 Tiefsee 關聯到特定副檔名",
                "zh-CN": "步骤1、把 Tiefsee 关联到特定扩展名",
                "en": "Step 1: Associate Tiefsee to the specified File Extension",
                "ru": "Шаг 1. Назначьте Tiefsee для нужных типов файлов.",
                "ja": "Step 1: Tiefsee を指定されたファイル名拡張子に関連付けます",
            } satisfies LocalizedText),
            step1Subtitle: ({
                "zh-TW": "(一行代表一種副檔名)",
                "zh-CN": "(一行代表一种扩展名)",
                "en": "(One file extension in one line)",
                "ru": "(Укажите одно расширение файла в каждой строке)",
                "ja": "(1種類のファイル名拡張子に対して1行)",
            } satisfies LocalizedText),
            apply: ({
                "zh-TW": "套用",
                "zh-CN": "应用",
                "en": "Apply",
                "ru": "Применить",
                "ja": "適用",
            } satisfies LocalizedText),
            applyFileTypeAssociation: ({
                "zh-TW": "套用副檔名關聯設定",
                "zh-CN": "应用扩展名关联设置",
                "en": "Apply file type associations",
                "ru": "Применить ассоциации файлов",
                "ja": "拡張子の関連付けを適用",
            } satisfies LocalizedText),
            applyRemovalOfFileTypeAssociation: ({
                "zh-TW": "套用解除副檔名關聯",
                "zh-CN": "应用解除扩展名关联",
                "en": "Apply removal of file type associations",
                "ru": "Снять ассоциации файлов",
                "ja": "拡張子の関連付け解除を適用",
            } satisfies LocalizedText),
            step2: ({
                "zh-TW": "步驟2、選擇預設應用程式",
                "zh-CN": "步骤2、选择默认应用程序",
                "en": "Step 2: Modify the default apps",
                "ru": "Шаг 2. Выберите приложение по умолчанию.",
                "ja": "Step 2: 既定のアプリの選択",
            } satisfies LocalizedText),
            step2Subtitle: ({
                "zh-TW": "開啟系統設定，將「相片檢視器」修改成「Tiefsee」",
                "zh-CN": "开启系统设置，将「照片查看器」修改成「Tiefsee」",
                "en": `Go to the "Windows Settings" and change the "Photo Viewer" to "Tiefsee"`,
                "ru": "Откройте параметры Windows и выберите Tiefsee в качестве приложения для просмотра фотографий.",
                "ja": "「Windows の設定」から「フォトビューアー」を「Tiefsee」に変更する",
            } satisfies LocalizedText),
            openSystemSettings: ({
                "zh-TW": "開啟 系統設定",
                "zh-CN": "开启 系统设置",
                "en": `Open "Windows Settings"`,
                "ru": "Открыть параметры Windows",
                "ja": "「Windows の設定」を開く",
            } satisfies LocalizedText),
            removeAssociation: ({
                "zh-TW": "解除預設程式",
                "zh-CN": "解除默认程序",
                "en": `Remove Association`,
                "ru": "Снять ассоциацию",
                "ja": "関連付けを解除する",
            } satisfies LocalizedText),
            removeFileTypeAssociation: ({
                "zh-TW": "解除副檔名關聯",
                "zh-CN": "解除扩展名关联",
                "en": `Remove file type association`,
                "ru": "Снять ассоциацию с типом файла",
                "ja": "拡張子の関連付けを解除する",
            } satisfies LocalizedText),
        },
        //#endregion

        //#region 進階設定

        // 清理暫存資料
        clearTempData: {
            title: ({
                "zh-TW": "清理暫存資料",
                "zh-CN": "清理缓存数据",
                "en": "Clear Temporary Data",
                "ru": "Очистить временные данные",
                "ja": "キャッシュを削除",
            } satisfies LocalizedText),
            clear: ({
                "zh-TW": "清理",
                "zh-CN": "清理",
                "en": "Clear",
                "ru": "Очистить",
                "ja": "削除",
            } satisfies LocalizedText),
        },

        // 效能
        performance: {
            title: ({
                "zh-TW": "效能",
                "zh-CN": "性能",
                "en": "Performance",
                "ru": "Производительность",
                "ja": "パフォーマンス",
            } satisfies LocalizedText),

            webglRenderer: ({
                "zh-TW": "以 WebGL 渲染圖片",
                "zh-CN": "使用 WebGL 渲染图片",
                "en": "Render images with WebGL",
                "ru": "Отображать изображения с помощью WebGL",
                "ja": "WebGL で画像を描画",
            } satisfies LocalizedText),
            webglRendererUnsupported: ({
                "zh-TW": "此電腦不支援 WebGL 2 或 WebGPU，無法啟用此功能",
                "zh-CN": "此电脑不支持 WebGL 2 或 WebGPU，无法启用此功能",
                "en": "This computer does not support WebGL 2 or WebGPU, so this feature cannot be enabled",
                "ru": "Этот компьютер не поддерживает WebGL 2 или WebGPU. Функцию нельзя включить.",
                "ja": "このコンピューターは WebGL 2 または WebGPU をサポートしていないため、この機能を有効にできません",
            } satisfies LocalizedText),
            webglRendererFallback: ({
                "zh-TW": "此電腦不支援 WebGPU，已將圖片渲染設定切換為 Canvas",
                "zh-CN": "此电脑不支持 WebGPU，已将图片渲染设置切换为 Canvas",
                "en": "This computer does not support WebGPU. Image rendering has been switched to Canvas",
                "ru": "Этот компьютер не поддерживает WebGPU. Для отображения изображений выбран Canvas.",
                "ja": "このコンピューターは WebGPU をサポートしていないため、画像の描画設定を Canvas に切り替えました",
            } satisfies LocalizedText),

            disabledDirectoryPanel: ({
                "zh-TW": "資料夾數量太多時，停用「資料夾預覽面板」",
                "zh-CN": "文件夹数量太多时，禁用「文件夹预览面板」",
                "en": `Disable "Folder Panel" when there are too many directories`,
                "ru": "Отключать панель просмотра папок, если их количество превышает заданное значение.",
                "ja": "フォルダが多すぎる場合は「フォルダパネル」を無効化する",
            } satisfies LocalizedText),
            alwaysDisable: ({
                "zh-TW": "一律停用",
                "zh-CN": "一律禁用",
                "en": "Always disable",
                "ru": "Всегда отключено",
                "ja": "常に無効にする",
            } satisfies LocalizedText),
            disableWhenGreaterThan: ({
                "zh-TW": "大於 {v} 時停用",
                "zh-CN": "大于 {v} 时禁用",
                "en": "Disable when greater than {v}",
                "ru": "Отключить, если значение превышает {v}",
                "ja": "{v} 以上の場合は無効にする",
            } satisfies LocalizedText),
            alwaysEnable: ({
                "zh-TW": "一律啟用",
                "zh-CN": "一律启用",
                "en": "Always enable",
                "ru": "Всегда включено",
                "ja": "常に有効にする",
            } satisfies LocalizedText),

            useCreateImageBitmap: ({
                "zh-TW": "圖片面積過大時，停用高品質縮放",
                "zh-CN": "图片面积过大时，禁用高品质缩放",
                "en": "Disable high-quality scaling when the image area is too large",
                "ru": "Отключать высококачественное масштабирование, если площадь изображения слишком велика",
                "ja": "画像が大きすぎる場合、高品質のスケーリングを無効にする"
            } satisfies LocalizedText),
            disableWhenGreaterThanSquare: ({
                "zh-TW": "大於 {v} x {v} 時停用",
                "zh-CN": "大于 {v} x {v} 时禁用",
                "en": "Disable when greater than {v} x {v}",
                "ru": "Отключить, если размер превышает {v} × {v}",
                "ja": "{v} x {v} 以上の場合は無効にする",
            } satisfies LocalizedText),

            useLibvips: ({
                "zh-TW": "圖片縮放閾值：當圖片縮小至特定比例以下，就重新處理圖片以確保品質。(設定值愈高，圖片品質愈好，但處理時間也會相對增加)",
                "zh-CN": "图片缩放阈值：当图片缩小至特定比例以下，就重新处理图片以确保品质。(设定值越高，图片品质越好，但处理时间也会相对增加)",
                "en": "Image Scaling Threshold: When the image is reduced to a certain ratio, it is reprocessed to ensure quality. (The higher the setting, the better the image quality, but the processing time will also increase)",
                "ru": "Порог масштабирования: при уменьшении изображения ниже заданного масштаба оно обрабатывается повторно для сохранения качества. Чем выше значение, тем лучше качество, но тем дольше обработка.",
                "ja": "画像スケーリング閾値：画像が特定の比率まで縮小されたとき、品質を確保するために再処理されます。(設定値が高いほど、画像品質は良くなりますが、処理時間も増えます)"
            } satisfies LocalizedText),

            bulkViewImgMaxCount: ({
                "zh-TW": "大量瀏覽模式一頁顯示的圖片數量。(範圍:1~300、預設:100、設定太高可能造成卡頓)",
                "zh-CN": "批量浏览模式一页显示的图片数量。(范围:1~300、默认:100、设定太高可能造成卡顿)",
                "en": "Number of images displayed per page in Bulk View mode. (range: 1~300, default: 100, setting too high may cause stuttering)",
                "ru": "Количество изображений на страницу в галерее (от 1 до 300, по умолчанию — 100; слишком большое значение может замедлить работу)",
                "ja": "バルクビューモードで1ページに表示される画像の数。(範囲:1〜300、デフォルト:100、設定が高すぎるとカクつきが発生する可能性があります)",
            } satisfies LocalizedText),

        },

        // 實驗性功能
        experimentalFeatures: {
            title: ({
                "zh-TW": "實驗性功能",
                "zh-CN": "实验性功能",
                "en": "Experimental Features",
                "ru": "Экспериментальные функции",
                "ja": "実験的な機能",
            } satisfies LocalizedText),
        },

        // 重設設定
        reset: {
            resetSettings: ({
                "zh-TW": "重設設定",
                "zh-CN": "重置设置",
                "en": "Reset settings",
                "ru": "Сбросить настройки",
                "ja": "設定をリセット",
            } satisfies LocalizedText),
            restoreDefaultSettings: ({
                "zh-TW": "將設定還原為其預設值",
                "zh-CN": "将设置还原为其默认值",
                "en": "Restore default settings",
                "ru": "Восстановить настройки по умолчанию",
                "ja": "デフォルト設定に戻す",
            } satisfies LocalizedText),
        },

        // Tiefsee 伺服器
        localhostServer: {
            port: ({
                "zh-TW": "Port (如果已經被使用，則會使用下一個號碼)",
                "zh-CN": "Port (如果已经被使用，则会使用下一个号码)",
                "en": "Port (If the port is occupied, the next number is used)",
                "ru": "Порт (если уже использован, будет использован следующий номер)",
                "ja": "Port (ポートが占有されている場合は、次の番号が使用されます)",
            } satisfies LocalizedText),
        },

        // 相關檔案
        relatedSettings: {
            title: ({
                "zh-TW": "相關連結",
                "zh-CN": "相关链接",
                "en": "Related Links",
                "ru": "Ссылки по теме",
                "ja": "関連リンク",
            } satisfies LocalizedText),
            appData: ({
                "zh-TW": "AppData (設定檔)",
                "zh-CN": "AppData (配置文件)",
                "en": "AppData (Config Files)",
                "ru": "AppData (файл конфигурации)",
                "ja": "AppData (設定ファイル)",
            } satisfies LocalizedText),
            www: ({
                "zh-TW": "www (原始碼)",
                "zh-CN": "www (源代码)",
                "en": "www (Code)",
                "ru": "www (исходный код)",
                "ja": "www (コード)",
            } satisfies LocalizedText),
            temporaryDirectory: ({
                "zh-TW": "暫存資料夾",
                "zh-CN": "缓存文件夹",
                "en": "Temporary Folder",
                "ru": "Временная папка",
                "ja": "キャッシュフォルダ",
            } satisfies LocalizedText),

        },

        //#endregion

        //#region 關於
        about: {
            version: ({
                "zh-TW": "版本:",
                "zh-CN": "版本:",
                "en": "Version:",
                "ru": "Версия:",
                "ja": "バージョン:",
            } satisfies LocalizedText),
            developer: ({
                "zh-TW": "開發者:",
                "zh-CN": "开发者:",
                "en": "Developer:",
                "ru": "Разработчик:",
                "ja": "開発者:",
            } satisfies LocalizedText),
            repository: ({
                "zh-TW": "儲存庫:",
                "zh-CN": "仓库:",
                "en": "Repository:",
                "ru": "Репозиторий:",
                "ja": "リポジトリ:",
            } satisfies LocalizedText),
            softwareUpdates: ({
                "zh-TW": "軟體更新:",
                "zh-CN": "软件更新:",
                "en": "Software Updates:",
                "ru": "Обновления программы:",
                "ja": "アップデート:",
            } satisfies LocalizedText),
        },
        //#endregion

        //#region 擴充套件
        plugin: {
            pluginList: ({
                "zh-TW": "擴充套件清單",
                "zh-CN": "扩展插件清单",
                "en": "Plugin List",
                "ru": "Список расширений",
                "ja": "プラグイン一覧",
            } satisfies LocalizedText),
            quickLook: ({
                "zh-TW": "在桌面或資料夾選中任一檔案，然後長按空白鍵，即可預覽檔案",
                "zh-CN": "在桌面或文件夹选中任一文件，然后长按空格键，即可预览文件",
                "en": "Select a file on the desktop or in a folder and then press and hold the spacebar to preview the file",
                "ru": "Выберите любой файл на рабочем столе или в папке, затем нажмите и удерживайте клавишу пробела, чтобы просмотреть файл.",
                "ja": "デスクトップまたはフォルダー内のファイルを選択して、スペースバーを長押しすると、ファイルがプレビューされます",
            } satisfies LocalizedText),
            monacoEditor: ({
                "zh-TW": "讓 Tiefsee 使用 monaco-editor 來載入文字檔。常用於閱讀與編輯程式碼",
                "zh-CN": "让 Tiefsee 使用 monaco-editor 来载入文本文件。常用于阅读与编辑代码",
                "en": "Let Tiefsee use monaco-editor to load text files. Commonly used for reading and editing code",
                "ru": "Tiefsee использует monaco-editor для открытия текстовых файлов, например для чтения и редактирования кода.",
                "ja": "Tiefsee に monaco-editor を使って、テキストファイルを読み込ませる。 コードの読み取りと編集によく使われる",
            } satisfies LocalizedText),
            webviewer: ({
                "zh-TW": "讓 Tiefsee 支援「doc、docx、ppt、pptx」",
                "zh-CN": "让 Tiefsee 支持「doc、docx、ppt、pptx」",
                "en": `Let Tiefsee support "doc, docx, ppt, pptx"`,
                "ru": "Tiefsee поддерживает файлы DOC, DOCX, PPT и PPTX.",
                "ja": "Tiefsee に「doc, docx, ppt, pptx」をサポートさせる",
            } satisfies LocalizedText),
            hdrfix: ({
                "zh-TW": `
                    讓 JPEG XR (.jxr) 的 HDR 色彩更好的顯示 <br>
                    (將 HDR 色彩空間以 Hable 算法處理成 SDR 色彩空間)`,
                "zh-CN": `
                    让 JPEG XR (.jxr) 的 HDR 色彩更好的显示 <br>
                    (将 HDR 色彩空间以 Hable 算法处理成 SDR 色彩空间)`,
                "en": `
                    Let JPEG XR (.jxr) display HDR colors better <br>
                    (Process HDR color space to SDR color space with Hable algorithm)`,
                "ru": `
                    Улучшает отображение HDR-цветов в файлах JPEG XR (.jxr).<br>
                    Преобразует HDR в SDR с помощью алгоритма Hable.
                `,
                "ja": `
                    JPEG XR (.jxr) の HDR カラーをより良く表示する <br>
                    (HDR カラースペースを Hable アルゴリズムで SDR カラースペースに処理)`,
            } satisfies LocalizedText),
            nConvert: ({
                "zh-TW": "讓 Tiefsee 支援「Clip Studio Paint」產生的「clip 檔」",
                "zh-CN": "让 Tiefsee 支持「Clip Studio Paint」生成的「clip 文件」",
                "en": `Let Tiefsee support "clip file" generated by "Clip Studio Paint"`,
                "ru": "Tiefsee поддерживает файлы CLIP, созданные в Clip Studio Paint.",
                "ja": `Tiefsee に「Clip Studio Paint」で生成された「clip ファイル」をサポートさせる`,
            } satisfies LocalizedText),
            installationSteps: ({
                "zh-TW": "安裝步驟",
                "zh-CN": "安装步骤",
                "en": "Installation Steps",
                "ru": "Инструкция по установке",
                "ja": "インストール手順",
            } satisfies LocalizedText),
            step1: ({
                "zh-TW": "1、在「Tiefsee Plugin」的網頁下載擴充套件",
                "zh-CN": "1、在「Tiefsee Plugin」的网页下载扩展插件",
                "en": `1. Download the Plugin from the "Tiefsee Plugin" webpage`,
                "ru": "1. Загрузите пакет расширения с веб-страницы «Tiefsee Plugin».",
                "ja": `1. 「Tiefsee Plugin」サイトよりダウンロードプラグイン`,
            } satisfies LocalizedText),
            openPluginWebpage: ({
                "zh-TW": "開啟「Tiefsee Plugin」網頁",
                "zh-CN": "开启「Tiefsee Plugin」网页",
                "en": `Open the "Tiefsee Plugin" webpage`,
                "ru": "Открыть страницу Tiefsee Plugin",
                "ja": `「Tiefsee Plugin」のウェブサイトを開く`,
            } satisfies LocalizedText),
            step2: ({
                "zh-TW": "2、把ZIP解壓縮，然後放到「Plugin」資料夾內",
                "zh-CN": "2、把ZIP解压缩，然后放到「Plugin」文件夹内",
                "en": `2. Unzip the ZIP and put it in the "Plugin" folder`,
                "ru": "2. Распакуйте ZIP и поместите его в папку Plugin.",
                "ja": `2. ZIPを解凍し、「Plugin」フォルダに配置する`,
            } satisfies LocalizedText),
            openPluginDir: ({
                "zh-TW": "開啟「Plugin」資料夾",
                "zh-CN": "开启「Plugin」文件夹",
                "en": `Open the "Plugin" folder`,
                "ru": "Открыть папку Plugin",
                "ja": "「Plugin」フォルダを開く",
            } satisfies LocalizedText),
            step3: ({
                "zh-TW": "3、重新啟動 Tiefsee",
                "zh-CN": "3、重新启动 Tiefsee",
                "en": "3. Restart Tiefsee",
                "ru": "3. Перезапустите Tiefsee.",
                "ja": "3. Tiefsee を再起動する",
            } satisfies LocalizedText),
            restartTiefsee: ({
                "zh-TW": "重新啟動 Tiefsee",
                "zh-CN": "重新启动 Tiefsee",
                "en": "Restart Tiefsee",
                "ru": "Перезапустить Tiefsee",
                "ja": "Tiefsee を再起動する",
            } satisfies LocalizedText),
            example: ({
                "zh-TW": "(示意圖)",
                "zh-CN": "(示意图)",
                "en": "(Example)",
                "ru": "(Пример)",
                "ja": "(例)",
            } satisfies LocalizedText),
        },
        //#endregion

        //#region 快速預覽
        quickLook: {
            title: ({
                "zh-TW": "在 桌面 或 資料夾 快速預覽檔案",
                "zh-CN": "在 桌面 或 文件夹 快速预览文件",
                "en": "Quick preview of file on the desktop or in the folder",
                "ru": "Быстрый просмотр файла на рабочем столе или в папке",
                "ja": "デスクトップやフォルダー内のファイルをすばやくプレビューできる",
            } satisfies LocalizedText),
            subtitle: ({
                "zh-TW": "「啟動模式」如果為「直接啟動」則無法使用 QuickLook",
                "zh-CN": "「启动模式」如果为「直接启动」则无法使用 QuickLook",
                "en": `QuickLook is not available if the "Startup Mode" is "Normal Startup"`,
                "ru": "QuickLook недоступен в режиме «Обычный запуск».",
                "ja": `「起動モード」が 「通常起動」の場合、QuickLook は使用できません`,
            } satisfies LocalizedText),
            notInstalledQuickLook: ({
                "zh-TW": "必須安裝擴充套件「QuickLook」才能使用此功能",
                "zh-CN": "必须安装扩展插件「QuickLook」才能使用此功能",
                "en": `The "QuickLook" Plugin must be installed to use this feature`,
                "ru": "Для этой функции необходимо установить расширение QuickLook.",
                "ja": `この機能を使用するには、「QuickLook」プラグインをインストールする必要があります`,
            } satisfies LocalizedText),
            longPressSpacebar: ({
                "zh-TW": "長按「空白鍵」觸發",
                "zh-CN": "长按「空格键」触发",
                "en": `Long press "Space bar" to take effect`,
                "ru": "Удерживайте клавишу пробела, чтобы вызвать QuickLook.",
                "ja": `「スペースバー」を長押しすると有効になります`,
            } satisfies LocalizedText),
            longPressMousewheel: ({
                "zh-TW": "長按「滑鼠滾輪」觸發",
                "zh-CN": "长按「鼠标滚轮」触发",
                "en": `Long press "Mouse Wheel" to take effect`,
                "ru": "Нажмите и удерживайте колесо мыши, чтобы вызвать QuickLook.",
                "ja": `「マウスホイール」を長押しすると有効になります`,
            } satisfies LocalizedText),
        },
        //#endregion

    }
} satisfies LanguageModule<"sw">;
