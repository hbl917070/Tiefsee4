using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace Tiefsee {
    public class FileSort {


        /// <summary>
        /// 對檔案進行排序
        /// </summary>
        /// <param name="ar"> 檔案路徑陣列 </param>
        /// <param name="type"> 排序方式 </param>
        /// <returns></returns>
        public string[] Sort(string[] ar, string type) {

            if (type == "name") {//檔名自然排序
                Array.Sort(ar, new NaturalSort());
            }

            if (type == "nameDesc") {//檔名自然排序(逆) 
                Array.Sort(ar, new NaturalSortDesc());
            }

            if (type == "lastWriteTime") {//修改時間排序 
                ar = SortLastWriteTime(ar, true);
            }

            if (type == "lastWriteTimeDesc") {//修改時間排序(逆)  
                ar = SortLastWriteTime(ar, false);
            }

            return ar;
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="ar"></param>
        /// <param name="isAsc"> 是否為遞增排序 </param>
        /// <returns></returns>
        private string[] SortLastWriteTime(string[] ar, bool isAsc) {

            //檢查檔案是否存在
            List<FileSystemInfo> arF = new List<FileSystemInfo>();
            for (int i = 0; i < ar.Length; i++) {
                string path = ar[i];
                FileSystemInfo fileInfo = new FileInfo(path);
                if (fileInfo.Exists || Directory.Exists(path)) {//檔案或資料夾
                    arF.Add(fileInfo);
                }
            }

            if (isAsc) {
                arF = arF.OrderBy(f => f.LastWriteTime).ToList();
            } else {
                arF = arF.OrderByDescending(f => f.LastWriteTime).ToList();
            }

            string[] ar2 = new string[arF.Count];
            for (int i = 0; i < arF.Count; i++) {
                ar2[i] = arF[i].FullName;
            }

            return ar2;
        }


        /*
        /// <summary>
        /// 
        /// </summary>
        /// <param name="ar"></param>
        /// <param name="isAsc"> 是否為遞增排序 </param>
        /// <returns></returns>
        private string[] SortLastWriteTime(string[] ar, bool isAsc) {

            //取得每個檔案的修改時間
            var arFile = new List<FileInfo2>();
            for (int i = 0; i < ar.Length; i++) {
                string path = ar[i];

                if (File.Exists(path)) {//如果是檔案
                    arFile.Add(new FileInfo2 {
                        Path = ar[i],
                        LastWriteTime = File.GetLastWriteTime(ar[i])
                    });

                } else if (Directory.Exists(path)) {//如果是資料夾
                    arFile.Add(new FileInfo2 {
                        Path = ar[i],
                        LastWriteTime = Directory.GetLastWriteTime(ar[i])
                    });

                } else {
                    //檔案不存在，就不加入列表
                }
            }

            //排序
            for (int i = 0; i < arFile.Count; i++) {
                if (isAsc == true) {
                    for (int j = i; j < arFile.Count; j++)
                        if (arFile[i].LastWriteTime < arFile[j].LastWriteTime) {
                            var d = arFile[i];
                            arFile[i] = arFile[j];
                            arFile[j] = d;
                        }
                } else {
                    for (int j = i; j < arFile.Count; j++)
                        if (arFile[i].LastWriteTime > arFile[j].LastWriteTime) {
                            var d = arFile[i];
                            arFile[i] = arFile[j];
                            arFile[j] = d;
                        }
                }
            }

            //轉回 string[]
            string[] ar2 = new string[arFile.Count];
            for (int i = 0; i < arFile.Count; i++) {
                ar2[i] = arFile[i].Path;
            }

            return ar2;
        }

        private class FileInfo2 {
            public DateTime LastWriteTime;
            public string Path = "";
        }*/


    }


    /// <summary>
    /// 檔案排序（自然排序）
    /// </summary>
    public class NaturalSort : IComparer<string> {
        [DllImport("shlwapi.dll", CharSet = CharSet.Unicode, ExactSpelling = true)]
        static extern int StrCmpLogicalW(String x, String y);
        public int Compare(string x, string y) {
            return StrCmpLogicalW(x, y);
        }
    }


    /// <summary>
    /// 檔案排序（自然排序）
    /// </summary>
    public class NaturalSortDesc : IComparer<string> {
        [DllImport("shlwapi.dll", CharSet = CharSet.Unicode, ExactSpelling = true)]
        static extern int StrCmpLogicalW(String x, String y);
        public int Compare(string x, string y) {
            return StrCmpLogicalW(y, x);
        }
    }
}
