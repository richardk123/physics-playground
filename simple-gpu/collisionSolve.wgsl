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
    mass: f32,
    color: vec3<f32>,
}

fn getGridID(p: vec2<f32>) -> u32 {
  let x = u32(floor(p.x / settings.cellSize));
  let y = u32(floor(p.y / settings.cellSize));
  return (settings.gridSizeX * y) + x;
}

fn updateParticle(gridId: u32, p: vec2<f32>, particleIndex: u32)
{
    let gridSize = settings.gridSizeX * settings.gridSizeY - 1;
    let t1 = i32(gridId) - i32(settings.gridSizeX);
    var startY = u32(t1);
    if (t1 < 0)
    {
        startY = gridId;
    }
    let endY = gridId + settings.gridSizeX;
    if (endY > gridSize)
    {
        startY = gridId;
    }

    var moveVec = vec2<f32>(0.0, 0.0);

    for (var y = startY; y <= endY; y += settings.gridSizeX)
    {
        let startGridId = u32(max(i32(y) - 1, 0));
        let endGridId = min(y + 1, gridSize);

        let particleStartId = prefixSum[startGridId] - cellParticleCount[startGridId];
        let particleEndId = prefixSum[endGridId];

        for (var anotherParticleIndex = particleStartId; anotherParticleIndex < particleEndId; anotherParticleIndex++)
        {
            let anotherParticle = particles[anotherParticleIndex].positionCurrent;
            let diff = p - anotherParticle;
            let d = dot(diff, diff);

            if (d > 0.0 && d < 1.0 && anotherParticleIndex != particleIndex)
            {
                let dist = length(diff);
                let corr = ((1.0 - dist) * 0.23);
                moveVec += diff * corr;
            }
        }
    }

    positionChange[particleIndex] = moveVec;
}


@binding(0) @group(0) var<uniform> settings: Settings;
@binding(1) @group(0) var<storage, read_write> particles: array<Particle>;
@binding(2) @group(0) var<storage, read> prefixSum : array<u32>;
@binding(3) @group(0) var<storage, read> cellParticleCount : array<u32>;
@binding(4) @group(0) var<storage, read_write> positionChange : array<vec2<f32>>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>)
{
    if (id.x >= settings.particleCount)
    {
        return;
    }

    let p = particles[id.x].positionCurrent;
    let gridId = getGridID(p);
    updateParticle(gridId, p, id.x);
}