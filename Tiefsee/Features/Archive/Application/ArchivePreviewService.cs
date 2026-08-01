using SharpSevenZip;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace Tiefsee;

/// <summary>
/// 壓縮檔預覽的共用服務。
///
/// 每個 session 生命週期內保留一個 SharpSevenZipExtractor，並由 session 內部
/// 序列化 native 解壓操作。前端不需要區分單檔、預覽列表或大量瀏覽模式，
/// 請求會由 session scheduler 依短時間內的相鄰請求自動合併。
///
/// 此服務同時負責：
/// - 依壓縮檔來源 fingerprint 建立或重用 session
/// - 暫存程式執行期間使用的、已驗證密碼與 native extractor
/// - 以 windowId 管理不同視窗對同一 session 的 owner set
/// - 將 entry metadata 與解壓縮限制集中在 session 內驗證
/// - 在 entry 尚未存在時排程單檔或批次解壓縮
/// </summary>
public sealed class ArchivePreviewService : IDisposable {

    /// <summary>
    /// 保護 session 字典與服務生命週期狀態。
    /// 解壓縮本身不在此 lock 中執行，避免長時間 native 工作阻塞其他 session 的管理。
    /// </summary>
    private readonly object _gate = new();

    /// <summary>
    /// 目前程式執行期間的 session。key 是 10 碼 sessionId。
    /// 不同視窗開啟相同來源版本時共用同一個 session。
    /// </summary>
    private readonly Dictionary<string, ArchivePreviewSession> _sessions = new(StringComparer.OrdinalIgnoreCase);

    /// <summary>
    /// 尚未完成初始化的 session。使用 Task 避免大型 archive metadata 讀取時長時間
    /// 持有服務層 lock，同一個 session 也只會建立一次 native extractor。
    /// </summary>
    private readonly Dictionary<string, Task<ArchivePreviewSession>> _openingSessions = new(StringComparer.OrdinalIgnoreCase);

    /// <summary>
    /// 已經沒有視窗持有，但仍有 API 工作進行中的 session。
    /// 這些 session 不會再被新請求直接取得，但暫存檔清理時仍需視為使用中。
    /// </summary>
    private readonly Dictionary<string, ArchivePreviewSession> _retiringSessions = new(StringComparer.OrdinalIgnoreCase);

    /// <summary>
    /// 程式執行期間的密碼快取。session native instance 釋放後仍保留，
    /// 確保同一個壓縮檔在程式未關閉前不需要重新輸入密碼。
    /// </summary>
    private readonly Dictionary<string, string> _passwordCache = new(StringComparer.OrdinalIgnoreCase);

    /// <summary>
    /// 限制所有 archive metadata 初始化與實際解壓縮工作的全域並行數。
    /// SharpSevenZip 使用 native 資源，不能讓每個 session 無限制同時執行。
    /// </summary>
    private readonly SemaphoreSlim _workerPool;
    private readonly string _archiveTempRoot;

    private const int MaxConcurrentArchiveWorkers = 2;

    /// <summary>
    /// 防止服務 Dispose 後再次建立或取得 session。
    /// </summary>
    private bool _disposed;

    /// <summary>
    /// 設定 SharpSevenZip native library path 時使用的全域 lock。
    /// SharpSevenZip 的 native library 設定是程序級設定，不應由多個服務實例同時寫入。
    /// </summary>
    private static readonly object NativeLibraryGate = new();

    /// <summary>
    /// 確保同一個程序只設定一次 7z.dll 路徑。
    /// </summary>
    private static bool NativeLibraryConfigured;

    /// <summary>
    /// 建立壓縮檔預覽服務並設定 SharpSevenZip 使用的 native library。
    /// </summary>
    public ArchivePreviewService(string archiveTempRoot) {
        _archiveTempRoot = archiveTempRoot;
        _workerPool = new SemaphoreSlim(MaxConcurrentArchiveWorkers, MaxConcurrentArchiveWorkers);
        ConfigureNativeLibrary();
    }

    /// <summary>
    /// 建立或重用壓縮檔 session。
    ///
    /// sessionId 由正規化路徑、檔案大小與最後修改時間組成的 fingerprint
    /// 產生。若同一個 session 已存在，會沿用原本的 native extractor、entry
    /// metadata、密碼與暫存目錄，只加入指定 windowId 的 owner set。
    ///
    /// password 只會放在目前程序的記憶體中，不會寫入 sessionId、暫存檔、
    /// 設定檔或 API 回應；只有實際解壓成功後才會寫入程序生命週期快取。
    /// </summary>
    /// <param name="archivePath">原始壓縮檔路徑。</param>
    /// <param name="password">可選的壓縮檔密碼；沒有密碼時傳入 null 或空字串。</param>
    /// <param name="windowId">發起初始化的 WebWindow 識別碼。</param>
    /// <returns>包含 session 資訊與完整 entry metadata 的初始化結果。</returns>
    /// <exception cref="ArchivePreviewException">
    /// 當來源不存在、超過限制、需要密碼、格式不支援或無法建立 extractor 時發生。
    /// </exception>
    public async Task<ArchiveSessionResult> OpenAsync(string archivePath, string password, string windowId) {
        ThrowIfDisposed();
        ValidateWindowId(windowId);

        string fullPath = NormalizeArchivePath(archivePath);
        FileInfo fileInfo = new(fullPath);
        if (fileInfo.Exists == false) {
            throw new ArchivePreviewException("archiveNotFound", "找不到壓縮檔。", 404);
        }

        string sessionId = CreateSessionId(fullPath, fileInfo);
        ArchivePreviewSession session = null;
        Task<ArchivePreviewSession> openingTask = null;
        string passwordToSet = null;
        string passwordToVerify = password;

        lock (_gate) {
            ThrowIfDisposed();
            if (_sessions.TryGetValue(sessionId, out session) == false
                && _retiringSessions.TryGetValue(sessionId, out session)) {
                _retiringSessions.Remove(sessionId);
                _sessions[sessionId] = session;
            }

            if (session == null) {
                if (_sessions.TryGetValue(sessionId, out session) == false) {
                    if (_openingSessions.TryGetValue(sessionId, out openingTask) == false) {
                        string sessionPassword = string.IsNullOrEmpty(password)
                            && _passwordCache.TryGetValue(sessionId, out string cachedPassword)
                            ? cachedPassword
                            : password;
                        passwordToVerify = sessionPassword;
                        openingTask = CreateSessionAsync(sessionId, fullPath, fileInfo, sessionPassword);
                        _openingSessions[sessionId] = openingTask;
                    }
                }
            }

            if (session != null) {
                passwordToVerify = string.IsNullOrEmpty(password)
                    && _passwordCache.TryGetValue(sessionId, out string cachedPassword)
                    ? cachedPassword
                    : password;

                if (string.IsNullOrEmpty(passwordToVerify) == false && session.IsPasswordVerified == false) {
                    passwordToSet = passwordToVerify;
                }
            }
        }

        if (session == null) {
            try {
                session = await openingTask.ConfigureAwait(false);
            }
            catch (Exception ex) {
                lock (_gate) {
                    _openingSessions.Remove(sessionId);
                }
                throw ClassifyException(ex, "archiveOpenFailed");
            }

            lock (_gate) {
                _openingSessions.Remove(sessionId);
                if (_disposed) {
                    session.Dispose();
                    throw new ObjectDisposedException(nameof(ArchivePreviewService));
                }
                if (_sessions.TryGetValue(sessionId, out ArchivePreviewSession existing)) {
                    session = existing;
                }
                else {
                    _sessions.Add(sessionId, session);
                }
            }
        }

        if (string.IsNullOrEmpty(passwordToSet) && string.IsNullOrEmpty(passwordToVerify) == false
            && session.IsPasswordVerified == false) {
            passwordToSet = passwordToVerify;
        }

        if (string.IsNullOrEmpty(passwordToSet) == false) {
            session.SetPassword(passwordToSet);
            passwordToVerify = passwordToSet;
        }

        if (session.HasEncryptedEntries && session.IsPasswordVerified == false
            && string.IsNullOrEmpty(passwordToVerify) == false) {
            try {
                await session.VerifyPasswordAsync().ConfigureAwait(false);
            }
            catch (ArchivePreviewException ex) when (ex.ErrorCode is "passwordRequired" or "passwordIncorrect") {
                lock (_gate) {
                    _passwordCache.Remove(sessionId);
                }
                throw;
            }
        }

        if (session.IsPasswordVerified && string.IsNullOrEmpty(session.Password) == false) {
            lock (_gate) {
                _passwordCache[sessionId] = session.Password;
            }
        }

        session.VerifySource(fileInfo);
        session.Acquire(windowId);
        return session.ToResult();
    }

