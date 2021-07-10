using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace tiefsee {


    public class FormNone : Form {
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
    }



    public class WebWindow : FormNone {

        public Form parentForm;
        public Microsoft.Web.WebView2.WinForms.WebView2 wv2;

        public WebWindow(String _url) {


            wv2 = new Microsoft.Web.WebView2.WinForms.WebView2();
            //this.Opacity = 0;

            parentForm = new FormNone();
            //this.Show();

            parentForm.Controls.Add(wv2);
            parentForm.Show(this);
            //parentForm.Opacity = 0.5;

            // ((System.ComponentModel.ISupportInitialize)(this.webView21)).BeginInit();
            // ((System.ComponentModel.ISupportInitialize)(this.webView21)).EndInit();
            parentForm.FormBorderStyle = FormBorderStyle.None;
            parentForm.ShowInTaskbar = false;

            //設定子視窗為透明背景
            parentForm.BackColor = Color.Red;
            parentForm.TransparencyKey = parentForm.BackColor;


            wv2.Dock = DockStyle.Fill;
            wv2.Source = new Uri(_url);
            wv2.DefaultBackgroundColor = System.Drawing.Color.Transparent;
            wv2.NavigationStarting += (sender, e) => {

                wv2.CoreWebView2.AddHostObjectToScript("cef_window", new cef_window(this));
                // webView21.CoreWebView2.AddScriptToExecuteOnDocumentCreatedAsync("var webBrowserObj= window.chrome.webview.hostObjects.webBrowserObj;");
            };

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
            parentForm.GotFocus += (sender, e) => { runScript("baseWindow.GotFocus()"); };
            parentForm.LostFocus += (sender, e) => { runScript("baseWindow.LostFocus()"); };

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
            } else  {
                parentForm.Visible = true;  
            }

            if (this.Visible == false) {
                parentForm.Visible = false;
                return;
            } else {
                parentForm.Visible = true;
            }

            int c = SystemInformation.VerticalResizeBorderThickness;


            if (this.WindowState == FormWindowState.Maximized) {
                //最大化時，視窗內縮8px
                int h = SystemInformation.VerticalResizeBorderThickness - SystemInformation.BorderSize.Height;
                h = 8;
                parentForm.Width = this.Width - h * 2;
                parentForm.Height = this.Height - h * 2;
                parentForm.Left = this.Left + h;
                parentForm.Top = this.Top + h;
            } else {
                parentForm.Width = this.Width;
                parentForm.Height = this.Height;
                parentForm.Left = this.Left;
                parentForm.Top = this.Top;
            }

        }



        /// <summary>
        /// 完全隱藏視窗
        /// </summary>
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


        #region 視窗拖曳


        public enum ResizeDirection {
            LC = 0xF001,//左
            RC = 0xF002,//右
            CT = 0xF003,//上
            LT = 0xF004,//左上
            RT = 0xF005,//右上
            CB = 0xF006,//下
            LB = 0xF007,//左下
            RB = 0xF008,//右下
            Move = 0xF012 //移動
        }

        [DllImport("user32.dll")]
        public static extern bool ReleaseCapture();
        [DllImport("user32.dll")]
        public static extern bool SendMessage(IntPtr hwnd, int wMsg, int wParam, int lParam);
        public const int WM_SYSCOMMAND = 0x0112;
        #endregion
    }



    [ClassInterface(ClassInterfaceType.AutoDual)]
    [ComVisible(true)]
    /// <summary>
    /// 網頁呼叫C#方法
    /// </summary>
    public class cef_window {


        WebWindow M;
        Form parentForm;

        public cef_window(WebWindow m) {

            this.M = m;
            parentForm = M.parentForm;


        }



        /// <summary>
        /// 標題
        /// </summary>
        public String Text {
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
        public String WindowState {
            get {
                if (M.WindowState == FormWindowState.Maximized) { return "Maximized"; }
                if (M.WindowState == FormWindowState.Minimized) { return "Minimized"; }
                if (M.WindowState == FormWindowState.Normal) { return "Normal"; }
                return "null";
            }
            set {
                if (value == "Maximized") { M.WindowState = FormWindowState.Maximized; }
                if (value == "Minimized") { M.WindowState = FormWindowState.Minimized; }
                if (value == "Normal") { M.WindowState = FormWindowState.Normal; }
            }
        }

        /// <summary>
        /// 關閉視窗
        /// </summary>
        public void Close() {
            M.Invoke(new MethodInvoker(() => {//委託UI行緒                             
                M.Close();
            }));
        }


        public Boolean TopMost {
            get { return M.TopMost; }
            set { M.TopMost = value; }
        }



        public void showTest(String ss) {
            //M.label1.Text = ss;
            //MessageBox.Show("this in C#.\n\r" + ss);
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="_type"></param>
        public void WindowDrag(String _type) {

            var _run = WebWindow.ResizeDirection.Move;

            if (_type == "CT") { _run = WebWindow.ResizeDirection.CT; }
            if (_type == "RC") { _run = WebWindow.ResizeDirection.RC; }
            if (_type == "CB") { _run = WebWindow.ResizeDirection.CB; }
            if (_type == "LC") { _run = WebWindow.ResizeDirection.LC; }
            if (_type == "LT") { _run = WebWindow.ResizeDirection.LT; }
            if (_type == "RT") { _run = WebWindow.ResizeDirection.RT; }
            if (_type == "LB") { _run = WebWindow.ResizeDirection.LB; }
            if (_type == "RB") { _run = WebWindow.ResizeDirection.RB; }

            M.Invoke(new MethodInvoker(() => {//委託UI行緒                             
                WebWindow.ReleaseCapture();
                WebWindow.SendMessage(M.Handle, WebWindow.WM_SYSCOMMAND, (int)_run, 0);
            }));
        }








        [System.Runtime.CompilerServices.IndexerName("Items")]
        public string this[int index] {
            get { return m_dictionary[index]; }
            set { m_dictionary[index] = value; }
        }
        private Dictionary<int, string> m_dictionary = new Dictionary<int, string>();
    }
}
