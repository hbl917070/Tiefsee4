using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.IO;
using System.Net;
using Microsoft.Web.WebView2.Core;

namespace Tiefsee {
    public class QuickRun {

        public static int runNumber = 0;//目前的視窗數量

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
                PortFreed();
                Program.startWindow.Close();//關閉此視窗，程式就會完全結束
            }
        }


        /// <summary>
        /// 刪除檔案，表示此post已經釋放
        /// </summary>
        /// <param name="post"></param>
        public static void PortFreed() {
            string portDir = Path.Combine(Program.appDataPath, "port");
            string portFile = Path.Combine(portDir, Program.webServer.port.ToString());
            if (File.Exists(portFile) == true) {
                File.Delete(portFile);
            }
        }


        /// <summary>
        /// 快速開啟。回傳true表示結束程式
        /// </summary>
        /// <param name="e"></param>
        /// <returns></returns>
        public static bool Check(string[] args) {

            //DateTime time_start = DateTime.Now;//計時開始 取得目前時間

            if (Program.startType == 1) {//直接啟動
                return false;
            }

            String portDir = Path.Combine(Program.appDataPath, "port");

            if (Directory.Exists(portDir) == false) {
                return false;
            }

            foreach (String filePort in Directory.GetFiles(portDir, "*")) {//判斷目前已經開啟的視窗
                try {

                    string port = Path.GetFileName(filePort);

                    //偵測是否可用
                    String uri = $"http://127.0.0.1:{port}/api/check";
                    HttpWebRequest request = (HttpWebRequest)WebRequest.Create(uri);
                    request.Timeout = 1000;//逾時
                    request.UserAgent = Program.webvviewUserAgent;
                    using (HttpWebResponse response = (HttpWebResponse)request.GetResponse()) {
                        using (Stream stream = response.GetResponseStream()) {
                            /*using (StreamReader reader = new StreamReader(stream)) {
                                String s = reader.ReadToEnd();
                            }*/
                        }
                    }

                    if (Program.startType == 2) {//快速啟動
                        NewWindow(args, port);
                        return true;
                    }

                    if (Program.startType == 3) {//快速啟動且常駐
                        NewWindow(args, port);
                        return true;
                    }

                    if (Program.startType == 4) {//
                        NewWindow(args, port);
                        return true;
                    }

                    if (Program.startType == 5) {//
                        NewWindow(args, port);
                        return true;
                    }
                } catch (Exception e) {
                    //MessageBox.Show(e.ToString());
                }

                File.Delete(filePort);//如果這個port超過時間沒有回應，就當做無法使用，將檔案刪除

            }//foreach

            return false;
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="args"></param>
        /// <param name="port"></param>
        private static void NewWindow(string[] args, string port) {

            //啟動參數
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < args.Length; i++) {
                if (i != args.Length - 1) {
                    sb.Append(args[i] + "\n");
                } else {
                    sb.Append(args[i]);
                }
            }

            //開啟新視窗
            string base64 = Uri.EscapeDataString(sb.ToString());
            string uri = $"http://127.0.0.1:{port}/api/newWindow?path=" + base64;
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(uri);
            request.UserAgent = Program.webvviewUserAgent;
            using (HttpWebResponse response = (HttpWebResponse)request.GetResponse()) { }
        }



    }




}
