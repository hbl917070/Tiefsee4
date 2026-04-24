using Microsoft.VisualBasic.FileIO;
using System.IO;
using System.Runtime.InteropServices;
using System.Text.Json;

namespace Tiefsee;

[ComVisible(true)]
public class FileWebViewBridge {

    WebWindow M;
    private readonly TempFileService _tempFileService = new();
    private readonly FileShellService _fileShellService = new();
    private readonly FileOpenDialogService _fileOpenDialogService = new();
    private readonly FileDragDropService _fileDragDropService = new();

    /// <summary>
    /// 建立檔案相關的 WebView bridge
    /// </summary>
    public FileWebViewBridge(WebWindow m) {
        this.M = m;
    }
    public FileWebViewBridge() { }

    /// <summary>
    /// 檢查檔案是否為二進制檔
    /// </summary>
    public bool IsBinary(string filePath, int requiredConsecutiveNul = 1) {
        return FileLib.IsBinary(filePath, requiredConsecutiveNul);
    }

    /// <summary>
    /// 將 Base64 儲存至暫存資料夾 tempDirWebFile，並回傳路徑
    /// </summary>
    /// <param name="base64"></param>
    /// <param name="extension"> 副檔名 </param>
    /// <returns></returns>
    public string Base64ToTempFile(string base64, string extension) {
        return _tempFileService.Base64ToTempFile(base64, extension);
    }

    /// <summary>
    /// 取得基本檔案資訊
    /// </summary>
    public string GetFileInfo2(string path) {
        FileInfo2 info = FileLib.GetFileInfo2(path);
        return JsonSerializer.Serialize(info);
    }

    /// <summary>
    /// 取得作業系統所在的槽，例如 「C:\」
    /// </summary>
    /// <returns></returns>
    public string GetSystemRoot() {
        return _fileShellService.GetSystemRoot();
    }

    /// <summary>
    /// 在檔案總管顯示檔案
    /// </summary>
    /// <param name="path"></param>
    public void ShowOnExplorer(string path) {
        _fileShellService.ShowOnExplorer(path);
    }

    /// <summary>
    /// 開啟 選擇檔案 的視窗
    /// </summary>
    /// <param name="Multiselect"> 是否允許多選，false表示單選 </param>
    /// <param name="Filter"> 檔案類型。 abc(*.png)|*.png|All files (*.*)|*.* </param>
    /// <param name="Title"> 視窗標題 </param>
    /// <returns></returns>
    public string[] OpenFileDialog(bool Multiselect, string Filter, string Title) {
        return _fileOpenDialogService.OpenFileDialog(Multiselect, Filter, Title);
    }

    /// <summary>
    /// 快速拖曳 (拖出檔案
    /// </summary>
    public void DragDropFile(string path) {
        _fileDragDropService.DragDropFile(M, path);
    }

    /// <summary>
    /// 顯示檔案原生右鍵選單
    /// </summary>
    /// <param name="path"> 檔案路徑 </param>
    /// <param name="followMouse"> true=顯示於游標旁邊、false=視窗左上角 </param>
    public void ShowContextMenu(string path, bool followMouse) {
        _fileShellService.ShowContextMenu(M, path, followMouse);
    }

    /// <summary>
    /// 列印文件
    /// </summary>
    public void PrintFile(string path) {
        _fileShellService.PrintFile(path);
    }

    /// <summary>
    /// 取得文字資料
    /// </summary>
    public string GetText(string path) {
        return FileLib.GetText(path);
    }

    /// <summary>
    /// 儲存文字資料
    /// </summary>
    public void SetText(string path, string text) {
        FileLib.SetText(path, text);
    }

    /// <summary>
    ///
    /// </summary>
    public FileInfo GetFileInfo(string path) {
        return new FileInfo(path);
    }

    /// <summary>
    /// 判斷指定的檔案是否存在
    /// </summary>
    public bool Exists(string path) {
        return File.Exists(path);
    }

    /// <summary>
    /// 刪除檔案
    /// </summary>
    public string Delete(string path) {
        //if (File.Exists(path) == false) { return false; }
        try {
            File.Delete(path);
        }
        catch (Exception e) {
            return e.Message;
        }
        return "";
    }

    /// <summary>
    /// 檔案移到資源回收桶
    /// </summary>
    public string MoveToRecycle(string path) {
        //if (File.Exists(path) == false) { return false; }
        try {
            FileSystem.DeleteFile(
                path,
                UIOption.OnlyErrorDialogs,
                RecycleOption.SendToRecycleBin
            );
        }
        catch (Exception e) {
            return e.Message;
        }
        return "";
    }

    /// <summary>
    /// 移動檔案到新位置
    /// </summary>
    public string Move(string sourceFileName, string destFileName) {
        try {
            File.Move(sourceFileName, destFileName);
        }
        catch (Exception e) {
            return e.Message;
        }
        return "";
    }

    /// <summary>
    /// 複製檔案到新位置
    /// </summary>
    public string Copy(string sourceFileName, string destFileName) {
        try {
            File.Copy(sourceFileName, destFileName);
        }
        catch (Exception e) {
            return e.Message;
        }
        return "";
    }

    /// <summary>
    ///
    /// </summary>
    long ToUnix(DateTime time) {
        return FileLib.ToUnix(time);
    }

    /// <summary>
    /// 取得檔案的建立時間
    /// </summary>
    public long GetCreationTimeUtc(string path) {
        return FileLib.GetCreationTimeUtc(path);
    }

    /// <summary>
    /// 傳回指定檔案或目錄上次被寫入的日期和時間
    /// </summary>
    public long GetLastWriteTimeUtc(string path) {
        return FileLib.GetLastWriteTimeUtc(path);
    }

}
