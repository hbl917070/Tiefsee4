using System.Runtime.InteropServices;
using System.Text.Json;
using System.Windows.Input;

namespace Tiefsee;

[ComVisible(true)]
public class SystemWebViewBridge {

    WebWindow M;
    private readonly WebViewFileWatcherService _fileWatcherService = new();
    private readonly StartupTaskService _startupTaskService = new();
    private readonly TempCleanupService _tempCleanupService = new();
    private readonly FileAssociationService _fileAssociationService = new();
    private readonly KeyboardSimulationService _keyboardSimulationService = new();
    private readonly ShortcutService _shortcutService = new();
    private readonly WallpaperService _wallpaperService = new();
    private readonly SystemEnvironmentService _systemEnvironmentService = new();
    private readonly ProcessMemoryService _processMemoryService = new();

    /// <summary>
    /// 建立系統整合相關的 WebView bridge
    /// </summary>
    public SystemWebViewBridge(WebWindow m) {
        this.M = m;
    }

    /// <summary>
    /// 偵測檔案變化
    /// </summary>
    /// <param name="key"> 如果需要偵測多個資料夾，用此欄位來進行區分 </param>
    /// <param name="path"> 要偵測的資料夾 </param>
    public void NewFileWatcher(string key, string path) {
        _fileWatcherService.NewFileWatcher(key, path, (string data) => {
            Adapter.UIThread(() => {
                M.RunJs($@"if(window.baseWindow !== undefined) baseWindow.onFileWatcher({data});");
            });
        });
    }

    /// <summary>
    /// 停止偵測檔案變化
    /// </summary>
    public void FileWatcherDispose() {
        _fileWatcherService.Dispose();
    }

    /// <summary>
    /// 取得當前是否有使用「開機自動啟動」
    /// </summary>
    public async Task<string> GetTiefseTask() {
        return await _startupTaskService.GetTiefseeTaskState();
    }

    /// <summary>
    /// 設定當前是否有使用「開機自動啟動」
    /// </summary>
    public async Task<string> SetTiefseTask(bool val) {
        return await _startupTaskService.SetTiefseeTaskState(val);
    }

    /// <summary>
    /// 取得當前是否按著空白鍵跟滑鼠滾輪
    /// </summary>
    public string GetDownKey() {
        var obj = new {
            isKeyboardSpace = Keyboard.IsKeyDown(Key.Space), // 按著空白鍵
            isMouseMiddle = Control.MouseButtons == MouseButtons.Middle, // 按著滑鼠滾輪
        };
        return JsonSerializer.Serialize(obj);
    }

    /// <summary>
    /// 產生捷徑
    /// </summary>
    /// <param name="exePath"> exe路徑 </param>
    /// <param name="lnkPath"> 要儲存的ink路徑 </param>
    /// <param name="args"> 啟動參數 </param>
    public void NewLnk(string exePath, string lnkPath, string args) {
        _shortcutService.CreateShortcut(exePath, lnkPath, args);
    }

    /// <summary>
    /// 取得某一個點所在的螢幕資訊
    /// </summary>
    /// <returns> WorkingArea X, Y, Width, Height </returns>
    public int[] GetScreenFromPoint(int x, int y) {

        var screen = System.Windows.Forms.Screen.FromPoint(new Point(x, y));

        int[] mouse = new int[4];
        mouse[0] = screen.WorkingArea.X;
        mouse[1] = screen.WorkingArea.Y;
        mouse[2] = screen.WorkingArea.Width;
        mouse[3] = screen.WorkingArea.Height;

        return mouse;
    }

    /// <summary>
    /// 立即刪除所有圖片暫存
    /// </summary>
    public void DeleteAllTemp() {
        _tempCleanupService.DeleteAllTemp();
    }

    /// <summary>
    /// 刪除圖片暫存 (保留一定數量
    /// </summary>
    /// <param name="maxImgProcessed"> 暫存資料夾 tempDirImgProcessed 最多保留的檔案數量 </param>
    /// <param name="maxImgZoom"> 暫存資料夾 tempDirImgZoom 最多保留的檔案數量 </param>
    public void DeleteTemp(int maxImgProcessed, int maxImgZoom) {
        _tempCleanupService.DeleteTemp(maxImgProcessed, maxImgZoom);
    }

    /// <summary>
    /// 模擬鍵盤 ctrl + ?
    /// </summary>
    /// <param name="key"> 例如 A = ctrl+A </param>
    public void SendKeys_CtrlAnd(string key) {
        _keyboardSimulationService.SendCtrlAnd(key);
    }

    /// <summary>
    /// 模擬鍵盤
    /// </summary>
    /// <param name="keys"> 例如^a = ctrl+A </param>
    public void SendKeys_Send(string keys) {
        _keyboardSimulationService.Send(keys);
    }

