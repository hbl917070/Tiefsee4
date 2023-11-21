using Newtonsoft.Json;
using System.IO;
using System.Runtime.InteropServices;

namespace Tiefsee {

    [ComVisible(true)]
    public class WV_Directory {

        WebWindow M;

        public WV_Directory(WebWindow m) {
            this.M = m;
        }
        public WV_Directory() { }


        /// <summary>
        /// 取得跟自己同層的資料夾內的檔案資料(自然排序的前4筆)
        /// </summary>
        /// <param name="siblingPath"></param>
        /// <param name="_arExt"> 副檔名 </param>
        /// <param name="maxCount"> 資料夾允許處理的最大數量 </param>
        /// <returns></returns>
        public string GetSiblingDir(string siblingPath, object[] _arExt, int maxCount) {

            if (maxCount <= -1) { maxCount = int.MaxValue; }

            //如果資料夾不存在
            if (Directory.Exists(siblingPath) == false) { return "{}"; }

            //把副檔名轉小寫。例如 JPG => .jpg
            string[] arExt = new string[_arExt.Length];
            for (int i = 0; i < _arExt.Length; i++) {
                arExt[i] = "." + ((String)_arExt[i]).ToLower();
            }

            string parentPath = Path.GetDirectoryName(siblingPath); // 取得父親資料夾
            Dictionary<string, List<string>> output = new Dictionary<string, List<string>>();

            string[] arDir = new string[0];
            try { // 如果取得所有資料夾失敗，就只處理自己目前的資料夾
                if (parentPath == null) { // 如果沒有上一層資料夾
                    arDir = new string[] { siblingPath }; // 只處理自己
                } else if (parentPath == Environment.GetFolderPath(Environment.SpecialFolder.UserProfile)) { //如果開啟的是 user資料夾 裡面的資料(例如桌面
                    arDir = new string[] { siblingPath }; // 只處理自己
                } else if (maxCount == 0) {
                    arDir = new string[] { siblingPath }; // 只處理自己
                } else {
                    arDir = Directory.GetDirectories(parentPath); // 取得所有子資料夾
                    if (arDir.Length > maxCount) { // 如果資料夾太多
                        arDir = new string[] { siblingPath }; // 只處理自己
                    }
                }
            } catch {
                arDir = new string[] { siblingPath }; // 只處理自己
            }

            foreach (var dirPath in arDir) { // 所有子資料夾
                string dirName = Path.GetFileName(dirPath);
                string[] arFile;
                try {
                    // arFile = Directory.GetFiles(dirPath);
                    if (arExt.Length == 0) {
                        // 取得資料夾內前4個檔案的檔名
                        arFile = Directory.EnumerateFiles(dirPath, "*.*")
                            .Select(filePath => Path.GetFileName(filePath)).Take(4).ToArray();
                    } else {
                        // 以副檔名來篩選，取得資料夾內前4個檔案的檔名
                        var query = Directory.EnumerateFiles(dirPath, "*.*", SearchOption.TopDirectoryOnly)
                            .Where(file => arExt.Contains(Path.GetExtension(file).ToLower(), StringComparer.Ordinal));
                        arFile = query.Take(4).Select(f => Path.GetFileName(f)).ToArray();
                    }
                } catch {
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
                              .Select(filePath => Path.GetFileName(filePath)).Take(4).ToArray();
                    foreach (string item in arFile) {
                        output[siblingPathName].Add(item);
                    }
                } catch { }
            }

            return JsonConvert.SerializeObject(output);
        }

        /// <summary>
        /// 檔名陣列 轉 路徑陣列 (用於載入複數檔案
        /// </summary>
        /// <param name="dirPath"> 資料夾路徑 </param>
        /// <param name="arName"> 檔名陣列 </param>
        /// <returns></returns>
        public string[] GetFiles2(string dirPath, object[] arName) {

            List<string> arWaitingList = new List<string>();

            bool useFullPath = arName.Length < 1000;

            for (int i = 0; i < arName.Length; i++) {
                string item = arName[i].ToString();
                string filePath;
                if (useFullPath) {
                    filePath = Path.GetFullPath(Path.Combine(dirPath, item)); // 避免長路經被轉換成虛擬路徑
                } else {
                    filePath = Path.Combine(dirPath, item);
                }

                if (File.Exists(filePath)) { // 如果是檔案
                    arWaitingList.Add(filePath);

                } else if (Directory.Exists(filePath)) { // 如果是資料夾
                    string[] arFile = Directory.GetFiles(filePath, "*.*"); // 取得資料夾內所有檔案
                    for (int j = 0; j < arFile.Length; j++) {
                        arWaitingList.Add(arFile[j]);
                    }
                }
            }

            return arWaitingList.ToArray();
        }

