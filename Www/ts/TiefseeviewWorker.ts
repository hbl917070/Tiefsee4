// 讓 Tiefseeview 在背景載入圖片
self.addEventListener("message", async (e) => {

    let url = e.data.url;
    let scale = e.data.scale;
    let tempUrl = e.data.tempUrl;

    const imgBlob = await fetch(url).then(
        (r) => r.blob()
    );

    const img = await createImageBitmap(imgBlob);

    // @ts-ignore
    self.postMessage({ img: img, scale: scale, tempUrl: tempUrl, url: url, }, [img]);

}, false)
