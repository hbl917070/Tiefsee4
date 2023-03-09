using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Runtime.Remoting.Contexts;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Media.Imaging;


namespace Tiefsee {
    public class WebServerController {

        WebServer webServer;
        private int CacheTime = 0;//靜態資源快取的時間


        public WebServerController(WebServer _webServer) {

            webServer = _webServer;

            //註冊路由
            /*webServer.RouteAddGet("/aa/bb/{*}", (RequestData d) => {
                byte[] _responseArray = Encoding.UTF8.GetBytes("-" + d.value + "-");
                d.context.Response.OutputStream.Write(_responseArray, 0, _responseArray.Length); // write bytes to the output stream
            });*/
            webServer.RouteAdd("/api/check", ckeck);
            webServer.RouteAdd("/api/newWindow", newWindow);

            webServer.RouteAdd("/api/getExif", getExif);
            webServer.RouteAdd("/api/getPdf", getPdf);
            webServer.RouteAdd("/api/getText", getText);
            webServer.RouteAdd("/api/getFileIcon", getFileIcon);
            webServer.RouteAdd("/api/getFileInfo2", getFileInfo2);
            webServer.RouteAdd("/api/getFileInfo2List", getFileInfo2List);

            webServer.RouteAdd("/api/sort", sort);
            webServer.RouteAdd("/api/sort2", sort2);

            webServer.RouteAdd("/api/directory/getSiblingDir", getSiblingDir);
            webServer.RouteAdd("/api/directory/getFiles2", getFiles2);
            webServer.RouteAdd("/api/directory/getFiles", getFiles);
            webServer.RouteAdd("/api/directory/getDirectories", getDirectories);

            //webServer.RouteAddGet("/api/getImg/file/{*}", getImg);
            webServer.RouteAdd("/api/img/magick", magick);
            webServer.RouteAdd("/api/img/dcraw", dcraw);
            webServer.RouteAdd("/api/img/wpf", wpf);
            webServer.RouteAdd("/api/img/webIcc", webIcc);
            webServer.RouteAdd("/api/img/nconvert", nconvert);
            webServer.RouteAdd("/api/img/vipsInit", vipsInit);
            webServer.RouteAdd("/api/img/vipsResize", vipsResize);
            webServer.RouteAdd("/api/img/clip", clip);
            webServer.RouteAdd("/api/img/extractPng", extractPng);


            webServer.RouteAdd("/www/{*}", getWww);
            webServer.RouteAdd("/{*}", getWww);
        }


        #region web API

        /// <summary>
        /// 取得檔案的Exif資訊
        /// </summary>
        void getExif(RequestData d) {

            int maxLength = int.Parse(d.args["maxLength"]);
            string path = d.args["path"];
            path = Uri.UnescapeDataString(path);

            //如果檔案不存在就返回404錯誤
            if (File.Exists(path) == false) {
                d.context.Response.StatusCode = 404;
                WriteString(d, JsonConvert.SerializeObject(new ImgExif()));
                return;
            }

            //bool is304 = HeadersAdd304(d, path);//回傳檔案時加入快取的Headers
            //if (is304) { return; }

            string json = Exif.GetExif(path, maxLength);

            WriteString(d, json);
        }


        /// <summary>
        /// 產生圖片暫存並且返回圖片的長寬
        /// </summary>
        void vipsInit(RequestData d) {

            string json = "";
            ImgInitInfo imgInfo = new ImgInitInfo();

            string path = d.args["path"];
            string[] arType = d.args["type"].Split(',');//使用什麼方式處理圖片
            //string outputOriginalFile = d.args["outputOriginalFile"];//是否直接回傳原檔

            path = Uri.UnescapeDataString(path);

            if (File.Exists(path) == false) {//檔案不存在
                json = JsonConvert.SerializeObject(new ImgInitInfo());
                WriteString(d, json);//回傳
                return;
            }

            //bool is304 = HeadersAdd304(d, path);//回傳檔案時加入快取的Headers
            //if (is304 == true) { return; }

            for (int i = 0; i < arType.Length; i++) {
                string type = arType[i];

                try {
                    imgInfo = ImgLib.GetImgInitInfo(path, type);
                } catch (Exception e) {
                    Console.WriteLine("解析圖片失敗-------------");
                    Console.WriteLine($"type:{type}  path:{path}");
                    Console.WriteLine(e.ToString());
                    //imgInfo.msg = e.ToString();
                }

                if (imgInfo.width != 0) {
                    break;
                }
            }

            json = JsonConvert.SerializeObject(imgInfo);
            WriteString(d, json);//回傳輸出的檔案路徑
        }


