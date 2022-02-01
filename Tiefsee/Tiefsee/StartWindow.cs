﻿using Microsoft.Web.WebView2.Core;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Tiefsee {
    public class StartWindow : Form {
        public StartWindow() {

            Adapter.Initialize();

            LockPort();//寫入檔案，表示此port已經被佔用
            CheckWebView2();//檢查是否有webview2執行環境

            /*var tim = new System.Windows.Forms.Timer();
            tim.Interval = 1;
            tim.Tick += (sender, e) => {
                if (Program.newWar != null) {

                    WebWindow.Create($"{Program.webServer.origin}/www/MainWindow.html",Program. newWar, null);
                    Program. newWar = null;
                }
            };
            tim.Start();*/

            this.Opacity = 0;
            this.ShowInTaskbar = false;

            this.Shown += (sender, e) => {
                this.Hide();
                if (Program.startType == 3) {//快速啟動且常駐
                    RunNotifyIcon();
                }

                if (Program.startType == 5) {//快速啟動且常駐
                    RunNotifyIcon();
                }
                InitWebview();//初始化webview2(常駐在背景
            };

        }

        /// <summary>
        /// 寫入檔案，表示此port已經被佔用
        /// </summary>
        /// <param name="post"></param>
        public void LockPort() {
            int port = Program.webServer.port;
            string portDir = Path.Combine(Program.appDataPath, "port");
            if (Directory.Exists(portDir) == false) {//如果資料夾不存在，就新建
                Directory.CreateDirectory(portDir);
            }

            string portFile = Path.Combine(portDir, port.ToString());
            if (File.Exists(portFile) == false) {
                using (FileStream fs = new FileStream(portFile, FileMode.Create)) { }
            }
        }


        /// <summary>
        /// 常駐在工作列右下角
        /// </summary>
        public static void RunNotifyIcon() {

            QuickRun.WindowCreate();

            System.Windows.Forms.NotifyIcon nIcon = new System.Windows.Forms.NotifyIcon();
            string iconPath = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "www/img/logo.ico");
            nIcon.Icon = new System.Drawing.Icon(iconPath);
            nIcon.Text = "TiefSee";
            nIcon.Visible = true;

            var cm = new System.Windows.Forms.ContextMenu();//右鍵選單

            cm.MenuItems.Add("New", new EventHandler((sender2, e2) => {
                String _url = $"{Program.webServer.origin}/www/MainWindow.html";
                WebWindow.Create(_url, new string[0], null);
            }));

            cm.MenuItems.Add("Quit Tiefsee", new EventHandler((sender2, e2) => {
                nIcon.Visible = false;
                QuickRun.WindowFreed();
            }));

            nIcon.ContextMenu = cm;

            nIcon.DoubleClick += (sender, e) => {
                String _url = $"{Program.webServer.origin}/www/MainWindow.html";
                WebWindow.Create(_url, new string[0], null);
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


        /// <summary>
        /// 檢查是否有執行環境
        /// </summary>
        /// <returns></returns>
        private  void CheckWebView2() {

            new Thread(() => {
                if (IsWebView2Runtime() == true) { //檢查安裝webview2執行環境
                    return;
                }
                Adapter.UIThread(() => {//如果沒有執行環境，就用瀏覽器開啟下載頁面
                    MessageBox.Show("必須安裝Webview2才能運行Tiefsee");
                    System.Diagnostics.Process.Start("https://developer.microsoft.com/microsoft-edge/webview2/");
                    this.Close();
                });
            }).Start();
        }
        private bool IsWebView2Runtime() {
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
}
