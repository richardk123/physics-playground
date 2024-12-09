struct EngineSettings
{
    transform: vec2<f32>,
    zoom: f32,
    gridSize: vec2<u32>,
}

@binding(0) @group(0) var<storage, read_write> prefixSum : array<u32>;
@binding(1) @group(0) var<uniform> settings: EngineSettings;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id : vec3<u32>)
{
    let y = id.x;

    if (y + 1 > settings.gridSize.y) {
        return;
    }
    for (var x: u32 = 0; x < settings.gridSize.x - 1; x++) {
        let index = y * settings.gridSize.x + x + 1;
        prefixSum[index] = prefixSum[index] + prefixSum[index - 1];
    }
}