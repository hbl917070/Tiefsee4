export interface TiefseeviewPoint {
    x: number;
    y: number;
}

export interface TiefseeviewRotatedRect extends TiefseeviewPoint {
    rectWidth: number;
    rectHeight: number;
}

/** 取得矩形旋轉後的實際大小，以及矩形內指定點旋轉後的位置。 */
export function getRotateRect(width: number, height: number, x: number, y: number, deg: number): TiefseeviewRotatedRect {
    const rad = deg * Math.PI / 180;
    const rectWidth = Math.abs(width * Math.cos(rad)) + Math.abs(height * Math.sin(rad));
    const rectHeight = Math.abs(width * Math.sin(rad)) + Math.abs(height * Math.cos(rad));

    const centerX = x - width / 2;
    const centerY = y - height / 2;
    let newX = centerX * Math.cos(rad) - centerY * Math.sin(rad);
    let newY = centerX * Math.sin(rad) + centerY * Math.cos(rad);
    newX += rectWidth / 2;
    newY += rectHeight / 2;

    return { rectWidth, rectHeight, x: newX, y: newY };
}

/** 旋轉向量。 */
export function rotateVector(vec: TiefseeviewPoint, deg: number): TiefseeviewPoint {
    const theta = Math.PI * deg / 180;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    return {
        x: vec.x * cos - vec.y * sin,
        y: vec.x * sin + vec.y * cos
    };
}

/** 取得旋轉後圖片原點在包圍矩形中的座標。 */
export function getRotatedOrig(width: number, height: number, deg: number): TiefseeviewPoint {
    const points = [
        { x: 0, y: 0 },
        { x: 0, y: height },
        { x: width, y: 0 },
        { x: width, y: height }
    ].map(point => rotateVector(point, deg));
    const minX = Math.min(...points.map(point => point.x));
    const minY = Math.min(...points.map(point => point.y));
    return { x: -minX, y: -minY };
}

/** 將旋轉後座標轉回原始圖片座標。 */
export function getOrigPoint(x: number, y: number, width: number, height: number, deg: number): TiefseeviewPoint {
    const origin = getRotatedOrig(width, height, deg);
    return rotateVector({ x: x - origin.x, y: y - origin.y }, -deg);
}
