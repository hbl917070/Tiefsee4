/** 將原圖像素座標映射至圖片檢視器 viewport CSS pixel 的 2D 仿射矩陣。 */
export interface TiefseeviewAffineTransform {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
}

export interface TiefseeviewImageRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface TiefseeviewViewState {
    /** 每次發布新的檢視狀態時遞增，用於辨識過期的非同步繪製工作。 */
    revision: number;
    image: {
        width: number;
        height: number;
        displayWidthCss: number;
        displayHeightCss: number;
        isReady: boolean;
    };
    viewport: {
        widthCss: number;
        heightCss: number;
        /** CSS pixel 至實體螢幕 pixel 的比例。 */
        devicePixelRatio: number;
        /** 舊 Canvas 路徑用於提高來源取樣解析度的 Tiefsee DPI 比例。 */
        renderDpiZoom: number;
    };
    container: {
        leftCss: number;
        topCss: number;
    };
    transform: {
        rotationDeg: number;
        mirrorHorizontal: boolean;
        mirrorVertical: boolean;
    };
    /** Renderer 使用此矩陣映射來源像素，不需自行套用 DOM transform。 */
    imageToViewport: TiefseeviewAffineTransform;
}

/**
 * Renderer 共用生命週期。Controller 是互動狀態的權威來源，ViewState 是
 * Renderer 消費的快照；來源設定與 viewport 尺寸由靜態圖片 Renderer 擴充。
 */
export interface TiefseeviewRenderer {
    setViewState(state: TiefseeviewViewState): void;
    render(isImmediatelyRun?: boolean): Promise<void>;
    dispose(): void;
}

/** 使用靜態圖片來源及自有 viewport canvas 的 Renderer 能力。 */
export interface TiefseeviewImageRenderer extends TiefseeviewRenderer {
    setSource(source: import("./TiefseeviewImageSource").TiefseeviewImageSource | null): Promise<void>;
    resize(widthCss: number, heightCss: number, devicePixelRatio: number): void;
}

