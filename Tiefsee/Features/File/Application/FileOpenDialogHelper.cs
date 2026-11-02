namespace Tiefsee;

/// <summary>
/// 封裝檔案選擇對話框
/// </summary>
public sealed class FileOpenDialogHelper {

    /// <summary>
    /// 開啟檔案選擇視窗
    /// </summary>
    public string[] OpenFileDialog(bool multiselect, string filter, string title) {
        using var openFileDialog = new OpenFileDialog();
        openFileDialog.Multiselect = multiselect;
        openFileDialog.Filter = filter;
        openFileDialog.Title = title;
        openFileDialog.RestoreDirectory = true;

        if (openFileDialog.ShowDialog() == DialogResult.OK) {
            return openFileDialog.FileNames;
        }

        return [];
    }

    /// <summary>開啟資料夾選擇視窗。</summary>
    public string SelectFolderDialog(string title) {
        using var dialog = new FolderBrowserDialog {
            Description = title,
            UseDescriptionForTitle = true,
            ShowNewFolderButton = false,
        };
        return dialog.ShowDialog() == DialogResult.OK ? dialog.SelectedPath : "";
    }
}
