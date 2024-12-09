@vertex
fn vs(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
    var positions = array<vec2<f32>, 6>(
        vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(-1.0, 1.0),
        vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0), vec2<f32>(-1.0, 1.0)
    );
    return vec4<f32>(positions[vertexIndex], 0.0, 1.0);
}

struct EngineSettings
{
    transform: vec2<f32>,
    zoom: f32,
    gridSize: vec2<u32>,
}

@group(0) @binding(0) var<storage, read> grid: array<u32>;
@group(0) @binding(1) var<uniform> settings: EngineSettings;
@group(0) @binding(2) var<storage, read> prefixSum : array<u32>;
@fragment
fn fs(@builtin(position) fragCoord: vec4<f32>) -> @location(0) vec4<f32> {
    let gx = i32((fragCoord.x * settings.zoom) + settings.transform.x);
    let gy = i32((fragCoord.y * settings.zoom) + settings.transform.y);

    // Clamp coordinates to the grid bounds
    if (gx < 0 || gy < 0 || gx >= i32(settings.gridSize.x) || gy >= i32(settings.gridSize.y)) {
        return vec4<f32>(0.2, 0.2, 0.2, 1.0);
    }

    // Read value from grid buffer
    let index = u32(gy) * settings.gridSize.x + u32(gx);
    let value = grid[index];

//    // Map value to intensity for visualization
    let val = f32(value) / 1;
    let intensity = f32(getIntegralSum(gx - 1, gy - 1, gx + 1, gy + 1)) / 2;
    return vec4<f32>(intensity, val, 0.2, 1.0);

//    return mapValueToColor(value, 1);
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

fn getValue(x: i32, y: i32) -> u32 {
    if (x < 0) {
        return 0;
    }
    if (y < 0) {
        return 0;
    }
    let clampedX = u32(clamp(x, 0, i32(settings.gridSize.x) - 1));
    let clampedY = u32(clamp(y, 0, i32(settings.gridSize.y) - 1));
    return prefixSum[u32(clampedY) * settings.gridSize.x + u32(clampedX)];
}

// integral sum formula
fn getIntegralSum(x1: i32, y1: i32, x2: i32, y2: i32) -> u32 {
    return getValue(x2, y2)
         - getValue(x1 - 1, y2)
         - getValue(x2, y1 - 1)
         + getValue(x1 - 1, y1 - 1);
}