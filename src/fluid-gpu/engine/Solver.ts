import {GPUEngine} from "./common/GPUEngine";
import {EngineSettingsBuffer} from "./data/EngineSettings";
import {ParticlesBuffer} from "./data/Particles";
import {GridBuffer} from "./data/Grid";
import {PrefixSumBuffer, PrefixSumComputeShader} from "./data/PrefixSum";
import {PositionChangeBuffer} from "./data/PositionChange";
import {MaterialsBuffer} from "./data/Material";

export interface SolverTimeMeasurement
{
    cpuTime: number;
    preSolve: number;
    gridClear: number;
    gridUpdate: number;
    prefixSum: number;
    particleSort: number;
    collisionSolve: number;
    positionChangeApply: number;
    densityCompute: number;
    densitySolve: number;
    boundingBox: number;
    postSolve: number;
}

export interface Solver
{
    simulate: () => Promise<void>;
    destroy: () => void;
    particlesBuffer: ParticlesBuffer;
    materialsBuffer: MaterialsBuffer;
    settingsBuffer: EngineSettingsBuffer;
    gridBuffer: GridBuffer;
    prefixSumBuffer: () => PrefixSumBuffer;
    timeMeasurement: () => SolverTimeMeasurement;
}

export class Solvers
{
    public static async create(engine: GPUEngine,
                               particlesBuffer: ParticlesBuffer,
                               materialsBuffer: MaterialsBuffer,
                               settingsBuffer: EngineSettingsBuffer,
                               gridBuffer: GridBuffer,
                               prefixSumBuffer: PrefixSumBuffer,
                               positionChangeBuffer: PositionChangeBuffer): Promise<Solver>
    {
        let timeMeasurement: SolverTimeMeasurement = {
            cpuTime: 0,
            preSolve: 0,
            gridClear: 0,
            gridUpdate: 0,
            prefixSum: 0,
            particleSort: 0,
            collisionSolve: 0,
            positionChangeApply: 0,
            densityCompute: 0,
            densitySolve: 0,
            boundingBox: 0,
            postSolve: 0,
        }

        const preSolve = await engine.createComputeShader("preSolve")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => particlesBuffer.getCurrent().buffer, "storage")
            .build();

