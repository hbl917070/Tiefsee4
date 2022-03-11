# Tiefsee4
> Tiefsee是圖片檢視軟體。 4.0.0版全面改寫架構，程式UI界面全部以HTML、css、JavaScript渲染，可實現半透明視窗與AERO毛玻璃視窗。目前程式還在測試階段，功能尚未齊全到足以取代Tiefsee 3.0.2

目前版本：Tiefsee 4.0.0-beta.10
[下載測試版](https://github.com/hbl917070/tiefsee4/releases)

- 專案類型：C# WinForm(net 4.8.0)
- UI渲染方式：WebView2
- 開發語言：TypeScript 

## 運行需求
- 作業系統：win7、win8、win10、win11
- [.NET Framework 4.7.2](https://dotnet.microsoft.com/download/dotnet-framework/net472) (含、以上
- [Microsoft Edge WebView2](https://developer.microsoft.com/microsoft-edge/webview2/)



## 程式截圖

![](https://cdn.discordapp.com/attachments/896768892003823627/950050105866743828/2022-03-06_06-22-07.jpg)

![](https://cdn.discordapp.com/attachments/803673073621401633/917208044578951229/2021-12-06_07-56-44.jpg)

![](https://cdn.discordapp.com/attachments/803673073621401633/917208044847366223/2021-12-06_08-04-22.jpg)

![](https://cdn.discordapp.com/attachments/803673073621401633/917208044360830986/2021-12-06_07-53-54.jpg)


## 目前已知問題

### 1、無法使用觸控拖曳移動程式
此問題在同樣基於webview2開發的win11 Microsoft Teams也存在，推測原因是chromium把touch給完全攔截，導致調用Windows API移動視窗的函數無法順利生效。<br>
這問題大概只有微軟自己能解決吧

### 2、win7無法讓視窗透明化
無解

