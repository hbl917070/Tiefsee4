using System.IO;
using System.Text;
using System.Text.Json;
using Windows.Management.Deployment;

namespace Tiefsee;

/// <summary>
/// UWP App
/// </summary>
public sealed class UwpAppService {

    private readonly string _appDataUwpListPath;
    private Dictionary<string, UwpItem> _tempUwpItems = null;

    public UwpAppService(string appDataUwpListPath) {
        _appDataUwpListPath = appDataUwpListPath;
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
    /// 取得 UWP 列表
    /// </summary>
    public List<UwpItem> GetUwpList() {
        bool isFirstRun = false;
        if (_tempUwpItems == null) {
            isFirstRun = true;
            _tempUwpItems = LoadCache();
        }

        var tempAppDataUwpList = new Dictionary<string, UwpItem>();
        var result = new List<UwpItem>();
        var packageManager = new PackageManager();
        var packages = packageManager.FindPackagesForUser("");

        foreach (var package in packages) {
            string fullName = package.Id.FullName;

            if (_tempUwpItems.ContainsKey(fullName) == false) {
                TryAddPackage(package, fullName);
            }

            if (_tempUwpItems.ContainsKey(fullName) == false) {
                continue;
            }

            if (isFirstRun) {
                tempAppDataUwpList.Add(fullName, _tempUwpItems[fullName]);
            }

            result.Add(_tempUwpItems[fullName]);
        }

        if (isFirstRun) {
            SaveCache(tempAppDataUwpList);
        }

        return result;
    }

    /// <summary>
    /// 載入 UWP 清單快取
    /// </summary>
    private Dictionary<string, UwpItem> LoadCache() {
        try {
            string jsonString = "{}";
            if (File.Exists(_appDataUwpListPath)) {
                using StreamReader sr = new(_appDataUwpListPath, Encoding.UTF8);
                jsonString = sr.ReadToEnd();
            }

            return JsonSerializer.Deserialize<Dictionary<string, UwpItem>>(jsonString)
                .Where(x => string.IsNullOrEmpty(x.Value.Name) == false &&
                            string.IsNullOrEmpty(x.Value.Logo) == false &&
                            string.IsNullOrEmpty(x.Value.Id) == false)
                .ToDictionary();
        }
        catch {
            return new();
        }
    }

    /// <summary>
    /// 嘗試將 package 寫入快取
    /// </summary>
    private void TryAddPackage(Windows.ApplicationModel.Package package, string fullName) {
        try {
            string name = package.DisplayName;
            string logo = package.Logo.ToString();
            string id = package.Id.Name + "_" + package.Id.PublisherId;
            if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(logo) || string.IsNullOrEmpty(id)) {
                return;
            }

            _tempUwpItems.Add(fullName, new UwpItem {
                Logo = logo,
                Name = name,
                Id = id
            });
        }
        catch { }
    }

    /// <summary>
    /// 將快取寫回檔案
    /// </summary>
    private void SaveCache(Dictionary<string, UwpItem> tempAppDataUwpList) {
        using var fs = new FileStream(_appDataUwpListPath, FileMode.Create);
        using var sw = new StreamWriter(fs, Encoding.UTF8);
        sw.Write(JsonSerializer.Serialize(tempAppDataUwpList));
    }
}
