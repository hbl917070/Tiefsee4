using System.IO;
using System.Runtime.InteropServices;
using static Tiefsee.WindowStyle;

namespace Tiefsee;

[ComVisible(true)]
public class WindowWebViewBridge {

    public WebWindow M;
    private readonly WindowBrowserService _windowBrowserService = new();
    private readonly WindowStartupConfigService _windowStartupConfigService = new();
    private readonly AppRuntimePathService _appRuntimePathService = new();
    private readonly SubWindowService _subWindowService = new();

    /// <summary>
    /// 建立視窗相關的 WebView bridge
    /// </summary>
    /// <param name="m"></param>
    public WindowWebViewBridge(WebWindow m) {
        this.M = m;
    }

    /// <summary>
    /// 清理 webview2 的暫存
    /// </summary>
    public void ClearBrowserCache() {
        _windowBrowserService.ClearBrowserCache(M);
    }

    /// <summary>
    /// 開啟開發人員工具
    /// </summary>
    public void OpenDevTools() {
        _windowBrowserService.OpenDevTools(M);
    }

    /// <summary>
    /// 取得 webview2 版本資訊
    /// </summary>
    public async Task<string> GetBrowserVersionString() {
        return await _windowBrowserService.GetBrowserVersionString();
    }

    /// <summary>
    /// 儲存到 start.ini
    /// </summary>
    /// <param name="startPort"> 程式開始的 port </param>
    /// <param name="startType"> 1=直接啟動  2=快速啟動  3=快速啟動+常駐  4=單一個體  5=單一個體+常駐 </param>
    public void SetStartIni(int startPort, int startType) {
        _windowStartupConfigService.SetStartIni(startPort, startType);
    }

    /// <summary>
    /// 取得 AppInfo
    /// </summary>
    /// <returns></returns>
    public string GetAppInfo() {
        return _appRuntimePathService.GetAppInfo(M);
    }

    /// <summary>
    /// 新開子視窗
    /// </summary>
    /// <param name="url"></param>
    /// <param name="args"></param>
    /// <returns></returns>
    public async Task<WebWindow> NewWindow(string url, object[] args) {
        return await _subWindowService.NewWindow(M, url, args);
    }

    /// <summary>
    /// 新開子視窗
    /// </summary>
    /// <param name="url"> html 檔的路徑 </param>
    /// <param name="args"> 命令列參數 </param>
    /// <param name="windowKey"> 用於判斷是否已經啟動過視窗的 key </param>
    /// <returns> true=啟動成功 false=已經啟動過 </returns>
    public async Task<bool> NewSubWindow(string url, object[] args, string windowKey) {
        return await _subWindowService.NewSubWindow(M, url, args, windowKey, SetOwner);
    }

    /// <summary>
    /// 關閉全部的視窗
    /// </summary>
    public void Exit() {
        SingleInstanceCoordinator.Exit();
    }

    /// <summary>
    /// 網頁載入完成後，呼叫此函數才會顯示視窗
    /// </summary>
    public void ShowWindow() {
        M.ShowWindow();
    }

    /// <summary>
    /// 網頁載入完成後，呼叫此函數才會顯示視窗，指定起始坐標
    /// </summary>
    /// <param name="x"></param>
    /// <param name="y"></param>
    /// <param name="width"></param>
    /// <param name="height"></param>
    /// <param name="windowState"></param>
    public void ShowWindowAtPosition(int x, int y, int width, int height, string windowState) {
        M.ShowWindowAtPosition(x, y, width, height, windowState);
    }

    /// <summary>
    /// 網頁載入完成後，呼叫此函數才會顯示視窗，子視窗從父視窗中間開啟
    /// </summary>
    /// <param name="width"></param>
    /// <param name="height"></param>
    public void ShowWindowAtCenter(int width, int height) {
        M.ShowWindowAtCenter(width, height);
    }

    /// <summary>
    /// 設定視窗最小size
    /// </summary>
    /// <param name="w"></param>
    /// <param name="h"></param>
    public void SetMinimumSize(int w, int h) {
        M.MinimumSize = new(w, h);
    }

