using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Tiefsee {
    public class WebServerController {

        WebServer webServer;
        private bool isCache = true;//是否對靜態資源使用快取


        public WebServerController(WebServer _webServer) {

            webServer = _webServer;

            //註冊路由
            /*webServer.RouteAddGet("/aa/bb/{*}", (RequestData d) => {
                byte[] _responseArray = Encoding.UTF8.GetBytes("-" + d.value + "-");
                d.context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length); // write bytes to the output stream
            });*/
            webServer.RouteAddGet("/api/check", api_ckeck);
            webServer.RouteAddGet("/api/newWindow/{*}", api_newwindow);
            webServer.RouteAddGet("/api/getimg/{*}", api_getimg);
            webServer.RouteAddGet("/api/getpdf/{*}", api_getpdf);
            webServer.RouteAddGet("/www/{*}", getwww);
            webServer.RouteAddGet("/{*}", getwww);
            //webServer.RouteAddGet("{*}", get404);
        }


        /// <summary>
        /// 設定是否對靜態資源使用快取
        /// </summary>
        /// <param name="type"></param>
        public void SetIsCache(int type) {
            if (type >= 1) {
                isCache = true;
            } else {
                isCache = false;
            }
        }


        /// <summary>
        /// 回傳字串
        /// </summary>
        /// <param name="context"></param>
        /// <param name="str"></param>
        private void WriteString(RequestData d, string str) {
            byte[] _responseArray = Encoding.UTF8.GetBytes(str);
            d.context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length); // write bytes to the output stream
        }


        /// <summary>
        /// 回傳檔案
        /// </summary>
        /// <param name="d"></param>
        /// <param name="path"></param>
        private void WriteFile(RequestData d, string path) {
            using (Stream input = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) {

                d.context.Response.ContentLength64 = input.Length;

                if (d.context.Request.HttpMethod != "HEAD") {
                    byte[] buffer = new byte[1024 * 16];
                    int nbytes;
                    while ((nbytes = input.Read(buffer, 0, buffer.Length)) > 0) {
                        //context.Response.SendChunked = input.Length > 1024 * 16;
                        d.context.Response.OutputStream.Write(buffer, 0, nbytes);
                    }
                }
                //context.Response.StatusCode = (int)HttpStatusCode.OK;
                //context.Response.OutputStream.Flush();
            }

            /*using (FileStream fs = new FileStream(_path, FileMode.Open, FileAccess.Read, FileAccess.Read, FileShare.ReadWrite)) {
                byte[] _responseArray = new byte[fs.Length];
                fs.Read(_responseArray, 0, _responseArray.Length);
                fs.Close();
                context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length); // write bytes to the output stream
            }*/
        }


        /// <summary>
        /// 回傳檔案時加入快取的Headers
        /// </summary>
        /// <param name="d"></param>
        /// <param name="path"></param>
        private void HeadersAddCache(RequestData d, string path) {
            if (isCache == true) {//讓瀏覽器快取檔案
                string lastModified = File.GetLastWriteTime(path).ToString("ddd, dd MMM yyy HH':'mm':'ss 'GMT'", new System.Globalization.CultureInfo("en-US"));
                d.context.Response.Headers.Add("Last-Modified", lastModified);//檔案建立的時間
                d.context.Response.Headers.Add("Cache-Control", "max-age=31536000");
            }
            /*context.Response.Headers.Add("ETag", @"W/""2d49-17e45f9a21e""");//
            context.Response.Headers.Add("Access-Control-Allow-Credentials", "true");//
            context.Response.Headers.Add("Cache-Control", "public, max-age=0");
            context.Response.Headers.Add("Accept-Ranges", "bytes");
            context.Response.Headers.Add("Vary", "Origin");
            context.Response.Headers.Add("Connection", "keep-alive");
            if (context.Response.ContentType == "text/html") {
                context.Response.StatusCode = (int)HttpStatusCode.NotModified;
            }*/
        }


        /// <summary>
        /// 檢查這個port是否為tiefsee所使用，用於快速啟動
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        private void api_ckeck(RequestData d) {
            WriteString(d, "tiefsee");
        }


        /// <summary>
        /// 新開一個視窗，用於快速啟動
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        private void api_newwindow(RequestData d) {

            string arg = Encoding.UTF8.GetString(Convert.FromBase64String(d.value));//將字串剖析回命令列參數
            string[] args = arg.Split('\n');

            Adapter.UIThread(() => {
                WebWindow.Create($"http://localhost:{webServer.port}/www/MainWindow.html", args, null);
            });

            WriteString(d, "ok");
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        private void api_getimg(RequestData d) {
            string path = d.value;
            if (File.Exists(path) == false) { return; }
            d.context.Response.ContentType = _mimeTypeMappings.TryGetValue(Path.GetExtension(path), out string mime) ? mime : "application/octet-stream";
            HeadersAddCache(d, path);//回傳檔案時加入快取的Headers
            WriteFile(d, path);//回傳檔案
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        private void api_getpdf(RequestData d) {
            string path = d.value;
            if (File.Exists(path) == false) { return; }
            d.context.Response.ContentType = "application/pdf";
            HeadersAddCache(d, path);//回傳檔案時加入快取的Headers
            WriteFile(d, path);//回傳檔案
        }


        /// <summary>
        /// 取得 www 目錄裡面的檔案
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        private void getwww(RequestData d) {

            String exeDir = System.AppDomain.CurrentDomain.BaseDirectory;//程式的目錄

            String _path;
            if (d.value.IndexOf("www/") == 0) {
                _path = System.IO.Path.Combine(exeDir, d.value);
            } else {
                _path = System.IO.Path.Combine(exeDir, "www", d.value);
            }

            //如果檔案不存在就返回404錯誤
            if (File.Exists(_path) == false) {
                d.context.Response.StatusCode = 404;
                WriteString(d, "404");
                return;
            }

            d.context.Response.ContentType = _mimeTypeMappings.TryGetValue(Path.GetExtension(_path), out string mime) ? mime : "application/octet-stream";
            HeadersAddCache(d, _path);//回傳檔案時加入快取的Headers
            WriteFile(d, _path);//回傳檔案
        }


        /// <summary>
        /// 只允許來自 http://localhost:{port} 的請求，其餘的一律回傳400錯誤
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        /*private bool get400(String _url, HttpListenerContext context) {

            HttpListenerRequest request = context.Request;
            String headersReferer = request.Headers.Get("Referer");

            if (headersReferer != null && (headersReferer.IndexOf("http://localhost:" + webServer.port + "/") != 0)) {
                //Console.WriteLine("非法請求，400錯誤：" + headersReferer);
                context.Response.StatusCode = 400;

                byte[] _responseArray = Encoding.UTF8.GetBytes("400");
                context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length); // write bytes to the output stream
                return true;
            }

            return false;
        }


        /// <summary>
        /// 找不到檔案
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        private void get404(RequestData d) {
            d.context.Response.StatusCode = 404;
            byte[] _responseArray = Encoding.UTF8.GetBytes("404");
            d.context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length); // write bytes to the output stream
        }*/


        private IDictionary<string, string> _mimeTypeMappings = new Dictionary<string, string>(StringComparer.InvariantCultureIgnoreCase) {
        #region extension to MIME type list
        {".asf", "video/x-ms-asf"},
        {".asx", "video/x-ms-asf"},
        {".avi", "video/x-msvideo"},
        {".bin", "application/octet-stream"},
        {".cco", "application/x-cocoa"},
        {".crt", "application/x-x509-ca-cert"},
        {".css", "text/css"},
        {".deb", "application/octet-stream"},
        {".der", "application/x-x509-ca-cert"},
        {".dll", "application/octet-stream"},
        {".dmg", "application/octet-stream"},
        {".ear", "application/java-archive"},
        {".eot", "application/octet-stream"},
        {".exe", "application/octet-stream"},
        {".flv", "video/x-flv"},
        {".gif", "image/gif"},
        {".hqx", "application/mac-binhex40"},
        {".htc", "text/x-component"},
        {".htm", "text/html"},
        {".html", "text/html"},
        {".ico", "image/x-icon"},
        {".img", "application/octet-stream"},
        {".iso", "application/octet-stream"},
        {".jar", "application/java-archive"},
        {".jardiff", "application/x-java-archive-diff"},
        {".jng", "image/x-jng"},
        {".jnlp", "application/x-java-jnlp-file"},
        {".jpeg", "image/jpeg"},
        {".jpg", "image/jpeg"},
        {".js", "application/x-javascript"},
        {".mml", "text/mathml"},
        {".mng", "video/x-mng"},
        {".mov", "video/quicktime"},
        {".mp3", "audio/mpeg"},
        {".mpeg", "video/mpeg"},
        {".mpg", "video/mpeg"},
        {".msi", "application/octet-stream"},
        {".msm", "application/octet-stream"},
        {".msp", "application/octet-stream"},
        {".pdb", "application/x-pilot"},
        {".pdf", "application/pdf"},
        {".pem", "application/x-x509-ca-cert"},
        {".pl", "application/x-perl"},
        {".pm", "application/x-perl"},
        {".png", "image/png"},
        {".prc", "application/x-pilot"},
        {".ra", "audio/x-realaudio"},
        {".rar", "application/x-rar-compressed"},
        {".rpm", "application/x-redhat-package-manager"},
        {".rss", "text/xml"},
        {".run", "application/x-makeself"},
        {".sea", "application/x-sea"},
        {".shtml", "text/html"},
        {".sit", "application/x-stuffit"},
        {".swf", "application/x-shockwave-flash"},
        {".tcl", "application/x-tcl"},
        {".tk", "application/x-tcl"},
        {".txt", "text/plain"},
        {".war", "application/java-archive"},
        {".wbmp", "image/vnd.wap.wbmp"},
        {".wmv", "video/x-ms-wmv"},
        {".xml", "text/xml"},
        {".xpi", "application/x-xpinstall"},
        {".zip", "application/zip"},
        {".mp4", "video/mpeg"},
        {".svg", "image/svg+xml" },
        {".ai", "application/pdf" },
        #endregion
        };
    }
}
