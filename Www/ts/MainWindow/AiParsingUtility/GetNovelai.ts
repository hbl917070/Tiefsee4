import { Lib } from "../../Lib";

/**
 * NovelAI (解析 json)
 */
export function getNovelai(jsonStr: string) {
    let json: any;

    try {
        json = JSON.parse(jsonStr);
    } catch (e) {
        return [];
    }

    var retData: { title: string, text: string }[] = [];

    function retPush(title: string, text: string | undefined) {
        if (typeof text === "object") {
            text = Lib.jsonStrFormat(text).jsonFormat;
        }
        if (text !== undefined && text !== null && text !== "") {
            retData.push({
                title: title,
                text: text.toString().trim()
            });
        }
    }

    // 指定順序依序加入
    let keysOrder = [
        "prompt", "uc",
        "steps", "sampler", "cfg_rescale", "seed",
        "width", "height", "request_type"
    ];
    keysOrder.forEach(key => {
        if (json.hasOwnProperty(key)) {
            retPush(key, json[key]);
            delete json[key];
        }
    });

    // 把剩下的加入
    for (let key in json) {
        retPush(key, json[key]);
    }

    return retData;
}
