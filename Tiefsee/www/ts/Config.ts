
class Config {

    private baseWindow: BaseWindow;

    constructor(_baseWindow: BaseWindow) {
        this.baseWindow = _baseWindow;
    }


    public otherAppOpenList = {
        absolute: [
            //{ name: "小畫家", path: "C:/Windows/system32/mspaint.exe", type: ["img"] },
            //{ name: "Google Chrome", path: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe", type: ["*"] },
            //{ name: "Google Chrome", path: "C:/Program Files/Google/Chrome/Application/chrome.exe", type: ["img"] },
        ] as { name: string, path: string, type: string[], }[],
        startMenu: [
            { name: "mspaint", type: ["img"] },
            { name: "photoshop", type: ["img"] },
            { name: "illustrator", type: ["img"] },
            { name: "Lightroom", type: ["img"] },
            { name: "Paint", type: ["img"] },
            { name: "photo", type: ["img"] },
            { name: "gimp", type: ["img"] },
            { name: "FireAlpaca", type: ["img"] },
            { name: "openCanvas", type: ["img"] },
            { name: "SAI", type: ["img"] },
            { name: "Pixia", type: ["img"] },
            { name: "AzPainter2", type: ["img"] },
            { name: "CorelDRAW", type: ["img"] },
            { name: "Krita", type: ["img"] },
            { name: "Artweaver", type: ["img"] },
            { name: "Lightroom", type: ["img"] },
            { name: "Perfect Effects", type: ["img"] },
            { name: "Artweaver ", type: ["img"] },
            { name: "Honeyview", type: ["img"] },
            { name: "ACDSee", type: ["img"] },
            { name: "IrfanView", type: ["img"] },
            { name: "XnView", type: ["img"] },
            { name: "FastStone", type: ["img"] },
            { name: "Hamana", type: ["img"] },
            { name: "Vieas", type: ["img"] },
            { name: "FreeVimager", type: ["img"] },
            { name: "Imagine", type: ["img"] },
            { name: "XnConvert", type: ["img"] },
            { name: "FotoSketcher", type: ["img"] },
            { name: "PhoXo", type: ["img"] },
            { name: "ScreenSketch", type: ["img"] }, //Windows的剪裁工具
            { name: "imageGlass", type: ["img"] },
        ]
    }


