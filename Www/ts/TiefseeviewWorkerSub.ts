/// <reference lib="webworker" />

(async () => {

    const wasm: any = await import("./../wasm/tiefsee_wasm.js");
    await wasm.default({});

    self.addEventListener("message", async (e) => {
        const { chunk, sharpen } = e.data;
        const { random, imageBitmap, width, height, startY } = chunk;

        const offscreenCanvas = new OffscreenCanvas(width, height);
        const ctx = offscreenCanvas.getContext("2d");
        if (ctx === null) return;

        // 畫出收到的區塊圖片
        ctx.drawImage(imageBitmap, 0, 0);

        const imageData = ctx.getImageData(0, 0, width, height);

        // 使用卷積核進行銳化處理
        const v = sharpen;
        const kernel = new Float32Array([
            0, -v, 0,
            -v, 1 + v * 4, -v,
            0, -v, 0
        ]);
        const sharpenedImageData = await wasm.image_filter(imageData, kernel) as ImageData;

        // 將結果繪製回畫布
        ctx.putImageData(sharpenedImageData, 0, 0);

        // 將結果轉換為 ImageBitmap
        const resultBitmap = offscreenCanvas.transferToImageBitmap();

        // 將處理後的圖片傳回主 worker
        self.postMessage({ random, imageBitmap: resultBitmap, startY }, [resultBitmap]);

    });

})();
