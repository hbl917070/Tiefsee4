using System.IO;

namespace Tiefsee;

/// <summary>
/// 解析啟動初期即可取得的路徑
/// </summary>
public static class EarlyAppPathResolver {

    /// <summary>
    /// 只解析啟動最早期就能便宜取得的路徑，避免太早碰到成本較高的 store path API
    /// </summary>
    public static EarlyAppPaths Resolve() {
        string baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
        string portableMode = Path.Combine(baseDirectory, "PortableMode");
        bool isPortableMode = Directory.Exists(portableMode);

        // 先用 portable 或 LocalApplicationData 推出 Start.ini 的位置，後續再根據 ini 決定最終 appData
        string initialAppData = isPortableMode
            ? portableMode
            : Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Tiefsee");

        return new EarlyAppPaths {
            BaseDirectory = baseDirectory,
            InitialAppData = initialAppData,
            StartIniPath = Path.Combine(initialAppData, "Start.ini"),
            IsPortableMode = isPortableMode
        };
    }
}
