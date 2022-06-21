
class I18n {

    public getList;//取得 翻譯json
    public setList;//設定 翻譯json
    public pushList;//加入 翻譯json

    public t;//取得翻譯。 key(多層範例 aa.b.c), type=語言(選填)
    public get;//取得翻譯。 key(多層範例 aa.b.c), type=語言(選填)
    public setAll;//翻譯整個html頁面。 type=語言(選填)

    public getDefaultLang;//取得預設語言
    public setDefaultLang;//設定預設語言
    public getLang;//取得目前的語言
    public setLang;//設定語言

    public getEventRun;//取得 回調函數（翻譯時觸發
    public setEventRun;//


    constructor() {

        this.getList = getList;//取得 翻譯json
        this.setList = setList;//設定 翻譯json
        this.pushList = pushList;//加入 翻譯json

        this.t = get;//取得翻譯。 key(多層範例 aa.b.c), type=語言(選填)
        this.get = get;//取得翻譯。 key(多層範例 aa.b.c), type=語言(選填)
        this.setAll = setAll;//翻譯整個html頁面。 type=語言(選填)

        this.getDefaultLang = getDefaultLang;//取得預設語言
        this.setDefaultLang = setDefaultLang;//設定預設語言
        this.getLang = getLang;//取得目前的語言
        this.setLang = setLang;//設定語言

        this.getEventRun = getEventRun;//取得 回調函數（翻譯時觸發
        this.setEventRun = setEventRun;//

        var lang = "zh";//目前的語言
        var defaultLang = "en";//預設語言
        var eventRun = (lang: string) => { };//回調函數，翻譯時觸發

        //--------------

        //從 localStorage 取得使用者選擇的語言
        if (window.localStorage.getItem("i18n") !== null) {
            let s = window.localStorage.getItem("i18n");
            if (s != null) {
                lang = s;
            }
        }

        //從 localStorage 取得使用者選擇的預設語言
        if (window.localStorage.getItem("i18n_DefaultLang") !== null) {
            let s = window.localStorage.getItem("i18n_DefaultLang");
            if (s != null) {
                defaultLang = s;
            }
        }

        //--------------

        /**
         * 
         * @param {*} action 
         */
        function setEventRun(action: (lang: string) => {}) {
            eventRun = action;
        }

        /**
         * 
         * @returns 
         */
        function getEventRun() {
            return eventRun;
        }

        /**
         * 取得預設語言
         */
        function getDefaultLang() {
            return defaultLang;
        }

        /**
         * 設定預設語言
         * @param {string} type
         */
        function setDefaultLang(type: string) {
            defaultLang = type;
            window.localStorage.setItem("i18n_DefaultLang", type);
        }

        /**
         * 取得 翻譯json
         */
        function getList() { return list; }

        /**
         * 設定 翻譯json
         * @param {object} json 
         */
        function setList(json: any) { list = json }

        /**
         * 加入新的 翻譯json
         * @param {object} json 
         */
        function pushList(json: any) {
            mergeJSON(list, json);//合併json
            list = json
        }

        /**
         * 取得目前的語言
         */
        function getLang() { return lang; }

        /**
         * 設定語言，並且翻譯網頁
         * @param {*} type 
         */
        function setLang(type: string) {
            lang = type;
            window.localStorage.setItem("i18n", type);
            setAll();
        }

        /**
         * 處理字串內的變數
         * @param {string} str 要處理的文字。例如 "ss{a}ss{b}sss"
         * @param {object} value 用於替換的json資料。例如 {a:123, b:"xx"}
         */
        function applyValue(str: string, value: any) {

            //沒有輸入value，就只會回傳原文字
            if (value === undefined || value.length === 0) { return str; }

            let arkay = Object.keys(value);
            for (let i = 0; i < arkay.length; i++) {
                const k = arkay[i];
                const v = value[k];

                // [ ]* 表示無視{}內的空白
                str = str.replace(new RegExp("{[ ]*" + k + "[ ]*}", "g"), v);
            }
            return str;
        }

        /**
         * 取得翻譯
         * @param {string} key 
         * @param {object} value 參數json(選填)
         * @param {string} type 語言(選填)
         */
        function get(key: string | null, value?: any, type?: string) {

            if (key === null) { return ""; }

            let arkey = key.split(".");
            let d = list;

            for (let i = 0; i < arkey.length; i++) {
                let k = arkey[i];
                if (d.hasOwnProperty(k)) {
                    d = d[k];
                }
            }

            //未填入語言的話，就是用預設語言
            if (type === undefined) { type = lang }


            if (d.hasOwnProperty(type) && d[type] !== null) {  //翻譯存在的話就回傳
                return applyValue(d[type], value);

            } else if (d.hasOwnProperty(defaultLang)) {     //如果不存在該語言的翻譯，則回傳預設語言的翻譯
                return applyValue(d[defaultLang], value);
            }

            //什麼都找不到，回傳key
            console.log(`i18n 找不到 "${key}"`);
            return arkey[arkey.length - 1];
        }


        /**
         * 翻譯整個html頁面
         * @param {string} type 語言(選填)
         */
        function setAll(type: string | undefined = undefined) {

            //未填入語言的話，就是用預設語言
            if (type === undefined) { type = lang }

            var ar_i18n = document.querySelectorAll("[i18n]");
            for (let i = 0; i < ar_i18n.length; i++) {
                const item = ar_i18n[i];
                let key = item.getAttribute("i18n");
                let t = get(key, {}, type);

                if (item.getAttribute("placeholder") !== null) {//翻譯input裡面的初始提示文字

                    item.setAttribute("placeholder", t);

                } else if (item.tagName == "TD" && item.getAttribute("data-th") !== null) {//翻譯響應式table裡面的文字 data-th

                    item.setAttribute("data-th", t);

                } else {

                    item.innerHTML = t;

                }
            }

            eventRun(type);//執行回調函數

        }


        /**
         * 合併json
         * 遇到相同元素級屬性，以後者（main）為準
         * 不返還新Object，而是main改變
         * @param {object} minor 
         * @param {object} main 
         */
        function mergeJSON(minor: any, main: any) {
            for (var key in minor) {
                if (main[key] === undefined) { // 不衝突的，直接賦值
                    main[key] = minor[key];
                    continue;
                }
                // 衝突了，如果是Object，看看有麼有不衝突的屬性
                // 不是Object 則以main為主，忽略即可。故不需要else
                if (isJSON(minor[key])) {
                    // arguments.callee 遞迴呼叫，並且與函式名解耦
                    arguments.callee(minor[key], main[key]);
                }
            }
        }


        /**
         * 檢查是否為 json
         * @param {*} target 
         */
        function isJSON(target: any) {
            return typeof target == "object" && target.constructor == Object;
        }



        var list: any = {

            //單層範例
            /*"sss": {
                "zh": "",
                "cn": "",
                "en": "",
                "my": "",
                "vi": "",
            },
    
            //多層範例
            "aaa": {
                "a1": {
                    "zh": "zh-a1",
                    "cn": "cn-a1",
                },
                "a2": {
                    "zh": "a2-a2",
                    "cn": "a2-cn",
                    "en": "a2-en",
                },
            },
    
            //有變數的範例。範例 i18n.t("vvv", {a:123})
            "vvv": {
                "zh": "zz{a}zz",
                "en": "ee{ a}ee",
            },*/

            //-----------------------------



        }

    }




}