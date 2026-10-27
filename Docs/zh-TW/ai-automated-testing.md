# Tiefsee AI 自動化測試

## 測試方式

使用專案內的 `tiefsee-webview` MCP server，透過 CDP 對 Debug WebView2 視窗送出真實滑鼠、滾輪及鍵盤輸入。工具依 Tiefsee 的 `windowId` 指定視窗，因此同時開多個視窗時不依賴分頁順序、桌面焦點或全局輸入。DOM 讀取只用來辨識控件和驗證狀態，不用 `element.click()`、DOM 修改或應用程式 API 代替使用者操作。

## 執行環境需求

- Node.js 22.4 或更新版本；`CdpTest.mjs` 使用 Node.js 全域 `WebSocket`，不需安裝 npm 套件。
- PowerShell 7.2 或更新版本；啟動器使用 `ProcessStartInfo.ArgumentList` 和 `Environment`。Windows PowerShell 5.1 不支援此啟動器。
- 建置 Debug apphost 另需已安裝可建置本專案的 .NET SDK 與 Windows SDK。

執行 `node --version` 和 `$PSVersionTable.PSVersion` 確認版本。所有 PowerShell 範例都從 repo 根目錄執行。

主要方式是使用 MCP server `tiefsee-webview`。`Tests/WebView2TestAutomation/CdpTest.mjs` 同時提供命令列入口。若工作階段沒有載入 MCP，或 MCP 工具 schema 缺少 `clickCount`、多行文字點擊仍回報整個外框的中心座標，改用 `call` 子命令；它每次直接讀取目前工作樹中的同一份 dispatcher，不必重啟 Codex／MCP，也不必另建 CDP 腳本。已載入的 MCP server 可能仍執行舊版程式，因此修改 `CdpTest.mjs` 不會自動更新既有 server。兩種入口都只提供預先定義的 Tiefsee 測試操作，不提供任意 JavaScript 執行工具。

`Tests/WebView2TestAutomation` 是隨專案提交的測試基礎設施，不是產品執行相依。`CdpTest.mjs` 提供多視窗定向、DOM 檢查與 CDP 輸入；`Start-DebugWithCdp.ps1` 啟動隔離的 Debug apphost，並可傳入圖片路徑。

MCP server 會在同一個 AI 工作階段中重用仍有效的本機 CDP WebSocket，並在每次操作時重新讀取目前的 DevTools port 和頁面清單，再依 `windowId` 確認目標。視窗關閉或 WebView2 連線中斷後，舊連線會移除並於下次操作重新建立。`CdpTest.mjs call` 是一次性 CLI 呼叫，每次命令結束就會關閉連線；連續操作時優先使用 MCP，避免每個命令都重新建立 Node 程序與 WebSocket。

## 一次性設定 MCP

在專案根目錄執行：

```powershell
$node = (Get-Command node.exe).Source
$mcpServer = (Resolve-Path .\Tests\WebView2TestAutomation\CdpTest.mjs).Path
codex mcp add tiefsee-webview -- $node $mcpServer mcp
codex mcp list
```

其他支援 MCP stdio 的 AI 客戶端也可設定為執行同一個 Node 命令，參數是此檔案的絕對路徑及 `mcp`。若目前工作階段沒有 MCP 工具，依下節使用 CLI 入口即可繼續。此工具不需要 Playwright、Chrome DevTools MCP、npm 套件或桌面控制權限。

### MCP 工具未載入或版本不一致時

`call` 直接呼叫 MCP server 使用的同一個工具 dispatcher，工具名稱與參數 schema 不變：

```powershell
node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_pages '{}'
node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_snapshot '{"windowId":"<windowId>"}'
node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_inspect '{"windowId":"<windowId>","selector":".toolbar-btn"}'
node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_click '{"windowId":"<windowId>","selector":".toolbar-btn"}'
```

PowerShell 的 JSON 參數使用單引號包住。每次操作都必須指定 `windowId`；點擊由工具檢查 selector 唯一且可見後送出 CDP 滑鼠事件。多行 inline 文字以實際排版片段定位，並拒絕點擊可視區外的目標。不要以任意 JavaScript、`element.click()` 或 DOM 修改代替輸入事件。

若 MCP 的 `tiefsee_click` 回報的座標落在多行文字行間，或 MCP schema 不接受 `clickCount`，不要重試同一個 MCP 操作；改用上方 CLI。例：

```powershell
node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_click '{"windowId":"<windowId>","selector":"font.lora[data-name=\"kinrolstyle_3D\"]"}'
node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_click '{"windowId":"<windowId>","selector":"#menu-lora .js-img","clickCount":2}'
```

