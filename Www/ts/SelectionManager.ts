/**
 * 指定哪些元素允許被選取
 */
export class SelectionManager {
    private mode: "whitelist" | "blacklist";
    private filter: string[] = [];

    constructor(mode: "whitelist" | "blacklist") {
        this.mode = mode;
        this.init();
    }

    private init() {
        document.addEventListener("mousedown", (event: MouseEvent) => {
            // 點擊的不是左鍵
            if (event.button !== 0) {
                return;
            }

            const target = event.target as Element;
            // 如果點擊的是文字輸入框
            if (target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target instanceof HTMLSelectElement
            ) {
                return;
            }
            const isMatch = this.filter.some(selector => target.matches(selector));
            if ((this.mode === "blacklist" && isMatch) || (this.mode === "whitelist" && !isMatch)) {
                event.preventDefault();
            }
        });
    }

    public add(selector: string) {
        this.filter.push(selector);
    }
}
