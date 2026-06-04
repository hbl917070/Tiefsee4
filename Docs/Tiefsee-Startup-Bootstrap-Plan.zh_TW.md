# Tiefsee 啟動流程與初始化順序整理方案

這份文件整理目前 `Program`、`AppPaths`、INI 讀取、`AppBootstrapper`、`ServiceRegistry` 之間的責任混雜問題，並提出一個偏保守、可分階段落地的整理方案。

目標不是一次導入完整 DI 容器，而是先把「啟動前置資料」、「INI 設定」、「執行期共享狀態」、「共享服務建立」這幾層拆清楚，讓之後看到某個 class 時，可以比較直觀地判斷它是否已完成初始化。

補充：原本 `AppPaths.InitAppData()` 與 `AppPaths.Init()` 拆成兩段，有一個重要原因是 `Windows.Storage.ApplicationData.Current.LocalCacheFolder.Path` 的呼叫成本偏高，會明顯影響啟動速度。因此這份方案必須保留原本的效能前提：

- 啟動最前段只能先用便宜路徑取得 `Start.ini`
- 只有在缺少 ini 暫存資訊、而且確實需要判斷 store app 路徑時，才去碰 `LocalCacheFolder.Path`

## 目前問題

### 1. 初始化順序不容易直觀看出

目前啟動流程散落在：

- `Program.cs`
- `App/AppPaths.cs`
- `App/Bootstrap/AppBootstrapper.cs`
- `App/Bootstrap/ServiceRegistry.cs`

而且有些 class 是直接讀 static 狀態，有些則在建構式裡取 `Program.services`，導致使用某個 class 時，不容易第一眼判斷它依賴的是：

- 最早就能取得的資訊
- 讀完 INI 才會知道的資訊
- app 啟動後才會存在的共享 service

### 2. `AppPaths` 同時承擔太多責任

`AppPaths` 目前同時做了幾件事：

- 推導最早可知的 `appDataStartIni`
- 判斷 portable / store app / 一般版
- 組合各種執行期 path
- 建立資料夾
- 在某些情況下回寫 ini

這使得 `AppPaths` 不只是 path holder，也混進了啟動流程判斷與副作用。

### 3. `Program` 直接處理太多啟動細節

`Program.Main()` 目前直接：

- 設定工作目錄
- 先呼叫 `AppPaths.InitAppData()`
- 自己讀 `Start.ini`
- 再把讀到的值傳回 `AppPaths.Init(...)`
- 再建立 `ServiceRegistry`

雖然流程本身能跑，但結構上不容易一眼看出哪些步驟屬於：

- early bootstrap
- startup config loading
- runtime context building
- service bootstrap

### 4. service 建立時機不夠明確

像 `A1111ResourceService` 這種需要 `AppPaths.appDataA1111ModelList` 才能建立的 class，已經說明目前 `ServiceRegistry` 不能再假設所有 service 都能直接 `= new()`。

這不是單一 service 的特例，而是代表啟動流程應該先產出一份完整的 runtime context，再由 bootstrap 階段建立共享 service。

## 核心原則

### 1. 先分清楚「階段」，再決定 class 放哪裡

先把啟動流程拆成幾個明確階段：

1. Early path resolving
2. Startup config loading
3. Runtime context building
4. Shared service bootstrap
5. Application startup

之後 class 要放哪裡，優先看它屬於哪一個階段，而不是先問它要不要叫 `Service`。

### 2. 不是所有東西都要 service 化

這次整理不建議把所有 class 都改成 `*Service`。

較合理的區分是：

- `Service`: 有共享狀態、快取、初始化依賴、協調責任、生命週期管理
- `Context` / `Config`: 單純承載某階段已決定好的資料
- `Resolver` / `Builder`: 負責計算或組裝，不代表 app 執行期共享實例

### 3. 不要讓 runtime service 直接偷吃 bootstrap 細節

像 `A1111ResourceService`、`UwpAppService`、`ImageProcessingService` 這種執行期共享 service，理想上應該透過 bootstrap 階段拿到自己需要的資料，而不是在內部自行依賴某些尚未保證初始化完成的 static 全域狀態。

