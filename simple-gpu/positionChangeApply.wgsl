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

@binding(0) @group(0) var<uniform> settings : Settings;
@binding(1) @group(0) var<storage, read> positionChange : array<vec2<f32>>;
@binding(2) @group(0) var<storage, read_write> particles: array<Particle>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id : vec3<u32>)
{
    if (id.x >= settings.particleCount)
    {
        return;
    }

    particles[id.x].positionCurrent += positionChange[id.x];
}