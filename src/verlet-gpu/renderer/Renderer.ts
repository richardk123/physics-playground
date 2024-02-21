
export class Renderer
{
    private _canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement)
    {
        this._canvas = canvas;
    }
}

export async function createRenderer(canvas: HTMLCanvasElement) {
    //adapter: wrapper around (physical) GPU.
    //Describes features and limits
    const adapter : GPUAdapter = <GPUAdapter> await navigator.gpu?.requestAdapter();
    //device: wrapper around GPU functionality
    //Function calls are made through the device
    const device : GPUDevice = <GPUDevice> await adapter?.requestDevice();
    //context: similar to vulkan instance (or OpenGL context)
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

    const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: []
    });

    const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout]
    });
    const shader = await fetch('/physics-playground/shader.wgsl')
        .then((r) => r.text());

    const pipeline = device.createRenderPipeline({
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

    //command encoder: records draw commands for submission
    const commandEncoder : GPUCommandEncoder = device.createCommandEncoder();
    //texture view: image view to the color buffer in this case
    const textureView : GPUTextureView = context.getCurrentTexture().createView();
    //renderpass: holds draw commands, allocated from command encoder
    const renderpass : GPURenderPassEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [{
            view: textureView,
            clearValue: {r: 0.5, g: 0.0, b: 0.25, a: 1.0},
            loadOp: "clear",
            storeOp: "store"
        }] as GPURenderPassColorAttachment[],
    });
    renderpass.setPipeline(pipeline);
    renderpass.setBindGroup(0, bindGroup)
    renderpass.draw(3, 1, 0, 0);
    renderpass.end();

    device.queue.submit([commandEncoder.finish()]);
}