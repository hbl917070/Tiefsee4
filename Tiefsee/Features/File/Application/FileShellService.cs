using System.Diagnostics;
using System.IO;

namespace Tiefsee;

/// <summary>
/// 封裝檔案總管與原生右鍵選單相關操作
/// </summary>
public sealed class FileShellService {

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
        try {
            string file = Path.Combine(GetSystemRoot(), @"Windows\explorer.exe");
            string argument = @"/select, " + "\"" + path + "\"";
            Process.Start(file, argument);
        }
        catch (Exception e) {
            MessageBox.Show(e.ToString(), "error");
        }
    }

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
