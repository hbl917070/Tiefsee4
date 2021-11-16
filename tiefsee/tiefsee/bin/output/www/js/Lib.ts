class Lib {

    /**
     * 取得檔名。例如「abc.jpg」
     * @param path 
     * @returns 
     */
    public static GetFileName = (path: string) => {

        path = path.replace(/[/]/ig, "\\");
        let name = path.substr(path.lastIndexOf("\\") + 1);//取得檔名
        return name;
    }

    /**
     * 取得附檔名。例如「.jpg」
     * @param path 
     * @returns 
     */
    public static GetExtension = (path: string) => {
        path = path.replace(/[/]/ig, "\\");
        let name = path.substr(path.lastIndexOf("\\") + 1);//取得檔名
        let index = name.lastIndexOf(".");
        if (index === -1) { return ""; }
        return "." + name.substr(index + 1).toLocaleLowerCase();
    }

    public static Combine = (arPath: string[]): string => {

        if (arPath.length === 0) { return "" }
        if (arPath.length === 1) { return arPath[0] }

        let sum = arPath[0];
        sum = sum.replace(/[\\]+$/, '');//移除結尾斜線
        sum += "\\"
        
        for (let i = 1; i < arPath.length; i++) {
            let item = arPath[i];
            item = item.replace(/^([\\])+/, '');//移除開頭斜線
            item = item.replace(/[\\]+$/, '');//移除結尾斜線
            sum += item
            if (i != arPath.length - 1) {
                sum += "\\"
            }
        }
        return sum
    }

    /**
     * 註冊 double click 事件
     * @param dom 
     * @param func 
     * @param dealy 雙擊的時間(毫秒)
     */
    public static AddEventDblclick(dom: HTMLDivElement, func: (e: MouseEvent) => void, dealy: number = 400) {

        var clickTimeout = -1;
        var _x = 0;
        var _y = 0;

        dom.addEventListener("mousedown", async (e: MouseEvent) => {

            if (clickTimeout !== -1) {

                // double click!
                clearTimeout(clickTimeout);
                clickTimeout = -1;
                if (Math.abs(_x - e.offsetX) < 4 && Math.abs(_y - e.offsetY) < 4) {//如果點擊位置一樣
                    func(e)
                }

            } else {
                _x = e.offsetX;
                _y = e.offsetY;
                clickTimeout = setTimeout(function () {
                    // click!
                    clickTimeout = -1;
                }, dealy);
            }
        });


    }
}
