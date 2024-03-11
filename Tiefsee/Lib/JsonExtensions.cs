using System.Text.Json;

namespace Tiefsee;

public static class JsonExtensions {

    public static string GetString(this JsonDocument json, string key) {
        return json.RootElement.GetProperty(key).GetString();
    }

    public static string TryGetString(this JsonDocument json, string key) {
        if (json.RootElement.TryGetProperty(key, out var value)) {
            return value.GetString();
        }
        return null;
    }

    public static int GetInt32(this JsonDocument json, string key) {
        return json.RootElement.GetProperty(key).GetInt32();
    }

    public static int? TryGetInt32(this JsonDocument json, string key) {
        if (json.RootElement.TryGetProperty(key, out var value)) {
            return value.GetInt32();
        }
        return null;
    }

    public static string[] GetStringArray(this JsonDocument json, string key) {
        return json.RootElement.GetProperty(key)
            .EnumerateArray()
            .Select(x => x.GetString())
            .ToArray();
    }

    public static string[] TryGetStringArray(this JsonDocument json, string key) {
        if (json.RootElement.TryGetProperty(key, out var value)) {
            return value.EnumerateArray()
                .Select(x => x.GetString())
                .ToArray();
        }
        return null;
    }
}
