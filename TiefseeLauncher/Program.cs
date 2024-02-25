using System.Diagnostics;
using System.Text;

namespace TiefseeLauncher;

static class Program {


    /// <summary> 1=直接啟動  2=快速啟動  3=快速啟動且常駐  4=單一執行個體  5=單一執行個體且常駐 </summary>
    public static int startType;
    /// <summary> 透過 UserAgent 來驗證是否有權限請求 localhost server API </summary>
    public static string webvviewUserAgent = "Tiefsee";

    public static string exePath;

    /// <summary>
    /// 應用程式的主要進入點
    /// </summary>
    [STAThread]
    static void Main(string[] args) {

        string currDir;
        exePath = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "TiefseeCore.exe");

        if (File.Exists(exePath) == false) {
            currDir = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "../Tiefsee");
            exePath = Path.Combine(currDir, "TiefseeCore.exe");
            Directory.SetCurrentDirectory(System.AppDomain.CurrentDomain.BaseDirectory);
        }
        else {
            currDir = System.AppDomain.CurrentDomain.BaseDirectory;
        }
        // 修改 工作目錄 為程式資料夾 (如果有傳入 args 的話，工作目錄會被修改，所以需要改回來
        Directory.SetCurrentDirectory(currDir);

        AppPath.Init();

        IniManager iniManager = new IniManager(AppPath.appDataStartIni);
        startType = Int32.Parse(iniManager.ReadIniFile("setting", "startType", "3"));

        if (startType == 1) {
            RunTiefseeCore(args); // 啟動 TiefseeCore.exe
        }
        else {
            // 如果允許快速啟動，就不開啟新個體
            if (Check(args)) { return; }

            RunTiefseeCore(args); // 啟動 TiefseeCore.exe
        }

    }

    /// <summary>
    /// 啟動 TiefseeCore.exe
    /// </summary>
    private static void RunTiefseeCore(string[] args) {
        var startInfo = new ProcessStartInfo();
        startInfo.FileName = exePath;
        startInfo.Arguments = string.Join(" ", args.Select(x => "\"" + x + "\""));
        Process.Start(startInfo);
    }

    /// <summary>
    /// 快速開啟。回傳 true 表示結束程式
    /// </summary>
    public static bool Check(string[] args) {

        if (Program.startType == 1) { // 直接啟動
            return false;
        }

        if (Directory.Exists(AppPath.appDataPort) == false) {
            return false;
        }

        foreach (string filePort in Directory.GetFiles(AppPath.appDataPort, "*")) { // 判斷目前已經開啟的視窗

            try {
                using (FileStream flagFile = File.Open(filePort, FileMode.Open)) { }
                File.Delete(filePort); // 如果 port 沒有被鎖定，就刪除檔案
                continue;
            }
            catch {
                // 檔案被鎖定，表示此 port 還有在作用
            }

            try {
                string port = Path.GetFileName(filePort);
                // 偵測是否可用
                string uri = $"http://127.0.0.1:{port}/api/check";
                using (HttpClient client = new HttpClient()) {
                    client.Timeout = TimeSpan.FromSeconds(5); // 逾時
                    client.DefaultRequestHeaders.Add("User-Agent", Program.webvviewUserAgent);

                    HttpResponseMessage response = client.GetAsync(uri).Result;
                }

                if (Program.startType == 2) { // 快速啟動
                    NewWindow(args, port);
                    return true;
                }

                if (Program.startType == 3) { // 快速啟動且常駐
                    NewWindow(args, port);
                    return true;
                }

                if (Program.startType == 4) { // 單一執行個體
                    NewWindow(args, port);
                    return true;
                }

                if (Program.startType == 5) { // 單一執行個體且常駐
                    NewWindow(args, port);
                    return true;
                }
            }
            catch { }

            File.Delete(filePort); // 如果這個 port 超過時間沒有回應，就當做無法使用，將檔案刪除

        }

        return false;
    }

    /// <summary>
    /// 
    /// </summary>
    private static void NewWindow(string[] args, string port) {

        // 啟動參數
        StringBuilder sb = new();
        for (int i = 0; i < args.Length; i++) {
            if (i != args.Length - 1) {
                sb.Append(args[i] + "\n");
            }
            else {
                sb.Append(args[i]);
            }
        }

        // 開啟新視窗
        string base64 = Uri.EscapeDataString(sb.ToString());
        string uri = $"http://127.0.0.1:{port}/api/newWindow?path=" + base64;

        using (HttpClient client = new HttpClient()) {
            client.Timeout = TimeSpan.FromSeconds(5); // 逾時
            client.DefaultRequestHeaders.Add("User-Agent", Program.webvviewUserAgent);
            HttpResponseMessage response = client.GetAsync(uri).Result;
            // string responseContent = response.Content.ReadAsStringAsync().Result; 
        }
    }

}

public class AppPath {

    /// <summary> AppData(使用者資料) </summary>
    public static string appData;
    /// <summary> Start.ini </summary>
    public static string appDataStartIni;
    /// <summary> Port Dir </summary>
    public static string appDataPort;

    public static void Init() {

        string portableMode = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "portableMode");
        if (Directory.Exists(portableMode)) { // 便攜模式 (如果存在此資料夾，就把資料儲存在這裡
            appData = portableMode;
        }
        else {
            appData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Tiefsee");
        }

        appDataStartIni = Path.Combine(appData, "Start.ini");
        appDataPort = Path.Combine(appData, "Port");
    }

}
