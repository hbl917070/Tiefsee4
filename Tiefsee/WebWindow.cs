using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using static Tiefsee.WindowStyle;

namespace Tiefsee;

[ComVisible(true)]
public class WebWindow : FormNone {

    private WebView2 _wv2;
    private static CoreWebView2Environment _webView2Environment;
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
    /// <summary> 記錄全螢幕前是否有視窗圓角 </summary>
    private bool _tempWindowRoundedCorners = false;
    /// <summary> 當前是否為 全螢幕 </summary>
    private bool _tempFullScreen = false;
    /// <summary> 視窗是否有圓角 </summary>
    private bool _windowRoundedCorners = false;
    /// <summary> 記錄視窗最小化前的狀態 </summary>
    private FormWindowState _lastWindowState = FormWindowState.Normal;

    public WebView2 Wv2 { get { return _wv2; } }
    public WebWindow ParentWindow { get { return _parentWindow; } }
    public string[] Args { get { return _args; } }
    public static WebWindow TempWindow { get { return _tempWindow; } }

    public WindowWebViewBridge WindowBridge;
    public DirectoryWebViewBridge DirectoryBridge;
    public FileWebViewBridge FileBridge;
    public PathWebViewBridge PathBridge;
    public SystemWebViewBridge SystemBridge;
    public RunAppWebViewBridge RunAppBridge;
    public ImageWebViewBridge ImageBridge;

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

        // 當視窗載入完成時，觸發 baseWindow.onCreate
        void Wv2LoadedTriggerCreate(WebWindow ww, string[] args) {
            bool _isEventTriggered = false;

            TriggerCreate(ww, args);

            ww._wv2.CoreWebView2.DOMContentLoaded += (sender, e) => {
                // if (_isEventTriggered) { return; }

                TriggerCreate(ww, args);
                _isEventTriggered = true;
            };

            /* DateTime timeStart = DateTime.Now; // 計時開始
            ww._wv2.NavigationCompleted += (sender, e) => { // 網頁載入完成時
                Debug.WriteLine(" NavigationCompleted ----- " + (DateTime.Now - timeStart).TotalMilliseconds + " 毫秒");
                TriggerCreate(ww, args);
            }; */
        }

        // 如果開啟非 mainwindow 的 window
        if (url.IndexOf("MainWindow.html") == -1) {
            var ww = new WebWindow();
            ww._isDelayInit = false;
            await ww.Init();
            ww._parentWindow = parentWindow;
            ww._args = args;
            ww._wv2.CoreWebView2.Navigate(GetHtmlFilePath(url));
            Wv2LoadedTriggerCreate(ww, args); // 網頁載入完成時，觸發 baseWindow.onCreate
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
            Wv2LoadedTriggerCreate(ww, args); // 網頁載入完成時，觸發 baseWindow.onCreate
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
                Wv2LoadedTriggerCreate(_tempWindow, args); // 網頁載入完成時，觸發 baseWindow.onCreate

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
            Wv2LoadedTriggerCreate(ww, args); // 網頁載入完成時，觸發 baseWindow.onCreate

            NewTempWindow(url); // 新建 window，用於下次顯示
            Console.WriteLine("第一次開啟:---" + url);
            return ww;
        }

        var temp2 = _tempWindow;
        _tempWindow = null;
        // 呼叫先前已經建立的 window 來顯示
        temp2._parentWindow = parentWindow;
        temp2._args = args;
        Wv2LoadedTriggerCreate(temp2, args); // 網頁載入完成時，觸發 baseWindow.onCreate

        NewTempWindow(url); // 新建 window，用於下次顯示

