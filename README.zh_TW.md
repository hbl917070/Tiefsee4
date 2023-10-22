﻿[English](README.md) | 中文

<p align="center">
<img width="120" align="center" src="https://hbl917070.github.io/aeropic/img/tiefseeLogo.png">
</p>

<h1 align="center">
Tiefsee
</h1>

<p align="center">
<a target="_blank" href="https://github.com/hbl917070/Tiefsee4/blob/master/LICENSE"><img alt="GitHub" src="https://img.shields.io/github/license/hbl917070/Tiefsee4?style=for-the-badge"></a>
<a target="_blank" href="https://github.com/hbl917070/Tiefsee4/releases"><img alt="GitHub release (with filter)" src="https://img.shields.io/github/v/release/hbl917070/Tiefsee4?style=for-the-badge"></a>
<a target="_blank" href="https://github.com/hbl917070/Tiefsee4/releases"><img alt="GitHub all releases" src="https://img.shields.io/github/downloads/hbl917070/Tiefsee4/total?style=for-the-badge"></a>
<a target="_blank" href="https://github.com/hbl917070/Tiefsee4/commits/master"><img alt="GitHub last commit (branch)" src="https://img.shields.io/github/last-commit/hbl917070/TIefsee4/master?style=for-the-badge"></a>
</p>

<p align="center">
一款適用於 Windows 的開源圖片檢視器，具有強大的功能和易用性
</p>

<p align="center">
官網：<a href="https://hbl917070.github.io/aeropic/zh-TW/">hbl917070.github.io/aeropic</a>
</p>

<br>

## 下載

> 運行需求：64位元的 Windows 10 或 Windows 11

### 當前版本 Tiefsee 4.1.4

 - <a href="https://apps.microsoft.com/store/detail/9N04QDXBNMCQ?launch=true&mode=full">
	<img src="https://get.microsoft.com/images/zh-tw%20dark.svg"/></a>

 - 下載 [免安裝版](https://github.com/hbl917070/Tiefsee4/releases)

<br>

## 介紹
- 支援多種特殊圖片格式：svg、webp、webm、psd、clip、heic、avif、qoi ...
- 快速啟動：只要 Tiefsee 尚未完全關閉，就能快速開啟 Tiefsee
- 快速拖曳：可直接將圖片拖曳到其他程式進行開啟或上傳
- 開啟網頁圖片：可將 瀏覽器 或 Discord 的圖片直接拖曳進 Tiefsee 來進行開啟
- 線上搜圖：支援 sauceNAO, Yandex, Ascii2d, Google, Google Lens, Bing
- 檔案預覽面板：預覽同資料夾內的圖片
- 資料夾預覽面板：顯示資料夾列表，並預覽資料夾內的圖片
- 詳細資料面板：EXIF資訊、圖片拍攝地點、AI繪圖參數(A1111, NovelAI, ComfyUI, InvokeAI)
- 大量瀏覽模式：一次載入多張圖片，以垂直捲動的方式查看圖片
- QuickLook：長按空白鍵預覽在桌面或資料夾選中的檔案
- 其他附加功能：PDF閱讀器、MD編輯器、文字檔編輯器、docx 與 pptx 閱讀器
- 界面語言：English、中文、中文
 
<br>

![](https://hbl917070.github.io/aeropic/img/index/windowTheme.jpg)

![](https://hbl917070.github.io/aeropic/img/index/filePanel.jpg)

![](https://hbl917070.github.io/aeropic/img/index/bulkView.webp)

![](https://hbl917070.github.io/aeropic/img/index/openWebImage.webp)

<br>

## 常見問題

### 1、商店版與免安裝版有什麼差異

 - 商店版與免安裝版功能上沒有差異
 - 商店版可以透過商店來進行更新，且刪除 Tiefsee 後不會留下任何資料
 - 免安裝版需要安裝 [.NET Desktop Runtime 7 (x64)](https://dotnet.microsoft.com/en-us/download/dotnet/7.0) 才能運行
 - 免安裝版可以使用「便攜模式」 ，在 Tiefsee.exe 旁邊新建一個`portableMode`資料夾，資料就都會儲存在裡面

> 沒有特別需求的話，我推薦使用商店版

<br>

### 2、為什麼商店版比免安裝版還要大
商店版在編譯的時候會把 NET 的執行環境整個打包進程式裡面，微軟目前尚未提出有效的解決方案。

<br>

### 3、啟動程式時顯示「WebView2 must be installed to run this application」
 可能的原因如下
 - 電腦尚未安裝 WebView2：「<a href="https://go.microsoft.com/fwlink/p/?LinkId=2124703">點此</a>」進行下載。
 - 已經安裝 WebView2 但安裝失敗：移除舊的 WebView2 後，對「WebView2 的安裝檔」右鍵→系統管理員身份執行。
 - WebView2 初始化錯誤：避免在 Tiefsee 的路徑裡面包含中文日文韓文之類的特殊字元。
 
<br>

### 4、使用毛玻璃(AERO、Acrylic)視窗效果後產生異常
 毛玻璃視窗效果並非 Windows 正式公開的 API，這項功能在某些裝置上可能存在 BUG，或是無法使用。常見的問題為：
 - 模糊區域溢出到視窗外
 - Tiefsee 的視窗在移動時嚴重延遲

<br>

## 專案說明
- 專案類型：C# WinForm (net 7)
- 開發語言：C#、TypeScript
- [專案建立步驟](/Building.md)

<br>

## Licenses

Tiefsee4 的原始碼以[MIT授權](/LICENSE)形式開源，<br>
但另外安裝那些的擴充套件，並不屬於 Tiefsee4 專案的一部分，<br>
他們都有各自的授權條款！