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

@binding(0) @group(0) var<uniform> settings: Settings;
@binding(1) @group(0) var<storage, read_write> position: array<vec2<f32>>;
@binding(2) @group(0) var<storage, read> cellsCount : array<u32>;
@binding(3) @group(0) var<storage, read> buckets : array<u32>;
@binding(4) @group(0) var<storage, read_write> updatePositionCounter : array<atomic<u32>>;
@binding(5) @group(0) var<storage, read_write> updatePositionBuckets : array<vec2<f32>>;
@compute
@workgroup_size(${maxBlockSize})
fn collision(@builtin(global_invocation_id) id: vec3<u32>)
{
    let index: u32 = id.x;

    if (index >= settings.pointsCount)
    {
        return;
    }

    let point = position[index];

    let gridID = getGridID(point);
    let cellPointCount = cellsCount[gridID];

    for (var j : u32 = 0; j < cellPointCount; j++)
    {
        let anotherPointIndex = buckets[(gridID * 8) + j];
        var anotherPoint = position[anotherPointIndex];

        let d = distance(point, anotherPoint);

        if (d < 1.0 && d > 0.0)
        {
            let normal = normalize(point - anotherPoint);
            let corr = ((1 - d) * 0.5f) * 0.5;

            let bucketId1 = (gridID * 8) + (atomicAdd(&updatePositionCounter[index], 1));
            updatePositionBuckets[bucketId1] = normal * corr;

            let bucketId2 = (gridID * 8) + (atomicAdd(&updatePositionCounter[anotherPointIndex], 1));
            updatePositionBuckets[bucketId2] = normal * -corr;
        }
    }
//
//    for (var x = -1; x < 2; x++)
//    {
//        for(var y = -1; y < 2; y++)
//        {
//            let gridPoint = vec2(point.x + f32(x), point.y + f32(y));
//            let gridID = getGridID(gridPoint);
//            let cellPointCount = cellsCount[gridID];
//
//            for (var j : u32 = 0; j < cellPointCount; j++)
//            {
//                let anotherPointIndex = buckets[(gridID * 8) + j];
//                var anotherPoint = position[anotherPointIndex];
//
//                let d = distance(point, anotherPoint);
//
//                if (d < 1 && d > 0)
//                {
//                    let normal = normalize(point - anotherPoint);
//                    let corr = (1 - d) * 0.5f;
//
//                    let bucketId1 = (gridID * 8) + (atomicAdd(&updatePositionCounter[index], 1) - 1);
//                    updatePositionBuckets[bucketId1] = normal * corr;
//
//                    let bucketId2 = (gridID * 8) + (atomicAdd(&updatePositionCounter[anotherPointIndex], 1) - 1);
//                    updatePositionBuckets[bucketId2] = normal * -corr;
//                }
//            }
//        }
//    }
}