        const gridClear = await engine.createComputeShader("gridClear")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => gridBuffer.cellParticleCountBuffer, "storage")
            .build();

        const gridUpdate = await engine.createComputeShader("gridUpdate")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => gridBuffer.cellParticleCountBuffer, "storage")
            .addBuffer(() => gridBuffer.particleCellOffsetBuffer, "storage")
            .addBuffer(() => particlesBuffer.getCurrent().buffer, "read-only-storage")
            .build();

        const prefixSum = await PrefixSumComputeShader.create(engine, prefixSumBuffer);

        const particleSort = await engine.createComputeShader("particleSort")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => particlesBuffer.getCurrent().buffer, "read-only-storage")
            .addBuffer(() => particlesBuffer.getSwapped().buffer, "storage")
            .addBuffer(() => prefixSumBuffer.getCurrent(), "read-only-storage")
            .addBuffer(() => gridBuffer.particleCellOffsetBuffer, "read-only-storage")
            .build();

        const collisionSolve = await engine.createComputeShader("collisionSolve")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => particlesBuffer.getCurrent().buffer, "storage")
            .addBuffer(() => prefixSumBuffer.getCurrent(), "read-only-storage")
            .addBuffer(() => gridBuffer.cellParticleCountBuffer, "read-only-storage")
            .addBuffer(() => positionChangeBuffer.buffer, "storage")
            .build();

        const positionChangeApply = await engine.createComputeShader("positionChangeApply")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => positionChangeBuffer.buffer, "read-only-storage")
            .addBuffer(() => particlesBuffer.getCurrent().buffer, "storage")
            .build();

        const densityCompute = await engine.createComputeShader("densityCompute")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => particlesBuffer.getCurrent().buffer, "storage")
            .addBuffer(() => prefixSumBuffer.getCurrent(), "read-only-storage")
            .addBuffer(() => gridBuffer.cellParticleCountBuffer, "read-only-storage")
            .addBuffer(() => materialsBuffer.buffer, "read-only-storage")
            .build();

        const densitySolve = await engine.createComputeShader("densitySolve")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => particlesBuffer.getCurrent().buffer, "read-only-storage")
            .addBuffer(() => prefixSumBuffer.getCurrent(), "read-only-storage")
            .addBuffer(() => gridBuffer.cellParticleCountBuffer, "read-only-storage")
            .addBuffer(() => positionChangeBuffer.buffer, "storage")
            .addBuffer(() => materialsBuffer.buffer, "read-only-storage")
            .build();

        const boundingBox = await engine.createComputeShader("boundingBox")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => particlesBuffer.getCurrent().buffer, "storage")
            .build();

        const postSolve = await engine.createComputeShader("postSolve")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => particlesBuffer.getCurrent().buffer, "storage")
            .build();

        return {
            simulate: async (): Promise<void> =>
            {
                const start = performance.now();

                settingsBuffer.write();
                particlesBuffer.write();
                materialsBuffer.write();

                const subStepCount = settingsBuffer.settings.subStepCount;
                const particleCount = particlesBuffer.particles.count;
                const numberOfCells = settingsBuffer.settings.gridSizeX * settingsBuffer.settings.gridSizeY;

                for (let i = 0; i < subStepCount; i++)
                {
                    preSolve.dispatch(Math.ceil(particleCount / 256));

                    gridClear.dispatch(Math.ceil(numberOfCells / 256));
                    gridUpdate.dispatch(Math.ceil(particleCount / 256));

                    prefixSum.dispatch(gridBuffer);

                    particleSort.dispatch(Math.ceil(particleCount / 256));
                    particlesBuffer.swapBuffers();

                    boundingBox.dispatch(Math.ceil(particleCount / 256));

                    if (engine.settings.solveCollisions)
                    {
                        collisionSolve.dispatch(Math.ceil(particleCount / 256));
                    }

                    if (engine.settings.solveDensity)
                    {
                        densityCompute.dispatch(Math.ceil(particleCount / 256));
                        densitySolve.dispatch(Math.ceil(particleCount / 256));
                    }

                    positionChangeApply.dispatch(Math.ceil(particleCount / 256));

                    postSolve.dispatch(Math.ceil(particleCount / 256));

                    if (settingsBuffer.settings.debug)
                    {
                        // await particlesBuffer.loadFromGpu();
                        await settingsBuffer.loadFromGpu();
                        await gridBuffer.loadFromGpu();
                        await materialsBuffer.loadFromGpu();

                        // await prefixSum.printGPUData();
                        // console.log(settingsBuffer.gpuData);
                        await particlesBuffer.printParticlesFromGpu();
                        await materialsBuffer.printMaterialsFromGpu();
                    }
                }
                timeMeasurement = {
                    cpuTime: performance.now() - start,
                    preSolve: preSolve.gpuTime() * subStepCount / 1000,
                    gridClear: gridClear.gpuTime() * subStepCount / 1000,
                    gridUpdate: gridUpdate.gpuTime() * subStepCount / 1000,
                    prefixSum: prefixSum.gpuTime() * subStepCount / 1000,
                    particleSort: particleSort.gpuTime() * subStepCount / 1000,
                    collisionSolve: collisionSolve.gpuTime() * subStepCount / 1000,
                    boundingBox: boundingBox.gpuTime() * subStepCount / 1000,
                    densityCompute: densityCompute.gpuTime() * subStepCount / 1000,
                    densitySolve: densitySolve.gpuTime() * subStepCount / 1000,
                    positionChangeApply: positionChangeApply.gpuTime() * subStepCount / 1000,
                    postSolve: postSolve.gpuTime() * subStepCount / 1000,
                }
            },
            destroy: () =>
            {
                particlesBuffer.destroy();
                materialsBuffer.destroy();
                settingsBuffer.destroy();
                gridBuffer.destroy();
                prefixSumBuffer.destroy();
                positionChangeBuffer.destroy();
            },
            particlesBuffer: particlesBuffer,
            materialsBuffer: materialsBuffer,
            settingsBuffer: settingsBuffer,
            gridBuffer: gridBuffer,
            prefixSumBuffer: () => prefixSum.buffer,
            timeMeasurement: () => timeMeasurement,
        };
    }
}