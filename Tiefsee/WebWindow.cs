using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using Newtonsoft.Json;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

namespace Tiefsee {

    [ComVisible(true)]
    public class WebWindow : FormNone {

        public WebView2 wv2;
        public WebWindow parentWindow; //父視窗
        public string[] args; //命令列參數 
        public static WebWindow tempWindow; //用於快速啟動的暫存視窗
        private bool isShow = false; //是否已經顯式過視窗(用於單一啟動
        public bool isDelayInit = false; //是否延遲初始化(暫存視窗必須設定成true

        //用於記錄全螢幕前的狀態
        private FormWindowState tempFormWindowState = FormWindowState.Normal;
        private bool tempFullScreen = false;

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
        }


        /// <summary>
        /// 新建視窗
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="_args"></param>
        /// <param name="_parentWindow"></param>
        /// <returns></returns>
        public static WebWindow Create(String _url, string[] _args, WebWindow _parentWindow) {

            //如果開啟非mainwindow的window
            if (_url.IndexOf("MainWindow.html") == -1) { //$"http://localhost:{Program.bserver.port}/www/MainWindow.html"
                var ww = new WebWindow();
                ww.isDelayInit = false;
                ww.Init();
                ww.parentWindow = _parentWindow;
                ww.args = _args;
                ww.wv2.Source = new Uri(GetHtmlFilePath(_url));
                ww.wv2.NavigationCompleted += (sender, e) => { //網頁載入完成時
                    TriggerCreate(ww, _args);
                };

                return ww;
            }

            //如果啟動類型是直接啟動
            if (Program.startType == 1) {
                var ww = new WebWindow();
                ww.isDelayInit = false;
                ww.Init();
                ww.parentWindow = _parentWindow;
                ww.args = _args;
                ww.wv2.Source = new Uri(GetHtmlFilePath(_url));
                ww.wv2.NavigationCompleted += (sender, e) => { //網頁載入完成時
                    TriggerCreate(ww, _args);
                };
                return ww;
            }

            //單一執行個體
            if (Program.startType == 4 || Program.startType == 5) {
                if (tempWindow == null || tempWindow.wv2.CoreWebView2 == null) { //沒有暫存的window

                    //新建
                    tempWindow = new WebWindow();
                    tempWindow.isDelayInit = false;
                    tempWindow.Init();
                    tempWindow.parentWindow = _parentWindow;
                    tempWindow.args = _args;
                    tempWindow.wv2.Source = new Uri(GetHtmlFilePath(_url));
                    tempWindow.wv2.NavigationCompleted += (sender, e) => { //網頁載入完成時
                        TriggerCreate(tempWindow, _args);
                    };

                    //如果是 單一執行+快速啟動，則在視窗關閉的時候建立下一個視窗
                    if (Program.startType == 5) {
                        tempWindow.FormClosing += (sender2, e2) => {
                            //新建window，用於下次顯示
                            /*DelayRun(10, () => {
                                tempWindow = new WebWindow();
                                tempWindow.isDelayInit = true;
                                tempWindow.Init();
                                tempWindow.args = new string[0] { };
                                tempWindow.wv2.Source = new Uri(GetHtmlFilePath(_url));
                            });*/
                            NewTempWindow(_url); //新建window，用於下次顯示
                        };
                    }

                } else {

                    //呼叫先前已經建立的window來執行onCreate
                    tempWindow.parentWindow = _parentWindow;
                    tempWindow.args = _args;
                    TriggerCreate(tempWindow, _args);
                }

                return tempWindow;
            }


            //第一次開啟
            if (tempWindow == null) {
                var ww = new WebWindow();
                ww.isDelayInit = false;
                ww.Init();
                ww.parentWindow = _parentWindow;
                ww.args = _args;
                ww.wv2.Source = new Uri(GetHtmlFilePath(_url));
                ww.wv2.NavigationCompleted += (sender, e) => { //網頁載入完成時
                    TriggerCreate(ww, _args);
                };

                NewTempWindow(_url); //新建window，用於下次顯示
                Console.WriteLine("第一次開啟:---" + _url);
                return ww;
            }

            var temp2 = tempWindow;
            tempWindow = null;
            //呼叫先前已經建立的window來顯示
            temp2.parentWindow = _parentWindow;
            temp2.args = _args;
            temp2.wv2.NavigationCompleted += (sender, e) => { //網頁載入完成時
                TriggerCreate(temp2, _args);
            };
            TriggerCreate(temp2, _args);

            NewTempWindow(_url); //新建window，用於下次顯示

            return temp2; //回傳剛剛新建的window
        }


