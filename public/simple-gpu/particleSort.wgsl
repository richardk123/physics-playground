struct Settings
{
    particleCount: u32,
    gridSizeX: u32,
    gridSizeY: u32,
    subStepCount: u32,
    dt: f32,
    gravity: vec2<f32>,
}

fn getGridID(p: vec2<f32>) -> u32 {
  let x = u32(floor(p.x));
  let y = u32(floor(p.y));
  return (settings.gridSizeX * y) + x;
}

@group(0) @binding(0) var<uniform> settings: Settings;
@group(0) @binding(1) var<storage, read> sourcePositionsCurrent: array<vec2<f32>>;
@group(0) @binding(2) var<storage, read> sourcePositionsPrevious: array<vec2<f32>>;
@group(0) @binding(3) var<storage, read> sourceVelocities: array<vec2<f32>>;
@group(0) @binding(4) var<storage, read_write> targetPositionsCurrent: array<vec2<f32>>;
@group(0) @binding(5) var<storage, read_write> targetPositionsPrevious: array<vec2<f32>>;
@group(0) @binding(6) var<storage, read_write> targetVelocities: array<vec2<f32>>;
@group(0) @binding(7) var<storage, read> prefixSum : array<u32>;
@group(0) @binding(8) var<storage, read> particleCellOffset : array<u32>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id : vec3<u32>)
{
    let index : u32 = id.x;

    if (index >= settings.particleCount)
    {
        return;
    }

    let gridId = getGridID(sourcePositionsCurrent[index]);
    let targetIndex = prefixSum[gridId] - 1 - particleCellOffset[index];

    targetPositionsCurrent[targetIndex] = sourcePositionsCurrent[index];
    targetPositionsPrevious[targetIndex] = sourcePositionsPrevious[index];
    targetVelocities[targetIndex] = sourceVelocities[index];
}