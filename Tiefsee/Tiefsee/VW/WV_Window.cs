using Microsoft.Web.WebView2.Core;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Tiefsee {

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
        /// 清理webview2的暫存
        /// </summary>
        public void ClearBrowserCache() {
            //M.wv2.CoreWebView2.Profile.ClearBrowsingDataAsync();
            M.wv2.CoreWebView2.CallDevToolsProtocolMethodAsync("Network.clearBrowserCache", "{}");
        }

        /// <summary>
        /// 儲存到 start.ini
        /// </summary>
        /// <param name="startPort">程式開始的port</param>
        /// <param name="startType">1=直接啟動  2=快速啟動  3=快速啟動+常駐  4=單一個體  5=單一個體+常駐</param>
        /// <param name="serverCache"> 伺服器對靜態資源使用快取 0=不使用 1=使用 </param>
        public void SetStartIni(int startPort, int startType, int serverCache) {
            IniManager iniManager = new IniManager(Program.startIniPath);
            iniManager.WriteIniFile("setting", "startPort", startPort);
            iniManager.WriteIniFile("setting", "startType", startType);
            iniManager.WriteIniFile("setting", "serverCache", serverCache);
            Program.startPort = startPort;
            Program.startType = startType;
            Program.serverCache = serverCache;

            Program.webServer.controller.SetCacheTime(serverCache);
        }


        /// <summary>
        /// 取得 AppInfo
        /// </summary>
        /// <returns></returns>
        public string GetAppInfo() {
            return WebWindow.GetAppInfo(M.args);
        }


        /// <summary>
        /// 新開視窗
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="_args"></param>
        /// <returns></returns>
        public WebWindow NewWindow(string _url, object[] _args) {
            string[] args = new string[_args.Length];
            for (int i = 0; i < args.Length; i++) {
                args[i] = _args[i].ToString();
            }
            var w = WebWindow.Create(_url, args, M);
            return w;
        }


        /// <summary>
        /// 網頁載入完成後，呼叫此函數才會顯示視窗
        /// </summary>
        public void ShowWindow() {
            M.ShowWindow();
        }


        /// <summary>
        /// 網頁載入完成後，呼叫此函數才會顯示視窗，指定起始坐標
        /// </summary>
        /// <param name="x"></param>
        /// <param name="y"></param>
        /// <param name="width"></param>
        /// <param name="height"></param>
        /// <param name="windowState"></param>
        public void ShowWindow_SetSize(int x, int y, int width, int height, string windowState) {
            M.ShowWindow_SetSize(x, y, width, height, windowState);
        }


        /// <summary>
        /// 網頁載入完成後，呼叫此函數才會顯示視窗，子視窗從父視窗中間開啟
        /// </summary>
        /// <param name="width"></param>
        /// <param name="height"></param>
        public void ShowWindow_Center(int width, int height) {
            M.ShowWindow_Center(width, height);
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
        /// 設定視窗size
        /// </summary>
        /// <param name="w"></param>
        /// <param name="h"></param>
        public void SetSize(int w, int h) {
            M.SetSize(w, h);
        }


        /// <summary>
        /// 設定視窗坐標
        /// </summary>
        /// <param name="left"></param>
        /// <param name="top"></param>
        public void SetPosition(int left, int top) {
            M.SetPosition(left, top);
        }


        /// <summary>
        /// 視窗使用毛玻璃效果(只有win10、win11有效
        /// </summary>
        public void SetAERO(string type) {
            EnableBlur(M.Handle, type);
        }

        /// <summary>
        /// 設定縮放倍率，預設1.0
        /// </summary>
        /// <param name="d"></param>
        public void SetZoomFactor(double d) {
            M.wv2.ZoomFactor = d;
        }

        /// <summary>
        /// 取得碩放倍率
        /// </summary>
        /// <returns></returns>
        public double GetZoomFactor() {
            return M.wv2.ZoomFactor;
        }


        /// <summary>
        /// 傳入 webWindow，將其設為目前視窗的子視窗
        /// </summary>
        /// <param name="_window"></param>
        public void SetOwner(object _window) {
            if (_window != null) {
                WebWindow webwindow = (WebWindow)_window;

                if (TopMost == true) {
                    TopMost = false;//設定子視窗的時候，如果父視窗有使用TopMost，必須先解除，否則子視窗會被蓋到下面
                    webwindow.Owner = M;
                    TopMost = true;
                } else {
                    webwindow.Owner = M;
                }

                //webwindow.Owner = M;
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
        /// 取得程式的暫存資料夾，例如 C:\Users\user\AppData\Local\Tiefsee4
        /// </summary>
        /// <returns></returns>
        public string GetAppDataPath() {
            string path = Program.appDataPath;
            if (Directory.Exists(path) == false) {
                Directory.CreateDirectory(path);
            }
            return path;
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
                if (value == "Maximized") {
                    //WebWindow.ShowWindow(M.Handle, WebWindow.SW_MAXIMIZE);
                    M.WindowState = FormWindowState.Maximized;
                }
                if (value == "Minimized") {
                    //WebWindow.ShowWindow(M.Handle, WebWindow.SW_MINIMIZE);
                    M.WindowState = FormWindowState.Minimized;
                }
                if (value == "Normal") {
                    //WebWindow.ShowWindow(M.Handle, WebWindow.SW_NORMAL);
                    M.WindowState = FormWindowState.Normal;
                }
            }
        }

        /// <summary>
        /// 關閉視窗
        /// </summary>
        public void Close() {
            //M.wv2.Visible = false;
            M.CloseWindow();
        }


        /// <summary>
        /// 視窗固定在最上層
        /// </summary>
        public Boolean TopMost {
            get {
                return M.TopMost;
            }
            set {
                M.TopMost = value;
                /*if (M.TopLevel) {
                    M.TopLevel = true;
                }*/
            }
        }


        /// <summary>
        /// 拖曳視窗
        /// </summary>
        /// <param name="_type"></param>
        public void WindowDrag(String _type) {

            //避免滑鼠在沒有按下的情況下執行
            if (System.Windows.Forms.Control.MouseButtons != System.Windows.Forms.MouseButtons.Left) {
                return;
            }

            var _run = ResizeDirection.Move;

            if (_type == "CT") { _run = ResizeDirection.CT; }
            if (_type == "RC") { _run = ResizeDirection.RC; }
            if (_type == "CB") { _run = ResizeDirection.CB; }
            if (_type == "LC") { _run = ResizeDirection.LC; }
            if (_type == "LT") { _run = ResizeDirection.LT; }
            if (_type == "RT") { _run = ResizeDirection.RT; }
            if (_type == "LB") { _run = ResizeDirection.LB; }
            if (_type == "RB") { _run = ResizeDirection.RB; }

            /*if (_run== ResizeDirection.Move) {//拖曳視窗
                int WM_NCLBUTTONDOWN = 161; //  0xA1
                int HTCAPTION = 2;
                ReleaseCapture();
                SendMessage(M.Handle, WM_NCLBUTTONDOWN, HTCAPTION, 0);
                return;
            }*/

            //System.Threading.SynchronizationContext.Current.Post((_) => {    
            //}, null);

            ReleaseCapture();
            SendMessage(M.Handle, WM_SYSCOMMAND, (int)(_run), 0);

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
            ACCENT_ENABLE_ACRYLICBLURBEHIND = 4,
            ACCENT_INVALID_STATE = 5
        }

        [StructLayout(LayoutKind.Sequential)]
        internal struct AccentPolicy {
            public AccentState AccentState;
            public uint AccentFlags;
            public uint GradientColor;
            public uint AnimationId;
        }

        private uint _blurOpacity = 0;
        private uint _blurBackgroundColor = 0x010101; /* BGR color format */

        internal void EnableBlur(IntPtr hwnd, string type) {
            var accent = new AccentPolicy();

            if (type.ToLower() == "win10") {
                //win10
                accent.AccentState = AccentState.ACCENT_ENABLE_ACRYLICBLURBEHIND;
                accent.GradientColor = (_blurOpacity << 24) | (_blurBackgroundColor & 0xFFFFFF);
            } else {
                //win7
                accent.AccentState = AccentState.ACCENT_ENABLE_BLURBEHIND;
            }

            var accentStructSize = Marshal.SizeOf(accent);

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
