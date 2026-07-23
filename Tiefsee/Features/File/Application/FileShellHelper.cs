using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;

namespace Tiefsee;

/// <summary>
/// 封裝檔案總管與原生右鍵選單相關操作
/// </summary>
public sealed class FileShellHelper {

    /// <summary>
    /// 取得作業系統所在的磁碟根目錄
    /// </summary>
    public string GetSystemRoot() {
        return Path.GetPathRoot(Environment.GetFolderPath(Environment.SpecialFolder.Windows));
    }

    /// <summary>
    /// 在檔案總管中選取指定檔案
    /// </summary>
    public void ShowOnExplorer(string path) {
        IntPtr pidl = IntPtr.Zero;
        try {
            int parseResult = SHParseDisplayName(
                path,
                IntPtr.Zero,
                out pidl,
                0,
                out _
            );
            if (parseResult != 0) {
                Marshal.ThrowExceptionForHR(parseResult);
            }

            int selectResult = SHOpenFolderAndSelectItems(
                pidl,
                0,
                IntPtr.Zero,
                0
            );
            if (selectResult != 0) {
                Marshal.ThrowExceptionForHR(selectResult);
            }
        }
        catch (Exception e) {
            MessageBox.Show(e.ToString(), "error");
        }
        finally {
            if (pidl != IntPtr.Zero) {
                Marshal.FreeCoTaskMem(pidl);
            }
        }
    }

    /// <summary>
    /// 將 Shell 名稱轉成絕對 PIDL
    /// </summary>
    [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
    private static extern int SHParseDisplayName(
        [MarshalAs(UnmanagedType.LPWStr)] string pszName,
        IntPtr pbc,
        out IntPtr ppidl,
        uint sfgaoIn,
        out uint psfgaoOut
    );

    /// <summary>
    /// 開啟檔案總管並選取指定項目
    /// </summary>
    [DllImport("shell32.dll")]
    private static extern int SHOpenFolderAndSelectItems(
        IntPtr pidlFolder,
        uint cidl,
        IntPtr apidl,
        uint dwFlags
    );

    /// <summary>
    /// 顯示原生右鍵選單
    /// </summary>
    public void ShowContextMenu(WebWindow window, string path, bool followMouse) {
        try {
            var ctxMnu = new ShellTestApp.ShellContextMenu();

            if (File.Exists(path)) {
                FileInfo[] arrFI = [new FileInfo(path)];
                ctxMnu.ShowContextMenu(arrFI, GetMenuPosition(window, followMouse));
                return;
            }

            if (Directory.Exists(path)) {
                DirectoryInfo[] arrDI = [new DirectoryInfo(path)];
                ctxMnu.ShowContextMenu(arrDI, GetMenuPosition(window, followMouse));
            }
        }
        catch {
            MessageBox.Show("ShowContextMenu error");
        }
    }

    /// <summary>
    /// 列印文件
    /// </summary>
    public void PrintFile(string path) {
        try {
            Process.Start(new ProcessStartInfo() {
                FileName = path,
                CreateNoWindow = true,
                WindowStyle = ProcessWindowStyle.Hidden,
                Verb = "Print",
                UseShellExecute = true
            });
        }
        catch (Exception e2) {
            MessageBox.Show(e2.ToString(), "Print failed");
        }
    }

    /// <summary>
    /// 取得右鍵選單顯示位置
    /// </summary>
    private System.Drawing.Point GetMenuPosition(WebWindow window, bool followMouse) {
        if (followMouse) {
            return System.Windows.Forms.Cursor.Position;
        }

        var screenPoint = window.PointToScreen(new System.Drawing.Point(0, 0));
        return new System.Drawing.Point((int)screenPoint.X + 10, (int)screenPoint.Y + 10);
    }
}
