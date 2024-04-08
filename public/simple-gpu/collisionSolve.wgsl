struct Settings
{
    particleCount: u32,
    gridSizeX: u32,
    gridSizeY: u32,
    subStepCount: u32,
    dt: f32,
    cellSize: f32,
    gravity: vec2<f32>,
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

fn updatePoint(p: vec2<f32>, index: u32, yOffset: f32)
{
    let leftX = clamp(p.x - settings.cellSize, 0.0, f32(settings.gridSizeX));
    let rightX = clamp(p.x + settings.cellSize, 0.0, f32(settings.gridSizeX));
    let y = clamp(p.y + yOffset, 0.0, f32(settings.gridSizeY));

    let gridSize = settings.gridSizeX * settings.gridSizeY;
    let startId = clamp(getGridID(vec2<f32>(leftX, y)), 0, gridSize);
    let endId = clamp(getGridID(vec2<f32>(rightX, y)), 0, gridSize);

    var particleStartId: u32 = clamp(prefixSum[startId] - 1, 0, settings.particleCount - 1);

    if (startId == 0)
    {
        particleStartId = 0;
    }

    let particleEndId: u32 = clamp(prefixSum[endId] - 1, 0, settings.particleCount - 1);

    for (var anotherParticleIndex = particleStartId; anotherParticleIndex <= particleEndId; anotherParticleIndex++)
    {
        let anotherParticle = particles[anotherParticleIndex].positionCurrent;
        let diff = p - anotherParticle;
        let d = dot(diff, diff);

        if (d > 0.0 && d < 1.0 && anotherParticleIndex != index)
        {
            let dist = length(diff);
            let corr = ((1.0 - dist) * 0.4);
            particles[index].positionCurrent += diff * corr;
            particles[anotherParticleIndex].positionCurrent += diff * -corr;
        }
    }
}

@binding(0) @group(0) var<uniform> settings: Settings;
@binding(1) @group(0) var<storage, read_write> particles: array<Particle>;
@binding(2) @group(0) var<storage, read> prefixSum : array<u32>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>)
{
    let index: u32 = id.x;

    if (index >= settings.particleCount)
    {
        return;
    }

    let p = particles[index].positionCurrent;
    updatePoint(p, index, -settings.cellSize);
    updatePoint(p, index, 0.0);
    updatePoint(p, index, settings.cellSize);
}