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

class ParticleBufferHolder
{
    public positionCurrentBuffer: Buffer;
    public positionPreviousBuffer: Buffer;
    public velocityBuffer: Buffer;

    constructor(engine: GPUEngine,
                settings: EngineSettings,
                particles: Particles)
    {
        const maxParticleBufferSize = settings.maxParticleCount * 4 * 2;
        this.positionCurrentBuffer = engine.createBuffer("current-position", maxParticleBufferSize, "storage");
        this.positionPreviousBuffer = engine.createBuffer("previous-position", maxParticleBufferSize, "storage");
        this.velocityBuffer = engine.createBuffer("velocity", maxParticleBufferSize, "storage");
    }

}

export class ParticlesBuffer
{
    public particles: Particles;
    public gpuParticles: Particles;
    private buffer1: ParticleBufferHolder;
    private buffer2: ParticleBufferHolder;
    private swap: boolean;


    constructor(engine: GPUEngine,
                settings: EngineSettings,
                particles: Particles)
    {
        this.swap = false;
        this.particles = particles;

        this.buffer1 = new ParticleBufferHolder(engine, settings, particles);
        this.buffer2 = new ParticleBufferHolder(engine, settings, particles);
        this.gpuParticles = Particles.create(0);
    }

    public write()
    {
        if (this.particles.dataChanged)
        {
            this.getCurrent().positionCurrentBuffer.writeBuffer(this.particles.positionCurrent);
            this.getCurrent().positionPreviousBuffer.writeBuffer(this.particles.positionPrevious);
            this.getCurrent().velocityBuffer.writeBuffer(this.particles.velocity);
            this.particles.dataChanged = false;
        }
    }

    public swapBuffers()
    {
        this.swap = !this.swap;
    }

    public getCurrent()
    {
        if (this.swap)
        {
            return this.buffer2;
        }
        return this.buffer1;
    }

    public getSwapped()
    {
        if (this.swap)
        {
            return this.buffer1;
        }
        return this.buffer2;
    }

    public async loadFromGpu()
    {
        const positionCurrentData = await this.getCurrent().positionCurrentBuffer.readBuffer();
        const positionPreviousData = await this.getCurrent().positionPreviousBuffer.readBuffer();
        const velocityData = await this.getCurrent().velocityBuffer.readBuffer();

        const particleCount = this.particles.count;
        this.gpuParticles = Particles.createFromBuffer(positionCurrentData, positionPreviousData, velocityData, particleCount);
    }

    public async printParticlesFromGpu()
    {
        const particleSize = this.particles.count * 4 * 2;

        const sourcePositionCurrentData = new Float32Array(await this.getCurrent().positionCurrentBuffer.readBuffer(particleSize));
        const sourcePositionPreviousData = new Float32Array(await this.getCurrent().positionPreviousBuffer.readBuffer(particleSize));
        const sourceVelocityData = new Float32Array(await this.getCurrent().velocityBuffer.readBuffer(particleSize));

        const targetPositionCurrentData = new Float32Array(await this.getSwapped().positionCurrentBuffer.readBuffer(particleSize));
        const targetPositionPreviousData = new Float32Array(await this.getSwapped().positionPreviousBuffer.readBuffer(particleSize));
        const targetVelocityData = new Float32Array(await this.getSwapped().velocityBuffer.readBuffer(particleSize));

        const toPairs = (array: Float32Array) =>
        {
            return array.reduce((acc: number[][], curr: number, index: number, array: Float32Array) =>
            {
                if (index % 2 === 0)
                {
                    acc.push([curr, array[index + 1]]);
                }
                return acc;
            }, []);
        }

        const mapPair = (array: number[]) =>
        {
            return `[${array[0].toFixed(1)}, ${array[1].toFixed(1)}]`;
        }
        // already swapped
        // console.log(`source pos cur: ${toPairs(targetPositionCurrentData).map(mapPair).join(", ")}`);

        console.log(`pos cur: ${toPairs(targetPositionCurrentData).map(mapPair).join(", ")}`);
    }
}