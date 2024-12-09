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
    let x = id.x;
    if (x + 1 > settings.gridSize.x) {
        return;
    }
    for (var y: u32 = 0; y < settings.gridSize.y - 1; y++) {
        let index = (y + 1) * settings.gridSize.x + id.x;
        let indexPrev = y * settings.gridSize.x + id.x;
        prefixSum[index] = prefixSum[index] + prefixSum[indexPrev];
    }
}