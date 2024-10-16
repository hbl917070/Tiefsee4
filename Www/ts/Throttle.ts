/**
 * 節流 (定時執行，時間內重複執行，則只會執行最後一個指令)
 */
export class Throttle {
    public run: (() => Promise<void>) | undefined = undefined;

    constructor(timeout = 50) {

        let isAsyncTaskRunning = false;

        setInterval(() => {

            if (this.run === undefined) { return; }
            if (isAsyncTaskRunning) { return; }

            let func = this.run;
            this.run = undefined;
            isAsyncTaskRunning = true;

            func().then(() => {
                isAsyncTaskRunning = false;
            }).catch(() => {
                console.error();
                isAsyncTaskRunning = false;
            });

        }, timeout);
    }
}
