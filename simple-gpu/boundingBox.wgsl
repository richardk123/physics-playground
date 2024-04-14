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

@group(0) @binding(0) var<uniform> settings: Settings;
@group(0) @binding(1) var<storage, read_write> particles: array<Particle>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>)
{
    if (id.x >= settings.particleCount)
    {
        return;
    }

    // bounding box
    particles[id.x].positionCurrent.x = clamp(particles[id.x].positionCurrent.x, 0, f32(settings.gridSizeX) * settings.cellSize - 0.001);
    particles[id.x].positionCurrent.y = clamp(particles[id.x].positionCurrent.y, 0, f32(settings.gridSizeY) * settings.cellSize - 0.001);
}