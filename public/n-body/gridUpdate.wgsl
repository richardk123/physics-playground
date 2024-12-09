struct Particle {
    position: vec2<f32>,
    velocity: vec2<f32>,
}

struct EngineSettings {
    transform: vec2<f32>,
    zoom: f32,
    gridSize: vec2<u32>,
}

@binding(0) @group(0) var<storage, read> particles: array<Particle>;
@binding(1) @group(0) var<storage, read_write> grid: array<atomic<u32>>;
@binding(2) @group(0) var<uniform> settings: EngineSettings;

// Fixed-size shared memory for local aggregation
var<workgroup> localGrid: array<u32, 256>;

@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>,
        @builtin(local_invocation_id) local_id: vec3<u32>,
        @builtin(workgroup_id) workgroup_id: vec3<u32>) {
    let index = global_id.x;
    let local_index = local_id.x;

    // Initialize shared memory
    localGrid[local_index] = 0;
    workgroupBarrier();

    if (index < arrayLength(&particles)) {
        // Read particle position
        let particle = particles[index];
        let gx = i32(particle.position.x);
        let gy = i32(particle.position.y);

        // Ensure the particle is within grid bounds
        if (gx >= 0 && gy >= 0 && gx < i32(settings.gridSize.x) && gy < i32(settings.gridSize.y)) {
            let gridIndex = u32(gy) * settings.gridSize.x + u32(gx);

            // Accumulate results in the local grid buffer
            localGrid[local_index] = gridIndex; // Store locally
        }
    }
    workgroupBarrier();

    // One thread per workgroup writes the results to the global grid
    if (local_index == 0) {
        for (var i = 0u; i < 256u; i = i + 1u) {
            let gIndex = localGrid[i];
            if (gIndex < arrayLength(&grid)) {
                atomicAdd(&grid[gIndex], 1);
            }
        }
    }
}
