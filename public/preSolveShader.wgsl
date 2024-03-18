struct BoundingBox
{
    bottomLeft: vec2<f32>,
    topRight: vec2<f32>,
}

struct Settings
{
    gravity: vec2<f32>,
    deltaTime: f32,
    boundingBox: BoundingBox,
}

@group(0) @binding(0) var<uniform> settings: Settings;
@group(0) @binding(1) var<storage, read_write> positionsCurrent: array<vec2<f32>>;
@group(0) @binding(2) var<storage, read_write> positionsPrevious: array<vec2<f32>>;
@group(0) @binding(3) var<storage, read_write> velocities: array<vec2<f32>>;
@compute
@workgroup_size(${maxBlockSize})
fn preSolve(@builtin(global_invocation_id) id: vec3<u32>)
{
    // apply gravity
    velocities[id.x] += settings.gravity * settings.deltaTime;
    // update previous position with current position
    positionsPrevious[id.x] = positionsCurrent[id.x];
    // update current position with velocity
    positionsCurrent[id.x] += velocities[id.x] * settings.deltaTime;

    // bounding box
    positionsCurrent[id.x].x = max(settings.boundingBox.bottomLeft.x, positionsCurrent[id.x].x);
    positionsCurrent[id.x].y = max(settings.boundingBox.bottomLeft.y, positionsCurrent[id.x].y);
    positionsCurrent[id.x].x = min(settings.boundingBox.topRight.x, positionsCurrent[id.x].x);
    positionsCurrent[id.x].y = min(settings.boundingBox.topRight.y, positionsCurrent[id.x].y);
}