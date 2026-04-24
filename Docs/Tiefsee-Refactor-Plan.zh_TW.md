# Tiefsee 重構計劃

## 目標

這次重構的核心不是單純把檔案重新分類，而是把目前混在一起的責任拆清楚，讓未來新增功能、替換函式庫、調整 WebView2 對接方式時，不需要再去碰一大坨共用雜項。

這份計劃以以下幾個方向為主：

- 淘汰目前語意不清的資料夾命名，例如 `VW`
- 不再以 `Lib / VW / Server` 這種技術分類作為主要結構
- 將 `WebView2` 對外公開的 API 和實際業務邏輯分離
- 將大量 `static` 類別逐步改成可建立實例的 service
- 重新整理本機 HTTP API 路徑，不必受限於現有命名
- 讓影像、檔案、資料夾、視窗、系統整合等模組可以各自演進

## 現況問題

### 1. `Lib` 變成責任不明的雜物區

目前 `Lib` 同時包含：

- 影像處理
- 檔案處理
- Windows Shell 整合
- Clipboard
- SQLite
- INI
- Cache
- A1111 整合
- 第三方小型 library

這種結構短期很快，長期會造成幾個問題：

- 很難知道某個功能應該放哪裡
- 很多 class 名稱只能越取越模糊
- 很容易為了方便而新增更多 `static` 方法
- 測試與初始化點會越來越難放

### 2. `VW` 命名錯誤，責任也混了

`VW` 實際上是提供給 WebView2 `AddHostObjectToScript` 的公開介面，但目前內容不只是對外 API，還包含很多直接寫死的邏輯。

這會導致：

- WebView bridge 與業務邏輯耦合
- 很多函式只能從 WebView 的角度命名，而不是從領域功能命名
- 之後若要改成 message-based bridge 或其他橋接方式，會很難搬

### 3. `WebServerController` 過度集中

目前本機 HTTP API 的 route 註冊與處理幾乎都集中在 `WebServerController`，這會讓：

- 檔案越長越難看
- 很難分辨哪些 API 屬於哪個功能模組
- API 路徑命名容易歷史包袱化

### 4. `static` 類別阻礙設定與生命週期管理

像 `ImgLib` 這類 class 若需要：

- 保留設定
- 延後初始化
- 管理第三方 library 狀態
- 注入相依物件
- 控制資源釋放

就不適合繼續用純 `static` 設計。

`NetVips` 這類需要初始化設定的情境，就是目前結構的典型痛點。

## 重構原則

### 1. 以「功能模組」作為主結構

主結構應該改成功能導向，而不是檔案型態導向。

推薦將程式分成：

- `Features`: 業務功能模組
- `Infrastructure`: 技術實作與系統整合
- `App`: 啟動、視窗、組態、組裝入口
- `Contracts`: DTO、request/response、共用契約

### 2. 對外介面與內部實作分離

同一個功能模組內，至少拆成三層概念：

- 對 WebView2 暴露的 bridge
- 對本機 HTTP 暴露的 endpoint
- 內部真正處理邏輯的 service

也就是：

- WebView API 不負責寫商業邏輯
- HTTP API 不負責寫商業邏輯
- 真正的流程都集中在 service

### 3. `static` 只保留在真正無狀態的純工具

只有符合以下條件才保留 `static`：

- 無狀態
- 無初始化需求
- 無資源生命週期
- 不依賴外部設定
- 單純做純函式運算

像這類才適合保留：

- `JsonExtensions`
- 單純字串或 byte 陣列工具
- 少量數學或格式轉換 helper

其餘大多數現有 `Lib` 類別應改為 instance service。

### 4. 不急著導入完整 DI 容器，但要先建立 Composition Root

目前不一定需要馬上上完整 ASP.NET 式 DI 容器，但至少要先有一個明確的物件組裝入口。

建議第一步先做：

- 在 `Program` 或 `AppBootstrapper` 建立 service 實例
- 在 `WebWindow` 建立 bridge 時注入這些 service
- 在 `WebServer` 建立 route module 時注入同一批 service

等結構穩定後，再決定是否要導入 `Microsoft.Extensions.DependencyInjection`。

## 建議目錄結構

以下是建議的新結構，名稱可再微調，但方向建議維持：

