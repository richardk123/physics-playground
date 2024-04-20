struct Settings
{
    particleCount: u32,
    gridSizeX: u32,
    gridSizeY: u32,
    subStepCount: u32,
    dt: f32,
    cellSize: f32,
    gravity: vec2<f32>,
    mouse: vec2<f32>,
}

struct Particle
{
    positionCurrent: vec2<f32>,
    positionPrevious: vec2<f32>,
    velocity: vec2<f32>,
    density: f32,
}

fn getGridID(p: vec2<f32>) -> u32 {
  let x = u32(floor(p.x / settings.cellSize));
  let y = u32(floor(p.y / settings.cellSize));
  return (settings.gridSizeX * y) + x;
}

@group(0) @binding(0) var<uniform> settings: Settings;
@group(0) @binding(1) var<storage, read> sourceParticles: array<Particle>;
@group(0) @binding(2) var<storage, read_write> targetParticles: array<Particle>;
@group(0) @binding(3) var<storage, read> prefixSum : array<u32>;
@group(0) @binding(4) var<storage, read> particleCellOffset : array<u32>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id : vec3<u32>)
{
    let index : u32 = id.x;

    if (index >= settings.particleCount)
    {
        return;
    }

    let gridId = getGridID(sourceParticles[index].positionCurrent);
    let targetIndex = prefixSum[gridId] - 1 - particleCellOffset[index];

    targetParticles[targetIndex].positionCurrent = sourceParticles[index].positionCurrent;
    targetParticles[targetIndex].positionPrevious = sourceParticles[index].positionPrevious;
    targetParticles[targetIndex].velocity = sourceParticles[index].velocity;
    targetParticles[targetIndex].density = sourceParticles[index].density;
}