        /// <summary>
        /// 新建window，用於下次顯示
        /// </summary>
        /// <param name="url"></param>
        public static void NewTempWindow(string url) {
            if (tempWindow != null) { return; }

            url = GetHtmlFilePath(url);

            Adapter.DelayRun(10, () => {
                if (tempWindow != null) { return; }
                WebWindow temp3 = new WebWindow();
                temp3.isDelayInit = true;
                temp3.Init();
                temp3.args = new string[0] { };
                temp3.wv2.Source = new Uri(url);
                //如果視窗載入完成時，tempWindow已經被暫用，則釋放這個window
                void Wv2_NavigationCompleted(object sender, CoreWebView2NavigationCompletedEventArgs e) {
                    Adapter.DelayRun(100, () => {
                        if (tempWindow == null) {
                            tempWindow = temp3;
                        } else {
                            Adapter.DelayRun(5000, () => {
                                Console.WriteLine("釋放");
                                QuickRun.WindowCreate(); //避免釋放後，window數量對不起來
                                temp3.Close();
                            });
                        }
                    });
                    temp3.wv2.NavigationCompleted -= Wv2_NavigationCompleted;
                }
                temp3.wv2.NavigationCompleted += Wv2_NavigationCompleted; //網頁載入完成時
            });
        }


