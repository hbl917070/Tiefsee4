using System.Runtime.InteropServices;
using System.Text;

namespace Tiefsee;

/// <summary>
/// 封裝 Windows 路徑互通相關處理
/// </summary>
public sealed class PathInteropService {

    /// <summary>
    /// 把長路徑轉成短路徑
    /// </summary>
    /// <param name="path"></param>
    public string GetShortPath(string path) {
        int maxPath = 255;
        var shortPath = new StringBuilder(maxPath);
        if (path.StartsWith("\\\\?\\" ) == false) {
            path = "\\\\?\\" + path;
        }
        GetShortPathName(path, shortPath, maxPath);
        string result = shortPath.ToString();
        if (result.StartsWith("\\\\?\\")) {
            result = result.Substring(4);
        }
        return result;
    }

    /// <summary>
    /// 呼叫 Win32 API 取得短路徑
    /// </summary>
    [DllImport("kernel32.dll", CharSet = CharSet.Auto)]
    private static extern int GetShortPathName(
        [MarshalAs(UnmanagedType.LPTStr)] string path,
        [MarshalAs(UnmanagedType.LPTStr)] StringBuilder shortPath,
        int shortPathLength
    );
}
