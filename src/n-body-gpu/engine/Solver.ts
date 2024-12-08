import {GPUEngine} from "./common/GPUEngine";
import {Particles, ParticlesBuffer} from "./data/Particles";
import {GridBuffer} from "./data/Grid";
import {PrefixSumBuffer, PrefixSumComputeShader} from "./data/PrefixSum";

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
    public static async create(engine: GPUEngine, particles: Particles, gridBuffer: GridBuffer): Promise<Solver>
    {
        let timeMeasurement: SolverTimeMeasurement = {
            cpuTime: 0,
        }

        const particlesBuffer = new ParticlesBuffer(engine, particles);
        const prefixSumBuffer = new PrefixSumBuffer(engine);

        const gridClear = await engine.createComputeShader("gridClear")
            .addBuffer(() => gridBuffer.buffer, "storage")
            .build();

        const gridUpdate = await engine.createComputeShader("gridUpdate")
            .addBuffer(() => particlesBuffer.buffer, "read-only-storage")
            .addBuffer(() => gridBuffer.buffer, "storage")
            .build();

        const prefixSum = await PrefixSumComputeShader.create(engine, prefixSumBuffer);

        const particleSolve = await engine.createComputeShader("particleSolve")
            .addBuffer(() => particlesBuffer.buffer, "storage")
            .addBuffer(() => gridBuffer.buffer, "read-only-storage")
            .addBuffer(() => prefixSumBuffer.getCurrent(), "read-only-storage")
            .build();


        return {
            simulate: async (): Promise<void> =>
            {
                const start = performance.now();
                gridClear.dispatch(false, Math.ceil(GridBuffer.GRID_SIZE * GridBuffer.GRID_SIZE / 256));
                gridUpdate.dispatch(false, Math.ceil(GridBuffer.GRID_SIZE * GridBuffer.GRID_SIZE / 256));
                particleSolve.dispatch(false, Math.ceil(particles.data.length / 256));
                prefixSum.dispatch(gridBuffer);
                timeMeasurement = {
                    cpuTime: performance.now() - start,
                }
            },
            destroy: () =>
            {
                particlesBuffer.destroy();
            },
            timeMeasurement: () => timeMeasurement,
            getParticleCount: () => particles.data.length,
        };
    }
}