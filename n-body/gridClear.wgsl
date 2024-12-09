@binding(0) @group(0) var<storage, read_write> grid : array<u32>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id : vec3<u32>)
{
    grid[id.x] = 0u;
}