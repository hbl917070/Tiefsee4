using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;

namespace Tiefsee;

/// <summary>
/// 透過 QuickLook 外掛取得檔案總管目前選取的項目
/// </summary>
public static class QuickLookSelectionService {

    private static MethodInfo meth = null;
    private static Object obj = null;

    [DllImport("user32.dll")]
    private static extern bool GetGUIThreadInfo(uint idThread, ref GUITHREADINFO lpgui);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);

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
    }

    /// <summary>
    /// 取得當前資料夾或桌面選取的單一檔案，如果取得失敗則返回 ""
    /// </summary>
    public static string GetCurrentSelection() {
        if (PluginRegistry.pluginAvailability.QuickLook == false) {
            return "";
        }

        if (meth == null) {
            string dllPath = PluginRegistry.pathQuickLook;
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
        if (StartWindow.isWin11 == false) { return false; }

        const int maxChars = 256;
        StringBuilder className = new StringBuilder(maxChars);

        GUITHREADINFO guiInfo = new GUITHREADINFO();
        guiInfo.cbSize = (uint)Marshal.SizeOf(guiInfo);
        GetGUIThreadInfo(0, ref guiInfo);

        if (guiInfo.hwndFocus == IntPtr.Zero) {
            return false;
        }

        GetClassName(guiInfo.hwndFocus, className, maxChars);
        return className.ToString() == "Microsoft.UI.Content.DesktopChildSiteBridge";
    }
}
