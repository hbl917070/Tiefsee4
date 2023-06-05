using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using Windows.Management.Deployment;

namespace Tiefsee {

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
        /// <param name="path"></param>
        public void ShowMenu(string path) {
            if (File.Exists(path)) { //判別檔案是否存在於對應的路徑
                try {
                    Process.Start(new ProcessStartInfo("rundll32.exe") {
                        Arguments = $"shell32.dll,OpenAs_RunDLL {path}",
                        WorkingDirectory = Path.GetDirectoryName(path),
                        UseShellExecute = true
                    });
                } catch (Exception e2) {
                    MessageBox.Show(e2.ToString(), "Error");
                }
            }
        }


        /// <summary>
        /// 取得開始選單裡面的所有lnk
        /// </summary>
        /// <returns></returns>
        public string[] GetStartMenuList() {

            string path = Path.GetPathRoot(Environment.GetFolderPath(Environment.SpecialFolder.Windows));
            path = Path.Combine(path, @"ProgramData\Microsoft\Windows\Start Menu\Programs"); //開始選單的路徑

            List<String> arFile = new List<string>();

            if (Directory.Exists(path)) {
                GetDirForeachFiles(path, arFile); //windows的開始
            }

            return arFile.ToArray();
        }


        /// <summary>
        /// 取得資料夾內所有檔案
        /// </summary>
        /// <param name="s_資料夾"></param>
        private void GetDirForeachFiles(String sDir, List<String> arFile) {
            var arDir = Directory.EnumerateFileSystemEntries(sDir);
            foreach (var item in arDir) {
                if (File.Exists(item)) {
                    arFile.Add(item);
                } else if (Directory.Exists(item)) {
                    GetDirForeachFiles(item, arFile);
                }
            }
        }


        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        public String GetSystemRoot() {
            string path = Path.GetPathRoot(Environment.GetFolderPath(Environment.SpecialFolder.Windows));
            //path = path.Substring(0, 1);
            return path;
        }


        /// <summary>
        /// 以3D小畫家開啟
        /// </summary>
        /// <param name="path"></param>
        public void Open3DMSPaint(string path) {
            if (File.Exists(path)) { //判別檔案是否存在於對應的路徑
                try {
                    //System.Diagnostics.Process.Start("mspaint", '"' + path + '"' + " /ForceBootstrapPaint3D");             
                    Process.Start(new ProcessStartInfo("mspaint") {
                        Arguments = '"' + path + '"' + " /ForceBootstrapPaint3D",
                        WorkingDirectory = Path.GetDirectoryName(path),
                        UseShellExecute = true
                    });
                } catch (Exception e2) {
                    System.Windows.Forms.MessageBox.Show(e2.ToString(), "失敗");
                }
            }
        }


        /// <summary>
        /// 使用內建的相簿APP來開啟
        /// </summary>
        /// <param name="filePath"></param>
        async public void OpenPhotoApp(string filePath) {
            var file = await Windows.Storage.StorageFile.GetFileFromPathAsync(filePath);
            if (file != null) {
                var options = new Windows.System.LauncherOptions();
                options.TargetApplicationPackageFamilyName = "60852WEN-HONGLIAO.Tiefsee_zgbpcvardp742";
                await Windows.System.Launcher.LaunchFileAsync(file, options);
            }
        }


        /// <summary>
        /// 以UWP開啟檔案
        /// </summary>
        /// <param name="uwpId"> 例如 Microsoft.ScreenSketch_8wekyb3d8bbwe </param>
        /// <param name="filePath"></param>
        async public void RunUwp(string uwpId , string filePath) {
            var file = await Windows.Storage.StorageFile.GetFileFromPathAsync(filePath);
            if (file != null) {
                var options = new Windows.System.LauncherOptions();
                options.TargetApplicationPackageFamilyName = uwpId;
                await Windows.System.Launcher.LaunchFileAsync(file, options);
            }
        }


        class UwpItem {
            public string Logo;
            public string Name;
            public string Id;
        }

