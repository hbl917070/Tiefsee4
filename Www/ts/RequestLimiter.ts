/**
 * 限制最大同時連線數。Chrome最大連線數為6
 */
export class RequestLimiter {
    private queue: [HTMLImageElement, string][];
    private inProgress: number; // 目前正在進行的請求數
    private maxRequests: number;

    constructor(maxRequests: number) {
        this.queue = [];
        this.inProgress = 0;
        this.maxRequests = Math.min(maxRequests, 6); // 設置上限
    }

    public addRequest(img: HTMLImageElement, url: string) {

        // 檢查 img 元素是否仍然存在於文檔中
        if (!document.body.contains(img)) {
            return;
        }

        // 檢查佇列中是否已經存在相同的 img 元素和網址
        const index = this.queue.findIndex(([i, u]) => i === img && u === url);
        if (index !== -1) { // 如果存在，則忽略這個請求
            return;
        }

        // 檢查佇列中是否存在相同的 img 元素但不同的網址
        const index2 = this.queue.findIndex(([i, u]) => i === img && u !== url);
        if (index2 !== -1) { // 如果存在，則將舊的請求從佇列中移除
            this.queue.splice(index2, 1);
        }

        // 添加新的請求
        this.queue.push([img, url]);
        this.processQueue();
    }

    private processQueue() {
        while (this.inProgress < this.maxRequests && this.queue.length > 0) {
            const [img, url] = this.queue.shift()!;
            this.inProgress++; // 圖片開始加載時增加 inProgress
            this.loadImage(img, url).then(() => {
                this.inProgress--;
                this.processQueue();
            }).catch((error) => {
                // console.error(error);
                this.inProgress--; // 當錯誤發生時，減少 inProgress 的值
                this.processQueue(); // 繼續處理隊列中的下一個請求
            });
        }
    }

    private loadImage(img: HTMLImageElement, url: string) {
        return new Promise<void>((resolve, reject) => {

            // 如果圖片已經不存在
            let intervalTimer = setInterval(() => {
                if (!document.body.contains(img)) {
                    // console.log("Image element has been removed from the document.");
                    clearInterval(intervalTimer);
                    clearTimeout(timeoutTimer);
                    reject("Image element has been removed from the document.");
                }
            }, 50);

            // 載入超時
            let timeoutTimer = setTimeout(() => {
                clearInterval(intervalTimer);
                reject("Loading image timed out.");
            }, 30 * 1000);

            img.src = url;
            img.onload = img.onerror = () => {
                clearInterval(intervalTimer);
                clearTimeout(timeoutTimer);
                resolve();
            };
        });
    }
}
