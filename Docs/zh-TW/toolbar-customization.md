# 工具列自訂維護說明

本文說明 Tiefsee 工具列自訂功能的設定模型、版本更新行為，以及新增或移除項目時必須同步修改的位置。這是實作維護文件；自訂介面設計過程與已完成的驗收清單不在本文範圍。

## 實作位置

- `Www/ts/Config.ts` 定義工具列設定型別、各類型預設排列，以及 `restoreToolbarCustomization` 載入和整理使用者設定。
- `Www/ts/MainWindow/MainToolbar.ts` 建立按鈕與資訊欄位的目錄（`_ar`），並依設定把 DOM 項目放進標題列或主工具列。
- `Www/ts/SettingWindow/SettingWindow.ts` 顯示可用項目、處理拖放、儲存順序及重設單一類型。
- `Www/ts/MainWindow/FileShow.ts` 更新縮放比例、圖片尺寸、檔案類型與大小、修改日期等動態資訊。
- `Www/ejs/MainWindow/MainWindow.ejs` 提供標題列固定視窗控制項和自訂項目的掛載根節點。
- `Www/gulpfile.js` 合併 `Www/img/fluent` 與 `Www/img/fluent-overrides`，產生 `SvgList.js`；同名 override 會覆蓋 Fluent 原圖示。

## 設定模型

設定儲存在 `settings.toolbarCustomization`。目前有五個互相獨立的類型：`img`、`pdf`、`txt`、`bulkView`、`welcome`。影片沿用 `img` 配置，毋須增加 `video` 類型。

每個類型包含：

- `customized`：此類型是否已有使用者排列需要保留。
- `titlebar.left`、`titlebar.right`：標題列兩側的自訂項目。
- `toolbar.left`、`toolbar.center`、`toolbar.right`：主工具列三區的項目。
- `available`：尚未放置項目的有序清單。

項目型別如下：

| 位置 | 項目格式 | 說明 |
| --- | --- | --- |
| 已放置 | `{ "type": "button", "name": "showSetting" }` | 一般操作按鈕，`name` 對應 `MainToolbar.ts` 的按鈕目錄。 |
| 已放置 | `{ "type": "info", "name": "infoSize" }` | 動態資訊欄位。 |
| 已放置 | `{ "type": "separator", "id": "img-info-size" }` | 可重複的分隔線實例。 |
| 已放置 | `{ "type": "spacer", "id": "custom-..." }` | 可重複的空白實例。 |
| 可用清單 | `{ "type": "separatorTemplate" }`、`{ "type": "spacerTemplate" }` | 範本，不代表已放置的實例。 |

固定的最小化、最大化／還原、結束全螢幕及關閉控制項不屬於此設定。頁面返回按鈕則是一般 `button` 項目。

## `customized` 與版本更新

`customized` 是版本升級時區分「採用預設排列」和「保留使用者排列」的依據，不只是介面狀態：

- 缺少該類型設定、`customized` 不為 `true`，或資料形狀無效時，`restoreToolbarCustomization` 會以目前版本的預設配置取代該類型設定。預設排列日後更新時，這些使用者會自動採用新版排列。
- 使用者實際改動排列後，設定頁會將該類型標為 `customized: true`。之後載入時保留其位置與可用清單順序，不自動搬動既有項目。
- 載入已自訂的排列時，程式會比對目前版本的預設項目。使用者設定中完全沒有的新按鈕或資訊欄位會加到該類型 `available` 清單末端；即使它在新版預設排列中已放置，也不會覆蓋使用者原有位置。
- 各類型分別判斷，因此只自訂圖片工具列不會阻止 PDF 或其他類型採用新版預設。
- 「重設目前工具列」將所選類型換成目前版本預設並清除自訂狀態。一般設定存檔後，後續啟動仍會依最新預設還原。

因此，新增預設按鈕時應更新 `Config.ts` 中所有適用類型的預設配置。新版預設使用者會看到新版排列；已自訂使用者則會在可用項目中找到新項目，並自行決定是否加入。

## 新增工具列項目

新增一般按鈕或資訊欄位時，請按以下順序檢查：

1. 在 `MainToolbar.ts` 為每個適用類型建立項目定義。`group`、`name`、圖示、i18n key 與動作處理器必須一致；資訊欄位以 `type: "html"` 建立，但設定資料使用 `type: "info"`。
2. 在 `Config.ts` 將該 `name` 恰好放進每個適用類型的預設排列或 `available`。這份預設資料也是已自訂設定升級時的項目目錄；若項目沒有出現在其中，升級流程不會把它補到使用者清單。
3. 若資訊是動態內容，更新 `FileShow.ts` 對應的查找與內容更新邏輯。標題列需保留單行格式，並在 `MainToolbar.applyCustomization` 重套排列時能還原一般工具列格式。
4. 若使用新 SVG，將資產放在 `Www/img/fluent`；只有需要替換同名 Fluent 圖示時才放進 `Www/img/fluent-overrides`。EJS 直接使用圖示時呼叫 `readSvg("name.svg")`；TypeScript 使用的名稱必須與產生的 `SvgList` key 相同。
5. 刪除、改名或改變適用類型前，檢查使用者已自訂的設定。載入整理目前會檢查資料形狀、移除重複放置項目並補入缺少的新項目，但不會依按鈕目錄剔除已過時的 `name`。無法解析的舊項目不會呈現在設定頁或主工具列；若要正式移除項目，需一併設計清除或轉換舊設定的處理。

新增分隔線或空白範本時，須保留範本型別與實例型別的區別。每個已放置實例都需要唯一 `id`；執行時 DOM 以類型和 ID 找回實例，避免跨類型或同類項目互相覆蓋。

## 載入與相容性注意事項

主視窗與設定視窗都會先對設定做 jQuery 深層合併，再呼叫 `restoreToolbarCustomization`。jQuery 會按索引合併陣列，因此工具列設定不能只依賴深層合併結果；還原函式會直接使用原始使用者設定中的 `toolbarCustomization`，並依 `customized` 決定採用預設或使用者資料。

舊版 `mainToolbar` 與 `layout.mainToolbarAlign` 不再控制工具列；不需將舊排列轉換成新結構。新設定缺失時使用目前版本預設。不要重新使用舊 `mainToolbar` 名稱作為新結構的根鍵。

已自訂設定至少需要包含兩個標題列陣列、三個工具列陣列和 `available` 陣列，且各項目需符合型別。形狀不完整時該類型回退至預設。整理會限制普通按鈕／資訊欄位只出現一次，並限制同類型特殊項目的重複 ID；新增或調整特殊項目 ID 規則時，也要確認與執行時 DOM key 的組成方式一致。

## 維護驗證

修改此功能後，依變更內容確認：

- `customized: false` 的舊設定在新版載入目前預設排列。
- `customized: true` 的舊設定保留位置，新加入的預設項目出現在可用清單且未重複。
- 已自訂項目在標題列、工具列各區與可用清單之間移動後，存檔並重新開啟仍維持正確位置與順序。
- 重設單一類型不會改動其他類型；影片仍使用圖片配置。
- 資訊欄位在檔案切換、類型切換及排列重套後仍顯示最新內容。

需要進行 UI 驗收時，依 `Docs/zh-TW/ai-automated-testing.md` 使用專案的 `tiefsee-webview` MCP 或同一份 `CdpTest.mjs` dispatcher，透過 CDP 輸入事件操作；不要用 DOM 點擊或程式碼代替使用者拖放。
