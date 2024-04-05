struct Settings
{
    particleCount: u32,
    gridSizeX: u32,
    gridSizeY: u32,
    subStepCount: u32,
    dt: f32,
    gravity: vec2<f32>,
}

@binding(0) @group(0) var<uniform> settings : Settings;
@binding(1) @group(0) var<storage, read_write> particleCollisionCount : array<u32>;
@binding(2) @group(0) var<storage, read_write> particleCollisionVelocitiesBuffer : array<vec2<f32>>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id : vec3<u32>)
{
  let index : u32 = id.x;

  particleCollisionCount[index] = 0;

  for (var i : u32 = 0; i < 8; i++)
  {
    particleCollisionVelocitiesBuffer[(index * 8) + i] = vec2<f32>(0, 0);
  }
}