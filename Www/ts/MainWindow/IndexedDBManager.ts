export class IndexedDBManager {

    // 資料表名稱
    private storeNames: string[] = Object.values(DbStoreName);

    private dbPromise: Promise<IDBDatabase>;
    constructor(private dbName: string, private version: number) {
        this.dbPromise = this.init();
    }

    private init(): Promise<IDBDatabase> {

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = (event) => {
                reject("Error opening DB");
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                this.storeNames.forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName, { keyPath: "id" });
                    }
                });
                resolve(db);
            };

            request.onsuccess = (event) => {
                resolve((event.target as IDBOpenDBRequest).result);
            };
        });
    }

    public async getData(storeName: string, id: string): Promise<any> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName);
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.get(id);

            request.onerror = (event) => {
                reject("Error getting data from DB");
            };

            request.onsuccess = () => {
                resolve(request.result);
            };
        });
    }

    /**
     * 
     * @param storeName 資料表名稱
     * @param data 必須是物件，且有 id 屬性，例如 {id:123, name:"abc"}
     */
    public async saveData(storeName: string, data: any): Promise<void> {
        const db = await this.dbPromise;
        const transaction = db.transaction(storeName, "readwrite");
        const objectStore = transaction.objectStore(storeName);
        objectStore.put(data);
    }

    public async deleteData(storeName: string, id: string): Promise<void> {
        const db = await this.dbPromise;
        const transaction = db.transaction([storeName], "readwrite");
        const objectStore = transaction.objectStore(storeName);
        objectStore.delete(id);
    }
}

/**
 * 資料表名稱
 */
export const DbStoreName = {
    /** Civitai Resources 的暫存資料 */
    civitaiResources: "civitaiResources",
    /** 詳細資訊面板內的項目折疊狀態 */
    infoPanelCollapse: "infoPanelCollapse",
}
