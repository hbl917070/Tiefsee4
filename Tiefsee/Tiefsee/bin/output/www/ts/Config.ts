
class Config {

    constructor() { }


    public otherAppOpenList = {
        absolute: [
            { name: "小畫家", path: "C:/Windows/system32/mspaint.exe", type: ["img"] },
            { name: "Google Chrome", path: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe", type: ["*"] },
            { name: "Google Chrome", path: "C:/Program Files/Google/Chrome/Application/chrome.exe", type: ["img"] },
        ],
        startMenu: [
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
        ]
    }


    public settings = {
        theme: {
            /** 是否啟用毛玻璃 */
            "aeroType": "none",//none / win7 / win10
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
        image: {
            /** 圖片dpi縮放 */
            "dpizoom": "-1",
            /** 圖片渲染模式 */
            "tieefseeviewImageRendering": "0",
            /** 圖片預設縮放模式 */
            tieefseeviewZoomType: "full-100%",
            /** 圖片預設縮放模式(值) */
            tieefseeviewZoomValue: 100,
            /** 圖片預設對齊位置 */
            tieefseeviewAlignType: "C",

            /** 縮小至特定比例以下，就使用libvips重新處理圖片 */
            tiefseeviewBigimgscaleRatio: 0.8
        },
        sort: {
            /** 預設檔案排序 */
            fileSort: "name",
            /** 預設資料夾排序 */
            dirSort: "name",
        },

        layout: {
            fileListEnabled: true,//啟用 檔案預覽列表
            fileListShowNo: true,//顯示編號
            fileListShowName: true,//顯示檔名
            fileListShowWidth: 100,//寬度

            dirListEnabled: false,//啟用 資料夾預覽列表
            dirListShowNo: true,//顯示編號
            dirListShowName: true,//顯示檔名
            dirListShowWidth: 200,//寬度
            dirListImgNumber: 3,//圖片數量

            mainToolsEnabled: true,//啟用 工具列

            mainExifEnabled: false,//啟用 詳細資料視窗
            mainExifShowWidth: 150,//寬度

            /** 大型切換按鈕 leftRight / bottom / none  */
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
        mainTools: { img: [], pdf: [], txt: [] } as {
            img: { n: string; v: boolean; }[];
            pdf: { n: string; v: boolean; }[];
            txt: { n: string; v: boolean; }[];
        },

        /** 進階設定 */
        advanced: {
            /**子資料夾數量太多就禁用資料夾預覽列表 */
            dirListMaxCount: 5000,
            /** 圖片面積大於這個數值的平方，就禁用高品質縮放 */
            highQualityLimit: 4000,
        },

        /** 搜圖 */
        imgSearch: {
            /** 搜圖用的清單 */
            list: [
                { name: "sauceNAO", icon: "./img/imgSearch/saucenao.png", url: "https://saucenao.com/search.php?db=999&url={url}" },
                { name: "Yandex", icon: "./img/imgSearch/yandex.png", url: "https://yandex.com/images/search?rpt=imageview&url={url}" },
                { name: "Google", icon: "./img/imgSearch/google.png", url: "https://www.google.com/searchbyimage?image_url={url}" },
                { name: "Ascii2d", icon: "./img/imgSearch/ascii2d.png", url: "https://ascii2d.net/search/url/{url}" },
                { name: "Bing", icon: "./img/imgSearch/bing.png", url: "https://www.bing.com/images/search?view=detailv2&iss=sbi&FORM=SBIIDP&sbisrc=UrlPaste&idpbck=1&q=imgurl:{url}" },
                //{ name: "IQDB", icon: "./img/imgSearch/iqdb.png", url: "https://iqdb.org/?url={url}" },
            ],
            /** 上傳圖片的server */
            imgServer: "https://hbl917070.com/imgSearch/upload",
            /** api key，使用thumbsnap時才需要用到 */
            imgServerKey: "",
            //imgServer: "https://thumbsnap.com/api/upload",
            //key: "00001bfd3de40a19b62672faeb3fa564",
        },

        exif: {
            whitelist: [
                "Date/Time Original",
                "Windows XP Keywords",
                "Rating",
                "Image Width/Height",
                "Length",
                "Windows XP Title",
                "Artist",
                "Windows XP Comment",
                "Make",
                "Model",
                "Windows XP Subject",
                "F-Number",
                "Exposure Time",
                "ISO Speed Ratings",
                "Exposure Bias Value",
                "Focal Length",
                "Max Aperture Value",
                "Metering Mode",
                "Flash(key)",
                "Focal Length 35",
                "Orientation",//旋轉資訊
                "Software",//軟體
                //"Color Space",//色彩空間
                "Crea tionTime",
                "Last WriteTime",
                "Map",//Google Map
            ]
        },
    }


    /**
     * 
     * @param type 
     * @returns 
     */
    public allowFileType(type: string) {

        if (type === GroupType.img) {
            return [
                { ext: "jpg", type: "vips", vipsType: "jpg" },//如果檔案的ICC Profile為CMYK，則先使用WPF處理圖片
                { ext: "jpeg", type: "vips", vipsType: "jpg" },
                { ext: "jfif", type: "vips", vipsType: "jpg" },
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
                { ext: "avif", type: "vips", vipsType: "wpf,magick" },//如果有安裝「AV1 Video Extension」，就可以使用wpf以更快的速度開啟
                { ext: "fits", type: "vips", vipsType: "magick" },
                //{ ext: "dcm",type:"vips", vipsType:"magick" },//多幀
                { ext: "hdr", type: "vips", vipsType: "magick" },//必須輸出成png顏色才不會跑掉
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
                { ext: "jp2", type: "vips", vipsType: "magick" },//開啟速度很慢
                { ext: "sct", type: "vips", vipsType: "magick" },
                { ext: "mef", type: "vips", vipsType: "magick" },//向量
                { ext: "wmf", type: "vips", vipsType: "magick" },
                { ext: "mpo", type: "vips", vipsType: "magick" },//相機
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

                { ext: "afphoto", type: "vips", vipsType: "nconvertPng" },
                { ext: "afdesign", type: "vips", vipsType: "nconvertPng" },
                { ext: "dcm", type: "vips", vipsType: "magick,nconvertJpg" },
                //{ ext: "iff",    type:"vips", vipsType: "nconvertJpg" }, //必須使用 heif.zip 裡面的dll
                { ext: "clip", type: "vips", vipsType: "nconvertJpg" }, //必須使用 clip.dll


            ]
        }

        if (type === GroupType.video) {
            return [
                { ext: "mp4", type: "video" },
                { ext: "webm", type: "video" },
                { ext: "ogv", type: "video" },
                //{ ext: "ogg", type: "video" },     
            ]
        }

        if (type === GroupType.pdf) {
            return [
                { ext: "pdf", type: "pdf" },
                { ext: "ai", type: "pdf" },
            ]
        }

        if (type === GroupType.txt) {
            return [
                { ext: "txt", type: "txt" },
                { ext: "css", type: "css" },
                { ext: "scss", type: "scss" },
                { ext: "sass", type: "sass" },
                { ext: "less", type: "less" },
                { ext: "js", type: "js" },
                { ext: "ts", type: "ts" },
                { ext: "xml", type: "xml" },
                { ext: "html", type: "html" },
                { ext: "php", type: "php" },
                { ext: "py", type: "py" },
                { ext: "java", type: "java" },
                { ext: "cs", type: "cs" },
                { ext: "c", type: "c" },
                { ext: "cpp", type: "cpp" },
                { ext: "go", type: "go" },
                { ext: "r", type: "r" },
                { ext: "ini", type: "ini" },
                { ext: "log", type: "log" },
                { ext: "json", type: "json" },
                { ext: "sql", type: "sql" },
            ]
        }

        return []
    }

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

    /** 純文字 */
    txt: "txt",

    /** 影片 */
    video: "video",
}