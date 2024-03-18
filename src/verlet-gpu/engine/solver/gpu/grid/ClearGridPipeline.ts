import {GPUData} from "../GPUInit";
import {SolverSettingsBuffer} from "../../buffer/SolverSettingsBuffer";
import {PointsBuffer} from "../../buffer/PointsBuffer";

export interface CreateGridPipeline
{
    pipeline: GPUComputePipeline;
    bindGroup: GPUBindGroup;
}

export async function initCreateGridPipeline(gpuData: GPUData,
                                             settingsBuffer: SolverSettingsBuffer,
                                             pointsBuffer: PointsBuffer): Promise<CreateGridPipeline>
{
    const device : GPUDevice = gpuData.device;

    const bindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "uniform",
                }
            },
            {
                binding: 1,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "storage",
                }
            },
            {
                binding: 2,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "storage",
                }
            },
            {
                binding: 3,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "storage",
                }
            },
        ] as GPUBindGroupLayoutEntry[]
    });

    const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout]
    });

    const shaderCode = await (fetch('/physics-playground/postSolveShader.wgsl')
        .then((r) => r.text()));

    const module = device.createShaderModule({
        code: shaderCode
    });

    const pipeline = device.createComputePipeline({
        label: 'preSolve compute pipeline',
        layout: pipelineLayout,
        compute: {
            module,
            entryPoint: 'postSolve',
        },
    });

    const bindGroup = device.createBindGroup({
        label: 'triangle bind group',
        layout: bindGroupLayout,
        entries: [
            { binding: 0, resource: { buffer: settingsBuffer.buffer }},
            { binding: 1, resource: { buffer: pointsBuffer.positionCurrentBuffer }},
            { binding: 2, resource: { buffer: pointsBuffer.positionPreviousBuffer }},
            { binding: 3, resource: { buffer: pointsBuffer.velocityBuffer }},
        ],
    });

    return {pipeline: pipeline, bindGroup: bindGroup};
}