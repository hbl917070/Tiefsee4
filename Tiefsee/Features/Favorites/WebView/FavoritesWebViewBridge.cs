using System.Runtime.InteropServices;

namespace Tiefsee;

[ComVisible(true)]
public sealed class FavoritesWebViewBridge {

    private readonly FavoritesStoreService _store = new();
    private readonly WebWindow _window;

    public FavoritesWebViewBridge(WebWindow window) {
        _window = window;
    }

    public Task<string> ReadJson() => _store.ReadJson();

    public Task SaveJson(string json) => _store.SaveJson(json);

    public Task<bool> Exists(string type, string path) => _store.Exists(type, path);

    public string BrowseFile(string title) => _window.FileBridge.OpenFileDialog(false, "All files (*.*)|*.*", title).FirstOrDefault() ?? "";

    public string BrowseDirectory(string title) => _window.FileBridge.SelectFolderDialog(title);
}
