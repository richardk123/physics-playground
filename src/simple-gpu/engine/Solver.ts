import {GPUEngine} from "./common/GPUEngine";
import {EngineSettingsBuffer} from "./data/EngineSettings";
import {ParticlesBuffer} from "./data/Particles";
import {GridBuffer} from "./data/Grid";
import {PrefixSumBuffer, PrefixSumComputeShader} from "./data/PrefixSum";
import {PositionChangeBuffer} from "./data/PositionChange";

export interface Solver
{
    simulate: () => Promise<void>;
    particlesBuffer: ParticlesBuffer;
    settingsBuffer: EngineSettingsBuffer;
    gridBuffer: GridBuffer;
    prefixSumBuffer: () => PrefixSumBuffer;
    msPerFrame: () => number;
}

export class Solvers
{
    public static async create(engine: GPUEngine,
                               particlesBuffer: ParticlesBuffer,
                               settingsBuffer: EngineSettingsBuffer,
                               gridBuffer: GridBuffer,
                               prefixSumBuffer: PrefixSumBuffer,
                               positionChangeBuffer: PositionChangeBuffer): Promise<Solver>
    {
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
            .build();

        const densitySolve = await engine.createComputeShader("densitySolve")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => particlesBuffer.getCurrent().buffer, "read-only-storage")
            .addBuffer(() => prefixSumBuffer.getCurrent(), "read-only-storage")
            .addBuffer(() => gridBuffer.cellParticleCountBuffer, "read-only-storage")
            .addBuffer(() => positionChangeBuffer.buffer, "storage")
            .build();

        const boundingBox = await engine.createComputeShader("boundingBox")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => particlesBuffer.getCurrent().buffer, "storage")
            .build();

        const postSolve = await engine.createComputeShader("postSolve")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => particlesBuffer.getCurrent().buffer, "storage")
            .build();

        let msPerFrame = 0;

        return {
            simulate: async (): Promise<void> =>
            {
                const start = performance.now();

                settingsBuffer.write();
                particlesBuffer.write();

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

                    // collisionSolve.dispatch(Math.ceil(particleCount / 256));
                    // positionChangeApply.dispatch(Math.ceil(particleCount / 256));

                    densityCompute.dispatch(Math.ceil(particleCount / 256));
                    densitySolve.dispatch(Math.ceil(particleCount / 256));
                    positionChangeApply.dispatch(Math.ceil(particleCount / 256));

                    postSolve.dispatch(Math.ceil(particleCount / 256));

                    if (settingsBuffer.settings.debug)
                    {
                        await particlesBuffer.loadFromGpu();
                        await settingsBuffer.loadFromGpu();
                        await gridBuffer.loadFromGpu();
                        // await prefixSum.printGPUData();
                        // await particlesBuffer.printParticlesFromGpu();
                        console.log(settingsBuffer.gpuData);
                    }
                }
                msPerFrame = performance.now() - start;
            },
            particlesBuffer: particlesBuffer,
            settingsBuffer: settingsBuffer,
            gridBuffer: gridBuffer,
            prefixSumBuffer: () => prefixSum.buffer,
            msPerFrame: () => msPerFrame,
        };
    }
}