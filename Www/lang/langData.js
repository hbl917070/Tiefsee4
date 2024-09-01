var langData = {

    // setting window
    sw: {

        reloadRequired: {
            "zh-TW": "需要重新載入",
            "en": "Reload Required",
            "ja": "再読み込みが必要です",
        },
        none: {
            "zh-TW": "無",
            "en": "None",
            "ja": "なし",
        },
        default: {
            "zh-TW": "預設",
            "en": "Default",
            "ja": "プリセット",
        },

        //#region tabs
        tabs: {
            general: {
                "zh-TW": "一般",
                "en": "General",
                "ja": "一般",
            },
            appearance: {
                "zh-TW": "外觀",
                "en": "Appearance",
                "ja": "外観",
            },
            layout: {
                "zh-TW": "佈局",
                "en": "Layout",
                "ja": "レイアウト",
            },
            toolbar: {
                "zh-TW": "工具列",
                "en": "Toolbar",
                "ja": "ツールバー",
            },
            mouse: {
                "zh-TW": "滑鼠",
                "en": "Mouse",
                "ja": "マウス",
            },
            association: {
                "zh-TW": "設為預設程式",
                "en": "Association",
                "ja": "関連付け",
            },
            advanced: {
                "zh-TW": "進階設定",
                "en": "Advanced",
                "ja": "アドバンスド設定",
            },
            about: {
                "zh-TW": "關於",
                "en": "About",
                "ja": "について",
            },
            plugin: {
                "zh-TW": "擴充套件",
                "en": "Plugin",
                "ja": "プラグイン",
            },
            quickLook: {
                "zh-TW": "QuickLook",
                "en": "QuickLook",
                "ja": "QuickLook",
            },
        },
        //#endregion

        //#region 一般

        // 圖片設定
        imageSettings: {
            title: {
                "zh-TW": "圖片設定",
                "en": "Image Settings",
                "ja": "画像設定",
            },

            imageShowPixels: {
                "zh-TW": "圖片縮放比例大於 100% 時，呈現像素",
                "en": "Show pixels if the image zoom ratio is above 100%",
                "ja": "画像の拡大率が 100% 以上の場合、画素を表示します",
            },
        },

        // 圖片預設縮放模式
        zoomMode: {
            title: {
                "zh-TW": "圖片預設縮放模式",
                "en": "Image Default Zoom Mode",
                "ja": "画像のデフォルトズームモード",
            },

            fitWindowOrImageOriginal: {
                "zh-TW": "縮放至適合視窗 or 圖片原始大小",
                "en": "Zoom to Fit or Image Original Size",
                "ja": "ズームトゥフィット or 画像原寸大",
            },
            fitWindow: {
                "zh-TW": "強制縮放至適合視窗",
                "en": "Always Zoom to Fit",
                "ja": "常にズームトゥフィット",
            },
            imageOriginal: {
                "zh-TW": "圖片原始大小",
                "en": "Image Original Size",
                "ja": "画像原寸大",
            },
            imageWidthPx: {
                "zh-TW": "圖片寬度 (px)",
                "en": "Image Width (px)",
                "ja": "画像の幅 (px)",
            },
            imageHeightPx: {
                "zh-TW": "圖片高度 (px)",
                "en": "Image Height (px)",
                "ja": "画像の高さ (px)",
            },
            windowWidthRatio: {
                "zh-TW": "視窗寬度 (%)",
                "en": "Window Width (%)",
                "ja": "ウィンドウの幅 (%)",
            },
            windowHeightRatio: {
                "zh-TW": "視窗高度 (%)",
                "en": "Window Height (%)",
                "ja": "ウィンドウの高さ (%)",
            },
        },

        // 圖片預設對齊位置
        imageAlign: {
            title: {
                "zh-TW": "圖片預設對齊位置",
                "en": "Image default alignment",
                "ja": "画像のデフォルトアライメント",
            },
            center: {
                "zh-TW": "中央",
                "en": "Center",
                "ja": "中央",
            },
            topLeft: {
                "zh-TW": "左上",
                "en": "Top Left",
                "ja": "左上",
            },
            top: {
                "zh-TW": "上",
                "en": "Top",
                "ja": "上",
            },
            topRight: {
                "zh-TW": "右上",
                "en": "Top Right",
                "ja": "右上",
            },
            right: {
                "zh-TW": "右",
                "en": "Right",
                "ja": "右",
            },
            bottomRight: {
                "zh-TW": "右下",
                "en": "Bottom Right",
                "ja": "右下",
            },
            bottom: {
                "zh-TW": "下",
                "en": "Bottom",
                "ja": "下",
            },
            bottomLeft: {
                "zh-TW": "左下",
                "en": "Bottom Left",
                "ja": "左下",
            },
            left: {
                "zh-TW": "左",
                "en": "Left",
                "ja": "左",
            },
        },

        // 預設排序
        sortMode: {
            title: {
                "zh-TW": "預設排序",
                "en": "Default Sort",
                "ja": "デフォルトのソート",
            },
            fileDefaultSort: {
                "zh-TW": "檔案預設排序",
                "en": "File default sort",
                "ja": "ファイルのデフォルトソート",
            },
            directoryDefaultSort: {
                "zh-TW": "資料夾預設排序",
                "en": "Folder default sort",
                "ja": "フォルダのデフォルトソート",
            },
            name: {
                "zh-TW": "檔名",
                "en": "File Name",
                "ja": "ファイル名",
            },
            nameDesc: {
                "zh-TW": "檔名 (遞減)",
                "en": "File Name (Desc)",
                "ja": "ファイル名 (降順)",
            },
            lastWriteTime: {
                "zh-TW": "修改日期",
                "en": "Last Write Time",
                "ja": "更新日時",
            },
            lastWriteTimeDesc: {
                "zh-TW": "修改日期 (遞減)",
                "en": "Last Write Time (Desc)",
                "ja": "更新日時 (降順)",
            },
            lastAccessTime: {
                "zh-TW": "存取日期",
                "en": "Last Access Time",
                "ja": "アクセス日時",
            },
            lastAccessTimeDesc: {
                "zh-TW": "存取日期 (遞減)",
                "en": "Last Access Time (Desc)",
                "ja": "アクセス日時 (降順)",
            },
            creationTime: {
                "zh-TW": "建立日期",
                "en": "Creation time",
                "ja": "作成日時",
            },
            creationTimeDesc: {
                "zh-TW": "建立日期 (遞減)",
                "en": "Creation Time (Desc)",
                "ja": "作成日時 (降順)",
            },
            length: {
                "zh-TW": "檔案大小",
                "en": "File Size",
                "ja": "ファイルサイズ",
            },
            lengthDesc: {
                "zh-TW": "檔案大小 (遞減)",
                "en": "File Size (Desc)",
                "ja": "ファイルサイズ (降順)",
            },
            random: {
                "zh-TW": "隨機",
                "en": "Random",
                "ja": "ランダム",
            },
        },

        //啟動模式
        startupMode: {
            title: {
                "zh-TW": "啟動模式",
                "en": "Startup Mode",
                "ja": "起動モード",
            },

            mode_1: {
                "zh-TW": "直接啟動",
                "en": "Normal Startup",
                "ja": "通常起動",
            },
            mode_2: {
                "zh-TW": "快速啟動",
                "en": "Fast Startup",
                "ja": "高速起動",
            },
            mode_3: {
                "zh-TW": "快速啟動 + 常駐背景",
                "en": "Fast Startup + Background Task",
                "ja": "高速起動 + バックグラウンドに常駐",
            },
            mode_4: {
                "zh-TW": "只允許一個 Tiefsee",
                "en": "Single Instances",
                "ja": "複数の Tiefsee を起動しない",
            },
            mode_5: {
                "zh-TW": "只允許一個 Tiefsee + 常駐背景",
                "en": "Single Instances + Background Task",
                "ja": "複数の Tiefsee を起動しない + バックグラウンドに常駐",
            },

            tooltip_1: {
                "zh-TW": "每個 Tiefsee 視窗都是一個新的執行個體，需要較長的啟動時間",
                "en": "Each Tiefsee window is a new instances, the startup speed is slower",
                "ja": "Tiefsee ウィンドウはそれぞれ新しいインスタンスであるため、起動速度が遅くなる",
            },
            tooltip_2: {
                "zh-TW": "所有的 Tiefsee 共用同一個執行個體。只要 Tiefsee 的視窗尚未全部關閉，就能快速啟動 Tiefsee",
                "en": "All Tiefsee window share the same instances. As long as the Tiefsee window is not all closed, you can quickly startup Tiefsee",
                "ja": `すべての Tiefsee ウィンドウは同じインスタンスを共有しています。Tiefsee ウィンドウが閉じていない限り、Tiefsee を高速起動することができます`,
            },
            tooltip_3: {
                "zh-TW": "所有視窗共用同一個執行個體。Tiefsee 會常駐在背景，隨時都能以極快的速度啟動",
                "en": `All Tiefsee window share the same instances. Tiefsee will Running in the background, you can quickly startup Tiefsee at any time`,
                "ja": `Tiefsee のウィンドウはすべて同じインスタンスを共有しています。Tiefsee はバックグラウンドで動作し、いつでも高速起動が可能です`,
            },
            tooltip_4: {
                "zh-TW": "只允許存在一個 Tiefsee 視窗",
                "en": "Not allowed to have multiple Tiefsee window",
                "ja": "複数の Tiefsee ウィンドウを持つことはできません",
            },
            tooltip_5: {
                "zh-TW": "只允許存在一個 Tiefsee 視窗。程式會常駐在背景，隨時都能以極快的速度啟動",
                "en": `
                    Not allowed to have multiple Tiefsee window.<br>
                    Tiefsee will Running in the background, you can quickly startup Tiefsee at any time
                    `,
                "ja": `
                    複数の Tiefsee ウィンドウを持つことはできません。<br>
                    Tiefsee はバックグラウンドで動作し、いつでも高速起動が可能です
                `,
            },
        },

        //開機後自動啟動
        startupRunTiefsee: {
            title: {
                "zh-TW": "開機後自動啟動",
                "en": "Start with OS",
                "ja": "OSの起動後に自動で起動",
            },
            subtitle: {
                "zh-TW": "電腦開機後，讓 Tiefsee 常駐在背景 (啟動模式必須是「常駐背景」才會生效)",
                "en": "After the computer is turned on, let Tiefsee Running in the background",
                "ja": "パソコンの電源を入れた後、バックグラウンドで Tiefsee を起動させます",
            },
            openStartup: {
                "zh-TW": "開啟 Windows 的「Startup」",
                "en": `Open Windows "Startup"`,
                "ja": "Windows の「Startup」を開く",
            },
        },

        //其他
        other: {
            title: {
                "zh-TW": "其他",
                "en": "Other",
                "ja": "その他",
            },
            rawImageThumbnail: {
                "zh-TW": "開啟 RAW 圖片時，顯示內嵌的預覽圖",
                "en": "Show embedded preview when opening RAW image",
                "ja": "RAW 画像を開くときに埋め込みプレビューを表示する",
            },


            displayDeleteConfirmationDialog: {
                "zh-TW": "檔案刪除前顯示確認視窗",
                "en": "Display Delete confirmation dialog",
                "ja": "削除の確認メッセージを表示する",
            },
            whenInsertingFile: {
                "zh-TW": "偵測到檔案新增時，插入於",
                "en": "When a new file is detected, insert it at",
                "ja": "新しいファイルが検出されたとき、挿入する場所",
            },
            auto: {
                "zh-TW": "自動",
                "en": "Auto",
                "ja": "自動",
            },
            start: {
                "zh-TW": "最前面",
                "en": "Insert to the start",
                "ja": "先頭に挿入",
            },
            end: {
                "zh-TW": "最後面",
                "en": "Insert to the end",
                "ja": "最後に挿入",
            },


            enableTouchpadGestures: {
                "zh-TW": "啟用觸控板手勢",
                "en": "Enable touchpad gestures",
                "ja": "タッチパッドジェスチャを有効にする",
            },
            enableTouchpadGesturesTooltip: {
                "zh-TW": `
                    1. 雙指滑動：移動圖片<br>
                    2. 雙指捏合：縮放圖片<br>
                    (啟用後可能與滑鼠滾輪衝突)
                `,
                "en": `
                    1. Two-finger swipe: Move the image<br>
                    2. Two-finger pinch: Zoom the image<br>
                    (May conflict with mouse wheel after enabling)
                `,
                "ja": `
                    1. 2本指スワイプ：画像を移動する<br>
                    2. 2本指ピンチ：画像をズームする<br>
                    (有効にした後、マウスホイールと競合する可能性があります)
                `,
            },

        },

        //#endregion

        //#region 外觀

        //主題
        theme: {
            defaultTheme: {
                "zh-TW": "主題",
                "en": " Theme",
                "ja": "テーマ",
            },
            darkTheme: {
                "zh-TW": "深色主題",
                "en": "Dark Theme",
                "ja": "ダークテーマ",
            },
            lightTheme: {
                "zh-TW": "淺色主題",
                "en": "Light Theme",
                "ja": "ライトテーマ",
            },
            customTheme: {
                "zh-TW": "自訂主題",
                "en": "Custom Theme",
                "ja": "カスタムテーマ",
            },
            windowBackgroundColor: {
                "zh-TW": "視窗背景色",
                "en": "Window background color",
                "ja": "ウィンドウの背景色",
            },
            windowBorderColor: {
                "zh-TW": "視窗邊框色",
                "en": "Window border color",
                "ja": "ウィンドウのボーダー色",
            },
            textColor: {
                "zh-TW": "文字顏色",
                "en": "Text color",
                "ja": "テキスト色",
            },
            accentColor: {
                "zh-TW": "強調顏色",
                "en": "Accent color",
                "ja": "アクセント色",
            },
            blockColor: {
                "zh-TW": "區塊底色",
                "en": "Block color",
                "ja": "ブロックの色",
            },
        },

        //文字與圖示
        textAndIcon: {
            title: {
                "zh-TW": "文字與圖示",
                "en": "Text and Icon",
                "ja": "テキストとアイコン",
            },

            textStrokeWidth: {
                "zh-TW": "文字粗細",
                "en": "Text stroke width",
                "ja": "テキストストロークの幅",
            },
            text_1: {
                "zh-TW": "1(最細)",
                "en": "1 (Thin)",
                "ja": "1 (シン)",
            },
            text_4: {
                "zh-TW": "4(預設)",
                "en": "4 (Default)",
                "ja": "4 (デフォルト)",
            },
            text_9: {
                "zh-TW": "9(最粗)",
                "en": "9 (Bold)",
                "ja": "9 (太字)",
            },

            iconStrokeWidth: {
                "zh-TW": "圖示粗細",
                "en": "Icon stroke width",
                "ja": "アイコンのストローク幅",
            },
            icon_0: {
                "zh-TW": "0(最細、預設)",
                "en": "0 (Thin, Default)",
                "ja": "0 (シン、デフォルト)",
            },
            icon_10: {
                "zh-TW": "10(最粗)",
                "en": "10 (Bold)",
                "ja": "10 (太字)",
            },
        },

        // 視窗設定
        windowSetting: {
            title: {
                "zh-TW": "視窗設定",
                "en": "Window Setting",
                "ja": "ウィンドウの設定",
            },
            zoom: {
                "zh-TW": "視窗縮放 (0.5 ~ 3.0)",
                "en": "Window zoom (0.5 ~ 3.0)",
                "ja": "ウィンドウの拡大縮小 (0.5 ~ 3.0)",
            },
            roundedCorners: {
                "zh-TW": "視窗圓角 (0 ~ 15)",
                "en": "Window rounded corners (0 ~ 15)",
                "ja": "ウィンドウの円角 (0 ~ 15)",
            },
            windowStyle: {
                "zh-TW": "視窗效果",
                "en": " Window effect",
                "ja": "ウィンドウ効果",
            },

            tooltip: {
                "zh-TW": `  
                    修改此選項後，還必須調整「視窗背景色」的透明度，才能達到最佳視覺效果
                `,
                "en": `
                    After changing this option, you must also adjust the transparency of the "Window background color" to achieve the best visual effect
                `,
                "ja": `
                    このオプションを変更した後、最適な視覚効果を得るために「ウィンドウの背景色」の透明度も調整する必要があります
                `,
            },
            applySuggestedColor: {
                "zh-TW": "套用建議配色",
                "en": "Apply Suggested Color",
                "ja": "提案された色を適用",
            },
        },

        //#endregion

        //#region layout

        // 檔案預覽面板
        filePanel: {
            title: {
                "zh-TW": "檔案預覽面板",
                "en": "File Panel",
                "ja": "ファイルパネル",
            },
            displayPanel: {
                "zh-TW": "顯示檔案預覽面板",
                "en": "Display file panel",
                "ja": "ファイルパネルを表示する",
            },
            displayNumber: {
                "zh-TW": "顯示編號",
                "en": "Display number",
                "ja": "番号を表示する",
            },
            displayName: {
                "zh-TW": "顯示檔名",
                "en": "Display file name",
                "ja": "ファイル名を表示する",
            },
        },

        // 資料夾預覽面板
        directoryPanel: {
            title: {
                "zh-TW": "資料夾預覽面板",
                "en": "Folder Panel",
                "ja": "フォルダパネル",
            },
            displayPanel: {
                "zh-TW": "顯示資料夾預覽面板",
                "en": "Display folder panel",
                "ja": "フォルダパネルを表示する",
            },
            displayNumber: {
                "zh-TW": "顯示編號",
                "en": "Display number",
                "ja": "番号を表示する",
            },
            displayName: {
                "zh-TW": "顯示資料夾名",
                "en": "Display folder name",
                "ja": "フォルダ名を表示する",
            },
            numberOfImages: {
                "zh-TW": "圖片數量",
                "en": "Number of images",
                "ja": "画像枚数",
            },
        },

        // 詳細資料面板
        informationPanel: {
            title: {
                "zh-TW": "詳細資料面板",
                "en": "Information Panel",
                "ja": "情報パネル",
            },
            displayPanel: {
                "zh-TW": "顯示詳細資料面板",
                "en": "Display information panel",
                "ja": "情報パネルを表示する",
            },
            maxLine: {
                "zh-TW": "顯示的最大行數 (1~1000)",
                "en": "Maximum number of lines displayed (1~1000)",
                "ja": "最大表示行数 (1~1000)",
            },
            horizontal: {
                "zh-TW": "寬度足夠時，橫向排列",
                "en": "Horizontal arrangement when width enough",
                "ja": "横幅配置、幅の十分なとき",
            },
            relatedFiles: {
                "zh-TW": "顯示相關檔案",
                "en": "Display related files",
                "ja": "関連ファイルを表示"
            },
            relatedFilesTooltip: {
                "zh-TW": `自動找出相同檔名的檔案。<br> 例如 "dog.jpg", "dog.txt", "dog.preview.png"`,
                "en": `Automatically find files with the same file name. <br> For example, "dog.jpg", "dog.txt", "dog.preview.png"`,
                "ja": `同じファイル名のファイルを自動的に見つけます。<br> 例えば、"dog.jpg", "dog.txt", "dog.preview.png"`
            },

            civitaiResourcesEnabled: {
                "zh-TW": `顯示 Civitai Resources`,
                "en": `Display Civitai Resources`,
                "ja": `Civitai Resources を表示する`
            },
            civitaiResourcesDefault: {
                "zh-TW": `圖片預設狀態`,
                "en": `Default image state`,
                "ja": `画像のデフォルト状態`,
            },
            civitaiResourcesImgNumber: {
                "zh-TW": `圖片數量`,
                "en": `Number of images`,
                "ja": `画像の数`,
            },
            civitaiResourcesNsfwLevel: {
                "zh-TW": `允許 NSFW 圖片`,
                "en": `Allow NSFW images`,
                "ja": `NSFW 画像を許可する`,
            },
        },

        // 工具列
        mainToolbar: {
            title: {
                "zh-TW": "工具列",
                "en": "Toolbar",
                "ja": "ツールバー",
            },
            displayPanel: {
                "zh-TW": "顯示工具列",
                "en": "Display toolbar",
                "ja": "ツールバーを表示する",
            },
            toolbarAlignment: {
                "zh-TW": "工具列對齊",
                "en": "Toolbar alignment",
                "ja": "ツールバーの配置",
            },
            left: {
                "zh-TW": "靠左",
                "en": "Left",
                "ja": "左",
            },
            center: {
                "zh-TW": "置中",
                "en": "Center",
                "ja": "中央",
            },
        },

        //大型切換按鈕
        largeBtn: {
            title: {
                "zh-TW": "大型選擇按鈕",
                "en": "Large Select Button",
                "ja": "大型セレクトボタン",
            },
            noDisplay: {
                "zh-TW": "不顯示",
                "en": "Do not display",
                "ja": "表示しない",
            },
            bottom: {
                "zh-TW": "底部",
                "en": "Bottom",
                "ja": "底面",
            },
            bothSides: {
                "zh-TW": "左右兩側",
                "en": "Both sides",
                "ja": "左右両側",
            },
            bothSidesContraction: {
                "zh-TW": "左右兩側(內縮)",
                "en": "Both sides (contraction)",
                "ja": "左右両側(収縮)",
            },
        },

        // 面板順序
        layoutOrder: {
            title: {
                "zh-TW": "面板順序",
                "en": "Panel Order",
                "ja": "パネルの順序",
            },
            filePanel: "menu.showFilePanel",
            dirPanel: "menu.showDirectoryPanel",
            infoPanel: "menu.showInformationPanel",
            imagePanel: {
                "zh-TW": "圖片面板",
                "en": "Image Panel",
                "ja": "画像パネル",
            },
        },

        //#endregion

        //#region 工具列

        //顯示與排序
        customToolbar: {
            title: {
                "zh-TW": "顯示與排序",
                "en": "Display and Sort",
                "ja": "表示とソート",
            },
            imageToolbar: {
                "zh-TW": "圖片工具列",
                "en": "Image Toolbar",
                "ja": "画像ツールバー",
            },
            officeToolbar: {
                "zh-TW": "Office 文件工具列",
                "en": "Office Document Toolbar",
                "ja": "Office 文書ツールバー",
            },
            textToolbar: {
                "zh-TW": "文字工具列",
                "en": "Text Toolbar",
                "ja": "テキストツールバー",
            },
            bulkViewToolbar: {
                "zh-TW": "大量瀏覽模式工具列",
                "en": "Bulk View Toolbar",
                "ja": "バルクビューツールバー",
            },
            adjustOrderByDragging: {
                "zh-TW": "(可拖曳調整順序)",
                "en": "(Adjust order by dragging)",
                "ja": "(ドラッグで順番を調整)",
            },
        },

        //#endregion

        //#region 滑鼠

        mouse: {
            mouseButton: {
                "zh-TW": "滑鼠按鍵",
                "en": "Mouse button",
                "ja": "マウスボタン"
            },
            leftDoubleClick: {
                "zh-TW": "左鍵雙擊",
                "en": "Left double-click",
                "ja": "左ダブルクリック"
            },
            scrollWheelButton: {
                "zh-TW": "滾輪鍵",
                "en": "Scroll wheel button",
                "ja": "スクロールホイールボタン"
            },
            mouseButton4: {
                "zh-TW": "滑鼠按鍵 4",
                "en": "Mouse button 4",
                "ja": "マウスボタン 4"
            },
            mouseButton5: {
                "zh-TW": "滑鼠按鍵 5",
                "en": "Mouse button 5",
                "ja": "マウスボタン 5"
            },
            mouseScrollWheel: {
                "zh-TW": "滑鼠滾輪",
                "en": "Mouse scroll wheel",
                "ja": "スクロールホイール"
            },
            scrollUp: {
                "zh-TW": "向上捲動",
                "en": "Scroll up",
                "ja": "上にスクロール"
            },
            scrollDown: {
                "zh-TW": "向下捲動",
                "en": "Scroll down",
                "ja": "下にスクロール"
            },
            scrollUpCtrl: {
                "zh-TW": "Ctrl + 向上捲動",
                "en": "Ctrl + Scroll up",
                "ja": "Ctrl + 上にスクロール"
            },
            scrollDownCtrl: {
                "zh-TW": "Ctrl + 向下捲動",
                "en": "Ctrl + Scroll down",
                "ja": "Ctrl + 下にスクロール"
            },
            scrollUpShift: {
                "zh-TW": "Shift + 向上捲動",
                "en": "Shift + Scroll up",
                "ja": "Shift + 上にスクロール"
            },
            scrollDownShift: {
                "zh-TW": "Shift + 向下捲動",
                "en": "Shift + Scroll down",
                "ja": "Shift + 下にスクロール"
            },
            scrollUpAlt: {
                "zh-TW": "Alt + 向上捲動",
                "en": "Alt + Scroll up",
                "ja": "Alt + 上にスクロール"
            },
            scrollDownAlt: {
                "zh-TW": "Alt + 向下捲動",
                "en": "Alt + Scroll down",
                "ja": "Alt + 下にスクロール"
            },
            bulkViewMouseScrollWheel: {
                "zh-TW": "大量瀏覽模式 - 滑鼠滾輪",
                "en": "Bulk View - Mouse scroll wheel",
                "ja": "バルクビュー - スクロールホイール"
            },
        },

        //#endregion

        //#region 設為預設程式
        association: {
            step1: {
                "zh-TW": "步驟1、把 Tiefsee 關聯到特定副檔名",
                "en": "Step 1: Associate Tiefsee to the specified File Extension",
                "ja": "Step 1: Tiefsee を指定されたファイル名拡張子に関連付けます",
            },
            step1Subtitle: {
                "zh-TW": "(一行代表一種副檔名)",
                "en": "(One file extension in one line)",
                "ja": "(1種類のファイル名拡張子に対して1行)",
            },
            apply: {
                "zh-TW": "套用",
                "en": "Apply",
                "ja": "適用",
            },
            step2: {
                "zh-TW": "步驟2、選擇預設應用程式",
                "en": "Step 2: Modify the default apps",
                "ja": "Step 2: 既定のアプリの選択",
            },
            step2Subtitle: {
                "zh-TW": "開啟系統設定，將「相片檢視器」修改成「Tiefsee」",
                "en": `Go to the "Windows Settings" and change the "Photo Viewer" to "Tiefsee"`,
                "ja": "「Windows の設定」から「フォトビューアー」を「Tiefsee」に変更する",
            },
            openSystemSettings: {
                "zh-TW": "開啟 系統設定",
                "en": `Open "Windows Settings"`,
                "ja": "「Windows の設定」を開く",
            },
            removeAssociation: {
                "zh-TW": "解除預設程式",
                "en": `Remove Association`,
                "ja": "関連付けを解除する",
            },
            removeFileTypeAssociation: {
                "zh-TW": "解除副檔名關聯",
                "en": `Remove file type association`,
                "ja": "拡張子の関連付けを解除する",
            },
        },
        //#endregion

        //#region 進階設定

        // 清理暫存資料
        clearTempData: {
            title: {
                "zh-TW": "清理暫存資料",
                "en": "Clear Temporary Data",
                "ja": "キャッシュを削除",
            },
            clear: {
                "zh-TW": "清理",
                "en": "Clear",
                "ja": "削除",
            },
        },

        // 效能
        performance: {
            title: {
                "zh-TW": "效能",
                "en": "Performance",
                "ja": "パフォーマンス",
            },

            disabledDirectoryPanel: {
                "zh-TW": "資料夾數量太多時，停用「資料夾預覽面板」",
                "en": `Disable "Folder Panel" when there are too many directories`,
                "ja": "フォルダが多すぎる場合は「フォルダパネル」を無効化する",
            },
            alwaysDisable: {
                "zh-TW": "一律停用",
                "en": "Always disable",
                "ja": "常に無効にする",
            },
            disableWhenGreaterThan: {
                "zh-TW": "大於 {v} 時停用",
                "en": "Disable when greater than {v}",
                "ja": "{v} 以上の場合は無効にする",
            },
            alwaysEnable: {
                "zh-TW": "一律啟用",
                "en": "Always enable",
                "ja": "常に有効にする",
            },

            useCreateImageBitmap: {
                "zh-TW": "圖片面積過大時，停用高品質縮放",
                "en": "Disable high-quality scaling when the image area is too large",
                "ja": "画像が大きすぎる場合、高品質のスケーリングを無効にする"
            },
            disableWhenGreaterThanSquare: {
                "zh-TW": "大於 {v} x {v} 時停用",
                "en": "Disable when greater than {v} x {v}",
                "ja": "{v} x {v} 以上の場合は無効にする",
            },

            useLibvips: {
                "zh-TW": "圖片縮放閾值：當圖片縮小至特定比例以下，就重新處理圖片以確保品質。(設定值愈高，圖片品質愈好，但處理時間也會相對增加)",
                "en": "Image Scaling Threshold: When the image is reduced to a certain ratio, it is reprocessed to ensure quality. (The higher the setting, the better the image quality, but the processing time will also increase)",
                "ja": "画像スケーリング閾値：画像が特定の比率まで縮小されたとき、品質を確保するために再処理されます。(設定値が高いほど、画像品質は良くなりますが、処理時間も増えます)"
            },

            bulkViewImgMaxCount: {
                "zh-TW": "大量瀏覽模式一頁顯示的圖片數量。(範圍:1~300、預設:100、設定太高可能造成卡頓)",
                "en": "Number of images displayed per page in Bulk View mode. (range: 1~300, default: 100, setting too high may cause stuttering)",
                "ja": "バルクビューモードで1ページに表示される画像の数。(範囲:1〜300、デフォルト:100、設定が高すぎるとカクつきが発生する可能性があります)",
            },

        },

        // 實驗性功能
        experimentalFeatures: {
            title: {
                "zh-TW": "實驗性功能",
                "en": "Experimental Features",
                "ja": "実験的な機能",
            },
        },

        // 重設設定
        reset: {
            resetSettings: {
                "zh-TW": "重設設定",
                "en": "Reset settings",
                "ja": "設定をリセット",
            },
            restoreDefaultSettings: {
                "zh-TW": "將設定還原為其預設值",
                "en": "Restore default settings",
                "ja": "デフォルト設定に戻す",
            },
        },

        // Tiefsee 伺服器
        localhostServer: {
            port: {
                "zh-TW": "Port (如果已經被使用，則會使用下一個號碼)",
                "en": "Port (If the port is occupied, the next number is used)",
                "ja": "Port (ポートが占有されている場合は、次の番号が使用されます)",
            },
        },

        // 相關檔案
        relatedSettings: {
            title: {
                "zh-TW": "相關連結",
                "en": "Related Links",
                "ja": "関連リンク",
            },
            appData: {
                "zh-TW": "AppData (設定檔)",
                "en": "AppData (Config Files)",
                "ja": "AppData (設定ファイル)",
            },
            www: {
                "zh-TW": "www (原始碼)",
                "en": "www (Code)",
                "ja": "www (コード)",
            },
            temporaryDirectory: {
                "zh-TW": "暫存資料夾",
                "en": "Temporary Folder",
                "ja": "キャッシュフォルダ",
            },

        },

        //#endregion

        //#region 關於
        about: {
            version: {
                "zh-TW": "版本:",
                "en": "Version:",
                "ja": "バージョン:",
            },
            developer: {
                "zh-TW": "開發者:",
                "en": "Developer:",
                "ja": "開発者:",
            },
            repository: {
                "zh-TW": "儲存庫:",
                "en": "Repository:",
                "ja": "リポジトリ:",
            },
            softwareUpdates: {
                "zh-TW": "軟體更新:",
                "en": "Software Updates:",
                "ja": "アップデート:",
            },
        },
        //#endregion

        //#region 擴充套件
        plugin: {
            pluginList: {
                "zh-TW": "擴充套件清單",
                "en": "Plugin List",
                "ja": "プラグイン一覧",
            },
            quickLook: {
                "zh-TW": "在桌面或資料夾選中任一檔案，然後長按空白鍵，即可預覽檔案",
                "en": "Select a file on the desktop or in a folder and then press and hold the spacebar to preview the file",
                "ja": "デスクトップまたはフォルダー内のファイルを選択して、スペースバーを長押しすると、ファイルがプレビューされます",
            },
            monacoEditor: {
                "zh-TW": "讓 Tiefsee 使用 monaco-editor 來載入文字檔。常用於閱讀與編輯程式碼",
                "en": "Let Tiefsee use monaco-editor to load text files. Commonly used for reading and editing code",
                "ja": "Tiefsee に monaco-editor を使って、テキストファイルを読み込ませる。 コードの読み取りと編集によく使われる",
            },
            webviewer: {
                "zh-TW": "讓 Tiefsee 支援「doc、docx、ppt、pptx」",
                "en": `Let Tiefsee support "doc, docx, ppt, pptx"`,
                "ja": "Tiefsee に「doc, docx, ppt, pptx」をサポートさせる",
            },
            nConvert: {
                "zh-TW": "讓 Tiefsee 支援「Clip Studio Paint」產生的「clip 檔」",
                "en": `Let Tiefsee support "clip file" generated by "Clip Studio Paint"`,
                "ja": `Tiefsee に「Clip Studio Paint」で生成された「clip ファイル」をサポートさせる`,
            },
            installationSteps: {
                "zh-TW": "安裝步驟",
                "en": "Installation Steps",
                "ja": "インストール手順",
            },
            step1: {
                "zh-TW": "1、在「Tiefsee Plugin」的網頁下載擴充套件",
                "en": `1. Download the Plugin from the "Tiefsee Plugin" webpage`,
                "ja": `1. 「Tiefsee Plugin」サイトよりダウンロードプラグイン`,
            },
            openPluginWebpage: {
                "zh-TW": "開啟「Tiefsee Plugin」網頁",
                "en": `Open the "Tiefsee Plugin" webpage`,
                "ja": `「Tiefsee Plugin」のウェブサイトを開く`,
            },
            step2: {
                "zh-TW": "2、把ZIP解壓縮，然後放到「Plugin」資料夾內",
                "en": `2. Unzip the ZIP and put it in the "Plugin" folder`,
                "ja": `2. ZIPを解凍し、「Plugin」フォルダに配置する`,
            },
            openPluginDir: {
                "zh-TW": "開啟「Plugin」資料夾",
                "en": `Open the "Plugin" folder`,
                "ja": "「Plugin」フォルダを開く",
            },
            step3: {
                "zh-TW": "3、重新啟動 Tiefsee",
                "en": "3. Restart Tiefsee",
                "ja": "3. Tiefsee を再起動する",
            },
            restartTiefsee: {
                "zh-TW": "重新啟動 Tiefsee",
                "en": "Restart Tiefsee",
                "ja": "Tiefsee を再起動する",
            },
            example: {
                "zh-TW": "(示意圖)",
                "en": "(Example)",
                "ja": "(例)",
            },
        },
        //#endregion

        //#region 快速預覽
        quickLook: {
            title: {
                "zh-TW": "在 桌面 或 資料夾 快速預覽檔案",
                "en": "Quick preview of file on the desktop or in the folder",
                "ja": "デスクトップやフォルダー内のファイルをすばやくプレビューできる",
            },
            subtitle: {
                "zh-TW": "「啟動模式」如果為「直接啟動」則無法使用 QuickLook",
                "en": `QuickLook is not available if the "Startup Mode" is "Normal Startup"`,
                "ja": `「起動モード」が 「通常起動」の場合、QuickLook は使用できません`,
            },
            notInstalledQuickLook: {
                "zh-TW": "必須安裝擴充套件「QuickLook」才能使用此功能",
                "en": `The "QuickLook" Plugin must be installed to use this feature`,
                "ja": `この機能を使用するには、「QuickLook」プラグインをインストールする必要があります`,
            },
            longPressSpacebar: {
                "zh-TW": "長按「空白鍵」觸發",
                "en": `Long press "Space bar" to take effect`,
                "ja": `「スペースバー」を長押しすると有効になります`,
            },
            longPressMousewheel: {
                "zh-TW": "長按「滑鼠滾輪」觸發",
                "en": `Long press "Mouse Wheel" to take effect`,
                "ja": `「マウスホイール」を長押しすると有効になります`,
            },
        },
        //#endregion

    },

    menu: {

        //#region 工具列
        layout: {
            "zh-TW": "佈局",
            "en": "Layout",
            "ja": "レイアウト",
        },
        back: {
            "zh-TW": "返回",
            "en": "Back",
            "ja": "戻る",
        },
        exitFullScreen: {
            "zh-TW": "結束全螢幕",
            "en": "Exit Full Screen",
            "ja": "全画面表示を終了する",
        },

        prevFile: {
            "zh-TW": "上一個檔案",
            "en": "Prev File",
            "ja": "前のファイル",
        },
        nextFile: {
            "zh-TW": "下一個檔案",
            "en": "Next File",
            "ja": "次のファイル",
        },
        openFile: {
            "zh-TW": "載入檔案",
            "en": "Open File",
            "ja": "ファイルを開く",
        },
        openClipboard: {
            "zh-TW": "載入剪貼簿內容",
            "en": "Open Clipboard",
            "ja": "クリップボードを開く",
        },
        showMenuFile: {
            "zh-TW": "檔案",
            "en": "File",
            "ja": "ファイル",
        },
        prevDir: {
            "zh-TW": "上一個資料夾",
            "en": "Prev Folder",
            "ja": "前のフォルダ",
        },
        nextDir: {
            "zh-TW": "下一個資料夾",
            "en": "Next Folder",
            "ja": "次のフォルダ",
        },
        showMenuSort: {
            "zh-TW": "排序",
            "en": "Sort",
            "ja": "ソート",
        },
        showMenuCopy: {
            "zh-TW": "複製",
            "en": "Copy",
            "ja": "コピー",
        },
        dragDropFile: {
            "zh-TW": "快速拖曳",
            "en": "Quick Drag File",
            "ja": "クイックドラッグ",
        },
        showDeleteFileMsg: {
            "zh-TW": "刪除檔案",
            "en": "Delete File",
            "ja": "ファイルの削除",
        },
        showDeleteDirMsg: {
            "zh-TW": "刪除資料夾",
            "en": "Delete Folder",
            "ja": "フォルダを削除",
        },
        showMenuImageSearch: {
            "zh-TW": "搜圖",
            "en": "Image Search",
            "ja": "画像検索",
        },
        bulkView: {
            "zh-TW": "大量瀏覽模式",
            "en": "Bulk View",
            "ja": "バルクビュー",
        },
        showSetting: {
            "zh-TW": "設定",
            "en": "Setting",
            "ja": "設定",
        },
        showMenuRotation: {
            "zh-TW": "旋轉與鏡像",
            "en": "Rotation",
            "ja": "回転",
        },
        zoomToFit: {
            "zh-TW": "縮放至適合視窗",
            "en": "Zoom to Fit",
            "ja": "ズームトゥフィット",
        },
        zoomIn: {
            "zh-TW": "放大",
            "en": "Zoom In",
            "ja": "拡大",
        },
        zoomOut: {
            "zh-TW": "縮小",
            "en": "Zoom Out",
            "ja": "縮小",
        },
        infoZoomRatio: {
            "zh-TW": "縮放比例",
            "en": "Zoom Ratio",
            "ja": "ズーム倍率",
        },
        infoSize: {
            "zh-TW": "寬度 / 高度",
            "en": "Width / Height",
            "ja": "幅 / 高さ",
        },
        infoType: {
            "zh-TW": "檔案類型 / 檔案大小",
            "en": "File Format / File Size",
            "ja": "ファイル形式 / ファイルサイズ",
        },
        infoWriteTime: {
            "zh-TW": "修改日期",
            "en": "Last Write Time",
            "ja": "更新日時",
        },
        showSave: {
            "zh-TW": "儲存檔案",
            "en": "Save",
            "ja": "アーカイブ",
        },
        showBulkViewSetting: {
            "zh-TW": "大量瀏覽模式設定",
            "en": "Bulk View Settings",
            "ja": "バルクビュー設定",
        },
        reload: {
            "zh-TW": "重新載入",
            "en": "Reload",
            "ja": "リロード",
        },
        //#endregion


        //#region 下拉選單 檔案
        openNewWindow: {
            "zh-TW": "另開視窗",
            "en": "Open New Window",
            "ja": "新しいウィンドウで開く",
        },

        revealInFileExplorer: {
            "zh-TW": "在檔案總管中顯示",
            "en": "Reveal in File Explorer",
            "ja": "エクスプローラーで表示",
        },
        revealInFileExplorerFile: {
            "zh-TW": "在檔案總管中顯示檔案",
            "en": "Reveal File in File Explorer",
            "ja": `
                <span style="letter-spacing:-2px">
                    ファイルをエクスプローラーで表示
                </span>`,
        },
        revealInFileExplorerDir: {
            "zh-TW": "在檔案總管中顯示資料夾",
            "en": "Reveal Folder in File Explorer",
            "ja": `
                <span style="letter-spacing:-2px">
                    フォルダをエクスプローラーで表示
                </span>`,
        },

        systemContextMenu: {
            "zh-TW": "系統選單",
            "en": "System Context Menu",
            "ja": "コンテキストメニュー",
        },
        systemContextMenuFile: {
            "zh-TW": "檔案系統選單",
            "en": "File System Context Menu",
            "ja": `
                <span style="letter-spacing:-4px">
                    ファイルのシステムコンテキストメニュー
                </span>`,
        },
        systemContextMenuDir: {
            "zh-TW": "資料夾系統選單",
            "en": "Folder System Context Menu",
            "ja": `
                <span style="letter-spacing:-4px;">
                    フォルダのシステムコンテキストメニュー
                </span>`,
        },

        renameFile: {
            "zh-TW": "重新命名檔案",
            "en": "Rename File",
            "ja": "ファイルの名前を変更",
        },
        renameDir: {
            "zh-TW": "重新命名資料夾",
            "en": "Rename Folder",
            "ja": "フォルダの名前を変更",
        },
        print: {
            "zh-TW": "列印",
            "en": "Print",
            "ja": "印刷",
        },
        setAsDesktop: {
            "zh-TW": "設成桌布",
            "en": "Set as Desktop Background",
            "ja": "壁紙に設定",
        },
        openWith: {
            "zh-TW": "用其他程式開啟",
            "en": "Open with…",
            "ja": "別のアプリで開く…",
        },
        //#endregion


        //#region 下拉選單 複製
        copyFile: {
            "zh-TW": "複製檔案",
            "en": "Copy File",
            "ja": "コピーファイル",
        },
        copyFileName: {
            "zh-TW": "複製檔名",
            "en": "Copy File Name",
            "ja": "コピーファイル名",
        },
        copyDirName: {
            "zh-TW": "複製資料夾名",
            "en": "Copy Folder Name",
            "ja": "コピーフォルダ名",
        },
        copyFilePath: {
            "zh-TW": "複製檔案路徑",
            "en": "Copy File Path",
            "ja": "コピーファイルパス",
        },
        copyDirPath: {
            "zh-TW": "複製資料夾路徑",
            "en": "Copy Folder Path",
            "ja": "コピーフォルダパス",
        },
        copyImage: {
            "zh-TW": "複製影像",
            "en": "Copy Image",
            "ja": "コピー画像",
        },
        copyImageBase64: {
            "zh-TW": "複製影像 Base64",
            "en": "Copy Image Base64",
            "ja": "コピー画像 Base64",
        },
        copyBase64: {
            "zh-TW": "複製 Base64",
            "en": "Copy Base64",
            "ja": "コピー Base64",
        },
        copyText: {
            "zh-TW": "複製文字",
            "en": "Copy Text",
            "ja": "コピーテキスト",
        },
        //#endregion


        //#region 下拉選單 複製
        rotateCw: {
            "zh-TW": "順時針90°",
            "en": "90° Clockwise",
            "ja": "右に回転",
        },
        rotateCcw: {
            "zh-TW": "逆時針90°",
            "en": "90° Counter Clockwise",
            "ja": "左に回転",
        },
        flipHorizontal: {
            "zh-TW": "水平鏡像",
            "en": "Flip Horizontal",
            "ja": "水平方向に反転",
        },
        flipVertical: {
            "zh-TW": "垂直鏡像",
            "en": "Flip Vertical",
            "ja": "垂直方向に反転",
        },
        initialRotation: {
            "zh-TW": "初始化旋轉",
            "en": "Initial Rotation",
            "ja": "回転をリセットする",
        },
        //#endregion


        //#region 下拉選單 排序
        fileSortBy: {
            "zh-TW": "檔案排序方式",
            "en": "File Sort by",
            "ja": "ファイルソート方式",
        },
        directorySortBy: {
            "zh-TW": "資料夾排序方式",
            "en": "Folder Sort by",
            "ja": "フォルダソート方式",
        },
        name: {
            "zh-TW": "檔名",
            "en": "File Name",
            "ja": "ファイル名",
        },
        lastWriteTime: {
            "zh-TW": "修改日期",
            "en": "Last Write Time",
            "ja": "更新日時",
        },
        lastAccessTime: {
            "zh-TW": "存取日期",
            "en": "Last Access Time",
            "ja": "アクセス日時",
        },
        creationTime: {
            "zh-TW": "建立日期",
            "en": "Creation Time",
            "ja": "作成日時",
        },
        length: {
            "zh-TW": "檔案大小",
            "en": "File Size",
            "ja": "ファイルサイズ",
        },
        random: {
            "zh-TW": "隨機",
            "en": "Random",
            "ja": "ランダム",
        },
        asc: {
            "zh-TW": "遞增",
            "en": "Ascending",
            "ja": "昇順",
        },
        desc: {
            "zh-TW": "遞減",
            "en": "Descending",
            "ja": "降順",
        },
        //#endregion


        //#region 右鍵選單 圖片
        deleteFile: {
            "zh-TW": "刪除檔案",
            "en": "Delete File",
            "ja": "ファイルを削除",
        },
        deleteDir: {
            "zh-TW": "刪除資料夾",
            "en": "Delete Folder",
            "ja": "フォルダを削除",
        },
        setting: {
            "zh-TW": "設定",
            "en": "Setting",
            "ja": "設定",
        },
        help: {
            "zh-TW": "說明",
            "en": "Help",
            "ja": "ヘルプ",
        },
        exit: {
            "zh-TW": "關閉程式",
            "en": "Exit",
            "ja": "退出",
        },
        //#endregion


        //#region 下拉選單 layout
        fullScreen: {
            "zh-TW": "全螢幕",
            "en": "Full Screen",
            "ja": "全画面表示",
        },
        topmost: {
            "zh-TW": "視窗固定最上層",
            "en": "Window Always on Top",
            "ja": "ウィンドウを常に最前面に表示",
        },
        showToolbar: {
            "zh-TW": "工具列",
            "en": "Toolbar",
            "ja": "ツールバー",
        },
        showFilePanel: {
            "zh-TW": "檔案預覽面板",
            "en": "File Panel",
            "ja": "ファイルパネル",
        },
        showDirectoryPanel: {
            "zh-TW": "資料夾預覽面板",
            "en": "Folder Panel",
            "ja": "フォルダパネル",
        },
        showInformationPanel: {
            "zh-TW": "詳細資料面板",
            "en": "Information Panel",
            "ja": "情報パネル",
        },
        //#endregion


        //#region 右鍵選單 輸入框
        cut: {
            "zh-TW": "剪下",
            "en": "Cut",
            "ja": "切り取り",
        },
        copy: {
            "zh-TW": "複製",
            "en": "Copy",
            "ja": "コピー",
        },
        paste: {
            "zh-TW": "貼上",
            "en": "Paste",
            "ja": "貼り付け",
        },
        selectAll: {
            "zh-TW": "全選",
            "en": "Select All",
            "ja": "すべて選択",
        },
        //#endregion


        //#region 詳細資料面板
        information: {
            "zh-TW": "資訊",
            "en": "Information",
            "ja": "情報",
        },
        relatedFiles: {
            "zh-TW": "相關檔案",
            "en": "Related Files",
            "ja": "関連ファイル",
        },
        new: {
            "zh-TW": "新增",
            "en": "New",
            "ja": "新機能",
        },
        edit: {
            "zh-TW": "編輯",
            "en": "Edit",
            "ja": "編集",
        },
        formatJson: {
            "zh-TW": "格式化 JSON",
            "en": "Format JSON",
            "ja": "JSON をフォーマット",
        },
        expand: {
            "zh-TW": "展開",
            "en": "Expand",
            "ja": "展開する",
        },
        collapse: {
            "zh-TW": "折疊",
            "en": "Collapse",
            "ja": "折りたたむ",
        },
        export: {
            "zh-TW": "匯出",
            "en": "Export",
            "ja": "エクスポート",
        },
        //#endregion

    },

    bulkView: {
        columns: {
            "zh-TW": "每行圖片數",
            "en": "Images per Row",
            "ja": "行ごとの画像数",
        },
        waterfall: {
            "zh-TW": "瀑布流",
            "en": "Waterfall Layout",
            "ja": "ウォーターフォールレイアウト",
        },
        gaplessMode: {
            "zh-TW": "無間距模式",
            "en": "Gapless Mode",
            "ja": "ギャップレスモード",
        },
        fixedWidth: {
            "zh-TW": "鎖定寬度",
            "en": "Fixed Width",
            "ja": "固定幅",
        },
        align: {
            "zh-TW": "排列方向",
            "en": "Alignment Direction",
            "ja": "配置方向",
        },
        indentation: {
            "zh-TW": "第一張圖縮排",
            "en": "First Image Indentation",
            "ja": "最初の画像のインデント",
        },
        enable: {
            "zh-TW": "啟用",
            "en": "Enable",
            "ja": "有効にする",
        },
        vertical: {
            "zh-TW": "垂直",
            "en": "Vertical",
            "ja": "垂直",
        },
        horizontal: {
            "zh-TW": "水平",
            "en": "Horizontal",
            "ja": "水平",
        },
        disable: {
            "zh-TW": "關閉",
            "en": "Disable",
            "ja": "無効にする",
        },
        leftToRight: {
            "zh-TW": "左至右",
            "en": "Left to Right",
            "ja": "左から右",
        },
        rightToLeft: {
            "zh-TW": "右至左",
            "en": "Right to Left",
            "ja": "右から左",
        },
        displayedInformation: {
            "zh-TW": "顯示的資訊",
            "en": "Displayed Information",
            "ja": "表示される情報",
        },
        number: {
            "zh-TW": "編號",
            "en": "Number",
            "ja": "番号",
        },
        fileName: {
            "zh-TW": "檔名",
            "en": "File Name",
            "ja": "ファイル名",
        },
        imageSize: {
            "zh-TW": "圖片尺寸",
            "en": "Image Size",
            "ja": "画像サイズ",
        },
        fileSize: {
            "zh-TW": "檔案大小",
            "en": "File Size",
            "ja": "ファイルサイズ",
        },
        lastWriteDate: {
            "zh-TW": "修改日期",
            "en": "Last Write Date",
            "ja": "更新日",
        },
        lastWriteTime: {
            "zh-TW": "修改時間",
            "en": "Last Write Time",
            "ja": "更新時間",
        },
    },

    msg: {

        yes: {
            "zh-TW": "是",
            "en": "Yes",
            "ja": "はい",
        },
        no: {
            "zh-TW": "否",
            "en": "No",
            "ja": "いいえ",
        },

        imageNotFound: {
            "zh-TW": "未檢測到圖片",
            "en": "Image not found",
            "ja": "画像が検出されない",
        },

        notFound: {
            "zh-TW": "未找到",
            "en": "Not found",
            "ja": "検出されない",
        },

        reloadFile: {
            "zh-TW": "檔案已被修改，要重新載入此檔案嗎？",
            "en": "The file has been changed, do you want to reload this file?",
            "ja": "ファイルが変更されました。このファイルを再読み込みしますか？",
        },

        cannotOpenClipboard: {
            "zh-TW": "無法開啟剪貼簿的內容",
            "en": "Cannot open the contents of the clipboard",
            "ja": "クリップボードの内容を開くことができません",
        },

        imageAnalysisFailed: {
            "zh-TW": "圖片解析失敗",
            "en": "Image analysis failed",
            "ja": "画像解析に失敗しました",
        },

        //#region download
        fileDownloadFailed: {
            "zh-TW": "檔案下載失敗",
            "en": "File download failed",
            "ja": "ファイルのダウンロードに失敗",
        },
        unsupportedFileTypes: {
            "zh-TW": "不支援的檔案類型",
            "en": "Unsupported file types",
            "ja": "対応していないファイル形式です",
        },
        fileSizeExceededLimit: {
            "zh-TW": "檔案大小超過限制",
            "en": "File size exceeded limit",
            "ja": "ファイルサイズが制限を超えた",
        },
        downloadImages: {
            "zh-TW": "此操作將下載 {n} 張圖片，是否繼續？",
            "en": "This operation will download {n} images, do you want to continue?",
            "ja": "{n} 枚の画像をダウンロードしますか？",
        },
        //#endregion

        //#region 文字編輯器
        saveComplete: {
            "zh-TW": "儲存完成",
            "en": "Save complete",
            "ja": "保存完了",
        },
        saveFailed: {
            "zh-TW": "儲存失敗",
            "en": "Save failed",
            "ja": "保存に失敗",
        },
        formattingFailed: {
            "zh-TW": "格式化失敗",
            "en": "Formatting Failed",
            "ja": "フォーマットに失敗しました",
        },
        //#endregion

        //#region copy
        copyFile: {
            "zh-TW": "已將「檔案」複製至剪貼簿",
            "en": ` "File" copying completed`,
            "ja": "コピー「ファイル」完了",
        },
        copyFileName: {
            "zh-TW": "已將「檔案名稱」複製至剪貼簿",
            "en": `"File Name" copying completed`,
            "ja": "コピー「ファイル名」完了",
        },
        copyDirName: {
            "zh-TW": "已將「資料夾名稱」複製至剪貼簿",
            "en": `"Folder Name" copying completed`,
            "ja": "コピー「フォルダ名」完了",
        },
        copyImage: {
            "zh-TW": "已將「影像」複製至剪貼簿",
            "en": `"Image" copying completed`,
            "ja": "コピー「画像」完了",
        },
        copyFilePath: {
            "zh-TW": "已將「檔案路徑」複製至剪貼簿",
            "en": `"File Path" copying completed`,
            "ja": "コピー「ファイルパス」完了",
        },
        copyDirPath: {
            "zh-TW": "已將「資料夾路徑」複製至剪貼簿",
            "en": `"Folder Path" copying completed`,
            "ja": "コピー「フォルダパス」完了",
        },
        copyIamgeBase64: {
            "zh-TW": "已將「影像 Base64」複製至剪貼簿",
            "en": `"Iamge Base64" copying completed`,
            "ja": "コピー「画像 Base64」完了",
        },
        copyBase64: {
            "zh-TW": "已將「Base64」複製至剪貼簿",
            "en": `"Base64" copying completed`,
            "ja": "コピー「Base64」完了",
        },
        copyText: {
            "zh-TW": "已將「文字」複製至剪貼簿",
            "en": `"Text" copying completed`,
            "ja": "コピー「テキスト」完了",
        },
        copyExif: {
            "zh-TW": "已將「{v}」複製至剪貼簿",
            "en": `"{v}" copying completed`,
            "ja": "コピー「{v}」完了",
        },
        //#endregion

        //#region 重新命名
        renameFile: {
            "zh-TW": "重新命名檔案",
            "en": "Rename File",
            "ja": "ファイルの名前を変更",
        },
        renameDir: {
            "zh-TW": "重新命名資料夾",
            "en": "Rename Folder",
            "ja": "フォルダの名前を変更",
        },
        nameIsEmpty: {
            "zh-TW": "必須輸入檔名",
            "en": "Must have file name",
            "ja": "ファイル名が必要です",
        },
        nameContainsUnavailableChar: {
            "zh-TW": "檔案名稱不可以包含下列任意字元：",
            "en": "The file name cannot contain the following characters:",
            "ja": "ファイル名に次の文字は使えません：",
        },
        renamingFailure: {
            "zh-TW": "重新命名失敗：",
            "en": "Renaming Failure:",
            "ja": "名前変更が失敗：",
        },
        wrongPath: {
            "zh-TW": "路徑異常",
            "en": "Wrong path",
            "ja": "無効なパス",
        },
        //#endregion

        //#region 刪除檔案
        deleteFile: {
            "zh-TW": "刪除檔案",
            "en": "Delete File",
            "ja": "ファイルを削除",
        },
        deleteDir: {
            "zh-TW": "刪除資料夾",
            "en": "Delete Folder",
            "ja": "フォルダを削除",
        },
        fileToRecycleBin: {
            "zh-TW": "移至資源回收桶",
            "en": "Move to Recycle Bin",
            "ja": "ごみ箱へ移動",
        },
        fileToPermanentlyDelete: {
            "zh-TW": "永久刪除",
            "en": "Permanently Delete",
            "ja": "完全に削除",
        },
        fileToRecycleBinCompleted: {
            "zh-TW": "已完成「移至資源回收桶」",
            "en": `"Move to Tecycle Bin" completed`,
            "ja": "「ごみ箱へ移動」完了",
        },
        fileToPermanentlyDeleteCompleted: {
            "zh-TW": "已完成「永久刪除」",
            "en": `"Permanently Delete" completed`,
            "ja": "「完全に削除」完了",
        },
        fileDeletionFailed: {
            "zh-TW": "刪除失敗",
            "en": "deletion failed",
            "ja": "削除失敗",
        },
        //#endregion

        //#region 搜圖
        imageSearchFailed: {
            "zh-TW": "圖片搜尋失敗",
            "en": "Image search failed",
            "ja": "画像検索に失敗",
        },
        //#endregion

        //#region setting
        associationExtension: {
            "zh-TW": "確定用 Tiefsee 來開啟這些檔案嗎？",
            "en": "Are you sure you want to open these files with Tiefsee?",
            "ja": "これらのファイルを開くのに Tiefsee を使用するのは確かですか？",
        },
        removeAssociationExtension: {
            "zh-TW": "確定要解除這些檔案與 Tiefsee 的關聯嗎？",
            "en": "Are you sure you want to remove the association of these files with Tiefsee?",
            "ja": "これらのファイルを Tiefsee との関連付けから解除してよろしいですか？",
        },
        done: {
            "zh-TW": "完成！",
            "en": "Done!",
            "ja": "完了！",
        },
        tempDeleteCompleted: {
            "zh-TW": "暫存資料清理完成",
            "en": "Temporary data cleanup completed",
            "ja": "キャッシュ削除完了",
        },

        enabledByPolicy: {
            "zh-TW": "變更失敗，此設定被系統政策啟用",
            "en": "Change failed, this setting is enabled by system policy",
            "ja": "変更に失敗しました。この設定はシステムポリシーによって有効になっています",
        },
        disabledByPolicy: {
            "zh-TW": "變更失敗，此設定被系統政策禁用",
            "en": "Change failed, this setting is disabled by system policy",
            "ja": "変更に失敗しました。この設定はシステムポリシーによって無効になっています",
        },
        disabledByUser: {
            "zh-TW": "變更失敗，此設定被使用者禁用",
            "en": "Change failed, this setting is disabled by the user",
            "ja": "変更に失敗しました。この設定はユーザーによって無効にされています",
        },

        resetSettings: {
            "zh-TW": "確定要將 Tiefsee 的所有設定恢復成預設值嗎？<br>(不會影響擴充套件與檔案排序)",
            "en": "Are you sure you want to restore all Tiefsee settings to their default values? <br>(This will not affect Plugin and File Sorting)",
            "ja": "Tiefsee のすべての設定をデフォルト値に戻してもよろしいですか？<br>（プラグインやファイルソートには影響しません）",
        },
        //#endregion
    },

    exif: {

        name: {
            "Date/Time Original": {
                "zh-TW": "拍攝日期",
                "en": "Date Time Original",
                "ja": "撮影日時",
            },
            "Windows XP Keywords": {
                "zh-TW": "標籤",
                "en": "Keywords",
                "ja": "タグ",
            },
            "Rating": {
                "zh-TW": "評等",
                "en": "Rating",
                "ja": "評価",
            },
            "Image Width/Height": {
                "zh-TW": "圖片尺寸",
                "en": "Image Size",
                "ja": "画像サイズ",
            },
            "Length": {
                "zh-TW": "檔案大小",
                "en": "File Size",
                "ja": "ファイルサイズ",
            },
            "Windows XP Title": {
                "zh-TW": "標題",
                "en": "Title",
                "ja": "タイトル",
            },
            "Artist": {
                "zh-TW": "作者",
                "en": "Artist",
                "ja": "作成者",
            },
            "Copyright": {
                "zh-TW": "版權",
                "en": "Copyright",
                "ja": "著作権",
            },
            "Image Description": {
                "zh-TW": "描述",
                "en": "Description",
                "ja": "説明",
            },
            "Windows XP Comment": {
                "zh-TW": "註解",
                "en": "Comment",
                "ja": "コメント",
            },
            "User Comment": {
                "zh-TW": "註解",
                "en": "Comment",
                "ja": "コメント",
            },
            "Comment": {
                "zh-TW": "註解",
                "en": "Comment",
                "ja": "コメント",
            },
            "Make": {
                "zh-TW": "相機製造商",
                "en": "Make",
                "ja": "カメラの製造元",
            },
            "Model": {
                "zh-TW": "相機型號",
                "en": "Model",
                "ja": "カメラのモデル",
            },
            "Lens Model": {
                "zh-TW": "鏡頭型號",
                "en": "Lens Model",
                "ja": "レンズモデル",
            },
            "Windows XP Subject": {
                "zh-TW": "主旨",
                "en": "Subject",
                "ja": "件名",
            },
            "F-Number": {
                "zh-TW": "光圈孔徑",
                "en": "F-Number",
                "ja": "絞り値",
            },
            "Exposure Time": {
                "zh-TW": "曝光時間",
                "en": "Exposure Time",
                "ja": "露出時間",
            },
            "ISO Speed Ratings": {
                "zh-TW": "ISO速度",
                "en": "ISO Speed Ratings",
                "ja": "ISO速度",
            },
            "Exposure Bias Value": {
                "zh-TW": "曝光補償",
                "en": "Exposure Bias Value",
                "ja": "露出補正",
            },
            "Focal Length": {
                "zh-TW": "焦距",
                "en": "Focal Length",
                "ja": "焦点距離",
            },
            "Max Aperture Value": {
                "zh-TW": "最大光圈",
                "en": "Max Aperture Value",
                "ja": "最大絞り",
            },
            "Metering Mode": {
                "zh-TW": "測光模式",
                "en": "Metering Mode",
                "ja": "測光モード",
            },
            "Flash": {
                "zh-TW": "閃光燈模式",
                "en": "Flash",
                "ja": "フラッシュモード",
            },
            "Focal Length 35": {
                "zh-TW": "35mm焦距",
                "en": "Focal Length 35",
                "ja": "35mm焦点距離",
            },
            "Orientation": {
                "zh-TW": "旋轉資訊",
                "en": "Orientation",
                "ja": "画像の向き",
            },
            "Software": {
                "zh-TW": "軟體",
                "en": "Software",
                "ja": "ソフトウェア",
            },

            // 影片 ----------

            "Video Duration": {
                "zh-TW": "影片長度",
                "en": "Video Length",
                "ja": "ビデオの長さ"
            },

            // Gif ----------

            "Frame Count": {
                "zh-TW": "總幀數",
                "en": "Frame Count",
                "ja": "フレーム数"
            },
            "Loop Count": {
                "zh-TW": "循環次數",
                "en": "Loop Count",
                "ja": "ループ回数"
            },

            // 每個檔案固定都會有的欄位 ----------

            "Creation Time": {
                "zh-TW": "建立日期",
                "en": "Creation Time",
                "ja": "作成日時",
            },
            "Last Write Time": {
                "zh-TW": "修改日期",
                "en": "Last Write Time",
                "ja": "更新日時",
            },
            "Last Access Time": {
                "zh-TW": "存取日期",
                "en": "Last Access Time",
                "ja": "アクセス日時",
            },
        },

        value: {
            "Metering Mode": {
                "Unknown": {
                    "zh-TW": "未知",
                    "en": "Unknown",
                    "ja": "不明",
                },
                "Average": {
                    "zh-TW": "平均測光",
                    "en": "Average",
                    "ja": "平均",
                },
                "Center weighted average": {
                    "zh-TW": "中央偏重平均測光",
                    "en": "Center weighted average",
                    "ja": "中央重点測光",
                },
                "Spot": {
                    "zh-TW": "測光",
                    "en": "Spot",
                    "ja": "スポット",
                },
                "Multi-spot": {
                    "zh-TW": "多點測光",
                    "en": "Multi-spot",
                    "ja": "マルチ スポット",
                },
                "Multi-segment": {
                    "zh-TW": "分區測光",
                    "en": "Multi-segment",
                    "ja": "パターン",
                },
                "Partial": {
                    "zh-TW": "局部測光",
                    "en": "Partial",
                    "ja": "部分",
                },
            },


            "Flash": {

                "0": {
                    "zh-TW": "無閃光燈",
                    "en": "Flash did not fire",
                    "ja": "フラッシュなし",
                },
                "1": {
                    "zh-TW": "閃光燈",
                    "en": "Flash fired",
                    "ja": "フラッシュ",
                },
                "5": {
                    "zh-TW": "閃光燈，無回應閃光",
                    "en": "Flash fired, return not detected",
                    "ja": "フラッシュ(ストロボの反射光なし)",
                },
                "7": {
                    "zh-TW": "閃光燈，回應閃光",
                    "en": "Flash fired, return detected",
                    "ja": "フラッシュ(ストロボの反射光あり)",
                },
                "9": {
                    "zh-TW": "閃光燈，強制",
                    "en": "Flash fired",
                    "ja": "フラッシュ(強制)",
                },
                "13": {
                    "zh-TW": "閃光燈，強制，無回應閃光",
                    "en": "Flash fired, return not detected",
                    "ja": "フラッシュ(強制、ストロボの反射光なし)",
                },
                "15": {
                    "zh-TW": "閃光燈，強制，回應閃光",
                    "en": "Flash fired, return detected",
                    "ja": "フラッシュ(強制、ストロボの反射光あり)",
                },
                "16": {
                    "zh-TW": "無閃光燈，強制",
                    "en": "Flash did not fire",
                    "ja": "フラッシュなし(強制)",
                },
                "24": {
                    "zh-TW": "無閃光燈，自動",
                    "en": "Flash did not fire, auto",
                    "ja": "フラッシュなし(自動)",
                },
                "25": {
                    "zh-TW": "閃光燈，自動",
                    "en": "Flash fired, auto",
                    "ja": "フラッシュ(自動)",
                },
                "29": {
                    "zh-TW": "閃光燈，自動，無回應閃光",
                    "en": "Flash fired, return not detected, auto",
                    "ja": "フラッシュ(自動、ストロボの反射光なし)",
                },
                "31": {
                    "zh-TW": "閃光燈，自動，回應閃光",
                    "en": "Flash fired, return detected, auto",
                    "ja": "フラッシュ(自動、ストロボの反射光あり)",
                },
                "32": {
                    "zh-TW": "無閃光燈功能",
                    "en": "Flash did not fire",
                    "ja": "フラッシュ機能なし",
                },
                "65": {
                    "zh-TW": "閃光燈，紅眼",
                    "en": "Flash fired, red-eye reduction",
                    "ja": "フラッシュ(赤目修整)",
                },
                "69": {
                    "zh-TW": "閃光燈，紅眼，無回應閃光",
                    "en": "Flash fired, return not detected, red-eye reduction",
                    "ja": "フラッシュ(赤目修盤、ストロボの反射光なし)",
                },
                "71": {
                    "zh-TW": "閃光燈，紅眼，回應閃光",
                    "en": "Flash fired, return detected, red-eye reduction",
                    "ja": "フラッシュ(赤目修整、ストロボの反射光あり)",
                },
                "73": {
                    "zh-TW": "閃光燈，強制，紅眼",
                    "en": "Flash fired, red-eye reduction",
                    "ja": "フラッシュ(強制、赤目修堅)",
                },
                "77": {
                    "zh-TW": "閃光燈，強制，紅眼，無回應閃光",
                    "en": "Flash fired, return not detected, red-eye reduction",
                    "ja": "フラッシュ(強制、赤目修盤、ストロボの反射光なし)",
                },
                "79": {
                    "zh-TW": "閃光燈，強制，紅眼，回應閃光",
                    "en": "Flash fired, return detected, red-eye reduction",
                    "ja": "フラッシュ(強制、赤目修整、ストロボの反射光あり",
                },
                "89": {
                    "zh-TW": "閃光燈，自動，紅眼",
                    "en": "Flash fired, auto, red-eye reduction",
                    "ja": "フラッシュ(自動、赤目修堅)",
                },
                "93": {
                    "zh-TW": "閃光燈，自動，無回應閃光，紅眼",
                    "en": "Flash fired, return not detected, auto, red-eye reduction",
                    "ja": "フラッシュ(自動、ストロボの反射光なし、赤目修盤)",
                },
                "95": {
                    "zh-TW": "閃光燈，自動，回應閃光，紅眼",
                    "en": "Flash fired, return detected, auto, red-eye reduction",
                    "ja": "フラッシュ(自動、ストロボの反射光あり、赤目修正)",
                },
            }
        },

    },

    script: {

        none: {
            "zh-TW": "無",
            "en": "None",
            "ja": "なし",
        },

        //#region 圖片
        image: {
            "zh-TW": "圖片",
            "en": "Image",
            "ja": "画像",
        },
        imageFitWindowOrImageOriginal: {
            "zh-TW": "縮放至適合視窗 or 圖片原始大小",
            "en": "Zoom to Fit or Image Original Size",
            "ja": "ズームトゥフィット or 画像原寸大",
        },
        switchFitWindowAndOriginal: {
            "zh-TW": "縮放至適合視窗/圖片原始大小 切換",
            "en": `Switch between "Zoom to Fit" and "Image Original Size"`,
            "ja": "ズームトゥフィット/画像原寸大 切り替え",
        },
        imageFitWindow: {
            "zh-TW": "強制縮放至適合視窗",
            "en": "Always Zoom to Fit",
            "ja": "常にズームトゥフィット",
        },
        imageOriginal: {
            "zh-TW": "圖片原始大小",
            "en": "Image Original Size",
            "ja": "画像原寸大",
        },
        imageZoomIn: "menu.zoomIn", //放大
        imageZoomOut: "menu.zoomOut", //縮小
        imageRotateCw: "menu.rotateCw", //順時針90°
        imageRotateCcw: "menu.rotateCcw", //逆時針90°
        imageFlipHorizontal: "menu.flipHorizontal", //水平鏡像
        imageFlipVertical: "menu.flipVertical", //垂直鏡像
        imageInitialRotation: "menu.initialRotation", //圖初始化旋轉
        imageMoveUp: {
            "zh-TW": "圖片向上移動",
            "en": "Move Image Up",
            "ja": "画像を上に移動"
        },
        imageMoveDown: {
            "zh-TW": "圖片向下移動",
            "en": "Move Image Down",
            "ja": "画像を下に移動"
        },
        imageMoveLeft: {
            "zh-TW": "圖片向左移動",
            "en": "Move Image Left",
            "ja": "画像を左に移動"
        },
        imageMoveRight: {
            "zh-TW": "圖片向右移動",
            "en": "Move Image Right",
            "ja": "画像を右に移動"
        },
        imageMoveUpOrPrevFile: {
            "zh-TW": "圖片向上移動 or 上一個檔案",
            "en": "Move Image Up or Prev File",
            "ja": "画像を上に移動 or 前のファイル"
        },
        imageMoveDownOrNextFile: {
            "zh-TW": "圖片向下移動 or 下一個檔案",
            "en": "Move Image Down or Next File",
            "ja": "画像を下に移動 or 次のファイル"
        },

        imageMoveLeftOrPrevFile: {
            "zh-TW": "圖片向左移動 or 上一個檔案",
            "en": "Move Image Left or Prev File",
            "ja": "画像を左に移動 or 前のファイル"
        },
        imageMoveRightOrNextFile: {
            "zh-TW": "圖片向右移動 or 下一個檔案",
            "en": "Move Image Right or Next File",
            "ja": "画像を右に移動 or 次のファイル"
        },
        imageMoveRightOrPrevFile: {
            "zh-TW": "圖片向右移動 or 上一個檔案",
            "en": "Move Image Right or Prev File",
            "ja": "画像を右に移動 or 前のファイル"
        },
        imageMoveLeftOrNextFile: {
            "zh-TW": "圖片向左移動 or 下一個檔案",
            "en": "Move Image Left or Next File",
            "ja": "画像を左に移動 or 次のファイル"
        },
        //#endregion

        //#region 檔案
        file: {
            "zh-TW": "檔案",
            "en": "File",
            "ja": "ファイル",
        },
        newWindow: "menu.openNewWindow", //另開視窗
        prevFile: "menu.prevFile", //上一個檔案
        nextFile: "menu.nextFile", //下一個檔案
        prevDir: "menu.prevDir", //上一個資料夾
        nextDir: "menu.nextDir", //下一個資料夾
        firstFile: {
            "zh-TW": "第一個檔案",
            "en": "First File",
            "ja": "最初のファイル"
        },
        lastFile: {
            "zh-TW": "最後一個檔案",
            "en": "Last File",
            "ja": "最後のファイル"
        },
        firstDir: {
            "zh-TW": "第一個資料夾",
            "en": "First Folder",
            "ja": "最初のフォルダ"
        },
        lastDir: {
            "zh-TW": "最後一個資料夾",
            "en": "Last Folder",
            "ja": "最後のフォルダ"
        },
        revealInFileExplorer: "menu.revealInFileExplorer", //在檔案總管中顯示
        systemContextMenu: "menu.systemContextMenu", //系統選單
        renameFile: "menu.renameFile", //重新命名
        openWith: "menu.openWith", //用其他程式開啟
        fileToRecycleBin: "msg.fileToRecycleBin", //移至資源回收桶
        fileToPermanentlyDelete: "msg.fileToPermanentlyDelete", //永久刪除
        //#endregion

        //#region 複製
        copy: {
            "zh-TW": "複製",
            "en": "Copy",
            "ja": "コピー",
        },
        copyFile: "menu.copyFile", //複製檔案
        copyFileName: "menu.copyFileName", //複製檔名
        copyDirName: "menu.copyDirName", //複製資料夾名
        copyFilePath: "menu.copyFilePath", //複製檔案路徑
        copyDirPath: "menu.copyDirPath", //複製資料夾路徑
        copyImage: "menu.copyImage", //複製影像
        copyImageBase64: "menu.copyImageBase64", //複製影像 Base64
        copyText: "menu.copyText", //複製文字
        //#endregion

        //#region 佈局
        layout: {
            "zh-TW": "佈局",
            "en": "Layout",
            "ja": "レイアウト",
        },
        maximizeWindow: {
            "zh-TW": "視窗最大化",
            "en": "Maximize Window",
            "ja": "ウィンドウを最大化",
        },
        topmost: "menu.topmost", //視窗固定最上層
        fullScreen: "menu.fullScreen", //全螢幕
        showToolbar: "menu.showToolbar", //工具列
        showFilePanel: "menu.showFilePanel", //檔案預覽面板
        showDirectoryPanel: "menu.showDirectoryPanel", //資料夾預覽面板
        showInformationPanel: "menu.showInformationPanel", //詳細資料面板
        //#endregion

        //#region 其他
        "other": {
            "zh-TW": "其他",
            "en": "Other",
            "ja": "その他",
        },
        back: "menu.back", //返回
        showSetting: "menu.showSetting", //設定
        //#endregion

        //#region 文字編輯器
        textEditor: {
            "zh-TW": "文字編輯器",
            "en": "Text Editor",
            "ja": "テキストエディタ"
        },
        save: {
            "zh-TW": "儲存檔案",
            "en": "Save",
            "ja": "アーカイブ",
        },
        //#endregion

        //#region 大量瀏覽模式

        bulkView: "menu.bulkView", //大量瀏覽模式
        prevPage: {
            "zh-TW": "上一頁",
            "en": "Previous Page",
            "ja": "前のページ"
        },
        nextPage: {
            "zh-TW": "下一頁",
            "en": "Next Page",
            "ja": "次のページ"
        },
        incrColumns: {
            "zh-TW": "增加「每行圖片數」",
            "en": "Increase 'Images per Row'",
            "ja": "「行ごとの画像数」を増やす"
        },
        decColumns: {
            "zh-TW": "減少「每行圖片數」",
            "en": "Decrease 'Images per Row'",
            "ja": "「行ごとの画像数」を減らす"
        },
        incrFixedWidth: {
            "zh-TW": "增加「鎖定寬度」",
            "en": "Increase 'Fixed Width'",
            "ja": "「固定幅」を増やす"
        },
        decFixedWidth: {
            "zh-TW": "減少「鎖定寬度」",
            "en": "Decrease 'Fixed Width'",
            "ja": "「固定幅」を減らす"
        }
        //#endregion

    },
}
