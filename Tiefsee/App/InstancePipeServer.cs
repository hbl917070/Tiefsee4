using System.IO;
using System.IO.Pipes;

namespace Tiefsee;

/// <summary>
/// 接收 Native host 傳入的 instance 命令。
/// </summary>
public sealed class InstancePipeServer : IAsyncDisposable {

    private readonly string _pipeName;
    private readonly Action<InstancePipeMessage> _messageHandler;
    private readonly CancellationTokenSource _cancellation = new();
    private readonly object _serverLock = new();
    private NamedPipeServerStream _server;
    private Task _runTask;
    private int _disposed;

    public InstancePipeServer(int port, Action<InstancePipeMessage> messageHandler) {
        _pipeName = InstancePipeProtocol.GetPipeName(port.ToString());
        _messageHandler = messageHandler;
    }

    /// <summary>
    /// 建立第一個 Named Pipe，確保呼叫端建立 Port 鎖定檔前 Pipe 已經存在。
    /// </summary>
    public void Start() {
        if (_runTask != null) {
            return;
        }

        lock (_serverLock) {
            _server = CreateServer();
        }
        _runTask = RunAsync();
    }

    /// <summary>
    /// 等待並處理後續的 Native host 連線。
    /// </summary>
    private async Task RunAsync() {
        while (_cancellation.IsCancellationRequested == false) {
            NamedPipeServerStream server;
            lock (_serverLock) {
                server = _server;
            }

            try {
                await server.WaitForConnectionAsync(_cancellation.Token).ConfigureAwait(false);
                byte[] data = await ReadMessageAsync(server, _cancellation.Token).ConfigureAwait(false);
                if (InstancePipeProtocol.TryDeserialize(data, out InstancePipeMessage message)) {
                    _messageHandler(message);
                }
            }
            catch (OperationCanceledException) when (_cancellation.IsCancellationRequested) {
                break;
            }
            catch (ObjectDisposedException) when (_cancellation.IsCancellationRequested) {
                break;
            }
            catch (IOException) {
                // 連線中斷時，建立下一個 Pipe 繼續等待。
            }
            catch (InvalidDataException) {
                // 忽略超過上限或格式不正確的訊息，建立下一個 Pipe 繼續等待。
            }
            finally {
                server.Dispose();
                lock (_serverLock) {
                    if (ReferenceEquals(_server, server)) {
                        _server = null;
                    }
                }
            }

            if (_cancellation.IsCancellationRequested == false) {
                NamedPipeServerStream nextServer = CreateServer();
                lock (_serverLock) {
                    if (_cancellation.IsCancellationRequested) {
                        nextServer.Dispose();
                    }
                    else {
                        _server = nextServer;
                    }
                }
            }
        }
    }

    /// <summary>
    /// 讀取 Message mode Pipe 的完整訊息。
    /// </summary>
    private static async Task<byte[]> ReadMessageAsync(NamedPipeServerStream server, CancellationToken cancellation) {
        byte[] buffer = new byte[1024];
        using var message = new MemoryStream();
        do {
            int readBytes = await server.ReadAsync(buffer.AsMemory(), cancellation).ConfigureAwait(false);
            if (readBytes == 0) {
                break;
            }
            if (message.Length + readBytes > InstancePipeProtocol.MaxMessageBytes) {
                throw new InvalidDataException("Instance Pipe message is too large.");
            }
            message.Write(buffer, 0, readBytes);
        } while (server.IsMessageComplete == false);

        return message.ToArray();
    }

    /// <summary>
    /// 建立可被 Native host 連線的 Message mode Pipe。
    /// </summary>
    private NamedPipeServerStream CreateServer() {
        return new NamedPipeServerStream(
            _pipeName,
            PipeDirection.In,
            1,
            PipeTransmissionMode.Message,
            PipeOptions.Asynchronous);
    }

    public async ValueTask DisposeAsync() {
        if (Interlocked.Exchange(ref _disposed, 1) != 0) {
            return;
        }

        _cancellation.Cancel();
        lock (_serverLock) {
            try {
                _server?.Dispose();
            }
            catch (IOException) { }
        }

        if (_runTask != null) {
            try {
                await _runTask.ConfigureAwait(false);
            }
            catch (OperationCanceledException) when (_cancellation.IsCancellationRequested) { }
            catch (ObjectDisposedException) when (_cancellation.IsCancellationRequested) { }
        }

        _cancellation.Dispose();
    }
}
