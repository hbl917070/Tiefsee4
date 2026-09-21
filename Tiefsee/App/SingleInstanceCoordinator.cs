using System.Diagnostics;
using System.IO;

namespace Tiefsee;

/// <summary>
/// 協調單一實例，用於實現快速啟動
/// </summary>
public class SingleInstanceCoordinator {

    public static int runNumber = 0; // 目前的視窗數量

    /// <summary>
    /// 新建視窗時呼叫
    /// </summary>
    public static void WindowCreate() {
        runNumber += 1;
    }

    /// <summary>
    /// 關閉視窗時呼叫
    /// </summary>
    public static void WindowFreed() {
        runNumber -= 1;

        if (runNumber <= 0) {
            AppScheduler.Shutdown();
            Program.startWindow.PortFreed();
            Program.startWindow.Close(); // 關閉此視窗，程式就會完全結束
        }
    }

    /// <summary>
    /// 快速開啟。回傳 true 表示結束程式
    /// </summary>
    public static bool Check(string[] args) {

        // 直接啟動
        if (Program.startType == StartMode.Normal) {
            return false;
        }

        return InstancePipeClient.TrySend(
            Program.runtimeContext.AppDataPort,
            InstancePipeProtocol.OpenCommand,
            args);
    }

    /// <summary>
    /// 結束程式
    /// </summary>
    public static void Exit() {
        runNumber = 0;
        WindowFreed();
    }

    /// <summary>
    /// 關閉全部的視窗
    /// </summary>
    public static void CloseAllWindow() {

        // 如果是 直接啟動，直接強制結束所有 process
        if (Program.startType == StartMode.Normal) {
            Process[] proc = Process.GetProcessesByName(Process.GetCurrentProcess().ProcessName);
            for (int i = proc.Length - 1; i >= 0; i--) {
                try {
                    if (proc[i].Id == Process.GetCurrentProcess().Id)
                        continue;
                    proc[i].Kill(); // 關閉執行中的程式
                }
                catch { }
            }

            // 刪除所有的 port 檔案
            foreach (string filePort in Directory.GetFiles(Program.runtimeContext.AppDataPort, "*")) {
                try {
                    File.Delete(filePort);
                    continue;
                }
                catch { }
            }
            return;
        }

        InstancePipeClient.TrySend(
            Program.runtimeContext.AppDataPort,
            InstancePipeProtocol.CloseAllCommand,
            []);
    }

}
