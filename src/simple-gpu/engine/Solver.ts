import {GPUEngine} from "./common/GPUEngine";
import {EngineSettings, EngineSettingsBuffer} from "./data/EngineSettings";
import {Particles, ParticlesBuffer} from "./data/Particles";
import {ComputeShader} from "./common/ComputeShader";

export class Solver
{

    // buffers
    public particlesBuffer: ParticlesBuffer;
    public settingsBuffer: EngineSettingsBuffer;

    // compute shaders
    private preSolve: ComputeShader;
    private postSolve: ComputeShader;

    private constructor(particlesBuffer: ParticlesBuffer,
                        settingsBuffer: EngineSettingsBuffer,
                        preSolve: ComputeShader,
                        postSolve: ComputeShader)
    {
        this.particlesBuffer = particlesBuffer;
        this.settingsBuffer = settingsBuffer;
        this.preSolve = preSolve;
        this.postSolve = postSolve;
    }

    public static async create(engine: GPUEngine,
                               particlesBuffer: ParticlesBuffer,
                               settingsBuffer: EngineSettingsBuffer)
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

        return new Solver(particlesBuffer, settingsBuffer, preSolve, postSolve);
    }

    public async simulate()
    {
        this.settingsBuffer.write();
        this.particlesBuffer.write();

        const particleCount = this.particlesBuffer.particles.count;
        this.preSolve.dispatch(Math.ceil(particleCount / 256));
        this.postSolve.dispatch(Math.ceil(particleCount / 256));
    }
}