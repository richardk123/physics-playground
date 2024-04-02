struct Settings
{
    particleCount: u32,
    gridSizeX: u32,
    gridSizeY: u32,
    dt: f32,
}

@binding(0) @group(0) var<uniform> settings: Settings;
@binding(1) @group(0) var<storage, read_write> particleUpdateCount : array<u32>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>)
{
    particleUpdateCount[id.x] = 0u;
}