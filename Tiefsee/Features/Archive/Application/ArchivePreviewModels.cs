namespace Tiefsee;

/// <summary>
/// 壓縮檔內單一 entry 的 metadata。
///
/// 這份資料會隨 sessions/open 一次回傳給前端，因為初始化時已經讀取並驗證
/// 壓縮檔的完整目錄，不再另外提供 entries API 重複傳輸相同列表。
///
/// entryId 直接沿用 7-Zip 的 entry index。它只在目前 session 內有意義，
/// 前端不應把 entryId 當成跨壓縮檔的全域檔案識別碼。
/// </summary>
public sealed class ArchiveEntryInfoResult {
    /// <summary>
    /// entry 在原始壓縮檔中的索引，也是暫存檔檔名的主要部分。
    /// </summary>
    public int entryId { get; set; }

    /// <summary>
    /// 壓縮檔內的原始相對路徑，僅供前端顯示、排序與判斷檔案名稱。
    /// 此值不會直接用來組合暫存檔實體路徑。
    /// </summary>
    public string name { get; set; } = "";

    /// <summary>
    /// entry 解壓後的大小，單位為 bytes。
    /// 這是未壓縮大小，初始化時會用它計算整個壓縮檔的總大小；實際解壓該 entry
    /// 前，服務也會用它檢查單一檔案大小限制。
    /// </summary>
    public long size { get; set; }

    /// <summary>
    /// entry 的最後修改時間，使用 Unix milliseconds UTC；壓縮檔沒有提供時間時為 0。
    /// </summary>
    public long lastWriteTimeUtc { get; set; }

    /// <summary>
    /// 是否為資料夾。資料夾可以出現在 metadata 中，但不能作為 entry 解壓縮目標。
    /// </summary>
    public bool isDirectory { get; set; }

    /// <summary>
    /// 是否禁止由 Tiefsee 主動 materialize；包含高風險類型、無需預覽的封裝檔
    /// 與超過單一 entry 大小上限的檔案。
    /// </summary>
    public bool isHighRisk { get; set; }
}

/// <summary>
/// 壓縮檔 session 初始化結果。
///
/// session 代表一個固定來源版本的壓縮檔。服務會在記憶體中保留 native extractor、
/// entry metadata、密碼與已解壓的暫存檔索引；前端後續只需要使用 sessionId 與 entryId
/// 取得內容、縮圖或實體暫存路徑。
/// </summary>
public sealed class ArchiveSessionResult {
    /// <summary>
    /// 初始化結果狀態。正常完成時為 ready。
    /// </summary>
    public string status { get; set; } = "ready";

    /// <summary>
    /// 壓縮檔來源 fingerprint 的短識別碼。相同來源版本可以重用同一個暫存資料夾。
    /// </summary>
    public string sessionId { get; set; } = "";

    /// <summary>
    /// 正規化後的原始壓縮檔路徑。
    /// 此欄位主要供前端顯示或記錄，不應取代 sessionId 作為後續 API 的識別碼。
    /// </summary>
    public string archivePath { get; set; } = "";

    /// <summary>
    /// 由 SharpSevenZip 判斷出的壓縮格式，例如 7z、Zip 或 Rar。
    /// </summary>
    public string format { get; set; } = "";

    /// <summary>
    /// 是否為固實壓縮檔。固實壓縮檔的多檔請求會由 session scheduler 優先合併處理。
    /// </summary>
    public bool isSolid { get; set; }

    /// <summary>
    /// 固實壓縮檔的 block 數量；SharpSevenZip 無法提供時為 0。
    /// 固實且只有一個 block 時，後段 entry 可能需要從 block 起點重新解碼，
    /// 是後續判斷初始化後預覽成本的重要特徵。
    /// </summary>
    public int solidBlockCount { get; set; }

    /// <summary>
    /// 壓縮檔使用的壓縮方法描述，例如 LZMA2:48m。
    /// 此值只作為診斷與風險判斷資料，不由前端自行解析成解壓流程。
    /// </summary>
    public string compressionMethod { get; set; } = "";

    /// <summary>
    /// 所有檔案 entry 的未壓縮大小總和；資料夾不計入。
    /// </summary>
    public long totalUnpackedBytes { get; set; }

