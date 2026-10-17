using ImageMagick;
using ImageMagick.Formats;
using MetadataExtractor.Formats.Exif;
using MetadataExtractor.Formats.Tiff;
using NetVips;
using NetVips.Extensions;
using Sdcb.LibRaw;
using Sdcb.LibRaw.Natives;
using SQLite;
using System.Diagnostics;
using System.Collections.Concurrent;
using System.Globalization;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Windows.Media.Imaging;
using Windows.Storage;
using Windows.Storage.Streams;

namespace Tiefsee;

/// <summary>
/// 管理圖片轉檔、Vips cache 與暫存檔路徑
/// </summary>
public sealed class ImageProcessingService {
    private const int JpegMaxDimension = 65500;
    private const long WebGLPreviewMaxPixels = 8L * 1024 * 1024;
    private const long VipsStreamThresholdBytes = 256L * 1024 * 1024;
    private const string VipsTileAlgorithmVersion = "source-region-v5";

    private readonly string _tempDirImgProcessed;
    private readonly string _tempDirImgZoom;
    private readonly Dictionary<string, int[]> _imgSizeCache = new();
    private readonly Dictionary<string, int> _imgExifOrientationCache = new();
    private readonly List<CachedVipsImage> _vipsCache = new();
    private readonly ConcurrentDictionary<string, Lazy<byte[]>> _vipsTileInFlight = new();

    public ImageProcessingService(string tempDirImgProcessed, string tempDirImgZoom) {
        _tempDirImgProcessed = tempDirImgProcessed;
        _tempDirImgZoom = tempDirImgZoom;
    }

    private sealed class CachedVipsImage {
        public string key;
        public NetVips.Image vips;
        public Stream stream;
        public int leaseCount;
        public bool retired;
    }

    private sealed class VipsImageLease : IDisposable {
        private readonly ImageProcessingService _owner;
        private CachedVipsImage _entry;

        public NetVips.Image Image => _entry?.vips ?? throw new ObjectDisposedException(nameof(VipsImageLease));

        public VipsImageLease(ImageProcessingService owner, CachedVipsImage entry) {
            _owner = owner;
            _entry = entry;
        }

        public void Dispose() {
            CachedVipsImage entry = Interlocked.Exchange(ref _entry, null);
            if (entry != null) _owner.ReleaseVipsImage(entry);
        }
    }

    /// <summary>
    /// 取得任何檔案的圖示
    /// </summary>
    /// <param name="path"></param>
    /// <param name="size"> 16 32 64 128 256 </param>
    /// <param name="waitSec"> 等待秒數 </param>
    /// <returns></returns>
    public Bitmap GetFileIcon(string path, int size, double waitSec = 1.5) {
        if (File.Exists(path) == false) { return null; }

        Bitmap icon = null;

        try {
            AppScheduler.RunWithTimeout(waitSec, () => {
                // 取得圖片在檔案總管的縮圖
                icon = WindowsThumbnailProvider.GetThumbnail(path, size, size, ThumbnailOptions.ScaleUp);
            });
        }
        catch { }

        return icon;
    }

    /// <summary>
    /// 依副檔名取得 Windows Shell 通用 icon，不需要檔案實際存在。
    /// 此方法與 GetFileIcon 分開，避免改變既有實體檔案縮圖流程。
    /// </summary>
    public Bitmap GetFileIconByExtension(string extension, int size, double waitSec = 1.5) {
        Bitmap icon = null;

        try {
            AppScheduler.RunWithTimeout(waitSec, () => {
                try {
                    icon = WindowsThumbnailProvider.GetIconByExtension(extension, size);
                }
                catch {
                    // 沒有副檔名關聯時，改用 Windows 的一般檔案 icon。
                    icon = WindowsThumbnailProvider.GetIconByExtension(".bin", size);
                }
            });
        }
        catch { }

        return icon;
    }

