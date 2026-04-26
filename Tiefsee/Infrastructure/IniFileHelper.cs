using System.Runtime.InteropServices;
using System.Text;

namespace Tiefsee;

/// <summary>
/// 存取 ini 檔
/// </summary>
public class IniFileHelper {
    private string filePath;
    private StringBuilder lpReturnedString;
    private int bufferSize;

    [DllImport("kernel32")]
    private static extern long WritePrivateProfileString(string section, string key, string lpString, string lpFileName);

    [DllImport("kernel32")]
    private static extern int GetPrivateProfileString(string section, string key, string lpDefault, StringBuilder lpReturnedString, int nSize, string lpFileName);

    public IniFileHelper(string iniPath) {
        filePath = iniPath;
        bufferSize = 512;
        lpReturnedString = new StringBuilder(bufferSize);
    }

    /// <summary>
    /// 依據 section 與 key 讀取 ini 內容
    /// </summary>
    public string ReadIniFile(string section, string key, string defaultValue) {
        lpReturnedString.Clear();
        GetPrivateProfileString(section, key, defaultValue, lpReturnedString, bufferSize, filePath);
        return lpReturnedString.ToString();
    }

    /// <summary>
    /// 依據 section 與 key 寫入 ini 內容
    /// </summary>
    public void WriteIniFile(string section, string key, Object value) {
        WritePrivateProfileString(section, key, value.ToString(), filePath);
    }
}
