using System.ComponentModel;
using System.Drawing.Drawing2D;
using System.Runtime.InteropServices;

namespace Tiefsee {

    //
    // https://github.com/RJCodeAdvance/Dropdown-Menu-CSharp-WinForms
    //

    /// <summary>
    /// 自定義樣式的 winfrom 選單
    /// </summary>
    public class RJDropdownMenu : ContextMenuStrip {
        // Fields
        private bool isMainMenu;
        private int menuItemHeight = 25;
        private Color menuItemTextColor = Color.Empty; // No color, The default color is set in the MenuRenderer class
        private Color primaryColor = Color.Empty; // No color, The default color is set in the MenuRenderer class

        private Bitmap menuItemHeaderSize;

        // Constructor
        public RJDropdownMenu(IContainer container)
            : base(container) {
        }

        public RJDropdownMenu() { }
        // Properties
        // Optionally, hide the properties in the toolbox to avoid the problem of displaying and/or 
        // saving control property changes in the designer at design time in Visual Studio.
        // If the problem I mention does not occur you can expose the properties and manipulate them from the toolbox.
        [Browsable(false)]
        public bool IsMainMenu {
            get { return isMainMenu; }
            set { isMainMenu = value; }
        }

        [Browsable(false)]
        public int MenuItemHeight {
            get { return menuItemHeight; }
            set { menuItemHeight = value; }
        }

        [Browsable(false)]
        public Color MenuItemTextColor {
            get { return menuItemTextColor; }
            set { menuItemTextColor = value; }
        }

        [Browsable(false)]
        public Color PrimaryColor {
            get { return primaryColor; }
            set { primaryColor = value; }
        }

        // Private methods
        private void LoadMenuItemHeight() {
            if (isMainMenu)
                menuItemHeaderSize = new Bitmap(20, 25);
            else menuItemHeaderSize = new Bitmap(20, menuItemHeight);

            foreach (ToolStripMenuItem menuItemL1 in this.Items) {
                menuItemL1.ImageScaling = ToolStripItemImageScaling.None;
                if (menuItemL1.Image == null) menuItemL1.Image = menuItemHeaderSize;

                foreach (ToolStripMenuItem menuItemL2 in menuItemL1.DropDownItems) {
                    menuItemL2.ImageScaling = ToolStripItemImageScaling.None;
                    if (menuItemL2.Image == null) menuItemL2.Image = menuItemHeaderSize;

                    foreach (ToolStripMenuItem menuItemL3 in menuItemL2.DropDownItems) {
                        menuItemL3.ImageScaling = ToolStripItemImageScaling.None;
                        if (menuItemL3.Image == null) menuItemL3.Image = menuItemHeaderSize;

                        foreach (ToolStripMenuItem menuItemL4 in menuItemL3.DropDownItems) {
                            menuItemL4.ImageScaling = ToolStripItemImageScaling.None;
                            if (menuItemL4.Image == null) menuItemL4.Image = menuItemHeaderSize;
                            // Level 5++
                        }
                    }
                }
            }
        }

        // Overrides
        protected override void OnHandleCreated(EventArgs e) {
            base.OnHandleCreated(e);
            if (this.DesignMode == false) {
                this.Renderer = new MenuRenderer(isMainMenu, primaryColor, menuItemTextColor);
                LoadMenuItemHeight();
            }

            //-----------

            // 下面為 修復開啟選單後，選單會自己關閉

            // 顯示選單後，讓選單取得焦點
            VisibleChanged += (sender, e) => {
                if (Visible) {
                    Adapter.DelayRun(1, () => {
                        Focus();
                    });
                }
            };

            // 不在工作列顯示
            SetWindowLong(Handle, GWL_EXSTYLE, (GetWindowLong(Handle, GWL_EXSTYLE) | WS_EX_TOOLWINDOW) & ~WS_EX_APPWINDOW);
        }


