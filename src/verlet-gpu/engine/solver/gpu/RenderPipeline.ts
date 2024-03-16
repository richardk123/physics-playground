import {Camera, CameraBuffer} from "../buffer/CameraBuffer";
import {PointsBuffer} from "../buffer/PointsBuffer";
import {GPUData} from "./GPUInit";

export interface RenderPipeline
{
    bindGroup: GPUBindGroup;
    pipeline: GPURenderPipeline;
    cameraBuffer: CameraBuffer;
}
export async function initRenderPipeline(gpuData: GPUData,
                                         camera: Camera,
                                         pointsBuffer: PointsBuffer): Promise<RenderPipeline>
{
    const device : GPUDevice = gpuData.device;
    const presentationFormat = gpuData.presentationFormat;

    const cameraBuffer = new CameraBuffer(camera, device);

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
            },
            {
                binding: 2,
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

    const shaderCode = await (fetch('/physics-playground/renderShader.wgsl')
        .then((r) => r.text()));

    const module = device.createShaderModule({
        code: shaderCode
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
            { binding: 1, resource: { buffer: pointsBuffer.positionCurrentBuffer }},
            { binding: 2, resource: { buffer: pointsBuffer.colorBuffer }},
        ],
    });

    return {
        pipeline: pipeline,
        bindGroup: bindGroup,
        cameraBuffer: cameraBuffer,
    };
}