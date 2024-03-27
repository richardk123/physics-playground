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

    private constructor(positionCurrent: ArrayBuffer,
                        positionPrevious: ArrayBuffer,
                        velocity: ArrayBuffer,
                        count: number)
    {
        this.positionCurrent = new Float32Array(positionCurrent);
        this.positionPrevious = new Float32Array(positionPrevious);
        this.velocity = new Float32Array(velocity);

        this.count = count;
    }

    static create(maxParticleCount: number)
    {
        const positionCurrent = new ArrayBuffer(maxParticleCount * 4 * 2);
        const positionPrevious = new ArrayBuffer(maxParticleCount * 4 * 2);
        const velocity = new ArrayBuffer(maxParticleCount * 4 * 2);
        return new Particles(positionCurrent, positionPrevious, velocity, 0);
    }

    static createFromBuffer(positionCurrent: ArrayBuffer,
                            positionPrevious: ArrayBuffer,
                            velocity: ArrayBuffer,
                            count: number)
    {
        return new Particles(positionCurrent, positionPrevious, velocity, count);
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
    public gpuParticles: Particles;
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
        this.gpuParticles = Particles.create(0);
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

    public async loadFromGpu()
    {
        const positionCurrentData = await this.positionCurrentBuffer.readBuffer();
        const positionPreviousData = await this.positionPreviousBuffer.readBuffer();
        const velocityData = await this.velocityBuffer.readBuffer();

        const particleCount = this.particles.count;
        this.gpuParticles = Particles.createFromBuffer(positionCurrentData, positionPreviousData, velocityData, particleCount);
    }
}