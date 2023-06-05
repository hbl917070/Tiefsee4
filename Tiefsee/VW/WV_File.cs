using Microsoft.VisualBasic.FileIO;
using Newtonsoft.Json;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;

namespace Tiefsee {


    [ComVisible(true)]
    public class FileInfo2 {
        public string Type = "none"; // file / dir / none
        public string Path = ""; //檔案路徑
        public long Lenght = 0; //檔案大小
        public long CreationTimeUtc = 0; //建立時間
        public long LastWriteTimeUtc = 0; //修改時間
        public string HexValue = ""; //用於辨識檔案類型
    }



    [ComVisible(true)]

    /// <summary>
    /// 網頁呼叫C#方法
    /// </summary>
    public class WV_File {

        WebWindow M;

        public WV_File(WebWindow m) {
            this.M = m;
        }
        public WV_File() { }


        /// <summary>
        /// 將base64儲存至暫存資料夾 tempDirWebFile，並回傳路徑
        /// </summary>
        /// <param name="base64"></param>
        /// <param name="extension"> 副檔名 </param>
        /// <returns></returns>
        public string Base64ToTempFile(string base64, string extension) {

            try {

                //取得亂數檔名
                string path = "";
                while (true) {
                    string name = DateTime.Now.ToString("yyyyMMdd-HHmmss") + "-" + GenerateRandomString(10) + "." + extension;
                    path = Path.Combine(AppPath.tempDirWebFile, name);
                    if (File.Exists(path) == false) { break; }
                }
                if (Directory.Exists(AppPath.tempDirWebFile) == false) {
                    Directory.CreateDirectory(AppPath.tempDirWebFile);
                }

                //把base646儲存成檔案
                int x = base64.IndexOf("base64,"); //去掉開頭的 data:image/png;base64,
                if (x != -1) { base64 = base64.Substring(x + 7); }
                byte[] buffer = Convert.FromBase64String(base64);
                File.WriteAllBytes(path, buffer);

                return path;

            } catch (Exception e) {
                Console.WriteLine(e.Message);
                return "false";
            }

        }
        //取得亂數字串
        private static string GenerateRandomString(int length) {
            string chars = "abcdefghijklmnopqrstuvwxyz0123456789";
            StringBuilder sb = new StringBuilder();
            Random random = new Random();
            for (int i = 0; i < length; i++) {
                int index = random.Next(chars.Length);
                sb.Append(chars[index]);
            }
            return sb.ToString();
        }



        /// <summary>
        /// 取得基本檔案資訊
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public String GetFileInfo2(string path) {
            FileInfo2 info = _GetFileInfo2(path);
            String json = JsonConvert.SerializeObject(info);
            return json;
        }
        public FileInfo2 _GetFileInfo2(string path) {

            FileInfo2 info = new FileInfo2();
            info.Path = Path.GetFullPath(path);

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
                        }
                    }
                } catch { }

                info.HexValue = sb.ToString();
                //return info;

            } else if (Directory.Exists(path)) {

                info.Type = "dir";
                info.Lenght = 0;
                info.CreationTimeUtc = ToUnix(Directory.GetLastWriteTimeUtc(path));
                info.LastWriteTimeUtc = ToUnix(Directory.GetLastWriteTimeUtc(path));
                info.HexValue = "";
                //return info;

            } else {
                info.Type = "none";
            }

            return info;
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
                openFileDialog.Filter = Filter; //檔案類型 All files (*.*)|*.*
                openFileDialog.Title = Title; //標題
                                              //openFileDialog.InitialDirectory = InitialDirectory; //初始目錄
                openFileDialog.RestoreDirectory = true; //恢復到之前選擇的目錄
                                                        //openFileDialog.FilterIndex = 2;
                if (openFileDialog.ShowDialog() == DialogResult.OK) {
                    var files = openFileDialog.FileNames;
                    return files;
                }
                return new string[0];
            }
        }


        /// <summary>
        /// 快速拖曳 (拖出檔案
        /// </summary>
        /// <param name="path"></param>
        public void DragDropFile(string path) {
            if (File.Exists(path) == false && Directory.Exists(path) == false) { return; }
            string[] files = { path };
            try {
                var file = new System.Windows.Forms.DataObject(System.Windows.Forms.DataFormats.FileDrop, files);
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

                if (File.Exists(path)) {
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

                } else if (Directory.Exists(path)) {

                    DirectoryInfo[] arrFI = new DirectoryInfo[1];
                    arrFI[0] = new DirectoryInfo(path);

                    if (followMouse) {
                        ctxMnu.ShowContextMenu(arrFI, System.Windows.Forms.Cursor.Position);
                    } else {
                        ctxMnu.ShowContextMenu(arrFI, new System.Drawing.Point(
                           (int)M.PointToScreen(new Point(0, 0)).X + 10,
                           (int)M.PointToScreen(new Point(0, 0)).Y + 10)
                       );
                    }
                }


            } catch {
                MessageBox.Show("ShowContextMenu error");
            }
        }


        /// <summary>
        /// 列印文件
        /// </summary>
        /// <param name="path"></param>
        public void PrintFile(string path) {
            try {
                var p = Process.Start(new ProcessStartInfo() {
                    FileName = path,
                    CreateNoWindow = true,
                    WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden,
                    Verb = "Print",
                    UseShellExecute = true
                });
            } catch (Exception e2) {
                MessageBox.Show(e2.ToString(), "Print failed");
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
            return File.Exists(path);
        }


        /// <summary>
        /// 刪除檔案
        /// </summary>
        /// <param name="path"></param>
        public string Delete(string path) {
            //if (File.Exists(path) == false) { return false; }
            try {
                File.Delete(path);
            } catch (Exception e) {
                return e.Message;
            }
            return "";
        }


        /// <summary>
        /// 檔案移到資源回收桶
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public string MoveToRecycle(string path) {
            //if (File.Exists(path) == false) { return false; }
            try {
                FileSystem.DeleteFile(
                    path,
                    UIOption.OnlyErrorDialogs,
                    RecycleOption.SendToRecycleBin
                );
            } catch (Exception e) {
                return e.Message;
            }
            return "";
        }


        /// <summary>
        /// 移動檔案到新位置
        /// </summary>
        /// <param name="sourceFileName"></param>
        /// <param name="destFileName"></param>
        public string Move(string sourceFileName, string destFileName) {
            //if (File.Exists(sourceFileName) == false) { return false; }
            //if (File.Exists(destFileName) == true) { return false; }
            try {
                File.Move(sourceFileName, destFileName);
            } catch (Exception e) {
                return e.Message;
            }
            return "";
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="time"></param>
        /// <returns></returns>
        long ToUnix(DateTime time) {
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
            long unixTimestamp = ToUnix(time);
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
            long unixTimestamp = ToUnix(time);
            return unixTimestamp;
        }



    }
}
