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

namespace TiefSee {
  

    //[ClassInterface(ClassInterfaceType.AutoDual)]
    [ComVisible(true)]

    public class WV_System {

        WebWindow M;

        public WV_System(WebWindow m) {
            this.M = m;
        }



        [DllImport("gdi32.dll", CharSet = CharSet.Auto, SetLastError = true, ExactSpelling = true)]
        public static extern int GetDeviceCaps(IntPtr hDC, int nIndex);

        public enum DeviceCap {
            /// <summary>
            /// Logical pixels inch in X
            /// </summary>
            LOGPIXELSX = 88,
            /// <summary>
            /// Logical pixels inch in Y
            /// </summary>
            LOGPIXELSY = 90

            // Other constants may be founded on pinvoke.net
        }

        /// <summary>
        /// 取得註螢幕的dpi，預設為96
        /// </summary>
        /// <returns></returns>
        public float[] GetDpi() {        

            Graphics g = Graphics.FromHwnd(IntPtr.Zero);
            IntPtr desktop = g.GetHdc();

            int Xdpi = GetDeviceCaps(desktop, (int)DeviceCap.LOGPIXELSX);
            int Ydpi = GetDeviceCaps(desktop, (int)DeviceCap.LOGPIXELSY);

            return new float[] { Xdpi, Ydpi };
        }



        /// <summary>
        /// 存入剪貼簿 - 
        /// </summary>
        /// <param name="txt"></param>
        /// <returns></returns>
        public bool SetClipboard_FileToPng(string path) {

            try {

                if (File.Exists(path) == false) { return false; }

                System.Drawing.Bitmap bm_transparent = null;
                MemoryStream ms = new MemoryStream();
                bm_transparent = new System.Drawing.Bitmap(path);
                bm_transparent.Save(ms, System.Drawing.Imaging.ImageFormat.Png);

                System.Windows.Forms.Clipboard.Clear();//先清理剪貼簿
                System.Windows.Forms.IDataObject data_object = new System.Windows.Forms.DataObject();
                data_object.SetData("PNG", false, ms);
                System.Windows.Forms.Clipboard.SetDataObject(data_object, false);
                return true;
            } catch (Exception e2) {
                MessageBox.Show(e2.ToString());
                return false;
            }

        }


        /// <summary>
        /// 存入剪貼簿 - 
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
        /// 存入剪貼簿 - 
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
        public bool SetClipboard_FileToImg(string path) {
            try {
                using (System.Drawing.Bitmap bm_transparent = new System.Drawing.Bitmap(path)) {
                    System.Windows.Forms.Clipboard.SetImage(bm_transparent);
                    bm_transparent.Dispose();
                }
                return true;
            } catch (Exception) {

                return false;
            }
        }


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

            /*     
            Process thisProc = Process.GetCurrentProcess();  
            PerformanceCounter PC = new PerformanceCounter();
            float fff = 0;
            try {
                PC.CategoryName = "Process";
                PC.CounterName = "Working Set - Private";
                PC.InstanceName = thisProc.ProcessName;
                fff = PC.NextValue() / 1024 / 1024;
            } catch { }
            return fff;*/
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

    }
}
