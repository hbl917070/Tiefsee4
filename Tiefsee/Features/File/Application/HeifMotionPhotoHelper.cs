using System.IO;
using System.Text;

namespace Tiefsee;

/// <summary>解析 HEIF/HEIC 容器中的 Motion Photo 影片。</summary>
internal static class HeifMotionPhotoHelper {
    private const int MaxSefHeaderScanBytes = 1024 * 1024;
    private const int MaxSefVideoOffsetAfterMarker = 128;
    private static readonly byte[] MotionPhotoMarker = Encoding.ASCII.GetBytes("MotionPhoto");
    private static readonly byte[] FtypMarker = Encoding.ASCII.GetBytes("ftyp");

    internal static bool HasMotionPhotoMarker(Stream stream) {
        if (stream.CanSeek == false || IsHeif(stream) == false) return false;

        long position = 0;
        long? samsungSefPayloadStart = null;
        long? samsungSefEnd = null;

        while (position + 8 <= stream.Length) {
            if (TryReadBox(stream, position, stream.Length, out HeifBox box) == false) return false;
            if (box.Type == "mpvd") {
                long videoStart = box.Offset + box.HeaderSize;
                return TryReadBox(stream, videoStart, box.End, out HeifBox videoBox)
                    && videoBox.Type == "ftyp"
                    && videoBox.Size >= 16;
            }
            if (box.Type == "sefd") {
                samsungSefPayloadStart ??= box.Offset + box.HeaderSize;
                samsungSefEnd ??= box.End;
            }
            position = box.End;
        }

        if (samsungSefPayloadStart.HasValue == false || samsungSefEnd.HasValue == false) return false;
        long scanStart = samsungSefPayloadStart.Value;
        int scanLength = (int)Math.Min(MaxSefHeaderScanBytes, samsungSefEnd.Value - scanStart);
        if (scanLength <= 0) return false;

        var header = new byte[scanLength];
        stream.Position = scanStart;
        if (ReadExactly(stream, header) == false) return false;
        int markerIndex = header.AsSpan().IndexOf(MotionPhotoMarker);
        if (markerIndex < 0) return false;

        int searchStart = markerIndex + MotionPhotoMarker.Length;
        int searchLength = Math.Min(MaxSefVideoOffsetAfterMarker, header.Length - searchStart);
        if (searchLength <= 0) return false;
        int ftypIndex = header.AsSpan(searchStart, searchLength).IndexOf(FtypMarker);
        return ftypIndex >= 4;
    }

    internal static MotionPhotoVideoRange GetVideoRange(Stream stream) {
        if (stream.CanSeek == false || IsHeif(stream) == false) return null;

        long position = 0;
        bool hasMotionPhotoBox = false;
        long? samsungSefPayloadStart = null;
        long? samsungSefEnd = null;

        while (position + 8 <= stream.Length) {
            if (TryReadBox(stream, position, stream.Length, out HeifBox box) == false) return null;

            if (box.Type == "mpvd") {
                hasMotionPhotoBox = true;
                long videoStart = box.Offset + box.HeaderSize;
                MotionPhotoVideoRange range = ReadMp4Range(stream, videoStart, box.End);
                if (range != null) return range;
            }
            else if (box.Type == "sefd") {
                samsungSefPayloadStart ??= box.Offset + box.HeaderSize;
                samsungSefEnd ??= box.End;
            }

            position = box.End;
        }

        // Samsung Galaxy S20 HEIC samples store a versionless MotionPhoto payload
        // directly inside a top-level SEF box, without the newer mpvd box.
        if (hasMotionPhotoBox == false && samsungSefPayloadStart.HasValue && samsungSefEnd.HasValue) {
            long scanStart = samsungSefPayloadStart.Value;
            int scanLength = (int)Math.Min(MaxSefHeaderScanBytes, samsungSefEnd.Value - scanStart);
            if (scanLength <= 0) return null;

            var header = new byte[scanLength];
            stream.Position = scanStart;
            if (ReadExactly(stream, header) == false) return null;

            int motionPhotoIndex = header.AsSpan().IndexOf(MotionPhotoMarker);
            if (motionPhotoIndex < 0) return null;

            int searchStart = motionPhotoIndex + MotionPhotoMarker.Length;
            int searchLength = Math.Min(MaxSefVideoOffsetAfterMarker, header.Length - searchStart);
            if (searchLength <= 0) return null;

            int ftypIndex = header.AsSpan(searchStart, searchLength)
                .IndexOf(FtypMarker);
            if (ftypIndex < 4) return null;

            long videoStart = scanStart + motionPhotoIndex + MotionPhotoMarker.Length + ftypIndex - 4;
            return ReadMp4Range(stream, videoStart, samsungSefEnd.Value);
        }

        return null;
    }

