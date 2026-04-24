using System.Diagnostics;
using System.IO;

namespace Tiefsee;

/// <summary>
/// 封裝程式執行路徑與 app info 取得
/// </summary>
public sealed class AppRuntimePathService {

    /// <summary>
    /// 取得 AppInfo
    /// </summary>
    public string GetAppInfo(WebWindow window) {
        return WebWindow.GetAppInfo(window.Args, 0);
    }

    /// <summary>
    /// 取得程式的暫存資料夾，例如 C:\Users\user\AppData\Local\Tiefsee
    /// </summary>
    public string GetAppDataPath() {
        string path = AppPath.appData;
        if (Directory.Exists(path) == false) {
            Directory.CreateDirectory(path);
        }
        return path;
    }

    /// <summary>
    /// 取得執行檔所在的資料夾
    /// </summary>
    public string GetAppDirPath() {
        return AppDomain.CurrentDomain.BaseDirectory;
    }

    /// <summary>
    /// 取得執行檔路徑 (TiefseeCore.exe 的路徑)
    /// </summary>
    public string GetAppPath() {
        return Process.GetCurrentProcess().MainModule.FileName;
    }

    /// <summary>
    /// 取得 Tiefsee.exe 的路徑
    /// </summary>
    public string GetTiefseePath() {
        var dir = GetAppDirPath();

        var path = Path.Combine(dir, "Tiefsee.exe");
        if (File.Exists(path)) { return path; }

        path = Path.Combine(dir, "../TiefseeLauncher/Tiefsee.exe");
        if (File.Exists(path)) { return Path.GetFullPath(path); }

        return GetAppPath();
    }
}
