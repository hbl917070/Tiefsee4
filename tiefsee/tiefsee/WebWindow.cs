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
using Timer = System.Windows.Forms.Timer;

namespace tiefsee {

    //[ClassInterface(ClassInterfaceType.AutoDual)]
    [ComVisible(true)]
    public class WebWindow : FormNone {


        /* protected override CreateParams CreateParams {
             get {
                 var style = base.CreateParams;
                 //style.ClassStyle |= 200; // NoCloseBtn
                 //style.ExStyle |= 0x8; // TopMost
                 style.ExStyle |= 0x80000; // Layered
                 //style.ExStyle |= 0x8000000; // NoActive          
                 return style;
             }
         }*/


        public WebWindow parentWindow;//父親視窗
        public Microsoft.Web.WebView2.WinForms.WebView2 wv2;
        public string[] args;

        public WebWindow(String _url, string[] _args, WebWindow _parentWindow) {

            Adapter.Initialize();

            DownloadWebview2();//檢查是否有webview2執行環境

            //this.AutoScaleMode = AutoScaleMode.Dpi;
            //this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
           
            this.Opacity = 0;//一開始先隱藏，webview2初始化完成才顯示視窗
            this.SetSize(400, 300);
            this.Show();
            this.Hide();
            this.BackColor = Color.Red;//設定視窗為透明背景
            this.TransparencyKey = this.BackColor;

            this.args = _args;
            this.parentWindow = _parentWindow;

            wv2 = new Microsoft.Web.WebView2.WinForms.WebView2();
            InitWebview(_url);
          

            this.SizeChanged += (sender, e) => {
                string s = this.WindowState.ToString();
                RunJs($"baseWindow.SizeChanged({this.Left},{this.Top},{this.Width},{this.Height},'{s}')");
                Width = Width;
            };
            this.Move += (sender, e) => {
                string s = this.WindowState.ToString();
                RunJs($"baseWindow.Move({this.Left},{this.Top},{this.Width},{this.Height},'{s}')");
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
        private async void InitWebview(string _url) {

            wv2.DefaultBackgroundColor = System.Drawing.Color.Transparent;
            wv2.Dock = DockStyle.Fill;
            wv2.Source = new Uri(_url);

            await wv2.EnsureCoreWebView2Async();//等待初始化完成

            wv2.NavigationCompleted += (sender, e) => {//網頁載入完成時
            };

            wv2.CoreWebView2.AddHostObjectToScript("WV_Window", new WV_Window(this));
            wv2.CoreWebView2.AddHostObjectToScript("WV_Directory", new WV_Directory(this));
            wv2.CoreWebView2.AddHostObjectToScript("WV_File", new WV_File(this));
            wv2.CoreWebView2.AddHostObjectToScript("WV_Path", new WV_Path(this));
            wv2.CoreWebView2.AddHostObjectToScript("WV_System", new WV_System(this));
            wv2.CoreWebView2.AddHostObjectToScript("WV_RunApp", new WV_RunApp(this));
            wv2.CoreWebView2.AddHostObjectToScript("WV_Image", new WV_Image(this));

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

            string windowState = this.WindowState.ToString();
            RunJs($"baseWindow.SizeChanged({this.Left},{this.Top},{this.Width},{this.Height},'{windowState}')");

            this.Show();
            this.Controls.Add(wv2); 
            this.Opacity = 1;
            /*var tim = new System.Windows.Forms.Timer();
            tim.Interval = 300;
            tim.Tick += (sender,e) => {
            
            };
            tim.Start();*/
            
        }


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
                    MessageBox.Show("必須安裝Webview2才能運行TiefSee");
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
            SetStyle(ControlStyles.Selectable, false);
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
                                          //style.ExStyle |= 0x8000000; // NoActive          
                return style;
            }
        }

        protected override void OnShown(EventArgs e) {
            base.OnShown(e);
        }


        private bool allowSetSize = false;
        public void SetSize(int width, int height) {
            allowSetSize = true;
            this.Size = new Size(width, height);
        }

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
