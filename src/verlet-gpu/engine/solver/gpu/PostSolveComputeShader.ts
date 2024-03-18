import {GPUData} from "./GPUInit";
import {PointsBuffer} from "../buffer/PointsBuffer";
import {SolverSettingsBuffer} from "../buffer/SolverSettingsBuffer";
import {loadShaderAndPutCommonCode, WORKGROUP_SIZE} from "./common/ShaderCommon";

export class PostSolveComputeShader
{
    private gpuData: GPUData;
    private settingsBuffer: SolverSettingsBuffer;
    private pointsBuffer: PointsBuffer;
    private pipeline: GPUComputePipeline;
    private bindGroup: GPUBindGroup;

    private constructor(gpuData: GPUData,
                        shaderCode: string,
                        settingsBuffer: SolverSettingsBuffer,
                        pointsBuffer: PointsBuffer)
    {
        this.gpuData = gpuData;
        this.settingsBuffer = settingsBuffer;
        this.pointsBuffer = pointsBuffer;

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

        this.pipeline = pipeline;
        this.bindGroup = bindGroup;
    }

    static async create(gpuData: GPUData,
                        settingsBuffer: SolverSettingsBuffer,
                        pointsBuffer: PointsBuffer)
    {
        const shaderCode = await loadShaderAndPutCommonCode('/physics-playground/postSolveShader.wgsl', gpuData.maxBlockSize);
        return new PostSolveComputeShader(gpuData, shaderCode, settingsBuffer, pointsBuffer);
    }

    public submit()
    {
        const device = this.gpuData.device;
        const pipeline = this.pipeline;
        const bindGroup = this.bindGroup;

        // Encode commands to do the computation
        const encoder = device.createCommandEncoder({ label: 'postSolve compute builtin encoder' });
        const pass = encoder.beginComputePass({ label: 'postSolve  compute builtin pass' });

        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(Math.ceil(this.pointsBuffer.points.count / WORKGROUP_SIZE));
        pass.end();

        // Finish encoding and submit the commands
        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);
    }
}
