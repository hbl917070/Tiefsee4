# WebView2 視窗邊緣內縮

本文說明 Tiefsee 為避免視窗右側和下側內容被裁切而採用的內縮方式。這是根據目前觀察設計的補償，並非已證明適用所有 WebView2 版本和縮放比例的通用公式。

## 問題與取捨

Tiefsee 以 WinForms 視窗承載 WebView2。一般視窗效果由網頁以 CSS 繪製外框；Windows 11 圓角效果則使用系統繪製的邊框。部分視窗尺寸和 Windows 螢幕縮放比例下，網頁右側或下側有內容出現在 WebView2 表面擷取中，但沒有完整出現在螢幕上。可能受影響的內容包括自繪視窗邊框和靠右排列的詳細資料面板捲動條。

這不只發生在 Tiefsee 的透明窗體：獨立標準 WinForms 控制項和標準 Win32 視窗承載 WebView2 的對照，在測試機的 125% 縮放下也重現了紅框缺邊。然而，CSS 紅框在不同 DPI 下可能因像素對齊而顯示不均，單靠紅框不能證明其他內容也被裁切。WebView2、Chromium 與 Windows 合成之間的具體根因尚未確認。

固定的 CSS 內縮距離無法依視窗尺寸變化調整；100% 縮放時的半像素也可能讓 `.main-V` 的尺寸變成小數。另一方面，Windows 10 的 Aero／Acrylic 效果作用於原生窗體，網頁向內縮越多，原生模糊區域越容易在網頁外側露出。

目前依網頁、WebView2 控制項及窗體 client 區域的尺寸差，分別計算右、下內縮。這是經驗性補償，不能保證適用所有視窗尺寸及 DPI。

## 程式碼位置

| 位置 | 責任 |
| --- | --- |
| [`Tiefsee/WebWindow.cs`](../../Tiefsee/WebWindow.cs) | 建立 WebView2，並依視窗效果調整原生 WebView2 bounds。一般視窗模式將寬、高各外推 1 個實體像素；Windows 11 圓角視窗模式將左、上各內縮 1px，寬、高各減 2px。 |
| [`Tiefsee/Features/Window/WebView/WindowWebViewBridge.cs`](../../Tiefsee/Features/Window/WebView/WindowWebViewBridge.cs) | `GetWebViewPixelSize()` 以 Win32 API 取得 WebView2 控制項實體寬、高、其右、下邊界超出窗體 client 區域的距離，以及窗體所在的原生 DPI，以 JSON 交給網頁。這些 bounds 不直接量測最後合成到螢幕的可見區域。 |
| [`Www/ts/BaseWindow.ts`](../../Www/ts/BaseWindow.ts) | 監聽頁面 resize 和 DPR 變化，取得兩邊尺寸，依寬、高分別計算 CSS 內縮值。 |
| [`Www/scss/_BaseWindow.scss`](../../Www/scss/_BaseWindow.scss) | 以 CSS 變數決定 `.window` 的寬、高；最大化時改為完整視口，並移除自繪邊框。 |
| [`Www/ts/d/NetAPI.d.ts`](../../Www/ts/d/NetAPI.d.ts) | 宣告網頁使用的視窗橋接介面。 |

原生 bounds 調整和 CSS 內縮作用於不同層級，修改其中一側可能改變另一側原本的假設；不能直接將 CSS px 和原生實體 px 相減。

跨不同 DPI 螢幕時，曾觀察到窗體與 WebView2 子視窗的原生 DPI 已更新，但網頁 DPR 仍停留在舊值，直到手動調整尺寸。`WebWindow` 收到 `DpiChanged` 後，會在 WinForms 完成事件處理後短暫更動並還原 WebView2 控制項寬度，促使 WebView2 更新縮放；這是實測有效的補救措施，不應改變最終控制項尺寸。

## 運作流程