    private async Task<ArchivePreviewSession> CreateSessionAsync(string sessionId, string archivePath, FileInfo sourceSnapshot, string password) {
        await _workerPool.WaitAsync().ConfigureAwait(false);
        try {
            return await Task.Run(() => new ArchivePreviewSession(
                sessionId,
                archivePath,
                sourceSnapshot,
                password,
                _archiveTempRoot,
                _workerPool)).ConfigureAwait(false);
        }
        finally {
            _workerPool.Release();
        }
    }

    /// <summary>
    /// 確保指定 entry 已完成解壓，並回傳暫存檔實體路徑。
    ///
    /// 這個方法不是單純的路徑字串組合：若檔案尚未解壓，會交給 session scheduler
    /// 排程，並等待單檔或批次工作完成。外部程式取得路徑後即可直接開啟檔案。
    /// </summary>
    /// <param name="sessionId">壓縮檔 session 識別碼。</param>
    /// <param name="entryId">壓縮檔 entry index。</param>
    /// <returns>已完成解壓的暫存檔路徑。</returns>
    public Task<string> GetEntryPathAsync(string sessionId, int entryId) {
        return GetEntryPathWithLeaseAsync(sessionId, entryId);
    }

    private async Task<string> GetEntryPathWithLeaseAsync(string sessionId, int entryId) {
        ArchivePreviewSession session = GetRequiredSession(sessionId);
        try {
            return await session.QueueEntryAsync(entryId).ConfigureAwait(false);
        }
        finally {
            ReleaseSessionOperation(session);
        }
    }

    /// <summary>
    /// 取得指定 entry 的 metadata。
    /// 此方法只讀取初始化時建立的目錄索引，不會觸發解壓縮。
    /// </summary>
    /// <param name="sessionId">壓縮檔 session 識別碼。</param>
    /// <param name="entryId">壓縮檔 entry index。</param>
    /// <returns>entry metadata。</returns>
    public ArchiveEntryInfoResult GetEntry(string sessionId, int entryId) {
        ArchivePreviewSession session = GetRequiredSession(sessionId);
        try {
            return session.GetEntry(entryId);
        }
        finally {
            ReleaseSessionOperation(session);
        }
    }

    /// <summary>
    /// 釋放指定 windowId 對 session 的一次持有。
    ///
    /// 只有該 windowId 確實持有此 session 時才會移除 owner。
    /// 當 session 已沒有任何視窗持有時，才會從服務移除並 Dispose native extractor。
    /// </summary>
    /// <param name="sessionId">要釋放的壓縮檔 session。</param>
    /// <param name="windowId">要扣除持有次數的 WebWindow。</param>
    /// <returns>是否成功釋放該視窗的持有。</returns>
    public bool Close(string sessionId, string windowId) {
        ValidateWindowId(windowId);
        ArchivePreviewSession session;
        bool dispose;
        lock (_gate) {
            if (_sessions.TryGetValue(sessionId, out session) == false
                || session.Release(windowId) == false) {
                return false;
            }
            dispose = session.HasNoOwners && session.HasActiveOperations == false;
            if (dispose) {
                _sessions.Remove(sessionId);
            }
            else if (session.HasNoOwners) {
                _sessions.Remove(sessionId);
                _retiringSessions[sessionId] = session;
            }
        }

        if (dispose) {
            session.Dispose();
        }
        return true;
    }

    /// <summary>
    /// 釋放指定視窗持有的所有 session。
    ///
    /// 此方法可重複呼叫且不會誤傷其他視窗，供 WebWindow.FormClosed 作為
    /// 前端未及時釋放時的最後一道防線。每個 session 只會移除該 windowId
    /// 的 owner；只有沒有任何視窗持有的 session 才會真正 Dispose。
    /// </summary>
    /// <param name="windowId">已關閉或即將關閉的 WebWindow。</param>
    /// <returns>實際釋放的 session 數量。</returns>
    public int CloseWindow(string windowId) {
        ValidateWindowId(windowId);
        List<ArchivePreviewSession> disposeSessions = new();
        int releasedCount = 0;

        lock (_gate) {
            foreach (var pair in _sessions.ToArray()) {
                int released = pair.Value.ReleaseAll(windowId);
                if (released == 0) {
                    continue;
                }

                releasedCount += released;
                if (pair.Value.HasNoOwners && pair.Value.HasActiveOperations == false) {
                    _sessions.Remove(pair.Key);
                    disposeSessions.Add(pair.Value);
                }
                else if (pair.Value.HasNoOwners) {
                    _sessions.Remove(pair.Key);
                    _retiringSessions[pair.Key] = pair.Value;
                }
            }
        }

        foreach (ArchivePreviewSession session in disposeSessions) {
            session.Dispose();
        }
        return releasedCount;
    }

    private ArchivePreviewSession GetRequiredSession(string sessionId) {
        if (string.IsNullOrWhiteSpace(sessionId)) {
            throw new ArchivePreviewException("sessionNotFound", "缺少 sessionId。", 404);
        }

        lock (_gate) {
            if (_sessions.TryGetValue(sessionId, out ArchivePreviewSession session)) {
                session.EnterOperation();
                return session;
            }
        }

        throw new ArchivePreviewException("sessionNotFound", "找不到壓縮檔 session。", 404);
    }

    private void ReleaseSessionOperation(ArchivePreviewSession session) {
        if (session.ExitOperation() == false) {
            return;
        }

        bool dispose = false;
        lock (_gate) {
            if (_retiringSessions.TryGetValue(session.SessionId, out ArchivePreviewSession retiring)
                && ReferenceEquals(retiring, session)
                && session.HasActiveOperations == false) {
                _retiringSessions.Remove(session.SessionId);
                dispose = true;
            }
        }

        if (dispose) {
            session.Dispose();
        }
    }

    /// <summary>
    /// 判斷壓縮檔暫存檔是否仍由目前的 session 使用。
    /// 暫存清理服務會跳過這些檔案，避免刪除前端或外部程式仍可能使用的路徑。
    /// </summary>
    public bool IsArchiveTempPathProtected(string path) {
        string fullPath;
        try {
            fullPath = Path.GetFullPath(path);
        }
        catch {
            return true;
        }

        lock (_gate) {
            return _sessions.Values.Concat(_retiringSessions.Values)
                .Any(session => session.ContainsTempPath(fullPath));
        }
    }

    /// <summary>
    /// 將外部傳入的壓縮檔路徑轉成可用於 session fingerprint 與檔案操作的完整路徑。
    /// 不在此處解析壓縮檔內容，避免路徑檢查與 native 初始化責任混在一起。
    /// </summary>
    private static string NormalizeArchivePath(string archivePath) {
        if (string.IsNullOrWhiteSpace(archivePath)) {
            throw new ArchivePreviewException("archivePathRequired", "缺少壓縮檔路徑。", 400);
        }

        try {
            return Path.GetFullPath(archivePath.Trim());
        }
        catch (Exception ex) {
            throw new ArchivePreviewException("invalidArchivePath", "壓縮檔路徑無效。", 400, ex);
        }
    }

