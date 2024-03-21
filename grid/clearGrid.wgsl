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
@binding(1) @group(0) var<storage, read_write> cellCounts : array<u32>;
@binding(2) @group(0) var<storage, read_write> buckets : array<u32>;
@compute
@workgroup_size(${maxBlockSize})
fn clearGrid(@builtin(global_invocation_id) id : vec3<u32>)
{
  let index : u32 = id.x;

  cellCounts[index] = 0;

  for (var i : u32 = 0; i < 8; i++)
  {
    buckets[(index * 8) + i] = 0;
  }
}