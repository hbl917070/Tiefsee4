using System.Diagnostics;
using System.IO.Compression;
using System.IO;
using System.Text;
using System.Text.Json;

namespace Tiefsee;

/// <summary>
/// 讀取 NovelAI 以 alpha channel LSB 儲存的 PNG stealth metadata。
/// </summary>
internal static class NovelAiStealthMetadataReader {

    private const string MagicText = "stealth_pngcomp";
    private const int RgbaBytesPerPixel = 4;
    private const int AlphaByteOffset = 3;
    private const int LengthByteCount = 4;
    private const int MagicByteCount = 15;
    private const int MagicBitCount = MagicByteCount * 8;
    private const int PrefixBitCount = (MagicByteCount + LengthByteCount) * 8;
    private const int MaxCompressedBytes = 1024 * 1024;
    private const int MaxScanlineBytes = 64 * 1024 * 1024;
    private const int PngCrcByteCount = 4;

    private static readonly byte[] Magic = Encoding.ASCII.GetBytes(MagicText);
    private static readonly byte[] PngSignature = { 137, 80, 78, 71, 13, 10, 26, 10 };

    /// <summary>
    /// 判斷文字是否包含可用的 NovelAI prompt JSON。
    /// </summary>
    internal static bool ContainsNovelAiPrompt(string value) {
        if (string.IsNullOrWhiteSpace(value)) {
            return false;
        }

        ReadOnlySpan<char> jsonText = value.AsSpan().Trim();
        if (jsonText.StartsWith("Comment:", StringComparison.OrdinalIgnoreCase)) {
            jsonText = jsonText["Comment:".Length..].Trim();
        }
        else if (jsonText.Length == 0 || jsonText[0] != '{') {
            return false;
        }

        try {
            using var document = JsonDocument.Parse(jsonText.ToString());
            var root = document.RootElement;
            if (HasPrompt(root)) {
                return true;
            }

            if (root.TryGetProperty("Comment", out var comment)
                && comment.ValueKind == JsonValueKind.String) {
                using var commentDocument = JsonDocument.Parse(comment.GetString() ?? string.Empty);
                return HasPrompt(commentDocument.RootElement);
            }
        }
        catch (JsonException) {
            // 一般 metadata 文字不是 JSON 時，視為沒有 NovelAI prompt。
        }

        return false;
    }

    /// <summary>
    /// 判斷 JSON object 是否有非空的 prompt 字串。
    /// </summary>
    private static bool HasPrompt(JsonElement root) {
        return root.ValueKind == JsonValueKind.Object
            && root.TryGetProperty("prompt", out var prompt)
            && prompt.ValueKind == JsonValueKind.String
            && string.IsNullOrWhiteSpace(prompt.GetString()) == false;
    }

    /// <summary>
    /// 嘗試從 PNG stealth metadata 取得可供既有 UI 使用的 Comment JSON。
    /// </summary>
    internal static bool TryReadComment(string path, int maxLength, out string commentJson) {
        commentJson = string.Empty;
        if (maxLength <= 0
            || string.IsNullOrWhiteSpace(path)
            || path.EndsWith(".png", StringComparison.OrdinalIgnoreCase) == false) {
            return false;
        }

        try {
            if (TryReadPrefixFromFile(path, out var header, out int compressedLength) == false) {
                return false;
            }
            if (compressedLength <= 0 || compressedLength > MaxCompressedBytes) {
                return false;
            }

            long totalBitCount = (long)(MagicByteCount + LengthByteCount + compressedLength) * 8;
            if (totalBitCount > (long)header.Width * header.Height) {
                return false;
            }

            if (TryReadPayload(path, header, checked((int)totalBitCount), out var payload) == false) {
                return false;
            }

            byte[] compressed = payload
                .AsSpan(MagicByteCount + LengthByteCount, compressedLength)
                .ToArray();
            if (TryDecompress(compressed, maxLength, out var jsonBytes) == false) {
                return false;
            }

            return TryGetCommentJson(jsonBytes, maxLength, out commentJson);
        }
        catch (Exception exception) {
            // stealth metadata 失敗不能影響一般 metadata 讀取。
            Debug.WriteLine("NovelAI stealth metadata 解析錯誤: " + exception.Message);
            return false;
        }
    }