    /// <summary>
    /// 以來源檔案的完整路徑、大小與最後修改時間建立 10 碼 sessionId。
    /// 這是快速 fingerprint，不是完整內容 hash；session 建立後仍會保存來源快照，
    /// 來源大小或修改時間變更時拒絕重用舊 session。
    /// </summary>
    private static string CreateSessionId(string fullPath, FileInfo fileInfo) {
        string fingerprint = fullPath + "|" + fileInfo.Length + "|" + fileInfo.LastWriteTimeUtc.Ticks;
        byte[] hash = SHA256.HashData(Encoding.UTF8.GetBytes(fingerprint));
        return Convert.ToHexString(hash)[..10].ToLowerInvariant();
    }

    /// <summary>
    /// 驗證 windowId 格式，避免空值或異常長度進入 owner set。
    /// windowId 的實際產生來源是後端 WebWindow，不接受前端任意長度的識別碼。
    /// </summary>
    private static void ValidateWindowId(string windowId) {
        if (string.IsNullOrWhiteSpace(windowId) || windowId.Length != 10) {
            throw new ArchivePreviewException("invalidParameter", "windowId 必須是 10 碼。", 400);
        }
    }

    /// <summary>
    /// 尋找並設定 SharpSevenZip 使用的 7z.dll。
    /// 優先使用輸出目錄中的 x64 版本，再嘗試程式根目錄與 runtime context
    /// 所提供的位置。找不到時保留 SharpSevenZip 的預設行為。
    /// </summary>
    private static void ConfigureNativeLibrary() {
        lock (NativeLibraryGate) {
            if (NativeLibraryConfigured) {
                return;
            }

            string[] candidates = [
                Path.Combine(AppContext.BaseDirectory, "x64", "7z.dll"),
                Path.Combine(AppContext.BaseDirectory, "7z.dll"),
                Path.Combine(Program.runtimeContext?.BaseDirectory ?? "", "x64", "7z.dll"),
                Path.Combine(Program.runtimeContext?.BaseDirectory ?? "", "7z.dll")
            ];
            string libraryPath = candidates.FirstOrDefault(File.Exists);
            if (string.IsNullOrEmpty(libraryPath) == false) {
                SharpSevenZipExtractor.SetLibraryPath(libraryPath);
            }

            NativeLibraryConfigured = true;
        }
    }

    /// <summary>
    /// 將 archive 初始化例外轉換成對前端穩定的錯誤代碼。
    /// 不把底層 native library 的錯誤文字直接當成前端契約。
    /// </summary>
    private static ArchivePreviewException ClassifyException(Exception exception, string fallbackCode) {
        if (exception is ArchivePreviewException archiveException) {
            return archiveException;
        }

        return new ArchivePreviewException(fallbackCode, "壓縮檔處理失敗。", 500, exception);
    }

    /// <summary>
    /// 確認服務仍可接受新的 session 操作。
    /// </summary>
    private void ThrowIfDisposed() {
        if (_disposed) {
            throw new ObjectDisposedException(nameof(ArchivePreviewService));
        }
    }

    /// <summary>
    /// 釋放所有仍存在的 session、native extractor 與記憶體中的密碼。
    /// 程式結束時由 Program 的 ApplicationExit 呼叫；此方法可安全重複呼叫。
    /// </summary>
    public void Dispose() {
        if (_disposed) {
            return;
        }

        ArchivePreviewSession[] sessions;
        Task<ArchivePreviewSession>[] openingTasks;
        lock (_gate) {
            _disposed = true;
            sessions = _sessions.Values.Concat(_retiringSessions.Values).Distinct().ToArray();
            openingTasks = _openingSessions.Values.ToArray();
            _sessions.Clear();
            _retiringSessions.Clear();
            _openingSessions.Clear();
            _passwordCache.Clear();
        }

        foreach (Task<ArchivePreviewSession> openingTask in openingTasks) {
            try {
                openingTask.GetAwaiter().GetResult().Dispose();
            }
            catch { }
        }
        foreach (ArchivePreviewSession session in sessions) {
            session.Dispose();
        }
        _workerPool.Dispose();
    }
}

internal sealed class ArchivePreviewSession : IDisposable {

    /// <summary> 固實壓縮檔的原始檔案大小上限；超過後不建立預覽 session。 </summary>
    private const long MaxSolidArchiveBytes = 100L * 1024 * 1024;
    /// <summary> 固實壓縮檔超過此大小後，第一次讀取 entry 會完整解壓。 </summary>
    private const long SolidFullExtractionThresholdBytes = 10L * 1024 * 1024;
    /// <summary> 所有非資料夾 entry 的未壓縮大小總上限。 </summary>
    private const long MaxTotalUnpackedBytes = 10L * 1024 * 1024 * 1024;
    /// <summary> 單一 entry 的未壓縮大小上限；達到 1 GB 時禁止解壓。 </summary>
    private const long MaxEntryUnpackedBytes = 1L * 1024 * 1024 * 1024;
    /// <summary> 單次批次解壓的未壓縮大小上限，避免 staging 一次占用整個 session 配額。 </summary>
    private const long MaxBatchUnpackedBytes = 1L * 1024 * 1024 * 1024;
    /// <summary> 壓縮檔目錄 entry 數量上限，避免初始化 metadata 過大。 </summary>
    private const int MaxEntryCount = 100_000;
    /// <summary> 單一 session 可以實際寫入暫存資料夾的大小上限。 </summary>
    private const long MaxSessionTempBytes = 10L * 1024 * 1024 * 1024;
    /// <summary> 收集相鄰請求的短暫等待時間。 </summary>
    private static readonly TimeSpan Debounce = TimeSpan.FromMilliseconds(45);
    /// <summary> 超過此數量的相鄰請求才視為預覽列表或大量瀏覽。 </summary>
    private const int PreviewThreshold = 12;
    /// <summary> 進入 bulk 模式後，最多向後預取的檔案數。 </summary>
    private const int BulkPrefetchCount = 300;
    /// <summary> 判斷請求是否屬於同一批次時回看的時間範圍。 </summary>
    private const int RequestHistoryMilliseconds = 2_000;

    /// <summary>
    /// 保護 session 內的 queue、owner set、完成狀態與暫存大小。
    /// </summary>
    private readonly object _gate = new();

    /// <summary>
    /// 保護 SharpSevenZipExtractor。SharpSevenZip instance 不允許多個解壓工作同時操作。
    /// </summary>
    private readonly object _extractorGate = new();

    /// <summary> 來源壓縮檔的正規化完整路徑。 </summary>
    private readonly string _archivePath;

    /// <summary> session 專用的暫存資料夾，資料夾名稱固定使用 sessionId。 </summary>
    private readonly string _tempDirectory;

    /// <summary>
    /// 建立 session 時保存的來源快照，用來拒絕重用已被替換的壓縮檔。
    /// </summary>
    private readonly FileInfo _sourceSnapshot;

    /// <summary> 以 7-Zip entry index 快速查找 entry metadata。 </summary>
    private readonly Dictionary<int, ArchiveFileEntry> _entriesById;

    /// <summary>
    /// 只包含檔案、不包含資料夾的 entry，供鄰近檔案判斷與 bulk 預取使用。
    /// </summary>
    private readonly List<ArchiveFileEntry> _fileEntries;

    /// <summary>
    /// 持有此 session 的 windowId。相同 windowId 重複初始化只保留一筆，
    /// 不會因 onCreate 或網路重試增加虛假的持有。
    /// </summary>
    private readonly HashSet<string> _owners = new(StringComparer.Ordinal);

    /// <summary>
    /// 同一 entry 的並行請求共用的完成工作。key 不存在代表目前沒有等待中的解壓工作。
    /// </summary>
    private readonly Dictionary<int, TaskCompletionSource<string>> _inflight = new();

