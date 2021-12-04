using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Runtime.Remoting;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace tiefsee {


    [ComVisible(true)]
    public class FileInfo2 {
        public string Type = "none";// file / dir / none
        public string Path = "";//檔案路徑
        public long Lenght = 0;//檔案大小
        public long CreationTimeUtc = 0;//建立時間
        public long LastWriteTimeUtc = 0;//修改時間
        public string HexValue = "";//用於辨識檔案類型
    }


    //[ClassInterface(ClassInterfaceType.AutoDual)]
    [ComVisible(true)]

    /// <summary>
    /// 網頁呼叫C#方法
    /// </summary>
    public class WV_File {

        WebWindow M;

        public WV_File(WebWindow m) {
            this.M = m;
        }

        public String GetFileInfo2(string path) {

            DateTime time_start = DateTime.Now;//計時開始 取得目前時間


            FileInfo2 info = new FileInfo2();
            info.Path = path;

            if (File.Exists(path)) {

                info.Type = "file";
                info.Lenght = new FileInfo(path).Length;
                info.CreationTimeUtc = GetCreationTimeUtc(path);
                info.LastWriteTimeUtc = GetLastWriteTimeUtc(path);

                StringBuilder sb = new StringBuilder();
                try {
                    using (FileStream fs = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) {
                        using (System.IO.BinaryReader br = new System.IO.BinaryReader(fs)) {
                            for (int i = 0; i < 100; i++) {
                                string hexValue = br.ReadByte().ToString("X2");
                                sb.Append(hexValue + " ");
                            }
                            if (fs != null) {
                                fs.Close();
                                br.Close();
                            }
                        }//using
                    }//using
                } catch { }

                info.HexValue = sb.ToString();
                //return info;

            } else if (Directory.Exists(path)) {

                info.Type = "dir";
                info.Lenght = 0;
                info.CreationTimeUtc = toUnix(Directory.GetLastWriteTimeUtc(path));
                info.LastWriteTimeUtc = toUnix(Directory.GetLastWriteTimeUtc(path));
                info.HexValue = "";
                //return info;

            } else {
                info.Type = "none";
            }


            String json = JsonConvert.SerializeObject(info);
            DateTime time_end = DateTime.Now;//計時結束 取得目前時間            
            string result2 = ((TimeSpan)(time_end - time_start)).TotalMilliseconds.ToString();//後面的時間減前面的時間後 轉型成TimeSpan即可印出時間差
            System.Console.WriteLine("+++++++++++++++++++++++++++++++++++" + result2 + " 毫秒");
            return json;
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
        /// 在檔案總管顯示檔案
        /// </summary>
        /// <param name="path"></param>
        public void ShowOnExplorer(string path) {
            try {
                string file = Path.Combine(GetSystemRoot(), @"Windows\explorer.exe");
                string argument = @"/select, " + "\"" + path + "\"";
                System.Diagnostics.Process.Start(file, argument);
            } catch (Exception e) {
                MessageBox.Show(e.ToString(), "error");
            }
        }


        /// <summary>
        /// 開啟 選擇檔案 的視窗
        /// </summary>
        /// <param name="Multiselect"> 是否允許多選，false表示單選 </param>
        /// <param name="Filter"> 檔案類型。 abc(*.png)|*.png|All files (*.*)|*.* </param>
        /// <param name="Title"> 視窗標題 </param>
        /// <returns></returns>
        public string[] OpenFileDialog(bool Multiselect, string Filter, string Title) {

            using (OpenFileDialog openFileDialog = new OpenFileDialog()) {
                openFileDialog.Multiselect = Multiselect; //是否允許多選，false表示單選
                openFileDialog.Filter = Filter;//檔案類型 All files (*.*)|*.*
                openFileDialog.Title = Title;//標題
                //openFileDialog.InitialDirectory = InitialDirectory;//初始目錄
                openFileDialog.RestoreDirectory = true;//恢復到之前選擇的目錄
                //openFileDialog.FilterIndex = 2;
                if (openFileDialog.ShowDialog() == DialogResult.OK) {
                    var files = openFileDialog.FileNames;
                    return files;
                }

                return new string[0];
            }

        }






        /// <summary>
        /// 判斷真實檔案類型
        /// </summary>
        /// <param name="fileName">檔案或資料夾路徑</param>
        /// <returns>大寫附檔名，如果沒有則回傳 "" </returns>
        public String GetFIleType(string fileName) {

            //避免檔案不存在
            if (Directory.Exists(fileName)) { return ""; }
            if (File.Exists(fileName) == false) { return ""; }

            string fileType = string.Empty;

            try {

                using (FileStream fs = new FileStream(fileName, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) {
                    using (System.IO.BinaryReader br = new System.IO.BinaryReader(fs)) {

                        /*var ar = br.ReadSingle(300);
                        for (int i = 0; i < ar.Length; i++) {
                            fileType += ar[i];
                        }*/


                        for (int i = 0; i < 2; i++) {
                            fileType += br.ReadByte();
                        }

                        /*byte data = br.ReadByte();
                        fileType += data.ToString();
                        data = br.ReadByte();
                        fileType += data.ToString();

                        for (int i = 0; i < 30; i++) {
                            data = br.ReadByte();
                            fileType += data.ToString();
                        }*/

                        if (fs != null) {
                            fs.Close();
                            br.Close();
                        }

                        return fileType;

                    }//using
                }//using

            } catch {

                return "";
            }



        }


        public String GetFIleTypeTxt(string fileName) {

            //避免檔案不存在
            if (Directory.Exists(fileName)) { return ""; }
            if (File.Exists(fileName) == false) { return ""; }

            String fileExt = Path.GetExtension(fileName);//無法判斷時，直接用附檔名判斷
            fileExt = fileExt.ToUpper();//轉大寫
            if (fileExt.Length > 1 && fileExt.Substring(0, 1) == ".") {
                fileExt = fileExt.Substring(1, fileExt.Length - 1);
            }

            try {

                using (FileStream fs = new FileStream(fileName, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) {
                    using (System.IO.BinaryReader br = new System.IO.BinaryReader(fs)) {

                        string fileType = string.Empty;
                        try {
                            byte data = br.ReadByte();
                            fileType += data.ToString();
                            data = br.ReadByte();
                            fileType += data.ToString();

                            System.Console.WriteLine(fileType);

                            if (fileType == "255216") { return "JPG"; }
                            if (fileType == "7173") { return "GIF"; }
                            if (fileType == "13780") { return "PNG"; }
                            if (fileType == "6787") { return "SWF"; }
                            if (fileType == "6677") { return "BMP"; }
                            if (fileType == "5666") { return "PSD"; }
                            if (fileType == "8297") { return "RAR"; }
                            if (fileType == "8075") {
                                if (fileExt == "DOCX") { return "DOCX"; }
                                if (fileExt == "PPTX") { return "PPTX"; }
                                if (fileExt == "APK") { return "APK"; }
                                if (fileExt == "XD") { return "XD"; }
                                return "ZIP";
                            }
                            if (fileType == "55122") { return "7Z"; }
                            if (fileType == "3780") {
                                if (fileExt == "AI") { return "AI"; }
                                return "PDF";
                            }
                            if (fileType == "8273") {
                                if (fileExt == "AVI") { return "AVI"; }
                                if (fileExt == "WAV") { return "WAV"; }
                                return "WEBP";
                            }
                            if (fileType == "4838") { return "WMV"; }
                            if (fileType == "2669") { return "MKV"; }
                            if (fileType == "7076") { return "FLV"; }
                            if (fileType == "1") { return "TTF"; }

                            //無法判斷時，直接用附檔名判斷
                            return fileExt;


                        } catch (Exception ex) {

                            return fileExt;

                        } finally {
                            if (fs != null) {
                                fs.Close();
                                br.Close();
                            }
                        }

                    }//using
                }//using

            } catch {

                return fileExt;
            }



        }


        /// <summary>
        /// 快速拖曳 (拖出檔案
        /// </summary>
        /// <param name="path"></param>
        public void DragDropFile(string path) {

            if (File.Exists(path) == false) { return; }

            string[] files = { path };

            try {
                var file = new System.Windows.Forms.DataObject(System.Windows.Forms.DataFormats.FileDrop, files);
                // System.Windows.DragDrop.DoDragDrop(btnDragDropFile, file, System.Windows.DragDropEffects.All);
                M.DoDragDrop(file, DragDropEffects.All);

            } catch { }


        }



        /// <summary>
        /// 顯示檔案原生右鍵選單
        /// </summary>
        /// <param name="path">檔案路徑</param>
        /// <param name="followMouse">true=顯示於游標旁邊、false=視窗左上角</param>
        public void ShowContextMenu(string path, bool followMouse) {
            try {
                var ctxMnu = new ShellTestApp.ShellContextMenu();
                FileInfo[] arrFI = new FileInfo[1];
                arrFI[0] = new FileInfo(path);

                if (followMouse) {

                    ctxMnu.ShowContextMenu(arrFI, System.Windows.Forms.Cursor.Position);

                } else {
                    ctxMnu.ShowContextMenu(arrFI, new System.Drawing.Point(
                       (int)M.PointToScreen(new Point(0, 0)).X + 10,
                       (int)M.PointToScreen(new Point(0, 0)).Y + 10)
                   );
                }
            } catch {
                MessageBox.Show("error");
            }

        }


        /// <summary>
        /// 列印文件
        /// </summary>
        /// <param name="path"></param>
        public void PrintFile(string path) {
            try {
                var pr = new System.Diagnostics.Process();
                pr.StartInfo.FileName = path;//文件全稱-包括文件後綴
                pr.StartInfo.CreateNoWindow = true;
                pr.StartInfo.WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden;
                pr.StartInfo.Verb = "Print";
                pr.Start();
            } catch (Exception e2) {
                MessageBox.Show("找不到對應開啟的程式：\n" + e2.ToString(), "列印失敗");
            }

        }




        /// <summary>
        /// 取得文字資料
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public String GetText(string path) {
            String s;
            using (StreamReader sr = new StreamReader(path, Encoding.UTF8)) {
                s = sr.ReadToEnd();
            }
            return s;
        }


        /// <summary>
        /// 儲存文字資料
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public void SetText(string path, string t) {

            using (FileStream fs = new FileStream(path, FileMode.Create)) {
                using (StreamWriter sw = new StreamWriter(fs, Encoding.UTF8)) {
                    sw.Write(t);
                }
            }
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public FileInfo GetFileInfo(string path) {
            return new FileInfo(path);
        }


        /// <summary>
        /// 判斷指定的檔案是否存在
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public bool Exists(string path) {
            // FileInfo d = GetFileInfo("");
            //  long df= d.Length;
            return File.Exists(path);
        }


        /// <summary>
        /// 刪除檔案
        /// </summary>
        /// <param name="path"></param>
        public void Delete(string path) {
            File.Delete(path);
        }


        /// <summary>
        /// 移動檔案到新位置
        /// </summary>
        /// <param name="sourceDirName"></param>
        /// <param name="destDirName"></param>
        public void Move(string sourceDirName, string destDirName) {
            File.Move(sourceDirName, destDirName);
        }


        long toUnix(DateTime time) {
            var t = time.Subtract(new DateTime(1970, 1, 1));
            String unixTimestamp = (Int32)t.TotalSeconds + t.Milliseconds.ToString("000");
            return long.Parse(unixTimestamp);
        }

        /// <summary>
        /// 取得檔案的建立時間
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public long GetCreationTimeUtc(string path) {
            if (File.Exists(path) == false) { return 0; }
            var time = File.GetCreationTimeUtc(path);
            long unixTimestamp = toUnix(time);
            return unixTimestamp;
        }


        /// <summary>
        /// 傳回指定檔案或目錄上次被寫入的日期和時間
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public long GetLastWriteTimeUtc(string path) {
            if (File.Exists(path) == false) { return 0; }
            var time = File.GetLastWriteTimeUtc(path);
            long unixTimestamp = toUnix(time);
            return unixTimestamp;
        }



    }
}
