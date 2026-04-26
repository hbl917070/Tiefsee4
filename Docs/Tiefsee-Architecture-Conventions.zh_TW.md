# Tiefsee 架構命名規範

這份文件記錄目前 Tiefsee 重構後採用的資料夾分層與命名規則。重點不是追求形式一致，而是讓檔案位置、類別名稱、責任範圍彼此一致，避免重新回到所有東西都塞在 `Lib` 的狀態。

## 目錄分層

### `App`

放這個專案自己專用的運行核心。

判斷方式：

- 明顯依賴 Tiefsee 的啟動流程、執行模式或共享狀態
- 知道 `Program`、`StartWindow`、`WebWindow`、`ServiceRegistry`、`AppPath` 這類專案核心概念
- 離開 Tiefsee 專案後，通常就失去大部分意義

常見內容：

- 啟動與組裝
- 應用程式層級的協調
- 專案自己的執行期核心狀態

範例：

- `App/Bootstrap/AppBootstrapper.cs`
- `App/Bootstrap/ServiceRegistry.cs`
- `App/Http/AppHttpEndpoints.cs`

### `Program`

`Program` 是應用程式的進入點，性質上屬於 `App`。

不過在 C# / WinForms 專案裡，`Program.cs` 傳統上常直接放在專案根目錄，因此是否搬進 `App` 不需要急著追求一致。

目前可採用的判準是：

- 如果只是維持常見專案習慣，`Program.cs` 留在根目錄是可以接受的
- 如果未來要進一步把啟動層完全收斂，也可以再考慮移到 `App`

也就是說，`Program` 的責任判斷屬於 `App`，但檔案位置暫時留在根目錄並不算錯

### `Features`

放使用者可感知的功能模組。

判斷方式：

- 這個類別明顯屬於某個功能領域
- 它的責任是完成某個功能，而不是提供底層技術能力
- 換到別的功能模組時，不一定自然成立

常見內容：

- `File`
- `Image`
- `Directory`
- `Window`
- `SystemIntegration`

每個 feature 內可再分為：

- `Application`: 功能邏輯、協調、流程
- `Contracts`: 對外資料契約、回傳模型
- `Http`: 本機 HTTP 路由模組
- `WebView`: 提供給 WebView2 的對外 bridge
- `UI`: 專屬於該功能的桌面 UI 元件

### `Infrastructure`

放底層技術能力、外部系統接點、或可相對獨立重用的元件。

判斷方式：

- 比較偏技術實作，不是 Tiefsee 專屬流程
- 換到其他桌面專案，通常仍有機會直接使用
- 主要責任是提供技術能力，不是表達某個功能模組

常見內容：

- Win32 / Shell / OS 整合
- 快取
- 共用 extensions
- vendor code
- 通用設定或檔案格式讀寫元件

範例：

- `Infrastructure/Windows`
- `Infrastructure/Caching`
- `Infrastructure/Extensions`
- `Infrastructure/Vendor`
- `Infrastructure/Web`

## `App`、`Features`、`Infrastructure` 的簡單判斷法

可以先問下面兩個問題：

1. 這個類別是在表達 Tiefsee 自己的運行核心嗎？
如果是，優先考慮 `App`。

2. 如果把這個類別搬去別的 WinForms / WebView2 專案，它還合理嗎？
如果大致仍合理，優先考慮 `Infrastructure`。

若兩者都不是，而是明顯屬於某個功能領域，則放 `Features`。

## 外部來源碼

- 第三方或外部來源碼放在 `Infrastructure/Vendor`
- `Vendor` 內的檔案優先維持原始命名
- 不為了符合專案內部命名規則而硬改類名或命名空間
- 若只是分類位置調整，優先直接搬移，不額外包裝沒有價值的 service
- 只有當外部來源碼已混入明顯的 Tiefsee 專案邏輯時，才再考慮把專案自有部分抽出去

## 類別命名

### `*WebViewBridge`

提供給 WebView2 的對外橋接層一律使用 `*WebViewBridge`。

原則：

- 只保留公開給前端的入口
- 盡量維持薄薄一層參數轉接
- 不直接塞大量業務邏輯

### `*HttpEndpoints`

本機 HTTP 路由模組一律使用 `*HttpEndpoints`。

原則：

- 依功能模組分檔
- 每個 endpoints 類別負責自己的路由註冊與 handler
- 避免再回到單一巨大 controller

### `*Service`

不是所有功能邏輯都一律叫 `Service`。

`Service` 適用於這類情境：

- 需要共享狀態、快取、初始化或生命週期管理
- 是某個功能模組的主要協調入口
- 對外提供的是一組穩定、可被多處依賴的能力

常見例子：

- `FileMetadataService`
- `ImageProcessingService`
- `FileWatcherService`
- 需要共享狀態或全域協調的功能入口

### `*Helper`

`Helper` 適用於這類情境：

- 主要是無狀態工具邏輯
- 偏資料轉換、格式處理、視窗操作、剪貼簿操作這類技術輔助
- 不需要額外的生命週期或共享狀態管理

常見例子：

- `ClipboardHelper`
- `FileTypeHelper`
- `WindowDrag`
- `WindowActivation`
- `IniFileService` 這類如果實際只是技術能力，也應重新評估是否根本不該叫 `Service`

如果一個類別只是技術輔助，不應為了形式統一硬改成 `Service`。

### 其他命名

- 共用 extension class 使用 `*Extensions`
- 第三方原始命名通常保留不動
- Win32 / Shell / OS interop 類別可直接使用能表達用途的名稱，不必硬套 `Service`

## 目前不再新增的命名

- 不再新增 `WV_*`
- 不再新增 `Lib` 類別命名
- 不再新增 `getXxx`、`xxx2` 風格 API 名稱

## HTTP API 命名

- 以功能語意為主，不以歷史命名為主
- 盡量避免 `get`、`set`、`do` 這類泛動詞
- 同模組路徑集中在同一前綴下
- 新 API 應優先對齊目前的 feature 分層

### 範例

- `/api/windows/open`
- `/api/windows/close-all`
- `/api/files/info`
- `/api/files/icon`
- `/api/directories/files`
- `/api/images/thumbnail`
- `/api/images/metadata/exif`

## 補充原則

- 先看責任，再決定位置與命名
- 若只是單純搬移位置，不要順手重寫整個類別
- 真正無狀態的工具邏輯，保留 helper / extension 反而比硬包成 service 更清楚
- 只有當共享狀態、初始化、資源控管真的存在時，才使用 `Service`
