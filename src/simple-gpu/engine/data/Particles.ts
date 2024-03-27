import {GPUEngine} from "../common/GPUEngine";
import {Buffer} from "../common/Buffer";
import {EngineSettings} from "./EngineSettings";

export class Particles
{
    public positionCurrent: Float32Array;
    public positionPrevious: Float32Array;
    public velocity: Float32Array;
    public count: number;
    // data has been changed, buffer needs to be written
    public dataChanged: boolean = true;

    constructor(maxParticleCount: number)
    {
        this.positionCurrent = new Float32Array(maxParticleCount * 2);
        this.positionCurrent.fill(0);
        this.positionPrevious = new Float32Array(maxParticleCount * 2);
        this.positionPrevious.fill(0)
        this.velocity = new Float32Array(maxParticleCount * 2);
        this.velocity.fill(0);
        this.count = 0;
    }

    public addPoint(x: number, y: number)
    {
        const index = this.count;

        this.positionCurrent[index * 2 + 0] = x;
        this.positionCurrent[index * 2 + 1] = y;

        this.count += 1;
        this.dataChanged = true;
        return index;
    }
}

export class ParticlesBuffer
{
    public particles: Particles;
    public positionCurrentBuffer: Buffer;
    public positionPreviousBuffer: Buffer;
    public velocityBuffer: Buffer;

    constructor(engine: GPUEngine,
                settings: EngineSettings,
                particles: Particles)
    {
        this.particles = particles;

        const maxParticleBufferSize = settings.maxParticleCount * 4 * 2;

        this.positionCurrentBuffer = engine.createBuffer("current-position", maxParticleBufferSize, "storage");
        this.positionPreviousBuffer = engine.createBuffer("previous-position", maxParticleBufferSize, "storage");
        this.velocityBuffer = engine.createBuffer("velocity", maxParticleBufferSize, "storage");
    }

    public write()
    {
        if (this.particles.dataChanged)
        {
            const particleBufferSize = this.particles.count * 4 * 2;
            this.positionCurrentBuffer.writeBuffer(this.particles.positionCurrent, 0, 0, particleBufferSize);
            this.positionPreviousBuffer.writeBuffer(this.particles.positionPrevious, 0, 0, particleBufferSize);
            this.velocityBuffer.writeBuffer(this.particles.velocity, 0, 0, particleBufferSize);
            this.particles.dataChanged = false;
        }
    }
}