    /// <summary> 已排入下一批解壓工作的 entryId。 </summary>
    private readonly HashSet<int> _pending = new();

    /// <summary>
    /// 最近收到的 entry 請求，用來判斷 5～12 個預覽請求或 300 個大量瀏覽請求。
    /// </summary>
    private readonly Queue<(int EntryId, DateTime Timestamp)> _requestHistory = new();

    /// <summary> 防抖計時器，等待瀏覽器的下一批非同步請求到達。 </summary>
    private System.Threading.Timer _timer;

    /// <summary> session 生命週期內重用的 SharpSevenZip extractor。 </summary>
    private SharpSevenZipExtractor _extractor;

    /// <summary> 僅存在 session 內的壓縮檔密碼；服務層另有程序生命週期快取。 </summary>
    private string _password;

    /// <summary> 目前 session 是否已實際解壓成功並驗證密碼。 </summary>
    private bool _passwordVerified;

    /// <summary> 防止相同 session 同時執行多次密碼驗證。 </summary>
    private Task _passwordVerificationTask;

    /// <summary> 目前仍在使用此 session 的 API 請求數。 </summary>
    private int _activeOperations;

    /// <summary> 供所有 session 共用的 archive worker pool。 </summary>
    private readonly SemaphoreSlim _workerPool;

    /// <summary> 是否正在處理目前批次，避免 timer 重複啟動解壓工作。 </summary>
    private bool _processing;

    /// <summary> 是否已經進入 bulk 預取模式；每個 session 只需觸發一次。 </summary>
    private bool _bulkTriggered;

    /// <summary> session 是否已經釋放。 </summary>
    private bool _disposed;

    /// <summary> 已成功寫入此 session 暫存資料夾的未壓縮大小。 </summary>
    private long _materializedBytes;

    /// <summary> 最近一次被開啟、查詢或排程使用的時間，供診斷與未來清理策略使用。 </summary>
    private DateTime _lastAccessUtc = DateTime.UtcNow;

    /// <summary> 對應服務層 sessionId。 </summary>
    public string SessionId { get; }

    /// <summary> 是否為固實壓縮檔。 </summary>
    public bool IsSolid { get; private set; }

    /// <summary>
    /// SharpSevenZip 回報的固實 block 數量；無法取得時為 0。
    /// </summary>
    public int SolidBlockCount { get; private set; }

    /// <summary>
    /// SharpSevenZip 回報的壓縮方法描述，例如 LZMA2:48m。
    /// </summary>
    public string CompressionMethod { get; private set; } = "";

    /// <summary>
    /// 初始化時由 entry metadata 加總出的未壓縮檔案大小。
    /// </summary>
    public long TotalUnpackedBytes { get; private set; }

    /// <summary> 是否包含至少一個加密 entry。 </summary>
    public bool HasEncryptedEntries { get; private set; }

    /// <summary> 是否已經成功驗證目前密碼。 </summary>
    public bool IsPasswordVerified {
        get {
            lock (_gate) {
                return _passwordVerified;
            }
        }
    }

    /// <summary> SharpSevenZip 判斷出的壓縮格式。 </summary>
    public string Format { get; private set; } = "";

    /// <summary> 是否已沒有任何 WebWindow 持有此 session。 </summary>
    public bool HasNoOwners {
        get {
            lock (_gate) {
                return _owners.Count == 0;
            }
        }
    }

    /// <summary> 是否仍有 API 請求持有此 session 的生命週期。 </summary>
    public bool HasActiveOperations {
        get {
            lock (_gate) {
                return _activeOperations > 0;
            }
        }
    }

