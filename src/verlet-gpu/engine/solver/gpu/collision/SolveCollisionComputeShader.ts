import {GPUData} from "../GPUInit";
import {PointsBuffer} from "../../buffer/PointsBuffer";
import {SolverSettingsBuffer} from "../../buffer/SolverSettingsBuffer";
import {loadShaderAndPutCommonCode, WORKGROUP_SIZE} from "../common/ShaderCommon";
import {CellCountBuffer} from "../grid/buffer/CellCountBuffer";
import {BucketBuffer} from "../grid/buffer/BucketBuffer";
import {UpdatePositionBucketBuffer} from "./buffer/UpdatePositionBucketBuffer";
import {UpdatePositionCounterBuffer} from "./buffer/UpdatePositionCounterBuffer";

export class SolveCollisionComputeShader
{
    private gpuData: GPUData;
    private settingsBuffer: SolverSettingsBuffer;
    private pointsBuffer: PointsBuffer;

    private cellsCountBuffer: CellCountBuffer;
    private bucketBuffer: BucketBuffer;

    private updatePositionBucketBuffer: UpdatePositionBucketBuffer;
    private updatePositionCounterBuffer: UpdatePositionCounterBuffer;

    private pipeline: GPUComputePipeline;
    private bindGroup: GPUBindGroup;

    private constructor(gpuData: GPUData,
                        shaderCode: string,
                        settingsBuffer: SolverSettingsBuffer,
                        pointsBuffer: PointsBuffer,
                        cellsCountBuffer: CellCountBuffer,
                        bucketBuffer: BucketBuffer,
                        updatePositionBucketBuffer: UpdatePositionBucketBuffer,
                        updatePositionCounterBuffer: UpdatePositionCounterBuffer)
    {
        this.gpuData = gpuData;
        this.settingsBuffer = settingsBuffer;
        this.pointsBuffer = pointsBuffer;
        this.cellsCountBuffer = cellsCountBuffer;

        const device : GPUDevice = gpuData.device;
        this.bucketBuffer = bucketBuffer;
        this.updatePositionBucketBuffer = updatePositionBucketBuffer;
        this.updatePositionCounterBuffer = updatePositionCounterBuffer;

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
                {
                    binding: 4,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "storage",
                    }
                },
                {
                    binding: 5,
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
            label: 'solve compute pipeline',
            layout: pipelineLayout,
            compute: {
                module,
                entryPoint: 'collision',
            },
        });

        const bindGroup = device.createBindGroup({
            label: 'solve bind group',
            layout: bindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: settingsBuffer.buffer }},
                { binding: 1, resource: { buffer: pointsBuffer.positionCurrentBuffer }},
                { binding: 2, resource: { buffer: cellsCountBuffer.buffer }},
                { binding: 3, resource: { buffer: bucketBuffer.buffer }},
                { binding: 4, resource: { buffer: updatePositionCounterBuffer.buffer }},
                { binding: 5, resource: { buffer: updatePositionBucketBuffer.buffer }},
            ],
        });

        this.pipeline = pipeline;
        this.bindGroup = bindGroup;
    }

    static async create(gpuData: GPUData,
                        settingsBuffer: SolverSettingsBuffer,
                        pointsBuffer: PointsBuffer,
                        cellsCountBuffer: CellCountBuffer,
                        bucketBuffer: BucketBuffer,
                        updatePositionBucketBuffer: UpdatePositionBucketBuffer,
                        updatePositionCounterBuffer: UpdatePositionCounterBuffer)
    {
        const shaderCode = await loadShaderAndPutCommonCode('/physics-playground/collision/collisionShader.wgsl', gpuData.maxBlockSize);
        return new SolveCollisionComputeShader(gpuData, shaderCode,
            settingsBuffer, pointsBuffer, cellsCountBuffer, bucketBuffer,
            updatePositionBucketBuffer, updatePositionCounterBuffer);
    }

    public async submit(pointsCount: number)
    {
        const device = this.gpuData.device;
        const pipeline = this.pipeline;
        const bindGroup = this.bindGroup;

        // Encode commands to do the computation
        const encoder = device.createCommandEncoder({ label: 'collision compute builtin encoder' });
        const pass = encoder.beginComputePass({ label: 'collision  compute builtin pass' });

        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(Math.ceil(pointsCount / WORKGROUP_SIZE));
        pass.end();

        // debug
        if (this.settingsBuffer.settings.debug)
        {
            this.updatePositionCounterBuffer.copy(encoder, pointsCount);
            this.updatePositionBucketBuffer.copy(encoder, pointsCount);
        }

        // Finish encoding and submit the commands
        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);

        // debug
        if (this.settingsBuffer.settings.debug)
        {
            await this.updatePositionCounterBuffer.read(pointsCount);
            await this.updatePositionBucketBuffer.read(pointsCount);
        }
    }
}