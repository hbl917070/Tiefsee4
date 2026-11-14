/** 對應設定視窗的「快速鍵」頁面。 */
import { Config } from "../Config";
import { SettingWindowContext } from "./SettingWindowContext";
import { Lib } from "../Lib";
import { hasActionInput, hotkeyActionKeys, hotkeyDefinitions } from "../HotkeyDefinitions";

// 快速鍵
export function initHotkeySettings({ _config, _i18n, _msgbox, getDom, initSettingsGroups, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "_i18n" | "_msgbox" | "getDom" | "initSettingsGroups" | "appleSettingOfMain">) {

    const dom = getDom(".js-hotkey") as HTMLElement;
    const btnResetAll = getDom("#btn-hotkey-resetAll") as HTMLElement;
    type HotkeyItem = { key: string, hotkey: string, subOptions?: string[] };
    _config.settings.hotkeys = normalizeHotkeys(_config.settings.hotkeys);

    renderHotkeyPage();

    // 重置所有快速鍵
    btnResetAll.addEventListener("click", () => {
        _msgbox.show({
            txt: _i18n.t("msg.hotkeyResetAll"),
            funcYes: (domMsg: HTMLElement) => {
                _msgbox.close(domMsg);
                _config.settings.hotkeys = getDefaultHotkeys();
                renderHotkeyPage();
                appleSettingOfMain();
            }
        });
    });

    /**
     * 渲染快速鍵設定頁面
     */
    function renderHotkeyPage() {
        const configHotkeys = normalizeHotkeys(_config.settings.hotkeys);
        _config.settings.hotkeys = configHotkeys;
        dom.innerHTML = "";

        // 大分類
        hotkeyDefinitions.forEach((data) => {
            const hotkeyContents = data.content
                .filter(content => hasActionInput(content, "hotkey"));

            const domBox = Lib.newDom(
                `<div class="box settings-group hotkey-category js-settingsGroup">
                    <div class="box-title settings-groupTitle hotkey-categoryTitle collapse-title" i18n="script.${data.title}"></div>
                    <div class="settings-groupContent hotkey-categoryContent collapse-content">
                        <div class="js-boxList"></div>
                    </div>
                </div>`);
            const domBoxList = domBox.querySelector(".js-boxList") as HTMLElement;

            hotkeyContents.forEach((content) => {
                const titleI18n = "script." + content.key;
                const resetTitle = Lib.escape(_i18n.t("sw.hotkey.restoreDefaultValue"));
                const addTitle = Lib.escape(_i18n.t("sw.hotkey.add"));
                const domContent = Lib.newDom(
                    `<div class="hotkey" data-key="${content.key}">
                        <div class="hotkey-title">
                            <span class="hotkey-name" i18n="${titleI18n}"></span>
                            <div class="btns">
                                <div class="btn hotkey-iconBtn js-reset" role="button" title="${resetTitle}" i18n="sw.hotkey.restoreDefaultValue" aria-label="${resetTitle}">${SvgList["arrow_sync_20_regular.svg"]}</div>
                                <div class="btn hotkey-iconBtn js-add" role="button" title="${addTitle}" i18n="sw.hotkey.add" aria-label="${addTitle}">${SvgList["add_20_regular.svg"]}</div>
                            </div>
                        </div>
                        <div class="js-list">
                        </div>
                    </div>`);

                const btnAdd = domContent.querySelector(".js-add") as HTMLElement;
                const btnReset = domContent.querySelector(".js-reset") as HTMLElement;
                const divList = domContent.querySelector(".js-list") as HTMLElement;
                const actionLabelId = `hotkey-action-${content.key}`;
                (domContent.querySelector(".hotkey-name") as HTMLElement).id = actionLabelId;
                const contentSubOptions = "subOptions" in content ? content.subOptions : undefined;
                let nextHotkeyRowId = 0;

                // 按鈕：新增
                btnAdd.addEventListener("click", () => {
                    createHotkeyItem(divList, contentSubOptions);
                    hotkeyToConfig();
                });

                // 按鈕：重置
                btnReset.addEventListener("click", () => {
                    divList.innerHTML = "";
                    const items = getDefaultHotkeys().filter(item => item.key === content.key);
                    items.forEach(item => {
                        createHotkeyItem(divList, contentSubOptions, item);
                    });
                    hotkeyToConfig();
                });

                const items = configHotkeys.filter(item => item.key === content.key);
                items.forEach(item => {
                    createHotkeyItem(divList, contentSubOptions, item);
                });
                updateResetButton();

                domBoxList.appendChild(domContent);

                /**
                 * 新增單一快速鍵項目
                 */
                function createHotkeyItem(divList: HTMLElement, subOptions?: readonly string[], item?: HotkeyItem) {
                    const rowId = ++nextHotkeyRowId;
                    const deleteTitle = Lib.escape(_i18n.t("sw.hotkey.delete"));
                    const keyBindingId = `${actionLabelId}-binding-${rowId}`;
                    const subHtml = getSubHtml(subOptions, actionLabelId, keyBindingId, rowId);
                    const keyBindingHtml = subOptions === undefined
                        ? ""
                        : `<span id="${keyBindingId}" style="display:none">${Lib.escape(item?.hotkey ?? "")}</span>`;
                    const hotkeyDom = Lib.newDom(
                        `<div class="hotkey-content">
                            <input class="text-input hotkey-input js-text" aria-label="${Lib.escape(_i18n.t(titleI18n))}" i18n="${titleI18n}">
                            ${subHtml}
                            ${keyBindingHtml}
                            <div class="btn hotkey-iconBtn hotkey-deleteBtn js-delete" role="button" title="${deleteTitle}" i18n="sw.hotkey.delete" aria-label="${deleteTitle}">
                                ${SvgList["dismiss_20_regular.svg"]}
                            </div>
                        </div>`);

                    const domText = hotkeyDom.querySelector(".js-text") as HTMLInputElement;
                    domText.value = item?.hotkey ?? "";
                    const domKeyBinding = keyBindingHtml === "" ? null : hotkeyDom.querySelector(`#${CSS.escape(keyBindingId)}`) as HTMLElement | null;
                    domText.addEventListener("keydown", (e) => {
                        e.preventDefault();
                        const text = Lib.keyboardEventToHotkeyString(e);
                        if (text === "") { return; }
                        domText.value = text;
                        if (domKeyBinding !== null) { domKeyBinding.textContent = text; }
                        hotkeyToConfig();
                    });
                    // 唯讀
                    domText.setAttribute("readonly", "readonly");

                    // 子選項的輸入框
                    const subTextDoms = hotkeyDom.querySelectorAll(".js-subText") as NodeListOf<HTMLInputElement>;
                    subTextDoms.forEach((domSubText, index) => {
                        domSubText.value = item?.subOptions?.[index] ?? "";
                        domSubText.addEventListener("change", () => {
                            hotkeyToConfig();
                        });
                    });

                    // 按鈕：刪除
                    const btnDelete = hotkeyDom.querySelector(".js-delete") as HTMLElement;
                    btnDelete.addEventListener("click", () => {
                        hotkeyDom.remove();
                        hotkeyToConfig();
                    });

                    divList.appendChild(hotkeyDom);
                }

                function updateResetButton() {
                    const defaultItems = getDefaultHotkeys().filter(item => item.key === content.key);
                    const currentItems = getCurrentHotkeyItems(divList, content.key);
                    const isSame = isHotkeyItemListEqual(defaultItems, currentItems);
                    btnReset.style.display = isSame ? "none" : "";
                }

                function getSubHtml(subOptions: readonly string[] | undefined, actionId: string, bindingId: string, rowIndex: number) {
                    if (subOptions === undefined) { return ""; }

                    let html = "";
                    subOptions.forEach((sub, index) => {
                        const subI18n = "script." + sub;
                        const subText = Lib.escape(_i18n.t(subI18n));
                        const subLabelId = `${actionId}-row-${rowIndex}-sub-${index}`;
                        html +=
                            `<label class="hotkey-subField">
                                <span class="hotkey-subLabel" id="${subLabelId}" i18n="${subI18n}">${subText}</span>
                                <input class="text-input hotkey-subInput js-subText" aria-labelledby="${actionId} ${subLabelId} ${bindingId}">
                            </label>`;
                    });
                    return html;
                }
            });

            dom.appendChild(domBox);
        });

        initSettingsGroups(dom);
        _i18n.setAll();
    }

    /**
     * 將畫面上的快速鍵設定轉換成設定檔中的格式，並儲存到設定檔中
     */
    function hotkeyToConfig() {
        const hotkeyDoms = dom.querySelectorAll(".hotkey");
        const hotkeyItems: HotkeyItem[] = [];

        hotkeyDoms.forEach(hotkeyDom => {
            const key = hotkeyDom.getAttribute("data-key") + "";
            const contentDoms = hotkeyDom.querySelectorAll(".hotkey-content");
            contentDoms.forEach(contentDom => {
                const textDoms = contentDom.querySelectorAll(".js-text") as NodeListOf<HTMLInputElement>;
                const hotkey = textDoms[0].value;
                if (hotkey === "") { return; }

                const data: HotkeyItem = {
                    key: key,
                    hotkey: hotkey,
                };

                const subTextDoms = contentDom.querySelectorAll(".js-subText") as NodeListOf<HTMLInputElement>;
                if (subTextDoms.length > 0) {
                    data.subOptions = [];
                    for (let i = 0; i < subTextDoms.length; i++) {
                        data.subOptions.push(subTextDoms[i].value);
                    }
                }
                hotkeyItems.push(data);
            });
        });

        _config.settings.hotkeys = hotkeyItems;
        appleSettingOfMain();
        updateResetButtons();
    }

    /**
     * 將設定檔中的快速鍵項目轉換成 HotkeyItem 的格式，並過濾掉不合法的項目
     * @param hotkeys 設定檔中的快速鍵項目
     * @returns 轉換後的 HotkeyItem 列表
     */
    function normalizeHotkeys(hotkeys: any): HotkeyItem[] {
        if (Array.isArray(hotkeys) === false) { return []; }

        return hotkeys
            .filter((item: any) => item && typeof item === "object")
            .map((item: any) => {
                const data: HotkeyItem = {
                    key: typeof item.key === "string" ? item.key : "",
                    hotkey: typeof item.hotkey === "string" ? item.hotkey : "",
                };

                if (Array.isArray(item.subOptions)) {
                    data.subOptions = item.subOptions.map((sub: any) => String(sub));
                }

                return data;
            })
            .filter(item => item.key !== "" && item.hotkey !== "");
    }

    /**
     * 從預設設定中取得快速鍵項目列表，轉換成 HotkeyItem 的格式
     * @returns 轉換後的 HotkeyItem 列表
     */
    function getDefaultHotkeys(): HotkeyItem[] {
        return normalizeHotkeys(new Config(baseWindow).settings.hotkeys);
    }

    /**
     * 從畫面上讀取目前的快速鍵設定，轉換成 HotkeyItem 的格式
     * @param divList 包含快速鍵設定的容器元素
     * @param key 快速鍵的鍵值
     * @returns 轉換後的 HotkeyItem 列表
     */
    function getCurrentHotkeyItems(divList: HTMLElement, key: string): HotkeyItem[] {
        const items: HotkeyItem[] = [];
        const contentDoms = divList.querySelectorAll(".hotkey-content");
        contentDoms.forEach(contentDom => {
            const domText = contentDom.querySelector(".js-text") as HTMLInputElement | null;
            const hotkey = domText?.value ?? "";
            if (hotkey === "") { return; }

            const data: HotkeyItem = {
                key: key,
                hotkey: hotkey,
            };

            const subTextDoms = contentDom.querySelectorAll(".js-subText") as NodeListOf<HTMLInputElement>;
            if (subTextDoms.length > 0) {
                data.subOptions = [];
                subTextDoms.forEach((domSubText) => {
                    data.subOptions!.push(domSubText.value);
                });
            }

            items.push(data);
        });
        return items;
    }

    /**
     * 更新重置按鈕的顯示狀態
     * 只有當目前的快速鍵設定與預設值不同時，才顯示重置按鈕
     */
    function updateResetButtons() {
        const hotkeyDoms = dom.querySelectorAll(".hotkey");
        hotkeyDoms.forEach((hotkeyDom) => {
            const key = hotkeyDom.getAttribute("data-key") + "";
            const btnReset = hotkeyDom.querySelector(".js-reset") as HTMLElement | null;
            const divList = hotkeyDom.querySelector(".js-list") as HTMLElement | null;
            if (btnReset === null || divList === null) { return; }

            const defaultItems = getDefaultHotkeys().filter(item => item.key === key);
            const currentItems = getCurrentHotkeyItems(divList, key);
            const isSame = isHotkeyItemListEqual(defaultItems, currentItems);
            btnReset.style.display = isSame ? "none" : "";
        });
    }

    /**
     * 比較兩個快速鍵項目列表是否相等
     * @param a 第一個快速鍵項目列表
     * @param b 第二個快速鍵項目列表
     * @returns 如果兩個列表相等，返回 true，否則返回 false
     */
    function isHotkeyItemListEqual(a: HotkeyItem[], b: HotkeyItem[]) {
        if (a.length !== b.length) { return false; }
        for (let i = 0; i < a.length; i++) {
            if (a[i].key !== b[i].key) { return false; }
            if (a[i].hotkey !== b[i].hotkey) { return false; }

            const aSubOptions = a[i].subOptions ?? [];
            const bSubOptions = b[i].subOptions ?? [];
            if (aSubOptions.length !== bSubOptions.length) { return false; }
            for (let j = 0; j < aSubOptions.length; j++) {
                if (aSubOptions[j] !== bSubOptions[j]) { return false; }
            }
        }
        return true;
    }
}
