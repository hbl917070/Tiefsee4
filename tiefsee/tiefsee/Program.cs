using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace TiefSee {
    static class Program {

        [System.Runtime.InteropServices.DllImport("user32.dll")]
        public static extern bool SetProcessDPIAware();


        /// <summary>
        /// 應用程式的主要進入點。
        /// </summary>
        [STAThread]
        static void Main(string[] args) {

            if (Environment.OSVersion.Version.Major >= 6)
                SetProcessDPIAware();

            //在本地端建立server
            BaseServer bserver = new BaseServer();
            String _url = $"http://localhost:{bserver.port}/www/MainWindow.html"; 

            //Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new WebWindow(_url, args, null));

            //Application.Run(new WebStart(_url));

        }

       


    }
}
