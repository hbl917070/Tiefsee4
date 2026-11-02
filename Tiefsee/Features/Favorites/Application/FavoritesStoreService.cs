using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Tiefsee;

/// <summary>收藏 JSON 的非同步讀寫與路徑正規化。</summary>
public sealed class FavoritesStoreService {

    // 只序列化本程序的讀寫；刻意不做多視窗即時同步或跨程序鎖定。
    private static readonly SemaphoreSlim FileGate = new(1, 1);
    private static readonly JsonSerializerOptions JsonOptions = new() {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    private static string GetFilePath() => Path.Combine(Program.runtimeContext.AppData, "Favorites.json");

    public async Task<string> ReadJson() {
        await FileGate.WaitAsync();
        try {
            string path = GetFilePath();
            if (File.Exists(path) == false) {
                // 尚未建立收藏檔時，以空的 v1 文件供前端使用，不在讀取階段建立實體檔。
                return JsonSerializer.Serialize(new FavoritesDocument(), JsonOptions);
            }
            string json = await File.ReadAllTextAsync(path);
            FavoritesDocument document = JsonSerializer.Deserialize<FavoritesDocument>(json, JsonOptions)
                ?? throw new InvalidDataException("Favorites.json 格式無效。");
            if (document.Version != 1) {
                throw new InvalidDataException("不支援的收藏資料版本。");
            }
            document.Items ??= [];
            return JsonSerializer.Serialize(document, JsonOptions);
        }
        finally {
            FileGate.Release();
        }
    }

    public async Task SaveJson(string json) {
        FavoritesDocument document = JsonSerializer.Deserialize<FavoritesDocument>(json, JsonOptions)
            ?? throw new InvalidDataException("收藏資料格式無效。");
        if (document.Version != 1 || document.Items == null) {
            throw new InvalidDataException("不支援的收藏資料版本。");
        }
        NormalizeItems(document.Items, allowGroup: true, new HashSet<string>(StringComparer.Ordinal));

        await FileGate.WaitAsync();
        string tempPath = null;
        try {
            string filePath = GetFilePath();
            Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
            tempPath = filePath + "." + Guid.NewGuid().ToString("N") + ".tmp";
            await File.WriteAllTextAsync(tempPath, JsonSerializer.Serialize(document, JsonOptions));
            // 同目錄暫存後再替換，避免中斷時留下半份 Favorites.json。
            File.Move(tempPath, filePath, overwrite: true);
        }
        finally {
            if (tempPath != null && File.Exists(tempPath)) {
                try { File.Delete(tempPath); } catch { }
            }
            FileGate.Release();
        }
    }

    // Shell 路徑存在性查詢放到背景執行；此處不掃描資料夾內容或取得圖示。
    public Task<bool> Exists(string type, string path) => Task.Run(() =>
        type == "directory" ? Directory.Exists(path) : type == "file" && File.Exists(path));

    private static void NormalizeItems(List<FavoriteItem> items, bool allowGroup, HashSet<string> ids) {
        foreach (FavoriteItem item in items) {
            if (item == null || string.IsNullOrWhiteSpace(item.Id)) {
                throw new InvalidDataException("收藏項目缺少識別碼。");
            }
            if (ids.Add(item.Id) == false) {
                throw new InvalidDataException("收藏項目識別碼重複。");
            }
            if (item.Type == "group") {
                if (allowGroup == false) {
                    throw new InvalidDataException("收藏資料夾不能再包含收藏資料夾。");
                }
                item.Items ??= [];
                item.Path = "";
                NormalizeItems(item.Items, allowGroup: false, ids);
                continue;
            }
            if (item.Type != "file" && item.Type != "directory") {
                throw new InvalidDataException("收藏項目類型無效。");
            }
            if (string.IsNullOrWhiteSpace(item.Path)) {
                throw new InvalidDataException("收藏項目路徑不可空白。");
            }
            item.Path = Path.GetFullPath(item.Path);
            item.Items = [];
            if (item.LoadContent != "firstDirectory") item.LoadContent = "firstFile";
            if (item.Type == "file") item.LoadContent = "firstFile";
        }
    }
}
