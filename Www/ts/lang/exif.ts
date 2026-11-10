import type { LanguageModule, LocalizedText } from "./language-types";

export const exif = {
    exif: {

        name: {
            "Date/Time Original": ({
                "zh-TW": "拍攝日期",
                "zh-CN": "拍摄日期",
                "en": "Date Time Original",
                "ja": "撮影日時",
            } satisfies LocalizedText),
            "Windows XP Keywords": ({
                "zh-TW": "標籤",
                "zh-CN": "标签",
                "en": "Keywords",
                "ja": "タグ",
            } satisfies LocalizedText),
            "Rating": ({
                "zh-TW": "評等",
                "zh-CN": "评分",
                "en": "Rating",
                "ja": "評価",
            } satisfies LocalizedText),
            "Image Width/Height": ({
                "zh-TW": "圖片尺寸",
                "zh-CN": "图片尺寸",
                "en": "Image Size",
                "ja": "画像サイズ",
            } satisfies LocalizedText),
            "Length": ({
                "zh-TW": "檔案大小",
                "zh-CN": "文件大小",
                "en": "File Size",
                "ja": "ファイルサイズ",
            } satisfies LocalizedText),
            "Windows XP Title": ({
                "zh-TW": "標題",
                "zh-CN": "标题",
                "en": "Title",
                "ja": "タイトル",
            } satisfies LocalizedText),
            "Artist": ({
                "zh-TW": "作者",
                "zh-CN": "作者",
                "en": "Artist",
                "ja": "作成者",
            } satisfies LocalizedText),
            "Copyright": ({
                "zh-TW": "版權",
                "zh-CN": "版权",
                "en": "Copyright",
                "ja": "著作権",
            } satisfies LocalizedText),
            "Image Description": ({
                "zh-TW": "描述",
                "zh-CN": "描述",
                "en": "Description",
                "ja": "説明",
            } satisfies LocalizedText),
            "Windows XP Comment": ({
                "zh-TW": "註解",
                "zh-CN": "注释",
                "en": "Comment",
                "ja": "コメント",
            } satisfies LocalizedText),
            "User Comment": ({
                "zh-TW": "註解",
                "zh-CN": "注释",
                "en": "Comment",
                "ja": "コメント",
            } satisfies LocalizedText),
            "Comment": ({
                "zh-TW": "註解",
                "zh-CN": "注释",
                "en": "Comment",
                "ja": "コメント",
            } satisfies LocalizedText),
            "Make": ({
                "zh-TW": "相機製造商",
                "zh-CN": "相机制造商",
                "en": "Make",
                "ja": "カメラの製造元",
            } satisfies LocalizedText),
            "Model": ({
                "zh-TW": "相機型號",
                "zh-CN": "相机型号",
                "en": "Model",
                "ja": "カメラのモデル",
            } satisfies LocalizedText),
            "Lens Model": ({
                "zh-TW": "鏡頭型號",
                "zh-CN": "镜头型号",
                "en": "Lens Model",
                "ja": "レンズモデル",
            } satisfies LocalizedText),
            "Windows XP Subject": ({
                "zh-TW": "主旨",
                "zh-CN": "主题",
                "en": "Subject",
                "ja": "件名",
            } satisfies LocalizedText),
            "F-Number": ({
                "zh-TW": "光圈孔徑",
                "zh-CN": "光圈孔径",
                "en": "F-Number",
                "ja": "絞り値",
            } satisfies LocalizedText),
            "Exposure Time": ({
                "zh-TW": "曝光時間",
                "zh-CN": "曝光时间",
                "en": "Exposure Time",
                "ja": "露出時間",
            } satisfies LocalizedText),
            "ISO Speed Ratings": ({
                "zh-TW": "ISO速度",
                "zh-CN": "ISO速度",
                "en": "ISO Speed Ratings",
                "ja": "ISO速度",
            } satisfies LocalizedText),
            "Exposure Bias Value": ({
                "zh-TW": "曝光補償",
                "zh-CN": "曝光补偿",
                "en": "Exposure Bias Value",
                "ja": "露出補正",
            } satisfies LocalizedText),
            "Focal Length": ({
                "zh-TW": "焦距",
                "zh-CN": "焦距",
                "en": "Focal Length",
                "ja": "焦点距離",
            } satisfies LocalizedText),
            "Max Aperture Value": ({
                "zh-TW": "最大光圈",
                "zh-CN": "最大光圈",
                "en": "Max Aperture Value",
                "ja": "最大絞り",
            } satisfies LocalizedText),
            "Metering Mode": ({
                "zh-TW": "測光模式",
                "zh-CN": "测光模式",
                "en": "Metering Mode",
                "ja": "測光モード",
            } satisfies LocalizedText),
            "Flash": ({
                "zh-TW": "閃光燈模式",
                "zh-CN": "闪光灯模式",
                "en": "Flash",
                "ja": "フラッシュモード",
            } satisfies LocalizedText),
            "Focal Length 35": ({
                "zh-TW": "35mm焦距",
                "zh-CN": "35mm焦距",
                "en": "Focal Length 35",
                "ja": "35mm焦点距離",
            } satisfies LocalizedText),
            "Orientation": ({
                "zh-TW": "旋轉資訊",
                "zh-CN": "旋转信息",
                "en": "Orientation",
                "ja": "画像の向き",
            } satisfies LocalizedText),
            "Software": ({
                "zh-TW": "軟體",
                "zh-CN": "软件",
                "en": "Software",
                "ja": "ソフトウェア",
            } satisfies LocalizedText),

            // 影片 ----------

            "Video Duration": ({
                "zh-TW": "影片長度",
                "zh-CN": "视频长度",
                "en": "Video Length",
                "ja": "ビデオの長さ"
            } satisfies LocalizedText),

            // Gif ----------

            "Frame Count": ({
                "zh-TW": "總幀數",
                "zh-CN": "总帧数",
                "en": "Frame Count",
                "ja": "フレーム数"
            } satisfies LocalizedText),
            "Loop Count": ({
                "zh-TW": "循環次數",
                "zh-CN": "循环次数",
                "en": "Loop Count",
                "ja": "ループ回数"
            } satisfies LocalizedText),

            // 每個檔案固定都會有的欄位 ----------

            "Creation Time": ({
                "zh-TW": "建立日期",
                "zh-CN": "创建日期",
                "en": "Creation Time",
                "ja": "作成日時",
            } satisfies LocalizedText),
            "Last Write Time": ({
                "zh-TW": "修改日期",
                "zh-CN": "修改日期",
                "en": "Last Write Time",
                "ja": "更新日時",
            } satisfies LocalizedText),
            "Last Access Time": ({
                "zh-TW": "存取日期",
                "zh-CN": "访问日期",
                "en": "Last Access Time",
                "ja": "アクセス日時",
            } satisfies LocalizedText),
        },

        value: {
            "Metering Mode": {
                "Unknown": ({
                    "zh-TW": "未知",
                    "zh-CN": "未知",
                    "en": "Unknown",
                    "ja": "不明",
                } satisfies LocalizedText),
                "Average": ({
                    "zh-TW": "平均測光",
                    "zh-CN": "平均测光",
                    "en": "Average",
                    "ja": "平均",
                } satisfies LocalizedText),
                "Center weighted average": ({
                    "zh-TW": "中央偏重平均測光",
                    "zh-CN": "中央偏重平均测光",
                    "en": "Center weighted average",
                    "ja": "中央重点測光",
                } satisfies LocalizedText),
                "Spot": ({
                    "zh-TW": "測光",
                    "zh-CN": "测光",
                    "en": "Spot",
                    "ja": "スポット",
                } satisfies LocalizedText),
                "Multi-spot": ({
                    "zh-TW": "多點測光",
                    "zh-CN": "多点测光",
                    "en": "Multi-spot",
                    "ja": "マルチ スポット",
                } satisfies LocalizedText),
                "Multi-segment": ({
                    "zh-TW": "分區測光",
                    "zh-CN": "分区测光",
                    "en": "Multi-segment",
                    "ja": "パターン",
                } satisfies LocalizedText),
                "Partial": ({
                    "zh-TW": "局部測光",
                    "zh-CN": "局部测光",
                    "en": "Partial",
                    "ja": "部分",
                } satisfies LocalizedText),
            },


            "Flash": {

                "0": ({
                    "zh-TW": "無閃光燈",
                    "zh-CN": "无闪光灯",
                    "en": "Flash did not fire",
                    "ja": "フラッシュなし",
                } satisfies LocalizedText),
                "1": ({
                    "zh-TW": "閃光燈",
                    "zh-CN": "闪光灯",
                    "en": "Flash fired",
                    "ja": "フラッシュ",
                } satisfies LocalizedText),
                "5": ({
                    "zh-TW": "閃光燈，無回應閃光",
                    "zh-CN": "闪光灯，无响应闪光",
                    "en": "Flash fired, return not detected",
                    "ja": "フラッシュ(ストロボの反射光なし)",
                } satisfies LocalizedText),
                "7": ({
                    "zh-TW": "閃光燈，回應閃光",
                    "zh-CN": "闪光灯，响应闪光",
                    "en": "Flash fired, return detected",
                    "ja": "フラッシュ(ストロボの反射光あり)",
                } satisfies LocalizedText),
                "9": ({
                    "zh-TW": "閃光燈，強制",
                    "zh-CN": "闪光灯，强制",
                    "en": "Flash fired",
                    "ja": "フラッシュ(強制)",
                } satisfies LocalizedText),
                "13": ({
                    "zh-TW": "閃光燈，強制，無回應閃光",
                    "zh-CN": "闪光灯，强制，无响应闪光",
                    "en": "Flash fired, return not detected",
                    "ja": "フラッシュ(強制、ストロボの反射光なし)",
                } satisfies LocalizedText),
                "15": ({
                    "zh-TW": "閃光燈，強制，回應閃光",
                    "zh-CN": "闪光灯，强制，响应闪光",
                    "en": "Flash fired, return detected",
                    "ja": "フラッシュ(強制、ストロボの反射光あり)",
                } satisfies LocalizedText),
                "16": ({
                    "zh-TW": "無閃光燈，強制",
                    "zh-CN": "无闪光灯，强制",
                    "en": "Flash did not fire",
                    "ja": "フラッシュなし(強制)",
                } satisfies LocalizedText),
                "24": ({
                    "zh-TW": "無閃光燈，自動",
                    "zh-CN": "无闪光灯，自动",
                    "en": "Flash did not fire, auto",
                    "ja": "フラッシュなし(自動)",
                } satisfies LocalizedText),
                "25": ({
                    "zh-TW": "閃光燈，自動",
                    "zh-CN": "闪光灯，自动",
                    "en": "Flash fired, auto",
                    "ja": "フラッシュ(自動)",
                } satisfies LocalizedText),
                "29": ({
                    "zh-TW": "閃光燈，自動，無回應閃光",
                    "zh-CN": "闪光灯，自动，无响应闪光",
                    "en": "Flash fired, return not detected, auto",
                    "ja": "フラッシュ(自動、ストロボの反射光なし)",
                } satisfies LocalizedText),
                "31": ({
                    "zh-TW": "閃光燈，自動，回應閃光",
                    "zh-CN": "闪光灯，自动，响应闪光",
                    "en": "Flash fired, return detected, auto",
                    "ja": "フラッシュ(自動、ストロボの反射光あり)",
                } satisfies LocalizedText),
                "32": ({
                    "zh-TW": "無閃光燈功能",
                    "zh-CN": "无闪光灯功能",
                    "en": "Flash did not fire",
                    "ja": "フラッシュ機能なし",
                } satisfies LocalizedText),
                "65": ({
                    "zh-TW": "閃光燈，紅眼",
                    "zh-CN": "闪光灯，红眼",
                    "en": "Flash fired, red-eye reduction",
                    "ja": "フラッシュ(赤目修整)",
                } satisfies LocalizedText),
                "69": ({
                    "zh-TW": "閃光燈，紅眼，無回應閃光",
                    "zh-CN": "闪光灯，红眼，无响应闪光",
                    "en": "Flash fired, return not detected, red-eye reduction",
                    "ja": "フラッシュ(赤目修盤、ストロボの反射光なし)",
                } satisfies LocalizedText),
                "71": ({
                    "zh-TW": "閃光燈，紅眼，回應閃光",
                    "zh-CN": "闪光灯，红眼，响应闪光",
                    "en": "Flash fired, return detected, red-eye reduction",
                    "ja": "フラッシュ(赤目修整、ストロボの反射光あり)",
                } satisfies LocalizedText),
                "73": ({
                    "zh-TW": "閃光燈，強制，紅眼",
                    "zh-CN": "闪光灯，强制，红眼",
                    "en": "Flash fired, red-eye reduction",
                    "ja": "フラッシュ(強制、赤目修堅)",
                } satisfies LocalizedText),
                "77": ({
                    "zh-TW": "閃光燈，強制，紅眼，無回應閃光",
                    "zh-CN": "闪光灯，强制，红眼，无响应闪光",
                    "en": "Flash fired, return not detected, red-eye reduction",
                    "ja": "フラッシュ(強制、赤目修盤、ストロボの反射光なし)",
                } satisfies LocalizedText),
                "79": ({
                    "zh-TW": "閃光燈，強制，紅眼，回應閃光",
                    "zh-CN": "闪光灯，强制，红眼，响应闪光",
                    "en": "Flash fired, return detected, red-eye reduction",
                    "ja": "フラッシュ(強制、赤目修整、ストロボの反射光あり",
                } satisfies LocalizedText),
                "89": ({
                    "zh-TW": "閃光燈，自動，紅眼",
                    "zh-CN": "闪光灯，自动，红眼",
                    "en": "Flash fired, auto, red-eye reduction",
                    "ja": "フラッシュ(自動、赤目修堅)",
                } satisfies LocalizedText),
                "93": ({
                    "zh-TW": "閃光燈，自動，無回應閃光，紅眼",
                    "zh-CN": "闪光灯，自动，无响应闪光，红眼",
                    "en": "Flash fired, return not detected, auto, red-eye reduction",
                    "ja": "フラッシュ(自動、ストロボの反射光なし、赤目修盤)",
                } satisfies LocalizedText),
                "95": ({
                    "zh-TW": "閃光燈，自動，回應閃光，紅眼",
                    "zh-CN": "闪光灯，自动，响应闪光，红眼",
                    "en": "Flash fired, return detected, auto, red-eye reduction",
                    "ja": "フラッシュ(自動、ストロボの反射光あり、赤目修正)",
                } satisfies LocalizedText),
            }
        },

    }
} satisfies LanguageModule<"exif">;
