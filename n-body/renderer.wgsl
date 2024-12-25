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
                colorSum += valueToColor(neighborValue, 10).rgb;
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

fn valueToColor(value: u32, maxValue: u32) -> vec4<f32> {
    // Convert u32 to normalized f32 in the range [0.0, 1.0]
    let v = clamp(f32(value) / f32(maxValue), 0.0, 1.0);

    // Define color ranges with alpha set to 1.0
    let blue = vec4<f32>(0.0, 0.0, 1.0, 1.0);  // Blue
    let red = vec4<f32>(1.0, 0.0, 0.0, 1.0);   // Red
    let yellow = vec4<f32>(1.0, 1.0, 0.0, 1.0); // Yellow
    let white = vec4<f32>(1.0, 1.0, 1.0, 1.0); // White

    // Interpolation thresholds
    if v < 0.01 {
        return vec4<f32>(0.0, 0.0, 0.0, 0.0);
    } else if v < 0.33 {
        // Interpolate between blue and red
        let t = v / 0.53;
        return mix(blue, red, t);
    } else if v < 0.66 {
        // Interpolate between red and yellow
        let t = (v - 0.33) / 0.33;
        return mix(red, yellow, t);
    } else {
        // Interpolate between yellow and white
        let t = (v - 0.66) / 0.34;
        return mix(yellow, white, t);
    }
}