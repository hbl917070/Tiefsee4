using System.Runtime.InteropServices;
using static Tiefsee.WindowAPI.PInvoke;
using static Tiefsee.WindowAPI.PInvoke.ParameterTypes;

namespace Tiefsee;

public class WindowAPI {

    /// <summary>
    /// 視窗拖曳
    /// </summary>
    public static void WindowDrag(IntPtr hwnd, ResizeDirection type) {

        /*if (_run== ResizeDirection.Move) { //拖曳視窗
            int WM_NCLBUTTONDOWN = 161; //  0xA1
            int HTCAPTION = 2;
            ReleaseCapture();
            SendMessage(hwnd, WM_NCLBUTTONDOWN, HTCAPTION, 0);
            return;
        }*/

        ReleaseCapture();
        SendMessage(hwnd, WM_SYSCOMMAND, (int)(type), 0);
    }

    #region 視窗拖曳

    public enum ResizeDirection {
        LC = 0xF001, // 左
        RC = 0xF002, // 右
        CT = 0xF003, // 上
        LT = 0xF004, // 左上
        RT = 0xF005, // 右上
        CB = 0xF006, // 下
        LB = 0xF007, // 左下
        RB = 0xF008, // 右下
        Move = 0xF009 // 移動
    }

    // 指定滑鼠到特定視窗
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern IntPtr SetCapture(IntPtr hWnd);

    // 釋放滑鼠
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern bool ReleaseCapture();

    // 拖曳視窗
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern bool SendMessage(IntPtr hwnd, int wMsg, int wParam, int lParam);
    public const int WM_SYSCOMMAND = 0x0112;
    public const int WM_LBUTTONUP = 0x202;

    #endregion

    /// <summary>
    /// win10 視窗效果
    /// </summary>
    /// <param name="type"> acrylic | aero </param>
    public static void WindowStyleForWin10(IntPtr hwnd, string type) {

        type = type.ToLower();

        var accent = new AccentPolicy();

        if (type == "acrylic") {
            accent.AccentState = AccentState.ACCENT_ENABLE_ACRYLICBLURBEHIND;
            accent.GradientColor = (_blurOpacity << 24) | (_blurBackgroundColor & 0xFFFFFF);
        }
        else if (type == "aero") {
            if (StartWindow.isWin11) { return; }
            accent.AccentState = AccentState.ACCENT_ENABLE_BLURBEHIND;
        }
        else {
            return;
        }

        var accentStructSize = Marshal.SizeOf(accent);

        var accentPtr = Marshal.AllocHGlobal(accentStructSize);
        Marshal.StructureToPtr(accent, accentPtr, false);

        var data = new WindowCompositionAttributeData();
        data.Attribute = WindowCompositionAttribute.WCA_ACCENT_POLICY;
        data.SizeOfData = accentStructSize;
        data.Data = accentPtr;

        SetWindowCompositionAttribute(hwnd, ref data);

        Marshal.FreeHGlobal(accentPtr);
    }

    /// <summary>
    /// win11 視窗效果 
    /// </summary>
    public static void WindowStyleForWin11(IntPtr hwnd, SystemBackdropType type) {
        if (StartWindow.isWin11 == false) { return; }
        SetWindowAttribute(hwnd, DWMWINDOWATTRIBUTE.DWMWA_SYSTEMBACKDROP_TYPE, (int)type);
    }

    /// <summary>
    /// win11 暗黑模式
    /// </summary>
    public static void WindowThemeForWin11(IntPtr hwnd, ImmersiveDarkMode type) {
        if (StartWindow.isWin11 == false) { return; }
        SetWindowAttribute(hwnd, DWMWINDOWATTRIBUTE.DWMWA_USE_IMMERSIVE_DARK_MODE, (int)type);
    }

    #region 視窗效果

    [DllImport("user32.dll")]
    internal static extern int SetWindowCompositionAttribute(IntPtr hwnd, ref WindowCompositionAttributeData data);

    [StructLayout(LayoutKind.Sequential)]
    internal struct WindowCompositionAttributeData {
        public WindowCompositionAttribute Attribute;
        public IntPtr Data;
        public int SizeOfData;
    }

    internal enum WindowCompositionAttribute {
        WCA_ACCENT_POLICY = 19
    }

    internal enum AccentState {
        ACCENT_DISABLED = 0,
        ACCENT_ENABLE_GRADIENT = 1,
        ACCENT_ENABLE_TRANSPARENTGRADIENT = 2,
        ACCENT_ENABLE_BLURBEHIND = 3,
        ACCENT_ENABLE_ACRYLICBLURBEHIND = 4,
        ACCENT_INVALID_STATE = 5
    }

    [StructLayout(LayoutKind.Sequential)]
    internal struct AccentPolicy {
        public AccentState AccentState;
        public uint AccentFlags;
        public uint GradientColor;
        public uint AnimationId;
    }

    private static uint _blurOpacity = 0;
    private static uint _blurBackgroundColor = 0x010101; /* BGR color format */

    /// <summary>
    /// 視窗效果類型
    /// </summary>
    public enum SystemBackdropType {
        None = 1,
        Acrylic = 3,
        Mica = 2,
        MicaAlt = 4,
    }

    /// <summary>
    /// 啟用或停用 win11 暗黑模式
    /// </summary>
    public enum ImmersiveDarkMode {
        Disabled = 0,
        Enabled = 1
    }

    [DllImport("dwmapi.dll")]
    private static extern int DwmExtendFrameIntoClientArea(IntPtr hWnd, ref MARGINS margins);

