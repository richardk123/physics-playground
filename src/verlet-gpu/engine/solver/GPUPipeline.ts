export interface GPUData
{
    adapter : GPUAdapter;
    device : GPUDevice;
    context : GPUCanvasContext;
    format : GPUTextureFormat;
    bindGroup: GPUBindGroup;
    pipeline: GPURenderPipeline;
    canvas: HTMLCanvasElement;
}
export async function initPipeline(canvas: HTMLCanvasElement): Promise<GPUData>
{
    const adapter : GPUAdapter = <GPUAdapter> await navigator.gpu?.requestAdapter();
    const device : GPUDevice = <GPUDevice> await adapter?.requestDevice();
    const context : GPUCanvasContext = <GPUCanvasContext> canvas.getContext("webgpu");
    const format : GPUTextureFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device: device,
        format: format,
        alphaMode: "opaque"
    });

    const bindGroupLayout = device.createBindGroupLayout({
        entries: [],
    });

    const bindGroup: GPUBindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: []
    });

    const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout]
    });
    const shader = await fetch('/physics-playground/shader.wgsl')
        .then((r) => r.text());

    const pipeline: GPURenderPipeline = device.createRenderPipeline({
        vertex : {
            module : device.createShaderModule({
                code : shader
            }),
            entryPoint : "vs_main"
        },

        fragment : {
            module : device.createShaderModule({
                code : shader
            }),
            entryPoint : "fs_main",
            targets : [{
                format : format
            }]
        },

        primitive : {
            topology : "triangle-list"
        },

        layout: pipelineLayout
    });

    return {
        adapter: adapter,
        pipeline: pipeline,
        bindGroup: bindGroup,
        context: context,
        device: device,
        format: format,
        canvas: canvas,
    };
}