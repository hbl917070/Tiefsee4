using Microsoft.Web.WebView2.Core;
using System.IO;
using System.Windows.Input;

namespace Tiefsee {
    public class StartWindow : Form {

        /// <summary> 改成true後，定時執行GC </summary>
        public static bool isRunGC = false;

        /// <summary> 是否為商店版APP </summary>
        public static bool isStoreApp = false;

        /// <summary> 用於鎖定port檔案 </summary>
        private FileStream fsPort;

        private bool isWin11 = false;
        private string desktopDir;

        public StartWindow() {

            isWin11 = Environment.OSVersion.Version.Build >= 22000;
            desktopDir = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);

            Adapter.Initialize();
            Plugin.Init();

            PortLock(); //寫入檔案，表示此port已經被佔用
            CheckWebView2(); //檢查是否有webview2執行環境

            //--------------

            this.Opacity = 0;
            this.ShowInTaskbar = false;

            this.Shown += (sender, e) => {
                this.Hide();
                if (Program.startType == 3) { //快速啟動且常駐
                    RunNotifyIcon();
                }

                if (Program.startType == 5) { //快速啟動且常駐
                    RunNotifyIcon();
                }
                InitWebview(); //初始化webview2(常駐在背景
            };

            //如果有進行圖片運算的話，定時執行GC
            Adapter.LoopRun(30 * 1000, () => {
                if (isRunGC) {
                    DateTime time_start = DateTime.Now; //計時開始 取得目前時間
                    WV_System._Collect();
                    DateTime time_end = DateTime.Now; //計時結束 取得目前時間            
                    string result2 = ((TimeSpan)(time_end - time_start)).TotalMilliseconds.ToString(); //後面的時間減前面的時間後 轉型成TimeSpan即可印出時間差

                    isRunGC = false;
                    Console.WriteLine("=============== GC == " + result2);
                }
            }, true);


            InitQuickLook(); //快速預覽
        }


