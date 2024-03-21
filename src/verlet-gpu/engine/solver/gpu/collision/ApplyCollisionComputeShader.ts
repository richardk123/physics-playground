import {GPUData} from "../GPUInit";
import {UpdatePositionBucketBuffer} from "./buffer/UpdatePositionBucketBuffer";
import {UpdatePositionCounterBuffer} from "./buffer/UpdatePositionCounterBuffer";
import {SolverSettingsBuffer} from "../../buffer/SolverSettingsBuffer";
import {loadShaderAndPutCommonCode, WORKGROUP_SIZE} from "../common/ShaderCommon";
import {PointsBuffer} from "../../buffer/PointsBuffer";

export class ApplyCollisionComputeShader
{
    private gpuData: GPUData;
    private pointsBuffer: PointsBuffer;
    private updatePositionBucketBuffer: UpdatePositionBucketBuffer;
    private updatePositionCounterBuffer: UpdatePositionCounterBuffer;
    private settingsBuffer: SolverSettingsBuffer;
    private pipeline: GPUComputePipeline;
    private bindGroup: GPUBindGroup;

    private constructor(gpuData: GPUData,
                        shaderCode: string,
                        pointsBuffer: PointsBuffer,
                        updatePositionBucketBuffer: UpdatePositionBucketBuffer,
                        updatePositionCounterBuffer: UpdatePositionCounterBuffer,
                        settingsBuffer: SolverSettingsBuffer)
    {
        this.gpuData = gpuData;
        this.pointsBuffer = pointsBuffer;
        this.updatePositionBucketBuffer = updatePositionBucketBuffer;
        this.updatePositionCounterBuffer = updatePositionCounterBuffer;
        this.settingsBuffer = settingsBuffer;

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
                        type: "read-only-storage",
                    }
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "read-only-storage",
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
            label: 'apply collision pipeline',
            layout: pipelineLayout,
            compute: {
                module,
                entryPoint: 'applyCollision',
            },
        });

        const bindGroup = device.createBindGroup({
            label: 'apply collision bind group',
            layout: bindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: settingsBuffer.buffer }},
                { binding: 1, resource: { buffer: pointsBuffer.positionCurrentBuffer }},
                { binding: 2, resource: { buffer: updatePositionCounterBuffer.buffer }},
                { binding: 3, resource: { buffer: updatePositionBucketBuffer.buffer }},
            ],
        });

        this.pipeline = pipeline;
        this.bindGroup = bindGroup;
    }

    static async create(gpuData: GPUData,
                        settingsBuffer: SolverSettingsBuffer,
                        pointsBuffer: PointsBuffer,
                        updatePositionBucketBuffer: UpdatePositionBucketBuffer,
                        updatePositionCounterBuffer: UpdatePositionCounterBuffer)
    {
        const shaderCode = await loadShaderAndPutCommonCode('/physics-playground/collision/applyCollisionShader.wgsl',
            gpuData.maxBlockSize);

        return new ApplyCollisionComputeShader(gpuData, shaderCode,
            pointsBuffer, updatePositionCounterBuffer, updatePositionBucketBuffer, settingsBuffer);
    }

    public submit(pointsCount: number)
    {
        const device = this.gpuData.device;
        const pipeline = this.pipeline;
        const bindGroup = this.bindGroup;

        // Encode commands to do the computation
        const encoder = device.createCommandEncoder({ label: 'clear position compute builtin encoder' });
        const pass = encoder.beginComputePass({ label: 'clear position  compute builtin pass' });

        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(Math.ceil(pointsCount / WORKGROUP_SIZE));
        pass.end();

        // Finish encoding and submit the commands
        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);
    }
}