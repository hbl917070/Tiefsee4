using ImageMagick;
using MetadataExtractor;
using MetadataExtractor.Formats.Exif;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
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
            webServer.RouteAddGet("/api/check", ckeck);
            webServer.RouteAddGet("/api/newWindow", newWindow);
            webServer.RouteAddGet("/api/getPdf", getPdf);
            webServer.RouteAddGet("/api/getFileIcon", getFileIcon);

            //webServer.RouteAddGet("/api/getImg/file/{*}", getImg);
            webServer.RouteAddGet("/api/getImg/magick", magick);
            webServer.RouteAddGet("/api/getImg/dcraw", dcraw);
            webServer.RouteAddGet("/api/getImg/wpf", wpf);
            webServer.RouteAddGet("/api/getImg/webIcc", webIcc);
            webServer.RouteAddGet("/api/getImg/nconvert", nconvert);

            webServer.RouteAddGet("/api/vips/init", vipsInit);
            webServer.RouteAddGet("/api/vips/resize", vipsResize);

            webServer.RouteAddGet("/api/getImgExif", getImgExif);

            webServer.RouteAddGet("/www/{*}", getWww);
            webServer.RouteAddGet("/{*}", getWww);
        }



        #region web API

        class ImgExif {
            public string code = "0";
            public List<ImgExifItem> data = new List<ImgExifItem>();
        }
        class ImgExifItem {
            public string group = "";
            public string name = "";
            public string value = "";
        }

        private string OrientationToString(int orientation) {
            if (orientation == 1) { return "0°"; }
            if (orientation == 2) { return "0°, mirrored"; }
            if (orientation == 3) { return "180°"; }
            if (orientation == 4) { return "180°, mirrored"; }
            if (orientation == 5) { return "90, mirrored°"; }
            if (orientation == 6) { return "270°"; }
            if (orientation == 7) { return "270°, mirrored"; }
            if (orientation == 8) { return "90°"; }
            return "undefined";
        }


        /// <summary>
        /// 曝光時間
        /// </summary>
        private string ExposureTimeToString(string val) {

            //if (val == "0") { return val; }
            string[] ar = val.Split('/');
            if (ar.Length == 1) {
                return val + " sec";
            }

            try {
                double n1 = Double.Parse(ar[0].Trim());
                double n2 = Double.Parse(ar[1].Trim());
                double n3 = 1 / (n1 / n2);
                float n4 = (float)decimal.Round((decimal)n3, 1);//小數兩位
                return "1/" + n4 + " sec";
            } catch (Exception) {
            }
            return "0";
        }

        /// <summary>
        /// 曝光補償
        /// </summary>
        private string ExposureBiasToString(string val) {

            //if (val == "0") { return val; }
            string[] ar = val.Split('/');
            if (ar.Length == 1) {
                return val;
            }

            try {
                double n1 = Double.Parse(ar[0].Trim());
                double n2 = Double.Parse(ar[1].Trim());
                double n3 = n1 / n2;
                float n4 = (float)decimal.Round((decimal)n3, 2);//小數兩位
                if (n4 > 0) {
                    return "+" + n4 + " EV";
                } else {
                    return "" + n4 + " EV";
                }
            } catch (Exception) {
            }
            return "0";
        }




        void getImgExif(RequestData d) {

            string path = d.args["path"];
            path = Uri.UnescapeDataString(path);

            /*var json = new { 
                code:1,
                data:[]
            };*/

            //如果檔案不存在就返回404錯誤
            if (File.Exists(path) == false) {
                d.context.Response.StatusCode = 404;
                WriteString(d, JsonConvert.SerializeObject(new ImgExif()));
                return;
            }

            //bool is304 = HeadersAdd304(d, path);//回傳檔案時加入快取的Headers
            //if (is304) { return; }

            ImgExif exif = new ImgExif();

            exif.data.Add(new ImgExifItem {//檔案建立時間
                group = "base",
                name = "Crea tionTime",
                value = File.GetCreationTime(path).ToString("yyyy/MM/dd HH:mm:ss")
            });
            exif.data.Add(new ImgExifItem {//檔案最後修改時間
                group = "base",
                name = "Last WriteTime",
                value = File.GetLastWriteTime(path).ToString("yyyy/MM/dd HH:mm:ss")
            });
            exif.data.Add(new ImgExifItem {//檔案size
                group = "base",
                name = "Length",
                value = new FileInfo(path).Length.ToString()
            });
            string w = "";
            string h = "";

            try {
                IEnumerable<MetadataExtractor.Directory> directories = MetadataExtractor.ImageMetadataReader.ReadMetadata(path);
                foreach (var directory in directories) {
                    foreach (var tag in directory.Tags) {

                        string group = directory.Name;
                        string name = tag.Name;
                        string value = tag.Description;
                        int tagType = tag.Type;

                        if (name == "Red TRC" || name == "Green TRC" || name == "Blue TRC") {
                            continue;
                        }
                        //sum += ($"{directory.Name} - {tag.Name} = {tag.Description}")+"\n";
                        if (tagType == ExifDirectoryBase.TagOrientation) {//旋轉方向
                            int orientation = directory.TryGetInt32(tag.Type, out int v) ? v : -1;
                            exif.data.Add(new ImgExifItem {
                                group = group,
                                name = name,
                                value = OrientationToString(orientation)
                            });
                        } else if (tagType == ExifDirectoryBase.TagDateTimeOriginal) {//拍攝時間
                            exif.data.Add(new ImgExifItem {
                                group = group,
                                name = name,
                                value = (directory.TryGetDateTime(tag.Type, out DateTime v) ? v : new DateTime(1970, 1, 1)).ToString("yyyy/MM/dd HH:mm:ss")
                            });
                        } else if (tagType == ExifDirectoryBase.TagExposureBias) {//曝光補償
                            string val = directory.GetString(tag.Type);
                            exif.data.Add(new ImgExifItem {
                                group = group,
                                name = name,
                                value = ExposureBiasToString(val)
                            });
                        } else if (tagType == ExifDirectoryBase.TagExposureTime) {//曝光時間
                            string val = directory.GetString(tag.Type);
                            exif.data.Add(new ImgExifItem {
                                group = group,
                                name = name,
                                value = ExposureTimeToString(val)
                            });
                        } else if (tagType == ExifDirectoryBase.TagFlash) {//閃光燈模式
                            string val = directory.GetString(tag.Type);
                            exif.data.Add(new ImgExifItem {
                                group = group,
                                name = "Flash(key)",
                                value = (val)
                            });
                        } else if (name == "Image Width") {
                            w = directory.GetString(tag.Type);
                        } else if (name == "Image Height") {
                            h = directory.GetString(tag.Type);
                        } else {
                            exif.data.Add(new ImgExifItem {
                                group = group,
                                name = name,
                                value = value
                            });
                        }

                    }
                }
                if (w != "" && h != "") {
                    exif.data.Add(new ImgExifItem {
                        group = "Image",
                        name = "Image Width/Height",
                        value = $"{w} x {h}"
                    });
                }
            } catch (Exception) {

            }

            exif.code = "1";
            string json = JsonConvert.SerializeObject(exif);

            WriteString(d, json);
        }


        void vipsResize(RequestData d) {
            string path = d.args["path"];
            double scale = Double.Parse(d.args["scale"]);

            path = Uri.UnescapeDataString(path);

            bool is304 = HeadersAdd304(d, path);//回傳檔案時加入快取的Headers
            if (is304) { return; }

            string imgPath = ImgLib.VipsResize(path, scale);
            WriteFile(d, imgPath);//回傳檔案
        }

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
                    Console.WriteLine(e.Message);
                }

                if (imgInfo.width != 0) {
                    break;
                }
            }

            json = JsonConvert.SerializeObject(imgInfo);
            WriteString(d, json);//回傳輸出的檔案路徑
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="d"></param>
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
        /// <param name="d"></param>
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
        /// <param name="d"></param>
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
        /// <param name="d"></param>
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
        /// <param name="d"></param>
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
        /// 檢查這個port是否為tiefsee所使用，用於快速啟動
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        private void ckeck(RequestData d) {
            WriteString(d, "tiefsee");
        }


        /// <summary>
        /// 新開一個視窗，用於快速啟動
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        private void newWindow(RequestData d) {

            //string arg = Encoding.UTF8.GetString(Convert.FromBase64String(d.args["path"]));//將字串剖析回命令列參數
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
        /// <param name="_url"></param>
        /// <param name="context"></param>
        /// <returns></returns>
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
        /// <param name="_url"></param>
        /// <param name="context"></param>
        /// <returns></returns>
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
        /// 
        /// </summary>
        /// <param name="d"></param>
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
                    System.Drawing.Bitmap icon = QuickLook.WindowsThumbnailProvider.GetThumbnail(
                        path, size, size, QuickLook.ThumbnailOptions.ScaleUp
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
        /// 取得 www 目錄裡面的檔案
        /// </summary>
        /// <param name="_url"></param>
        /// <param name="context"></param>
        /// <returns></returns>
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