第一個命令用實際文字片段點擊 LoRA；第二個命令雙擊預覽圖。若回報目標在可視區外，先用 `tiefsee_inspect` 查看 rect，對該視窗內容送出 `tiefsee_wheel` 捲動，再重新 inspect 和點擊。selector 的 CSS `display`／`visibility` 可見不代表元素目前位於 viewport 內。

若已載入的 MCP `tiefsee_inspect` 回覆缺少目前工作樹 dispatcher 支援的 `focused`、`ariaDisabled`、`ariaLabelledBy`、`ariaSelected`、`ariaExpanded`、`ariaControls` 或文字選取欄位，對該次唯讀檢查改用 `node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_inspect '<jsonArgs>'`。不需重啟 Codex、MCP server 或 Debug Tiefsee。

### Codex 沙箱下的 Debug 啟動方式

已驗證的失敗情形：在 Codex 沙箱內啟動 Debug Tiefsee 時，WebView2 可能無法建立 `DevToolsActivePort`／localhost CDP listener；只把 `CdpTest.mjs` 用沙箱外權限執行，不能修復已在沙箱內啟動的 Tiefsee。Debug Tiefsee 與直接 CLI 控制呼叫都要在允許 localhost CDP 的執行環境執行。這是 Codex 執行沙箱權限，不是要求以 Windows 系統管理員執行，也不需要重啟 Codex。

在 Codex 執行工作時，若一般沙箱啟動失敗或回報 `Access to ...Microsoft SDKs is denied`：

1. 對 `dotnet build`、`Start-DebugWithCdp.ps1` 與每次 `CdpTest.mjs call ...` 使用 Codex `exec_command` 的 `sandbox_permissions: "require_escalated"` 執行。先前確認，升權啟動器會建立有效 CDP port；以同一權限執行 CLI 可列頁及操作。不要只升權 Node CLI 而保留 Tiefsee 在沙箱內。
2. 啟動器輸出 `Debug Tiefsee is ready (PID ..., CDP port ...)` 後，立即列頁取得新 `windowId`；不要重用舊 port 或舊 windowId。
3. MCP 缺少 `clickCount`、對多行 inline 元素回報外框中心，或有其他已確認的版本落差時，照前節對該操作用 `call` 子命令；不必重啟 Codex，也不用重啟 Debug Tiefsee。若 MCP server 需要測試 `CdpTest.mjs` 最新改動，才需重新載入該 server；CLI fallback 不受既有 server 程序影響。

可直接使用以下命令（從 repo 根目錄執行；建置和啟動順序見下一節）：

```powershell
node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_pages '{}'
node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_snapshot '{"windowId":"<本輪windowId>"}'
node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_click '{"windowId":"<本輪windowId>","selector":"#tabsBtn-appearance"}'
```

若啟動器逾時，先確認是否有舊 Tiefsee 程序、是否升權啟動、隔離 profile 的 `DevToolsActivePort` 是否為本輪新建，以及輸出 port 的 `/json/version` 是否可讀；不要停用 WebView2 沙箱或把 CDP 綁到 localhost 以外。

## 每輪測試流程

1. **清掉 Tiefsee 執行個體。** 依專案測試規則，建置前強制關閉使用者和前一輪留下的 Tiefsee 視窗，避免 `Output/Tiefsee.exe` 鎖定，也避免快速啟動將命令轉送到舊視窗。只關閉 Tiefsee，不要用 `Stop-Process -Name dotnet` 關閉不相關程序：

   ```powershell
   Get-Process Tiefsee -ErrorAction SilentlyContinue | Stop-Process -Force
   ```

2. **建置 Debug 版：**

   ```powershell
   # gulpfile 和 node_modules 都在 Www，從 repo 根目錄切換後建置
   Push-Location .\Www
   node .\node_modules\gulp\bin\gulp.js ejs scss ts
   # 若變更的前端資源不由上述任務輸出（例如 langData.js），再同步靜態檔案
   node .\node_modules\gulp\bin\gulp.js copy-files
   Pop-Location

   # 回到 repo 根目錄建置 Debug apphost
   dotnet build Tiefsee/Tiefsee.csproj --no-restore -p:UseAppHost=true
   ```

   Codex 沙箱如拒絕存取 Windows SDK 路徑，依「Codex 沙箱下的 Debug 啟動方式」對建置命令使用 `require_escalated`。啟動器會將 `Output/Www` 同步至 Debug apphost 旁的 `Tiefsee/bin/Debug/Www`；不要手動從舊 `bin/Debug/Www` 驗收前端改動。

