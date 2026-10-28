# AI 開發與測試

## 開發前

- 閱讀本檔、`Docs/zh-TW/ai-automated-testing.md` 與相關程式碼，檢查 Git 變更；保留與本任務無關的修改。
- 新增一般文件時，依語言放入 `Docs/en` 或 `Docs/zh-TW`，檔名採全小寫 kebab-case，不加語言後綴；根目錄 README 與本檔除外。
- 新增或移動 C# 類別、調整專案分層時，先閱讀 `Docs/zh-TW/csharp-architecture-conventions.md`，依責任判斷放置位置。

## TypeScript 型別檢查

- 修改 `Www/ts` 下的 TypeScript 後，從 `Www` 目錄執行 `.\node_modules\.bin\tsc.cmd --noEmit --pretty false`，依 `tsconfig.json` 對整個前端專案進行型別檢查；修正檢查發現的錯誤後再回報結果。
- Gulp 的 `ts` 任務使用 esbuild 打包，不會執行 TypeScript 型別檢查；Gulp 建置成功不能取代上述檢查。`--noEmit` 不會輸出編譯檔。

## Tiefsee UI 整合測試

- 依 `Docs/zh-TW/ai-automated-testing.md` 使用 `tiefsee-webview` MCP；若 MCP 未載入、工具 schema 缺少 `clickCount`，或多行 inline 點擊仍使用外框中心，改用 `CdpTest.mjs call <toolName> <jsonArgs>` 呼叫目前工作樹中的同一份 dispatcher。無須重啟 Codex 或 Debug Tiefsee，也不另建 CDP 腳本。此測試資料夾需隨專案提交。
- 每輪建置前強制關閉所有 Tiefsee 執行個體，然後建置 Debug 並以 `Start-DebugWithCdp.ps1` 啟動隔離測試版。不得用 `Stop-Process -Name dotnet` 關閉不相關程序。
- 用 `tiefsee_pages` 依 `windowId` 選取多視窗目標。操作工具都需指定 `windowId`；開關視窗後重新列舉。操作失敗時停止後續輸入，先確認頁面映射。
- MCP 工具用 DOM 讀取辨識和驗證，並以 CDP 輸入事件操作 UI。不得用 JavaScript、`element.click()`、DOM 修改或應用程式 API 冒充使用者操作；禁止用桌面截圖定位一般按鈕或接管全局滑鼠鍵盤。
- 有明確需求的效能量測可擴充專案內 dispatcher，使用用途固定、可審查的量測程式，包括讀取 API 與建立離畫面 Canvas／WebGL；不可提供任意程式碼執行介面或影響使用者資料。記錄測試範圍、快取和限制，勿將微基準視為真實 UI 操作或完整顯示時間。
- 只有視覺渲染結果需要 screenshot 確認。原生對話框和外部瀏覽器不屬於 WebView MCP 範圍。
- Debug 測試 CDP 綁定 localhost 且使用隔離資料目錄；Release 和一般啟動不得啟用。不得停用 WebView2 安全沙箱。
- 若 Codex 沙箱內啟動 Debug Tiefsee 未建立 `DevToolsActivePort`／localhost CDP，依 `Docs/zh-TW/ai-automated-testing.md` 以 `sandbox_permissions: "require_escalated"` 啟動 app 與執行 `CdpTest.mjs call`；只升權 CLI 不會修復已在沙箱內啟動的 app。此為 Codex 執行權限，不需重啟 Codex 或以 Windows 系統管理員執行。
- 測試流程、MCP 設定、工具清單和最低驗收均以 `Docs/zh-TW/ai-automated-testing.md` 為準，不另建臨時 CDP 腳本或平行測試方案。
