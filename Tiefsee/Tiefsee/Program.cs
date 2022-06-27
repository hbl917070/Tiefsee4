using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Tiefsee {
    static class Program {

        public static string appDataPath;// 程式的暫存資料夾
        public static string startIniPath;// start.ini
        public static int startPort;//程式開始的port
        public static int startType;//1=直接啟動  2=快速啟動  3=快速啟動且常駐  4=單一執行個體  5=單一執行個體且常駐
        public static int serverCache;//伺服器對靜態資源快取的時間(秒)
        public static WebServer webServer;//本地伺服器
        public static StartWindow startWindow;//起始視窗，關閉此視窗就會結束程式

        public static string webvviewUserAgent = "Tiefsee";//透過UserAgent來驗證是否能請求localhost server API
        public static string webvviewArguments;//webview2的啟動參數
  

        /// <summary>
        /// 應用程式的主要進入點。
        /// </summary>
        [STAThread]
        static void Main(string[] args) {

            //修改 工作目錄 為程式資料夾 (如果有傳入args的話，工作目錄會被修改，所以需要改回來
            Directory.SetCurrentDirectory(System.AppDomain.CurrentDomain.BaseDirectory);

            appDataPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Tiefsee4");
            if (Directory.Exists(appDataPath) == false) {//如果資料夾不存在，就新建
                Directory.CreateDirectory(appDataPath);
            }
            startIniPath = Path.Combine(appDataPath, "start.ini");
            IniManager iniManager = new IniManager(startIniPath);
            startPort = Int32.Parse(iniManager.ReadIniFile("setting", "startPort", "4876"));
            startType = Int32.Parse(iniManager.ReadIniFile("setting", "startType", "3"));
            serverCache = Int32.Parse(iniManager.ReadIniFile("setting", "serverCache", "0"));

            //如果允許快速啟動，就不開啟新個體
            if (QuickRun.Check(args)) { return; }

            //在本地端建立server
            webServer = new WebServer();
            webServer.controller.SetCacheTime(serverCache);

            //Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            //--disable-web-security  允許跨域請求
            //--disable-backing-store-limit  禁用對後備存儲數量的限制。可以防止具有許多視窗/選項卡和大量記憶體的用戶閃爍
            //--user-agent  覆寫userAgent
            webvviewArguments = $@"--disable-web-security --disable-backing-store-limit --user-agent=""{webvviewUserAgent}""";
         
            WebWindow.Create("MainWindow.html", args, null);

            startWindow = new StartWindow();
            Application.Run(startWindow);

        }




    }
}
