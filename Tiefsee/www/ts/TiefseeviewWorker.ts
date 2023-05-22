self.addEventListener("message", async (e) => {

    let url = e.data.url;
    let scale = e.data.scale;
    let tempUrl = e.data.tempUrl;

    const imgBlob = await fetch(url).then(
        (r) => r.blob()
    );

    //var time = new Date();

    const img = await createImageBitmap(imgBlob);

    //var ms = (new Date()).getTime() - time.getTime();
    //console.log(`worker 載入圖片:${scale}   耗時：${ms}`)

    //@ts-ignore
    self.postMessage({ img: img, scale: scale, tempUrl: tempUrl, url: url, }, [img]);

}, false)