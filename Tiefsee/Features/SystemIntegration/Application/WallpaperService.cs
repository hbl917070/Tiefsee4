using System.IO;
using System.Runtime.InteropServices;

namespace Tiefsee;

/// <summary>
/// 封裝桌布設定
/// </summary>
public sealed class WallpaperService {

    /// <summary>
    /// 設定桌布
    /// </summary>
    public void SetWallpaper(string path) {
        if (File.Exists(path) == false) { return; }
        try {
            SystemParametersInfo(20, 1, path, 0x1 | 0x2);
        }
        catch (Exception e2) {
            MessageBox.Show("\"Set as Desktop Background\" failed：\n" + e2.ToString(), "Error");
        }
    }

    /// <summary>
    /// 呼叫 Win32 設定桌布
    /// </summary>
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    private static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int uWinlni);
}
