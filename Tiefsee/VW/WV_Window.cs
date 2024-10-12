using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using static Tiefsee.WindowAPI;


namespace Tiefsee;

[ComVisible(true)]
public class WV_Window {

    // 子視窗快取，用來判斷是否已經開啟過，並取得已開啟的視窗
    private readonly Dictionary<string, WebWindow> _subWindowCache = new();

    public WebWindow M;

    public WV_Window(WebWindow m) {
        this.M = m;
    }

    /// <summary>
    /// 清理 webview2 的暫存
    /// </summary>
    public void ClearBrowserCache() {
        // M.wv2.CoreWebView2.Profile.ClearBrowsingDataAsync(); // 會清除使用者資料
        M.Wv2.CoreWebView2.CallDevToolsProtocolMethodAsync("Network.clearBrowserCache", "{}");
    }

    /// <summary>
    /// 取得 webview2 版本資訊
    /// </summary>
    public string GetBrowserVersionString() {
        return M.Wv2Environment.BrowserVersionString;
    }

    /// <summary>
    /// 儲存到 start.ini
    /// </summary>
    /// <param name="startPort"> 程式開始的 port </param>
    /// <param name="startType"> 1=直接啟動  2=快速啟動  3=快速啟動+常駐  4=單一個體  5=單一個體+常駐 </param>
    public void SetStartIni(int startPort, int startType) {
        IniManager iniManager = new IniManager(AppPath.appDataStartIni);
        iniManager.WriteIniFile("setting", "startPort", startPort);
        iniManager.WriteIniFile("setting", "startType", startType);
        Program.startPort = startPort;
        Program.startType = startType;
    }

    /// <summary>
    /// 取得 AppInfo
    /// </summary>
    /// <returns></returns>
    public string GetAppInfo() {
        return WebWindow.GetAppInfo(M.Args, 0);
    }

    /// <summary>
    /// 新開子視窗
    /// </summary>
    /// <param name="url"></param>
    /// <param name="args"></param>
    /// <returns></returns>
    public async Task<WebWindow> NewWindow(string url, object[] args) {
        var w = await WebWindow.Create(url, args.Select(x => x.ToString()).ToArray(), M);
        return w;
    }

    /// <summary>
    /// 新開子視窗
    /// </summary>
    /// <param name="url"> html 檔的路徑 </param>
    /// <param name="args"> 命令列參數 </param>
    /// <param name="windowKey"> 用於判斷是否已經啟動過視窗的 key </param>
    /// <returns> true=啟動成功 false=已經啟動過 </returns>
    public async Task<bool> NewSubWindow(string url, object[] args, string windowKey) {
        // 子視窗已建立過，不再建立
        if (_subWindowCache.ContainsKey(windowKey)) {
            _subWindowCache[windowKey]?.ShowWindow();
            return false;
        };

        var w = await NewWindow(url, args);
        SetOwner(w);

        // 記錄子視窗快取
        _subWindowCache.Add(windowKey, w);
        w.Closed += (sender, eventArgs) => {
            _subWindowCache.Remove(windowKey);
        };

        return true;
    }

