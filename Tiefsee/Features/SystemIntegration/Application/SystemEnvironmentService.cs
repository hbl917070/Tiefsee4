using Microsoft.Win32;
using System.IO;

namespace Tiefsee;

/// <summary>
/// 封裝作業系統與桌面環境資訊
/// </summary>
public sealed class SystemEnvironmentService {

    /// <summary>
    /// 取得作業系統所在的磁碟根目錄
    /// </summary>
    public string GetSystemRoot() {
        return Path.GetPathRoot(Environment.GetFolderPath(Environment.SpecialFolder.Windows));
    }

    /// <summary>
    /// 取得滑鼠座標
    /// </summary>
    public int[] GetMousePosition() {
        var p = System.Windows.Forms.Cursor.Position;
        return [p.X, p.Y];
    }

    /// <summary>
    /// 判斷是否為 Windows 10
    /// </summary>
    public bool IsWindows10() {
        try {
            var reg = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows NT\CurrentVersion");
            string productName = (string)reg.GetValue("ProductName");
            return productName.StartsWith("Windows 10");
        }
        catch {
            return false;
        }
    }

    /// <summary>
    /// 判斷是否為 Windows 7
    /// </summary>
    public bool IsWindows7() {
        try {
            string os = Environment.OSVersion.Version.ToString();
            return os.Length > 3 && os.Substring(0, 3) == "6.1";
        }
        catch {
            return false;
        }
    }
}
