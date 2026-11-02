# 收藏功能現況與維護指南

本文記錄收藏功能目前的資料格式、讀寫時機、拖拉判定與錯誤處理。調整行為時，請先核對實際實作，再同步更新本文件。

## 程式位置

- `Www/ts/MainWindow/Favorites.ts`：面板、表單、項目操作、拖拉判定、JSON 前端驗證與圖示載入。
- `Www/scss/MainWindow/_Favorites.scss`：面板、卡片、收藏資料夾及拖拉狀態樣式。
- `Www/ts/d/NetAPI.d.ts`：`WV_Favorites` WebView bridge 型別。
- `Tiefsee/Features/Favorites/WebView/FavoritesWebViewBridge.cs`：將前端呼叫轉送至儲存服務及檔案選擇器。
- `Tiefsee/Features/Favorites/Application/FavoritesStoreService.cs`：AppData JSON 讀寫、資料驗證與路徑正規化。
- `Tiefsee/Features/Favorites/Contracts/FavoritesDocument.cs`：JSON 文件與項目模型。

## 資料模型

收藏存放在執行期解析出的 AppData `Favorites.json`，與 `Setting.json` 分開。文件版本為 1；JSON 陣列的順序就是顯示順序。

```json
{
  "version": 1,
  "items": [
    { "id": "10碼識別碼", "type": "file", "name": "", "path": "D:\\Images\\a.jpg" },
    { "id": "另一個識別碼", "type": "directory", "name": "", "path": "D:\\Images", "loadContent": "firstFile" },
    {
      "id": "群組識別碼", "type": "group", "name": "資料夾", "path": "",
      "items": [
        { "id": "子項目識別碼", "type": "file", "name": "", "path": "D:\\Images\\b.jpg" }
      ]
    }
  ]
}
```

- `file` 與 `directory` 是磁碟上的收藏目標；`group` 是收藏項目群組，最多一層，只能放檔案或資料夾項目。
- 識別碼用於拖拉、編輯與移除時穩定指向項目；重複路徑允許，重複識別碼不允許。
- 只有 `directory` 使用 `loadContent`：`firstFile` 是預設，`firstDirectory` 會依 Tiefsee 現有資料夾排序取第一個子資料夾。
- 空白自訂名稱由路徑檔名／資料夾名顯示。群組新建名稱為「資料夾」，可有同名群組。

## 讀取、儲存與錯誤處理

1. 每次打開收藏面板時，前端重新呼叫 `WV_Favorites.ReadJson()`；快速新增也先重新讀取，避免直接沿用較舊的面板資料。沒有 `Favorites.json` 時，C# 回傳空的 v1 文件，不因此建立檔案。
2. 前端解析文件並檢查版本、欄位型別、識別碼唯一性、項目類型與群組層級。只有 0 或 1 個子項目的群組會在前端載入時攤平；損壞或不支援的資料會顯示讀取錯誤，不繼續操作。
3. 新增、編輯、改名、移除、排序、建組及移入／移出群組時呼叫 `SaveJson()`。寫入失敗時顯示錯誤，不回滾目前畫面；未保存的變更可能在重新開啟面板時消失。
4. C# 儲存端再次驗證文件版本、識別碼、類型、路徑與群組層級；用 `Path.GetFullPath` 正規化路徑。寫入同目錄暫存檔，再以覆寫移動替換正式 JSON，並在結束時清理暫存檔。
5. `SemaphoreSlim` 只序列化同一個 Tiefsee 程序內的讀寫。多視窗同時編輯不做即時同步或跨程序鎖定；即使先前的儲存已成功，不同視窗最後寫入者仍可能覆蓋較早的變更，造成收藏遺失。每次開啟面板重新讀取是目前採用的同步邊界。

點擊收藏項目時才呼叫 `Exists(type, path)` 檢查目標本身，不在面板打開時逐項檢查路徑。回傳 `false` 代表目標不存在，詢問是否移除；使用者選否或關閉對話框時保留項目。API 例外顯示 `msg.fileReadFailed`，不當成不存在。目標存在後沿用 Tiefsee 開啟流程；`firstDirectory` 會呼叫 `WebAPI.Directory.getDirectories()` 並以 `MainWindow.dirSort.sortPaths()` 排序。若讀取子資料夾失敗或沒有符合的子資料夾，回到原資料夾開啟流程。

## 拖拉判定

拖拉由 `Favorites.ts` 的 Pointer Events 自行處理，沒有使用 SortableJS。拖曳開始後，原卡片由固定尺寸 placeholder 取代，複製卡片跟著指標移動；放開時才修改資料模型並儲存。

### 開始拖曳與觸控捲動

- 滑鼠移動超過起點 6 CSS px 才開始拖曳。
- 觸控按住 450 ms 才開始拖曳；在此之前移動達 8 CSS px 就視為捲動，取消長按計時並直接捲動該清單。
- 觸控排序因此需要停留，避免項目很多時一碰卡片就無法捲動。

### 指標位置的意圖分類

- 主收藏清單內，拖到一般卡片中央區域（水平內縮各 20%；垂直自上方 18% 到下方 34%）會建立收藏資料夾；拖到既有資料夾會移入。這兩種操作直接生效，沒有懸停延遲。
- 卡片邊緣是排序區。依卡片目前實際換行後的列，按水平中線判定插入前／後格位，處理 `ABCD` 換行成 `EFG` 等情況。
- 清單尾端空白也代表移到最後：最後一張卡片右側同列空間，或最後一列下方的清單區域，都定位在尾端。
- 開啟收藏資料夾時，主清單項目拖到資料夾浮層或其內容區可移入；收藏資料夾內的項目拖至上層格位則移出。
- 排序候選需在同一插入意圖停留 320 ms 才移動 placeholder；placeholder 移動後以 220 ms 位移動畫呈現。建立及移入資料夾不等待這個排序計時。
- 從資料夾拖出的項目若在資料夾外放開，卻沒有有效上層排序位置，一律追加到主收藏清單最後。群組只剩一項時解散，剩下的項目接替群組原本的位置；空群組移除。

## 收藏資料夾、名稱與圖示

- 收藏群組開啟為獨立浮層；標題是可編輯輸入框，失去焦點時儲存，Enter 確認，Escape 還原原名稱。主清單的群組名稱也可雙擊後直接編輯。
- 群組預覽最多呈現四個子項目的圖示。
- 單項圖示透過 `WebAPI.Img.fileIcon()` 非同步取得，IntersectionObserver 進入可視範圍才送出請求；請求共用 `MainWindow.imageRequestLimiter`。取得失敗時用 `SvgList` 插入本機錯誤檔案／資料夾 SVG。
- 收藏項目選單提供開新視窗、編輯或移除；資料夾群組只提供移除。主選單新增入口支援目前檔案、目前資料夾與自訂項目；右鍵快速收藏不開編輯表單，成功後顯示 toast。
