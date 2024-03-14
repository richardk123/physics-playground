struct TransformData {
    model: mat4x4<f32>,
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
};

@group(0) @binding(0) var<uniform> transformUBO: TransformData;
@vertex fn vs(
@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4f
{
    let pos = array(
      vec2f( 0.0,  0.5),  // top center
      vec2f(-0.5, -0.5),  // bottom left
      vec2f( 0.5, -0.5)   // bottom right
    );

    // Perform matrix-vector multiplication manually
    let transformedPos = transformUBO.projection * transformUBO.view * transformUBO.model * vec4<f32>(
        0.1,
        pos[vertexIndex].x,
        pos[vertexIndex].y,
        1.0
    );

    return transformedPos;
}

@fragment fn fs() -> @location(0) vec4f
{
    return vec4f(.5, .5, .5, 1.0);
}