3. **啟動隔離的測試版：**

   ```powershell
   ./Tests/WebView2TestAutomation/Start-DebugWithCdp.ps1 "C:\path\to\test-image.jpg"
   ```

   啟動器會拒絕與其他 Tiefsee 執行個體共用程序，將前端建置產物從 `Output/Www` 同步到 Debug apphost 的 `Tiefsee/bin/Debug/Www`，清除隔離資料夾中的舊 `DevToolsActivePort`，並等待本輪 WebView2 CDP `/json/version` 就緒後才回報成功。若 Codex 沙箱限制 localhost listener，需以 `require_escalated` 啟動此命令。Debug apphost 讓程式能以 `Tiefsee.exe` 重新啟動自己，因而可測試 UI 的「另開視窗」等功能。測試版設定 `TIEFSEE_ENABLE_TEST_CDP=1`，並使用 `Tiefsee/bin/Debug/WebView2TestProfile`；一般設定和使用者 WebView2 資料不會共用。Release 和一般啟動不開啟測試 CDP，也不得停用 WebView2 沙箱。

4. **列頁並操作。** 優先使用 `tiefsee-webview` MCP；若工作階段沒有載入工具，使用相同的 `CdpTest.mjs call <toolName> <jsonArgs>` CLI。每輪先呼叫 `tiefsee_pages`，將唯一 `windowId` 與預期檔案／視窗配對。每次呼叫都會重新讀取動態 CDP port 和目前頁面，因此重啟測試程式後不需重啟 Codex。開關視窗後重新列舉頁面。若輸入工具回報錯誤，停止後續輸入、重新列舉頁面並確認目標，避免錯送到另一視窗。

5. **清理測試程序。** 結束本輪 Debug 測試視窗／程序；MCP 模式不需要停止或重啟 MCP server。測試結果記錄操作和可觀察結果，並列明未驗證項目。

### LoRA 提示與預覽圖另開視窗驗收

這條流程已用 Debug 測試版計時驗證為 73.6 秒，計時從測試 app 已開啟、準備進入設定開始，包含重設設定後的 app 重啟、設定模型路徑、LoRA 資訊確認、預覽圖另開視窗及結束測試程序；不含建置與首次啟動。

1. 先確認主視窗開啟 `C:\Users\wen\Desktop\Tiefsee 相關\測試2\webui.webp`。開啟設定並選「進階設定」。重設按鈕位於頁面下方；先在設定內容區送出滾輪事件，再 inspect `#btn-resetSettings`，確認其中心座標位於 viewport 內：

   ```powershell
   node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_wheel '{"windowId":"<設定windowId>","x":420,"y":400,"deltaY":750}'
   node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_inspect '{"windowId":"<設定windowId>","selector":"#btn-resetSettings"}'
   ```

   用 MCP 或 CLI 的 `tiefsee_click` 點擊 `#btn-resetSettings`，再列頁並檢查重設確認視窗；以 `tiefsee_click` 點擊 `.msgbox-btn__yes`。重設會重啟 Debug app；重新呼叫 `tiefsee_pages`，確認主視窗仍開啟測試圖片，不要沿用舊 `windowId`。

2. 在主視窗用目前版本的 MCP `tiefsee_click`，或前節 CLI fallback，點擊 `font.lora[data-name="kinrolstyle_3D"]`，確認 `#menu-lora` 顯示「未指定 A1111 models 路徑」。點擊 `#menu-lora .js-setting` 後重新列頁，找到設定視窗並 inspect `#text-a1111Models` 為空。依序點擊欄位、全選、輸入路徑並按 Tab 觸發 change；inspect 確認欄位值後，點擊 `.titlebar-toolbar-close` 關閉設定視窗：

   ```powershell
   node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_click '{"windowId":"<設定windowId>","selector":"#text-a1111Models"}'
   node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_press '{"windowId":"<設定windowId>","keys":"Ctrl+A"}'
   node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_type '{"windowId":"<設定windowId>","text":"D:\\ai\\sd-webui-forge-classic\\models"}'
   node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_press '{"windowId":"<設定windowId>","keys":"Tab"}'
   node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_inspect '{"windowId":"<設定windowId>","selector":"#text-a1111Models"}'
   node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_click '{"windowId":"<設定windowId>","selector":".titlebar-toolbar-close"}'
   ```

3. 重新列頁取得主視窗新的 `windowId`，用 CLI 再點一次 LoRA，確認 `#menu-lora` 顯示資訊與預覽圖。對 `#menu-lora .js-img` 使用 `clickCount: 2`，重新列頁並確認新視窗啟動參數含 `kinrolstyle_3D-000012.preview.png`。完成後關閉本輪 Debug Tiefsee。

