using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Tiefsee {

    public class BaseServer {

        public int port;//當前掛載的port
        private HttpListener _httpListener = new HttpListener();
        private List<Func<RequestData, bool>> ArRoute = new List<Func<RequestData, bool>>();//路由
        private bool isCache = true;//是否對靜態資源使用快取

        private static IDictionary<string, string> _mimeTypeMappings = new Dictionary<string, string>(StringComparer.InvariantCultureIgnoreCase) {
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


        public BaseServer() {
         
            port = GetAllowPost();//取得能使用的port

            _httpListener.IgnoreWriteExceptions = true;//忽略不可回傳的檔案
            _httpListener.Prefixes.Add("http://localhost:" + port + "/");
            _httpListener.Start(); // start server (Run application as Administrator!)
            _httpListener.BeginGetContext(new AsyncCallback(GetContextCallBack), _httpListener);

            //註冊路由
            RouteAddGet("/aa/bb/{*}", (RequestData d) => {
                byte[] _responseArray = Encoding.UTF8.GetBytes("-" + d.value + "-");
                d.context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length); // write bytes to the output stream
            });
            RouteAddGet("/api/check", api_ckeck);
            RouteAddGet("/api/newWindow/{*}", api_newwindow);
            RouteAddGet("/api/getimg/{*}", api_getimg);
            RouteAddGet("/api/getpdf/{*}", api_getpdf);
            RouteAddGet("/www/{*}", getwww);
            RouteAddGet("/{*}", getwww);
            //RouteAddGet("{*}", get404);
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="ar"></param>
        private void GetContextCallBack(IAsyncResult ar) {

            HttpListener listener = ar.AsyncState as HttpListener;
            HttpListenerContext context = listener.EndGetContext(ar);
            listener.BeginGetContext(new AsyncCallback(GetContextCallBack), listener);
            HttpListenerRequest request = context.Request;

            /*header.Add("Access-Control-Allow-Origin", "*");
            request.Headers.Add(header);*/

            String _url = request.Url.ToString();
            _url = _url.Substring($"http://localhost:{port}".Length);

            Dictionary<string, string> dirArgs = new Dictionary<string, string>();
            int argStart = _url.IndexOf("?");
            if (argStart != -1) {//如果有「?」，就解析傳入參數 
                string[] arArgs = _url.Substring(argStart + 1).Split('&');
                for (int i = 0; i < arArgs.Length; i++) {
                    string item = arArgs[i];
                    int ss = item.IndexOf('=');
                    string key = "";
                    string val = "";
                    if (ss != -1) {
                        key = item.Substring(0, ss);
                        val = item.Substring(ss + 1);
                    } else {
                        key = item;
                        val = "";
                    }
                    if (dirArgs.ContainsKey(key) == false) {
                        dirArgs[key] = val;
                    }
                }

                _url = _url.Substring(0, argStart);//取得「?」前面的文字
            }

            for (int i = 0; i < ArRoute.Count; i++) {//嘗試匹配每一個有註冊的路由
                var requestData = new RequestData();
                requestData.context = context;
                requestData.url = _url;
                requestData.args = dirArgs;
                if (ArRoute[i](requestData) == true) {//如果匹配網址成功，就離開
                    break;
                }
            }

            //context.Response.KeepAlive = true; // set the KeepAlive bool to false
            context.Response.Close(); // close the connection
        }


        /// <summary>
        /// 註冊一個新的路由
        /// </summary>
        /// <param name="_urlFormat">網址匹配規則，無視大小寫，允許在結尾使用「{*}」，表示任何字串</param>
        /// <param name="_func"></param>
        public void RouteAddGet(string _urlFormat, Action<RequestData> _func) {

            var func2 = new Func<RequestData, bool>((RequestData requestData) => {

                //規則字串 
                string pattern = "^" + _urlFormat.Replace("{*}", ".*") + "$"; ;
                //宣告 Regex 忽略大小寫 
                Regex regex = new Regex(pattern, RegexOptions.IgnoreCase);

                if (regex.IsMatch(requestData.url) == true) {

                    if (_urlFormat.IndexOf("{*}") != -1 && requestData.url.Length >= _urlFormat.Length - 3) {
                        String val = requestData.url.Substring(_urlFormat.Length - 3);
                        requestData.value = val;
                    }

                    _func(requestData);
                    return true;
                }

                return false;

            });

            ArRoute.Add(func2);
        }


        /// <summary>
        /// 檢查這個port是否為tiefsee所使用，用於快速啟動
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        private void api_ckeck(RequestData d) {
            byte[] _responseArray = Encoding.UTF8.GetBytes("tiefsee");
            d.context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length); // write bytes to the output stream
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
                WebWindow.Create($"http://localhost:{port}/www/MainWindow.html", args, null);
            });

            byte[] _responseArray = Encoding.UTF8.GetBytes("ok");
            d.context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length); // write bytes to the output stream
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        private void api_getimg(RequestData d) {

            //Console.WriteLine("api/getimg/  " + _path);

            string _path = d.value;

            if (File.Exists(_path) == false) { return; }

            using (Stream input = new FileStream(_path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) {

                d.context.Response.ContentType = _mimeTypeMappings.TryGetValue(Path.GetExtension(_path), out string mime) ? mime : "application/octet-stream";
                d.context.Response.ContentLength64 = input.Length;

                if (isCache == true) {//讓瀏覽器快取檔案
                    string lastModified = File.GetLastWriteTime(_path).ToString("ddd, dd MMM yyy HH':'mm':'ss 'GMT'", new System.Globalization.CultureInfo("en-US"));
                    d.context.Response.Headers.Add("Last-Modified", lastModified);//檔案建立的時間
                    d.context.Response.Headers.Add("Cache-Control", "max-age=31536000");
                }

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
        /// 
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        private void api_getpdf(RequestData d) {

            string _path = d.value;

            if (File.Exists(_path) == false) { return; }

            using (Stream input = new FileStream(_path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) {

                d.context.Response.ContentType = "application/pdf";
                d.context.Response.ContentLength64 = input.Length;

                if (isCache == true) {//讓瀏覽器快取檔案
                    string lastModified = File.GetLastWriteTime(_path).ToString("ddd, dd MMM yyy HH':'mm':'ss 'GMT'", new System.Globalization.CultureInfo("en-US"));
                    d.context.Response.Headers.Add("Last-Modified", lastModified);//檔案建立的時間
                    d.context.Response.Headers.Add("Cache-Control", "max-age=31536000");
                }

                if (d.context.Request.HttpMethod != "HEAD") {
                    byte[] buffer = new byte[1024 * 16];
                    int nbytes;
                    while ((nbytes = input.Read(buffer, 0, buffer.Length)) > 0) {
                        d.context.Response.OutputStream.Write(buffer, 0, nbytes);
                    }
                }
            }
        }


        /// <summary>
        /// 只允許來自 http://localhost:{port} 的請求，其餘的一律回傳400錯誤
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        private bool get400(String _url, HttpListenerContext context) {

            HttpListenerRequest request = context.Request;
            String headersReferer = request.Headers.Get("Referer");

            if (headersReferer != null && (headersReferer.IndexOf("http://localhost:" + port + "/") != 0)) {
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
        }


        /// <summary>
        /// 取得 www 目錄裡面的檔案
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        private void getwww(RequestData d) {

            String exeDir = System.AppDomain.CurrentDomain.BaseDirectory; ;//程式的目錄

            String _path;
            if (d.value.IndexOf("www/") == 0) {
                _path = System.IO.Path.Combine(exeDir, d.value);
            } else {
                _path = System.IO.Path.Combine(exeDir, "www", d.value);
            }

            //如果檔案不存在就返回404錯誤
            if (File.Exists(_path) == false) {
                d.context.Response.StatusCode = 404;
                byte[] _responseArray = Encoding.UTF8.GetBytes("404");
                d.context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length); // write bytes to the output stream
                return;
            }

            using (Stream input = new FileStream(_path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) {

                d.context.Response.ContentType = _mimeTypeMappings.TryGetValue(Path.GetExtension(_path), out string mime) ? mime : "application/octet-stream";
                d.context.Response.ContentLength64 = input.Length;

                if (isCache == true) {//讓瀏覽器快取檔案
                    string lastModified = File.GetLastWriteTime(_path).ToString("ddd, dd MMM yyy HH':'mm':'ss 'GMT'", new System.Globalization.CultureInfo("en-US"));
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

                if (d.context.Request.HttpMethod != "HEAD") {
                    byte[] buffer = new byte[1024 * 16];
                    int nbytes;
                    while ((nbytes = input.Read(buffer, 0, buffer.Length)) > 0) {
                        //context.Response.SendChunked = input.Length > 1024 * 16;
                        d.context.Response.OutputStream.Write(buffer, 0, nbytes);
                    }
                }

                d.context.Response.OutputStream.Flush();
            }

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
        /// 判斷port是否有被佔用
        /// </summary>
        /// <param name="port"></param>
        /// <returns></returns>
        public bool PortInUse(int port) {
            bool inUse = false;
            IPGlobalProperties ipProperties = IPGlobalProperties.GetIPGlobalProperties();
            IPEndPoint[] ipEndPoints = ipProperties.GetActiveTcpListeners();
            foreach (IPEndPoint endPoint in ipEndPoints) {
                if (endPoint.Port == port) {
                    inUse = true;
                    break;
                }
            }
            return inUse;
        }


        /// <summary>
        /// 取得能用的port
        /// </summary>
        /// <returns></returns>
        public int GetAllowPost() {

            IPGlobalProperties ipProperties = IPGlobalProperties.GetIPGlobalProperties();
            IPEndPoint[] ipEndPoints = ipProperties.GetActiveTcpListeners();

            for (int i = Program.startPort; i < 65535; i++) {
                bool inUse = false;
                foreach (IPEndPoint endPoint in ipEndPoints) {
                    if (endPoint.Port == i) {
                        inUse = true;
                        break;
                    }
                }
                if (inUse == false) {
                    return i;
                }
            }

            return 48763;
        }





    }


    /// <summary>
    /// 路由用的資料
    /// </summary>
    public class RequestData {
        public string url = "";
        public string value = "";//取得網址結尾「{*}」實際的字串
        public Dictionary<string, string> args = new Dictionary<string, string>();//「?」後面的參數
        public HttpListenerContext context;
    }
}
