# Tiefsee4

## 簡述

Tiefsee 是一款開源的圖片檢視器。
- 免安裝，解壓縮後即可運行
- 支援多種特殊圖片格式：webp、webm、psd、clip、heic、avif、qoi ...

特點功能：
- 快速啟動：只要 Tiefsee 尚未完全關閉，就能快速開啟 Tiefsee
- 快速拖曳：可直接將圖片拖曳到其他程式進行開啟或上傳
- 開啟網頁圖片：可將瀏覽器上的圖片直接拖曳進 Tiefsee 來進行開啟
- 線上搜圖：支援 sauceNAO, Yandex, Ascii2d, Google, Google Lens, Bing
- 檔案預覽面板：預覽同資料夾內的圖片
- 資料夾預覽面板：顯示資料夾列表，並預覽資料夾內的圖片
- 詳細資料面板：EXIF資訊、圖片拍攝地點、AI繪圖參數
- QuickLook：長按空白鍵預覽在桌面或資料夾選中的檔案
- 其他附加功能：PDF閱讀器、MD編輯器、文字檔編輯器、docx 與 pptx 閱讀器

界面語言：
- English
- 中文
- 日本語

<br>

## 下載
[Tiefsee 4.0.0-beta.25](https://github.com/hbl917070/Tiefsee4/releases)

    開發中功能：  
    瀏覽多幀圖片、大量瀏覽模式、自定快速鍵
<br>

## 運行需求
- 64位元
- Windows 10 或 Windows 11
- [.NET Framework 4.8](https://dotnet.microsoft.com/en-us/download/dotnet-framework/net48) (含、以上)
- [Microsoft Edge WebView2](https://developer.microsoft.com/microsoft-edge/WebView2/)

<br>


## 程式截圖
![](https://cdn.discordapp.com/attachments/896768892003823627/1044270942026727536/2022-11-21_23-19-27.jpg)

![](https://cdn.discordapp.com/attachments/803673073621401633/917208044578951229/2021-12-06_07-56-44.jpg)

![](https://cdn.discordapp.com/attachments/896768892003823627/1026908356125933649/2022-10-05_00-37-08.jpg)

![](https://cdn.discordapp.com/attachments/896768892003823627/1026908355274481776/2022-10-05_01-24-29.jpg)

<br>

# 常見問題

### 1、啟動程式時顯示「WebView2 must be installed to run this application」
> 可能原因為
> - 電腦尚未安裝 WebView2：「<a href="https://go.microsoft.com/fwlink/p/?LinkId=2124703">點此</a>」進行下載。
> - WebView2 安裝失敗：移除舊的 WebView2 後，對「WebView2 的安裝檔」右鍵→系統管理員身份執行。
> - WebView2 初始化錯誤：避免在 Tiefsee 的路徑裡面包含中文日文韓文之類的特殊字元。

### 2、使用毛玻璃(AERO、Acrylic)視窗效果後產生異常
> 毛玻璃視窗效果並非 Windows 正式公開的 API，這項功能在某些裝置上可能存在BUG，或是無法使用。常見的問題為：
> - 模糊區域溢出到視窗外
> - Tiefsee的視窗在移動時嚴重延遲

### 3、無法開啟長路經的檔案
> 理論上改用 .net 6 來編譯可以解決此問題，但 .net 6 的運行環境並非Windows內建的環境，因此暫時不考慮調整專案類型。

### 4、在觸控螢幕上以觸控來移動Tiefsee視窗時，流暢度不佳
> WebView2 會將「觸控指令」攔截，導致無法使用 winAPI 來移動視窗。目前尚無解決方案。

<br>

# 專案說明
- 專案類型：C# WinForm (net 4.8)
- 開發語言：C#、TypeScript
- [專案建立步驟](/Building.md)

<br>

# Licenses

The Tiefsee4 project is open source under the [MIT license](/LICENSE).<br>
However, the extensions that are installed separately are not part of the Tiefsee4 project.<br>
They all have their own licenses!

<br>

Tiefsee4的原始碼以[MIT授權](/LICENSE)形式開源，<br>
但另外安裝那些的擴充套件，並不屬於Tiefsee4專案的一部分，<br>
他們都有各自的授權條款！