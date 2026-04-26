using System.Runtime.InteropServices;

namespace Tiefsee;

/// <summary>
/// 視窗拖曳
/// </summary>
public class WindowDrag {

    /// <summary>
    /// 開始視窗拖曳
    /// </summary>
    public static void Start(IntPtr hwnd, ResizeDirection type) {

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

    #region Windows API

    /// <summary>
    /// 視窗拖曳類型
    /// </summary>
    public enum ResizeDirection {
        /// <summary> 左 </summary>
        LC = 0xF001,
        /// <summary> 右 </summary>
        RC = 0xF002,
        /// <summary> 上 </summary>
        CT = 0xF003,
        /// <summary> 左上 </summary>
        LT = 0xF004,
        /// <summary> 右上 </summary>
        RT = 0xF005,
        /// <summary> 下 </summary>
        CB = 0xF006,
        /// <summary> 左下 </summary>
        LB = 0xF007,
        /// <summary> 右下 </summary>
        RB = 0xF008,
        /// <summary> 移動 </summary>
        Move = 0xF009
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
}
