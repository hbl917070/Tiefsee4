# Tiefsee4 專案說明

Tiefsee4 專案由2個部分構成，`C# Project` 與 `Web Project`。

<br>

# C# Project
## 功能簡述
- 以WinForm窗體來承載WebView2
- 以HttpListener部署本地伺服器
- 與WebView2橋接C#函數，讓js具有操作檔案的能力
## 開啟方式
- 專案類型為.NET Framework 4.8， WinForm
- 直接用 visual studio 即可開啟 `Tiefsee.sln`

<br>

# Web Project
## 功能簡述
- 所有UI皆透過WebView2來進行渲染，包含視窗的標題列
- 使用nodejs與gulp來處理 EJS、TypeScript、SCSS、SVG

<br>

## Web Project 路徑
```Tiefsee4\Tiefsee\Tiefsee\bin\output\www```

```
www
 ├ ejs：放ejs的目錄，編譯後會輸出成html
 ├ scss：放scss的目錄，編譯後會輸到css
 ├ ts：放ts的目錄，編譯後會輸出到js
 │
 ├ vender：放第三方js的目錄
 │
 ├ css：由gulp編譯產生
 ├ js：由gulp編譯產生
 │
 ├ MainWindow.html：主視窗，由gulp編譯產生
 ├ SettingWindow.html：設定視窗，由gulp編譯產生
 └ gulpfile.js
```

<br>

## 初始安裝
1. 安裝nodejs<br>
	https://nodejs.org/en/
2. 安裝Gulp
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
編譯EJS、TypeScript、SCSS
```
cd www
gulp watch
```

<br>

## svg使用說明
Tiefsee 具有切換主題的功能，為了讓圖示具有變色功能，因此所有圖示皆使用SVG。  
執行 `gulp watch` 後， `www/img/default` 裡面的svg檔案會全部封裝成一個js，輸出到 `www/js/SvgList.js`  

- 在svg裡面，可以用 `var(--color-white)` 來取得當前主題的主顏色，例如
	```svg
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25">
		<rect style="fill:var(--color-white)" x="7" y="12" width="11" height="1"/>
	</svg>
	```

- 在js裡面，可以透過 `SvgList["svg name"]` 來取得svg的文字，例如
	```javascript
	var svgText = SvgList["window-menu.svg"];
	```

- 在ejs裡面，不建議直接以 `<img>` 來載入svg圖片，這會讓svg無法變色，必須直接將svg的文字匯入，例如
	```html
	<div>
		<%- await readFile("./img/default/tool-rotateCcw.svg"); %>
	</div>
	```


