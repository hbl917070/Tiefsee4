using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;

namespace TiefseeLauncher;

public class Program {
    /*
    [STAThread]
    public static void Main(string[] args) {
        new Launcher().Init(args);
    } */

    // 導出到 C++
    [UnmanagedCallersOnly(EntryPoint = "run")]
    public static IntPtr Run(int argc, IntPtr argvPtr) {
        // 將 argvPtr 轉換為 string[]
        string[] argv = new string[argc];
        for (int i = 0; i < argc; i++) {
            IntPtr ptr = Marshal.ReadIntPtr(argvPtr, i * IntPtr.Size);
            argv[i] = Marshal.PtrToStringAnsi(ptr);
        }

        new Launcher().Init(argv);

        // 回傳
        // string result = string.Join(" ", argv);
        // IntPtr resultPtr = Marshal.StringToHGlobalAnsi(result);
        IntPtr resultPtr = Marshal.StringToHGlobalAnsi("ok");
        return resultPtr;
    }
}

class Launcher {
    /// <summary> Tiefsee.exe 路徑 </summary>
    private string exePath;
    /// <summary> AppData(使用者資料) </summary>
    private string appData;
    /// <summary> Start.ini </summary>
    private string appDataStartIni;
    /// <summary> Port Dir </summary>
    private string appDataPort;
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

        string portableMode = Path.Combine(baseDirectory, "PortableMode");
        if (Directory.Exists(portableMode)) { // 便攜模式 (如果存在此資料夾，就把資料儲存在這裡
            appData = portableMode;
        }
        else {
            appData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Tiefsee");
        }

        // 啟動參數是 closeAll
        if (args.Length == 1 && args[0] == "closeAll") {
            RunTiefseeCore(args);
            return;
        }

        appDataStartIni = Path.Combine(appData, "Start.ini");
        appDataPort = Path.Combine(appData, "Port");
        var iniManager = new IniManager(appDataStartIni);
        startType = Int32.Parse(iniManager.ReadIniFile("setting", "startType", "3"));

        if (startType == 1) {
            RunTiefseeCore(args);
        }
        else {
            // 如果允許快速啟動，就不開啟新個體
            if (Check(args)) { return; }

            RunTiefseeCore(args);
        }
    }

    /// <summary>
    /// 啟動 TiefseeCore.exe
    /// </summary>
    private void RunTiefseeCore(string[] args) {
        var startInfo = new ProcessStartInfo();
        startInfo.FileName = exePath;
        startInfo.Arguments = string.Join(" ", args.Select(x => "\"" + x + "\""));
        Process.Start(startInfo).Dispose();
    }

    /// <summary>
    /// 快速開啟。回傳 true 表示結束程式
    /// </summary>
    private bool Check(string[] args) {

        // 找不到記錄 port 的資料夾
        if (Directory.Exists(appDataPort) == false) {
            return false;
        }

        int port = GetPort();

        // 沒有可以正常請求的 port
        if (port == -1) {
            return false;
        }

        NewWindow(args, port);
        return true;
    }

    /// <summary>
    /// 
    /// </summary>
    private int GetPort() {

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
                SendRequest(uri);

                return Int32.Parse(port);
            }
            catch { }

            File.Delete(filePort); // 如果這個 port 超過時間沒有回應，就當做無法使用，將檔案刪除
        }
        return -1;
    }

    /// <summary>
    /// 開啟新視窗
    /// </summary>
    private void NewWindow(string[] args, int port) {
        string base64 = Uri.EscapeDataString(string.Join("\n", args));
        string uri = $"http://127.0.0.1:{port}/api/newWindow?path=" + base64;
        SendRequest(uri);
    }

    /// <summary>
    /// 發送 http 請求
    /// </summary>
    private Task<string> SendRequest(string uri) {
        using (HttpClient client = new()) {
            client.Timeout = TimeSpan.FromSeconds(5); // 逾時
            client.DefaultRequestHeaders.Add("User-Agent", webvviewUserAgent);
            HttpResponseMessage response = client.GetAsync(uri).Result;
            return response.Content.ReadAsStringAsync();
        }
    }

}

/// <summary>
/// 存取 ini 檔
/// </summary>
class IniManager {
    private string filePath;
    private StringBuilder lpReturnedString;
    private int bufferSize;

    // [DllImport("kernel32")]
    // private static extern long WritePrivateProfileString(string section, string key, string lpString, string lpFileName);

    [DllImport("kernel32")]
    private static extern int GetPrivateProfileString(string section, string key, string lpDefault, StringBuilder lpReturnedString, int nSize, string lpFileName);

    public IniManager(string iniPath) {
        filePath = iniPath;
        bufferSize = 512;
        lpReturnedString = new StringBuilder(bufferSize);
    }

    // read ini date depend on section and key
    public string ReadIniFile(string section, string key, string defaultValue) {
        lpReturnedString.Clear();
        GetPrivateProfileString(section, key, defaultValue, lpReturnedString, bufferSize, filePath);
        return lpReturnedString.ToString();
    }

    /*
    // write ini data depend on section and key
    public void WriteIniFile(string section, string key, Object value) {
        WritePrivateProfileString(section, key, value.ToString(), filePath);
    }*/
}
