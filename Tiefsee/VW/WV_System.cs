using Microsoft.Win32;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Windows.Input;
using Windows.ApplicationModel;

namespace Tiefsee {


    [ComVisible(true)]

    public class WV_System {

        WebWindow M;
        public WV_System(WebWindow m) {
            this.M = m;
        }

        /// <summary>
        /// 取得當前是否有使用「開機自動啟動」
        /// </summary>
        /// <returns></returns>
        public async Task<string> GetTiefseTask() {
            var startupTask = await StartupTask.GetAsync("TiefseeTask");
            return startupTask.State.ToString();
            /*if (startupTask.State == StartupTaskState.Enabled) {
                return "Enabled";
            } else if (startupTask.State == StartupTaskState.DisabledByUser) {
                return "DisabledByUser";
            } else if (startupTask.State == StartupTaskState.DisabledByPolicy) {
                return "DisabledByPolicy";
            } else if (startupTask.State == StartupTaskState.EnabledByPolicy) {
                return "EnabledByPolicy";
            } else {
                return "Disabled";
            }*/
        }

        /// <summary>
        /// 設定當前是否有使用「開機自動啟動」
        /// </summary>
        /// <returns></returns>
        public async Task<string> SetTiefseTask(bool val) {
            var startupTask = await StartupTask.GetAsync("TiefseeTask");
            if (val) {  
                var state = await startupTask.RequestEnableAsync();
                return state.ToString();
            } else {
                startupTask.Disable();
                return await GetTiefseTask();
            }
        }


        /// <summary>
        /// 取得當前是否按著空白鍵跟滑鼠滾輪
        /// </summary>
        public string GetDownKey() {
            bool isKeyboardSpace = Keyboard.IsKeyDown(Key.Space); //按著空白鍵
            bool isMouseMiddle = System.Windows.Forms.Control.MouseButtons == System.Windows.Forms.MouseButtons.Middle; //按著滑鼠滾輪

            var obj = new {
                isKeyboardSpace = isKeyboardSpace,
                isMouseMiddle = isMouseMiddle
            };

            string json = JsonConvert.SerializeObject(obj);
            return json;
        }


        /// <summary>
        /// 產生捷徑
        /// </summary>
        /// <param name="exePath">exe路徑</param>
        /// <param name="lnkPath">要儲存的ink路徑</param>
        /// <param name="args">啟動參數</param>
        public void NewLnk(string exePath, string lnkPath, string args) {

            if (File.Exists(exePath) == false) { return; }

            //產生捷徑
            using (ShellLink slLinkObject = new ShellLink()) {
                slLinkObject.WorkPath = Directory.GetParent(exePath).ToString(); //工作資料夾
                slLinkObject.IconLocation = exePath + ",0";   //圖示檔案。 0圖示檔的 Index
                slLinkObject.ExecuteFile = exePath;
                slLinkObject.ExecuteArguments = args;
                slLinkObject.Save(lnkPath);

                slLinkObject.Dispose();
            }
        }


        /// <summary>
        /// 取得某一個點所在的螢幕資訊
        /// </summary>
        /// <returns> WorkingArea X, Y, Width, Height </returns>
        public int[] GetScreenFromPoint(int x, int y) {

            var screen = System.Windows.Forms.Screen.FromPoint(new Point(x, y));

            int[] mouse = new int[4];
            mouse[0] = screen.WorkingArea.X;
            mouse[1] = screen.WorkingArea.Y;
            mouse[2] = screen.WorkingArea.Width;
            mouse[3] = screen.WorkingArea.Height;

            return mouse;
        }


        /// <summary>
        /// 立即刪除所有圖片暫存
        /// </summary>
        public void DeleteAllTemp() {
            DeleteTemp(AppPath.tempDirImgProcessed, 0);
            DeleteTemp(AppPath.tempDirImgZoom, 0);
            DeleteTemp(AppPath.tempDirWebFile, 0);
        }


