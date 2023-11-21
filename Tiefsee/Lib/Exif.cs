using MetadataExtractor;
using MetadataExtractor.Formats.Exif;
using Newtonsoft.Json;
using System.IO;
using System.Text;

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
                float n4 = (float)decimal.Round((decimal)n3, 1); // 小數兩位
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
                float n4 = (float)decimal.Round((decimal)n3, 2); // 小數兩位
                if (n4 > 0) {
                    return "+" + n4 + " EV";
                } else {
                    return "" + n4 + " EV";
                }
            } catch { }
            return "0";
        }

        /// <summary>
        /// 
        /// </summary>
        public static string GetExif(string path, int maxLength) {

            ImgExif exif = new ImgExif();

            exif.data.Add(new ImgExifItem { // 建立時間
                group = "base",
                name = "Creation Time",
                value = File.GetCreationTime(path).ToString("yyyy-MM-dd HH:mm:ss")
            });
            exif.data.Add(new ImgExifItem { // 最後修改時間
                group = "base",
                name = "Last Write Time",
                value = File.GetLastWriteTime(path).ToString("yyyy-MM-dd HH:mm:ss")
            });
            /*exif.data.Add(new ImgExifItem { // 上次存取時間
                group = "base",
                name = "Last Access Time",
                value = File.GetLastAccessTime(path).ToString("yyyy-MM-dd HH:mm:ss")
            });*/
            exif.data.Add(new ImgExifItem { // 檔案 size
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

                        string group = directory.Name ?? "";
                        string name = tag.Name ?? "";
                        string value = tag.Description ?? "";
                        int tagType = tag.Type;

                        if (name == "Red TRC" || name == "Green TRC" || name == "Blue TRC") {
                            continue;
                        }
                        if (value.Length > maxLength) { // 某些圖片可能把二進制資訊封裝進去
                            continue;
                        }

                        /*if (name == "Textual Data") {
                            try {
                                if (group == "PNG-iTXt") { // utf8 格式
                                    byte[] unknow = Encoding.GetEncoding(28591).GetBytes(value);
                                    string utf8 = Encoding.UTF8.GetString(unknow);
                                    value = utf8;
                                } else if (group == "PNG-tEXt") { // ISO-8859-1 格式
                                    //byte[] unknow = Encoding.GetEncoding(28591).GetBytes(value);
                                    //string utf8 = Encoding.GetEncoding(28591).GetString(unknow);
                                    //value = utf8;
                                } else {
                                    continue;
                                }
                            } catch (Exception ee) {
                                Console.WriteLine("Textual Data 解析錯誤:\n" + ee);
                            }
                        }*/

                        // sum += ($"{directory.Name} - {tag.Name} = {tag.Description}")+"\n";
                        if (tagType == ExifDirectoryBase.TagOrientation) { // 旋轉方向
                            int orientation = directory.TryGetInt32(tag.Type, out int v) ? v : -1;
                            exif.data.Add(new ImgExifItem {
                                group = group,
                                name = name,
                                value = OrientationToString(orientation)
                            });
                        } else if (tagType == ExifDirectoryBase.TagDateTimeOriginal) { // 拍攝時間
                            exif.data.Add(new ImgExifItem {
                                group = group,
                                name = name,
                                value = (directory.TryGetDateTime(tag.Type, out DateTime v) ? v : new DateTime(1970, 1, 1)).ToString("yyyy-MM-dd HH:mm:ss")
                            });
                        } else if (tagType == ExifDirectoryBase.TagExposureBias) { // 曝光補償
                            string val = directory.GetString(tag.Type);
                            exif.data.Add(new ImgExifItem {
                                group = group,
                                name = name,
                                value = ExposureBiasToString(val)
                            });
                        } else if (tagType == ExifDirectoryBase.TagExposureTime) { // 曝光時間
                            string val = directory.GetString(tag.Type);
                            exif.data.Add(new ImgExifItem {
                                group = group,
                                name = name,
                                value = ExposureTimeToString(val)
                            });
                        } else if (tagType == ExifDirectoryBase.TagFlash) { // 閃光燈模式
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
                        } else if (name == "Image Width" && group.IndexOf("Thumbnail") == -1) { // Thumbnail 是縮圖，所以不抓
                            w = directory.GetString(tag.Type);
                        } else if (name == "Image Height" && group.IndexOf("Thumbnail") == -1) {
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

    }

    public class ImgExif {
        public string code = "0";
        public List<ImgExifItem> data = new();
    }

    public class ImgExifItem {
        public string group = "";
        public string name = "";
        public string value = "";
    }
}
