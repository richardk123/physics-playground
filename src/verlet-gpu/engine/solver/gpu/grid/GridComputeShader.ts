import {ClearGridComputeShader} from "./ClearGridComputeShader";
import {CellCountBuffer} from "./buffer/CellCountBuffer";
import {GPUData} from "../GPUInit";
import {SolverSettingsBuffer} from "../../buffer/SolverSettingsBuffer";
import {UpdateGridComputeShader} from "./UpdateGridComputeShader";
import {BucketBuffer} from "./buffer/BucketBuffer";
import {PointsBuffer} from "../../buffer/PointsBuffer";

export class GridComputeShader
{
    public clearGrid: ClearGridComputeShader;
    public updateGrid: UpdateGridComputeShader;

    public cellsCountBuffer: CellCountBuffer;
    public bucketBuffer: BucketBuffer;

    private constructor(clearGrid: ClearGridComputeShader,
                        updateGrid: UpdateGridComputeShader,
                        cellsCountBuffer: CellCountBuffer,
                        bucketBuffer: BucketBuffer)
    {
        this.clearGrid = clearGrid;
        this.updateGrid = updateGrid;
        this.cellsCountBuffer = cellsCountBuffer;
        this.bucketBuffer = bucketBuffer;
    }

    static async create(gpuData: GPUData,
                        settingsBuffer: SolverSettingsBuffer,
                        pointsBuffer: PointsBuffer)
    {
        const cellsCountBuffer = new CellCountBuffer(gpuData.device, settingsBuffer.getTotalGridCellCount());
        const bucketBuffer = new BucketBuffer(gpuData.device, settingsBuffer.getTotalGridCellCount());

        const clearGrid = await ClearGridComputeShader.create(gpuData, settingsBuffer,
            bucketBuffer, cellsCountBuffer);

        const updateGrid = await UpdateGridComputeShader.create(gpuData, cellsCountBuffer,
            bucketBuffer, pointsBuffer, settingsBuffer);

        return new GridComputeShader(clearGrid, updateGrid, cellsCountBuffer, bucketBuffer);
    }

    public async submit()
    {
        this.clearGrid.submit();
        await this.updateGrid.submit();
    }
}