using MetadataExtractor;
using MetadataExtractor.Formats.Exif;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Text;
using Windows.Storage;

namespace Tiefsee;

public class Exif {

    // 快取
    private static LRUCache<string, ImgExif> _lruGetExif = new(500);

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
            double n1 = Double.Parse(ar[0].Trim(), CultureInfo.InvariantCulture);
            double n2 = Double.Parse(ar[1].Trim(), CultureInfo.InvariantCulture);
            double n3 = 1 / (n1 / n2);
            float n4 = (float)decimal.Round((decimal)n3, 1); // 小數兩位
            return "1/" + n4 + " sec";
        }
        catch (Exception) {
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
            double n1 = Double.Parse(ar[0].Trim(), CultureInfo.InvariantCulture);
            double n2 = Double.Parse(ar[1].Trim(), CultureInfo.InvariantCulture);
            double n3 = n1 / n2;
            float n4 = (float)decimal.Round((decimal)n3, 2); // 小數兩位
            if (n4 > 0) {
                return "+" + n4 + " EV";
            }
            else {
                return "" + n4 + " EV";
            }
        }
        catch { }
        return "0";
    }

    /// <summary>
    ///
    /// </summary>
    public static ImgExif GetExif(string path, int maxLength) {

        // 如果存在快取，則直接回傳
        string hash = FileLib.FileToHash(path);
        var lruExif = _lruGetExif.Get(hash);
        if (lruExif != null) { return lruExif; }

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
        // ifd0W , ifd0H 儲存 IFD0 的 Image Width/Height 作為沒有其它 Image Width/Height 時的備用
        string ifd0W = "";
        string ifd0H = "";
        IEnumerable<MetadataExtractor.Directory> directories;

        try {
            directories = MetadataExtractor.ImageMetadataReader.ReadMetadata(path);
        }
        catch {
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

                if (group == "Exif SubIFD" && name == "User Comment" && value != "") {
                    try {
                        byte[] unicodeBytes = directory.GetByteArray(tag.Type);
                        var idCode = Encoding.UTF8.GetString(unicodeBytes, 0, 8).TrimEnd('\0', ' ');
                        if (idCode == "UNICODE") { // 如果是 Unicode 編碼

                            string getText(byte[] data) {
                                var ar = new[] { Encoding.Unicode, Encoding.BigEndianUnicode };
                                foreach (var encoding in ar) {
                                    string t = encoding.GetString(data);
                                    if (t.Contains(":") && t.Contains(",")) { // 如果是 ai 繪圖的 Prompt，就一定會有這些符號
                                        // Debug.WriteLine(encoding.HeaderName);
                                        return t;
                                    }
                                }

                                // 如果判斷失敗，則用 UWP 的方式取得
                                string comment = null;
                                Task.Run(async () => {
                                    try {
                                        var f = await StorageFile.GetFileFromPathAsync(path);
                                        var v = await f.Properties.GetDocumentPropertiesAsync();
                                        comment = v.Comment;
                                    }
                                    catch { }
                                }).Wait(); // 等待非同步操作完成

                                if (string.IsNullOrWhiteSpace(comment) == false) {
                                    return comment;
                                }

                                // 如果還是無法取得，則回傳原始資料
                                return value;
                            }

                            var byteArray = unicodeBytes.Skip(8).ToArray(); // 去除前 8 個 byte
                            value = getText(byteArray).Replace("\0", "");
                        }
                    }
                    catch (Exception ee) {
                        Debug.WriteLine("User Comment 解析錯誤:\n" + ee);
                    }
                }

                // sum += ($"{directory.Name} - {tag.Name} = {tag.Description}")+"\n";
                if (tagType == ExifDirectoryBase.TagOrientation) { // 旋轉方向
                    int orientation = directory.TryGetInt32(tag.Type, out int v) ? v : -1;
                    exif.data.Add(new ImgExifItem {
                        group = group,
                        name = name,
                        value = OrientationToString(orientation)
                    });
                }
                else if (tagType == ExifDirectoryBase.TagDateTimeOriginal) { // 拍攝時間
                    exif.data.Add(new ImgExifItem {
                        group = group,
                        name = name,
                        value = (directory.TryGetDateTime(tag.Type, out DateTime v) ? v : new DateTime(1970, 1, 1)).ToString("yyyy-MM-dd HH:mm:ss")
                    });
                }
                else if (tagType == ExifDirectoryBase.TagExposureBias) { // 曝光補償
                    string val = directory.GetString(tag.Type);
                    exif.data.Add(new ImgExifItem {
                        group = group,
                        name = name,
                        value = ExposureBiasToString(val)
                    });
                }
                else if (tagType == ExifDirectoryBase.TagExposureTime) { // 曝光時間
                    string val = directory.GetString(tag.Type);
                    exif.data.Add(new ImgExifItem {
                        group = group,
                        name = name,
                        value = ExposureTimeToString(val)
                    });
                }
                else if (tagType == ExifDirectoryBase.TagFlash) { // 閃光燈模式
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
                }
                else if (name == "Image Width" && group.IndexOf("Thumbnail") == -1) { // Thumbnail 是縮圖
                    // IFD0 為原始圖片的資訊，可能會被編輯後的 Exif 覆蓋 , 所以作為備用
                    if (group == "Exif IFD0")
                        ifd0W = directory.GetString(tag.Type);
                    else
                        w = directory.GetString(tag.Type);
                }
                else if (name == "Image Height" && group.IndexOf("Thumbnail") == -1) {
                    // IFD0 為原始圖片的資訊，可能會被編輯後的 Exif 覆蓋 , 所以作為備用
                    if (group == "Exif IFD0")
                        ifd0H = directory.GetString(tag.Type);
                    else
                        h = directory.GetString(tag.Type);
                }
                else {
                    exif.data.Add(new ImgExifItem {
                        group = group,
                        name = name,
                        value = value
                    });
                }
            }
        }

        // 如果不存在 IFD0 外的 Image Width/Height，則使用 IFD0 的值
        if (w == "" && ifd0W != "")
            w = ifd0W;
        if (h == "" && ifd0H != "")
            h = ifd0H;

        // 新增圖片 size 的資訊
        if (w != "" && h != "") {
            exif.data.Add(new ImgExifItem {
                group = "Image",
                name = "Image Width/Height",
                value = $"{w} x {h}"
            });
        }

        // 如果是影片，則另外讀取 Comment 資訊
        string fileType = FileLib.GetFileType(path);
        if (fileType == "mp4" || fileType == "webm" || fileType == "avi") {
            string comment = null;
            Task.Run(async () => {
                try {
                    var f = await StorageFile.GetFileFromPathAsync(path);
                    var v = await f.Properties.GetDocumentPropertiesAsync();
                    comment = v.Comment;
                }
                catch { }
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
            var animationInfo = ImgFrames.GetWebpInfo(path);
            if (animationInfo.FrameCount > 1) {
                exif.data.Add(new ImgExifItem {
                    group = "Frames",
                    name = "Frame Count",
                    value = animationInfo.FrameCount.ToString()
                });
            }
            if (animationInfo.LoopCount > 0) {
                exif.data.Add(new ImgExifItem {
                    group = "Frames",
                    name = "Loop Count",
                    value = animationInfo.LoopCount.ToString()
                });
            }
        }
        // 如果檔案類型是 APNG，則加入「總幀數、循環次數」資訊
        else if (fileType == "apng") {
            var apngInfo = ImgFrames.GetApngInfo(path);
            // 總幀數
            if (apngInfo.FrameCount > 0) {
                exif.data.Add(new ImgExifItem {
                    group = "Frames",
                    name = "Frame Count",
                    value = apngInfo.FrameCount.ToString()
                });
            }

            // 循環次數
            if (apngInfo.LoopCount > 0) {
                exif.data.Add(new ImgExifItem {
                    group = "Frames",
                    name = "Loop Count",
                    value = apngInfo.LoopCount.ToString()
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
                .FirstOrDefault() ?? "";
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
            int frames = ImgFrames.GetAnimationInfo(path);
            if (frames > 1) {
                exif.data.Add(new ImgExifItem {
                    group = "Frames",
                    name = "Frame Count",
                    value = frames.ToString()
                });
            }
        }

        exif.code = "1";

        _lruGetExif.Add(hash, exif);
        return exif;
    }

}

public class ImgExif {
    public string code { get; set; } = "0";
    public List<ImgExifItem> data { get; set; } = new();
}

public class ImgExifItem {
    public string group { get; set; } = "";
    public string name { get; set; } = "";
    public string value { get; set; } = "";
}
