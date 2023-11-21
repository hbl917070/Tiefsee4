using System.IO;

namespace Tiefsee {

    public class AppPath {

        /// <summary> AppData(使用者資料) </summary>
        public static string appData;

        /// <summary> Start.ini </summary>
        public static string appDataStartIni;

        /// <summary> Lock檔案，用於判斷是否短時間內重複啟動 </summary>
        public static string appDataLock;

        /// <summary> Port Dir </summary>
        public static string appDataPort;

        /// <summary> Plugin Dir </summary>
        public static string appDataPlugin;

        /// <summary> Strting.json </summary>
        public static string appDataSetting;

        /// <summary> UWP 列表 </summary>
        public static string appDataUwpList;

        /// <summary> 暫存資料夾 - 處理過的圖片(原始大小) </summary>
        public static string tempDirImgProcessed = "";

        /// <summary> 暫存資料夾 - 縮放後的圖片 </summary>
        public static string tempDirImgZoom = "";

        /// <summary> 暫存資料夾 - 從網路下載的檔案 </summary>
        public static string tempDirWebFile = "";

        /// <summary> 工作列右下角的圖示 </summary>
        public static string logoIcon = "";

        public static void Init() {

            try { // 商店版
                appData = Windows.Storage.ApplicationData.Current.LocalCacheFolder.Path;
                appData = Path.Combine(appData, "Local", "Tiefsee");
                StartWindow.isStoreApp = true;

            } catch { // 傳統應用程式版

                string portableMode = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "portableMode");
                if (Directory.Exists(portableMode)) { // 便攜模式 (如果存在此資料夾，就把資料儲存在這裡
                    appData = portableMode;
                } else {
                    appData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Tiefsee");
                }

                StartWindow.isStoreApp = false;
            }

            appDataLock = Path.Combine(appData, "Lock");
            appDataStartIni = Path.Combine(appData, "Start.ini");
            appDataPort = Path.Combine(appData, "Port");
            appDataPlugin = Path.Combine(appData, "Plugin");
            appDataSetting = Path.Combine(appData, "Setting.json");
            appDataUwpList = Path.Combine(appData, "UwpList.json");

            string downloadsPath = KnownFolders.GetPath(KnownFolder.Downloads); // 使用者的 下載

            tempDirImgProcessed = Path.Combine(Path.GetTempPath(), "Tiefsee\\ImgProcessed");
            tempDirImgZoom = Path.Combine(Path.GetTempPath(), "Tiefsee\\ImgZoom");
            tempDirWebFile = Path.Combine(downloadsPath, "Tiefsee");
            // tempDirWebFile = Path.Combine(Path.GetTempPath(), "Tiefsee\\WebFile");

            logoIcon = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "Www\\img\\logo.ico");

            //------

            // 如果資料夾不存在，就新建

            if (Directory.Exists(appData) == false) {
                Directory.CreateDirectory(appData);
            }
            if (Directory.Exists(appDataPlugin) == false) {
                Directory.CreateDirectory(appDataPlugin);
            }
        }

    }
}
