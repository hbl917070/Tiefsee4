import { BaseWindow } from "./BaseWindow";

export class Config {

    private baseWindow: BaseWindow;

    constructor(_baseWindow: BaseWindow) {
        this.baseWindow = _baseWindow;
    }

    /**
     * 「用其他APP開啟檔案」的列表
     */
    public otherAppOpenList = {

        /**
         * 從絕對路徑新增
         */
        absolute: [
            //{ name: "小畫家", path: "C:/Windows/system32/mspaint.exe", groupType: ["img"] },
            //{ name: "Google Chrome", path: "C:/Program Files/Google/Chrome/Application/chrome.exe", groupType: ["img"] },
        ] as { name: string, path: string, groupType?: string[], fileExt?: string[] }[],

        /**
         * 從 開始選單 或 APP列表 裡面匹配
         * name：要匹配的名稱
         * groupType：使用於這些 檔案類型
         * fileExt：使用於這些 副檔名
         */
        startMenu: [
            { name: /mspaint/i, groupType: ["img"] },
            { name: /photoshop/i, groupType: ["img"] },
            { name: /illustrator/i, groupType: ["img"], fileExt: ["ai"] },
            { name: /Lightroom/i, groupType: ["img"] },
            { name: /Paint/i, groupType: ["img"] },
            { name: /photo/i, groupType: ["img"] },
            { name: /^gimp/i, groupType: ["img"] },
            { name: /FireAlpaca/i, groupType: ["img"] },
            { name: /openCanvas/i, groupType: ["img"] },
            { name: /^SAI/i, groupType: ["img"] },
            { name: /Pixia/i, groupType: ["img"] },
            { name: /AzPainter2/i, groupType: ["img"] },
            { name: /CorelDRAW/i, groupType: ["img"] },
            { name: /Krita/i, groupType: ["img"] },
            { name: /Artweaver/i, groupType: ["img"] },
            { name: /Lightroom/i, groupType: ["img"] },
            { name: /Perfect Effects/i, groupType: ["img"] },
            { name: /Artweaver /i, groupType: ["img"] },
            { name: /Honeyview/i, groupType: ["img"] },
            { name: /BandiView/i, groupType: ["img"] },
            { name: /ACDSee/i, groupType: ["img"] },
            { name: /IrfanView/i, groupType: ["img"] },
            { name: /XnView/i, groupType: ["img"] },
            { name: /FastStone/i, groupType: ["img"] },
            { name: /Hamana/i, groupType: ["img"] },
            { name: /Vieas/i, groupType: ["img"] },
            { name: /FreeVimager/i, groupType: ["img"] },
            { name: /Imagine/i, groupType: ["img"] },
            { name: /XnConvert/i, groupType: ["img"] },
            { name: /FotoSketcher/i, groupType: ["img"] },
            { name: /PhoXo/i, groupType: ["img"] },
            { name: /ScreenSketch/i, groupType: ["img"] }, // Windows的剪裁工具
            { name: /imageGlass/i, groupType: ["img"] },

            { name: /Visual Studio Code/i, groupType: ["txt"] },
            { name: /Notepad/i, groupType: ["txt"] },
            { name: /Sublime Text/i, groupType: ["txt"] },
            { name: /Atom Editor/i, groupType: ["txt"] },
            { name: /Adobe Brackets/i, groupType: ["txt"] },

            { name: /ZuneVideo/i, groupType: ["video"] },
            { name: /VLC Media Player/i, groupType: ["video"] },
            { name: /PotPlayer/i, groupType: ["video"] },
            { name: /GOM Player/i, groupType: ["video"] },
            { name: /KMPlayer/i, groupType: ["video"] },
            { name: /RealPlayer/i, groupType: ["video"] },
            { name: /QuickTime/i, groupType: ["video"] },

            { name: /^Google Chrome$/i, fileExt: ["html", "pdf", "doc", "docx", "odt", "ppt", "pptx", "odp", "csv"] }, // chrome 也可以開啟 office

            { name: /^Firefox$/i, fileExt: ["html", "pdf"] },
            { name: /^Brave$/i, fileExt: ["html", "pdf"] },
            { name: /Microsoft Edge/i, fileExt: ["html", "pdf"] },

            { name: /Adobe Acrobat/i, fileExt: ["pdf"] },
            { name: /pdf/i, fileExt: ["pdf"] },

            //{ name: /Word/i, fileExt: ["doc", "docx", "odt"] }, // 無法使用
            { name: /WPS Writer/i, fileExt: ["doc", "docx", "odt"] },
            { name: /LibreOfficeWriter/i, fileExt: ["doc", "docx", "odt"] },

            //{ name: /PowerPoint/i, fileExt: ["ppt", "pptx", "odp"] }, // 無法使用
            { name: /WPS Presentation/i, fileExt: ["ppt", "pptx", "odp", "csv"] },
            { name: /LibreOfficeImpress/i, fileExt: ["ppt", "pptx", "odp", "csv"] },

        ] as { name: RegExp, path: string, groupType?: string[], fileExt?: string[] }[]
    }

