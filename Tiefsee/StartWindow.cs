using System.IO;
using System.IO.Pipes;
using System.Text;
using System.Windows.Input;
using Windows.UI.StartScreen;

namespace Tiefsee;

public class StartWindow : Form {

    /// <summary> 改成 true 後，定時執行 GC </summary>
    public static bool isRunGC = false;
    /// <summary> 是否為商店版 APP </summary>
    public static bool isStoreApp = false;
    /// <summary> 是否為 便攜模式 </summary>
    public static bool isPortableMode = false;
    /// <summary> 用於鎖定 port 檔案 </summary>
    private FileStream fsPort;
    /// <summary> 是否為 win11 </summary>
    public static bool isWin11 = false;
    /// <summary> 桌面的路徑 </summary>
    private string desktopDir;

    public StartWindow() {

        isWin11 = Environment.OSVersion.Version.Build >= 22000;
        desktopDir = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);

        Adapter.Initialize();
        Plugin.Init();

        PortLock(); // 寫入檔案，表示此 port 已經被佔用
        CheckWebView2(); // 檢查是否有 webview2 執行環境
        InitJumpTask(); // 初始化 JumpTask
        InitNamedPipeServer();

        //--------------

        this.Opacity = 0;
        this.ShowInTaskbar = false;

        this.Shown += (sender, e) => {
            this.Hide();
            if (Program.startType == 3) { // 快速啟動且常駐
                RunNotifyIcon();
            }

            if (Program.startType == 5) { // 快速啟動且常駐
                RunNotifyIcon();
            }
            InitWebview(); // 初始化webview2(常駐在背景
        };

        // 如果有進行圖片運算的話，定時執行GC
        Adapter.LoopRun(30 * 1000, () => {
            if (isRunGC) {
                WV_System._Collect();
                isRunGC = false;
            }
        }, true);

        InitQuickLook(); // 快速預覽
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

            bool isKeyboardSpace = Keyboard.IsKeyDown(Key.Space); // 按著空白鍵

            // 避免與切換輸入法的快速鍵衝突
            if (isDown == false && (Keyboard.IsKeyDown(Key.LeftCtrl) || Keyboard.IsKeyDown(Key.RightCtrl) ||
                Keyboard.IsKeyDown(Key.LeftShift) || Keyboard.IsKeyDown(Key.RightShift) ||
                Keyboard.IsKeyDown(Key.LeftAlt) || Keyboard.IsKeyDown(Key.RightAlt))) {
                isKeyboardSpace = false;
            }

            bool isMouseMiddle = Control.MouseButtons == MouseButtons.Middle; // 按著滑鼠滾輪

            int quickLookRunType = 0;
            if (isKeyboardSpace) { quickLookRunType = 1; }
            if (isMouseMiddle) { quickLookRunType = 2; }

