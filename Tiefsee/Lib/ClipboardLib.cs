using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tiefsee {

    public class ClipboardLib {

        public class ClipboardContent {
            public string Type { get; set; }
            public string Data { get; set; }
        }

        /// <summary>
        /// 取得剪貼簿內容
        /// </summary>
        /// <param name="maxTextLength"> 文字最大讀取長度，超過會返回 exceededLength </param>
        /// <returns></returns>
        public ClipboardContent GetClipboardContent(int maxTextLength = 5000) {
            try {
                if (Clipboard.ContainsImage()) {
                    using (var ms = new MemoryStream()) {
                        Clipboard.GetImage().Save(ms, System.Drawing.Imaging.ImageFormat.Png);
                        return new ClipboardContent { Type = "img", Data = "data:image/png;base64," + Convert.ToBase64String(ms.ToArray()) };
                    }
                }
                if (Clipboard.ContainsFileDropList()) {
                    var files = Clipboard.GetFileDropList();
                    if (files.Count > 0) {
                        string filePath = files[0];
                        if (Directory.Exists(filePath)) {
                            return new ClipboardContent { Type = "dir", Data = filePath };
                        } else if (File.Exists(filePath)) {
                            return new ClipboardContent { Type = "file", Data = filePath };
                        }
                    }
                }
                if (Clipboard.ContainsText()) {

                    string oldText = Clipboard.GetText();
                    string text = oldText.Trim();

                    // 如果首位是「"」，則將其去除
                    bool isQuotes = text.StartsWith("\"") && text.EndsWith("\"");
                    text = text.Trim('"');

                    if (text.Length > maxTextLength) {
                        return new ClipboardContent { Type = "exceededLength", Data = text.Substring(0, maxTextLength) };
                    }

                    if (File.Exists(text)) {
                        return new ClipboardContent { Type = "file", Data = text };
                    }

                    if (Directory.Exists(text)) {
                        return new ClipboardContent { Type = "dir", Data = text };
                    }

                    if (Uri.IsWellFormedUriString(text, UriKind.Absolute)) {
                        return new ClipboardContent { Type = "url", Data = text };
                    }

                    return new ClipboardContent { Type = "text", Data = oldText };
                }
            } catch (Exception ex) {
                return new ClipboardContent { Type = "error", Data = ex.Message };
            }

            return new ClipboardContent { Type = "unknown", Data = "" };
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="base64String"></param>
        /// <returns></returns>
        private MemoryStream Base64ToMemoryStream(string base64String) {
            // 去掉開頭的 data:image/png;base64,
            int x = base64String.IndexOf("base64,");
            if (x != -1) { base64String = base64String.Substring(x + 7); }

            byte[] Buffer = Convert.FromBase64String(base64String);
            var oMemoryStream = new MemoryStream(Buffer);
            oMemoryStream.Position = 0;
            return oMemoryStream;
        }

        /// <summary>
        /// 存入剪貼簿 - 傳入base64，儲存成圖片。
        /// isTransparent=true時，同時把png跟一般圖片存入剪貼簿，支援透明圖片的程式會優先使用png格式
        /// </summary>
        /// <param name="base64"></param>
        /// <param name="isTransparent"> 是否要支援透明色 </param>
        /// <returns></returns>
        public bool SetClipboard_Base64ToImage(string base64, bool isTransparent) {
            try {
                using (MemoryStream ms = Base64ToMemoryStream(base64)) {
                    using (var bm = new Bitmap(ms)) {
                        Clipboard.Clear(); //清理剪貼簿
                        IDataObject data_object = new DataObject();
                        data_object.SetData(DataFormats.Bitmap, true, bm); //無透明色的圖片，所有軟體都支援
                        if (isTransparent) {
                            data_object.SetData("PNG", true, ms); //含有透明色，但並非所有軟體都支援
                        }
                        Clipboard.SetDataObject(data_object, true);
                        return true;
                    }
                }
            } catch (Exception e2) {
                MessageBox.Show(e2.ToString());
                return false;
            }
        }


        /// <summary>
        /// 存入剪貼簿 - 傳入檔案路徑，儲存成圖片。
        /// isTransparent=true時，同時把png跟一般圖片存入剪貼簿，支援透明圖片的程式會優先使用png格式
        /// </summary>
        /// <param name="path"></param>
        /// <param name="isTransparent"> 是否要支援透明色 </param>
        /// <returns></returns>
        public bool SetClipboard_FileToImage(string path, bool isTransparent) {
            try {
                if (File.Exists(path) == false) { return false; }

                using (Stream ms = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) {
                    using (var bm = new Bitmap(ms)) {

                        Clipboard.Clear(); // 先清理剪貼簿
                        IDataObject data_object = new DataObject();
                        data_object.SetData(DataFormats.Bitmap, true, bm);
                        if (isTransparent) {
                            data_object.SetData("PNG", true, ms); // 含有透明色，但並非所有軟體都支援
                        }
                        Clipboard.SetDataObject(data_object, true);
                        return true;
                    }
                }
            } catch (Exception e2) {
                MessageBox.Show(e2.ToString());
                return false;
            }
        }


        /// <summary>
        /// 存入剪貼簿 - 傳入檔案路徑，以UTF8開啟，複製成文字
        /// </summary>
        /// <param name="txt"></param>
        /// <returns></returns>
        public bool SetClipboard_FileToText(string path) {
            try {
                if (File.Exists(path) == false) { return false; }
                using (StreamReader sr = new StreamReader(path, Encoding.UTF8)) {
                    Clipboard.SetDataObject(sr.ReadToEnd(), false, 5, 200);
                }
                return true;
            } catch (Exception) {
                return false;
            }
        }


        /// <summary>
        /// 存入剪貼簿 - 傳入檔案路徑，複製成base64
        /// </summary>
        /// <param name="txt"></param>
        /// <returns></returns>
        public bool SetClipboard_FileToBase64(string path) {

            try {

                if (File.Exists(path) == false) { return false; }

                byte[] temp = File.ReadAllBytes(path);
                string base64String = "";

                String ext = Path.GetExtension(path).ToUpper();

                if (ext == ".PNG") {
                    base64String = "data:image/png;base64," + Convert.ToBase64String(temp);

                } else if (ext == ".GIF") {
                    base64String = "data:image/gif;base64," + Convert.ToBase64String(temp);

                } else if (ext == ".SVG") {
                    base64String = "data:image/svg+xml;base64," + Convert.ToBase64String(temp);

                } else if (ext == ".BMP") {
                    base64String = "data:image/bmp;base64," + Convert.ToBase64String(temp);

                } else if (ext == ".WEBP") {
                    base64String = "data:image/webp;base64," + Convert.ToBase64String(temp);

                } else {
                    base64String = "data:image/jpeg;base64," + Convert.ToBase64String(temp);
                }

                Clipboard.SetDataObject(base64String, false, 5, 200); // 存入剪貼簿
                return true;

            } catch (Exception e) {
                MessageBox.Show(e.ToString());
                return false;
            }
        }


        /// <summary>
        /// 存入剪貼簿 - 圖片
        /// </summary>
        /// <param name="txt"></param>
        /// <returns></returns>
        /*public bool SetClipboard_FileToImg(string path) {
            try {
                using (System.Drawing.Bitmap bm_transparent = new System.Drawing.Bitmap(path)) {
                    System.Windows.Forms.Clipboard.SetImage(bm_transparent);
                    bm_transparent.Dispose();
                }
                return true;
            } catch (Exception) {
                return false;
            }
        }*/


        /// <summary>
        /// 存入剪貼簿 - 字串
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public bool SetClipboard_Text(string text) {
            try {
                Clipboard.SetDataObject(text, false, 5, 200); // 存入剪貼簿
                return true;
            } catch (Exception) {
                return false;
            }
        }


        /// <summary>
        /// 存入剪貼簿 - 檔案
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public bool SetClipboard_File(string path) {
            try {
                // 檔案或資料夾存在才複製
                if (File.Exists(path) || Directory.Exists(path)) {
                    var f = new System.Collections.Specialized.StringCollection();
                    f.Add(path);
                    Clipboard.SetFileDropList(f);
                } else {
                    return false;
                }
                return true;
            } catch (Exception) {
                return false;
            }
        }


    }
}
