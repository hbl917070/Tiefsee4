import type { TiefseeviewViewState } from "./TiefseeviewTypes";
import lanczosShader from "./shaders/lanczos3.wgsl";
import displayShader from "./shaders/display.wgsl";

/** WebGPU API 或裝置無法使用，呼叫端可據此回退至 Canvas 並更新設定。 */
export class TiefseeviewWebGPUUnsupportedError extends Error {
    public constructor(message = "此 WebView 不支援 WebGPU") {
        super(message);
        this.name = "TiefseeviewWebGPUUnsupportedError";
    }
}

/** 停止操作後，以 WebGPU 對圖片來源執行 Lanczos3 viewport 重採樣。 */
export class TiefseeviewLanczosRenderer {
    private static supportCheck: Promise<boolean> | null = null;
    private readonly gpu: any;
    private readonly canvasContext: any;
    private readonly device: any;
    private readonly pipeline: any;
    private readonly displayPipeline: any;
    private readonly maxTextureSize: number;
    private sourceTexture: any = null;
    private sourceImage: CanvasImageSource | null = null;
    private outputTexture: any = null;
    private outputWidth = 0;
    private outputHeight = 0;
    private frameRevision = 0;
    private disposed = false;

    private constructor(private readonly canvas: HTMLCanvasElement, device: any, context: any, format: string, maxTextureSize: number, pipeline: any, displayPipeline: any) {
        this.device = device;
        this.canvasContext = context;
        this.maxTextureSize = maxTextureSize;
        this.pipeline = pipeline;
        this.displayPipeline = displayPipeline;
        this.gpu = (navigator as any).gpu;
        context.configure({ device, format, alphaMode: "premultiplied" });
    }

    public static async create(canvas: HTMLCanvasElement): Promise<TiefseeviewLanczosRenderer> {
        const gpu = (navigator as any).gpu;
        if (gpu === undefined) throw new TiefseeviewWebGPUUnsupportedError();
        let adapter: any;
        try {
            adapter = await gpu.requestAdapter();
        } catch (error) {
            throw new TiefseeviewWebGPUUnsupportedError(`無法取得 WebGPU adapter：${String(error)}`);
        }
        if (adapter === null) throw new TiefseeviewWebGPUUnsupportedError("此 WebView 沒有可用的 WebGPU adapter");
        let device: any;
        try {
            device = await adapter.requestDevice();
        } catch (error) {
            throw new TiefseeviewWebGPUUnsupportedError(`無法建立 WebGPU device：${String(error)}`);
        }
        const format = gpu.getPreferredCanvasFormat();
        const context = canvas.getContext("webgpu") as any;
        if (context === null) {
            device.destroy();
            throw new TiefseeviewWebGPUUnsupportedError("此 WebView 無法建立 WebGPU canvas context");
        }
        try {
            const shaderModule = device.createShaderModule({ code: lanczosShader });
            const compilation = await shaderModule.getCompilationInfo();
            const compileErrors = compilation.messages.filter((item: any) => item.type === "error");
            if (compileErrors.length > 0) throw new Error(compileErrors.map((item: any) => item.message).join("; "));
            const pipeline = await device.createComputePipelineAsync({
                layout: "auto",
                compute: { module: shaderModule, entryPoint: "main" }
            });
            const displayModule = device.createShaderModule({ code: displayShader });
            const displayPipeline = await device.createRenderPipelineAsync({
                layout: "auto",
                vertex: { module: displayModule, entryPoint: "vertex" },
                fragment: { module: displayModule, entryPoint: "fragment", targets: [{ format }] },
                primitive: { topology: "triangle-list" }
            });
            return new TiefseeviewLanczosRenderer(canvas, device, context, format, device.limits.maxTextureDimension2D, pipeline, displayPipeline);
        } catch (error) {
            device.destroy();
            throw error;
        }
    }

    /** 設定開啟 WebGL Renderer 前驗證完整高品質處理管線；同一視窗只檢查一次。 */
    public static checkSupport(): Promise<boolean> {
        if (this.supportCheck !== null) return this.supportCheck;
        this.supportCheck = (async () => {
            const canvas = document.createElement("canvas");
            try {
                const renderer = await this.create(canvas);
                renderer.dispose();
                return true;
            } catch (error) {
                console.warn("WebGPU Lanczos3 支援檢查失敗。", error);
                return false;
            }
        })();
        return this.supportCheck;
    }

    public hide(): void {
        this.frameRevision++;
        this.canvas.style.visibility = "hidden";
    }

    public show(): void {
        this.canvas.style.visibility = "visible";
    }

