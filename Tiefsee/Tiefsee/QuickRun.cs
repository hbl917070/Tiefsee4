using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.IO;
using System.Net;

namespace Tiefsee {
    public class QuickRun {


        private static int runNumber = 0;//目前的視窗數量
        private static int mainPort;//程式目前使用的port
        public static StartWindow startWindow;//用於防止程式被關閉的視窗



        /// <summary>
        /// 新建視窗時呼叫
        /// </summary>
        public static void WindowCreat() {
            runNumber += 1;
        }

        /// <summary>
        /// 關閉視窗時呼叫
        /// </summary>
        public static void WindowFreed() {
            runNumber -= 1;

            if (runNumber <= 0) {
                PortFreed();
                startWindow.Close();//關閉此視窗，程式就會完全結束
            }
        }

        /// <summary>
        /// 寫入檔案，表示此post已經被佔用
        /// </summary>
        /// <param name="post"></param>
        public static StartWindow PortCreat(int port) {
            mainPort = port;
            string portDir = Path.Combine(Application.StartupPath, "data/port");
            string portFile = Path.Combine(portDir, port.ToString());
            if (File.Exists(portFile) == false) {
                using (FileStream fs = new FileStream(portFile, FileMode.Create)) { }
            }
            startWindow = new StartWindow();
            return startWindow;
        }


        /// <summary>
        /// 刪除檔案，表示此post已經釋放
        /// </summary>
        /// <param name="post"></param>
        public static void PortFreed() {
            string portDir = Path.Combine(Application.StartupPath, "data/port");
            string portFile = Path.Combine(portDir, mainPort.ToString());
            if (File.Exists(portFile) == true) {
                File.Delete(portFile);
            }
        }



        /// <summary>
        /// 快速開啟
        /// </summary>
        /// <param name="e"></param>
        /// <returns></returns>
        public static bool Check(string[] args) {

            //DateTime time_start = DateTime.Now;//計時開始 取得目前時間

            String portDir = Path.Combine(Application.StartupPath, "data/port");

            if (Directory.Exists(portDir)) {
                foreach (String item in Directory.GetFiles(portDir, "*")) {//判斷目前已經開啟的視窗
                    try {

                        string port = Path.GetFileName(item);

                        //偵測是否可用
                        String uri = $"http://localhost:{port}/api/check";
                        HttpWebRequest request = (HttpWebRequest)WebRequest.Create(uri);
                        request.Timeout = 30;
                        using (HttpWebResponse response = (HttpWebResponse)request.GetResponse()) {
                            using (Stream stream = response.GetResponseStream()) {
                                /*using (StreamReader reader = new StreamReader(stream)) {
                                    String s = reader.ReadToEnd();
                                }*/
                            }
                        }

                        //啟動參數
                        StringBuilder sb = new StringBuilder();
                        for (int i = 0; i < args.Length; i++) {
                            if (i != args.Length - 1) {
                                sb.Append(args[i] + "*");
                            } else {
                                sb.Append(args[i]);
                            }
                        }

                        //開啟新視窗
                        uri = $"http://localhost:{port}/api/newWindow/" + Uri.EscapeDataString(sb.ToString());
                        HttpWebRequest request2 = (HttpWebRequest)WebRequest.Create(uri);
                        using (HttpWebResponse response = (HttpWebResponse)request2.GetResponse()) { }

                        return true;

                    } catch { }
                }//foreach
            }//if 

            return false;
        }

    }



    public class StartWindow : Form {
        public StartWindow() {

            this.Opacity = 0;
            this.ShowInTaskbar = false;

            this.Shown += (sender, e) => {
                this.Hide();
            };

        }
    }
}
