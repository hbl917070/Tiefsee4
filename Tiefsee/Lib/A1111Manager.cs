using System.Diagnostics;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Tiefsee;

public class A1111Manager {

    private static Dictionary<string, SafetensorsData> _dicSafetensorsData = new();
    private string _tempPath = null;
    // 判斷是否需要更新暫存檔
    private bool _isNeedUpdateTemp = false;

    public A1111Manager(string tempPath) {
        _tempPath = tempPath;

        lock (_dicSafetensorsData) {
            if (_dicSafetensorsData.Count != 0)
                return;
        }

        try {
            if (File.Exists(_tempPath)) {
                var jsonText = File.ReadAllText(_tempPath);
                var json = JsonSerializer.Deserialize<Dictionary<string, SafetensorsData>>(jsonText);
                lock (_dicSafetensorsData) {
                    _dicSafetensorsData = json;
                }
            }
        }
        catch { }
    }

    /// <summary>
    /// 取得 LoRA 相關資源
    /// </summary>
    /// <param name="searchDirs"> 要搜尋的目錄 </param>
    /// <param name="loraNames"> LoRA 名稱 (忽略大小寫) </param>
    /// <returns></returns>
    public Dictionary<string, List<string>> GetA1111LoraResource(string[] searchDirs, string[] loraNames, string[] excludeDirs) {

        // 過濾重複的目錄
        searchDirs = searchDirs
            .Select(dir => Path.GetFullPath(dir).TrimEnd(Path.DirectorySeparatorChar) + "\\") // 處理成絕對路徑
            .Distinct(StringComparer.OrdinalIgnoreCase) // 忽略大小寫並去除重複
            .Where(dir => Directory.Exists(dir)) // 只處理存在的目錄
            .OrderBy(dir => dir.Length) // 按路徑長度排序，確保父目錄優先        
            .ToArray();

        // 如果已經有上層的目錄，則忽略子目錄
        var dirs = new List<string>();
        foreach (var dir in searchDirs) {
            bool isSubDirectory = false;
            foreach (var existingDir in dirs) {
                if (dir.StartsWith(existingDir, StringComparison.OrdinalIgnoreCase)) {
                    isSubDirectory = true;
                    break;
                }
            }
            if (!isSubDirectory) {
                dirs.Add(dir);
            }
        }

        // 取得所有需要處理的資料夾
        dirs = dirs
            .SelectMany(dir => GetDirectoriesExcluding(dir, excludeDirs))
            .Distinct()
            .ToList();

        var loraResources = loraNames
            .ToDictionary(name => name, name => new List<string>());

        foreach (var dir in dirs) {
            foreach (var filePath in Directory.GetFiles(dir)) {
                var fileName = Path.GetFileName(filePath).ToLower();
                var fileExtension = Path.GetExtension(filePath).ToLower();
                var data = (fileExtension == ".safetensors") ? GetSafetensorsData(filePath) : null;

                foreach (var loraResourcs in loraResources.Keys) {

                    // 例如 lora 的名稱是 aa-3.2
                    // 那麼 aa-3.2.png 跟 aa-3.2.private.png 都要加進去
                    // 而 aa-3.21.png 則應該不加進去
                    if (fileName.StartsWith(loraResourcs.ToLower() + ".")) {
                        loraResources[loraResourcs].Add(filePath);
                    }
                    // 如果不是同名的檔案，就從內嵌在 LoRA 裡面的名稱來判斷
                    else if (data != null && data.SsOutputName == loraResourcs) {
                        // 把其他資源也加進去
                        var fileBaseName = Path.GetFileNameWithoutExtension(filePath); // 不含副檔名的檔名
                        loraResources[loraResourcs].AddRange(Directory.GetFiles(dir, $"{fileBaseName}.*"));
                    }
                }

            }
        }

        if (_isNeedUpdateTemp) {
            _isNeedUpdateTemp = false;
            string jsongText = null;
            lock (_dicSafetensorsData) {
                jsongText = JsonSerializer.Serialize(_dicSafetensorsData, new JsonSerializerOptions());
            }
            File.WriteAllText(_tempPath, jsongText);
        }

        return loraResources;
    }