```text
Tiefsee/
  App/
    Bootstrap/
      AppBootstrapper.cs
      ServiceRegistry.cs
    Windows/
      WebWindow.cs
      StartWindow.cs
      WindowManager.cs
    Program.cs
    AppPath.cs
    Adapter.cs

  Features/
    Image/
      Application/
        ImageService.cs
        ImageThumbnailService.cs
        ImageMetadataService.cs
      WebView/
        ImageWebViewBridge.cs
      Http/
        ImageHttpEndpoints.cs
      Contracts/
        GetFileIconRequest.cs
        GetFileIconResponse.cs
    Directory/
      Application/
        DirectoryService.cs
        DirectorySortService.cs
      WebView/
        DirectoryWebViewBridge.cs
      Http/
        DirectoryHttpEndpoints.cs
    File/
      Application/
        FileService.cs
        FileTextService.cs
      WebView/
        FileWebViewBridge.cs
      Http/
        FileHttpEndpoints.cs
    Window/
      Application/
        WindowService.cs
      WebView/
        WindowWebViewBridge.cs
      Http/
        WindowHttpEndpoints.cs
    SystemIntegration/
      Application/
        ClipboardService.cs
        RunAppService.cs
      WebView/
        SystemWebViewBridge.cs
        RunAppWebViewBridge.cs
      Http/
        SystemHttpEndpoints.cs

  Infrastructure/
    Imaging/
      MagickImageLoader.cs
      VipsManager.cs
      WpfBitmapDecoder.cs
      RawImageDecoder.cs
      ExifReader.cs
      Apng/
    IO/
      FileSystemService.cs
      FileWatcherService.cs
      IniFileStore.cs
    Windows/
      ShellContextMenuService.cs
      ShellLinkService.cs
      ThumbnailProvider.cs
      KnownFolderService.cs
      NativeWindowApi.cs
    Data/
      SqliteConnectionFactory.cs
    Web/
      LocalHttpServer.cs
      EndpointRegistrar.cs

  Contracts/
    Common/
      Result.cs
      ErrorInfo.cs
```

## 命名調整建議

### 資料夾命名

- `Lib` -> 拆散，不保留
- `VW` -> 不保留，改為各模組自己的 `WebView`
- `Server` -> `Infrastructure/Web` 與各 `Features/*/Http`

### 類別命名

目前 `WV_*` 命名不建議保留，因為它把實作方式寫進名稱裡，而且縮寫不直觀。

建議改成：

- `WV_Image` -> `ImageWebViewBridge`
- `WV_Directory` -> `DirectoryWebViewBridge`
- `WV_File` -> `FileWebViewBridge`
- `WV_Path` -> `PathWebViewBridge` 或直接併入 `FileWebViewBridge`
- `WV_System` -> `SystemWebViewBridge`
- `WV_RunApp` -> `RunAppWebViewBridge`
- `WV_Window` -> `WindowWebViewBridge`

若未來不想綁死在 WebView，可再進一步縮成：

- `ImageBridge`
- `DirectoryBridge`

但以目前階段來說，保留 `WebViewBridge` 字樣最清楚。

### Service 命名

原本 `Lib` 底下很多名稱偏泛，例如 `FileLib`、`ImgLib`。重構後應該盡量改成描述責任的名字：

- `ImgLib` -> 依責任拆成多個 service，不建議保留單一大 class
- `FileLib` -> `FileService`、`TextFileService`、`FileMetadataService`
- `FileWatcher` -> `FileWatcherService`
- `SQLite` -> `SqliteDatabase` 或 `SqliteConnectionFactory`
- `IniManager` -> `IniFileStore`
- `A1111Manager` -> `A1111Service`

## API 設計原則

目前 API 路徑不需要沿用既有格式，建議直接重新整理。

### 原則

- 路徑名稱使用功能語意，而不是歷史命名
- 避免 `getXxx` 這種 RPC 命名
- 能表達資源就表達資源，不能表達時再用 action
- 保持同一模組下命名一致

### 建議風格

目前是本機 app 內部 API，不一定要完全 REST，但可以採用「接近 REST 的一致風格」。

例如：

```text
/api/app/ping
/api/windows
/api/windows/open
/api/windows/close-all

/api/files/content
/api/files/info
/api/files/icon
/api/files/related
/api/files/binary-check

/api/directories/files
/api/directories/children
/api/directories/siblings

/api/images/thumbnail
/api/images/frame-extraction
/api/images/raw-thumbnail
/api/images/clip-preview
/api/images/metadata/exif

/api/system/clipboard
/api/system/uwp-apps
/api/system/forward-request

/api/assets/www/{*}
/api/assets/plugins/{*}
/api/assets/files/{*}
```

### API 路徑命名建議

不要再混用以下風格：

- `/api/getExif`
- `/api/getFileInfo2`
- `/api/sort2`
- `/api/img/wpf`

這類命名存在幾個問題：

- 動詞風格不一致
- 數字尾碼表示歷史版本，但看不出差異
- 技術名詞直接暴露在 API 名稱裡

建議改成：

- `/api/images/metadata/exif`
- `/api/files/info`
- `/api/directories/files:sorted`
- `/api/images/thumbnail/wpf`

