namespace Tiefsee;

/// <summary>
/// 封裝檔案選擇對話框
/// </summary>
public sealed class FileOpenDialogService {

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
}
