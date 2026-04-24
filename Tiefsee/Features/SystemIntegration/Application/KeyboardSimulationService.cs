using System.Runtime.InteropServices;

namespace Tiefsee;

/// <summary>
/// 封裝鍵盤模擬操作
/// </summary>
public sealed class KeyboardSimulationService {

    private const int KEYEVENTF_KEYUP = 2;

    /// <summary>
    /// 模擬 Ctrl 加指定按鍵
    /// </summary>
    public void SendCtrlAnd(string key) {
        try {
            key = key.ToUpper();

            var k = Keys.A;
            if (key == "A") { k = Keys.A; }
            if (key == "Z") { k = Keys.Z; }
            if (key == "X") { k = Keys.X; }
            if (key == "C") { k = Keys.C; }
            if (key == "V") { k = Keys.V; }
            if (key == "F") { k = Keys.F; }

            keybd_event(Keys.ControlKey, 0, 0, 0);
            keybd_event(k, 0, 0, 0);
            keybd_event(Keys.ControlKey, 0, KEYEVENTF_KEYUP, 0);
        }
        catch (Exception e) {
            Console.WriteLine("模擬鍵盤失敗");
            Console.WriteLine(e.ToString());
        }
    }

    /// <summary>
    /// 傳送 SendKeys 字串
    /// </summary>
    public void Send(string keys) {
        try {
            SendKeys.Send(keys);
        }
        catch (Exception e) {
            Console.WriteLine("模擬鍵盤失敗");
            Console.WriteLine(e.ToString());
        }
    }

    /// <summary>
    /// 呼叫 Win32 鍵盤事件
    /// </summary>
    [DllImport("user32.dll", EntryPoint = "keybd_event", SetLastError = true)]
    private static extern void keybd_event(Keys bVk, byte bScan, uint dwFlags, uint dwExtraInfo);
}
