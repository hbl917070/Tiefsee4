using System.IO;
using System.Runtime.InteropServices;

namespace Tiefsee {
    public class FileSort {


        /// <summary>
        /// 對檔案進行排序
        /// </summary>
        /// <param name="ar"> 檔案路徑陣列 </param>
        /// <param name="type"> 排序方式 </param>
        /// <returns></returns>
        public string[] Sort(string[] ar, string type) {

            if (type == "name") { //檔名自然排序
                Array.Sort(ar, new NaturalSort());
            }
            if (type == "nameDesc") { //檔名自然排序(逆) 
                Array.Sort(ar, new NaturalSortDesc());
            }

            if (type == "lastWriteTime") { //修改時間排序 
                ar = SortLastWriteTime(ar, true);
            }
            if (type == "lastWriteTimeDesc") { //修改時間排序(逆)  
                ar = SortLastWriteTime(ar, false);
            }

            if (type == "length") { //檔案大小排序  
                ar = SortLength(ar, true);
            }
            if (type == "lengthDesc") { //檔案大小排序(逆)  
                ar = SortLength(ar, false);
            }

            if (type == "lastAccessTime") { //檔案存取時間排序  
                ar = SortLastAccessTime(ar, true);
            }
            if (type == "lastAccessTimeDesc") { //檔案存取時間排序(逆)  
                ar = SortLastAccessTime(ar, false);
            }

            if (type == "creationTime") { //檔案建立時間排序  
                ar = SortCreationTime(ar, true);
            }
            if (type == "creationTimeDesc") { //檔案建立時間排序(逆)  
                ar = SortCreationTime(ar, false);
            }

            if (type == "random") { //隨機排序  
                ar = ar.OrderBy(a => Guid.NewGuid()).ToArray();
            }

            return ar;
        }


        /// <summary>
        /// 對檔案進行排序。同一資料夾內的檔案就不傳入與回傳完整路徑，減少傳輸成本
        /// </summary>
        /// <param name="dir"></param>
        /// <param name="ar"></param>
        /// <param name="type"></param>
        /// <returns></returns>
        public string[] Sort2(string dir, object[] ar, string type) {

            string[] arFile = new string[ar.Length];
            for (int i = 0; i < arFile.Length; i++) {
                arFile[i] = dir + ar[i].ToString();
            }

            int dirLen = dir.Length;
            string[] ret_ar = Sort(arFile, type);
            for (int i = 0; i < ret_ar.Length; i++) {
                ret_ar[i] = ret_ar[i].Substring(dirLen);
            }

            return ret_ar;
        }

        /// <summary>
        /// 以寫入時間(最後修改時間)進行排序
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
                if (fileInfo.Exists || Directory.Exists(path)) { //檔案或資料夾
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


        /// <summary>
        /// 以存取時間進行排序
        /// </summary>
        /// <param name="ar"></param>
        /// <param name="isAsc"> 是否為遞增排序 </param>
        /// <returns></returns>
        private string[] SortLastAccessTime(string[] ar, bool isAsc) {

            //檢查檔案是否存在
            List<FileSystemInfo> arF = new List<FileSystemInfo>();
            for (int i = 0; i < ar.Length; i++) {
                string path = ar[i];
                FileSystemInfo fileInfo = new FileInfo(path);
                if (fileInfo.Exists || Directory.Exists(path)) { //檔案或資料夾
                    arF.Add(fileInfo);
                }
            }

            if (isAsc) {
                arF = arF.OrderBy(f => f.LastAccessTime).ToList();
            } else {
                arF = arF.OrderByDescending(f => f.LastAccessTime).ToList();
            }

            string[] ar2 = new string[arF.Count];
            for (int i = 0; i < arF.Count; i++) {
                ar2[i] = arF[i].FullName;
            }

            return ar2;
        }


        /// <summary>
        /// 以建立時間進行排序
        /// </summary>
        /// <param name="ar"></param>
        /// <param name="isAsc"> 是否為遞增排序 </param>
        /// <returns></returns>
        private string[] SortCreationTime(string[] ar, bool isAsc) {

            //檢查檔案是否存在
            List<FileSystemInfo> arF = new List<FileSystemInfo>();
            for (int i = 0; i < ar.Length; i++) {
                string path = ar[i];
                FileSystemInfo fileInfo = new FileInfo(path);
                if (fileInfo.Exists || Directory.Exists(path)) { //檔案或資料夾
                    arF.Add(fileInfo);
                }
            }

            if (isAsc) {
                arF = arF.OrderBy(f => f.CreationTime).ToList();
            } else {
                arF = arF.OrderByDescending(f => f.CreationTime).ToList();
            }

            string[] ar2 = new string[arF.Count];
            for (int i = 0; i < arF.Count; i++) {
                ar2[i] = arF[i].FullName;
            }

            return ar2;
        }


        /// <summary>
        /// 以檔案大小進行排序
        /// </summary>
        /// <param name="ar"></param>
        /// <param name="isAsc"> 是否為遞增排序 </param>
        /// <returns></returns>
        private string[] SortLength(string[] ar, bool isAsc) {

            //檢查檔案是否存在
            List<FileInfo> arF = new List<FileInfo>();
            for (int i = 0; i < ar.Length; i++) {
                string path = ar[i];
                FileInfo fileInfo = new FileInfo(path);
                if (fileInfo.Exists || Directory.Exists(path)) { //檔案或資料夾
                    arF.Add(fileInfo);
                }
            }

            if (isAsc) {
                arF = arF.OrderBy(f => f.Length).ToList();
            } else {
                arF = arF.OrderByDescending(f => f.Length).ToList();
            }

            string[] ar2 = new string[arF.Count];
            for (int i = 0; i < arF.Count; i++) {
                ar2[i] = arF[i].FullName;
            }

            return ar2;
        }


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
