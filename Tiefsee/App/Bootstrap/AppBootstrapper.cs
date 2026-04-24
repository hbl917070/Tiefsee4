namespace Tiefsee;

/// <summary>
/// 應用程式的組裝入口
/// </summary>
public static class AppBootstrapper {

    public static ServiceRegistry Bootstrap() {
        return new ServiceRegistry();
    }
}

