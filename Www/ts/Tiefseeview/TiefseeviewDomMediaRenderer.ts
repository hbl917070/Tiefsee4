export type TiefseeviewMediaType = "img" | "video" | "imgs" | "bigimg" | "bigimgscale" | "webgl";

/** 切換原生 img／video 與 DOM Canvas／固定 viewport WebGL 圖層的可見狀態。 */
export class TiefseeviewDomMediaRenderer {
    private dataType: TiefseeviewMediaType = "img";

    constructor(
        private readonly domImg: HTMLImageElement,
        private readonly domBigimg: HTMLDivElement,
        private readonly domVideo: HTMLVideoElement
    ) { }

    public getDataType(): TiefseeviewMediaType {
        return this.dataType;
    }

    public setDataType(type: TiefseeviewMediaType): void {
        this.dataType = type;

        if (type === "img") {
            this.domImg.style.display = "";
            this.domBigimg.style.display = "none";
            this.domVideo.style.display = "none";
            this.domVideo.src = "";
            return;
        }
        if (type === "bigimg" || type === "bigimgscale") {
            this.domImg.style.display = "none";
            this.domBigimg.style.display = "";
            this.domVideo.style.display = "none";
            this.domImg.src = "";
            this.domVideo.src = "";
            return;
        }
        if (type === "webgl") {
            this.domImg.style.display = "none";
            this.domBigimg.style.display = "none";
            this.domVideo.style.display = "none";
            this.domImg.src = "";
            this.domVideo.src = "";
            return;
        }
        if (type === "video") {
            this.domImg.style.display = "none";
            this.domBigimg.style.display = "none";
            this.domVideo.style.display = "";
            this.domImg.src = "";
        }
    }
}