    [DllImport("dwmapi.dll")]
    static extern int DwmSetWindowAttribute(IntPtr hwnd, ParameterTypes.DWMWINDOWATTRIBUTE dwAttribute, ref int pvAttribute, int cbAttribute);

    public static int ExtendFrame(IntPtr hwnd, ParameterTypes.MARGINS margins)
        => DwmExtendFrameIntoClientArea(hwnd, ref margins);

    public static int SetWindowAttribute(IntPtr hwnd, ParameterTypes.DWMWINDOWATTRIBUTE attribute, int parameter)
        => DwmSetWindowAttribute(hwnd, attribute, ref parameter, Marshal.SizeOf<int>());

    public class PInvoke {
        public class ParameterTypes {
            [Flags]
            public enum DWMWINDOWATTRIBUTE {
                DWMWA_WINDOW_CORNER_PREFERENCE = 33,

                DWMWA_USE_IMMERSIVE_DARK_MODE = 20,
                DWMWA_SYSTEMBACKDROP_TYPE = 38
            }

            [StructLayout(LayoutKind.Sequential)]
            public struct MARGINS {
                public int cxLeftWidth;
                public int cxRightWidth;
                public int cyTopHeight;
                public int cyBottomHeight;
            }
        }

        public class Methods {
            [DllImport("dwmapi.dll")]
            public static extern int DwmExtendFrameIntoClientArea(IntPtr hwnd, ref ParameterTypes.MARGINS pMarInset);

            [DllImport("dwmapi.dll")]
            public static extern int DwmSetWindowAttribute(IntPtr hwnd, ParameterTypes.DWMWINDOWATTRIBUTE dwAttribute, ref int pvAttribute, int cbAttribute);

            public static int ExtendFrame(IntPtr hwnd, ParameterTypes.MARGINS margins) {
                return DwmExtendFrameIntoClientArea(hwnd, ref margins);
            }

            public static int SetWindowAttribute(IntPtr hwnd, ParameterTypes.DWMWINDOWATTRIBUTE attribute, int parameter) {
                return DwmSetWindowAttribute(hwnd, attribute, ref parameter, Marshal.SizeOf<int>());
            }
        }
    }

    #endregion

    /// <summary>
    /// win11 視窗圓角
    /// </summary>
    public static string WindowRoundedCorners(IntPtr hwnd, bool enable) {
        try {
            var attribute = DWMWINDOWATTRIBUTE.DWMWA_WINDOW_CORNER_PREFERENCE;
            DWM_WINDOW_CORNER_PREFERENCE preference;
            if (enable) {
                preference = DWM_WINDOW_CORNER_PREFERENCE.DWMWCP_ROUND;
            }
            else {
                preference = DWM_WINDOW_CORNER_PREFERENCE.DWMWCP_DEFAULT;
            }
            DwmSetWindowAttribute(hwnd, attribute, ref preference, sizeof(uint));
        }
        catch (Exception e) {
            return e.ToString();
        }
        return "";
    }

    #region win11 視窗圓角

    // The DWM_WINDOW_CORNER_PREFERENCE enum for DwmSetWindowAttribute's third parameter, which tells the function
    // what value of the enum to set.
    // Copied from dwmapi.h
    public enum DWM_WINDOW_CORNER_PREFERENCE {
        DWMWCP_DEFAULT = 0,
        DWMWCP_DONOTROUND = 1,
        DWMWCP_ROUND = 2,
        DWMWCP_ROUNDSMALL = 3
    }

    // Import dwmapi.dll and define DwmSetWindowAttribute in C# corresponding to the native function.
    [DllImport("dwmapi.dll", CharSet = CharSet.Unicode, PreserveSig = false)]
    internal static extern void DwmSetWindowAttribute(IntPtr hwnd,
        DWMWINDOWATTRIBUTE attribute,
        ref DWM_WINDOW_CORNER_PREFERENCE pvAttribute,
        uint cbAttribute);
    #endregion


    #region 視窗取得焦點

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

    #endregion

    #region 任務欄

    [StructLayout(LayoutKind.Sequential)]
    public struct APPBARDATA {
        public int cbSize;
        public IntPtr hWnd;
        public uint uCallbackMessage;
        public uint uEdge;
        public RECT rc;
        public int lParam;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT {
        public int left;
        public int top;
        public int right;
        public int bottom;
    }

    [DllImport("shell32.dll", SetLastError = true)]
    public static extern uint SHAppBarMessage(uint dwMessage, ref APPBARDATA pData);

    // ABM_GETSTATE 用來檢查任務欄狀態的訊息
    public const uint ABM_GETSTATE = 0x00000004;


    public const uint ABM_GETTASKBARPOS = 0x00000005;

    // 設定任務欄的狀態，當值為 ABS_AUTOHIDE 時，表示啟用了自動隱藏
    public const int ABS_AUTOHIDE = 0x1;

    // APPBARDATA edge 可能的值
    public const uint ABE_LEFT = 0;
    public const uint ABE_TOP = 1;
    public const uint ABE_RIGHT = 2;
    public const uint ABE_BOTTOM = 3;

    #endregion

    /// <summary>
    /// 描述視窗的位置和大小的結構體
    /// </summary>
    [StructLayout(LayoutKind.Sequential)]
    public struct WINDOWPOS {
        public IntPtr hwnd;
        public IntPtr hwndInsertAfter;
        public int x;
        public int y;
        public int cx;
        public int cy;
        public uint flags;
    }
}
