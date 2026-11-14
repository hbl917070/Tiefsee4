export const toolbarButtonDefinitions = [
    "back",
    "bulkView",
    "layout",
    "showMenuFile",
    "showMenuSort",
    "showMenuCopy",
    "dragDropFile",
    "showDeleteMsg",
    "showMenuImageSearch",
    "showMenuRotation",
    "zoomToFit",
    "favorites",
    "showSetting",
    "prevFile",
    "nextFile",
    "prevDir",
    "nextDir",
    "showSave",
    "showBulkViewSetting",
    "openFile",
] as const;

export type ToolbarButtonName = typeof toolbarButtonDefinitions[number];

export const toolbarButtonKeys = Object.fromEntries(
    toolbarButtonDefinitions.map(name => [name, name]),
) as { [K in ToolbarButtonName]: K };

export const toolbarInfoDefinitions = [
    "infoZoomRatio",
    "infoSize",
    "infoTypeSize",
    "infoWriteTime",
    "infoType",
    "infoFileSize",
    "infoWriteDate",
    "infoCreationTime",
    "infoCreationDate",
] as const;

export type ToolbarInfoName = typeof toolbarInfoDefinitions[number];

export const toolbarInfoKeys = Object.fromEntries(
    toolbarInfoDefinitions.map(name => [name, name]),
) as { [K in ToolbarInfoName]: K };