## 建議的目標結構

### A. Early paths

新增一個只負責「最早可知 path」的資料結構，例如：

- `App/Contracts/EarlyAppPaths.cs`

用途：

- `BaseDirectory`
- `InitialAppData`
- `StartIniPath`
- `IsPortableMode`

這一層只能依賴：

- `AppDomain.CurrentDomain.BaseDirectory`
- `PortableMode` 是否存在
- `Environment.SpecialFolder.LocalApplicationData`

這一層不能讀 INI，也不應建立其他 service。

### B. Startup config

新增一個只承載 `Start.ini` 結果的資料結構，例如：

- `App/Contracts/StartupConfig.cs`

內容可包含：

- `StartPort`
- `StartType`
- `IniAppData`
- `IniIsStoreApp`

再新增一個專門讀取它的 class，例如：

- `App/StartupConfigLoader.cs`

職責：

- 接收 `StartIniPath`
- 讀取 ini
- 回傳 `StartupConfig`

這一層不應順便改寫 `Program.startPort` 或 `Program.startType`。

### C. Runtime context

新增一個承載最終執行期資訊的資料結構，例如：

- `App/Contracts/AppRuntimeContext.cs`

內容可包含：

- `AppData`
- `IsStoreApp`
- `IsPortableMode`
- `AppDataStartIni`
- `AppDataLock`
- `AppDataPort`
- `AppDataPlugin`
- `AppDataSetting`
- `AppDataUwpList`
- `AppDataA1111ModelList`
- `TempDirImgProcessed`
- `TempDirImgZoom`
- `TempDirWebFile`
- `LogoIcon`
- `StartPort`
- `StartType`

這份 context 應該是 bootstrap 完成後的單一真實來源。

### D. Runtime context builder

新增一個專門把 early paths 和 startup config 合併成 runtime context 的 builder，例如：

- `App/AppRuntimeContextBuilder.cs`

職責：

- 接收 `EarlyAppPaths`
- 接收 `StartupConfig`
- 判斷 store app / 一般版 / portable mode
- 算出最終 `AppData`
- 組合所有 runtime paths
- 必要時建立資料夾
- 回傳 `AppRuntimeContext`

如果有些情況需要回寫 `Start.ini`，也應在這一層被明確處理，不要混在 path holder 裡。

### E. Bootstrapper / registry

`AppBootstrapper` 與 `ServiceRegistry` 改成明確依賴 `AppRuntimeContext`：

- `AppBootstrapper.Bootstrap(AppRuntimeContext context)`
- `ServiceRegistry` 建構式接收 `AppRuntimeContext`

之後像這些 service 就能在 bootstrap 時明確建立：

- `new UwpAppService(...)`
- `new A1111ResourceService(context.AppDataA1111ModelList)`
- `new ImageProcessingService(...)`

其中 `A1111ResourceService` 是目前最明顯需要先改成走這條路的案例。

## 建議的啟動流程

整理後，`Program.Main()` 應盡量接近下面這種形狀：

```csharp
[STAThread]
static void Main(string[] args) {
    Directory.SetCurrentDirectory(AppDomain.CurrentDomain.BaseDirectory);

    var earlyPaths = EarlyAppPathResolver.Resolve();
    var startupConfig = new StartupConfigLoader().Load(earlyPaths.StartIniPath);
    var runtimeContext = new AppRuntimeContextBuilder().Build(earlyPaths, startupConfig);

    Program.startPort = runtimeContext.StartPort;
    Program.startType = runtimeContext.StartType;
    Program.services = AppBootstrapper.Bootstrap(runtimeContext);

    // 後續才是 single instance / web server / window startup
}
```

這樣 `Main()` 雖然仍是總入口，但只保留：

- 啟動流程的高階組裝
- app 層級的流程順序

而不是自己承擔細節計算。

## `AppPaths` 的建議處理方式

這次不建議直接把 `AppPaths` 硬改成 `AppPathsService`。

比較建議的方向有兩種：

### 方案 A. 漸進式保留 `AppPaths`，但縮小責任

