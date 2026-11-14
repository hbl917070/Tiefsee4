/** 對應設定視窗的「工具列」頁面。 */
import { SettingWindowContext } from "./SettingWindowContext";
import { Lib } from "../Lib";
import Sortable from "sortablejs";
import { cloneToolbarCustomization, ToolbarCustomizationGroup, ToolbarCustomizationItem, ToolbarPaletteItem } from "../Toolbar/ToolbarCustomization";
import { toolbarInfoKeys } from "../Toolbar/ToolbarDefinitions";

// 自訂工具列
export function initToolbarSettings({ _config, _i18n, _mainToolbar, _defaultToolbarCustomization, _msgbox, getDom, appleSettingOfMain }: Pick<SettingWindowContext, "_config" | "_i18n" | "_mainToolbar" | "_defaultToolbarCustomization" | "_msgbox" | "getDom" | "appleSettingOfMain">) {

    const mainToolbarArray = _mainToolbar.getArrray();
    const select_toolbarListType = getDom("#select-toolbarListType") as HTMLSelectElement;
    const titlebarZones = {
        left: getDom("#toolbar-zone-titlebar-left"),
        right: getDom("#toolbar-zone-titlebar-right"),
    };
    const toolbarZones = {
        left: getDom("#toolbar-zone-left"),
        center: getDom("#toolbar-zone-center"),
        right: getDom("#toolbar-zone-right"),
    };
    const availableZone = getDom("#toolbarList-available");
    const resetToolbarButton = getDom("#btn-resetToolbarCustomization") as HTMLButtonElement;
    const customizer = getDom(".toolbar-customizer");
    titlebarZones.left.setAttribute("aria-label", `${_i18n.t("sw.customToolbar.titlebarZone")} ${_i18n.t("sw.customToolbar.leftZone")}`);
    titlebarZones.right.setAttribute("aria-label", `${_i18n.t("sw.customToolbar.titlebarZone")} ${_i18n.t("sw.customToolbar.rightZone")}`);
    toolbarZones.left.setAttribute("aria-label", _i18n.t("sw.customToolbar.leftZone"));
    toolbarZones.center.setAttribute("aria-label", _i18n.t("sw.customToolbar.centerZone"));
    toolbarZones.right.setAttribute("aria-label", _i18n.t("sw.customToolbar.rightZone"));
    availableZone.setAttribute("aria-label", _i18n.t("sw.customToolbar.available"));
    const types: (keyof typeof _config.settings.toolbarCustomization)[] = ["img", "pdf", "txt", "bulkView", "welcome"];
    let specialId = 0;

    function getGroup(type: string) {
        return _config.settings.toolbarCustomization[type as keyof typeof _config.settings.toolbarCustomization] as ToolbarCustomizationGroup;
    }

    function updateResetToolbarLabel() {
        const selectedOption = select_toolbarListType.selectedOptions[0];
        resetToolbarButton.textContent = `${_i18n.t("sw.customToolbar.resetToolbarPrefix")}${selectedOption?.textContent || ""}`;
    }

    function getDefinition(name: string, type: string) {
        return mainToolbarArray.find(item => item.name === name && item.group === type);
    }

    function createPreviewItem(item: ToolbarCustomizationItem, type: string, isTitlebar: boolean) {
        const dom = document.createElement("div");
        dom.className = "toolbar-preview-item";
        dom.setAttribute("role", "button");
        dom.tabIndex = 0;

        if (item.type === "separator" || item.type === "spacer") {
            dom.classList.add(item.type === "separator" ? "toolbar-preview-separator" : "toolbar-preview-spacer");
            dom.setAttribute("data-kind", item.type);
            dom.setAttribute("data-id", item.id);
            dom.setAttribute("aria-label", _i18n.t(item.type === "separator" ? "sw.customToolbar.separator" : "sw.customToolbar.spacer"));
            dom.title = _i18n.t(item.type === "separator" ? "sw.customToolbar.separator" : "sw.customToolbar.spacer");
            return dom;
        }

        const definition = getDefinition(item.name, type);
        if (definition === undefined) { return null; }
        const label = _i18n.t(definition.i18n);
        dom.setAttribute("data-kind", item.type);
        dom.setAttribute("data-name", item.name);
        dom.setAttribute("aria-label", label);
        dom.title = label;

        if (item.type === "button" && definition.icon !== "") {
            dom.innerHTML = SvgList[definition.icon] || "";
        } else {
            dom.classList.add("toolbar-preview-info");
            dom.textContent = item.name === toolbarInfoKeys.infoZoomRatio ? "28%" : label;
        }
        return dom;
    }

    function createAvailableItem(item: ToolbarPaletteItem, type: string) {
        const dom = document.createElement("div");
        dom.className = "toolbarList-item";
        dom.setAttribute("role", "button");
        dom.tabIndex = 0;

        if (item.type === "separatorTemplate" || item.type === "spacerTemplate") {
            const isSeparator = item.type === "separatorTemplate";
            const label = _i18n.t(isSeparator ? "sw.customToolbar.separator" : "sw.customToolbar.spacer");
            dom.classList.add("toolbar-special-item");
            dom.setAttribute("data-kind", item.type);
            dom.setAttribute("data-template", "true");
            dom.setAttribute("aria-label", label);
            const i18nKey = isSeparator ? "sw.customToolbar.separator" : "sw.customToolbar.spacer";
            dom.innerHTML = `<span class="toolbar-special-glyph ${isSeparator ? "" : "spacer"}"></span><span i18n="${i18nKey}">${Lib.escape(label)}</span>`;
            return dom;
        }

        const definition = getDefinition(item.name, type);
        if (definition === undefined) { return null; }
        const label = _i18n.t(definition.i18n);
        dom.setAttribute("data-kind", item.type);
        dom.setAttribute("data-name", item.name);
        dom.setAttribute("aria-label", label);
        if (item.type === "button" && definition.icon !== "") {
            dom.innerHTML = `${SvgList[definition.icon] || ""}<span i18n="${definition.i18n}">${Lib.escape(label)}</span>`;
        } else {
            dom.innerHTML = `<span class="toolbar-info-symbol">T</span><span i18n="${definition.i18n}">${Lib.escape(label)}</span>`;
        }
        return dom;
    }

    function renderType(type: keyof typeof _config.settings.toolbarCustomization) {
        const group = getGroup(type);
        customizer.setAttribute("data-customized", String(group.customized));
        select_toolbarListType.setAttribute("aria-label", _i18n.t("sw.customToolbar.editToolbar"));
        availableZone.setAttribute("aria-label", _i18n.t("sw.customToolbar.available"));
        updateResetToolbarLabel();
        Object.values(titlebarZones).forEach(zone => zone.replaceChildren());
        Object.values(toolbarZones).forEach(zone => zone.replaceChildren());
        availableZone.replaceChildren();

        (["left", "right"] as const).forEach(alignment => {
            group.titlebar[alignment].forEach(item => {
                const dom = createPreviewItem(item, type, true);
                if (dom !== null) { titlebarZones[alignment].appendChild(dom); }
            });
        });
        (Object.keys(toolbarZones) as (keyof typeof toolbarZones)[]).forEach(alignment => {
            (group.toolbar?.[alignment] || []).forEach(item => {
                const dom = createPreviewItem(item, type, false);
                if (dom !== null) { toolbarZones[alignment].appendChild(dom); }
            });
        });
        group.available.forEach(item => {
            const dom = createAvailableItem(item, type);
            if (dom !== null) { availableZone.appendChild(dom); }
        });
    }

    function readLayoutItems(zone: HTMLElement): ToolbarCustomizationItem[] {
        return Array.from(zone.children).map(child => {
            const dom = child as HTMLElement;
            const kind = dom.getAttribute("data-kind") || "";
            if (kind === "separator" || kind === "spacer") {
                return { type: kind, id: dom.getAttribute("data-id") || `custom-${++specialId}` } as ToolbarCustomizationItem;
            }
            return { type: kind as "button" | "info", name: dom.getAttribute("data-name") || "" };
        }).filter(item => item.type === "button" || item.type === "info" || item.type === "separator" || item.type === "spacer");
    }

    function readAvailableItems(): ToolbarPaletteItem[] {
        return Array.from(availableZone.children).map(child => {
            const dom = child as HTMLElement;
            const kind = dom.getAttribute("data-kind") || "";
            if (kind === "separatorTemplate" || kind === "spacerTemplate") { return { type: kind } as ToolbarPaletteItem; }
            return { type: kind as "button" | "info", name: dom.getAttribute("data-name") || "" };
        }).filter(item => item.type === "button" || item.type === "info" || item.type === "separatorTemplate" || item.type === "spacerTemplate");
    }

    function saveLayout(isChanged: boolean) {
        const type = select_toolbarListType.value as keyof typeof _config.settings.toolbarCustomization;
        const group = getGroup(type);
        group.titlebar = {
            left: readLayoutItems(titlebarZones.left),
            right: readLayoutItems(titlebarZones.right),
        };
        group.toolbar = {
            left: readLayoutItems(toolbarZones.left),
            center: readLayoutItems(toolbarZones.center),
            right: readLayoutItems(toolbarZones.right),
        };
        group.available = readAvailableItems();
        if (isChanged) { group.customized = true; }
        appleSettingOfMain();
        renderType(type);
    }

    const sortableGroup = {
        name: "toolbar-customization",
        pull: (_to: Sortable, _from: Sortable, dragEl: HTMLElement) => dragEl.getAttribute("data-template") === "true" ? "clone" : true,
        put: true,
    };
    [...Object.values(titlebarZones), ...Object.values(toolbarZones), availableZone].forEach(zone => {
        new Sortable(zone, {
            group: sortableGroup,
            animation: 150,
            forceFallback: true,
            fallbackOnBody: true,
            fallbackClass: "toolbar-drag-fallback",
            dragClass: "toolbar-dragging",
            onStart: event => {
                // Sortable 的 fallback clone 會複製整張可用按鈕卡片；直接重建成單一圖示，
                // 不依賴 clone 的文字與 flex 樣式是否正確套用。
                const dragPreview = document.querySelector<HTMLElement>(".toolbar-drag-fallback");
                if (dragPreview !== null) {
                    const sourceGlyph = event.item.querySelector<SVGElement | HTMLElement>("svg, .toolbar-info-symbol, .toolbar-special-glyph");
                    const glyph = sourceGlyph?.cloneNode(true) as HTMLElement | undefined;
                    if (glyph !== undefined) {
                        dragPreview.replaceChildren(glyph);
                        glyph.style.setProperty("margin", "0", "important");
                        glyph.style.setProperty("flex", "0 0 22px", "important");
                        if (glyph instanceof SVGElement) {
                            glyph.style.setProperty("width", "22px", "important");
                            glyph.style.setProperty("height", "22px", "important");
                        }
                    } else if (event.item.getAttribute("data-kind") === "info") {
                        const infoGlyph = document.createElement("span");
                        infoGlyph.className = "toolbar-info-symbol";
                        infoGlyph.textContent = "T";
                        dragPreview.replaceChildren(infoGlyph);
                    } else {
                        dragPreview.replaceChildren();
                    }

                    ["width", "min-width", "max-width"].forEach(property => dragPreview.style.setProperty(property, "34px", "important"));
                    ["height", "min-height", "max-height"].forEach(property => dragPreview.style.setProperty(property, "34px", "important"));
                    dragPreview.style.setProperty("padding", "0", "important");
                    dragPreview.style.setProperty("margin", "0", "important");
                    dragPreview.style.setProperty("font-size", "0", "important");
                    dragPreview.style.setProperty("line-height", "0", "important");
                    dragPreview.style.setProperty("overflow", "hidden", "important");
                }
                Object.values(titlebarZones).forEach(titlebarZone => titlebarZone.classList.add("toolbar-drop-active"));
                Object.values(toolbarZones).forEach(toolbarZone => toolbarZone.classList.add("toolbar-drop-active"));
                availableZone.classList.add("toolbar-drop-active");
            },
            onAdd: event => {
                const item = event.item as HTMLElement;
                const kind = item.getAttribute("data-kind");
                if (event.to === availableZone && (kind === "separator" || kind === "spacer")) {
                    item.remove();
                    return;
                }
                if (item.getAttribute("data-template") === "true") {
                    const type = kind === "separatorTemplate" ? "separator" : "spacer";
                    item.setAttribute("data-kind", type);
                    item.setAttribute("data-id", `custom-${Date.now().toString(36)}-${++specialId}`);
                    item.removeAttribute("data-template");
                    item.classList.remove("toolbar-special-item");
                    item.className = `toolbar-preview-item toolbar-preview-${type}`;
                    item.replaceChildren();
                    item.setAttribute("aria-label", _i18n.t(type === "separator" ? "sw.customToolbar.separator" : "sw.customToolbar.spacer"));
                    item.title = _i18n.t(type === "separator" ? "sw.customToolbar.separator" : "sw.customToolbar.spacer");
                } else if (event.from === availableZone && event.to !== availableZone && (kind === "button" || kind === "info")) {
                    const previewItem = createPreviewItem({
                        type: kind,
                        name: item.getAttribute("data-name") || "",
                    }, select_toolbarListType.value, event.to === titlebarZones.left || event.to === titlebarZones.right);
                    if (previewItem !== null) { item.replaceWith(previewItem); }
                }
            },
            onEnd: event => {
                Object.values(titlebarZones).forEach(titlebarZone => titlebarZone.classList.remove("toolbar-drop-active"));
                Object.values(toolbarZones).forEach(toolbarZone => toolbarZone.classList.remove("toolbar-drop-active"));
                availableZone.classList.remove("toolbar-drop-active");
                saveLayout(event.from !== event.to || event.oldIndex !== event.newIndex);
            },
        });
    });

    resetToolbarButton.addEventListener("click", () => {
        _msgbox.show({
            txt: _i18n.t("msg.toolbarReset"),
            funcYes: (domMsg: HTMLElement) => {
                _msgbox.close(domMsg);
                const type = select_toolbarListType.value as keyof typeof _config.settings.toolbarCustomization;
                const defaultGroup = cloneToolbarCustomization(_defaultToolbarCustomization)[type];
                _config.settings.toolbarCustomization[type] = defaultGroup;
                appleSettingOfMain();
                renderType(type);
            },
        });
    });

    select_toolbarListType.addEventListener("change", () => renderType(select_toolbarListType.value as keyof typeof _config.settings.toolbarCustomization));
    const previousI18nEvent = _i18n.getEventRun();
    _i18n.setEventRun((lang: string) => {
        previousI18nEvent(lang);
        renderType(select_toolbarListType.value as keyof typeof _config.settings.toolbarCustomization);
        return {};
    });
    renderType(select_toolbarListType.value as keyof typeof _config.settings.toolbarCustomization);
}
