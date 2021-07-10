
interface cef_window {

    /**關閉視窗 */
    Close(): void;

    /**顯示或隱藏視窗 */
    Text: string;

    /**視窗 x坐標 */
    Left: number;

    /**視窗 y坐標 */
    Top: number;

    /**視窗寬度 */
    Width: number;

    /**視窗高度 */
    Height: number;

    /**顯示或隱藏視窗 */
    Visible: boolean;

    /**視窗狀態 */
    WindowState: ("Maximized" | "Minimized" | "Normal");

    /**視窗置頂 */
    TopMost: boolean;

    /**拖曳視窗 */
    WindowDrag(type: ('CT' | 'RC' | 'CB' | 'LC' | 'LT' | 'RT' | 'LB' | 'RB' | 'move')): void;

}

 //declare let cef_window: cef_window;