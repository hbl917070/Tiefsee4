import { Lib } from "../../Lib";

/**
 * InvokeAI (解析 json)
 */
export function getInvokeai(jsonStr: string) {
    let json: any;

    try {
        json = JSON.parse(jsonStr);
    } catch (e) {
        return [];
    }

    let retData: { title: string, text: string }[] = [];
    let arkey = Object.keys(json);
    let objImage; // json 裡面的圖片節點

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

        if (title === "images" && text.length > 0) { // 如果是圖片陣列(連續產圖)，則只抓第一張
            objImage = text[0];
            continue;
        }
        if (title === "image") {
            objImage = text;
            continue;
        }

        if (typeof text === "object") {
            text = Lib.jsonStrFormat(text).jsonFormat;
        }

        retPush(title, text);
    }

    if (objImage !== undefined) {
        let prompt = objImage.prompt[0].prompt;
        let seed = objImage.seed;
        let steps = objImage.steps;
        let cfg = objImage.cfg_scale;
        let sampler = objImage.sampler;

        retPush("Prompt", prompt);
        retPush("Seed", seed);
        retPush("Steps", steps);
        retPush("CFG", cfg);
        retPush("Sampler", sampler);
    }

    return retData;
}
