using System.IO;

namespace Tiefsee;

/// <summary>
/// 處理暫存檔清理
/// </summary>
public sealed class TempCleanupService {

    /// <summary>
    /// 立即刪除所有圖片暫存
    /// </summary>
    public void DeleteAllTemp() {
        DeleteTempDirectory(Program.runtimeContext.TempDirImgProcessed, 0);
        DeleteTempDirectory(Program.runtimeContext.TempDirImgZoom, 0);

        Program.services.A1111Resource.ClearTemp();
    }

    /// <summary>
    /// 刪除圖片暫存並保留指定數量
    /// </summary>
    public void DeleteTemp(int maxImgProcessed, int maxImgZoom) {
        new Thread(() => {
            if (Program.startType == StartMode.QuickStartResident || Program.startType == StartMode.SingleInstanceResident) {
                if (SingleInstanceCoordinator.runNumber <= 2) {
                    DeleteTempDirectory(Program.runtimeContext.TempDirImgProcessed, maxImgProcessed);
                    DeleteTempDirectory(Program.runtimeContext.TempDirImgZoom, maxImgZoom);
                }
                return;
            }

            if (Directory.Exists(Program.runtimeContext.AppDataPort) == false) { return; }
            int portCount = Directory.GetFiles(Program.runtimeContext.AppDataPort).Length;
            if (portCount == 1 && SingleInstanceCoordinator.runNumber <= 1) {
                DeleteTempDirectory(Program.runtimeContext.TempDirImgProcessed, maxImgProcessed);
                DeleteTempDirectory(Program.runtimeContext.TempDirImgZoom, maxImgZoom);
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
}
