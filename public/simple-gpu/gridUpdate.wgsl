struct Settings
{
    particleCount: u32,
    gridSizeX: u32,
    gridSizeY: u32,
    subStepCount: u32,
    dt: f32,
}

fn getGridID(p: vec2<f32>) -> u32 {
  let x = u32(floor(p.x));
  let y = u32(floor(p.y));
  return (settings.gridSizeX * y) + x;
}

@binding(0) @group(0) var<uniform> settings : Settings;
@binding(1) @group(0) var<storage, read_write> cellParticleCount : array<atomic<u32>>;
@binding(2) @group(0) var<storage, read_write> particleCellOffset : array<u32>;
@binding(3) @group(0) var<storage, read> points : array<vec2<f32>>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id : vec3<u32>)
{
  let pointIndex : u32 = id.x;

  if (pointIndex >= settings.particleCount)
  {
    return;
  }

  let gridID: u32 = getGridID(points[pointIndex]);
  particleCellOffset[pointIndex] = atomicAdd(&cellParticleCount[gridID], 1);
}