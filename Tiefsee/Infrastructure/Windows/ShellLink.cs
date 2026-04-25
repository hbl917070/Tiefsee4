//
// https://dotblogs.com.tw/danking/2013/11/19/130417
//

using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using ComTypes = System.Runtime.InteropServices.ComTypes;

/// <summary>
/// 產生捷徑
/// </summary>
public class ShellLink : IDisposable {
    [ComImport, InterfaceType(ComInterfaceType.InterfaceIsIUnknown), Guid("000214F9-0000-0000-C000-000000000046")]
    private interface IShellLinkW {
        uint GetExecuteFile([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszFile, int cchMaxPath, ref WIN32_FIND_DATAW pfd, uint fFlags);

        uint GetIDList(out IntPtr ppidl);
        uint SetIDList(IntPtr pidl);

        uint GetDescription([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszName, int cchMaxName);
        uint SetDescription([MarshalAs(UnmanagedType.LPWStr)] string pszName);

        uint GetWorkingDirectory([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszDir, int cchMaxPath);
        uint SetWorkingDirectory([MarshalAs(UnmanagedType.LPWStr)] string pszDir);

        uint GetArguments([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszArgs, int cchMaxPath);
        uint SetArguments([MarshalAs(UnmanagedType.LPWStr)] string pszArgs);

        uint GetHotKey(out ushort pwHotkey);
        uint SetHotKey(ushort wHotKey);

        uint GetShowCmd(out int piShowCmd);
        uint SetShowCmd(int iShowCmd);

        uint GetIconLocation([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszIconPath, int cchIconPath, out int piIcon);
        uint SetIconLocation([MarshalAs(UnmanagedType.LPWStr)] string pszIconPath, int iIcon);

        uint SetRelativePath([MarshalAs(UnmanagedType.LPWStr)] string pszPathRel, uint dwReserved);
        uint Resolve(IntPtr hwnd, uint fFlags);

        uint SetExecuteFile([MarshalAs(UnmanagedType.LPWStr)] string pszFile);
    }

    [ComImport, ClassInterface(ClassInterfaceType.None), Guid("00021401-0000-0000-C000-000000000046")]
    private class CShellLink { }

    [StructLayout(LayoutKind.Sequential, Pack = 4, CharSet = CharSet.Unicode)]
    private struct WIN32_FIND_DATAW {
        public uint dwFileAttributes;
        public ComTypes.FILETIME ftCreationTime;
        public ComTypes.FILETIME ftLastAccessTime;
        public ComTypes.FILETIME ftLastWriteTime;
        public uint nFileSizeHigh;
        public uint nFileSizeLow;
        public uint dwReserved0;
        public uint dwReserved1;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = MAX_PATH)]
        public string cFileName;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 14)]
        public string cAlternateFileName;
    }

    [ComImport, InterfaceType(ComInterfaceType.InterfaceIsIUnknown), Guid("886D8EEB-8CF2-4446-8D02-CDBA1DBDCF99")]
    private interface IPropertyStore {
        uint GetCount([Out] out uint cProps);
        uint GetAt([In] uint iProp, out PropertyKey pkey);
        uint GetValue([In] ref PropertyKey key, [Out] PropVariant pv);
        uint SetValue([In] ref PropertyKey key, [In] PropVariant pv);
        uint Commit();
    }

    [StructLayout(LayoutKind.Sequential, Pack = 4)]
    private struct PropertyKey {
        private Guid formatId;
        private Int32 propertyId;
        public Guid FormatId { get { return formatId; } }
        public Int32 PropertyId { get { return propertyId; } }
        public PropertyKey(Guid formatId, Int32 propertyId) {
            this.formatId = formatId;
            this.propertyId = propertyId;
        }
        public PropertyKey(string formatId, Int32 propertyId) {
            this.formatId = new Guid(formatId);
            this.propertyId = propertyId;
        }
    }

    [StructLayout(LayoutKind.Explicit)]
    private sealed class PropVariant : IDisposable {
        [FieldOffset(0)]
        ushort valueType;

        [FieldOffset(8)]
        IntPtr ptr;

        public VarEnum VarType {
            get { return (VarEnum)valueType; }
            set { valueType = (ushort)value; }
        }

        public bool IsNullOrEmpty { get { return (valueType == (ushort)VarEnum.VT_EMPTY || valueType == (ushort)VarEnum.VT_NULL); } }
        public string Value { get { return Marshal.PtrToStringUni(ptr); } }
        public PropVariant() { }
        public PropVariant(string value) {
            if (value == null) throw new ArgumentException("Failed to set value.");
            valueType = (ushort)VarEnum.VT_LPWSTR;
            ptr = Marshal.StringToCoTaskMemUni(value);
        }

        ~PropVariant() { Dispose(); }
        public void Dispose() {
            PropVariantClear(this);
            GC.SuppressFinalize(this);
        }
    }

    [DllImport("Ole32.dll", PreserveSig = false)]
    private extern static void PropVariantClear([In, Out] PropVariant pvar);

    private IShellLinkW shellLinkW = null;
    private readonly PropertyKey AppUserModelIDKey = new PropertyKey("{9F4C2855-9F79-4B39-A8D0-E1D42DE1D5F3}", 5);
    private const int MAX_PATH = 260;
    private const int INFOTIPSIZE = 1024;
    private const int STGM_READ = 0x00000000;
    private const uint SLGP_UNCPRIORITY = 0x0002;

    private ComTypes.IPersistFile PersistFile {
        get {
            ComTypes.IPersistFile PersistFile = shellLinkW as ComTypes.IPersistFile;
            if (PersistFile == null) throw new COMException("Failed to create IPersistFile.");
            return PersistFile;
        }
    }