    /// <summary>
    /// 設定視窗size
    /// </summary>
    /// <param name="w"></param>
    /// <param name="h"></param>
    public void SetSize(int w, int h) {
        M.SetSize(w, h);
    }

    /// <summary>
    /// 設定視窗坐標
    /// </summary>
    /// <param name="left"></param>
    /// <param name="top"></param>
    public void SetPosition(int left, int top) {
        M.SetPosition(left, top);
    }

    /// <summary>
    /// 視窗效果
    /// </summary>
    /// <param name="type"></param>
    public void WindowStyle(string type) {
        type = type.ToLower();

        if (StartWindow.isWin11) {
            if (type == "none" || type == "default") {
                M.WindowStyleForWin11(SystemBackdropType.None);
            }
            else if (type == "acrylicdark") {
                M.WindowThemeForWin11(ImmersiveDarkMode.Enabled);
                M.WindowStyleForWin11(SystemBackdropType.Acrylic);
            }
            else if (type == "acryliclight") {
                M.WindowThemeForWin11(ImmersiveDarkMode.Disabled);
                M.WindowStyleForWin11(SystemBackdropType.Acrylic);
            }
            else if (type == "micadark") {
                M.WindowThemeForWin11(ImmersiveDarkMode.Enabled);
                M.WindowStyleForWin11(SystemBackdropType.Mica);
            }
            else if (type == "micalight") {
                M.WindowThemeForWin11(ImmersiveDarkMode.Disabled);
                M.WindowStyleForWin11(SystemBackdropType.Mica);
            }
            else if (type == "micaaltdark") {
                M.WindowThemeForWin11(ImmersiveDarkMode.Enabled);
                M.WindowStyleForWin11(SystemBackdropType.MicaAlt);
            }
            else if (type == "micaaltlight") {
                M.WindowThemeForWin11(ImmersiveDarkMode.Disabled);
                M.WindowStyleForWin11(SystemBackdropType.MicaAlt);
            }
        }
        else {
            M.WindowStyleForWin10(type);
        }
    }

    /// <summary>
    /// win11 視窗圓角
    /// </summary>
    /// <param name="enable"></param>
    public void WindowRoundedCorners(bool enable) {
        M.WindowRoundedCorners(enable);
    }

    /// <summary>
    /// 設定縮放倍率，預設 1.0
    /// </summary>
    /// <param name="d"></param>
    public void SetZoomFactor(double d) {
        M.Wv2.ZoomFactor = d;
    }

    /// <summary>
    /// 取得縮放倍率
    /// </summary>
    /// <returns></returns>
    public double GetZoomFactor() {
        return M.Wv2.ZoomFactor;
    }

    /// <summary>
    /// 傳入 webWindow，將其設為目前視窗的子視窗
    /// </summary>
    /// <param name="window"></param>
    public void SetOwner(object window) {
        _subWindowService.SetOwner(M, window);
    }

    /// <summary>
    /// 在父親視窗運行 js
    /// </summary>
    /// <param name="js"></param>
    public async Task<string> RunJsOfParent(string js) {
        if (M.ParentWindow == null) { return ""; }
        if (M.ParentWindow.Wv2.CoreWebView2 == null) { return ""; }
        return await M.ParentWindow.Wv2.CoreWebView2.ExecuteScriptAsync(js);
    }

    /// <summary>
    /// 設定視窗的 icon
    /// </summary>
    /// <param name="path"></param>
    public void SetIcon(string path) {
        if (File.Exists(path)) {
            M.Icon = new(path);
        }
    }

    /// <summary>
    /// 取得程式的暫存資料夾，例如 C:\Users\user\AppData\Local\Tiefsee
    /// </summary>
    /// <returns></returns>
    public string GetAppDataPath() {
        return _appRuntimePathService.GetAppDataPath();
    }

    /// <summary>
    /// 取得執行檔所在的資料夾
    /// </summary>
    /// <returns></returns>
    public string GetAppDirPath() {
        return _appRuntimePathService.GetAppDirPath();
    }

    /// <summary>
    /// 取得執行檔路徑 (TiefseeCore.exe 的路徑)
    /// </summary>
    /// <returns></returns>
    public string GetAppPath() {
        return _appRuntimePathService.GetAppPath();
    }

