import {GPUEngine} from "./common/GPUEngine";
import {EngineSettingsBuffer} from "./data/EngineSettings";
import {ParticlesBuffer} from "./data/Particles";
import {GridBuffer} from "./data/Grid";

export interface Solver
{
    simulate: () => Promise<void>;
    particlesBuffer: ParticlesBuffer;
    settingsBuffer: EngineSettingsBuffer;
    gridBuffer: GridBuffer;
}

export class Solvers
{
    public static async create(engine: GPUEngine,
                               particlesBuffer: ParticlesBuffer,
                               settingsBuffer: EngineSettingsBuffer,
                               gridBuffer: GridBuffer): Promise<Solver>
    {
        const preSolve = await engine.createComputeShader("preSolve")
            .addBuffer(settingsBuffer.buffer, "uniform")
            .addBuffer(particlesBuffer.positionCurrentBuffer, "storage")
            .addBuffer(particlesBuffer.positionPreviousBuffer, "storage")
            .addBuffer(particlesBuffer.velocityBuffer, "storage")
            .build();

        const postSolve = await engine.createComputeShader("postSolve")
            .addBuffer(settingsBuffer.buffer, "uniform")
            .addBuffer(particlesBuffer.positionCurrentBuffer, "read-only-storage")
            .addBuffer(particlesBuffer.positionPreviousBuffer, "read-only-storage")
            .addBuffer(particlesBuffer.velocityBuffer, "storage")
            .build();

        const gridClear = await engine.createComputeShader("gridClear")
            .addBuffer(settingsBuffer.buffer, "uniform")
            .addBuffer(gridBuffer.cellParticleCountBuffer, "storage")
            .addBuffer(gridBuffer.cellParticleIndexesBuffer, "storage")
            .build();

        const gridUpdate = await engine.createComputeShader("gridUpdate")
            .addBuffer(settingsBuffer.buffer, "uniform")
            .addBuffer(gridBuffer.cellParticleCountBuffer, "storage")
            .addBuffer(gridBuffer.cellParticleIndexesBuffer, "storage")
            .addBuffer(particlesBuffer.positionCurrentBuffer, "read-only-storage")
            .build();

        return {
            simulate: async (): Promise<void> =>
            {
                settingsBuffer.write();
                particlesBuffer.write();

                const particleCount = particlesBuffer.particles.count;

                preSolve.dispatch(Math.ceil(particleCount / 256));
                postSolve.dispatch(Math.ceil(particleCount / 256));
                gridClear.dispatch(Math.ceil(gridBuffer.getNumberOfCells() / 256));
                gridUpdate.dispatch(Math.ceil(particleCount / 256));

                await particlesBuffer.loadFromGpu();
                await settingsBuffer.loadFromGpu();
                await gridBuffer.loadFromGpu();
            },
            particlesBuffer: particlesBuffer,
            settingsBuffer: settingsBuffer,
            gridBuffer: gridBuffer,
        };
    }
}