import {GPUData} from "../GPUInit";
import {SolverSettingsBuffer} from "../../buffer/SolverSettingsBuffer";
import {CellCountBuffer} from "./buffer/CellCountBuffer";
import {loadShaderAndPutCommonCode, WORKGROUP_SIZE} from "../common/ShaderCommon";
import {BucketBuffer} from "./buffer/BucketBuffer";
import {PointsBuffer} from "../../buffer/PointsBuffer";

export class UpdateGridComputeShader
{
    private gpuData: GPUData;
    private settingsBuffer: SolverSettingsBuffer;
    private cellCountBuffer: CellCountBuffer;
    private bucketBuffer: BucketBuffer;
    private pipeline: GPUComputePipeline;
    private bindGroup: GPUBindGroup;
    private pointsBuffer: PointsBuffer;

    private constructor(gpuData: GPUData,
                        shaderCode: string,
                        cellCountBuffer: CellCountBuffer,
                        bucketBuffer: BucketBuffer,
                        pointsBuffer: PointsBuffer,
                        settingsBuffer: SolverSettingsBuffer)
    {
        this.gpuData = gpuData;
        this.settingsBuffer = settingsBuffer;
        this.bucketBuffer = bucketBuffer;
        this.pointsBuffer = pointsBuffer;
        this.cellCountBuffer = cellCountBuffer;

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
            label: 'update grid pipeline',
            layout: pipelineLayout,
            compute: {
                module,
                entryPoint: 'updateGrid',
            },
        });

        const bindGroup = device.createBindGroup({
            label: 'update grid bind group',
            layout: bindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: settingsBuffer.buffer }},
                { binding: 1, resource: { buffer: cellCountBuffer.buffer }},
                { binding: 2, resource: { buffer: bucketBuffer.buffer }},
                { binding: 3, resource: { buffer: pointsBuffer.positionCurrentBuffer }},
            ],
        });

        this.pipeline = pipeline;
        this.bindGroup = bindGroup;
    }

    static async create(gpuData: GPUData,
                        gridOffsetBuffer: CellCountBuffer,
                        gridBuffer: BucketBuffer,
                        pointsBuffer: PointsBuffer,
                        settingsBuffer: SolverSettingsBuffer)
    {
        const shaderCode = await loadShaderAndPutCommonCode('/physics-playground/grid/updateGrid.wgsl', gpuData.maxBlockSize);

        return new UpdateGridComputeShader(gpuData, shaderCode, gridOffsetBuffer, gridBuffer, pointsBuffer, settingsBuffer);
    }

    public async submit()
    {
        const device = this.gpuData.device;
        const pipeline = this.pipeline;
        const bindGroup = this.bindGroup;
        const pointsCount = this.pointsBuffer.points.count;

        // Encode commands to do the computation
        const encoder = device.createCommandEncoder({ label: 'update grid compute builtin encoder' });
        const pass = encoder.beginComputePass({ label: 'update grid  compute builtin pass' });

        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(Math.ceil(pointsCount / WORKGROUP_SIZE));
        pass.end();

        // debug
        this.cellCountBuffer.copy(encoder, pointsCount);
        this.bucketBuffer.copy(encoder, this.settingsBuffer.getTotalGridCellCount());

        // Finish encoding and submit the commands
        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);

        // debug
        await this.cellCountBuffer.read(this.settingsBuffer.getTotalGridCellCount());
        await this.bucketBuffer.read(this.settingsBuffer.getTotalGridCellCount());

    }
}