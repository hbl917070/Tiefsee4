interface WebWindow {
    /** 運行js */
    RunJs(js: string): string;

    Show(): void;
    Focus(): void;

    StartPosition: number;

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

    /**關閉視窗 */
    Close(): void;

    /** 視窗狀態。 0=視窗化 1=最小化 2=最大化 */
    WindowState: (0 | 1 | 2);
}

interface WV_Window {

    /**
     * 新開視窗
     * @param url 完整網址
     * @param args 命令列參數
     */
    NewWindow(url: string, args: string[]): WebWindow;

    /** 傳入 webWindow，將其設為目前視窗的子視窗*/
    SetOwner(webwindow: WebWindow);

    /** 在父親視窗運行js */
    RunJsOfParent(js: string): string;

    /** 設定視窗最小size */
    SetMinimumSize(width: number, height: number):void;

    /** 取得執行檔目錄 */
    GetAppDirPath(): string;

    /** 取得執行檔路徑 */
    GetAppPath(): string;

    /** 取得命令列參數 */
    GetArguments(): string[];

    /**關閉視窗 */
    Close(): void;

    /** 設定視窗的 icon */
    SetIcon(psth: string);

    This: WebWindow;

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


}



interface WV_Directory {

    /**
     * 檔名陣列 轉 路徑陣列 (用於載入複數檔案
     * @param dirPath 資料夾路徑
     * @param arName 檔名陣列
     */
    GetFiles2(dirPath: string, arName: string[] = []): string[];

    /** 回傳資料夾裡面的檔案 */
    GetFiles(path: string, searchPattern: string): string[];

    /** 判斷指定路徑是否參考磁碟上的現有目錄 */
    Exists(path: string): bool;

    /** 新建目錄 */
    CreateDirectory(path: string): void;

    /** 擷取指定路徑的父目錄 */
    GetParent(path: string);

    /** 刪除資料夾(包含子目錄與檔案) */
    Delete(path: string);

    /** 移動檔案或目錄和其內容到新位置 */
    Move(sourceDirName: string, destDirName: string);

    /** 取得資料夾的建立時間 */
    GetCreationTimeUtc(path: string): number;

    /** 傳回指定檔案或目錄上次被寫入的日期和時間 */
    GetLastWriteTimeUtc(path: string): number;
}


interface WV_File {

    /** 在檔案總管顯示檔案 */
    ShowOnExplorer(path: string): void;

    /** 取得 Type、Lenght、CreationTimeUtc、LastWriteTimeUtc、HexValue */
    GetFileInfo2(path: string): string;

    /**
     *  開啟 選擇檔案 的視窗
     * @param Multiselect 是否允許多選，false表示單選 
     * @param Filter 檔案類型。 abc(*.png)|*.png|All files (*.*)|*.*
     * @param Title 視窗標題
     */
    OpenFileDialog(Multiselect: boolean, Filter: string, Title: string): string[];

    /** 取得檔案的開頭byte，用於判斷檔案類型 */
    GetFIleType(path: string): string;

    /**
     * 顯示檔案原生右鍵選單
     * @param path 檔案路徑
     * @param followMouse true=顯示於游標旁邊、false=顯示於視窗左上角
     */
    ShowContextMenu(path: string, followMouse: boolean): void;

    /** 列印文件 */
    PrintFile(path: string): void;

    /** 快速拖曳(拖出檔案) */
    DragDropFile(path: string);

    /** 取得文字資料 */
    GetText(path: string): string;

    /** 儲存文字資料 */
    SetText(path: string, txt: string);

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

    /** 傳回指定檔案或目錄上次被寫入的日期和時間 */
    GetLastWriteTimeUtc(path: string): number;
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

interface FileInfo2 {
    /** file=檔案、dir=資料夾、none=檔案不存在 */
    Type: ("file" | "dir" | "none"),

    /** 檔案路徑 */
    Path:string;

    /** 檔案大小 */
    Lenght: number,

    /** 建立時間 */
    CreationTimeUtc: number,

    /** 修改時間 */
    LastWriteTimeUtc: number,
    
    /** 讀取前50個byte，用於辨識檔案類型 */
    HexValue: string
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


interface WV_System {

    SetClipboard_FileToPng(path: string): bool;

    SetClipboard_FileToTxt(path: string): bool;

    SetClipboard_FileToBase64(path: string): bool;

    SetClipboard_FileToImg(path: string): bool;

    SetClipboard_File(path: string): bool;

    /** 存入剪貼簿 */
    SetClipboard_Txt(txt: string): bool;

    /** 取得作業系統所在的槽，例如 「C:\」 */
    GetSystemRoot(): string;

    /** 取得滑鼠的坐標 */
    GetMousePosition(): number[];

    /** 設定桌布 */
    SetWallpaper(path: string): void;

    /** 是否為win10 */
    IsWindows10(): boolean;

    /** 是否為win7 */
    IsWindows10(): boolean;

    /**
     * lnk 轉 exe路徑
     * @param path lnk捷徑
     */
    LnkToExePath(path: string): string;

    /** 回傳程式目前記憶體使用量（MB */
    GetMemory_mb(): number;

    /** 回收記憶體 */
    Collect(): void;
}


interface WV_RunApp {

    /** 以其他程式開啟(系統原生選單) */
    ShowMenu(path: string): void;

    /**取得開始選單裡面的所有lnk */
    GetStartMenuList(): string[]

    /** 以3D小畫家開啟 */
    Open3DMSPaint(path: string): void;


    /**
     * 執行其他程式
     * @param FileName 執行檔路徑
     * @param Arguments 命令參數
     * @param CreateNoWindow 是否使用新視窗
     * @param UseShellExecute false=新視窗個體 
     */
    ProcessStart(FileName: string, Arguments: string, CreateNoWindow: boolean, UseShellExecute: boolean); void
}


interface WV_Image {

    /**
     * 取得任何檔案的圖示
     * @param path 
     * @returns base64
     */
    GetFileIcon(path: string, size: (16 | 32 | 64 | 128 | 256)): string;

    /**
     * 取得任何檔案的圖示
     * @param path 
     * @returns base64
     */
    GetExeIcon_32(path: string): string;


}

 //declare let cef_window: cef_window;
