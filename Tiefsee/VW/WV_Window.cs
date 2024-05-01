using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;

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
    public WebWindow NewWindow(string url, object[] args) {
        var w = WebWindow.Create(url, args.Select(x => x.ToString()).ToArray(), M);
        return w;
    }

    /// <summary>
    /// 新開子視窗
    /// </summary>
    /// <param name="url"> html 檔的路徑 </param>
    /// <param name="args"> 命令列參數 </param>
    /// <param name="windowKey"> 用於判斷是否已經啟動過視窗的 key </param>
    /// <returns> true=啟動成功 false=已經啟動過 </returns>
    public bool NewSubWindow(string url, object[] args, string windowKey) {
        // 子視窗已建立過，不再建立
        if (_subWindowCache.ContainsKey(windowKey)) {
            _subWindowCache[windowKey]?.ShowWindow();
            return false;
        };

        var w = NewWindow(url, args);
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
    /// 視窗使用毛玻璃效果(只有win10、win11有效
    /// </summary>
    public void SetAERO(string type) {
        EnableBlur(M.Handle, type);
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
        //M.wv2.Visible = false;
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

    /// <summary>
    /// 拖曳視窗
    /// </summary>
    public void WindowDrag(string type) {

        //避免滑鼠在沒有按下的情況下執行
        if (System.Windows.Forms.Control.MouseButtons != System.Windows.Forms.MouseButtons.Left) {
            return;
        }

        var run = ResizeDirection.Move;

        if (type == "CT") { run = ResizeDirection.CT; }
        if (type == "RC") { run = ResizeDirection.RC; }
        if (type == "CB") { run = ResizeDirection.CB; }
        if (type == "LC") { run = ResizeDirection.LC; }
        if (type == "LT") { run = ResizeDirection.LT; }
        if (type == "RT") { run = ResizeDirection.RT; }
        if (type == "LB") { run = ResizeDirection.LB; }
        if (type == "RB") { run = ResizeDirection.RB; }

        /*if (_run== ResizeDirection.Move) { //拖曳視窗
            int WM_NCLBUTTONDOWN = 161; //  0xA1
            int HTCAPTION = 2;
            ReleaseCapture();
            SendMessage(M.Handle, WM_NCLBUTTONDOWN, HTCAPTION, 0);
            return;
        }*/

        ReleaseCapture();
        SendMessage(M.Handle, WM_SYSCOMMAND, (int)(run), 0);
    }

    #region 視窗拖曳
    public enum ResizeDirection {
        LC = 0xF001, // 左
        RC = 0xF002, // 右
        CT = 0xF003, // 上
        LT = 0xF004, // 左上
        RT = 0xF005, // 右上
        CB = 0xF006, // 下
        LB = 0xF007, // 左下
        RB = 0xF008, // 右下
        Move = 0xF009 // 移動
    }

    // 指定滑鼠到特定視窗
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern IntPtr SetCapture(IntPtr hWnd);

    // 釋放滑鼠
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern bool ReleaseCapture();

    // 拖曳視窗
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern bool SendMessage(IntPtr hwnd, int wMsg, int wParam, int lParam);
    public const int WM_SYSCOMMAND = 0x0112;
    public const int WM_LBUTTONUP = 0x202;

    #endregion

    #region 毛玻璃

    [DllImport("user32.dll")]
    internal static extern int SetWindowCompositionAttribute(IntPtr hwnd, ref WindowCompositionAttributeData data);

    [StructLayout(LayoutKind.Sequential)]
    internal struct WindowCompositionAttributeData {
        public WindowCompositionAttribute Attribute;
        public IntPtr Data;
        public int SizeOfData;
    }

    internal enum WindowCompositionAttribute {
        WCA_ACCENT_POLICY = 19
    }

    internal enum AccentState {
        ACCENT_DISABLED = 0,
        ACCENT_ENABLE_GRADIENT = 1,
        ACCENT_ENABLE_TRANSPARENTGRADIENT = 2,
        ACCENT_ENABLE_BLURBEHIND = 3,
        ACCENT_ENABLE_ACRYLICBLURBEHIND = 4,
        ACCENT_INVALID_STATE = 5
    }

    [StructLayout(LayoutKind.Sequential)]
    internal struct AccentPolicy {
        public AccentState AccentState;
        public uint AccentFlags;
        public uint GradientColor;
        public uint AnimationId;
    }

    private uint _blurOpacity = 0;
    private uint _blurBackgroundColor = 0x010101; /* BGR color format */

    internal void EnableBlur(IntPtr hwnd, string type) {
        var accent = new AccentPolicy();

        if (type.ToLower() == "win10") {
            // win10
            accent.AccentState = AccentState.ACCENT_ENABLE_ACRYLICBLURBEHIND;
            accent.GradientColor = (_blurOpacity << 24) | (_blurBackgroundColor & 0xFFFFFF);
        }
        else {
            // win7
            accent.AccentState = AccentState.ACCENT_ENABLE_BLURBEHIND;
        }

        var accentStructSize = Marshal.SizeOf(accent);

        var accentPtr = Marshal.AllocHGlobal(accentStructSize);
        Marshal.StructureToPtr(accent, accentPtr, false);

        var data = new WindowCompositionAttributeData();
        data.Attribute = WindowCompositionAttribute.WCA_ACCENT_POLICY;
        data.SizeOfData = accentStructSize;
        data.Data = accentPtr;

        SetWindowCompositionAttribute(hwnd, ref data);

        Marshal.FreeHGlobal(accentPtr);
    }

    #endregion

}
