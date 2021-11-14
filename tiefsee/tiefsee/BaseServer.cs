using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Text;
using System.Threading.Tasks;

namespace tiefsee {

    public class BaseServer {

        public int port;
        HttpListener _httpListener = new HttpListener();
        String exeDir = "";

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

            exeDir = System.AppDomain.CurrentDomain.BaseDirectory;
            port = getAllowPost();//取得能使用的port

            _httpListener.IgnoreWriteExceptions = true;//忽略不可回傳的檔案

            _httpListener.Prefixes.Add("http://localhost:" + port + "/"); //
            _httpListener.Start(); // start server (Run application as Administrator!)

            _httpListener.BeginGetContext(new AsyncCallback(GetContextCallBack), _httpListener);

            /*Console.WriteLine("Server started.   " + port);
            Thread _responseThread = new Thread(ResponseThread);
            _responseThread.Start(); // start the response thread*/
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
            var header = new System.Collections.Specialized.NameValueCollection();
            String _url = request.Url.ToString();
            _url = _url.Replace("http://localhost:" + port + "/", "");

            // 
            // Console.WriteLine(_url);

            /*header.Add("Access-Control-Allow-Origin", "*");
            header.Add("Access-Control-Allow-Methods", "GET,POST");
            header.Add("Access-Control-Allow-Headers", "Content-Type, Accept, X-Requested-With");
            header.Add("Access-Control-Max-Age", "1728000");
            request.Headers.Add(header);*/

            if (get400(_url, context)) {
            } else if (api_getimg(_url, context)) {
            } else if (api_getpdf(_url, context)) {
            } else if (getwww(_url, context)) {
            } else {
                get404(_url, context);
            }



            context.Response.KeepAlive = false; // set the KeepAlive bool to false
            context.Response.Close(); // close the connection

            //Console.WriteLine(_url);

        }




        private bool api_getimg(String _url, HttpListenerContext context) {

            if (_url.IndexOf("api/getimg/") != 0) {
                return false;
            }

            String _path = _url.Substring(11);
            _path = _path.Split('?')[0];//去掉?後面的文字
            _path = Uri.UnescapeDataString(_path);

            Console.WriteLine("api/getimg/  " + _path);

            if (File.Exists(_path)) {

                using (Stream input = new FileStream(_path, FileMode.Open)) {

                    context.Response.ContentType = _mimeTypeMappings.TryGetValue(Path.GetExtension(_path), out string mime) ? mime : "application/octet-stream";
                    context.Response.ContentLength64 = input.Length;

                    if (context.Request.HttpMethod != "HEAD") {
                        byte[] buffer = new byte[1024 * 16];
                        int nbytes;
                        while ((nbytes = input.Read(buffer, 0, buffer.Length)) > 0) {
                            //context.Response.SendChunked = input.Length > 1024 * 16;
                            context.Response.OutputStream.Write(buffer, 0, nbytes);
                        }
                    }
                    //context.Response.StatusCode = (int)HttpStatusCode.OK;
                    //context.Response.OutputStream.Flush();
                }
                return true;
                /*using (FileStream fs = new FileStream(_path, FileMode.Open, FileAccess.Read)) {
                    byte[] _responseArray = new byte[fs.Length];
                    fs.Read(_responseArray, 0, _responseArray.Length);
                    fs.Close();
                    context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length); // write bytes to the output stream

                }*/

            } else {
                return false;
            }



        }




        private bool api_getpdf(String _url, HttpListenerContext context) {

            if (_url.IndexOf("api/getpdf/") != 0) {
                return false;
            }

            String _path = _url.Substring(11);
            _path = _path.Split('?')[0];//去掉?後面的文字
            _path = Uri.UnescapeDataString(_path);

            Console.WriteLine("api/getpdf/  " + _path);

            if (File.Exists(_path)) {

                using (Stream input = new FileStream(_path, FileMode.Open)) {

                    //context.Response.ContentType = _mimeTypeMappings.TryGetValue(Path.GetExtension(_path), out string mime) ? mime : "application/octet-stream";
                    context.Response.ContentType = "application/pdf";
                    context.Response.ContentLength64 = input.Length;

                    if (context.Request.HttpMethod != "HEAD") {
                        byte[] buffer = new byte[1024 * 16];
                        int nbytes;
                        while ((nbytes = input.Read(buffer, 0, buffer.Length)) > 0) {
                            //context.Response.SendChunked = input.Length > 1024 * 16;
                            context.Response.OutputStream.Write(buffer, 0, nbytes);
                        }
                    }
                    //context.Response.StatusCode = (int)HttpStatusCode.OK;
                    //context.Response.OutputStream.Flush();
                }
                return true;
                /*using (FileStream fs = new FileStream(_path, FileMode.Open, FileAccess.Read)) {
                    byte[] _responseArray = new byte[fs.Length];
                    fs.Read(_responseArray, 0, _responseArray.Length);
                    fs.Close();
                    context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length); // write bytes to the output stream

                }*/

            } else {
                return false;
            }



        }


