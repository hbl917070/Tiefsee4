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
        public static BaseServer bserver;//本地伺服器

        /// <summary>
        /// 應用程式的主要進入點。
        /// </summary>
        [STAThread]
        static void Main(string[] args) {

            appDataPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Tiefsee4");
            if (Directory.Exists(appDataPath) == false) {//如果資料夾不存在，就新建
                Directory.CreateDirectory(appDataPath);
            }
            startIniPath = Path.Combine(appDataPath, "start.ini");
            IniManager iniManager = new IniManager(startIniPath);
            startPort = Int32.Parse(iniManager.ReadIniFile("setting", "startPort", "4876"));
            startType = Int32.Parse(iniManager.ReadIniFile("setting", "startType", "5"));

            //如果允許快速啟動，就不開啟新個體
            if (QuickRun.Check(args)) { return; }

            //在本地端建立server
            bserver = new BaseServer();
            String _url = $"http://localhost:{bserver.port}/www/MainWindow.html";

            //Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            WebWindow.Create(_url, args, null);
            StartWindow startWindow = QuickRun.PortCreat(bserver.port);// 寫入檔案，表示此post已經被佔用
            Application.Run(startWindow);

        }




    }
}
