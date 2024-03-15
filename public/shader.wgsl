struct TransformData {
    model: mat4x4<f32>,
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
};

struct VertexOutput {
    @builtin(position) transformedPos: vec4<f32>,
    @location(0) localSpace: vec2<f32>,
}

@group(0) @binding(0) var<uniform> transformUBO: TransformData;
@group(0) @binding(1) var<storage, read> pointPositions: array<vec2<f32>>;
@vertex
fn vs(@builtin(vertex_index) vertexIndex : u32,
      @builtin(instance_index) instanceIndex: u32) -> VertexOutput
{
    var out: VertexOutput;
    let pos = array(
      vec2f( 0.0,  1.0),  // top center
      vec2f(0.866025, -0.5),  // bottom left
      vec2f(-0.866025, -0.5)   // bottom right
    );

    let vertexPos = pointPositions[instanceIndex] + pos[vertexIndex];

    // Perform matrix-vector multiplication manually
    let transformedPos = transformUBO.projection * transformUBO.view * transformUBO.model * vec4<f32>(
        0.0,
        vertexPos.x,
        vertexPos.y,
        1.0
    );

    out.transformedPos = transformedPos;
    out.localSpace = pos[vertexIndex];
    return out;
}

@fragment
fn fs(in: VertexOutput) -> @location(0) vec4f
{
    if (dot(in.localSpace, in.localSpace) > .25)
    {
        return vec4f(.1, .1, .1, 1.0);
//        discard;
    }
    return vec4f(1.0, .1, .1, 1.0);
}