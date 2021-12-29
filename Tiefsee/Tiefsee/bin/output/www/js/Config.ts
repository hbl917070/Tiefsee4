
class Config {

    constructor() { }


    public OtherAppOpenList = {
        absolute: [
            { name: "小畫家", path: "C:/Windows/system32/mspaint.exe", type: ["img"] },
            { name: "Google Chrome", path: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe", type: ["*"] },
            { name: "Google Chrome", path: "C:/Program Files/Google/Chrome/Application/chrome.exe", type: "img" },
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
            "aero": false,
            "--window-border-radius": 7,
            "--color-window-background": { r: 31, g: 39, b: 43, a: 0.97 },
            "--color-window-border": { r: 255, g: 255, b: 255, a: 0.25 },
            "--color-white": { r: 255, g: 255, b: 255, },
            "--color-black": { r: 0, g: 0, b: 0, },
            "--color-blue": { r: 0, g: 200, b: 255, },
            "--color-grey": { r: 30, g: 30, b: 30, },
        },
        image: {
            "dpizoom": "-1",
            "tieefseeviewImageRendering": "0"
        }
    }


    /**
     * 
     * @param type 
     * @returns 
     */
    public allowFileType(type: string) {

        if (type === GroupType.img) {
            return [
                { ext: "jpg", type: ["image"] },
                { ext: "png", type: ["image"] },
                { ext: "gif", type: ["image"] },
                { ext: "bmp", type: ["image"] },
                { ext: "webp", type: ["image"] },
                { ext: "jpeg", type: ["image"] },
                //{ ext: "tif", type: ["image"] },
                { ext: "svg", type: ["image"] },
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

    movie: "movie",

}