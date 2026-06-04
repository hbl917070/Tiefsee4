using System.IO;

namespace Tiefsee;

/// <summary>
/// 管理 Plugin
/// </summary>
public static class PluginRegistry {

    public static string pathNConvert;
    public static string pathHdrfix;
    public static string pathQuickLook;
    public static string pathPDFTronWebviewer;
    public static string pathMonacoEditor;
    public static PluginAvailability pluginAvailability = new();

    /// <summary>
    /// 初始化
    /// </summary>
    public static void Init() {
        string appDataPlugin = Program.runtimeContext.AppDataPlugin;

        pathNConvert = Path.Combine(appDataPlugin, "NConvert/nconvert.exe");
        pluginAvailability.NConvert = File.Exists(pathNConvert);

        pathHdrfix = Path.Combine(appDataPlugin, "hdrfix/hdrfix.exe");
        pluginAvailability.Hdrfix = File.Exists(pathHdrfix);

        pathQuickLook = Path.Combine(appDataPlugin, "QuickLook/Tiefsee.QuickLook.dll");
        pluginAvailability.QuickLook = File.Exists(pathQuickLook);

        pathMonacoEditor = Path.Combine(appDataPlugin, "monaco-editor/min/vs/loader.js");
        pluginAvailability.MonacoEditor = File.Exists(pathMonacoEditor);

        pathPDFTronWebviewer = Path.Combine(appDataPlugin, "WebViewer/lib/webviewer.min.js"); // 從瀏覽器下載的zip
        pluginAvailability.PDFTronWebviewer = File.Exists(pathPDFTronWebviewer);
        if (pluginAvailability.PDFTronWebviewer) {
            pluginAvailability.PDFTronWebviewer_js = "/WebViewer/lib/webviewer.min.js";
            pluginAvailability.PDFTronWebviewer_lib = "/WebViewer/lib";
        }
        else {
            pathPDFTronWebviewer = Path.Combine(appDataPlugin, "webviewer/webviewer.min.js"); // 從npm下載
            pluginAvailability.PDFTronWebviewer = File.Exists(pathPDFTronWebviewer);
            if (pluginAvailability.PDFTronWebviewer) {
                pluginAvailability.PDFTronWebviewer_js = "/webviewer/webviewer.min.js";
                pluginAvailability.PDFTronWebviewer_lib = "/webviewer/public";
            }
        }
    }

}