        /// <summary>
        /// 只允許來自 http://localhost:{port} 的請求，其餘的一律回傳400錯誤
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        private bool get400(String _url, HttpListenerContext context) {

            //如果是html檔，就不判斷
            String _path = _url.Split('?')[0];//去掉?後面的文字
            String filenameExtension = "";
            if (_path.Length > 5) {
                filenameExtension = _path.Substring(_path.Length - 5).ToLower();
                return false;
            }

            HttpListenerRequest request = context.Request;
            String headersReferer = request.Headers.Get("Referer");

            if (headersReferer == null || (headersReferer.IndexOf("http://localhost:" + port + "/") != 0)) {

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
        private bool get404(String _url, HttpListenerContext context) {

            context.Response.StatusCode = 404;

            byte[] _responseArray = Encoding.UTF8.GetBytes("404");
            context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length); // write bytes to the output stream
            return true;
        }


        /// <summary>
        /// 取得 www 目錄裡面的檔案
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        private bool getwww(String _url, HttpListenerContext context) {


            String _path;

            if (_url.IndexOf("www/") != 0) {
                _path = System.IO.Path.Combine(exeDir, "www", _url);
            } else {
                _path = System.IO.Path.Combine(exeDir, _url);
            }

            _path = _path.Split('?')[0];//去掉?後面的文字
            if (File.Exists(_path)) {
                //Console.WriteLine("file");
                /*using (FileStream fs = new FileStream(_path, FileMode.Open, FileAccess.Read)) {
                    byte[] _responseArray = new byte[fs.Length];
                    fs.Read(_responseArray, 0, _responseArray.Length);
                    fs.Close();
                    context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length); // write bytes to the output stream
                }*/

                using (Stream input = new FileStream(_path, FileMode.Open)) {

                    context.Response.ContentType = _mimeTypeMappings.TryGetValue(Path.GetExtension(_path), out string mime) ? mime : "application/octet-stream";
                    context.Response.ContentLength64 = input.Length;

                    if (context.Request.HttpMethod != "HEAD") {
                        byte[] buffer = new byte[1024 * 16];
                        int nbytes;
                        while ((nbytes = input.Read(buffer, 0, buffer.Length)) > 0) {
                            //context.Response.SendChunked = input.Length > 1024 * 16;
                            context.Response.OutputStream.Write(buffer, 0, nbytes);
                        }
                    }
                    //context.Response.StatusCode = (int)HttpStatusCode.OK;
                    //context.Response.OutputStream.Flush();
                }

                return true;
            }

            return false;
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

            foreach (IPEndPoint endPoint in ipEndPoints) { // www.jbxue.com
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
        public int getAllowPost() {

            IPGlobalProperties ipProperties = IPGlobalProperties.GetIPGlobalProperties();
            IPEndPoint[] ipEndPoints = ipProperties.GetActiveTcpListeners();

            for (int i = 55444; i < 65535; i++) {
                bool inUse = false;
                foreach (IPEndPoint endPoint in ipEndPoints) { // www.jbxue.com
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



        //棄用
        void ResponseThread() {
            while (true) {

                HttpListenerContext context = _httpListener.GetContext(); // get a context
                HttpListenerRequest request = context.Request;
                var header = new System.Collections.Specialized.NameValueCollection();
                header.Add("Access-Control-Allow-Origin", "*");
                header.Add("Access-Control-Allow-Methods", "GET,POST");
                header.Add("Access-Control-Allow-Headers", "Content-Type, Accept, X-Requested-With");
                header.Add("Access-Control-Max-Age", "1728000");

                request.Headers.Add(header);
                // Now, you'll find the request URL in context.Request.Url
                //byte[] _responseArray = Encoding.UTF8.GetBytes("<html><head><title>Localhost server -- port 5000</title></head>" + 
                //    "<body>Welcome to the <strong>Localhost server</strong> -- <em>port 5000!<h1>" + request.Url.ToString() + "</h1></em></body></html>"); // get the bytes to response

                String path = request.Url.ToString();
                path = @"D:\桌面\LocalServerInCsharp\LocalServerInCsharp\bin\Debug\" + path.Replace("http://localhost:" + port + "/", "");
                byte[] _responseArray = new byte[0];

                if (File.Exists(path)) {
                    Console.WriteLine("file");
                    using (FileStream fs = new FileStream(path, FileMode.Open, FileAccess.Read)) {
                        _responseArray = new byte[fs.Length];
                        fs.Read(_responseArray, 0, _responseArray.Length);
                        fs.Close();
                    }
                }

                context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length); // write bytes to the output stream
                context.Response.KeepAlive = false; // set the KeepAlive bool to false
                context.Response.Close(); // close the connection

                Console.WriteLine(path);
            }
        }

    }
}
