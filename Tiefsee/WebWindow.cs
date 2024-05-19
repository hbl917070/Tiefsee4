using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using static Tiefsee.WindowAPI;

namespace Tiefsee;

[ComVisible(true)]
public class WebWindow : FormNone {

    private WebView2 _wv2;
    /// <summary> 父視窗 </summary>
    private WebWindow _parentWindow;
    /// <summary> 命令列參數 </summary>
    private string[] _args;
    /// <summary> 用於快速啟動的暫存視窗 </summary>
    private static WebWindow _tempWindow;
    /// <summary> 是否已經顯式過視窗(用於單一啟動 </summary>
    private bool _isShow = false;
    /// <summary> 是否延遲初始化(暫存視窗必須設定成 true </summary>
    private bool _isDelayInit = false;
    /// <summary> 當前開啟的視窗 </summary>
    public static List<WebWindow> WebWindowList { get; set; } = new();
    /// <summary> 記錄全螢幕前的狀態 </summary>
    private FormWindowState _tempFormWindowState = FormWindowState.Normal;
    private bool _tempFullScreen = false;
    /// <summary> 視窗是否有圓角 </summary>
    private bool _windowRoundedCorners = false;

    public WebView2 Wv2 { get { return _wv2; } }
    public WebWindow ParentWindow { get { return _parentWindow; } }
    public string[] Args { get { return _args; } }
    public static WebWindow TempWindow { get { return _tempWindow; } }

    public WV_Window WV_Window;
    public WV_Directory WV_Directory;
    public WV_File WV_File;
    public WV_Path WV_Path;
    public WV_System WV_System;
    public WV_RunApp WV_RunApp;
    public WV_Image WV_Image;

    /// <summary>
    ///
    /// </summary>
    public WebWindow() {
        WebWindowList.Add(this);

        this.FormClosed += (sender, e) => {
            WebWindowList.Remove(this);
        };
    }

    /// <summary>
    /// 新建視窗
    /// </summary>
    /// <param name="url"> html 檔的路徑 </param>
    /// <param name="args"> 命令列參數 </param>
    /// <param name="parentWindow"></param>
    /// <returns></returns>
    public static async Task<WebWindow> Create(string url, string[] args, WebWindow parentWindow) {

        // 如果開啟非 mainwindow 的 window
        if (url.IndexOf("MainWindow.html") == -1) {
            var ww = new WebWindow();
            ww._isDelayInit = false;
            await ww.Init();
            ww._parentWindow = parentWindow;
            ww._args = args;
            ww._wv2.CoreWebView2.Navigate(GetHtmlFilePath(url));
            ww._wv2.NavigationCompleted += (sender, e) => { // 網頁載入完成時
                TriggerCreate(ww, args);
            };
            return ww;
        }

        // 如果啟動類型是直接啟動
        if (Program.startType == 1) {
            var ww = new WebWindow();
            ww._isDelayInit = false;
            await ww.Init();
            ww._parentWindow = parentWindow;
            ww._args = args;
            ww._wv2.CoreWebView2.Navigate(GetHtmlFilePath(url));
            ww._wv2.NavigationCompleted += (sender, e) => { // 網頁載入完成時
                TriggerCreate(ww, args);
            };
            return ww;
        }

        // 單一執行個體
        if (Program.startType == 4 || Program.startType == 5) {
            if (_tempWindow == null || _tempWindow._wv2.CoreWebView2 == null) { // 沒有暫存的 window

                // 新建
                _tempWindow = new WebWindow();
                _tempWindow._isDelayInit = false;
                await _tempWindow.Init();
                _tempWindow._parentWindow = parentWindow;
                _tempWindow._args = args;
                _tempWindow._wv2.CoreWebView2.Navigate(GetHtmlFilePath(url));
                _tempWindow._wv2.NavigationCompleted += (sender, e) => { // 網頁載入完成時
                    TriggerCreate(_tempWindow, args);
                };

                // 如果是 單一執行+快速啟動，則在視窗關閉的時候建立下一個視窗
                if (Program.startType == 5) {
                    _tempWindow.FormClosing += (sender2, e2) => {
                        NewTempWindow(url); // 新建 window，用於下次顯示
                    };
                }
            }
            else {
                // 呼叫先前已經建立的 window 來執行 onCreate
                _tempWindow._parentWindow = parentWindow;
                _tempWindow._args = args;
                TriggerCreate(_tempWindow, args);
            }

            return _tempWindow;
        }

        // 第一次開啟
        if (_tempWindow == null) {
            var ww = new WebWindow();
            ww._isDelayInit = false;
            await ww.Init();
            ww._parentWindow = parentWindow;
            ww._args = args;
            ww._wv2.CoreWebView2.Navigate(GetHtmlFilePath(url));
            ww._wv2.NavigationCompleted += (sender, e) => { // 網頁載入完成時
                TriggerCreate(ww, args);
            };

            NewTempWindow(url); // 新建 window，用於下次顯示
            Console.WriteLine("第一次開啟:---" + url);
            return ww;
        }

        var temp2 = _tempWindow;
        _tempWindow = null;
        // 呼叫先前已經建立的 window 來顯示
        temp2._parentWindow = parentWindow;
        temp2._args = args;
        //temp2._wv2.Width = 1600;
        //temp2._wv2.Height = 900;
        temp2._wv2.NavigationCompleted += (sender, e) => { // 網頁載入完成時
            TriggerCreate(temp2, args);
        };
        TriggerCreate(temp2, args);

        NewTempWindow(url); // 新建 window，用於下次顯示

        return temp2; // 回傳剛剛新建的 window
    }

