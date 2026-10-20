# Tiefsee AI 自動化測試

## 唯一標準方案

使用專案內的 `tiefsee-webview` MCP server，透過 CDP 對 Debug WebView2 視窗送出真實滑鼠、滾輪及鍵盤輸入。工具依 Tiefsee 的 `windowId` 指定視窗，因此同時開多個視窗時不依賴分頁順序、桌面焦點或全局輸入。DOM 讀取只用來辨識控件和驗證狀態，不用 `element.click()`、DOM 修改或應用程式 API 代替使用者操作。

MCP server 是手寫並隨專案提交的 `Tests/WebView2TestAutomation/CdpTest.mjs`，不依賴 npm，也不提供任意 JavaScript 執行工具。只需為 AI 客戶端註冊一次；MCP 可在 Tiefsee 尚未啟動時保持連線，之後啟動、關閉或重啟測試程式都不必重啟 AI 客戶端。若客戶端尚未載入新註冊的 MCP，重新載入／重啟客戶端是設定步驟，不是每輪測試步驟。

`Tests/WebView2TestAutomation` 是隨專案提交的測試基礎設施，不是產品執行相依。`CdpTest.mjs` 提供多視窗定向、DOM 檢查與 CDP 輸入；`Start-DebugWithCdp.ps1` 啟動隔離的 Debug apphost，並可傳入圖片路徑。

## 一次性設定 MCP

在專案根目錄執行：

```powershell
$node = (Get-Command node.exe).Source
$mcpServer = (Resolve-Path .\Tests\WebView2TestAutomation\CdpTest.mjs).Path
codex mcp add tiefsee-webview -- $node $mcpServer mcp
codex mcp list
```

讓 Codex 載入新 MCP 設定一次。其他支援 MCP stdio 的 AI 客戶端也可設定為執行同一個 Node 命令，參數是此檔案的絕對路徑及 `mcp`。此 server 僅提供 Tiefsee 測試操作，不需要 Playwright、Chrome DevTools MCP、npm 套件或桌面控制權限。

## 每輪測試流程

1. **清掉 Tiefsee 執行個體。** 依專案測試規則，建置前強制關閉使用者和前一輪留下的 Tiefsee 視窗，避免 `Output/Tiefsee.exe` 鎖定，也避免快速啟動將命令轉送到舊視窗。只關閉 Tiefsee，不要用 `Stop-Process -Name dotnet` 關閉不相關程序：

   ```powershell
   Get-Process Tiefsee -ErrorAction SilentlyContinue | Stop-Process -Force
   ```

2. **建置 Debug 版：**

   ```powershell
   dotnet build Tiefsee/Tiefsee.csproj --no-restore -p:UseAppHost=true
   ```

3. **啟動隔離的測試版：**

   ```powershell
   ./Tests/WebView2TestAutomation/Start-DebugWithCdp.ps1 "C:\path\to\test-image.jpg"
   ```

   建置時產生的 Debug apphost 讓程式能以 `Tiefsee.exe` 重新啟動自己，因而可測試 UI 的「另開視窗」等功能。可再次執行此啟動器，透過快速啟動向同一測試執行個體開新視窗。測試版設定 `TIEFSEE_ENABLE_TEST_CDP=1`，並使用 `Tiefsee/bin/Debug/WebView2TestProfile`；一般設定和使用者 WebView2 資料不會共用。Release 和一般啟動不開啟測試 CDP，也不得停用 WebView2 沙箱。

4. **使用 `tiefsee-webview` 工具操作與驗證。** 每次先呼叫 `tiefsee_pages`，將唯一 `windowId` 與預期檔案／視窗配對。工具會在每次呼叫時重新讀取動態 CDP port 和目前頁面，因此測試程式重啟後不需重啟 MCP。開關視窗後重新列舉頁面。若輸入工具回報錯誤，停止後續輸入、重新列舉頁面並確認目標，避免錯送到另一視窗。

5. **清理測試程序。** 結束本輪 Debug 測試視窗／程序；不需要停止或重啟 MCP server。測試結果記錄操作和可觀察結果，並列明未驗證項目。

