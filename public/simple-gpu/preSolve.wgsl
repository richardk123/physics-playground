struct Settings
{
    particleCount: u32,
    gridSizeX: u32,
    gridSizeY: u32,
    dt: f32,
}

@group(0) @binding(0) var<uniform> settings: Settings;
@group(0) @binding(1) var<storage, read_write> positionsCurrent: array<vec2<f32>>;
@group(0) @binding(2) var<storage, read_write> positionsPrevious: array<vec2<f32>>;
@group(0) @binding(3) var<storage, read_write> velocities: array<vec2<f32>>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>)
{
    // apply gravity
    velocities[id.x] += vec2<f32>(0.0, -100.0) * settings.dt;
    // update previous position with current position
    positionsPrevious[id.x] = positionsCurrent[id.x];
    // update current position with velocity
    positionsCurrent[id.x] += velocities[id.x] * settings.dt;

    // bounding box
    positionsCurrent[id.x].x = max(0, positionsCurrent[id.x].x);
    positionsCurrent[id.x].y = max(0, positionsCurrent[id.x].y);
    positionsCurrent[id.x].x = min(f32(settings.gridSizeX) - 0.001, positionsCurrent[id.x].x);
    positionsCurrent[id.x].y = min(f32(settings.gridSizeY) - 0.001, positionsCurrent[id.x].y);
}