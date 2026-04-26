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
        DeleteTempDirectory(AppPath.tempDirImgProcessed, 0);
        DeleteTempDirectory(AppPath.tempDirImgZoom, 0);

        var a1111ResourceService = new A1111ResourceService(AppPath.appDataA1111ModelList);
        a1111ResourceService.ClearTemp();
    }

    /// <summary>
    /// 刪除圖片暫存並保留指定數量
    /// </summary>
    public void DeleteTemp(int maxImgProcessed, int maxImgZoom) {
        new Thread(() => {
            if (Program.startType == StartMode.QuickStartResident || Program.startType == StartMode.SingleInstanceResident) {
                if (SingleInstanceCoordinator.runNumber <= 2) {
                    DeleteTempDirectory(AppPath.tempDirImgProcessed, maxImgProcessed);
                    DeleteTempDirectory(AppPath.tempDirImgZoom, maxImgZoom);
                }
                return;
            }

            if (Directory.Exists(AppPath.appDataPort) == false) { return; }
            int portCount = Directory.GetFiles(AppPath.appDataPort).Length;
            if (portCount == 1 && SingleInstanceCoordinator.runNumber <= 1) {
                DeleteTempDirectory(AppPath.tempDirImgProcessed, maxImgProcessed);
                DeleteTempDirectory(AppPath.tempDirImgZoom, maxImgZoom);
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
