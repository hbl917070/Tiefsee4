using System.IO;

namespace Tiefsee;

/// <summary>
/// 封裝拖曳檔案到外部程式的行為
/// </summary>
public sealed class FileDragDropHelper {

    private readonly ImageProcessingService _imageProcessingService = Program.services.ImageProcessing;

    /// <summary>
    /// 觸發檔案拖曳
    /// </summary>
    public void DragDropFile(WebWindow window, string path) {
        bool isDir = Directory.Exists(path);
        bool isFile = File.Exists(path);

        if (isDir == false && isFile == false) { return; }

        try {
            if (isFile && path == Path.GetFullPath(path)) {
                var dataObject = DataObjectUtilities.GetFileDataObject(path);
                int size = 92;
                try {
                    using Bitmap bitmap = _imageProcessingService.GetFileIcon(path, size);
                    if (bitmap != null) DataObjectUtilities.AddPreviewImage(dataObject, bitmap);
                }
                catch { /* 無法取得預覽圖時仍可拖曳檔案。 */ }
                window.DoDragDrop(dataObject, DragDropEffects.All);
                return;
            }

            string[] files = [path];
            var file = new System.Windows.Forms.DataObject(System.Windows.Forms.DataFormats.FileDrop, files);
            window.DoDragDrop(file, DragDropEffects.All);
        }
        catch { }
    }
}
