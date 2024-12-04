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
}


@group(0) @binding(0) var<storage, read> grid: array<u32>;
@group(0) @binding(1) var<uniform> camera: Camera;
@fragment
fn fs(@builtin(position) fragCoord: vec4<f32>) -> @location(0) vec4<f32> {
    let gridSize = 2048u;
    let gx = i32((fragCoord.x + camera.transform.x) * camera.zoom);
    let gy = i32((fragCoord.y + camera.transform.y) * camera.zoom);

    // Clamp coordinates to the grid bounds
    if (gx < 0 || gy < 0 || gx >= i32(gridSize) || gy >= i32(gridSize)) {
        return vec4<f32>(0.0, 0.0, 0.0, 1.0);
    }

    // Read value from grid buffer
    let index = u32(gy) * gridSize + u32(gx);
    let value = grid[index];

    // Map value to intensity for visualization
    let intensity = f32(value) / 10;
    return vec4<f32>(intensity, intensity, intensity, 1.0);
}