struct Settings
{
    step: u32,
    count: u32,
}

@binding(0) @group(0) var<uniform> settings : Settings;
@binding(1) @group(0) var<storage, read> input: array<u32>;
@binding(2) @group(0) var<storage, read_write> output : array<u32>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id : vec3<u32>)
{
    if (id.x > settings.count)
    {
        return;
    }
    if (id.x >= settings.step)
    {
        output[id.x] = input[id.x - settings.step] + input[id.x];
    }
    else
    {
        output[id.x] = input[id.x];
    }
}