    /// <summary>
    /// 開啟 PNG 並讀取 stealth prefix。
    /// </summary>
    private static bool TryReadPrefixFromFile(string path, out PngHeader header, out int compressedLength) {
        header = default;
        compressedLength = 0;

        using var stream = OpenFile(path);
        if (TryFindFirstIdat(stream, out header, out var idatStream) == false) {
            return false;
        }

        using (idatStream) {
            return TryReadPrefixFromIdat(idatStream, header, out compressedLength);
        }
    }

    /// <summary>
    /// 從已定位的 IDAT 串流讀取 magic 與 gzip 長度。
    /// </summary>
    private static bool TryReadPrefixFromIdat(Stream idatStream, PngHeader header, out int compressedLength) {
        compressedLength = 0;
        if (TryGetRowLayout(header, PrefixBitCount, out int rowsToRead, out int columnsToRead,
                out int rowBytes, out int bytesToKeep) == false) {
            return false;
        }

        var currentRow = new byte[bytesToKeep];
        var previousRow = new byte[bytesToKeep];
        var alphaBits = header.Height < PrefixBitCount
            ? new byte[checked(columnsToRead * rowsToRead)]
            : null;
        var prefixBytes = new byte[PrefixBitCount / 8];
        int comparedBits = 0;

        using var zlib = new ZLibStream(idatStream, CompressionMode.Decompress, leaveOpen: true);
        for (int y = 0; y < rowsToRead; y++) {
            ReadFilteredRow(zlib, currentRow, previousRow, rowBytes);

            for (int x = 0; x < columnsToRead; x++) {
                byte bit = GetAlphaBit(currentRow, x);
                if (alphaBits == null) {
                    if (comparedBits < MagicBitCount) {
                        byte expectedBit = (byte)((Magic[comparedBits / 8] >> (7 - comparedBits % 8)) & 1);
                        if (bit != expectedBit) {
                            // 普通 RGBA PNG 通常在前幾個 alpha bit 就能排除。
                            return false;
                        }
                    }

                    SetBit(prefixBytes, comparedBits, bit);
                    comparedBits++;
                }
                else {
                    alphaBits[x * rowsToRead + y] = bit;
                }
            }

            (previousRow, currentRow) = (currentRow, previousRow);
        }

        if (alphaBits != null) {
            PackAlphaBits(alphaBits, prefixBytes, PrefixBitCount, rowsToRead);
            if (prefixBytes.AsSpan(0, MagicByteCount).SequenceEqual(Magic) == false) {
                return false;
            }
        }

        uint compressedBitLength = ReadUInt32BigEndian(prefixBytes, MagicByteCount);
        if (compressedBitLength == 0 || compressedBitLength % 8 != 0) {
            return false;
        }

        long compressedByteLength = compressedBitLength / 8;
        if (compressedByteLength > MaxCompressedBytes) {
            return false;
        }

        compressedLength = checked((int)compressedByteLength);
        return true;
    }

    /// <summary>
    /// 第二次讀取 PNG，取得 magic、長度與 gzip payload 的 alpha bits。
    /// </summary>
    private static bool TryReadPayload(string path, PngHeader expectedHeader, int bitCount, out byte[] payload) {
        payload = Array.Empty<byte>();
        if (bitCount <= 0 || bitCount % 8 != 0) {
            return false;
        }

        using var stream = OpenFile(path);
        if (TryFindFirstIdat(stream, out var header, out var idatStream) == false
            || header != expectedHeader) {
            return false;
        }

        using (idatStream) {
            if (TryGetRowLayout(header, bitCount, out int rowsToRead, out int columnsToRead,
                    out int rowBytes, out int bytesToKeep) == false) {
                return false;
            }

            var currentRow = new byte[bytesToKeep];
            var previousRow = new byte[bytesToKeep];
            var alphaBits = new byte[checked(columnsToRead * rowsToRead)];
            using var zlib = new ZLibStream(idatStream, CompressionMode.Decompress, leaveOpen: true);

            for (int y = 0; y < rowsToRead; y++) {
                ReadFilteredRow(zlib, currentRow, previousRow, rowBytes);
                for (int x = 0; x < columnsToRead; x++) {
                    alphaBits[x * rowsToRead + y] = GetAlphaBit(currentRow, x);
                }

                (previousRow, currentRow) = (currentRow, previousRow);
            }

            payload = new byte[bitCount / 8];
            PackAlphaBits(alphaBits, payload, bitCount, rowsToRead);
            return true;
        }
    }

