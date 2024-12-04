@group(0) @binding(0) var<storage, read_write> particles: array<vec2<f32>>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>)
{
    // apply gravity
    particles[id.x].x += 1;
    particles[id.x].y += 1;
}