        /// <summary>
        /// 快速預覽
        /// </summary>
        private void InitQuickLook() {
            if (Program.startType == 1) {
                return;
            }

            bool isDown = false;

            Adapter.LoopRun(50, () => {

                bool isKeyboardSpace = Keyboard.IsKeyDown(Key.Space); //按著空白鍵
                bool isMouseMiddle = System.Windows.Forms.Control.MouseButtons == System.Windows.Forms.MouseButtons.Middle; //按著滑鼠滾輪

                int quickLookRunType = 0;
                if (isKeyboardSpace) { quickLookRunType = 1; }
                if (isMouseMiddle) { quickLookRunType = 2; }

                if (isMouseMiddle || isKeyboardSpace) {

                    if (isDown == false) {
                        isDown = true;

                        String selectedItem = PluginQuickLook.GetCurrentSelection(); //取得檔案總管目前選取的檔案
                        if (selectedItem == "") { return; }

                        //再次檢查是否按著空白鍵或滑鼠中鍵
                        isKeyboardSpace = Keyboard.IsKeyDown(Key.Space); //按著空白鍵
                        isMouseMiddle = System.Windows.Forms.Control.MouseButtons == System.Windows.Forms.MouseButtons.Middle; //按著滑鼠滾輪
                        if (isMouseMiddle == false && isKeyboardSpace == false) { return; }

                        // win11對資料夾按下滑鼠滾輪會觸發新開檔案總管的分頁，停止使用此功能避免衝突
                        if (isMouseMiddle && isWin11 && Directory.Exists(selectedItem)) {
                            // 桌面不會衝突
                            if (Path.GetDirectoryName(selectedItem) != desktopDir) {
                                return;
                            }
                        }

                        if (Program.startType == 2 || Program.startType == 3) {
                            if (WebWindow.tempWindow == null) { return; }
                            WebWindow.TriggerCreate(WebWindow.tempWindow, new String[] { selectedItem }, quickLookRunType);

                        } else if (Program.startType == 4 || Program.startType == 5) { //單一執行個體，用原來的視窗開啟
                            WebWindow.Create("MainWindow.html", new String[] { selectedItem }, null);
                        }
                    }

                } else { //放開空白鍵

                    if (isDown) {
                        if (WebWindow.tempWindow != null) {
                            WebWindow.tempWindow.RunJs($@"
                                if (window.mainWindow !== undefined)
                                    if (window.mainWindow.quickLookUp !== undefined)
                                        mainWindow.quickLookUp();
                            ");
                        }
                    }
                    isDown = false;
                }
            });

        }


        /// <summary>
        /// 寫入檔案，表示此port已經被佔用
        /// </summary>
        /// <param name="post"></param>
        public void PortLock() {

            if (Directory.Exists(AppPath.appDataPort) == false) { //如果資料夾不存在，就新建
                Directory.CreateDirectory(AppPath.appDataPort);
            }

            int port = Program.webServer.port;
            string portFile = Path.Combine(AppPath.appDataPort, port.ToString());
            if (File.Exists(portFile) == false) {
                fsPort = new FileStream(portFile, FileMode.Create);
            }
        }


        /// <summary>
        /// 刪除檔案，表示此post已經釋放
        /// </summary>
        /// <param name="post"></param>
        public void PortFreed() {

            if (fsPort == null) { return; }

            try {
                fsPort.Close();
                fsPort.Dispose();
                fsPort = null;
            } catch { }

            int port = Program.webServer.port;
            string portFile = Path.Combine(AppPath.appDataPort, port.ToString());
            if (File.Exists(portFile) == true) {
                File.Delete(portFile);
            }
        }

        /// <summary>
        /// 常駐在工作列右下角
        /// </summary>
        public void RunNotifyIcon() {

            QuickRun.WindowCreate();

            System.Windows.Forms.NotifyIcon nIcon = new System.Windows.Forms.NotifyIcon();
            nIcon.Icon = new System.Drawing.Icon(AppPath.logoIcon);
            nIcon.Text = "TiefSee";
            nIcon.Visible = true;
            nIcon.DoubleClick += (sender, e) => {
                WebWindow.Create("MainWindow.html", new string[0], null);
            };

            var cm = new RJDropdownMenu(); //右鍵選單
            cm.PrimaryColor = Color.FromArgb(65, 65, 65); //滑鼠移入時的背景色
            cm.MenuItemTextColor = Color.FromArgb(255, 255, 255); //文字顏色
            cm.IsMainMenu = true;
            cm.Font = new Font("Segoe UI", 9F);

            ToolStripMenuItem item1 = new ToolStripMenuItem("New");
            item1.Click += (sender2, e2) => {
                WebWindow.Create("MainWindow.html", new string[0], null);
            };
            cm.Items.Add(item1);

            ToolStripMenuItem item2 = new ToolStripMenuItem("Hide Icon");
            item2.Click += (sender2, e2) => {
                nIcon.Visible = false;
            };
            cm.Items.Add(item2);

            ToolStripMenuItem item3 = new ToolStripMenuItem("Exit Tiefsee");
            item3.Click += (sender2, e2) => {
                nIcon.Visible = false;
                //QuickRun.runNumber = 0; //不論存在幾個視窗都直接關閉
                QuickRun.WindowFreed();
            };
            cm.Items.Add(item3);

            nIcon.ContextMenuStrip = cm;

        }


        /// <summary>
        /// 初始化webview2
        /// </summary>
        private async void InitWebview() {
            var opts = new CoreWebView2EnvironmentOptions { AdditionalBrowserArguments = Program.webvviewArguments };
            Microsoft.Web.WebView2.WinForms.WebView2 wv2 = new Microsoft.Web.WebView2.WinForms.WebView2();
            var webView2Environment = await CoreWebView2Environment.CreateAsync(null, AppPath.appData, opts);
            await wv2.EnsureCoreWebView2Async(webView2Environment);
        }


        /// <summary>
        /// 檢查是否有執行環境
        /// </summary>
        /// <returns></returns>
        private void CheckWebView2() {
            new Thread(() => {
                if (IsWebView2Runtime() == true) { //檢查安裝webview2執行環境
                    return;
                }
                Adapter.UIThread(() => { //如果沒有執行環境，就用瀏覽器開啟下載頁面
                    MessageBox.Show("WebView2 must be installed to run this application");
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