    /// <summary>
    ///
    /// </summary>
    public void PathToBitmapSource(string path, Action<BitmapSource> func) {
        using (var sr = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read)) {
            BitmapDecoder bd = BitmapDecoder.Create(sr, BitmapCreateOptions.DelayCreation, BitmapCacheOption.None);
            func(bd.Frames[0]);
        }
    }

    /// <summary>
    ///
    /// </summary>
    public BitmapSource StreamToBitmapSource(MemoryStream ms) {
        BitmapDecoder bd = BitmapDecoder.Create(ms, BitmapCreateOptions.DelayCreation, BitmapCacheOption.None);
        return bd.Frames[0];
    }

    /// <summary>
    ///
    /// </summary>
    public Stream BitmapSourceToStream(BitmapSource bs) {
        BitmapEncoder encoder = new BmpBitmapEncoder();
        encoder.Frames.Add(BitmapFrame.Create(bs));
        Stream stream = new MemoryStream();
        encoder.Save(stream);
        stream.Position = 0;
        return stream;
    }

    /// <summary>
    ///
    /// </summary>
    public async Task<Stream> Uwp_PathToStream(string path, Guid encoderId) {
        var ras = await UwpPathToRandomAccessStream(path, encoderId);
        return ras.AsStream();
    }

    // 直接回傳 Stream 會無法編譯
    private async Task<IRandomAccessStream> UwpPathToRandomAccessStream(string path, Guid encoderId) {

        var sourceFile = await StorageFile.GetFileFromPathAsync(path);
        using var sourceStream = await sourceFile.OpenAsync(FileAccessMode.Read);
        var decoder = await Windows.Graphics.Imaging.BitmapDecoder.CreateAsync(sourceStream);

        var softwareBitmap = await decoder.GetSoftwareBitmapAsync(
            decoder.BitmapPixelFormat,
            decoder.BitmapAlphaMode,
            new() { },
            Windows.Graphics.Imaging.ExifOrientationMode.RespectExifOrientation,
            Windows.Graphics.Imaging.ColorManagementMode.DoNotColorManage
        );

        var outputStream = new InMemoryRandomAccessStream();

        var encoder = await Windows.Graphics.Imaging.BitmapEncoder.CreateAsync(encoderId, outputStream);
        encoder.SetSoftwareBitmap(softwareBitmap);

        await encoder.FlushAsync();
        outputStream.Seek(0);
        return outputStream;
    }

    /// <summary>
    ///
    /// </summary>
    public MagickImage GetMagickImage(string path) {

        var settings = new MagickReadSettings {
            Defines = new DngReadDefines {
                OutputColor = DngOutputColor.SRGB,
                UseCameraWhiteBalance = true,
                DisableAutoBrightness = false
            }
        };
        MagickImage image = new MagickImage(path, settings);

        image.AutoOrient(); // 自動調整方向
        image.SetProfile(ColorProfiles.SRGB); // 如果不是RGB格式的圖片，需要更多時間來轉檔

        if (image.ColorSpace == ColorSpace.RGB) { // 用於處理hdr圖片
            image.ColorSpace = ColorSpace.sRGB;
        }

        return image;
    }

    /// <summary>
    ///
    /// </summary>
    public Stream MagickImage_PathToStream(string path, string type) {

        type = type.ToLower();

        using (MagickImage image = GetMagickImage(path)) {

            MagickFormat imgType;

            if (type == "png") {
                image.Quality = 0; // 壓縮品質
                imgType = MagickFormat.Png24;
            }
            else if (type == "jpg" || type == "jpeg") {
                imgType = MagickFormat.Jpeg;
            }
            else if (type == "tif" || type == "tiff") {
                imgType = MagickFormat.Tiff;
            }
            else {
                imgType = MagickFormat.Bmp; // bpm也支援透明色
            }

            var ms = new MemoryStream();
            image.Write(ms, imgType);
            ms.Position = 0;

            image.Dispose();

            return ms;
        }
    }

    /// <summary>
    ///
    /// </summary>
    public Stream Wpf_PathToStream(string path) {
        Stream stream = null;
        PathToBitmapSource(path, (BitmapSource bs) => {
            stream = BitmapSourceToStream(bs);
        });
        return stream;
    }

    /// <summary>
    /// 檢查圖片的 ICC Profile 是否為 CMYK
    /// </summary>
    public bool IsCMYK(string path) {
        using (var sr = new FileStream(path, FileMode.Open, FileAccess.Read)) {
            int len = (int)sr.Length;
            // 只讀取前30000個字，避免開啟大檔案讀取很久
            if (len > 30000) { len = 30000; }
            byte[] bytes = new byte[len];
            sr.Read(bytes, 0, len);
            string s = System.Text.Encoding.ASCII.GetString(bytes);
            if (s.Contains("prtrCMYK") || s.Contains("proofCMYK")) {
                return true;
            }
        }
        return false;
    }

    /// <summary>
    /// BitmapSource 轉 Bitmap
    /// </summary>
    public Bitmap BitmapSourceToBitmap(BitmapSource source) {
        Bitmap bmp = new Bitmap(
            source.PixelWidth,
            source.PixelHeight,
            System.Drawing.Imaging.PixelFormat.Format32bppPArgb);
        BitmapData data = bmp.LockBits(
            new Rectangle(System.Drawing.Point.Empty, bmp.Size),
            ImageLockMode.WriteOnly,
            System.Drawing.Imaging.PixelFormat.Format32bppPArgb);
        source.CopyPixels(
            System.Windows.Int32Rect.Empty,
            data.Scan0,
            data.Height * data.Stride,
            data.Stride);
        bmp.UnlockBits(data);
        return bmp;
    }

    /// <summary>
    /// 從 stream 內查詢字串第一次出現的位置
    /// </summary>
    public int FindStrIndexOf(FileStream stream, byte[] str) {

        stream.Position = 0;
        byte[] buffer = new byte[stream.Length];
        stream.Read(buffer, 0, (int)stream.Length);

        int index = Array.IndexOf(buffer, str[0]);

        while (index >= 0 && index <= buffer.Length - str.Length) {
            bool found = true;
            for (int i = 1; i < str.Length; i++) {
                if (buffer[index + i] != str[i]) {
                    found = false;
                    break;
                }
            }

            if (found) {
                return index;
            }

            index = Array.IndexOf(buffer, str[0], index + 1);
        }

        return -1;
    }

    /// <summary>
    /// Clip Studio Paint 產生的 clip檔
    /// </summary>
    public Stream ClipToStream(string clipPath) {
        try {
            string tempFilePath = Path.GetTempFileName();
            using (FileStream fs = new FileStream(clipPath, FileMode.Open, FileAccess.Read)) {

                byte[] header = new byte[] { 0x53, 0x51, 0x4C, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6F, 0x72, 0x6D, 0x61, 0x74, 0x20, 0x33 };
                long startIndex = FindStrIndexOf(fs, header);

                if (startIndex == -1) { return null; }

                using (FileStream temp = new FileStream(tempFilePath, FileMode.Create)) {
                    long size = new FileInfo(clipPath).Length;
                    byte[] data = new byte[size];
                    fs.Seek(startIndex, SeekOrigin.Begin);
                    fs.Read(data, 0, data.Length);
                    temp.Write(data, 0, data.Length);
                }
            }

            // 從 sqlite 裡面提取圖片
            Stream stream = new MemoryStream();
            using (var db = new SQLiteConnection(tempFilePath)) {
                var data = db.ExecuteScalar<byte[]>("SELECT ImageData FROM CanvasPreview");
                stream.Write(data, 0, data.Length);
            }

            File.Delete(tempFilePath);
            return stream;

        }
        catch {
            return null;
        }
    }

    /// <summary>
    /// 以 hex 的方式掃描檔案內的 png，並將其提取出來。可用於 afphoto
    /// </summary>
    public Stream ExtractPngToStream(string filePath) {
        try {
            using (FileStream fs = new FileStream(filePath, FileMode.Open, FileAccess.Read)) {
                byte[] startHex = new byte[] { 0x89, 0x50, 0x4E, 0x47 };
                int startIndex = FindStrIndexOf(fs, startHex);
                if (startIndex == -1) { return null; }
                byte[] endHex = new byte[] { 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 };
                int endIndex = FindStrIndexOf(fs, endHex);
                if (startIndex >= endIndex) { return null; }

                int size = endIndex - startIndex;
                byte[] fileData = File.ReadAllBytes(filePath);
                byte[] outputData = new byte[size];
                Array.Copy(fileData, startIndex, outputData, 0, size);

                Stream stream = new MemoryStream();
                stream.Write(outputData, 0, outputData.Length);
                return stream;
            }
        }
        catch {
            return null;
        }
    }

    /// <summary>
    /// Jxr 轉檔後取得檔案路徑
    /// </summary>
    public string Jxr_PathToPath(string path) {

        if (File.Exists(PluginRegistry.pathHdrfix) == false) {
            throw new Exception("hdrfix.exe 不存在");
        }

        string hashName = FileTypeHelper.FileToHash(path) + "_hdrfix.png"; // 暫存檔案名稱
        string outputPath = Path.Combine(_tempDirImgProcessed, hashName); // 暫存檔案的路徑

        if (File.Exists(outputPath)) {
            return outputPath;
        }

        if (Directory.Exists(_tempDirImgProcessed) == false) {
            Directory.CreateDirectory(_tempDirImgProcessed);
        }

        string arg = $"\"{path}\" \"{outputPath}\"";

        using (var p = new Process()) {
            p.StartInfo.UseShellExecute = false;
            p.StartInfo.CreateNoWindow = true;
            p.StartInfo.RedirectStandardOutput = true;
            p.StartInfo.FileName = PluginRegistry.pathHdrfix;
            p.StartInfo.Arguments = arg;
            p.Start();

            p.StandardOutput.ReadToEnd();
            p.WaitForExit(30 * 1000);
        }

        return outputPath;
    }

    #region Nconvert

    /// <summary>
    /// Nconvert 轉檔後取得檔案路徑
    /// </summary>
    public string Nconvert_PathToPath(string path, bool thumbnail, string type) {

        type = type.ToLower();
        string hashName = FileTypeHelper.FileToHash(path) + ".jpg";
        string filePath = Path.Combine(_tempDirImgProcessed, hashName);

        if (File.Exists(filePath)) {
            return filePath;
        }

        if (Directory.Exists(_tempDirImgProcessed) == false) {
            Directory.CreateDirectory(_tempDirImgProcessed);
        }

        string argOut = "";
        if (type == "jpg" || type == "jpeg") {
            argOut = "-out jpeg";
        }
        else if (type == "tif" || type == "tiff") {
            argOut = "-out tiff";
        }
        else if (type == "png") {
            argOut = "-clevel 0 -out png";
        }
        else {
            argOut = "-out bmp";
        }

        var thumb = thumbnail ? "-embedded_jpeg" : "";
        string arg = $"-quiet {thumb} -raw_camerabalance -raw_autobright -icc {argOut} -o \"{filePath}\" \"{path}\"";
        RunNconvert(arg, 60 * 1000);

        return filePath;
    }

    /// <summary>
    /// Nconvert 取得檔案資訊 (exif
    /// </summary>
    public string Nconvert_PathToInfo(string path) {
        string arg = $"-quiet -fullinfo \"{path}\"";
        return RunNconvert(arg, 60 * 1000);
    }

    /// <summary>
    /// 執行 Nconvert.exe
    /// </summary>
    /// <param name="arg"> 傳入的參數 </param>
    /// <param name="timeout"> 逾時(毫秒)</param>
    /// <returns></returns>
    private string RunNconvert(string arg, int timeout) {

        string NconvertExe = PluginRegistry.pathNConvert;

        using (var p = new Process()) {
            p.StartInfo.UseShellExecute = false;
            p.StartInfo.CreateNoWindow = true;
            p.StartInfo.RedirectStandardOutput = true;
            p.StartInfo.FileName = NconvertExe;
            p.StartInfo.Arguments = arg;
            p.Start();

            string result = p.StandardOutput.ReadToEnd();
            p.WaitForExit(timeout);

            return result;
        }
    }

    #endregion

    #region Raw

    /// <summary>
    ///
    /// </summary>
    /// <param name="path"></param>
    /// <param name="thumbnail"></param>
    /// <param name="minSize"> 預覽圖的寬或高小於這個數值，就讀取原始檔案 </param>
    public Stream Raw_PathToFile(string path, bool thumbnail = true, int minSize = 800) {

        if (thumbnail) {
            try {
                var stream = RawThumbnail_PathToStream(path, minSize, out int width, out int height);
                if (stream == null || width == 0 || height == 0) {
                    Debug.WriteLine("無法讀取 Raw 縮圖: " + path);
                }
                else {
                    Debug.WriteLine("縮圖ok: " + path);
                    return stream;
                }
            }
            catch {
                Debug.WriteLine("無法讀取 Raw 縮圖2: " + path);
            }
        }

        try {
            Debug.WriteLine("讀取Raw完整 開始: " + path);
            return RawFull_PathToTif(path);
        }
        catch { }

        throw new Exception("無法讀取 Raw 檔案: " + path);
    }

    /// <summary>
    ///
    /// </summary>
    public Stream RawThumbnail_PathToStream(string path, int minSize, out int width, out int height) {
        RawContext r;
        width = 0;
        height = 0;

        try {
            r = RawContext.OpenFile(path);
        }
        catch {
            Debug.WriteLine("讀取Raw縮圖 失敗: " + path);
            return null;
        }

        // 取得縮圖數量
        LibRawData libRawData = Marshal.PtrToStructure<LibRawData>(r.UnsafeGetHandle());
        var thumbCount = libRawData.ThumbnailList.ThumbCount;

        // 找出最大的縮圖
        int maxWidth = -1;
        ProcessedImage processedImage = null;
        for (int i = 0; i < thumbCount; i++) {
            try {
                r.UnpackThumbnail(i);
                var thumbnail = r.MakeDcrawMemoryThumbnail();
                var w = thumbnail.Width;
                var h = thumbnail.Height;
                if (w < minSize || h < minSize) {
                    thumbnail.Dispose();
                    continue;
                }
                if (w > maxWidth) {
                    maxWidth = w;
                    processedImage = thumbnail;
                }
                else {
                    thumbnail.Dispose();
                }
            }
            catch { }
        }

        // 如果沒有縮圖，就回傳 null
        if (processedImage == null) {
            Debug.WriteLine("讀取Raw縮圖 無符合的縮圖: " + path);
            r.Dispose();
            return null;
        }

        width = processedImage.Width;
        height = processedImage.Height;
        Stream ms;
        Debug.WriteLine("讀取Raw縮圖: " + $"w:{width} h:{height} type:{processedImage.ImageType}");

        if (processedImage.ImageType == ProcessedImageType.Jpeg) {
            ms = new MemoryStream(processedImage.AsSpan<byte>().ToArray());
        }
        else {
            var vips = ProcessedImageToVipsImage(processedImage);
            ms = new MemoryStream();
            vips.JpegsaveStream(ms);
        }
        Debug.WriteLine("讀取Raw縮圖 完成: " + path);

        processedImage.Dispose();
        r.Dispose();
        return ms;
    }

    /// <summary>
    ///
    /// </summary>
    public Stream RawFull_PathToTif(string path) {
        using var r = RawContext.OpenFile(path);
        r.Unpack();
        r.DcrawProcess(c => {
            c.UseCameraWb = true; // 使用機內白平衡
        });
        using var image = r.MakeDcrawMemoryImage();

        var vips = ProcessedImageToVipsImage(image);
        var stream = new MemoryStream();
        vips.JpegsaveStream(stream, q: 89);

        return stream;
    }

    #endregion

    #region vips

    /// <summary>
    /// 
    /// </summary>
    /// <param name="rgbImage"></param>
    /// <returns></returns>
    public NetVips.Image ProcessedImageToVipsImage(ProcessedImage rgbImage) {
        int width = rgbImage.Width;
        int height = rgbImage.Height;
        int bands = rgbImage.Channels;

        byte[] data = new byte[width * height * bands];
        Marshal.Copy(rgbImage.DataPointer, data, 0, data.Length);

        NetVips.Image vipsImage = NetVips.Image.NewFromMemory(data, width, height, bands, Enums.BandFormat.Uchar);

        return vipsImage;
    }

    /// <summary>
    /// 取得一個在租用期間不會被 cache 淘汰的 NetVips.Image。
    /// </summary>
    private VipsImageLease AcquireNetVips(string path, string type) {

        lock (_vipsCache) {

            FileInfo sourceInfo = new(path);
            string key = $"{GetFileVersionCacheKey(path, sourceInfo)}_{type}";
            for (int i = 0; i < _vipsCache.Count; i++) {
                if (_vipsCache[i].key == key) {
                    CachedVipsImage cached = _vipsCache[i];
                    cached.leaseCount++;
                    _vipsCache.RemoveAt(i);
                    _vipsCache.Add(cached);
                    return new VipsImageLease(this, cached);
                }
            }

            Stream stream = null;
            NetVips.Image img;
            if (sourceInfo.Length >= VipsStreamThresholdBytes) {
                // Keep large inputs file-backed; FileShare.Delete avoids holding a delete-blocking handle.
                stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete, 4096, FileOptions.RandomAccess);
                try {
                    img = NetVips.Image.NewFromStream(stream, access: NetVips.Enums.Access.Random);
                }
                catch {
                    stream.Dispose();
                    throw;
                }
            } else {
                var buffer = File.ReadAllBytes(path);
                img = NetVips.Image.NewFromBuffer(buffer, access: NetVips.Enums.Access.Random);
            }

            CachedVipsImage entry = new() {
                key = key,
                vips = img,
                stream = stream,
                leaseCount = 1
            };
            _vipsCache.Add(entry);

            // 快取最多保留 5 個未淘汰項目；仍有工作使用的項目會在最後一個 lease 釋放時才關閉。
            if (_vipsCache.Count > 5) {
                CachedVipsImage oldest = _vipsCache[0];
                _vipsCache.RemoveAt(0);
                RetireVipsImage(oldest);
            }
            return new VipsImageLease(this, entry);
        }
    }

    private void ReleaseVipsImage(CachedVipsImage entry) {
        lock (_vipsCache) {
            entry.leaseCount--;
            if (entry.leaseCount == 0 && entry.retired) DisposeVipsImage(entry);
        }
    }

    private void RetireVipsImage(CachedVipsImage entry) {
        entry.retired = true;
        if (entry.leaseCount == 0) DisposeVipsImage(entry);
    }

    private static void DisposeVipsImage(CachedVipsImage entry) {
        entry.vips?.Dispose();
        entry.vips = null;
        entry.stream?.Dispose();
        entry.stream = null;
    }

    /// <summary>
    /// 使用 wpf 來取得圖片 size
    /// </summary>
    /// <param name="path"></param>
    /// <param name="autoOrientation"> 如果圖片有旋轉90°或270°，就長寬對調 </param>
    public int[] GetImgSize(string path, bool autoOrientation) {

        FileInfo fileInfo = new(path);
        string cacheKey = GetFileVersionCacheKey(path, fileInfo);

        // 先檢查 cache 裡面有沒有
        lock (_imgSizeCache) {
            if (_imgSizeCache.TryGetValue(cacheKey, out int[] cachedSize)) {
                return GetOrientedSize(cachedSize, autoOrientation, GetImgExifOrientation(path));
            }
        }

        int w = 0;
        int h = 0;
        PathToBitmapSource(path, (BitmapSource img) => {
            w = img.PixelWidth;
            h = img.PixelHeight;
        });

        int[] ret = new int[] { w, h };
        lock (_imgSizeCache) {
            _imgSizeCache[cacheKey] = ret;
        }

        return GetOrientedSize(ret, autoOrientation, GetImgExifOrientation(path));
    }

    private static int[] GetOrientedSize(int[] size, bool autoOrientation, int orientation) =>
        autoOrientation && orientation >= 5 && orientation <= 8
            ? new[] { size[1], size[0] }
            : size;

    private int GetImgExifOrientation(string path) {
        FileInfo fileInfo = new(path);
        string cacheKey = GetFileVersionCacheKey(path, fileInfo);
        lock (_imgExifOrientationCache) {
            if (_imgExifOrientationCache.TryGetValue(cacheKey, out int orientation)) return orientation;
        }

        string fileType = FileTypeHelper.GetFileType(path);
        bool usesContainerExif = fileType is "png" or "apng" or "webp" or "webps" or "tif" or "tiff";
        int? fileOrientation = usesContainerExif ? ReadExifOrientationFromFile(path, fileType) : null;
        int result = fileOrientation ?? 1;

        // JPEG 沿用快速 WPF 查詢；容器 metadata 未讀到方向時，只讓 WPF 補讀已知支援的格式。
        if (!fileOrientation.HasValue && SupportsWpfMetadata(fileType)) {
            try {
                PathToBitmapSource(path, img => {
                    int wpfOrientation = GetExifOrientation(img.Metadata as BitmapMetadata);
                    if (wpfOrientation != 1) result = wpfOrientation;
                });
            }
            catch {
                // 部分 VIPS 支援的格式無法由 WPF 解碼；方向預設為未旋轉。
            }
        }

        CacheImgExifOrientation(path, result, fileInfo);
        return result;
    }

    private static bool SupportsWpfMetadata(string fileType) => fileType is
        "jpg" or "jpeg" or "png" or "apng" or "tif" or "tiff" or "wdp" or "wmp" or "jxr";

    private static int? ReadExifOrientationFromFile(string path, string fileType) {
        try {
            var directories = fileType is "tif" or "tiff"
                ? TiffMetadataReader.ReadMetadata(path)
                : MetadataExtractor.ImageMetadataReader.ReadMetadata(path);
            foreach (var directory in directories) {
                if (directory is ExifIfd0Directory) {
                    MetadataExtractor.Directory metadataDirectory = directory;
                    if (MetadataExtractor.DirectoryExtensions.TryGetInt32(metadataDirectory, ExifDirectoryBase.TagOrientation, out int orientation) &&
                        orientation >= 1 && orientation <= 8) {
                        return orientation;
                    }
                }
            }
        }
        catch {
            // 交由 WPF fallback 嘗試讀取。
        }

        return null;
    }

    private void CacheImgExifOrientation(string path, int orientation, FileInfo fileInfo = null) {
        fileInfo ??= new FileInfo(path);
        string cacheKey = GetFileVersionCacheKey(path, fileInfo);
        lock (_imgExifOrientationCache) {
            _imgExifOrientationCache[cacheKey] = orientation;
        }
    }

    private static string GetFileVersionCacheKey(string path, FileInfo fileInfo) =>
        $"{FileTypeHelper.FileToHash(path)}_{fileInfo.Length}_{fileInfo.LastWriteTimeUtc.Ticks}";

    private static int GetExifOrientation(BitmapMetadata metadata) {
        if (metadata == null) return 1;
        try {
            object value = metadata.GetQuery("/app1/ifd/exif:{uint=274}");
            return value != null && int.TryParse(value.ToString(), NumberStyles.Integer, CultureInfo.InvariantCulture, out int orientation)
                && orientation >= 1 && orientation <= 8
                ? orientation
                : 1;
        }
        catch {
            return 1;
        }
    }

    /// <summary>
    /// 取得圖片的 size，然後把檔案處理成 vips 可以載入的格式，寫入到暫存資料夾
    /// </summary>
    public ImageInitInfo GetImgInitInfo(string path, string type, string vipsType, bool useRegionalTiles = false) {

        ImageInitInfo imgInfo = new();

        using VipsImageLease sourceLease = type == "tif" || type == "tiff" ? AcquireNetVips(path, "tif") : null;
        NetVips.Image sourceImage = sourceLease?.Image;
        if (type == "tif" || type == "tiff") {
            // 超過 JPEG 尺寸上限的 TIFF 原本就使用預覽；保留 Canvas 的既有預覽降級行為。
            int maxDimension = useRegionalTiles ? int.MaxValue : JpegMaxDimension;
            if (TryCreateLargeImageInitInfo(path, type, vipsType, sourceImage, maxDimension, out imgInfo,
                WebGLPreviewMaxPixels, limitByPixels: useRegionalTiles)) return imgInfo;
        }

        string path100 = PathToImgProcessed(path, vipsType);

        if (File.Exists(path100)) {
            // 調整最後存取時間，延後暫存被清理
            File.SetLastAccessTime(path100, DateTime.Now);
            return GetImgInitInfo(path100, "vips", vipsType, useRegionalTiles);
        }

        if (type == "vips") {
            int[] wh = GetImgSize(path, true);
            if (useRegionalTiles && RequiresWebGLRegionalTiles(wh[0], wh[1])) {
                using VipsImageLease regionalSourceLease = AcquireNetVips(path, type);
                sourceImage = regionalSourceLease.Image;
                if (TryCreateLargeImageInitInfo(path, type, vipsType, sourceImage, int.MaxValue, out imgInfo,
                    WebGLPreviewMaxPixels, limitByPixels: true)) return imgInfo;
            }

            // 瀏覽器不一定會依 WebP/PNG 等格式的 EXIF Orientation 轉向；提供原尺寸來源前先固定像素方向。
            string orientedPath = GetOrientationNormalizedPath(path, vipsType);
            if (orientedPath != path) {
                using VipsImageLease orientedLease = AcquireNetVips(orientedPath, "vips");
                NetVips.Image orientedImage = orientedLease.Image;
                imgInfo.width = orientedImage.Width;
                imgInfo.height = orientedImage.Height;
                imgInfo.code = "1";
                imgInfo.path = orientedPath;
                imgInfo.vipsType = vipsType;
                return imgInfo;
            }

            imgInfo.width = wh[0];
            imgInfo.height = wh[1];
            imgInfo.code = "1";
            imgInfo.path = path;
            imgInfo.vipsType = vipsType;
            return imgInfo;
        }
        else {
            StartWindow.isRunGC = true; // 定時執行GC
        }

        if (type == "tif" || type == "tiff") {
            NetVips.Image vImg = sourceImage;
            VipsSave(vImg, path100, "auto");

            return GetImgInitInfo(path100, "vips", vipsType, useRegionalTiles);
        }

        if (type == "avif") {
            using VipsImageLease imageLease = AcquireNetVips(path, "avif");
            NetVips.Image vImg = imageLease.Image;
            if (useRegionalTiles && TryCreateLargeImageInitInfo(path, type, vipsType, vImg, int.MaxValue, out ImageInitInfo largeImageInfo,
                WebGLPreviewMaxPixels, limitByPixels: true)) return largeImageInfo;
            VipsSave(vImg, path100, "auto");
            imgInfo.width = vImg.Width;
            imgInfo.height = vImg.Height;
            imgInfo.code = "1";
            imgInfo.path = path100;
            imgInfo.vipsType = vipsType;
            return imgInfo;
        }

        if (type == "jpg") {
            if (IsCMYK(path)) {
                // 如果是 CMYK，就先套用顏色
                using VipsImageLease imageLease = AcquireNetVips(path, "jpg");
                NetVips.Image vImg = imageLease.Image;
                using (var vImg2 = vImg.IccTransform("srgb", Enums.PCS.Lab, Enums.Intent.Perceptual)) {
                    vImg2.Jpegsave(path100);
                }
                return GetImgInitInfo(path100, "vips", vipsType, useRegionalTiles);
            }
            else {
                return GetImgInitInfo(path, "vips", vipsType, useRegionalTiles);
            }
        }

        if (type == "bitmap") {
            using (Bitmap bmp = new Bitmap(path)) {
                using (NetVips.Image vImg = bmp.ToVips()) {
                    VipsSave(vImg, path100, "auto");
                }
            }
            return GetImgInitInfo(path100, "vips", vipsType, useRegionalTiles);
        }

        if (type == "wpf") {
            PathToBitmapSource(path, (BitmapSource bi) => {
                using (Bitmap bmp = BitmapSourceToBitmap(bi)) {
                    using (NetVips.Image vImg = bmp.ToVips()) {
                        VipsSave(vImg, path100, "auto");
                    }
                }
            });
            return GetImgInitInfo(path100, "vips", vipsType, useRegionalTiles);
        }

        if (type == "uwp") {
            using var ms = Uwp_PathToStream(path, Windows.Graphics.Imaging.BitmapEncoder.TiffEncoderId).Result;
            using var vImg = NetVips.Image.NewFromStream(ms);
            VipsSave(vImg, path100, "png");
            return GetImgInitInfo(path100, "vips", vipsType, useRegionalTiles);
        }

        if (type == "hdrfix") {
            var pngPath = Jxr_PathToPath(path);
            return GetImgInitInfo(pngPath, "vips", vipsType, useRegionalTiles);
        }

        if (type == "magick") {
            using (MagickImage image = GetMagickImage(path)) {
                // 如果不透明
                if (image.IsOpaque) {
                    image.Write(path100, MagickFormat.Jpeg);
                }
                else {
                    using (var ms = new MemoryStream()) {
                        image.Write(ms, MagickFormat.Tiff);
                        ms.Position = 0;
                        using (NetVips.Image vImg = NetVips.Image.NewFromStream(ms, access: NetVips.Enums.Access.Random)) {
                            VipsSave(vImg, path100, "png");
                        }
                    }
                }
                image.Dispose();
            }

            return GetImgInitInfo(path100, "vips", vipsType, useRegionalTiles);
        }

        if (type == "rawFull" || type == "rawThumbnail") {

            try {
                bool isThumbnail = type == "rawThumbnail";
                using (var stream = Raw_PathToFile(path, isThumbnail, 800)) {
                    // 儲存檔案
                    using (var fileStream = File.Create(path100)) {
                        stream.Seek(0, SeekOrigin.Begin);
                        stream.CopyTo(fileStream);
                    }
                    Debug.WriteLine("Raw to vips: " + path100);
                    return GetImgInitInfo(path100, "vips", vipsType, useRegionalTiles);
                }
            }
            catch {
                // 如果無法取得 raw ，就改用 MagickImage
                using (var image = new MagickImage(path)) {
                    image.Write(path100, MagickFormat.Jpeg);
                    Debug.WriteLine("Magick ok: " + path);
                    return GetImgInitInfo(path100, "vips", vipsType, useRegionalTiles);
                }
            }
        }

        if (type == "clip") {
            using (Stream stream = ClipToStream(path)) {
                using (FileStream fileStream = File.Create(path100)) {
                    stream.Seek(0, SeekOrigin.Begin);
                    stream.CopyTo(fileStream);
                }
            }
            return GetImgInitInfo(path100, "vips", vipsType, useRegionalTiles);
        }

        if (type == "extractPng") {
            using (Stream stream = ExtractPngToStream(path)) {
                using (FileStream fileStream = File.Create(path100)) {
                    stream.Seek(0, SeekOrigin.Begin);
                    stream.CopyTo(fileStream);
                }
            }
            return GetImgInitInfo(path100, "vips", vipsType, useRegionalTiles);
        }

        if (type == "nconvert" || type == "nconvertPng" || type == "nconvertJpg") {
            string nconvertPath;
            if (type == "nconvertPng") {
                nconvertPath = Nconvert_PathToPath(path, false, "png");
            }
            else {
                nconvertPath = Nconvert_PathToPath(path, false, "jpg");
            }
            return GetImgInitInfo(nconvertPath, "vips", vipsType, useRegionalTiles);
        }

        return imgInfo;
    }

    /// <summary>
    /// 縮放圖片，並且存入暫存資料夾 (只支援 jpg、png、tif、webp)
    /// </summary>
    public string VipsResize(string path, double scale, string fileType, string vipsType) {

        int sourceOrientation = GetImgExifOrientation(path);
        string orientationSuffix = sourceOrientation == 1 ? "" : $"_o{sourceOrientation}";
        string hashName = $"{FileTypeHelper.FileToHash(path)}_{vipsType}{orientationSuffix}_{scale}.jpg"; // 暫存檔案名稱
        string filePath = Path.Combine(_tempDirImgZoom, hashName); // 暫存檔案的路徑

        // 如果檔案已經存在，就直接回傳
        if (File.Exists(filePath)) {
            // 調整最後存取時間，延後暫存被清理
            File.SetLastAccessTime(filePath, DateTime.Now);
            return filePath;
        }

        if (Directory.Exists(_tempDirImgZoom) == false) {
            Directory.CreateDirectory(_tempDirImgZoom);
        }

        string imgProcessed = GetVipsInputPath(path, vipsType);

        int exifOrientation = GetImgExifOrientation(imgProcessed);
        using VipsImageLease imageLease = AcquireNetVips(imgProcessed, fileType);
        NetVips.Image im = imageLease.Image;
        using NetVips.Image orientedImage = exifOrientation == 1 ? null : im.Autorot();
        NetVips.Image resizeSource = orientedImage ?? im;
        Enums.Kernel? kernel = Enums.Kernel.Lanczos3;
        double? gap = 4;
        if (resizeSource.Width > 30000 || resizeSource.Height > 30000) {
            kernel = Enums.Kernel.Nearest;
            gap = null;
        }
        using NetVips.Image imR = resizeSource.Resize(scale: scale, kernel: kernel, gap: gap);
        VipsSave(imR, filePath, "auto");

        StartWindow.isRunGC = true;

        return filePath;
    }

    /// <summary>
    /// 依來源層的格子座標產生並快取圖片區塊；先裁出來源範圍及濾波邊界，再縮放成要求的格子。
    /// </summary>
    public Stream VipsTile(string path, int tileX, int tileY, double scale, int tileSize, int gutter, string fileType, string vipsType) {
        if (!double.IsFinite(scale) || scale <= 0 || scale > 1) throw new ArgumentOutOfRangeException(nameof(scale));
        if (tileX < 0 || tileY < 0 || tileSize < 64 || tileSize > 2048 || gutter < 0 || gutter > 16) {
            throw new ArgumentOutOfRangeException(nameof(tileSize));
        }

        string decoderKey = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes($"{vipsType}\n{fileType}")));
        FileInfo sourceInfo = new(path);
        string sourceVersion = $"{sourceInfo.Length}_{sourceInfo.LastWriteTimeUtc.Ticks}";
        string cacheName = $"{FileTypeHelper.FileToHash(path)}_{sourceVersion}_{decoderKey}_{VipsTileAlgorithmVersion}_{scale.ToString("R", CultureInfo.InvariantCulture)}_{tileSize}_{gutter}_{tileX}_{tileY}.png";
        string cachePath = Path.Combine(_tempDirImgZoom, cacheName);
        if (File.Exists(cachePath)) {
            File.SetLastAccessTimeUtc(cachePath, DateTime.UtcNow);
            return new FileStream(cachePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
        }

        Lazy<byte[]> inFlight = _vipsTileInFlight.GetOrAdd(cachePath, _ => new Lazy<byte[]>(
            () => GenerateVipsTile(path, tileX, tileY, scale, tileSize, gutter, fileType, vipsType, cachePath),
            LazyThreadSafetyMode.ExecutionAndPublication));
        try {
            _ = inFlight.Value;
            File.SetLastAccessTimeUtc(cachePath, DateTime.UtcNow);
            return new FileStream(cachePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
        }
        finally {
            if (_vipsTileInFlight.TryGetValue(cachePath, out Lazy<byte[]> current) && ReferenceEquals(current, inFlight)) {
                _vipsTileInFlight.TryRemove(cachePath, out _);
            }
        }
    }

    private double GetWebGLPreviewScale(int width, int height, int maxDimension) {
        double pixelScale = Math.Sqrt((double)WebGLPreviewMaxPixels / ((long)width * height));
        double dimensionScale = (double)maxDimension / Math.Max(width, height);
        return Math.Min(1, Math.Min(pixelScale, dimensionScale));
    }

    private bool RequiresWebGLRegionalTiles(int width, int height) => (long)width * height > WebGLPreviewMaxPixels;

    private bool TryCreateLargeImageInitInfo(string path, string type, string vipsType, NetVips.Image sourceImage,
        int maxDimension, out ImageInitInfo imgInfo, long maxPixels = WebGLPreviewMaxPixels, bool limitByPixels = false) {
        imgInfo = null;
        int orientation = GetImgExifOrientation(path);
        using NetVips.Image orientedSource = orientation == 1 ? null : sourceImage.Autorot();
        NetVips.Image previewSource = orientedSource ?? sourceImage;
        bool exceedsDimension = Math.Max(previewSource.Width, previewSource.Height) > maxDimension;
        bool exceedsPixelBudget = limitByPixels && (long)previewSource.Width * previewSource.Height > maxPixels;
        if (!exceedsDimension && !exceedsPixelBudget) return false;

        double previewScale = GetWebGLPreviewScale(previewSource.Width, previewSource.Height, maxDimension);
        imgInfo = new ImageInitInfo {
            width = previewSource.Width,
            height = previewSource.Height,
            code = "1",
            path = VipsResize(path, previewScale, type, vipsType),
            previewScale = previewScale,
            tileOnlyOriginal = true,
            vipsType = vipsType
        };
        return true;
    }

    private string GetVipsInputPath(string path, string vipsType) {
        // 超過 JPEG 尺寸上限的 TIFF 直接從來源讀取，縮圖與 tile 分別輸出成瀏覽器支援的格式。
        if (vipsType == "tif") {
            using VipsImageLease imageLease = AcquireNetVips(path, "tif");
            NetVips.Image image = imageLease.Image;
            if (image.Width > JpegMaxDimension || image.Height > JpegMaxDimension) return path;
        }

        string orientedPath = PathToImgProcessed(path, $"{vipsType}_autorot", "png");
        if (File.Exists(orientedPath)) {
            File.SetLastAccessTime(orientedPath, DateTime.Now);
            return orientedPath;
        }

        string imgProcessed = PathToImgProcessed(path, vipsType, "jpg");
        if (File.Exists(imgProcessed)) {
            File.SetLastAccessTime(imgProcessed, DateTime.Now);
            return imgProcessed;
        }

        imgProcessed = PathToImgProcessed(path, vipsType, "png");
        if (File.Exists(imgProcessed)) {
            File.SetLastAccessTime(imgProcessed, DateTime.Now);
            return imgProcessed;
        }

        return path;
    }

    private string GetOrientationNormalizedPath(string path, string vipsType) {
        if (GetImgExifOrientation(path) == 1) return path;

        string normalizedPath = PathToImgProcessed(path, $"{vipsType}_autorot", "png");
        if (File.Exists(normalizedPath)) {
            File.SetLastAccessTime(normalizedPath, DateTime.Now);
            return normalizedPath;
        }

        using VipsImageLease imageLease = AcquireNetVips(path, vipsType);
        NetVips.Image image = imageLease.Image;
        using NetVips.Image orientedImage = image.Autorot();
        string temporaryPath = normalizedPath + "." + Guid.NewGuid().ToString("N") + ".tmp.png";
        try {
            VipsSave(orientedImage, temporaryPath, "png");
            try {
                File.Move(temporaryPath, normalizedPath);
            }
            catch (IOException) when (File.Exists(normalizedPath)) {
                File.Delete(temporaryPath);
            }
            File.SetLastAccessTime(normalizedPath, DateTime.Now);
            return normalizedPath;
        }
        finally {
            if (File.Exists(temporaryPath)) File.Delete(temporaryPath);
        }
    }

    private byte[] GenerateVipsTile(string path, int tileX, int tileY, double scale, int tileSize, int gutter, string fileType, string vipsType, string cachePath) {
        bool diagnoseLargeTiff = vipsType == "tif" && new FileInfo(path).Length >= VipsStreamThresholdBytes;
        Stopwatch total = Stopwatch.StartNew();
        Stopwatch phase = Stopwatch.StartNew();
        if (diagnoseLargeTiff) {
            Console.WriteLine($"[Tiefsee vips tile] 開始：{tileX},{tileY} scale={scale.ToString("R", CultureInfo.InvariantCulture)}");
        }

        string imgProcessed = GetVipsInputPath(path, vipsType);
        if (diagnoseLargeTiff) {
            Console.WriteLine($"[Tiefsee vips tile] 來源就緒：{phase.ElapsedMilliseconds} ms，{Path.GetFileName(imgProcessed)}");
            phase.Restart();
        }

        using VipsImageLease imageLease = AcquireNetVips(imgProcessed, fileType);
        NetVips.Image image = imageLease.Image;
        int exifOrientation = GetImgExifOrientation(imgProcessed);
        using NetVips.Image orientedImage = exifOrientation == 1 ? null : image.Autorot();
        NetVips.Image tileSource = orientedImage ?? image;
        if (diagnoseLargeTiff) {
            Console.WriteLine($"[Tiefsee vips tile] 開啟來源：{phase.ElapsedMilliseconds} ms，{tileSource.Width} x {tileSource.Height}，EXIF orientation={exifOrientation}");
            phase.Restart();
        }
        using NetVips.Image resized = tileSource.Resize(scale, kernel: Enums.Kernel.Lanczos3, gap: 4);
        long left = (long)tileX * tileSize;
        long top = (long)tileY * tileSize;
        if (left >= resized.Width || top >= resized.Height) throw new ArgumentOutOfRangeException(nameof(tileX), "圖片格子超出來源範圍");
        int contentWidth = (int)Math.Min(tileSize, resized.Width - left);
        int contentHeight = (int)Math.Min(tileSize, resized.Height - top);
        int cropLeft = (int)Math.Max(0, left - gutter);
        int cropTop = (int)Math.Max(0, top - gutter);
        int cropRight = (int)Math.Min(resized.Width, left + contentWidth + gutter);
        int cropBottom = (int)Math.Min(resized.Height, top + contentHeight + gutter);
        // 固定各 tile 的來源 ROI 尺寸，避免 VIPS gap 預縮小因 ROI 尺寸不同而產生不同取樣結果。
        int sourceHalo = (int)Math.Min(Math.Max(tileSource.Width, tileSource.Height), Math.Ceiling(16.0 / scale));
        int sourceGridPeriod = GetTileSourceGridPeriod(scale);
        int sourceWidth = checked((int)Math.Ceiling((tileSize + 2d * gutter) / scale) + 2 * sourceHalo + sourceGridPeriod + 4);
        int sourceHeight = sourceWidth;
        int sourcePadding = Math.Max(sourceWidth, sourceHeight);
        using NetVips.Image extendedImage = tileSource.Embed(
            sourcePadding,
            sourcePadding,
            checked(tileSource.Width + sourcePadding * 2),
            checked(tileSource.Height + sourcePadding * 2),
            extend: Enums.Extend.Copy);

        int sourceLeft = AlignTileSourceOrigin((int)Math.Floor(cropLeft / scale) - sourceHalo, sourceGridPeriod);
        int sourceTop = AlignTileSourceOrigin((int)Math.Floor(cropTop / scale) - sourceHalo, sourceGridPeriod);
        using NetVips.Image sourceRegion = extendedImage.Crop(sourceLeft + sourcePadding, sourceTop + sourcePadding, sourceWidth, sourceHeight);
        using NetVips.Image resizedRegion = sourceRegion.Resize(scale, kernel: Enums.Kernel.Lanczos3, gap: 4);

        // ROI 起點已對齊全圖輸出格點，因此這兩個偏移應為整數像素。
        int localLeft = (int)Math.Round(cropLeft - sourceLeft * scale, MidpointRounding.AwayFromZero);
        int localTop = (int)Math.Round(cropTop - sourceTop * scale, MidpointRounding.AwayFromZero);
        int cropWidth = cropRight - cropLeft;
        int cropHeight = cropBottom - cropTop;
        // Region Resize rounds its output dimensions independently; at the far edge this can leave a one-pixel overrun.
        int maxLocalLeft = resizedRegion.Width - cropWidth;
        int maxLocalTop = resizedRegion.Height - cropHeight;
        if (maxLocalLeft >= 0 && localLeft > maxLocalLeft && localLeft - maxLocalLeft == 1) localLeft = maxLocalLeft;
        if (maxLocalTop >= 0 && localTop > maxLocalTop && localTop - maxLocalTop == 1) localTop = maxLocalTop;
        if (localLeft < 0 || localTop < 0 || localLeft + cropWidth > resizedRegion.Width || localTop + cropHeight > resizedRegion.Height) {
            throw new InvalidOperationException($"局部縮放結果不足以輸出 tile：{resizedRegion.Width} x {resizedRegion.Height}，偏移 {localLeft},{localTop}，要求 {cropWidth} x {cropHeight}");
        }
        using NetVips.Image crop = resizedRegion.Crop(localLeft, localTop, cropWidth, cropHeight);
        if (diagnoseLargeTiff) {
            Console.WriteLine($"[Tiefsee vips tile] 來源裁切 ({sourceLeft},{sourceTop}) {sourceRegion.Width} x {sourceRegion.Height}；開始縮放與編碼：輸出區域 {crop.Width} x {crop.Height}");
            phase.Restart();
        }
        byte[] png = crop.PngsaveBuffer();
        if (diagnoseLargeTiff) {
            Console.WriteLine($"[Tiefsee vips tile] 完成輸出：{phase.ElapsedMilliseconds} ms，{png.Length} bytes；總計 {total.ElapsedMilliseconds} ms");
        }

        Directory.CreateDirectory(_tempDirImgZoom);
        string temporaryPath = cachePath + "." + Guid.NewGuid().ToString("N") + ".tmp";
        try {
            File.WriteAllBytes(temporaryPath, png);
            try {
                File.Move(temporaryPath, cachePath);
            }
            catch (IOException) when (File.Exists(cachePath)) {
                File.Delete(temporaryPath);
            }
            File.SetLastAccessTimeUtc(cachePath, DateTime.UtcNow);
            return png;
        }
        finally {
            if (File.Exists(temporaryPath)) File.Delete(temporaryPath);
        }
    }

    private static int GetTileSourceGridPeriod(double scale) {
        const int scaleDenominator = 1000;
        int scaleNumerator = (int)Math.Round(scale * scaleDenominator, MidpointRounding.AwayFromZero);
        if (scaleNumerator <= 0 || Math.Abs(scaleNumerator / (double)scaleDenominator - scale) > 1e-12) {
            // 預覽比例等非金字塔級距不使用過大的精確對齊週期。
            return 1;
        }

        int gcd = GreatestCommonDivisor(scaleNumerator, scaleDenominator);
        return scaleDenominator / gcd;
    }

    private static int AlignTileSourceOrigin(int sourceOrigin, int sourceGridPeriod) {
        int remainder = sourceOrigin % sourceGridPeriod;
        if (remainder < 0) remainder += sourceGridPeriod;
        return sourceOrigin - remainder;
    }

    private static int GreatestCommonDivisor(int a, int b) {
        while (b != 0) (a, b) = (b, a % b);
        return Math.Abs(a);
    }

    /// <summary>
    /// 將圖片的 base64 存入暫存資料夾
    /// </summary>
    public string Base64ToTempImg(string path, string base64) {
        string path100 = PathToImgProcessed(path, "base64");
        // 把 Base64 儲存成檔案
        try {
            // 去掉開頭的 data:image/png;base64,
            int x = base64.IndexOf("base64,");
            if (x != -1) { base64 = base64.Substring(x + 7); }

            byte[] buffer = Convert.FromBase64String(base64);
            File.WriteAllBytes(path100, buffer);
            return path;
        }
        catch (Exception e) {
            Console.WriteLine(e.Message);
            return "false";
        }
    }

    /// <summary>
    /// vips 儲存檔案
    /// </summary>
    /// <param name="vImg"></param>
    /// <param name="path"></param>
    /// <param name="type"> jpg/png/auto </param>
    private void VipsSave(NetVips.Image vImg, string path, string type) {

        if (type == "jpg") {
            vImg.Jpegsave(filename: path, q: 100);
        }
        else if (type == "png") {
            vImg.Pngsave(
                filename: path,
                compression: 0,
                interlace: false,
                filter: Enums.ForeignPngFilter.None
            );
        }
        else {
            bool transparent = VipsHasTransparent(vImg);
            if (transparent) {
                VipsSave(vImg, path, "png");
            }
            else {
                VipsSave(vImg, path, "jpg");
            }
        }
    }

    /// <summary>
    /// 檢查 vips 是否包含透明色
    /// </summary>
    public bool VipsHasTransparent(NetVips.Image im) {

        int bands = im.Bands; // 取得色板的數量，例如 rgb=4、rgba=4
        bool hasAlpha =
           bands == 2 ||
           bands > 4 ||
           (bands == 4 && im.Interpretation != Enums.Interpretation.Cmyk);

        // 如果不含透明色板就直接回傳
        if (hasAlpha == false) { return false; }
        // 取得最後一個色板的最小值
        var d = im[im.Bands - 1].Min();
        // 如果不是 255，表示有不透明的顏色
        return d != 255;
    }

    /// <summary>
    /// 取得「ImgProcessed」暫存資料夾裡面的檔案名稱
    /// </summary>
    private string PathToImgProcessed(string path, string vipsType, string ext = "jpg") {
        string hashName = $"{FileTypeHelper.FileToHash(path)}_{vipsType}.{ext}"; // 暫存檔案名稱
        string filePath = Path.Combine(_tempDirImgProcessed, hashName); // 暫存檔案的路徑
        if (Directory.Exists(_tempDirImgProcessed) == false) {
            Directory.CreateDirectory(_tempDirImgProcessed);
        }
        return filePath;
    }

    #endregion
}
