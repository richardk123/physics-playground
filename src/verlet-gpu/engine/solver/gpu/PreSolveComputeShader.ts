import {GPUData} from "./GPUInit";
import {PointsBuffer} from "../buffer/PointsBuffer";
import {SolverSettingsBuffer} from "../buffer/SolverSettingsBuffer";
import {loadShaderAndPutCommonCode, WORKGROUP_SIZE} from "./common/ShaderCommon";

export class PreSolveComputeShader
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
                entryPoint: 'preSolve',
            },
        });

        const bindGroup = device.createBindGroup({
            label: 'preSolve bind group',
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
        const shaderCode = await loadShaderAndPutCommonCode('/physics-playground/preSolveShader.wgsl', gpuData.maxBlockSize);
        return new PreSolveComputeShader(gpuData, shaderCode, settingsBuffer, pointsBuffer);
    }

    public async submit()
    {
        const device = this.gpuData.device;
        const pipeline = this.pipeline;
        const bindGroup = this.bindGroup;

        // Encode commands to do the computation
        const encoder = device.createCommandEncoder({ label: 'preSolve compute builtin encoder' });
        const pass = encoder.beginComputePass({ label: 'preSolve  compute builtin pass' });

        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(Math.ceil(this.pointsBuffer.points.count / WORKGROUP_SIZE));
        pass.end();

        // debug
        if (this.settingsBuffer.settings.debug)
        {
            this.pointsBuffer.copy(encoder, this.pointsBuffer.points.count);
        }

        // Finish encoding and submit the commands
        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);


        // debug
        if (this.settingsBuffer.settings.debug)
        {
            await this.pointsBuffer.read(this.pointsBuffer.points.count);
        }
    }
}