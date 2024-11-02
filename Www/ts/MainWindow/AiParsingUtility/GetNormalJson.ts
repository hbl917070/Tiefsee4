import { Lib } from "../../Lib";

/**
 * 一般的 json 解析
 */
export function getNormalJson(jsonStr: string) {

    let json: any;

    if (typeof jsonStr == "string") {
        try {
            json = JSON.parse(jsonStr);
        } catch (e) {
            return [];
        }
    } else {
        json = jsonStr;
    }

    const retData: { title: string, text: string }[] = [];
    const arkey = Object.keys(json);

    function retPush(title: string, text: string | undefined) {
        if (text !== undefined && text !== null && text !== "") {
            retData.push({
                title: title,
                text: text.toString().trim()
            });
        }
    }

    for (let i = 0; i < arkey.length; i++) {
        let title = arkey[i];
        let text = json[title];

        if (typeof text === "object") {
            text = Lib.jsonStrFormat(text).jsonFormat;
        }

        retPush(title, text);
    }

    return retData;
}
