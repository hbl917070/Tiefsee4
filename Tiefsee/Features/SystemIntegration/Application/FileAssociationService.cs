using Microsoft.Win32;
using System.IO;
using System.Runtime.InteropServices;

namespace Tiefsee;

/// <summary>
/// 封裝副檔名關聯設定
/// </summary>
public sealed class FileAssociationService {

    /// <summary>
    /// 建立副檔名關聯
    /// </summary>
    public void AssociationExtension(object[] arExtension, string appPath) {
        if (File.Exists(appPath) == false) { return; }

        string appName = Path.GetFileName(appPath);
        for (int i = 0; i < arExtension.Length; i++) {
            string extension = arExtension[i].ToString();
            AssociationExtensionCore(extension, appPath, appName);
        }
    }

    /// <summary>
    /// 解除副檔名關聯
    /// </summary>
    public void RemoveAssociationExtension(object[] arExtension, string appPath) {
        if (File.Exists(appPath) == false) { return; }

        string appName = Path.GetFileName(appPath);

        for (int i = 0; i < arExtension.Length; i++) {
            string extension = arExtension[i].ToString();

            using (RegistryKey userClasses = RegistryKey.OpenBaseKey(RegistryHive.CurrentUser, RegistryView.Default).OpenSubKey("SOFTWARE\\Classes\\", true)) {
                userClasses.DeleteSubKeyTree("." + extension, false);
                userClasses.DeleteSubKeyTree(extension + "_auto_file", false);
                userClasses.DeleteSubKeyTree("Applications\\" + appName, false);
            }

            using (RegistryKey userExplorer = Registry.CurrentUser.OpenSubKey("Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\." + extension, true)) {
                if (userExplorer == null) {
                    continue;
                }

                userExplorer.DeleteSubKey("OpenWithList", false);
                userExplorer.DeleteSubKey("OpenWithProgids", false);
                userExplorer.DeleteSubKey("UserChoice", false);
                userExplorer.Close();
                Registry.CurrentUser.DeleteSubKey("." + extension, false);
            }
        }

        SHChangeNotify(0x08000000, 0x0000, IntPtr.Zero, IntPtr.Zero);
    }

    /// <summary>
    /// 建立單一副檔名關聯
    /// </summary>
    private void AssociationExtensionCore(string extension, string openWith, string executableName) {
        try {
            using (RegistryKey userClasses = Registry.CurrentUser.OpenSubKey("SOFTWARE\\Classes\\", true))
            using (RegistryKey userExt = userClasses.CreateSubKey("." + extension))
            using (RegistryKey userAutoFile = userClasses.CreateSubKey(extension + "_auto_file"))
            using (RegistryKey userAutoFileCommand = userAutoFile.CreateSubKey("shell").CreateSubKey("open").CreateSubKey("command"))
            using (RegistryKey applicationAssociationToasts = Registry.CurrentUser.OpenSubKey("Software\\Microsoft\\Windows\\CurrentVersion\\ApplicationAssociationToasts\\", true))
            using (RegistryKey userClassesApplications = userClasses.CreateSubKey("Applications"))
            using (RegistryKey userClassesApplicationsExe = userClassesApplications.CreateSubKey(executableName))
            using (RegistryKey userApplicationCommand = userClassesApplicationsExe.CreateSubKey("shell").CreateSubKey("open").CreateSubKey("command"))
            using (RegistryKey userExplorer = Registry.CurrentUser.CreateSubKey("Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\." + extension))
            using (RegistryKey userChoice = userExplorer.OpenSubKey("UserChoice")) {
                userExt.SetValue("", extension + "_auto_file", RegistryValueKind.String);
                userClasses.SetValue("", extension + "_auto_file", RegistryValueKind.String);
                userClasses.CreateSubKey(extension + "_auto_file");
                userAutoFileCommand.SetValue("", "\"" + openWith + "\"" + " \"%1\"");
                applicationAssociationToasts.SetValue(extension + "_auto_file_." + extension, 0);
                applicationAssociationToasts.SetValue(@"Applications\" + executableName + "_." + extension, 0);
                userApplicationCommand.SetValue("", "\"" + openWith + "\"" + " \"%1\"");
                userExplorer.CreateSubKey("OpenWithList").SetValue("a", executableName);
                userExplorer.CreateSubKey("OpenWithProgids").SetValue(extension + "_auto_file", "0");
                if (userChoice != null) {
                    userExplorer.DeleteSubKey("UserChoice");
                }
                userExplorer.CreateSubKey("UserChoice").SetValue("ProgId", @"Applications\" + executableName);
            }

            SHChangeNotify(0x08000000, 0x0000, IntPtr.Zero, IntPtr.Zero);
        }
        catch { }
    }

    /// <summary>
    /// 通知系統重新整理副檔名關聯
    /// </summary>
    [DllImport("shell32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern void SHChangeNotify(uint wEventId, uint uFlags, IntPtr dwItem1, IntPtr dwItem2);
}
