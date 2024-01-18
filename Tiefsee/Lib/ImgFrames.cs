using ImageMagick;
using LibAPNG;
using NetVips;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Concurrent;
using System.IO;

namespace Tiefsee;

/// <summary>
/// 處理多幀圖片
/// </summary>
public class ImgFrames {

    #region 匯出多幀圖片

    /// <summary>
    /// 匯出多幀圖片，並儲存到指定資料夾
    /// </summary>
    public static string ExtractFrames(string imgPath, string outputDir) {

        string hase = FileLib.FileToHash(imgPath);

        if (outputDir == null || outputDir == "") { // 未指定資料夾
            string name = Path.GetFileNameWithoutExtension(imgPath);

            for (int i = 1; i <= 100; i++) {
                if (i == 100) { throw new Exception(); }

                // 如果資料夾已經存在，則在資料夾後面加上「 (2)」
                if (i == 1) {
                    outputDir = Path.Combine(AppPath.tempDirWebFile, name);
                }
                else {
                    outputDir = Path.Combine(AppPath.tempDirWebFile, name) + $" ({i})";
                }

                string infoPath = Path.Combine(outputDir, "info.json");
                // 如果 info.json 已經存在，且是已經處理過的檔案，表示可以使用此資料夾
                if (File.Exists(infoPath)) {
                    using var stream = new FileStream(infoPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                    using var reader = new StreamReader(stream);
                    var json = JObject.Parse(reader.ReadToEnd());

                    if ((json["hase"] ?? "").ToString() == hase) {

                        string[] arFile = Directory.GetFiles(outputDir, "*.*"); // 取得資料夾內所有檔案

                        // 產生集合，應該存在的圖片
                        var frameCount = int.Parse((json["frameCount"] ?? "0").ToString());
                        if (frameCount == 0) { break; }
                        var arPng = Enumerable.Range(1, frameCount)
                            .Select(i => Path.Combine(outputDir, i.ToString() + ".png"))
                            .ToArray();

                        bool allExists = arPng.All(x => arFile.Contains(x));
                        if (allExists) { // 如果所有圖片都存在，就直接回傳，不需要處理
                            return outputDir;
                        }
                        else {
                            break; // 有缺漏圖片，需要處理
                        }
                    }
                }
                // 如果找不到 info.json，表示可以使用此資料夾
                else {
                    break;
                }
            }
        }

        if (Directory.Exists(outputDir) == false) { // 資料夾不存在就新建
            Directory.CreateDirectory(outputDir);
        }

        string ext = FileLib.GetFileType(imgPath);
        if (ext == "gif") {
            ExtractGif(imgPath, outputDir);
        }
        else if (ext == "apng") {
            ExtractApng(imgPath, outputDir);
        }
        else {
            ExtractMagickImage(imgPath, outputDir, ext);
        }
        return outputDir;
    }

    /// <summary>
    /// 匯出 gif
    /// </summary>
    public static void ExtractGif(string imgPath, string outputDir) {

        using var gif = System.Drawing.Image.FromFile(imgPath);
        var fd = new System.Drawing.Imaging.FrameDimension(gif.FrameDimensionsList[0]);
        int frameCount = gif.GetFrameCount(fd);

        var blockingCollection = new BlockingCollection<int>(frameCount);
        for (int i = 0; i < frameCount; i++) {
            blockingCollection.Add(i);
        }
        blockingCollection.CompleteAdding();

        // 以多執行序來同時處理
        var tasks = Enumerable.Range(1, 7).Select(x => Task.Run(() => {
            //var gif2 = System.Drawing.Image.FromFile(inputGifPath);
            System.Drawing.Image gif2;
            lock (gif) {
                gif2 = (System.Drawing.Image)gif.Clone();
            }
            int n;
            while (blockingCollection.TryTake(out n)) {
                string output = Path.Combine(outputDir, (n + 1) + ".png");
                if (File.Exists(output)) { continue; }
                gif2.SelectActiveFrame(fd, n);
                gif2.Save(output, System.Drawing.Imaging.ImageFormat.Png);
            }
            gif2.Dispose();
        })
        ).ToArray();

        Task.WaitAll(tasks); // 等待所有的任務完成

        // --------

        var exif = Exif.GetExif(imgPath, 500);
        Dictionary<int, AnimationItemInfo> itemInfo = new Dictionary<int, AnimationItemInfo>();

        // 取得每一幀的延遲(毫秒)
        var exifDelay = exif.data.Where(x => x.name == "Delay").ToList();
        for (int i = 0; i < exifDelay.Count; i++) {
            var delay = int.Parse(exifDelay[i].value) * 10; // GIF 的延遲是 1/100秒
            itemInfo.Add(i + 1, new() { Delay = delay });
        }

        // 取得循環次數
        int? loopCount = null;
        var exifLoopCount = exif.data.FirstOrDefault(x => x.name == "Loop Count");
        if (exifLoopCount != null) {
            loopCount = int.Parse(exifLoopCount.value);
        }

        ExtractFramesSaveInfo(outputDir, imgPath, frameCount, loopCount, itemInfo); // 儲存 info.json
    }

    /// <summary>
    /// 匯出 apng
    /// </summary>
    public static void ExtractApng(string imgPath, string outputDir) {

        var apng = new APNG(imgPath);

        Dictionary<int, AnimationItemInfo> itemInfo = new(); // 取得每一幀的延遲(毫秒)

        List<NetVips.Image> arImg = new();

        // 創建一個空的背景圖片
        int width = (int)apng.IHDRChunk.Width;
        int height = (int)apng.IHDRChunk.Height;
        var background = NetVips.Image.Black(width, height);

        for (int i = 0; i < apng.Frames.Length; i++) {
            var frame = apng.Frames[i];
            int xOffset = (int)frame.fcTLChunk.XOffset;
            int yOffset = (int)frame.fcTLChunk.YOffset;
            int w = (int)frame.fcTLChunk.Width;
            int h = (int)frame.fcTLChunk.Height;
            BlendOps blendOp = frame.fcTLChunk.BlendOp;
            DisposeOps disposeOp = frame.fcTLChunk.DisposeOp;

            using var frameImage = NetVips.Image.NewFromBuffer(frame.GetStream().ToArray(), "");
            NetVips.Image temp;
            if (blendOp == BlendOps.APNGBlendOpSource || i == 0) { // 覆蓋先前的幀
                temp = background.Insert(frameImage, xOffset, yOffset);
            }
            else { // 與先前的幀進行 alpha 混合
                temp = background.Composite(frameImage, Enums.BlendMode.Over, xOffset, yOffset);
            }

            int den = frame.fcTLChunk.DelayDen; // 分母
            if (den <= 0) { den = 10; }
            int delay = frame.fcTLChunk.DelayNum * 1000 / den;
            itemInfo.Add(i + 1, new() { Delay = delay });

            arImg.Add(temp.Copy());

            if (disposeOp == DisposeOps.APNGDisposeOpBackground) { // 渲染下一幀之前，將目前影格的區域清除
                using var temp2 = NetVips.Image.Black(w, h);
                var temp3 = temp.Insert(temp2, xOffset, yOffset);
                temp.Dispose();
                temp = temp3;
                background.Dispose();
            }
            else if (disposeOp == DisposeOps.APNGDisposeOpPrevious) { // 渲染下一幀之前，將目前幀的區域恢復為上一幀的內容
                temp = background;
            }
            else {
                background.Dispose();
            }

            background = temp;
        }

        var blockingCollection = new BlockingCollection<int>(apng.Frames.Length);
        for (int i = 0; i < apng.Frames.Length; i++) {
            blockingCollection.Add(i);
        }
        blockingCollection.CompleteAdding();

        // 以多執行序來同時處理
        var tasks = Enumerable.Range(1, 5).Select(x => Task.Run(() => {
            while (blockingCollection.TryTake(out var n)) {
                var img = arImg[n];
                img.Pngsave(
                    filename: Path.Combine(outputDir, n + ".png"),
                    compression: 0,
                    interlace: false,
                    filter: Enums.ForeignPngFilter.None
                );
                img.Dispose();
            }
        })
        ).ToArray();

        Task.WaitAll(tasks); // 等待所有的任務完成

        background.Dispose();

        // --------

        int frameCount = (int)apng.acTLChunk.NumFrames;
        int loopCount = (int)apng.acTLChunk.NumPlays;
        ExtractFramesSaveInfo(outputDir, imgPath, frameCount, loopCount, itemInfo); // 儲存 info.json
    }

    /// <summary>
    /// 匯出多幀圖片，使用 MagickImage
    /// </summary>
    public static void ExtractMagickImage(string imgPath, string outputDir, string type) {

        var collection = new MagickImageCollection(imgPath);
        int count = collection.Count;
        int? loopCount = null;
        if (type != "ico") {
            collection.Coalesce(); // 使用 Coalesce 方法使每一幀成為完整的圖片
        }
        var blockingCollection = new BlockingCollection<int>(count);
        for (int i = 0; i < count; i++) {
            blockingCollection.Add(i);
        }
        blockingCollection.CompleteAdding();

        Dictionary<int, AnimationItemInfo> itemInfo = new Dictionary<int, AnimationItemInfo>();

        // 以多執行序來同時處理
        var tasks = Enumerable.Range(1, 7).Select(x => Task.Run(() => {
            while (blockingCollection.TryTake(out var n)) {
                using var image = collection[n];

                if (type == "webps") {
                    lock (itemInfo) {
                        if (n == 0) {
                            loopCount = image.AnimationIterations;
                        }
                        int delay = image.AnimationDelay * 10; // webp 的延遲是 1/100秒
                        itemInfo.Add(n + 1, new() { Delay = delay });
                    }
                }

                string outputPath = Path.Combine(outputDir, (n + 1) + ".png");
                if (File.Exists(outputPath)) { continue; }
                image.Write(outputPath);
            }
        })
        ).ToArray();

        Task.WaitAll(tasks); // 等待所有的任務完成
        collection.Dispose();

        // ----------

        itemInfo = itemInfo.OrderBy(x => x.Key).ToDictionary(x => x.Key, x => x.Value);

        ExtractFramesSaveInfo(outputDir, imgPath, count, loopCount, itemInfo); // 儲存 info.json
    }

    /// <summary>
    /// 儲存 info.json
    /// </summary>
    public static void ExtractFramesSaveInfo(string outputDir, string path, int frameCount, int? loopCount, Dictionary<int, AnimationItemInfo> frames) {

        string hase = FileLib.FileToHash(path);
        object data;
        if (loopCount != null && frames != null && frames.Count > 0) {
            data = new {
                hase = hase,
                path = path,
                loopCount = loopCount,
                frameCount = frameCount,
                frames = frames
            };
        }
        else if (frames != null && frames.Count > 0) {
            data = new {
                hase = hase,
                path = path,
                // loopCount = loopCount,
                frameCount = frameCount,
                frames = frames
            };
        }
        else {
            data = new {
                hase = hase,
                path = path,
                // loopCount = loopCount,
                frameCount = frameCount,
                // frames = frames
            };
        }

        string json = JsonConvert.SerializeObject(data, Formatting.Indented);
        string jsonPath = Path.Combine(outputDir, "info.json");

        var utf8WithoutBom = new System.Text.UTF8Encoding(false);
        using FileStream fs = new FileStream(jsonPath, FileMode.Create);
        using StreamWriter sw = new StreamWriter(fs, utf8WithoutBom);

        sw.Write(json);
    }

    #endregion

    /// <summary>
    /// 取得多幀圖片的總幀數
    /// </summary>
    public static int GetAnimationInfo(string path) {

        // 如果已經讀取過，就從暫存裡面取得
        string hash = FileLib.FileToHash(path);
        if (_tempGetFrameCount.ContainsKey(hash)) {
            return _tempGetFrameCount[hash];
        }

        try {
            using (var images = new MagickImageCollection()) {
                images.Ping(path);
                int count = images.Count;
                _tempGetFrameCount.Add(hash, count);
                return count;
            }
        }
        catch { }
        return -1;
    }
    private static Dictionary<string, int> _tempGetFrameCount = new();

    /// <summary>
    /// 取得 webp 的 總幀數、循環次數
    /// </summary>
    public static AnimationInfo GetWebpInfo(string path) {
        int frameCount = -1;
        int loopCount = -1;
        try {
            using var sr = new FileStream(path, FileMode.Open, FileAccess.Read);
            using var image = NetVips.Image.NewFromStream(sr, access: NetVips.Enums.Access.Random);
            frameCount = Int32.Parse(image.Get("n-pages").ToString());
            loopCount = Int32.Parse(image.Get("loop").ToString());
        }
        catch { }

        return new AnimationInfo { FrameCount = frameCount, LoopCount = loopCount };
    }

    /// <summary>
    /// 取得 apng 的 總幀數、循環次數
    /// </summary>
    public static AnimationInfo GetApngInfo(string path) {
        int frameCount = -1;
        int loopCount = -1;
        try {
            var apngInfo = APNG.GetInfo(path);
            frameCount = (int)apngInfo.NumFrames;
            loopCount = (int)apngInfo.NumPlays;
        }
        catch { }

        return new AnimationInfo { FrameCount = frameCount, LoopCount = loopCount };
    }

}

public class AnimationInfo {
    public int FrameCount { get; set; }
    public int LoopCount { get; set; }
}

public class AnimationItemInfo {
    public int Delay { get; set; }
}