        /// <summary>
        /// 判斷指定路徑是否參考磁碟上的現有目錄
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public bool Exists(string path) {
            return Directory.Exists(path);
        }

        /// <summary>
        /// 新建目錄
        /// </summary>
        /// <param name="path"></param>
        public void CreateDirectory(string path) {
            Directory.CreateDirectory(path);
        }

        /// <summary>
        /// 擷取指定路徑的父目錄
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public DirectoryInfo GetParent(string path) {
            return Directory.GetParent(path);
        }

        /// <summary>
        /// 刪除資料夾(包含子目錄與檔案)
        /// </summary>
        /// <param name="path"></param>
        public string Delete(string path) {
            //if (Directory.Exists(path) == false) { return false; }
            try {
                Directory.Delete(path, true);
            } catch (Exception e) {
                return e.Message;
            }
            return "";
        }

        /// <summary>
        /// 資料夾移到資源回收桶
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public string MoveToRecycle(string path) {
            //if (Directory.Exists(path) == false) { return false; }
            try {
                Microsoft.VisualBasic.FileIO.FileSystem.DeleteDirectory(
                    path,
                    Microsoft.VisualBasic.FileIO.UIOption.OnlyErrorDialogs,
                    Microsoft.VisualBasic.FileIO.RecycleOption.SendToRecycleBin
                );
            } catch (Exception e) {
                return e.Message;
            }
            return "";
        }

        /// <summary>
        /// 移動檔案或目錄和其內容到新位置
        /// </summary>
        /// <param name="sourceDirName"></param>
        /// <param name="destDirName"></param>
        public string Move(string sourceDirName, string destDirName) {
            try {
                Directory.Move(sourceDirName, destDirName);
            } catch (Exception e) {
                return e.Message;
            }
            return "";
        }

        /// <summary>
        /// 回傳資料夾裡面的檔案
        /// </summary>
        /// <param name="path"></param>
        /// <param name="searchPattern"></param>
        /// <returns></returns>
        public String[] GetFiles(string path, string searchPattern) {
            if (searchPattern == null || searchPattern == "") {
                return Directory.GetFiles(path);
            }
            return Directory.GetFiles(path, searchPattern);
        }

        /// <summary>
        /// 傳回指定目錄中符合指定搜尋模式的子目錄名稱 (包括檔案的路徑)
        /// </summary>
        /// <param name="path"></param>
        /// <param name="searchPattern"></param>
        /// <returns></returns>
        public String[] GetDirectories(string path, string searchPattern) {
            if (searchPattern == null || searchPattern == "") {
                return Directory.GetDirectories(path);
            }
            return Directory.GetDirectories(path, searchPattern);
        }

        private long toUnix(DateTime time) {
            var t = time.Subtract(new DateTime(1970, 1, 1));
            String unixTimestamp = (Int32)t.TotalSeconds + t.Milliseconds.ToString("000");
            return long.Parse(unixTimestamp);
        }

        /// <summary>
        /// 取得資料夾的建立時間
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public long GetCreationTimeUtc(string path) {
            if (Directory.Exists(path) == false) { return 0; }
            var time = Directory.GetCreationTimeUtc(path);
            long unixTimestamp = toUnix(time);
            return unixTimestamp;
        }

        /// <summary>
        /// 傳回指定檔案或目錄上次被寫入的日期和時間
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public long GetLastWriteTimeUtc(string path) {
            if (Directory.Exists(path) == false) { return 0; }
            var time = Directory.GetLastWriteTimeUtc(path);
            long unixTimestamp = toUnix(time);
            return unixTimestamp;
        }

        /// <summary>
        /// 取得資料夾的建立時間(於js使用的話，必須在加上時區)
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        /*public long GetCreationTime(string path) {
            var time = Directory.GetCreationTime(path);
            long unixTimestamp = toUnix(time);
            return unixTimestamp;
        }*/


    }
}
