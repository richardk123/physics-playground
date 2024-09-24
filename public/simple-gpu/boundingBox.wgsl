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

//TODO: fix
//    // Forbidden rectangle (0, 0, 100, 200)
//    let forbiddenMinX: f32 = 200.0;
//    let forbiddenMinY: f32 = 10.0;
//    let forbiddenMaxX: f32 = 250.0;
//    let forbiddenMaxY: f32 = 100.0;
//
//    // Check if the particle is inside the forbidden rectangle
//    if (particles[id.x].positionCurrent.x >= forbiddenMinX && particles[id.x].positionCurrent.x <= forbiddenMaxX &&
//        particles[id.x].positionCurrent.y >= forbiddenMinY && particles[id.x].positionCurrent.y <= forbiddenMaxY)
//    {
//        // Calculate the distances to each edge of the rectangle
//        let distToLeft: f32 = particles[id.x].positionCurrent.x - forbiddenMinX - 1;
//        let distToRight: f32 = forbiddenMaxX - particles[id.x].positionCurrent.x + 1;
//        let distToBottom: f32 = particles[id.x].positionCurrent.y - forbiddenMinY - 1;
//        let distToTop: f32 = forbiddenMaxY - particles[id.x].positionCurrent.y + 1;
//
//        // Find the minimum distance to the closest edge and move the particle accordingly
//        if (distToLeft <= distToRight && distToLeft <= distToBottom && distToLeft <= distToTop) {
//            // Closest to the left edge
//            particles[id.x].positionCurrent.x = forbiddenMinX;
//        } else if (distToRight <= distToLeft && distToRight <= distToBottom && distToRight <= distToTop) {
//            // Closest to the right edge
//            particles[id.x].positionCurrent.x = forbiddenMaxX;
//        } else if (distToBottom <= distToLeft && distToBottom <= distToRight && distToBottom <= distToTop) {
//            // Closest to the bottom edge
//            particles[id.x].positionCurrent.y = forbiddenMinY;
//        } else if (distToTop <= distToLeft && distToTop <= distToRight && distToTop <= distToBottom) {
//            // Closest to the top edge
//            particles[id.x].positionCurrent.y = forbiddenMaxY;
//        }
//    }
}