        return temp2; // 回傳剛剛新建的 window
    }

    /// <summary>
    /// 新建 window，用於下次顯示
    /// </summary>
    public static void NewTempWindow(string url) {

        if (_tempWindow != null) { return; }

        url = GetHtmlFilePath(url);

        UiThreadScheduler.DelayRun(10, async () => {
            if (_tempWindow != null) { return; }
            WebWindow temp3 = new();
            temp3._isDelayInit = true;
            await temp3.Init();
            temp3._args = [];
            temp3._wv2.CoreWebView2.Navigate(url);
            // 如果視窗載入完成時，tempWindow 已經被暫用，則釋放這個 window
            void Wv2_NavigationCompleted(object sender, CoreWebView2NavigationCompletedEventArgs e) {
                UiThreadScheduler.DelayRun(100, () => {
                    if (_tempWindow == null) {
                        _tempWindow = temp3;
                    }
                    else {
                        UiThreadScheduler.DelayRun(5000, () => {
                            Console.WriteLine("釋放");
                            SingleInstanceCoordinator.WindowCreate(); // 避免釋放後，window 數量對不起來
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
        /* return "file:///" +
           Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "Www", fileName) +
           "#" + Program.webServer.port; // port 用於讓 js 識別 webAPI 的網址 */
        // return $"http://app.example/{fileName}#{Program.webServer.port}";
        return $"http:127.0.0.1:{Program.webServer.port}/www/{fileName}#{Program.webServer.port}";
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

    /// <summary>
    /// 取得 CoreWebView2Environment
    /// </summary>
    public static async Task<CoreWebView2Environment> GetCoreWebView2Environment() {
        if (_webView2Environment == null) {
            var arguments = new[] {
                "--enable-features=msWebView2EnableDraggableRegions", // 讓 webview2 支援 css「app-region:drag」
                // "--disable-web-security", // 允許跨域請求
                // $"--user-agent {}", // 覆寫 userAgent
                // "--disable-gpu", // 禁用硬體加速
                // "--disable-background-timer-throttling", // 讓 webview2 在背景時，仍然可以正常運行 js 的 setTimeout、setInterval
                // "--no-sandbox", // 停用安全沙箱。使啟動大幅提升，但會讓瀏覽器極易受攻擊
                
                // -------

                // 下面的參數據說可以提升啟動速度，但我體感沒有區別
                "--disable-plugins", // 停用所有插件
                "--disable-sync", // 停用 Google 帳號同步功能
                "--disable-features=CalculateNativeWinOcclusion", // 禁用遮蔽計算。瀏覽器將不再偵測自己是否被擋住，無論視窗是否在最上層，都會持續以正常狀態運行
                "--disable-background-networking", // 停用背景網路請求（如更新檢查、自動收集數據）
                "--disable-default-apps", // 啟動時不加載預裝的預設應用程式
                "--disable-component-update", // 停用組件（如翻譯、安全列表）的自動更新檢查
                "--dns-prefetch-disable", // 停用 DNS 預取，減少初始網路活動
                "--msWebView2CancelInitialNavigation", // 取消 webview2 預設的導航行為
            };
            var opts = new CoreWebView2EnvironmentOptions { AdditionalBrowserArguments = string.Join(" ", arguments) };
            _webView2Environment = await CoreWebView2Environment.CreateAsync(null, AppPath.appData, opts);
        }
        return _webView2Environment;
    }

    /// <summary>
    ///
    /// </summary>
    public async Task Init() {

        _wv2 = new WebView2();
        _wv2.ZoomFactor = 1;
        _wv2.DefaultBackgroundColor = System.Drawing.Color.Transparent;
        this.Controls.Add(_wv2);

        var panel = new Panel();
        panel.Dock = DockStyle.Fill;
        this.Controls.Add(panel);

        this.Hide();

        // 降低調整 webview 縮放頻率，可提升縮放視窗的流暢度
        UiThreadScheduler.LoopRun(20, () => {

            if (_isShow == false) { return; }

            var w = panel.Width;
            var h = panel.Height;
            var l = panel.Left;
            var t = panel.Top;
            // 在網頁內使用 border 繪製視窗外框時，在縮放過比例的螢幕可能會導致 broder 被裁切
            // 所以網頁在視窗化時會內縮 1px
            // 因此這裡必須把 webview2 外推 1px，避免 Acrylic 效果溢出到視窗外
            if (_windowRoundedCorners == false && this.WindowState == FormWindowState.Normal) {
                w += 1;
                h += 1;
            }
            // win11 的圓角效果，邊框會往內吃掉 1px，所以要主動把 webview2 往外內 1px，避免右邊的捲動條被遮住
            else if (_windowRoundedCorners && this.WindowState == FormWindowState.Normal) {
                w -= 2;
                h -= 2;
                l = 1;
                t = 1;
            }
            if (_wv2.Width != w || _wv2.Height != h) {
                _wv2.Width = w;
                _wv2.Height = h;
                _wv2.Left = l;
                _wv2.Top = t;
            }
        });

        // 等待初始化完成
        await _wv2.EnsureCoreWebView2Async(await GetCoreWebView2Environment());

        // 指定為深色主題
        _wv2.CoreWebView2.Profile.PreferredColorScheme = CoreWebView2PreferredColorScheme.Dark;
        // 是否在啟用了觸摸輸入的設備上使用輕掃手勢在 WebView2 中導航
        _wv2.CoreWebView2.Settings.IsSwipeNavigationEnabled = false;
        // 輸入框自動填充
        _wv2.CoreWebView2.Settings.IsGeneralAutofillEnabled = false;
        // 使用者是否能夠影響 Web 視圖的縮放
        _wv2.CoreWebView2.Settings.IsZoomControlEnabled = false;
        // 是否顯示左下角的網址狀態
        _wv2.CoreWebView2.Settings.IsStatusBarEnabled = false;
        // 覆寫 userAgent。用於在請求 API 時，辨識身份是否合法
        _wv2.CoreWebView2.Settings.UserAgent = _wv2.CoreWebView2.Settings.UserAgent + " " + Program.webvviewUserAgent;
        // 讓 webview2 支援 css「app - region:drag」
        // _wv2.CoreWebView2.Settings.IsNonClientRegionSupportEnabled = true;
        // 觸摸輸入的設備上使用捏合運動在 WebView2 中縮放 Web 內容
        // _wv2.CoreWebView2.Settings.IsPinchZoomEnabled = false;
        // 是否啟用特定於瀏覽器的快速鍵
        // _wv2.CoreWebView2.Settings.AreBrowserAcceleratorKeysEnabled = false;

        // 避免被 adguard 影響載入速度
        _wv2.CoreWebView2.AddWebResourceRequestedFilter("http://local.adguard.org/*", CoreWebView2WebResourceContext.All);
        _wv2.CoreWebView2.WebResourceRequested += delegate (object sender, CoreWebView2WebResourceRequestedEventArgs args) {
            args.Response = _wv2.CoreWebView2.Environment
                .CreateWebResourceResponse(null, 200, "OK", "");
        };

        WindowBridge = new WindowWebViewBridge(this);
        DirectoryBridge = new DirectoryWebViewBridge(this);
        FileBridge = new FileWebViewBridge(this);
        PathBridge = new PathWebViewBridge(this);
        SystemBridge = new SystemWebViewBridge(this);
        RunAppBridge = new RunAppWebViewBridge(this);
        ImageBridge = new ImageWebViewBridge(this);
        _wv2.CoreWebView2.AddHostObjectToScript("WindowBridge", WindowBridge);
        _wv2.CoreWebView2.AddHostObjectToScript("DirectoryBridge", DirectoryBridge);
        _wv2.CoreWebView2.AddHostObjectToScript("FileBridge", FileBridge);
        _wv2.CoreWebView2.AddHostObjectToScript("PathBridge", PathBridge);
        _wv2.CoreWebView2.AddHostObjectToScript("SystemBridge", SystemBridge);
        _wv2.CoreWebView2.AddHostObjectToScript("RunAppBridge", RunAppBridge);
        _wv2.CoreWebView2.AddHostObjectToScript("ImageBridge", ImageBridge);
        _wv2.CoreWebView2.AddHostObjectToScript("WV_Window", WindowBridge);
        _wv2.CoreWebView2.AddHostObjectToScript("WV_Directory", DirectoryBridge);
        _wv2.CoreWebView2.AddHostObjectToScript("WV_File", FileBridge);
        _wv2.CoreWebView2.AddHostObjectToScript("WV_Path", PathBridge);
        _wv2.CoreWebView2.AddHostObjectToScript("WV_System", SystemBridge);
        _wv2.CoreWebView2.AddHostObjectToScript("WV_RunApp", RunAppBridge);
        _wv2.CoreWebView2.AddHostObjectToScript("WV_Image", ImageBridge);
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
                var _dropPath = {sb.ToString()};
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

            // 記錄視窗最小化前的狀態
            if (this.WindowState != FormWindowState.Minimized) {
                _lastWindowState = this.WindowState;
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
            SystemBridge.FileWatcherDispose(); // 停止偵測檔案變化
            SingleInstanceCoordinator.WindowFreed();
        };
    }

    /// <summary>
    /// 以 js 呼叫此函數後才會顯示視窗 (從父視窗的中間開啟
    /// </summary>
    public async void ShowWindowAtCenter(int width, int height) {

        if (_isShow) { return; }

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

        #region 檢查視窗是否超出螢幕範圍
        if (windowState == "Maximized" || windowState == "Normal") {

            // 檢查視窗是否至少 1/4 在螢幕內
            var screens = Screen.AllScreens;
            var isVisible = screens
                .Any(screen =>
                    screen.Bounds.IntersectsWith(new Rectangle(x + (width / 4), y + (height / 4), 1, 1)) ||
                    screen.Bounds.IntersectsWith(new Rectangle(x + (width / 4 * 3), y + (height / 4), 1, 1)) ||
                    screen.Bounds.IntersectsWith(new Rectangle(x + (width / 4), y + (height / 4 * 3), 1, 1)) ||
                    screen.Bounds.IntersectsWith(new Rectangle(x + (width / 4 * 3), y + (height / 4 * 3), 1, 1)
                ));

            if (isVisible == false) {
                this.SetSize(800, 600);
                // 用預設位置顯示視窗
                await ShowWindow(() => {
                    this.WindowState = windowState == "Maximized"
                        ? FormWindowState.Maximized
                        : FormWindowState.Normal;
                });
            }
        }
        #endregion

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
                // 將視窗恢復到最小化之前的狀態
                this.WindowState = _lastWindowState;
            }
            SetFocus(); // 讓視窗在最上面並且取得焦點
            return;
        }

        SingleInstanceCoordinator.WindowCreate();

        // --------

        func(); // 設定視窗位置與大小

        // --------

        // await Task.Delay(50);

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
        UiThreadScheduler.DelayRun(1, () => {
            if (_tempWindow == this) { _tempWindow = null; }
            Close();
        });
    }

    /// <summary>
    /// 隱藏視窗
    /// </summary>
    public void HideWindow() {
        if (_isShow) {
            SingleInstanceCoordinator.WindowFreed();
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
            _tempWindowRoundedCorners = _windowRoundedCorners;

            SuspendLayout();
            FormBorderStyle = FormBorderStyle.None;

            if (WindowState == FormWindowState.Maximized) {
                WindowState = FormWindowState.Normal;
            }
            WindowState = FormWindowState.Maximized;

            // 如果進入全螢幕前有視窗圓角，則先取消
            if (_windowRoundedCorners) {
                WindowRoundedCorners(false);
            }

            ResumeLayout();
        }
        else {
            FormBorderStyle = FormBorderStyle.Sizable;
            WindowState = _tempFormWindowState;

            if (_tempWindowRoundedCorners) {
                WindowRoundedCorners(true);
            }
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
        WindowActivation.SwitchToThisWindow(this.Handle, true);
        WindowActivation.GlobalActivate(this.Handle);
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
    public void WindowDrag(WindowDrag.ResizeDirection type) {
        Tiefsee.WindowDrag.Start(Handle, type);
    }

    /// <summary>
    /// win10 視窗效果
    /// </summary>
    /// <param name="type"> acrylic | aero </param>
    public void WindowStyleForWin10(string type) {
        WindowStyle.WindowStyleForWin10(this.Handle, type);
    }

    /// <summary>
    /// win11 視窗效果
    /// </summary>
    public void WindowStyleForWin11(SystemBackdropType type) {
        WindowStyle.WindowStyleForWin11(this.Handle, type);
    }

    /// <summary>
    /// win11 暗黑模式
    /// </summary>
    public void WindowThemeForWin11(ImmersiveDarkMode type) {
        WindowStyle.WindowThemeForWin11(this.Handle, type);
    }

    /// <summary>
    /// win11 視窗圓角
    /// </summary>
    public void WindowRoundedCorners(bool enable) {
        _windowRoundedCorners = enable;
        WindowStyle.WindowRoundedCorners(this.Handle, enable);
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
        ResetMaximumBound();
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
    /// 重設視窗的最大邊界
    /// 覆寫視窗標題列的程式最大化後，如果將工作列設為自動隱藏，視窗會完全遮蔽工作列，導致叫不出工具列，所以要重設視窗的最大化邊界
    /// </summary>
    private void ResetMaximumBound() {
        APPBARDATA abd = new APPBARDATA();
        abd.cbSize = Marshal.SizeOf(abd);
        // 獲取任務欄狀態
        uint state = SHAppBarMessage(ABM_GETSTATE, ref abd);

        // 檢查是否啟用了自動隱藏
        if ((state & ABS_AUTOHIDE) == ABS_AUTOHIDE) {
            state = SHAppBarMessage(ABM_GETTASKBARPOS, ref abd);
            var bounds = Screen.FromHandle(Handle).WorkingArea;
            bounds.X = 0;
            bounds.Y = 0;
            if (state == 1) {
                switch (abd.uEdge) {
                    case ABE_TOP:
                        bounds.Y += 1;
                        bounds.Height -= 1;
                        break;
                    case ABE_BOTTOM:
                        bounds.Height -= 1;
                        break;
                    case ABE_LEFT:
                        bounds.X += 1;
                        bounds.Width -= 1;
                        break;
                    case ABE_RIGHT:
                        bounds.Width -= 1;
                        break;
                }
            }
            MaximizedBounds = bounds;
        }
        else {
            MaximizedBounds = default;
        }
    }

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

        #region 視窗最大化時，重設視窗的最大邊界

        const int WM_WINDOWPOSCHANGING = 0x0046;

        if (m.Msg == WM_WINDOWPOSCHANGING) {
            var windowPos = (WINDOWPOS)Marshal.PtrToStructure(m.LParam, typeof(WINDOWPOS));
            if ((windowPos.flags & 0x0001) == 0) { // SWP_NOSIZE flag is not set
                if (this.WindowState == FormWindowState.Maximized) {
                    ResetMaximumBound();
                }
            }
        }

        #endregion

        // System.Diagnostics.Debug.WriteLine(m.Msg);

        base.WndProc(ref m);
    }


    #region 任務欄

    [StructLayout(LayoutKind.Sequential)]
    public struct APPBARDATA {
        public int cbSize;
        public IntPtr hWnd;
        public uint uCallbackMessage;
        public uint uEdge;
        public RECT rc;
        public int lParam;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT {
        public int left;
        public int top;
        public int right;
        public int bottom;
    }

    [DllImport("shell32.dll", SetLastError = true)]
    public static extern uint SHAppBarMessage(uint dwMessage, ref APPBARDATA pData);

    // ABM_GETSTATE 用來檢查任務欄狀態的訊息
    public const uint ABM_GETSTATE = 0x00000004;

    public const uint ABM_GETTASKBARPOS = 0x00000005;

    // 設定任務欄的狀態，當值為 ABS_AUTOHIDE 時，表示啟用了自動隱藏
    public const int ABS_AUTOHIDE = 0x1;

    // APPBARDATA edge 可能的值
    public const uint ABE_LEFT = 0;
    public const uint ABE_TOP = 1;
    public const uint ABE_RIGHT = 2;
    public const uint ABE_BOTTOM = 3;

    #endregion

    /// <summary>
    /// 描述視窗的位置和大小的結構體
    /// </summary>
    [StructLayout(LayoutKind.Sequential)]
    public struct WINDOWPOS {
        public IntPtr hwnd;
        public IntPtr hwndInsertAfter;
        public int x;
        public int y;
        public int cx;
        public int cy;
        public uint flags;
    }
}
