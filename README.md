# Tiefsee4

## 簡述
Tiefsee是一個強調簡約設計的圖片檢視器，支援各種特殊格式 (例如psd、heic、avif、qoi

<br>

## 下載
[Tiefsee 4.0.0-beta.20](https://github.com/hbl917070/tiefsee4/releases)
(注意：此為測試版，有某些功能是Tiefsee 3.0.2有但是測試版沒有的

    開發中功能：  
    瀏覽多幀圖片、大量瀏覽模式、多國語言、自定快速鍵

<br>

## 運行需求
- 作業系統：64位元的Windows 10、Windows 11
- [.NET Framework 4.8](https://dotnet.microsoft.com/en-us/download/dotnet-framework/net48) (含、以上
- [Microsoft Edge WebView2](https://developer.microsoft.com/microsoft-edge/webview2/)

<br>


## 程式截圖
![](https://cdn.discordapp.com/attachments/896768892003823627/992137114324054127/2022-07-01_02-22-15.jpg)

![](https://cdn.discordapp.com/attachments/803673073621401633/953640384238600312/2022-03-16_01-32-52.jpg)

![](https://cdn.discordapp.com/attachments/803673073621401633/917208044578951229/2021-12-06_07-56-44.jpg)

![](https://cdn.discordapp.com/attachments/803673073621401633/917208044847366223/2021-12-06_08-04-22.jpg)

![](https://cdn.discordapp.com/attachments/803673073621401633/917208044360830986/2021-12-06_07-53-54.jpg)

<br>

# 專案說明
### 專案類型：C# WinForm (net 4.8)
### 開發語言：C#、TypeScript
### [專案建立步驟](/Building.md)

<br>

# 目前已知問題
### 1、無法使用觸控拖曳移動程式
> 此問題在同樣基於webview2開發的win11 Microsoft Teams也存在。<br>
於4.0.0-beta.18修復此問題，但因為非使用winAPI來拖曳視窗，而是單純透過js來計算視窗坐標，因此功能不完整。

### 2、win7無法讓視窗透明化
> webview2的透明背景不支援win7。

### 3、使用毛玻璃視窗後，模糊區域會溢出視窗外
> 改用UWP專案或winUI 3專案，或許可以解決此問題。

### 4、視窗使用毛玻璃效果後，可能導致Tiefsee的視窗在移動時嚴重延遲
> 此BUG並非在所有電腦都會發生，Tiefsee提供win7跟win10兩種毛玻璃效果，但不論是哪一種都並非Windows正式公開的API。改用UWP專案或winUI 3專案，或許可以解決此問題。

<br>

# Licenses

The Tiefsee4 project is open source under the [MIT license](/LICENSE).<br>
However, the extensions that are installed separately are not part of the Tiefsee4 project.<br>
They all have their own licenses!

<br>

Tiefsee4的原始碼以[MIT授權](/LICENSE)形式開源，<br>
但另外安裝那些的擴充套件，並不屬於Tiefsee4專案的一部分，<br>
他們都有各自的授權條款！