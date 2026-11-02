namespace Tiefsee;

/// <summary>使用者收藏清單的儲存格式。</summary>
public sealed class FavoritesDocument {
    public int Version { get; set; } = 1;
    public List<FavoriteItem> Items { get; set; } = [];
}

/// <summary>收藏項目；Group 僅允許出現在最外層。</summary>
public sealed class FavoriteItem {
    public string Id { get; set; } = "";
    public string Type { get; set; } = "file";
    public string Name { get; set; } = "";
    public string Path { get; set; } = "";
    public string LoadContent { get; set; } = "firstFile";
    public List<FavoriteItem> Items { get; set; } = [];
}
