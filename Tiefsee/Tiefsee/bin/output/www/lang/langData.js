var langData = {

    //setting window
    sw: {

        reloadRequired: {
            "zh-TW": "需要重新載入",
            "en": "Reload Required",
            "ja": "再読み込みが必要です",
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
                "zh-TW": "如果圖片縮放比例大於100%，則呈現像素",
                "en": "Show pixels if the image zoom ratio is above 100%",
                "ja": "画像の拡大率が100%以上の場合、画素を表示します",
            },
        },

        // 圖片預設縮放模式
        zoomMode: {
            title: {
                "zh-TW": "圖片預設縮放模式",
                "en": "Image default zoom mode",
                "ja": "画像のデフォルトズームモード",
            },
            
            fitWindowOrImageOriginal: {
                "zh-TW": "縮放至適合視窗 或 圖片原始大小",
                "en": "Zoom to fit or Image original size",
                "ja": "ズームトゥフィット または 画像原寸大",
            },
            fitWindow: {
                "zh-TW": "強制縮放至適合視窗",
                "en": "Always zoom to fit",
                "ja": "常にズームトゥフィット",
            },
            imageOriginal: {
                "zh-TW": "圖片原始大小",
                "en": "Image original size",
                "ja": "画像原寸大",
            },
            imageWidthPx: {
                "zh-TW": "圖片寬度 (px)",
                "en": "Image width (px)",
                "ja": "画像の幅 (px)",
            },
            imageHeightPx: {
                "zh-TW": "圖片高度 (px)",
                "en": "Image height (px)",
                "ja": "画像の高さ (px)",
            },
            windowWidthRatio: {
                "zh-TW": "視窗寬度 (%)",
                "en": "Window width (%)",
                "ja": "ウィンドウの幅 (%)",
            },
            windowHeightRatio: {
                "zh-TW": "視窗高度 (%)",
                "en": "Window height (%)",
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
                "en": "Directory default sort",
                "ja": "ディレクトリのデフォルトソート",
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
                "zh-TW": "每個Tiefsee視窗都是一個新的執行個體，需要較長的啟動時間",
                "en": "Each Tiefsee window is a new instances, the startup speed is slower",
                "ja": "Tiefseeウィンドウはそれぞれ新しいインスタンスであるため、起動速度が遅くなる",
            },
            tooltip_2: {
                "zh-TW": "所有的Tiefsee共用同一個執行個體。只要Tiefsee的視窗尚未全部關閉，就能快速啟動Tiefsee",
                "en": "All Tiefsee window share the same instances. As long as the Tiefsee window is not all closed, you can quickly startup Tiefsee",
                "ja": `
                    すべてのTiefseeウィンドウは同じインスタンスを共有しています。Tiefseeウィンドウが閉じていない限り、Tiefseeを高速起動することができます`,
            },
            tooltip_3: {
                "zh-TW": "所有視窗共用同一個執行個體。Tiefsee會常駐在背景，隨時都能以極快的速度啟動",
                "en": `All Tiefsee window share the same instances. Tiefsee will Running in the background, you can quickly startup Tiefsee at any time`,
                "ja": `Tiefseeのウィンドウはすべて同じインスタンスを共有しています。Tiefseeはバックグラウンドで動作し、いつでも高速起動が可能です`,
            },
            tooltip_4: {
                "zh-TW": "只允許存在一個Tiefsee視窗",
                "en": "Not allowed to have multiple Tiefsee window",
                "ja": "複数のTiefseeウィンドウを持つことはできません",
            },
            tooltip_5: {
                "zh-TW": "只允許存在一個Tiefsee視窗。程式會常駐在背景，隨時都能以極快的速度啟動",
                "en": `
                    Not allowed to have multiple Tiefsee window.<br>
                    Tiefsee will Running in the background, you can quickly startup Tiefsee at any time
                    `,
                "ja": `
                    複数のTiefseeウィンドウを持つことはできません。<br>
                    Tiefseeはバックグラウンドで動作し、いつでも高速起動が可能です
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
                "zh-TW": "開啟Windows的「Startup」",
                "en": `Open Windows "Startup"`,
                "ja": "Windowsの「Startup」を開く",
            },
        },

        //其他
        other: {
            title: {
                "zh-TW": "其他",
                "en": "Other",
                "ja": "その他",
            },
            displayDeleteConfirmationDialog: {
                "zh-TW": "檔案刪除前顯示確認視窗",
                "en": "Display Delete confirmation dialog",
                "ja": "削除の確認メッセージを表示する",
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

        //視窗設定
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
            windowAero: {
                "zh-TW": "視窗效果",
                "en": " Window effect",
                "ja": "ウィンドウ効果",
            },
            aeroNone: {
                "zh-TW": "預設",
                "en": "Default",
                "ja": "プリセット",
            },
            aeroWin7: {
                "zh-TW": "AERO",
                "en": "AERO",
                "ja": "AERO",
            },
            aeroWin10: {
                "zh-TW": "Acrylic",
                "en": "Acrylic",
                "ja": "Acrylic",
            },
            tooltip: {
                "zh-TW": `  
                    1. 使用「AERO」或「Acrylic」後，還必須調整「視窗背景色」的透明度，才能達到最佳視覺效果。<br>
                    2. 使用「AERO」或「Acrylic」後，可能導致Tiefsee在移動視窗時卡頓。<br>
                    3. Windows 11 可能無法使用「AERO」。
                `,
                "en": `
                    1. After using "AERO" or "Acrylic", you must also adjust the opacity of "Window background color" to get the best look.<br>
                    2. Some computers will make Tiefsee LAG after using "AERO" or "Acrylic".<br>
                    3. Windows 11 may not be able to use "AERO".
                `,
                "ja": `
                    1. 「AERO」または「Acrylic」を使用した後、「ウィンドウの背景色」の不透明度も調整すると、最適な見た目になります。<br>
                    2. 一部のコンピュータでは、「AERO」や「Acrylic」を使用した後に Tiefsee がLAGになります。<br>
                    3. Windows11では、「AERO」が使用できない場合があります。
                    `,
            }
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
                "zh-TW": "顯示 檔案預覽面板",
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
                "en": "Directory Panel",
                "ja": "ディレクトリパネル",
            },
            displayPanel: {
                "zh-TW": "顯示 資料夾預覽面板",
                "en": "Display directory panel",
                "ja": "ディレクトリパネルを表示する",
            },
            displayNumber: {
                "zh-TW": "顯示編號",
                "en": "Display number",
                "ja": "番号を表示する",
            },
            displayName: {
                "zh-TW": "顯示資料夾名",
                "en": "Display directory name",
                "ja": "ディレクトリ名を表示する",
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
                "zh-TW": "顯示 詳細資料面板",
                "en": "Display information panel",
                "ja": "情報パネルを表示する",
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
                "zh-TW": "圖片 工具列",
                "en": "Image Toolbar",
                "ja": "画像ツールバー",
            },
            officeToolbar: {
                "zh-TW": "Office文件 工具列",
                "en": "Office Document Toolbar",
                "ja": "Office文書ツールバー",
            },
            textToolbar: {
                "zh-TW": "文字 工具列",
                "en": "Text Toolbar",
                "ja": "テキストツールバー",
            },
            adjustOrderByDragging: {
                "zh-TW": "(可拖曳調整順序)",
                "en": "(Adjust order by dragging)",
                "ja": "(ドラッグで順番を調整)",
            },
        },

        //#endregion

        //#region 設為預設程式
        association: {
            step1: {
                "zh-TW": "步驟1、把Tiefsee關聯到特定副檔名",
                "en": "Step 1: Associate Tiefsee to the specified File Extension",
                "ja": "Step 1：Tiefseeを指定されたファイル名拡張子に関連付けます",
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
                "en": "Step 2. Modify the default apps",
                "ja": "Step 2：既定のアプリの選択",
            },
            step2Subtitle: {
                "zh-TW": "開啟系統設定，將「相片檢視器」修改成「Tiefsee」",
                "en": `Go to the "Windows Settings" and change the "Photo Viewer" to "Tiefsee"`,
                "ja": "「Windowsの設定」から「フォトビューアー」を「Tiefsee」に変更する",
            },
            openSystemSettings: {
                "zh-TW": "開啟 系統設定",
                "en": `Open "Windows Settings"`,
                "ja": "「Windowsの設定」を開く",
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
                "zh-TW": "資料夾數量太多時，禁用「資料夾預覽面板」",
                "en": `Disable "Directory Panel" when there are too many directories`,
                "ja": "ディレクトリが多すぎる場合は「ディレクトリパネル」を無効化する",
            },
            alwaysDisable: {
                "zh-TW": "一律禁用",
                "en": "Always disable",
                "ja": "常に無効にする",
            },
            disableWhenGreaterThan: {
                "zh-TW": "大於{v}時禁用",
                "en": "Disable when greater than {v}",
                "ja": "{v}以上の場合は無効にする",
            },
            alwaysEnable: {
                "zh-TW": "一律啟用",
                "en": "Always enable",
                "ja": "常に有効にする",
            },
        },

        // 實驗性功能
        experimentalFeatures: {
            title: {
                "zh-TW": "實驗性功能",
                "en": "Experimental Features",
                "ja": "実験的な機能",
            },
            imageDPI: {
                "zh-TW": "圖片DPI",
                "en": "Image DPI",
                "ja": "画像のDPI",
            },
            useCreateImageBitmap: {
                "zh-TW": "圖片面積過大時，停用 createImageBitmap (停用高品質縮放)",
                "en": "Disable createImageBitmap when image is too large (disable high-quality scaling)",
                "ja": "画像が大きすぎる場合、createImageBitmapを無効にする (高品質の拡大を無効にする)",
            },
            alwaysDisable: {
                "zh-TW": "一律停用",
                "en": "Always disable",
                "ja": "常に無効にする",
            },
            disableWhenGreaterThan: {
                "zh-TW": "大於{v}*{v}時停用",
                "en": "Disable when greater than {v}*{v}",
                "ja": "{v}*{v}以上の場合は無効にする",
            },
            alwaysUse: {
                "zh-TW": "一律使用",
                "en": "Always use",
                "ja": "常に使用する",
            },

            useLibvips: {
                "zh-TW": "當圖片縮小至特定比例以下，就使用libvips重新處理圖片 (通常值愈高圖片呈現品質愈好，但縮放圖片將會耗費更多時間)",
                "en": "When image is resized to a specific ratio or smaller, use libvips to re-process the image (usually, a higher value results in better image quality, but resizing will take more time)",
                "ja": "画像が特定の割合または小さくなった場合、libvipsを使用して画像を再処理する (通常、高い値は画像品質が向上しますが、リサイズにはより多くの時間がかかります)",
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
                "zh-TW": "相關檔案",
                "en": "Related Files",
                "ja": "関連するファイル",
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
                "en": "Temporary Directory",
                "ja": "キャッシュディレクトリ",
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
                "zh-TW": "讓Tiefsee使用 monaco-editor 來載入文字檔。常用於閱讀與編輯程式碼",
                "en": "Let Tiefsee use monaco-editor to load text files. Commonly used for reading and editing code",
                "ja": "Tiefseeにmonaco-editorを使って、テキストファイルを読み込ませる。 コードの読み取りと編集によく使われる",
            },
            webviewer: {
                "zh-TW": "讓Tiefsee支援「doc、docx、ppt、pptx」",
                "en": `Let Tiefsee support "doc, docx, ppt, pptx"`,
                "ja": "Tiefseeに「doc, docx, ppt, pptx」をサポートさせる",
            },
            nConvert: {
                "zh-TW": "讓Tiefsee支援「Clip Studio Paint」產生的「clip檔」",
                "en": `Let Tiefsee support "clip file" generated by "Clip Studio Paint"`,
                "ja": `Tiefseeに「Clip Studio Paint」で生成された「clip ファイル」をサポートさせる`,
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
                "en": `2. Unzip the ZIP and put it in the "Plugin" directory`,
                "ja": `2. ZIPを解凍し、「Plugin」フォルダに配置する`,
            },
            openPluginDir: {
                "zh-TW": "開啟「Plugin」資料夾",
                "en": `Open the "Plugin" directory`,
                "ja": "「Plugin」フォルダを開く",
            },
            step3: {
                "zh-TW": "3、重新啟動 Tiefsee",
                "en": "3. Restart Tiefsee",
                "ja": "3. Tiefseeを再起動する",
            },
            restartTiefsee: {
                "zh-TW": "重新啟動 Tiefsee",
                "en": "Restart Tiefsee",
                "ja": "Tiefseeを再起動する",
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
                "zh-TW": "在桌面或資料夾快速預覽檔案",
                "en": "Quick preview of file on the desktop or in the directory",
                "ja": "デスクトップやフォルダー内のファイルをすばやくプレビューできる",
            },
            subtitle: {
                "zh-TW": "「啟動模式」如果為「直接啟動」則無法使用 QuickLook",
                "en": `QuickLook is not available if the "Startup Mode" is "Normal Startup"`,
                "ja": `「起動モード」が 「通常起動」の場合、QuickLookは使用できません`,
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
        showMenuFile: {
            "zh-TW": "檔案",
            "en": "File",
            "ja": "ファイル",
        },
        prevDir: {
            "zh-TW": "上一個資料夾",
            "en": "Prev Directory",
            "ja": "前のディレクトリ",
        },
        nextDir: {
            "zh-TW": "下一個資料夾",
            "en": "Next Directory",
            "ja": "次のディレクトリ",
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
        showDeleteMsg: {
            "zh-TW": "刪除檔案",
            "en": "Delete File",
            "ja": "ファイルの削除",
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
            "zh-TW": "檔案修改日期",
            "en": "Last Write Time",
            "ja": "ファイル更新日時",
        },
        showSave: {
            "zh-TW": "儲存檔案",
            "en": "Save",
            "ja": "アーカイブ",
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
        systemContextMenu: {
            "zh-TW": "檔案右鍵選單",
            "en": "System Context Menu",
            "ja": "コンテキストメニュー",
        },
        renameFile: {
            "zh-TW": "重新命名檔案",
            "en": "Rename File",
            "ja": "リネーム",
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
            "zh-TW": "複製 檔案",
            "en": "Copy File",
            "ja": "コピーファイル",
        },
        copyFileName: {
            "zh-TW": "複製 檔名",
            "en": "Copy File Name",
            "ja": "コピーファイル名",
        },
        copyFilePath: {
            "zh-TW": "複製 完整路徑",
            "en": "Copy File Path",
            "ja": "コピーファイルパス",
        },
        copyImage: {
            "zh-TW": "複製 影像",
            "en": "Copy Image",
            "ja": "コピー画像",
        },
        copyImageBase64: {
            "zh-TW": "複製 影像 Base64",
            "en": "Copy Image Base64",
            "ja": "コピー画像 Base64",
        },
        copyText: {
            "zh-TW": "複製 文字",
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
            "en": "Directory Sort by",
            "ja": "ディレクトリソート方式",
        },
        name: {
            "zh-TW": "檔名",
            "en": "Name",
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
            "en": "Size",
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
        delete: {
            "zh-TW": "刪除檔案",
            "en": "Delete File",
            "ja": "ファイルの削除",
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
        topmost: {
            "zh-TW": "視窗固定最上層",
            "en": "Keep window always in top",
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
            "en": "Directory Panel",
            "ja": "ディレクトリパネル",
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


        //#region save
        saveFailed: {
            "zh-TW": "儲存失敗",
            "en": "Save failed",
            "ja": "保存に失敗",
        },
        saveComplete: {
            "zh-TW": "儲存完成",
            "en": "Save complete",
            "ja": "保存完了",
        },
        //#endregion


        //#region copy
        copyFile: {
            "zh-TW": "已將「檔案」複製至剪貼簿",
            "en": ` "File" copying completed`,
            "ja": "コピー「ファイル」完了",
        },
        copyName: {
            "zh-TW": "已將「檔名」複製至剪貼簿",
            "en": `"File Name" copying completed`,
            "ja": "コピー「ファイル名」完了",
        },
        copyImage: {
            "zh-TW": "已將「影像」複製至剪貼簿",
            "en": `"Image" copying completed`,
            "ja": "コピー「画像」完了",
        },
        copyPath: {
            "zh-TW": "已將「路徑」複製至剪貼簿",
            "en": `"File Path" copying completed`,
            "ja": "コピー「ファイルパス」完了",
        },
        copyIamgeBase64: {
            "zh-TW": "已將「影像 Base64」複製至剪貼簿",
            "en": `"Iamge Base64" copying completed`,
            "ja": "コピー「画像 Base64」完了",
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
            "ja": "名前の変更",
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
            "ja": "ファイルの削除",
        },
        fileToRecycleBin: {
            "zh-TW": "移至資源回收桶",
            "en": "Move to recycle bin",
            "ja": "ごみ箱へ移動",
        },
        fileToPermanentlyDelete: {
            "zh-TW": "永久刪除檔案",
            "en": "Permanently delete file",
            "ja": "完全に削除",
        },
        fileToRecycleBinCompleted: {
            "zh-TW": "已將檔案「移至資源回收桶」",
            "en": `"Move to recycle bin" completed`,
            "ja": "「ごみ箱へ移動」完了",
        },
        fileToPermanentlyDeleteCompleted: {
            "zh-TW": "已將檔案「永久刪除」",
            "en": `"Permanently delete file" completed`,
            "ja": "「完全に削除」完了",
        },
        fileDeletionFailed: {
            "zh-TW": "檔案刪除失敗",
            "en": "File deletion failed",
            "ja": "ファイル削除の失敗",
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
        associatedFiles: {
            "zh-TW": "確定用Tiefsee來開啟這些檔案嗎？",
            "en": "Are you sure you want to open these files with Tiefsee?",
            "ja": "これらのファイルを開くのに Tiefsee を使用するのは確かですか？",
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
                "zh-TW": "尺寸",
                "en": "Size",
                "ja": "大きさ",
            },
            "Length": {
                "zh-TW": "大小",
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

}