    /// <summary>
    /// 存入剪貼簿 - 傳入base64，儲存成圖片。
    /// isTransparent=true時，同時把png跟一般圖片存入剪貼簿，支援透明圖片的程式會優先使用png格式
    /// </summary>
    /// <param name="base64"></param>
    /// <param name="isTransparent"> 是否要支援透明色 </param>
    /// <returns></returns>
    public bool SetClipboard_Base64ToImage(string base64, bool isTransparent) {
        return ClipboardHelper.SetClipboardBase64ToImage(base64, isTransparent);
    }

    /// <summary>
    /// 存入剪貼簿 - 傳入檔案路徑，儲存成圖片。
    /// isTransparent=true時，同時把png跟一般圖片存入剪貼簿，支援透明圖片的程式會優先使用png格式
    /// </summary>
    /// <param name="path"></param>
    /// <param name="isTransparent"> 是否要支援透明色 </param>
    /// <returns></returns>
    public bool SetClipboard_FileToImage(string path, bool isTransparent) {
        return ClipboardHelper.SetClipboardFileToImage(path, isTransparent);
    }

    /// <summary>
    /// 存入剪貼簿 - 傳入檔案路徑，以UTF8開啟，複製成文字
    /// </summary>
    public bool SetClipboard_FileToText(string path) {
        return ClipboardHelper.SetClipboardFileToText(path);
    }

    /// <summary>
    /// 存入剪貼簿 - 傳入檔案路徑，複製成 base64
    /// </summary>
    public bool SetClipboard_FileToBase64(string path) {
        return ClipboardHelper.SetClipboardFileToBase64(path);
    }

    /// <summary>
    /// 存入剪貼簿 - 字串
    /// </summary>
    public bool SetClipboard_Text(string text) {
        return ClipboardHelper.SetClipboardText(text);
    }

    /// <summary>
    /// 存入剪貼簿 - 檔案
    /// </summary>
    public bool SetClipboard_File(string path) {
        return ClipboardHelper.SetClipboardFile(path);
    }

    /// <summary>
    /// 取得作業系統所在的槽，例如 「C:\」
    /// </summary>
    public string GetSystemRoot() {
        return _systemEnvironmentService.GetSystemRoot();
    }

    /// <summary>
    /// 取得滑鼠的坐標
    /// </summary>
    public int[] GetMousePosition() {
        return _systemEnvironmentService.GetMousePosition();
    }

    /// <summary>
    /// 設定桌布
    /// </summary>
    public void SetWallpaper(string path) {
        _wallpaperService.SetWallpaper(path);
    }

    /// <summary>
    /// 判斷是否為 win10
    /// </summary>
    public bool IsWindows10() {
        return _systemEnvironmentService.IsWindows10();
    }

    /// <summary>
    /// 判斷是否為 win7
    /// </summary>
    public bool IsWindows7() {
        return _systemEnvironmentService.IsWindows7();
    }

    /// <summary>
    /// lnk 轉 exe路徑
    /// </summary>
    /// <param name="path"> lnk捷徑 </param>
    public string LnkToExePath(string path) {
        return _shortcutService.LnkToExePath(path);
    }

    /// <summary>
    /// 回傳程式目前記憶體使用量（MB
    /// </summary>
    public float GetMemory_mb() {
        return _processMemoryService.GetMemoryMb();
    }

    /// <summary>
    /// 回收記憶體
    /// </summary>
    public void Collect() {
        _processMemoryService.Collect();
    }

    /// <summary>
    /// 關聯副檔名
    /// </summary>
    /// <param name="ar_Extension"></param>
    /// <param name="OpenWith"></param>
    /// <param name="ExecutableName"></param>
    public void AssociationExtension(object[] arExtension, string appPath) {
        _fileAssociationService.AssociationExtension(arExtension, appPath);
    }

    /// <summary>
    /// 解除關聯副檔名
    /// </summary>
    /// <param name="ar_Extension"></param>
    /// <param name="OpenWith"></param>
    /// <param name="ExecutableName"></param>
    public void RemoveAssociationExtension(object[] arExtension, string appPath) {
        _fileAssociationService.RemoveAssociationExtension(arExtension, appPath);
    }

    /// <summary>
    /// 對檔案進行排序
    /// </summary>
    /// <param name="ar"></param>
    /// <param name="type"></param>
    /// <returns></returns>
    public string[] Sort(object[] ar, string type) {
        string[] arFile = new string[ar.Length];
        for (int i = 0; i < arFile.Length; i++) {
            arFile[i] = ar[i].ToString();
        }
        var filesort = new FileSort();
        return filesort.Sort(arFile, type);
    }

    /// <summary>
    /// 對檔案進行排序。同一資料夾內的檔案就不傳入與回傳完整路徑，減少傳輸成本
    /// </summary>
    /// <param name="dir"></param>
    /// <param name="ar"></param>
    /// <param name="type"></param>
    /// <returns></returns>
    public string[] Sort2(string dir, object[] ar, string type) {
        var filesort = new FileSort();
        return filesort.Sort2(dir, ar, type);
    }

}
