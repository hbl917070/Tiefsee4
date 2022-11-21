# Tiefsee4

## 簡述
Tiefsee是一個以簡約理念設計而成的圖片檢視器，支援各種特殊格式 (例如psd、heic、avif、qoi

<br>

## 下載
[Tiefsee 4.0.0-beta.23](https://github.com/hbl917070/Tiefsee4/releases)
(注意：此為測試版

    開發中功能：  
    瀏覽多幀圖片、大量瀏覽模式、多國語言、自定快速鍵

<br>

## 運行需求
- 作業系統：64位元的Windows 10、Windows 11
- [.NET Framework 4.8](https://dotnet.microsoft.com/en-us/download/dotnet-framework/net48) (含、以上
- [Microsoft Edge WebView2](https://developer.microsoft.com/microsoft-edge/webview2/)

<br>


## 程式截圖
![](https://cdn.discordapp.com/attachments/896768892003823627/1044270942026727536/2022-11-21_23-19-27.jpg)

![](https://cdn.discordapp.com/attachments/803673073621401633/917208044578951229/2021-12-06_07-56-44.jpg)

![](https://cdn.discordapp.com/attachments/896768892003823627/1026908356125933649/2022-10-05_00-37-08.jpg)

![](https://cdn.discordapp.com/attachments/896768892003823627/1026908355274481776/2022-10-05_01-24-29.jpg)

<br>

# 專案說明
### 專案類型：C# WinForm (net 4.8)
### 開發語言：C#、TypeScript
### [專案建立步驟](/Building.md)

<br>

# 目前已知問題
### 1、無法使用觸控拖曳移動程式
> 此問題在同樣基於webview2開發的win11 Microsoft Teams也存在。<br>
於4.0.0-beta.18修復此問題，但僅是透過js計算視窗坐標，而非使用系統原生的winAPI，因此流暢度不佳。

### 2、無法於 Windows 7 運行
> 讓視窗透明化的程式碼會導致Tiefsee無法運行於 Windows 7，暫時無解決方案。

### 3、使用毛玻璃視窗後，模糊區域會溢出視窗外
> 將專案移植到UWP或winUI 3，或許可以解決此問題，但改動幅度極大，因此目前無此計劃。

### 4、視窗使用毛玻璃效果後，可能導致Tiefsee的視窗在移動時嚴重延遲
> 此BUG並非所有電腦都會發生。Tiefsee提供win7跟win10兩種毛玻璃效果，但不論是哪一種都並非Windows正式公開的API。

### 5、無法開啟長路經的檔案
> 理論上改用 .net 6 來編譯可以解決此問題，但 .net 6 的運行環境並非Windows內建的環境，因此暫時不考慮調整專案類型。

### 6、Tiefsee.exe的路徑不能含有中文日文之類的特殊字元
> 此BUG並非所有電腦都會發生。如果確定已經安裝Webview2了但依然顯示「必須安裝Webview2才能運行Tiefsee」，嘗試把Tiefsee放在沒有中文的路徑裡面執行。依然不行的話，嘗試以系統管理員身份執行Webview2的安裝程式。

<br>

# Licenses

The Tiefsee4 project is open source under the [MIT license](/LICENSE).<br>
However, the extensions that are installed separately are not part of the Tiefsee4 project.<br>
They all have their own licenses!

<br>

Tiefsee4的原始碼以[MIT授權](/LICENSE)形式開源，<br>
但另外安裝那些的擴充套件，並不屬於Tiefsee4專案的一部分，<br>
他們都有各自的授權條款！