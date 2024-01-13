//
// https://github.com/xupefei/APNG.NET
//

using System.IO;

namespace LibAPNG;

public class APNG {
    private readonly Frame defaultImage = new Frame();
    private readonly List<Frame> frames = new List<Frame>();

    /// <summary>
    /// 取得 apng 的 循環次數 與 總幀數
    /// </summary>
    public static acTLChunk GetInfo(string fileName) {

        using FileStream ms = new(fileName, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
        using var br = new BinaryReader(ms);

        // check file signature.
        if (!Helper.IsBytesEqual(ms.ReadBytes(Frame.Signature.Length), Frame.Signature)) {
            return null;
        }

        // Read IHDR chunk.
        var IHDRChunk = new IHDRChunk(br);
        if (IHDRChunk.ChunkType != "IHDR") {
            return null;
        }

        Chunk chunk;
        do {
            if (ms.Position == ms.Length)
                throw new Exception("IEND chunk expected.");

            chunk = new Chunk(br);

            switch (chunk.ChunkType) {
                case "IHDR":
                    return null;

                case "acTL":
                    return new acTLChunk(chunk);
            }
        } while (chunk.ChunkType != "IEND");

        return null;
    }

    public APNG(string fileName) {

        //ms = new MemoryStream(fileBytes);
        using var ms = new FileStream(fileName, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
        using var br = new BinaryReader(ms);

        // check file signature.
        if (!Helper.IsBytesEqual(ms.ReadBytes(Frame.Signature.Length), Frame.Signature))
            throw new Exception("File signature incorrect.");

        // Read IHDR chunk.
        IHDRChunk = new IHDRChunk(br);
        if (IHDRChunk.ChunkType != "IHDR")
            throw new Exception("IHDR chunk must located before any other chunks.");

        // Now let's loop in chunks
        Chunk chunk;
        Frame frame = null;
        var otherChunks = new List<OtherChunk>();
        bool isIDATAlreadyParsed = false;
        do {
            if (ms.Position == ms.Length)
                throw new Exception("IEND chunk expected.");

            chunk = new Chunk(br);

            switch (chunk.ChunkType) {
                case "IHDR":
                    throw new Exception("Only single IHDR is allowed.");

                case "acTL":
                    if (IsSimplePNG)
                        throw new Exception("acTL chunk must located before any IDAT and fdAT");

                    acTLChunk = new acTLChunk(chunk);
                    break;

                case "IDAT":
                    //return;
                    // To be an APNG, acTL must located before any IDAT and fdAT.
                    if (acTLChunk == null)
                        IsSimplePNG = true;

                    // Only default image has IDAT.
                    defaultImage.IHDRChunk = IHDRChunk;
                    defaultImage.AddIDATChunk(new IDATChunk(chunk));
                    isIDATAlreadyParsed = true;
                    break;

                case "fcTL":
                    // Simple PNG should ignore this.
                    if (IsSimplePNG)
                        continue;

                    if (frame != null && frame.IDATChunks.Count == 0)
                        throw new Exception("One frame must have only one fcTL chunk.");

                    // IDAT already parsed means this fcTL is used by FRAME IMAGE.
                    if (isIDATAlreadyParsed) {
                        // register current frame object and build a new frame object
                        // for next use
                        if (frame != null)
                            frames.Add(frame);
                        frame = new Frame {
                            IHDRChunk = IHDRChunk,
                            fcTLChunk = new fcTLChunk(chunk)
                        };
                    }
                    // Otherwise this fcTL is used by the DEFAULT IMAGE.
                    else {
                        defaultImage.fcTLChunk = new fcTLChunk(chunk);
                    }
                    break;
                case "fdAT":
                    // Simple PNG should ignore this.
                    if (IsSimplePNG)
                        continue;

                    // fdAT is only used by frame image.
                    if (frame == null || frame.fcTLChunk == null)
                        throw new Exception("fcTL chunk expected.");

                    frame.AddIDATChunk(new fdATChunk(chunk).ToIDATChunk());
                    break;

                case "IEND":
                    // register last frame object
                    if (frame != null)
                        frames.Add(frame);

                    if (DefaultImage.IDATChunks.Count != 0)
                        DefaultImage.IENDChunk = new IENDChunk(chunk);
                    foreach (Frame f in frames) {
                        f.IENDChunk = new IENDChunk(chunk);
                    }
                    break;

                default:
                    otherChunks.Add(new OtherChunk(chunk));
                    break;
            }
        } while (chunk.ChunkType != "IEND");

        // We have one more thing to do:
        // If the default image if part of the animation,
        // we should insert it into frames list.
        if (defaultImage.fcTLChunk != null) {
            frames.Insert(0, defaultImage);
            DefaultImageIsAnimated = true;
        }

        // Now we should apply every chunk in otherChunks to every frame.
        frames.ForEach(f => otherChunks.ForEach(f.AddOtherChunk));
    }

    /// <summary>
    /// Indicate whether the file is a simple PNG.
    /// </summary>
    public bool IsSimplePNG { get; private set; }

    /// <summary>
    /// Indicate whether the default image is part of the animation
    /// </summary>
    public bool DefaultImageIsAnimated { get; private set; }

    /// <summary>
    /// Gets the base image.
    /// If IsSimplePNG = True, returns the only image;
    /// if False, returns the default image
    /// </summary>
    public Frame DefaultImage {
        get { return defaultImage; }
    }

    /// <summary>
    /// Gets the frame array.
    /// If IsSimplePNG = True, returns empty
    /// </summary>
    public Frame[] Frames {
        get { return frames.ToArray(); }
    }

    /// <summary>
    /// Gets the IHDR Chunk
    /// </summary>
    public IHDRChunk IHDRChunk { get; private set; }

    /// <summary>
    /// Gets the acTL Chunk
    /// </summary>
    public acTLChunk acTLChunk { get; private set; }
}
