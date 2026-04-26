using System.Runtime.InteropServices;
using static Tiefsee.WindowStyle.PInvoke;
using static Tiefsee.WindowStyle.PInvoke.ParameterTypes;

namespace Tiefsee;

/// <summary>
/// 視窗效果
/// </summary>
public class WindowStyle {

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

}
