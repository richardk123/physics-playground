const PI: f32 = 3.14159265359;
const TARGET_DENSITY: f32 = 0.1;
const PRESSURE_MULTIPLIER: f32 = 0.5;
const SMOOTHING_RADIUS: f32 = 1.2;

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

fn smoothingKernelDerivative(distance: f32, radius: f32) -> f32
{
    if (distance >= radius)
    {
        return 0.0;
    }
    let scale = 12 / (pow(radius, 4) * PI);
    return (distance - radius) * scale;
}

fn convertDensityToPressure(density: f32) -> f32
{
    let densityError = density - TARGET_DENSITY;
    return densityError * PRESSURE_MULTIPLIER;
}

fn calculateSharedPressure(densityA: f32, densityB: f32) -> f32
{
    let pressureA = convertDensityToPressure(densityA);
    let pressureB = convertDensityToPressure(densityB);
    return (pressureA + pressureB) / 2;
}

fn updateDensity(p: vec2<f32>, index: u32, yOffset: f32)
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
    var moveVec = vec2<f32>(0.0, 0.0);

    for (var anotherParticleIndex = particleStartId; anotherParticleIndex <= particleEndId; anotherParticleIndex++)
    {
        let anotherParticle = particles[anotherParticleIndex].positionCurrent;
        let direction = normalize(anotherParticle - p);
        let dist = distance(p, anotherParticle);

        if (anotherParticleIndex != index && dist != 0.0)
        {
            let slope = smoothingKernelDerivative(dist, SMOOTHING_RADIUS);
            let densityA = particles[index].density;
            let densityB = particles[anotherParticleIndex].density;
            let sharedPressure = calculateSharedPressure(densityA, densityB);

            if (densityB == 0.0)
            {
                continue;
            }

            moveVec += direction * ((sharedPressure * slope) / densityB); //TODO: mass
        }
    }

    particles[index].positionCurrent += moveVec * settings.dt;
}

@group(0) @binding(0) var<uniform> settings: Settings;
@group(0) @binding(1) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(2) var<storage, read> prefixSum : array<u32>;
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
    updateDensity(p, index, -settings.cellSize);
    updateDensity(p, index, 0.0);
    updateDensity(p, index, settings.cellSize);
}