    public exif = {
        whitelist: [
            "Date/Time Original", // 拍攝日期
            "Windows XP Keywords", // 標籤
            "Rating", // 評等
            "Image Width/Height", // 圖片尺寸
            "Length", // 檔案大小
            "Windows XP Title", // 標題
            "Artist", // 作者
            "Copyright", // 版權
            "Image Description", // 描述
            "Windows XP Comment", // 註解
            "User Comment", // 註解
            "Comment", // 註解
            "Make", // 相機型號
            "Model", // 相機製造商
            "Lens Model", // 鏡頭型號
            "Windows XP Subject", // 主旨
            "F-Number", // 光圈孔徑
            "Exposure Time", // 曝光時間
            "ISO Speed Ratings", // ISO速度
            "Exposure Bias Value", // 曝光補償
            "Focal Length", // 焦距
            "Max Aperture Value", // 最大光圈
            "Metering Mode", // 測光模式
            "Flash", // 閃光燈模式
            "Focal Length 35", // 35mm焦距
            "Orientation", // 旋轉資訊
            "Software", // 軟體
            // "Color Space", // 色彩空間
            "Video Duration", // 影片長度
            "Frame Count", // 總幀數
            "Loop Count", // 循環次數
            "Creation Time", // 建立日期
            "Last Write Time", // 修改日期
            // "Last Access Time", // 存取時間
            "Textual Data", // PNG tEXt
            "Map", // Google Map
        ]
    }

    /** 搜圖 */
    public imgSearch = {
        /** 搜圖用的清單 */
        list: [
            { name: "sauceNAO", icon: "./img/imgSearch/saucenao.png", url: "https://saucenao.com/search.php?db=999&url={url}" },
            { name: "Yandex", icon: "./img/imgSearch/yandex.png", url: "https://yandex.com/images/search?rpt=imageview&url={url}" },
            { name: "Ascii2d", icon: "./img/imgSearch/ascii2d.png", url: "https://ascii2d.net/search/url/{url}" },
            //{ name: "Google", icon: "./img/imgSearch/google.png", url: "googleSearch" },
            { name: "Google", icon: "./img/imgSearch/google.png", url: "https://www.google.com/searchbyimage?sbisrc=cr_1_5_2&image_url={url}" },
            { name: "Google Lens", icon: "./img/imgSearch/googleLens.svg", url: "https://lens.google.com/uploadbyurl?url={url}" },
            { name: "Bing", icon: "./img/imgSearch/bing.png", url: "https://www.bing.com/images/search?view=detailv2&iss=sbi&FORM=SBIIDP&sbisrc=UrlPaste&idpbck=1&q=imgurl:{url}" },
            //{ name: "IQDB", icon: "./img/imgSearch/iqdb.png", url: "https://iqdb.org/?url={url}" },
        ],

        /** 圖片暫存伺服器 */
        imgServer: [
            { url: "https://hbl917070.com/imgSearch/upload", timeout: 8 * 1000 },
            { url: "https://tiefseesearchimageserver.onrender.com/imgSearch/upload", timeout: 10 * 1000 },
        ]
    };

