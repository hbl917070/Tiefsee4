# tiefsee4
> TiefSee是圖片檢視軟體。 4.0.0版全面改寫架構，程式UI界面全部以HTML、css、JavaScript渲染，可實現半透明視窗與AERO毛玻璃視窗。目前程式還在測試階段，功能尚未齊全到足以取代TiefSee 3.0.2

目前版本：TiefSee 4.0.0-bate.2
[下載測試版](https://github.com/hbl917070/tiefsee4/releases)

- 專案類型：C# WinForm(net 4.7.2)
- UI渲染方式：WebView2
- 開發語言：TypeScript 

## 運行需求
- 作業系統：win7、win8、win10、win11
- [.NET Framework 4.7.2](https://dotnet.microsoft.com/download/dotnet-framework/net472) (含、以上
- [Microsoft Edge WebView2](https://developer.microsoft.com/microsoft-edge/webview2/)



## 程式截圖

![](https://cdn.discordapp.com/attachments/803673073621401633/917208044578951229/2021-12-06_07-56-44.jpg)

![](https://cdn.discordapp.com/attachments/803673073621401633/917208044847366223/2021-12-06_08-04-22.jpg)

![](https://cdn.discordapp.com/attachments/803673073621401633/917208044360830986/2021-12-06_07-53-54.jpg)


## 目前已知問題

### 1、無法使用觸控拖曳移動程式
此問題在同樣基於webview2開發的win11 Microsoft Teams也存在，推測原因是chromium把touch給完全攔截，導致調用Windows API移動視窗的函數無法順利生效。<br>
這問題大概只有微軟自己能解決吧

### 2、渲染特定圖片會很吃力
tiefsee4使用js的createImageBitmap來對圖片進行縮小處理，一般的情況下createImageBitmap都能在不影響使用體驗的情況下高速繪製高品質圖片圖片，但某些特殊圖片則處理的非常慢。<br>
例如這張 [清明上河圖](https://mega.nz/file/hcB3GQSC#yL0WAQEvqVn5B1d3Zpp7Nt3IYjMQ5faJcTsfp_gwc10) ，縮放與拖曳都需要很長的計算時間


### 3、啟動程式的速度偏慢
初始化webview2大約需要1秒，之後會嘗試讓程式常駐在背景，這樣就不需要這1秒的初始化成本。<br>
我用另一台灌win11筆電來測試，開啟幾乎是無延遲，可能是win11有優化webview2，直接讓他變成系統核心常駐在背景？

### 4、win7無法讓視窗透明化
無解

### 5、webview2的js跟C#溝通一次的成本大約是7ms
假設有個模組需要讀取資料夾裡面所有檔案的修改日期，這個資料夾有1000個檔案。<br>
用js撰寫此模組的話，js需要跟C#溝通1000次才能取得所有檔案的修改日期，這將需要7000ms的溝通時間，<br>
用C#撰寫此模組的話，js只需要跟C#溝通一次，溝通時間只需要7ms。<br>
這個限制會導致專案的耦合性上升，因為沒辦法把所有邏輯都使用js來撰寫

