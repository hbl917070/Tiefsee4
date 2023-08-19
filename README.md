# Tiefsee4

Tiefsee 是一款開源的圖片檢視器

特點功能：
- 支援多種特殊圖片格式：svg、webp、webm、psd、clip、heic、avif、qoi ...
- 快速啟動：只要 Tiefsee 尚未完全關閉，就能快速開啟 Tiefsee
- 快速拖曳：可直接將圖片拖曳到其他程式進行開啟或上傳
- 開啟網頁圖片：可將瀏覽器上的圖片直接拖曳進 Tiefsee 來進行開啟
- 線上搜圖：支援 sauceNAO, Yandex, Ascii2d, Google, Google Lens, Bing
- 檔案預覽面板：預覽同資料夾內的圖片
- 資料夾預覽面板：顯示資料夾列表，並預覽資料夾內的圖片
- 詳細資料面板：EXIF資訊、圖片拍攝地點、AI繪圖參數
- 大量瀏覽模式：一次載入多張圖片，以垂直捲動的方式查看圖片
- QuickLook：長按空白鍵預覽在桌面或資料夾選中的檔案
- 其他附加功能：PDF閱讀器、MD編輯器、文字檔編輯器、docx 與 pptx 閱讀器

界面語言：
- English
- 中文
- 日本語

<br>

官網：  
[https://hbl917070.github.io/aeropic/](https://hbl917070.github.io/aeropic/)


<br>

## 下載

當前版本：Tiefsee 4.1.3

 - <a href="https://apps.microsoft.com/store/detail/9N04QDXBNMCQ?launch=true&mode=full">
	<img src="https://get.microsoft.com/images/zh-tw%20dark.svg"/>
</a>

 - 下載 [免安裝版](https://github.com/hbl917070/Tiefsee4/releases)

<br>

## 運行需求
- x64
- Windows 10 或 Windows 11

<br>


## 程式截圖
![](https://cdn.discordapp.com/attachments/896768892003823627/1113369753160011826/2023-05-29_22-46-03.png)

![](https://cdn.discordapp.com/attachments/896768892003823627/1079441646439104532/GIF_2023-2-26_11-04-49.gif)

![](https://cdn.discordapp.com/attachments/896768892003823627/1102959644990767144/ezgif-3-9a6f5460a7.webp)

![](https://cdn.discordapp.com/attachments/896768892003823627/1113369952985022544/2023-05-29_22-07-57.png)



<br>

## 常見問題

### 1、商店版與免安裝版有什麼差異

 - 商店版與免安裝版功能上沒有差異
 - 商店版可以透過商店來進行更新，且刪除 Tiefsee 後不會留下任何資料
 - 免安裝版需要安裝 [.NET Desktop Runtime 7 (x64)](https://dotnet.microsoft.com/en-us/download/dotnet/7.0) 才能運行
 - 免安裝版可以使用「便攜模式」 ，在 Tiefsee.exe 旁邊新建一個`portableMode`資料夾，資料就都會儲存在裡面

沒有特別需求的話，我推薦使用商店版

### 2、為什麼商店版比免安裝版還要大
商店版在編譯的時候會把 NET 的執行環境整個打包進程式裡面，微軟目前尚未提出有效的解決方案。

### 3、啟動程式時顯示「WebView2 must be installed to run this application」
 可能的原因如下
 - 電腦尚未安裝 WebView2：「<a href="https://go.microsoft.com/fwlink/p/?LinkId=2124703">點此</a>」進行下載。
 - 已經安裝 WebView2 但安裝失敗：移除舊的 WebView2 後，對「WebView2 的安裝檔」右鍵→系統管理員身份執行。
 - WebView2 初始化錯誤：避免在 Tiefsee 的路徑裡面包含中文日文韓文之類的特殊字元。

### 4、使用毛玻璃(AERO、Acrylic)視窗效果後產生異常
 毛玻璃視窗效果並非 Windows 正式公開的 API，這項功能在某些裝置上可能存在 BUG，或是無法使用。常見的問題為：
 - 模糊區域溢出到視窗外
 - Tiefsee 的視窗在移動時嚴重延遲


<br>

# 專案說明
- 專案類型：C# WinForm (net 7)
- 開發語言：C#、TypeScript
- [專案建立步驟](/Building.md)

<br>

# Licenses

The Tiefsee4 project is open source under the [MIT license](/LICENSE).<br>
However, the extensions that are installed separately are not part of the Tiefsee4 project.<br>
They all have their own licenses!

<br>

Tiefsee4 的原始碼以[MIT授權](/LICENSE)形式開源，<br>
但另外安裝那些的擴充套件，並不屬於 Tiefsee4 專案的一部分，<br>
他們都有各自的授權條款！