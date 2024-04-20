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
    color: vec3<f32>,
}

@group(0) @binding(0) var<uniform> settings: Settings;
@group(0) @binding(1) var<storage, read_write> particles: array<Particle>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>)
{
    // apply gravity
    particles[id.x].velocity += settings.gravity * settings.dt;
    // update previous position with current position
    particles[id.x].positionPrevious = particles[id.x].positionCurrent;
    // update current position with velocity
    particles[id.x].positionCurrent += particles[id.x].velocity * settings.dt;
    particles[id.x].density = 0.0;
}