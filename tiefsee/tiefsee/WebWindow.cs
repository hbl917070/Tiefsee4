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

            this.args = _args;
            this.parentWindow = _parentWindow;

            this.Width = 550;
            this.Height = 400;  
            wv2 = new Microsoft.Web.WebView2.WinForms.WebView2();
            this.Opacity = 0;//一開始先隱藏，webview2初始化完成才顯示視窗
            this.Show();
          
     
            //EnableBlur(this.Handle);//毛玻璃

            InitWebview(_url);

            this.Move += (sender, e) => { setMove(); };
            this.SizeChanged += (sender, e) => { setMove(); };
            this.SystemColorsChanged += (sender, e) => { setMove(); };
            this.VisibleChanged += (sender, e) => { setMove(); };
            this.GotFocus += (sernde, e) => {
                //parentForm.Focus();//避免移動視窗後，焦點被父視窗搶走
            };

            string windowState = this.WindowState.ToString();
            RunJs($"baseWindow.SizeChanged({this.Left},{this.Top},{this.Width},{this.Height},'{windowState}')");

            this.SizeChanged += (sender, e) => {
                string s = this.WindowState.ToString();
                RunJs($"baseWindow.SizeChanged({this.Left},{this.Top},{this.Width},{this.Height},'{s}')");
            };
            this.Move += (sender, e) => {
                string s = this.WindowState.ToString();
                RunJs($"baseWindow.Move({this.Left},{this.Top},{this.Width},{this.Height},'{s}')");
            };

            //this.VisibleChanged += (sender, e) => { RunJs("baseWindow.VisibleChanged()"); };
            //this.FormClosing += (sender, e) => { RunJs("baseWindow.FormClosing()"); };
            //this.GotFocus += (sender, e) => { runScript("baseWindow.GotFocus()"); };//無效
            //this.LostFocus += (sender, e) => { runScript("baseWindow.LostFocus()"); };//無效

        }


        private async void InitWebview(string _url) {

            wv2.DefaultBackgroundColor = System.Drawing.Color.Transparent;
            wv2.Dock = DockStyle.Fill;
            wv2.Source = new Uri(_url);
            
            await wv2.EnsureCoreWebView2Async();//等待初始化完成

            /*var tim = new System.Windows.Forms.Timer();
            tim.Interval = 150;
            tim.Tick += (e, sentet) => {
            };
            tim.Start();*/

            wv2.NavigationCompleted += (sender, e) => {//網頁載入完成時
                this.BackColor = Color.Red;//設定視窗為透明背景
                this.TransparencyKey = this.BackColor;
                this.Controls.Add(wv2);

                this.Opacity = 1;
            };

        
            wv2.CoreWebView2.AddHostObjectToScript("WV_Window", new WV_Window(this));
            wv2.CoreWebView2.AddHostObjectToScript("WV_Directory", new WV_Directory(this));
            wv2.CoreWebView2.AddHostObjectToScript("WV_File", new WV_File(this));
            wv2.CoreWebView2.AddHostObjectToScript("WV_Path", new WV_Path(this));
            wv2.CoreWebView2.AddHostObjectToScript("WV_System", new WV_System(this));
            wv2.CoreWebView2.AddHostObjectToScript("WV_RunApp", new WV_RunApp(this));
            wv2.CoreWebView2.AddHostObjectToScript("WV_Image", new WV_Image(this));

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


        public void RunJs(String js) {
            if (wv2.CoreWebView2 != null)
                wv2.CoreWebView2.ExecuteScriptAsync(js);
        }


        void setMove() {


            //int c = SystemInformation.VerticalResizeBorderThickness;

            // GetWindowRectangle
            //System.Console.WriteLine(btn.PointToScreen(new Point(0,0)).Y + " " + this.PointToScreen(new Point(0, 0)).Y);

            /* if (this.WindowState == FormWindowState.Maximized) {
                 //最大化時，視窗內縮8px
                 int h = SystemInformation.VerticalResizeBorderThickness - SystemInformation.BorderSize.Height;
                 h = 8;
                 this.Width = this.Width - h * 2;
                 this.Height = this.Height - h * 2;
                 this.Left = this.Left + h;
                 this.Top = this.Top + h;
             } else {
                 int h = 7;
                 this.Width = this.Width - h * 2;
                 this.Height = this.Height - h;
                 this.Left = this.Left + h;
                 this.Top = this.Top;
             }*/
        
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
                ControlStyles.SupportsTransparentBackColor, true
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
