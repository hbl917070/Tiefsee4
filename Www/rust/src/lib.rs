use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::Clamped;
use wasm_bindgen::JsValue;
use web_sys::ImageData;

#[wasm_bindgen]
pub fn sharpen_image(image_data: ImageData, v: f32) -> Result<ImageData, JsValue> {
    let width = image_data.width();
    let height = image_data.height();
    let data = image_data.data();
    let mut output_data = data.clone();

    let kernel: [f32; 9] = [0.0, -v, 0.0, -v, 1.0 + v * 4.0, -v, 0.0, -v, 0.0];

    let side = 3;
    let half_side = side / 2;

    for y in 0..height {
        for x in 0..width {
            let mut r = 0.0;
            let mut g = 0.0;
            let mut b = 0.0;

            for ky in 0..side {
                for kx in 0..side {
                    let px = (x as i32 + kx - half_side).clamp(0, width as i32 - 1) as u32;
                    let py = (y as i32 + ky - half_side).clamp(0, height as i32 - 1) as u32;
                    let offset = (py * width + px) * 4;
                    let weight = kernel[(ky * side + kx) as usize];

                    r += data[offset as usize] as f32 * weight;
                    g += data[(offset + 1) as usize] as f32 * weight;
                    b += data[(offset + 2) as usize] as f32 * weight;
                }
            }

            let offset = (y * width + x) * 4;
            output_data[offset as usize] = r.clamp(0.0, 255.0) as u8;
            output_data[(offset + 1) as usize] = g.clamp(0.0, 255.0) as u8;
            output_data[(offset + 2) as usize] = b.clamp(0.0, 255.0) as u8;
        }
    }

    ImageData::new_with_u8_clamped_array_and_sh(Clamped(&mut output_data), width, height)
}
