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

fn getGridID(p: vec2<f32>) -> u32 {
  let x = u32(floor(p.x / f32(settings.gridCellSize)));
  let y = u32(floor(p.y / f32(settings.gridCellSize)));
  return (settings.gridSizeX * y) + x;
}

@binding(0) @group(0) var<uniform> settings : Settings;
@binding(1) @group(0) var<storage, read_write> cellsCount : array<atomic<u32>>;
@binding(2) @group(0) var<storage, read_write> buckets : array<u32>;
@binding(3) @group(0) var<storage, read> points : array<vec2<f32>>;
@compute
@workgroup_size(${maxBlockSize})
fn updateGrid(@builtin(global_invocation_id) id : vec3<u32>)
{
  let pointIndex : u32 = id.x;

  if (pointIndex >= settings.pointsCount)
  {
    return;
  }

  let gridID = getGridID(points[pointIndex]);
  let bucketId = (gridID * 8) + (atomicAdd(&cellsCount[gridID], 1));
  buckets[bucketId] = pointIndex;
}