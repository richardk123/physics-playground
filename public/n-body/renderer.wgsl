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

    // Define blur radius
    let blurRadius = 2; // You can increase this for a stronger blur

    var colorSum = vec3<f32>(0.0, 0.0, 0.0);
    var sampleCount = 0;

    // Loop over the neighborhood
    for (var dx = -blurRadius; dx <= blurRadius; dx++) {
        for (var dy = -blurRadius; dy <= blurRadius; dy++) {
            let nx = gx + dx;
            let ny = gy + dy;

            // Check bounds for each neighbor
            if (nx >= 0 && ny >= 0 && nx < i32(settings.gridSize.x) && ny < i32(settings.gridSize.y)) {
                let neighborIndex = u32(ny) * settings.gridSize.x + u32(nx);
                let neighborValue = grid[neighborIndex];

                // Convert neighbor value to color and accumulate
                colorSum += mapValueToColor(neighborValue).rgb;
                sampleCount += 1;
            }
        }
    }

    // Average the accumulated color
    let blurredColor = colorSum / f32(sampleCount);

    // Apply a brightness factor (e.g., 1.5 to make colors brighter)
    let brightnessFactor = 1.1;
    let adjustedColor = blurredColor * brightnessFactor;

    // Ensure color values remain in the [0.0, 1.0] range
    let finalColor = clamp(adjustedColor, vec3<f32>(0.0), vec3<f32>(1.0));
    return vec4<f32>(finalColor, 1.0);
}

fn mapValueToColor(value: u32) -> vec4<f32> {
    let maxValue: f32 = 20.0; // Define the maximum value
    let normalizedValue: f32 = f32(value) / maxValue; // Normalize the value between 0 and 1

    // Apply a gentler logarithmic transformation
    let adjustedValue: f32 = log2(1.0 + normalizedValue * 7.0) / log2(8.0); // Scale and normalize

    // Calculate RGB values based on the adjusted value
    let r: f32 = clamp(adjustedValue * 1.0 - 0.5, 0.0, 1.0);
    let g: f32 = clamp(adjustedValue * 1.0 - 0.2, 0.0, 1.0);
    let b: f32 = clamp(adjustedValue * 2.0 - 0.0, 0.0, 1.0);

    // Return the color as a vec4 with an alpha value of 1.0
    return vec4<f32>(r, g, b, 1.0);
}