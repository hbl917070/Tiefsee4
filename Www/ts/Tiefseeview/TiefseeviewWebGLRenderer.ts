import type { TiefseeviewImageSource, TiefseeviewImageSourceRegion } from "./TiefseeviewImageSource";
import { TiefseeviewRenderPerformanceMonitor } from "./TiefseeviewRenderPerformanceMonitor";
import type { TiefseeviewImageRenderer, TiefseeviewViewState } from "./TiefseeviewTypes";
import { TiefseeviewLanczosRenderer, TiefseeviewWebGPUUnsupportedError } from "./TiefseeviewLanczosRenderer";

interface WebGLTile {
    texture: WebGLTexture;
    x: number;
    y: number;
    width: number;
    height: number;
    uvLeft: number;
    uvTop: number;
    uvRight: number;
    uvBottom: number;
    cacheKey?: string;
    scale?: number;
    lastUsed?: number;
}

interface PendingTextureUpload {
    source: ImageBitmap;
    pixelWidth: number;
    pixelHeight: number;
    imageRect: { x: number; y: number; width: number; height: number };
    contentRect: { x: number; y: number; width: number; height: number };
    revision: number;
    signal: AbortSignal;
    resolve: (tile: WebGLTile) => void;
    reject: (error: unknown) => void;
}

interface WebGLDisjointTimerQueryExtension {
    readonly GPU_DISJOINT_EXT: number;
    readonly TIME_ELAPSED_EXT: number;
}

/** 固定 viewport 的 WebGL 2 靜態圖片 Renderer；不操作 Tiefseeview 的 DOM 變形層。 */
export class TiefseeviewWebGLRenderer implements TiefseeviewImageRenderer {
    private readonly idleQualityDelayMs = 100;
    /** 預先多繪 viewport 周圍區域；在這個距離內平移只移動合成器圖層。 */
    private readonly panOverscanCss = 50;
    private readonly gl: WebGL2RenderingContext;
    private readonly program: WebGLProgram;
    private readonly buffer: WebGLBuffer;
    private readonly positionLocation: number;
    private readonly uvLocation: number;
    private readonly samplerLocation: WebGLUniformLocation;
    private readonly premultiplyAlphaLocation: WebGLUniformLocation;
    private readonly textureLimit: number;
    private readonly gpuTimerExtension: WebGLDisjointTimerQueryExtension | null;
    private readonly lanczosCanvas: HTMLCanvasElement;
    /** 固定 viewport 的預覽只保留有限來源像素，避免大圖把整張原圖及 mipmap 塞進 GPU。 */
    private readonly maxSourcePixels = 8 * 1024 * 1024;
    private readonly sourceTileSize = 1024;
    private readonly sourceTileGutter = 4;
    private tiles: WebGLTile[] = [];
    private qualityTiles: WebGLTile[] = [];
    private readonly vertexData = new Float32Array(16);
    private source: TiefseeviewImageSource | null = null;
    private viewState: TiefseeviewViewState | null = null;
    private cachedViewState: TiefseeviewViewState | null = null;
    private widthCss = 0;
    private heightCss = 0;
    private devicePixelRatio = 1;
    private canvasSizeDirty = true;
    private sourceRevealPending = false;
    private renderFrame = 0;
    private requestController: AbortController | null = null;
    private sourceRevision = 0;
    private activeLevelScale: number | null = null;
    private activeQualityScale: number | null = null;
    private qualityRegionKey = "";
    private qualityLanczosBitmap: ImageBitmap | null = null;
    private qualityLanczosOrigin: { x: number; y: number } | null = null;
    private qualityLanczosScale: number | null = null;
    private qualityLanczosRegionKey = "";
    private qualityTimer = 0;
    private isReplacingSource = false;
    private sourceVisible = false;
    private pixelatedFilter: boolean | null = null;
    private readonly renderWaiters: { resolve: () => void; reject: (error: unknown) => void }[] = [];
    private readonly pendingTextureUploads: PendingTextureUpload[] = [];
    private readonly performanceMonitor = new TiefseeviewRenderPerformanceMonitor("WebGL");
    private readonly pendingGpuTimerQueries: WebGLQuery[] = [];
    private frameDrawCalls = 0;
    private gpuTimerPollFrame = 0;
    private textureUploadFrame = 0;
    private disposed = false;
    private previewBitmap: ImageBitmap | null = null;
    private lanczosRenderer: TiefseeviewLanczosRenderer | null = null;
    private lanczosRendererPromise: Promise<TiefseeviewLanczosRenderer | null> | null = null;
    private lanczosRendererInitError: unknown = null;