若測試程序啟動時回報 Tiefsee localhost server 無法啟動，表示執行環境禁止本機 listener；在允許 localhost listener 的執行環境啟動 Debug 測試版。不要停用 WebView2 沙箱，也不要把 CDP 暴露到 localhost 以外。

## MCP 工具

所有操作工具都必須指定 `windowId`；座標使用該視窗 viewport 的 CSS pixels。

| 工具 | 用途 |
| --- | --- |
| `tiefsee_pages` | 列出頁面及 `windowId`、啟動檔案等識別資訊；`windowId: null` 是未初始化預載頁 |
| `tiefsee_state` | 讀取指定視窗標題、檔案參數與頁面文字 |
| `tiefsee_snapshot` | 讀取互動 DOM、文字和元素座標，供 AI 選擇控件 |
| `tiefsee_inspect` | 依 CSS selector 檢查元素、可見性、值與座標 |
| `tiefsee_click` | 只在 selector 唯一且可見時，送出真實 CDP 滑鼠點擊；`button` 可指定 `left`、`right` 或 `middle`；`includeSnapshot: true` 可在同一回覆取得點擊後狀態 |
| `tiefsee_click_at` | 依截圖上的 viewport CSS 座標送出真實 CDP 滑鼠點擊；座標超出視窗時會拒絕 |
| `tiefsee_click_text` | 依唯一可見的精確文字定位互動項目並送出真實 CDP 左鍵點擊；適合快照能看到選單文字、但沒有 selector 的情況；可用 `includeSnapshot: true` 合併操作後驗證 |
| `tiefsee_press` | 送出按鍵／快捷鍵，例如 `Ctrl+C`、`Ctrl+V`、`F2`、`Escape` |
| `tiefsee_type` | 對目前焦點送出文字輸入；先用點擊或鍵盤聚焦 |
| `tiefsee_move`、`tiefsee_wheel`、`tiefsee_drag` | 送出指定視窗內的滑鼠移動、滾輪或拖曳 |
| `tiefsee_wait` | 輪詢 selector 可見狀態或文字，避免猜固定等待時間 |
| `tiefsee_screenshot` | 擷取指定 WebView 畫面；供像素呈現、旋轉、裁切等視覺結果檢查 |

優先使用範圍明確的 `tiefsee_inspect`，避免每一步都讀完整快照。新畫面、視覺排列、圖片渲染或難以從 DOM 判斷的控件，先用 `tiefsee_screenshot` 看畫面，再用 `tiefsee_click_at` 點選；截圖座標是 viewport CSS pixels。已知且唯一的 selector 則用 `tiefsee_click`。兩者都會送出 CDP 滑鼠事件，不呼叫 DOM click。用 `tiefsee_inspect` 或畫面確認操作結果；只在需要更多上下文時讀完整快照。原生檔案對話框和外部瀏覽器不是 WebView DOM，不在這個 MCP 的操作範圍內。

## 最低驗收

- 同時打開兩個不同圖片視窗，`tiefsee_pages` 回報兩個不同 `windowId`，且各自對應正確檔案。
- 透過指定其中一個 `windowId` 執行輸入並驗證結果；另一個視窗狀態維持不變。
- 關閉／重開一個測試視窗後重新列頁，剩餘視窗仍可識別及操作。
- 保持 MCP server 程序不變，重啟 Debug Tiefsee 後再次列頁及操作成功，證明動態 port 重連有效。
- 啟動時沒有 Tiefsee 時，MCP server 仍能完成 MCP 握手與列出工具；Tiefsee 尚未啟動時呼叫 `tiefsee_pages` 應清楚回報 CDP 未就緒，而不是連到舊 port 或另一個應用程式。

## 安全界線

- CDP 只由明確啟用的 Debug 測試版提供，綁定 localhost，並使用隔離的測試資料目錄。
- MCP 只接受預先定義且有參數 schema 的視窗讀取和輸入操作。不得加入任意 JavaScript 執行工具；DOM evaluate 僅包含工具內固定的唯讀辨識程式或輸入座標查詢。
- 建置前關閉所有 Tiefsee 執行個體；不得讓舊測試程序與新測試程序共用輸出檔或測試 WebView2 資料目錄。