        /// <summary>
        /// 刪除圖片暫存 (保留一定數量
        /// </summary>
        /// <param name="maxImgProcessed"> 暫存資料夾 tempDirImgProcessed 最多保留的檔案數量 </param>
        /// <param name="maxImgZoom"> 暫存資料夾 tempDirImgZoom 最多保留的檔案數量 </param>
        /// <param name="maxWebFile"> 暫存資料夾 tempDirWebFile 最多保留的檔案數量 </param>
        public void DeleteTemp(int maxImgProcessed, int maxImgZoom, int maxWebFile) {
            new Thread(() => {
                if (Program.startType == 3 || Program.startType == 5) { //常駐背景，關閉所有視窗才執行清除
                    if (QuickRun.runNumber <= 2) {
                        DeleteTemp(AppPath.tempDirImgProcessed, maxImgProcessed);
                        DeleteTemp(AppPath.tempDirImgZoom, maxImgZoom);
                        DeleteTemp(AppPath.tempDirWebFile, maxWebFile);
                        Console.WriteLine("########## 刪除圖片暫存(常駐背景)");
                    }
                    return;
                }

                //非「常駐背景」的模式，則從Port資料夾判斷當前還有幾個執行個體
                if (Directory.Exists(AppPath.appDataPort) == false) { return; }
                int postCount = Directory.GetFiles(AppPath.appDataPort).Length;
                if (postCount == 1) {
                    if (QuickRun.runNumber <= 1) {
                        DeleteTemp(AppPath.tempDirImgProcessed, maxImgProcessed);
                        DeleteTemp(AppPath.tempDirImgZoom, maxImgZoom);
                        DeleteTemp(AppPath.tempDirWebFile, maxWebFile);
                        Console.WriteLine("########## 刪除圖片暫存" + QuickRun.runNumber);
                    }
                }

            }).Start();
        }
        public void DeleteTemp(string path, int max) {
            if (Directory.Exists(path) == false) { return; }
            FileSystemInfo[] ar = new DirectoryInfo(path).GetFileSystemInfos(); //取得資料夾內的所有檔案與資料夾
            if (ar.Length <= max) { return; } //如果檔案數量未達上限，就不做任何事情
            List<FileSystemInfo> sortedFiles = ar.OrderBy(f => f.LastWriteTime).ToList();
            for (int i = 0; i < sortedFiles.Count - max; i++) {
                try {
                    File.Delete(sortedFiles[i].FullName);
                } catch { }
            }
        }


        #region 模擬鍵盤

        [DllImport("user32.dll", EntryPoint = "keybd_event", SetLastError = true)]
        public static extern void keybd_event(Keys bVk, byte bScan, uint dwFlags, uint dwExtraInfo);
        public const int KEYEVENTF_KEYUP = 2;

        /// <summary>
        /// 模擬鍵盤 ctrl + ?
        /// </summary>
        /// <param name="key"> 例如 A = ctrl+A </param>
        public void SendKeys_CtrlAnd(string key) {
            try {

                key = key.ToUpper();

                var k = Keys.A;
                if (key == "A") { k = Keys.A; }
                if (key == "Z") { k = Keys.Z; }
                if (key == "X") { k = Keys.X; }
                if (key == "C") { k = Keys.C; }
                if (key == "V") { k = Keys.V; }
                if (key == "F") { k = Keys.F; }

                keybd_event(Keys.ControlKey, 0, 0, 0);
                keybd_event(k, 0, 0, 0);
                keybd_event(Keys.ControlKey, 0, KEYEVENTF_KEYUP, 0);
            } catch (Exception e) {
                Console.WriteLine("模擬鍵盤失敗");
                Console.WriteLine(e.ToString());
            }
        }

        /// <summary>
        /// 模擬鍵盤
        /// </summary>
        /// <param name="keys"> 例如^a = ctrl+A </param>
        public void SendKeys_Send(string keys) {
            try {
                SendKeys.Send(keys);
            } catch (Exception e) {
                Console.WriteLine("模擬鍵盤失敗");
                Console.WriteLine(e.ToString());
            }
        }
        #endregion


