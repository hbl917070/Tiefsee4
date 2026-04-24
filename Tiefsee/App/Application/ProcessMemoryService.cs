using System.Diagnostics;
using System.Runtime.InteropServices;

namespace Tiefsee;

/// <summary>
/// 封裝目前行程的記憶體整理與查詢
/// </summary>
public sealed class ProcessMemoryService {

    /// <summary>
    /// 取得目前行程記憶體使用量
    /// </summary>
    public float GetMemoryMb() {
        Process proc = Process.GetCurrentProcess();
        return proc.WorkingSet64 / 1024f / 1024f;
    }

    /// <summary>
    /// 非同步回收目前行程記憶體
    /// </summary>
    public void Collect() {
        Task.Run(() => {
            try {
                GC.Collect();
                GC.WaitForPendingFinalizers();
                if (Environment.OSVersion.Platform == PlatformID.Win32NT) {
                    SetProcessWorkingSetSize(Process.GetCurrentProcess().Handle, -1, -1);
                }
            }
            catch { }
        });
    }

    /// <summary>
    /// 提供舊呼叫點共用的靜態入口
    /// </summary>
    public static void CollectCurrentProcessMemory() {
        new ProcessMemoryService().Collect();
    }

    /// <summary>
    /// 呼叫 Win32 釋放 working set
    /// </summary>
    [DllImport("kernel32.dll")]
    private static extern bool SetProcessWorkingSetSize(IntPtr proc, int min, int max);
}
