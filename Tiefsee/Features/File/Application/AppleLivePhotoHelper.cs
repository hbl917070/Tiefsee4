using MetadataExtractor;
using System.IO;

namespace Tiefsee;

/// <summary>依 Apple Content Identifier 尋找 Live Photo 的配對 MOV。</summary>
internal static class AppleLivePhotoHelper {
    private const int MaxCachedDirectories = 64;
    private static readonly object CacheLock = new();
    private static readonly Dictionary<string, CachedMovieIndex> MovieIndexCache = new(StringComparer.OrdinalIgnoreCase);

    internal static bool HasContentIdentifier(string imagePath) {
        return string.IsNullOrWhiteSpace(GetContentIdentifier(imagePath, "Apple Makernote")) == false;
    }

    internal static MotionPhotoVideoRange GetVideoRange(string imagePath) {
        try {
            string identifier = GetContentIdentifier(imagePath, "Apple Makernote");
            if (string.IsNullOrWhiteSpace(identifier)) return null;

            string directory = Path.GetDirectoryName(Path.GetFullPath(imagePath));
            if (string.IsNullOrEmpty(directory)) return null;
            Dictionary<string, string> index = GetMovieIndex(directory);
            if (index.TryGetValue(identifier, out string moviePath) == false) return null;

            var movieInfo = new FileInfo(moviePath);
            if (movieInfo.Exists == false || movieInfo.Length <= 0) return null;
            return new MotionPhotoVideoRange {
                SourcePath = movieInfo.FullName,
                VideoLength = movieInfo.Length,
            };
        }
        catch {
            return null;
        }
    }

    private static Dictionary<string, string> GetMovieIndex(string directory) {
        MovieFileStamp[] movieFiles = GetMovieFileStamps(directory);
        lock (CacheLock) {
            if (MovieIndexCache.TryGetValue(directory, out CachedMovieIndex cachedCurrent)
                && HasSameFiles(cachedCurrent.MovieFiles, movieFiles)) {
                return cachedCurrent.MoviesByIdentifier;
            }
        }

        // Metadata extraction can be slow; keep it outside the global cache lock so
        // resolving a Live Photo in one folder does not block unrelated folders.
        var moviesByIdentifier = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var ambiguousIdentifiers = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (MovieFileStamp movie in movieFiles) {
            string identifier = GetContentIdentifier(movie.Path, "QuickTime Metadata Header");
            if (string.IsNullOrWhiteSpace(identifier)) continue;

            if (moviesByIdentifier.ContainsKey(identifier)) {
                moviesByIdentifier.Remove(identifier);
                ambiguousIdentifiers.Add(identifier);
            }
            else if (ambiguousIdentifiers.Contains(identifier) == false) {
                moviesByIdentifier.Add(identifier, movie.Path);
            }
        }

        lock (CacheLock) {
            if (MovieIndexCache.TryGetValue(directory, out CachedMovieIndex cachedFromConcurrentScan)
                && HasSameFiles(cachedFromConcurrentScan.MovieFiles, movieFiles)) {
                return cachedFromConcurrentScan.MoviesByIdentifier;
            }
            if (MovieIndexCache.ContainsKey(directory) == false && MovieIndexCache.Count >= MaxCachedDirectories) {
                string oldestDirectory = MovieIndexCache.Keys.First();
                MovieIndexCache.Remove(oldestDirectory);
            }
            MovieIndexCache[directory] = new CachedMovieIndex(movieFiles, moviesByIdentifier);
            return moviesByIdentifier;
        }
    }

    private static MovieFileStamp[] GetMovieFileStamps(string directory) {
        return System.IO.Directory.EnumerateFiles(directory, "*", SearchOption.TopDirectoryOnly)
            .Where(path => Path.GetExtension(path).Equals(".mov", StringComparison.OrdinalIgnoreCase))
            .Select(path => new FileInfo(path))
            .Where(file => file.Exists)
            .Select(file => new MovieFileStamp(
                file.FullName,
                file.Length,
                file.CreationTimeUtc.Ticks,
                file.LastWriteTimeUtc.Ticks))
            .OrderBy(file => file.Path, StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    private static bool HasSameFiles(MovieFileStamp[] left, MovieFileStamp[] right) {
        if (left.Length != right.Length) return false;
        for (int i = 0; i < left.Length; i++) {
            if (string.Equals(left[i].Path, right[i].Path, StringComparison.OrdinalIgnoreCase) == false
                || left[i].Length != right[i].Length
                || left[i].CreationTimeTicks != right[i].CreationTimeTicks
                || left[i].LastWriteTimeTicks != right[i].LastWriteTimeTicks) {
                return false;
            }
        }
        return true;
    }

    private static string GetContentIdentifier(string path, string directoryName) {
        try {
            IEnumerable<MetadataExtractor.Directory> directories = ImageMetadataReader.ReadMetadata(path);
            MetadataExtractor.Directory directory = directories.FirstOrDefault(x => x.Name == directoryName);
            if (directory == null) return null;
            Tag tag = directory.Tags.FirstOrDefault(x => x.Name == "Content Identifier");
            return tag?.Description?.Trim();
        }
        catch {
            return null;
        }
    }

    private sealed record MovieFileStamp(string Path, long Length, long CreationTimeTicks, long LastWriteTimeTicks);
    private sealed record CachedMovieIndex(MovieFileStamp[] MovieFiles, Dictionary<string, string> MoviesByIdentifier);
}
