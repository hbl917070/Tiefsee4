using System.IO;

namespace LibAPNG;

public class OtherChunk : Chunk {
    public OtherChunk(MemoryStream ms)
        : base(ms) {
    }

    public OtherChunk(BinaryReader ms)
        : base(ms) {
    }

    public OtherChunk(Chunk chunk)
        : base(chunk) {
    }

    protected override void ParseData(MemoryStream ms) {
    }
}