    /// <summary>
    /// 壓縮檔是否包含至少一個加密 entry。
    /// 此屬性描述壓縮檔本身，不會因 session 關閉而改變。
    /// </summary>
    public bool hasEncryptedEntries { get; set; }

    /// <summary>
    /// 目前 session 是否已經使用密碼成功驗證過加密內容。
    /// 無密碼壓縮檔會直接視為 true；加密壓縮檔只有實際解壓成功後才會是 true。
    /// </summary>
    public bool isPasswordVerified { get; set; }

    /// <summary>
    /// session 專用的暫存資料夾。entry 實際解壓後會放在此資料夾下。
    /// 前端只有在需要交給 Windows 或外部程式時才應使用實體路徑。
    /// </summary>
    public string tempDirectory { get; set; } = "";

    /// <summary>
    /// 初始化時讀取並驗證的 entry metadata 列表。
    /// 列表包含資料夾項目，但資料夾不能呼叫 entry、entry-path 或縮圖 API 進行解壓。
    /// </summary>
    public ArchiveEntryInfoResult[] entries { get; set; } = Array.Empty<ArchiveEntryInfoResult>();
}

/// <summary>
/// entry 解壓完成後的實體暫存路徑結果。
///
/// entry-path API 不只是根據 entryId 計算檔名，它會先經過 session scheduler
/// 確保 entry 已完整解壓並通過檔案存在檢查，再回傳 physicalPath。
/// </summary>
public sealed class ArchivePhysicalPathResult {
    /// <summary>
    /// 結果狀態。成功時為 ready。
    /// </summary>
    public string status { get; set; } = "ready";

    /// <summary>
    /// 對應的壓縮檔 session 識別碼。
    /// </summary>
    public string sessionId { get; set; } = "";

    /// <summary>
    /// 對應的壓縮檔 entry 索引。
    /// </summary>
    public int entryId { get; set; }

    /// <summary>
    /// 已完成解壓的 Windows 實體檔案路徑。
    /// 此路徑可提供給小畫家、列印或其他需要實體檔案的外部程式。
    /// </summary>
    public string physicalPath { get; set; } = "";

    /// <summary>
    /// 原始壓縮檔內的 entry 名稱，供外部操作或前端顯示使用。
    /// </summary>
    public string fileName { get; set; } = "";
}

/// <summary>
/// 統一的壓縮檔 API 錯誤例外。
///
/// HTTP endpoint 會將此例外轉換成 ArchiveErrorResult，讓前端可以依 errorCode
/// 區分需要密碼、來源變更、超過大小限制或 entry 不存在等預期錯誤。
/// </summary>
public sealed class ArchivePreviewException : Exception {
    /// <summary>
    /// 穩定的程式錯誤代碼。前端不應依賴 message 文字判斷錯誤類型。
    /// </summary>
    public string ErrorCode { get; }

    /// <summary>
    /// 此錯誤對應的 HTTP status code。
    /// </summary>
    public int StatusCode { get; }

    /// <summary>
    /// 建立壓縮檔預覽錯誤。
    /// </summary>
    /// <param name="errorCode">供前端判斷的穩定錯誤代碼。</param>
    /// <param name="message">提供使用者或 log 參考的錯誤訊息。</param>
    /// <param name="statusCode">回傳給 HTTP client 的狀態碼。</param>
    /// <param name="innerException">底層 SharpSevenZip 或檔案系統例外。</param>
    public ArchivePreviewException(string errorCode, string message, int statusCode = 400, Exception innerException = null)
        : base(message, innerException) {
        ErrorCode = errorCode;
        StatusCode = statusCode;
    }
}

/// <summary>
/// 壓縮檔 API 的統一錯誤回應格式。
/// </summary>
public sealed class ArchiveErrorResult {
    /// <summary>
    /// 錯誤回應固定為 failed。
    /// </summary>
    public string status { get; set; } = "failed";

    /// <summary>
    /// 對應 ArchivePreviewException.ErrorCode 的穩定錯誤代碼。
    /// </summary>
    public string errorCode { get; set; } = "archiveError";

    /// <summary>
    /// 可供使用者閱讀的錯誤訊息。
    /// </summary>
    public string message { get; set; } = "";
}
