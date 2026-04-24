using System.IO;
using System.Text;
using System.Text.Json;
using Windows.Management.Deployment;

namespace Tiefsee;

/// <summary>
/// 取得與快取 UWP app 清單
/// </summary>
public sealed class UwpAppService {

    private static Dictionary<string, UwpItem> _tempUwpItem = null;

    /// <summary>
    /// 取得 UWP 列表
    /// </summary>
    public List<UwpItem> GetUwpList() {
        bool isFirstRun = false;
        if (_tempUwpItem == null) {
            isFirstRun = true;
            _tempUwpItem = LoadCache();
        }

        var tempAppDataUwpList = new Dictionary<string, UwpItem>();
        var result = new List<UwpItem>();
        var packageManager = new PackageManager();
        var packages = packageManager.FindPackagesForUser("");

        foreach (var package in packages) {
            string fullName = package.Id.FullName;

            if (_tempUwpItem.ContainsKey(fullName) == false) {
                TryAddPackage(package, fullName);
            }

            if (_tempUwpItem.ContainsKey(fullName) == false) {
                continue;
            }

            if (isFirstRun) {
                tempAppDataUwpList.Add(fullName, _tempUwpItem[fullName]);
            }

            result.Add(_tempUwpItem[fullName]);
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
            if (File.Exists(AppPath.appDataUwpList)) {
                using StreamReader sr = new(AppPath.appDataUwpList, Encoding.UTF8);
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

            _tempUwpItem.Add(fullName, new UwpItem {
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
        using var fs = new FileStream(AppPath.appDataUwpList, FileMode.Create);
        using var sw = new StreamWriter(fs, Encoding.UTF8);
        sw.Write(JsonSerializer.Serialize(tempAppDataUwpList));
    }
}
