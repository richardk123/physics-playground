import {SolverSettings, SolverSettingsBuffer} from "./buffer/SolverSettingsBuffer";
import {Camera, CameraBuffer} from "./buffer/CameraBuffer";
import {BoundingBox, BoundingBoxBuffer} from "./buffer/BoundingBoxBuffer";
import {PointsBuffer} from "./buffer/Points";

export interface GPUData
{
    adapter : GPUAdapter;
    device : GPUDevice;
    context : GPUCanvasContext;
    format : GPUTextureFormat;
    bindGroup: GPUBindGroup;
    pipeline: GPURenderPipeline;
    canvas: HTMLCanvasElement;
    pointsBuffer: PointsBuffer,
    cameraBuffer: CameraBuffer;
    boundingBoxBuffer: BoundingBoxBuffer;
    solverSettingsBuffer: SolverSettingsBuffer;
}
export async function initPipeline(canvas: HTMLCanvasElement,
                                   settings: SolverSettings,
                                   camera: Camera,
                                   boundingBox: BoundingBox): Promise<GPUData>
{
    const adapter : GPUAdapter = <GPUAdapter> await navigator.gpu?.requestAdapter();
    const device : GPUDevice = <GPUDevice> await adapter?.requestDevice();
    const context : GPUCanvasContext = <GPUCanvasContext> canvas.getContext("webgpu");
    const format : GPUTextureFormat = navigator.gpu.getPreferredCanvasFormat();
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

    const cameraBuffer = new CameraBuffer(camera, device);
    const pointsBuffer = new PointsBuffer(settings.maxParticleCount, device);
    const boundingBoxBuffer = new BoundingBoxBuffer(boundingBox, device);
    const solverSettingsBuffer = new SolverSettingsBuffer(settings, device)

    context.configure({
        device,
        format: presentationFormat,
    });

    const shader = await (fetch('/physics-playground/shader.wgsl')
        .then((r) => r.text()));

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

    const bindGroup = device.createBindGroup({
        label: 'triangle bind group',
        layout: bindGroupLayout,
        entries: [
            { binding: 0, resource: { buffer: cameraBuffer.buffer }},
            { binding: 1, resource: { buffer: pointsBuffer.buffer }}
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
        pointsBuffer: pointsBuffer,
        cameraBuffer: cameraBuffer,
        boundingBoxBuffer: boundingBoxBuffer,
        solverSettingsBuffer: solverSettingsBuffer,
    };
}