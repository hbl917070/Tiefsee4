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


    /// <summary>
    /// 不會顯示出來的窗體
    /// </summary>
    public class FormNone : Form {




        #region 防止窗體閃屏
        private void InitializeStyles() {
            SetStyle(
                ControlStyles.UserPaint |
                //ControlStyles.AllPaintingInWmPaint |
                ControlStyles.OptimizedDoubleBuffer |
                ControlStyles.ResizeRedraw |
                ControlStyles.SupportsTransparentBackColor, true);
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
        /*protected override CreateParams CreateParams {
            get {
                CreateParams p = base.CreateParams;
                p.Style = (int)Win32.WS_CHILD;
                p.Style |= (int)Win32.WS_CLIPSIBLINGS;
                p.ExStyle &= (int)Win32.WS_EX_LAYERED;
                p.Parent = Win32.GetDesktopWindow();
                return p;
            }
        }*/
    }


    [ComVisible(true)]
    public class WebWindow : Form {

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


        public FormNone parentForm;
        public Microsoft.Web.WebView2.WinForms.WebView2 wv2;
        public System.Windows.Window win;

        public WebWindow(String _url) {

            Adapter.Initialize();

            wv2 = new Microsoft.Web.WebView2.WinForms.WebView2();
            wv2.Dock = DockStyle.Fill;
            wv2.Source = new Uri(_url);
            wv2.DefaultBackgroundColor = System.Drawing.Color.Transparent;
            wv2.NavigationStarting += (sender, e) => {
            
                wv2.CoreWebView2.AddHostObjectToScript("WV_Window", new WV_Window(this));
                wv2.CoreWebView2.AddHostObjectToScript("WV_Directory", new WV_Directory(this));
                wv2.CoreWebView2.AddHostObjectToScript("WV_File", new WV_File(this));
                wv2.CoreWebView2.AddHostObjectToScript("WV_Path", new WV_Path(this));

                // webView21.CoreWebView2.AddScriptToExecuteOnDocumentCreatedAsync("var webBrowserObj= window.chrome.webview.hostObjects.webBrowserObj;");

                wv2.CoreWebView2.NewWindowRequested += (sender2, e2) => {
                    String _fileurl = e2.Uri.ToString();
                    //if (_fileurl.IndexOf("http") != 0) {
                    e2.Handled = true;
                    //}
                    System.Console.WriteLine(_fileurl);
                    runScript($"var temp_dropPath = \"{_fileurl}\"");

                };
            };


            this.Opacity = 0;
            this.Show();

            //

            parentForm = new FormNone();
            parentForm.Controls.Add(wv2);
            parentForm.Show(this);

            parentForm.FormBorderStyle = FormBorderStyle.None;
            parentForm.ShowInTaskbar = false;

            //設定子視窗為透明背景
            parentForm.BackColor = Color.Red;
            parentForm.TransparencyKey = parentForm.BackColor;

            setMove();

            this.Move += (sender, e) => { setMove(); };
            this.SizeChanged += (sender, e) => { setMove(); };
            this.SystemColorsChanged += (sender, e) => { setMove(); };
            this.VisibleChanged += (sender, e) => { setMove(); };
            this.GotFocus += (sernde, e) => {
                parentForm.Focus();//避免移動視窗後，焦點被父視窗搶走
            };


            this.SizeChanged += (sender, e) => { runScript("baseWindow.SizeChanged()"); };
            this.Move += (sender, e) => { runScript("baseWindow.Move()"); };
            //this.Resize += (sender, e) => { runScript("baseWindow.Resize()"); };
            this.VisibleChanged += (sender, e) => { runScript("baseWindow.VisibleChanged()"); };
            this.FormClosing += (sender, e) => { runScript("baseWindow.FormClosing()"); };
            this.GotFocus += (sender, e) => { runScript("baseWindow.GotFocus()"); };
            this.LostFocus += (sender, e) => { runScript("baseWindow.LostFocus()"); };

        }





        private void runScript(String js) {
            if (wv2.CoreWebView2 != null)
                wv2.CoreWebView2.ExecuteScriptAsync(js);
        }


        void setMove() {

            //parentForm.WindowState = this.WindowState;
            if (this.WindowState == FormWindowState.Minimized) {
                parentForm.Visible = false;
                return;
            } else {
                parentForm.Visible = true;
            }

            if (this.Visible == false) {
                parentForm.Visible = false;
                return;
            } else {
                parentForm.Visible = true;
            }

            //int c = SystemInformation.VerticalResizeBorderThickness;

            // GetWindowRectangle
            //System.Console.WriteLine(btn.PointToScreen(new Point(0,0)).Y + " " + this.PointToScreen(new Point(0, 0)).Y);

            if (this.WindowState == FormWindowState.Maximized) {
                //最大化時，視窗內縮8px
                int h = SystemInformation.VerticalResizeBorderThickness - SystemInformation.BorderSize.Height;
                h = 8;
                parentForm.Width = this.Width - h * 2;
                parentForm.Height = this.Height - h * 2;
                parentForm.Left = this.Left + h;
                parentForm.Top = this.Top + h;
            } else {

                int h = 7;
                parentForm.Width = this.Width - h * 2;
                parentForm.Height = this.Height - h;
                parentForm.Left = this.Left + h;
                parentForm.Top = this.Top;

                /*
                parentForm.Width = this.Width;
                parentForm.Height = this.Height;
                parentForm.Left = this.Left;
                parentForm.Top = this.Top;*/
            }

        }


    }







    /// <summary>
    /// 滑鼠模擬
    /// </summary>
    class NativeMethods {

        #region #####Mouse#####
        [STAThread]
        [DllImport("User32")]
        public extern static void mouse_event(int dwFlags, int dx, int dy, int dwData, IntPtr dwExtraInfo);


        [DllImport("User32")]
        public extern static void SetCursorPos(int x, int y);
        [DllImport("User32")]
        public extern static bool GetCursorPos(out Point p);
        [DllImport("User32")]
        public extern static int ShowCursor(bool bShow);
        #endregion


        #region 滑鼠模擬

        /// <summary>
        /// 模擬壓住滑鼠左鍵。
        /// </summary>
        public static void LeftDown() {
            NativeMethods.mouse_event(NativeContansts.MOUSEEVENTF_LEFTDOWN, 0, 0, 0, IntPtr.Zero);
        }
        /// <summary>
        /// 模擬釋放滑鼠左鍵。
        /// </summary>
        public static void LeftUp() {
            NativeMethods.mouse_event(NativeContansts.MOUSEEVENTF_LEFTUP, 0, 0, 0, IntPtr.Zero);
        }
        /// <summary>
        /// 模擬點擊滑鼠左鍵。
        /// </summary>
        public static void LeftClick() {
            LeftDown();
            LeftUp();
        }

        /// <summary>
        /// 模擬壓住滑鼠右鍵。
        /// </summary>
        public static void RightDown() {
            NativeMethods.mouse_event(NativeContansts.MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, IntPtr.Zero);
        }
        /// <summary>
        /// 模擬釋放滑鼠右鍵。
        /// </summary>
        public static void RightUp() {
            NativeMethods.mouse_event(NativeContansts.MOUSEEVENTF_RIGHTUP, 0, 0, 0, IntPtr.Zero);
        }
        /// <summary>
        /// 模擬點擊滑鼠右鍵。
        /// </summary>
        public static void RightClick() {
            RightDown();
            RightUp();
        }

        /// <summary>
        /// 模擬壓住滑鼠中鍵。
        /// </summary>
        public static void MiddleDown() {
            NativeMethods.mouse_event(NativeContansts.MOUSEEVENTF_MIDDLEDOWN, 0, 0, 0, IntPtr.Zero);
        }
        /// <summary>
        /// 模擬釋放滑鼠中鍵。
        /// </summary>
        public static void MiddleUp() {
            NativeMethods.mouse_event(NativeContansts.MOUSEEVENTF_MIDDLEUP, 0, 0, 0, IntPtr.Zero);
        }
        /// <summary>
        /// 模擬點擊滑鼠中鍵。
        /// </summary>
        public static void MiddleClick() {
            MiddleDown();
            MiddleUp();
        }

        #endregion

        public class NativeContansts {

            //滑鼠左鍵
            public static int MOUSEEVENTF_LEFTDOWN = 0x0002;
            public static int MOUSEEVENTF_LEFTUP = 0x0004;

            //滑鼠右鍵
            public static int MOUSEEVENTF_RIGHTDOWN = 0x0008;
            public static int MOUSEEVENTF_RIGHTUP = 0x0010;

            //滑鼠中鍵
            public static int MOUSEEVENTF_MIDDLEDOWN = 0x0020;
            public static int MOUSEEVENTF_MIDDLEUP = 0x0040;

            //滑鼠側鍵
            public static int MOUSEEVENTF_XDOWN = 0x0080;
            public static int MOUSEEVENTF_XUP = 0x0100;

            //滾輪
            public static int MOUSEEVENTF_WHEEL = 0x0800;
            public static int MOUSEEVENTF_HWHEEL = 0x01000;


        }


    }


}
