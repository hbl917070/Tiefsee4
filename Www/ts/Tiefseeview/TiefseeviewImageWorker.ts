interface DecodeRequest {
    type: "decode";
    id: number;
    url: string;
}

interface AbortRequest {
    type: "abort";
    id: number;
}

interface DisposeRequest {
    type: "dispose";
}

const controllers = new Map<number, AbortController>();
const cancelled = new Set<number>();

self.addEventListener("message", event => {
    const message = event.data as DecodeRequest | AbortRequest | DisposeRequest;
    if (message.type === "abort") {
        cancelled.add(message.id);
        controllers.get(message.id)?.abort();
        return;
    }
    if (message.type === "dispose") {
        for (const controller of controllers.values()) controller.abort();
        controllers.clear();
        cancelled.clear();
        return;
    }
    void decode(message);
});

async function decode(message: DecodeRequest): Promise<void> {
    const controller = new AbortController();
    controllers.set(message.id, controller);
    let bitmap: ImageBitmap | null = null;
    try {
        const response = await fetch(message.url, { signal: controller.signal });
        if (!response.ok) throw new Error(`圖片載入失敗：HTTP ${response.status}`);
        bitmap = await createImageBitmap(await response.blob());
        if (cancelled.has(message.id)) {
            bitmap.close();
            bitmap = null;
            return;
        }
        self.postMessage({ id: message.id, bitmap }, [bitmap]);
        bitmap = null;
    } catch (error) {
        if (!cancelled.has(message.id)) {
            self.postMessage({ id: message.id, error: error instanceof Error ? error.message : String(error) });
        }
    } finally {
        bitmap?.close();
        controllers.delete(message.id);
        cancelled.delete(message.id);
    }
}
