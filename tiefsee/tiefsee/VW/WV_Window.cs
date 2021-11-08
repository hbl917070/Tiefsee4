using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
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
           

            System.Windows.Input.Touch.FrameReported += (dermder, e) => {
              
                if (e.GetTouchPoints(null).Count > 0) {
                    ax = (int)e.GetTouchPoints(null)[0].Position.X;
                    ay = (int)e.GetTouchPoints(null)[0].Position.Y;
                    System.Console.WriteLine($"x:{ax}   y:{ay}");

                }
            };
        }
        int ax;
        int ay;

        public WebWindow newWindow(String _url) {
            //String _url = $"http://localhost:{55444}/www/MainWindow.html";

            var w = new WebWindow(_url);
            w.Show();
            //w.Left
            //w.Owner
            return w;
        }




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



        [DllImport("User32")]
        internal extern static bool GetCursorPos(out MousePoint point);
        internal struct MousePoint {
            public int X;
            public int Y;
        };

        int dragX = 0;
        int dragY = 0;
        MousePoint curr;
        bool isWndMove = false;

        public void WindowDrag_touchStart() {
            //if (e.Button == MouseButtons.Left) {
            Adapter.UIThread(() => {
                dragX = M.Left;
                dragY = M.Top;

                GetCursorPos(out curr);

                this.isWndMove = true;

            });

            //}
        }

        public int[] GetMousePoint() {
           
            return new int[] { ax, ay }; ;


            MousePoint now_curr;
            GetCursorPos(out now_curr);
            int[] c = new int[] { now_curr.X, now_curr.Y };
            return c;
        }

        public void WindowDrag_touchMove() {

            // Adapter.UIThread(() => {
            if (this.isWndMove) {
                MousePoint now_curr;
                GetCursorPos(out now_curr);

                M.Left = dragX + now_curr.X - curr.X;
                M.Top = dragY + now_curr.Y - curr.Y;
                System.Console.WriteLine(now_curr.X);
            }
            //});
        }

        public void WindowDrag_touchEnd() {
            this.isWndMove = false;
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




        [System.Runtime.CompilerServices.IndexerName("Items")]
        public string this[int index] {
            get { return m_dictionary[index]; }
            set { m_dictionary[index] = value; }
        }
        private Dictionary<int, string> m_dictionary = new Dictionary<int, string>();
    }


}
