
class Config {

    constructor() { }


    public OtherAppOpenList = {
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
            "aero": false,
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
            /**圖片dpi縮放 */
            "dpizoom": "-1",
            /** 圖片渲染模式 */
            "tieefseeviewImageRendering": "2"
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
        },

        /** 記錄程式上次關閉時的位置 */
        position: {
            left: -9999,
            top: -9999,
            width: 600,
            height: 600,
            windowState: "Normal"
        },

        /** 進階設定 */
        advanced: {
            /**子資料夾數量太多就禁用資料夾預覽列表 */
            dirListMaxCount: 5000,
            /** 圖片面積大於這個數值的平方，就禁用高品質縮放 */
            highQualityLimit: 7000,
        }
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


    /**
     * 
     * @param type 
     * @returns 
     */
    public allowFileType(type: string) {

        if (type === GroupType.img) {
            return [
                { ext: "jpg", type: ["web"] },
                { ext: "png", type: ["web"] },
                { ext: "apng", type: ["web"] },
                { ext: "gif", type: ["web"] },
                { ext: "bmp", type: ["web"] },
                { ext: "webp", type: ["web"] },
                { ext: "jpeg", type: ["web"] },
                { ext: "svg", type: ["web"] },
                { ext: "ico", type: ["web"] },

                { ext: "tif", type: ["wpf"] },
                { ext: "tiff", type: ["wpf"] },
                { ext: "dds", type: ["wpf"] },
                { ext: "jfif", type: ["wpf"] },

                { ext: "psd", type: ["magick"] },
                { ext: "psb", type: ["magick"] },
                { ext: "pcx", type: ["magick"] },
                { ext: "heic", type: ["magick"] },
                { ext: "avif", type: ["wpf", "magick"] },//如果有安裝「AV1 Video Extension」，就可以使用wpf以更快的速度開啟
                { ext: "fits", type: ["magick"] },
                //{ ext: "dcm", type: ["magick"] },//多幀
                { ext: "hdr", type: ["magick"] },
                { ext: "miff", type: ["magick"] },
                { ext: "mng", type: ["magick"] },
                { ext: "otb", type: ["magick"] },
                { ext: "pfm", type: ["magick"] },
                { ext: "pgm", type: ["magick"] },
                { ext: "ppm", type: ["magick"] },
                { ext: "tga", type: ["magick"] },
                { ext: "xcf", type: ["magick"] },
                { ext: "xpm", type: ["magick"] },
                { ext: "qoi", type: ["magick"] },
                { ext: "pbm", type: ["magick"] },
                { ext: "exr", type: ["magick"] },
                { ext: "jpf", type: ["magick"] },
                { ext: "sct", type: ["magick"] },
                { ext: "mef", type: ["magick"] },//向量
                { ext: "wmf", type: ["magick"] },
                { ext: "mpo", type: ["magick"] },//相機

                { ext: "crw", type: ["dcraw"] },
                { ext: "raf", type: ["dcraw"] },
                { ext: "cr2", type: ["dcraw"] },
                { ext: "mrw", type: ["dcraw"] },
                { ext: "nef", type: ["dcraw"] },
                { ext: "x3f", type: ["dcraw"] },
                { ext: "pef", type: ["dcraw"] },
                { ext: "orf", type: ["dcraw"] },
                { ext: "rw2", type: ["dcraw"] },
                { ext: "arw", type: ["dcraw"] },
                { ext: "erf", type: ["dcraw"] },
                { ext: "sr2", type: ["dcraw"] },
                { ext: "srw", type: ["dcraw"] },
                { ext: "dng", type: ["dcraw"] },

                { ext: "afphoto", type: ["nconvertPng"] },
                { ext: "afdesign", type: ["nconvertPng"] },
                { ext: "dcm", type: ["nconvertBmp"] },
                //{ ext: "iff", type: ["nconvertBmp"] }, //必須使用 heif.zip 裡面的dll
                { ext: "clip", type: ["nconvertBmp"] }, //必須使用 clip.dll

            ]
        }

        if (type === GroupType.video) {
            return [
                { ext: "mp4", type: ["video"] },
                { ext: "webm", type: ["video"] },
                { ext: "ogv", type: ["video"] },
                //{ ext: "ogg", type: ["video"] },     
            ]
        }

        if (type === GroupType.pdf) {
            return [
                { ext: "pdf", type: ["pdf"] },
                { ext: "ai", type: ["pdf"] },
            ]
        }

        if (type === GroupType.txt) {
            return [
                { ext: "txt", type: ["txt"] },
                { ext: "css", type: ["css"] },
                { ext: "scss", type: ["scss"] },
                { ext: "sass", type: ["sass"] },
                { ext: "less", type: ["less"] },
                { ext: "js", type: ["js"] },
                { ext: "ts", type: ["ts"] },
                { ext: "xml", type: ["xml"] },
                { ext: "html", type: ["html"] },
                { ext: "php", type: ["php"] },
                { ext: "py", type: ["py"] },
                { ext: "java", type: ["java"] },
                { ext: "cs", type: ["cs"] },
                { ext: "c", type: ["c"] },
                { ext: "cpp", type: ["cpp"] },
                { ext: "go", type: ["go"] },
                { ext: "r", type: ["r"] },
                { ext: "ini", type: ["ini"] },
                { ext: "log", type: ["log"] },
                { ext: "json", type: ["json"] },
                { ext: "sql", type: ["sql"] },
            ]
        }

        return []
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