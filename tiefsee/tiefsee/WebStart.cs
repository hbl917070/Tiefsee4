using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace tiefsee {


    [ComVisible(true)]
    public class WebStart : Form {

        
        public Microsoft.Web.WebView2.WinForms.WebView2 wv2;


        async  void func() {

            DateTime time_start = DateTime.Now;//計時開始 取得目前時間

            await wv2.EnsureCoreWebView2Async();

            DateTime time_end = DateTime.Now;//計時結束 取得目前時間            
            string result2 = ((TimeSpan)(time_end - time_start)).TotalMilliseconds.ToString();//後面的時間減前面的時間後 轉型成TimeSpan即可印出時間差
            System.Console.WriteLine("+++++++++++++++++++++++++++++++++++" + result2 + " 毫秒");

            wv2.NavigateToString($"<html><body><h2>{result2}</h2></body></html>");


             string _url = $"http://localhost:{55444}/www/MainWindow.html";
                // new WebWindow(_url, new string[0], null);


            //MessageBox.Show(result2 + " 毫秒");



            // String  x = await  wv2.ExecuteScriptAsync("return '10';");

            System.Console.WriteLine("+++++++++++");

            //MessageBox.Show(x.ToString());
        }


        public  WebStart(String _url) {

            //Adapter.Initialize();
        


            wv2 = new Microsoft.Web.WebView2.WinForms.WebView2();
            wv2.Dock = DockStyle.Fill;

            this.Controls.Add(wv2);
            this.ShowInTaskbar = false;

            //wv2.Source = new Uri(_url);
            
            //wv2.NavigateToString("");
            func();

           /* wv2.NavigationStarting += (sender, e) => {

                //wv2.CoreWebView2.AddHostObjectToScript("WV_Window", new WV_Window(this));
                //wv2.CoreWebView2.AddHostObjectToScript("WV_Directory", new WV_Directory(this));

                // webView21.CoreWebView2.AddScriptToExecuteOnDocumentCreatedAsync("var webBrowserObj= window.chrome.webview.hostObjects.webBrowserObj;");

                wv2.CoreWebView2.NewWindowRequested += (sender2, e2) => {
                    String _fileurl = e2.Uri.ToString();
                    //if (_fileurl.IndexOf("http") != 0) {
                    e2.Handled = true;
                    //}
                    System.Console.WriteLine(_fileurl);
                    runScript($"var dropPath = \"{_fileurl}\"");

                };
            };*/


       
            
    
        }





        private void runScript(String js) {
            if (wv2.CoreWebView2 != null)
                wv2.CoreWebView2.ExecuteScriptAsync(js);
        }


    
    }







 
}
