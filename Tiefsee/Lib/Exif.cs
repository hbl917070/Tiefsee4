﻿using MetadataExtractor;
using MetadataExtractor.Formats.Exif;
using Newtonsoft.Json;
using System.IO;
using System.Text;
using System.Xml.Linq;
using Windows.Storage;

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
        public static ImgExif GetExif(string path, int maxLength) {

            ImgExif exif = new ImgExif();

            exif.data.Add(new ImgExifItem { // 建立時間
                group = "Base",
                name = "Creation Time",
                value = File.GetCreationTime(path).ToString("yyyy-MM-dd HH:mm:ss")
            });
            exif.data.Add(new ImgExifItem { // 最後修改時間
                group = "Base",
                name = "Last Write Time",
                value = File.GetLastWriteTime(path).ToString("yyyy-MM-dd HH:mm:ss")
            });
            /*exif.data.Add(new ImgExifItem { // 上次存取時間
                group = "Base",
                name = "Last Access Time",
                value = File.GetLastAccessTime(path).ToString("yyyy-MM-dd HH:mm:ss")
            });*/
            exif.data.Add(new ImgExifItem { // 檔案 size
                group = "Base",
                name = "Length",
                value = new FileInfo(path).Length.ToString()
            });
            string w = "";
            string h = "";
            IEnumerable<MetadataExtractor.Directory> directories;

            try {
                directories = MetadataExtractor.ImageMetadataReader.ReadMetadata(path);
            } catch {
                directories = new List<MetadataExtractor.Directory>();
            }

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

            // 新增圖片 size 的資訊
            if (w != "" && h != "") {
                exif.data.Add(new ImgExifItem {
                    group = "Image",
                    name = "Image Width/Height",
                    value = $"{w} x {h}"
                });
            }

            // 如果是影片，則另外讀取 Comment 資訊
            string fileType = GetFileType(path);
            if (fileType == "mp4" || fileType == "webm" || fileType == "avi") {
                string comment = null;
                Task.Run(async () => {
                    try {
                        var f = await StorageFile.GetFileFromPathAsync(path);
                        var v = await f.Properties.GetDocumentPropertiesAsync();
                        comment = v.Comment;
                    } catch { }
                }).Wait(); // 等待非同步操作完成

                if (string.IsNullOrEmpty(comment) == false) {
                    exif.data.Add(new ImgExifItem {
                        group = "Movie",
                        name = "Comment",
                        value = comment.Trim()
                    });
                }
            }
            // 如果是 webp 動圖，則加入「總幀數、循環次數」資訊
            else if (fileType == "webps") {
                var animationInfo = ImgLib.GetWebpFrameCount(path);
                if (animationInfo.FrameCount > 1) {
                    exif.data.Add(new ImgExifItem {
                        group = "Frames",
                        name = "Frame Count",
                        value = animationInfo.FrameCount.ToString()
                    });
                }
                if (animationInfo.LoopCount > 1) {
                    exif.data.Add(new ImgExifItem {
                        group = "Frames",
                        name = "Loop Count",
                        value = animationInfo.LoopCount.ToString()
                    });
                }
            }
            // 如果檔案類型是 GIF，則加入「總幀數、循環次數」資訊
            else if (fileType == "gif") {
                // 總幀數
                int frames = exif.data
                    .Where(x => x.group == "GIF Control")
                    .Where(x => x.name == "Delay")
                    .Count();
                if (frames > 0) {
                    exif.data.Add(new ImgExifItem {
                        group = "Frames",
                        name = "Frame Count",
                        value = frames.ToString()
                    });
                }

                // 循環次數
                string loopString = exif.data
                    .Where(x => x.group == "GIF Animation")
                    .Where(x => x.name == "Iteration Count")
                    .Select(x => x.value)
                    .SingleOrDefault() ?? "";
                if (loopString.Contains(" times")) {
                    exif.data.Add(new ImgExifItem {
                        group = "Frames",
                        name = "Loop Count",
                        value = loopString.Replace(" times", "")
                    });
                }
            }
            // 如果檔案類型是 ICO，則加入「總幀數」資訊
            else if (fileType == "ico") {

                int frames = exif.data
                    .Where(x => x.group == "ICO")
                    .Where(x => x.name == "Image Size Bytes")
                    .Count();
                if (frames > 0) {
                    exif.data.Add(new ImgExifItem {
                        group = "Frames",
                        name = "Frame Count",
                        value = frames.ToString()
                    });
                }
            }
            // 如果檔案類型是 TIF，則加入「總幀數」資訊
            else if (fileType == "tiff" || fileType == "tif") {
                int frames = exif.data
                    .Where(x => x.name == "Page Number")
                    .Count();
                if (frames > 1) {
                    exif.data.Add(new ImgExifItem {
                        group = "Frames",
                        name = "Frame Count",
                        value = frames.ToString()
                    });
                }
            }
            // 如果檔案類型是 DCM HEIC，則加入「總幀數」資訊
            else if (fileType == "dcm" || fileType == "heic" || fileType == "heif") {
                int frames = ImgLib.GetFrameCount(path);
                if (frames > 1) {
                    exif.data.Add(new ImgExifItem {
                        group = "Frames",
                        name = "Frame Count",
                        value = frames.ToString()
                    });
                }
            }

            exif.code = "1";

            return exif;
        }

        /// <summary>
        /// 取得檔案類型。一律小寫，例如 「jpg」
        /// </summary>
        public static string GetFileType(string path) {

            if (File.Exists(path)) {

                StringBuilder sb = new();
                try {
                    using FileStream fs = new(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                    using BinaryReader br = new(fs);
                    int readLength = 100;

                    for (int i = 0; i < readLength; i++) {
                        if (fs.Position >= fs.Length) break; // 如果已經讀取到文件的結尾，則跳出循環
                        string hexValue = br.ReadByte().ToString("X2");
                        sb.Append(hexValue + " ");
                    }
                    if (fs != null) {
                        fs.Close();
                        br.Close();
                    }
                } catch { }

                string hex = sb.ToString();

                if (hex.StartsWith("FF D8 FF")) {
                    return "jpg";
                } else if (hex.StartsWith("47 49 46 38")) { // GIF8
                    return "gif";
                } else if (hex.StartsWith("89 50 4E 47 0D 0A 1A 0A")) {
                    return "png";
                } else if (hex.Contains("57 45 42 50 56 50 38")) { // WEBPVP8
                    if (hex.Contains("41 4E 49 4D")) { // ANIM
                        return "webps";
                    } else {
                        return "webp";
                    }
                } else if (hex.StartsWith("25 50 44 46")) { // %PDF
                    return "pdf";
                    // } else if (hex.Contains("66 74 79 70")) { // 66(f) 74(t) 79(y) 70(p) 。其他影片格式也可能誤判成mp4
                    // return "mp4";
                } else if (hex.StartsWith("1A 45 DF A3")) {
                    if (hex.IndexOf("77 65 62 6D 42 87") > 0) { // 77(w) 65(e) 62(b) 6D(m) 42(B) 87()
                        return "webm";
                    }
                } else if (hex.StartsWith("4F 67 67 53")) { // 4F(O) 67(g) 67(g) 53(S)
                    return "ogv";
                } else if (hex.StartsWith("38 42 50 53")) { // 38(8) 42(B) 50(P) 53(S)
                    return "psd";
                }
            }

            // 如果無法從 hex 判斷檔案類型，則回傳副檔名
            return Path.GetExtension(path).ToLower().Replace(".", "");
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
