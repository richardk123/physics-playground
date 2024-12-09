const LEFT = vec2<f32>(-1.0, 0.0);
const RIGHT = vec2<f32>(1.0, 0.0);

const TOP = vec2<f32>(0.0, 1.0);
const TOP_LEFT = vec2<f32>(-1.0, 1.0);
const TOP_RIGHT = vec2<f32>(1.0, 1.0);

const BOTTOM = vec2<f32>(0.0, -1.0);
const BOTTOM_LEFT = vec2<f32>(-1.0, -1.0);
const BOTTOM_RIGHT = vec2<f32>(1.0, -1.0);

const G = 6.67e-1;

struct EngineSettings
{
    transform: vec2<f32>,
    zoom: f32,
    gridSize: vec2<u32>,
}

struct Particle
{
    position: vec2<f32>,
    velocity: vec2<f32>,
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<storage, read> grid : array<u32>;
@group(0) @binding(2) var<storage, read> prefixSum : array<u32>;
@group(0) @binding(3) var<uniform> settings: EngineSettings;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>)
{
    let index = id.x;

//    if (index > arrayLength(&particles)) {
//        return;
//    }

    var acceleration = vec2<f32>(0.0, 0.0);
    // calculate gravity acceleration for different LOD's
    acceleration = acceleration + getAccelerationForLod(0, id.x);
    acceleration = acceleration + getAccelerationForLod(1, id.x);
    acceleration = acceleration + getAccelerationForLod(2, id.x);
    acceleration = acceleration + getAccelerationForLod(3, id.x);
    acceleration = acceleration + getAccelerationForLod(4, id.x);
    acceleration = acceleration + getAccelerationForLod(5, id.x);
    acceleration = acceleration + getAccelerationForLod(6, id.x);

    // sum up velocity
    particles[id.x].velocity = particles[id.x].velocity + (acceleration * 0.01);

    // update position
    particles[id.x].position = particles[id.x].position + particles[id.x].velocity;
}

fn getAccelerationForLod(lod: i32, pIndex: u32) -> vec2<f32> {
    var sum = vec2<f32>(0, 0);

    sum = sum + getAccelerationForDirection(LEFT, lod, pIndex);
    sum = sum + getAccelerationForDirection(RIGHT, lod, pIndex);
    sum = sum + getAccelerationForDirection(TOP, lod, pIndex);
    sum = sum + getAccelerationForDirection(TOP_LEFT, lod, pIndex);
    sum = sum + getAccelerationForDirection(TOP_RIGHT, lod, pIndex);
    sum = sum + getAccelerationForDirection(BOTTOM, lod, pIndex);
    sum = sum + getAccelerationForDirection(BOTTOM_LEFT, lod, pIndex);
    sum = sum + getAccelerationForDirection(BOTTOM_RIGHT, lod, pIndex);

    return sum;
}

fn getAccelerationForDirection(direction: vec2<f32>, lod: i32, pIndex: u32) -> vec2<f32> {
    let particle = particles[pIndex];
    // length of square used for integral sum
    let squareSideLen = intPow(3, lod);
    // middle point of the square
    let midPoint = particle.position + (direction * f32(squareSideLen));
    // corners of the square
    let corners = calculateCorners(midPoint, squareSideLen);

    let mass = getIntegralSum(
        corners.topLeft.x,
        corners.topLeft.y,
        corners.bottomRight.x,
        corners.bottomRight.y);

    return calculateGravitationalForce(particle.position, midPoint, f32(mass));
}

fn calculateGravitationalForce(p1: vec2<f32>, p2: vec2<f32>, mass: f32) -> vec2<f32> {
    let direction = p2 - p1; // Direction from p1 to p2
    let distanceSq = max(length(direction), 1e-10); // Avoid division by zero
    let magnitude = mass / (distanceSq * distanceSq); // Gravitational force magnitude
    let normalizedDirection = normalize(direction); // Unit vector for direction
    return normalizedDirection * magnitude * G;
}

struct Corners {
    topLeft: vec2<i32>,
    bottomRight: vec2<i32>,
};

fn calculateCorners(midPoint: vec2<f32>, sideLength: i32) -> Corners {
    let halfLength = sideLength / 2;
//    let modulo = vec2<i32>(sideLength % 2, sideLength % 2);
    let mid = vec2<i32>(i32(midPoint.x), i32(midPoint.y));
    return Corners(
        mid - vec2<i32>(halfLength, halfLength),
        mid + vec2<i32>(halfLength, halfLength)
    );
}

fn getValue(x: i32, y: i32) -> u32 {
    if (x < 0) {
        return 0;
    }
    if (y < 0) {
        return 0;
    }
    let clampedX = u32(clamp(x, 0, i32(settings.gridSize.x) - 1));
    let clampedY = u32(clamp(y, 0, i32(settings.gridSize.y) - 1));
    return prefixSum[u32(clampedY) * settings.gridSize.x + u32(clampedX)];
}

// integral sum formula
fn getIntegralSum(x1: i32, y1: i32, x2: i32, y2: i32) -> u32 {
    return getValue(x2, y2)
         - getValue(x1 - 1, y2)
         - getValue(x2, y1 - 1)
         + getValue(x1 - 1, y1 - 1);
}

fn intPow(base: i32, exp: i32) -> i32 {
    var result = 1;
    for (var i = 0; i < exp; i = i + 1) {
        result = result * base;
    }
    return result;
}