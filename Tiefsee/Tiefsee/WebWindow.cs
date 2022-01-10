using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Tiefsee {


    public class WV2 : WebView2 {

        public bool allowFocus = false;

        // 讓視窗看不到
        protected override CreateParams CreateParams {
            get {
                var style = base.CreateParams;
                //style.ClassStyle |= 200; // NoCloseBtn
                //style.ExStyle |= 0x8; // TopMost
                //style.ExStyle |= 0x80000; // Layered
                style.ExStyle |= 0x02000000;
                //style.ExStyle |= 0x8000000; // NoActive
                return style;
            }
        }

        protected override void OnGotFocus(EventArgs e) {
            if (allowFocus) {
                base.OnGotFocus(e);
            }
        }

        public void RunFocus() {
            OnGotFocus(new EventArgs());
        }

    }


    //[ClassInterface(ClassInterfaceType.AutoDual)]
    [ComVisible(true)]
    public class WebWindow : FormNone {

        //public WebView2 wv2;
        public WV2 wv2;
        public WebWindow parentWindow;//父親視窗
        public string[] args;//命令列參數
        private static bool firstRun = true;//用於判斷是否為第一次執行(用於偵測是否有webview2執行環境
        private static WebWindow tempWindow;//用於快速啟動的暫存視窗
        private bool isShow = false;//是否已經顯式過視窗(用於單一啟動
        public bool isDelayInit = false;//是否延遲初始化(暫存視窗必須設定成true

        public WV_Window WV_Window;
        public WV_Directory WV_Directory;
        public WV_File WV_File;
        public WV_Path WV_Path;
        public WV_System WV_System;
        public WV_RunApp WV_RunApp;
        public WV_Image WV_Image;


        #region

        //API 常數定義
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




        /// <summary>
        /// 新建視窗
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="_args"></param>
        /// <param name="_parentWindow"></param>
        /// <returns></returns>
        public static WebWindow Create(String _url, string[] _args, WebWindow _parentWindow) {

            //如果開啟非mainwindow的window
            if (_url.IndexOf("/www/MainWindow.html") == -1) {//$"http://localhost:{Program.bserver.port}/www/MainWindow.html"
                var ww = new WebWindow();
                ww.isDelayInit = false;
                ww.Init();
                ww.parentWindow = _parentWindow;
                ww.args = _args;
                ww.wv2.Source = new Uri(_url);
                ww.wv2.NavigationCompleted += (sender, e) => {//網頁載入完成時
                    ww.RunJs($"baseWindow.onCreate({GetAppInfo(_args)});");
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
                ww.wv2.Source = new Uri(_url);
                ww.wv2.NavigationCompleted += (sender, e) => {//網頁載入完成時
                    ww.RunJs($"baseWindow.onCreate({GetAppInfo(_args)});");
                };
                return ww;
            }

            //單一執行個體
            if (Program.startType == 4 || Program.startType == 5) {
                if (tempWindow == null || tempWindow.wv2.CoreWebView2 == null) {//沒有暫存的window

                    //新建
                    tempWindow = new WebWindow();
                    tempWindow.isDelayInit = false;
                    tempWindow.Init();
                    tempWindow.parentWindow = _parentWindow;
                    tempWindow.args = _args;
                    tempWindow.wv2.Source = new Uri(_url);
                    tempWindow.wv2.NavigationCompleted += (sender, e) => {//網頁載入完成時
                        tempWindow.RunJs($"baseWindow.onCreate({GetAppInfo(_args)});");
                    };

                    //如果是 單一執行+快速啟動，則在視窗關閉的時候建立下一個視窗
                    if (Program.startType == 5) {
                        tempWindow.FormClosing += (sender2, e2) => {
                            //新建window，用於下次顯示
                            DelayRun(10, () => {
                                tempWindow = new WebWindow();
                                tempWindow.isDelayInit = true;
                                tempWindow.Init();
                                tempWindow.args = new string[0] { };
                                tempWindow.wv2.Source = new Uri(_url);
                            });
                        };
                    }

                } else {

                    //呼叫先前已經建立的window來執行onCreate
                    tempWindow.parentWindow = _parentWindow;
                    tempWindow.args = _args;
                    tempWindow.RunJs($"baseWindow.onCreate({GetAppInfo(_args)});");
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
                ww.wv2.Source = new Uri(_url);
                ww.wv2.NavigationCompleted += (sender, e) => {//網頁載入完成時
                    ww.RunJs($"baseWindow.onCreate({GetAppInfo(_args)});");
                };

                //新建window，用於下次顯示
                DelayRun(10, () => {
                    tempWindow = new WebWindow();
                    tempWindow.isDelayInit = true;
                    tempWindow.Init();
                    tempWindow.args = new string[0] { };
                    tempWindow.wv2.Source = new Uri(_url);
                });

                return ww;
            }


            var temp2 = tempWindow;


            //呼叫先前已經建立的window來顯示
            temp2.parentWindow = _parentWindow;
            temp2.args = _args;
            if (temp2.wv2.CoreWebView2 != null) {
                temp2.RunJs($"baseWindow.onCreate({GetAppInfo(_args)});");
            } else {
                temp2.wv2.NavigationCompleted += (sender, e) => {//網頁載入完成時
                    temp2.RunJs($"baseWindow.onCreate({GetAppInfo(_args)});");
                };
            }
            //temp2.SetFocus();

            //新建window，用於下次顯示
            DelayRun(10, () => {
                tempWindow = new WebWindow();
                tempWindow.isDelayInit = true;
                tempWindow.Init();
                tempWindow.args = new string[0] { };
                tempWindow.wv2.Source = new Uri($"http://localhost:{Program.bserver.port}/www/MainWindow.html");
            });

            return temp2;//回傳剛剛新建的window
        }


        /// <summary>
        /// 
        /// </summary>
        public WebWindow() {

            if (firstRun == true) {//只有啟動程式時才會執行這裡
                Adapter.Initialize();
                DownloadWebview2();//檢查是否有webview2執行環境
                firstRun = false;
            }

            //Init();
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="_url"></param>
        public async void Init() {

            //this.SetSize(400, 300);
            this.Opacity = 0;

            wv2 = new WV2();

            if (isDelayInit) {

                bool firstRunNavigationCompleted = true;
                //初次載入頁面完成時
                wv2.NavigationCompleted += (object sender, CoreWebView2NavigationCompletedEventArgs e) => {

                    //避免重複執行
                    if (firstRunNavigationCompleted == true) {
                        firstRunNavigationCompleted = false;
                    } else { return; }

                    //ShowWindow(this.Handle, SW_SHOWDEFAULT); //視窗狀態
                    //ShowWindow(this.Handle, SW_HIDE);
                    this.Show();
                    this.Hide();//等待網頁載入完成後才隱藏視窗，避免焦點被webview2搶走
                    
                    //必須使用此語法，否則會無法點擊視窗
                    this.BackColor = Color.Red;
                    this.TransparencyKey = Color.Red;
       
                    this.Controls.Add(wv2);
                };

            } else {

                this.Show();
                this.Hide();

                //必須使用此語法，否則會無法點擊視窗
                this.BackColor = Color.Red;
                this.TransparencyKey = Color.Red;

                this.Controls.Add(wv2);
            }

            wv2.DefaultBackgroundColor = System.Drawing.Color.Transparent;
            wv2.Dock = DockStyle.Fill;
            CoreWebView2Environment webView2Environment = await CoreWebView2Environment.CreateAsync(null, Program.appDataPath);
            await wv2.EnsureCoreWebView2Async(webView2Environment);//等待初始化完成

            wv2.CoreWebView2.Settings.IsSwipeNavigationEnabled = false;//是否在啟用了觸摸輸入的設備上使用輕掃手勢在 WebView2 中導航
            wv2.CoreWebView2.Settings.IsPinchZoomEnabled = false;//觸摸輸入的設備上使用捏合運動在 WebView2 中縮放 Web 內容
            wv2.CoreWebView2.Settings.IsGeneralAutofillEnabled = false;//自動填充啟用
            wv2.CoreWebView2.Settings.IsZoomControlEnabled = false;//使用者是否能夠影響 Web 視圖的縮放
            //wv2.CoreWebView2.Settings.AreBrowserAcceleratorKeysEnabled = false;//是否啟用特定於瀏覽器的快速鍵

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
                RunJs($"var temp_dropPath = \"{_fileurl}\"");
            };


            this.SizeChanged += (sender, e) => {
                string s = this.WindowState.ToString();
                RunJs($"baseWindow.onSizeChanged({this.Left},{this.Top},{this.Width},{this.Height},'{s}')");

                //最大化時，程式網內縮
                if (this.WindowState == FormWindowState.Maximized) {
                    int x = System.Windows.Forms.Screen.FromHandle(this.Handle).WorkingArea.X
                            - this.RectangleToScreen(new Rectangle()).X;//程式所在的螢幕工作區域-程式目前坐標
                    x = Math.Abs(x) - 1;
                    //System.Console.WriteLine(x + "");
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

        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="args"></param>
        /// <returns></returns>
        public static string GetAppInfo(string[] args) {

            AppInfo appInfo = new AppInfo();
            appInfo.args = args;
            appInfo.startType = Program.startType;
            appInfo.startPort = Program.startPort;
            appInfo.appDirPath = System.AppDomain.CurrentDomain.BaseDirectory;
            appInfo.appDataPath = Program.appDataPath;
            appInfo.mainPort = Program.bserver.port;
            appInfo.settingPath = Path.Combine(Program.appDataPath, "setting.json");

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
            public string[] args;//命令列參數
            public int startType;//1=直接啟動  2=快速啟動  3=快速啟動且常駐  4=單一執行個體
            public int startPort;//程式開始的port
            public string appDirPath;// 程式所在的資料夾
            public string appDataPath;// 程式的暫存資料夾
            public int mainPort;//目前使用的port
            public string settingPath;// setting.js 的路徑
            public string settingTxt;// setting.js 的文字
        }



        /// <summary>
        /// 以js呼叫此函數後才會顯示視窗(從父視窗的中間開啟
        /// </summary>
        public void ShowWindow_Center(int width, int height) {

            //如果視窗已經顯示了，則只取得焦點，不做其他事情
            if (isShow) {
                if (this.WindowState == FormWindowState.Minimized) {//如果是最小化
                    ShowWindow(this.Handle, SW_NORMAL);//視窗狀態    
                    //this.WindowState = FormWindowState.Normal;//視窗化
                }
                SetFocus(); //讓視窗在最上面並且取得焦點
                return;
            }
            isShow = true;

            QuickRun.WindowCreat();
            this.FormClosed += (sender, e) => {
                QuickRun.WindowFreed();
            };

            if (parentWindow != null) {
                ShowWindow(this.Handle, SW_SHOWDEFAULT);//視窗狀態
                SetSize(width, height);

                int w = this.Width - parentWindow.Width;
                int h = this.Height - parentWindow.Height;
                int l = parentWindow.Left - (w / 2);
                int t = parentWindow.Top - (h / 2);
                this.SetPosition(l, t);

            } else {
                ShowWindow(this.Handle, SW_SHOWDEFAULT);//視窗狀態
                SetPositionInit();
            }
            this.Show();
            this.Opacity = 1;

            SetFocus(); //讓視窗在最上面並且取得焦點

            RunJs($"baseWindow.SizeChanged({this.Left},{this.Top},{this.Width},{this.Height},'{this.WindowState}')");
        }


        /// <summary>
        /// 以js呼叫此函數後才會顯示視窗(初始化坐標與size
        /// </summary>
        /// <param name="x"></param>
        /// <param name="y"></param>
        /// <param name="width"></param>
        /// <param name="height"></param>
        /// <param name="windowState"></param>
        public void ShowWindow_SetSize(int x, int y, int width, int height, string windowState) {

            //如果視窗已經顯示了，則只取得焦點，不做其他事情
            if (isShow) {
                if (this.WindowState == FormWindowState.Minimized) {//如果是最小化
                    ShowWindow(this.Handle, SW_NORMAL);//視窗狀態    
                    //this.WindowState = FormWindowState.Normal;//視窗化
                }
                SetFocus(); //讓視窗在最上面並且取得焦點
                return;
            }
            isShow = true;

            QuickRun.WindowCreat();
            this.FormClosed += (sender, e) => {
                QuickRun.WindowFreed();
            };

            //this.Controls.Add(wv2);
            this.SetPosition(x, y);
            this.SetSize(width, height);

            if (windowState == "Maximized") {
                //this.WindowState = FormWindowState.Maximized;
                ShowWindow(this.Handle, SW_MAXIMIZE);//視窗狀態
            }
            if (windowState == "Minimized") {
                //this.WindowState = FormWindowState.Minimized;
                ShowWindow(this.Handle, SW_MINIMIZE);//視窗狀態
            }
            if (windowState == "Normal") {
                //this.WindowState = FormWindowState.Normal;
                ShowWindow(this.Handle, SW_SHOWDEFAULT);//視窗狀態
            }
            this.Show();
            this.Opacity = 1;


            SetFocus(); //讓視窗在最上面並且取得焦點
            RunJs($"baseWindow.SizeChanged({this.Left},{this.Top},{this.Width},{this.Height},'{this.WindowState}')");
        }


        /// <summary>
        /// 以js呼叫此函數後才會顯示視窗(系統預設指派的視窗坐標
        /// </summary>
        public void ShowWindow() {

            //如果視窗已經顯示了，則只取得焦點，不做其他事情
            if (isShow) {
                if (this.WindowState == FormWindowState.Minimized) {//如果是最小化
                    ShowWindow(this.Handle, SW_NORMAL);//視窗狀態    
                    //this.WindowState = FormWindowState.Normal;//視窗化
                }
                SetFocus(); //讓視窗在最上面並且取得焦點
                return;
            }
            isShow = true;

            QuickRun.WindowCreat();
            this.FormClosed += (sender, e) => {
                QuickRun.WindowFreed();
            };

            //this.Controls.Add(wv2);
            ShowWindow(this.Handle, SW_SHOWDEFAULT);//視窗狀態
            SetPositionInit();
            this.Show();
            this.Opacity = 1;

            SetFocus(); //讓視窗在最上面並且取得焦點

            RunJs($"baseWindow.SizeChanged({this.Left},{this.Top},{this.Width},{this.Height},'{this.WindowState}')");
        }




        /// <summary>
        /// 
        /// </summary>
        /// <param name="js"></param>
        public void RunJs(String js) {
            if (wv2.CoreWebView2 != null)
                wv2.CoreWebView2.ExecuteScriptAsync(js);
        }


        /// <summary>
        /// 延遲執行
        /// </summary>
        /// <param name="interval"></param>
        /// <param name="func"></param>
        private static void DelayRun(int interval, Action func) {
            var tim = new System.Windows.Forms.Timer();
            tim.Interval = interval;
            tim.Tick += (sender, e) => {
                func();
                tim.Stop();
            };
            tim.Start();
        }


        /// <summary>
        /// 讓視窗在最上面並且取得焦點
        /// </summary>
        public void SetFocus() {

            this.TopMost = true;
            this.TopMost = false;
            //SetForegroundWindow(this.wv2.Handle);
            this.wv2.allowFocus = true;
            this.wv2.Focus();
            this.wv2.RunFocus();

          
            //var child = GetWindow(this.wv2.Handle, GW_CHILD);
            //SetFocus(child);

            /* DelayRun(1000, () => {

            });*/

        }
        [DllImport("USER32.DLL")]
        public static extern bool SetForegroundWindow(IntPtr hWnd);//視窗取得焦點


        public const uint GW_CHILD = 5;
        [DllImport("user32.dll")]
        public static extern IntPtr GetWindow(IntPtr hWnd, uint uCmd);
        [DllImport("user32.dll")]
        public static extern IntPtr SetFocus(IntPtr hWnd);

        //static WebWindow tempFocus;//當暫存視窗載入網頁時，必須把焦點設定回目前的視窗


        /// <summary>
        /// 檢查是否有執行環境
        /// </summary>
        /// <returns></returns>
        private void DownloadWebview2() {

            new Thread(() => {
                if (CheckWebView2() == true) { //檢查安裝webview2執行環境
                    return;
                }
                Adapter.UIThread(() => {//如果沒有執行環境，就用瀏覽器開啟下載頁面
                    MessageBox.Show("必須安裝Webview2才能運行Tiefsee");
                    System.Diagnostics.Process.Start("https://developer.microsoft.com/microsoft-edge/webview2/");
                    this.Close();
                });
            }).Start();
        }
        private bool CheckWebView2() {
            try {
                var str = Microsoft.Web.WebView2.Core.CoreWebView2Environment.GetAvailableBrowserVersionString();
                if (!string.IsNullOrWhiteSpace(str)) {
                    return true;
                }
            } catch (Exception) {
                return false;
            }
            return false;
        }

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

            oldX = this.Left;//記錄預設的坐標
            oldY = this.Top;

            //this.SetPosition(-9999, -9999);//避免設定坐標前，視窗就已經被看到

            //base.OnHandleCreated(e);
        }


        // 讓視窗看不到
        protected override CreateParams CreateParams {
            get {
                var style = base.CreateParams;
                //style.ClassStyle |= 200; // NoCloseBtn
                //style.ExStyle |= 0x8; // TopMost
                style.ExStyle |= 0x80000; // Layered
                //style.ExStyle |= 0x02000000;
                //style.ExStyle |= 0x8000000; // NoActive
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


        private bool allowSetSize = false;//暫時允許調整視窗size跟坐標

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
        /// <param name="x"></param>
        /// <param name="y"></param>
        /// <param name="width"></param>
        /// <param name="height"></param>
        /// <param name="specified"></param>
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

            const int WM_NCCALCSIZE = 0x0083;//Standar Title Bar - Snap Window

            //Remove border and keep snap window
            if (m.Msg == WM_NCCALCSIZE && m.WParam.ToInt32() == 1) {
                return;
            }

            base.WndProc(ref m);
        }


    }

}
