@group(0) @binding(0) var image: texture_2d<f32>;
struct Params { cropOrigin: vec2<f32>, sharpen: f32, _pad0: f32 };
@group(0) @binding(1) var<uniform> p: Params;
struct VOut { @builtin(position) pos: vec4<f32> };
fn blurWeight(x: i32, y: i32) -> f32 {
    if (x < -1 || x > 1 || y < -1 || y > 1) { return 0.0; }
    if (x == 0 && y == 0) { return 0.522831; }
    if (x == 0 || y == 0) { return 0.100120; }
    return 0.019172;
}
@vertex fn vertex(@builtin(vertex_index) i: u32) -> VOut {
    var positions = array<vec2<f32>, 3>(vec2<f32>(-1.0, -1.0), vec2<f32>(3.0, -1.0), vec2<f32>(-1.0, 3.0));
    var output: VOut;
    output.pos = vec4<f32>(positions[i], 0.0, 1.0);
    return output;
}
@fragment fn fragment(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
    let dims = vec2<i32>(textureDimensions(image));
    let cropOrigin = vec2<i32>(round(p.cropOrigin));
    let coord = clamp(vec2<i32>(pos.xy) + cropOrigin, vec2<i32>(0), dims - vec2<i32>(1));
    let center = textureLoad(image, coord, 0);
    if (p.sharpen <= 0.0 || center.a <= 0.000001) { return center; }
    let centerRgb = center.rgb / center.a;

    // WebGPU 的 Lanczos 輸出較銳，閒置銳化前使用約 0.55px 柔化，再套用十字形銳化核。
    var rgb = vec3<f32>(0.0);
    for (var y: i32 = -2; y <= 2; y = y + 1) {
        for (var x: i32 = -2; x <= 2; x = x + 1) {
            let blur = blurWeight(x, y);
            let weight = blur * (1.0 + 4.0 * p.sharpen)
                - p.sharpen * (blurWeight(x - 1, y) + blurWeight(x + 1, y)
                    + blurWeight(x, y - 1) + blurWeight(x, y + 1));
            if (weight != 0.0) {
                let sampleCoord = clamp(coord + vec2<i32>(x, y), vec2<i32>(0), dims - vec2<i32>(1));
                let sampleColor = textureLoad(image, sampleCoord, 0);
                // 完全透明的圖片外像素以中心色延伸，避免透明黑色讓外框邊緣變亮。
                let sampleRgb = select(centerRgb, sampleColor.rgb / max(sampleColor.a, 0.000001), sampleColor.a > 0.000001);
                rgb += sampleRgb * weight;
            }
        }
    }
    return vec4<f32>(clamp(rgb, vec3<f32>(0.0), vec3<f32>(1.0)) * center.a, center.a);
}
