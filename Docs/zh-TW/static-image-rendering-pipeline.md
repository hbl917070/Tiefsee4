# Tiefsee 靜態圖片渲染流程

本文描述目前程式實際執行的 Canvas 與 WebGL 靜態圖片流程，供後續維護使用。動畫圖片、影片、剪裁匯出與其他媒體流程不在範圍內。

## 渲染器選擇與責任

`FileShow.openImage()` 依使用者設定選擇 Canvas 或 WebGL。GIF 等動畫仍由既有 `<img>` 路徑處理；影片使用既有 video 路徑。WebGL 初始化失敗時，呼叫端會釋放 ImageSource 並重新取得 Canvas 路徑資料。

`Tiefseeview` 和既有 Controller 維護縮放、平移、旋轉、鏡像、viewport 與 DPI 狀態。Renderer 讀取 ViewState：WebGL 即時繪圖和閒置品質輸出都使用同一組圖片座標轉換，不另建互動模型。

## Canvas 路徑

Canvas 路徑沿用原有完整圖片載入方式：前端選擇縮放層 URL，後端 `ImageProcessingService` 產生或讀取該倍率的完整圖片，瀏覽器解碼後由 Canvas 依 ViewState 裁切和縮放到 viewport。Canvas 的 `highQualityLimit` 與降級設定仍由原有路徑管理；WebGL 不使用這個限制。

## WebGL 圖片來源

開啟靜態圖片時，前端以 `tileMode=webgl` 呼叫 `/api/images/vips/init`。後端回傳經必要格式處理及方向校正後的圖片寬高、預覽 URL、vips 類型，以及可選的 `previewScale` 和 `tileOnlyOriginal`。

來源層由 `Script.getImgData()` 建立：初始完整預覽層使用後端回傳的預覽比例；其他可取得的完整縮放層依 `tiefseeviewBigimgscaleRatio` 金字塔間距產生，比例仍四捨五入至小數第三位。若原圖大於整圖預算，原始解析度及其上方需 tile 的層級只登記比例，不提供整圖 URL，由 `/api/images/vips/tile` 提供可視區塊。

### 暫定整圖預算與預覽

目前整圖預算暫定為 **8,388,608 像素（8 MP）**。這是整圖預覽／完整品質來源的像素預算，不是動態讀取的 GPU 可用記憶體，也不代表 GPU 總資源上限。前端另查詢 WebGL `MAX_TEXTURE_SIZE`；實際完整層需同時符合像素預算與單張貼圖寬高限制，否則會再拆成 GPU 貼圖或改請求可視 tile。8 MP 是目前政策值，未來可依實際效能及記憶體觀察調整。

後端在 WebGL 初始化時，若支援 vips 區域處理的來源超過 8 MP，會以 VIPS 產生不超過預算的完整預覽，並標記原始高解析度只供 tile 使用。超大 TIFF 的 Canvas JPEG 尺寸限制仍維持原有行為；WebGL 可用 tile 避免把超大來源轉成完整瀏覽器圖片。

開啟時，WebGL 從有完整 URL 且符合 8 MP 預算的層級中，選擇能覆蓋目前輸出倍率的最低層；若目前倍率比所有可用完整層都低，使用最高解析度的完整層。GPU 貼圖上限也參與初始預覽選擇；若完整預覽超出單張貼圖尺寸，Renderer 會再切成貼圖上限內的區塊。這份完整預覽確保拖曳時整張圖片都有內容。

## 即時顯示與閒置品質更新

操作期間，WebGL Renderer 依最新 ViewState 繪製已載入的預覽和 tile，使用 GPU 貼圖取樣與 mipmap。拖曳、縮放時不等待 Lanczos，也不預取新的品質來源；在平滑模式下，半透明像素的快速取樣可能短暫呈現不同顏色。再次操作時，閒置品質 canvas 立即隱藏，切回 WebGL 即時畫面。

平移、縮放、旋轉、鏡像、視窗尺寸或來源變更都會重設品質計時器。閒置 **100 ms** 後，Renderer 依目前 ViewState、viewport backing 尺寸與 DPR 計算目標輸出倍率，選擇 `levelScale >= targetScale` 的最低來源層級；選層倍率最高限制為原圖 100%。

閒置更新依下列順序取得品質來源：

