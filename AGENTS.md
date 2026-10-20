# AI 開發與測試

## 開發前

- 閱讀本檔、`Docs/zh-TW/ai-automated-testing.md` 與相關程式碼，檢查 Git 變更；保留與本任務無關的修改。
- 新增一般文件時，依語言放入 `Docs/en` 或 `Docs/zh-TW`，檔名採全小寫 kebab-case，不加語言後綴；根目錄 README 與本檔除外。
- 新增或移動 C# 類別、調整專案分層時，先閱讀 `Docs/zh-TW/csharp-architecture-conventions.md`，依責任判斷放置位置。

## Tiefsee UI 整合測試

- 唯一標準方式是依 `Docs/zh-TW/ai-automated-testing.md` 使用 `tiefsee-webview` MCP。MCP server 為 `Tests/WebView2TestAutomation/CdpTest.mjs`；此測試資料夾需隨專案提交。
- 每輪建置前強制關閉所有 Tiefsee 執行個體，然後建置 Debug 並以 `Start-DebugWithCdp.ps1` 啟動隔離測試版。不得用 `Stop-Process -Name dotnet` 關閉不相關程序。
- 用 `tiefsee_pages` 依 `windowId` 選取多視窗目標。操作工具都需指定 `windowId`；開關視窗後重新列舉。操作失敗時停止後續輸入，先確認頁面映射。
- MCP 工具用 DOM 讀取辨識和驗證，並以 CDP 輸入事件操作 UI。禁止任意 JavaScript 執行、`element.click()`、DOM 修改或應用程式 API 冒充使用者操作；禁止用桌面截圖定位一般按鈕或接管全局滑鼠鍵盤。
- 只有視覺渲染結果需要 screenshot 確認。原生對話框和外部瀏覽器不屬於 WebView MCP 範圍。
- Debug 測試 CDP 綁定 localhost 且使用隔離資料目錄；Release 和一般啟動不得啟用。不得停用 WebView2 安全沙箱。
- 測試流程、MCP 設定、工具清單和最低驗收均以 `Docs/zh-TW/ai-automated-testing.md` 為準，不另建臨時 CDP 腳本或平行測試方案。
