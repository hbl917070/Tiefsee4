
class FileShow {

    public load;

    public loadurl;

    constructor(M: MainWindow) {

        var tv: Tieefseeview;
        
        this.load = load;
        this.loadurl=loadurl;

        tv = new Tieefseeview(<HTMLDivElement>document.querySelector('#tiefseeview'));

        loadurl("https://wall.bahamut.com.tw/B/40/5328257e8d00594e61f8b815d505cab3_4080425.JPG")


        function load(path: string) {



        }


        async function loadurl(_url: string) {

            //let _url = ;

            await tv.loadImg(_url);
            tv.transformRefresh(false)
            tv.zoomFull(TieefseeviewZoomType['full-100%']);
            $('#output-size').html(`${tv.getOriginalWidth()} , ${tv.getOriginalHeight()}`);
        }


    }

}