    /// <summary> 此 session 是否包含指定的暫存檔路徑。 </summary>
    public bool ContainsTempPath(string path) {
        string root = Path.GetFullPath(_tempDirectory).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
        return path.StartsWith(root, StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// 建立 session、初始化 native extractor、讀取 entry metadata 並執行
    /// 初始化階段的安全與效能限制檢查。單一 entry 的解壓大小限制會在
    /// entry 真正排程時檢查；此處只讀取壓縮檔目錄，不會解壓 entry。
    /// </summary>
    /// <param name="sessionId">服務層產生的 10 碼 sessionId。</param>
    /// <param name="archivePath">正規化後的壓縮檔完整路徑。</param>
    /// <param name="sourceSnapshot">建立 session 前取得的來源檔案資訊。</param>
    /// <param name="password">可選的記憶體密碼。</param>
    /// <param name="archiveTempRoot">所有壓縮檔 session 使用的暫存根目錄。</param>
    /// <param name="workerPool">所有 session 共用的解壓工作池。</param>
    public ArchivePreviewSession(string sessionId, string archivePath, FileInfo sourceSnapshot, string password, string archiveTempRoot, SemaphoreSlim workerPool) {
        SessionId = sessionId;
        _archivePath = archivePath;
        _sourceSnapshot = sourceSnapshot;
        _password = password;
        _workerPool = workerPool;
        _tempDirectory = Path.Combine(archiveTempRoot, sessionId);
        Directory.CreateDirectory(_tempDirectory);

        try {
            bool archiveSignatureValidated = CreateExtractor();
            // 7z 啟用加密檔頭時，SharpSevenZip 會在讀取 metadata 時拋出例外，
            // 這和真正的空壓縮檔不同，空壓縮檔會回傳非 null 的空集合。
            // 因此要在讀取 metadata 前要求密碼，否則後續無法知道 entry 清單。
            ArchiveFileInfo[] archiveFiles;
            try {
                IReadOnlyList<ArchiveFileInfo> archiveFileData = _extractor.ArchiveFileData;
                if (archiveFileData == null) {
                    throw CreatePasswordException();
                }
                archiveFiles = archiveFileData.ToArray();
            }
            catch (SharpSevenZip.Exceptions.SharpSevenZipArchiveException ex) when (archiveSignatureValidated) {
                // 加密檔頭的 7z 會在讀取 metadata 時由 native library 拋出
                // SharpSevenZipArchiveException；這不是依賴例外文字判斷，而是
                // 由前面的實際檔案簽章檢查確認為 archive 後，依 library 的例外型別
                // 轉成前端可處理的密碼狀態。
                throw CreatePasswordException(ex);
            }
            if (archiveFiles.Length > MaxEntryCount) {
                throw new ArchivePreviewException("entryCountLimitExceeded", "壓縮檔內的 entry 數量超過限制。", 413);
            }

            _entriesById = new Dictionary<int, ArchiveFileEntry>();
            _fileEntries = new List<ArchiveFileEntry>();
            long totalSize = 0;
            HashSet<string> logicalNames = new(StringComparer.OrdinalIgnoreCase);
            foreach (ArchiveFileInfo archiveFile in archiveFiles) {
                ArchiveFileEntry entry = ArchiveFileEntry.Create(archiveFile);
                ValidateEntry(entry, logicalNames);
                _entriesById.Add(entry.EntryId, entry);
                if (entry.IsDirectory == false) {
                    _fileEntries.Add(entry);
                    checked { totalSize += entry.Size; }
                }
            }

            if (totalSize > MaxTotalUnpackedBytes) {
                throw new ArchivePreviewException("unpackedSizeLimitExceeded", "壓縮檔解壓後總大小超過限制。", 413);
            }

            // 完全空的 archive 沒有可供 SharpSevenZip 判定的 solid metadata，
            // 此時直接讀取 IsSolid 會拋出 Nullable object must have a value。
            IsSolid = archiveFiles.Length > 0 && _extractor.IsSolid;
            Format = _extractor.Format.ToString();
            CompressionMethod = GetArchivePropertyString("Method");
            SolidBlockCount = GetArchivePropertyInt("Number of blocks", "NumBlocks");
            TotalUnpackedBytes = totalSize;
            if (IsSolid && _sourceSnapshot.Length > MaxSolidArchiveBytes) {
                throw new ArchivePreviewException("solidArchiveSizeLimitExceeded", "固實壓縮檔超過 100 MB 限制。", 413);
            }
            HasEncryptedEntries = _fileEntries.Any(entry => entry.IsEncrypted);
            _passwordVerified = HasEncryptedEntries == false;
        }
        catch (ArchivePreviewException) {
            TryDeleteDirectory(_tempDirectory);
            Dispose();
            throw;
        }
        catch (OverflowException ex) {
            TryDeleteDirectory(_tempDirectory);
            Dispose();
            throw new ArchivePreviewException("unpackedSizeLimitExceeded", "壓縮檔解壓後總大小超過限制。", 413, ex);
        }
        catch (Exception ex) {
            ArchivePreviewException classified = ex is ArchivePreviewException archiveException
                ? archiveException
                : new ArchivePreviewException("archiveOpenFailed", "無法開啟壓縮檔。", 500, ex);
            TryDeleteDirectory(_tempDirectory);
            Dispose();
            throw classified;
        }
    }

    /// <summary>
    /// 確認目前來源檔案仍與 session 建立時相同。
    /// 只比對檔案大小與最後修改時間；這是快速來源檢查，不重新計算完整內容 hash。
    /// </summary>
    /// <param name="current">目前來源檔案資訊。</param>
    public void VerifySource(FileInfo current) {
        if (current.Length != _sourceSnapshot.Length || current.LastWriteTimeUtc.Ticks != _sourceSnapshot.LastWriteTimeUtc.Ticks) {
            throw new ArchivePreviewException("archiveChanged", "壓縮檔來源已變更，請重新建立 session。", 409);
        }
        Touch();
    }

    /// <summary>
    /// 記錄指定視窗對此 session 的持有。
    /// 同一視窗重複呼叫不會增加持有數量。
    /// </summary>
    /// <param name="windowId">持有 session 的 WebWindow。</param>
    public void Acquire(string windowId) {
        lock (_gate) {
            ThrowIfDisposed();
            _owners.Add(windowId);
            Touch();
        }
    }

    /// <summary>
    /// 釋放指定視窗對此 session 的持有。
    /// 不會直接清除其他視窗的持有，也不在此方法內 Dispose extractor。
    /// </summary>
    /// <param name="windowId">要釋放持有的 WebWindow。</param>
    /// <returns>該視窗有持有可釋放時回傳 true。</returns>
    public bool Release(string windowId) {
        lock (_gate) {
            if (_owners.Remove(windowId) == false) {
                return false;
            }
            Touch();
            return true;
        }
    }

    /// <summary>
    /// 移除指定視窗對此 session 的持有。
    /// 用於 WebWindow 關閉時的兜底清理，避免前端未呼叫 close API 造成 owner 殘留。
    /// </summary>
    /// <param name="windowId">即將關閉的 WebWindow。</param>
    /// <returns>成功移除時回傳 1；沒有持有時回傳 0。</returns>
    public int ReleaseAll(string windowId) {
        lock (_gate) {
            if (_owners.Remove(windowId) == false) {
                return 0;
            }
            Touch();
            return 1;
        }
    }

    /// <summary>
    /// 供服務層保存程序生命週期密碼快取時讀取。
    /// </summary>
    public string Password {
        get {
            lock (_gate) {
                return _password;
            }
        }
    }

    /// <summary>
    /// 以新輸入的密碼替換目前未驗證的 extractor。
    /// 新 extractor 建立成功後才替換舊 instance，避免錯誤密碼破壞既有 session。
    /// </summary>
    public void SetPassword(string password) {
        if (string.IsNullOrEmpty(password)) {
            return;
        }

        SharpSevenZipExtractor replacement;
        SharpSevenZipExtractor previous;
        lock (_gate) {
            ThrowIfDisposed();
            if (_passwordVerified && string.Equals(_password, password, StringComparison.Ordinal)) {
                return;
            }

            lock (_extractorGate) {
                replacement = new SharpSevenZipExtractor(_archivePath, password);
                previous = _extractor;
                _extractor = replacement;
                _password = password;
                _passwordVerified = false;
            }
            Touch();
        }

        previous?.Dispose();
    }

    /// <summary>
    /// 使用目前密碼實際解壓一個加密 entry 到 Null stream，以驗證密碼。
    /// SharpSevenZip 建立 extractor 或讀取 metadata 時不一定會驗證資料密碼，
    /// 因此不能只依賴建構成功判斷密碼正確。
    /// </summary>
    public Task VerifyPasswordAsync() {
        lock (_gate) {
            ThrowIfDisposed();
            if (HasEncryptedEntries == false || _passwordVerified) {
                _passwordVerified = true;
                return Task.CompletedTask;
            }
            if (string.IsNullOrEmpty(_password)) {
                throw new ArchivePreviewException("passwordRequired", "壓縮檔需要密碼。", 401);
            }
            if (_passwordVerificationTask != null) {
                return _passwordVerificationTask;
            }

            ArchiveFileEntry probe = _fileEntries.FirstOrDefault(entry => entry.IsEncrypted);
            if (probe == null) {
                _passwordVerified = true;
                return Task.CompletedTask;
            }

            _passwordVerificationTask = VerifyPasswordCoreAsync(probe.EntryId);
            return _passwordVerificationTask;
        }
    }

    private async Task VerifyPasswordCoreAsync(int entryId) {
        try {
            await RunNativeExtractionAsync(() => {
                lock (_extractorGate) {
                    _extractor.ExtractFile(entryId, Stream.Null);
                }
            }).ConfigureAwait(false);

            lock (_gate) {
                _passwordVerified = true;
            }
        }
        catch (Exception ex) {
            ArchivePreviewException error = ClassifySessionException(ex, true);
            lock (_gate) {
                _passwordVerified = false;
            }
            throw error;
        }
        finally {
            lock (_gate) {
                _passwordVerificationTask = null;
            }
        }
    }

    /// <summary> 增加 API 請求對 session 的生命週期持有。 </summary>
    public void EnterOperation() {
        lock (_gate) {
            ThrowIfDisposed();
            _activeOperations++;
            Touch();
        }
    }

    /// <summary> 釋放 API 請求對 session 的生命週期持有。 </summary>
    /// <returns>釋放後是否已沒有任何進行中的 API 請求。</returns>
    public bool ExitOperation() {
        lock (_gate) {
            if (_activeOperations > 0) {
                _activeOperations--;
            }
            return _activeOperations == 0;
        }
    }

    /// <summary>
    /// 將目前 session 轉成初始化 API 回應。
    /// 此結果包含完整 metadata，但不包含密碼與 owner 資訊。
    /// </summary>
    /// <returns>可序列化給前端的 session 資訊。</returns>
    public ArchiveSessionResult ToResult() {
        Touch();
        return new ArchiveSessionResult {
            status = "ready",
            sessionId = SessionId,
            archivePath = _archivePath,
            format = Format,
            isSolid = IsSolid,
            solidBlockCount = SolidBlockCount,
            compressionMethod = CompressionMethod,
            totalUnpackedBytes = TotalUnpackedBytes,
            hasEncryptedEntries = HasEncryptedEntries,
            isPasswordVerified = IsPasswordVerified,
            tempDirectory = _tempDirectory,
            entries = GetEntries()
        };
    }

    /// <summary>
    /// 取得初始化時建立的 entry metadata 快照。
    /// 此方法不會觸發解壓縮，並且由 ToResult 在 sessions/open 時使用。
    /// </summary>
    /// <returns>依 entryId 排序的 entry metadata。</returns>
    public ArchiveEntryInfoResult[] GetEntries() {
        return _entriesById.Values
            .OrderBy(entry => entry.EntryId)
            .Select(entry => entry.ToResult())
            .ToArray();
    }

    /// <summary>
    /// 從 session metadata 查找單一 entry。
    /// </summary>
    /// <param name="entryId">7-Zip entry index。</param>
    /// <returns>指定 entry 的 metadata。</returns>
    public ArchiveEntryInfoResult GetEntry(int entryId) {
        if (_entriesById.TryGetValue(entryId, out ArchiveFileEntry entry) == false) {
            throw new ArchivePreviewException("entryNotFound", "找不到壓縮檔 entry。", 404);
        }
        return entry.ToResult();
    }

    /// <summary>
    /// 從 SharpSevenZip 的 archive-level properties 取得字串特徵。
    /// 不同格式或不同 7z.dll 版本可能沒有該 property，因此缺少時回傳空字串。
    /// </summary>
    private string GetArchivePropertyString(params string[] names) {
        var archiveProperties = _extractor.ArchiveProperties;
        if (archiveProperties is null) {
            return "";
        }

        foreach (ArchiveProperty property in archiveProperties) {
            if (names.Any(name => string.Equals(property.Name, name, StringComparison.OrdinalIgnoreCase))) {
                return property.Value?.ToString() ?? "";
            }
        }
        return "";
    }

    /// <summary>
    /// 從 archive-level properties 取得整數特徵，例如固實 block 數量。
    /// property 的實際型別可能依 native provider 回傳為不同整數型別或字串，
    /// 所以統一轉成 Int32；無法解析時回傳 0，避免把未知誤判成單一 block。
    /// </summary>
    private int GetArchivePropertyInt(params string[] names) {
        string value = GetArchivePropertyString(names);
        return int.TryParse(value, out int result) && result >= 0 ? result : 0;
    }

    /// <summary>
    /// 將單一 entry 加入解壓排程，並回傳完成後的暫存檔路徑。
    ///
    /// 已存在的完整檔案會立即命中 cache；同一 entry 的並行請求會共用
    /// 同一個 Task。短時間內收到相鄰 entry 請求時，scheduler 會自動合併，
    /// 固實壓縮檔則可能改用批次解壓。
    /// </summary>
    /// <param name="entryId">要取得的 entry index。</param>
    /// <returns>entry 完成解壓後的實體路徑。</returns>
    public Task<string> QueueEntryAsync(int entryId) {
        lock (_gate) {
            ThrowIfDisposed();
            Touch();
            if (_entriesById.TryGetValue(entryId, out ArchiveFileEntry entry) == false) {
                throw new ArchivePreviewException("entryNotFound", "找不到壓縮檔 entry。", 404);
            }
            if (entry.IsDirectory) {
                throw new ArchivePreviewException("entryIsDirectory", "指定的 entry 是資料夾。", 400);
            }
            if (entry.Size >= MaxEntryUnpackedBytes) {
                throw new ArchivePreviewException("entrySizeLimitExceeded", "壓縮檔內單一檔案超過 1 GB 限制。", 413);
            }
            if (entry.IsEncrypted && _passwordVerified == false) {
                throw new ArchivePreviewException(
                    string.IsNullOrEmpty(_password) ? "passwordRequired" : "passwordIncorrect",
                    string.IsNullOrEmpty(_password) ? "壓縮檔需要密碼。" : "壓縮檔密碼尚未驗證或錯誤。",
                    401);
            }

            string finalPath = GetFinalPath(entry);
            if (File.Exists(finalPath)) {
                TouchFile(finalPath);
                return Task.FromResult(finalPath);
            }
            if (_inflight.TryGetValue(entryId, out TaskCompletionSource<string> existing)) {
                return existing.Task;
            }

            TaskCompletionSource<string> completion = new(TaskCreationOptions.RunContinuationsAsynchronously);
            _inflight.Add(entryId, completion);
            _pending.Add(entryId);
            RecordRequest(entryId);

            if (_bulkTriggered == false && IsBulkRequestDetected()) {
                _bulkTriggered = true;
                AddBulkPrefetch(entryId);
                Schedule(TimeSpan.Zero);
            }
            else {
                Schedule(Debounce);
            }

            return completion.Task;
        }
    }

    private bool CreateExtractor() {
        // 使用 stream overload 檢查實際檔案簽章，避免 path overload 依副檔名
        // 將改名的非壓縮檔誤判成 archive。
        bool archiveSignatureValidated = false;
        try {
            using FileStream signatureStream = new(
                _archivePath,
                FileMode.Open,
                FileAccess.Read,
                FileShare.ReadWrite | FileShare.Delete);
            _ = SharpSevenZipArchiveFormat.CheckFormat(signatureStream);
            archiveSignatureValidated = true;
        }
        catch (Exception ex) {
            if (HasSplitZipVolume() == false) {
                throw new ArchivePreviewException("archiveOpenFailed", "無法開啟壓縮檔。", 500, ex);
            }
        }

        _extractor = string.IsNullOrEmpty(_password)
            ? new SharpSevenZipExtractor(_archivePath)
            : new SharpSevenZipExtractor(_archivePath, _password);
        return archiveSignatureValidated;
    }

    /// <summary>
    /// 分割 ZIP 的最後一段通常是 .zip，本身不一定以 ZIP signature 開頭；
    /// 前面的 .z01 才是第一個 volume。這種情況交由 SharpSevenZip 依分卷檔案
    /// 自動組合與開啟，不能只檢查目前 .zip 檔案的 stream signature。
    /// </summary>
    private bool HasSplitZipVolume() {
        if (string.Equals(Path.GetExtension(_archivePath), ".zip", StringComparison.OrdinalIgnoreCase) == false) {
            return false;
        }
        return File.Exists(Path.ChangeExtension(_archivePath, ".z01"));
    }

    private ArchivePreviewException CreatePasswordException(Exception innerException = null) {
        bool hasPassword = string.IsNullOrEmpty(_password) == false;
        return new ArchivePreviewException(
            hasPassword ? "passwordIncorrect" : "passwordRequired",
            hasPassword ? "壓縮檔密碼錯誤。" : "壓縮檔需要密碼。",
            401,
            innerException);
    }

    private static void ValidateEntry(ArchiveFileEntry entry, HashSet<string> logicalNames) {
        string normalized = NormalizeEntryName(entry.Name);
        if (normalized.Length > 400) {
            throw new ArchivePreviewException("entryPathTooLong", "壓縮檔內的路徑過長。", 413);
        }
        if (logicalNames.Add(normalized) == false) {
            throw new ArchivePreviewException("entryPathCollision", "壓縮檔內有重複或大小寫衝突的路徑。", 400);
        }
        entry.NormalizedName = normalized;
    }

    private static string NormalizeEntryName(string name) {
        string normalized = (name ?? "").Replace('\\', '/');
        if (normalized.StartsWith('/') || normalized.StartsWith("//") || Path.IsPathFullyQualified(normalized)) {
            throw new ArchivePreviewException("unsafeEntryPath", "壓縮檔內含有絕對路徑。", 400);
        }

        string[] segments = normalized.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (segments.Length == 0) {
            throw new ArchivePreviewException("unsafeEntryPath", "壓縮檔內含有空白路徑。", 400);
        }
        foreach (string segment in segments) {
            if (segment == "." || segment == ".." || segment.Contains(':') || segment.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0
                || segment.EndsWith('.') || segment.EndsWith(' ')
                || IsReservedWindowsName(segment)) {
                throw new ArchivePreviewException("unsafeEntryPath", "壓縮檔內含有不安全的路徑。", 400);
            }
        }
        return string.Join('/', segments);
    }

    private static bool IsReservedWindowsName(string segment) {
        string name = Path.GetFileNameWithoutExtension(segment).ToUpperInvariant();
        return name is "CON" or "PRN" or "AUX" or "NUL"
            || (name.Length == 4 && (name.StartsWith("COM") || name.StartsWith("LPT"))
                && name[3] is >= '1' and <= '9');
    }

    private static void ValidateStagingPath(string stagingDirectory, string stagingPath) {
        string root = Path.GetFullPath(stagingDirectory).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
        string fullPath = Path.GetFullPath(stagingPath);
        if (fullPath.StartsWith(root, StringComparison.OrdinalIgnoreCase) == false) {
            throw new ArchivePreviewException("unsafeEntryPath", "壓縮檔輸出路徑超出暫存資料夾。", 400);
        }

        DirectoryInfo current = new(fullPath);
        while (current != null) {
            if (current.Exists && (current.Attributes & FileAttributes.ReparsePoint) != 0) {
                throw new ArchivePreviewException("unsafeEntryPath", "壓縮檔輸出包含不安全的 reparse point。", 400);
            }
            if (string.Equals(current.FullName.TrimEnd(Path.DirectorySeparatorChar), root.TrimEnd(Path.DirectorySeparatorChar), StringComparison.OrdinalIgnoreCase)) {
                break;
            }
            current = current.Parent;
        }
    }

    private void RecordRequest(int entryId) {
        DateTime now = DateTime.UtcNow;
        while (_requestHistory.Count > 0 && (now - _requestHistory.Peek().Timestamp).TotalMilliseconds > RequestHistoryMilliseconds) {
            _requestHistory.Dequeue();
        }
        _requestHistory.Enqueue((entryId, now));
    }

    private bool IsBulkRequestDetected() {
        HashSet<int> recentIds = _requestHistory.Select(item => item.EntryId).ToHashSet();
        if (recentIds.Count <= PreviewThreshold) {
            return false;
        }

        // 只有 entry 順序相鄰的請求才升級 bulk，避免使用者在不同位置零星開啟
        // 13 個檔案時誤觸發 300 個 entry 的預取。
        int[] positions = recentIds
            .Select(entryId => _fileEntries.FindIndex(entry => entry.EntryId == entryId))
            .Where(position => position >= 0)
            .ToArray();
        return positions.Length > PreviewThreshold
            && positions.Max() - positions.Min() + 1 <= positions.Length + 2;
    }

    private void AddBulkPrefetch(int currentEntryId) {
        int currentPosition = _fileEntries.FindIndex(entry => entry.EntryId == currentEntryId);
        if (currentPosition < 0) {
            return;
        }

        int end = Math.Min(_fileEntries.Count, currentPosition + BulkPrefetchCount);
        for (int i = currentPosition; i < end; i++) {
            ArchiveFileEntry entry = _fileEntries[i];
            if (entry.Size < MaxEntryUnpackedBytes
                && File.Exists(GetFinalPath(entry)) == false
                && _inflight.ContainsKey(entry.EntryId) == false) {
                _inflight.Add(entry.EntryId, new TaskCompletionSource<string>(TaskCreationOptions.RunContinuationsAsynchronously));
                _pending.Add(entry.EntryId);
            }
        }
    }

    /// <summary>
    /// 取得目前尚未完成 materialize 的所有檔案 entry。
    /// 固實壓縮檔超過 10 MB 時，第一次請求會使用這份清單一次完整解壓，
    /// 避免使用者逐一開啟檔案時，每個 entry 都從 solid block 起點重新解碼。
    /// 此方法由 ProcessPendingAsync 持有 _gate 時呼叫。
    /// </summary>
    private List<int> GetUnmaterializedEntryIds() {
        return _fileEntries
            .Where(entry => entry.Size < MaxEntryUnpackedBytes && File.Exists(GetFinalPath(entry)) == false)
            .Select(entry => entry.EntryId)
            .ToList();
    }

    private void Schedule(TimeSpan dueTime) {
        _timer ??= new System.Threading.Timer(_ => _ = ProcessPendingAsync(), null, Timeout.InfiniteTimeSpan, Timeout.InfiniteTimeSpan);
        _timer.Change(dueTime, Timeout.InfiniteTimeSpan);
    }

    private async Task ProcessPendingAsync() {
        List<int> work;
        lock (_gate) {
            if (_disposed || _processing || _pending.Count == 0) {
                return;
            }
            _processing = true;
            work = _pending.ToList();
            _pending.Clear();
        }

        try {
            if (IsSolid && _sourceSnapshot.Length > SolidFullExtractionThresholdBytes) {
                lock (_gate) {
                    work = GetUnmaterializedEntryIds();
                }
                if (work.Count > 0) {
                    await ExtractBatchesAsync(work);
                }
            }
            else if (IsSolid && work.Count > 1) {
                await ExtractBatchesAsync(work);
            }
            else {
                foreach (int entryId in work) {
                    await ExtractSingleAsync(entryId);
                }
            }
        }
        finally {
            lock (_gate) {
                _processing = false;
                if (_pending.Count > 0) {
                    Schedule(Debounce);
                }
            }
        }
    }

    /// <summary>
    /// 將固實壓縮檔的批次工作依未壓縮大小切成數批，避免一次建立過大的 staging 目錄。
    /// 每個 entry 都已在 QueueEntryAsync 或 metadata 階段通過單一檔案限制，因此
    /// 不會出現單一 entry 無法放入批次的情況。
    /// </summary>
    private async Task ExtractBatchesAsync(List<int> entryIds) {
        List<int> batch = new();
        long batchSize = 0;

        foreach (int entryId in entryIds) {
            long entrySize = _entriesById[entryId].Size;
            if (batch.Count > 0 && batchSize + entrySize > MaxBatchUnpackedBytes) {
                await ExtractBatchAsync(batch).ConfigureAwait(false);
                batch = new List<int>();
                batchSize = 0;
            }

            batch.Add(entryId);
            batchSize += entrySize;
        }

        if (batch.Count > 0) {
            await ExtractBatchAsync(batch).ConfigureAwait(false);
        }
    }

    private async Task ExtractSingleAsync(int entryId) {
        ArchiveFileEntry entry = _entriesById[entryId];
        string finalPath = GetFinalPath(entry);
        string partialPath = finalPath + ".partial";
        try {
            await RunNativeExtractionAsync(() => {
                EnsureTempSpace(entry.Size);
                Directory.CreateDirectory(_tempDirectory);
                lock (_extractorGate) {
                    using FileStream output = new(partialPath, FileMode.Create, FileAccess.Write, FileShare.Read);
                    _extractor.ExtractFile(entry.EntryId, output);
                }
                File.Move(partialPath, finalPath, true);
            });
            CompleteSuccess(entry, finalPath);
        }
        catch (Exception ex) {
            TryDelete(partialPath);
            CompleteFailure(entry.EntryId, ClassifySessionException(ex));
        }
    }

    private async Task ExtractBatchAsync(List<int> entryIds) {
        string stagingDirectory = Path.Combine(_tempDirectory, ".staging-" + Guid.NewGuid().ToString("N"));
        try {
            long batchSize = entryIds.Sum(id => _entriesById[id].Size);
            EnsureTempSpace(batchSize);
            Directory.CreateDirectory(stagingDirectory);
            await RunNativeExtractionAsync(() => {
                lock (_extractorGate) {
                    _extractor.ExtractFiles(stagingDirectory, entryIds.ToArray());
                }
            });

            foreach (int entryId in entryIds) {
                ArchiveFileEntry entry = _entriesById[entryId];
                string stagingPath = Path.Combine(stagingDirectory, entry.NormalizedName.Replace('/', Path.DirectorySeparatorChar));
                string finalPath = GetFinalPath(entry);
                ValidateStagingPath(stagingDirectory, stagingPath);
                if (File.Exists(stagingPath) == false) {
                    throw new ArchivePreviewException("entryExtractFailed", "批次解壓縮後找不到輸出檔案。", 500);
                }
                string partialPath = finalPath + ".partial";
                File.Copy(stagingPath, partialPath, true);
                File.Move(partialPath, finalPath, true);
                CompleteSuccess(entry, finalPath);
            }
        }
        catch (Exception ex) {
            ArchivePreviewException error = ClassifySessionException(ex);
            foreach (int entryId in entryIds) {
                CompleteFailure(entryId, error);
            }
        }
        finally {
            TryDeleteDirectory(stagingDirectory);
        }
    }

    /// <summary>
    /// 在全域 worker pool 中執行 native 解壓工作。
    /// SharpSevenZip DLL 沒有提供可安全中止目前 native 呼叫的 API，因此不能用
    /// WaitAsync 偽造硬 timeout；關閉 session 時會等待這個工作完成後再 Dispose。
    /// </summary>
    private async Task RunNativeExtractionAsync(Action action) {
        await _workerPool.WaitAsync().ConfigureAwait(false);
        try {
            await Task.Run(action).ConfigureAwait(false);
        }
        finally {
            _workerPool.Release();
        }
    }

    private void EnsureTempSpace(long additionalBytes) {
        if (_materializedBytes + additionalBytes > MaxSessionTempBytes) {
            throw new ArchivePreviewException("tempSpaceLimitExceeded", "壓縮檔暫存空間超過限制。", 413);
        }
        DriveInfo drive = new(Path.GetPathRoot(_tempDirectory) ?? _tempDirectory);
        if (drive.AvailableFreeSpace < additionalBytes) {
            throw new ArchivePreviewException("tempSpaceLimitExceeded", "系統可用暫存空間不足。", 413);
        }
    }

    private string GetFinalPath(ArchiveFileEntry entry) {
        string extension = entry.Extension;
        return Path.Combine(_tempDirectory, entry.EntryId.ToString() + extension);
    }

    private void CompleteSuccess(ArchiveFileEntry entry, string path) {
        lock (_gate) {
            if (_disposed) {
                return;
            }
            _materializedBytes += entry.Size;
            _inflight.Remove(entry.EntryId, out TaskCompletionSource<string> completion);
            completion?.TrySetResult(path);
            Touch();
        }
        TouchFile(path);
    }

    private void CompleteFailure(int entryId, ArchivePreviewException error) {
        lock (_gate) {
            _inflight.Remove(entryId, out TaskCompletionSource<string> completion);
            completion?.TrySetException(error);
        }
    }

    private ArchivePreviewException ClassifySessionException(Exception exception, bool isPasswordVerification = false) {
        if (exception is ArchivePreviewException archiveException) {
            return archiveException;
        }

        if (isPasswordVerification) {
            return new ArchivePreviewException(
                string.IsNullOrEmpty(_password) ? "passwordRequired" : "passwordIncorrect",
                string.IsNullOrEmpty(_password) ? "壓縮檔需要密碼。" : "壓縮檔密碼錯誤。",
                401,
                exception);
        }
        return new ArchivePreviewException("entryExtractFailed", "壓縮檔 entry 解壓失敗。", 500, exception);
    }

    private void Touch() {
        _lastAccessUtc = DateTime.UtcNow;
    }

    private static void TouchFile(string path) {
        try {
            if (File.Exists(path)) {
                File.SetLastAccessTimeUtc(path, DateTime.UtcNow);
            }
        }
        catch { }
    }

    private void ThrowIfDisposed() {
        if (_disposed) {
            throw new ObjectDisposedException(nameof(ArchivePreviewSession));
        }
    }

    private static void TryDelete(string path) {
        try {
            if (File.Exists(path)) {
                File.Delete(path);
            }
        }
        catch { }
    }

    private static void TryDeleteDirectory(string path) {
        try {
            if (Directory.Exists(path)) {
                Directory.Delete(path, true);
            }
        }
        catch { }
    }

    public void Dispose() {
        TaskCompletionSource<string>[] completions;
        lock (_gate) {
            if (_disposed) {
                return;
            }
            _disposed = true;
            _timer?.Dispose();
            _timer = null;
            completions = _inflight.Values.ToArray();
            _inflight.Clear();
            _pending.Clear();
        }

        foreach (TaskCompletionSource<string> completion in completions) {
            completion.TrySetException(new ArchivePreviewException("sessionClosed", "壓縮檔 session 已關閉。", 410));
        }

        // 不可在持有 _gate 時等待 _extractorGate，否則 native 工作完成後
        // 回呼 CompleteSuccess 需要取得 _gate，會形成死結。
        lock (_extractorGate) {
            _extractor?.Dispose();
            _extractor = null;
        }
        _password = null;
    }
}

internal sealed class ArchiveFileEntry {
    /// <summary> 7-Zip entry index，也是暫存檔名稱的唯一索引部分。 </summary>
    public int EntryId { get; private set; }

    /// <summary> 壓縮檔內的原始檔案名稱或相對路徑。 </summary>
    public string Name { get; private set; } = "";

    /// <summary>
    /// 經過路徑安全檢查後的標準化相對路徑，只用於批次解壓 staging 目錄映射。
    /// </summary>
    public string NormalizedName { get; set; } = "";

    /// <summary> entry 的未壓縮大小，單位為 bytes。 </summary>
    public long Size { get; private set; }

    /// <summary>
    /// entry 的最後修改時間，使用 Unix milliseconds UTC；來源沒有提供時間時為 0。
    /// </summary>
    public long LastWriteTimeUtc { get; private set; }

    /// <summary> 是否為資料夾 entry。 </summary>
    public bool IsDirectory { get; private set; }

    /// <summary> 是否為加密 entry。 </summary>
    public bool IsEncrypted { get; private set; }

    /// <summary>
    /// 後端產生暫存檔時使用的副檔名。此欄位不再傳給前端，
    /// 但仍需保留，讓 Windows 與外部程式可以依副檔名判斷檔案類型。
    /// </summary>
    public string Extension { get; private set; } = "";

    /// <summary>
    /// 將 SharpSevenZip 的 entry metadata 轉成服務內部模型。
    /// 副檔名過長或包含路徑分隔符時改用 .bin，避免暫存檔名稱逃逸
    /// session 暫存資料夾或造成不合理的檔名。
    /// </summary>
    /// <param name="file">SharpSevenZip 回傳的 entry metadata。</param>
    /// <returns>服務內部使用的 entry 模型。</returns>
    public static ArchiveFileEntry Create(ArchiveFileInfo file) {
        string extension = Path.GetExtension(file.FileName ?? "");
        if (extension.Length > 20 || extension.Contains('/') || extension.Contains('\\')) {
            extension = ".bin";
        }
        return new ArchiveFileEntry {
            EntryId = file.Index,
            Name = file.FileName ?? "",
            Size = file.Size > (ulong)long.MaxValue ? long.MaxValue : (long)file.Size,
            LastWriteTimeUtc = ToUnixMilliseconds(file.LastWriteTime),
            IsDirectory = file.IsDirectory,
            IsEncrypted = file.Encrypted,
            Extension = extension
        };
    }

    /// <summary>
    /// 將 SharpSevenZip 的 entry 時間轉成前端既有的 Unix milliseconds UTC 格式。
    /// SharpSevenZip 對沒有時間的 entry 會回傳 default DateTime，統一以 0 表示。
    /// </summary>
    private static long ToUnixMilliseconds(DateTime time) {
        if (time == default) {
            return 0;
        }

        DateTime utcTime = time.Kind == DateTimeKind.Utc ? time : time.ToUniversalTime();
        long unixMilliseconds = new DateTimeOffset(utcTime).ToUnixTimeMilliseconds();
        return unixMilliseconds > 0 ? unixMilliseconds : 0;
    }

    /// <summary>
    /// 轉成公開 API 使用的 metadata。
    /// 內部 Extension 不回傳，前端取得實體路徑時應使用 entry-path，
    /// 避免自行猜測後端實際產生的暫存檔名稱。
    /// </summary>
    /// <returns>不含內部暫存檔命名細節的 entry metadata。</returns>
    public ArchiveEntryInfoResult ToResult() {
        return new ArchiveEntryInfoResult {
            entryId = EntryId,
            name = Name,
            size = Size,
            lastWriteTimeUtc = LastWriteTimeUtc,
            isDirectory = IsDirectory
        };
    }
}
