using System.IO;
using System.Globalization;
using System.Text;
using System.Xml;

namespace Tiefsee;

/// <summary>辨識 JPEG 或 HEIF Motion Photo 並回傳其影片範圍。</summary>
public static class MotionPhotoHelper {
    private const string XmpIdentifier = "http://ns.adobe.com/xap/1.0/\0";
    private const string CameraNamespace = "http://ns.google.com/photos/1.0/camera/";
    private const string ContainerItemNamespace = "http://ns.google.com/photos/1.0/container/item/";
    private const long MaxJpegHeaderScanBytes = 4L * 1024 * 1024;
    private const int MaxJpegHeaderSegments = 1024;

    /// <summary>只檢查目前檔案是否帶有 Motion Photo 標記，不尋找外部影片。</summary>
    internal static bool HasMotionPhoto(string path) {
        try {
            using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            if (stream.Length < 4) return false;

            if (ReadByte(stream) == 0xFF && ReadByte(stream) == 0xD8) {
                string xmp = ReadXmp(stream);
                return xmp != null && ParseInfo(xmp, stream) != null;
            }

            return HeifMotionPhotoHelper.HasMotionPhotoMarker(stream)
                || AppleLivePhotoHelper.HasContentIdentifier(path);
        }
        catch {
            return false;
        }
    }

    /// <summary>按下播放時才解析內嵌影片範圍或尋找 Apple 配對 MOV。</summary>
    internal static MotionPhotoVideoRange GetVideoRange(string path) {
        try {
            using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            if (stream.Length < 4) return null;

            if (ReadByte(stream) == 0xFF && ReadByte(stream) == 0xD8) {
                string xmp = ReadXmp(stream);
                return xmp == null ? null : ParseInfo(xmp, stream);
            }

            return HeifMotionPhotoHelper.GetVideoRange(stream)
                ?? AppleLivePhotoHelper.GetVideoRange(path);
        }
        catch {
            return null;
        }
    }

    private static string ReadXmp(Stream stream) {
        long scanEnd = Math.Min(stream.Length, MaxJpegHeaderScanBytes);
        int segmentCount = 0;
        while (stream.Position < scanEnd && segmentCount++ < MaxJpegHeaderSegments) {
            if (ReadByte(stream) != 0xFF) return null;
            int marker;
            do { marker = ReadByte(stream); } while (marker == 0xFF);

            if (marker == 0xDA || marker == 0xD9) return null; // SOS / EOI
            if (marker == 0x01 || marker is >= 0xD0 and <= 0xD7) continue; // standalone markers

            int segmentLength = ReadUInt16BigEndian(stream);
            if (segmentLength < 2 || segmentLength - 2 > stream.Length - stream.Position) return null;
            int payloadLength = segmentLength - 2;
            if (payloadLength > scanEnd - stream.Position) return null;
            long payloadStart = stream.Position;

            if (marker == 0xE1 && payloadLength >= XmpIdentifier.Length) {
                var identifier = new byte[XmpIdentifier.Length];
                if (ReadExactly(stream, identifier) &&
                    Encoding.ASCII.GetString(identifier) == XmpIdentifier) {
                    var packet = new byte[payloadLength - identifier.Length];
                    if (ReadExactly(stream, packet) == false) return null;
                    return Encoding.UTF8.GetString(packet);
                }
            }

            stream.Position = payloadStart + payloadLength;
        }
        return null;
    }

    private static MotionPhotoVideoRange ParseInfo(string xmp, Stream stream) {
        var settings = new XmlReaderSettings {
            DtdProcessing = DtdProcessing.Prohibit,
            XmlResolver = null,
            MaxCharactersInDocument = MaxJpegHeaderScanBytes,
        };
        var document = new XmlDocument { XmlResolver = null };
        using (var textReader = new StringReader(xmp))
        using (var xmlReader = XmlReader.Create(textReader, settings)) {
            document.Load(xmlReader);
        }

        XmlElement description = document.SelectSingleNode("//*[local-name()='Description']") as XmlElement;
        if (description == null || GetAttribute(description, CameraNamespace, "MotionPhoto") != "1") return null;
        string version = GetAttribute(description, CameraNamespace, "MotionPhotoVersion");
        if (version != null && version != "1") return null;

        long videoLength = 0;
        XmlNodeList items = document.SelectNodes("//*[local-name()='Directory']//*[local-name()='Item']");
        if (items != null) {
            foreach (XmlNode node in items) {
                if (node is not XmlElement item || GetAttribute(item, ContainerItemNamespace, "Semantic") != "MotionPhoto") continue;
                if (GetAttribute(item, ContainerItemNamespace, "Mime") != "video/mp4") return null;
                if (!long.TryParse(GetAttribute(item, ContainerItemNamespace, "Length"), NumberStyles.None, CultureInfo.InvariantCulture, out videoLength)) return null;
                break;
            }
        }

        if (videoLength <= 0 || videoLength > stream.Length) return null;
        long videoStart = stream.Length - videoLength;
        stream.Position = videoStart;
        Span<byte> header = stackalloc byte[16];
        if (ReadExactly(stream, header) == false || Encoding.ASCII.GetString(header.Slice(4, 4)) != "ftyp") return null;

        uint boxLength = ((uint)header[0] << 24) | ((uint)header[1] << 16) | ((uint)header[2] << 8) | header[3];
        if (boxLength < 16 || boxLength > videoLength) return null;
        return new MotionPhotoVideoRange { VideoStart = videoStart, VideoLength = videoLength };
    }

    private static string GetAttribute(XmlElement element, string namespaceUri, string localName) =>
        element.GetAttributeNode(localName, namespaceUri)?.Value;

    private static int ReadByte(Stream stream) => stream.ReadByte();

    private static bool ReadExactly(Stream stream, byte[] buffer) => ReadExactly(stream, buffer.AsSpan());

    private static bool ReadExactly(Stream stream, Span<byte> buffer) {
        while (buffer.Length > 0) {
            int bytesRead = stream.Read(buffer);
            if (bytesRead == 0) return false;
            buffer = buffer[bytesRead..];
        }
        return true;
    }

    private static int ReadUInt16BigEndian(Stream stream) {
        int high = ReadByte(stream);
        int low = ReadByte(stream);
        return high < 0 || low < 0 ? -1 : (high << 8) | low;
    }
}

internal sealed class MotionPhotoVideoRange {
    internal long VideoStart { get; init; }
    internal long VideoLength { get; init; }
    internal string SourcePath { get; init; }
}
