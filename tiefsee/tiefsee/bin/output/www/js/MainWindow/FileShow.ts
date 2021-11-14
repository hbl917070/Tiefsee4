
class FileShow {


    public openImage;
    public openPdf;
    public view_image;

    constructor(M: MainWindow) {

        var view_image: Tieefseeview = new Tieefseeview(<HTMLDivElement>document.querySelector("#main-tiefseeview"));
        var dom_image = <HTMLDivElement>document.querySelector("#main-tiefseeview")
        var dom_pdf = <HTMLDivElement>document.querySelector("#main-pdfview")



        this.openImage = openImage;
        this.openPdf = openPdf;
        this.view_image = view_image;

        openImage("https://wall.bahamut.com.tw/B/40/5328257e8d00594e61f8b815d505cab3_4080425.JPG")





        async function openImage(_path: string) {

            //let _url = ;
            dom_image.style.display = "block";
            dom_pdf.style.display = "none";

            let imgurl = _path;//圖片網址
            if (await WV_File.Exists(_path) === true) {
                imgurl = "/api/getimg/" + encodeURIComponent(_path);
            }

            //await view_image.loadImg(imgurl);
            view_image.setLoading(true);

            await view_image.getIsLoaded(imgurl);//預載入
            if (view_image.getOriginalWidth() * view_image.getOriginalHeight() > 2000 * 2000) {
                await view_image.loadBigimg(imgurl);
            } else {
                await view_image.loadImg(imgurl);
            }
            
            view_image.setLoading(false);

            view_image.transformRefresh(false)
            view_image.zoomFull(TieefseeviewZoomType['full-100%']);


            //圖片長寬
            let dom_size = M.dom_tools.querySelector(`[data-name="infoSize"]`);
            if (dom_size != null) {
                dom_size.innerHTML = `${view_image.getOriginalWidth()}<br>${view_image.getOriginalHeight()}`;
            }

            if (await WV_File.Exists(_path) === true) {
                //檔案類型
                let dom_type = M.dom_tools.querySelector(`[data-name="infoType"]`);
                if (dom_type != null) {
                    let fileType = (await getFileType(_path)).toLocaleUpperCase();
                    let fileLength = await getFileLength(_path);
                    dom_type.innerHTML = `${fileType}<br>${fileLength}`;
                }

                //檔案修改時間
                let dom_writeTime = M.dom_tools.querySelector(`[data-name="infoWriteTime"]`);
                if (dom_writeTime != null) {
                    let timeUtc = await WV_File.GetLastWriteTimeUtc(_path);
                    let time = new Date(timeUtc).format("yyyy-MM-dd<br>hh:mm:ss")
                    dom_writeTime.innerHTML = time;
                }
            }

            view_image.setEventChangeZoom(((ratio: number) => {

                let dom_btnScale = M.dom_tools.querySelector(`[data-name="btnScale"]`);
                if (dom_btnScale != null) {
                    dom_btnScale.innerHTML = (ratio * 100).toFixed(0) + "%";
                }


                //$('#output-overflow').html(`水平：${view_image.getIsOverflowX()}  垂直：${view_image.getIsOverflowY()}`);

            }))



        }


        async function getFileLength(path: string) {

            let len = await WV_File.GetFileInfo(path).Length;

            if (len / 1024 < 1) {
                return len.toFixed(1) + " B";

            } else if (len / (1024 * 1024) < 1) {
                return (len / (1024)).toFixed(1) + " KB";
            } else if (len / (1024 * 1024 * 1024) < 1) {
                return (len / (1024 * 1024)).toFixed(1) + " MB";
            }

            return (len / (1024 * 1024 * 1024)).toFixed(1) + " GB";

        }


        async function openPdf(_url: string) {

            dom_image.style.display = "none";
            dom_pdf.style.display = "block";

            dom_pdf.setAttribute("src", _url);
            //dom_pdf.setAttribute("src", "file:///C:/Users/wen/Desktop/dd.html");


        }



        async function getFileType(path: string) {

            let fileType = await WV_File.GetFIleType(path);//取得檔案類型

            let fileExt = await WV_Path.GetExtension(path);//取得附檔名
            fileExt = fileExt.replace(".", "").toLocaleLowerCase();

            if (fileType == "255216") { return "jpg"; }
            if (fileType == "7173") { return "gif"; }
            if (fileType == "13780") { return "png"; }
            if (fileType == "6787") { return "swf"; }
            if (fileType == "6677") { return "bmp"; }
            if (fileType == "5666") { return "psd"; }
            if (fileType == "4838") { return "wmv"; }
            if (fileType == "2669") { return "mkv"; }
            if (fileType == "7076") { return "flv"; }
            if (fileType == "1") { return "ttf"; }
            if (fileType == "8297") { return "rar"; }
            if (fileType == "55122") { return "7z"; }
            if (fileType == "8075") {
                if (fileExt == "docx") { return "docx"; }
                if (fileExt == "pptx") { return "pptx"; }
                if (fileExt == "apk") { return "apk"; }
                if (fileExt == "xd") { return "xd"; }
                return "zip";
            }
            if (fileType == "3780") {
                if (fileExt == "ai") { return "ai"; }
                return "pdf";
            }
            if (fileType == "8273") {
                if (fileExt == "avi") { return "avi"; }
                if (fileExt == "wav") { return "wav"; }
                return "webp";
            }

            return fileExt;//無法辨識，則直接回傳附檔名
        }

    }

}