1. 若目前保留的完整預覽倍率已足夠，直接使用該 bitmap。
2. 否則，若選定完整層同時符合 8 MP 和 `MAX_TEXTURE_SIZE` 限制，請求並解碼完整層，取代目前預覽。
3. 若完整層不符合限制且來源支援區域請求，計算可視原圖範圍及 8% 預取邊界，請求相交的 tile。最多請求 32 塊；單次工作最多並行 4 個 tile。
4. 若 tile 內容的矩形合成結果符合 8 MP 及 WebGPU 單張貼圖限制，前端按層級格點組成受限的 Lanczos 來源 bitmap，交給 WebGPU viewport Lanczos3。合成來源不重複繪製 tile gutter。
5. 若無法形成合適的完整 Lanczos 來源，保留後端已用 Lanczos3 產生的可視 tile，以 WebGL 呈現。若設定銳化，對完成合成的 viewport 另執行 WebGPU 銳化 pass。

WebGPU Lanczos3 將來源重採樣到 viewport backing-buffer 尺寸，結果與 WebGL canvas 使用相同 CSS／backing 尺寸。結果完成後，只有在來源、ViewState 和請求世代仍有效時才切換顯示 canvas；切換採互斥顯示，避免透明圖層重複合成。WebGPU 不支援、貼圖尺寸超限或處理失敗時維持 WebGL 畫面；Lanczos 不適用時仍可嘗試銳化。

「呈現像素」模式保留 WebGL 最近點取樣，不執行會重新平滑像素的 Lanczos。WebGL 貼圖的取樣模式會依此設定切換。

## Tile 產生與座標

前端以目前輸出倍率選出層級，根據反向 ViewState 將 viewport 換算成原圖矩形，再加上預取邊界，列出相交層級格子的座標。tile 座標以該縮放層像素為單位；預覽、來源圖片、CSS pixel、DPI 和 GPU texture 尺寸不可混用。

`/api/images/vips/tile` 對每個 tile 回傳含 gutter 的 PNG，並提供內容矩形對應的原圖座標。VIPS 先依 EXIF Orientation 必要時執行 `Autorot()`，再以固定尺寸的來源 ROI 及 Lanczos3 產生縮放區域。ROI 起點按三位小數金字塔比例對齊來源取樣格點，ROI 尺寸固定以保持 `gap=4` 預縮小一致；圖片外邊界使用 `Extend.Copy`。這些邊界與格點處理是相鄰 tile 避免接縫的既有機制。完整層級可用時不走 tile API。

tile 磁碟快取鍵包含來源路徑雜湊、檔案大小和修改時間、解碼類型、tile 演算法版本、比例、尺寸、gutter 和 tile 座標。相同程序中相同 tile 的並行快取 miss 會共用一次產生工作。修改 tile 座標、方向或取樣邏輯時須更新演算法版本。

## 格式、方向與色彩

前後端使用方向校正後尺寸作為 WebGL 的座標基準。PNG、WebP、TIFF 等容器 EXIF 方向由 MetadataExtractor 解析；其他支援格式沿用 WPF metadata 查詢。若來源含旋轉或鏡像方向，後端會使用 VIPS `Autorot()` 產生方向正規化暫存檔，或在 tile 計算前校正像素，使整圖預覽和 tile 共用方向。

格式轉換、CMYK/ICC、RAW、HDR 和透明度處理沿用既有 `ImageProcessingService` 解碼分支。透明 tile 在 WebGL 以預乘 alpha 覆寫預覽對應區域，避免與預覽底圖重複 source-over 合成。WebGL 顯示路徑不改寫 Canvas 匯出、剪裁或 Base64 流程。

## 請求取消與資源生命週期

WebGL Renderer 為來源載入與品質請求維護世代編號及 `AbortController`。狀態改變後，舊請求不能提交貼圖或覆蓋較新的畫面。Image Worker 負責 fetch、Blob 解碼和 `ImageBitmap` 交付，不操作 WebGL；Renderer 上傳後關閉 tile bitmap。預覽 bitmap 由 Renderer 保留供即時顯示和閒置 Lanczos 使用，來源切換或 dispose 時關閉。

WebGL texture 受 `MAX_TEXTURE_SIZE` 約束；可視品質 tile GPU 快取最多 32 塊，優先保留目前可視範圍並以 LRU 淘汰其他塊。完整來源及 tile Lanczos 合成來源各受 8 MP 預算約束。這些是目前明確的資源政策，沒有依裝置可用 GPU 記憶體動態調整的機制。多個貼圖、mipmap、CPU 解碼暫存和並行請求的總記憶體並未以單一位元組預算統一限制。

後端 VIPS 來源快取最多保留 5 個未淘汰來源。每個工作以 lease 使用來源；LRU 淘汰時，仍有工作使用的 `Image` 和大型檔案的來源 stream 會延後至最後一個 lease 釋放才關閉。tile 和完整縮放結果存在 ImgZoom 暫存目錄，按目前既有清理機制回收；執行期間磁碟快取沒有額外容量上限。

WebGL Renderer 只處理靜態圖片顯示。Canvas 匯出、剪裁和其他既有影像操作仍使用原本 Canvas 路徑。
