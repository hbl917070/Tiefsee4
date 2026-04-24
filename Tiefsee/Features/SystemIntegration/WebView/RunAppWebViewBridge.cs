using System.Runtime.InteropServices;

namespace Tiefsee;

[ComVisible(true)]
public class RunAppWebViewBridge {

    WebWindow M;
    private readonly UwpAppService _uwpAppService = new();
    private readonly SystemEnvironmentService _systemEnvironmentService = new();
    private readonly ExternalLauncherService _externalLauncherService = new();

    /// <summary>
    /// 建立外部程式啟動相關的 WebView bridge
    /// </summary>
    /// <param name="m"></param>
    public RunAppWebViewBridge(WebWindow m) {
        this.M = m;
    }

    /// <summary>
    /// 提供序列化或設計工具使用的空白建構式
    /// </summary>
    public RunAppWebViewBridge() { }

    /// <summary>
    /// 以其他程式開啟(系統原生選單)
    /// </summary>
    /// <param name="path"></param>
    public void ShowMenu(string path) {
        _externalLauncherService.ShowOpenWithMenu(path);
    }

    /// <summary>
    /// 取得開始選單裡面的所有 lnk
    /// </summary>
    public string[] GetStartMenuList() {
        return _externalLauncherService.GetStartMenuList(GetSystemRoot());
    }

    /// <summary>
    /// 取得系統槽，例如 C:\
    /// </summary>
    public string GetSystemRoot() {
        return _systemEnvironmentService.GetSystemRoot();
    }

    /// <summary>
    /// 以 UWP 開啟檔案
    /// </summary>
    /// <param name="uwpId"> 例如 Microsoft.ScreenSketch_8wekyb3d8bbwe </param>
    /// <param name="filePath"></param>
    async public void RunUwp(string uwpId, string filePath) {
        await _externalLauncherService.RunUwp(uwpId, filePath);
    }

    /// <summary>
    /// 取得 UWP 列表
    /// </summary>
    public List<UwpItem> GetUwpList() {
        return _uwpAppService.GetUwpList();
    }

    /// <summary>
    /// 執行其他程式
    /// </summary>
    /// <param name="FileName"></param>
    /// <param name="Arguments"></param>
    /// <param name="CreateNoWindow"></param>
    /// <param name="UseShellExecute"></param>
    public void ProcessStart(string FileName, string Arguments, bool CreateNoWindow, bool UseShellExecute) {
        _externalLauncherService.ProcessStart(FileName, Arguments, CreateNoWindow, UseShellExecute);
    }

    /// <summary>
    /// 用瀏覽器開啟網址
    /// </summary>
    /// <param name="url"></param>
    public bool OpenUrl(string url) {
        return _externalLauncherService.OpenUrl(url);
    }
}
