using System.Diagnostics;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;
using System.Windows.Automation;

namespace Tiefsee;

/// <summary>
/// 透過 QuickLook 外掛取得檔案總管目前選取的項目
/// </summary>
public static class QuickLookSelectionService {

    private static MethodInfo meth = null;
    private static Object obj = null;

    [DllImport("user32.dll")]
    private static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);

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

        // Explorer 文字欄位有焦點時，空白鍵應留給欄位輸入。
        if (ret != "" && IsFocusOnExplorerInput()) {
            return "";
        }

        return ret;
    }

    /// <summary>
    /// 判斷目前檔案總管的文字輸入區是否有焦點
    /// </summary>
    private static bool IsFocusOnExplorerInput() {
        IntPtr foregroundWindow = GetForegroundWindow();
        if (foregroundWindow == IntPtr.Zero) { return false; }

        StringBuilder foregroundClassName = new StringBuilder(256);
        if (GetClassName(foregroundWindow, foregroundClassName, foregroundClassName.Capacity) == 0 ||
            (foregroundClassName.ToString() != "CabinetWClass" &&
             foregroundClassName.ToString() != "ExploreWClass")) {
            return false;
        }

        try {
            ControlType controlType = AutomationElement.FocusedElement?.Current.ControlType;
            return controlType == ControlType.Edit || controlType == ControlType.ComboBox;
        } catch (Exception ex) {
            Debug.WriteLine(ex);
            // Explorer 焦點狀態不確定時，略過本次預覽，避免攔截使用者輸入。
            return true;
        }
    }
}
