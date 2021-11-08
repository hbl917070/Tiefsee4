using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace tiefsee {

    [ClassInterface(ClassInterfaceType.AutoDual)]
    [ComVisible(true)]

    /// <summary>
    /// 網頁呼叫C#方法
    /// </summary>
    public class WV_File {

        WebWindow M;

        public WV_File(WebWindow m) {
            this.M = m;
        }


        /// <summary>
        /// 快速拖曳 (拖出檔案
        /// </summary>
        /// <param name="path"></param>
        public void DragDropFile(string path) {

            if (File.Exists(path) == false) {
                return;
            }

            string[] files = { path };

            try {
                var file = new System.Windows.DataObject(System.Windows.DataFormats.FileDrop, files);
                System.Windows.DragDrop.DoDragDrop(btnDragDropFile, file, System.Windows.DragDropEffects.All);
            } catch { }
        }
        System.Windows.Controls.Button btnDragDropFile = new System.Windows.Controls.Button();


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
            var time = File.GetCreationTimeUtc(path);
            long unixTimestamp = toUnix(time);
            return unixTimestamp;
        }


    }
}
