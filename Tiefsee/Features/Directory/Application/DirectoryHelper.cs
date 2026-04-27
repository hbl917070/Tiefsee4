using System.IO;

namespace Tiefsee;

public class DirectoryHelper {

    /// <summary>
    /// 取得跟自己同層的資料夾內的檔案資料(自然排序的前4筆)
    /// </summary>
    /// <param name="siblingPath"></param>
    /// <param name="arExt"> 副檔名 </param>
    /// <param name="maxCount"> 資料夾允許處理的最大數量 </param>
    /// <returns></returns>
    public Dictionary<string, List<string>> GetSiblingDir(string siblingPath, object[] arExt, int maxCount) {

        if (maxCount <= -1) { maxCount = int.MaxValue; }

        // 如果資料夾不存在
        if (Directory.Exists(siblingPath) == false) { return new(); }

        // 把副檔名轉小寫。例如 JPG => .jpg
        string[] fileExtensions = arExt
            .Select(x => "." + ((string)x).ToLower())
            .ToArray();

        string parentPath = Path.GetDirectoryName(siblingPath); // 取得父親資料夾
        Dictionary<string, List<string>> output = new();

        string[] arDir = [];
        try { // 如果取得所有資料夾失敗，就只處理自己目前的資料夾
            if (parentPath == null) { // 如果沒有上一層資料夾
                arDir = [siblingPath]; // 只處理自己
            }
            else if (parentPath == Environment.GetFolderPath(Environment.SpecialFolder.UserProfile)) { //如果開啟的是 user資料夾 裡面的資料(例如桌面
                arDir = [siblingPath]; // 只處理自己
            }
            else if (maxCount == 0) {
                arDir = [siblingPath]; // 只處理自己
            }
            else {
                arDir = Directory.GetDirectories(parentPath); // 取得所有子資料夾
                if (arDir.Length > maxCount) { // 如果資料夾太多
                    arDir = [siblingPath]; // 只處理自己
                }
            }
        }
        catch {
            arDir = [siblingPath]; // 只處理自己
        }

        foreach (var dirPath in arDir) { // 所有子資料夾
            string dirName = Path.GetFileName(dirPath);
            string[] arFile;
            try {
                // arFile = Directory.GetFiles(dirPath);
                if (fileExtensions.Length == 0) {
                    // 取得資料夾內前4個檔案的檔名
                    arFile = Directory.EnumerateFiles(dirPath, "*.*")
                        .Select(filePath => Path.GetFileName(filePath)).Take(4).ToArray();
                }
                else {
                    // 以副檔名來篩選，取得資料夾內前4個檔案的檔名
                    var query = Directory.EnumerateFiles(dirPath, "*.*", SearchOption.TopDirectoryOnly)
                        .Where(file => fileExtensions.Contains(Path.GetExtension(file).ToLower(), StringComparer.Ordinal));
                    arFile = query.Take(4).Select(f => Path.GetFileName(f)).ToArray();
                }
            }
            catch {
                continue;
            }
            if (arFile.Length == 0) {
                continue;
            }

            //檔名自然排序
            /*int len = arFile.Length;
            if (len > 51) { len = 51; }
            Array.Sort(arFile,  new NaturalSort());*/

            foreach (string item in arFile) {
                if (output.ContainsKey(dirName) == false) { // 以資料夾名稱當做 key
                    output.Add(dirName, new List<string>());
                }
                output[dirName].Add(item);
            }

        }

        // 如果取得的名單內不包含自己，就補上
        string siblingPathName = Path.GetFileName(siblingPath);
        if (output.ContainsKey(siblingPathName) == false) {
            output.Add(siblingPathName, new List<string>());
            try {
                // 取得資料夾內前4個檔案的檔名
                string[] arFile = Directory.EnumerateFiles(siblingPath, "*.*")
                    .Select(filePath => Path.GetFileName(filePath))
                    .Take(4)
                    .ToArray();
                output[siblingPathName].AddRange(arFile);
            }
            catch { }
        }

        return output;
    }

    /// <summary>
    /// 檔名陣列 轉 路徑陣列 (用於載入複數檔案
    /// </summary>
    /// <param name="dirPath"> 資料夾路徑 </param>
    /// <param name="arName"> 檔名陣列 </param>
    /// <returns></returns>
    public string[] GetFiles2(string dirPath, object[] arName) {

        List<string> arWaitingList = new();

        bool useFullPath = arName.Length < 1000;

        for (int i = 0; i < arName.Length; i++) {
            string item = arName[i].ToString();
            string filePath;
            if (useFullPath) {
                filePath = Path.GetFullPath(Path.Combine(dirPath, item)); // 避免長路經被轉換成虛擬路徑
            }
            else {
                filePath = Path.Combine(dirPath, item);
            }

            if (File.Exists(filePath)) { // 如果是檔案
                arWaitingList.Add(filePath);
            }
            else if (Directory.Exists(filePath)) { // 如果是資料夾
                string[] arFile = Directory.GetFiles(filePath, "*.*"); // 取得資料夾內所有檔案
                arWaitingList.AddRange(arFile);
            }
        }

        return arWaitingList.ToArray();
    }

}
