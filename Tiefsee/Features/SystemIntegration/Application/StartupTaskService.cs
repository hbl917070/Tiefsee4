using Windows.ApplicationModel;

namespace Tiefsee;

/// <summary>
/// 處理開機自動啟動狀態
/// </summary>
public sealed class StartupTaskService {

    /// <summary>
    /// 取得目前的開機自動啟動狀態
    /// </summary>
    public async Task<string> GetTiefseeTaskState() {
        var startupTask = await StartupTask.GetAsync("TiefseeTask");
        return startupTask.State.ToString();
    }

    /// <summary>
    /// 設定是否啟用開機自動啟動
    /// </summary>
    public async Task<string> SetTiefseeTaskState(bool enabled) {
        var startupTask = await StartupTask.GetAsync("TiefseeTask");
        if (enabled) {
            var state = await startupTask.RequestEnableAsync();
            return state.ToString();
        }

        startupTask.Disable();
        return await GetTiefseeTaskState();
    }
}

