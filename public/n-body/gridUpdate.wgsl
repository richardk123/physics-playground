struct Particle
{
    position: vec2<f32>,
    velocity: vec2<f32>,
}

struct EngineSettings
{
    transform: vec2<f32>,
    zoom: f32,
    gridSize: vec2<u32>,
}

@binding(0) @group(0) var<storage, read> particles: array<Particle>;
@binding(1) @group(0) var<storage, read_write> grid: array<atomic<u32>>;
@binding(2) @group(0) var<uniform> settings: EngineSettings;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let index = global_id.x;
    if (index >= arrayLength(&particles)) {
        return;
    }

    // Read particle position
    let particle = particles[index];

    // Compute grid cell
    let gx = i32(particle.position.x);
    let gy = i32(particle.position.y);

    // Ensure the particle is within the grid bounds
    if (gx >= 0 && gy >= 0 && gx < i32(settings.gridSize.x) && gy < i32(settings.gridSize.y)) {
        // Compute flat index for the grid
        let gridIndex = u32(gy) * settings.gridSize.x + u32(gx);

        // Use atomic operation to increment the cell count
        atomicAdd(&grid[gridIndex], 1);
    }
}