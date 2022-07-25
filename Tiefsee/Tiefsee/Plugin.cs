using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Tiefsee {

    public static class Plugin {
        public static string dirPlugin;
        public static string pathNConvert;
        public static string pathQuickLook;
        public static DataPlugin dataPlugin = new DataPlugin();

        /*public static Plugin() {
            Init();
        }*/

        /// <summary>
        /// 初始化
        /// </summary>
        public static void Init() {
            dirPlugin = Path.Combine(Program.appDataPath, "Plugin");

            if (Directory.Exists(dirPlugin) == false) {
                Directory.CreateDirectory(dirPlugin);
            }

            pathNConvert = Path.Combine(dirPlugin, "NConvert/nconvert.exe");
            pathQuickLook = Path.Combine(dirPlugin, "QuickLook/Tiefsee.QuickLook.dll");

            dataPlugin.NConvert = File.Exists(pathNConvert);
            dataPlugin.QuickLook = File.Exists(pathQuickLook);
        }

    }


    /// <summary>
    /// 快速預覽檔案
    /// </summary>
    public static class PluginQuickLook {

        private static MethodInfo meth = null;
        private static Object obj = null;

        /// <summary>
        /// 取得當前資料夾或桌面選取的單一檔案，如果取得失敗則返回 ""
        /// </summary>
        /// <returns></returns>
        public static string GetCurrentSelection() {
            if (Plugin.dataPlugin.QuickLook == false) {
                return "";
            }

            if (meth == null) {
                string dllPath = Plugin.pathQuickLook;
                Assembly ass = Assembly.LoadFile(dllPath);  //加載dll文件
                Type tp = ass.GetType("Tiefsee.QuickLook");  //獲取類名，必須 命名空間+類名
                obj = Activator.CreateInstance(tp);  //建立實例
                meth = tp.GetMethod("GetCurrentSelection");  //獲取方法
            }

            string ret = (string)meth.Invoke(obj, new Object[] { });  //Invoke調用方法
            return ret;
        }
    }



    public class DataPlugin {
        public bool NConvert = false;
        public bool QuickLook = false;
    }

}
