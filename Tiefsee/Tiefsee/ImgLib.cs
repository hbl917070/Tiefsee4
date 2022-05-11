using ImageMagick;
using ImageMagick.Formats;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Media.Imaging;

namespace Tiefsee {

    public class ImgLib {


        /// <summary>
        /// 
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public static BitmapSource PathToBitmapSource(String path) {
            using (BinaryReader reader = new BinaryReader(File.Open(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))) {
                FileInfo fi = new FileInfo(path);
                byte[] bytes = reader.ReadBytes((int)fi.Length);
                MemoryStream ms = new MemoryStream(bytes);
                BitmapDecoder bd = BitmapDecoder.Create(ms, BitmapCreateOptions.DelayCreation, BitmapCacheOption.None);
                reader.Close();
                reader.Dispose();
                return bd.Frames[0];
            }
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="ms"></param>
        /// <returns></returns>
        public static BitmapSource StreamToBitmapSource(MemoryStream ms) {
            BitmapDecoder bd = BitmapDecoder.Create(ms, BitmapCreateOptions.DelayCreation, BitmapCacheOption.None);
            return bd.Frames[0];
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="bs"></param>
        /// <returns></returns>
        public static Stream BitmapSourceToStream(BitmapSource bs) {
            BitmapEncoder encoder = new BmpBitmapEncoder();
            encoder.Frames.Add(BitmapFrame.Create(bs));
            Stream stream = new MemoryStream();
            encoder.Save(stream);
            stream.Position = 0;
            return stream;
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public static Stream MagickImage_PathToStream(string path, string type) {

            var settings = new MagickReadSettings {
                BackgroundColor = MagickColors.None,
                Defines = new DngReadDefines {
                    OutputColor = DngOutputColor.SRGB,
                    UseCameraWhitebalance = true,
                    DisableAutoBrightness = false
                }
            };
            using (MagickImage image = new MagickImage(path, settings)) {

                /*if (image.ColorSpace == ColorSpace.RGB || image.ColorSpace == ColorSpace.sRGB || image.ColorSpace == ColorSpace.scRGB) {
                    image.SetProfile(ColorProfile.SRGB);
                }*/
                image.AutoOrient();//自動調整方向
                image.SetProfile(ColorProfile.SRGB);//如果不是RGB格式的圖片，需要更多時間來轉檔
                MagickFormat imgType;
                if (type.ToLower() == "png") {
                    image.Quality = 0;//壓縮品質
                    imgType = MagickFormat.Png24;
                } else {
                    imgType = MagickFormat.Bmp;//bpm也支援透明色
                }

                var ms = new MemoryStream();
                //image.Quality = 1;
                image.Write(ms, imgType);
                ms.Position = 0;

                image.Dispose();

                return ms;
            }
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public static Stream Wpf_PathToStream(string path) {
            BitmapSource bs = ImgLib.PathToBitmapSource(path);
            Stream stream = ImgLib.BitmapSourceToStream(bs);
            return stream;
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="path"></param>
        /// <param name="thumbnail"></param>
        /// <param name="minSize"></param>
        /// <returns></returns>
        public static Stream Dcraw_PathToStream(string path, bool thumbnail = true, int minSize = 800) {

            string dcRawExe = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "plugin", "dcraw.exe");
            string argThumbnail = "";
            if (thumbnail) { argThumbnail = "-e "; }
            var startInfo = new ProcessStartInfo(dcRawExe) {
                Arguments = $"-c -w {argThumbnail}\"{path}\"", // -e=縮圖  -w=套用相機設定  -c=回傳串流
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardError = true,
            };

            try {

                var memoryStream = new MemoryStream();
                using (var process = Process.Start(startInfo)) {
                    using (Stream st = process.StandardOutput.BaseStream) {
                        st.CopyTo(memoryStream);
                        memoryStream.Position = 0;
                    }
                }

                //如果縮圖小於800，就不使用縮圖       
                if (thumbnail) {
                    try {
                        var bs = StreamToBitmapSource(memoryStream);
                        if (bs.PixelWidth < minSize || bs.PixelHeight < minSize) {
                            Console.WriteLine("縮圖太小: " + path);
                            return Dcraw_PathToStream(path, false);
                        } else {
                            Console.WriteLine("縮圖ok: " + path);
                            memoryStream.Position = 0;
                            return memoryStream;
                        }
                    } catch (Exception) {
                        Console.WriteLine("縮圖失敗: " + path);
                    }
                }

                try {
                    memoryStream.Position = 0;
                    using (MagickImage image = new MagickImage(memoryStream)) {
                        var imgMs = new MemoryStream(image.ToByteArray(MagickFormat.Bmp));
                        memoryStream.Close();
                        memoryStream.Dispose();
                        if (thumbnail) {
                            if (image.Width < minSize || image.Height < minSize) {
                                Console.WriteLine("Magick縮圖太小: " + path);
                                imgMs.Close();
                                imgMs.Dispose();
                                return Dcraw_PathToStream(path, false);
                            }
                        }
                        return imgMs;
                    }
                } catch (Exception) {
                    Console.WriteLine("Magick RAW 失敗: " + path);
                }

                memoryStream.Close();
                memoryStream.Dispose();

                //如果無法使用 dcraw ，就改用MagickImage直接讀取
                using (MagickImage image = new MagickImage(path)) {
                    var imgMs = new MemoryStream(image.ToByteArray(MagickFormat.Bmp));
                    Console.WriteLine("Magick ok: " + path);
                    return imgMs;
                }

            } catch (Exception ee) {
                throw;
            }
        }


        #region Nconvert

        /// <summary>
        /// Nconvert 轉檔後取得檔案路徑
        /// </summary>
        /// <param name="path"></param>
        /// <param name="thumbnail"></param>
        /// <param name="isPng"></param>
        /// <returns></returns>
        public static string Nconvert_PathToPath(string path, bool thumbnail, bool isPng) {

            string hashName = FileToHash(path) + (isPng ? ".png" : ".bmp");//暫存檔案名稱
            string dirPath = Path.Combine(Path.GetTempPath(), "Tiefsee\\img");//暫存資料夾
            string filePath = Path.Combine(dirPath, hashName);//暫存檔案的路徑

            if (File.Exists(filePath)) {//如果檔案已經存在，就直接回傳
                return filePath;
            }

            if (Directory.Exists(dirPath) == false) {//如果暫存資料夾不存在就建立
                Directory.CreateDirectory(dirPath);
            }

            string argOut = "-out bmp";
            if (isPng) {
                argOut = "-clevel 0 -out png";//輸出成不壓縮的png
            }

            var thumb = thumbnail ? "-embedded_jpeg" : "";
            string arg = $"-quiet {thumb} -raw_camerabalance -raw_autobright -icc {argOut} -o \"{filePath}\" \"{path}\"";
            var d = RunNconvert(arg, 60 * 1000);

            //var ms = new MemoryStream(File.ReadAllBytes(temp));
            return filePath;
        }


        /// <summary>
        /// Nconvert 取得檔案資訊(exif
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public static string Nconvert_PathToInfo(string path) {
            string arg = $"-quiet -fullinfo \"{path}\"";
            var d = RunNconvert(arg, 60 * 1000);
            return d;
        }


        /// <summary>
        /// 執行 Nconvert.exe
        /// </summary>
        /// <param name="arg"></param>
        /// <param name="timeout"></param>
        /// <returns></returns>
        private static string RunNconvert(string arg, int timeout) {

            string NconvertExe = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "plugin\\NConvert\\nconvert.exe");

            using (var p = new Process()) {
                p.StartInfo.UseShellExecute = false;
                p.StartInfo.CreateNoWindow = true;
                p.StartInfo.RedirectStandardOutput = true;
                p.StartInfo.FileName = NconvertExe;
                p.StartInfo.Arguments = arg;
                p.Start();

                string result = p.StandardOutput.ReadToEnd();
                p.WaitForExit(timeout);

                return result;
            }
        }

        #endregion


        /// <summary>
        /// 以檔案的路徑跟大小來產生雜湊字串(用於暫存檔名)
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public static String FileToHash(String path) {
            var sha1 = new System.Security.Cryptography.SHA1CryptoServiceProvider();
            long fileSize = new FileInfo(path).Length;
            String s = Convert.ToBase64String(sha1.ComputeHash(Encoding.Default.GetBytes(fileSize + path)));
            return s.ToLower().Replace("\\", "").Replace("/", "").Replace("+", "").Replace("=", "");
        }

    }

}
