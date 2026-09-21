using System.IO;
using System.IO.Pipes;

namespace Tiefsee;

/// <summary>
/// 尋找既有 Tiefsee instance 並透過 Named Pipe 傳送啟動命令。
/// </summary>
public static class InstancePipeClient {

    /// <summary>
    /// 嘗試將命令傳送給任一個仍持有 Port 鎖定檔的 instance。
    /// </summary>
    public static bool TrySend(string appDataPort, string command, IReadOnlyList<string> args) {
        if (Directory.Exists(appDataPort) == false) {
            return false;
        }

        if (InstancePipeProtocol.TrySerialize(command, args, out byte[] message) == false) {
            return false;
        }
        foreach (string portFile in Directory.GetFiles(appDataPort, "*")) {
            if (IsPortFileAvailable(portFile)) {
                TryDeletePortFile(portFile);
                continue;
            }

            string port = Path.GetFileName(portFile);
            if (string.IsNullOrWhiteSpace(port)) {
                continue;
            }

            try {
                using var pipe = new NamedPipeClientStream(
                    ".",
                    InstancePipeProtocol.GetPipeName(port),
                    PipeDirection.Out,
                    PipeOptions.None);
                pipe.Connect(3000);
                pipe.Write(message, 0, message.Length);
                pipe.Flush();
                return true;
            }
            catch (IOException) {
                // Pipe 尚未建立或 instance 已經結束，繼續檢查其他 Port。
            }
            catch (TimeoutException) {
                // 避免啟動流程永久等待失效的 instance。
            }
        }

        return false;
    }

    /// <summary>
    /// 判斷 Port 檔案是否已經沒有被 instance 鎖定。
    /// </summary>
    private static bool IsPortFileAvailable(string portFile) {
        try {
            using FileStream flagFile = File.Open(portFile, FileMode.Open, FileAccess.ReadWrite, FileShare.None);
            return true;
        }
        catch (IOException) {
            return false;
        }
        catch (UnauthorizedAccessException) {
            return false;
        }
    }

    /// <summary>
    /// 嘗試移除已失效的 Port 檔案。
    /// </summary>
    private static void TryDeletePortFile(string portFile) {
        try {
            File.Delete(portFile);
        }
        catch (IOException) { }
        catch (UnauthorizedAccessException) { }
    }
}
