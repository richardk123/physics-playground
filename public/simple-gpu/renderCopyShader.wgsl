struct OurVertexShaderOutput {
  @builtin(position) position: vec4f,
  @location(0) texcoord: vec2f,
};

@vertex fn vs(@builtin(vertex_index) vertexIndex : u32) -> OurVertexShaderOutput
{
  let pos = array(
    // 1st triangle
    vec2f( -1.0, -1.0),  // center
    vec2f( 1.0,  -1.0),  // right, center
    vec2f( -1.0,  1.0),  // center, top

    // 2st triangle
    vec2f( -1.0,  1.0),  // center, top
    vec2f( 1.0,  -1.0),  // right, center
    vec2f( 1.0,  1.0),  // right, top
  );

  var vsOutput: OurVertexShaderOutput;
  let xy = pos[vertexIndex];
  vsOutput.position = vec4f(xy, 0.0, 1.0);
//  vsOutput.texcoord = vec2(0.0, 1.0) - ((xy + vec2(1.0, 1.0)) / 2);
  vsOutput.texcoord = vec2((xy.x + 1.0) / 2, 1.0 - ((xy.y + 1.0) / 2));
  return vsOutput;
}

@group(0) @binding(0) var ourSampler: sampler;
@group(0) @binding(1) var ourTexture: texture_2d<f32>;
@fragment
fn fs(fsInput: OurVertexShaderOutput) -> @location(0) vec4f
{
//  return textureSample(ourTexture, ourSampler, fsInput.texcoord);
  let result = textureSample(ourTexture, ourSampler, fsInput.texcoord);
  let col = vec3(result.x, result.y, result.z);
  if (dot(col, col) == 0.0)
  {
    discard;
  }
    return vec4(1.0, 1.0, 1.0, 1.0);
}