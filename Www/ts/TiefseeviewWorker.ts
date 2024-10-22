/// <reference lib="webworker" />

(async () => {

    const NUM_WORKERS = 4;
    const workers: Worker[] = [];

    // 載入 wasm 模組
    for (let i = 0; i < NUM_WORKERS; i++) {
        const worker = new Worker("TiefseeviewWorkerSub.js");
        workers.push(worker);
    }

    self.addEventListener("message", async (e) => {

        const type = e.data.type;

        // 載入圖片
        if (type === "loadImage") {

            const url = e.data.url;
            const scale = e.data.scale;
            const tempUrl = e.data.tempUrl;

            const imgBlob = await fetch(url, {
                priority: "high", // 高優先權
            }).then((r) => r.blob());

            const img = await createImageBitmap(imgBlob);
            self.postMessage({ type, img, scale, tempUrl, url }, [img]);
        }

        // 銳化圖片
        if (type === "sharpen") {
            const { blur, sharpen, imageBitmap, tempDrawImage } = e.data;
            const width = imageBitmap.width;
            const height = imageBitmap.height;
            // 用於區分是否為同一次請求
            const random = Math.random();

            // console.time("sharpen");

            // 將圖片轉換為 ImageBitmap
            const offscreenCanvas = new OffscreenCanvas(width, height);
            const ctx = offscreenCanvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
            ctx.drawImage(imageBitmap, 0, 0);
            // 套用模糊
            if (blur > 0) {
                ctx.filter = `blur(${blur}px)`;
                ctx.drawImage(offscreenCanvas, 0, 0);
            }
            const processedImageBitmap = offscreenCanvas.transferToImageBitmap();

            // 將圖片分成 NUM_WORKERS 個區塊
            const chunkHeight = Math.ceil(height / NUM_WORKERS);
            const chunks: any[] = [];
            for (let i = 0; i < NUM_WORKERS; i++) {
                const startY = i * chunkHeight;
                const endY = Math.min((i + 1) * chunkHeight, height);
                const chunkCanvas = new OffscreenCanvas(width, endY - startY);
                const chunkCtx = chunkCanvas.getContext("2d") as OffscreenCanvasRenderingContext2D;

                chunkCtx.drawImage(
                    processedImageBitmap,
                    0, startY, width, endY - startY,  // source
                    0, 0, width, endY - startY        // destination
                );

                const chunkBitmap = chunkCanvas.transferToImageBitmap();
                chunks.push({
                    random,
                    imageBitmap: chunkBitmap,
                    width,
                    height: endY - startY,
                    startY,
                });
            }

            // 平行處理每個 chunk
            const processedChunks = await Promise.all(
                workers.map((worker, index) =>
                    new Promise(resolve => {

                        // 超時
                        const timeout = setTimeout(() => {
                            resolve({ error: "Worker timeout" });
                        }, 5 * 1000);

                        worker.onmessage = (e) => {
                            if (e.data.random === random) {
                                clearTimeout(timeout);
                                resolve(e.data);
                            }
                        };

                        worker.postMessage({ chunk: chunks[index], sharpen }, [chunks[index].imageBitmap]);
                    })
                )
            ) as { error: string, imageBitmap: ImageBitmap, startY: number }[];

            // 將每個處理後的 chunk 合併回來
            const resultCanvas = new OffscreenCanvas(width, height);
            const resultCtx = resultCanvas.getContext("2d");
            if (resultCtx === null) return;

            for (const chunk of processedChunks) {
                // 有錯誤就直接離開，不需要返回結果
                if (chunk.error) {
                    console.error("Worker error", tempDrawImage);
                    return;
                }
                resultCtx.drawImage(chunk.imageBitmap, 0, chunk.startY);
            }

            const finalImageBitmap = resultCanvas.transferToImageBitmap();

            // console.timeEnd("sharpen");

            self.postMessage({ type, imageBitmap: finalImageBitmap, tempDrawImage }, [finalImageBitmap]);
        }

    }, false)

})();
