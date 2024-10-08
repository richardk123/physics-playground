const PI: f32 = 3.14159265359;

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
    materialIndex: u32,
}

struct Material
{
    targetDensity: f32,
    pressureMultiplier: f32,
    smoothingRadius: f32,
}

fn getGridID(p: vec2<f32>) -> u32 {
  let x = u32(floor(p.x / settings.cellSize));
  let y = u32(floor(p.y / settings.cellSize));
  return (settings.gridSizeX * y) + x;
}

fn smoothingKernel(distance: f32, smoothingRadius: f32) -> f32
{
    let volume = (PI * pow(smoothingRadius, 4)) / 6;
    return ((smoothingRadius - distance) * (smoothingRadius - distance)) / volume;
}

fn updateDensity(gridId: u32, particle: Particle, material: Material, particleIndex: u32)
{
    let gridSize = settings.gridSizeX * settings.gridSizeY - 1;
    let t1 = i32(gridId) - i32(settings.gridSizeX);
    var startY = u32(t1);
    if (t1 < 0)
    {
        startY = gridId;
    }
    let endY = min(gridId + settings.gridSizeX, gridSize);

    var densityChange = 0.0;

    for (var y = startY; y <= endY; y += settings.gridSizeX)
    {
        let startGridId = u32(max(i32(y) - 1, 0));
        let endGridId = min(y + 1, gridSize);

        let particleStartId = prefixSum[startGridId] - cellParticleCount[startGridId];
        let particleEndId = prefixSum[endGridId];

        for (var i = particleStartId; i < particleEndId; i++)
        {
            let anotherParticle = particles[i];
            let dist = distance(particle.positionCurrent, anotherParticle.positionCurrent);
            if (dist < material.smoothingRadius)
            {
                let influence = smoothingKernel(dist, material.smoothingRadius);
                densityChange += influence * particle.mass;

                // collor mixing
//                let colorMixStrength = (dist / SMOOTHING_RADIUS) * settings.dt;
//                particles[particleIndex].color = mix(particle.color, anotherParticle.color, colorMixStrength);
            }
        }
    }

    particles[particleIndex].density += densityChange;
}

@group(0) @binding(0) var<uniform> settings: Settings;
@group(0) @binding(1) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(2) var<storage, read> prefixSum : array<u32>;
@group(0) @binding(3) var<storage, read> cellParticleCount : array<u32>;
@group(0) @binding(4) var<storage, read> materials : array<Material>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>)
{
    if (id.x >= settings.particleCount)
    {
        return;
    }

    let particle = particles[id.x];
    let material = materials[particle.materialIndex];
    let gridId = getGridID(particle.positionCurrent);
    updateDensity(gridId, particle, material, id.x);
}