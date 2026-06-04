using System.Runtime.InteropServices;

namespace Tiefsee;

[ComVisible(true)]
public class ExternalLauncherWebViewBridge {

    WebWindow M;
    private readonly UwpAppService _uwpAppService;
    private readonly SystemEnvironmentHelper _systemEnvironmentHelper = new();
    private readonly ExternalLaunchHelper _externalLauncherHelper = new();

    /// <summary>
    /// 建立外部程式啟動相關的 WebView bridge
    /// </summary>
    /// <param name="m"></param>
    public ExternalLauncherWebViewBridge(WebWindow m) {
        this.M = m;
        _uwpAppService = Program.services.UwpApp;
    }

    /// <summary>
    /// 以其他程式開啟(系統原生選單)
    /// </summary>
    /// <param name="path"></param>
    public void ShowMenu(string path) {
        _externalLauncherHelper.ShowOpenWithMenu(path);
    }

    /// <summary>
    /// 取得開始選單裡面的所有 lnk
    /// </summary>
    public string[] GetStartMenuList() {
        return _externalLauncherHelper.GetStartMenuList(GetSystemRoot());
    }

    /// <summary>
    /// 取得系統槽，例如 C:\
    /// </summary>
    public string GetSystemRoot() {
        return _systemEnvironmentHelper.GetSystemRoot();
    }

    /// <summary>
    /// 以 UWP 開啟檔案
    /// </summary>
    /// <param name="uwpId"> 例如 Microsoft.ScreenSketch_8wekyb3d8bbwe </param>
    /// <param name="filePath"></param>
    async public void RunUwp(string uwpId, string filePath) {
        await _uwpAppService.RunUwp(uwpId, filePath);
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
    public bool ProcessStart(string FileName, string Arguments, bool CreateNoWindow, bool UseShellExecute) {
        return _externalLauncherHelper.ProcessStart(FileName, Arguments, CreateNoWindow, UseShellExecute);
    }

    /// <summary>
    /// 用瀏覽器開啟網址
    /// </summary>
    /// <param name="url"></param>
    public bool OpenUrl(string url) {
        return _externalLauncherHelper.OpenUrl(url);
    }
}