        #region Clipboard 剪貼簿

        /// <summary>
        /// 
        /// </summary>
        /// <param name="base64String"></param>
        /// <returns></returns>
        private MemoryStream Base64ToMemoryStream(string base64String) {
            //去掉開頭的 data:image/png;base64,
            int x = base64String.IndexOf("base64,");
            if (x != -1) { base64String = base64String.Substring(x + 7); }

            byte[] Buffer = Convert.FromBase64String(base64String);
            MemoryStream oMemoryStream = new MemoryStream(Buffer);
            oMemoryStream.Position = 0;
            return oMemoryStream;
        }

        /// <summary>
        /// 存入剪貼簿 - 傳入base64，儲存成圖片。
        /// isTransparent=true時，同時把png跟一般圖片存入剪貼簿，支援透明圖片的程式會優先使用png格式
        /// </summary>
        /// <param name="base64"></param>
        /// <param name="isTransparent"> 是否要支援透明色 </param>
        /// <returns></returns>
        public bool SetClipboard_Base64ToImage(string base64, bool isTransparent) {
            try {
                using (MemoryStream ms = Base64ToMemoryStream(base64)) {
                    using (System.Drawing.Bitmap bm = new Bitmap(ms)) {
                        System.Windows.Forms.Clipboard.Clear(); //清理剪貼簿
                        System.Windows.Forms.IDataObject data_object = new System.Windows.Forms.DataObject();
                        data_object.SetData(DataFormats.Bitmap, true, bm); //無透明色的圖片，所有軟體都支援
                        if (isTransparent) {
                            data_object.SetData("PNG", true, ms); //含有透明色，但並非所有軟體都支援
                        }
                        System.Windows.Forms.Clipboard.SetDataObject(data_object, true);
                        return true;
                    }
                }
            } catch (Exception e2) {
                MessageBox.Show(e2.ToString());
                return false;
            }
        }


        /// <summary>
        /// 存入剪貼簿 - 傳入檔案路徑，儲存成圖片。
        /// isTransparent=true時，同時把png跟一般圖片存入剪貼簿，支援透明圖片的程式會優先使用png格式
        /// </summary>
        /// <param name="path"></param>
        /// <param name="isTransparent"> 是否要支援透明色 </param>
        /// <returns></returns>
        public bool SetClipboard_FileToImage(string path, bool isTransparent) {
            try {
                if (File.Exists(path) == false) { return false; }

                using (Stream ms = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) {
                    using (System.Drawing.Bitmap bm = new Bitmap(ms)) {

                        System.Windows.Forms.Clipboard.Clear(); //先清理剪貼簿
                        System.Windows.Forms.IDataObject data_object = new System.Windows.Forms.DataObject();
                        data_object.SetData(DataFormats.Bitmap, true, bm);
                        if (isTransparent) {
                            data_object.SetData("PNG", true, ms); //含有透明色，但並非所有軟體都支援
                        }
                        System.Windows.Forms.Clipboard.SetDataObject(data_object, true);
                        return true;
                    }
                }
            } catch (Exception e2) {
                MessageBox.Show(e2.ToString());
                return false;
            }
        }


        /// <summary>
        /// 存入剪貼簿 - 傳入檔案路徑，以UTF8開啟，複製成文字
        /// </summary>
        /// <param name="txt"></param>
        /// <returns></returns>
        public bool SetClipboard_FileToTxt(string path) {
            try {
                if (File.Exists(path) == false) { return false; }
                using (StreamReader sr = new StreamReader(path, Encoding.UTF8)) {
                    System.Windows.Forms.Clipboard.SetDataObject(sr.ReadToEnd(), false, 5, 200);
                }
                return true;
            } catch (Exception) {
                return false;
            }
        }


