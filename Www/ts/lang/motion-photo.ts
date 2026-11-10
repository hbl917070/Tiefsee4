import type { LanguageModule, LocalizedText } from "./language-types";

export const motionPhoto = {
    motionPhoto: {
        dynamic: ({
            "zh-TW": "動態",
            "zh-CN": "动态",
            "en": "Motion",
            "ru": "Движение",
            "ja": "モーション",
        } satisfies LocalizedText),
        still: ({
            "zh-TW": "照片",
            "zh-CN": "照片",
            "en": "Photo",
            "ru": "Фотография",
            "ja": "写真",
        } satisfies LocalizedText),
        showVideo: ({
            "zh-TW": "播放動態照片",
            "zh-CN": "播放动态照片",
            "en": "Play motion photo",
            "ru": "Воспроизвести фотографию с движением",
            "ja": "モーションフォトを再生",
        } satisfies LocalizedText),
        showImage: ({
            "zh-TW": "顯示靜態照片",
            "zh-CN": "显示静态照片",
            "en": "Show still photo",
            "ru": "Показать фотографию",
            "ja": "静止画を表示",
        } satisfies LocalizedText),
    }
} satisfies LanguageModule<"motionPhoto">;