        /// <summary>
        /// 傳入www資料夾內的檔名，回傳實體路徑
        /// </summary>
        private static string GetHtmlFilePath(string fileName) {
            string p = "file:///" + Path.Combine(
                          System.AppDomain.CurrentDomain.BaseDirectory, "www", fileName
                       ) + "#" + Program.webServer.port; // post 用於讓 js 識別 webAPI 的網址
            return p;
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
        /// <param name="args"></param>
        /// <returns> json </returns>
        public static string GetAppInfo(string[] args, int quickLookRunType) {

            AppInfo appInfo = new AppInfo();
            appInfo.args = args;
            appInfo.startType = Program.startType;
            appInfo.startPort = Program.startPort;
            appInfo.serverCache = Program.serverCache;
            appInfo.appDirPath = System.AppDomain.CurrentDomain.BaseDirectory;
            appInfo.appDataPath = AppPath.appData;
            appInfo.mainPort = Program.webServer.port;
            appInfo.settingPath = AppPath.appDataSetting;
            appInfo.quickLookRunType = quickLookRunType;
            appInfo.isStoreApp = StartWindow.isStoreApp;

            if (File.Exists(appInfo.settingPath)) {
                using (StreamReader sr = new StreamReader(appInfo.settingPath, Encoding.UTF8)) {
                    appInfo.settingTxt = sr.ReadToEnd();
                }
            } else {
                appInfo.settingTxt = "";
            }

            String json = JsonConvert.SerializeObject(appInfo);
            return json;
        }

        public class AppInfo {
            public string[] args; //命令列參數
            public int startType; //1=直接啟動  2=快速啟動  3=快速啟動且常駐  4=單一執行個體  5=單一執行個體且常駐
            public int startPort; //程式開始的port
            public int serverCache; //伺服器對靜態資源使用快取 0=不使用 1=使用 
            public string appDirPath; // 程式所在的資料夾
            public string appDataPath; // 程式的暫存資料夾
            public int mainPort; //目前使用的port
            public string settingPath; //setting.js 的路徑
            public string settingTxt; //setting.js 的文字
            public int quickLookRunType; //是否為快速預覽的視窗。 0=不是快速預覽 1=長按空白鍵 2=長按滑鼠中鍵
            public bool isStoreApp; //是否為商店版APP
            public DataPlugin plugin = Plugin.dataPlugin; //哪些擴充是有啟用的
        }


        /// <summary>
        /// 
        /// </summary>
        public async void Init() {

            this.Opacity = 0;
            wv2 = new WebView2();
            this.Controls.Add(wv2);

            if (isDelayInit) {

                bool firstRunNavigationCompleted = true;
                //初次載入頁面完成時
                wv2.NavigationCompleted += (object sender, CoreWebView2NavigationCompletedEventArgs e) => {

                    //避免重複執行
                    if (firstRunNavigationCompleted == true) {
                        firstRunNavigationCompleted = false;
                    } else { return; }

                    Adapter.DelayRun(100, () => {
                        this.Show();
                        this.Hide(); //等待網頁載入完成後才隱藏視窗，避免焦點被webview2搶走
                    });

                };

            } else {

                this.Show();
                this.Hide();

            }

            wv2.ZoomFactor = 1;
            wv2.DefaultBackgroundColor = System.Drawing.Color.Transparent;
            wv2.Dock = DockStyle.Fill;

            var opts = new CoreWebView2EnvironmentOptions { AdditionalBrowserArguments = Program.webvviewArguments };
            CoreWebView2Environment webView2Environment = await CoreWebView2Environment.CreateAsync(null, AppPath.appData, opts);
            await wv2.EnsureCoreWebView2Async(webView2Environment); //等待初始化完成
            wv2.CoreWebView2.Profile.PreferredColorScheme = Microsoft.Web.WebView2.Core.CoreWebView2PreferredColorScheme.Dark; //指定為深色主題

            //wv2.CoreWebView2.Settings.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.124 Safari/537.36 Edg/102.0.1245.44";
            wv2.CoreWebView2.Settings.IsSwipeNavigationEnabled = false; //是否在啟用了觸摸輸入的設備上使用輕掃手勢在 WebView2 中導航
            //wv2.CoreWebView2.Settings.IsPinchZoomEnabled = false; //觸摸輸入的設備上使用捏合運動在 WebView2 中縮放 Web 內容
            wv2.CoreWebView2.Settings.IsGeneralAutofillEnabled = false; //自動填充啟用
            wv2.CoreWebView2.Settings.IsZoomControlEnabled = false; //使用者是否能夠影響 Web 視圖的縮放
            //wv2.CoreWebView2.Settings.AreBrowserAcceleratorKeysEnabled = false; //是否啟用特定於瀏覽器的快速鍵
            wv2.CoreWebView2.Settings.IsStatusBarEnabled = false; //是否顯示左下角的網址狀態

            WV_Window = new WV_Window(this);
            WV_Directory = new WV_Directory(this);
            WV_File = new WV_File(this);
            WV_Path = new WV_Path(this);
            WV_System = new WV_System(this);
            WV_RunApp = new WV_RunApp(this);
            WV_Image = new WV_Image(this);
            wv2.CoreWebView2.AddHostObjectToScript("WV_Window", WV_Window);
            wv2.CoreWebView2.AddHostObjectToScript("WV_Directory", WV_Directory);
            wv2.CoreWebView2.AddHostObjectToScript("WV_File", WV_File);
            wv2.CoreWebView2.AddHostObjectToScript("WV_Path", WV_Path);
            wv2.CoreWebView2.AddHostObjectToScript("WV_System", WV_System);
            wv2.CoreWebView2.AddHostObjectToScript("WV_RunApp", WV_RunApp);
            wv2.CoreWebView2.AddHostObjectToScript("WV_Image", WV_Image);
            wv2.CoreWebView2.AddHostObjectToScript("WV_T", new WV_T());

            // webView21.CoreWebView2.AddScriptToExecuteOnDocumentCreatedAsync("var webBrowserObj= window.chrome.webview.hostObjects.webBrowserObj;");

            //開啟時視窗時
            wv2.CoreWebView2.NewWindowRequested += (sender2, e2) => {
                String _fileurl = e2.Uri.ToString();
                //if (_fileurl.IndexOf("http") != 0) {
                e2.Handled = true;
                //}
                //System.Console.WriteLine(_fileurl);
                RunJs($@"
                    var temp_dropPath = ""{_fileurl}"";
                    if(window.baseWindow !== undefined) baseWindow.onNewWindowRequested(""{_fileurl}"");
                ");
            };


            this.SizeChanged += (sender, e) => {
                string s = this.WindowState.ToString();
                RunJs($"baseWindow.onSizeChanged({this.Left},{this.Top},{this.Width},{this.Height},'{s}')");

                //最大化時，視窗內縮
                if (this.WindowState == FormWindowState.Maximized) {
                    int x = System.Windows.Forms.Screen.FromHandle(this.Handle).WorkingArea.X
                            - this.RectangleToScreen(new Rectangle()).X; //程式所在的螢幕工作區域-程式目前坐標
                    x = Math.Abs(x) - 1;
                    this.Padding = new System.Windows.Forms.Padding(x);
                } else {
                    this.Padding = new System.Windows.Forms.Padding(0);
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
                WV_System.FileWatcherDispose(); //停止偵測檔案變化
                QuickRun.WindowFreed();
            };
        }


        /// <summary>
        /// 以js呼叫此函數後才會顯示視窗(從父視窗的中間開啟
        /// </summary>
        public void ShowWindowAtCenter(int width, int height) {

            //如果視窗已經顯示了，則只取得焦點，不做其他事情
            if (isShow) {
                if (this.WindowState == FormWindowState.Minimized) { //如果是最小化
                    ShowWindow(this.Handle, SW_NORMAL); //視窗狀態    
                    //this.WindowState = FormWindowState.Normal; //視窗化
                }
                SetFocus(); //讓視窗在最上面並且取得焦點
                return;
            }
            isShow = true;

            QuickRun.WindowCreate();

            if (parentWindow != null) {
                ShowWindow(this.Handle, SW_SHOWDEFAULT); //視窗狀態
                SetSize(width, height);

                int w = this.Width - parentWindow.Width;
                int h = this.Height - parentWindow.Height;
                int l = parentWindow.Left - (w / 2);
                int t = parentWindow.Top - (h / 2);
                this.SetPosition(l, t);

            } else {
                ShowWindow(this.Handle, SW_SHOWDEFAULT); //視窗狀態
                SetPositionInit();
            }
            this.Show();
            this.Opacity = 1;

            RunJs($"baseWindow.SizeChanged({this.Left},{this.Top},{this.Width},{this.Height},'{this.WindowState}')");
            SetFocus(); //讓視窗在最上面並且取得焦點

            if (parentWindow != null) { //避免開子視窗後導致父親視窗失去 置頂
                if (parentWindow.TopMost == true) {
                    parentWindow.TopMost = true;
                }
            }
        }


        /// <summary>
        /// 以js呼叫此函數後才會顯示視窗(初始化坐標與size
        /// </summary>
        /// <param name="x"></param>
        /// <param name="y"></param>
        /// <param name="width"></param>
        /// <param name="height"></param>
        /// <param name="windowState"></param>
        public void ShowWindowAtPosition(int x, int y, int width, int height, string windowState) {

            //如果視窗已經顯示了，則只取得焦點，不做其他事情
            if (isShow) {
                if (this.WindowState == FormWindowState.Minimized) { //如果是最小化
                    ShowWindow(this.Handle, SW_NORMAL); //視窗狀態    
                    //this.WindowState = FormWindowState.Normal; //視窗化
                }
                SetFocus(); //讓視窗在最上面並且取得焦點
                return;
            }
            isShow = true;

            QuickRun.WindowCreate();

            this.SetPosition(x, y);
            this.SetSize(width, height);

            if (windowState == "Maximized") {
                //this.WindowState = FormWindowState.Maximized;
                ShowWindow(this.Handle, SW_MAXIMIZE); //視窗狀態
            }
            if (windowState == "Minimized") {
                //this.WindowState = FormWindowState.Minimized;
                ShowWindow(this.Handle, SW_MINIMIZE); //視窗狀態
            }
            if (windowState == "Normal") {
                //this.WindowState = FormWindowState.Normal;
                ShowWindow(this.Handle, SW_SHOWDEFAULT); //視窗狀態
            }
            this.Show();
            this.Opacity = 1;

            RunJs($"baseWindow.SizeChanged({this.Left},{this.Top},{this.Width},{this.Height},'{this.WindowState}')");
            SetFocus(); //讓視窗在最上面並且取得焦點

            if (parentWindow != null) { //避免開子視窗後導致父親視窗失去 置頂
                if (parentWindow.TopMost == true) {
                    parentWindow.TopMost = true;
                }
            }
        }


        /// <summary>
        /// 以js呼叫此函數後才會顯示視窗(系統預設指派的視窗坐標
        /// </summary>
        public void ShowWindow() {

            //如果視窗已經顯示了，則只取得焦點，不做其他事情
            if (isShow) {
                if (this.WindowState == FormWindowState.Minimized) { //如果是最小化

                    ShowWindow(this.Handle, SW_RESTORE); //視窗狀態    
                    //this.WindowState = FormWindowState.Normal; //視窗化
                }
                SetFocus(); //讓視窗在最上面並且取得焦點
                return;
            }
            isShow = true;

            QuickRun.WindowCreate();

            ShowWindow(this.Handle, SW_SHOWDEFAULT); //視窗狀態
            SetPositionInit();
            this.Show();
            this.Opacity = 1;

            RunJs($"baseWindow.SizeChanged({this.Left},{this.Top},{this.Width},{this.Height},'{this.WindowState}')");
            SetFocus(); //讓視窗在最上面並且取得焦點

            if (parentWindow != null) { //避免開子視窗後導致父親視窗失去 置頂
                if (parentWindow.TopMost == true) {
                    parentWindow.TopMost = true;
                }
            }
        }


        /// <summary>
        /// 關閉視窗
        /// </summary>
        public void CloseWindow() {
            Adapter.DelayRun(1, () => {
                if (tempWindow == this) { tempWindow = null; }
                Close();
            });
        }


        /// <summary>
        /// 隱藏視窗
        /// </summary>
        public void HideWindow() {
            if (isShow) {
                QuickRun.WindowFreed();
                isShow = false;
                this.Hide();
            }
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="js"></param>
        public void RunJs(String js) {
            if (wv2 != null && wv2.CoreWebView2 != null) {
                wv2.CoreWebView2.ExecuteScriptAsync(js);
            } else {
                Console.WriteLine("js執行失敗，webview2 尚未初始化。" + js);
            }
        }



        /// <summary>
        /// 啟用或關閉 全螢幕
        /// </summary>
        public void SetFullScreen(bool val) {
            if (tempFullScreen == val) {
                return;
            }
            tempFullScreen = val;
            if (val) {
                tempFormWindowState = WindowState;

                SuspendLayout();
                FormBorderStyle = FormBorderStyle.None;
                if (WindowState == FormWindowState.Maximized) {
                    WindowState = FormWindowState.Normal;
                }
                WindowState = FormWindowState.Maximized;

                ResumeLayout();
            } else {
                FormBorderStyle = FormBorderStyle.Sizable;
                WindowState = tempFormWindowState;
            }
        }
        /// <summary>
        /// 取得當前是否為 全螢幕
        /// </summary>
        public bool GetFullScreen() {
            return tempFullScreen;
        }


        /// <summary>
        /// 讓視窗在最上面並且取得焦點
        /// </summary>
        public void SetFocus() {

            this.TopMost = true;
            this.TopMost = false;

            GlobalActivate(this.Handle);
            this.Activate();
            this.wv2.Focus();

            /*DelayRun(30, () => {
                //this.wv2.Focus();
                //SwitchToThisWindow(this.wv2.Handle, true);
            });*/
        }

        [DllImport("User32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
        public static extern bool SwitchToThisWindow(IntPtr hWnd, Boolean fAltTab);


        #region 視窗取得焦點

        //https://stackoverflow.com/questions/257587/bring-a-window-to-the-front-in-wpf

        /// <summary>
        /// Activate a window from anywhere by attaching to the foreground window
        /// </summary>
        public static void GlobalActivate(IntPtr interopHelper) {
            //Get the process ID for this window's thread
            //var interopHelper = new WindowInteropHelper(w);
            UInt32 thisWindowThreadId = GetWindowThreadProcessId(interopHelper, IntPtr.Zero);

            //Get the process ID for the foreground window's thread
            var currentForegroundWindow = GetForegroundWindow();
            var currentForegroundWindowThreadId = GetWindowThreadProcessId(currentForegroundWindow, IntPtr.Zero);

            //Attach this window's thread to the current window's thread
            AttachThreadInput(currentForegroundWindowThreadId, thisWindowThreadId, true);
        }


        [DllImport("user32.dll")]
        private static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll")]
        private static extern uint GetWindowThreadProcessId(IntPtr hWnd, IntPtr ProcessId);

        [DllImport("user32.dll")]
        private static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);

        #endregion


        #region  ShowWindow (設定視窗狀態

        public const int SW_HIDE = 0;
        public const int SW_NORMAL = 1;
        public const int SW_MAXIMIZE = 3;
        public const int SW_SHOWNOACTIVATE = 4;
        public const int SW_SHOW = 5;
        public const int SW_MINIMIZE = 6;
        public const int SW_RESTORE = 9;
        public const int SW_SHOWDEFAULT = 10;

        [DllImport("user32.dll")]
        public static extern int ShowWindow(IntPtr hwnd, int nCmdShow);

        #endregion

    }


    /// <summary>
    /// 不會顯示出來的窗體
    /// </summary>
    [ComVisible(true)]
    public class FormNone : Form {

        private int oldX;
        private int oldY;

        // 句柄創建事件
        protected override void OnHandleCreated(EventArgs e) {
            //this.Opacity = 0;
            //設置窗口樣式、雙緩沖等
            SetStyle(
               ControlStyles.UserPaint |
               //ControlStyles.AllPaintingInWmPaint |
               ControlStyles.OptimizedDoubleBuffer |
               ControlStyles.ResizeRedraw |
               ControlStyles.SupportsTransparentBackColor
               , true
            );

            oldX = this.Left; //記錄預設的坐標
            oldY = this.Top;

            this.SetPosition(-9999, -9999); //避免設定坐標前，視窗就已經被看到

            //base.OnHandleCreated(e);
        }


        // 讓視窗看不到
        protected override CreateParams CreateParams {
            get {
                var style = base.CreateParams;
                //style.ClassStyle |= 200; // NoCloseBtn
                //style.ExStyle |= 0x8; // TopMost
                //style.ExStyle |= 0x80000; // Layered
                //style.ExStyle |= 0x02000000;
                //style.ExStyle |= 0x8000000; // NoActive
                style.ExStyle |= 0x00200000;
                return style;
            }
        }


        /// <summary>
        /// 初始化視窗坐標
        /// </summary>
        public void SetPositionInit() {
            this.SetPosition(this.oldX, this.oldY);
        }

        /*protected override void OnShown(EventArgs e) {
            base.OnShown(e);
        }*/


        private bool allowSetSize = false; //暫時允許調整視窗size跟坐標

        /// <summary>
        /// 必須以此方法來修改視窗size
        /// </summary>
        /// <param name="width"></param>
        /// <param name="height"></param>
        public void SetSize(int width, int height) {
            allowSetSize = true;
            this.Size = new Size(width, height);
        }

        /// <summary>
        /// 必須以此方法來修改視窗的坐標
        /// </summary>
        /// <param name="left"></param>
        /// <param name="top"></param>
        public void SetPosition(int left, int top) {
            allowSetSize = true;
            this.Left = left;
            allowSetSize = true;
            this.Top = top;
        }

        /// <summary>
        /// 避免最大化跟視窗化時，視窗大小錯誤
        /// </summary>
        protected override void SetBoundsCore(int x, int y, int width, int height, BoundsSpecified specified) {
            //base.SetBoundsCore(x, y, width- 16, height - 39, specified);
            if (allowSetSize == true) {
                base.SetBoundsCore(x, y, width, height, specified);
                allowSetSize = false;
            }
        }


        // https://rjcodeadvance.com/final-modern-ui-aero-snap-window-resizing-sliding-menu-c-winforms/
        //移除標題列
        protected override void WndProc(ref Message m) {

            const int WM_NCCALCSIZE = 0x0083; //Standar Title Bar - Snap Window

            //Remove border and keep snap window
            if (m.Msg == WM_NCCALCSIZE && m.WParam.ToInt32() == 1) {
                return;
            }

            base.WndProc(ref m);
        }


    }

}
