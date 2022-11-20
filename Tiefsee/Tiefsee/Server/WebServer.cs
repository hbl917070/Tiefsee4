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
    public class WebServer {

        public int port;//當前掛載的port
        public string origin;
        public WebServerController controller;
        private HttpListener _httpListener;
        private List<Func<RequestData, bool>> ArRoute = new List<Func<RequestData, bool>>();//路由

        public WebServer() { }


        /// <summary>
        /// 初始化
        /// </summary>
        /// <returns> 初始化成功或失敗 </returns>
        public bool Init() {

            port = GetAllowPost();//取得能使用的port

            for (int i = 0; i < 100; i++) {
                try {
                    port += i;
                    origin = "http://127.0.0.1:" + port + "/";

                    _httpListener = new HttpListener();
                    _httpListener.IgnoreWriteExceptions = true;
                    _httpListener.Prefixes.Add("http://127.0.0.1:" + port + "/");
                    _httpListener.Start();
                    _httpListener.BeginGetContext(new AsyncCallback(GetContextCallBack), _httpListener);
                    controller = new WebServerController(this);

                    break;

                } catch (Exception) { }

                if (i == 99) {
                    return false;
                }
            }

            return true;
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

            //request.Headers.Add("Access-Control-Allow-Origin", "*");

            String _url = request.Url.ToString();
            _url = _url.Substring($"http://127.0.0.1:{port}".Length);

            //禁止webview2以外的請求
            if (request.UserAgent != Program.webvviewUserAgent) {
                context.Response.StatusCode = 403;//狀態
                context.Response.AddHeader("Content-Type", "text/text; charset=utf-8");//設定編碼
                byte[] _responseArray = Encoding.UTF8.GetBytes("403");
                context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length);

                context.Response.Close(); // close the connection
                return;
            }

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

            var requestData = new RequestData();
            requestData.context = context;
            requestData.url = _url;
            requestData.args = dirArgs;

            try {
                for (int i = 0; i < ArRoute.Count; i++) {//嘗試匹配每一個有註冊的路由 
                    if (ArRoute[i](requestData) == true) {//如果匹配網址成功，就離開
                        break;
                    }
                }
            } catch (Exception e) {
                //狀態500、回傳錯誤訊息的文字
                context.Response.StatusCode = 500;
                context.Response.AddHeader("Content-Type", "text/text; charset=utf-8");//設定編碼
                byte[] _responseArray = Encoding.UTF8.GetBytes(e.ToString());
                context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length);

                Console.WriteLine(e.ToString());
            }

            //context.Response.KeepAlive = true; // set the KeepAlive bool to false
            context.Response.Close(); // close the connection
        }


        /// <summary>
        /// 註冊一個新的路由
        /// </summary>
        /// <param name="_urlFormat">網址匹配規則，無視大小寫，允許在結尾使用「{*}」，表示任何字串</param>
        /// <param name="_func"></param>
        public void RouteAdd(string _urlFormat, Action<RequestData> _func) {

            var func2 = new Func<RequestData, bool>((RequestData requestData) => {

                //規則字串 
                string pattern = "^" + _urlFormat.Replace("{*}", ".*") + "$";
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
        public string postData {
            get {
                using (var reader = new StreamReader(context.Request.InputStream, Encoding.UTF8)) {
                    return reader.ReadToEnd();
                }
            }
        }

    }
}
