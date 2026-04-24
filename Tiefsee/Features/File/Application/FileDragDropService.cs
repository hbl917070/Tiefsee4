using System.IO;

namespace Tiefsee;

/// <summary>
/// 封裝拖曳檔案到外部程式的行為
/// </summary>
public sealed class FileDragDropService {

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
                using Bitmap bitmap = ImgLib.GetFileIcon(path, size);
                if (bitmap == null) {
                    throw new Exception("bitmap == null");
                }
                DataObjectUtilities.AddPreviewImage(dataObject, bitmap);
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