    private static bool IsHeif(Stream stream) {
        if (TryReadBox(stream, 0, stream.Length, out HeifBox box) == false || box.Type != "ftyp" || box.Size < 16) return false;

        stream.Position = 8;
        Span<byte> brand = stackalloc byte[4];
        if (ReadExactly(stream, brand) == false) return false;

        string majorBrand = Encoding.ASCII.GetString(brand);
        return majorBrand is "heic" or "heix" or "hevc" or "hevx" or "heim" or "heis" or "mif1" or "msf1";
    }

    private static MotionPhotoVideoRange ReadMp4Range(Stream stream, long videoStart, long containerEnd) {
        if (videoStart < 0 || videoStart + 16 > containerEnd) return null;

        long position = videoStart;
        bool hasFileType = false;
        bool hasMediaData = false;
        bool hasMovie = false;

        while (position + 8 <= containerEnd) {
            if (TryReadBox(stream, position, containerEnd, out HeifBox box) == false) break;
            if (box.Type == "sefd" || box.Type == "SEFH" || box.Type == "SEFT") break;

            if (hasFileType == false) {
                if (box.Type != "ftyp" || box.Size < 16) return null;
                hasFileType = true;
            }

            hasMediaData |= box.Type == "mdat";
            hasMovie |= box.Type == "moov";
            position = box.End;
        }

        if (hasFileType == false || hasMediaData == false || hasMovie == false || position <= videoStart) return null;
        return new MotionPhotoVideoRange { VideoStart = videoStart, VideoLength = position - videoStart };
    }

    private static bool TryReadBox(Stream stream, long offset, long parentEnd, out HeifBox box) {
        box = null;
        if (offset < 0 || offset + 8 > parentEnd || offset + 8 > stream.Length) return false;

        stream.Position = offset;
        Span<byte> header = stackalloc byte[16];
        if (ReadExactly(stream, header[..8]) == false) return false;

        uint size32 = ReadUInt32BigEndian(header[..4]);
        string type = Encoding.ASCII.GetString(header.Slice(4, 4));
        int headerSize = 8;
        long size = size32;

        if (size32 == 1) {
            if (offset + 16 > parentEnd || ReadExactly(stream, header[8..16]) == false) return false;
            ulong size64 = ((ulong)ReadUInt32BigEndian(header[8..12]) << 32) | ReadUInt32BigEndian(header[12..16]);
            if (size64 > long.MaxValue) return false;
            size = (long)size64;
            headerSize = 16;
        }
        else if (size32 == 0) {
            size = parentEnd - offset;
        }

        if (size < headerSize || size > parentEnd - offset) return false;
        box = new HeifBox(offset, size, headerSize, type);
        return true;
    }

    private static bool ReadExactly(Stream stream, Span<byte> buffer) {
        while (buffer.Length > 0) {
            int bytesRead = stream.Read(buffer);
            if (bytesRead == 0) return false;
            buffer = buffer[bytesRead..];
        }
        return true;
    }

    private static uint ReadUInt32BigEndian(ReadOnlySpan<byte> bytes) =>
        ((uint)bytes[0] << 24) | ((uint)bytes[1] << 16) | ((uint)bytes[2] << 8) | bytes[3];

    private sealed record HeifBox(long Offset, long Size, int HeaderSize, string Type) {
        internal long End => Offset + Size;
    }
}
