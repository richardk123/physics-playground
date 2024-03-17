struct Settings
{
    gravity: vec2<f32>,
    deltaTime: f32,
}

@group(0) @binding(0) var<uniform> settings: Settings;
@group(0) @binding(1) var<storage, read_write> positionsCurrent: array<vec2<f32>>;
@group(0) @binding(2) var<storage, read_write> positionsPrevious: array<vec2<f32>>;
@group(0) @binding(3) var<storage, read_write> velocities: array<vec2<f32>>;
@compute
@workgroup_size(${maxBlockSize})
fn postSolve(@builtin(global_invocation_id) id: vec3<u32>)
{
    let inverseDt = 1 / settings.deltaTime;
//     update velocity
    velocities[id.x] = (positionsCurrent[id.x] - positionsPrevious[id.x]) * inverseDt;
}