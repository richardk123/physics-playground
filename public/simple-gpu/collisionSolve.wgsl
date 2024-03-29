struct Settings
{
    particleCount: u32,
    gridSizeX: u32,
    gridSizeY: u32,
}

fn getGridID(p: vec2<f32>) -> u32 {
  let x = u32(floor(p.x));
  let y = u32(floor(p.y));
  return (settings.gridSizeX * y) + x;
}

fn updatePoint(p: vec2<f32>, index: u32, gridOffsetX: f32, gridOffsetY: f32)
{
    let gridID = getGridID(vec2<f32>(p.x + gridOffsetX, p.y + gridOffsetY));
    let cellPointCount = cellParticleCount[gridID];

    for (var j : u32 = 0; j < cellPointCount; j++)
    {
        let anotherPointIndex: u32 = cellParticleIndexes[(gridID * 8) + j];
        var anotherPoint = position[anotherPointIndex];

        let d = distance(p, anotherPoint);

        if (d < 1.0 && d > 0.0 && index != anotherPointIndex)
        {
            let normal = normalize(p - anotherPoint);
            let corr = ((1 - d) * 0.5f);

            let bucketId1 = (index * 8) + atomicAdd(&particleCollisionCount[index], 1);
            particleCollisionVelocities[bucketId1] = normal * -corr;

            let bucketId2 = (anotherPointIndex * 8) + atomicAdd(&particleCollisionCount[anotherPointIndex], 1);
            particleCollisionVelocities[bucketId2] = normal * corr;
        }
    }
}

@binding(0) @group(0) var<uniform> settings: Settings;
@binding(1) @group(0) var<storage, read> position: array<vec2<f32>>;
@binding(2) @group(0) var<storage, read> cellParticleCount : array<u32>;
@binding(3) @group(0) var<storage, read> cellParticleIndexes : array<u32>;
@binding(4) @group(0) var<storage, read_write> particleCollisionCount : array<atomic<u32>>;
@binding(5) @group(0) var<storage, read_write> particleCollisionVelocities : array<vec2<f32>>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>)
{
    let index: u32 = id.x;

    if (index > settings.particleCount)
    {
        return;
    }

    let p = position[index];

//    updatePoint(p, index, -1.0, -1.0);
//    updatePoint(p, index, 0.0, -1.0);
//    updatePoint(p, index, 1.0, -1.0);

//    updatePoint(p, index, -1.0, 0.0);
    updatePoint(p, index, 0.0, 0.0);
//    updatePoint(p, index, 1.0, 0.0);

//    updatePoint(p, index, -1.0, 1.0);
//    updatePoint(p, index, 0.0, 1.0);
//    updatePoint(p, index, 1.0, 1.0);
}