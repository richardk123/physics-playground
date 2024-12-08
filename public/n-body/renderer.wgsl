@vertex
fn vs(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
    var positions = array<vec2<f32>, 6>(
        vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(-1.0, 1.0),
        vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0), vec2<f32>(-1.0, 1.0)
    );
    return vec4<f32>(positions[vertexIndex], 0.0, 1.0);
}

struct Camera
{
    transform: vec2<f32>,
    zoom: f32,
    canvas: vec2<f32>,
}


@group(0) @binding(0) var<storage, read> grid: array<u32>;
@group(0) @binding(1) var<uniform> camera: Camera;
@fragment
fn fs(@builtin(position) fragCoord: vec4<f32>) -> @location(0) vec4<f32> {
    let gridSize = 2048u;
    let gx = i32((fragCoord.x * camera.zoom) + camera.transform.x);
    let gy = i32((fragCoord.y * camera.zoom) + camera.transform.y);

    // Clamp coordinates to the grid bounds
    if (gx < 0 || gy < 0 || gx >= i32(gridSize) || gy >= i32(gridSize)) {
        return vec4<f32>(0.0, 0.0, 0.0, 1.0);
    }

    // Read value from grid buffer
    let index = u32(gy) * gridSize + u32(gx);
    let value = grid[index];

    // Map value to intensity for visualization
//    let intensity = f32(value) / 1;
//    return vec4<f32>(intensity, intensity, intensity, 1.0);

    return mapValueToColor(value, 25);
}

fn mapValueToColor(value: u32, maxValue: i32) -> vec4<f32> {
    let normalizedValue = clamp(f32(value) / f32(maxValue), 0.0, 1.0);

    // Map normalized value to a gradient:
    // 0.0 -> Blue, 0.5 -> Green, 1.0 -> Red
    let red = smoothstep(0.9, 1.0, normalizedValue);
    let green = smoothstep(0.25, 0.75, normalizedValue);
    let blue = smoothstep(0.0, 0.5, normalizedValue);

    return vec4<f32>(red, green, blue, 1.0);
}