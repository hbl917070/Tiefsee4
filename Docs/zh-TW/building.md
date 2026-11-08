[English](../en/building.md) | 中文

# Tiefsee 專案說明

Tiefsee4 包含以下 4 個子專案

## Tiefsee
程式的本體，以 WinForm 來承載 WebView2。<br>
並透過 HttpListener 提供 視窗管理、檔案操作、圖片處理 等功能的 Web API。

<br>

## TiefseeAppPackager
用於將 Tiefsee 專案打包成 MSIX 格式。

<br>

## BuildAll
用於編譯 Tiefsee 與 native host，並將輸出結果打包成 ZIP 文件。

<br>

## 編譯環境

### Native Host（C++）

`TiefseeNativeHost` 是 Windows 原生啟動器，負責在載入 .NET CLR 前處理啟動模式與 instance 間的快速轉交。

編譯此專案需要：

- Visual Studio 的「使用 C++ 的桌面開發」工作負載
- MSVC v143 Platform Toolset
- Windows 10 SDK
- MSBuild
- x64 編譯環境

若使用 Visual Studio 18，還需要安裝 MSVC v143 的 14.44.35207 工具版本；Visual Studio 17 會使用 v143 的預設工具版本。

專案使用 `/MT` 靜態連結 C/C++ Runtime，因此使用者電腦不需要另外安裝 Visual C++ Redistributable。原始碼使用 UTF-8，C++ 專案已設定 `/utf-8`。

### 完整 Tiefsee 專案

除了上述 C++ 編譯工具，完整編譯還需要：

- .NET 8 SDK
- NuGet 還原所需的網路連線與套件來源
- WebView2 SDK（由 NuGet 套件提供）
- Node.js、Gulp、Rust、`wasm32-unknown-unknown` 與 `wasm-pack`（請參考下方 Www 初始安裝）

目前專案以 x64 為主要編譯目標。MSIX 打包還需要 Visual Studio 的 Windows App Packaging 工具與套件簽章環境。

執行已打包的 MSIX 時，.NET runtime 會隨套件提供；免安裝版則需要電腦已安裝 .NET 8 Desktop Runtime。程式建立 WebView2 視窗時，仍需要系統已安裝 WebView2 Runtime。

<br>

## Www
Web 專案，程式主要的核心邏輯都在這裡。<br>
使用 Gulp 來打包與編譯 EJS, TypeScript, SCSS, Rust，並將產生的靜態檔輸出到 `Output/Www`

### 目錄結構
`Www` 放的是前端原始碼，包含 EJS、SCSS、TypeScript、Rust、圖片以及開發時使用的其他靜態資源。

`Output/Www` 放的是執行 `gulp build` 後產生的輸出結果，包含 HTML、CSS、JS、WASM，以及建置時一併複製的第三方檔案。

<br>

### 初始安裝
1. 安裝 nodejs<br>
	https://nodejs.org/

<br>

2. 安裝 Gulp
	```
	npm install gulp -g	
	```

<br>

3. 開啟到 Tiefsee4 裡面的 Www 目錄
	```
	cd Www
	```
<br>

4. 更新 npm 套件
	```
	npm i
	```
<br>

5. 安裝 Rust<br>
	https://www.rust-lang.org/tools/install

<br>

6. 安裝 wasm32-unknown-unknown
	```
	rustup target add wasm32-unknown-unknown
	```

<br>

7. 安裝 wasm-pack
	```
	cargo install wasm-pack
	```

### 編譯

- 打包與編譯 EJS, TypeScript, SCSS, Rust，並將處理後的檔案複製到 Tiefsee 專案 的輸出資料夾內
	```
	gulp build
	```
<br>

- 持續監控檔案變化，檔案有變化時，自動執行打包與編譯

	```
	gulp watch
	```

<br>


### SVG 圖示使用說明
Tiefsee 的介面圖示使用 Fluent System Icons 與專案自訂 SVG。官方圖示來源是 [microsoft/fluentui-system-icons](https://github.com/microsoft/fluentui-system-icons)，授權為 MIT；目前收錄的官方 SVG 來自 `@fluentui/svg-icons@1.1.345`。

- `Www/img/fluent` 放官方 Fluent SVG，保留套件檔名，例如 `add_20_regular.svg`。
- `Www/img/fluent-overrides` 放修改過的 Fluent 圖示及需要加入同一圖示表的專案圖示。若與 `fluent` 有相同檔名，`fluent-overrides` 版本會優先使用。
- 單色 SVG 的填色直接寫在來源檔中，使用 `var(--color-white)`，例如：
	```svg
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
		<g style="fill:var(--color-white)">
			<path d="..." />
		</g>
	</svg>
	```
	子元素若有寫死的 `fill` 顏色，需移除或改用主題變數，否則會蓋過群組填色。需要保留透明區域時可保留 `fill="none"`。SVG 來源檔就是實際插入網頁的內容；gulp 不會再於建置時改寫 SVG。
- `gulp svg` 將上述兩個資料夾合併成 `Output/Www/js/SvgList.js`，以檔名作為 key；同名圖示由 `fluent-overrides` 覆蓋。TypeScript 可用 `SvgList["add_20_regular.svg"]` 取得內容：
	```javascript
	const svgText = SvgList["add_20_regular.svg"];
	```
- EJS 使用 `readSvg` helper 取得同一份合併後的圖示；不要在模板中指定圖示資料夾路徑：
	```ejs
	<div>
		<%- await readSvg("app_folder_20_regular.svg") %>
	</div>
	```
	找不到圖示或檔名格式錯誤時，EJS 建置會報錯。一般非 SVG 檔案仍使用 `readFile`。

## 補充

Tiefsee 是一個全部 UI 都以 WebiVew2 來渲染的程式，<br>
C# 常用的功能都已經經過封裝，讓 JavaScript 可以直接呼叫，<br>
在大部分情況並不需要寫 C#，因此可以直接以 Visual Studio Code 開啟 `Www` 專案來進行開發。
