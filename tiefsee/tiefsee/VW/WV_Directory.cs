using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace TiefSee {

    [ClassInterface(ClassInterfaceType.AutoDual)]
    [ComVisible(true)]

    /// <summary>
    /// 網頁呼叫C#方法
    /// </summary>
    public class WV_Directory {

        WebWindow M;

        public WV_Directory(WebWindow m) {
            this.M = m;
        }

        /// <summary>
        /// 檔名陣列 轉 路徑陣列 (用於載入複數檔案
        /// </summary>
        /// <param name="dirPath"> 資料夾路徑 </param>
        /// <param name="arName"> 檔名陣列 </param>
        /// <returns></returns>
        public string[] GetFiles2(string dirPath, object[] arName) {

            List<string> arWaitingList = new List<string>();

            for (int i = 0; i < arName.Length; i++) {
                string item = arName[i].ToString();
                string filePath = Path.Combine(dirPath, item);
                if (File.Exists(filePath)) {//如果是檔案
                    arWaitingList.Add(filePath);

                } else if (Directory.Exists(filePath)) {//如果是資料夾
                    string[] arFile = Directory.GetFiles(filePath, "*.*");//取得資料夾內所有檔案
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
        public void Delete(string path) {
            Directory.Delete(path, true);
        }

        /// <summary>
        /// 移動檔案或目錄和其內容到新位置
        /// </summary>
        /// <param name="sourceDirName"></param>
        /// <param name="destDirName"></param>
        public void Move(string sourceDirName, string destDirName) {
            Directory.Move(sourceDirName, destDirName);
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


        long toUnix(DateTime time) {
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
