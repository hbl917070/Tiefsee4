using System.IO;
using System.Runtime.InteropServices;

namespace Tiefsee;

public class FileSort {

    /// <summary>
    /// 對檔案進行排序
    /// </summary>
    /// <param name="ar"> 檔案路徑陣列 </param>
    /// <param name="type"> 排序方式 </param>
    /// <returns></returns>
    public string[] Sort(string[] ar, string type) {

        if (type == "name") { // 檔名自然排序
            Array.Sort(ar, new NaturalSort());
        }
        else if (type == "nameDesc") { // 檔名自然排序(逆) 
            Array.Sort(ar, new NaturalSortDesc());
        }

        else if (type == "lastWriteTime") { // 修改時間排序 
            ar = SortLastWriteTime(ar, true);
        }
        else if (type == "lastWriteTimeDesc") { // 修改時間排序(逆)  
            ar = SortLastWriteTime(ar, false);
        }

        else if (type == "length") { // 檔案大小排序  
            ar = SortLength(ar, true);
        }
        else if (type == "lengthDesc") { // 檔案大小排序(逆)  
            ar = SortLength(ar, false);
        }

        else if (type == "lastAccessTime") { // 檔案存取時間排序  
            ar = SortLastAccessTime(ar, true);
        }
        else if (type == "lastAccessTimeDesc") { //檔案存取時間排序(逆)  
            ar = SortLastAccessTime(ar, false);
        }

        else if (type == "creationTime") { // 檔案建立時間排序  
            ar = SortCreationTime(ar, true);
        }
        else if (type == "creationTimeDesc") { // 檔案建立時間排序(逆)  
            ar = SortCreationTime(ar, false);
        }

        else if (type == "random") { // 隨機排序  
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

        int dirLen = dir.Length;

        // 轉換成完整路徑
        string[] arFile = ar
            .Select(a => dir + a.ToString())
            .ToArray();

        // 排序，並轉換成相對路徑
        return Sort(arFile, type)
            .Select(path => path.Substring(dirLen))
            .ToArray();
    }

    /// <summary>
    /// 以寫入時間(最後修改時間)進行排序
    /// </summary>
    /// <param name="ar"></param>
    /// <param name="isAsc"> 是否為遞增排序 </param>
    /// <returns></returns>
    private string[] SortLastWriteTime(string[] ar, bool isAsc) {

        // 檢查檔案是否存在
        var arF = ar
            .Select(path => new FileInfo(path))
            .Where(fileInfo => fileInfo.Exists || Directory.Exists(fileInfo.FullName)); // 檔案或資料夾
        
        // 排序
        if (isAsc) {
            arF = arF.OrderBy(f => f.LastWriteTime).ToList();
        }
        else {
            arF = arF.OrderByDescending(f => f.LastWriteTime).ToList();
        }

        return arF.Select(f => f.FullName).ToArray();
    }

    /// <summary>
    /// 以存取時間進行排序
    /// </summary>
    /// <param name="ar"></param>
    /// <param name="isAsc"> 是否為遞增排序 </param>
    /// <returns></returns>
    private string[] SortLastAccessTime(string[] ar, bool isAsc) {

        // 檢查檔案是否存在
        var arF = ar
            .Select(path => new FileInfo(path))
            .Where(fileInfo => fileInfo.Exists || Directory.Exists(fileInfo.FullName)); // 檔案或資料夾

        // 排序
        if (isAsc) {
            arF = arF.OrderBy(f => f.LastAccessTime).ToList();
        }
        else {
            arF = arF.OrderByDescending(f => f.LastAccessTime).ToList();
        }

        return arF.Select(f => f.FullName).ToArray();
    }

    /// <summary>
    /// 以建立時間進行排序
    /// </summary>
    /// <param name="ar"></param>
    /// <param name="isAsc"> 是否為遞增排序 </param>
    /// <returns></returns>
    private string[] SortCreationTime(string[] ar, bool isAsc) {

        // 檢查檔案是否存在
        var arF = ar
            .Select(path => new FileInfo(path))
            .Where(fileInfo => fileInfo.Exists || Directory.Exists(fileInfo.FullName)); // 檔案或資料夾

        // 排序
        if (isAsc) {
            arF = arF.OrderBy(f => f.CreationTime).ToList();
        }
        else {
            arF = arF.OrderByDescending(f => f.CreationTime).ToList();
        }

        return arF.Select(f => f.FullName).ToArray();
    }

    /// <summary>
    /// 以檔案大小進行排序
    /// </summary>
    /// <param name="ar"></param>
    /// <param name="isAsc"> 是否為遞增排序 </param>
    /// <returns></returns>
    private string[] SortLength(string[] ar, bool isAsc) {

        // 檢查檔案是否存在
        var arF = ar
            .Select(path => new FileInfo(path))
            .Where(fileInfo => fileInfo.Exists || Directory.Exists(fileInfo.FullName)); // 檔案或資料夾

        // 排序
        if (isAsc) {
            arF = arF.OrderBy(f => f.Length);
        }
        else {
            arF = arF.OrderByDescending(f => f.Length);
        }

        return arF.Select(f => f.FullName).ToArray();
    }

}

/// <summary>
/// 檔案排序（自然排序）
/// </summary>
public class NaturalSort : IComparer<string> {
    [DllImport("shlwapi.dll", CharSet = CharSet.Unicode, ExactSpelling = true)]
    static extern int StrCmpLogicalW(string x, string y);
    public int Compare(string x, string y) {
        return StrCmpLogicalW(x, y);
    }
}

/// <summary>
/// 檔案排序（自然排序）
/// </summary>
public class NaturalSortDesc : IComparer<string> {
    [DllImport("shlwapi.dll", CharSet = CharSet.Unicode, ExactSpelling = true)]
    static extern int StrCmpLogicalW(string x, string y);
    public int Compare(string x, string y) {
        return StrCmpLogicalW(y, x);
    }
}
