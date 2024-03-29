struct Settings
{
    particleCount: u32,
    gridSizeX: u32,
    gridSizeY: u32,
}

@binding(0) @group(0) var<uniform> settings : Settings;
@binding(1) @group(0) var<storage, read_write> position: array<vec2<f32>>;
@binding(2) @group(0) var<storage, read> particleCollisionCount : array<u32>;
@binding(3) @group(0) var<storage, read> particleCollisionVelocitiesBuffer : array<vec2<f32>>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id : vec3<u32>)
{
  let index : u32 = id.x;

  if (index > settings.particleCount)
  {
    return;
  }

  let collisionCount = particleCollisionCount[index];

  for (var i : u32 = 0; i < collisionCount; i++)
  {
    position[index] += particleCollisionVelocitiesBuffer[(index * 8) + i];
  }
}