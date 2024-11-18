using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using Windows.Management.Deployment;

namespace Tiefsee;

[ComVisible(true)]
public class WV_RunApp {

    WebWindow M;
    public WV_RunApp(WebWindow m) {
        this.M = m;
    }
    public WV_RunApp() { }

    /// <summary>
    /// 以其他程式開啟(系統原生選單)
    /// </summary>
    public void ShowMenu(string path) {
        if (File.Exists(path)) { // 判別檔案是否存在於對應的路徑
            try {
                Process.Start(new ProcessStartInfo("rundll32.exe") {
                    Arguments = $"shell32.dll,OpenAs_RunDLL {path}",
                    WorkingDirectory = Path.GetDirectoryName(path),
                    UseShellExecute = true
                });
            }
            catch (Exception e2) {
                MessageBox.Show(e2.ToString(), "Error");
            }
        }
    }

    /// <summary>
    /// 取得開始選單裡面的所有 lnk
    /// </summary>
    public string[] GetStartMenuList() {

        List<string> arFile = new();
        string path;

        // 全域的開始選單
        path = Path.GetPathRoot(Environment.GetFolderPath(Environment.SpecialFolder.Windows));
        path = Path.Combine(path, @"ProgramData\Microsoft\Windows\Start Menu\Programs"); // 開始選單的路徑
        if (Directory.Exists(path)) {
            GetDirForeachFiles(path, arFile);
        }

        // 使用者的開始選單
        path = System.Environment.GetFolderPath(Environment.SpecialFolder.StartMenu);
        path = Path.Combine(path, "Programs");
        if (Directory.Exists(path)) {
            GetDirForeachFiles(path, arFile);
        }

        // 篩選出副檔名是 .lnk 的檔案路徑
        var lnkFiles = arFile
            .Where(file => Path.GetExtension(file).ToLower() == ".lnk")
            .ToArray();

        return lnkFiles;
    }

    /// <summary>
    /// 遞迴以取得資料夾內所有檔案 (攤開成一維陣列)
    /// </summary>
    private void GetDirForeachFiles(string sDir, List<string> arFile) {
        var arDir = Directory.EnumerateFileSystemEntries(sDir);
        foreach (var item in arDir) {
            if (File.Exists(item)) {
                arFile.Add(item);
            }
            else if (Directory.Exists(item)) {
                GetDirForeachFiles(item, arFile);
            }
        }
    }

    /// <summary>
    /// 取得系統槽，例如 C:\
    /// </summary>
    public string GetSystemRoot() {
        string path = Path.GetPathRoot(Environment.GetFolderPath(Environment.SpecialFolder.Windows));
        //path = path.Substring(0, 1);
        return path;
    }

    /// <summary>
    /// 以 UWP 開啟檔案
    /// </summary>
    /// <param name="uwpId"> 例如 Microsoft.ScreenSketch_8wekyb3d8bbwe </param>
    /// <param name="filePath"></param>
    async public void RunUwp(string uwpId, string filePath) {
        var file = await Windows.Storage.StorageFile.GetFileFromPathAsync(filePath);
        if (file != null) {
            var options = new Windows.System.LauncherOptions();
            options.TargetApplicationPackageFamilyName = uwpId;
            await Windows.System.Launcher.LaunchFileAsync(file, options);
        }
    }

    public class UwpItem {
        public string Logo { get; set; }
        public string Name { get; set; }
        public string Id { get; set; }
    }


    /// <summary>
    /// 取得 UWP 列表
    /// </summary>
    public List<UwpItem> GetUwpList() {

        bool isFirstRun = false;
        if (_tempUwpItem == null) { // 判斷是否為首次執行
            isFirstRun = true;
            try {
                // 如果存在 UwpList.json 的暫存檔，就讀取此檔案
                string jsonString = "{}";
                if (File.Exists(AppPath.appDataUwpList)) {
                    using (StreamReader sr = new StreamReader(AppPath.appDataUwpList, Encoding.UTF8)) {
                        jsonString = sr.ReadToEnd();
                    }
                }
                _tempUwpItem = JsonSerializer.Deserialize<Dictionary<string, UwpItem>>(jsonString)
                    // 忽略異常的資料
                    .Where(x => string.IsNullOrEmpty(x.Value.Name) == false &&
                        string.IsNullOrEmpty(x.Value.Logo) == false &&
                        string.IsNullOrEmpty(x.Value.Id) == false)
                    .ToDictionary();

            }
            catch (Exception) {
                _tempUwpItem = new();
            }
        }

        var temp_appDataUwpList = new Dictionary<string, UwpItem>();
        var ar = new List<UwpItem>();
        var packageManager = new PackageManager();
        var packages = packageManager.FindPackagesForUser("");
        foreach (var package in packages) {

            string fullName = package.Id.FullName; // 名稱+版本

            // 如果暫存不存在此筆資料，則重新抓資料
            if (_tempUwpItem.ContainsKey(fullName) == false) {
                string name = package.DisplayName; // APP在地化的名稱 (取得成本高)
                string logo = package.Logo.ToString(); // 圖示的路徑 (取得成本高)
                string id = package.Id.Name + "_" + package.Id.PublisherId;
                // 忽略異常的資料
                if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(logo) || string.IsNullOrEmpty(id)) {
                    continue;
                }
                _tempUwpItem.Add(fullName, new UwpItem {
                    Logo = logo,
                    Name = name,
                    Id = id
                });
            }

            if (isFirstRun) {
                temp_appDataUwpList.Add(fullName, _tempUwpItem[fullName]);
            }

            ar.Add(_tempUwpItem[fullName]);
        }

        // 如果是首次執行，就產生暫存檔，減少下次讀取的時間
        if (isFirstRun) {
            using var fs = new FileStream(AppPath.appDataUwpList, FileMode.Create);
            using var sw = new StreamWriter(fs, Encoding.UTF8);
            sw.Write(JsonSerializer.Serialize(temp_appDataUwpList));
        }

        return ar;
    }
    private static Dictionary<string, UwpItem> _tempUwpItem = null;

    /// <summary>
    /// 執行其他程式
    /// </summary>
    /// <param name="FileName"></param>
    /// <param name="Arguments"></param>
    /// <param name="CreateNoWindow"></param>
    /// <param name="UseShellExecute"></param>
    public void ProcessStart(string FileName, string Arguments, bool CreateNoWindow, bool UseShellExecute) {
        var psi = new System.Diagnostics.ProcessStartInfo {
            FileName = FileName, // 執行檔路徑
            WorkingDirectory = Path.GetDirectoryName(FileName), // 設定執行檔所在的目錄
            Arguments = Arguments, // 命令參數
            CreateNoWindow = CreateNoWindow, // 是否使用新視窗
            UseShellExecute = UseShellExecute // false=新視窗個體
        };
        System.Diagnostics.Process.Start(psi);
    }

    /// <summary>
    /// 用瀏覽器開啟網址
    /// </summary>
    public bool OpenUrl(string url) {
        try {
            var psi = new ProcessStartInfo {
                FileName = url,
                UseShellExecute = true
            };
            Process.Start(psi);
            return true;
        }
        catch {
            return false;
        }
    }

}
