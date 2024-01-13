namespace Tiefsee;

/// <summary>
/// 快取。超過數量時，把使用最少使用的項目清除掉
/// </summary>
public class LRUCache<TKey, TValue> {
    private readonly int _capacity;
    private readonly Dictionary<TKey, LinkedListNode<CacheItem>> _cache;
    private readonly LinkedList<CacheItem> _lruList;

    public LRUCache(int capacity) {
        _capacity = capacity;
        _cache = new Dictionary<TKey, LinkedListNode<CacheItem>>(capacity);
        _lruList = new LinkedList<CacheItem>();
    }

    public TValue Get(TKey key) {
        if (_cache.TryGetValue(key, out var node)) {
            // Move accessed node to the head of the list.
            _lruList.Remove(node);
            _lruList.AddFirst(node);
            return node.Value.Value;
        }

        return default;
    }

    public void Add(TKey key, TValue value) {
        if (_cache.Count >= _capacity) {
            // Remove least recently used item.
            _cache.Remove(_lruList.Last.Value.Key);
            _lruList.RemoveLast();
        }

        var cacheItem = new CacheItem { Key = key, Value = value };
        var newNode = new LinkedListNode<CacheItem>(cacheItem);
        _lruList.AddFirst(newNode);
        _cache.Add(key, newNode);
    }

    private class CacheItem {
        public TKey Key { get; set; }
        public TValue Value { get; set; }
    }
}
