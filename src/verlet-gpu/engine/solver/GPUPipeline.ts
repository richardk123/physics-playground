import {SolverSettings} from "./Solver";

export interface GPUData
{
    adapter : GPUAdapter;
    device : GPUDevice;
    context : GPUCanvasContext;
    format : GPUTextureFormat;
    bindGroup: GPUBindGroup;
    pipeline: GPURenderPipeline;
    cameraBuffer: GPUBuffer;
    pointsPositionBuffer: GPUBuffer,
    canvas: HTMLCanvasElement;
}
export async function initPipeline(canvas: HTMLCanvasElement,
                                   settings: SolverSettings): Promise<GPUData>
{
    const adapter : GPUAdapter = <GPUAdapter> await navigator.gpu?.requestAdapter();
    const device : GPUDevice = <GPUDevice> await adapter?.requestDevice();
    const context : GPUCanvasContext = <GPUCanvasContext> canvas.getContext("webgpu");
    const format : GPUTextureFormat = navigator.gpu.getPreferredCanvasFormat();
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
        device,
        format: presentationFormat,
    });

    const shader = await (fetch('/physics-playground/shader.wgsl')
        .then((r) => r.text()));

    console.log(shader);

    const module = device.createShaderModule({
        code: shader
    });

    const bindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: "uniform",
                }
            },
            {
                binding: 1,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: "read-only-storage",
                }
            }
        ] as GPUBindGroupLayoutEntry[]
    });

    const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout]
    });

    const pipeline = device.createRenderPipeline({
        label: 'triangle with uniforms',
        layout: pipelineLayout,
        vertex: {
            module,
            entryPoint: 'vs',
        },
        fragment: {
            module,
            entryPoint: 'fs',
            targets: [{ format: presentationFormat }],
        },
    });

    const cameraBuffer = device.createBuffer({
        label: 'camera buffer',
        size: 64 * 3,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const pointsPositionBuffer = device.createBuffer({
        label: 'points position buffer',
        size: settings.maxParticleCount * 2 * 4,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })

    const bindGroup = device.createBindGroup({
        label: 'triangle bind group',
        layout: bindGroupLayout,
        entries: [
            { binding: 0, resource: { buffer: cameraBuffer }},
            { binding: 1, resource: { buffer: pointsPositionBuffer}}
        ],
    });

    return {
        adapter: adapter,
        pipeline: pipeline,
        bindGroup: bindGroup,
        context: context,
        device: device,
        format: format,
        canvas: canvas,
        pointsPositionBuffer: pointsPositionBuffer,
        cameraBuffer: cameraBuffer,
    };
}