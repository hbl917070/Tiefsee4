using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Tiefsee {

    [ComVisible(true)]
    public class WV_RunApp {

        WebWindow M;
        public WV_RunApp(WebWindow m) {
            this.M = m;
        }


        /// <summary>
        /// 以其他程式開啟(系統原生選單)
        /// </summary>
        /// <param name="path"></param>
        public void ShowMenu(string path) {
            if (File.Exists(path)) { //判別檔案是否存在於對應的路徑
                try {
                    Process.Start(new ProcessStartInfo("rundll32.exe") {
                        Arguments = $"shell32.dll,OpenAs_RunDLL {path}",
                        WorkingDirectory = Path.GetDirectoryName(path)
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
                    System.Diagnostics.Process.Start("mspaint", '"' + path + '"' + " /ForceBootstrapPaint3D");
                } catch (Exception e2) {
                    System.Windows.Forms.MessageBox.Show(e2.ToString(), "失敗");
                }
            }
        }


        /// <summary>
        /// 以 photos APP開啟(已失效)
        /// </summary>
        /// <param name="path"></param>
        public void OpenPhotoApp(string path) {
            if (File.Exists(path)) { //判別檔案是否存在於對應的路徑
                try {
                    String url_path = Uri.EscapeDataString(path);
                    System.Diagnostics.Process.Start("ms-photos:viewer?fileName=" + url_path);
                } catch (Exception e2) {
                    System.Windows.Forms.MessageBox.Show(e2.ToString(), "失敗");
                }
            }
        }



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
                System.Diagnostics.Process.Start(url);
                return true;
            } catch {
                return false;
            }
        }



    }
}
