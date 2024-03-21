struct BoundingBox
{
    bottomLeft: vec2<f32>,
    topRight: vec2<f32>,
}

struct Settings
{
    gravity: vec2<f32>,
    deltaTime: f32,
    boundingBox: BoundingBox,
    gridCellSize: f32,
    pointsCount: u32,
    gridTotalCells: u32,
    gridSizeX: u32,
    gridSizeY: u32,
}

@binding(0) @group(0) var<uniform> settings : Settings;
@binding(1) @group(0) var<storage, read_write> position: array<vec2<f32>>;
@binding(2) @group(0) var<storage, read> updatePositionCounter : array<u32>;
@binding(3) @group(0) var<storage, read> updatePositionBuckets : array<vec2<f32>>;
@compute
@workgroup_size(${maxBlockSize})
fn applyCollision(@builtin(global_invocation_id) id : vec3<u32>)
{
  let index : u32 = id.x;

  if (index >= settings.pointsCount)
  {
    return;
  }

  let positionToUpdateCount = updatePositionCounter[index];

  for (var i : u32 = 0; i < positionToUpdateCount; i++)
  {
    position[index] += updatePositionBuckets[(index * 8) + i];
  }
}