    public clearSource(): void {
        this.frameRevision++;
        this.sourceTexture?.destroy();
        this.sourceTexture = null;
        this.sourceImage = null;
        this.canvas.style.visibility = "hidden";
    }

    public async render(
        bitmap: ImageBitmap,
        sourceScale: number,
        state: TiefseeviewViewState,
        sharpenValue = 0,
        sourceOrigin = { x: 0, y: 0 }
    ): Promise<boolean> {
        const revision = ++this.frameRevision;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const matrix = state.imageToViewport;
        // 依明確的 viewport CSS/backing 比例取樣，不依賴 canvas 的可見狀態或排版尺寸。
        const pixelToCssX = state.viewport.widthCss > 0 ? state.viewport.widthCss / width : 1 / state.viewport.devicePixelRatio;
        const pixelToCssY = state.viewport.heightCss > 0 ? state.viewport.heightCss / height : 1 / state.viewport.devicePixelRatio;
        const targetScale = this.getTargetScale(matrix, 1 / pixelToCssX, 1 / pixelToCssY);
        const effectiveScale = targetScale / sourceScale;
        let skipReason: string | null = null;
        if (this.disposed) skipReason = "renderer 已釋放";
        else if (width <= 0 || height <= 0 || width > this.maxTextureSize || height > this.maxTextureSize) skipReason = "viewport 超出 WebGPU texture 上限";
        else if (bitmap.width > this.maxTextureSize || bitmap.height > this.maxTextureSize) skipReason = "預覽圖片超出 WebGPU texture 上限";
        else if (effectiveScale < 0.25 || !Number.isFinite(effectiveScale)) skipReason = "來源倍率過高，Lanczos 取樣範圍過大";
        else if (matrix.a * matrix.d - matrix.b * matrix.c === 0) skipReason = "ViewState 矩陣不可逆";
        if (skipReason !== null) {
            console.info("[Tiefseeview WebGL] 略過 Lanczos3 viewport 重採樣", { reason: skipReason, targetScale, sourceScale, effectiveScale });
            this.hide();
            return false;
        }
        let params: any = null;
        try {
            this.ensureSource(bitmap);
            this.ensureOutput(width, height);
            params = this.device.createBuffer({ size: 80, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
            const data = new DataView(new ArrayBuffer(80));
            data.setUint32(0, bitmap.width, true);
            data.setUint32(4, bitmap.height, true);
            data.setUint32(8, width, true);
            data.setUint32(12, height, true);
            data.setUint32(16, state.image.width, true);
            data.setUint32(20, state.image.height, true);
            data.setFloat32(32, matrix.a, true);
            data.setFloat32(36, matrix.b, true);
            data.setFloat32(40, matrix.c, true);
            data.setFloat32(44, matrix.d, true);
            data.setFloat32(48, matrix.e, true);
            data.setFloat32(52, matrix.f, true);
            data.setFloat32(24, sourceOrigin.x, true);
            data.setFloat32(28, sourceOrigin.y, true);
            data.setFloat32(56, sourceScale, true);
            data.setFloat32(60, sourceScale, true);
            data.setFloat32(64, pixelToCssX, true);
            data.setFloat32(68, pixelToCssY, true);
            data.setFloat32(72, Math.min(1, effectiveScale), true);
            data.setFloat32(76, Math.max(0, sharpenValue), true);
            this.device.queue.writeBuffer(params, 0, data.buffer);
            const bindGroup = this.device.createBindGroup({
                layout: this.pipeline.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: this.sourceTexture.createView() },
                    { binding: 1, resource: this.outputTexture.createView() },
                    { binding: 2, resource: { buffer: params } }
                ]
            });
            const displayBindGroup = this.device.createBindGroup({
                layout: this.displayPipeline.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: this.outputTexture.createView() },
                    { binding: 1, resource: { buffer: params } }
                ]
            });
            const encoder = this.device.createCommandEncoder();
            const compute = encoder.beginComputePass();
            compute.setPipeline(this.pipeline);
            compute.setBindGroup(0, bindGroup);
            compute.dispatchWorkgroups(Math.ceil(width / 8), Math.ceil(height / 8));
            compute.end();
            const display = encoder.beginRenderPass({ colorAttachments: [{
                view: this.canvasContext.getCurrentTexture().createView(),
                clearValue: { r: 0, g: 0, b: 0, a: 0 },
                loadOp: "clear",
                storeOp: "store"
            }] });
            display.setPipeline(this.displayPipeline);
            display.setBindGroup(0, displayBindGroup);
            display.draw(3);
            display.end();
            this.device.queue.submit([encoder.finish()]);
            await this.device.queue.onSubmittedWorkDone();
            params.destroy();
            params = null;
            if (revision !== this.frameRevision || this.disposed) return false;
            // 只在畫面完整且仍有效時回報成功，由 WebGL Renderer 與預覽層互斥切換。
            return true;
        } catch (error) {
            params?.destroy();
            console.warn("WebGPU Lanczos3 閒置重採樣失敗。", error);
            this.hide();
            return false;
        }
    }

    /** Lanczos 不適用時，對已完成 WebGL 預覽／tile 合成的 viewport 做閒置銳化。 */
    public async renderSharpenedCanvas(sourceCanvas: HTMLCanvasElement, sharpenValue: number): Promise<boolean> {
        const revision = ++this.frameRevision;
        const width = sourceCanvas.width;
        const height = sourceCanvas.height;
        if (this.disposed || sharpenValue <= 0 || width <= 0 || height <= 0 ||
            width > this.maxTextureSize || height > this.maxTextureSize) {
            this.hide();
            return false;
        }

        let params: any = null;
        try {
            // 同一個 WebGL canvas 會持續改畫，不能依 Canvas 物件身分略過貼圖更新。
            this.ensureSource(sourceCanvas, true);
            this.ensureOutput(width, height);
            params = this.device.createBuffer({ size: 80, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
            const data = new DataView(new ArrayBuffer(80));
            data.setFloat32(76, sharpenValue, true);
            this.device.queue.writeBuffer(params, 0, data.buffer);
            const bindGroup = this.device.createBindGroup({
                layout: this.displayPipeline.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: this.sourceTexture.createView() },
                    { binding: 1, resource: { buffer: params } }
                ]
            });
            const encoder = this.device.createCommandEncoder();
            const display = encoder.beginRenderPass({ colorAttachments: [{
                view: this.canvasContext.getCurrentTexture().createView(),
                clearValue: { r: 0, g: 0, b: 0, a: 0 },
                loadOp: "clear",
                storeOp: "store"
            }] });
            display.setPipeline(this.displayPipeline);
            display.setBindGroup(0, bindGroup);
            display.draw(3);
            display.end();
            this.device.queue.submit([encoder.finish()]);
            await this.device.queue.onSubmittedWorkDone();
            params.destroy();
            params = null;
            return revision === this.frameRevision && !this.disposed;
        } catch (error) {
            params?.destroy();
            console.warn("WebGPU viewport 銳化失敗。", error);
            this.hide();
            return false;
        }
    }

    public dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        this.frameRevision++;
        this.sourceTexture?.destroy();
        this.outputTexture?.destroy();
        this.sourceTexture = null;
        this.outputTexture = null;
        this.sourceImage = null;
        this.canvas.style.visibility = "hidden";
        this.canvas.width = 1;
        this.canvas.height = 1;
        this.device.destroy();
    }

    private ensureSource(source: CanvasImageSource, forceUpload = false): void {
        if (!forceUpload && this.sourceImage === source && this.sourceTexture !== null) return;
        this.sourceTexture?.destroy();
        const width = source instanceof HTMLCanvasElement || source instanceof OffscreenCanvas ? source.width : (source as ImageBitmap).width;
        const height = source instanceof HTMLCanvasElement || source instanceof OffscreenCanvas ? source.height : (source as ImageBitmap).height;
        this.sourceTexture = this.device.createTexture({
            size: [width, height],
            format: "rgba8unorm",
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        });
        this.device.queue.copyExternalImageToTexture(
            { source },
            { texture: this.sourceTexture, premultipliedAlpha: true },
            [width, height]
        );
        this.sourceImage = source;
    }

    private ensureOutput(width: number, height: number): void {
        if (this.outputTexture !== null && this.outputWidth === width && this.outputHeight === height) return;
        this.outputTexture?.destroy();
        this.outputTexture = this.device.createTexture({
            size: [width, height],
            format: "rgba16float",
            usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
        });
        this.outputWidth = width;
        this.outputHeight = height;
        this.canvasContext.configure({ device: this.device, format: this.gpu.getPreferredCanvasFormat(), alphaMode: "premultiplied" });
    }

    private getTargetScale(matrix: TiefseeviewViewState["imageToViewport"], scaleX: number, scaleY: number): number {
        const a = matrix.a * scaleX;
        const b = matrix.b * scaleY;
        const c = matrix.c * scaleX;
        const d = matrix.d * scaleY;
        const sumSquares = a * a + b * b + c * c + d * d;
        const determinant = a * d - b * c;
        const discriminant = Math.max(0, sumSquares * sumSquares - 4 * determinant * determinant);
        return Math.sqrt((sumSquares + Math.sqrt(discriminant)) / 2);
    }
}
