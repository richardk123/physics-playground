import {SolverSettings, SolverSettingsBuffer} from "../buffer/SolverSettingsBuffer";
import {Camera, CameraBuffer} from "../buffer/CameraBuffer";
import {BoundingBox, BoundingBoxBuffer} from "../buffer/BoundingBoxBuffer";
import {PointsBuffer} from "../buffer/PointsBuffer";
import {GPUData} from "./GPUInit";

export interface RenderPipeline
{
    bindGroup: GPUBindGroup;
    pipeline: GPURenderPipeline;
    cameraBuffer: CameraBuffer;
    boundingBoxBuffer: BoundingBoxBuffer;
}
export async function initRenderPipeline(gpuData: GPUData,
                                         camera: Camera,
                                         boundingBox: BoundingBox,
                                         pointsBuffer: PointsBuffer): Promise<RenderPipeline>
{
    const device : GPUDevice = gpuData.device;
    const presentationFormat = gpuData.presentationFormat;

    const cameraBuffer = new CameraBuffer(camera, device);
    const boundingBoxBuffer = new BoundingBoxBuffer(boundingBox, device);

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

    const shaderCode = await (fetch('/physics-playground/shader.wgsl')
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
            { binding: 1, resource: { buffer: pointsBuffer.positionCurrentBuffer }}
        ],
    });

    return {
        pipeline: pipeline,
        bindGroup: bindGroup,
        cameraBuffer: cameraBuffer,
        boundingBoxBuffer: boundingBoxBuffer,
    };
}