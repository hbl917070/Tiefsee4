import type { LanguageModule, LocalizedText } from "./language-types";

export const videoToolbar = {
    videoToolbar: {
        progress: ({
            "zh-TW": "影片進度",
            "zh-CN": "视频进度",
            "en": "Video progress",
            "ja": "動画の進行状況",
        } satisfies LocalizedText),
        play: ({
            "zh-TW": "播放",
            "zh-CN": "播放",
            "en": "Play",
            "ja": "再生",
        } satisfies LocalizedText),
        pause: ({
            "zh-TW": "暫停",
            "zh-CN": "暂停",
            "en": "Pause",
            "ja": "一時停止",
        } satisfies LocalizedText),
        mute: ({
            "zh-TW": "靜音",
            "zh-CN": "静音",
            "en": "Mute",
            "ja": "ミュート",
        } satisfies LocalizedText),
        unmute: ({
            "zh-TW": "取消靜音",
            "zh-CN": "取消静音",
            "en": "Unmute",
            "ja": "ミュート解除",
        } satisfies LocalizedText),
        volume: ({
            "zh-TW": "音量",
            "zh-CN": "音量",
            "en": "Volume",
            "ja": "音量",
        } satisfies LocalizedText),
        playbackTime: ({
            "zh-TW": "播放時間",
            "zh-CN": "播放时间",
            "en": "Playback time",
            "ja": "再生時間",
        } satisfies LocalizedText),
        playbackSpeed: ({
            "zh-TW": "播放速度",
            "zh-CN": "播放速度",
            "en": "Playback speed",
            "ja": "再生速度",
        } satisfies LocalizedText),
        decreaseSpeed: ({
            "zh-TW": "降低播放速度",
            "zh-CN": "降低播放速度",
            "en": "Decrease playback speed",
            "ja": "再生速度を下げる",
        } satisfies LocalizedText),
        increaseSpeed: ({
            "zh-TW": "提高播放速度",
            "zh-CN": "提高播放速度",
            "en": "Increase playback speed",
            "ja": "再生速度を上げる",
        } satisfies LocalizedText),
    }
} satisfies LanguageModule<"videoToolbar">;
