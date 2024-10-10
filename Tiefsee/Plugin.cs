using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;

namespace Tiefsee;

public static class Plugin {

    public static string pathNConvert;
    public static string pathQuickLook;
    public static string pathPDFTronWebviewer;
    public static string pathMonacoEditor;
    public static DataPlugin dataPlugin = new();

    /// <summary>
    /// 初始化
    /// </summary>
    public static void Init() {

        pathNConvert = Path.Combine(AppPath.appDataPlugin, "NConvert/nconvert.exe");
        dataPlugin.NConvert = File.Exists(pathNConvert);

        pathQuickLook = Path.Combine(AppPath.appDataPlugin, "QuickLook/Tiefsee.QuickLook.dll");
        dataPlugin.QuickLook = File.Exists(pathQuickLook);

        pathMonacoEditor = Path.Combine(AppPath.appDataPlugin, "monaco-editor/min/vs/loader.js");
        dataPlugin.MonacoEditor = File.Exists(pathMonacoEditor);

        pathPDFTronWebviewer = Path.Combine(AppPath.appDataPlugin, "WebViewer/lib/webviewer.min.js"); // 從瀏覽器下載的zip
        dataPlugin.PDFTronWebviewer = File.Exists(pathPDFTronWebviewer);
        if (dataPlugin.PDFTronWebviewer) {
            dataPlugin.PDFTronWebviewer_js = "/WebViewer/lib/webviewer.min.js";
            dataPlugin.PDFTronWebviewer_lib = "/WebViewer/lib";
        }
        else {
            pathPDFTronWebviewer = Path.Combine(AppPath.appDataPlugin, "webviewer/webviewer.min.js"); // 從npm下載
            dataPlugin.PDFTronWebviewer = File.Exists(pathPDFTronWebviewer);
            if (dataPlugin.PDFTronWebviewer) {
                dataPlugin.PDFTronWebviewer_js = "/webviewer/webviewer.min.js";
                dataPlugin.PDFTronWebviewer_lib = "/webviewer/public";
            }
        }
    }

}

/// <summary>
/// 快速預覽檔案
/// </summary>
public static class PluginQuickLook {

    private static MethodInfo meth = null;
    private static Object obj = null;


    #region 

    [DllImport("user32.dll")]
    static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    static extern bool GetGUIThreadInfo(uint idThread, ref GUITHREADINFO lpgui);

    [StructLayout(LayoutKind.Sequential)]
    public struct GUITHREADINFO {
        public uint cbSize;
        public uint flags;
        public IntPtr hwndActive;
        public IntPtr hwndFocus;
        public IntPtr hwndCapture;
        public IntPtr hwndMenuOwner;
        public IntPtr hwndMoveSize;
        public IntPtr hwndCaret;
        public System.Drawing.Rectangle rcCaret;
    };

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);

    #endregion

    /// <summary>
    /// 取得當前資料夾或桌面選取的單一檔案，如果取得失敗則返回 ""
    /// </summary>
    /// <returns></returns>
    public static string GetCurrentSelection() {
        if (Plugin.dataPlugin.QuickLook == false) {
            return "";
        }

        if (meth == null) {
            string dllPath = Plugin.pathQuickLook;
            Assembly ass = Assembly.LoadFile(dllPath); // 加載 dll 文件
            Type tp = ass.GetType("Tiefsee.QuickLook"); // 獲取類名，必須 命名空間+類名
            obj = Activator.CreateInstance(tp); // 建立實例
            meth = tp.GetMethod("GetCurrentSelection"); // 獲取方法
        }

        string ret = (string)meth.Invoke(obj, new Object[] { }); // Invoke 調用方法

        // 如果是 win11 且焦點在輸入框上面，則忽略
        if (ret != "" && IsFocusOnExplorerInput()) {
            return "";
        }

        return ret;
    }

    /// <summary>
    /// 判斷當前的焦點是否在 win11 的檔案總管輸入框
    /// </summary>
    private static bool IsFocusOnExplorerInput() {

        // 如果不是 win11 則直接離開
        if (StartWindow.isWin11 == false) { return false; }

        const int maxChars = 256;
        StringBuilder className = new StringBuilder(maxChars);

        GUITHREADINFO guiInfo = new GUITHREADINFO();
        guiInfo.cbSize = (uint)Marshal.SizeOf(guiInfo);

        // Get the GUI thread information of the foreground window
        GetGUIThreadInfo(0, ref guiInfo);

        if (guiInfo.hwndFocus == IntPtr.Zero) {
            return false;
        }

        GetClassName(guiInfo.hwndFocus, className, maxChars);

        if (className.ToString() == "Microsoft.UI.Content.DesktopChildSiteBridge") {
            return true;
        }

        return false;
    }
}

public class DataPlugin {
    public bool NConvert { get; set; } = false;
    public bool QuickLook { get; set; } = false;
    public bool MonacoEditor { get; set; } = false;
    public bool PDFTronWebviewer { get; set; } = false;
    public string PDFTronWebviewer_js { get; set; } = "";
    public string PDFTronWebviewer_lib { get; set; } = "";
}
