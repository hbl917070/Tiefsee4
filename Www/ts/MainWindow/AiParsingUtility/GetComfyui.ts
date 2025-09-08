import { Lib } from "../../Lib";

/**
 * ComfyUI (找到起始節點後，以遞迴方式找出相關節點)
 */
export function getComfyui(jsonStr: string) {

    const _promptBaseKeys = ["positive", "text_positive", "populated_text", "text", "text_g", "conditioning", "prompt", "string", "t5xxl", "text_b", "base_ctx", "text_pos_g", "file_path"];
    const _negativePromptBaseKeys = ["negative", "text_negative", "populated_text", "text", "conditioning", "prompt", "string", "t5xxl", "n_prompt", "base_ctx", "text_neg_g", "file_path"];
    const _stepsBaseKeys = ["steps"];
    const _samplerBaseKeys = ["sampler_name", "sampler"];
    const _schedulerBaseKeys = ["scheduler"];
    const _cfgBaseKeys = ["cfg"];
    const _seedBaseKeys = ["seed", "noise_seed"];
    const _modelBaseKeys = ["ckpt_name", "model", "base_ckpt_name", "unet_name"];
    const _vaeBaseKeys = ["vae_name", "vae"];
    const _denoiseBaseKeys = ["denoise"];
    const _guidanceBaseKeys = ["guidance"];

    let _json: any;

    if (typeof jsonStr == "string") {
        try {
            // 將 NaN 轉成 null
            jsonStr = jsonStr
                .replace(/": NaN/g, `": null`)
                .replace(/": \[NaN/g, `": [null`);
            _json = JSON.parse(jsonStr);
        } catch (e) {
            return [];
        }
    } else {
        _json = jsonStr;
    }

    const _retData: { nodeTitle: string, sort: number, data: { title: string, text: string }[] }[] = [];
    const _arKey = Object.keys(_json);

    let _prompt: string | undefined;
    let _negativePrompt: string | undefined;

    function retPush(nodeTitle: string, data: { title: string, text: string | undefined }[]) {

        if (data.length === 0) { return; }

        let ar: { title: string, text: string }[] = [];
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            let text = item.text;
            let title = item.title;

            // 如果已經加入過相同的提示詞，則略過
            if (title === "Prompt") {
                if (text == _prompt) {
                    text = undefined;
                } else {
                    _prompt = text;
                }
            }
            if (title === "Negative prompt") {
                if (text == _negativePrompt) {
                    text = undefined;
                } else {
                    _negativePrompt = text;
                }
            }

            if (text === undefined || text === null || text === "") { continue; }

            ar.push({
                title: title,
                text: text.toString().trim()
            });
        }

        if (ar.length !== 0) {
            _retData.push({
                nodeTitle: nodeTitle,
                sort: 0,
                data: ar,
            });
        }
    }

    /**
     * 取得 Key (陣列的第一個元素，例如 ["6", 0] => "6")
     */
    function getItemKey(item: any) {
        if (item === undefined) { return undefined; }
        if (Array.isArray(item) === false) { return undefined; }
        if (item.length === 0) { return undefined; }
        return item[0];
    }

    /**
     * 檢查值是否為字串或數字 (用於避免回傳 array 或 object)
     */
    function getStringValue(value: any) {
        if (value === undefined) { return undefined; }
        const type = typeof value;
        if (type !== "string" && type !== "number") { return undefined; }
        return toFixedPrecision(value).toString();
    }

    /**
     * 去除浮點數多餘的位數 (避免出現 1.2000000000000002)
     */
    function toFixedPrecision(val: number) {
        if (typeof val === "number") {
            return Number(val.toFixed(12));
        }
        return val;
    }

    /**
     * 取得值或 Key
     * @param inputs 
     * @param searchKeys 
     * @param allowNumber 
     * @returns 
     */
    function getValue(inputs: any, searchKeys: string[], allowNumber = false) {

        if (inputs === undefined) { return undefined; }

        let key = undefined;
        for (let i = 0; i < searchKeys.length; i++) {
            let text = inputs[searchKeys[i]];
            if (text !== undefined) {
                const type = typeof text;
                if (type === "string" || type === "number") {
                    return toFixedPrecision(text).toString();
                }
                else if (Array.isArray(text) && text.length > 0) {
                    if (key === undefined) {
                        key = text[0];
                    }
                }
            }
        }

        if (key === undefined) { return undefined; }

        return getPrompt(key, searchKeys, allowNumber);
    }

    /**
     * 取得第一個可匹配的 Key 
     * 例如 {A:[3,0], B:[5,0]}
     * 當 key 為 ["B", "A"]，返回 B 的 Key => 5
     * 當 key 為 ["C"]，匹配不到，返回第一個 Key => 3
     */
    function getUnknownKey(inputs: any, searchKeys: string[]) {
        if (inputs === undefined) { return undefined; }
        const keys = Object.keys(inputs);
        if (keys.length === 0) { return undefined; }

        // 無視大小寫
        let index = keys
            .findIndex(k => searchKeys.some(s => k.toLowerCase() === s.toLowerCase()));
        if (index === -1) { index = 0; }
        return getItemKey(inputs[keys[index]]);
    }

    /**
     * 取得提示詞
     * @param key 目標節點的 key
     * @param searchKeys 以遞迴尋找這些 key，直到找到為止
     * @param allowNumber 是否允許數字 (例如 seed)
     * @returns 
     */
    function getPrompt(key: string, searchKeys: string[], allowNumber = false): string | undefined {
        if (key === undefined) { return undefined; }
        const obj = _json[key];
        if (obj === undefined) { return undefined; }
        const inputs = obj.inputs;
        if (inputs === undefined) { return undefined; }

        // 處理需要串接字串的節點
        if (obj.class_type === "Text Concatenate (JPS)") {
            return getConcatenatedPrompts("text", key, searchKeys);
        }
        else if (obj.class_type === "Multi Text Merge") {
            return getConcatenatedPrompts("s", key, searchKeys);
        }
        else if (obj.class_type === "JoinStrings") {
            return getConcatenatedPrompts("string", key, searchKeys);
        }
        else if (obj.class_type === "Text Concatenate") {
            return getConcatenatedPrompts(
                Array.from({ length: 26 }, (_, i) => `text_${String.fromCharCode(97 + i)}`), // text_a, text_b, text_c...
                key,
                searchKeys,
                inputs.delimiter
            );
        }
        else if (obj.class_type === "ConditioningConcat") {
            return getConcatenatedPrompts(["conditioning_to", "conditioning_from"], key, searchKeys);
        }
        else if (obj.class_type === "JoinStringMulti") {
            return getConcatenatedPrompts("string_", key, searchKeys);
        }
        else if (obj.class_type === "StringConcatenate") {
            return getConcatenatedPrompts(["string_a", "string_b"], key, searchKeys);
        }

        let text;
        const arKey = Object.keys(inputs);

        // 是字串且 key 完全匹配
        for (let i = 0; i < searchKeys.length; i++) {
            const key = searchKeys[i];
            for (let j = 0; j < arKey.length; j++) {
                // 無視大小寫
                if (arKey[j].toLowerCase() === key.toLowerCase()) {
                    text = inputs[arKey[j]];
                    if (typeof text === "string") {
                        return text.toString();
                    }
                    if (allowNumber && typeof text === "number") {
                        return toFixedPrecision(text).toString();
                    }
                }
            }
        }

        // 尋找是否有可以繼續遞迴的節點
        const newKey = getUnknownKey(inputs, searchKeys);
        if (newKey !== undefined && newKey !== key) {
            return getPrompt(newKey, searchKeys, allowNumber)
        }

        // 是字串且命中模糊匹配，例如 text 可以匹配 text_g | text_l
        for (let i = 0; i < searchKeys.length; i++) {
            const key = searchKeys[i];
            for (let j = 0; j < arKey.length; j++) {
                // 無視大小寫
                if (arKey[j].toLowerCase().includes(key.toLowerCase())) {
                    text = inputs[arKey[j]];
                    if (typeof text === "string" || (allowNumber && typeof text === "number")) {
                        return text.toString();
                    }
                }
            }
        }

        return undefined;
    }

    /**
     * 取得 寬度與高度
     */
    function getSize(key: string) {
        if (key === undefined) { return undefined; }
        let obj = _json[key];
        if (obj === undefined) { return undefined; }
        let inputs = obj.inputs;
        if (inputs === undefined) { return undefined; }

        if (typeof inputs.size_selected === "string") {
            return inputs.size_selected;
        }

        let width = inputs.width || inputs.empty_latent_width;
        let height = inputs.height || inputs.empty_latent_height;
        if (width === undefined || height === undefined) { return undefined; }

        if (typeof width === "string" || typeof width === "number") {
            return `${width} x ${height}`;
        }

        // 如果沒有找到，則取得新的 key 來遞迴
        let newKey = getUnknownKey(inputs, []);
        if (newKey !== undefined) {
            return getSize(newKey)
        }

        return undefined;
    }

    /**
     * 取得需要串接字串的節點 。例如將 s1 s2 s3... 串接起來
     */
    function getConcatenatedPrompts(inputPrefix: string | string[], key: string, searchKeys: string[], delimiter = "") {
        if (key === undefined) { return undefined; }
        const obj = _json[key];
        if (obj === undefined) { return undefined; }
        const inputs = obj.inputs;
        if (inputs === undefined) { return undefined; }

        let result: string[] = [];
        let inputKeys: string[];

        // 動態判斷需要處理的 keys
        if (typeof inputPrefix === "string")
            inputKeys = Object.keys(inputs)
                .filter(k => k.match(new RegExp(`^${inputPrefix}\\d+$`)));
        else
            inputKeys = Object.keys(inputs)
                .filter(k => inputPrefix.some(p => k == p));

        for (const inputKey of inputKeys) {
            const currentKey = getItemKey(inputs[inputKey]);

            // 避免循環參考
            if (currentKey === key) { continue; }

            const prompt = getPrompt(currentKey, searchKeys);
            if (typeof prompt === "string" && prompt !== "") {
                result.push(prompt);
            }
        }

        return result.join(delimiter);
    }

    /**
     * 遍歷所有節點
     */
    function foreachNode(func: (item: any, intputs: any, classType: string) => void) {
        for (let i = 0; i < _arKey.length; i++) {
            const item = _json[_arKey[i]];
            const intputs = item["inputs"];
            if (intputs === undefined) { continue; }
            const classType = item["class_type"];
            if (typeof classType !== "string") { continue; }

            func(item, intputs, classType);
        }
    }

    // extraMetadata
    if (_json.extraMetadata !== undefined) {
        try {
            const json = JSON.parse(_json.extraMetadata);
            if (json !== undefined) {
                const prompt = json.prompt;
                const promptNegative = json.negativePrompt;
                const steps = json.steps;
                const sampler = json.sampler;
                const cfg = json.cfgScale;
                const seed = json.seed;

                retPush("extraMetadata", [
                    { title: "Prompt", text: prompt },
                    { title: "Negative prompt", text: promptNegative },
                    { title: "Steps", text: steps },
                    { title: "Sampler", text: sampler },
                    { title: "CFG", text: cfg },
                    { title: "Seed", text: seed },
                ]);
            }
        }
        catch (e) {
        }
    }

    // ControlNetApplySD3
    foreachNode((item, inputs, classType) => {
        if (classType === "ControlNetApplySD3") {
            const prompt = getPrompt(getItemKey(inputs.lumina_embeds), _promptBaseKeys);
            const promptNegative = getPrompt(getItemKey(inputs.lumina_embeds), _negativePromptBaseKeys);
            const steps = getStringValue(inputs.steps);
            const cfg = getStringValue(inputs.cfg);
            const seed = getStringValue(inputs.seed);
            const model = getPrompt(getItemKey(inputs.lumina_model), _modelBaseKeys);

            retPush(classType, [
                { title: "Prompt", text: prompt },
                { title: "Negative prompt", text: promptNegative },
                { title: "Steps", text: steps },
                { title: "CFG", text: cfg },
                { title: "Seed", text: seed },
                { title: "Model", text: model },
            ]);
        }
    });

    // StabilityAPI_SD3
    foreachNode((item, inputs, classType) => {
        if (classType === "StabilityAPI_SD3") {
            const prompt = getPrompt(getItemKey(inputs.prompt), _promptBaseKeys);
            const promptNegative = getPrompt(getItemKey(inputs.n_prompt), _negativePromptBaseKeys);
            const seed = getStringValue(inputs.seed);
            const model = getStringValue(inputs.model);

            retPush(classType, [
                { title: "Prompt", text: prompt },
                { title: "Negative prompt", text: promptNegative },
                { title: "Seed", text: seed },
                { title: "Model", text: model },
            ]);
        }
    });

    // easy preSampling
    foreachNode((item, inputs, classType) => {
        if (classType === "easy preSampling") {
            const prompt = getPrompt(getItemKey(inputs.pipe), _promptBaseKeys);
            const steps = getPrompt(getItemKey(inputs.steps), [..._stepsBaseKeys, "Pass_1_steps"], true);
            const sampler = getPrompt(getItemKey(inputs.sampler_name), _samplerBaseKeys);
            const scheduler = getPrompt(getItemKey(inputs.scheduler), [..._schedulerBaseKeys, "text"]);
            const cfg = getPrompt(getItemKey(inputs.cfg), [..._cfgBaseKeys, "Pass_1_CFG"], true);
            const seed = getPrompt(getItemKey(inputs.seed), _seedBaseKeys, true);
            const model = getPrompt(getItemKey(inputs.pipe), _modelBaseKeys);
            const denoise = inputs.denoise;
            const vae = getPrompt(getItemKey(inputs.pipe), _vaeBaseKeys);

            retPush(classType, [
                { title: "Prompt", text: prompt },
                { title: "Steps", text: steps },
                { title: "Sampler", text: sampler },
                { title: "Scheduler", text: scheduler },
                { title: "CFG", text: cfg },
                { title: "Seed", text: seed },
                { title: "Model", text: model },
                { title: "Denoise", text: denoise },
                { title: "VAE", text: vae },
            ]);
        }
    });

    // SamplerCustomAdvanced
    foreachNode((item, inputs, classType) => {
        if (classType === "SamplerCustomAdvanced") {
            const prompt = getPrompt(getItemKey(inputs.guider), [..._promptBaseKeys, "Prompt T5 XXL"]);
            const steps = getPrompt(getItemKey(inputs.sigmas), _stepsBaseKeys, true);
            const sampler = getPrompt(getItemKey(inputs.sampler), _samplerBaseKeys);
            const scheduler = getPrompt(getItemKey(inputs.sigmas), _schedulerBaseKeys);
            const seed = getPrompt(getItemKey(inputs.noise), _seedBaseKeys, true);
            const model = getPrompt(getItemKey(inputs.guider), _modelBaseKeys);
            const guidance = getPrompt(getItemKey(inputs.guider), [..._guidanceBaseKeys, "conditioning"], true);

            retPush(classType, [
                { title: "Prompt", text: prompt },
                { title: "Steps", text: steps },
                { title: "Sampler", text: sampler },
                { title: "Scheduler", text: scheduler },
                { title: "Seed", text: seed },
                { title: "Model", text: model },
                { title: "Guidance", text: guidance },
            ]);
        }
    });

    // FluxSamplerParams+
    foreachNode((item, inputs, classType) => {
        if (classType === "FluxSamplerParams+" || classType === "FluxSampler") {
            const prompt = getPrompt(getItemKey(inputs.conditioning), _promptBaseKeys);
            const steps = getStringValue(inputs.steps);
            const sampler = getStringValue(inputs.sampler);
            const scheduler = getStringValue(inputs.scheduler);
            const seed = getStringValue(inputs.seed);
            const model = getPrompt(getItemKey(inputs.model), _modelBaseKeys);
            const denoise = getStringValue(inputs.denoise);
            const guidance = getStringValue(inputs.guidance);

            retPush(classType, [
                { title: "Prompt", text: prompt },
                { title: "Steps", text: steps },
                { title: "Sampler", text: sampler },
                { title: "Scheduler", text: scheduler },
                { title: "Seed", text: seed },
                { title: "Model", text: model },
                { title: "Denoise", text: denoise },
                { title: "Guidance", text: guidance },
            ]);
        }
    });

    // XlabsSampler
    foreachNode((item, inputs, classType) => {
        if (classType === "XlabsSampler") {
            const prompt = getPrompt(getItemKey(inputs.conditioning), _promptBaseKeys);
            const steps = getStringValue(inputs.steps);
            const cfg = getStringValue(inputs.timestep_to_start_cfg);
            const seed = getValue(inputs, _seedBaseKeys, true);
            const model = getPrompt(getItemKey(inputs.model), [..._modelBaseKeys, "conditioning"]);
            const denoise = getStringValue(inputs.denoise_strength);
            const guidance = getPrompt(getItemKey(inputs.neg_conditioning), _guidanceBaseKeys, true);

            retPush(classType, [
                { title: "Prompt", text: prompt },
                { title: "Steps", text: steps },
                { title: "CFG", text: cfg },
                { title: "Seed", text: seed },
                { title: "Model", text: model },
                { title: "Denoise", text: denoise },
                { title: "Guidance", text: guidance },
            ]);
        }
    });

    // ImpactKSamplerAdvancedBasicPipe
    foreachNode((item, inputs, classType) => {
        if (classType === "ImpactKSamplerAdvancedBasicPipe") {
            const prompt = getPrompt(getItemKey(inputs.basic_pipe), _promptBaseKeys);
            const steps = getStringValue(inputs.steps);
            const startAtStep = getStringValue(inputs.start_at_step);
            const endAtStep = getStringValue(inputs.end_at_step);
            const sampler = getStringValue(inputs.sampler_name);
            const scheduler = getStringValue(inputs.scheduler);
            const cfg = getStringValue(inputs.cfg);
            const seed = getStringValue(inputs.noise_seed);
            const model = getPrompt(getItemKey(inputs.basic_pipe), [..._modelBaseKeys, "conditioning"]);
            const denoise = getStringValue(inputs.denoise_strength);
            const guidance = getPrompt(getItemKey(inputs.basic_pipe), [..._guidanceBaseKeys, "positive"], true);
            const vae = getPrompt(getItemKey(inputs.vae), _vaeBaseKeys);

            retPush(classType, [
                { title: "Prompt", text: prompt },
                { title: "Steps", text: steps },
                { title: "Start at step", text: startAtStep },
                { title: "End at step", text: endAtStep },
                { title: "Sampler", text: sampler },
                { title: "Scheduler", text: scheduler },
                { title: "CFG", text: cfg },
                { title: "Seed", text: seed },
                { title: "Model", text: model },
                { title: "Denoise", text: denoise },
                { title: "Guidance", text: guidance },
                { title: "VAE", text: vae },
            ]);
        }
    });

    // ImpactKSamplerBasicPipe
    foreachNode((item, inputs, classType) => {
        if (classType === "ImpactKSamplerBasicPipe") {
            const prompt = getPrompt(getItemKey(inputs.basic_pipe), _promptBaseKeys);
            const promptNegative = getPrompt(getItemKey(inputs.basic_pipe), _negativePromptBaseKeys);
            const steps = getStringValue(inputs.steps);
            const sampler = getStringValue(inputs.sampler_name);
            const scheduler = getStringValue(inputs.scheduler);
            const cfg = getStringValue(inputs.cfg);
            const seed = getStringValue(inputs.seed);
            const model = getPrompt(getItemKey(inputs.basic_pipe), _modelBaseKeys);
            const denoise = getStringValue(inputs.denoise);
            const vae = getPrompt(getItemKey(inputs.basic_pipe), _vaeBaseKeys);

            retPush(classType, [
                { title: "Prompt", text: prompt },
                { title: "Negative prompt", text: promptNegative },
                { title: "Steps", text: steps },
                { title: "Sampler", text: sampler },
                { title: "Scheduler", text: scheduler },
                { title: "CFG", text: cfg },
                { title: "Seed", text: seed },
                { title: "Model", text: model },
                { title: "Denoise", text: denoise },
                { title: "VAE", text: vae },
            ]);
        }
    });

    // LuminaT2ISampler
    foreachNode((item, inputs, classType) => {
        if (classType === "LuminaT2ISampler") {
            const prompt = getPrompt(getItemKey(inputs.lumina_embeds), _promptBaseKeys);
            const promptNegative = getPrompt(getItemKey(inputs.lumina_embeds), _negativePromptBaseKeys);
            const steps = getValue(inputs, [..._stepsBaseKeys, "base_ctx", "int"], true);
            const cfg = getStringValue(inputs.cfg);
            const seed = getValue(inputs, [..._seedBaseKeys, "base_ctx"], true);
            const model = getPrompt(getItemKey(inputs.lumina_model), _modelBaseKeys);

            retPush(classType, [
                { title: "Prompt", text: prompt },
                { title: "Negative prompt", text: promptNegative },
                { title: "Steps", text: steps },
                { title: "CFG", text: cfg },
                { title: "Seed", text: seed },
                { title: "Model", text: model },
            ]);
        }
    });

    // easy fullkSampler
    foreachNode((item, inputs, classType) => {
        if (classType === "easy fullkSampler") {
            const prompt = getPrompt(getItemKey(inputs.pipe), _promptBaseKeys);
            const promptNegative = getPrompt(getItemKey(inputs.pipe), _negativePromptBaseKeys);
            const steps = getStringValue(inputs.steps);
            const samplerName = getStringValue(inputs.sampler_name);
            const scheduler = getStringValue(inputs.scheduler);
            const cfg = getStringValue(inputs.cfg);
            const seed = getStringValue(inputs.seed);
            const model = getPrompt(getItemKey(inputs.model), _modelBaseKeys);
            const denoise = getStringValue(inputs.denoise);

            retPush(classType, [
                { title: "Prompt", text: prompt },
                { title: "Negative prompt", text: promptNegative },
                { title: "Steps", text: steps },
                { title: "Sampler", text: samplerName },
                { title: "Scheduler", text: scheduler },
                { title: "CFG", text: cfg },
                { title: "Seed", text: seed },
                { title: "Model", text: model },
                { title: "Denoise", text: denoise },
            ]);
        }
    });

    // WanMoeKSampler
    foreachNode((item, inputs, classType) => {
        if (classType === "WanMoeKSampler") {
            const prompt = getPrompt(getItemKey(inputs.positive), _promptBaseKeys);
            const promptNegative = getPrompt(getItemKey(inputs.negative), _negativePromptBaseKeys);
            const steps = getStringValue(inputs.steps);
            const samplerName = getStringValue(inputs.sampler_name);
            const scheduler = getStringValue(inputs.scheduler);
            const cfgHigh = getStringValue(inputs.cfg_high_noise);
            const cfgLow = getStringValue(inputs.cfg_low_noise);
            const seed = getStringValue(inputs.seed);
            const modelHigh = getPrompt(getItemKey(inputs.model_high_noise), _modelBaseKeys);
            const modelLow = getPrompt(getItemKey(inputs.model_low_noise), _modelBaseKeys);
            const denoise = getStringValue(inputs.denoise);

            retPush(classType, [
                { title: "Prompt", text: prompt },
                { title: "Negative prompt", text: promptNegative },
                { title: "Steps", text: steps },
                { title: "Sampler", text: samplerName },
                { title: "Scheduler", text: scheduler },
                { title: "CFG High", text: cfgHigh },
                { title: "CFG Low", text: cfgLow },
                { title: "Seed", text: seed },
                { title: "Model High", text: modelHigh },
                { title: "Model Low", text: modelLow },
                { title: "Denoise", text: denoise },
            ]);
        }
    });

    const nodeNames = [
        "KSampler",
        "KSamplerAdvanced",
        "FaceDetailer",
        "UltimateSDUpscale",
        "KSampler (Efficient)",
        "KSampler Adv. (Efficient)",
        "KSampler SDXL (Eff.)",
    ];

    // 在結尾加入 null，表示在最後使用相容模式尋找
    [...nodeNames, null].forEach(nodeName => {

        foreachNode((item, inputs, classType) => {

            // 如果指定了節點名稱，則只處理該節點
            if (nodeName !== null && classType !== nodeName) { return; }

            inputs.positive = inputs.positive || inputs.sdxl_tuple;
            inputs.negative = inputs.negative || inputs.sdxl_tuple;
            inputs.model = inputs.model || inputs.sdxl_tuple;

            // 如果是已知模型節點
            let isModelNode = nodeNames.includes(classType);

            // 嘗試以相容模式尋找
            if (nodeName === null &&
                inputs.model !== undefined &&
                inputs.cfg !== undefined &&
                inputs.positive !== undefined) {

                isModelNode = true;
            }

            // 如果是已知的節點，則略過
            if (nodeName === null && nodeNames.includes(classType)) { return; }

            if (isModelNode === false) { return; }

            let prompt = getPrompt(getItemKey(inputs.positive), _promptBaseKeys);
            let negativePrompt = getPrompt(getItemKey(inputs.negative), _negativePromptBaseKeys);
            let steps = getValue(inputs, _stepsBaseKeys, false);
            let sampler = getValue(inputs, _samplerBaseKeys, false);
            let scheduler = getValue(inputs, _schedulerBaseKeys, false);
            let cfg = getValue(inputs, _cfgBaseKeys, false);
            let seed = getValue(inputs, _seedBaseKeys, true);
            let size = getSize(getItemKey(inputs.latent_image));
            let model = getValue(inputs, _modelBaseKeys, false);
            let denoise = getValue(inputs, _denoiseBaseKeys, false);

            retPush(classType, [
                { title: "Prompt", text: prompt },
                { title: "Negative prompt", text: negativePrompt },
                { title: "Steps", text: steps },
                { title: "Sampler", text: sampler },
                { title: "Scheduler", text: scheduler },
                { title: "CFG", text: cfg },
                { title: "Seed", text: seed },
                { title: "Size", text: size },
                { title: "Model", text: model },
                { title: "Denoise", text: denoise },
            ]);
        });
    });

    // DualCLIPLoader
    foreachNode((item, inputs, classType) => {
        if (classType === "DualCLIPLoader") {
            const ar: { title: string, text: string | undefined }[] = [];
            ar.push({ title: "Clip name 1", text: getStringValue(inputs.clip_name1) });
            ar.push({ title: "Clip name 2", text: getStringValue(inputs.clip_name2) });
            retPush(classType, ar);
        }
    });

    // 讀取 Lora 節點
    let arLora: { title: string, text: string | undefined }[] = [];
    foreachNode((item, intputs, classType) => {

        // 讀取 LoRA Stacker 節點
        if (classType === "LoRA Stacker") {
            /*
            "20": {
                "inputs": {
                    "input_mode": "simple",
                    "lora_count": 5,
                    "lora_name_1": "\AAA.safetensors",
                    "lora_wt_1": 1.3,
                    "model_str_1": 1,
                    "clip_str_1": 1,
                    "lora_name_2": "\BBB.safetensors",
                    "lora_wt_2": -1.6,
                    "model_str_2": 1,
                    "clip_str_2": 1
                    ...
                },
                "class_type": "LoRA Stacker"
            }*/

            // 數量
            let loraCount = intputs["lora_count"];
            // 如果無法取得數量，則設為 50
            if (typeof loraCount !== "number") {
                loraCount = 50;
            }

            let inputMode = intputs["input_mode"];
            let isSimpleMode = inputMode === "simple";

            for (let i = 1; i <= loraCount; i++) {
                let modelStr;
                let clipStr;
                if (isSimpleMode) { // 如果是 simple mode，則只有 lora_wt
                    let loraWt = intputs["lora_wt_" + i];
                    if (loraWt === undefined) { break; }
                    modelStr = loraWt;
                    clipStr = loraWt;
                }
                else {
                    modelStr = intputs["model_str_" + i];
                    if (modelStr === undefined) { break; }
                    clipStr = intputs["clip_str_" + i];
                    if (clipStr === undefined) { break; }
                }

                let loraName = intputs["lora_name_" + i];
                if (loraName === undefined) { break; }

                if (modelStr === 0 && clipStr === 0) { continue; } // 如果都是 0，則略過
                if (loraName === "None" || loraName === "none") { continue; } // 如果是 None，則略過
                let jsonFormat = Lib.stringifyWithNewlines({
                    "Model Strength": toFixedPrecision(modelStr),
                    "Clip Strength": toFixedPrecision(clipStr)
                }, true, true);
                arLora.push({ title: loraName, text: jsonFormat });

            }
        }

        // 讀取 CR LoRA Stack 節點
        else if (classType === "CR LoRA Stack" || classType === "CR Random LoRA Stack") {
            /*
            "28": {
                "inputs": {
                "switch_1": "Off",
                "lora_name_1": "None",
                "model_weight_1": 1,
                "clip_weight_1": 1,
                "switch_2": "On",
                "lora_name_2": "\AAA.safetensors",
                "model_weight_2": 1,
                "clip_weight_2": 1,
                "switch_3": "Off",
                "lora_name_3": "None",
                "model_weight_3": 1,
                "clip_weight_3": 1
                },
                "class_type": "CR LoRA Stack"
            }*/

            // CR Random LoRA Stack 才有的屬性
            if (item["exclusive_mode"] === "Off") { return; }

            for (let i = 1; i <= 50; i++) {

                // 只顯示開啟的
                let switchName = intputs["switch_" + i];
                if (switchName === "Off") { continue; }

                let loraName = intputs["lora_name_" + i];
                if (loraName === undefined) { break; }
                let modelWeight = intputs["model_weight_" + i];
                if (modelWeight === undefined) { break; }
                let clipWeight = intputs["clip_weight_" + i];
                if (clipWeight === undefined) { break; }

                if (modelWeight === 0 && clipWeight === 0) { continue; } // 如果都是 0，則略過		
                if (loraName === "None" || loraName === "none") { continue; } // 如果是 None，則略過
                let jsonFormat = Lib.stringifyWithNewlines({
                    "Model Strength": toFixedPrecision(modelWeight),
                    "Clip Strength": toFixedPrecision(clipWeight)
                }, true, true);
                arLora.push({ title: loraName, text: jsonFormat });
            }

        }

        // 讀取 easy loraStack 節點
        else if (classType === "easy loraStack") {
            /*
            "426": {
                "inputs": {
                    "toggle": false,
                    "mode": "simple",
                    "num_loras": 1,
                    "lora_1_name": "AntiBlur.safetensors",
                    "lora_1_strength": 0.8,
                    "lora_1_model_strength": 1.0,
                    "lora_1_clip_strength": 1.0,
                    "lora_2_name": "None",
                    "lora_2_strength": 1.0,
                    "lora_2_model_strength": 1.0,
                    "lora_2_clip_strength": 1.0,
                    "lora_3_name": "None",
                    "lora_3_strength": 1.0,
                    "lora_3_model_strength": 1.0,
                    "lora_3_clip_strength": 1.0,
                },
                "class_type": "easy loraStack"
            }*/

            // easy loraStack 才有的屬性
            if (item.inputs["toggle"] === false) { return; }

            for (let i = 1; i <= 10; i++) {

                // 只顯示開啟的
                let loraName = intputs[`lora_${i}_name`];
                if (loraName === "None") { continue; }

                let strength = intputs[`lora_${i}_strength`];
                if (strength === undefined) { break; }

                let strengthModel = intputs[`lora_${i}_model_strength`];
                if (strengthModel === undefined) { break; }

                let clipStrength = intputs[`lora_${i}_clip_strength`];
                if (clipStrength === undefined) { break; }

                let jsonFormat = Lib.stringifyWithNewlines({
                    "Strength": toFixedPrecision(strength),
                    "Model Strength": toFixedPrecision(strengthModel),
                    "Clip Strength": toFixedPrecision(clipStrength)
                }, true, true);
                arLora.push({ title: loraName, text: jsonFormat });
            }

        }

        // 讀取 Power Lora Loader (rgthree)
        else if (classType === "Power Lora Loader (rgthree)") {

            let keys = Object.keys(intputs);
            keys.forEach(key => {
                let value = intputs[key];
                let type = typeof value;
                if (type === "object") {
                    if (value.on === "true" && value.lora !== "None") {
                        arLora.push({
                            title: value.lora,
                            text: "Strength: " + toFixedPrecision(value.strength)
                        });
                    }
                }
            });

        }

        // 節點內有 lora_name 屬性，則視為 LoRA 節點
        else {
            let loraName = intputs["lora_name"];
            if (loraName === undefined || loraName === null
                || loraName === "None" || loraName === "none") {
                return;
            }

            // 如果是 LoraLoader|pysssss 節點，會多一層
            loraName = loraName.content || loraName;
            if (typeof loraName === "object") {
                loraName = JSON.stringify(loraName);
            }

            let arStrength: any = {};
            let keys = Object.keys(intputs);
            keys.forEach(key => {
                let value = intputs[key];
                let type = typeof value;

                if (type === "number" || type === "string") {

                    if (value === 0) { return; } // 如果是 0，則略過

                    if (key === "strength_model" || key === "lora_model_strength") {
                        arStrength["Model Strength"] = toFixedPrecision(value);
                    }
                    else if (key === "strength_clip" || key === "lora_clip_strength") {
                        arStrength["Clip Strength"] = toFixedPrecision(value);
                    }
                    else if (key.includes("strength")) {
                        arStrength[key] = toFixedPrecision(value);
                    }
                }
            });
            if (Object.keys(arStrength).length === 0) { return; } // 如果沒有任何屬性，則略過
            let jsonFormat = Lib.stringifyWithNewlines(arStrength, true, true);
            arLora.push({ title: loraName, text: jsonFormat });
        }
    });
    retPush("LoRA", arLora);

    // 處理排序
    (() => {
        // 取得所有節點名稱，去除重複
        const nodeNames = _retData
            .map(item => item.nodeTitle)
            .filter((value, index, self) => self.indexOf(value) === index);

        // 依照節點名稱建立字典，並給予排序值
        const nodeNameDict: { [key: string]: number } = {};
        nodeNames.forEach((value, index) => {
            nodeNameDict[value] = (index + 1) * 10000;
        });

        // Prompt 長度越長，排序越前面
        _retData.forEach(item => {
            let sort = nodeNameDict[item.nodeTitle] || 0;
            const prompt = item.data.find(x => x.title === "Prompt")?.text || "";
            item.sort = sort - prompt.length;
        });

        // 排序
        _retData.sort((a, b) => a.sort - b.sort);
    })();

    return _retData;
}