    /// <summary>
    /// 關閉全部的視窗
    /// </summary>
    public void Exit() {
        QuickRun.Exit();
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
    public void WindowStyle(string type) {

        type = type.ToLower();

        // 此效果只能用於 win11
        if (StartWindow.isWin11) {
            if (type == "none" || type == "default") {
                M.WindowStyleForWin11(SystemBackdropType.None);
            }
            else if (type == "AcrylicDark".ToLower()) {
                M.WindowThemeForWin11(ImmersiveDarkMode.Enabled);
                M.WindowStyleForWin11(SystemBackdropType.Acrylic);
            }
            else if (type == "AcrylicLight".ToLower()) {
                M.WindowThemeForWin11(ImmersiveDarkMode.Disabled);
                M.WindowStyleForWin11(SystemBackdropType.Acrylic);
            }
            else if (type == "MicaDark".ToLower()) {
                M.WindowThemeForWin11(ImmersiveDarkMode.Enabled);
                M.WindowStyleForWin11(SystemBackdropType.Mica);
            }
            else if (type == "MicaLight".ToLower()) {
                M.WindowThemeForWin11(ImmersiveDarkMode.Disabled);
                M.WindowStyleForWin11(SystemBackdropType.Mica);
            }
            else if (type == "MicaAltDark".ToLower()) {
                M.WindowThemeForWin11(ImmersiveDarkMode.Enabled);
                M.WindowStyleForWin11(SystemBackdropType.MicaAlt);
            }
            else if (type == "MicaAltLight".ToLower()) {
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
        if (window != null) {
            WebWindow webwindow = (WebWindow)window;
            if (TopMost == true) {
                TopMost = false; // 設定子視窗的時候，如果父視窗有使用TopMost，必須先解除，否則子視窗會被蓋到下面
                webwindow.Owner = M;
                TopMost = true;
            }
            else {
                webwindow.Owner = M;
            }
        }
    }

    /// <summary>
    /// 在父親視窗運行 js
    /// </summary>
    public async Task<string> RunJsOfParent(string js) {
        if (M.ParentWindow == null) { return ""; }
        if (M.ParentWindow.Wv2.CoreWebView2 == null) { return ""; }
        return await M.ParentWindow.Wv2.CoreWebView2.ExecuteScriptAsync(js);
    }

    /// <summary>
    /// 設定視窗的 icon
    /// </summary>
    public void SetIcon(string path) {
        if (File.Exists(path)) {
            M.Icon = new(path);
        }
    }

    /// <summary>
    /// 取得程式的暫存資料夾，例如 C:\Users\user\AppData\Local\Tiefsee
    /// </summary>
    public string GetAppDataPath() {
        string path = AppPath.appData;
        if (Directory.Exists(path) == false) {
            Directory.CreateDirectory(path);
        }
        return path;
    }

    /// <summary>
    /// 取得執行檔所在的資料夾
    /// </summary>
    public string GetAppDirPath() {
        return System.AppDomain.CurrentDomain.BaseDirectory;
    }

    /// <summary>
    /// 取得執行檔路徑 (TiefseeCore.exe 的路徑)
    /// </summary>
    public string GetAppPath() {
        string exePath = Process.GetCurrentProcess().MainModule.FileName;
        return exePath;
    }

    /// <summary>
    /// 取得 Tiefsee.exe 的路徑
    /// </summary>    
    public string GetTiefseePath() {
        var dir = GetAppDirPath();

        var path = Path.Combine(dir, "Tiefsee.exe");
        if (File.Exists(path)) { return path; }

        path = Path.Combine(dir, "../TiefseeLauncher/Tiefsee.exe");
        if (File.Exists(path)) { return Path.GetFullPath(path); }

        return GetAppPath();
    }

    /// <summary>
    /// 取得命令列參數
    /// </summary>
    public string[] GetArguments() {
        return M.Args;
    }

    /// <summary>
    /// 返回 WebWindow
    /// </summary>
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

    public Boolean Visible {
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
            if (value == "Maximized") {
                // WebWindow.ShowWindow(M.Handle, WebWindow.SW_MAXIMIZE);
                M.WindowState = FormWindowState.Maximized;
            }
            if (value == "Minimized") {
                // WebWindow.ShowWindow(M.Handle, WebWindow.SW_MINIMIZE);
                M.WindowState = FormWindowState.Minimized;
            }
            if (value == "Normal") {
                // WebWindow.ShowWindow(M.Handle, WebWindow.SW_NORMAL);
                M.WindowState = FormWindowState.Normal;
            }
        }
    }

    /// <summary>
    /// 啟用或關閉 全螢幕
    /// </summary>
    public void SetFullScreen(bool val) {
        M.SetFullScreen(val);
    }

    /// <summary>
    /// 取得當前是否為 全螢幕
    /// </summary>
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
    public void WindowDrag(string type) {

        // 避免滑鼠在沒有按下的情況下執行
        if (Control.MouseButtons != MouseButtons.Left) {
            return;
        }

        var resizeDirection = ResizeDirection.Move;
        if (type == "CT") { resizeDirection = ResizeDirection.CT; }
        if (type == "RC") { resizeDirection = ResizeDirection.RC; }
        if (type == "CB") { resizeDirection = ResizeDirection.CB; }
        if (type == "LC") { resizeDirection = ResizeDirection.LC; }
        if (type == "LT") { resizeDirection = ResizeDirection.LT; }
        if (type == "RT") { resizeDirection = ResizeDirection.RT; }
        if (type == "LB") { resizeDirection = ResizeDirection.LB; }
        if (type == "RB") { resizeDirection = ResizeDirection.RB; }

        M.WindowDrag(resizeDirection);
    }

}
