struct Settings
{
    particleCount: u32,
    gridSizeX: f32,
    gridSizeY: f32,
}

@group(0) @binding(0) var<uniform> settings: Settings;
@group(0) @binding(1) var<storage, read> positionsCurrent: array<vec2<f32>>;
@group(0) @binding(2) var<storage, read> positionsPrevious: array<vec2<f32>>;
@group(0) @binding(3) var<storage, read_write> velocities: array<vec2<f32>>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>)
{
    let inverseDt: f32 = 60;
    // update velocity
    velocities[id.x] = (positionsCurrent[id.x] - positionsPrevious[id.x]) * inverseDt;
}