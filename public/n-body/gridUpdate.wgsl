@binding(0) @group(0) var<storage, read> particles: array<vec2<f32>>;
@binding(1) @group(0) var<storage, read_write> grid: array<atomic<u32>>;
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
    let gx = u32(particle.x);
    let gy = u32(particle.y);

    // Ensure the particle is within the grid bounds
    if (gx < 2048 && gy < 2048) {
        // Compute flat index for the grid
        let gridIndex = gy * 2048u + gx;

        // Use atomic operation to increment the cell count
        atomicAdd(&grid[gridIndex], 1);
    }
}