    /// <summary>
    /// 取得 Tiefsee.exe 的路徑
    /// </summary>
    /// <returns></returns>
    public string GetTiefseePath() {
        return _appRuntimePathService.GetTiefseePath();
    }

    /// <summary>
    /// 取得命令列參數
    /// </summary>
    /// <returns></returns>
    public string[] GetArguments() {
        return M.Args;
    }

    /// <summary>
    /// 返回 WebWindow
    /// </summary>
    /// <returns></returns>
    public WebWindow This() {
        return M;
    }

    /// <summary>
    /// 標題
    /// </summary>
    public string Text {
        get { return M.Text; }
        set { M.Text = value; }
    }

    public int Left {
        get { return M.Left; }
        set { M.Left = value; }
    }

    public int Top {
        get { return M.Top; }
        set { M.Top = value; }
    }

    public int Width {
        get { return M.Width; }
        set { M.Width = value; }
    }

    public int Height {
        get { return M.Height; }
        set { M.Height = value; }
    }

    public bool Visible {
        get { return M.Visible; }
        set { M.Visible = value; }
    }

    /// <summary>
    /// 視窗狀態
    /// </summary>
    public string WindowState {
        get {
            if (M.WindowState == FormWindowState.Maximized) { return "Maximized"; }
            if (M.WindowState == FormWindowState.Minimized) { return "Minimized"; }
            if (M.WindowState == FormWindowState.Normal) { return "Normal"; }
            return "null";
        }
        set {
            if (value == "Maximized") { M.WindowState = FormWindowState.Maximized; }
            if (value == "Minimized") { M.WindowState = FormWindowState.Minimized; }
            if (value == "Normal") { M.WindowState = FormWindowState.Normal; }
        }
    }

    /// <summary>
    /// 啟用或關閉 全螢幕
    /// </summary>
    /// <param name="val"></param>
    public void SetFullScreen(bool val) {
        M.SetFullScreen(val);
    }

    /// <summary>
    /// 取得當前是否為 全螢幕
    /// </summary>
    /// <returns></returns>
    public bool GetFullScreen() {
        return M.GetFullScreen();
    }

    /// <summary>
    /// 關閉視窗
    /// </summary>
    public void Close() {
        M.CloseWindow();
    }

    /// <summary>
    /// 隱藏視窗
    /// </summary>
    public void Hide() {
        M.HideWindow();
    }

    /// <summary>
    /// 視窗固定在最上層
    /// </summary>
    public Boolean TopMost {
        get { return M.TopMost; }
        set { M.TopMost = value; }
    }

    public double Opacity {
        get { return M.Opacity; }
        set { M.Opacity = value; }
    }

    /// <summary>
    /// 拖曳視窗
    /// </summary>
    /// <param name="type"></param>
    public void WindowDrag(string type) {
        // 只有滑鼠左鍵按下時才允許拖曳或縮放視窗
        if (Control.MouseButtons != MouseButtons.Left) {
            return;
        }

        // 將前端傳入的縮寫轉成 Win32 視窗拖曳方向
        var resizeDirection = Tiefsee.WindowDrag.ResizeDirection.Move;
        if (type == "CT") { resizeDirection = Tiefsee.WindowDrag.ResizeDirection.CT; }
        if (type == "RC") { resizeDirection = Tiefsee.WindowDrag.ResizeDirection.RC; }
        if (type == "CB") { resizeDirection = Tiefsee.WindowDrag.ResizeDirection.CB; }
        if (type == "LC") { resizeDirection = Tiefsee.WindowDrag.ResizeDirection.LC; }
        if (type == "LT") { resizeDirection = Tiefsee.WindowDrag.ResizeDirection.LT; }
        if (type == "RT") { resizeDirection = Tiefsee.WindowDrag.ResizeDirection.RT; }
        if (type == "LB") { resizeDirection = Tiefsee.WindowDrag.ResizeDirection.LB; }
        if (type == "RB") { resizeDirection = Tiefsee.WindowDrag.ResizeDirection.RB; }

        M.WindowDrag(resizeDirection);
    }
}