    public settings = {
        theme: {
            /** 視窗樣式 ( none, aero, acrylic, acrylicDark, acrylicLight, micaDark, micaLight, micaAltDark, micaAltLight */
            "windowStyle": "none",
            /** 視窗縮放比例 */
            "zoomFactor": 1.0,
            /** 文字粗細 */
            "fontWeight": "400",
            /** 圖示粗細 */
            "svgWeight": "0px",
            /** 視窗圓角 */
            "--window-border-radius": 7,
            "--color-window-background": { r: 31, g: 39, b: 43, a: 0.97 },
            "--color-window-border": { r: 255, g: 255, b: 255, a: 0.25 },
            "--color-white": { r: 255, g: 255, b: 255, },
            "--color-black": { r: 0, g: 0, b: 0, },
            "--color-blue": { r: 0, g: 200, b: 255, },
            "--color-grey": { r: 30, g: 30, b: 30, },
        },

        /** 圖片 */
        image: {
            /** 圖片渲染模式 */
            "tiefseeviewImageRendering": "0",
            /** 圖片預設縮放模式 */
            tiefseeviewZoomType: "full-100%",
            /** 圖片預設縮放模式(值) */
            tiefseeviewZoomValue: 100,
            /** 圖片預設對齊位置 */
            tiefseeviewAlignType: "C",

            /** 縮小至特定比例以下，就使用libvips重新處理圖片 */
            tiefseeviewBigimgscaleRatio: 0.8,

            /** 圖片銳化 */
            sharpenValue: 0,
        },

        /** 預設排序 */
        sort: {
            /** 預設檔案排序 */
            fileSort: "name",
            /** 預設資料夾排序 */
            dirSort: "name",
        },

        /** 佈局 */
        layout: {

            /** 啟用 工具列 */
            mainToolbarEnabled: true,
            /** 工具列對齊。 [lef, center] */
            mainToolbarAlign: "center",

            /** 啟用 檔案預覽視窗 */
            fileListEnabled: true,
            /** 顯示編號 */
            fileListShowNo: true,
            /** 顯示檔名 */
            fileListShowName: true,
            /** 寬度 */
            fileListShowWidth: 100,

            /** 啟用 資料夾預覽視窗 */
            dirListEnabled: false,
            /** 顯示編號 */
            dirListShowNo: true,
            /** 顯示檔名 */
            dirListShowName: true,
            /** 寬度 */
            dirListShowWidth: 200,
            /** 圖片數量 */
            dirListImgNumber: 3,

            /** 啟用 詳細資料視窗 */
            mainExifEnabled: true,
            /** 寬度 */
            mainExifShowWidth: 150,
            /** 顯示的最大行數 */
            mainExifMaxLine: 20,
            /** 寬度足夠時，橫向排列 */
            mainExifHorizontal: false,
            /** 記錄折疊狀態 */
            mainExifCollapse: {} as { [key: string]: boolean },
            /** 記錄頁籤選擇的頁面。 [info, related] */
            mainExifTabs: "info",
            /** 啟用 相關檔案 */
            relatedFilesEnabled: true,

            /** 啓用 Civitai Resources */
            civitaiResourcesEnabled: true,
            /** 圖片預設狀態 true=展開、false=折疊 */
            civitaiResourcesDefault: true,
            /** 圖片數量 */
            civitaiResourcesImgNumber: 2,
            /** 允許 NSFW 圖片 */
            civitaiResourcesNsfwLevel: 3,

            /** 大型切換按鈕。 [leftRight, bottom, none]  */
            largeBtn: "bottom",

            /** 面版順序 */
            dirPanelOrder: 0,
            filePanelOrder: 1,
            imagePanelOrder: 2,
            infoPanelOrder: 3,
        },

        /** 記錄程式上次關閉時的位置 */
        position: {
            left: -9999,
            top: -9999,
            width: 600,
            height: 600,
            windowState: "Normal"
        },

        /** 工具列按鈕，n=按鈕的key、v=是否顯示 */
        mainToolbar: {
            img: [
                { "n": "prevFile", "v": false },
                { "n": "nextFile", "v": false },
                { "n": "showMenuFile", "v": true },
                { "n": "prevDir", "v": false },
                { "n": "nextDir", "v": false },
                { "n": "showMenuSort", "v": true },
                { "n": "showMenuCopy", "v": true },
                { "n": "dragDropFile", "v": true },
                { "n": "showDeleteMsg", "v": true },
                { "n": "showMenuImageSearch", "v": true },
                { "n": "bulkView", "v": true },
                { "n": "showSetting", "v": true },
                { "n": "showMenuRotation", "v": true },
                { "n": "zoomToFit", "v": true }
            ],
            pdf: [
                { "n": "prevFile", "v": false },
                { "n": "nextFile", "v": false },
                { "n": "showMenuFile", "v": true },
                { "n": "prevDir", "v": false },
                { "n": "nextDir", "v": false },
                { "n": "showMenuSort", "v": true },
                { "n": "showMenuCopy", "v": true },
                { "n": "dragDropFile", "v": true },
                { "n": "showDeleteMsg", "v": true },
                { "n": "bulkView", "v": true },
                { "n": "showSetting", "v": true }
            ],
            txt: [
                { "n": "prevFile", "v": false },
                { "n": "nextFile", "v": false },
                { "n": "showMenuFile", "v": true },
                { "n": "prevDir", "v": false },
                { "n": "nextDir", "v": false },
                { "n": "showMenuSort", "v": true },
                { "n": "showMenuCopy", "v": true },
                { "n": "dragDropFile", "v": true },
                { "n": "showDeleteMsg", "v": true },
                { "n": "bulkView", "v": true },
                { "n": "showSetting", "v": true }
            ],
            bulkView: [
                { "n": "showMenuFile", "v": true },
                { "n": "prevDir", "v": true },
                { "n": "nextDir", "v": true },
                { "n": "showMenuSort", "v": true },
                { "n": "showMenuCopy", "v": true },
                { "n": "dragDropFile", "v": true },
                { "n": "showDeleteMsg", "v": true },
                { "n": "showSetting", "v": true },
                { "n": "showBulkViewSetting", "v": true },
            ]
        },

        /** 進階設定 */
        advanced: {
            /**子資料夾數量太多就禁用資料夾預覽視窗 */
            dirListMaxCount: 5000,
            /** 圖片面積大於這個數值的平方，就禁用高品質縮放 */
            highQualityLimit: 4000,
            /** exif 最大讀取長度 */
            exifReadMaxLength: 200000,
        },

        /** 快速預覽 */
        quickLook: {
            /** 長按空白鍵觸發觸發 */
            keyboardSpaceRun: true,
            /** 長按滑鼠中鍵觸發 */
            mouseMiddleRun: true,
        },

        /** 大量瀏覽模式 */
        bulkView: {
            /** 每行圖片數 */
            columns: 5,
            /** 瀑布流。 [off, vertical, horizontal] */
            waterfall: "horizontal",
            /** 無間距模式 */
            gaplessMode: "off",
            /** 鎖定寬度 */
            fixedWidth: "off",
            /** 排列方向 */
            align: "left",
            /** 第一張圖縮排 */
            indentation: "off",
            /** 顯示資訊 */
            show: {
                /** 顯示資訊-編號 */
                number: true,
                /** 顯示資訊-檔案名稱 */
                fileName: true,
                /** 顯示資訊-圖片尺寸 */
                imageSize: false,
                /** 顯示資訊-檔案大小 */
                fileSize: false,
                /** 顯示資訊-修改日期 */
                lastWriteDate: false,
                /** 顯示資訊-修改時間 */
                lastWriteTime: false,
            },
            /** 一頁顯示幾張圖片 */
            imgMaxCount: 100,
        },

        /** 其他 */
        other: {
            /** 開啟 RAW 圖片時，顯示內嵌的預覽圖 */
            rawImageThumbnail: true,
            /** 刪除前顯示詢問視窗 */
            fileDeletingShowCheckMsg: true,
            /** 偵測到檔案新增時，插入於。 [auto, start, end] */
            whenInsertingFile: "auto",
            /** 啟用觸控板手勢 */
            enableTouchpadGestures: false,
            /** 到達最後一個檔案時 */
            reachLastFile: "firstFile",
            /** 到達最後一個資料夾時 */
            reachLastDir: "firstDir",
            /** 語言 */
            lang: "",
        },

        /** 滑鼠 */
        mouse: {
            //滑鼠按鍵
            leftDoubleClick: "maximizeWindow",
            scrollWheelButton: "none",
            mouseButton4: "prevFile",
            mouseButton5: "nextFile",

            //滑鼠滾輪
            scrollUp: "imageZoomIn",
            scrollDown: "imageZoomOut",
            scrollUpCtrl: "imageZoomIn",
            scrollDownCtrl: "imageZoomOut",
            scrollUpShift: "imageMoveRight",
            scrollDownShift: "imageMoveLeft",
            scrollUpAlt: "imageMoveUp",
            scrollDownAlt: "imageMoveDown",

            //大量瀏覽模式 - 滑鼠滾輪
            bulkViewScrollUpCtrl: "decColumns",
            bulkViewScrollDownCtrl: "incrColumns",
            bulkViewScrollUpShift: "incrFixedWidth",
            bulkViewScrollDownShift: "decFixedWidth",
            bulkViewScrollUpAlt: "prevPage",
            bulkViewScrollDownAlt: "nextPage",
        },
    }

