namespace Tiefsee;

public static class Adapter {

    public static SynchronizationContext Dispacher { get; private set; }

    /// <summary> 用於判斷程式是否還在運行 </summary>
    public static bool isRuning = true;

    /// <summary>
    /// 請於 UI 執行緒呼叫此方法
    /// </summary>
    public static void Initialize() {
        if (Adapter.Dispacher == null)
            Adapter.Dispacher = SynchronizationContext.Current;
    }

    /// <summary>
    /// 程式離開時呼叫
    /// </summary>
    public static void Shutdown() {
        isRuning = false;
    }

    /// <summary>
    /// 在 Dispatcher 關聯的執行緒上以同步方式執行指定的委派
    /// </summary>
    public static void Invoke(SendOrPostCallback d, object state) {
        if (Dispacher == null) {
            d(state);
            return;
        }

        if (SynchronizationContext.Current == Dispacher) {
            d(state);
            return;
        }

        Dispacher.Send(d, state);
    }

    /// <summary>
    /// 在 Dispatcher 關聯的執行緒上以非同步方式執行指定的委派
    /// </summary>
    public static void BeginInvoke(SendOrPostCallback d, object state) {
        Dispacher.Post(d, state);
    }

    /// <summary>
    /// 在 UI 執行緒執行
    /// </summary>
    /// <param name="action"></param>
    public static void UIThread(Action action) {
        if (Dispacher == null) {
            action();
            return;
        }

        if (SynchronizationContext.Current == Dispacher) {
            action();
            return;
        }

        Dispacher.Post(_ => action(), null);
    }

    /// <summary>
    /// 延遲執行
    /// </summary>
    /// <param name="interval"></param>
    /// <param name="action"></param>
    /// <param name="isAsync"></param>
    public static void DelayRun(int interval, Action action, bool isAsync = false) {
        Task.Run(async () => {
            await Task.Delay(interval);
            if (isRuning == false) { return; }

            if (isAsync) {
                action();
            }
            else {
                UIThread(action);
            }
        });
    }

    /// <summary>
    /// 循環執行
    /// </summary>
    /// <param name="interval"></param>
    /// <param name="action"></param>
    /// <param name="isAsync"></param>
    public static void LoopRun(int interval, Action action, bool isAsync = false) {
        Task.Run(async () => {
            while (isRuning) {
                if (isAsync) {
                    action();
                }
                else {
                    UIThread(action);
                }

                if (interval <= 0) {
                    continue;
                }

                try {
                    await Task.Delay(interval);
                }
                catch {
                    break;
                }
            }
        });
    }

    /// <summary>
    /// 超時就強制結束
    /// </summary>
    /// <param name="timeoutSeconds"> 最長秒數 </param>
    /// <param name="action"></param>
    public static void RunWithTimeout(double timeoutSeconds, Action action) {
        CancellationTokenSource cts = new();
        cts.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds)); // 設定超時時間

        Task task = Task.Run(action, cts.Token); // 將 CancellationToken 傳遞給 Task.Run

        task.Wait(cts.Token); // 等待任務完成或超時
    }

}
