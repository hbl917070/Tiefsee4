using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace tiefsee {

    [ComVisible(true)]
    public class WV_T {


        public Form newForm() {
            var w = new Form();
            w.Show();

            return w;
        }

        public Stream t1 (string path) {
            Stream fs = File.OpenRead(path);
            return fs;
        }

        public void t2(Stream fs) {
            using (var fileStream = new FileStream(@"C:\Users\wen\Desktop\86123632_p0.png", FileMode.Create, FileAccess.Write)) {
                fs.CopyTo(fileStream);
            }
        }


        public void t3(Stream fs) {
            var str = t1(@"C:\Users\wen\Desktop\89796867_p0.jpg");
            t2(str);
        }

        public Bitmap t4() {
            return new Bitmap(@"C:\Users\wen\Desktop\86123632_p0.png");
        }

    }
}