        /// <summary>
        /// 縮放圖片，並且存入暫存資料夾(必須於vipsInit之後使用)
        /// </summary>
        void vipsResize(RequestData d) {
            string path = d.args["path"];
            double scale = Double.Parse(d.args["scale"]);

            path = Uri.UnescapeDataString(path);

            bool is304 = HeadersAdd304(d, path);//回傳檔案時加入快取的Headers
            if (is304) { return; }

            string imgPath = ImgLib.VipsResize(path, scale);
            WriteFile(d, imgPath);//回傳檔案
        }


        /// <summary>
        /// 
        /// </summary>
        void nconvert(RequestData d) {

            string type = d.args["type"];
            string path = d.args["path"];
            path = Uri.UnescapeDataString(path);
            if (File.Exists(path) == false) { return; }
            //string contentType = "";
            //bool is304 = HeadersAdd304(d, path);//回傳檔案時加入快取的Headers
            //if (is304 == true) { return; }

            string imgPath;
            if (type == "png") {
                imgPath = ImgLib.Nconvert_PathToPath(path, false, "png");
            } else {
                imgPath = ImgLib.Nconvert_PathToPath(path, false, "bmp");
            }
            WriteString(d, imgPath);//回傳輸出的檔案路徑
        }


        /// <summary>
        /// 
        /// </summary>
        void magick(RequestData d) {

            string type = d.args["type"];
            string path = d.args["path"];
            path = Uri.UnescapeDataString(path);
            if (File.Exists(path) == false) { return; }

            bool is304 = HeadersAdd304(d, path);//回傳檔案時加入快取的Headers
            if (is304 == true) { return; }

            //d.context.Response.ContentType = "image/bmp";
            using (Stream stream = ImgLib.MagickImage_PathToStream(path, type)) {
                WriteStream(d, stream); //回傳檔案
            }
        }


        /// <summary>
        /// 
        /// </summary>
        void wpf(RequestData d) {

            string path = d.args["path"];
            path = Uri.UnescapeDataString(path);
            if (File.Exists(path) == false) { return; }

            bool is304 = HeadersAdd304(d, path);//回傳檔案時加入快取的Headers
            if (is304 == true) { return; }

            d.context.Response.ContentType = "image/bmp";
            using (Stream stream = ImgLib.Wpf_PathToStream(path)) {
                WriteStream(d, stream); //回傳檔案
            }
        }


        /// <summary>
        /// 如果檔案的ICC Profile為CMYK，則先使用WPF處理圖片
        /// </summary>
        void webIcc(RequestData d) {

            string path = d.args["path"];
            path = Uri.UnescapeDataString(path);
            if (File.Exists(path) == false) { return; }

            bool is304 = HeadersAdd304(d, path);//回傳檔案時加入快取的Headers
            if (is304 == true) { return; }

            if (ImgLib.IsCMYK(path)) {//檢查檔案是否為 CMYK
                d.context.Response.ContentType = "image/bmp";
                using (Stream stream = ImgLib.Wpf_PathToStream(path)) {
                    WriteStream(d, stream); //回傳檔案
                }
            } else {
                WriteFile(d, path);//回傳檔案
            }

        }


