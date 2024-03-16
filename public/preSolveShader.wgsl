struct Settings
{
    gravity: vec2<f32>,
    deltaTime: f32,
}

@group(0) @binding(0) var<uniform> settings: Settings;
@group(0) @binding(1) var<storage, read_write> pointsCurrentPosition: array<vec2<f32>>;
@group(0) @binding(2) var<storage, read_write> pointsPreviousPosition: array<vec2<f32>>;
@group(0) @binding(3) var<storage, read_write> velocities: array<vec2<f32>>;
@compute
@workgroup_size(16)
fn preSolve(@builtin(global_invocation_id) id: vec3<u32>)
{
    // apply gravity
    velocities[id.x] += settings.gravity * settings.deltaTime;
    // update previous position with current position
    pointsPreviousPosition[id.x] = pointsCurrentPosition[id.x];
    // update current position with velocity
    pointsCurrentPosition[id.x] += velocities[id.x] * settings.deltaTime;
}