Debug 測試版把 `AppData`、設定檔、暫存資料和 WebView2 user data 都指向 `Tiefsee/bin/Debug/WebView2TestProfile`；「初始化設定」只重設這個隔離測試 profile，不會清除一般 Tiefsee 使用者設定。

若啟動器在 30 秒內找不到有效的 `DevToolsActivePort` 或 `/json/version`，它會關閉本輪啟動的測試程序並回報錯誤。先檢查 Debug WebView2 是否成功初始化及執行環境是否允許 localhost listener；不要停用 WebView2 沙箱，也不要把 CDP 暴露到 localhost 以外。

## MCP 工具

所有操作工具都必須指定 `windowId`；座標使用該視窗 viewport 的 CSS pixels。

| 工具 | 用途 |
| --- | --- |
| `tiefsee_pages` | 列出頁面及 `windowId`、啟動檔案等識別資訊；`windowId: null` 是未初始化預載頁 |
| `tiefsee_state` | 讀取指定視窗標題、檔案參數與頁面文字 |
| `tiefsee_snapshot` | 讀取互動 DOM、可讀名稱、文字和元素座標；回報原生 checkbox／radio 的 checked，以及自訂 ARIA 控件的 role、名稱、`aria-checked`、`aria-disabled`、`aria-labelledby`、`aria-selected`、`aria-expanded` 與 `aria-controls` 狀態；套用自訂樣式而隱藏的 input 會回報關聯標籤 selector |
| `tiefsee_inspect` | 依 CSS selector 檢查元素名稱、可見性、焦點、值、checkbox／radio 狀態、ARIA 狀態與座標；文字欄位會回報選取起訖位置和選取文字，並回報頁面目前反白選取的文字；隱藏 input 會回報可見關聯標籤 selector |
| `tiefsee_click` | 只在 selector 唯一且可見時，送出真實 CDP 滑鼠點擊；多行 inline 元素會以實際排版片段定位，避免點到行間空白；`button` 可指定 `left`、`right` 或 `middle`；`clickCount: 2` 可送出雙擊，預設為 1；`includeSnapshot: true` 可在同一回覆取得點擊後狀態 |
| `tiefsee_click_at` | 依 DOM 檢查所得的 viewport CSS 座標送出真實 CDP 滑鼠點擊；座標超出視窗時會拒絕 |
| `tiefsee_click_text` | 依唯一可見的精確文字定位互動項目並送出真實 CDP 左鍵點擊；適合快照能看到選單文字、但沒有 selector 的情況；可用 `includeSnapshot: true` 合併操作後驗證 |
| `tiefsee_press` | 送出按鍵／快捷鍵，例如 `Ctrl+C`、`Ctrl+V`、`F2`、`Escape` |
| `tiefsee_type` | 對目前焦點送出文字輸入；先用點擊或鍵盤聚焦 |
| `tiefsee_move`、`tiefsee_wheel`、`tiefsee_drag` | 送出指定視窗內的滑鼠移動、滾輪或拖曳；拖曳可用 `steps`、`durationMs` 控制輸入點數與時間。`tiefsee_wheel` 可用 `captureScreenshot` 與 `captureScreenshotDelayMs` 擷取短暫視覺狀態 |
| `tiefsee_resize_window` | 依 `windowId` 調整測試視窗外框大小（寬 400–3840、高 300–2160），用於重現小視窗版面；調整後重新 inspect viewport 取得新座標 |
| `tiefsee_touch_gesture` | 以 CDP 觸控模擬送出雙指縮放或旋轉；`kind` 為 `pinch` 時 `value` 是 0.5–2 倍倍率，`rotate` 時是 5–180 度角度，`x`／`y` 為 viewport CSS 座標 |
| `tiefsee_wait` | 輪詢 selector 可見狀態或文字，避免猜固定等待時間 |
| `tiefsee_screenshot` | 擷取指定 WebView 畫面；供像素呈現、旋轉、裁切等視覺結果檢查 |

優先使用範圍明確的 `tiefsee_inspect`，避免每一步都讀完整快照；已知且唯一的 selector 用 `tiefsee_click`。只有在控件沒有可用 selector、但其 DOM 座標已由 inspect/snapshot 確認時，才用 `tiefsee_click_at`；座標是 viewport CSS pixels。兩者都會送出 CDP 滑鼠事件，不呼叫 DOM click。截圖只用來確認圖片、裁切、旋轉等視覺渲染結果，不用來定位一般按鈕。用 `tiefsee_inspect` 或快照確認操作結果；只在需要更多上下文時讀完整快照。此測試方案只涵蓋 WebView2 內的 DOM 與 CDP 輸入；不接管 Windows 全域鍵盤／滑鼠，也不操作原生檔案對話框、外部瀏覽器、Windows 系統視窗或跨出 WebView2 的 WinForms／OLE 拖曳。觸發這些外部操作的 WebView 控件仍可在其邊界內驗證角色、名稱，以及 WebView2 內可觀察到的結果；不將外部視窗互動列為測試待辦。

