using System.IO;
using System.Net.Http;
using System.Text;

namespace Tiefsee {
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
        /// 快速開啟。回傳true表示結束程式
        /// </summary>
        /// <param name="e"></param>
        /// <returns></returns>
        public static bool Check(string[] args) {

            if (Program.startType == 1) { // 直接啟動
                return false;
            }

            if (Directory.Exists(AppPath.appDataPort) == false) {
                return false;
            }

            foreach (String filePort in Directory.GetFiles(AppPath.appDataPort, "*")) { // 判斷目前已經開啟的視窗

                try {
                    using (FileStream flagFile = File.Open(filePort, FileMode.Open)) { }
                    File.Delete(filePort); // 如果 port 沒有被鎖定，就刪除檔案
                    continue;
                } catch {
                    // 檔案被鎖定，表示此 port 還有在作用
                }

                try {
                    string port = Path.GetFileName(filePort);
                    // 偵測是否可用
                    String uri = $"http://127.0.0.1:{port}/api/check";
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
                } catch {}

                File.Delete(filePort); // 如果這個port超過時間沒有回應，就當做無法使用，將檔案刪除

            }

            return false;
        }

        /// <summary>
        /// 關閉全部的視窗(結束程式)
        /// </summary>
        public static void CloseAllWindow() {
            runNumber = 0;
            WindowFreed();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="args"></param>
        /// <param name="port"></param>
        private static void NewWindow(string[] args, string port) {

            // 啟動參數
            StringBuilder sb = new();
            for (int i = 0; i < args.Length; i++) {
                if (i != args.Length - 1) {
                    sb.Append(args[i] + "\n");
                } else {
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
}
