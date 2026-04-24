using System.Diagnostics;
using System.IO;

namespace Tiefsee;

/// <summary>
/// 封裝外部程式啟動與開始選單掃描
/// </summary>
public sealed class ExternalLauncherService {

    /// <summary>
    /// 顯示以其他程式開啟選單
    /// </summary>
    public void ShowOpenWithMenu(string path) {
        if (File.Exists(path) == false) { return; }

        try {
            Process.Start(new ProcessStartInfo("rundll32.exe") {
                Arguments = $"shell32.dll,OpenAs_RunDLL {path}",
                WorkingDirectory = Path.GetDirectoryName(path),
                UseShellExecute = true
            });
        }
        catch (Exception e2) {
            MessageBox.Show(e2.ToString(), "Error");
        }
    }

    /// <summary>
    /// 取得開始選單內所有 lnk
    /// </summary>
    public string[] GetStartMenuList(string systemRoot) {
        List<string> arFile = [];

        string path = Path.Combine(systemRoot, @"ProgramData\Microsoft\Windows\Start Menu\Programs");
        if (Directory.Exists(path)) {
            CollectFilesRecursive(path, arFile);
        }

        path = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs");
        if (Directory.Exists(path)) {
            CollectFilesRecursive(path, arFile);
        }

        return arFile.Where(file => Path.GetExtension(file).ToLower() == ".lnk").ToArray();
    }

    /// <summary>
    /// 以 UWP 開啟檔案
    /// </summary>
    public async Task RunUwp(string uwpId, string filePath) {
        var file = await Windows.Storage.StorageFile.GetFileFromPathAsync(filePath);
        if (file == null) { return; }

        var options = new Windows.System.LauncherOptions {
            TargetApplicationPackageFamilyName = uwpId
        };
        await Windows.System.Launcher.LaunchFileAsync(file, options);
    }

    /// <summary>
    /// 啟動外部程式
    /// </summary>
    public void ProcessStart(string fileName, string arguments, bool createNoWindow, bool useShellExecute) {
        var psi = new ProcessStartInfo {
            FileName = fileName,
            WorkingDirectory = Path.GetDirectoryName(fileName),
            Arguments = arguments,
            CreateNoWindow = createNoWindow,
            UseShellExecute = useShellExecute
        };
        Process.Start(psi);
    }

    /// <summary>
    /// 用預設瀏覽器開啟網址
    /// </summary>
    public bool OpenUrl(string url) {
        try {
            var psi = new ProcessStartInfo {
                FileName = url,
                UseShellExecute = true
            };
            Process.Start(psi);
            return true;
        }
        catch {
            return false;
        }
    }

    /// <summary>
    /// 遞迴收集檔案
    /// </summary>
    private void CollectFilesRecursive(string dir, List<string> files) {
        foreach (var item in Directory.EnumerateFileSystemEntries(dir)) {
            if (File.Exists(item)) {
                files.Add(item);
            }
            else if (Directory.Exists(item)) {
                CollectFilesRecursive(item, files);
            }
        }
    }
}