    constructor(
        private readonly canvas: HTMLCanvasElement,
        lanczosCanvas: HTMLCanvasElement,
        private readonly getImageRendering: () => number,
        private readonly getSharpenValue: () => number
    ) {
        this.lanczosCanvas = lanczosCanvas;
        const gl = canvas.getContext("webgl2", {
            alpha: true,
            antialias: false,
            depth: false,
            stencil: false,
            powerPreference: "high-performance"
        });
        if (gl === null) throw new Error("此 WebView2 沒有 WebGL 2 支援");
        this.gl = gl;

        const vertexShader = this.createShader(gl.VERTEX_SHADER, `#version 300 es
            in vec2 a_position;
            in vec2 a_uv;
            out vec2 v_uv;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                v_uv = a_uv;
            }
        `);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, `#version 300 es
            precision highp float;
            uniform sampler2D u_image;
            uniform bool u_premultiplyAlpha;
            in vec2 v_uv;
            out vec4 outColor;
            void main() {
                outColor = texture(u_image, v_uv);
                if (u_premultiplyAlpha) outColor.rgb *= outColor.a;
            }
        `);
        const program = gl.createProgram();
        if (program === null) throw new Error("無法建立 WebGL program");
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const message = gl.getProgramInfoLog(program) || "WebGL program 連結失敗";
            gl.deleteProgram(program);
            throw new Error(message);
        }
        this.program = program;

        const buffer = gl.createBuffer();
        if (buffer === null) {
            gl.deleteProgram(program);
            throw new Error("無法建立 WebGL vertex buffer");
        }
        this.buffer = buffer;
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexData.byteLength, gl.DYNAMIC_DRAW);
        this.positionLocation = gl.getAttribLocation(program, "a_position");
        this.uvLocation = gl.getAttribLocation(program, "a_uv");
        this.samplerLocation = this.requireUniform(program, "u_image");
        this.premultiplyAlphaLocation = this.requireUniform(program, "u_premultiplyAlpha");
        gl.enableVertexAttribArray(this.positionLocation);
        gl.enableVertexAttribArray(this.uvLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.vertexAttribPointer(this.uvLocation, 2, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
        gl.uniform1i(this.samplerLocation, 0);
        // 與 ImageResamplingLab 原型相同，使用 ImageBitmap 的預設方向與 alpha 表示。
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        // RGB 以非預乘來源合成，alpha 則使用標準 source-over，避免透明邊緣被重複乘上來源 alpha。
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
        this.textureLimit = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        this.gpuTimerExtension = gl.getExtension("EXT_disjoint_timer_query_webgl2") as WebGLDisjointTimerQueryExtension | null;
        this.performanceMonitor.setGpuTimerSupported(this.gpuTimerExtension !== null);
        canvas.style.pointerEvents = "none";
        canvas.style.display = "none";
        canvas.style.visibility = "hidden";
    }

    public setViewState(state: TiefseeviewViewState): void {
        this.viewState = state;
        if (this.isReplacingSource) return;
        this.performanceMonitor.setViewState(state);
        this.cancelPendingQualityRequest();
        this.lanczosRenderer?.hide();
        if (this.sourceVisible && this.source !== null && this.tiles.length > 0) {
            this.canvas.style.display = "";
            this.canvas.style.visibility = "visible";
        }
        const panOffset = this.getCachedPanOffset(state);
        if (!this.sourceRevealPending && panOffset !== null && this.renderFrame === 0 && !this.canvasSizeDirty) {
            this.canvas.style.transform = `translate3d(${panOffset.x}px, ${panOffset.y}px, 0)`;
            if (this.source !== null) this.scheduleIdleQualityUpdate("操作停止後");
            return;
        }
        if (!this.hasPanOverflow(state)) {
            // 圖片縮到可完整置中時，舊平移快取的 layer offset 不再代表控制器的位置。
            this.canvas.style.transform = "translate3d(0px, 0px, 0)";
        }
        this.scheduleRender();
        if (this.source !== null) this.scheduleIdleQualityUpdate("操作停止後");
    }

    public render(_isImmediatelyRun?: boolean): Promise<void> {
        if (this.disposed) return Promise.resolve();
        return new Promise<void>((resolve, reject) => {
            this.renderWaiters.push({ resolve, reject });
            this.scheduleRender();
        });
    }

    public resize(widthCss: number, heightCss: number, devicePixelRatio: number): void {
        this.widthCss = Math.max(0, widthCss);
        this.heightCss = Math.max(0, heightCss);
        this.devicePixelRatio = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
        this.canvasSizeDirty = true;
        this.cachedViewState = null;
        this.updateCanvasCssSize();
        if (this.isReplacingSource) return;
        this.cancelPendingQualityRequest();
        this.lanczosRenderer?.hide();
        if (this.sourceVisible && this.source !== null && this.tiles.length > 0) {
            this.canvas.style.display = "";
            this.canvas.style.visibility = "visible";
        }
        this.scheduleRender();
        if (this.source !== null) this.scheduleIdleQualityUpdate("視窗尺寸更新後");
    }

    /** 新圖片載入期間凍結目前已呈現的畫面，待新預覽可繪製時再交換。 */
    public beginSourceReplacement(): boolean {
        this.isReplacingSource = this.source !== null && this.tiles.length > 0;
        if (this.isReplacingSource) {
            window.clearTimeout(this.qualityTimer);
            if (this.renderFrame !== 0) cancelAnimationFrame(this.renderFrame);
            this.renderFrame = 0;
        }
        return this.isReplacingSource;
    }

    /** 首次載入等舊控制器完成縮放與定位後，才顯示預覽畫面。 */
    public showSource(): void {
        this.isReplacingSource = false;
        const source = this.source;
        const revision = this.sourceRevision;
        if (source === null || this.tiles.length === 0) return;

        this.sourceVisible = false;
        // Lanczos3 首幀尚未完成前，排程中的 WebGL draw 不得先揭露低品質畫面。
        this.sourceRevealPending = false;
        this.canvas.style.display = "";
        this.canvas.style.visibility = "hidden";
        const state = this.viewState;
        const bitmap = this.previewBitmap;
        const sourceScale = this.activeLevelScale;
        const useLanczos = state !== null && !this.isPixelatedRendering(state) && bitmap !== null && sourceScale !== null;
        const rendererPromise = useLanczos ? this.getLanczosRenderer() : Promise.resolve(null);
        const pixelated = state !== null && this.isPixelatedRendering(state);
        const fallbackReason = state === null ? "沒有 ViewState"
            : pixelated ? "像素呈現模式"
                : bitmap === null ? "沒有預覽 bitmap"
                    : sourceScale === null ? "沒有預覽倍率"
                        : "Lanczos3 不適用或未完成";
        console.info("[Tiefseeview WebGL] 首幀渲染策略", {
            strategy: useLanczos ? "等待 Lanczos3" : "WebGL fallback",
            fallbackReason: useLanczos ? null : fallbackReason,
            sourceScale,
            targetScale: this.getTargetScale()
        });

        // 一般模式首幀與閒置更新都用 Lanczos3；像素模式保留 WebGL 最近點取樣。
        void rendererPromise.then(async renderer => {
            if (!this.isCurrentSource(source, revision)) return;
            if (renderer !== null && bitmap !== null && sourceScale !== null && state !== null && state === this.viewState) {
                const rendered = await renderer.render(bitmap, sourceScale, state, this.getSharpenValue());
                if (rendered && this.isCurrentSource(source, revision) && state === this.viewState) {
                    this.canvas.style.visibility = "hidden";
                    renderer.show();
                    this.sourceVisible = true;
                    this.sourceRevealPending = false;
                    console.info("[Tiefseeview WebGL] 首幀已由 Lanczos3 顯示", { sourceScale });
                    this.scheduleIdleQualityUpdate("預覽顯示後");
                    return;
                }
            }

            // 只有確認 Lanczos3 無法提供有效首幀後，才允許 WebGL render 揭露畫面。
            console.info("[Tiefseeview WebGL] 首幀改用 WebGL fallback", { reason: fallbackReason });
            this.sourceRevealPending = true;
            await this.render();
            if (!this.isCurrentSource(source, revision)) return;
            this.lanczosRenderer?.clearSource();
            this.sourceVisible = true;
            this.sourceRevealPending = false;
            this.canvas.style.visibility = "visible";
            this.scheduleIdleQualityUpdate("預覽顯示後");
        }).catch(error => {
            if (!this.isCurrentSource(source, revision)) return;
            console.error("WebGL 新來源首幀繪製失敗。", error);
            this.lanczosRenderer?.clearSource();
            // WebGL draw 失敗時 backing canvas 可能仍是舊圖或只繪了一部分，不可把它當成成功首幀顯示。
            this.sourceVisible = false;
            this.sourceRevealPending = true;
            this.canvas.style.visibility = "hidden";
            void this.render().catch(renderError => {
                console.error("WebGL 新來源 fallback 首幀繪製失敗。", renderError);
            });
        });
    }

    private isCurrentSource(source: TiefseeviewImageSource, revision: number): boolean {
        return !this.disposed && this.source === source && this.sourceRevision === revision;
    }

    private resizeCanvases(): void {
        const webglWidth = Math.max(1, Math.round((this.widthCss + this.panOverscanCss * 2) * this.devicePixelRatio));
        const webglHeight = Math.max(1, Math.round((this.heightCss + this.panOverscanCss * 2) * this.devicePixelRatio));
        const viewportWidth = Math.max(1, Math.round(this.widthCss * this.devicePixelRatio));
        const viewportHeight = Math.max(1, Math.round(this.heightCss * this.devicePixelRatio));
        if (this.canvas.width !== webglWidth) this.canvas.width = webglWidth;
        if (this.canvas.height !== webglHeight) this.canvas.height = webglHeight;
        if (this.lanczosCanvas.width !== viewportWidth) this.lanczosCanvas.width = viewportWidth;
        if (this.lanczosCanvas.height !== viewportHeight) this.lanczosCanvas.height = viewportHeight;
        this.updateCanvasCssSize();
        this.canvasSizeDirty = false;
    }

    private updateCanvasCssSize(): void {
        const canvasWidth = Math.max(1, Math.round((this.widthCss + this.panOverscanCss * 2) * this.devicePixelRatio));
        const canvasHeight = Math.max(1, Math.round((this.heightCss + this.panOverscanCss * 2) * this.devicePixelRatio));
        const viewportWidth = Math.max(1, Math.round(this.widthCss * this.devicePixelRatio));
        const viewportHeight = Math.max(1, Math.round(this.heightCss * this.devicePixelRatio));
        this.canvas.style.width = `${canvasWidth / this.devicePixelRatio}px`;
        this.canvas.style.height = `${canvasHeight / this.devicePixelRatio}px`;
        this.canvas.style.left = `${-this.panOverscanCss}px`;
        this.canvas.style.top = `${-this.panOverscanCss}px`;
        this.canvas.style.transform = "translate3d(0px, 0px, 0)";
        // Lanczos viewport 須保留 ViewState 的小數 CSS 尺寸，backing store 才依 DPR 取整。
        this.lanczosCanvas.style.width = `${this.widthCss}px`;
        this.lanczosCanvas.style.height = `${this.heightCss}px`;
    }

    public async setSource(source: TiefseeviewImageSource | null, keepCurrentFrame = false): Promise<void> {
        const revision = ++this.sourceRevision;
        window.clearTimeout(this.qualityTimer);
        this.requestController?.abort();
        this.requestController = null;
        keepCurrentFrame = keepCurrentFrame && source !== null && this.source !== null && this.tiles.length > 0;
        this.isReplacingSource = keepCurrentFrame;
        if (!keepCurrentFrame) {
            this.sourceVisible = false;
            this.sourceRevealPending = false;
            this.clearTextures();
            this.lanczosRenderer?.clearSource();
            this.previewBitmap?.close();
            this.previewBitmap = null;
            this.activeLevelScale = null;
        }
        this.source = source;
        if (!keepCurrentFrame) {
            this.canvas.style.display = "none";
            this.canvas.style.visibility = "hidden";
        }
        if (source === null) {
            this.isReplacingSource = false;
            this.scheduleRender();
            return;
        }
        const level = this.selectPreviewLevel(source);
        console.info("[Tiefseeview WebGL] 載入預覽層", {
            width: source.width,
            height: source.height,
            targetScale: this.getTargetScale(),
            previewScale: level.scale,
            scaleDiagnostics: this.getScaleDiagnostics(),
            supportsRegionalRequests: source.supportsRegionalRequests === true
        });
        // 預覽仍先照常載入；同時初始化閒置時會用到的 WebGPU 管線，以便及早確認裝置支援。
        const lanczosRendererPromise = this.getLanczosRenderer();
        await this.loadLevel(source, level, revision, keepCurrentFrame);
        const lanczosRenderer = await lanczosRendererPromise;
        if (revision !== this.sourceRevision || this.source !== source) return;
        if (lanczosRenderer === null) {
            if (this.lanczosRendererInitError !== null) throw this.lanczosRendererInitError;
            throw new Error("WebGPU Lanczos3 Renderer 初始化後不可用");
        }
    }

    private getTargetScale(): number {
        const transform = this.viewState?.imageToViewport;
        // 來源切換期間會延後調整 canvas backing size，仍以即將採用的尺寸計算選層倍率。
        const backingWidth = Math.max(1, Math.round(this.widthCss * this.devicePixelRatio));
        const backingHeight = Math.max(1, Math.round(this.heightCss * this.devicePixelRatio));
        const scaleX = this.widthCss > 0 ? backingWidth / this.widthCss : this.devicePixelRatio;
        const scaleY = this.heightCss > 0 ? backingHeight / this.heightCss : this.devicePixelRatio;
        let framebufferScale = 1;
        if (transform !== undefined) {
            // 矩陣使用 CSS 像素；依 framebuffer 實際尺寸換算，涵蓋 backing size 取整的差異。
            const a = transform.a * scaleX;
            const b = transform.b * scaleY;
            const c = transform.c * scaleX;
            const d = transform.d * scaleY;
            const sumSquares = a * a + b * b + c * c + d * d;
            const determinant = a * d - b * c;
            const discriminant = Math.max(0, sumSquares * sumSquares - 4 * determinant * determinant);
            framebufferScale = Math.sqrt((sumSquares + Math.sqrt(discriminant)) / 2);
        }
        return Math.min(1, Math.max(Number.EPSILON, framebufferScale));
    }

    private getScaleDiagnostics() {
        const rect = this.canvas.getBoundingClientRect();
        const lanczosRect = this.lanczosCanvas.getBoundingClientRect();
        const lanczosParentRect = this.lanczosCanvas.parentElement?.getBoundingClientRect();
        const transform = this.viewState?.imageToViewport;
        let imageScaleCss = 1;
        if (transform !== undefined) {
            const sumSquares = transform.a * transform.a + transform.b * transform.b + transform.c * transform.c + transform.d * transform.d;
            const determinant = transform.a * transform.d - transform.b * transform.c;
            const discriminant = Math.max(0, sumSquares * sumSquares - 4 * determinant * determinant);
            imageScaleCss = Math.sqrt((sumSquares + Math.sqrt(discriminant)) / 2);
        }
        return {
            imageScaleCss,
            rendererDpr: this.devicePixelRatio,
            viewStateDpr: this.viewState?.viewport.devicePixelRatio,
            rendererViewportCss: { width: this.widthCss, height: this.heightCss },
            viewStateViewportCss: {
                width: this.viewState?.viewport.widthCss,
                height: this.viewState?.viewport.heightCss
            },
            windowMetrics: {
                devicePixelRatio: window.devicePixelRatio,
                zoomFactor: window.zoomFactor ?? null,
                visualViewportScale: window.visualViewport?.scale ?? null,
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
                screenWidth: window.screen.width,
                screenHeight: window.screen.height
            },
            canvasCss: { width: rect.width, height: rect.height },
            canvasBacking: { width: this.canvas.width, height: this.canvas.height },
            lanczosCanvasCss: { width: lanczosRect.width, height: lanczosRect.height },
            lanczosParentCss: lanczosParentRect === undefined
                ? null
                : { width: lanczosParentRect.width, height: lanczosParentRect.height },
            backingScale: {
                x: rect.width > 0 ? this.canvas.width / rect.width : null,
                y: rect.height > 0 ? this.canvas.height / rect.height : null
            },
            expectedScale: this.devicePixelRatio
        };
    }

    private selectPreviewLevel(source: TiefseeviewImageSource): TiefseeviewImageSource["levels"][number] {
        const eligibleLevels = source.levels.filter(level => level.url !== undefined &&
            Math.round(source.width * level.scale) * Math.round(source.height * level.scale) <= this.maxSourcePixels
        );
        if (eligibleLevels.length === 0) {
            throw new RangeError(`圖片來源沒有低於 ${this.maxSourcePixels.toLocaleString()} 像素的層級`);
        }
        const textureEligibleLevels = eligibleLevels.filter(level =>
            Math.round(source.width * level.scale) <= this.textureLimit &&
            Math.round(source.height * level.scale) <= this.textureLimit
        );
        const previewLevels = textureEligibleLevels.length > 0 ? textureEligibleLevels : eligibleLevels;
        const targetScale = this.getTargetScale();
        const level = this.selectSourceLevel(previewLevels, targetScale);
        if (level === undefined) throw new Error("ImageSource 沒有可用的圖片層級");
        return level;
    }

    /** 取足以覆蓋目標倍率的最低來源層；沒有更高層時使用最高可用層。 */
    private selectSourceLevel(
        levels: readonly TiefseeviewImageSource["levels"][number][],
        targetScale: number
    ): TiefseeviewImageSource["levels"][number] | undefined {
        const sortedLevels = [...levels].sort((a, b) => a.scale - b.scale);
        return sortedLevels.find(level => level.scale >= targetScale) ?? sortedLevels[sortedLevels.length - 1];
    }

    private async loadBestLevel(): Promise<void> {
        const source = this.source;
        if (source === null) {
            console.info("[Tiefseeview WebGL] 略過高畫質更新：沒有圖片來源");
            return;
        }
        // 預覽尚未上傳時不能啟動高品質請求，否則它可能中止唯一的完整圖片載入。
        if (this.activeLevelScale === null || this.tiles.length === 0) {
            console.info("[Tiefseeview WebGL] 略過高畫質更新：完整預覽尚未就緒");
            return;
        }
        const targetScale = this.getTargetScale();
        // 選足以覆蓋螢幕倍率的最小來源層；nearest 會在原圖層存在時仍選到模糊的低解析縮圖。
        const level = this.selectSourceLevel(source.levels, targetScale);
        if (level === undefined) {
            console.info("[Tiefseeview WebGL] 略過高畫質更新：沒有可用層級");
            return;
        }
        console.info("[Tiefseeview WebGL] 閒置後檢查高畫質層", {
            targetScale,
            previewScale: this.activeLevelScale,
            qualityScale: level.scale,
            scaleDiagnostics: this.getScaleDiagnostics()
        });
        // 保留目前畫面作為載入期間的備援，但閒置時必須收斂到當前倍率所選的最低足夠層。
        if (this.activeLevelScale === level.scale) {
            this.clearQualityLanczosSource();
            for (const tile of this.qualityTiles) this.gl.deleteTexture(tile.texture);
            this.qualityTiles.length = 0;
            this.qualityRegionKey = "";
            if (this.activeQualityScale !== null) source.releaseLevel?.(this.activeQualityScale);
            this.activeQualityScale = null;
            this.scheduleRender();
            console.info("[Tiefseeview WebGL] 目前來源層已符合目標倍率", {
                sourceScale: this.activeLevelScale,
                targetScale
            });
            return;
        }
        const levelWidth = Math.max(1, Math.round(source.width * level.scale));
        const levelHeight = Math.max(1, Math.round(source.height * level.scale));
        const levelPixels = levelWidth * levelHeight;
        const canLoadCompleteLevel = level.url !== undefined && levelWidth <= this.textureLimit &&
            levelHeight <= this.textureLimit && levelPixels <= this.maxSourcePixels;
        if (canLoadCompleteLevel) {
            console.info("[Tiefseeview WebGL] 使用符合預算的完整來源層", {
                scale: level.scale,
                width: levelWidth,
                height: levelHeight,
                pixels: levelPixels
            });
            const revision = ++this.sourceRevision;
            this.requestController?.abort();
            await this.loadLevel(source, level, revision, true);
            return;
        }
        if (source.supportsRegionalRequests !== true || source.requestTile === undefined) {
            console.info("[Tiefseeview WebGL] 略過高畫質更新：沒有符合資源限制的完整層或 tile 來源", {
                scale: level.scale,
                width: levelWidth,
                height: levelHeight,
                pixels: levelPixels,
                supportsRegionalRequests: source.supportsRegionalRequests === true
            });
            return;
        }
        const rect = this.getVisibleImageRect(source);
        if (rect === null) {
            console.info("[Tiefseeview WebGL] 略過 tile：無法計算可見圖片區域", {
                viewportWidth: this.widthCss,
                viewportHeight: this.heightCss,
                viewState: this.viewState
            });
            return;
        }
        const firstTileX = Math.floor(rect.x * level.scale / this.sourceTileSize);
        const firstTileY = Math.floor(rect.y * level.scale / this.sourceTileSize);
        const lastTileX = Math.floor(Math.max(0, Math.min(levelWidth - 1, (rect.x + rect.width) * level.scale - 1)) / this.sourceTileSize);
        const lastTileY = Math.floor(Math.max(0, Math.min(levelHeight - 1, (rect.y + rect.height) * level.scale - 1)) / this.sourceTileSize);
        const tileRequests: { tileX: number; tileY: number; scale: number; tileSize: number; gutter: number }[] = [];
        for (let tileY = firstTileY; tileY <= lastTileY; tileY++) {
            for (let tileX = firstTileX; tileX <= lastTileX; tileX++) {
                tileRequests.push({
                    tileX,
                    tileY,
                    scale: level.scale,
                    tileSize: this.sourceTileSize,
                    gutter: this.sourceTileGutter
                });
            }
        }
        if (tileRequests.length === 0 || tileRequests.length > 32) {
            console.info("[Tiefseeview WebGL] 略過 tile：可見 tile 數量不在允許範圍", {
                rect,
                tileCount: tileRequests.length
            });
            return;
        }
        const regionKey = `${level.scale}:${tileRequests.map(tile => `${tile.tileX},${tile.tileY}`).join(";")}`;
        if (regionKey === this.qualityRegionKey &&
            (this.isPixelatedRendering(this.viewState) || this.qualityLanczosRegionKey === regionKey)) {
            console.info("[Tiefseeview WebGL] 略過 tile：可見區域與上次相同", { regionKey });
            return;
        }
        this.clearQualityLanczosSource();
        const atlasBounds = this.getTileAtlasBounds(tileRequests, levelWidth, levelHeight);
        const canBuildLanczosAtlas = !this.isPixelatedRendering(this.viewState) &&
            atlasBounds.width > 0 && atlasBounds.height > 0 &&
            atlasBounds.width <= this.textureLimit && atlasBounds.height <= this.textureLimit &&
            atlasBounds.width * atlasBounds.height <= this.maxSourcePixels;
        const atlasCanvas = canBuildLanczosAtlas ? document.createElement("canvas") : null;
        if (atlasCanvas !== null) {
            atlasCanvas.width = atlasBounds.width;
            atlasCanvas.height = atlasBounds.height;
        }
        const atlasContext = atlasCanvas?.getContext("2d") ?? null;
        const missingRequests = tileRequests.filter(request => {
            const cacheKey = `${request.scale}:${request.tileX},${request.tileY}`;
            const cached = this.qualityTiles.find(tile => tile.cacheKey === cacheKey);
            if (cached === undefined) return true;
            cached.lastUsed = performance.now();
            return false;
        });
        const requestedKeys = new Set(tileRequests.map(tile => `${tile.scale}:${tile.tileX},${tile.tileY}`));
        const workRequests = atlasContext === null ? missingRequests : tileRequests;
        const excessBeforeLoad = this.qualityTiles.length + missingRequests.length - 32;
        if (excessBeforeLoad > 0) {
            const evictions = this.qualityTiles
                .filter(tile => !requestedKeys.has(tile.cacheKey || ""))
                .sort((a, b) => (a.lastUsed ?? 0) - (b.lastUsed ?? 0))
                .slice(0, excessBeforeLoad);
            for (const tile of evictions) {
                this.gl.deleteTexture(tile.texture);
                this.qualityTiles.splice(this.qualityTiles.indexOf(tile), 1);
            }
        }
        if (missingRequests.length === 0 && atlasContext === null) {
            this.activeQualityScale = level.scale;
            this.qualityRegionKey = regionKey;
            this.qualityLanczosRegionKey = !this.isPixelatedRendering(this.viewState) ? regionKey : "";
            this.scheduleRender();
            console.info("[Tiefseeview WebGL] 可見高畫質 tile 已在快取", { regionKey });
            return;
        }
        console.info("[Tiefseeview WebGL] 請求高畫質 tile", {
            scale: level.scale,
            rect,
            requestCount: workRequests.length,
            uploadTileCount: missingRequests.length,
            tiles: workRequests.map(item => `${item.tileX},${item.tileY}`)
        });
        const revision = ++this.sourceRevision;
        this.requestController?.abort();
        const controller = new AbortController();
        this.requestController = controller;
        const nextTiles: WebGLTile[] = [];
        const uploadKeys = new Set(missingRequests.map(request => `${request.scale}:${request.tileX},${request.tileY}`));
        try {
            let nextIndex = 0;
            const uploadNext = async (): Promise<void> => {
                while (nextIndex < workRequests.length) {
                    this.assertSourceRevision(revision, controller.signal);
                    const request = workRequests[nextIndex++];
                    const region = await source.requestTile!(request, controller.signal);
                    try {
                        this.assertSourceRevision(revision, controller.signal);
                        this.validateRegion(source, region, level.scale);
                        if (atlasContext !== null && region.source instanceof ImageBitmap && region.contentRect !== undefined) {
                            // Atlas 只拼 tile 的內容核心，避免 gutter 重疊時把半透明像素做 source-over。
                            const destinationX = Math.round(region.imageRect.x * level.scale) - atlasBounds.left;
                            const destinationY = Math.round(region.imageRect.y * level.scale) - atlasBounds.top;
                            atlasContext.drawImage(
                                region.source,
                                region.contentRect.x,
                                region.contentRect.y,
                                region.contentRect.width,
                                region.contentRect.height,
                                destinationX,
                                destinationY,
                                region.contentRect.width,
                                region.contentRect.height
                            );
                        }
                        const cacheKey = `${request.scale}:${request.tileX},${request.tileY}`;
                        if (uploadKeys.has(cacheKey)) {
                            const tile = await this.uploadSourceTile(region, revision, controller.signal);
                            tile.cacheKey = cacheKey;
                            tile.scale = request.scale;
                            tile.lastUsed = performance.now();
                            nextTiles.push(tile);
                        } else {
                            const cached = this.qualityTiles.find(tile => tile.cacheKey === cacheKey);
                            if (cached !== undefined) cached.lastUsed = performance.now();
                        }
                    } finally {
                        if (region.source instanceof ImageBitmap) region.source.close();
                    }
                }
            };
            const results = await Promise.allSettled(
                Array.from({ length: Math.min(4, workRequests.length) }, () => uploadNext())
            );
            const failure = results.find(result => result.status === "rejected");
            if (failure?.status === "rejected") throw failure.reason;
            this.assertSourceRevision(revision, controller.signal);
            const loadedTileCount = nextTiles.length;
            this.qualityTiles.push(...nextTiles.splice(0));
            const visibleKeys = requestedKeys;
            while (this.qualityTiles.length > 32) {
                const candidates = this.qualityTiles
                    .filter(tile => !visibleKeys.has(tile.cacheKey || ""))
                    .sort((a, b) => (a.lastUsed ?? 0) - (b.lastUsed ?? 0));
                const evicted = candidates[0];
                if (evicted === undefined) break;
                this.gl.deleteTexture(evicted.texture);
                this.qualityTiles.splice(this.qualityTiles.indexOf(evicted), 1);
            }
            if (atlasContext !== null && atlasCanvas !== null) {
                try {
                    const atlasBitmap = await createImageBitmap(atlasCanvas);
                    try {
                        this.assertSourceRevision(revision, controller.signal);
                        this.qualityLanczosBitmap = atlasBitmap;
                    } catch (error) {
                        atlasBitmap.close();
                        throw error;
                    }
                    this.qualityLanczosOrigin = { x: atlasBounds.left / level.scale, y: atlasBounds.top / level.scale };
                    this.qualityLanczosScale = level.scale;
                } catch (error) {
                    if (error instanceof DOMException && error.name === "AbortError") throw error;
                    console.warn("無法建立 tile Lanczos 來源圖，保留後端 Lanczos tile。", error);
                }
            }
            this.assertSourceRevision(revision, controller.signal);
            this.qualityLanczosRegionKey = !this.isPixelatedRendering(this.viewState) ? regionKey : "";
            this.activeQualityScale = level.scale;
            this.qualityRegionKey = regionKey;
            this.scheduleRender();
            console.info("[Tiefseeview WebGL] 高畫質 tile 已載入", {
                scale: level.scale,
                tileCount: loadedTileCount,
                lanczosAtlas: this.qualityLanczosBitmap === null ? "unavailable" : {
                    width: this.qualityLanczosBitmap.width,
                    height: this.qualityLanczosBitmap.height
                }
            });
        } catch (error) {
            for (const tile of nextTiles) this.gl.deleteTexture(tile.texture);
            if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
        } finally {
            if (this.requestController === controller) this.requestController = null;
        }
    }

    private getTileAtlasBounds(
        requests: readonly { tileX: number; tileY: number; tileSize: number }[],
        levelWidth: number,
        levelHeight: number
    ): { left: number; top: number; width: number; height: number } {
        const firstTileX = Math.min(...requests.map(tile => tile.tileX));
        const firstTileY = Math.min(...requests.map(tile => tile.tileY));
        const lastTileX = Math.max(...requests.map(tile => tile.tileX));
        const lastTileY = Math.max(...requests.map(tile => tile.tileY));
        const tileSize = requests[0].tileSize;
        const left = firstTileX * tileSize;
        const top = firstTileY * tileSize;
        const right = Math.min(levelWidth, (lastTileX + 1) * tileSize);
        const bottom = Math.min(levelHeight, (lastTileY + 1) * tileSize);
        return { left, top, width: right - left, height: bottom - top };
    }

    private clearQualityLanczosSource(): void {
        this.qualityLanczosBitmap?.close();
        this.qualityLanczosBitmap = null;
        this.qualityLanczosOrigin = null;
        this.qualityLanczosScale = null;
        this.qualityLanczosRegionKey = "";
    }

    private cancelPendingQualityRequest(): void {
        if (this.tiles.length === 0 || this.requestController === null) return;
        this.sourceRevision++;
        this.requestController.abort();
        this.requestController = null;
    }

    private getVisibleImageRect(source: TiefseeviewImageSource): { x: number; y: number; width: number; height: number } | null {
        const matrix = this.viewState?.imageToViewport;
        if (matrix === undefined) return null;
        const determinant = matrix.a * matrix.d - matrix.b * matrix.c;
        if (!Number.isFinite(determinant) || Math.abs(determinant) < 1e-12) return null;
        const points = [
            [-this.panOverscanCss, -this.panOverscanCss],
            [this.widthCss + this.panOverscanCss, -this.panOverscanCss],
            [-this.panOverscanCss, this.heightCss + this.panOverscanCss],
            [this.widthCss + this.panOverscanCss, this.heightCss + this.panOverscanCss]
        ].map(([vx, vy]) => {
            const px = vx - matrix.e;
            const py = vy - matrix.f;
            return [(matrix.d * px - matrix.c * py) / determinant, (-matrix.b * px + matrix.a * py) / determinant];
        });
        let left = Math.min(...points.map(point => point[0]));
        let top = Math.min(...points.map(point => point[1]));
        let right = Math.max(...points.map(point => point[0]));
        let bottom = Math.max(...points.map(point => point[1]));
        // 除既有 viewport 餘量外，至少包含 Lanczos3 在原圖座標中的取樣半徑。
        const filterMargin = Math.ceil(3 / this.getTargetScale()) + 1;
        const marginX = Math.max((right - left) * 0.08, filterMargin);
        const marginY = Math.max((bottom - top) * 0.08, filterMargin);
        left = Math.max(0, Math.floor(left - marginX));
        top = Math.max(0, Math.floor(top - marginY));
        right = Math.min(source.width, Math.ceil(right + marginX));
        bottom = Math.min(source.height, Math.ceil(bottom + marginY));
        if (right <= left || bottom <= top) return null;
        return { x: left, y: top, width: right - left, height: bottom - top };
    }

    private async loadLevel(
        source: TiefseeviewImageSource,
        level: TiefseeviewImageSource["levels"][number],
        revision: number,
        keepCurrentFrame: boolean
    ): Promise<void> {
        const controller = new AbortController();
        this.requestController = controller;
        let nextTiles: WebGLTile[] | null = null;
        let region: TiefseeviewImageSourceRegion | null = null;
        try {
            region = await source.requestRegion({
                rect: { x: 0, y: 0, width: source.width, height: source.height },
                scale: level.scale
            }, controller.signal);
            this.assertSourceRevision(revision, controller.signal);
            this.validateFullImageRegion(source, region, level.scale);
            nextTiles = await this.uploadTiles(source, region, revision, controller.signal);
            this.assertSourceRevision(revision, controller.signal);
            const previousLevelScale = keepCurrentFrame ? null : this.activeLevelScale;
            this.clearTextures();
            this.tiles = nextTiles;
            nextTiles = null;
            this.activeLevelScale = level.scale;
            const previousBitmap = this.previewBitmap;
            this.previewBitmap = region.source instanceof ImageBitmap ? region.source : null;
            if (previousBitmap !== null && previousBitmap !== this.previewBitmap) previousBitmap.close();
            this.qualityRegionKey = "";
            this.activeQualityScale = null;
            if (previousLevelScale !== null && previousLevelScale !== level.scale) source.releaseLevel?.(previousLevelScale);
            if (!keepCurrentFrame) {
                this.isReplacingSource = false;
                this.scheduleRender();
            }
        } catch (error) {
            if (nextTiles !== null) {
                for (const tile of nextTiles) this.gl.deleteTexture(tile.texture);
            }
            if (revision === this.sourceRevision && !keepCurrentFrame) this.source = null;
            throw error;
        } finally {
            if (region?.source instanceof ImageBitmap && region.source !== this.previewBitmap) region.source.close();
            if (this.requestController === controller) this.requestController = null;
        }
    }

    private scheduleIdleQualityUpdate(reason: string): void {
        window.clearTimeout(this.qualityTimer);
        this.qualityTimer = window.setTimeout(() => {
            console.info(`[Tiefseeview WebGL] 閒置 ${this.idleQualityDelayMs} ms 後開始高品質更新`, { reason });
            void this.loadIdleQuality().catch(error => {
                if (!(error instanceof DOMException && error.name === "AbortError")) {
                    console.warn("WebGL 停止操作後更新圖片品質失敗。", error);
                }
            });
        }, this.idleQualityDelayMs);
    }

    private async loadIdleQuality(): Promise<void> {
        await this.loadBestLevel();
        const source = this.source;
        const state = this.viewState;
        const bitmap = this.previewBitmap;
        const sourceScale = this.activeLevelScale;
        const qualityScale = this.activeQualityScale;
        const sharpenValue = this.getSharpenValue();
        if (source === null || state === null || sourceScale === null) return;
        // 「呈現像素」生效時，Lanczos3 會把最近點取樣的像素重新平滑，閒置更新需保留 WebGL 畫面。
        const pixelated = this.isPixelatedRendering(state);
        const targetScale = this.getTargetScale();
        const tileBitmap = this.qualityLanczosBitmap;
        const tileSourceScale = this.qualityLanczosScale;
        const tileSourceOrigin = this.qualityLanczosOrigin;
        const lanczosSourceOrigin = bitmap !== null && sourceScale >= targetScale
            ? { x: 0, y: 0 }
            : tileSourceOrigin;
        const lanczosBitmap = !pixelated && bitmap !== null && sourceScale >= targetScale
            ? bitmap
            : !pixelated && tileBitmap !== null && tileSourceScale !== null && tileSourceScale >= targetScale
                ? tileBitmap
                : null;
        const lanczosSourceScale = lanczosBitmap === bitmap && bitmap !== null
            ? sourceScale
            : lanczosBitmap === tileBitmap ? tileSourceScale : null;
        const hasLanczosTiles = !pixelated && qualityScale !== null && qualityScale >= targetScale && this.qualityTiles.length > 0;

        if (lanczosBitmap === null && sharpenValue <= 0) {
            console.info("[Tiefseeview WebGL] 閒置品質來源已就緒", {
                qualityPath: hasLanczosTiles ? "後端 Lanczos3 tile" : "保留 WebGL 即時畫面",
                rendering: this.getImageRendering(),
                pixelated,
                previewScale: sourceScale,
                qualityScale,
                targetScale,
                sharpenValue
            });
            return;
        }

        const renderer = await this.getLanczosRenderer();
        if (renderer === null || this.source !== source || this.viewState !== state || this.previewBitmap !== bitmap ||
            this.activeLevelScale !== sourceScale || this.activeQualityScale !== qualityScale || this.qualityLanczosBitmap !== tileBitmap) {
            return;
        }

        let rendered: boolean;
        let usedLanczos = lanczosBitmap !== null && lanczosSourceScale !== null;
        rendered = lanczosBitmap !== null && lanczosSourceScale !== null
            ? await renderer.render(lanczosBitmap, lanczosSourceScale, state, sharpenValue, lanczosSourceOrigin ?? { x: 0, y: 0 })
            : false;
        if (!rendered && sharpenValue > 0) {
            // Lanczos 不適用或跳過時，先等 WebGL 完成預覽／tile 合成，再銳化最終 viewport。
            await this.render();
            if (this.source !== source || this.viewState !== state || this.activeLevelScale !== sourceScale ||
                this.activeQualityScale !== qualityScale || this.getSharpenValue() <= 0) return;
            usedLanczos = false;
            rendered = await renderer.renderSharpenedCanvas(this.canvas, this.getSharpenValue());
        }
        if (rendered && this.source === source && this.viewState === state && this.previewBitmap === bitmap &&
            this.activeLevelScale === sourceScale && this.activeQualityScale === qualityScale && this.qualityLanczosBitmap === tileBitmap) {
            // 高品質畫面準備完成後，在同一個 JS 工作內切換圖層，避免透明像素重複合成。
            this.canvas.style.visibility = "hidden";
            renderer.show();
            if (usedLanczos) {
                console.info("[Tiefseeview WebGL] 閒置後完成 Lanczos3 viewport 重採樣", {
                    rendering: this.getImageRendering(),
                    pixelated,
                    previewScale: sourceScale,
                    sourceScale: lanczosSourceScale,
                    targetScale: this.getTargetScale(),
                    sharpenValue,
                    outputWidth: this.lanczosCanvas.width,
                    outputHeight: this.lanczosCanvas.height,
                    viewportCss: { width: state.viewport.widthCss, height: state.viewport.heightCss },
                    lanczosSourceOrigin,
                    lanczosSourceSize: lanczosBitmap === null ? null : { width: lanczosBitmap.width, height: lanczosBitmap.height },
                    displayedCanvas: "lanczos",
                    lanczosCanvasVisibility: this.lanczosCanvas.style.visibility
                });
            } else {
                console.info("[Tiefseeview WebGL] 閒置後完成 viewport 銳化", {
                    rendering: this.getImageRendering(),
                    pixelated,
                    sourceScale,
                    qualityScale,
                    sharpenValue,
                    outputWidth: this.lanczosCanvas.width,
                    outputHeight: this.lanczosCanvas.height,
                    displayedCanvas: "sharpened-webgpu",
                    lanczosCanvasVisibility: this.lanczosCanvas.style.visibility
                });
            }
        }
    }

    private getLanczosRenderer(): Promise<TiefseeviewLanczosRenderer | null> {
        if (this.lanczosRenderer !== null) return Promise.resolve(this.lanczosRenderer);
        if (this.lanczosRendererPromise !== null) return this.lanczosRendererPromise;
        this.lanczosRendererPromise = TiefseeviewLanczosRenderer.create(this.lanczosCanvas)
            .then(renderer => {
                if (this.disposed) {
                    renderer?.dispose();
                    return null;
                }
                this.lanczosRenderer = renderer;
                if (renderer === null) console.info("[Tiefseeview WebGL] 此 WebView 不支援 WebGPU，保留 WebGL 預覽");
                return renderer;
            })
            .catch(error => {
                this.lanczosRendererInitError = error;
                if (error instanceof TiefseeviewWebGPUUnsupportedError) {
                    console.info("[Tiefseeview WebGL] 此 WebView 不支援 WebGPU", error);
                } else {
                    console.warn("WebGPU Lanczos3 初始化失敗。", error);
                }
                return null;
            });
        return this.lanczosRendererPromise;
    }

    public dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        this.performanceMonitor.dispose();
        if (this.gpuTimerPollFrame !== 0) cancelAnimationFrame(this.gpuTimerPollFrame);
        this.gpuTimerPollFrame = 0;
        for (const query of this.pendingGpuTimerQueries) this.gl.deleteQuery(query);
        this.pendingGpuTimerQueries.length = 0;
        this.sourceRevision++;
        window.clearTimeout(this.qualityTimer);
        this.requestController?.abort();
        this.requestController = null;
        if (this.renderFrame !== 0) cancelAnimationFrame(this.renderFrame);
        this.renderFrame = 0;
        if (this.textureUploadFrame !== 0) cancelAnimationFrame(this.textureUploadFrame);
        this.textureUploadFrame = 0;
        for (const job of this.pendingTextureUploads.splice(0)) {
            if (job.source instanceof ImageBitmap) job.source.close();
            job.reject(new DOMException("WebGL Renderer 已釋放", "AbortError"));
        }
        this.clearTextures();
        this.previewBitmap?.close();
        this.previewBitmap = null;
        this.lanczosRenderer?.dispose();
        this.lanczosRenderer = null;
        this.source = null;
        this.viewState = null;
        for (const waiter of this.renderWaiters.splice(0)) waiter.resolve();
        const gl = this.gl;
        gl.deleteBuffer(this.buffer);
        gl.deleteProgram(this.program);
        this.canvas.width = 1;
        this.canvas.height = 1;
        this.lanczosCanvas.width = 1;
        this.lanczosCanvas.height = 1;
        this.canvas.style.display = "none";
        this.canvas.style.visibility = "hidden";
        this.lanczosCanvas.style.display = "none";
        this.lanczosCanvas.style.visibility = "hidden";
    }

    private createShader(type: number, source: string): WebGLShader {
        const shader = this.gl.createShader(type);
        if (shader === null) throw new Error("無法建立 WebGL shader");
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const message = this.gl.getShaderInfoLog(shader) || "WebGL shader 編譯失敗";
            this.gl.deleteShader(shader);
            throw new Error(message);
        }
        return shader;
    }

    private requireUniform(program: WebGLProgram, name: string): WebGLUniformLocation {
        const location = this.gl.getUniformLocation(program, name);
        if (location === null) throw new Error(`找不到 WebGL uniform：${name}`);
        return location;
    }

    private validateFullImageRegion(
        source: TiefseeviewImageSource,
        region: TiefseeviewImageSourceRegion,
        expectedScale: number
    ): void {
        if (region.scale !== expectedScale || region.imageRect.x !== 0 || region.imageRect.y !== 0 ||
            region.imageRect.width !== source.width || region.imageRect.height !== source.height ||
            region.pixelWidth <= 0 || region.pixelHeight <= 0 ||
            region.pixelWidth * region.pixelHeight > this.maxSourcePixels) {
            throw new Error("ImageSource 未回傳要求層級的完整圖片");
        }
    }

    private validateRegion(source: TiefseeviewImageSource, region: TiefseeviewImageSourceRegion, expectedScale: number): void {
        const rect = region.imageRect;
        if (region.scale !== expectedScale || rect.x < 0 || rect.y < 0 || rect.width <= 0 || rect.height <= 0 ||
            rect.x + rect.width > source.width || rect.y + rect.height > source.height ||
            region.pixelWidth <= 0 || region.pixelHeight <= 0 || region.contentRect === undefined ||
            region.contentRect.width <= 0 || region.contentRect.height <= 0 ||
            region.contentRect.x < 0 || region.contentRect.y < 0 ||
            region.contentRect.x + region.contentRect.width > region.pixelWidth ||
            region.contentRect.y + region.contentRect.height > region.pixelHeight) {
            throw new Error("ImageSource 未回傳要求的有效圖片區域");
        }
    }

    private uploadSourceTile(region: TiefseeviewImageSourceRegion, revision: number, signal: AbortSignal): Promise<WebGLTile> {
        const content = region.contentRect;
        if (content === undefined) throw new Error("來源格子缺少內容範圍");
        return this.enqueueTextureUpload(region.source, region.pixelWidth, region.pixelHeight, region.imageRect, content, revision, signal);
    }

    private enqueueTextureUpload(
        source: ImageBitmap,
        pixelWidth: number,
        pixelHeight: number,
        imageRect: { x: number; y: number; width: number; height: number },
        contentRect: { x: number; y: number; width: number; height: number },
        revision: number,
        signal: AbortSignal
    ): Promise<WebGLTile> {
        return new Promise<WebGLTile>((resolve, reject) => {
            this.pendingTextureUploads.push({ source, pixelWidth, pixelHeight, imageRect, contentRect, revision, signal, resolve, reject });
            this.scheduleTextureUploads();
        });
    }

    private scheduleTextureUploads(): void {
        if (this.disposed || this.textureUploadFrame !== 0 || this.pendingTextureUploads.length === 0) return;
        this.textureUploadFrame = requestAnimationFrame(() => {
            this.textureUploadFrame = 0;
            for (let count = 0; count < 2 && this.pendingTextureUploads.length > 0; count++) {
                const job = this.pendingTextureUploads.shift()!;
                try {
                    this.assertSourceRevision(job.revision, job.signal);
                    job.resolve(this.uploadBitmapTile(job.source, job.pixelWidth, job.pixelHeight, job.imageRect, job.contentRect));
                } catch (error) {
                    job.reject(error);
                } finally {
                    if (job.source instanceof ImageBitmap) job.source.close();
                }
            }
            this.scheduleTextureUploads();
        });
    }

    private uploadBitmapTile(
        source: ImageBitmap,
        pixelWidth: number,
        pixelHeight: number,
        imageRect: { x: number; y: number; width: number; height: number },
        content: { x: number; y: number; width: number; height: number }
    ): WebGLTile {
        const gl = this.gl;
        const texture = gl.createTexture();
        if (texture === null) throw new Error("無法建立 WebGL texture");
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        this.setTextureSampling(texture, this.isPixelatedRendering(this.viewState));
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, source);
        gl.generateMipmap(gl.TEXTURE_2D);
        const glError = gl.getError();
        if (glError !== gl.NO_ERROR) {
            gl.deleteTexture(texture);
            throw new Error(`WebGL texture 上傳失敗（錯誤碼 ${glError}）`);
        }
        return {
            texture,
            x: imageRect.x,
            y: imageRect.y,
            width: imageRect.width,
            height: imageRect.height,
            uvLeft: content.x / pixelWidth,
            uvTop: content.y / pixelHeight,
            uvRight: (content.x + content.width) / pixelWidth,
            uvBottom: (content.y + content.height) / pixelHeight
        };
    }

    private async uploadTiles(
        source: TiefseeviewImageSource,
        region: TiefseeviewImageSourceRegion,
        revision: number,
        signal: AbortSignal
    ): Promise<WebGLTile[]> {
        const gutter = Math.min(32, Math.max(1, Math.floor((this.textureLimit - 64) / 2)));
        // 完整來源已通過像素預算；只有超出 GPU 貼圖上限時才需要再切分。
        const tileSize = Math.max(1, this.textureLimit - gutter * 2);
        const gl = this.gl;
        const nextTiles: WebGLTile[] = [];
        const regionScaleX = region.pixelWidth / region.imageRect.width;
        const regionScaleY = region.pixelHeight / region.imageRect.height;
        try {
            if (region.pixelWidth <= this.textureLimit && region.pixelHeight <= this.textureLimit) {
                // 完整來源可放進單張 GPU 貼圖時直接上傳，避免人為切縫及分開建立 mipmap。
                const bitmap = await createImageBitmap(region.source);
                try {
                    this.assertSourceRevision(revision, signal);
                    nextTiles.push(await this.enqueueTextureUpload(bitmap, bitmap.width, bitmap.height, region.imageRect, {
                        x: 0,
                        y: 0,
                        width: region.pixelWidth,
                        height: region.pixelHeight
                    }, revision, signal));
                } catch (error) {
                    bitmap.close();
                    throw error;
                }
                return nextTiles;
            }
            for (let y = 0; y < region.pixelHeight; y += tileSize) {
                for (let x = 0; x < region.pixelWidth; x += tileSize) {
                    this.assertSourceRevision(revision, signal);
                    const width = Math.min(tileSize, region.pixelWidth - x);
                    const height = Math.min(tileSize, region.pixelHeight - y);
                    const cropX = Math.max(0, x - gutter);
                    const cropY = Math.max(0, y - gutter);
                    const cropRight = Math.min(region.pixelWidth, x + width + gutter);
                    const cropBottom = Math.min(region.pixelHeight, y + height + gutter);
                    const cropWidth = cropRight - cropX;
                    const cropHeight = cropBottom - cropY;
                    const bitmap = await createImageBitmap(region.source, cropX, cropY, cropWidth, cropHeight);
                    try {
                        this.assertSourceRevision(revision, signal);
                        nextTiles.push(await this.enqueueTextureUpload(bitmap, bitmap.width, bitmap.height, {
                            x: region.imageRect.x + x / regionScaleX,
                            y: region.imageRect.y + y / regionScaleY,
                            width: width / regionScaleX,
                            height: height / regionScaleY,
                        }, {
                            x: x - cropX,
                            y: y - cropY,
                            width,
                            height
                        }, revision, signal));
                    } finally {
                        bitmap.close();
                    }
                }
            }
            return nextTiles;
        } catch (error) {
            for (const tile of nextTiles) gl.deleteTexture(tile.texture);
            throw error;
        }
    }

    private assertSourceRevision(revision: number, signal: AbortSignal): void {
        if (this.disposed || revision !== this.sourceRevision || signal.aborted) {
            throw new DOMException("WebGL 圖片載入已取消", "AbortError");
        }
    }

    private clearTextures(): void {
        this.clearQualityLanczosSource();
        this.cachedViewState = null;
        for (const tile of this.tiles) this.gl.deleteTexture(tile.texture);
        this.tiles.length = 0;
        for (const tile of this.qualityTiles) this.gl.deleteTexture(tile.texture);
        this.qualityTiles.length = 0;
        this.qualityRegionKey = "";
        this.activeQualityScale = null;
        this.pixelatedFilter = null;
    }

    private scheduleRender(): void {
        if (this.disposed || this.isReplacingSource || this.renderFrame !== 0) return;
        this.renderFrame = requestAnimationFrame(() => {
            this.renderFrame = 0;
            const startedAt = performance.now();
            const gpuQuery = this.beginGpuTimerQuery();
            try {
                if (this.canvasSizeDirty) this.resizeCanvases();
                this.draw();
                this.performanceMonitor.recordFrame(performance.now() - startedAt, this.frameDrawCalls);
                if (this.sourceRevealPending && this.source !== null && this.viewState !== null &&
                    (this.tiles.length > 0 || this.qualityTiles.length > 0) && this.widthCss > 0 && this.heightCss > 0) {
                    this.sourceRevealPending = false;
                    this.lanczosRenderer?.clearSource();
                    this.sourceVisible = true;
                    this.canvas.style.display = "";
                    this.canvas.style.visibility = "visible";
                }
                for (const waiter of this.renderWaiters.splice(0)) waiter.resolve();
            } catch (error) {
                const waiters = this.renderWaiters.splice(0);
                if (waiters.length === 0) console.error("WebGL 圖片繪製失敗。", error);
                for (const waiter of waiters) waiter.reject(error);
            } finally {
                this.endGpuTimerQuery(gpuQuery);
            }
        });
    }

    private beginGpuTimerQuery(): WebGLQuery | null {
        const extension = this.gpuTimerExtension;
        if (extension === null || !this.performanceMonitor.isPanActive) return null;
        const query = this.gl.createQuery();
        if (query === null) return null;
        this.gl.beginQuery(extension.TIME_ELAPSED_EXT, query);
        return query;
    }

    private endGpuTimerQuery(query: WebGLQuery | null): void {
        if (query === null || this.gpuTimerExtension === null) return;
        this.gl.endQuery(this.gpuTimerExtension.TIME_ELAPSED_EXT);
        this.pendingGpuTimerQueries.push(query);
        this.scheduleGpuTimerPoll();
    }

    private scheduleGpuTimerPoll(): void {
        if (this.disposed || this.gpuTimerPollFrame !== 0 || this.pendingGpuTimerQueries.length === 0) return;
        this.gpuTimerPollFrame = requestAnimationFrame(() => {
            this.gpuTimerPollFrame = 0;
            const extension = this.gpuTimerExtension;
            if (extension === null) return;
            for (let i = this.pendingGpuTimerQueries.length - 1; i >= 0; i--) {
                const query = this.pendingGpuTimerQueries[i];
                if (this.gl.getQueryParameter(query, this.gl.QUERY_RESULT_AVAILABLE) !== true) continue;
                if (this.gl.getParameter(extension.GPU_DISJOINT_EXT) !== true) {
                    const nanoseconds = Number(this.gl.getQueryParameter(query, this.gl.QUERY_RESULT));
                    this.performanceMonitor.recordGpuDraw(nanoseconds / 1_000_000);
                }
                this.gl.deleteQuery(query);
                this.pendingGpuTimerQueries.splice(i, 1);
            }
            this.scheduleGpuTimerPoll();
        });
    }

    private isPixelatedRendering(state: TiefseeviewViewState | null): boolean {
        const rendering = this.getImageRendering();
        if (rendering === 1) return true;
        if (rendering !== 2 || state === null || state.image.width <= 0) return false;
        return state.image.displayWidthCss / state.image.width * state.viewport.devicePixelRatio > 1;
    }

    private setTextureSampling(texture: WebGLTexture, pixelated: boolean): void {
        const gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, pixelated ? gl.NEAREST_MIPMAP_NEAREST : gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, pixelated ? gl.NEAREST : gl.LINEAR);
    }

    private getCachedPanOffset(state: TiefseeviewViewState): { x: number; y: number } | null {
        const cached = this.cachedViewState;
        if (cached === null || !cached.image.isReady || !state.image.isReady) return null;
        if (cached.image.width !== state.image.width || cached.image.height !== state.image.height ||
            cached.image.displayWidthCss !== state.image.displayWidthCss ||
            cached.image.displayHeightCss !== state.image.displayHeightCss ||
            cached.viewport.widthCss !== state.viewport.widthCss || cached.viewport.heightCss !== state.viewport.heightCss ||
            cached.viewport.devicePixelRatio !== state.viewport.devicePixelRatio ||
            cached.viewport.renderDpiZoom !== state.viewport.renderDpiZoom ||
            cached.transform.rotationDeg !== state.transform.rotationDeg ||
            cached.transform.mirrorHorizontal !== state.transform.mirrorHorizontal ||
            cached.transform.mirrorVertical !== state.transform.mirrorVertical) return null;

        const before = cached.imageToViewport;
        const after = state.imageToViewport;
        if (Math.abs(before.a - after.a) > 1e-6 || Math.abs(before.b - after.b) > 1e-6 ||
            Math.abs(before.c - after.c) > 1e-6 || Math.abs(before.d - after.d) > 1e-6) return null;
        const deltaX = after.e - before.e;
        const deltaY = after.f - before.f;
        const overflow = this.getPanOverflow(state);
        if (!overflow.x && !overflow.y) {
            return Math.abs(deltaX) <= 1e-6 && Math.abs(deltaY) <= 1e-6 ? { x: 0, y: 0 } : null;
        }
        if ((!overflow.x && Math.abs(deltaX) > 1e-6) || (!overflow.y && Math.abs(deltaY) > 1e-6)) return null;
        const x = overflow.x ? deltaX : 0;
        const y = overflow.y ? deltaY : 0;
        return Math.abs(x) <= this.panOverscanCss && Math.abs(y) <= this.panOverscanCss ? { x, y } : null;
    }

    private getPanOverflow(state: TiefseeviewViewState): { x: boolean; y: boolean } {
        const { a, b, c, d } = state.imageToViewport;
        const width = Math.abs(a) * state.image.width + Math.abs(c) * state.image.height;
        const height = Math.abs(b) * state.image.width + Math.abs(d) * state.image.height;
        return {
            x: width > state.viewport.widthCss + 1e-6,
            y: height > state.viewport.heightCss + 1e-6
        };
    }

    private hasPanOverflow(state: TiefseeviewViewState): boolean {
        const overflow = this.getPanOverflow(state);
        return overflow.x || overflow.y;
    }

    private getTileClipBounds(tile: WebGLTile, state: TiefseeviewViewState): { left: number; right: number; top: number; bottom: number } {
        const { a, b, c, d, e, f } = state.imageToViewport;
        const canvasWidthCss = this.widthCss + this.panOverscanCss * 2;
        const canvasHeightCss = this.heightCss + this.panOverscanCss * 2;
        const corners = [
            [tile.x, tile.y],
            [tile.x + tile.width, tile.y],
            [tile.x, tile.y + tile.height],
            [tile.x + tile.width, tile.y + tile.height]
        ].map(([x, y]) => {
            const viewportX = a * x + c * y + e;
            const viewportY = b * x + d * y + f;
            return [
                (viewportX + this.panOverscanCss) / canvasWidthCss * 2 - 1,
                1 - (viewportY + this.panOverscanCss) / canvasHeightCss * 2
            ];
        });
        return {
            left: Math.min(...corners.map(point => point[0])),
            right: Math.max(...corners.map(point => point[0])),
            top: Math.min(...corners.map(point => point[1])),
            bottom: Math.max(...corners.map(point => point[1]))
        };
    }

    private isTileVisible(tile: WebGLTile, state: TiefseeviewViewState): boolean {
        const bounds = this.getTileClipBounds(tile, state);
        return bounds.right >= -1 && bounds.left <= 1 && bounds.bottom >= -1 && bounds.top <= 1;
    }

    private draw(): void {
        this.frameDrawCalls = 0;
        const gl = this.gl;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        const state = this.viewState;
        if (state === null || (this.tiles.length === 0 && this.qualityTiles.length === 0) || this.widthCss <= 0 || this.heightCss <= 0) return;

        const { a, b, c, d, e, f } = state.imageToViewport;
        const canvasWidthCss = this.widthCss + this.panOverscanCss * 2;
        const canvasHeightCss = this.heightCss + this.panOverscanCss * 2;
        const pixelated = this.isPixelatedRendering(state);
        const filterChanged = pixelated !== this.pixelatedFilter;
        this.pixelatedFilter = pixelated;
        gl.useProgram(this.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.enableVertexAttribArray(this.uvLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.vertexAttribPointer(this.uvLocation, 2, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
        gl.activeTexture(gl.TEXTURE0);
        if (filterChanged) {
            for (const tile of [...this.tiles, ...this.qualityTiles]) {
                this.setTextureSampling(tile.texture, pixelated);
            }
        }
        const drawTile = (tile: WebGLTile): void => {
            const toClip = (x: number, y: number): [number, number] => {
                const viewportX = a * x + c * y + e;
                const viewportY = b * x + d * y + f;
                return [
                    (viewportX + this.panOverscanCss) / canvasWidthCss * 2 - 1,
                    1 - (viewportY + this.panOverscanCss) / canvasHeightCss * 2
                ];
            };
            const left = tile.x;
            const top = tile.y;
            const right = left + tile.width;
            const bottom = top + tile.height;
            const bounds = this.getTileClipBounds(tile, state);
            if (bounds.right < -1 || bounds.left > 1 || bounds.bottom < -1 || bounds.top > 1) return;
            const tl = toClip(left, top);
            const tr = toClip(right, top);
            const bl = toClip(left, bottom);
            const br = toClip(right, bottom);
            this.vertexData.set([
                tl[0], tl[1], tile.uvLeft, tile.uvTop,
                tr[0], tr[1], tile.uvRight, tile.uvTop,
                bl[0], bl[1], tile.uvLeft, tile.uvBottom,
                br[0], br[1], tile.uvRight, tile.uvBottom
            ]);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexData);
            gl.bindTexture(gl.TEXTURE_2D, tile.texture);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            this.frameDrawCalls++;
        };

        // 預覽以 source-over 混合；高解析 tile 則以預乘 alpha 覆寫其區域，避免半透明 tile 與預覽底圖疊色。
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.uniform1i(this.premultiplyAlphaLocation, 0);
        for (const tile of this.tiles) drawTile(tile);

        gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.ONE, gl.ZERO);
        gl.uniform1i(this.premultiplyAlphaLocation, 1);
        for (const tile of this.qualityTiles) {
            if (tile.scale === this.activeQualityScale) drawTile(tile);
        }
        this.cachedViewState = state;
        this.canvas.style.transform = "translate3d(0px, 0px, 0)";
    }
}
