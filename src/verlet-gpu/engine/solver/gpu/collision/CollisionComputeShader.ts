import {UpdatePositionBucketBuffer} from "./buffer/UpdatePositionBucketBuffer";
import {UpdatePositionCounterBuffer} from "./buffer/UpdatePositionCounterBuffer";
import {GPUData} from "../GPUInit";
import {SolverSettingsBuffer} from "../../buffer/SolverSettingsBuffer";
import {ClearCollisionComputeShader} from "./ClearCollisionComputeShader";
import {SolveCollisionComputeShader} from "./SolveCollisionComputeShader";
import {ApplyCollisionComputeShader} from "./ApplyCollisionComputeShader";
import {PointsBuffer} from "../../buffer/PointsBuffer";
import {CellCountBuffer} from "../grid/buffer/CellCountBuffer";
import {BucketBuffer} from "../grid/buffer/BucketBuffer";

export class CollisionComputeShader
{
    private pointsBuffer: PointsBuffer;
    private bucketBuffer: UpdatePositionBucketBuffer;
    private counterBuffer: UpdatePositionCounterBuffer;
    private clearCollisionComputeShader: ClearCollisionComputeShader;
    private solveCollisionComputeShader: SolveCollisionComputeShader;
    private applyCollisionComputeShader: ApplyCollisionComputeShader;

    constructor(pointsBuffer: PointsBuffer,
                bucketBuffer: UpdatePositionBucketBuffer,
                counterBuffer: UpdatePositionCounterBuffer,
                clearCollisionComputeShader: ClearCollisionComputeShader,
                solveCollisionComputeShader: SolveCollisionComputeShader,
                applyCollisionComputeShader: ApplyCollisionComputeShader)
    {
        this.pointsBuffer = pointsBuffer;
        this.bucketBuffer = bucketBuffer;
        this.counterBuffer = counterBuffer;
        this.clearCollisionComputeShader = clearCollisionComputeShader;
        this.solveCollisionComputeShader = solveCollisionComputeShader;
        this.applyCollisionComputeShader = applyCollisionComputeShader;
    }

    static async create(gpuData: GPUData,
                        settingsBuffer: SolverSettingsBuffer,
                        pointsBuffer: PointsBuffer,
                        cellCountBuffer: CellCountBuffer,
                        bucketBuffer: BucketBuffer)
    {
        const positionBucketBuffer = new UpdatePositionBucketBuffer(
            gpuData.device, settingsBuffer.settings.maxParticleCount);

        const positionCounterBuffer = new UpdatePositionCounterBuffer(
            gpuData.device, settingsBuffer.settings.maxParticleCount);

        const clearCollisionComputeShader = await ClearCollisionComputeShader.create(
            gpuData, settingsBuffer, positionBucketBuffer, positionCounterBuffer);

        const solveCollisionComputeShader = await SolveCollisionComputeShader.create(
            gpuData, settingsBuffer, pointsBuffer, cellCountBuffer, bucketBuffer, positionBucketBuffer, positionCounterBuffer);

        const applyCollisionComputeShader = await ApplyCollisionComputeShader.create(
            gpuData, settingsBuffer, pointsBuffer, positionBucketBuffer, positionCounterBuffer);

        return new CollisionComputeShader(pointsBuffer, positionBucketBuffer, positionCounterBuffer,
            clearCollisionComputeShader, solveCollisionComputeShader, applyCollisionComputeShader);
    }

    public async submit()
    {
        const pointsCount = this.pointsBuffer.points.count;
        this.clearCollisionComputeShader.submit(pointsCount);
        await this.solveCollisionComputeShader.submit(pointsCount);
        this.applyCollisionComputeShader.submit(pointsCount);
    }
}