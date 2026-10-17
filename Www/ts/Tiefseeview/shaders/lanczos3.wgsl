struct Params {
    sourceSize: vec2<u32>, outputSize: vec2<u32>, imageSize: vec2<u32>, sourceOrigin: vec2<f32>,
    matrix0: vec4<f32>, matrix1: vec2<f32>, sourceScale: vec2<f32>, pixelToCss: vec2<f32>, filterScale: f32,
};
@group(0) @binding(0) var src: texture_2d<f32>;
@group(0) @binding(1) var dst: texture_storage_2d<rgba16float, write>;
@group(0) @binding(2) var<uniform> p: Params;

fn sinc(x: f32) -> f32 {
    if (abs(x) < 0.00001) { return 1.0; }
    let px = 3.141592653589793 * x;
    return sin(px) / px;
}
fn lanczos(distance: f32, filterScale: f32) -> f32 {
    let d = distance * filterScale;
    if (abs(d) >= 3.0) { return 0.0; }
    return sinc(d) * sinc(d / 3.0);
}
@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    if (gid.x >= p.outputSize.x || gid.y >= p.outputSize.y) { return; }
    let viewport = (vec2<f32>(gid.xy) + vec2<f32>(0.5)) * p.pixelToCss;
    let a = p.matrix0.x;
    let b = p.matrix0.y;
    let c = p.matrix0.z;
    let d = p.matrix0.w;
    let determinant = a * d - b * c;
    let px = viewport.x - p.matrix1.x;
    let py = viewport.y - p.matrix1.y;
    let imageX = (d * px - c * py) / determinant;
    let imageY = (-b * px + a * py) / determinant;
    if (imageX < 0.0 || imageY < 0.0 || imageX >= f32(p.imageSize.x) || imageY >= f32(p.imageSize.y)) {
        textureStore(dst, vec2<i32>(gid.xy), vec4<f32>(0.0));
        return;
    }
    let center = (vec2<f32>(imageX, imageY) - p.sourceOrigin) * p.sourceScale - vec2<f32>(0.5);
    let support = 3.0 / p.filterScale;
    let firstX = i32(ceil(center.x - support));
    let lastX = i32(floor(center.x + support));
    let firstY = i32(ceil(center.y - support));
    let lastY = i32(floor(center.y + support));
    var sum = vec4<f32>(0.0);
    var weightSum = 0.0;
    for (var sy = firstY; sy <= lastY; sy = sy + 1) {
        let wy = lanczos(center.y - f32(sy), p.filterScale);
        for (var sx = firstX; sx <= lastX; sx = sx + 1) {
            let weight = wy * lanczos(center.x - f32(sx), p.filterScale);
            let coord = vec2<i32>(clamp(sx, 0, i32(p.sourceSize.x) - 1), clamp(sy, 0, i32(p.sourceSize.y) - 1));
            sum += textureLoad(src, coord, 0) * weight;
            weightSum += weight;
        }
    }
    textureStore(dst, vec2<i32>(gid.xy), sum / max(weightSum, 0.00001));
}
