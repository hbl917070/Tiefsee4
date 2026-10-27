import type { TiefseeviewViewState } from "./TiefseeviewTypes";

/** 暫存診斷：聚合純平移期間的 Renderer 時間，避免逐幀輸出影響量測。 */
export class TiefseeviewRenderPerformanceMonitor {
    private readonly idleDelayMs = 350;
    private previousState: TiefseeviewViewState | null = null;
    private panTimer = 0;
    private animationFrame = 0;
    private panStartedAt = 0;
    private lastPanUpdateAt = 0;
    private panStateUpdates = 0;
    private drawDurations: number[] = [];
    private frameIntervals: number[] = [];
    private lastFrameTimestamp: number | null = null;
    private canvasRasterizations = 0;
    private webglDrawCalls = 0;
    private gpuTimerSupported = false;
    private gpuDrawDurations: number[] = [];

    constructor(private readonly renderer: "Canvas" | "WebGL") { }

    public get isPanActive(): boolean { return this.panStartedAt !== 0; }

    public setGpuTimerSupported(supported: boolean): void {
        this.gpuTimerSupported = supported;
    }

    public recordGpuDraw(durationMs: number): void {
        if (this.panStartedAt !== 0) this.gpuDrawDurations.push(durationMs);
    }

    public setViewState(state: TiefseeviewViewState): void {
        const previous = this.previousState;
        this.previousState = state;
        if (previous === null || !previous.image.isReady || !state.image.isReady) return;

        const before = previous.imageToViewport;
        const after = state.imageToViewport;
        const sameLinearTransform = Math.abs(before.a - after.a) < 1e-6 &&
            Math.abs(before.b - after.b) < 1e-6 &&
            Math.abs(before.c - after.c) < 1e-6 &&
            Math.abs(before.d - after.d) < 1e-6;
        const sameImage = previous.image.width === state.image.width && previous.image.height === state.image.height &&
            previous.image.displayWidthCss === state.image.displayWidthCss &&
            previous.image.displayHeightCss === state.image.displayHeightCss;
        const sameViewport = previous.viewport.widthCss === state.viewport.widthCss &&
            previous.viewport.heightCss === state.viewport.heightCss &&
            previous.viewport.devicePixelRatio === state.viewport.devicePixelRatio &&
            previous.viewport.renderDpiZoom === state.viewport.renderDpiZoom;
        const sameTransform = previous.transform.rotationDeg === state.transform.rotationDeg &&
            previous.transform.mirrorHorizontal === state.transform.mirrorHorizontal &&
            previous.transform.mirrorVertical === state.transform.mirrorVertical;
        const sameContainer = previous.container.leftCss === state.container.leftCss &&
            previous.container.topCss === state.container.topCss;
        const sameMatrix = Math.abs(before.a - after.a) < 1e-6 &&
            Math.abs(before.b - after.b) < 1e-6 &&
            Math.abs(before.c - after.c) < 1e-6 &&
            Math.abs(before.d - after.d) < 1e-6 &&
            Math.abs(before.e - after.e) < 1e-6 &&
            Math.abs(before.f - after.f) < 1e-6;
        const unchanged = sameImage && sameViewport && sameTransform && sameContainer && sameMatrix;
        const translated = sameLinearTransform && sameImage && sameViewport && sameTransform &&
            (Math.abs(before.e - after.e) >= 1e-6 || Math.abs(before.f - after.f) >= 1e-6);

        if (!translated) {
            if (!unchanged && this.panStartedAt !== 0) this.finishPan();
            return;
        }

        if (this.panStartedAt === 0) {
            this.panStartedAt = performance.now();
            this.panStateUpdates = 0;
            this.drawDurations = [];
            this.frameIntervals = [];
            this.lastFrameTimestamp = null;
            this.canvasRasterizations = 0;
            this.webglDrawCalls = 0;
            this.gpuDrawDurations = [];
        }
        this.lastPanUpdateAt = performance.now();
        this.panStateUpdates++;
        window.clearTimeout(this.panTimer);
        this.panTimer = window.setTimeout(() => this.finishPan(), this.idleDelayMs);
        this.scheduleAnimationFrameSample();
    }

