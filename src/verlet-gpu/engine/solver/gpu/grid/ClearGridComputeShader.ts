import {SolverSettingsBuffer} from "../../buffer/SolverSettingsBuffer";
import {GPUData} from "../GPUInit";
import {PointsBuffer} from "../../buffer/PointsBuffer";
import {CellCountBuffer} from "./buffer/CellCountBuffer";
import {loadShaderAndPutCommonCode, WORKGROUP_SIZE} from "../common/ShaderCommon";
import {BucketBuffer} from "./buffer/BucketBuffer";

export class ClearGridComputeShader
{
    private gpuData: GPUData;
    private settingsBuffer: SolverSettingsBuffer;
    private cellCountBuffer: CellCountBuffer;
    private bucketBuffer: BucketBuffer;
    private pipeline: GPUComputePipeline;
    private bindGroup: GPUBindGroup;

    private constructor(gpuData: GPUData,
                        shaderCode: string,
                        cellCountBuffer: CellCountBuffer,
                        bucketBuffer: BucketBuffer,
                        settingsBuffer: SolverSettingsBuffer)
    {
        this.gpuData = gpuData;
        this.settingsBuffer = settingsBuffer;
        this.cellCountBuffer = cellCountBuffer;
        this.bucketBuffer = bucketBuffer;

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
            ] as GPUBindGroupLayoutEntry[]
        });

        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        });

        const module = device.createShaderModule({
            code: shaderCode
        });

        const pipeline = device.createComputePipeline({
            label: 'clear grid pipeline',
            layout: pipelineLayout,
            compute: {
                module,
                entryPoint: 'clearGrid',
            },
        });

        const bindGroup = device.createBindGroup({
            label: 'clear grid bind group',
            layout: bindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: settingsBuffer.buffer }},
                { binding: 1, resource: { buffer: cellCountBuffer.buffer }},
                { binding: 2, resource: { buffer: bucketBuffer.buffer }},
            ],
        });

        this.pipeline = pipeline;
        this.bindGroup = bindGroup;
    }

    static async create(gpuData: GPUData,
                        settingsBuffer: SolverSettingsBuffer,
                        bucketBuffer: BucketBuffer,
                        cellCountBuffer: CellCountBuffer)
    {
        const shaderCode = await loadShaderAndPutCommonCode('/physics-playground/grid/clearGrid.wgsl', gpuData.maxBlockSize);
        return new ClearGridComputeShader(gpuData, shaderCode, cellCountBuffer, bucketBuffer, settingsBuffer);
    }

    public submit()
    {
        const device = this.gpuData.device;
        const pipeline = this.pipeline;
        const bindGroup = this.bindGroup;
        const gridTotalCellCount = this.settingsBuffer.getTotalGridCellCount();

        // Encode commands to do the computation
        const encoder = device.createCommandEncoder({ label: 'clear grid compute builtin encoder' });
        const pass = encoder.beginComputePass({ label: 'clear grid  compute builtin pass' });

        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(Math.ceil(gridTotalCellCount / WORKGROUP_SIZE));
        pass.end();

        // Finish encoding and submit the commands
        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);
    }
}