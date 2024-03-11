using System.Diagnostics;

namespace TiefseeLauncher;

public static class Program {
    [STAThread]
    public static void Main(string[] args) {
        new Launcher().Init(args);
    }
}

class Launcher {
    /// <summary> Tiefsee.exe 路徑 </summary>
    private string? exePath;
    /// <summary> AppData(使用者資料) </summary>
    private string? appData;
    /// <summary> Start.ini </summary>
    private string? appDataStartIni;
    /// <summary> Port Dir </summary>
    private string? appDataPort;
    /// <summary> 1=直接啟動  2=快速啟動  3=快速啟動且常駐  4=單一執行個體  5=單一執行個體且常駐 </summary>
    private int startType;
    /// <summary> 透過 UserAgent 來驗證是否有權限請求 localhost server API </summary>
    private string webvviewUserAgent = "Tiefsee";

    public void Init(string[] args) {

        var baseDirectory = System.AppDomain.CurrentDomain.BaseDirectory;
        // 修改 工作目錄 為程式資料夾 (如果有傳入 args 的話，工作目錄會被修改，所以需要改回來
        Directory.SetCurrentDirectory(baseDirectory);

        exePath = Path.Combine(baseDirectory, "TiefseeCore.exe");
        if (File.Exists(exePath) == false) {
            exePath = Path.Combine(baseDirectory, "../Tiefsee/TiefseeCore.exe");
        }

        string portableMode = Path.Combine(baseDirectory, "portableMode");
        if (Directory.Exists(portableMode)) { // 便攜模式 (如果存在此資料夾，就把資料儲存在這裡
            appData = portableMode;
        }
        else {
            appData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Tiefsee");
        }

        appDataStartIni = Path.Combine(appData, "Start.ini");
        appDataPort = Path.Combine(appData, "Port");

        var iniManager = new IniManager(appDataStartIni);
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
    private void RunTiefseeCore(string[] args) {
        var startInfo = new ProcessStartInfo();
        startInfo.FileName = exePath;
        startInfo.Arguments = string.Join(" ", args.Select(x => "\"" + x + "\""));
        Process.Start(startInfo);
    }

    /// <summary>
    /// 快速開啟。回傳 true 表示結束程式
    /// </summary>
    private bool Check(string[] args) {

        if (Directory.Exists(appDataPort) == false) {
            return false;
        }

        foreach (string filePort in Directory.GetFiles(appDataPort, "*")) { // 判斷目前已經開啟的視窗

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
                    client.DefaultRequestHeaders.Add("User-Agent", webvviewUserAgent);
                    HttpResponseMessage response = client.GetAsync(uri).Result;
                }

                NewWindow(args, port);
                return true;
            }
            catch { }

            File.Delete(filePort); // 如果這個 port 超過時間沒有回應，就當做無法使用，將檔案刪除
        }
        return false;
    }

    /// <summary>
    /// 開啟新視窗
    /// </summary>
    private void NewWindow(string[] args, string port) {
        string base64 = Uri.EscapeDataString(string.Join("\n", args));
        string uri = $"http://127.0.0.1:{port}/api/newWindow?path=" + base64;
        using (HttpClient client = new HttpClient()) {
            client.Timeout = TimeSpan.FromSeconds(5); // 逾時
            client.DefaultRequestHeaders.Add("User-Agent", webvviewUserAgent);
            HttpResponseMessage response = client.GetAsync(uri).Result;
            // string responseContent = response.Content.ReadAsStringAsync().Result; 
        }
    }

}