    /// <summary>
    /// 新建 window，用於下次顯示
    /// </summary>
    public static void NewTempWindow(string url) {

        if (_tempWindow != null) { return; }

        url = GetHtmlFilePath(url);

        Adapter.DelayRun(10, async () => {
            if (_tempWindow != null) { return; }
            WebWindow temp3 = new();
            temp3._isDelayInit = true;
            await temp3.Init();
            temp3._args = [];
            temp3._wv2.CoreWebView2.Navigate(url);
            // 如果視窗載入完成時，tempWindow 已經被暫用，則釋放這個 window
            void Wv2_NavigationCompleted(object sender, CoreWebView2NavigationCompletedEventArgs e) {
                Adapter.DelayRun(100, () => {
                    if (_tempWindow == null) {
                        _tempWindow = temp3;
                    }
                    else {
                        Adapter.DelayRun(5000, () => {
                            Console.WriteLine("釋放");
                            QuickRun.WindowCreate(); // 避免釋放後，window 數量對不起來
                            temp3.Close();
                        });
                    }
                });
                temp3._wv2.NavigationCompleted -= Wv2_NavigationCompleted;
            }
            temp3._wv2.NavigationCompleted += Wv2_NavigationCompleted; // 網頁載入完成時
        });
    }

    /// <summary>
    /// 傳入 www 資料夾內的檔名，回傳實體路徑
    /// </summary>
    private static string GetHtmlFilePath(string fileName) {
        string p = "file:///" +
            Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "Www", fileName) +
            "#" + Program.webServer.port; // port 用於讓 js 識別 webAPI 的網址
        return p;
    }

    /// <summary>
    /// 關閉所有視窗
    /// </summary>
    public static void CloseAllWindow() {
        int count = WebWindowList.Count;
        // 從後往前關閉，避免關閉後，webWindowList 的數量減少
        for (int i = count - 1; i >= 0; i--) {
            var item = WebWindowList[i];
            if (item == null || item.IsDisposed || item == _tempWindow) { continue; }
            try {
                WebWindowList[i].Close();
            }
            catch { }
        }
    }

    /// <summary>
    /// 觸發 js 的 baseWindow.onCreate
    /// </summary>
    public static void TriggerCreate(WebWindow w, string[] args, int quickLookRunType = 0) {
        w.RunJs($"baseWindow.onCreate({GetAppInfo(args, quickLookRunType)});");
    }

    /// <summary>
    ///
    /// </summary>
    public static string GetAppInfo(string[] args, int quickLookRunType) {

        AppInfo appInfo = new() {
            args = args,
            startType = Program.startType,
            startPort = Program.startPort,
            appDirPath = System.AppDomain.CurrentDomain.BaseDirectory,
            appDataPath = AppPath.appData,
            tempDirWebFile = AppPath.tempDirWebFile,
            mainPort = Program.webServer.port,
            settingPath = AppPath.appDataSetting,
            quickLookRunType = quickLookRunType,
            isWin11 = StartWindow.isWin11,
            isStoreApp = StartWindow.isStoreApp
        };

        if (File.Exists(appInfo.settingPath)) {
            using var sr = new StreamReader(appInfo.settingPath, Encoding.UTF8);
            appInfo.settingTxt = sr.ReadToEnd();
        }
        else {
            appInfo.settingTxt = "";
        }

        return JsonSerializer.Serialize(appInfo);
    }

    public class AppInfo {
        /// <summary> 命令列參數 </summary>
        public string[] args { get; set; }
        /// <summary> 1=直接啟動  2=快速啟動  3=快速啟動且常駐  4=單一執行個體  5=單一執行個體且常駐 </summary>
        public int startType { get; set; }
        /// <summary> 程式開始的port </summary>
        public int startPort { get; set; }
        /// <summary> 程式所在的資料夾 </summary>
        public string appDirPath { get; set; }
        /// <summary> 程式的暫存資料夾 </summary>
        public string appDataPath { get; set; }
        /// <summary> 暫存資料夾 - 從網路下載的檔案 </summary>
        public string tempDirWebFile { get; set; }
        /// <summary> 目前使用的 port </summary>
        public int mainPort { get; set; }
        /// <summary> setting.js 的路徑 </summary>
        public string settingPath { get; set; }
        /// <summary> setting.js 的文字 </summary>
        public string settingTxt { get; set; }
        /// <summary> 是否為快速預覽的視窗。 0=不是快速預覽 1=長按空白鍵 2=長按滑鼠中鍵 </summary>
        public int quickLookRunType { get; set; }
        /// <summary> 是否為商店版 APP </summary>
        public bool isStoreApp { get; set; }
        /// <summary> 是否為 win11 </summary>
        public bool isWin11 { get; set; }
        /// <summary> 哪些擴充是有啟用的 </summary>
        public DataPlugin plugin { get; set; } = Plugin.dataPlugin;
    }

    /// <summary>
    ///
    /// </summary>
    public async Task Init() {

        _wv2 = new WebView2();
        _wv2.ZoomFactor = 1;
        _wv2.DefaultBackgroundColor = System.Drawing.Color.Transparent;

        var panel = new Panel();
        panel.Dock = DockStyle.Fill;
        panel.Controls.Add(_wv2);
        this.Controls.Add(panel);
        this.Hide();

        // 降低調整 webview 縮放頻率，可提升縮放視窗的流暢度
        Adapter.LoopRun(20, () => {

            if (_isShow == false) { return; }

            var w = panel.Width;
            var h = panel.Height;
            // 在網頁內使用 border 繪製視窗外框時，在縮放過比例的螢幕可能會導致 broder 被裁切
            // 所以網頁在視窗化時會內縮 1px
            // 因此這裡必須把 webview2 外推 1px，避免 Acrylic 效果溢出到視窗外
            if (_windowRoundedCorners == false && this.WindowState == FormWindowState.Normal) {
                w += 1;
                h += 1;
            }
            if (_wv2.Width != w || _wv2.Height != h) {
                _wv2.Width = w;
                _wv2.Height = h;
            }
        });

        var opts = new CoreWebView2EnvironmentOptions { AdditionalBrowserArguments = Program.webvviewArguments };
        CoreWebView2Environment webView2Environment = await CoreWebView2Environment.CreateAsync(null, AppPath.appData, opts);
        await _wv2.EnsureCoreWebView2Async(webView2Environment); // 等待初始化完成

        _wv2.CoreWebView2.Profile.PreferredColorScheme = CoreWebView2PreferredColorScheme.Dark; // 指定為深色主題
        _wv2.CoreWebView2.Settings.IsSwipeNavigationEnabled = false; // 是否在啟用了觸摸輸入的設備上使用輕掃手勢在 WebView2 中導航
        _wv2.CoreWebView2.Settings.IsGeneralAutofillEnabled = false; // 自動填充啟用
        _wv2.CoreWebView2.Settings.IsZoomControlEnabled = false; // 使用者是否能夠影響 Web 視圖的縮放
        _wv2.CoreWebView2.Settings.IsStatusBarEnabled = false; // 是否顯示左下角的網址狀態
        // wv2.CoreWebView2.Settings.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.124 Safari/537.36 Edg/102.0.1245.44";
        // wv2.CoreWebView2.Settings.IsPinchZoomEnabled = false; // 觸摸輸入的設備上使用捏合運動在 WebView2 中縮放 Web 內容
        // wv2.CoreWebView2.Settings.AreBrowserAcceleratorKeysEnabled = false; // 是否啟用特定於瀏覽器的快速鍵

        WV_Window = new WV_Window(this);
        WV_Directory = new WV_Directory(this);
        WV_File = new WV_File(this);
        WV_Path = new WV_Path(this);
        WV_System = new WV_System(this);
        WV_RunApp = new WV_RunApp(this);
        WV_Image = new WV_Image(this);
        _wv2.CoreWebView2.AddHostObjectToScript("WV_Window", WV_Window);
        _wv2.CoreWebView2.AddHostObjectToScript("WV_Directory", WV_Directory);
        _wv2.CoreWebView2.AddHostObjectToScript("WV_File", WV_File);
        _wv2.CoreWebView2.AddHostObjectToScript("WV_Path", WV_Path);
        _wv2.CoreWebView2.AddHostObjectToScript("WV_System", WV_System);
        _wv2.CoreWebView2.AddHostObjectToScript("WV_RunApp", WV_RunApp);
        _wv2.CoreWebView2.AddHostObjectToScript("WV_Image", WV_Image);
        // wv2.CoreWebView2.AddHostObjectToScript("WV_T", new WV_T());

        // 按下右鍵時
        SetOnRightClick((Point p) => {
            // 最大化時，視窗內縮
            int border = 0;
            if (this.WindowState == FormWindowState.Maximized) {
                border = System.Windows.Forms.Screen.FromHandle(this.Handle).WorkingArea.X
                    - this.RectangleToScreen(new Rectangle()).X; // 程式所在的螢幕工作區域-程式目前坐標
                border = Math.Abs(border);
            }
            p.X -= border;
            p.Y -= border;
            RunJs($@"
                if(window.baseWindow !== undefined) baseWindow.onRightClick({p.X},{p.Y});
            ");
        });

        // webView21.CoreWebView2.AddScriptToExecuteOnDocumentCreatedAsync("var webBrowserObj= window.chrome.webview.hostObjects.webBrowserObj;");

        // 開啟時視窗時
        _wv2.CoreWebView2.NewWindowRequested += (sender2, e2) => {
            string fileurl = e2.Uri.ToString();
            e2.Handled = true;

            RunJs($@"
                if(window.baseWindow !== undefined) baseWindow.onNewWindowRequested(""{fileurl}"");
            ");
        };

        // js 將檔案傳遞進來時，取得檔案路徑，並將其回寫到 js 的全域變數裡面
        _wv2.CoreWebView2.WebMessageReceived += (sender, args) => {

            // 用於組合 json
            StringBuilder sb = new();
            sb.Append("[");
            var funcAdd = (string path) => {
                sb.Append("\"" + Path.GetFullPath(path).Replace("\\", "\\\\") + "\",");
            };

            // 取得所有檔案的路徑
            var files = args.AdditionalObjects
                .Where(x => x is CoreWebView2File)
                .Select(x => ((CoreWebView2File)x).Path)
                .ToList();

            if (files.Count() == 1) { // 項目只有一個時直接回傳，不論是檔案或資料夾
                string path = files[0];
                funcAdd(path);
            }
            else { // 項目為多個時，將資料夾內的檔案一並回傳
                foreach (var path in files) {
                    if (Directory.Exists(path)) {
                        // 取得資料夾內所有檔案
                        foreach (var item in Directory.GetFiles(path, "*.*")) {
                            funcAdd(item);
                        }
                    }
                    else { // 如果是檔案
                        funcAdd(path);
                    }
                }
            }

            sb.Append("]");

            RunJs($@"
                var temp_dropPath = {sb.ToString()};
            ");
        };

        this.SizeChanged += (sender, e) => {
            string s = this.WindowState.ToString();
            RunJs($"baseWindow.onSizeChanged({this.Left},{this.Top},{this.Width},{this.Height},'{s}')");

            // 最大化時，視窗內縮
            if (this.WindowState == FormWindowState.Maximized) {
                // 程式所在的螢幕工作區域-程式目前坐標
                int x = Screen.FromHandle(this.Handle).WorkingArea.X - this.RectangleToScreen(new()).X;
                x = Math.Abs(x) - 1;
                this.Padding = new(x);
            }
            else {
                this.Padding = new(0);
            }
        };

        this.Move += (sender, e) => {
            string s = this.WindowState.ToString();
            RunJs($"baseWindow.onMove({this.Left},{this.Top},{this.Width},{this.Height},'{s}')");
        };

        //this.VisibleChanged += (sender, e) => { RunJs("baseWindow.VisibleChanged()"); };
        //this.FormClosing += (sender, e) => { RunJs("baseWindow.FormClosing()"); };
        //this.GotFocus += (sender, e) => { runScript("baseWindow.GotFocus()"); };
        //this.LostFocus += (sender, e) => { runScript("baseWindow.LostFocus()"); };

        this.FormClosed += (sender, e) => {
            WV_System.FileWatcherDispose(); // 停止偵測檔案變化
            QuickRun.WindowFreed();
        };
    }

    /// <summary>
    /// 以 js 呼叫此函數後才會顯示視窗 (從父視窗的中間開啟
    /// </summary>
    public async void ShowWindowAtCenter(int width, int height) {

        if (_isShow) { return; }

        // 先隱藏視窗再顯示，避免視窗顯示時的閃爍
        this.Show();
        this.Hide();

        await ShowWindow(() => { });

        // 取得螢幕縮放比例
        float scale = _parentWindow.DeviceDpi / 96f;
        int w = (int)((width * scale) - _parentWindow.Width);
        int h = (int)((height * scale) - _parentWindow.Height);
        int l = _parentWindow.Left - (w / 2);
        int t = _parentWindow.Top - (h / 2);
        SetPosition(l, t);
        SetSize(width, height);
    }

    /// <summary>
    /// 以 js 呼叫此函數後才會顯示視窗 (初始化 坐標 與 size
    /// </summary>
    public async void ShowWindowAtPosition(int x, int y, int width, int height, string windowState) {
        await ShowWindow(() => {

            this.SetPosition(x, y);
            this.SetSize(width, height);

            if (windowState == "Maximized") {
                this.WindowState = FormWindowState.Maximized;

                // 設定成目標坐標所在螢幕的大小
                var screen = Screen.FromPoint(new Point(x, y));
                _wv2.Width = screen.WorkingArea.Width;
                _wv2.Height = screen.WorkingArea.Height;
            }
            else if (windowState == "Minimized") {
                this.WindowState = FormWindowState.Minimized;
            }
            else if (windowState == "Normal") {
                this.WindowState = FormWindowState.Normal;

                _wv2.Width = width;
                _wv2.Height = height;
            }
        });
    }

    /// <summary>
    /// 以js呼叫此函數後才會顯示視窗(系統預設指派的視窗坐標
    /// </summary>
    public async void ShowWindow() {
        await ShowWindow(() => {
            this.WindowState = FormWindowState.Normal;
        });
    }

    private async Task ShowWindow(Action func) {

        // 如果視窗已經顯示了，則只取得焦點，不做其他事情
        if (_isShow) {
            if (this.WindowState == FormWindowState.Minimized) {
                this.WindowState = FormWindowState.Normal; // 視窗化
            }
            SetFocus(); // 讓視窗在最上面並且取得焦點
            return;
        }

        QuickRun.WindowCreate();

        // --------

        func(); // 設定視窗位置與大小

        // --------

        await Task.Delay(50);

        _isShow = true;
        this.Show();
        RunJs($"baseWindow.SizeChanged({this.Left},{this.Top},{this.Width},{this.Height},'{this.WindowState}')");
        SetFocus(); // 讓視窗在最上面並且取得焦點
        if (_parentWindow != null) { // 避免開子視窗後導致父視窗失去置頂
            if (_parentWindow.TopMost == true) {
                _parentWindow.TopMost = true;
            }
        }

    }

    /// <summary>
    /// 關閉視窗
    /// </summary>
    public void CloseWindow() {
        Adapter.DelayRun(1, () => {
            if (_tempWindow == this) { _tempWindow = null; }
            Close();
        });
    }

    /// <summary>
    /// 隱藏視窗
    /// </summary>
    public void HideWindow() {
        if (_isShow) {
            QuickRun.WindowFreed();
            _isShow = false;
            this.Hide();
        }
    }

    /// <summary>
    ///
    /// </summary>
    public void RunJs(string js) {
        if (_wv2 != null && _wv2.CoreWebView2 != null) {
            _wv2.CoreWebView2.ExecuteScriptAsync(js);
        }
        else {
            Console.WriteLine("js 執行失敗，webview2 尚未初始化。" + js);
        }
    }

    /// <summary>
    /// 啟用或關閉 全螢幕
    /// </summary>
    public void SetFullScreen(bool val) {
        if (_tempFullScreen == val) {
            return;
        }

        _tempFullScreen = val;

        if (val) {
            _tempFormWindowState = WindowState;

            SuspendLayout();
            FormBorderStyle = FormBorderStyle.None;

            if (WindowState == FormWindowState.Maximized) {
                WindowState = FormWindowState.Normal;
            }
            WindowState = FormWindowState.Maximized;

            ResumeLayout();
        }
        else {
            FormBorderStyle = FormBorderStyle.Sizable;
            WindowState = _tempFormWindowState;
        }
    }
    /// <summary>
    /// 取得當前是否為 全螢幕
    /// </summary>
    public bool GetFullScreen() {
        return _tempFullScreen;
    }

    /// <summary>
    /// 讓視窗在最上面並且取得焦點
    /// </summary>
    public void SetFocus() {

        this.TopMost = true;
        this.TopMost = false;
        WindowAPI.SwitchToThisWindow(this.Handle, true);
        WindowAPI.GlobalActivate(this.Handle);
        // this.Activate();
        this._wv2.Focus();

        /* Adapter.DelayRun(30, () => {
            this.wv2.Focus();
            SwitchToThisWindow(this.wv2.Handle, true);
        }); */
    }

    /// <summary>
    /// 拖曳視窗
    /// </summary>
    public void WindowDrag(ResizeDirection type) {
        WindowAPI.WindowDrag(Handle, type);
    }

    /// <summary>
    /// win10 視窗效果
    /// </summary>
    /// <param name="type"> acrylic | aero </param>
    public void WindowStyleForWin10(string type) {
        WindowAPI.WindowStyleForWin10(this.Handle, type);
    }

    /// <summary>
    /// win11 視窗效果
    /// </summary>
    public void WindowStyleForWin11(SystemBackdropType type) {
        WindowAPI.WindowStyleForWin11(this.Handle, type);
    }

    /// <summary>
    /// win11 暗黑模式
    /// </summary>
    public void WindowThemeForWin11(ImmersiveDarkMode type) {
        WindowAPI.WindowThemeForWin11(this.Handle, type);
    }

    /// <summary>
    /// win11 視窗圓角
    /// </summary>
    public void WindowRoundedCorners(bool enable) {
        _windowRoundedCorners = enable;
        WindowAPI.WindowRoundedCorners(this.Handle, enable);
    }

}

/// <summary>
/// 不會顯示出來的窗體
/// </summary>
[ComVisible(true)]
public class FormNone : Form {

    private bool _allowSetSize = false; // 暫時允許調整視窗 size 跟坐標

    // 視窗初始化
    protected override void OnHandleCreated(EventArgs e) {
    }

    // 讓視窗看不到
    protected override CreateParams CreateParams {
        get {
            var style = base.CreateParams;
            // style.ClassStyle |= 200; // NoCloseBtn
            // style.ExStyle |= 0x8; // TopMost
            // style.ExStyle |= 0x80000; // Layered
            // style.ExStyle |= 0x02000000;
            // style.ExStyle |= 0x8000000; // NoActive
            style.ExStyle |= 0x00200000;
            style.Style &= ~0x80000; // WS_SYSMENU 移除標題列的右鍵選單
            return style;
        }
    }

    /// <summary>
    /// 必須以此方法來修改視窗 size
    /// </summary>
    public void SetSize(int width, int height) {
        _allowSetSize = true;
        this.Size = new Size(width, height);
    }

    /// <summary>
    /// 必須以此方法來修改視窗的坐標
    /// </summary>
    public void SetPosition(int left, int top) {
        _allowSetSize = true;
        this.Left = left;
        _allowSetSize = true;
        this.Top = top;
    }

    /// <summary>
    /// 按下右鍵時
    /// </summary>
    public void SetOnRightClick(Action<Point> func) {
        OnRightClick = func;
    }
    private Action<Point> OnRightClick = (Point pos) => {
        // System.Diagnostics.Debug.WriteLine(pos.X + ", " + pos.Y);
    };

    /// <summary>
    /// 避免最大化跟視窗化時，視窗大小錯誤
    /// </summary>
    protected override void SetBoundsCore(int x, int y, int width, int height, BoundsSpecified specified) {
        // base.SetBoundsCore(x, y, width- 16, height - 39, specified);
        if (_allowSetSize == true) {
            base.SetBoundsCore(x, y, width, height, specified);
            _allowSetSize = false;
        }
    }

    /// <summary>
    ///
    /// </summary>
    protected override void WndProc(ref Message m) {

        // 移除標題列
        // https://rjcodeadvance.com/final-modern-ui-aero-snap-window-resizing-sliding-menu-c-winforms/
        const int WM_NCCALCSIZE = 0x0083; // Standar Title Bar - Snap Window
        if (m.Msg == WM_NCCALCSIZE && m.WParam.ToInt32() == 1) { // Remove border and keep snap window
            return;
        }

        // 按下右鍵時
        const int WM_PARENTNOTIFY = 528;
        if (m.Msg == WM_PARENTNOTIFY) {
            var wParam = m.WParam;
            if (wParam == 516) { // 按下右鍵時
                var pos = new Point(m.LParam.ToInt32());
                OnRightClick(pos);
            }
        }

        // System.Diagnostics.Debug.WriteLine(m.Msg);

        base.WndProc(ref m);
    }

}
