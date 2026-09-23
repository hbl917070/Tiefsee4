using System.IO;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using Windows.ApplicationModel;
using Windows.ApplicationModel.Activation;

namespace Tiefsee;

public static class Program {

    /// <summary> 程式開始的 port </summary>
    public static int startPort;
    /// <summary> 啟動模式 </summary>
    public static StartMode startType;
    /// <summary> 本地伺服器 </summary>
    public static WebServer webServer;
    /// <summary> app 啟動後共享的服務註冊表 </summary>
    public static ServiceRegistry services;
    /// <summary> app 啟動後共享的執行期環境資訊 </summary>
    public static AppRuntimeContext runtimeContext;
    /// <summary> 起始視窗，關閉此視窗就會結束程式 </summary>
    public static StartWindow startWindow;
    /// <summary> 目前執行個體的 localhost API capability token </summary>
    public static readonly string webApiToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

    /// <summary>
    /// 應用程式的主要進入點
    /// </summary>
    [STAThread]
    static void Main(string[] args) {
        Run(args);
    }

    /// <summary>
    /// 由 native host 載入 CLR 後呼叫的入口。
    /// </summary>
    [UnmanagedCallersOnly(CallConvs = new[] { typeof(CallConvStdcall) })]
    public static int RunFromNativeHost() {
        Run(Environment.GetCommandLineArgs().Skip(1).ToArray());
        return 0;
    }

    private static void Run(string[] args) {

        // 修改 工作目錄 為程式資料夾 (如果有傳入 args 的話，工作目錄會被修改，所以需要改回來
        string baseDirectory = AppContext.BaseDirectory;
        if (string.IsNullOrEmpty(baseDirectory)) {
            baseDirectory = Environment.CurrentDirectory;
        }
        Directory.SetCurrentDirectory(baseDirectory);

        // 啟動流程分成：早期路徑 -> ini 設定 -> 執行期環境 -> 共享服務
        var earlyPaths = EarlyAppPathResolver.Resolve();
        var startupConfig = new StartupConfigLoader().Load(earlyPaths.StartIniPath);
        runtimeContext = new AppRuntimeContextBuilder().Build(earlyPaths, startupConfig);

        startPort = runtimeContext.StartPort;
        startType = runtimeContext.StartType;

        // 如果是商店 APP 版，且是來自「開機自動啟動」
        if (runtimeContext.IsStoreApp) {
            try {
                var args2 = AppInstance.GetActivatedEventArgs();
                if (args2 != null) {
                    if (args2.Kind == ActivationKind.StartupTask) {
                        args = ["none"];
                    }
                }
            }
            catch { }
        }

        // 啟動參數是 closeAll
        if (args.Length == 1 && args[0] == "closeAll") {
            SingleInstanceCoordinator.CloseAllWindow();
            return;
        }

        bool argsIsNone = (args.Length == 1 && args[0] == "none"); // 啟動參數是 none

        bool isRestart = args.Length >= 1 && args[0] == "restart";
        if (isRestart) { // 啟動參數是 restart
            args = args.Skip(1).ToArray(); // 刪除陣列的第一筆
        }
        else {
            // 啟動模式不是常駐背景，就直接離開
            if (argsIsNone) {
                if (startType == StartMode.QuickStartResident || startType == StartMode.SingleInstanceResident) {
                }
                else {
                    return;
                }
            }
            // 如果允許快速啟動，就不開啟新個體
            if (SingleInstanceCoordinator.Check(args)) { return; }
        }

        FileStream startupLock = null;
        try {
            if (startType != StartMode.Normal) {
                // 冷啟動時，等第一個程序建立 Pipe 與 Port 後再轉送開檔命令。
                startupLock = WaitForStartupLock();
                if (startupLock == null) {
                    MessageBox.Show("Tiefsee is still starting. Please try opening the file again.");
                    return;
                }
                if (isRestart == false && SingleInstanceCoordinator.Check(args)) { return; }
            }

            services = AppBootstrapper.Bootstrap(runtimeContext);

            // 在本地建立 server
            webServer = new WebServer();
            bool webServerState = webServer.Init();
            if (webServerState == false) {
                System.Windows.Forms.MessageBox.Show("Tiefsee localhost server error");
                return;
            }
            services.SetWebServer(webServer);
            services.RegisterHttpRoutes();
            // 程式結束時釋放 native archive instance 與記憶體中的密碼快取。
            Application.ApplicationExit += (_, _) => services?.ArchivePreview?.Dispose();

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.SetHighDpiMode(HighDpiMode.PerMonitorV2); // 高 DPI 模式

            startWindow = new StartWindow();
        }
        finally {
            startupLock?.Dispose();
        }

        if (argsIsNone == false) {
            WebWindow.Create("MainWindow.html", args, null); // 顯示初始視窗
        }
        if (argsIsNone == true) { // 如果args是none
            WebWindow.NewTempWindow("MainWindow.html"); // 新增一個看不見的視窗，用於下次顯示
        }

        Application.Run(startWindow);
    }

    /// <summary>
    /// 等待其他程序完成冷啟動；鎖定由作業系統在程序結束時自動釋放。
    /// </summary>
    private static FileStream WaitForStartupLock() {
        var timer = Stopwatch.StartNew();
        while (timer.Elapsed < TimeSpan.FromSeconds(30)) {
            try {
                return new FileStream(runtimeContext.AppDataLock, FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.None);
            }
            catch (IOException) {
                Thread.Sleep(50);
            }
        }
        return null;
    }

}
