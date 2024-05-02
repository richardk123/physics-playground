const TRIANGLE: array<vec2<f32>, 3> = array<vec2<f32>, 3>(
      vec2f( 0.0,  1.0),  // top center
      vec2f(0.866025, -0.5),  // bottom right
      vec2f(-0.866025, -0.5)   // bottom left
);

struct Camera {
    model: mat4x4<f32>,
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
};

struct Particle
{
    positionCurrent: vec2<f32>,
    positionPrevious: vec2<f32>,
    velocity: vec2<f32>,
    density: f32,
    mass: f32,
    color: vec3<f32>,
    materialIndex: u32,
}

struct VertexOutput {
    @builtin(position) transformedPos: vec4<f32>,
    @location(0) localSpace: vec2<f32>,
    @location(1) color: vec3<f32>,
}

@group(0) @binding(0) var<uniform> camera: Camera;
@group(0) @binding(1) var<storage, read> particles: array<Particle>;
@vertex
fn vs(@builtin(vertex_index) vertexIndex : u32,
      @builtin(instance_index) instanceIndex: u32) -> VertexOutput
{
    var out: VertexOutput;
    let particle = particles[instanceIndex];
    let vertexPos = particle.positionCurrent + TRIANGLE[vertexIndex];
    let transformedPos = camera.projection *
        camera.view *
        camera.model * vec4<f32>(0.0, vertexPos.x, vertexPos.y, 1.0);

    let densityMultiplier = 3 / particle.density;
    let colorMultiplier = clamp((length(particle.velocity) * densityMultiplier) / 25 / densityMultiplier, 0.9, 1.1);

    out.color = particles[instanceIndex].color * colorMultiplier;
    out.transformedPos = transformedPos;
    out.localSpace = TRIANGLE[vertexIndex];

    return out;
}

@fragment
fn fs(in: VertexOutput) -> @location(0) vec4f
{
    if (dot(in.localSpace, in.localSpace) > .25)
    {
        discard;
    }
    return vec4(in.color, 1.0);
}