如果某 API 確實是用不同後端實作同一功能，可以保留技術名稱，但應該放在較後層的位置，而不是直接成為主要分類。

## WebView2 Bridge 設計

`VW` 未來應只保留「公開給 WebView2 的功能」，而且這些 class 應該很薄。

### 原則

- 只負責參數進出轉換
- 只負責呼叫 service
- 不直接持有大段業務邏輯
- 不負責跨功能協調

### 範例

不建議這樣：

```csharp
public class WV_Image {
    public string GetFileIcon(string path, int size) {
        using Bitmap icon = ImgLib.GetFileIcon(path, size);
        ...
    }
}
```

比較建議：

```csharp
public class ImageWebViewBridge {
    private readonly ImageThumbnailService _thumbnailService;
    private readonly ImageEncodingService _encodingService;

    public ImageWebViewBridge(
        ImageThumbnailService thumbnailService,
        ImageEncodingService encodingService) {
        _thumbnailService = thumbnailService;
        _encodingService = encodingService;
    }

    public string GetFileIcon(string path, int size) {
        using var icon = _thumbnailService.GetFileIcon(path, size);
        return _encodingService.ToBase64Png(icon);
    }
}
```

也就是 bridge 只當 facade，不再自己處理所有細節。

## `static` -> instance 的策略

這次重構建議不要一次全面把所有 `static` 改光，而是分級處理。

### 第 1 級：優先改掉有狀態需求的類別

這些最值得先改：

- `ImgLib`
- `FileWatcher`
- `A1111Manager`
- `SQLite`
- `IniManager`

原因：

- 需要設定
- 可能有資源生命週期
- 可能與外部程序或 native library 互動

### 第 2 級：將大雜燴類別拆責任

例如 `ImgLib` 不應只改成 `new ImgLib()`，而是拆成多個服務：

- `ImageThumbnailService`
- `ImageCodecService`
- `ImageMetadataService`
- `ImageFrameExtractionService`
- `VipsManager`
- `MagickImageService`

這比把一個超大 `static` class 換成一個超大 instance class 更有意義。

### 第 3 級：保留純工具為 `static`

真的純工具可保留，例如：

- extension methods
- 純轉換 helper
- 無狀態資料格式工具

## NetVips 與第三方 library 管理

`NetVips` 類型的功能建議設一個專門管理初始化與設定的 service，例如：

- `VipsManager`
- `ImageRuntimeOptions`

責任應包括：

- 套件初始化
- 全域設定
- 錯誤保護
- 必要時提供 lazy initialization

例如：

```csharp
public class VipsManager {
    private bool _initialized;
    private readonly ImageRuntimeOptions _options;

    public VipsManager(ImageRuntimeOptions options) {
        _options = options;
    }

    public void EnsureInitialized() {
        if (_initialized) return;

        NetVips.NetVips.CacheSetMax(_options.VipsCacheMax);
        _initialized = true;
    }
}
```

然後由 `ImageService` 或 `ImageThumbnailService` 去依賴它，而不是到處直接碰 `NetVips`。

## 分階段執行計劃

### Phase 0: 先立規則，不先搬大批檔案

目標：

- 先決定新命名
- 先決定目錄結構
- 先決定 API 風格

輸出：

- 本文件
- 新資料夾骨架
- 類別命名對照表

### Phase 1: 先拆 `WebServerController`

目標：

- 讓 route 不再集中在單一檔案
- API 路徑先統一

作法：

- 將 route registration 拆到各模組 endpoint class
- 將 `WebServerController` 改成單純組裝入口

建議形式：

- `ImageHttpEndpoints`
- `DirectoryHttpEndpoints`
- `FileHttpEndpoints`
- `WindowHttpEndpoints`
- `SystemHttpEndpoints`

### Phase 2: 重命名並瘦身 `VW`

目標：

- `VW` 從錯誤命名與邏輯混雜中脫離

作法：

- 將 `VW` 目錄淘汰
- 重新命名成各模組的 `WebViewBridge`
- 把 bridge 內直接寫死的邏輯搬到 service

### Phase 3: 逐步拆解 `Lib`

目標：

- 消除 `Lib` 作為垃圾桶目錄

作法：

- 先辨認每個 class 的責任
- 決定進 `Features` 或 `Infrastructure`
- 改掉高風險 `static`

### Phase 4: 建立共用 service registry

目標：

- WebView bridge 與 HTTP endpoint 共用同一批 service

作法：

- 在 app 啟動時建立 registry
- `WebWindow` 與 `WebServer` 從 registry 取用依賴

### Phase 5: API 與前端呼叫一起收斂

目標：

- 移除舊 API 命名
- 前後端使用一致語言

作法：