    public exif = {
        whitelist: [
            "Date/Time Original", //拍攝日期
            "Windows XP Keywords", //標籤
            "Rating", //評等
            "Image Width/Height", //圖片尺寸
            "Length", //檔案大小
            "Windows XP Title", //標題
            "Artist", //作者
            "Copyright", //版權
            "Image Description", //描述
            "Windows XP Comment", //註解
            "User Comment", //註解
            "Make", //相機型號
            "Model", //相機製造商
            "Windows XP Subject", //主旨
            "F-Number", //光圈孔徑
            "Exposure Time", //曝光時間
            "ISO Speed Ratings", //ISO速度
            "Exposure Bias Value", //曝光補償
            "Focal Length", //焦距
            "Max Aperture Value", //最大光圈
            "Metering Mode", //測光模式
            "Flash", //閃光燈模式
            "Focal Length 35", //35mm焦距
            "Orientation", //旋轉資訊
            "Software", //軟體
            //"Color Space", //色彩空間
            "Creation Time", //建立日期
            "Last Write Time", //修改日期
            //"Last Access Time", //存取時間
            "Textual Data", //PNG tEXt
            "Map", //Google Map
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
            /** 是否啟用毛玻璃 */
            "aeroType": "none", //none / win7 / win10
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
            /** 圖片dpi縮放 */
            "dpizoom": "-1",
            /** 圖片渲染模式 */
            "tiefseeviewImageRendering": "0",
            /** 圖片預設縮放模式 */
            tiefseeviewZoomType: "full-100%",
            /** 圖片預設縮放模式(值) */
            tiefseeviewZoomValue: 100,
            /** 圖片預設對齊位置 */
            tiefseeviewAlignType: "C",

            /** 縮小至特定比例以下，就使用libvips重新處理圖片 */
            tiefseeviewBigimgscaleRatio: 0.8
        },

        /** 預設裴谞 */
        sort: {
            /** 預設檔案排序 */
            fileSort: "name",
            /** 預設資料夾排序 */
            dirSort: "name",
        },

        /** 佈局 */
        layout: {
            fileListEnabled: true, //啟用 檔案預覽視窗
            fileListShowNo: true, //顯示編號
            fileListShowName: true, //顯示檔名
            fileListShowWidth: 100, //寬度

            dirListEnabled: false, //啟用 資料夾預覽視窗
            dirListShowNo: true, //顯示編號
            dirListShowName: true, //顯示檔名
            dirListShowWidth: 200, //寬度
            dirListImgNumber: 3, //圖片數量

            mainExifEnabled: false, //啟用 詳細資料視窗
            mainExifShowWidth: 150, //寬度
            mainExifMaxLine: 20, //顯示的最大行數
            mainExifHorizontal: true, //寬度足夠時，橫向排列
            mainExifCollapse: {} as { [key: string]: boolean },

            /** 啟用 工具列 */
            mainToolbarEnabled: true,
            /** 工具列對齊。 left / center */
            mainToolbarAlign: "left",

            /** 大型切換按鈕。 leftRight / bottom / none  */
            largeBtn: "bottom",

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
            /**  */
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
            /** 刪除前顯示詢問視窗 */
            fileDeletingShowCheckMsg: true,

            /** 偵測到檔案新增時，插入於 (auto | start | end) */
            whenInsertingFile: "auto",

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


    private _allowFile_img: { ext: string; type: string; vipsType?: string; }[] = [];
    private _allowFile_video: { ext: string; type: string; vipsType?: string; }[] = [];
    private _allowFile_pdf: { ext: string; type: string; vipsType?: string; }[] = [];
    private _allowFile_txt: { ext: string; type: string; vipsType?: string; }[] = [];
    /** 
     * 初始化 檔案關聯列表
     */
    private initAllowFileType() {

        let plugin: AppInfoPlugin | undefined = this.baseWindow.appInfo?.plugin;
        if (plugin == null) { return; }

        //img
        (() => {
            this._allowFile_img = [
                { ext: "jpg", type: "vips", vipsType: "jpg" }, //如果檔案的ICC Profile為CMYK，則先使用WPF處理圖片
                { ext: "jpeg", type: "vips", vipsType: "jpg" },
                { ext: "jfif", type: "vips", vipsType: "jpg" },
                { ext: "jpe", type: "vips", vipsType: "jpg" },
                { ext: "png", type: "vips", vipsType: "vips" },
                { ext: "webp", type: "vips", vipsType: "vips" },
                { ext: "bmp", type: "vips", vipsType: "bitmap" },
                { ext: "apng", type: "web" },
                { ext: "gif", type: "web" },
                { ext: "svg", type: "web" },
                { ext: "ico", type: "web" },

                { ext: "tif", type: "vips", vipsType: "tif" },
                { ext: "tiff", type: "vips", vipsType: "tif" },
                { ext: "dds", type: "vips", vipsType: "wpf" },

                { ext: "psd", type: "vips", vipsType: "magick" },
                { ext: "psb", type: "vips", vipsType: "magick" },
                { ext: "pcx", type: "vips", vipsType: "magick" },
                { ext: "heic", type: "vips", vipsType: "magick" },
                { ext: "avif", type: "vips", vipsType: "wpf,magick" }, //如果有安裝「AV1 Video Extension」，就可以使用wpf以更快的速度開啟
                { ext: "fits", type: "vips", vipsType: "magick" },
                //{ ext: "dcm",type:"vips", vipsType:"magick" }, //多幀
                { ext: "hdr", type: "vips", vipsType: "magick" }, //必須輸出成png顏色才不會跑掉
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
                { ext: "jp2", type: "vips", vipsType: "magick" }, //開啟速度很慢
                { ext: "sct", type: "vips", vipsType: "magick" },
                { ext: "mef", type: "vips", vipsType: "magick" }, //向量
                { ext: "wmf", type: "vips", vipsType: "magick" },
                { ext: "mpo", type: "vips", vipsType: "magick" }, //相機
                { ext: "jxl", type: "vips", vipsType: "magick" }, //JPEG XL，開啟速度很慢

                { ext: "crw", type: "vips", vipsType: "dcraw" },
                { ext: "raf", type: "vips", vipsType: "dcraw" },
                { ext: "cr2", type: "vips", vipsType: "dcraw" },
                { ext: "mrw", type: "vips", vipsType: "dcraw" },
                { ext: "nef", type: "vips", vipsType: "dcraw" },
                { ext: "x3f", type: "vips", vipsType: "dcraw" },
                { ext: "pef", type: "vips", vipsType: "dcraw" },
                { ext: "orf", type: "vips", vipsType: "dcraw" },
                { ext: "rw2", type: "vips", vipsType: "dcraw" },
                { ext: "arw", type: "vips", vipsType: "dcraw" },
                { ext: "erf", type: "vips", vipsType: "dcraw" },
                { ext: "sr2", type: "vips", vipsType: "dcraw" },
                { ext: "srw", type: "vips", vipsType: "dcraw" },
                { ext: "dng", type: "vips", vipsType: "dcraw" },

                { ext: "afphoto", type: "vips", vipsType: "extractPng" },
                { ext: "afdesign", type: "vips", vipsType: "extractPng" },
                { ext: "clip", type: "vips", vipsType: "clip" },
            ]

            //有安裝NConvert才使用
            /*if (plugin.NConvert === true) {
                this._allowFile_img.push(
                    { ext: "afphoto", type: "vips", vipsType: "nconvertPng" },
                    { ext: "afdesign", type: "vips", vipsType: "nconvertPng" },
                    { ext: "dcm", type: "vips", vipsType: "magick,nconvertJpg" },
                    //{ ext: "iff",    type:"vips", vipsType: "nconvertJpg" }, //必須使用 heif.zip 裡面的dll
                    { ext: "clip", type: "vips", vipsType: "nconvertJpg" }, //必須使用 clip.dll
                );
            }*/

        })();


        //video
        (() => {
            this._allowFile_video = [
                { ext: "mp4", type: "video" },
                { ext: "webm", type: "video" },
                { ext: "ogv", type: "video" },
            ]
        })();


        //pdf
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
                    //{ ext: "odt", type: "PDFTronWebviewer" },
                    //{ ext: "odp", type: "PDFTronWebviewer" },
                    //{ ext: "xlsx", type: "PDFTronWebviewer" },
                );
            }
        })();


        //txt
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

        let plugin: AppInfoPlugin | undefined = this.baseWindow.appInfo?.plugin;
        if (plugin == null) { return []; }

        //首次執行進行初始化
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


var GroupType = {

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