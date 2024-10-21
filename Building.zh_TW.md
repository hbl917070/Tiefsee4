[English](Building.md) | 中文

# Tiefsee 專案說明

Tiefsee4 包含以下 5 個子專案

## Tiefsee
程式的本體，以 WinForm 來承載 WebView2。<br>
並透過 HttpListener 提供 視窗管理、檔案操作、圖片處理 等功能的 Web API。

<br>

## TiefseeLauncher
Tiefsee 的啟動器。<br>
由於 .NET 專案匯入函式庫後即使沒有寫任何程式碼也會拖慢啟動速度，所以使用另一個乾淨的專案作為程式入口。啟動器會檢查程式本體是否正在運行，如果已在運行狀態，則使用 Pipe 通知程式本體新建一個視窗，從而實現快速啟動。

<br>

## TiefseeAppPackager
用於將 Tiefsee 專案打包成 MSIX 格式。

<br>

## BuildAll
用於編譯 Tiefsee 和 TiefseeLauncher，並將輸出結果打包成 ZIP 文件。

<br>

## Www
Web 專案，程式主要的核心邏輯都在這裡。<br>
使用 Gulp 來打包與編譯 EJS, TypeScript, SCSS, Rust

### 目錄結構
```
Www
 ├📁 ejs：編譯後會輸出成 html
 ├📁 scss：編譯後會輸到 css
 ├📁 ts：編譯後會輸出到 js
 ├📁 rust：編譯後會輸出到 wasm
 ├📁 lang：放翻譯檔的目錄
 ├📁 img：放圖片的目錄，裡面的 svg 會透過 Gulp 封裝成 js
 ├📁 iframe：iframe 頁面的 html 檔
 │
 ├📁 vender：放第三方 js 的目錄
 │
 ├📁 css：由 Gulp 編譯生成
 ├📁 js：由 Gulp 編譯產生
 ├📁 wasm：由 Gulp 編譯產生
 │
 ├ MainWindow.html：主視窗，由 Gulp 編譯產生
 ├ SettingWindow.html：設定視窗，由 Gulp 編譯產生
 │
 └ gulpfile.js
```

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
Tiefsee 具有切換主題的功能，為了讓圖示具有切換顏色的功能，因此所有圖示皆使用 SVG。  
執行 `gulp build` 後， `Www/img/default` 裡面的 SVG 檔案會全部封裝成一個 js，輸出到 `Www/js/SvgList.js`  

- 在 SVG 裡面可以用 `var(--color-white)` 來取得當前主題的主顏色，例如
	```svg
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25">
		<rect style="fill:var(--color-white)" x="7" y="12" width="11" height="1"/>
	</svg>
	```

- 在 ts 裡面可以透過 `SvgList["svg name"]` 來取得 SVG 的文字，例如
	```javascript
	var svgText = SvgList["window-menu.svg"];
	```

- 在 ejs 裡面可以透過 `<%- await readFile("./img/default/"); %>` 來取得 SVG 的文字，例如
	```html
	<div>
		<%- await readFile("./img/default/tool-rotateCcw.svg"); %>
	</div>
	```

## 補充

Tiefsee 是一個全部 UI 都以 WebiVew2 來渲染的程式，<br>
C# 常用的功能都已經經過封裝，讓 JavaScript 可以直接呼叫，<br>
在大部分情況並不需要寫 C#，因此可以直接以 Visual Studio Code 開啟 `Www` 專案來進行開發。
