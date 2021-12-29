using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.IO;
using System.Net;
using Microsoft.Web.WebView2.Core;

namespace Tiefsee {
    public class QuickRun {

        private static int runNumber = 0;//目前的視窗數量
        private static int mainPort;//程式目前使用的port
        public static StartWindow startWindow;//用於防止程式被關閉的視窗


        /// <summary>
        /// 新建視窗時呼叫
        /// </summary>
        public static void WindowCreat() {
            runNumber += 1;
        }

        /// <summary>
        /// 關閉視窗時呼叫
        /// </summary>
        public static void WindowFreed() {
            runNumber -= 1;

            if (runNumber <= 0) {
                PortFreed();
                startWindow.Close();//關閉此視窗，程式就會完全結束
            }
        }

        /// <summary>
        /// 寫入檔案，表示此post已經被佔用
        /// </summary>
        /// <param name="post"></param>
        public static StartWindow PortCreat(int port) {
            mainPort = port;
            string portDir = Path.Combine(Program.appDataPath, "port");
            if (Directory.Exists(portDir) == false) {//如果資料夾不存在，就新建
                Directory.CreateDirectory(portDir);
            }

            string portFile = Path.Combine(portDir, port.ToString());
            if (File.Exists(portFile) == false) {
                using (FileStream fs = new FileStream(portFile, FileMode.Create)) { }
            }
            startWindow = new StartWindow();
            return startWindow;
        }


        /// <summary>
        /// 刪除檔案，表示此post已經釋放
        /// </summary>
        /// <param name="post"></param>
        public static void PortFreed() {
            string portDir = Path.Combine(Program.appDataPath, "port");
            string portFile = Path.Combine(portDir, mainPort.ToString());
            if (File.Exists(portFile) == true) {
                File.Delete(portFile);
            }
        }



        /// <summary>
        /// 快速開啟。染回true表示結束程式
        /// </summary>
        /// <param name="e"></param>
        /// <returns></returns>
        public static bool Check(string[] args) {

            //DateTime time_start = DateTime.Now;//計時開始 取得目前時間

            if (Program.startType == 1) {//直接啟動
                return false;
            }

            String portDir = Path.Combine(Program.appDataPath, "port");

            if (Directory.Exists(portDir) == false) {
                return false;
            }

            foreach (String item in Directory.GetFiles(portDir, "*")) {//判斷目前已經開啟的視窗
                try {

                    string port = Path.GetFileName(item);

                    //偵測是否可用
                    String uri = $"http://localhost:{port}/api/check";
                    HttpWebRequest request = (HttpWebRequest)WebRequest.Create(uri);
                    request.Timeout = 30;
                    using (HttpWebResponse response = (HttpWebResponse)request.GetResponse()) {
                        using (Stream stream = response.GetResponseStream()) {
                            /*using (StreamReader reader = new StreamReader(stream)) {
                                String s = reader.ReadToEnd();
                            }*/
                        }
                    }

                    if (Program.startType == 2) {//快速啟動
                        NewWindow(args, port);
                        return true;
                    }

                    if (Program.startType == 3) {//快速啟動且常駐
                        NewWindow(args, port);
                        return true;
                    }

                    if (Program.startType == 4) {//
                        NewWindow(args, port);
                        return true;
                    }

                    if (Program.startType == 5) {//
                        NewWindow(args, port);
                        return true;
                    }
                } catch { }
            }//foreach


            return false;
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="args"></param>
        /// <param name="port"></param>
        private static void NewWindow(string[] args, string port) {

            //啟動參數
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < args.Length; i++) {
                if (i != args.Length - 1) {
                    sb.Append(args[i] + "\n");
                } else {
                    sb.Append(args[i]);
                }
            }

            //開啟新視窗
            string base64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(sb.ToString()));
            string uri = $"http://localhost:{port}/api/newWindow/" + base64;
            HttpWebRequest request2 = (HttpWebRequest)WebRequest.Create(uri);
            using (HttpWebResponse response = (HttpWebResponse)request2.GetResponse()) { }
        }


        /// <summary>
        /// 常駐在工作列右下角
        /// </summary>
        public static void RunNotifyIcon() {

            WindowCreat();

            System.Windows.Forms.NotifyIcon nIcon = new System.Windows.Forms.NotifyIcon();
            string iconPath = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "www/img/logo.ico");
            nIcon.Icon = new System.Drawing.Icon(iconPath);
            nIcon.Text = "TiefSee 快速啟動";
            nIcon.Visible = true;

            var cm = new System.Windows.Forms.ContextMenu();//右鍵選單

            cm.MenuItems.Add("New", new EventHandler((sender2, e2) => {
                String _url = $"http://localhost:{Program.bserver.port}/www/MainWindow.html";
                WebWindow.Create(_url, new string[0], null);
            }));

            cm.MenuItems.Add("結束「快速啟動」", new EventHandler((sender2, e2) => {
                nIcon.Visible = false;
                WindowFreed();
            }));

            nIcon.ContextMenu = cm;

            nIcon.DoubleClick += (sender, e) => {
                String _url = $"http://localhost:{Program.bserver.port}/www/MainWindow.html";
                WebWindow.Create(_url, new string[0], null);
            };

        }

    }



    public class StartWindow : Form {
        public StartWindow() {

            this.Opacity = 0;
            this.ShowInTaskbar = false;

            this.Shown += (sender, e) => {
                this.Hide();
                if (Program.startType == 3) {//快速啟動且常駐
                    QuickRun.RunNotifyIcon();
                }

                if (Program.startType == 5) {//快速啟動且常駐
                    QuickRun.RunNotifyIcon();
                }
                InitWebview();//初始化webview2(常駐在背景
            };

        }


        /// <summary>
        /// 初始化webview2
        /// </summary>
        private async void InitWebview() {
            Microsoft.Web.WebView2.WinForms.WebView2 wv2 = new Microsoft.Web.WebView2.WinForms.WebView2();
            var webView2Environment = await CoreWebView2Environment.CreateAsync(null, Program.appDataPath);
            await wv2.EnsureCoreWebView2Async(webView2Environment);
        }

    }
}
