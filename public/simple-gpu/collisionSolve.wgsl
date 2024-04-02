struct Settings
{
    particleCount: u32,
    gridSizeX: u32,
    gridSizeY: u32,
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
    let y = p.y + yOffset;

    let startId = getGridID(vec2<f32>(leftX, y));
    let endId = getGridID(vec2<f32>(rightX, y));

    let row = u32(y);

    let particleStartId = max(0, prefixSum[startId] - 1);
    let particleEndId = max(0, prefixSum[endId] - 1);

    for (var anotherParticleIndex = particleStartId; anotherParticleIndex <= particleEndId; anotherParticleIndex++)
    {
        let anotherParticle = position[anotherParticleIndex];
        let d = distance(p, anotherParticle);

        if (d > 0.0 && d < 1.0 && anotherParticleIndex != index && row == u32(floor(anotherParticle.y)))
        {
            let normal = normalize(anotherParticle - p);
            let corr = ((1.0 - d) * 0.5);

//            let updateCount = atomicAdd(&particleUpdateCount[index], 1);
            //position[index] += normal * -corr;
        }
    }
}

@binding(0) @group(0) var<uniform> settings: Settings;
@binding(1) @group(0) var<storage, read_write> position: array<vec2<f32>>;
@binding(2) @group(0) var<storage, read> prefixSum : array<u32>;
//@binding(3) @group(0) var<storage, read_write> particleUpdateCount : array<atomic<u32>>;
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