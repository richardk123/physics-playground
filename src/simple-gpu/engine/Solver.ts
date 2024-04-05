import {GPUEngine} from "./common/GPUEngine";
import {EngineSettingsBuffer} from "./data/EngineSettings";
import {ParticlesBuffer} from "./data/Particles";
import {GridBuffer} from "./data/Grid";
import {CollisionBuffer} from "./data/Collision";
import {PrefixSumBuffer, PrefixSumComputeShader} from "./data/PrefixSum";

export interface Solver
{
    simulate: () => Promise<void>;
    particlesBuffer: ParticlesBuffer;
    settingsBuffer: EngineSettingsBuffer;
    gridBuffer: GridBuffer;
    collisionBuffer: CollisionBuffer;
}

export class Solvers
{
    public static async create(engine: GPUEngine,
                               particlesBuffer: ParticlesBuffer,
                               settingsBuffer: EngineSettingsBuffer,
                               gridBuffer: GridBuffer,
                               prefixSumBuffer: PrefixSumBuffer,
                               collisionBuffer: CollisionBuffer): Promise<Solver>
    {
        const preSolve = await engine.createComputeShader("preSolve")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => particlesBuffer.getCurrent().positionCurrentBuffer, "storage")
            .addBuffer(() => particlesBuffer.getCurrent().positionPreviousBuffer, "storage")
            .addBuffer(() => particlesBuffer.getCurrent().velocityBuffer, "storage")
            .build();

        const gridClear = await engine.createComputeShader("gridClear")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => gridBuffer.cellParticleCountBuffer, "storage")
            .build();

        const gridUpdate = await engine.createComputeShader("gridUpdate")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => gridBuffer.cellParticleCountBuffer, "storage")
            .addBuffer(() => gridBuffer.particleCellOffsetBuffer, "storage")
            .addBuffer(() => particlesBuffer.getCurrent().positionCurrentBuffer, "read-only-storage")
            .build();

        const prefixSum = await PrefixSumComputeShader.create(engine, prefixSumBuffer);

        const particleSort = await engine.createComputeShader("particleSort")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => particlesBuffer.getCurrent().positionCurrentBuffer, "read-only-storage")
            .addBuffer(() => particlesBuffer.getCurrent().positionPreviousBuffer, "read-only-storage")
            .addBuffer(() => particlesBuffer.getCurrent().velocityBuffer, "read-only-storage")
            .addBuffer(() => particlesBuffer.getSwapped().positionCurrentBuffer, "storage")
            .addBuffer(() => particlesBuffer.getSwapped().positionPreviousBuffer, "storage")
            .addBuffer(() => particlesBuffer.getSwapped().velocityBuffer, "storage")
            .addBuffer(() => prefixSumBuffer.getCurrent(), "read-only-storage")
            .addBuffer(() => gridBuffer.particleCellOffsetBuffer, "read-only-storage")
            .build();

        const collisionClear = await engine.createComputeShader("collisionClear")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => collisionBuffer.particleCollisionCountBuffer, "storage")
            .addBuffer(() => collisionBuffer.particleCollisionVelocitiesBuffer, "storage")
            .build();

        const collisionSolve = await engine.createComputeShader("collisionSolve")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => particlesBuffer.getCurrent().positionCurrentBuffer, "storage")
            .addBuffer(() => prefixSumBuffer.getCurrent(), "read-only-storage")
            .addBuffer(() => collisionBuffer.particleCollisionCountBuffer, "storage")
            .addBuffer(() => collisionBuffer.particleCollisionVelocitiesBuffer, "storage")
            .build();

        const collisionApply = await engine.createComputeShader("collisionApply")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => particlesBuffer.getCurrent().positionCurrentBuffer, "storage")
            .addBuffer(() => collisionBuffer.particleCollisionCountBuffer, "read-only-storage")
            .addBuffer(() => collisionBuffer.particleCollisionVelocitiesBuffer, "read-only-storage")
            .build();

        const postSolve = await engine.createComputeShader("postSolve")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .addBuffer(() => particlesBuffer.getCurrent().positionCurrentBuffer, "read-only-storage")
            .addBuffer(() => particlesBuffer.getCurrent().positionPreviousBuffer, "read-only-storage")
            .addBuffer(() => particlesBuffer.getCurrent().velocityBuffer, "storage")
            .build();

        return {
            simulate: async (): Promise<void> =>
            {
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

                    await prefixSum.dispatch(gridBuffer);

                    particleSort.dispatch(Math.ceil(particleCount / 256));
                    particlesBuffer.swapBuffers();

                    // collisionClear.dispatch(Math.ceil(particleCount / 256));
                    collisionSolve.dispatch(Math.ceil(particleCount / 256));
                    // collisionApply.dispatch(Math.ceil(particleCount / 256));

                    postSolve.dispatch(Math.ceil(particleCount / 256));

                    if (settingsBuffer.settings.debug)
                    {
                        await particlesBuffer.loadFromGpu();
                        await settingsBuffer.loadFromGpu();
                        console.log(settingsBuffer.gpuData);
                        await gridBuffer.loadFromGpu();
                        // await prefixSum.printGPUData();
                        await particlesBuffer.printParticlesFromGpu();
                        await collisionBuffer.loadFromGpu();
                    }
                }
            },
            particlesBuffer: particlesBuffer,
            collisionBuffer: collisionBuffer,
            settingsBuffer: settingsBuffer,
            gridBuffer: gridBuffer,
        };
    }
}