        [DllImport("user32.dll", SetLastError = true)]
        static extern int GetWindowLong(IntPtr hWnd, int nIndex);

        [DllImport("user32.dll")]
        static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

        private const int GWL_EXSTYLE = -20;
        private const int WS_EX_APPWINDOW = 0x00040000, WS_EX_TOOLWINDOW = 0x00000080;

    }

    public class MenuColorTable : ProfessionalColorTable {
        // Fields
        private Color backColor;
        private Color leftColumnColor;
        private Color borderColor;
        private Color menuItemBorderColor;
        private Color menuItemSelectedColor;
        // Constructor
        public MenuColorTable(bool isMainMenu, Color primaryColor) {
            if (isMainMenu) {
                backColor = Color.FromArgb(43, 43, 43);
                leftColumnColor = Color.FromArgb(43, 43, 43);
                borderColor = Color.FromArgb(100, 100, 100);
                menuItemBorderColor = primaryColor;
                menuItemSelectedColor = primaryColor;
            } else {
                backColor = Color.White;
                leftColumnColor = Color.LightGray;
                borderColor = Color.LightGray;
                menuItemBorderColor = primaryColor;
                menuItemSelectedColor = primaryColor;
            }
        }
        // Overrides
        public override Color ToolStripDropDownBackground { get { return backColor; } }
        public override Color MenuBorder { get { return borderColor; } }
        public override Color MenuItemBorder { get { return menuItemBorderColor; } }
        public override Color MenuItemSelected { get { return menuItemSelectedColor; } }
        public override Color MenuItemSelectedGradientBegin { get { return menuItemSelectedColor; } }
        public override Color MenuItemSelectedGradientEnd { get { return menuItemSelectedColor; } }
        public override Color ImageMarginGradientBegin { get { return leftColumnColor; } }
        public override Color ImageMarginGradientMiddle { get { return leftColumnColor; } }
        public override Color ImageMarginGradientEnd { get { return leftColumnColor; } }

    }

    public class MenuRenderer : ToolStripProfessionalRenderer {
        // Fields
        private Color primaryColor;
        private Color textColor;
        private int arrowThickness;
        // Constructor
        public MenuRenderer(bool isMainMenu, Color primaryColor, Color textColor)
            : base(new MenuColorTable(isMainMenu, primaryColor)) {
            this.primaryColor = primaryColor;
            if (isMainMenu) {
                arrowThickness = 3;
                if (textColor == Color.Empty) // Set Default Color
                    this.textColor = Color.Gainsboro;
                else // Set custom text color 
                    this.textColor = textColor;
            } else {
                arrowThickness = 2;
                if (textColor == Color.Empty) // Set Default Color
                    this.textColor = Color.DimGray;
                else // Set custom text color
                    this.textColor = textColor;
            }
        }
        // Overrides
        protected override void OnRenderItemText(ToolStripItemTextRenderEventArgs e) {
            base.OnRenderItemText(e);
            e.Item.ForeColor = e.Item.Selected ? Color.White : textColor;
        }
        protected override void OnRenderArrow(ToolStripArrowRenderEventArgs e) {
            // Fields
            var graph = e.Graphics;
            var arrowSize = new Size(5, 12);
            var arrowColor = e.Item.Selected ? Color.White : primaryColor;
            var rect = new Rectangle(e.ArrowRectangle.Location.X, (e.ArrowRectangle.Height - arrowSize.Height) / 2,
                arrowSize.Width, arrowSize.Height);
            using (GraphicsPath path = new GraphicsPath())
            using (Pen pen = new Pen(arrowColor, arrowThickness)) {
                // Drawing
                graph.SmoothingMode = SmoothingMode.AntiAlias;
                path.AddLine(rect.Left, rect.Top, rect.Right, rect.Top + rect.Height / 2);
                path.AddLine(rect.Right, rect.Top + rect.Height / 2, rect.Left, rect.Top + rect.Height);
                graph.DrawPath(pen, path);
            }
        }
    }

}
