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

fn updatePoint(p: vec2<f32>, index: u32,  yOffset: f32)
{
    let leftX = max(0, p.x - 1);
    let rightX = max(0, p.x + 1);
    let y = max(0, p.y + yOffset);

    let startId = getGridID(vec2<f32>(leftX, y));
    let endId = getGridID(vec2<f32>(rightX, y));

    let row = u32(y);

    let particleStartId = u32(max(0, i32(prefixSum[startId]) - 1));
    let particleEndId = u32(max(0, i32(prefixSum[endId]) - 1));
    var moveDir = vec2<f32>(0, 0);
    for (var anotherParticleIndex = particleStartId; anotherParticleIndex <= particleEndId; anotherParticleIndex++)
    {
        let anotherParticle = position[anotherParticleIndex];
        let d = distance(p, anotherParticle);

        if (d > 0.0 && d < 1.0 && anotherParticleIndex != index && row == u32(floor(anotherParticle.y)))
        {
            let normal = normalize(p - anotherParticle);
            let corr = ((1.0 - d) * 0.5) / f32(settings.subStepCount);

//            let bucketId1 = (index * 8) + atomicAdd(&particleCollisionCount[index], 1);
//            particleCollisionVelocities[bucketId1] = normal * corr;
//
//            let bucketId2 = (anotherParticleIndex * 8) + atomicAdd(&particleCollisionCount[anotherParticleIndex], 1);
//            particleCollisionVelocities[bucketId2] = normal * -corr;

            moveDir += normal * corr;
        }
    }

    position[index] += moveDir;

}

@binding(0) @group(0) var<uniform> settings: Settings;
@binding(1) @group(0) var<storage, read_write> position: array<vec2<f32>>;
@binding(2) @group(0) var<storage, read> prefixSum : array<u32>;
@binding(3) @group(0) var<storage, read_write> particleCollisionCount : array<atomic<u32>>;
@binding(4) @group(0) var<storage, read_write> particleCollisionVelocities : array<vec2<f32>>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>)
{
    let index: u32 = id.x;

    if (index >= settings.particleCount)
    {
        return;
    }

    let p = position[index];
    updatePoint(p, index, -1.0);
    updatePoint(p, index, 0.0);
    updatePoint(p, index, 1.0);
}