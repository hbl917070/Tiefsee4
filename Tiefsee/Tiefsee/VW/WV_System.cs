using Microsoft.Win32;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Tiefsee {


    [ComVisible(true)]

    public class WV_System {

        WebWindow M;
        public WV_System(WebWindow m) {
            this.M = m;
        }


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
        public bool SetClipboard_base64ToImage(string base64, bool isTransparent) {
            try {
                using (MemoryStream ms = Base64ToMemoryStream(base64)) {
                    using (System.Drawing.Bitmap bm = new Bitmap(ms)) {
                        System.Windows.Forms.Clipboard.Clear();//清理剪貼簿
                        System.Windows.Forms.IDataObject data_object = new System.Windows.Forms.DataObject();
                        data_object.SetData(DataFormats.Bitmap, true, bm);//無透明色的圖片，所有軟體都支援
                        if (isTransparent) {
                            data_object.SetData("PNG", true, ms);//含有透明色，但並非所有軟體都支援
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

                        System.Windows.Forms.Clipboard.Clear();//先清理剪貼簿
                        System.Windows.Forms.IDataObject data_object = new System.Windows.Forms.DataObject();
                        data_object.SetData(DataFormats.Bitmap, true, bm);
                        if (isTransparent) {
                            data_object.SetData("PNG", true, ms);//含有透明色，但並非所有軟體都支援
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

                System.Windows.Forms.Clipboard.SetDataObject(base64String, false, 5, 200);//存入剪貼簿
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
                System.Windows.Forms.Clipboard.SetDataObject(txt, false, 5, 200);//存入剪貼簿
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

            Dictionary<string, int> dic = new Dictionary<string, int>();
            dic.Add("X", p.X);
            dic.Add("Y", p.Y);

            return new int[2] { p.X, p.Y };
        }


        /// <summary>
        /// 修改桌布用的函數
        /// </summary>
        /// <param name="uAction"></param>
        /// <param name="uParam"></param>
        /// <param name="lpvParam"></param>
        /// <param name="uWinlni"></param>
        /// <returns></returns>
        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        private static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int uWinlni);

        /// <summary>
        /// 設定桌布
        /// </summary>
        /// <param name="path"></param>
        public void SetWallpaper(string path) {

            if (File.Exists(path)) { //判別檔案是否存在於對應的路徑
                try {
                    SystemParametersInfo(20, 1, path, 0x1 | 0x2);  //存在成立，修改桌布　　(uActuin 20 參數為修改wallpaper
                } catch (Exception e2) {
                    MessageBox.Show("設定桌布失敗：\n" + e2.ToString(), "失敗");
                }
            }

        }


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
                String os = System.Environment.OSVersion.Version.ToString();//取得作業系統地版本
                return os.Length > 3 && os.Substring(0, 3) == "6.1";//win7
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
            try {
                GC.Collect();
                GC.WaitForPendingFinalizers();
                if (Environment.OSVersion.Platform == PlatformID.Win32NT) {
                    SetProcessWorkingSetSize(System.Diagnostics.Process.GetCurrentProcess().Handle, -1, -1);
                }
            } catch { }
        }


        /// <summary>
        /// 關聯副檔名
        /// </summary>
        /// <param name="ar_Extension"></param>
        /// <param name="OpenWith"></param>
        /// <param name="ExecutableName"></param>
        public void SetAssociationExtension(object[] arExtension, string appPath) {

            //如果檔案不存在
            if (File.Exists(appPath) == false) { return; }

            string appName = Path.GetFileName(appPath);//程式檔名，例如 Tiefsee.exe

            for (int i = 0; i < arExtension.Length; i++) {
                string Extension = arExtension[i].ToString();//副檔名
                _SetAssociationExtension(Extension, appPath, appName);
            }
        }
        private void _SetAssociationExtension(string Extension, string OpenWith, string ExecutableName) {
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

        [DllImport("shell32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern void SHChangeNotify(uint wEventId, uint uFlags, IntPtr dwItem1, IntPtr dwItem2);



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

    }
}
