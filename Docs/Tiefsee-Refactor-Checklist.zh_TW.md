# Tiefsee 重構實作順序清單

## 原則

- 先拆責任，再搬檔案
- 先建立新骨架，再逐步搬舊碼
- 每一階段都要保持可編譯
- 不一次全面改名，避免 diff 過大

## Phase 1：先定新骨架

目標：

- 建立未來使用的新資料夾結構
- 決定新命名規則

要做的事：

1. 新增 `App`、`Features`、`Infrastructure`、`Contracts` 資料夾
2. 決定 `WV_*` 的新名稱，統一改成 `*WebViewBridge`
3. 決定 HTTP API 路徑命名規則，停止新增舊風格路徑
4. 建立 `AppBootstrapper` 或 `ServiceRegistry` 當組裝入口

完成標準：

- 新增功能時，已經知道應該放去哪一層

## Phase 2：先拆 `Server`

目標：

- 讓 `WebServerController` 不再繼續膨脹

要做的事：

1. 保留 `WebServerController` 當暫時入口
2. 新增：
   - `ImageHttpEndpoints`
   - `DirectoryHttpEndpoints`
   - `FileHttpEndpoints`
   - `WindowHttpEndpoints`
   - `SystemHttpEndpoints`
3. 把 route 註冊與 handler 逐批搬出去
4. 新 API 直接用新命名，不再沿用 `getXxx`、`xxx2`

完成標準：

- `WebServerController` 只剩組裝與註冊

## Phase 3：重命名並瘦身 `VW`

目標：

- `VW` 只保留 WebView2 對外橋接責任

要做的事：

1. 將 `WV_*` 重新命名為 `*WebViewBridge`
2. 將 `VW` 目錄淘汰，改放進各自 `Features/*/WebView`
3. 把 bridge 內直接寫死的處理邏輯抽到 service
4. `WebWindow.AddHostObjectToScript` 改掛新 bridge 類別

完成標準：

- bridge class 大多只有薄薄一層參數轉接

## Phase 4：先處理高價值 `Lib`

目標：

- 優先解掉最痛的 `static` 類別

要做的事：

1. 先拆 `ImgLib`（已完成）
2. 再處理：
   - `FileWatcher`（已完成）
   - `IniManager`（已完成）
   - `SQLite`（已完成，搬移到 `Infrastructure/Vendor`）
   - `LibAPNG`（已完成，搬移到 `Infrastructure/Vendor`）
   - `A1111Manager`（已完成）
3. 把需要設定、初始化、資源管理的 class 改成 instance service
4. 真正無狀態的 helper 才保留 `static`

完成標準：

- 需要設定的功能都有建構式與固定初始化入口

## Phase 5：整理 API 與前端呼叫

目標：

- 前後端使用一致命名

要做的事：

1. 前端逐步改呼叫新 API 路徑
2. 必要時短暫保留舊路徑 wrapper
3. 確認 WebView bridge 與 HTTP API 沒有重複邏輯
4. 最後刪除舊命名與兼容碼

完成標準：

- 專案內不再新增或依賴舊式 API 命名

## 建議實際開工順序

1. 建 `AppBootstrapper` / `ServiceRegistry`
2. 拆 `WebServerController`
3. 改 `WV_*` 命名與位置
4. 抽出 `Image` 相關 service
5. 處理其餘高風險 `Lib`
6. 最後統一 API 路徑與前端呼叫

## 暫時不要做的事

- 不要一次把所有 `Lib` 全搬完
- 不要一開始就導入完整 DI 框架
- 不要同時大規模改資料夾、類名、API、前端呼叫
- 不要把超大 `static` class 直接原封不動改成超大 instance class

## 第一波建議範圍

如果只做第一波，建議只包含：

1. `Server` 拆模組
2. `VW` 改名與瘦身
3. `ImgLib` 拆成 service

這三件做完，後面的重構就會容易很多。

## 剩餘 `Lib` 建議處理順序

下面順序是依照目前 `Tiefsee/Lib` 剩餘檔案的使用範圍、相依關係、搬移風險來排，目標是先消掉容易分類的檔案，再處理牽涉較多交叉依賴的檔案。

### 第 1 批：先搬可直接歸位的檔案

1. `KnownFolders.cs`（已完成，搬移到 `Infrastructure/Windows`）
   放到 `Infrastructure` 或 `Features/SystemIntegration/Application` 附近都合理，責任單純、呼叫點少，幾乎是最低風險搬移。