    /// <summary>
    /// 以 gzip 解壓 payload，並限制輸出大小避免異常資料造成過量配置。
    /// </summary>
    private static bool TryDecompress(byte[] compressed, int maxLength, out byte[] jsonBytes) {
        jsonBytes = Array.Empty<byte>();
        using var input = new MemoryStream(compressed, writable: false);
        using var gzip = new GZipStream(input, CompressionMode.Decompress);
        using var output = new MemoryStream();
        var buffer = new byte[8192];

        while (true) {
            int read = gzip.Read(buffer, 0, buffer.Length);
            if (read == 0) {
                break;
            }
            if (output.Length + read > maxLength) {
                return false;
            }

            output.Write(buffer, 0, read);
        }

        jsonBytes = output.ToArray();
        return true;
    }

    /// <summary>
    /// 驗證 stealth JSON 並取出內層 Comment 或根層 prompt JSON。
    /// </summary>
    private static bool TryGetCommentJson(byte[] jsonBytes, int maxLength, out string commentJson) {
        commentJson = string.Empty;

        try {
            using var document = JsonDocument.Parse(jsonBytes);
            var root = document.RootElement;
            if (root.ValueKind != JsonValueKind.Object) {
                return false;
            }

            if (root.TryGetProperty("Comment", out var comment)
                && comment.ValueKind == JsonValueKind.String) {
                string value = comment.GetString() ?? string.Empty;
                if (ContainsNovelAiPrompt(value) && ("Comment: " + value).Length <= maxLength) {
                    commentJson = value;
                    return true;
                }
            }

            if (HasPrompt(root)) {
                string value = root.GetRawText();
                if (("Comment: " + value).Length <= maxLength) {
                    commentJson = value;
                    return true;
                }
            }
        }
        catch (JsonException) {
            return false;
        }

        return false;
    }

    /// <summary>
    /// 從 PNG chunk 串流定位第一個 IDAT，並驗證 reader 支援的 PNG 格式。
    /// </summary>
    private static bool TryFindFirstIdat(Stream stream, out PngHeader header, out PngIdatPayloadStream idatStream) {
        header = default;
        idatStream = null;

        if (ReadExact(stream, PngSignature.Length).AsSpan().SequenceEqual(PngSignature) == false) {
            return false;
        }

        uint ihdrLength = ReadUInt32BigEndianFromStream(stream);
        string ihdrType = Encoding.ASCII.GetString(ReadExact(stream, 4));
        if (ihdrType != "IHDR" || ihdrLength != 13) {
            return false;
        }

        byte[] ihdr = ReadExact(stream, 13);
        SkipExactly(stream, PngCrcByteCount);
        header = new PngHeader(
            checked((int)ReadUInt32BigEndian(ihdr, 0)),
            checked((int)ReadUInt32BigEndian(ihdr, 4)),
            ihdr[8],
            ihdr[9],
            ihdr[12]);
        if (header.Width <= 0 || header.Height <= 0
            || header.BitDepth != 8 || header.ColorType != 6 || header.InterlaceMethod != 0) {
            return false;
        }

        while (stream.Position <= stream.Length - 12) {
            uint chunkLength = ReadUInt32BigEndianFromStream(stream);
            string chunkType = Encoding.ASCII.GetString(ReadExact(stream, 4));
            if (chunkType == "IDAT") {
                if (chunkLength > int.MaxValue) {
                    return false;
                }

                idatStream = new PngIdatPayloadStream(stream, (int)chunkLength);
                return true;
            }

            SkipExactly(stream, (long)chunkLength + PngCrcByteCount);
            if (chunkType == "IEND") {
                return false;
            }
        }

        return false;
    }

