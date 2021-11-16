using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace tiefsee {
    static class Program {


        /// <summary>
        /// 應用程式的主要進入點。
        /// </summary>
        [STAThread]
        static void Main(string[] args) {

          

            //在本地端建立server
            BaseServer bserver = new BaseServer();
            String _url = $"http://localhost:{bserver.port}/www/MainWindow.html";

            //new Window1().Show();

            //String path = System.IO.Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "www", "main.html");

            
            //Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new WebWindow(_url, args));
            //Application.Run(new WebStart(_url));


        }
    }
}
