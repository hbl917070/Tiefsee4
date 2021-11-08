using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace tiefsee {
    class WV_T {


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
            using (var fileStream = new FileStream(@"C:\Users\wen\Desktop\123.jpg", FileMode.Create, FileAccess.Write)) {
                fs.CopyTo(fileStream);
            }
        }


        public void t3(Stream fs) {
            var str = t1(@"C:\Users\wen\Desktop\89796867_p0.jpg");
            t2(str);
        }
    }
}