    /// <summary>
    /// 依照低成本順序讀取 PNG，避免 prefix probe 載入整張檔案。
    /// </summary>
    private static FileStream OpenFile(string path) {
        return new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite,
            bufferSize: 64 * 1024, options: FileOptions.SequentialScan);
    }

    /// <summary>
    /// 計算指定 payload bit count 所需的 scanline 讀取配置。
    /// </summary>
    private static bool TryGetRowLayout(PngHeader header, int bitCount, out int rowsToRead,
            out int columnsToRead, out int rowBytes, out int bytesToKeep) {
        rowsToRead = 0;
        columnsToRead = 0;
        rowBytes = 0;
        bytesToKeep = 0;
        if (bitCount <= 0) {
            return false;
        }

        rowsToRead = Math.Min(header.Height, bitCount);
        columnsToRead = checked((bitCount + rowsToRead - 1) / rowsToRead);
        rowBytes = checked(header.Width * RgbaBytesPerPixel);
        bytesToKeep = checked(columnsToRead * RgbaBytesPerPixel);
        return columnsToRead <= header.Width
            && bytesToKeep <= rowBytes
            && rowBytes <= MaxScanlineBytes;
    }

    /// <summary>
    /// 讀取一列 PNG scanline、還原 filter，並略過目前不需要的像素。
    /// </summary>
    private static void ReadFilteredRow(Stream zlib, byte[] currentRow, byte[] previousRow, int rowBytes) {
        byte filter = ReadByte(zlib);
        ReadExactly(zlib, currentRow);
        ApplyPngFilter(currentRow, previousRow, filter);
        SkipExactly(zlib, rowBytes - currentRow.Length);
    }

    /// <summary>
    /// 對 scanline 套用 PNG filter type 0 到 4。
    /// </summary>
    private static void ApplyPngFilter(byte[] currentRow, byte[] previousRow, byte filter) {
        for (int i = 0; i < currentRow.Length; i++) {
            byte left = i >= RgbaBytesPerPixel ? currentRow[i - RgbaBytesPerPixel] : (byte)0;
            byte up = previousRow[i];
            byte upperLeft = i >= RgbaBytesPerPixel ? previousRow[i - RgbaBytesPerPixel] : (byte)0;
            currentRow[i] = filter switch {
                0 => currentRow[i],
                1 => (byte)(currentRow[i] + left),
                2 => (byte)(currentRow[i] + up),
                3 => (byte)(currentRow[i] + ((left + up) / 2)),
                4 => (byte)(currentRow[i] + PaethPredictor(left, up, upperLeft)),
                _ => throw new InvalidDataException("不支援的 PNG filter type: " + filter)
            };
        }
    }

    /// <summary>
    /// 取得指定 RGBA pixel 的 alpha channel LSB。
    /// </summary>
    private static byte GetAlphaBit(byte[] row, int x) {
        return (byte)(row[x * RgbaBytesPerPixel + AlphaByteOffset] & 1);
    }

    /// <summary>
    /// 將 column-major alpha bits 打包成連續 bytes。
    /// </summary>
    private static void PackAlphaBits(byte[] alphaBits, byte[] output, int bitCount, int rowsToRead) {
        for (int bitIndex = 0; bitIndex < bitCount; bitIndex++) {
            int x = bitIndex / rowsToRead;
            int y = bitIndex % rowsToRead;
            SetBit(output, bitIndex, alphaBits[x * rowsToRead + y]);
        }
    }

    /// <summary>
    /// 將一個 bit 寫入指定 byte array 的 MSB-first 位置。
    /// </summary>
    private static void SetBit(byte[] bytes, int bitIndex, byte bit) {
        bytes[bitIndex / 8] |= (byte)(bit << (7 - bitIndex % 8));
    }

    /// <summary>
    /// 讀取一個 byte；遇到截斷資料時拋出 EOF。
    /// </summary>
    private static byte ReadByte(Stream stream) {
        int value = stream.ReadByte();
        if (value < 0) {
            throw new EndOfStreamException();
        }

        return (byte)value;
    }

    /// <summary>
    /// 讀取指定長度的 byte array。
    /// </summary>
    private static byte[] ReadExact(Stream stream, int length) {
        var buffer = new byte[length];
        ReadExactly(stream, buffer);
        return buffer;
    }

    /// <summary>
    /// 確保完整讀滿指定 buffer。
    /// </summary>
    private static void ReadExactly(Stream stream, byte[] buffer) {
        int offset = 0;
        while (offset < buffer.Length) {
            int read = stream.Read(buffer, offset, buffer.Length - offset);
            if (read <= 0) {
                throw new EndOfStreamException();
            }

            offset += read;
        }
    }

    /// <summary>
    /// 確保略過指定長度的串流資料。
    /// </summary>
    private static void SkipExactly(Stream stream, long length) {
        Span<byte> buffer = stackalloc byte[8192];
        while (length > 0) {
            int readLength = (int)Math.Min(length, buffer.Length);
            int read = stream.Read(buffer[..readLength]);
            if (read <= 0) {
                throw new EndOfStreamException();
            }

            length -= read;
        }
    }

    /// <summary>
    /// 從串流讀取 big-endian UInt32。
    /// </summary>
    private static uint ReadUInt32BigEndianFromStream(Stream stream) {
        return ReadUInt32BigEndian(ReadExact(stream, 4), 0);
    }

    /// <summary>
    /// 從 byte array 的指定 offset 讀取 big-endian UInt32。
    /// </summary>
    private static uint ReadUInt32BigEndian(byte[] bytes, int offset) {
        return ((uint)bytes[offset] << 24)
            | ((uint)bytes[offset + 1] << 16)
            | ((uint)bytes[offset + 2] << 8)
            | bytes[offset + 3];
    }

    /// <summary>
    /// 計算 PNG filter type 4 所需的 Paeth predictor。
    /// </summary>
    private static byte PaethPredictor(byte left, byte up, byte upperLeft) {
        int estimate = left + up - upperLeft;
        int leftDistance = Math.Abs(estimate - left);
        int upDistance = Math.Abs(estimate - up);
        int upperLeftDistance = Math.Abs(estimate - upperLeft);
        return leftDistance <= upDistance && leftDistance <= upperLeftDistance
            ? left
            : upDistance <= upperLeftDistance ? up : upperLeft;
    }

    /// <summary>
    /// 支援的 PNG IHDR 欄位，避免 payload 讀取前重新解析 header。
    /// </summary>
    private readonly record struct PngHeader(
        int Width,
        int Height,
        byte BitDepth,
        byte ColorType,
        byte InterlaceMethod);

    /// <summary>
    /// 將多個連續 IDAT chunk 暴露成單一可讀串流。
    /// </summary>
    private sealed class PngIdatPayloadStream : Stream {

        private readonly Stream _stream;
        private int _remainingInChunk;
        private bool _finished;

        /// <summary>
        /// 建立從第一個 IDAT payload 開始的串流。
        /// </summary>
        public PngIdatPayloadStream(Stream stream, int firstChunkLength) {
            _stream = stream;
            _remainingInChunk = firstChunkLength;
        }

        public override bool CanRead => true;
        public override bool CanSeek => false;
        public override bool CanWrite => false;
        public override long Length => throw new NotSupportedException();
        public override long Position {
            get => throw new NotSupportedException();
            set => throw new NotSupportedException();
        }

        /// <summary>
        /// 以 byte array 介面讀取連續 IDAT payload。
        /// </summary>
        public override int Read(byte[] buffer, int offset, int count) {
            return Read(buffer.AsSpan(offset, count));
        }

        /// <summary>
        /// 以 span 介面讀取連續 IDAT payload。
        /// </summary>
        public override int Read(Span<byte> buffer) {
            if (buffer.Length == 0 || _finished) {
                return 0;
            }

            while (_remainingInChunk == 0) {
                if (TryMoveToNextIdatChunk() == false) {
                    return 0;
                }
            }

            int readLength = Math.Min(buffer.Length, _remainingInChunk);
            int read = _stream.Read(buffer[..readLength]);
            if (read <= 0) {
                throw new EndOfStreamException();
            }

            _remainingInChunk -= read;
            return read;
        }

        /// <summary>
        /// 跳過目前 IDAT 的 CRC，並定位下一個 IDAT chunk。
        /// </summary>
        private bool TryMoveToNextIdatChunk() {
            SkipExactly(_stream, PngCrcByteCount);
            uint length = ReadUInt32BigEndianFromStream(_stream);
            string type = Encoding.ASCII.GetString(ReadExact(_stream, 4));
            if (type != "IDAT" || length > int.MaxValue) {
                _finished = true;
                return false;
            }

            _remainingInChunk = (int)length;
            return true;
        }

        /// <summary>
        /// Stream 不支援寫入，因此 Flush 不需要額外動作。
        /// </summary>
        public override void Flush() { }

        /// <summary>
        /// IDAT payload 只支援向前讀取，不支援 Seek。
        /// </summary>
        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();

        /// <summary>
        /// IDAT payload 長度由 PNG chunk 串流決定，不支援 SetLength。
        /// </summary>
        public override void SetLength(long value) => throw new NotSupportedException();

        /// <summary>
        /// IDAT payload 是唯讀串流，不支援 Write。
        /// </summary>
        public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();
    }
}