    private IPropertyStore PropertyStore {
        get {
            IPropertyStore PropertyStore = shellLinkW as IPropertyStore;
            if (PropertyStore == null) throw new COMException("Failed to create IPropertyStore.");
            return PropertyStore;
        }
    }


    /// <summary>
    /// 讀取目前載入的捷徑檔案名稱
    /// </summary>
    public string CurrentShortcutFile {
        get {
            string strFileName;
            PersistFile.GetCurFile(out strFileName);
            return strFileName;
        }
    }

    /// <summary>
    /// 設定/讀取 執行的檔案
    /// </summary>
    public string ExecuteFile {
        get {
            StringBuilder FileName = new StringBuilder(MAX_PATH);
            WIN32_FIND_DATAW data = new WIN32_FIND_DATAW();
            VerifySucceeded(shellLinkW.GetExecuteFile(FileName, FileName.Capacity, ref data, SLGP_UNCPRIORITY));
            return FileName.ToString();
        }
        set {
            VerifySucceeded(shellLinkW.SetExecuteFile(value));
        }
    }

    /// <summary>
    /// 設定/讀取 執行檔案的參數
    /// </summary>
    public string ExecuteArguments {
        get {
            StringBuilder ExecuteArgs = new StringBuilder(INFOTIPSIZE);
            VerifySucceeded(shellLinkW.GetArguments(ExecuteArgs, ExecuteArgs.Capacity));
            return ExecuteArgs.ToString();
        }
        set {
            VerifySucceeded(shellLinkW.SetArguments(value));
        }
    }

    /// <summary>
    /// 設定/讀取 工作路徑
    /// </summary>
    public string WorkPath {
        get {
            StringBuilder WorkDirectory = new StringBuilder(MAX_PATH);
            VerifySucceeded(shellLinkW.GetWorkingDirectory(WorkDirectory, WorkDirectory.Capacity));
            return WorkDirectory.ToString();
        }
        set {
            VerifySucceeded(shellLinkW.SetWorkingDirectory(value));
        }
    }

    /// <summary>
    /// 設定/讀取 檔案註解
    /// </summary>
    public string Descriptions {
        get {
            StringBuilder FileDescription = new StringBuilder(MAX_PATH);
            VerifySucceeded(shellLinkW.GetDescription(FileDescription, FileDescription.Capacity));
            return FileDescription.ToString();
        }
        set {
            VerifySucceeded(shellLinkW.SetDescription(value));
        }
    }

    /// <summary>
    /// 設定/讀取 圖示檔案
    /// </summary>
    public string IconLocation {
        get {
            StringBuilder IconConfig = new StringBuilder(MAX_PATH);
            int IconIndex;
            VerifySucceeded(shellLinkW.GetIconLocation(IconConfig, IconConfig.Capacity, out IconIndex));
            return IconConfig.ToString() + "," + IconIndex.ToString();
        }
        set {
            if (value.Split(',').Length == 2) {
                VerifySucceeded(shellLinkW.SetIconLocation(value.Split(',')[0], Convert.ToInt32(value.Split(',')[1])));
            }
        }
    }

    /// <summary>
    /// 設定/讀取 Application User Model IDs For Win7 以上作業系統
    /// </summary>
    public string AppUserModelID {
        get {
            using (PropVariant pv = new PropVariant()) {
                VerifySucceeded(PropertyStore.GetValue(AppUserModelIDKey, pv));

                if (pv.Value == null)
                    return "Null";
                else
                    return pv.Value;
            }
        }
        set {
            using (PropVariant pv = new PropVariant(value)) {
                VerifySucceeded(PropertyStore.SetValue(AppUserModelIDKey, pv));
                VerifySucceeded(PropertyStore.Commit());
            }
        }
    }

    public ShellLink() : this(null) { }

    /// <summary>
    /// 初始化後載入捷徑檔案
    /// </summary>
    /// <param name="FullLinkFileName">完整的捷徑檔案名稱</param>
    public ShellLink(string FullLinkFileName) {
        try {
            shellLinkW = (IShellLinkW)new CShellLink();
        }
        catch {
            throw new COMException("Failed to create ShellLink object.");
        }

        if (FullLinkFileName != null) Load(FullLinkFileName);
    }

    ~ShellLink() { Dispose(false); }

    /// <summary>
    /// 釋放 ShellLink 使用的資源
    /// </summary>
    public void Dispose() {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing) {
        if (shellLinkW != null) {
            Marshal.FinalReleaseComObject(shellLinkW);
            shellLinkW = null;
        }
    }

    /// <summary>
    /// 儲存捷徑檔案
    /// </summary>
    public void Save() {
        string SaveFileName = CurrentShortcutFile;

        if (SaveFileName == null) throw new InvalidOperationException("File name is not given.");
        Save(SaveFileName);
    }

    /// <summary>
    /// 儲存捷徑檔案
    /// </summary>
    /// <param name="FullLinkFileName">完整的捷徑檔案名稱</param>
    public void Save(string FullLinkFileName) {
        if (FullLinkFileName == null) throw new ArgumentNullException("File name is required.");
        PersistFile.Save(FullLinkFileName, true);
    }

    /// <summary>
    /// 讀取捷徑檔案 
    /// </summary>
    /// <param name="FullLinkFileName">完整的捷徑檔案名稱</param>
    public void Load(string FullLinkFileName) {
        if (!File.Exists(FullLinkFileName)) throw new FileNotFoundException("File is not found.", FullLinkFileName);
        PersistFile.Load(FullLinkFileName, STGM_READ);
    }

    /// <summary>
    /// 確認程式執行
    /// </summary>
    /// <param name="hresult">回傳值</param>
    public static void VerifySucceeded(uint hresult) {
        if (hresult > 1) throw new InvalidOperationException("Failed with HRESULT: " + hresult.ToString("X"));
    }
}
