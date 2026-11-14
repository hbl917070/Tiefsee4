import { ToolbarButtonName, ToolbarInfoName } from "./ToolbarDefinitions";

export type ToolbarCustomizationItem =
    | { type: "button", name: string }
    | { type: "info", name: string }
    | { type: "separator", id: string }
    | { type: "spacer", id: string };

export type ToolbarPaletteItem =
    | { type: "button", name: string }
    | { type: "info", name: string }
    | { type: "separatorTemplate" }
    | { type: "spacerTemplate" };

export type ToolbarAlignmentGroups = {
    left: ToolbarCustomizationItem[];
    center: ToolbarCustomizationItem[];
    right: ToolbarCustomizationItem[];
};

export type ToolbarCustomizationGroup = {
    customized: boolean;
    titlebar: {
        left: ToolbarCustomizationItem[];
        right: ToolbarCustomizationItem[];
    };
    toolbar: ToolbarAlignmentGroups;
    available: ToolbarPaletteItem[];
};

export type ToolbarCustomization = {
    img: ToolbarCustomizationGroup;
    pdf: ToolbarCustomizationGroup;
    txt: ToolbarCustomizationGroup;
    bulkView: ToolbarCustomizationGroup;
    welcome: ToolbarCustomizationGroup;
};

/**
 * jQuery deep-extend merges arrays by index, which can resurrect default toolbar
 * entries when a saved layout removes them. An explicit marker distinguishes an
 * untouched default (even when saved) from a user-edited layout.
 */
export function cloneToolbarCustomization(source: ToolbarCustomization): ToolbarCustomization {
    return JSON.parse(JSON.stringify(source)) as ToolbarCustomization;
}

export function restoreToolbarCustomization(settings: ToolbarCustomization, userSetting: any, defaults: ToolbarCustomization): void {
    const source = userSetting?.toolbarCustomization;
    const defaultGroups = cloneToolbarCustomization(defaults);
    const types: (keyof ToolbarCustomization)[] = ["img", "pdf", "txt", "bulkView", "welcome"];
    types.forEach(type => {
        const sourceGroup = source?.[type];
        if (sourceGroup === null || typeof sourceGroup !== "object" || sourceGroup.customized !== true) {
            settings[type] = defaultGroups[type];
            return;
        }
        const titlebar = sourceGroup.titlebar;
        const toolbar = sourceGroup.toolbar;
        const available = sourceGroup.available;
        const isPositionedItem = (item: any) => item !== null && typeof item === "object" && (
            ((item.type === "button" || item.type === "info") && typeof item.name === "string") ||
            ((item.type === "separator" || item.type === "spacer") && typeof item.id === "string")
        );
        const isPaletteItem = (item: any) => item !== null && typeof item === "object" && (
            ((item.type === "button" || item.type === "info") && typeof item.name === "string") ||
            item.type === "separatorTemplate" || item.type === "spacerTemplate"
        );
        const hasValidShape = titlebar !== null && typeof titlebar === "object" &&
            Array.isArray(titlebar.left) && titlebar.left.every(isPositionedItem) &&
            Array.isArray(titlebar.right) && titlebar.right.every(isPositionedItem) &&
            toolbar !== null && typeof toolbar === "object" && !Array.isArray(toolbar) &&
            Array.isArray(toolbar.left) && toolbar.left.every(isPositionedItem) &&
            Array.isArray(toolbar.center) && toolbar.center.every(isPositionedItem) &&
            Array.isArray(toolbar.right) && toolbar.right.every(isPositionedItem) &&
            Array.isArray(available) && available.every(isPaletteItem);
        if (!hasValidShape) {
            settings[type] = defaultGroups[type];
            return;
        }
        const group = settings[type];

        group.customized = true;
        group.titlebar = { left: titlebar.left, right: titlebar.right };
        group.toolbar = { left: toolbar.left, center: toolbar.center, right: toolbar.right };
        group.available = available;

        const placed = new Set<string>();
        const specialIds = new Set<string>();
        const keepOnce = (items: ToolbarCustomizationItem[]) => items.filter(item => {
            if (item.type === "button" || item.type === "info") {
                const key = `${item.type}:${item.name}`;
                if (placed.has(key)) { return false; }
                placed.add(key);
                return true;
            }
            const key = `${item.type}:${item.id}`;
            if (specialIds.has(key)) { return false; }
            specialIds.add(key);
            return true;
        });

        group.titlebar.left = keepOnce(group.titlebar.left);
        group.titlebar.right = keepOnce(group.titlebar.right);
        (["left", "center", "right"] as const).forEach(alignment => {
            group.toolbar[alignment] = keepOnce(group.toolbar[alignment]);
        });

        const availableKeys = new Set<string>();
        group.available = group.available.filter(item => {
            if (item.type === "button" || item.type === "info") {
                const key = `${item.type}:${item.name}`;
                if (placed.has(key) || availableKeys.has(key)) { return false; }
                availableKeys.add(key);
                return true;
            }
            if (item.type === "separatorTemplate" || item.type === "spacerTemplate") {
                if (availableKeys.has(item.type)) { return false; }
                availableKeys.add(item.type);
            }
            return true;
        });

        const presentKeys = new Set<string>([
            ...group.titlebar.left,
            ...group.titlebar.right,
            ...group.toolbar.left,
            ...group.toolbar.center,
            ...group.toolbar.right,
        ].filter(item => item.type === "button" || item.type === "info").map(item => `${item.type}:${item.name}`));
        group.available.forEach(item => {
            if (item.type === "button" || item.type === "info") { presentKeys.add(`${item.type}:${item.name}`); }
        });

        // The defaults are the catalog for this toolbar type. Items added in a
        // later release remain unplaced for customized layouts until chosen.
        const defaultGroup = defaults[type];
        const defaultItems: ToolbarCustomizationItem[] = [
            ...defaultGroup.titlebar.left, ...defaultGroup.titlebar.right,
            ...defaultGroup.toolbar.left, ...defaultGroup.toolbar.center, ...defaultGroup.toolbar.right,
            ...defaultGroup.available.reduce<ToolbarCustomizationItem[]>((items, item) => {
                if (item.type === "button" || item.type === "info") { items.push({ type: item.type, name: item.name }); }
                return items;
            }, []),
        ];
        defaultItems.forEach(item => {
            if (item.type !== "button" && item.type !== "info") { return; }
            const key = `${item.type}:${item.name}`;
            if (!presentKeys.has(key)) {
                if (item.type === "button") { group.available.push({ type: "button", name: item.name }); }
                else { group.available.push({ type: "info", name: item.name }); }
                presentKeys.add(key);
            }
        });
    });
}

export function toolbarButton(name: ToolbarButtonName): ToolbarCustomizationItem {
    return { type: "button", name };
}

export function toolbarInfo(name: ToolbarInfoName): ToolbarCustomizationItem {
    return { type: "info", name };
}

export function toolbarSeparator(id: string): ToolbarCustomizationItem {
    return { type: "separator", id };
}

export function toolbarAvailableButton(name: ToolbarButtonName): ToolbarPaletteItem {
    return { type: "button", name };
}

export function toolbarAvailableInfo(name: ToolbarInfoName): ToolbarPaletteItem {
    return { type: "info", name };
}

export function toolbarLayout(
    titlebar: ToolbarCustomizationGroup["titlebar"],
    toolbar: ToolbarAlignmentGroups,
    available: ToolbarPaletteItem[]
): ToolbarCustomizationGroup {
    return {
        customized: false,
        titlebar,
        toolbar,
        available: [...available, { type: "separatorTemplate" }, { type: "spacerTemplate" }],
    };
}