    private _allowFile_img: { ext: string; type: string; vipsType?: string; vipsType2?: string; }[] = [];
    private _allowFile_video: { ext: string; type: string; vipsType?: string; vipsType2?: string; }[] = [];
    private _allowFile_pdf: { ext: string; type: string; vipsType?: string; vipsType2?: string; }[] = [];
    private _allowFile_txt: { ext: string; type: string; vipsType?: string; vipsType2?: string; }[] = [];
    /** 
     * 初始化 檔案關聯列表
     */
    private initAllowFileType() {

        const plugin: AppInfoPlugin = this.baseWindow.appInfo.plugin;

        // img
        (() => {
            this._allowFile_img = [
                { ext: "jpg", type: "vips", vipsType: "jpg" }, // 如果檔案的 ICC Profile 為 CMYK，則先使用 WPF 處理圖片
                { ext: "jpeg", type: "vips", vipsType: "jpg" },
                { ext: "jfif", type: "vips", vipsType: "jpg" },
                { ext: "jpe", type: "vips", vipsType: "jpg" },
                { ext: "png", type: "vips", vipsType: "vips" },
                { ext: "webp", type: "vips", vipsType: "vips,magick" },
                { ext: "bmp", type: "vips", vipsType: "bitmap" },
                { ext: "apng", type: "web" },
                { ext: "gif", type: "web" },
                { ext: "svg", type: "web" },
                { ext: "ico", type: "web" },

                // 優先使用 vips 處理圖片，失敗則直接在瀏覽器用 canvase 處理成 base64
                { ext: "avif", type: "vips", vipsType: "magick", vipsType2: "base64" },
                { ext: "avifs", type: "web" },

                { ext: "tif", type: "vips", vipsType: "tif" },
                { ext: "tiff", type: "vips", vipsType: "tif" },
                { ext: "dds", type: "vips", vipsType: "wpf,magick" },
                { ext: "jxr", type: "vips", vipsType: "wpf" },

                { ext: "psd", type: "vips", vipsType: "magick" },
                { ext: "psb", type: "vips", vipsType: "magick" },
                { ext: "pcx", type: "vips", vipsType: "magick" },
                { ext: "heic", type: "vips", vipsType: "magick" },
                { ext: "heif", type: "vips", vipsType: "magick" },
                { ext: "fits", type: "vips", vipsType: "magick" },
                { ext: "dcm", type: "vips", vipsType: "magick" }, // 多幀
                { ext: "hdr", type: "vips", vipsType: "magick" }, // 必須輸出成png顏色才不會跑掉
                { ext: "miff", type: "vips", vipsType: "magick" },
                { ext: "mng", type: "vips", vipsType: "magick" },
                { ext: "otb", type: "vips", vipsType: "magick" },
                { ext: "pfm", type: "vips", vipsType: "magick" },
                { ext: "pgm", type: "vips", vipsType: "magick" },
                { ext: "ppm", type: "vips", vipsType: "magick" },
                { ext: "tga", type: "vips", vipsType: "magick" },
                { ext: "xcf", type: "vips", vipsType: "magick" },
                { ext: "xpm", type: "vips", vipsType: "magick" },
                { ext: "qoi", type: "vips", vipsType: "magick" },
                { ext: "pbm", type: "vips", vipsType: "magick" },
                { ext: "exr", type: "vips", vipsType: "magick" },
                { ext: "jpf", type: "vips", vipsType: "magick" },
                { ext: "jp2", type: "vips", vipsType: "magick" }, // 開啟速度很慢
                { ext: "sct", type: "vips", vipsType: "magick" },
                { ext: "mef", type: "vips", vipsType: "magick" }, // 向量
                { ext: "wmf", type: "vips", vipsType: "magick" },
                { ext: "mpo", type: "vips", vipsType: "magick" }, // 相機
                { ext: "jxl", type: "vips", vipsType: "magick" }, // JPEG XL，開啟速度很慢

                { ext: "crw", type: "vips", vipsType: "raw" },
                { ext: "raf", type: "vips", vipsType: "raw" },
                { ext: "cr2", type: "vips", vipsType: "raw" },
                { ext: "mrw", type: "vips", vipsType: "raw" },
                { ext: "nef", type: "vips", vipsType: "raw" },
                { ext: "x3f", type: "vips", vipsType: "raw" },
                { ext: "pef", type: "vips", vipsType: "raw" },
                { ext: "orf", type: "vips", vipsType: "raw" },
                { ext: "rw2", type: "vips", vipsType: "raw" },
                { ext: "arw", type: "vips", vipsType: "raw" },
                { ext: "erf", type: "vips", vipsType: "raw" },
                { ext: "sr2", type: "vips", vipsType: "raw" },
                { ext: "srw", type: "vips", vipsType: "raw" },
                { ext: "dng", type: "vips", vipsType: "raw" },

                { ext: "afphoto", type: "vips", vipsType: "extractPng" },
                { ext: "afdesign", type: "vips", vipsType: "extractPng" },
                { ext: "clip", type: "vips", vipsType: "clip" },
            ]

        })();

        // video
        (() => {
            this._allowFile_video = [
                { ext: "mp4", type: "video" },
                { ext: "webm", type: "video" },
                { ext: "ogv", type: "video" },
            ]
        })();

        // pdf
        (() => {
            this._allowFile_pdf = [
                { ext: "pdf", type: "pdf" },
                { ext: "ai", type: "pdf" },
            ]
            if (plugin.PDFTronWebviewer) {
                this._allowFile_pdf.push(
                    { ext: "doc", type: "PDFTronWebviewer" },
                    { ext: "docx", type: "PDFTronWebviewer" },
                    { ext: "ppt", type: "PDFTronWebviewer" },
                    { ext: "pptx", type: "PDFTronWebviewer" },
                    // { ext: "odt", type: "PDFTronWebviewer" },
                    // { ext: "odp", type: "PDFTronWebviewer" },
                    // { ext: "xlsx", type: "PDFTronWebviewer" },
                );
            }
        })();

        // txt
        (() => {
            this._allowFile_txt = [
                { ext: "sass", type: "auto" },
                { ext: "js", type: "javascript" },
                { ext: "ts", type: "typescript" },
                { ext: "ejs", type: "html" },
                { ext: "log", type: "auto" },
                { ext: "url", type: "auto" },
                { ext: "md", type: "md" },
                { ext: "markdown", type: "md" },
                { ext: "gitignore", type: "auto" },
                { ext: "csv", type: "auto" },
                { ext: "vue", type: "vue" },
                { ext: "info", type: "json" },
            ]

            // monaco.languages.getLanguages()
            let arExt = ["txt", "abap", "cls", "azcli", "bat", "cmd", "bicep", "mligo", "clj",
                "cljs", "cljc", "edn", "coffee", "c", "h", "cpp", "cc", "cxx", "hpp", "hh",
                "hxx", "cs", "csx", "cake", "css", "cypher", "cyp", "dart", "dockerfile", "ecl",
                "ex", "exs", "flow", "fs", "fsi", "ml", "mli", "fsx", "fsscript", "ftl", "ftlh",
                "ftlx", "go", "graphql", "gql", "handlebars", "hbs", "tf", "tfvars", "hcl", "html",
                "htm", "shtml", "xhtml", "mdoc", "jsp", "asp", "aspx", "jshtm", "ini", "properties",
                "gitconfig", "java", "jav", "js", "es6", "jsx", "mjs", "cjs", "jl", "kt", "less", "lex",
                "lua", "liquid", "html.liquid", "m3", "i3", "mg", "ig", "markdown", "mdown", "mkdn",
                "mkd", "mdwn", "mdtxt", "mdtext", "s", "dax", "msdax", "m", "pas", "p", "pp", "ligo",
                "pl", "php", "php4", "php5", "phtml", "ctp", "pla", "dats", "sats", "hats", "pq", "pqm",
                "ps1", "psm1", "psd1", "proto", "jade", "pug", "py", "rpy", "pyw", "cpy", "gyp", "gypi",
                "qs", "r", "rhistory", "rmd", "rprofile", "rt", "cshtml", "redis", "rst", "rb", "rbx",
                "rjs", "gemspec", "pp", "rs", "rlib", "sb", "scala", "sc", "sbt", "scm", "ss", "sch",
                "rkt", "scss", "sh", "bash", "sol", "aes", "rq", "sql", "st", "iecst", "iecplc", "lc3lib",
                "swift", "sv", "svh", "v", "vh", "tcl", "twig", "tsx", "vb", "xml", "dtd", "ascx",
                "csproj", "config", "wxi", "wxl", "wxs", "xaml", "svgz", "opf", "xsl", "yaml", "yml",
                "json", "bowerrc", "jshintrc", "jscsrc", "eslintrc", "babelrc", "har"
            ]
            for (let i = 0; i < arExt.length; i++) {
                this._allowFile_txt.push({ ext: arExt[i], type: "auto" })
            }
        })();

    }