2. `LnkToExe.cs`（已完成，搬移到 `Infrastructure/Windows`）
   目前只服務捷徑解析，建議往 `Features/SystemIntegration/Application` 或 `Infrastructure` 收斂，和 `ShortcutService` 對齊。
3. `ShellLink.cs`（已完成，搬移到 `Infrastructure/Windows`）
   與捷徑建立直接相關，建議跟 `ShortcutService` 放在同一區域，先和 `LnkToExe.cs` 一起整理。
4. `DataObjectUtilities.cs`（已完成，搬移到 `Features/File/Application`）
   目前只給拖放流程使用，適合搬到 `Features/File/Application`。
5. `FileSort.cs`（已完成，搬移到 `Features/Directory/Application`）
   已經主要被目錄排序與系統 bridge 使用，建議搬到 `Features/File` 或 `Features/Directory/Application`，後續再看是否要包成 service。

### 第 2 批：再處理功能型核心 helper

6. `FileLib.cs`（已完成，拆成 `FileItemHelper`、`FileTypeHelper`、`FileInfo2`）
   原本使用點很多，且跨 `File` 與 `Image`，因此先拆出檔案資訊、檔案型別、回傳模型三個明顯責任，再處理後續相依。
7. `Exif.cs`（已完成，改名並搬移為 `FileMetadataService`、`FileMetadataResult`、`FileMetadataItem` 到 `Features/File`）
   原本名稱偏向圖片 Exif，但實際責任已涵蓋通用檔案中繼資料與前端回傳模型，因此改名後收斂到 `Features/File/Application` 與 `Features/File/Contracts` 較合適。
8. `ImgFrames.cs`（已完成，搬移到 `Features/Image/Application`）
   這個類別主要負責圖片影格與動畫資訊處理，搬到 `Features/Image/Application` 後，與 `ImageHttpEndpoints`、`FileMetadataService` 的依賴關係也比較清楚。
9. `WindowsThumbnailProvider.cs`（已完成，搬移到 `Infrastructure/Vendor`）
   這個檔案屬於第三方函式庫，因此只搬移到 `Infrastructure/Vendor`，不調整 class 名稱、命名空間或內部實作。
10. `ClipboardLib.cs`（已完成，改名並搬移為 `ClipboardHelper`，`ClipboardContent` 抽到 `Contracts`）
    這個類別主要處理系統剪貼簿讀寫與格式轉換，因此搬到 `Features/SystemIntegration/Application` 較合適；同時移除沒有實質價值的 `ClipboardService`，讓 `SystemHttpEndpoints` 與 `SystemWebViewBridge` 直接使用 `ClipboardHelper`。

### 第 3 批：最後處理跨層 / UI / 近似外部來源碼

11. `WindowAPI.cs`
    屬於視窗與 Win32 操作，應該往 `Features/Window` 或 `Infrastructure`，但牽涉 `WebWindow` 靜態呼叫，建議晚一點整理。
12. `ShellContextMenu.cs`（已完成，搬移到 `Infrastructure/Vendor`）
    這個檔案屬於第三方函式庫，因此直接搬到 `Infrastructure/Vendor`，不調整 class 名稱、命名空間或內部實作。
13. `RJDropdownMenu.cs`（已完成，搬移到 `Features/Window` 相關位置）
    這是 WinForms UI 元件，且目前只有 `StartWindow` 使用，因此只做位置整理，收斂到 `Features/Window` 底下，不另外抽成共用 service 或 helper。
14. `JsonExtensions.cs`
    目前幾乎沒有實際使用點，先確認是否仍需要保留，再決定要搬到共用工具區還是直接刪除。
15. `LRUCache.cs`
    這是共用基礎結構，但目前主要被 `Exif` / `FileLib` 吃到；等前面真正用到它的檔案整理完，再決定是留成共用 utility，還是移到 `Infrastructure`。

## 補充原則

- 如果是明確只服務單一 feature 的 helper，就優先搬到該 feature 底下，不必硬留在共用層。
- 如果是 Win32 / Shell / COM / OS 整合，優先考慮 `Infrastructure`，不要塞回 `Features`。
- 如果看起來接近第三方或外部來源碼，先評估是否該進 `Infrastructure/Vendor`，不要為了統一命名而硬改 class 名稱。
- `FileLib`、`Exif`、`ImgFrames` 這三個彼此有依賴，最好當成同一段工作規劃，不要完全拆散。
