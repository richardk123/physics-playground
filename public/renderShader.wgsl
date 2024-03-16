var<private> TRIANGLE: array<vec2<f32>, 3> = array<vec2<f32>, 3>(
      vec2f( 0.0,  1.0),  // top center
      vec2f(0.866025, -0.5),  // bottom right
      vec2f(-0.866025, -0.5)   // bottom left
);

struct TransformData {
    model: mat4x4<f32>,
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
};

struct VertexOutput {
    @builtin(position) transformedPos: vec4<f32>,
    @location(0) localSpace: vec2<f32>,
    @location(1) color: vec4<f32>,
}

@group(0) @binding(0) var<uniform> transformUBO: TransformData;
@group(0) @binding(1) var<storage, read> positions: array<vec2<f32>>;
@group(0) @binding(2) var<storage, read> colors: array<vec4<f32>>;
@vertex
fn vs(@builtin(vertex_index) vertexIndex : u32,
      @builtin(instance_index) instanceIndex: u32) -> VertexOutput
{
    var out: VertexOutput;
    let vertexPos = positions[instanceIndex] + TRIANGLE[vertexIndex];

    let transformedPos = transformUBO.projection *
        transformUBO.view *
        transformUBO.model * vec4<f32>(0.0, vertexPos.x, vertexPos.y, 1.0);

    out.transformedPos = transformedPos;
    out.localSpace = TRIANGLE[vertexIndex];
    out.color = colors[instanceIndex];
    return out;
}

@fragment
fn fs(in: VertexOutput) -> @location(0) vec4f
{
    if (dot(in.localSpace, in.localSpace) > .25)
    {
        discard;
    }
    return in.color;
}