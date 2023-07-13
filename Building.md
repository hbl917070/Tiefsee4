# Tiefsee4 專案說明

Tiefsee4 專案由2個部分構成，`C# Project` 與 `Web Project`。

<br>

# C# Project
## 功能簡述
- 以 WinForm 窗體來承載 WebView2
- 以 HttpListener 部署本地伺服器
- 與 WebView2 橋接 C# 函數，讓 js 具有操作檔案的能力
## 開啟方式
- 專案類型為 .NET Framework 7， WinForm
- 直接用 visual studio 即可開啟 `Tiefsee.sln`

<br>

# Web Project
## 功能簡述
- 所有 UI 皆透過 WebView2 來進行渲染，包含視窗的標題列
- 使用 npm 與 gulp 來處理 EJS、TypeScript、SCSS、SVG

<br>

## Web Project 路徑
```Tiefsee4\Tiefsee\www```

```
www
 ├ ejs：放 ejs 的目錄，編譯後會輸出成html
 ├ scss：放 scss 的目錄，編譯後會輸到css
 ├ ts：放 ts 的目錄，編譯後會輸出到js
 │
 ├ vender：放第三方js的目錄
 │
 ├ css：由 gulp 編譯產生
 ├ js：由 gulp 編譯產生
 │
 ├ MainWindow.html：主視窗，由 gulp 編譯產生
 ├ SettingWindow.html：設定視窗，由 gulp 編譯產生
 └ gulpfile.js
```

<br>

## 初始安裝
1. 安裝 nodejs<br>
	https://nodejs.org/en/
2. 安裝 Gulp
	```
	npm install gulp -g
	```
3. 開啟到 Tiefsee 裡面的 www 目錄
	```
	cd www
	```
4. 更新npm套件。 
	```
	npm i
	```

<br>

## 編譯方式
處理 EJS、TypeScript、SCSS
```
gulp watch
```
將所有 www 處理後的檔案與靜態資源，複製到專案的輸出資料夾內 (用 visual studio 編譯 net 專案時，會自動執行此動作)

```
gulp copy-files
```
 - 專案的輸出資料夾 `Tiefsee4\Tiefsee\bin\x64\Debug\net7.0-windows10.0.17763.0`


<br>

## SVG 圖示使用說明
Tiefsee 具有切換主題的功能，為了讓圖示具有切換顏色的功能，因此所有圖示皆使用 SVG。  
執行 `gulp watch` 後， `www/img/default` 裡面的 SVG 檔案會全部封裝成一個 js，輸出到 `www/js/SvgList.js`  

- 在 SVG 裡面可以用 `var(--color-white)` 來取得當前主題的主顏色，例如
	```svg
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25">
		<rect style="fill:var(--color-white)" x="7" y="12" width="11" height="1"/>
	</svg>
	```

- 在 js 裡面可以透過 `SvgList["svg name"]` 來取得 SVG 的文字，例如
	```javascript
	var svgText = SvgList["window-menu.svg"];
	```

- 在 ejs 裡面可以透過 `<%- await readFile("./img/default/"); %>` 來取得 SVG 的文字，例如
	```html
	<div>
		<%- await readFile("./img/default/tool-rotateCcw.svg"); %>
	</div>
	```