把 `AppPaths` 逐步縮成單純的 runtime path accessor，或暫時作為 `AppRuntimeContext` 的過渡轉接層。

也就是說：

- 不再讓 `AppPaths` 負責讀 ini
- 不再讓 `AppPaths` 自己判斷 store mode
- 不再讓 `AppPaths` 自己執行整段 bootstrap

只保留：

- 已經決定好的 path 結果
- 舊程式碼過渡期仍需要的讀取入口

這是較低 churn 的做法。

### 方案 B. 最終讓 `AppPaths` 退場

等 `AppRuntimeContext` 穩定後，逐步把所有 `AppPaths.xxx` 改成：

- `Program.runtimeContext.xxx`
- 或 `Program.services.SomeService`
- 或直接由建構式接收所需值

最後再評估是否刪除 `AppPaths`。

這是較乾淨但改動較大的做法。

## `Program` 的建議責任

整理後的 `Program` 應只保留：

- app 主入口
- 啟動流程的高階順序
- 最終共享狀態掛載點

不建議繼續讓 `Program` 直接處理：

- INI 讀取細節
- store / portable 判斷細節
- path 組合細節
- 個別 service 的初始化參數推導

如果 `Program` 只保留高階組裝，之後要看執行順序時，閱讀成本會低很多。

## 目前進度摘要

目前已經完成這次整理的主幹：

- 已拆出 `EarlyAppPaths`
- 已拆出 `StartupConfig`
- 已拆出 `AppRuntimeContext`
- 已新增 `StartupConfigLoader`
- 已新增 `AppRuntimeContextBuilder`
- `Program.Main()` 已改為走新的 bootstrap pipeline
- `AppBootstrapper` / `ServiceRegistry` 已改為明確接收 `AppRuntimeContext`
- `A1111ResourceService` 已改為在 bootstrap 階段建立

目前尚未完成的部分，主要是 runtime code 對 `AppPaths.*` 的舊依賴還在。

- `AppPaths` 目前仍是過渡層
- `Program`、`StartWindow`、`SingleInstanceCoordinator`、`UwpAppService`、`ImageProcessingService` 等 class 仍有部分舊讀法
- 因此這份方案目前可視為「第一輪主幹完成，第二輪清理尚未完成」

## 分階段修改建議

### 第一階段（已完成）

先把資料形狀拆出來，不大量改既有呼叫端：

- 新增 `EarlyAppPaths`
- 新增 `StartupConfig`
- 新增 `AppRuntimeContext`
- 新增 `StartupConfigLoader`
- 新增 `AppRuntimeContextBuilder`

這一階段重點是把「不同階段的資料」明確型別化。

目前狀態：

- 已完成

### 第二階段（已完成）

讓 `Program.Main()` 改為呼叫新的 bootstrap pipeline：

- `Resolve early paths`
- `Load startup config`
- `Build runtime context`
- `Bootstrap services`

這一階段完成後，初始化順序就會先變清楚。

目前狀態：

- 已完成

### 第三階段（部分完成）

讓 `ServiceRegistry` 不再假設所有 service 都能直接 `= new()`：

- 改為建構式建立
- 或在 `AppBootstrapper` 內明確建立後傳入

優先調整：

- `A1111ResourceService`
- 其他需要 path / config 才能初始化的共享 service

目前狀態：

- `A1111ResourceService` 已完成
- 其他仍直接依賴 `AppPaths.*` 的 shared service，留待後續逐步收斂

### 第四階段（尚未完成）

逐步把 runtime code 從直接依賴 `AppPaths.*`，改成依賴：

- `AppRuntimeContext`
- `ServiceRegistry`
- 或該 class 自己真正需要的建構式參數

這一階段可以慢慢做，不必一次完成。

目前狀態：

