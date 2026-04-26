# Tiefsee 重構待辦清單

目前 C# 專案的主要搬移與分層整理已大致完成，接下來先不急著動前端，先把剩餘的結構調整收斂完，再進入 API 與前端呼叫整理。

## 目前只剩的主要任務

### C# 分層收尾

目標：

- 把目前仍放在不合適層級的共用技術元件歸位
- 先把 C# 專案自己的分層邏輯收斂清楚，再處理前端與 API

目前已知需要再評估與調整的項目：

1. `IniFileService`
   目前放在 `App`，但實際上只是 INI 讀寫能力，較偏 `Infrastructure`
2. `ProcessMemoryService`
   目前放在 `App`，但若責任只是程序/記憶體資訊讀取，較偏 `Infrastructure`
3. `JsonExtensions`
   屬於共用 JSON 擴充函數，應視為 `Infrastructure/Extensions`
4. `Plugin`
   偏向專案自己的外掛可用性偵測與啟動期能力判斷，較偏 `App`
5. `AppPath`
   雖然名稱像技術工具，但目前知道許多 Tiefsee 啟動狀態，暫時仍偏 `App`
6. `QuickRun`
   責任相對明確，偏向專案自己的執行模式與視窗生命週期協調，較偏 `App`
7. `Adapter`
   屬於共用 UI thread / delay / timeout 協調能力，但呼叫面很廣，需保守整理

建議處理順序：

1. `JsonExtensions`
2. `IniFileService`
3. `ProcessMemoryService`
4. `Plugin`
5. `AppPath`
6. `QuickRun`
7. `Adapter`

### Phase 5：整理 API 與前端呼叫

目標：

- 前後端使用一致命名
- 清掉重構期間留下的舊路徑與兼容呼叫

要做的事：

1. 前端逐步改呼叫新 API 路徑
2. 檢查 WebView bridge 與 HTTP API 是否仍有重複邏輯
3. 必要時短暫保留舊路徑 wrapper，避免一次改動過大
4. 最後刪除舊命名與兼容碼

完成標準：

- 專案內不再新增或依賴舊式 API 命名
- 前後端主要呼叫路徑已對齊目前的分層與命名規則

## 目前優先順序

1. 先處理 C# 分層收尾
2. 最後再統一整理 API 與前端呼叫

## 補充原則

- 現階段先不要為了整理 API，反過來打亂已經收斂好的 C# 分層
- 前端調整時優先對齊已經確立的新命名，而不是再沿用舊式路徑
- 若舊路徑只是過渡用途，應在最後一波整理時明確刪除，不長期保留
