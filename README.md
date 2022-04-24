# Tiefsee4

## 簡述
Tiefsee是一個強調簡約設計的圖片檢視器，支援各種特殊格式 (例如psd、heic、avif、qoi

<br>

## 下載
[Tiefsee 4.0.0-beta.15](https://github.com/hbl917070/tiefsee4/releases)
(注意：此為測試版，功能尚未齊全到足以取代Tiefsee 3.0.2  

    開發中功能：  
    瀏覽多幀圖片、大量瀏覽模式、搜圖、多國語言、自定工具列、自定快速鍵、顯示exif

<br>

## 運行需求
- 作業系統：64位元的Windows 10、Windows 11
- [.NET Framework 4.8](https://dotnet.microsoft.com/en-us/download/dotnet-framework/net48) (含、以上
- [Microsoft Edge WebView2](https://developer.microsoft.com/microsoft-edge/webview2/)

<br>

## 程式截圖
![](https://cdn.discordapp.com/attachments/803673073621401633/953640384238600312/2022-03-16_01-32-52.jpg)

![](https://cdn.discordapp.com/attachments/803673073621401633/917208044578951229/2021-12-06_07-56-44.jpg)

![](https://cdn.discordapp.com/attachments/803673073621401633/917208044847366223/2021-12-06_08-04-22.jpg)

![](https://cdn.discordapp.com/attachments/803673073621401633/917208044360830986/2021-12-06_07-53-54.jpg)

<br>

## 專案說明
- 專案類型：C# WinForm (net 4.8)
- 開發語言：C#、TypeScript
- [專案建立步驟](/Building.md)

<br>

## 目前已知問題
### 1、無法使用觸控拖曳移動程式
    此問題在同樣基於webview2開發的win11 Microsoft Teams也存在，
    推測原因是chromium把touch給完全攔截，導致調用Windows API移動視窗的函數無法順利生效。

### 2、win7無法讓視窗透明化
    無解