    /**
     * 取得 檔案關聯列表
     * @param type 例如 GroupType.img
     */
    public allowFileType(type: string) {

        // 首次執行進行初始化
        if (this._allowFile_img.length === 0) {
            this.initAllowFileType();
        }

        if (type === GroupType.img) {
            return this._allowFile_img;
        }
        if (type === GroupType.video) {
            return this._allowFile_video;
        }
        if (type === GroupType.pdf) {
            return this._allowFile_pdf;
        }
        if (type === GroupType.txt) {
            return this._allowFile_txt;
        }

        return []
    }

    /**
     * 取得 檔案關聯列表
     * @param type 例如 GroupType.img
     * @param ext 例如 jpg
     * @returns 例如 { ext: "jfif", type: "vips", vipsType: "jpg" }
     */
    public getAllowFileTypeItem(type: string, ext: string) {
        let ar = this.allowFileType(type);
        for (let i = 0; i < ar.length; i++) {
            const item = ar[i];
            if (item.ext === ext) {
                return item;
            }
        }
        return null;
    }
}

export const GroupType = {

    /** 起始畫面 */
    welcome: "welcome",

    /** 不顯示任何東西 */
    none: "none",

    /** 顯示檔案總管的icon */
    unknown: "unknown",

    /** 一般的圖片 */
    img: "img",

    /** 多幀圖片 */
    imgs: "imgs",

    /** pdf 或 ai */
    pdf: "pdf",

    /** doc、docx、ppt、pptx */
    office: "office",

    /** 純文字 */
    txt: "txt",

    /** Markdown */
    md: "md",

    /** 純文字(monacoEditor) */
    monacoEditor: "monacoEditor",

    /** 影片 */
    video: "video",

    /** 大量瀏覽模式 */
    bulkView: "bulkView",

    /** 大量瀏覽模式-子視窗 */
    bulkViewSub: "bulkViewSub"
}
