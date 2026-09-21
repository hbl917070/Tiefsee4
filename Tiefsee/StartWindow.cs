using System.IO;
using System.Windows.Input;
using Windows.UI.StartScreen;

namespace Tiefsee;

public class StartWindow : Form {

    private static readonly SystemEnvironmentHelper _systemEnvironmentHelper = new();
    /// <summary> 改成 true 後，定時執行 GC </summary>
    public static bool isRunGC = false;
    /// <summary> 用於鎖定 port 檔案 </summary>
    private FileStream fsPort;
    /// <summary> 桌面的路徑 </summary>
    private string desktopDir;
    /// <summary> 接收 Native host 啟動命令的 Pipe server </summary>
    private InstancePipeServer instancePipeServer;

    public StartWindow() {

        desktopDir = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);

        AppScheduler.Initialize();
        PluginRegistry.Init();

        InitInstancePipeServer();
        PortLock(); // 寫入檔案，表示此 port 已經被佔用
        CheckWebView2(); // 檢查是否有 webview2 執行環境
        InitJumpTask(); // 初始化 JumpTask

        NetVips.Cache.MaxFiles = 0; // 避免 NetVips 主動暫存檔案，不這麼做的話，同路徑的檔案被修改後，將無法讀取到新的檔案
        // NetVips.Cache.Max = 0;

        //--------------

        this.Opacity = 0;
        this.ShowInTaskbar = false;

        this.Shown += (sender, e) => {
            this.Hide();
            if (Program.startType == StartMode.QuickStartResident) { // 快速啟動且常駐
                RunNotifyIcon();
            }

            if (Program.startType == StartMode.SingleInstanceResident) { // 單一執行個體且常駐
                RunNotifyIcon();
            }
            InitWebview(); // 初始化webview2(常駐在背景
        };

        // 如果有進行圖片運算的話，定時執行GC
        AppScheduler.LoopRun(30 * 1000, () => {
            if (isRunGC) {
                ProcessMemoryManager.CollectCurrentProcessMemory();
                isRunGC = false;
            }
        }, true);

        InitQuickLook(); // 快速預覽

        this.FormClosed += async (sender, e) => {
            if (instancePipeServer != null) {
                await instancePipeServer.DisposeAsync();
            }
        };
    }

    /// <summary>
    /// 快速預覽
    /// </summary>
    private void InitQuickLook() {

        if (Program.startType == StartMode.Normal) {
            return;
        }

        bool isDown = false;

        AppScheduler.LoopRun(50, () => {

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

                    string selectedItem = QuickLookSelectionService.GetCurrentSelection(); // 取得檔案總管目前選取的檔案
                    if (selectedItem == "") { return; }

                    // 再次檢查是否按著空白鍵或滑鼠中鍵
                    isKeyboardSpace = Keyboard.IsKeyDown(Key.Space); // 按著空白鍵
                    isMouseMiddle = System.Windows.Forms.Control.MouseButtons == System.Windows.Forms.MouseButtons.Middle; // 按著滑鼠滾輪
                    if (isMouseMiddle == false && isKeyboardSpace == false) { return; }

                    // win11 對資料夾按下滑鼠滾輪會觸發新開檔案總管的分頁，停止使用此功能避免衝突
                    if (isMouseMiddle && _systemEnvironmentHelper.IsWindows11() && Directory.Exists(selectedItem)) {
                        // 桌面不會衝突
                        if (Path.GetDirectoryName(selectedItem) != desktopDir) {
                            return;
                        }
                    }

                    if (Program.startType == StartMode.QuickStart || Program.startType == StartMode.QuickStartResident) {
                        if (WebWindow.TempWindow == null) { return; }
                        WebWindow.TriggerCreate(WebWindow.TempWindow, [selectedItem], quickLookRunType);

                    }
                    else if (Program.startType == StartMode.SingleInstance || Program.startType == StartMode.SingleInstanceResident) { // 單一執行個體，用原來的視窗開啟
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

        string appDataPort = Program.runtimeContext.AppDataPort;
        if (Directory.Exists(appDataPort) == false) { // 如果資料夾不存在，就新建
            Directory.CreateDirectory(appDataPort);
        }

        int port = Program.webServer.port;
        string portFile = Path.Combine(appDataPort, port.ToString());
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
        string portFile = Path.Combine(Program.runtimeContext.AppDataPort, port.ToString());
        if (File.Exists(portFile) == true) {
            File.Delete(portFile);
        }
    }

    /// <summary>
    /// 常駐在工作列右下角
    /// </summary>
    public void RunNotifyIcon() {

        SingleInstanceCoordinator.WindowCreate();

        System.Windows.Forms.NotifyIcon nIcon = new();
        nIcon.Icon = new System.Drawing.Icon(Program.runtimeContext.LogoIcon);
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
            SingleInstanceCoordinator.WindowFreed();
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

        if (Program.startType != StartMode.SingleInstance && Program.startType != StartMode.SingleInstanceResident) {
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
        using var wv2 = new Microsoft.Web.WebView2.WinForms.WebView2();
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
            AppScheduler.UIThread(() => { // 如果沒有執行環境，就用瀏覽器開啟下載頁面
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
    /// 初始化 instance Pipe，並分派 Native host 傳入的命令。
    /// </summary>
    private void InitInstancePipeServer() {
        if (Program.startType == StartMode.Normal) {
            return;
        }

        instancePipeServer = new InstancePipeServer(Program.webServer.port, HandleInstancePipeMessage);
        instancePipeServer.Start();
    }

    /// <summary>
    /// 在 UI thread 執行 instance 命令。
    /// </summary>
    private static void HandleInstancePipeMessage(InstancePipeMessage message) {
        AppScheduler.UIThread(() => {
            if (message.Command == InstancePipeProtocol.CloseAllCommand) {
                WebWindow.CloseAllWindow();
                return;
            }

            if (message.Command == InstancePipeProtocol.OpenCommand) {
                WebWindow.Create("MainWindow.html", message.Args ?? [], null);
            }
        });
    }

}