需要驗證快速拖曳速度或慣性時，使用目前 dispatcher 的 `tiefsee_drag` `steps`、`durationMs` 參數產生連續移動輸入，例如 `{"windowId":"<windowId>","x1":280,"y1":300,"x2":520,"y2":320,"steps":12,"durationMs":0}`。預設參數仍是一段立即拖曳。`captureConsoleMs` 大於 0 時，dispatcher 會在同一 CDP 連線中暫時訂閱 Console API 訊息，拖曳後等待指定毫秒，並只回傳 `[Tiefsee render performance] pan` 訊息；`captureTrace: true` 會額外擷取短時間 Chromium compositor、GPU 和 raster trace 的摘要。這些量測不會在頁面執行 JavaScript。若已載入的 MCP schema 尚不接受可選參數，對該次呼叫使用 `node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_drag '<jsonArgs>'`，不需重新載入 Codex 或新增測試腳本。文字輸入框可用 `tiefsee_inspect` 的 `selectionStart`、`selectionEnd` 和 `selectedText` 確認局部選取；再以右鍵點擊選取範圍內的座標，驗證文字快顯選單會保留選取。

需要驗證多點觸控時，使用 `tiefsee_touch_gesture` 送出 CDP 雙指事件；這是 WebView2 內的觸控模擬，不代表實體觸控螢幕硬體驗收。範例：

```powershell
node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_touch_gesture '{"windowId":"<windowId>","kind":"pinch","x":400,"y":300,"radius":50,"value":1.5,"steps":12,"durationMs":400}'
node .\Tests\WebView2TestAutomation\CdpTest.mjs call tiefsee_touch_gesture '{"windowId":"<windowId>","kind":"rotate","x":400,"y":300,"radius":60,"value":70,"steps":14,"durationMs":500}'
```

由於目前已載入的 MCP schema 可能尚未包含此工具，遇到未知工具或參數時直接用上述 `call` 命令呼叫目前工作樹 dispatcher，不需重啟 Codex 或另寫 CDP 腳本。驗證縮放比例用 `tiefsee_state` 的頁面文字；旋轉、裁切和縮放中心以操作前後 screenshot 確認。測試捲動條時先用 `tiefsee_inspect` 找出 `.mView-tiefseeview .scroll-x`／`.scroll-y` 的可見位置，確認滾輪後比例不變且 `.scroll-box` 位置移動；在大型切換按鈕上滾輪則確認縮放比例改變，並比較游標附近的圖像位置。

## 最低驗收

- 同時打開兩個不同圖片視窗，`tiefsee_pages` 或其 CLI 等價呼叫回報兩個不同 `windowId`，且各自對應正確檔案。
- 透過指定其中一個 `windowId` 執行輸入並驗證結果；另一個視窗狀態維持不變。
- 關閉／重開一個測試視窗後重新列頁，剩餘視窗仍可識別及操作。
- MCP 模式保持 server 程序不變，重啟 Debug Tiefsee 後再次列頁及操作成功，證明動態 port 重連有效；CLI 模式則重新呼叫 `call`，確認每次都重新讀取目前 port。
- 啟動時沒有 Tiefsee 時，MCP server 仍能完成 MCP 握手與列出工具；Tiefsee 尚未啟動時呼叫 `tiefsee_pages` 應清楚回報 CDP 未就緒，而不是連到舊 port 或另一個應用程式。

## 安全界線

- CDP 只由明確啟用的 Debug 測試版提供，綁定 localhost，並使用隔離的測試資料目錄。
- MCP 只接受預先定義且有參數 schema 的視窗讀取和輸入操作。不得加入任意 JavaScript 執行工具；DOM evaluate 僅包含工具內固定的唯讀辨識程式或輸入座標查詢。
- 建置前關閉所有 Tiefsee 執行個體；不得讓舊測試程序與新測試程序共用輸出檔或測試 WebView2 資料目錄。
- 測試輸入必須限定在指定 WebView2 視窗的 CDP 操作；不可接管全域鍵盤／滑鼠或為了完成外部視窗流程切換到桌面自動化。
