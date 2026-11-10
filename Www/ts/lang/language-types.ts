export type Locale = "zh-TW" | "zh-CN" | "en" | "ja" | "ru";
export type LanguageNamespace =
    | "sw"
    | "motionPhoto"
    | "videoToolbar"
    | "menu"
    | "bulkView"
    | "favorites"
    | "msg"
    | "exif"
    | "script";

export type LocalizedText = { [locale in Locale]: string };
type LanguageNode = string | LocalizedText | { [key: string]: LanguageNode };

export type LanguageModule<Namespace extends LanguageNamespace> = Record<Namespace, LanguageNode>;
export type LanguageData = Record<LanguageNamespace, LanguageNode>;