            if (isMouseMiddle || isKeyboardSpace) {

                if (isDown == false) {
                    isDown = true;

                    string selectedItem = PluginQuickLook.GetCurrentSelection(); // 取得檔案總管目前選取的檔案
                    if (selectedItem == "") { return; }

                    // 再次檢查是否按著空白鍵或滑鼠中鍵
                    isKeyboardSpace = Keyboard.IsKeyDown(Key.Space); // 按著空白鍵
                    isMouseMiddle = System.Windows.Forms.Control.MouseButtons == System.Windows.Forms.MouseButtons.Middle; // 按著滑鼠滾輪
                    if (isMouseMiddle == false && isKeyboardSpace == false) { return; }

                    // win11 對資料夾按下滑鼠滾輪會觸發新開檔案總管的分頁，停止使用此功能避免衝突
                    if (isMouseMiddle && isWin11 && Directory.Exists(selectedItem)) {
                        // 桌面不會衝突
                        if (Path.GetDirectoryName(selectedItem) != desktopDir) {
                            return;
                        }
                    }

                    if (Program.startType == 2 || Program.startType == 3) {
                        if (WebWindow.TempWindow == null) { return; }
                        WebWindow.TriggerCreate(WebWindow.TempWindow, [selectedItem], quickLookRunType);

                    }
                    else if (Program.startType == 4 || Program.startType == 5) { // 單一執行個體，用原來的視窗開啟
                        WebWindow.Create("MainWindow.html", [selectedItem], null);
                    }
                }

            }
            else { //放開空白鍵

                if (isDown) {
                    if (WebWindow.TempWindow != null) {
                        WebWindow.TempWindow.RunJs($@"
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

        if (Directory.Exists(AppPath.appDataPort) == false) { // 如果資料夾不存在，就新建
            Directory.CreateDirectory(AppPath.appDataPort);
        }

        int port = Program.webServer.port;
        string portFile = Path.Combine(AppPath.appDataPort, port.ToString());
        if (File.Exists(portFile) == false) {
            fsPort = new FileStream(portFile, FileMode.Create);
        }
    }

    /// <summary>
    /// 刪除檔案，表示此 post 已經釋放
    /// </summary>
    public void PortFreed() {

        if (fsPort == null) { return; }

        try {
            fsPort.Close();
            fsPort.Dispose();
            fsPort = null;
        }
        catch { }

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

        System.Windows.Forms.NotifyIcon nIcon = new();
        nIcon.Icon = new System.Drawing.Icon(AppPath.logoIcon);
        nIcon.Text = "TiefSee";
        nIcon.Visible = true;
        nIcon.DoubleClick += (sender, e) => {
            WebWindow.Create("MainWindow.html", [], null);
        };

        var cm = new RJDropdownMenu(); // 右鍵選單
        cm.PrimaryColor = Color.FromArgb(65, 65, 65); // 滑鼠移入時的背景色
        cm.MenuItemTextColor = Color.FromArgb(255, 255, 255); // 文字顏色
        cm.IsMainMenu = true;
        cm.Font = new Font("Segoe UI", 9F);

        ToolStripMenuItem item1 = new ToolStripMenuItem("New");
        item1.Click += (sender2, e2) => {
            WebWindow.Create("MainWindow.html", [], null);
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
            // QuickRun.runNumber = 0; // 不論存在幾個視窗都直接關閉
            QuickRun.WindowFreed();
        };
        cm.Items.Add(item3);

        nIcon.ContextMenuStrip = cm;
    }

    /// <summary>
    /// 
    /// </summary>
    public async void InitJumpTask() {

        // 獲取默認的 JumpList
        var jumpList = await Windows.UI.StartScreen.JumpList.LoadCurrentAsync();

        // 清除默認的 JumpList
        jumpList.Items.Clear();

        if (Program.startType != 4 && Program.startType != 5) {
            var item = JumpListItem.CreateWithArguments("closeAll", "Close All Tiefsee Windows");
            // item.Description = "Close all Tiefsee";
            // item.Logo = new Uri("ms-appx:///t1.ico");
            jumpList.Items.Add(item);
        }

        // 保存 JumpList
        await jumpList.SaveAsync();
    }

    /// <summary>
    /// 初始化webview2
    /// </summary>
    private async void InitWebview() {
        var wv2 = new Microsoft.Web.WebView2.WinForms.WebView2();
        await wv2.EnsureCoreWebView2Async(await WebWindow.GetCoreWebView2Environment());
    }

    /// <summary>
    /// 檢查是否有執行環境
    /// </summary>
    /// <returns></returns>
    private void CheckWebView2() {
        new Thread(() => {
            if (IsWebView2Runtime() == true) { // 檢查安裝webview2執行環境
                return;
            }
            Adapter.UIThread(() => { // 如果沒有執行環境，就用瀏覽器開啟下載頁面
                MessageBox.Show("WebView2 must be installed to run this application");
                System.Diagnostics.Process.Start("https://developer.microsoft.com/microsoft-edge/webview2/");
                this.Close();
            });
        }).Start();
    }
    private bool IsWebView2Runtime() {
        try {
            var str = Microsoft.Web.WebView2.Core.CoreWebView2Environment.GetAvailableBrowserVersionString(null);
            if (!string.IsNullOrWhiteSpace(str)) {
                return true;
            }
        }
        catch (Exception) {
            return false;
        }
        return false;
    }

    /// <summary>
    /// 初始化 NamedPipeServerStream
    /// </summary>
    private async void InitNamedPipeServer() {

        if (Program.startType == 1) { return; }

        await Task.Factory.StartNew(async () => {

            using var server = new NamedPipeServerStream(
                $"tiefsee-{Program.webServer.port}",
                PipeDirection.InOut,
                NamedPipeServerStream.MaxAllowedServerInstances,
                PipeTransmissionMode.Message);

            // 等待客戶端連接
            while (Adapter.isRuning) {
                server.WaitForConnection();

                // 客戶端已連接
                while (Adapter.isRuning) {

                    // 讀取客戶端發送的訊息
                    var buffer = new byte[1024];
                    var ms = new MemoryStream();
                    int readBytes;
                    do {
                        readBytes = server.Read(buffer, 0, buffer.Length);
                        ms.Write(buffer, 0, readBytes);
                    } while (!server.IsMessageComplete);
                    var allData = ms.ToArray();
                    var message = Encoding.UTF8.GetString(allData, 0, allData.Length);

                    // 將字串剖析回命令列參數
                    string[] args = message.Split('\n');
                    Adapter.UIThread(() => {
                        WebWindow.Create("MainWindow.html", args, null);
                    });

                    break;
                }

                // 客戶端已斷開連接
                server.Disconnect();
            }
        });
    }

}