1. 初始化、原生 WebView2 控制項尺寸變更、頁面 resize 或 `devicePixelRatio`（DPR）變化時，前端先將右、下都設為 `(1 + ceil(DPR)) / DPR` CSS px 的暫定保守值；它不是所有環境均安全的保證。原生端透過 `SizeChanged` 通知頁面，並合併同一輪的通知，因此即使視口取整後尺寸不變，也會重新讀取。靜態 CSS 在變數尚未設定時以 1 CSS px 作為備援；最大化的 `.window` 使用 `width: 100%`、`height: 100%`，不使用這個內縮。
2. 前端重設計時器，等待 80ms 後非同步呼叫 `GetWebViewPixelSize()`。連續 resize 會合併計時器；已有查詢進行時不再並行發出另一個查詢。
3. 呼叫前後分別讀取 `body.getBoundingClientRect()`。若期間發生新的更新、DPR 改變或 body 寬高改變，放棄該次結果，避免以舊資料減少保守內縮。新的更新已發生時重新計算；其他暫時不一致或讀取失敗時，依序等待 200ms 和 400ms，最多重試兩次。用完重試次數後保留保守值，直到下一次更新；頁面關閉後不再排程重試。
4. 將 body 的 CSS 寬、高各自乘 DPR 並四捨五入，分別減去原生 WebView2 的實體寬、高，得到表面超出控制項的距離。再加上 WebView2 超出窗體 client 右、下邊界的距離；後者至少以 1 實體像素計算，作為現階段的對齊／系統邊框保守補償。兩個方向分別除以 DPR，得到 CSS 內縮值。若尺寸不合理、原生讀取失敗或資料過期，保留暫定保守值。基本補償的 1px 是經驗假設，並非系統保證。
5. 結果寫入 `--window-physical-inset-x` 和 `--window-physical-inset-y`。兩個方向獨立計算。例外是 Windows 11 原生圓角模式：若原生 `GetDpiForWindow` 回報 96 DPI（螢幕縮放 100%），CSS 將寬、高設為 100%，右、下不內縮。此判斷使用螢幕 DPI，而非會受網頁縮放影響的 DPR；其他視窗模式和螢幕 DPI 維持原計算。

例如在 DPR 1.5、body 寬 `589.333… CSS px` 且原生 WebView2 寬 883 實體 px 時，換算後網頁寬約 884px，差距為 1px；右側內縮為 `2 / 1.5 ≈ 1.333 CSS px`。若另一方向差距為 0，該方向則使用 `1 / 1.5 ≈ 0.667 CSS px`。DPR 是網頁實際像素比例，可能同時受到螢幕與 WebView2 網頁縮放影響，不應一律等同 Windows 的顯示縮放。

## 維護與驗證

- 修改此處前，先確認原生控制項、網頁表面與螢幕三者的差異。`CapturePreviewAsync` 或 CDP 的 WebView 擷取只反映擷取表面，不能單獨證明螢幕上最後一列像素可見。
- 驗證一般視窗效果的 CSS 四邊框，也驗證詳細資料面板的原生 HTML 捲動條；紅框與捲動條可能有不同的繪製或裁切情況。測試最大化、還原，以及拖曳時和停止後的狀態。
- 至少比較 100%、125%、150% 縮放，並檢查視窗跨不同 DPI 螢幕、Tiefsee 網頁縮放變化與不同視窗尺寸。不要假設視窗尺寸跳動的步長就是目前裁切距離。
- 在 Windows 10 分別觀察 Aero／Acrylic 的模糊外露；在 Windows 11 檢查系統邊框與圓角效果。先前的 Windows 10 初步測試使用較早的內縮算法；目前版本及跨螢幕 DPI 修正仍需在 Windows 10 驗證。
- 隔離 Debug 測試可依 [AI 自動化測試](ai-automated-testing.md) 使用 `tiefsee_measure_webview_bounds`，讀取指定視窗的原生 bounds、DPI、DPR、body 與 `.window` 尺寸及內縮值。診斷 bridge 只在 Debug 且啟用隔離 CDP 時可用。曾觀察 `tiefsee_resize_window` 改變網頁視口、但沒有改變原生窗體尺寸；不要把該結果當作原生視窗逐像素縮放的證據。

## 已知限制與效能

`Math.round(body 尺寸 × DPR) - 原生尺寸` 是目前用來決定補償的觀察指標，並非 Windows 或 WebView2 保證的實際裁切量。尤其當原生控制項超出父視窗、系統邊框覆蓋內容或合成位置發生偏移時，控制項尺寸差可能不足以描述畫面上的裁切。不同 DPI、網頁縮放、Runtime 和顯示設定仍可能有未覆蓋的情況。

非同步 bridge 在原生視窗拖曳期間可能等待 UI 執行緒；80ms 是延後開始查詢的時間，不保證結果在 80ms 內可用。橋接呼叫若一直未完成，不會觸發拒絕後的重試；等待及失敗時維持暫定保守內縮，因而可能增加 Aero 外露或造成內縮跳動。圓角模式的 DPI 特例使用最後一次成功取得且資料一致的 DPI；跨螢幕後若查詢尚未完成或失敗，可能暫時沿用舊的特例狀態。最大化不受 CSS 內縮變數影響；該保守值與 client 邊界計算均未證明足以涵蓋 DWM 合成裁切。
