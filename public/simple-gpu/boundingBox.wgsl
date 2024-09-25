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

fn resolveObstacles(particlePos: vec2<f32>, forbiddenMin: vec2<f32>, forbiddenMax: vec2<f32>) -> vec2<f32> {
    // Check if the particle is inside the forbidden rectangle
    if (particlePos.x >= forbiddenMin.x && particlePos.x <= forbiddenMax.x &&
        particlePos.y >= forbiddenMin.y && particlePos.y <= forbiddenMax.y) {

        // Calculate the distances to each edge of the rectangle
        let distToLeft = particlePos.x - forbiddenMin.x;
        let distToRight = forbiddenMax.x - particlePos.x;
        let distToBottom = particlePos.y - forbiddenMin.y;
        let distToTop = forbiddenMax.y - particlePos.y;

        // Find the closest edge and snap the particle to it
        let minDist = min(distToLeft, min(distToRight, min(distToBottom, distToTop)));

        if (minDist == distToLeft) {
            return vec2(forbiddenMin.x, particlePos.y);
        } else if (minDist == distToRight) {
            return vec2(forbiddenMax.x, particlePos.y);
        } else if (minDist == distToBottom) {
            return vec2(particlePos.x, forbiddenMin.y);
        } else {
            return vec2(particlePos.x, forbiddenMax.y);
        }
    }

    // Return original position if not inside forbidden rectangle
    return particlePos;
}

@group(0) @binding(0) var<uniform> settings: Settings;
@group(0) @binding(1) var<storage, read_write> particles: array<Particle>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>)
{
    // bounding box
    particles[id.x].positionCurrent = clamp(
        particles[id.x].positionCurrent,
        vec2(0.0, 0.0),
        vec2(f32(settings.gridSizeX) * settings.cellSize, f32(settings.gridSizeY) * settings.cellSize));

    // mouse diff
    let mouseDiff =  particles[id.x].positionCurrent - settings.mouse;
    let mouseDist = length(mouseDiff);
    if (mouseDist < 40)
    {
        let normal = normalize(mouseDiff);
        particles[id.x].positionCurrent += normal * max(mouseDist, 0.3) * settings.dt;
    }

    // obstacles
//    particles[id.x].positionCurrent = resolveObstacles(particles[id.x].positionCurrent, vec2(200.0, 10.0), vec2(250.0, 100.0));

}