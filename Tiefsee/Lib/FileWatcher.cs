using System.IO;

namespace Tiefsee;

public class FileWatcher {

    private class WatcherInfo {
        public FileSystemWatcher fileWatcher;
        public List<FileWatcherData> queue;
        public System.Timers.Timer timer;
    }

    private Dictionary<string, WatcherInfo> dicFileWatcher = new Dictionary<string, WatcherInfo>();

    /// <summary>
    /// 偵測檔案變化
    /// </summary>
    /// <param name="key"> 如果需要偵測多個資料夾，用此欄位來進行區分 </param>
    /// <param name="path"> 要偵測的資料夾 </param>
    public void NewFileWatcher(string key, string path, Action<List<FileWatcherData>> func) {

        if (dicFileWatcher.ContainsKey(key) == false) {
            dicFileWatcher.Add(key, null);
        }
        if (dicFileWatcher[key] != null) {
            dicFileWatcher[key].queue.Clear();
            dicFileWatcher[key].timer.Stop();
            dicFileWatcher[key].fileWatcher.Dispose();
            dicFileWatcher[key] = null;
        }

        if (path == null || path == "") {
            return;
        }

        dicFileWatcher[key] = new WatcherInfo {
            fileWatcher = new FileSystemWatcher(),
            queue = new List<FileWatcherData>(),
            timer = new System.Timers.Timer(100)
        };

        var watcher = dicFileWatcher[key].fileWatcher;
        var queue = dicFileWatcher[key].queue;
        var timer = dicFileWatcher[key].timer;

        watcher.Path = path; // 設置要監視的資料夾
        watcher.IncludeSubdirectories = false; //是否偵測資料夾內的子資料夾

        timer.AutoReset = false;
        timer.Elapsed += (source, e) => {

            var toSubmit = new List<FileWatcherData>();
            foreach (var group in queue.GroupBy(item => item.FullPath)) {
                var lastItem = group.Last();
                if (lastItem.ChangeType == "deleted") {
                    // 最後一筆是 deleted，就只處理 deleted
                    toSubmit.Add(lastItem);
                }
                else if (group.All(item => item.ChangeType == "changed")) {
                    // 每一筆都是 changed，就只合併成一筆 changed
                    toSubmit.Add(lastItem);
                }
                else if (group.First().ChangeType == "created" && group.Skip(1).All(item => item.ChangeType == "changed")) {
                    // 第一筆是created，之後的每一筆都是changed，則只處理created
                    toSubmit.Add(group.First());
                }
                else if (group.Count() > 1 && group.Any(item => item.ChangeType == "deleted") && lastItem.ChangeType == "created") {
                    // 先 deleted 後 created，則合併成 changed
                    toSubmit.Add(new FileWatcherData {
                        Key = key,
                        FullPath = lastItem.FullPath,
                        OldFullPath = "",
                        ChangeType = "changed",
                        FileType = lastItem.FileType
                    });
                }
                else if (group.Count() > 1 && group.Any(item => item.ChangeType == "deleted") && lastItem.ChangeType == "renamed" && Path.GetExtension(lastItem.OldFullPath).ToLower().Contains("tmp")) {
                    // 先 deleted 後 renamed，且副檔名包含tmp，則合併成 changed
                    toSubmit.Add(new FileWatcherData {
                        Key = key,
                        FullPath = lastItem.FullPath,
                        OldFullPath = "",
                        ChangeType = "changed",
                        FileType = lastItem.FileType
                    });
                }
                else {
                    toSubmit.AddRange(group);
                }
            }
            func(toSubmit);
            queue.Clear();
        };

        var onChanged = (string changeType, string fullPath, string oldFullPath) => {
            string fileType;
            if (changeType == "deleted") {
                fileType = "none";
            }
            else if (File.Exists(fullPath)) {
                fileType = "file";
            }
            else if (Directory.Exists(fullPath)) {
                fileType = "dir";
            }
            else {
                fileType = "none";
            }
            FileWatcherData data = new() {
                Key = key,
                FullPath = fullPath,
                OldFullPath = oldFullPath,
                ChangeType = changeType,
                FileType = fileType
            };
            queue.Add(data);

            timer.Stop();
            timer.Start();
        };

        // 註冊事件處理程序
        watcher.Changed += (source, e) => { onChanged("changed", e.FullPath, ""); };
        watcher.Created += (source, e) => { onChanged("created", e.FullPath, ""); };
        watcher.Deleted += (source, e) => { onChanged("deleted", e.FullPath, ""); };
        watcher.Renamed += (source, e) => { onChanged("renamed", e.FullPath, e.OldFullPath); };
        watcher.EnableRaisingEvents = true; // 開始監視
    }

    /// <summary>
    /// 停止偵測檔案變化
    /// </summary>
    public void FileWatcherDispose() {
        foreach (string key in dicFileWatcher.Keys) {
            if (dicFileWatcher[key] != null) {
                dicFileWatcher[key].queue.Clear();
                dicFileWatcher[key].timer.Stop();
                dicFileWatcher[key].fileWatcher.Dispose();
                dicFileWatcher[key] = null;
            }
        }
        dicFileWatcher = new();
    }
}

public class FileWatcherData {
    public string Key { get; set; }
    public string FullPath { get; set; }
    public string OldFullPath { get; set; }
    public string ChangeType { get; set; }
    public string FileType { get; set; }
}
