using System.IO;

namespace Tiefsee;

/// <summary>
/// 處理暫存檔清理
/// </summary>
public sealed class TempCleanupService {

    /// <summary>
    /// 立即刪除所有圖片與壓縮檔暫存，但保留仍被開啟中壓縮檔 session 使用的檔案。
    /// </summary>
    public void DeleteAllTemp() {
        DeleteTempDirectory(Program.runtimeContext.TempDirImgProcessed, 0);
        DeleteTempDirectory(Program.runtimeContext.TempDirImgZoom, 0);
        DeleteArchiveTemp(0);

        Program.services.A1111Resource.ClearTemp();
    }

    /// <summary>
    /// 刪除圖片與壓縮檔暫存，並依指定數量保留最近使用的檔案。
    /// </summary>
    public void DeleteTemp(int maxImgProcessed, int maxImgZoom, int maxArchive) {
        new Thread(() => {
            if (Program.startType == StartMode.QuickStartResident || Program.startType == StartMode.SingleInstanceResident) {
                if (SingleInstanceCoordinator.runNumber <= 2) {
                    DeleteTempDirectory(Program.runtimeContext.TempDirImgProcessed, maxImgProcessed);
                    DeleteTempDirectory(Program.runtimeContext.TempDirImgZoom, maxImgZoom);
                    DeleteArchiveTemp(maxArchive);
                }
                return;
            }

            if (Directory.Exists(Program.runtimeContext.AppDataPort) == false) { return; }
            int portCount = Directory.GetFiles(Program.runtimeContext.AppDataPort).Length;
            if (portCount == 1 && SingleInstanceCoordinator.runNumber <= 1) {
                DeleteTempDirectory(Program.runtimeContext.TempDirImgProcessed, maxImgProcessed);
                DeleteTempDirectory(Program.runtimeContext.TempDirImgZoom, maxImgZoom);
                DeleteArchiveTemp(maxArchive);
            }
        }).Start();
    }

    /// <summary>
    /// 清理單一暫存目錄
    /// </summary>
    private void DeleteTempDirectory(string path, int max) {
        if (Directory.Exists(path) == false) { return; }

        FileSystemInfo[] ar = new DirectoryInfo(path).GetFileSystemInfos();
        if (ar.Length <= max) { return; }

        var sortedFiles = ar.OrderBy(f => f.LastAccessTime).ToList();
        for (int i = 0; i < sortedFiles.Count - max; i++) {
            try {
                File.Delete(sortedFiles[i].FullName);
            }
            catch { }
        }
    }

    /// <summary>
    /// 清理壓縮檔暫存根目錄下的所有檔案，依最後存取時間保留指定數量。
    /// 仍被 archive session 使用的檔案會跳過；檔案刪除後再移除空的 session 資料夾。
    /// </summary>
    private void DeleteArchiveTemp(int maxFiles) {
        string root = Program.runtimeContext.TempDirArchive;
        if (Directory.Exists(root) == false) { return; }

        FileInfo[] files;
        try {
            files = new DirectoryInfo(root).EnumerateFiles("*", SearchOption.AllDirectories).ToArray();
        }
        catch {
            return;
        }

        int deleteCount = Math.Max(0, files.Length - maxFiles);
        if (deleteCount > 0) {
            IOrderedEnumerable<FileInfo> candidates = files
                .Where(file => Program.services?.ArchivePreview?.IsArchiveTempPathProtected(file.FullName) != true)
                .OrderBy(file => file.LastAccessTimeUtc);

            foreach (FileInfo file in candidates.Take(deleteCount)) {
                try {
                    file.Delete();
                }
                catch { }
            }
        }

        try {
            foreach (string directory in Directory
                .EnumerateDirectories(root, "*", SearchOption.AllDirectories)
                .OrderByDescending(path => path.Length)) {
                if (Directory.Exists(directory) && new DirectoryInfo(directory).EnumerateFileSystemInfos().Any() == false) {
                    Directory.Delete(directory, false);
                }
            }
        }
        catch { }
    }
}