        private static Dictionary<string, UwpItem> temp_UwpItem = null;
        /// <summary>
        /// 取得UWP列表
        /// </summary>
        public string GetUwpList() {

            bool isFirstRun = false; 
            if (temp_UwpItem == null) { //判斷是否為首次執行
                isFirstRun = true;     
                try {
                    //如果存在 UwpList.json 的暫存檔，就讀取此檔案
                    string jsonString = "{}";
                    if (File.Exists(AppPath.appDataUwpList)) {
                        using (StreamReader sr = new StreamReader(AppPath.appDataUwpList, Encoding.UTF8)) {
                            jsonString = sr.ReadToEnd();
                        }
                    }
                    JObject jsonObj = JObject.Parse(jsonString);
                    temp_UwpItem = jsonObj.ToObject<Dictionary<string, UwpItem>>();
                } catch (Exception) {
                    temp_UwpItem = new Dictionary<string, UwpItem>();
                }
            }

            Dictionary<string, UwpItem> temp_appDataUwpList = new Dictionary<string, UwpItem>();
            List<UwpItem> ar = new List<UwpItem>();
            var packageManager = new PackageManager();
            var packages = packageManager.FindPackagesForUser("");
            foreach (var package in packages) {

                string fullName = package.Id.FullName; //名稱+版本

                //如果暫存不存在此筆資料，則重新抓資料
                if (temp_UwpItem.ContainsKey(fullName) == false) {
                    string name = package.DisplayName; //APP在地化的名稱 (取得成本高)
                    string logo = package.Logo.ToString(); //圖示的路徑 (取得成本高)
                    string id = package.Id.Name + "_" + package.Id.PublisherId;
                    UwpItem uwpItem = new UwpItem {
                        Logo = logo,
                        Name = name,
                        Id = id
                    };
                    temp_UwpItem.Add(fullName, uwpItem);
                }

                if (isFirstRun) {
                    temp_appDataUwpList.Add(fullName, temp_UwpItem[fullName]);
                }

                ar.Add(temp_UwpItem[fullName]);
            }

            //如果是首次執行，就產生暫存檔，減少下次讀取的時間
            if (isFirstRun) {
                using (FileStream fs = new FileStream(AppPath.appDataUwpList, FileMode.Create)) {
                    using (StreamWriter sw = new StreamWriter(fs, Encoding.UTF8)) {
                        sw.Write(JsonConvert.SerializeObject(temp_appDataUwpList));
                    }
                }
            }

            return JsonConvert.SerializeObject(ar);
        }

        /// <summary>
        /// 以 photos APP開啟(已失效)
        /// </summary>
        /// <param name="path"></param>
        /*public void OpenPhotoApp(string path) {
            if (File.Exists(path)) { //判別檔案是否存在於對應的路徑
                try {
                    String url_path = Uri.EscapeDataString(path);
                    System.Diagnostics.Process.Start("ms-photos:viewer?fileName=" + url_path);
                } catch (Exception e2) {
                    System.Windows.Forms.MessageBox.Show(e2.ToString(), "失敗");
                }
            }
        }*/



        /// <summary>
        /// 執行其他程式
        /// </summary>
        /// <param name="FileName"></param>
        /// <param name="Arguments"></param>
        /// <param name="CreateNoWindow"></param>
        /// <param name="UseShellExecute"></param>
        public void ProcessStart(string FileName, string Arguments, bool CreateNoWindow, bool UseShellExecute) {
            var psi = new System.Diagnostics.ProcessStartInfo();
            psi.FileName = FileName; //執行檔路徑
            psi.WorkingDirectory = Path.GetDirectoryName(FileName); //設定執行檔所在的目錄
            psi.Arguments = Arguments; //命令參數
            psi.CreateNoWindow = CreateNoWindow; //是否使用新視窗
            psi.UseShellExecute = UseShellExecute; //false=新視窗個體 
            System.Diagnostics.Process.Start(psi);
        }


        /// <summary>
        /// 用瀏覽器開啟網址
        /// </summary>
        /// <param name="url"></param>
        /// <returns></returns>
        public bool OpenUrl(string url) {
            try {
                //System.Diagnostics.Process.Start(url);
                var psi = new ProcessStartInfo {
                    FileName = url,
                    UseShellExecute = true
                };
                Process.Start(psi);
                return true;
            } catch {
                return false;
            }
        }



    }
}
