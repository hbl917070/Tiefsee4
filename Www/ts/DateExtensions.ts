/**
 * 對 Date 的擴充套件，將 Date 轉化為指定格式的String
 * 月(M)、日(d)、小時(h)、分(m)、秒(s)、季度(q) 可以用 1-2 個佔位符，
 * 年(y)可以用 1-4 個佔位符，毫秒(S)只能用 1 個佔位符(是 1-3 位的數字)
 * 例子：
 * (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 * (new Date()).format("yyyy-M-d h:m:s.S")   ==> 2006-7-2 8:9:4.18
 */
Date.prototype.format = function (this: Date, format: string): string {
    const o: { [key: string]: number } = {
        "M+": this.getMonth() + 1, // month
        "d+": this.getDate(), // day
        "h+": this.getHours(), // hour
        "m+": this.getMinutes(), // minute
        "s+": this.getSeconds(), // second
        "q+": Math.floor((this.getMonth() + 3) / 3), // quarter
        "S": this.getMilliseconds() // millisecond
    }

    format = format.replace(/(y+)/, (match) => {
        return (this.getFullYear() + "").substring(4 - match.length);
    });
    for (const k in o) {
        format = format.replace(new RegExp("(" + k + ")"), (match) => {
            return match.length == 1 ? o[k].toString() : ("00" + o[k]).substring(("" + o[k]).length);
        });
    }
    return format;
}
interface Date {
    format(format: string): string;
}
