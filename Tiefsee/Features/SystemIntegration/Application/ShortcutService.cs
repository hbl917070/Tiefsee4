using System.IO;

namespace Tiefsee;

/// <summary>
/// 封裝捷徑建立與解析
/// </summary>
public sealed class ShortcutService {

    /// <summary>
    /// 建立捷徑
    /// </summary>
    public void CreateShortcut(string exePath, string lnkPath, string args) {
        if (File.Exists(exePath) == false) { return; }

        using ShellLink slLinkObject = new();
        slLinkObject.WorkPath = Directory.GetParent(exePath).ToString();
        slLinkObject.IconLocation = exePath + ",0";
        slLinkObject.ExecuteFile = exePath;
        slLinkObject.ExecuteArguments = args;
        slLinkObject.Save(lnkPath);
    }

    /// <summary>
    /// 將 lnk 轉成 exe 路徑
    /// </summary>
    public string LnkToExePath(string path) {
        return LnkToExe.GetExePate(path);
    }
}
