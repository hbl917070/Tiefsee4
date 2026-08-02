//
// https://stackoverflow.com/questions/21751747/extract-thumbnail-for-any-file-in-windows
//

using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;
using ComTypes = System.Runtime.InteropServices.ComTypes;

namespace Tiefsee;

/// <summary>
/// 取得檔案總管的圖示 
/// </summary>
public class WindowsThumbnailProvider {
    private const string IShellItem2Guid = "7E9FB0D3-919F-4307-AB2E-9B1860310C93";

    [DllImport("shell32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    internal static extern int SHCreateItemFromParsingName(
        [MarshalAs(UnmanagedType.LPWStr)] string path,
        // Optional bind context; used for virtual archive entry Shell items.
        ComTypes.IBindCtx pbc,
        ref Guid riid,
        [MarshalAs(UnmanagedType.Interface)] out IShellItem shellItem);

    [DllImport("ole32.dll")]
    private static extern int CreateBindCtx(
        uint reserved,
        [MarshalAs(UnmanagedType.Interface)] out ComTypes.IBindCtx bindCtx);

    [DllImport("gdi32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    internal static extern bool DeleteObject(IntPtr hObject);

    private const uint FileAttributeNormal = 0x00000080;

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct Win32FindData {
        public uint dwFileAttributes;
        public ComTypes.FILETIME ftCreationTime;
        public ComTypes.FILETIME ftLastAccessTime;
        public ComTypes.FILETIME ftLastWriteTime;
        public uint nFileSizeHigh;
        public uint nFileSizeLow;
        public uint dwReserved0;
        public uint dwReserved1;

        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 260)]
        public string cFileName;

        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 14)]
        public string cAlternateFileName;
    }

    [ComVisible(true)]
    [Guid("01E18D10-4D8D-11D2-855D-006008059367")]
    [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IFileSystemBindData {
        [PreserveSig]
        int SetFindData(ref Win32FindData findData);

        [PreserveSig]
        int GetFindData(out Win32FindData findData);
    }

    [ComVisible(true)]
    [ClassInterface(ClassInterfaceType.None)]
    private sealed class FileSystemBindData : IFileSystemBindData {
        private Win32FindData _findData;

        public int SetFindData(ref Win32FindData findData) {
            _findData = findData;
            return 0;
        }

        public int GetFindData(out Win32FindData findData) {
            findData = _findData;
            return 0;
        }
    }

    [ComImport]
    [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    [Guid("43826d1e-e718-42ee-bc55-a1e261c37bfe")]
    internal interface IShellItem {
        void BindToHandler(IntPtr pbc,
            [MarshalAs(UnmanagedType.LPStruct)] Guid bhid,
            [MarshalAs(UnmanagedType.LPStruct)] Guid riid,
            out IntPtr ppv);

        void GetParent(out IShellItem ppsi);
        void GetDisplayName(SIGDN sigdnName, out IntPtr ppszName);
        void GetAttributes(uint sfgaoMask, out uint psfgaoAttribs);
        void Compare(IShellItem psi, uint hint, out int piOrder);
    };

    internal enum SIGDN : uint {
        NORMALDISPLAY = 0,
        PARENTRELATIVEPARSING = 0x80018001,
        PARENTRELATIVEFORADDRESSBAR = 0x8001c001,
        DESKTOPABSOLUTEPARSING = 0x80028000,
        PARENTRELATIVEEDITING = 0x80031001,
        DESKTOPABSOLUTEEDITING = 0x8004c000,
        FILESYSPATH = 0x80058000,
        URL = 0x80068000
    }

    internal enum HResult {
        Ok = 0x0000,
        False = 0x0001,
        InvalidArguments = unchecked((int)0x80070057),
        OutOfMemory = unchecked((int)0x8007000E),
        NoInterface = unchecked((int)0x80004002),
        Fail = unchecked((int)0x80004005),
        ElementNotFound = unchecked((int)0x80070490),
        TypeElementNotFound = unchecked((int)0x8002802B),
        NoObject = unchecked((int)0x800401E5),
        Win32ErrorCanceled = 1223,
        Canceled = unchecked((int)0x800704C7),
        ResourceInUse = unchecked((int)0x800700AA),
        AccessDenied = unchecked((int)0x80030005)
    }

    [ComImportAttribute()]
    [GuidAttribute("bcc18b79-ba16-442f-80c4-8a59c30c463b")]
    [InterfaceTypeAttribute(ComInterfaceType.InterfaceIsIUnknown)]
    internal interface IShellItemImageFactory {
        [PreserveSig]
        HResult GetImage(
        [In, MarshalAs(UnmanagedType.Struct)] NativeSize size,
        [In] ThumbnailOptions flags,
        [Out] out IntPtr phbm);
    }

    [StructLayout(LayoutKind.Sequential)]
    internal struct NativeSize {
        private int width;
        private int height;

        public int Width { set { width = value; } }
        public int Height { set { height = value; } }
    };

    [StructLayout(LayoutKind.Sequential)]
    public struct RGBQUAD {
        public byte rgbBlue;
        public byte rgbGreen;
        public byte rgbRed;
        public byte rgbReserved;
    }

    public static Bitmap GetThumbnail(string fileName, int width, int height, ThumbnailOptions options) {
        IntPtr hBitmap = GetHBitmap(Path.GetFullPath(fileName), width, height, options);

        try {
            // return a System.Drawing.Bitmap from the hBitmap
            return GetBitmapFromHBitmap(hBitmap);
        }
        finally {
            // delete HBitmap to avoid memory leaks
            DeleteObject(hBitmap);
        }
    }

    /// <summary>
    /// 依副檔名取得 Windows Shell 通用檔案 icon，不要求該檔案實際存在。
    /// 透過 virtual Shell item 與 FILE_ATTRIBUTE_NORMAL 判斷關聯圖示，
    /// 因此 archive entry 不需要先解壓到暫存資料夾。
    /// </summary>
    public static Bitmap GetIconByExtension(string extension, int size) {
        if (string.IsNullOrWhiteSpace(extension)) {
            extension = ".bin";
        }
        if (extension.StartsWith('.') == false) {
            extension = "." + extension;
        }
        if (extension.Length > 20 || extension.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0) {
            throw new ArgumentException("無效的副檔名。", nameof(extension));
        }

        return GetIconByVirtualShellItem(extension, size);
    }

    /// <summary>
    /// 建立只有檔名與基本 attributes 的 virtual Shell item，讓原本的
    /// IShellItemImageFactory 依 size 與 ScaleUp 產生 icon；不建立實體檔案。
    /// </summary>
    private static Bitmap GetIconByVirtualShellItem(string extension, int size) {
        string virtualPath = Path.Combine(Environment.SystemDirectory, "TiefseeArchiveEntry" + extension);
        ComTypes.IBindCtx bindCtx = null;
        try {
            int bindCtxResult = CreateBindCtx(0, out bindCtx);
            if (bindCtxResult != 0) {
                throw Marshal.GetExceptionForHR(bindCtxResult);
            }

            ComTypes.BIND_OPTS bindOptions = new() {
                cbStruct = Marshal.SizeOf<ComTypes.BIND_OPTS>(),
                grfMode = 0x1000, // STGM_CREATE
            };
            bindCtx.SetBindOptions(ref bindOptions);

            Win32FindData findData = new() {
                dwFileAttributes = FileAttributeNormal,
                cFileName = Path.GetFileName(virtualPath),
                cAlternateFileName = "",
            };
            FileSystemBindData fileSystemBindData = new();
            fileSystemBindData.SetFindData(ref findData);
            bindCtx.RegisterObjectParam("File System Bind Data", fileSystemBindData);

            Guid shellItem2Guid = new(IShellItem2Guid);
            int retCode = SHCreateItemFromParsingName(
                virtualPath,
                bindCtx,
                ref shellItem2Guid,
                out IShellItem nativeShellItem);
            if (retCode != 0) {
                throw Marshal.GetExceptionForHR(retCode);
            }

            try {
                NativeSize nativeSize = new() {
                    Width = size,
                    Height = size,
                };
                HResult hr = ((IShellItemImageFactory)nativeShellItem).GetImage(
                    nativeSize,
                    ThumbnailOptions.ScaleUp,
                    out IntPtr hBitmap);
                if (hr != HResult.Ok) {
                    throw Marshal.GetExceptionForHR((int)hr);
                }

                try {
                    return GetBitmapFromHBitmap(hBitmap);
                }
                finally {
                    DeleteObject(hBitmap);
                }
            }
            finally {
                Marshal.ReleaseComObject(nativeShellItem);
            }
        }
        finally {
            if (bindCtx != null) {
                Marshal.ReleaseComObject(bindCtx);
            }
        }
    }

    public static Bitmap GetBitmapFromHBitmap(IntPtr nativeHBitmap) {
        Bitmap bmp = Bitmap.FromHbitmap(nativeHBitmap);

        if (Bitmap.GetPixelFormatSize(bmp.PixelFormat) < 32)
            return bmp;

        return CreateAlphaBitmap(bmp, PixelFormat.Format32bppArgb);
    }

    public static Bitmap CreateAlphaBitmap(Bitmap srcBitmap, PixelFormat targetPixelFormat) {
        Bitmap result = new Bitmap(srcBitmap.Width, srcBitmap.Height, targetPixelFormat);

        Rectangle bmpBounds = new Rectangle(0, 0, srcBitmap.Width, srcBitmap.Height);

        BitmapData srcData = srcBitmap.LockBits(bmpBounds, ImageLockMode.ReadOnly, srcBitmap.PixelFormat);

        bool isAlplaBitmap = false;

        try {
            for (int y = 0; y <= srcData.Height - 1; y++) {
                for (int x = 0; x <= srcData.Width - 1; x++) {
                    Color pixelColor = Color.FromArgb(
                        Marshal.ReadInt32(srcData.Scan0, (srcData.Stride * y) + (4 * x)));

                    if (pixelColor.A > 0 & pixelColor.A < 255) {
                        isAlplaBitmap = true;
                    }

                    result.SetPixel(x, y, pixelColor);
                }
            }
        }
        finally {
            srcBitmap.UnlockBits(srcData);
        }

        if (isAlplaBitmap) {
            return result;
        }
        else {
            return srcBitmap;
        }
    }

    private static IntPtr GetHBitmap(string fileName, int width, int height, ThumbnailOptions options) {
        IShellItem nativeShellItem;
        Guid shellItem2Guid = new Guid(IShellItem2Guid);
        int retCode = SHCreateItemFromParsingName(fileName, null, ref shellItem2Guid, out nativeShellItem);

        if (retCode != 0)
            throw Marshal.GetExceptionForHR(retCode);

        NativeSize nativeSize = new NativeSize();
        nativeSize.Width = width;
        nativeSize.Height = height;

        IntPtr hBitmap;
        HResult hr = ((IShellItemImageFactory)nativeShellItem).GetImage(nativeSize, options, out hBitmap);

        Marshal.ReleaseComObject(nativeShellItem);

        if (hr == HResult.Ok) return hBitmap;

        throw Marshal.GetExceptionForHR((int)hr);
    }
}

[Flags]
public enum ThumbnailOptions {
    None = 0x00,
    BiggerSizeOk = 0x01,
    InMemoryOnly = 0x02,
    IconOnly = 0x04,
    ThumbnailOnly = 0x08,
    InCacheOnly = 0x10,

    IconBackground = 0x80,
    ScaleUp = 0x100
}
