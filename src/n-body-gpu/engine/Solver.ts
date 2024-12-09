import {GPUEngine} from "./common/GPUEngine";
import {Particles, ParticlesBuffer} from "./data/Particles";
import {GridBuffer} from "./data/Grid";
import {PrefixSum2dBuffer, PrefixSum2dComputeShader} from "./data/PrefixSum2d";
import {EngineSettingsBuffer} from "./data/EngineSettings";

export interface SolverTimeMeasurement
{
    cpuTime: number;
}

export interface Solver
{
    simulate: () => Promise<void>;
    destroy: () => void;
    timeMeasurement: () => SolverTimeMeasurement;
    getParticleCount: () => number;
}

export class Solvers
{
    public static async create(engine: GPUEngine,
                               particles: Particles,
                               gridBuffer: GridBuffer,
                               prefixSum2dBuffer: PrefixSum2dBuffer,
                               settingsBuffer: EngineSettingsBuffer): Promise<Solver>
    {
        let timeMeasurement: SolverTimeMeasurement = {
            cpuTime: 0,
        }

        const particlesBuffer = new ParticlesBuffer(engine, particles);

        const gridClear = await engine.createComputeShader("gridClear")
            .addBuffer(() => gridBuffer.buffer, "storage")
            .build();

        const gridUpdate = await engine.createComputeShader("gridUpdate")
            .addBuffer(() => particlesBuffer.buffer, "read-only-storage")
            .addBuffer(() => gridBuffer.buffer, "storage")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .build();

        const prefixSum2d = await PrefixSum2dComputeShader.create(engine, prefixSum2dBuffer, settingsBuffer);

        const particleSolve = await engine.createComputeShader("particleSolve")
            .addBuffer(() => particlesBuffer.buffer, "storage")
            .addBuffer(() => gridBuffer.buffer, "read-only-storage")
            .addBuffer(() => prefixSum2dBuffer.buffer, "read-only-storage")
            .addBuffer(() => settingsBuffer.buffer, "uniform")
            .build();

        return {
            simulate: async (): Promise<void> =>
            {
                settingsBuffer.writeBuffer();

                const measurePerformance= settingsBuffer.settings.performance;
                const debug= settingsBuffer.settings.debug;
                const gridSize = settingsBuffer.settings.gridSizeX * settingsBuffer.settings.gridSizeY;
                const particleCount = particles.data.length;

                const start = performance.now();
                gridClear.dispatch(measurePerformance, Math.ceil(gridSize / 256));
                gridUpdate.dispatch(measurePerformance, Math.ceil(particleCount / 256));
                prefixSum2d.dispatch(measurePerformance, gridBuffer, settingsBuffer.settings);
                particleSolve.dispatch(measurePerformance, Math.ceil(particles.data.length / 256));

                if (debug) {
                    await gridBuffer.printGPUData();
                    await prefixSum2d.printGPUData();
                    await particlesBuffer.printGPUData();
                    await settingsBuffer.printGPUData();
                }

                timeMeasurement = {
                    cpuTime: performance.now() - start,
                }
            },
            destroy: () =>
            {
                gridBuffer.destroy();
                prefixSum2dBuffer.destroy();
                particlesBuffer.destroy();
                settingsBuffer.destroy();
            },
            timeMeasurement: () => timeMeasurement,
            getParticleCount: () => particles.data.length,
        };
    }
}