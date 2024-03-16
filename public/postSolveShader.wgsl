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
@workgroup_size(1)
fn computeSomething(@builtin(global_invocation_id) global_invocation_id : vec3<u32>)
{
    let inverseDt = 1 / settings.deltaTime;
//     update velocity
    velocities[global_invocation_id.x] = (pointsCurrentPosition[global_invocation_id.x] - pointsPreviousPosition[global_invocation_id.x]) * inverseDt;
}