- 前端改呼叫新 path
- 舊 path 可短暫保留轉址或 wrapper
- 最後刪除兼容路由

## 檔案搬遷方向建議

以下是目前重要檔案的初步搬遷方向。

### `VW`

- `WV_Image.cs` -> `Features/Image/WebView/ImageWebViewBridge.cs`
- `WV_Directory.cs` -> `Features/Directory/WebView/DirectoryWebViewBridge.cs`
- `WV_File.cs` -> `Features/File/WebView/FileWebViewBridge.cs`
- `WV_Path.cs` -> 視內容併入 `File` 或獨立 `Path`
- `WV_RunApp.cs` -> `Features/SystemIntegration/WebView/RunAppWebViewBridge.cs`
- `WV_System.cs` -> `Features/SystemIntegration/WebView/SystemWebViewBridge.cs`
- `WV_Window.cs` -> `Features/Window/WebView/WindowWebViewBridge.cs`
- `WV_T.cs` -> 若僅測試用途，應移除或移到 `Scratch/Experimental`

### `Server`

- `WebServer.cs` -> `Infrastructure/Web/LocalHttpServer.cs`
- `WebServerController.cs` -> 拆成各 `Features/*/Http/*Endpoints.cs`

### `Lib`

- `ImgLib.cs` -> 拆入 `Features/Image/Application` 與 `Infrastructure/Imaging`
- `Exif.cs` -> `Infrastructure/Imaging/ExifReader.cs`
- `ImgFrames.cs` -> `Features/Image/Application/ImageFrameExtractionService.cs`
- `FileLib.cs` -> `Features/File/Application/FileService.cs`
- `FileSort.cs` -> `Features/Directory/Application/DirectorySortService.cs`
- `FileWatcher.cs` -> `Infrastructure/IO/FileWatcherService.cs`
- `IniManager.cs` -> `Infrastructure/IO/IniFileStore.cs`
- `SQLite.cs` -> `Infrastructure/Data/SqliteConnectionFactory.cs`
- `KnownFolders.cs` -> `Infrastructure/Windows/KnownFolderService.cs`
- `ShellContextMenu.cs` -> `Infrastructure/Windows/ShellContextMenuService.cs`
- `ShellLink.cs` -> `Infrastructure/Windows/ShellLinkService.cs`
- `WindowAPI.cs` -> `Infrastructure/Windows/NativeWindowApi.cs`
- `WindowsThumbnailProvider.cs` -> `Infrastructure/Windows/ThumbnailProvider.cs`
- `ClipboardLib.cs` -> `Features/SystemIntegration/Application/ClipboardService.cs`
- `A1111Manager.cs` -> `Features/SystemIntegration/Application/A1111Service.cs`
- `LRUCache.cs` -> `Infrastructure/Caching/LruCache.cs`

## 決策建議

### 建議採用的方案

採用「功能模組優先，技術層次之」的 hybrid 架構。

簡單說：

- 不維持原本三大垃圾桶目錄
- 不直接照抄 ASP.NET 一 API 一資料夾
- 以功能模組聚合 bridge、endpoint、service、contract

### 不建議的方案

#### 1. 只重命名不重構責任

這只能短暫提升可讀性，之後還是會繼續膨脹。

#### 2. 一個 API 一個資料夾

對 Tiefsee 這種桌面 app + 本機 bridge 專案來說太碎，會讓同一個功能散落過多地方。

#### 3. 把所有 `static` 全部機械式轉成 instance

這會做出很多只是把 `static` 拿掉、但責任仍然過大的 class，收益有限。

## 第一波實作建議

如果要開始動手，建議第一波只做下面幾件事：

1. 建立新資料夾骨架，但先不全搬
2. 拆 `WebServerController` 成多個 endpoint class
3. 將 `WV_*` 重新命名為 `*WebViewBridge`
4. 把 `WV_*` 內直接寫死的邏輯抽到 service
5. 先處理 `ImgLib`，把最明顯需要設定與初始化的部分拆出去

這一波做完後，整個專案的方向就會固定下來，之後再慢慢清其他 `Lib` 成本會低很多。

## 成功標準

當以下條件成立時，代表重構方向正確：

- 新功能加入時，不需要再思考要不要丟進 `Lib`
- WebView bridge class 大多只有薄薄一層轉接
- HTTP API 路徑命名一致，沒有 `getXxx`、`xxx2`
- 第三方影像 library 的初始化與設定都有固定入口
- 同一功能的檔案能聚在同一個模組目錄下

## 備註

這次重構最重要的不是一步到位，而是先建立之後不會再亂掉的骨架。

只要先把以下三件事做對，後面就會順很多：

- 命名對
- 責任切對
- 初始化入口放對