        /// <summary>
        /// 存入剪貼簿 - 傳入檔案路徑，複製成base64
        /// </summary>
        /// <param name="txt"></param>
        /// <returns></returns>
        public bool SetClipboard_FileToBase64(string path) {

            try {

                if (File.Exists(path) == false) { return false; }

                byte[] temp = File.ReadAllBytes(path);
                string base64String = "";

                String ext = Path.GetExtension(path).ToUpper();

                if (ext == ".PNG") {
                    base64String = "data:image/png;base64," + Convert.ToBase64String(temp);

                } else if (ext == ".GIF") {
                    base64String = "data:image/gif;base64," + Convert.ToBase64String(temp);

                } else if (ext == ".SVG") {
                    base64String = "data:image/svg+xml;base64," + Convert.ToBase64String(temp);

                } else if (ext == ".BMP") {
                    base64String = "data:image/bmp;base64," + Convert.ToBase64String(temp);

                } else if (ext == ".WEBP") {
                    base64String = "data:image/webp;base64," + Convert.ToBase64String(temp);

                } else {
                    base64String = "data:image/jpeg;base64," + Convert.ToBase64String(temp);
                }

                System.Windows.Forms.Clipboard.SetDataObject(base64String, false, 5, 200); //存入剪貼簿
                return true;

            } catch (Exception e) {
                MessageBox.Show(e.ToString());
                return false;
            }
        }


        /// <summary>
        /// 存入剪貼簿 - 圖片
        /// </summary>
        /// <param name="txt"></param>
        /// <returns></returns>
        /*public bool SetClipboard_FileToImg(string path) {
            try {
                using (System.Drawing.Bitmap bm_transparent = new System.Drawing.Bitmap(path)) {
                    System.Windows.Forms.Clipboard.SetImage(bm_transparent);
                    bm_transparent.Dispose();
                }
                return true;
            } catch (Exception) {
                return false;
            }
        }*/


        /// <summary>
        /// 存入剪貼簿 - 字串
        /// </summary>
        /// <param name="txt"></param>
        /// <returns></returns>
        public bool SetClipboard_Txt(string txt) {
            try {
                System.Windows.Forms.Clipboard.SetDataObject(txt, false, 5, 200); //存入剪貼簿
                return true;
            } catch (Exception) {
                return false;
            }
        }


        /// <summary>
        /// 存入剪貼簿 - 檔案
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public bool SetClipboard_File(string path) {
            try {
                //檔案或資料夾存在才複製
                if (File.Exists(path) || Directory.Exists(path)) {
                    var f = new System.Collections.Specialized.StringCollection();
                    f.Add(path);
                    Clipboard.SetFileDropList(f);
                } else {
                    return false;
                }
                return true;
            } catch (Exception) {
                return false;
            }
        }

        #endregion


        /// <summary>
        /// 取得作業系統所在的槽，例如 「C:\」
        /// </summary>
        /// <returns></returns>
        public String GetSystemRoot() {
            string path = Path.GetPathRoot(Environment.GetFolderPath(Environment.SpecialFolder.Windows));
            //path = path.Substring(0, 1);
            return path;
        }


        /// <summary>
        /// 取得滑鼠的坐標
        /// </summary>
        public int[] GetMousePosition() {
            var p = System.Windows.Forms.Cursor.Position;
            //Dictionary<string, int> dic = new Dictionary<string, int>();
            //dic.Add("X", p.X);
            //dic.Add("Y", p.Y);
            return new int[2] { p.X, p.Y };
        }


        /// <summary>
        /// 設定桌布
        /// </summary>
        /// <param name="path"></param>
        public void SetWallpaper(string path) {
            if (File.Exists(path)) { //判別檔案是否存在於對應的路徑
                try {
                    SystemParametersInfo(20, 1, path, 0x1 | 0x2); //存在成立，修改桌布　　(uActuin 20 參數為修改wallpaper
                } catch (Exception e2) {
                    MessageBox.Show("\"Set as Desktop Background\" failed：\n" + e2.ToString(), "Error");
                }
            }
        }
        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        private static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int uWinlni);


