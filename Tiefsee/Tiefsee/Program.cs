using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Tiefsee {
    static class Program {


        public static int startPort;//程式開始的port
        public static int startType;//1=直接啟動  2=快速啟動  3=快速啟動且常駐  4=單一執行個體  5=單一執行個體且常駐
        public static int serverCache;//伺服器對靜態資源快取的時間(秒)
        public static WebServer webServer;//本地伺服器
        public static StartWindow startWindow;//起始視窗，關閉此視窗就會結束程式


        /// <summary> 透過UserAgent來驗證是否有權限請求localhost server API </summary>
        public static string webvviewUserAgent = "Tiefsee";

        /// <summary> webview2的啟動參數 </summary>
        public static string webvviewArguments;

        /// <summary>
        /// 應用程式的主要進入點。
        /// </summary>
        [STAThread]
        static void Main(string[] args) {

            //修改 工作目錄 為程式資料夾 (如果有傳入args的話，工作目錄會被修改，所以需要改回來
            Directory.SetCurrentDirectory(System.AppDomain.CurrentDomain.BaseDirectory);

            AppPath.Init();


            IniManager iniManager = new IniManager(AppPath.appDataStartIni);
            startPort = Int32.Parse(iniManager.ReadIniFile("setting", "startPort", "4876"));
            startType = Int32.Parse(iniManager.ReadIniFile("setting", "startType", "3"));
            serverCache = Int32.Parse(iniManager.ReadIniFile("setting", "serverCache", "0"));

            bool argsIsNone = (args.Length == 1 && args[0] == "none");//啟動參數是 none

            if (args.Length >= 1 && args[0] == "restart") {//啟動參數是 restart

                args = args.Skip(1).ToArray();//刪除陣列的第一筆

            } else {

                // 啟動模式不是常駐背景，就直接離開
                if (argsIsNone) {
                    if (startType == 3 || startType == 5) {
                    } else {
                        return;
                    }
                }

                //如果允許快速啟動，就不開啟新個體
                if (QuickRun.Check(args)) { return; }
            }

            //「直接啟動」之外的，都要避免連續啟動
            if (startType != 1) {
                if (AppLock(true)) { return; }
            }

            //在本地端建立server
            webServer = new WebServer();
            bool webServerState = webServer.Init();
            if (webServerState == false) {
                System.Windows.Forms.MessageBox.Show("Tiefsee localhost server error");
                return;
            }
            webServer.controller.SetCacheTime(serverCache);

            //Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            //--disable-web-security  允許跨域請求
            //--disable-features=msWebOOUI,msPdfOOUI  禁止迷你選單
            //--disable-backing-store-limit  禁用對後備存儲數量的限制。可以防止具有許多視窗/選項卡和大量記憶體的用戶閃爍
            //--user-agent  覆寫userAgent
            webvviewArguments = $@"--disable-web-security --disable-features=""msWebOOUI,msPdfOOUI"" --disable-backing-store-limit --user-agent=""{Program.webvviewUserAgent}""";

            if (argsIsNone == false) {
                WebWindow.Create("MainWindow.html", args, null);//顯示初始視窗
            } else { //如果args是none
                WebWindow.NewTempWindow("MainWindow.html");//新增一個看不見的視窗，用於下次顯示
            }

            if (startType != 1) { AppLock(false); }//解除鎖定
            startWindow = new StartWindow();
            Application.Run(startWindow);
        }


        /// <summary>
        /// 在程式完全啟動前，禁止再次啟動
        /// </summary>
        /// <param name="val"> true=鎖定，false=解除鎖定 </param>
        /// <returns> 回傳true表示程式目前鎖定中，不要啟動程式 </returns>
        private static bool AppLock(bool val) {
            if (val) {

                if (File.Exists(AppPath.appDataLock)) {
                    try {
                        long ticks = 0;
                        using (StreamReader sr = new StreamReader(AppPath.appDataLock, System.Text.Encoding.UTF8)) {
                            ticks = long.Parse(sr.ReadToEnd());
                        }

                        if (DateTime.Now.Ticks - ticks < 5 * 10000000) {//在5秒內連續啟動，就禁止啟動
                            return true;
                        } else {
                            return false;
                        }
                    } catch {
                        return false;
                    }
                } else {
                    //using (File.Create(lockPath)) { }
                    using (FileStream fs = new FileStream(AppPath.appDataLock, FileMode.Create)) {
                        using (StreamWriter sw = new StreamWriter(fs, System.Text.Encoding.UTF8)) {
                            sw.Write(DateTime.Now.Ticks.ToString());
                        }
                    }
                    return false;
                }

            } else {
                if (File.Exists(AppPath.appDataLock)) {
                    File.Delete(AppPath.appDataLock);
                }
            }
            return false;
        }



    }
}
