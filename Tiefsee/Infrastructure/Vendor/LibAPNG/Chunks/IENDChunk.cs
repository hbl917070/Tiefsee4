using System.IO;

namespace LibAPNG;

public class IENDChunk : Chunk {
    public IENDChunk(MemoryStream ms)
        : base(ms) {
    }

    public IENDChunk(BinaryReader ms)
        : base(ms) {
    }

    public IENDChunk(Chunk chunk)
        : base(chunk) {
    }
}
