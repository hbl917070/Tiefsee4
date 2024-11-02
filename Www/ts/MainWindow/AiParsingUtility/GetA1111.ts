import { Lib } from "../../Lib";

/**
 * Automatic1111 (字串分割)
 */
export function getA1111(val: string) {

    /**
        剖析參數，例如
        傳入 Sampler: DPM++ 2M Karras, ADetailer prompt: "\"blue eyes\", smileing: 0.8, open mouth"
        回傳 [
            {title:"Sampler", text: "DPM++ 2M Karras"}, 
            {title:"ADetailer prompt", text: `"blue eyes", smileing: 0.8, open mouth`}
        ]
    */
    function parseParameters(input: string) {

        // 先把 \" 替換成其他符號，避免剖析失敗
        input = input.replace(/\\"/g, "\uFDD9");

        // 切割
        let parts = [];
        let stack = [];
        let partStart = 0;
        for (let i = 0; i < input.length; i++) {
            if (input[i] === '[') {
                stack.push('[');
            } else if (input[i] === ']') {
                if (stack.length > 0 && stack[stack.length - 1] === '[') {
                    stack.pop();
                }
            }
            else if (input[i] === '{') {
                stack.push('{');
            } else if (input[i] === '}') {
                if (stack.length > 0 && stack[stack.length - 1] === '{') {
                    stack.pop();
                }
            }
            else if (input[i] === '"') {
                if (stack.length > 0 && stack[stack.length - 1] === '"') {
                    stack.pop();
                } else {
                    stack.push('"');
                }
            }
            else if (input[i] === ',' && stack.length === 0) {
                parts.push(input.slice(partStart, i));
                partStart = i + 1;
            }
        }
        parts.push(input.slice(partStart));
        parts = parts.map(s => s.replace(/\uFDD9/g, '\\"').trim());

        let result = [];
        for (let i = 0; i < parts.length; i++) {
            let subParts = parts[i].split(":");
            let title = subParts[0].trim();
            let text = subParts.slice(1).join(":").trim();
            if (text.startsWith('"') && text.endsWith('"')) { // 開頭跟結尾是 "									
                text = text.slice(1, -1); // 去除開頭跟結尾的"
                text = text.replace(/\\n/g, "\n"); // 處理換行
                text = text.replace(/\\["]/g, '"'); // 把內容裡面的 \" 處理成 "
            }
            let jsonF = Lib.jsonStrFormat(text);
            if (jsonF.ok) { // 如果是json (例如 Hashes

                text = CivitaiStringify(jsonF.json);

            } else {
                if (title === "Tiled Diffusion" && text.startsWith('{') && text.endsWith('}')) { //格式例如 {'Method': 'MultiDiffusion', 'Tile tile width': 96}
                    text = text.replace(/[,][ ]/g, `, \n`);
                }
                if (title === "Lora hashes" || title === "TI hashes") {
                    text = text.replace(/[,][ ]/g, `, \n`);
                }
                if (title === "ControlNet" || title === "ControlNet 0" || title === "ControlNet 1" || title === "ControlNet 2") {
                    let lines = text.split(/,(?![^()]*\))(?![^\[\]]*\])(?![^{}]*})(?![^"]*")/).map(line => line.trim());
                    text = lines.join(", \n");
                }
            }

            result.push({ title: title, text: text });
        }
        return result;
    }

    /**
     * 格式化 Civitai resources 的 json
     */
    function CivitaiStringify(obj: any) {
        try {
            var jsonFormat = JSON.stringify(obj, null, "\uFDD9");
            jsonFormat = jsonFormat.replace(/\uFDD9/g, "");
            jsonFormat = jsonFormat
                .replace(/\[\n/g, "[")
                .replace(/\n\]/g, "]")
                .replace(/\{\n/g, "{")
                .replace(/\n\}/g, "}");
            return jsonFormat;

        } catch (e) {
            return obj.toString();
        }
    }

    /**
     * 依照大項目進行切割
     */
    function parseString(str: string) {
        let result: { key: string, value: string }[] = [];

        // v1.7後 Template 跟 Negative Template 直接當做一般項目來解析即可
        // 而舊版的則需要當做大項目來剖析，所以在前面加上 \n ，與新版做區別
        let keys = ["Prompt", "Negative prompt", "Steps", "\nTemplate", "\nNegative Template"];
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let index = str.indexOf(key + ":");
            if (index !== -1) {
                let endIndex = str.length;
                for (let j = i + 1; j < keys.length; j++) {
                    let nextIndex = str.indexOf(keys[j] + ":");
                    if (nextIndex !== -1) {
                        endIndex = nextIndex;
                        break;
                    }
                }
                let value = str.slice(index + key.length + 1, endIndex).trim();
                result.push({ key, value });
            }
        }
        return result;
    }

    function retPush(title: string, text: string | undefined) {
        if (text !== undefined && text !== "") {
            retData.push({
                title: title,
                text: text
            });
        }
    }

    // 提示詞不會有 title，所以要補上
    if (val.startsWith("Negative prompt:") === false && val.startsWith("Steps:") === false) {
        val = "Prompt: " + val;
    }
    let retData: { title: string, text: string }[] = [];
    let arItem = parseString(val);

    for (let i = 0; i < arItem.length; i++) {
        const item = arItem[i];
        if (item.key === "Steps") {
            let arOther = parseParameters("Steps: " + item.value);
            for (let i = 0; i < arOther.length; i++) {
                const title = arOther[i].title;
                const text = arOther[i].text;
                retPush(title, text);
            }
        } else {
            retPush(item.key, item.value); // 提示
        }
    }

    return retData;
}
