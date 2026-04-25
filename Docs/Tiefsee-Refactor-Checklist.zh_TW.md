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
   - `SQLite`
   - `A1111Manager`
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
