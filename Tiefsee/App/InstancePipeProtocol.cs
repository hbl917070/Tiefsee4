using System.Text.Json;

namespace Tiefsee;

/// <summary>
/// Native host 與 managed app 之間的啟動命令。
/// </summary>
public sealed class InstancePipeMessage {
    public string Command { get; set; } = "";
    public string[] Args { get; set; } = [];
}

/// <summary>
/// 定義啟動 Pipe 的命令與 JSON 格式。
/// NativeHost.cpp 需維持相同的欄位名稱與命令名稱。
/// </summary>
public static class InstancePipeProtocol {

    public const string OpenCommand = "open";
    public const string CloseAllCommand = "closeAll";
    // 這個上限高於 Windows 命令列可傳遞的實際大小，避免正常的多檔案啟動被截斷，
    // 同時避免 Pipe server 因為異常輸入而持續配置記憶體。
    public const int MaxMessageBytes = 1024 * 1024;

    /// <summary>
    /// 依 port 建立 instance 使用的 Named Pipe 名稱。
    /// </summary>
    public static string GetPipeName(string port) {
        return "tiefsee-" + port;
    }

    /// <summary>
    /// 將啟動命令序列化成跨 C++/C# 使用的 UTF-8 JSON。
    /// </summary>
    public static bool TrySerialize(string command, IReadOnlyList<string> args, out byte[] data) {
        data = JsonSerializer.SerializeToUtf8Bytes(new InstancePipeMessage {
            Command = command,
            Args = args.ToArray(),
        });

        return data.Length <= MaxMessageBytes;
    }

    /// <summary>
    /// 解析並驗證啟動命令。
    /// </summary>
    public static bool TryDeserialize(ReadOnlySpan<byte> data, out InstancePipeMessage message) {
        if (data.Length > MaxMessageBytes) {
            message = null;
            return false;
        }

        try {
            message = JsonSerializer.Deserialize<InstancePipeMessage>(data);
            if (message == null ||
                (message.Command != OpenCommand && message.Command != CloseAllCommand)) {
                message = null;
                return false;
            }

            message.Args ??= [];
            return true;
        }
        catch (JsonException) {
            message = null;
            return false;
        }
    }
}