    /// <summary>
    /// 取得 Safetensors 資料
    /// </summary>
    public SafetensorsData GetSafetensorsData(string path) {

        var fileinfo = new FileInfo(path);
        var key = path.ToLower();

        lock (_dicSafetensorsData) {
            if (_dicSafetensorsData.ContainsKey(key) && _dicSafetensorsData[key].LastWriteTimeUtc == fileinfo.LastWriteTimeUtc) {
                return _dicSafetensorsData[key];
            }
        }
        string sshsModelHash = null;
        string ssOutputName = null;

        // 小於 3G 應該就是 LoRA，嘗試從裡面提取真實名稱
        if (fileinfo.Length < (long)1024 * 1024 * 1024 * 3) {

            var text = GetFileHeader(path, 1000 * 50);

            /* var indexSshsModelHash = text.IndexOf("\"sshs_model_hash\"");
            if (indexSshsModelHash != -1)
                sshsModelHash = text.Substring(indexSshsModelHash + 19, 64); */

            var indexSsOutputName = text.IndexOf("\"ss_output_name\"");
            if (indexSsOutputName != -1) {
                var indexSsOutputNameEnd = text.IndexOf(",", indexSsOutputName);
                ssOutputName = text.Substring(indexSsOutputName + 18, indexSsOutputNameEnd - indexSsOutputName - 19);
            }
        }

        var safetensorsData = new SafetensorsData {
            LastWriteTimeUtc = fileinfo.LastWriteTimeUtc,
            // PathHash = ComputeSha256Hash(path),
            // SshsModelHash = sshsModelHash,
            SsOutputName = ssOutputName,
        };

        lock (_dicSafetensorsData) {
            _dicSafetensorsData[key] = safetensorsData;
        }

        _isNeedUpdateTemp = true;

        return safetensorsData;
    }

    /// <summary>
    /// 遞迴取得目錄內所有子目錄，排除特定目錄及其子目錄。
    /// </summary>
    /// <param name="rootDir"> 起始目錄路徑 </param>
    /// <param name="excludeDirs"> 要排除的目錄名稱集合 </param>
    /// <returns> 所有符合條件的目錄清單 </returns>
    public List<string> GetDirectoriesExcluding(string rootDir, string[] excludeDirs) {

        var result = new List<string>();

        result.Add(rootDir);

        try {
            foreach (var dir in Directory.GetDirectories(rootDir)) {
                // 取得目錄名稱
                string folderName = Path.GetFileName(dir);

                // 如果目錄名稱不在排除清單，則加入結果並遞迴搜尋其子目錄
                if (!excludeDirs.Contains(folderName)) {
                    result.Add(dir);
                    result.AddRange(GetDirectoriesExcluding(dir, excludeDirs));
                }
            }
        }
        catch (UnauthorizedAccessException) {
            // 當目錄無法存取時跳過
            Debug.WriteLine($"無法存取目錄：{rootDir}");
        }

        return result;
    }

    /// <summary>
    /// 取得2進制檔案內容的前幾個字元
    /// </summary>
    /// <param name="path"></param>
    /// <param name="maxChars"> 最大處理字符數 </param>
    /// <returns></returns>
    private string GetFileHeader(string path, int maxChars = 1000) {
        var sb = new StringBuilder();
        using var fs = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);

        // 使用緩衝區來讀取檔案內容
        var buffer = new byte[8192]; // 8KB 緩衝區
        int bytesRead;
        int charCount = 0;

        while ((bytesRead = fs.Read(buffer, 0, buffer.Length)) > 0) {
            // 遍歷緩衝區中的字節，過濾可見字符
            for (var i = 0; i < bytesRead; i++) {
                var b = buffer[i];
                if (b >= 32 && b <= 126) // 可見字符
                {
                    sb.Append((char)b);
                    charCount++;

                    if (charCount >= maxChars) {
                        break; // 已達最大字符數，停止處理
                    }
                }
            }

            if (charCount >= maxChars) {
                break; // 全部完成
            }
        }

        return sb.ToString();
    }

    /// <summary>
    /// 計算字串的 SHA256 雜湊值
    /// </summary>
    private string ComputeSha256Hash(string input) {
        using (SHA256 sha256 = SHA256.Create()) {
            byte[] bytes = Encoding.UTF8.GetBytes(input);
            byte[] hash = sha256.ComputeHash(bytes);
            return BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
        }
    }

}

public class SafetensorsData {
    /// <summary>
    /// 嵌入在檔案裡面的資訊 sshs_model_hash
    /// </summary>
    // public string SshsModelHash { get; set; }
    /// <summary>
    /// 嵌入在檔案裡面的資訊 ss_output_name
    /// </summary>
    public string SsOutputName { get; set; }

    /// <summary>
    /// 檔案最後寫入時間
    /// </summary>
    public DateTime LastWriteTimeUtc { get; set; }
    /// <summary>
    /// 檔案路徑的雜湊
    /// </summary>
    // public string PathHash { get; set; }
}
