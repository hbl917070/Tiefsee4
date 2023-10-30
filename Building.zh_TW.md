[English](Building.md) | 中文

# Tiefsee 專案說明

Tiefsee4 裡面包含 3 個專案

## Tiefsee
- 主專案，以 WinForm 來承載 WebView2
- 專案類型： .NET 7

<br>

## TiefseeAppPackager
- 用於將 Tiefsee 專案 打包成 MSIX

<br>

## Www
- UI 專案
- 使用 npm 與 gulp 來編譯 EJS、TypeScript、SCSS、SVG

### 目錄結構
```
Www
 ├ ejs：放 ejs 的目錄，編譯後會輸出成 html
 ├ scss：放 scss 的目錄，編譯後會輸到 css
 ├ ts：放 ts 的目錄，編譯後會輸出到 js
 │
 ├ vender：放第三方 js 的目錄
 │
 ├ css：由 gulp 編譯生成
 ├ js：由 gulp 編譯產生
 │
 ├ MainWindow.html：主視窗，由 gulp 編譯產生
 ├ SettingWindow.html：設定視窗，由 gulp 編譯產生
 │
 └ gulpfile.js
```

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

### 編譯

- 打包 EJS、TypeScript、SCSS，並將處理後的檔案複製到 Tiefsee 專案 的輸出資料夾內
	```
	gulp build
	```

- 持續監控檔案變化，檔案有變化時，自動執行 `gulp build`

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
C# 常用的功能都已經經過封裝讓 JavaScript 可以直接呼叫，<br>
在大部分情況並不需要寫 C#，因此可以直接以 Visual Studio Code 開啟 `Www` 專案來進行開發。
