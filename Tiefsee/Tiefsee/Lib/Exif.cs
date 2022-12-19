using MetadataExtractor;
using MetadataExtractor.Formats.Exif;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tiefsee {
    public class Exif {

        /// <summary>
        /// 旋轉資訊
        /// </summary>
        private static string OrientationToString(int orientation) {
            if (orientation == 1) { return "0°"; }
            if (orientation == 2) { return "Mirror horizontal"; }
            if (orientation == 3) { return "180°"; }
            if (orientation == 4) { return "Mirror vertical"; }
            if (orientation == 5) { return "270°, Mirror horizontal"; }
            if (orientation == 6) { return "90°"; }
            if (orientation == 7) { return "90°, Mirror horizontal"; }
            if (orientation == 8) { return "270°"; }
            return "undefined";
        }

        /// <summary>
        /// 曝光時間
        /// </summary>
        private static string ExposureTimeToString(string val) {

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
        private static string ExposureBiasToString(string val) {

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


        /// <summary>
        /// 
        /// </summary>
        public static string GetExif(string path) {

            ImgExif exif = new ImgExif();

            exif.data.Add(new ImgExifItem {//建立時間
                group = "base",
                name = "Creation Time",
                value = File.GetCreationTime(path).ToString("yyyy-MM-dd HH:mm:ss")
            });
            exif.data.Add(new ImgExifItem {//最後修改時間
                group = "base",
                name = "Last Write Time",
                value = File.GetLastWriteTime(path).ToString("yyyy-MM-dd HH:mm:ss")
            });
            /*exif.data.Add(new ImgExifItem {//上次存取時間
                group = "base",
                name = "Last Access Time",
                value = File.GetLastAccessTime(path).ToString("yyyy-MM-dd HH:mm:ss")
            });*/
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

                        if (value != null && value.Length > 5000) {//某些圖片可能把二進制資訊封裝進去
                            continue;
                        }

                        //判斷是否為 iso-8859-1 ，是的話就轉成utf8
                        try {
                            if (name == "Textual Data" && value != null) {

                                if (CheckEncoding(value, Encoding.GetEncoding(28591))) {
                                    byte[] unknow = Encoding.GetEncoding(28591).GetBytes(value);
                                    for (int i = 0; i < unknow.Length; i++) {//把 ASCII「A0」轉成一般的「空白符號」，否則會顯示亂碼
                                        if (unknow[i] == 160) {
                                            unknow[i] = 32;
                                        }
                                    }
                                    string utf8 = Encoding.UTF8.GetString(unknow);
                                    value = utf8;
                                }

                                //using (Stream stream = new MemoryStream(new UTF8Encoding(true).GetBytes(utf8))) {
                                /*using (Stream stream = new MemoryStream(unknow)) {
                                    stream.Position = 0;
                                    StringBuilder sb = new StringBuilder();
                                    using (System.IO.BinaryReader br = new System.IO.BinaryReader(stream)) {
                                        for (int i = 0; i < 900; i++) {
                                            string hexValue = br.ReadByte().ToString("X2");
                                            int v = Convert.ToInt32(hexValue, 16);
                                            char charValue = (char)v;
                                            sb.Append(hexValue + "(" + charValue + ")" + " ");
                                        }
                                    }//using
                                    //Console.WriteLine(sb);
                                }*/
                            }
                        } catch (Exception ee) {
                            Console.WriteLine("Textual Data 解析錯誤:\n" + ee);
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
                                value = (directory.TryGetDateTime(tag.Type, out DateTime v) ? v : new DateTime(1970, 1, 1)).ToString("yyyy-MM-dd HH:mm:ss")
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
                                name = "Flash",
                                value = val
                            });
                            exif.data.Add(new ImgExifItem {
                                group = group,
                                name = "Flash(text)",
                                value = value
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

            return json;
        }


        /// <summary>
        /// 檢查編碼類型
        /// </summary>
        private static bool CheckEncoding(string str, string type) {
            if (type == "utf-8") {
                byte[] unknow = Encoding.UTF8.GetBytes(str);
                return Encoding.UTF8.GetString(unknow) == str;
            }
            if (type == "iso-8859-1") {
                byte[] unknow = Encoding.GetEncoding(28591).GetBytes(str);
                return Encoding.GetEncoding(28591).GetString(unknow) == str;
            }
            if (type == "ascii") {
                byte[] unknow = Encoding.ASCII.GetBytes(str);
                return Encoding.ASCII.GetString(unknow) == str;
            }
            return false;
        }

        /// <summary>
        /// 檢查編碼類型
        /// </summary>
        private static bool CheckEncoding(string value, Encoding encoding) {
            bool retCode;
            var charArray = value.ToCharArray();
            byte[] bytes = new byte[charArray.Length];
            for (int i = 0; i < charArray.Length; i++) {
                bytes[i] = (byte)charArray[i];
            }
            retCode = string.Equals(encoding.GetString(bytes, 0, bytes.Length), value, StringComparison.InvariantCulture);
            return retCode;
        }


    }


    public class ImgExif {
        public string code = "0";
        public List<ImgExifItem> data = new List<ImgExifItem>();
    }
    public class ImgExifItem {
        public string group = "";
        public string name = "";
        public string value = "";
    }
}