        /// <summary>
        /// 判斷是否為 win10
        /// </summary>
        public bool IsWindows10() {
            try {
                var reg = Microsoft.Win32.Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows NT\CurrentVersion");
                string productName = (string)reg.GetValue("ProductName");
                return productName.StartsWith("Windows 10");
            } catch {
                return false;
            }
        }


        /// <summary>
        /// 判斷是否為 win7
        /// </summary>
        public bool IsWindows7() {
            try {
                String os = System.Environment.OSVersion.Version.ToString(); //取得作業系統地版本
                return os.Length > 3 && os.Substring(0, 3) == "6.1"; //win7
            } catch {
                return false;
            }
        }


        /// <summary>
        /// lnk 轉 exe路徑
        /// </summary>
        /// <param name="path"> lnk捷徑 </param>
        /// <returns></returns>
        public string LnkToExePath(string path) {
            return LnkToExe.GetExePate(path);
        }


        /// <summary>
        /// 回傳程式目前記憶體使用量（MB
        /// </summary>
        public float GetMemory_mb() {
            Process proc = Process.GetCurrentProcess();
            var xx = proc.WorkingSet64;
            return xx / 1024 / 1024;
        }


        /// <summary>
        /// 回收記憶體
        /// </summary>
        [System.Runtime.InteropServices.DllImport("kernel32.dll")]
        private static extern bool SetProcessWorkingSetSize(IntPtr proc, int min, int max);
        public void Collect() {
            _Collect();
        }
        public static void _Collect() {
            Task t = new Task(() => {
                try {
                    GC.Collect();
                    GC.WaitForPendingFinalizers();
                    if (Environment.OSVersion.Platform == PlatformID.Win32NT) {
                        SetProcessWorkingSetSize(System.Diagnostics.Process.GetCurrentProcess().Handle, -1, -1);
                    }
                } catch { }
            });
            t.Start();
        }