    public recordFrame(drawDurationMs: number, webglDrawCalls = 0): void {
        if (this.panStartedAt === 0) return;
        this.drawDurations.push(drawDurationMs);
        this.webglDrawCalls += webglDrawCalls;
    }

    public recordCanvasRasterization(): void {
        if (this.panStartedAt !== 0) this.canvasRasterizations++;
    }

    public dispose(): void {
        window.clearTimeout(this.panTimer);
        if (this.animationFrame !== 0) cancelAnimationFrame(this.animationFrame);
    }

    private finishPan(): void {
        window.clearTimeout(this.panTimer);
        this.panTimer = 0;
        if (this.panStartedAt === 0) return;
        if (this.animationFrame !== 0) cancelAnimationFrame(this.animationFrame);
        this.animationFrame = 0;

        const sortedDraws = [...this.drawDurations].sort((a, b) => a - b);
        const sortedIntervals = [...this.frameIntervals].sort((a, b) => a - b);
        const percentile = (values: number[], ratio: number): number | null => {
            if (values.length === 0) return null;
            return Number(values[Math.max(0, Math.ceil(values.length * ratio) - 1)].toFixed(3));
        };
        const overBudget = (budgetMs: number): number =>
            this.frameIntervals.filter(interval => interval > budgetMs).length;

        console.info("[Tiefsee render performance] pan", {
            renderer: this.renderer,
            panInputSpanMs: Number((this.lastPanUpdateAt - this.panStartedAt).toFixed(1)),
            viewStateUpdates: this.panStateUpdates,
            rendererCalls: this.drawDurations.length,
            drawElapsedMs: {
                p50: percentile(sortedDraws, 0.5),
                p95: percentile(sortedDraws, 0.95),
                max: sortedDraws.length === 0 ? null : Number(sortedDraws[sortedDraws.length - 1].toFixed(3))
            },
            requestAnimationFrameIntervalMs: {
                p50: percentile(sortedIntervals, 0.5),
                p95: percentile(sortedIntervals, 0.95),
                over16_7ms: overBudget(16.7),
                over8_3ms: overBudget(8.3)
            },
            ...(this.renderer === "Canvas"
                ? { canvasRasterizations: this.canvasRasterizations }
                : {
                    gpuTimerSupported: this.gpuTimerSupported,
                    gpuDrawSamples: this.gpuDrawDurations.length,
                    gpuDrawMs: {
                        p50: percentile([...this.gpuDrawDurations].sort((a, b) => a - b), 0.5),
                        p95: percentile([...this.gpuDrawDurations].sort((a, b) => a - b), 0.95),
                        max: this.gpuDrawDurations.length === 0
                            ? null
                            : Number(this.gpuDrawDurations.reduce((max, value) => Math.max(max, value), 0).toFixed(3))
                    },
                    webglDrawCalls: this.webglDrawCalls,
                    averageWebglDrawCallsPerCall: this.drawDurations.length === 0
                        ? 0
                        : Number((this.webglDrawCalls / this.drawDurations.length).toFixed(2))
                })
        });

        this.panStartedAt = 0;
        this.lastPanUpdateAt = 0;
        this.panStateUpdates = 0;
        this.drawDurations = [];
        this.frameIntervals = [];
        this.lastFrameTimestamp = null;
        this.canvasRasterizations = 0;
        this.webglDrawCalls = 0;
        this.gpuDrawDurations = [];
    }

    private scheduleAnimationFrameSample(): void {
        if (this.animationFrame !== 0 || this.panStartedAt === 0) return;
        this.animationFrame = requestAnimationFrame(timestamp => {
            this.animationFrame = 0;
            if (this.panStartedAt === 0) return;
            if (timestamp - this.lastPanUpdateAt < 50 && this.lastFrameTimestamp !== null) {
                this.frameIntervals.push(Math.max(0, timestamp - this.lastFrameTimestamp));
            }
            this.lastFrameTimestamp = timestamp - this.lastPanUpdateAt < 50 ? timestamp : null;
            this.scheduleAnimationFrameSample();
        });
    }
}
