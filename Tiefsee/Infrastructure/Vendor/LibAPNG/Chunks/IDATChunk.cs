using System.IO;

namespace LibAPNG;

public class IDATChunk : Chunk {
    public IDATChunk(MemoryStream ms)
        : base(ms) {
    }

    public IDATChunk(BinaryReader ms)
        : base(ms) {
    }

    public IDATChunk(Chunk chunk)
        : base(chunk) {
    }
}
