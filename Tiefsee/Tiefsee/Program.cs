using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Tiefsee {
    static class Program {

        //[System.Runtime.InteropServices.DllImport("user32.dll")]
        //public static extern bool SetProcessDPIAware();


        /// <summary>
        /// 應用程式的主要進入點。
        /// </summary>
        [STAThread]
        static void Main(string[] args) {

            //if (Environment.OSVersion.Version.Major >= 6)
            //    SetProcessDPIAware();*/


            //如果允許快速啟動，就不開啟新個體
            if (QuickRun.Check(args)) { return; }

            //在本地端建立server
            BaseServer bserver = new BaseServer();
            String _url = $"http://localhost:{bserver.port}/www/MainWindow.html";
          
            //Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            new WebWindow(_url, args, null);
            StartWindow startWindow = QuickRun.PortCreat(bserver.port);// 寫入檔案，表示此post已經被佔用
            Application.Run(startWindow);

        }




    }
}
