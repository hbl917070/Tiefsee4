/// <reference lib="webworker" />

var wasm: any;

async function initWasm() {
    wasm = await import("./../wasm/tiefsee_wasm.js");
    await wasm.default({});
}

initWasm();

// 讓 Tiefseeview 在背景載入圖片
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

        const blur = e.data.blur;
        const sharpen = e.data.sharpen;
        const imageBitmap = e.data.imageBitmap;
        const temp_drawImage = e.data.temp_drawImage;

        const width = imageBitmap.width;
        const height = imageBitmap.height

        console.time("銳化處理");

        const offscreenCanvas = new OffscreenCanvas(width, height);
        const ctx = offscreenCanvas.getContext("2d");
        if (ctx === null) { return; }

        // 繪製圖片
        ctx.drawImage(imageBitmap, 0, 0);

        // 高斯模糊
        if (blur > 0) {
            ctx.filter = `blur(${blur}px)`; // 模糊半徑
            ctx.drawImage(offscreenCanvas, 0, 0);
        }

        // 取得圖片像素資訊
        const imageData = ctx.getImageData(0, 0, width, height);

        // 銳化處理
        const sharpenedImageData = await wasm.sharpen_image(imageData, sharpen);

        console.timeEnd("銳化處理");

        self.postMessage({ type, sharpenedImageData, temp_drawImage });
    }

}, false)
