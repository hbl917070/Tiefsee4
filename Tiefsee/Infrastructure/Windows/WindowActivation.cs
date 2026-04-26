using System.Runtime.InteropServices;

namespace Tiefsee;

/// <summary>
/// 視窗取得焦點
/// </summary>
public class WindowActivation {

    [DllImport("User32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    public static extern bool SwitchToThisWindow(IntPtr hWnd, Boolean fAltTab);

    // -------------

    // https://stackoverflow.com/questions/257587/bring-a-window-to-the-front-in-wpf

    /// <summary>
    /// Activate a window from anywhere by attaching to the foreground window
    /// </summary>
    public static void GlobalActivate(IntPtr interopHelper) {
        //Get the process ID for this window's thread
        //var interopHelper = new WindowInteropHelper(w);
        UInt32 thisWindowThreadId = GetWindowThreadProcessId(interopHelper, IntPtr.Zero);

        //Get the process ID for the foreground window's thread
        var currentForegroundWindow = GetForegroundWindow();
        var currentForegroundWindowThreadId = GetWindowThreadProcessId(currentForegroundWindow, IntPtr.Zero);

        //Attach this window's thread to the current window's thread
        AttachThreadInput(currentForegroundWindowThreadId, thisWindowThreadId, true);
    }

    [DllImport("user32.dll")]
    private static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    private static extern uint GetWindowThreadProcessId(IntPtr hWnd, IntPtr ProcessId);

    [DllImport("user32.dll")]
    private static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);

}
