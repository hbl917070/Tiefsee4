using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace tiefsee {


    //[ClassInterface(ClassInterfaceType.AutoDual)]
    [ComVisible(true)]

    /// <summary>
    /// 網頁呼叫C#方法
    /// </summary>
    public class WV_Window {

        public WebWindow M;




        public WV_Window(WebWindow m) {
            this.M = m;
        }


        /// <summary>
        /// 新開視窗
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="_args"></param>
        /// <returns></returns>
        public WebWindow NewWindow(string _url, object[] _args) {

            // _url = $"http://localhost:{55444}/www/MainWindow.html";

            string[] args = new string[_args.Length];
            for (int i = 0; i < args.Length; i++) {
                args[i] = _args[i].ToString();
            }

            var w = new WebWindow(_url, args, M);
            //w.StartPosition = FormStartPosition.CenterParent;
            //w.Show();

            //var x = new WebStart(_url);
            //x.Show();
            //x.Owner = M.parentForm;
            return w;

        }

        /// <summary>
        /// 網頁載入完成後，以js呼叫此函數，才會顯示視窗
        /// </summary>
        public void ShowWindow() {
            M.ShowWindow();
        }

        /// <summary>
        /// 設定視窗最小size
        /// </summary>
        /// <param name="w"></param>
        /// <param name="h"></param>
        public void SetMinimumSize(int w, int h) {
            M.MinimumSize = new System.Drawing.Size(w, h);
        }


        /// <summary>
        /// 視窗使用毛玻璃效果
        /// </summary>
        public void SetAERO() {

            EnableBlur(M.Handle);
        }

        /// <summary>
        /// 傳入 webWindow，將其設為目前視窗的子視窗
        /// </summary>
        /// <param name="_window"></param>
        public void SetOwner(object _window) {
            if (_window != null) {
                WebWindow webwindow = (WebWindow)_window;
                //webwindow.Owner = M.parentForm;
                //webwindow.ShowInTaskbar = true;
                if (M.TopMost == true) {
                    M.TopMost = false;//設定子視窗的時候，如果付錢視窗有使用TopMost，必須先解除，否則子視窗會被蓋到下面
                    webwindow.Owner = M;
                    M.TopMost = true;
                } else {
                    webwindow.Owner = M;
                }

                //M.StartPosition = FormStartPosition.CenterParent;
            }
        }

        /// <summary>
        /// 在父親視窗運行js
        /// </summary>
        /// <param name="js"></param>
        /// <returns></returns>
        public async Task<string> RunJsOfParent(string js) {
            if (M.parentWindow == null) { return ""; }
            if (M.parentWindow.wv2.CoreWebView2 == null) { return ""; }
            string txt = await M.parentWindow.wv2.CoreWebView2.ExecuteScriptAsync(js);
            //System.Console.WriteLine(AsyncContext);
            return txt;
        }


        /*public async Task<string> RunJs(string js) {
            if (M.wv2.CoreWebView2 == null) { return ""; }
            string f = await M.wv2.CoreWebView2.ExecuteScriptAsync(js);
            return f;
        }*/



        /// <summary>
        /// 設定視窗的 icon
        /// </summary>
        /// <param name="path"></param>
        public void SetIcon(string path) {
            if (File.Exists(path)) {
                M.Icon = new System.Drawing.Icon(path);
            }
        }

        /// <summary>
        /// 取得執行檔目錄
        /// </summary>
        /// <returns></returns>
        public string GetAppDirPath() {
            return System.AppDomain.CurrentDomain.BaseDirectory;
        }

        /// <summary>
        /// 取得執行檔路徑
        /// </summary>
        /// <returns></returns>
        public string GetAppPath() {
            return M.GetType().Assembly.Location;
        }

        /// <summary>
        /// 取得命令列參數
        /// </summary>
        /// <returns></returns>
        public string[] GetArguments() {
            return M.args;
        }


        /// <summary>
        /// 返回 WebWindow
        /// </summary>
        /// <returns></returns>
        public WebWindow This() {
            return M;
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

            M.wv2.Visible = false;
            M.Close();

            /*var tim = new Timer();
            tim.Interval = 10;
            tim.Tick += (sender, e) => {
                       
            };
            tim.Start();*/
        }


        public Boolean TopMost {
            get { return M.TopMost; }
            set { M.TopMost = value; }
        }




        public const int WM_NCLBUTTONDOWN = 0xA1;
        public const int HT_CAPTION = 0x2;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="_type"></param>
        public void WindowDrag(String _type) {

            var _run = ResizeDirection.Move;

            if (_type == "CT") { _run = ResizeDirection.CT; }
            if (_type == "RC") { _run = ResizeDirection.RC; }
            if (_type == "CB") { _run = ResizeDirection.CB; }
            if (_type == "LC") { _run = ResizeDirection.LC; }
            if (_type == "LT") { _run = ResizeDirection.LT; }
            if (_type == "RT") { _run = ResizeDirection.RT; }
            if (_type == "LB") { _run = ResizeDirection.LB; }
            if (_type == "RB") { _run = ResizeDirection.RB; }

            //System.Threading.SynchronizationContext.Current.Post((_) => {    
            //}, null);

            ReleaseCapture();
            SendMessage(M.Handle, WM_SYSCOMMAND, (int)(_run), 0);

            /*IntPtr windowHandle = new System.Windows.Interop.WindowInteropHelper(M.win).Handle;
          
            Adapter.UIThread(() => {
                ReleaseCapture();
                SendMessage(windowHandle, WM_SYSCOMMAND, (int)(_run), 0);
            });

            new Thread(() => {
                Adapter.UIThread(() => {
                });
                Thread.Sleep(1000);
            }).Start();*/

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
            Move = 0xF009 //移動
        }

        //指定滑鼠到特定視窗
        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        public static extern IntPtr SetCapture(IntPtr hWnd);

        //釋放滑鼠
        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        public static extern bool ReleaseCapture();

        //拖曳視窗
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
            ACCENT_INVALID_STATE = 4
        }

        [StructLayout(LayoutKind.Sequential)]
        internal struct AccentPolicy {
            public AccentState AccentState;
            public int AccentFlags;
            public int GradientColor;
            public int AnimationId;
        }

        internal void EnableBlur(IntPtr hwnd) {
            var accent = new AccentPolicy();
            var accentStructSize = Marshal.SizeOf(accent);
            accent.AccentState = AccentState.ACCENT_ENABLE_BLURBEHIND;

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


}
