
interface WV_Window {

    /**關閉視窗 */
    Close(): void;

    /** 標題 */
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

    WindowDragUp();
    WindowDragDown(type: ('CT' | 'RC' | 'CB' | 'LC' | 'LT' | 'RT' | 'LB' | 'RB' | 'move'));

    WindowDrag_touchStart();
    WindowDrag_touchMove();
    WindowDrag_touchEnd();
    GetMousePoint();
}



interface WV_Directory {

    /** 回傳資料夾裡面的檔案 */
    GetFiles(path: string, searchPattern: string): [];

    /** 判斷指定路徑是否參考磁碟上的現有目錄 */
    Exists(path: string): bool;

    /** 擷取指定路徑的父目錄 */
    GetParent(path: string);

    /** 刪除資料夾(包含子目錄與檔案) */
    Delete(path: string);

    /** 移動檔案或目錄和其內容到新位置 */
    Move(sourceDirName: string, destDirName: string);

    /** 取得資料夾的建立時間 */
    GetCreationTimeUtc(path: string): number;
}


interface WV_File {

    /** 快速拖曳(拖出檔案) */
    DragDropFile(psth: string);

    /** 取得文字資料 */
    GetText(psth: string): string;

    /** 儲存文字資料 */
    SetText(psth: string, txt: string);

    /** new FileInfo */
    GetFileInfo(path: string): WV_FileInfo;

    /** 判斷指定的檔案是否存在 */
    Exists(path: string): bool;

    /** 刪除檔案 */
    Delete(path: string);

    /** 移動檔案到新位置 */
    Move(sourceDirName: string, destDirName: string);

    /** 取得檔案的建立時間 */
    GetCreationTimeUtc(path: string): number;

}


interface WV_FileInfo {

    /** 取得表示目錄完整路徑的字串 */
    DirectoryName: string;

    /** 取得目前檔案的大小，以位元組為單位 */
    Length: number;

    /** 取得檔案的名稱 */
    Name: string;

    /** 取得或設定值，判斷目前檔案是否為唯讀 */
    IsReadOnly: bool;

    /** 取得值，這個值指出檔案是否存在 */
    Exists: bool;

    /** 移動指定的檔案至新的位置，提供指定新檔名的選項 */
    MoveTo(destFileName: string);
}

interface WV_Path {

    /** 變更路徑字串的副檔名 */
    ChangeExtension(path: string);

    /** 串接路徑 */
    Combine(path: string[]): string;

    /** 取得資料夾路徑 */
    GetDirectoryName(path: string): string;

    /** 取得 副檔名。例如「.jpg」*/
    GetExtension(path: string): string;

    /** 取得 檔名+副檔名，例如「aa.jpg」 */
    GetFileName(path: string): string;

    /** 取得 檔名(沒有副檔名 */
    GetFileNameWithoutExtension(path: string): string;

    /** 取得 絕對路徑 */
    GetFullPath(path: string): string;

    /** 取得陣列，該陣列包含檔案名稱中不允許的字元 */
    GetInvalidFileNameChars(): string[];

    /** 取得陣列，該陣列包含路徑名稱中不允許的字元 */
    GetInvalidPathChars(): string[];

    /** 取得根目錄資訊的路徑。例如「C:\」 */
    GetPathRoot(path: string): string;

    /** 傳回隨機資料夾名稱或檔案名稱。例如「5wq4eeek.jls」 */
    GetRandomFileName(): string;

    /** 在磁碟上建立具名之零位元組的唯一暫存檔案，然後傳回該檔案的完整路徑 */
    GetTempFileName(): string;

    /** 傳回目前使用者的暫存資料夾的路徑 */
    GetTempPath(): string;

    /** 判斷路徑是否包括副檔名 */
    HasExtension(path: string): bool;

    /** 取得值，該值指出指定的路徑字串是否包含根目錄 */
    IsPathRooted(path: string): bool;
}

 //declare let cef_window: cef_window;