        [DllImport("shell32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern void SHChangeNotify(uint wEventId, uint uFlags, IntPtr dwItem1, IntPtr dwItem2);

        /// <summary>
        /// 關聯副檔名
        /// </summary>
        /// <param name="ar_Extension"></param>
        /// <param name="OpenWith"></param>
        /// <param name="ExecutableName"></param>
        public void AssociationExtension(object[] arExtension, string appPath) {

            //如果檔案不存在
            if (File.Exists(appPath) == false) { return; }

            string appName = Path.GetFileName(appPath); //程式檔名，例如 Tiefsee.exe

            for (int i = 0; i < arExtension.Length; i++) {
                string Extension = arExtension[i].ToString(); //副檔名
                _AssociationExtension(Extension, appPath, appName);
            }
        }
        private void _AssociationExtension(string Extension, string OpenWith, string ExecutableName) {
            try {
                using (RegistryKey User_Classes = Registry.CurrentUser.OpenSubKey("SOFTWARE\\Classes\\", true))
                using (RegistryKey User_Ext = User_Classes.CreateSubKey("." + Extension))
                using (RegistryKey User_AutoFile = User_Classes.CreateSubKey(Extension + "_auto_file"))
                using (RegistryKey User_AutoFile_Command = User_AutoFile.CreateSubKey("shell").CreateSubKey("open").CreateSubKey("command"))
                using (RegistryKey ApplicationAssociationToasts = Registry.CurrentUser.OpenSubKey("Software\\Microsoft\\Windows\\CurrentVersion\\ApplicationAssociationToasts\\", true))
                using (RegistryKey User_Classes_Applications = User_Classes.CreateSubKey("Applications"))
                using (RegistryKey User_Classes_Applications_Exe = User_Classes_Applications.CreateSubKey(ExecutableName))
                using (RegistryKey User_Application_Command = User_Classes_Applications_Exe.CreateSubKey("shell").CreateSubKey("open").CreateSubKey("command"))
                using (RegistryKey User_Explorer = Registry.CurrentUser.CreateSubKey("Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\." + Extension))
                using (RegistryKey User_Choice = User_Explorer.OpenSubKey("UserChoice")) {
                    User_Ext.SetValue("", Extension + "_auto_file", RegistryValueKind.String);
                    User_Classes.SetValue("", Extension + "_auto_file", RegistryValueKind.String);
                    User_Classes.CreateSubKey(Extension + "_auto_file");
                    User_AutoFile_Command.SetValue("", "\"" + OpenWith + "\"" + " \"%1\"");
                    ApplicationAssociationToasts.SetValue(Extension + "_auto_file_." + Extension, 0);
                    ApplicationAssociationToasts.SetValue(@"Applications\" + ExecutableName + "_." + Extension, 0);
                    User_Application_Command.SetValue("", "\"" + OpenWith + "\"" + " \"%1\"");
                    User_Explorer.CreateSubKey("OpenWithList").SetValue("a", ExecutableName);
                    User_Explorer.CreateSubKey("OpenWithProgids").SetValue(Extension + "_auto_file", "0");
                    if (User_Choice != null) User_Explorer.DeleteSubKey("UserChoice");
                    User_Explorer.CreateSubKey("UserChoice").SetValue("ProgId", @"Applications\" + ExecutableName);
                }
                SHChangeNotify(0x08000000, 0x0000, IntPtr.Zero, IntPtr.Zero);
            } catch (Exception excpt) {
                //Your code here
            }
        }

        /// <summary>
        /// 解除關聯副檔名
        /// </summary>
        /// <param name="ar_Extension"></param>
        /// <param name="OpenWith"></param>
        /// <param name="ExecutableName"></param>
        public void RemoveAssociationExtension(object[] arExtension, string appPath) {

            //如果檔案不存在
            if (File.Exists(appPath) == false) { return; }

            string appName = Path.GetFileName(appPath); //程式檔名，例如 Tiefsee.exe

            for (int i = 0; i < arExtension.Length; i++) {
                string Extension = arExtension[i].ToString(); //副檔名

                using (RegistryKey User_Classes = RegistryKey.OpenBaseKey(RegistryHive.CurrentUser, RegistryView.Default).OpenSubKey("SOFTWARE\\Classes\\", true)) {
                    User_Classes.DeleteSubKeyTree("." + Extension, false);
                    User_Classes.DeleteSubKeyTree(Extension + "_auto_file", false);
                    User_Classes.DeleteSubKeyTree("Applications\\" + appName, false);
                }

                using (RegistryKey User_Explorer = Registry.CurrentUser.OpenSubKey("Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\." + Extension, true)) {
                    if (User_Explorer != null) {
                        User_Explorer.DeleteSubKey("OpenWithList", false);
                        User_Explorer.DeleteSubKey("OpenWithProgids", false);
                        User_Explorer.DeleteSubKey("UserChoice", false);
                        User_Explorer.Close();
                        Registry.CurrentUser.DeleteSubKey("." + Extension, false);
                    }
                }
            }
            SHChangeNotify(0x08000000, 0x0000, IntPtr.Zero, IntPtr.Zero);
        }



        /// <summary>
        /// 對檔案進行排序
        /// </summary>
        /// <param name="ar"></param>
        /// <param name="type"></param>
        /// <returns></returns>
        public string[] Sort(object[] ar, string type) {
            string[] arFile = new string[ar.Length];
            for (int i = 0; i < arFile.Length; i++) {
                arFile[i] = ar[i].ToString();
            }
            var filesort = new FileSort();
            return filesort.Sort(arFile, type);
        }


        /// <summary>
        /// 對檔案進行排序。同一資料夾內的檔案就不傳入與回傳完整路徑，減少傳輸成本
        /// </summary>
        /// <param name="dir"></param>
        /// <param name="ar"></param>
        /// <param name="type"></param>
        /// <returns></returns>
        public string[] Sort2(string dir, object[] ar, string type) {
            var filesort = new FileSort();
            return filesort.Sort2(dir, ar, type);
        }

    }
}