- 已完成第一輪啟動流程周邊收斂
- `Program`、`SingleInstanceCoordinator`、`StartWindow`、`StartIniConfigService` 已改為直接讀 `Program.runtimeContext`
- `UwpAppService` 已改為由 bootstrap 階段接收 `AppDataUwpList`
- `TempCleanupService` 已同步改為直接讀 `Program.runtimeContext`
- `ImageProcessingService` 已改為由 bootstrap 階段接收 `TempDirImgProcessed` / `TempDirImgZoom`
- `TempFileHelper`、`AnimatedImageHelper`、`FileHttpEndpoints`、`WebWindow` 已改為直接讀 `Program.runtimeContext` 的 temp / setting 路徑
- 目前仍先透過 `AppPaths.ApplyRuntimeContext(...)` 保留相容過渡層，供其他尚未收斂的舊程式碼使用

## 第二輪收尾任務

下一輪建議把重點放在「移除啟動流程周邊對 `AppPaths` 的過度依賴」，先收斂最接近 bootstrap 邊界、改完後閱讀價值最高的區塊。

建議順序如下：

1. 已完成：把 `Program` 內與 lock / start.ini / port 相關的讀法改成直接讀 `Program.runtimeContext`
2. 已完成：把 `SingleInstanceCoordinator` 內的 `appDataPort` 讀法改成直接依賴 `Program.runtimeContext`
3. 已完成：把 `StartWindow` 內與 `appDataPort`、`logoIcon` 相關的讀法改成直接依賴 `Program.runtimeContext`
4. 已完成：把 `StartIniConfigService` 改成直接依賴 `Program.runtimeContext.AppDataStartIni`
5. 已完成：把 `UwpAppService` 改成由 bootstrap 階段接收 `AppDataUwpList`
6. 已完成：讓 `ImageProcessingService` 接收 `TempDirImgProcessed` / `TempDirImgZoom`

下一步可優先處理：

- `PluginRegistry`
- `StaticAssetHttpEndpoints`
- `WindowWebViewBridge`
- `AppPaths` 內剩餘的過渡 helper 是否還有保留必要

這一輪的目標不是一次刪掉 `AppPaths`，而是先把它縮成真正的過渡層：

- 不再承擔啟動期 lock / port / start.ini / UWP cache 路徑的主要入口
- 只保留少數舊 bridge 或檔案路徑 helper 暫時需要的能力

## 這次整理後希望得到的效果

### 1. 看 class 時能比較直觀判斷它依賴哪一層

例如：

- `StartupConfigLoader` 一看就知道屬於啟動前期
- `AppRuntimeContextBuilder` 一看就知道是在組裝執行期環境
- `A1111ResourceService` 一看就知道是 runtime shared service

### 2. 比較不容易再出現「不知道初始化了沒」的情況

因為每層資料都會有明確輸入與輸出，不再依賴隱含的 static 狀態順序。

### 3. `Program` 會變短，但不是把責任藏起來

重點不是單純把 code 挪走，而是把「每一段責任屬於哪個階段」寫清楚。

## 不建議的方向

### 1. 不建議把所有啟動相關 class 都改成 `*Service`

這會讓：

- 設定資料
- 路徑資料
- bootstrap builder
- runtime service

全部都長得很像，反而更難分辨責任。

### 2. 不建議只靠更多 static 欄位補洞

如果遇到需要某個值，就再多加一個 static 全域欄位，短期看起來方便，但長期會讓初始化順序更難追。

### 3. 不建議讓 runtime service 在內部自行推導 bootstrap 狀態

像 `A1111ResourceService` 這類需要 path 的 service，應由 bootstrap 階段把 path 傳給它，而不是讓 service 自己決定 path 來源。

## 建議先做的最小落地版本

如果要先做一個風險較低的版本，建議順序如下：

1. 新增 `StartupConfig`
2. 新增 `AppRuntimeContext`
3. 把 `Program` 目前讀 INI 的邏輯搬到 `StartupConfigLoader`
4. 把 `AppPaths.Init()` 目前的組合邏輯搬到 `AppRuntimeContextBuilder`
5. 讓 `AppBootstrapper.Bootstrap(AppRuntimeContext context)` 接手建立需要參數的 service
6. 先讓 `A1111ResourceService` 改從 `context.AppDataA1111ModelList` 建立

這樣即使後續還保留一段時間的 `AppPaths` 過渡層，也已經能把目前最混亂的初始化順序整理清楚。
