using System.IO;
using System.Reflection;

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
            dataPlugin.PDFTronWebviewer_js = pathPDFTronWebviewer;
            dataPlugin.PDFTronWebviewer_lib = Path.Combine(AppPath.appDataPlugin, "WebViewer/lib");
        }
        else {
            pathPDFTronWebviewer = Path.Combine(AppPath.appDataPlugin, "webviewer/webviewer.min.js"); // 從npm下載
            dataPlugin.PDFTronWebviewer = File.Exists(pathPDFTronWebviewer);
            if (dataPlugin.PDFTronWebviewer) {
                dataPlugin.PDFTronWebviewer_js = pathPDFTronWebviewer;
                dataPlugin.PDFTronWebviewer_lib = Path.Combine(AppPath.appDataPlugin, "webviewer/public");
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
        return ret;
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
