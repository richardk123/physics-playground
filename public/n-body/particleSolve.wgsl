const GRID_SIZE: i32 = 2048;
const LEFT = vec2<i32>(-1, 0);
const RIGHT = vec2<i32>(1, 0);
const TOP = vec2<i32>(0, 1);
const BOTTOM = vec2<i32>(0, -1);

struct Particle
{
    position: vec2<f32>,
    velocity: vec2<f32>,
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<storage, read> grid : array<u32>;
@group(0) @binding(2) var<storage, read> prefixSum : array<u32>;
@compute
@workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>)
{
//    let particle = particles[id.x];
//    if (particle.position.x < 0.0 || particle.position.y < 0.0 || particle.position.x > f32(GRID_SIZE) || particle.position.y > f32(GRID_SIZE)) {
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
    particles[id.x].velocity = particles[id.x].velocity + (acceleration * 0.001);

    // update position
    particles[id.x].position = particles[id.x].position + particles[id.x].velocity;
}

fn getAccelerationForLod(lod: i32, pIndex: u32) -> vec2<f32> {
    var sum = vec2<f32>(0, 0);

    sum = sum + getAccelerationForDirection(LEFT, lod, pIndex);
    sum = sum + getAccelerationForDirection(RIGHT, lod, pIndex);
    sum = sum + getAccelerationForDirection(TOP, lod, pIndex);
    sum = sum + getAccelerationForDirection(BOTTOM, lod, pIndex);

    return sum;
}

fn getAccelerationForDirection(direction: vec2<i32>, lod: i32, pIndex: u32) -> vec2<f32> {
    let particle = particles[pIndex];
    // length of square used for integral sum
    let squareSideLen = intPow(3, lod);
    // middle point of the square
    let midPoint = (direction * squareSideLen) + vec2<i32>(i32(particle.position.x), i32(particle.position.y));
    // corners of the square
    let corners = calculateCorners(midPoint, squareSideLen);

    let mass = getIntegralSum(
        corners.topLeft.x,
        corners.topLeft.y,
        corners.bottomRight.x,
        corners.bottomRight.y);

    return calculateGravitationalForce(particle.position, vec2<f32>(f32(midPoint.x), f32(midPoint.y)), f32(mass));
}

fn calculateGravitationalForce(p1: vec2<f32>, p2: vec2<f32>, mass: f32) -> vec2<f32> {
    let direction = p2 - p1; // Direction from p1 to p2
    let distanceSq = max(dot(direction, direction), 10000000.0); // Avoid division by zero
    let magnitude = mass / distanceSq; // Gravitational force magnitude
    let normalizedDirection = normalize(direction); // Unit vector for direction
    return normalizedDirection * magnitude; // Force vector
}

struct Corners {
    topLeft: vec2<i32>,
    bottomRight: vec2<i32>,
};

fn calculateCorners(midPoint: vec2<i32>, sideLength: i32) -> Corners {
    let halfLength = sideLength / 2;
    let modulo = vec2<i32>(sideLength % 2, sideLength % 2);
    return Corners(
        midPoint - vec2<i32>(halfLength, halfLength) - modulo,
        midPoint + vec2<i32>(halfLength, halfLength) + modulo
    );
}

// integral sum formula
fn getIntegralSum(x1: i32, y1: i32, x2: i32, y2: i32) -> u32 {
    return getValue(x2, y2)
         - getValue(x1 - 1, y2)
         - getValue(x2, y1 - 1)
         + getValue(x1 - 1, y1 - 1);
}

fn getValue(x: i32, y: i32) -> u32 {
    if (x < 0 || y < 0 || x > GRID_SIZE || y > GRID_SIZE) {
        return 0;
    }
    return prefixSum[y * GRID_SIZE + x];
}

fn intPow(base: i32, exp: i32) -> i32 {
    var result = 1;
    for (var i = 0; i < exp; i = i + 1) {
        result = result * base;
    }
    return result;
}