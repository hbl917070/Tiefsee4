using System.Text.Json;

namespace Tiefsee;

/// <summary>
/// 包裝檔案監看並轉送結果給 WebView
/// </summary>
public sealed class WebViewFileWatcherService {

    private readonly FileWatcherService _fileWatcher = new();

    /// <summary>
    /// 建立新的檔案監看
    /// </summary>
    public void NewFileWatcher(string key, string path, Action<string> onChanged) {
        _fileWatcher.NewFileWatcher(key, path, (List<FileWatcherData> arData) => {
            string data = JsonSerializer.Serialize(arData);
            onChanged(data);
        });
    }

    /// <summary>
    /// 停止所有檔案監看
    /// </summary>
    public void Dispose() {
        _fileWatcher.FileWatcherDispose();
    }
}
