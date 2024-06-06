using System.Diagnostics;
using System.IO;
using System.Net.Http;

namespace Tiefsee;

public class QuickRun {

    public static int runNumber = 0; // 目前的視窗數量

    /// <summary>
    /// 新建視窗時呼叫
    /// </summary>
    public static void WindowCreate() {
        runNumber += 1;
    }

    /// <summary>
    /// 關閉視窗時呼叫
    /// </summary>
    public static void WindowFreed() {
        runNumber -= 1;

        if (runNumber <= 0) {
            Adapter.Shutdown();
            Program.startWindow.PortFreed();
            Program.startWindow.Close(); // 關閉此視窗，程式就會完全結束
        }
    }

    /// <summary>
    /// 快速開啟。回傳 true 表示結束程式
    /// </summary>
    public static bool Check(string[] args) {

        // 直接啟動
        if (Program.startType == 1) {
            return false;
        }

        // 找不到記錄 port 的資料夾
        if (Directory.Exists(AppPath.appDataPort) == false) {
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
    /// 結束程式
    /// </summary>
    public static void Exit() {
        runNumber = 0;
        WindowFreed();
    }

    /// <summary>
    /// 關閉全部的視窗
    /// </summary>
    public static void CloseAllWindow() {

        // 如果是 直接啟動，直接強制結束所有 process
        if (Program.startType == 1) {
            Process[] proc = Process.GetProcessesByName(Process.GetCurrentProcess().ProcessName);
            for (int i = proc.Length - 1; i >= 0; i--) {
                try {
                    if (proc[i].Id == Process.GetCurrentProcess().Id)
                        continue;
                    proc[i].Kill(); // 關閉執行中的程式
                }
                catch { }
            }

            // 刪除所有的 port 檔案
            foreach (string filePort in Directory.GetFiles(AppPath.appDataPort, "*")) {
                try {
                    File.Delete(filePort);
                    continue;
                }
                catch { }
            }
            return;
        }

        int port = GetPort();
        string uri = $"http://127.0.0.1:{port}/api/closeAllWindow";
        SendRequest(uri);
    }

    /// <summary>
    /// 
    /// </summary>
    private static int GetPort() {

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
                SendRequest(uri);

                return Int32.Parse(port);
            }
            catch { }
            try {
                File.Delete(filePort); // 如果這個 port 超過時間沒有回應，就當做無法使用，將檔案刪除
            }
            catch { }
        }
        return -1;
    }

    /// <summary>
    /// 
    /// </summary>
    private static void NewWindow(string[] args, int port) {
        string base64 = Uri.EscapeDataString(string.Join("\n", args));
        string uri = $"http://127.0.0.1:{port}/api/newWindow?path=" + base64;
        SendRequest(uri);
    }

    /// <summary>
    /// 發送 http 請求
    /// </summary>
    private static Task<string> SendRequest(string uri) {
        using (HttpClient client = new()) {
            client.Timeout = TimeSpan.FromSeconds(5); // 逾時
            client.DefaultRequestHeaders.Add("User-Agent", Program.webvviewUserAgent);
            HttpResponseMessage response = client.GetAsync(uri).Result;
            return response.Content.ReadAsStringAsync();
        }
    }

}