        /// <summary>
        /// 
        /// </summary>
        void dcraw(RequestData d) {
            string path = d.args["path"];
            path = Uri.UnescapeDataString(path);
            if (File.Exists(path) == false) { return; }
            d.context.Response.ContentType = "image/bmp";
            bool is304 = HeadersAdd304(d, path);//回傳檔案時加入快取的Headers
            if (is304 == true) { return; }

            using (Stream stream = ImgLib.Dcraw_PathToStream(path, true, 800)) {
                WriteStream(d, stream); //回傳檔案
            }
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="d"></param>
        void clip(RequestData d) {

            string path = d.args["path"];
            path = Uri.UnescapeDataString(path);
            if (File.Exists(path) == false) { return; }
            bool is304 = HeadersAdd304(d, path);//回傳檔案時加入快取的Headers
            if (is304 == true) { return; }

            using (Stream stream = ImgLib.ClipToStream(path)) {
                WriteStream(d, stream); //回傳檔案
            }
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="d"></param>
        void extractPng(RequestData d) {

            string path = d.args["path"];
            path = Uri.UnescapeDataString(path);
            if (File.Exists(path) == false) { return; }
            bool is304 = HeadersAdd304(d, path);//回傳檔案時加入快取的Headers
            if (is304 == true) { return; }

            using (Stream stream = ImgLib.ExtractPngToStream(path)) {
                WriteStream(d, stream); //回傳檔案
            }
        }


        /// <summary>
        /// 檢查這個port是否為tiefsee所使用，用於快速啟動
        /// </summary>
        private void ckeck(RequestData d) {
            WriteString(d, "tiefsee");
        }


        /// <summary>
        /// 新開一個視窗，用於快速啟動
        /// </summary>
        private void newWindow(RequestData d) {

            string arg = Uri.UnescapeDataString(d.args["path"]);//將字串剖析回命令列參數
            string[] args = arg.Split('\n');

            Adapter.UIThread(() => {
                WebWindow.Create("MainWindow.html", args, null);
            });

            WriteString(d, "ok");
        }


        /// <summary>
        /// 
        /// </summary>
        private void getImg(RequestData d) {
            string path = d.value;
            if (File.Exists(path) == false) { return; }
            d.context.Response.ContentType = _mimeTypeMappings.TryGetValue(Path.GetExtension(path), out string mime) ? mime : "application/octet-stream";
            bool is304 = HeadersAdd304(d, path);//回傳檔案時加入快取的Headers
            if (is304 == false) {
                WriteFile(d, path);//回傳檔案
            }
        }


        /// <summary>
        /// 
        /// </summary>
        private void getPdf(RequestData d) {
            string path = d.args["path"];
            path = Uri.UnescapeDataString(path);
            if (File.Exists(path) == false) { return; }
            d.context.Response.ContentType = "application/pdf";
            bool is304 = HeadersAdd304(d, path);//回傳檔案時加入快取的Headers
            if (is304 == false) {
                WriteFile(d, path);//回傳檔案
            }
        }


        /// <summary>
        /// 取得檔案的Exif資訊
        /// </summary>
        void getText(RequestData d) {

            string path = d.args["path"];
            path = Uri.UnescapeDataString(path);

            //如果檔案不存在就返回404錯誤
            if (File.Exists(path) == false) {
                d.context.Response.StatusCode = 404;
                WriteString(d, JsonConvert.SerializeObject(new ImgExif()));
                return;
            }

            bool is304 = HeadersAdd304(d, path);//回傳檔案時加入快取的Headers
            if (is304) { return; }

            string ret = "";
            using (StreamReader sr = new StreamReader(path, Encoding.UTF8)) {
                ret = sr.ReadToEnd();
            }

            WriteString(d, ret);
        }


        /// <summary>
        /// 
        /// </summary>
        private void getFileIcon(RequestData d) {
            Dictionary<string, string> args = d.args;

            int size = Int32.Parse(args["size"]);
            string path = Uri.UnescapeDataString(args["path"]);

            //如果檔案不存在就返回404錯誤
            if (File.Exists(path) == false) {
                d.context.Response.StatusCode = 404;
                WriteString(d, "404");
                return;
            }

            d.context.Response.ContentType = "image/png";
            bool is304 = HeadersAdd304(d, path);//回傳檔案時加入快取的Headers
            if (is304 == false) {

                try {
                    System.Drawing.Bitmap icon = WindowsThumbnailProvider.GetThumbnail(
                        path, size, size, ThumbnailOptions.ScaleUp
                    );

                    using (System.IO.Stream input = new MemoryStream()) {

                        icon.Save(input, System.Drawing.Imaging.ImageFormat.Png);
                        input.Position = 0;

                        d.context.Response.ContentLength64 = input.Length;

                        if (d.context.Request.HttpMethod != "HEAD") {
                            byte[] buffer = new byte[1024 * 16];
                            int nbytes;
                            while ((nbytes = input.Read(buffer, 0, buffer.Length)) > 0) {
                                //context.Response.SendChunked = input.Length > 1024 * 16;
                                d.context.Response.OutputStream.Write(buffer, 0, nbytes);
                            }
                        }
                    }
                    icon.Dispose();
                    //WriteFile(d, path);//回傳檔案
                } catch {
                    d.context.Response.StatusCode = 500;
                    WriteString(d, "500");
                }

            }
        }


        /// <summary>
        /// 
        /// </summary>
        private void getFileInfo2(RequestData d) {
            string path = d.args["path"];
            path = Uri.UnescapeDataString(path);

            WV_File wvf = new WV_File();
            string srtStrJson = wvf.GetFileInfo2(path);
            //string srtStrJson = JsonConvert.SerializeObject(fileInfo2);
            WriteString(d, srtStrJson);//回傳
        }

        /// <summary>
        /// 
        /// </summary>
        private void getFileInfo2List(RequestData d) {

            //string path = d.args["path"];
            //path = Uri.UnescapeDataString(path);

            string postData = d.postData;
            var json = JObject.Parse(postData);

            string[] ar = json["ar"].ToObject<string[]>();
            WV_File wvf = new WV_File();
            FileInfo2[] arFileInfo2 = new FileInfo2[ar.Length];
            for (int i = 0; i < ar.Length; i++) {
                string path = ar[i];
                arFileInfo2[i] = wvf._GetFileInfo2(path);
            }

            string srtStrJson = JsonConvert.SerializeObject(arFileInfo2);
            WriteString(d, srtStrJson);//回傳
        }


        /// <summary>
        /// 
        /// </summary>
        private void sort(RequestData d) {
            string postData = d.postData;
            var json = JObject.Parse(postData);
            string[] ar = json["ar"].ToObject<string[]>();
            string type = json["type"].ToString();

            var filesort = new FileSort();
            string[] retAr = filesort.Sort(ar, type);
            string srtStrJson = JsonConvert.SerializeObject(retAr);
            WriteString(d, srtStrJson);//回傳
        }


        /// <summary>
        /// 
        /// </summary>
        private void sort2(RequestData d) {
            string postData = d.postData;
            var json = JObject.Parse(postData);
            string dir = json["dir"].ToString();
            string[] ar = json["ar"].ToObject<string[]>();
            string type = json["type"].ToString();

            var filesort = new FileSort();
            string[] retAr = filesort.Sort2(dir, ar, type);
            string srtStrJson = JsonConvert.SerializeObject(retAr);
            WriteString(d, srtStrJson);//回傳
        }


        #region Directory

        /// <summary>
        /// 取得跟自己同層的資料夾內的檔案資料(自然排序的前5筆)
        /// </summary>
        private void getSiblingDir(RequestData d) {

            var json = JObject.Parse(d.postData);
            string path = json["path"].ToString();
            string[] arExt = json["arExt"].ToObject<string[]>();
            int maxCount = json["maxCount"].ToObject<int>();

            var wvdir = new WV_Directory();
            string srtStrJson = wvdir.GetSiblingDir(path, arExt, maxCount);

            //string srtStrJson = JsonConvert.SerializeObject(retAr);
            WriteString(d, srtStrJson);//回傳
        }


        /// <summary>
        /// 檔名陣列 轉 路徑陣列 (用於載入複數檔案
        /// </summary>
        private void getFiles2(RequestData d) {

            var json = JObject.Parse(d.postData);
            string dirPath = json["dirPath"].ToString();
            string[] arName = json["arName"].ToObject<string[]>();

            var wvdir = new WV_Directory();
            string[] retAr = wvdir.GetFiles2(dirPath, arName);
            int pathLen = dirPath.Length;//只回傳檔名，減少傳輸成本
            for (int i = 0; i < retAr.Length; i++) {
                retAr[i] = retAr[i].Substring(pathLen);
            }

            string srtStrJson = JsonConvert.SerializeObject(retAr);
            WriteString(d, srtStrJson);//回傳
        }


        /// <summary>
        /// 回傳資料夾裡面的檔案
        /// </summary>
        private void getFiles(RequestData d) {

            var json = JObject.Parse(d.postData);
            string path = json["path"].ToString();
            string searchPattern = json["searchPattern"].ToString();

            /*string[] retAr = Directory.GetFiles(path, searchPattern);
            int pathLen = path.Length;//只回傳檔名，減少傳輸成本
            for (int i = 0; i < retAr.Length; i++) {
                retAr[i] = retAr[i].Substring(pathLen);
            }*/
            int pathLen = path.Length; //只回傳檔名，減少傳輸成本
            string[] retAr = Directory.EnumerateFiles(path, searchPattern)
                          .Select(filePath => filePath.Substring(pathLen)).ToArray();

            string srtStrJson = JsonConvert.SerializeObject(retAr);
            WriteString(d, srtStrJson);//回傳
        }


        /// <summary>
        /// 回傳資料夾裡面的子資料夾
        /// </summary>
        private void getDirectories(RequestData d) {

            var json = JObject.Parse(d.postData);
            string path = (json["path"]).ToString();
            string searchPattern = json["searchPattern"].ToString();

            string[] retAr = Directory.GetDirectories(path, searchPattern);
            int pathLen = path.Length;//只回傳檔名，減少傳輸成本
            for (int i = 0; i < retAr.Length; i++) {
                retAr[i] = retAr[i].Substring(pathLen);
            }

            string srtStrJson = JsonConvert.SerializeObject(retAr);
            WriteString(d, srtStrJson);//回傳
        }


        #endregion


        /// <summary>
        /// 取得 www 目錄裡面的檔案
        /// </summary>
        private void getWww(RequestData d) {

            String exeDir = System.AppDomain.CurrentDomain.BaseDirectory;//程式的目錄

            String path;
            if (d.value.IndexOf("www/") == 0) {
                path = System.IO.Path.Combine(exeDir, d.value);
            } else {
                path = System.IO.Path.Combine(exeDir, "www", d.value);
            }

            //如果檔案不存在就返回404錯誤
            if (File.Exists(path) == false) {
                d.context.Response.StatusCode = 404;
                WriteString(d, "404");
                return;
            }

            d.context.Response.ContentType = _mimeTypeMappings.TryGetValue(Path.GetExtension(path), out string mime) ? mime : "application/octet-stream";
            bool is304 = HeadersAdd304(d, path);//回傳檔案時加入快取的Headers
            //d.context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
            if (is304 == false) {
                WriteFile(d, path);//回傳檔案
            }
        }


        #endregion


        /// <summary>
        /// 回傳檔案時加入快取的Headers
        /// </summary>
        /// <param name="d"></param>
        /// <param name="path"></param>
        /// <returns> true=304 false=正常回傳檔案</returns>
        private bool HeadersAdd304(RequestData d, string path) {

            DateTime dt = File.GetLastWriteTime(path);
            string lastModified = dt.ToString("ddd, dd MMM yyy HH':'mm':'ss 'GMT'", new System.Globalization.CultureInfo("en-US"));
            string etag = dt.ToFileTimeUtc().ToString();

            d.context.Response.Headers.Add("Last-Modified", lastModified);//檔案建立的時間
            d.context.Response.Headers.Add("ETag", etag);//瀏覽器用來判斷資源是否有更新的key
            d.context.Response.Headers.Add("Cache-Control", "public, max-age=" + CacheTime); //讓瀏覽器快取檔案

            if (d.context.Request.Headers["If-None-Match"] == etag) {//表示瀏覽器還留有暫存，狀態304後，不用回傳任何資料
                d.context.Response.StatusCode = 304;
                return true;
            }

            return false;
        }


        /// <summary>
        /// 設定是否對靜態資源使用快取
        /// </summary>
        /// <param name="time"> 秒數</param>
        public void SetCacheTime(int time) {
            if (time <= 0) { time = 0; }
            if (time >= 31536000) { time = 31536000; }//一年
            CacheTime = time;
        }


        /// <summary>
        /// 回傳字串
        /// </summary>
        /// <param name="context"></param>
        /// <param name="str"></param>
        private void WriteString(RequestData d, string str) {
            d.context.Response.AddHeader("Content-Type", "text/text; charset=utf-8");//設定編碼
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
        /// 
        /// </summary>
        /// <param name="d"></param>
        /// <param name="ms"></param>
        void WriteStream(RequestData d, Stream ms) {

            using (var input = ms) {
                //回傳檔案
                d.context.Response.ContentLength64 = input.Length;
                if (d.context.Request.HttpMethod != "HEAD") {
                    byte[] buffer = new byte[1024 * 16];
                    int nbytes;
                    while ((nbytes = input.Read(buffer, 0, buffer.Length)) > 0) {
                        d.context.Response.OutputStream.Write(buffer, 0, nbytes);
                    }
                }
            }
        }



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
