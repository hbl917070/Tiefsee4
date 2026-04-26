# Tiefsee 架構分層說明

## 目錄結構

### `App`

放 Tiefsee 這個專案自己的運行核心。

常見內容：

- 啟動與組裝
- 應用程式層級的協調
- App 專屬的初始化資料或執行期狀態

範例：

- `App/Bootstrap`
- `App/Http`
- `App/AppPath.cs`
- `App/SingleInstanceCoordinator.cs`

### `Features`

放使用者可感知的功能模組。

常見內容：

- 檔案功能
- 影像功能
- 視窗功能
- 系統整合功能

每個 feature 內可再依需要拆成：

- `Application`: 功能邏輯、流程協調
- `Contracts`: 該功能自己的資料模型
- `Http`: 該功能的本機 HTTP 路由
- `WebView`: 提供給 WebView2 的對外 bridge
- `UI`: 該功能專屬的桌面 UI

### `Infrastructure`

放底層技術能力與可重用元件。

常見內容：

- Win32 / Shell / OS 整合
- 共用 extensions
- 快取
- `Vendor`: 第三方或外部來源碼
- 通用檔案格式讀寫
- 不屬於特定 feature 的技術輔助元件

範例：

- `Infrastructure/Windows`
- `Infrastructure/Extensions`
- `Infrastructure/Vendor`
- `Infrastructure/Web`

## 如何快速判斷要放哪裡

可以先用下面順序判斷：

1. 這個類別是不是在表達 Tiefsee 自己的啟動、執行模式、共享狀態或整體協調？
如果是，放 `App`。

2. 這個類別是不是明顯屬於某個使用者可感知的功能？
如果是，放對應的 `Features/...`。

3. 這個類別如果搬去別的 WinForms / WebView2 專案，是否大致仍然合理？
如果是，放 `Infrastructure`。

## 簡單原則

- 先看責任，再決定位置
- `App` 放專案自己的核心，不放只是技術能力的元件
- `Features` 放功能模組，不放整個專案共用的底層技術
- `Infrastructure` 放技術實作，不放 Tiefsee 專屬流程
- 若只是單純搬移位置，優先直接搬移，不順手擴大重寫
