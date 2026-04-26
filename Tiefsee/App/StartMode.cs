namespace Tiefsee;

/// <summary>
/// 啟動模式
/// </summary>
public enum StartMode : byte {
    /// <summary> 直接啟動 </summary>
    Normal = 1,
    /// <summary> 快速啟動 </summary>
    QuickStart = 2,
    /// <summary> 快速啟動且常駐 </summary>
    QuickStartResident = 3,
    /// <summary> 單一執行個體 </summary>
    SingleInstance = 4,
    /// <summary> 單一執行個體且常駐 </summary>
    SingleInstanceResident = 5
}
