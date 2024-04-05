struct Settings
{
    particleCount: u32,
    gridSizeX: u32,
    gridSizeY: u32,
    subStepCount: u32,
    dt: f32,
    gravity: vec2<f32>,
}

@group(0) @binding(0) var<uniform> settings: Settings;
@group(0) @binding(1) var<storage, read_write> positionsCurrent: array<vec2<f32>>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>)
{
    // bounding box
    positionsCurrent[id.x].x = clamp(positionsCurrent[id.x].x, 0, f32(settings.gridSizeX) - 0.001);
    positionsCurrent[id.x].y = clamp(positionsCurrent[id.x].y, 0, f32(settings.gridSizeY) - 0.001);
}