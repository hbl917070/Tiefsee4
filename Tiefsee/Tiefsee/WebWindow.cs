using Microsoft.Web.WebView2.Core;
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

    //[ClassInterface(ClassInterfaceType.AutoDual)]
    [ComVisible(true)]
    public class WebWindow : FormNone {

        public WebWindow parentWindow;//父親視窗
        public Microsoft.Web.WebView2.WinForms.WebView2 wv2;
        public string[] args;//命令列參數
        private static bool firstRun = true;//用於判斷是否為第一次執行

        public WV_Window WV_Window;
        public WV_Directory WV_Directory;
        public WV_File WV_File;
        public WV_Path WV_Path;
        public WV_System WV_System;
        public WV_RunApp WV_RunApp;
        public WV_Image WV_Image;

        private static WebWindow tempWindow;

        static DateTime time_start_g = DateTime.Now;//計時開始 取得目前時間


        /// <summary>
        /// 
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="_args"></param>
        /// <param name="_parentWindow"></param>
        /// <returns></returns>
        public static WebWindow Create(String _url, string[] _args, WebWindow _parentWindow) {

            time_start_g = DateTime.Now;//計時開始 取得目前時間

            //如果開啟非mainwindow的window
            if (_url.IndexOf("/www/MainWindow.html") == -1) {//$"http://localhost:{Program.bserver.port}/www/MainWindow.html"
                var ww = new WebWindow();
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
                    tempWindow = new WebWindow();
                    tempWindow.parentWindow = _parentWindow;
                    tempWindow.args = _args;
                    tempWindow.wv2.Source = new Uri(_url);
                    tempWindow.wv2.NavigationCompleted += (sender, e) => {//網頁載入完成時
                        tempWindow.RunJs($"baseWindow.onCreate({GetAppInfo(_args)});");
                    };

                } else {

                    //呼叫先前已經建立的window來顯示
                    tempWindow.parentWindow = _parentWindow;
                    tempWindow.args = _args;
                    tempWindow.RunJs($"baseWindow.onCreate({GetAppInfo(_args)});");
                }

                if ( Program.startType == 5) {
                    tempWindow.FormClosed += (sender2, e2) => {//
         
                        //新建window，用於下次顯示
                        DelayRun(10, () => {
                            tempWindow = new WebWindow();
                            tempWindow.args = new string[0] { };
                            tempWindow.wv2.Source = new Uri(_url);
                        });
                    };
                }

                return tempWindow;
            }


            //第一次開啟
            if (tempWindow == null) {

                var ww = new WebWindow();
                ww.parentWindow = _parentWindow;
                ww.args = _args;
                ww.wv2.Source = new Uri(_url);
                ww.wv2.NavigationCompleted += (sender, e) => {//網頁載入完成時
                    ww.RunJs($"baseWindow.onCreate({GetAppInfo(_args)});");
                };

                //新建window，用於下次顯示
                DelayRun(10, () => {
                    tempWindow = new WebWindow();
                    tempWindow.args = new string[0] { };
                    tempWindow.wv2.Source = new Uri(_url);
                });

                return ww;
            }





            var temp2 = tempWindow;

            //呼叫先前已經建立的window來顯示
            tempWindow.parentWindow = _parentWindow;
            tempWindow.args = _args;
            if (tempWindow.wv2.CoreWebView2 != null) {
                tempWindow.RunJs($"baseWindow.onCreate({GetAppInfo(_args)});");
            } else {
                tempWindow.wv2.NavigationCompleted += (sender, e) => {//網頁載入完成時
                    tempWindow.RunJs($"baseWindow.onCreate({GetAppInfo(_args)});");
                };
            }

            //新建window，用於下次顯示
            DelayRun(10, () => {
                tempWindow = new WebWindow();
                tempWindow.args = new string[0] { };
                tempWindow.wv2.Source = new Uri($"http://localhost:{Program.bserver.port}/www/MainWindow.html");
            });

            return temp2;//回傳剛剛新建的window
        }


        /// <summary>
        /// 
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


        /// <summary>
        /// 
        /// </summary>
        public WebWindow() {

            if (firstRun == true) {//只有啟動程式時才會執行這裡
                Adapter.Initialize();
                DownloadWebview2();//檢查是否有webview2執行環境
                firstRun = false;
            }

            //this.AutoScaleMode = AutoScaleMode.Dpi;
            //this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.Opacity = 0;//一開始先隱藏，webview2初始化完成才顯示視窗
            this.SetSize(400, 300);
            this.Show();
            this.Hide();
            this.BackColor = Color.Red;//設定視窗為透明背景
            this.TransparencyKey = Color.Red;

            //this.args = _args;
            //this.parentWindow = _parentWindow;

            InitWebview();

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
        /// <param name="_url"></param>
        public async Task<int> InitWebview() {

            DateTime time_start = DateTime.Now;//計時開始 取得目前時間

            //
            //
            //

            wv2 = new Microsoft.Web.WebView2.WinForms.WebView2();
            CoreWebView2Environment webView2Environment = await CoreWebView2Environment.CreateAsync(null, Program.appDataPath);
            await wv2.EnsureCoreWebView2Async(webView2Environment);//等待初始化完成

            this.Controls.Add(wv2);
            wv2.DefaultBackgroundColor = System.Drawing.Color.Transparent;
            wv2.Dock = DockStyle.Fill;

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

            wv2.NavigationCompleted += (sender, e) => {//網頁載入完成時
            };




            DateTime time_end = DateTime.Now;//計時結束 取得目前時間            
            string result2 = ((TimeSpan)(time_end - time_start)).TotalMilliseconds.ToString();//後面的時間減前面的時間後 轉型成TimeSpan即可印出時間差
            System.Console.WriteLine("+++++++++++++++++++++++++++++++++++" + result2 + " 毫秒");

            return 0;

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
        /// 呼叫此函數後才會顯示視窗( 以js呼叫
        /// </summary>
        public void ShowWindow() {

            //如果視窗已經顯示了，則只取得焦點，不做其他事情
            if (this.Visible == true) {
                if (this.WindowState == FormWindowState.Minimized) {
                    this.WindowState = FormWindowState.Normal;
                }
                SetForegroundWindow(this.wv2.Handle);
                return;
            }

            //顯示視窗
            this.Show();
            wv2.Width = 0;
            this.Opacity = 1;

            //讓視窗在最上面並且取得焦點
            //this.TopMost = true;
            //this.TopMost = false;
            this.wv2.Focus();
            SetForegroundWindow(this.wv2.Handle);



            QuickRun.WindowCreat();
            this.FormClosed += (sender, e) => {
                QuickRun.WindowFreed();
            };

            string windowState = this.WindowState.ToString();
            RunJs($"baseWindow.SizeChanged({this.Left},{this.Top},{this.Width},{this.Height},'{windowState}')");




            //
            //
            //
            DateTime time_end = DateTime.Now;//計時結束 取得目前時間            
            string result2 = ((TimeSpan)(time_end - time_start_g)).TotalMilliseconds.ToString();//後面的時間減前面的時間後 轉型成TimeSpan即可印出時間差
            System.Console.WriteLine("/////////" + result2 + " 毫秒");
        }






        [DllImport("USER32.DLL")]
        public static extern bool SetForegroundWindow(IntPtr hWnd);




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

        #region 防止窗體閃屏
        private void InitializeStyles() {
            SetStyle(
                ControlStyles.UserPaint |
                //ControlStyles.AllPaintingInWmPaint |
                ControlStyles.OptimizedDoubleBuffer |
                ControlStyles.ResizeRedraw |
                ControlStyles.SupportsTransparentBackColor
                , true
            );
            //SetStyle(ControlStyles.Selectable, true);
            //UpdateStyles();
        }
        #endregion

        #region 句柄創建事件
        protected override void OnHandleCreated(EventArgs e) {
            InitializeStyles();//設置窗口樣式、雙緩沖等
            //base.OnHandleCreated(e);
        }
        #endregion

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

        protected override void OnShown(EventArgs e) {
            base.OnShown(e);
        }


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
