import {GPUEngine} from "../common/GPUEngine";
import {Buffer} from "../common/Buffer";
import {EngineSettings} from "./EngineSettings";
import {Color} from "./Color";

const OFFSET = 12;
export class Particles
{
    public data: Float32Array;
    public count: number;
    // data has been changed, buffer needs to be written
    public dataChanged: boolean = true;

    private constructor(data: ArrayBuffer,
                        count: number)
    {
        this.data = new Float32Array(data);
        this.count = count;
    }

    static create(maxParticleCount: number)
    {
        // position vec2<f32>
        // previousPosition vec2<f32>
        // velocity vec2<f32>
        // density f32
        const arraySize = maxParticleCount * 4 * OFFSET;
        const data = new ArrayBuffer(arraySize);
        return new Particles(data, 0);
    }

    static createFromBuffer(data: ArrayBuffer,
                            count: number)
    {
        return new Particles(data, count);
    }

    public addPoint(x: number, y: number, mass: number, color: Color)
    {
        const index = this.count;
        // current pos
        this.data[index * OFFSET + 0] = x;
        this.data[index * OFFSET + 1] = y;
        // previous pos
        this.data[index * OFFSET + 2] = x;
        this.data[index * OFFSET + 3] = y;
        // velocity
        this.data[index * OFFSET + 4] = 0;
        this.data[index * OFFSET + 5] = 0;
        // density
        this.data[index * OFFSET + 6] = 0;
        // mass
        this.data[index * OFFSET + 7] = mass;
        // color
        this.data[index * OFFSET + 8] = color.r / 255;
        this.data[index * OFFSET + 9] = color.g / 255;
        this.data[index * OFFSET + 10] = color.b / 255;

        this.count += 1;
        this.dataChanged = true;
        return index;
    }
}

class ParticleBufferHolder
{
    public buffer: Buffer;
    constructor(engine: GPUEngine,
                settings: EngineSettings)
    {
        const maxParticleBufferSize = settings.maxParticleCount * 4 * OFFSET;
        this.buffer = engine.createBuffer("current-position", maxParticleBufferSize, "storage");
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

        this.buffer1 = new ParticleBufferHolder(engine, settings);
        this.buffer2 = new ParticleBufferHolder(engine, settings);
        this.gpuParticles = Particles.create(0);
    }

    public write()
    {
        if (this.particles.dataChanged)
        {
            this.getCurrent().buffer.writeBuffer(this.particles.data);
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
        const data = await this.getCurrent().buffer.readBuffer();
        const particleCount = this.particles.count;
        this.gpuParticles = Particles.createFromBuffer(data, particleCount);
    }

    public async printParticlesFromGpu()
    {
        const size = this.particles.count * 4 * OFFSET;

        const sourceData = new Float32Array(await this.getSwapped().buffer.readBuffer(size));
        const data = new Float32Array(await this.getCurrent().buffer.readBuffer(size));

        const aggregateParticleData = (array: Float32Array) => {
            return array.reduce((acc: number[][], curr: number, index: number, array: Float32Array) => {
                if (index % OFFSET === 0) {
                    acc.push([array[index + 0], array[index + 1], array[index + 2], array[index + 3], array[index + 4], array[index + 5], array[index + 6], array[index + 7], array[index + 8], array[index + 9], array[index + 10]]);
                }
                return acc;
            }, []);
        }

        const mapPair = (array: number[], index: number) =>
        {
            if (array.every(v => v !== undefined))
            {
                return `i: ${index}: { cur:[${array[0].toFixed(2)}, ${array[1].toFixed(2)}], pre:[${array[2].toFixed(2)}, ${array[3].toFixed(2)}], vel:[${array[4].toFixed(2)}, ${array[5].toFixed(2)}], density:[${array[6].toFixed(2)}], mass:[${array[7].toFixed(2)}], r:[${array[8].toFixed(2)}], g:[${array[9].toFixed(2)}], b:[${array[10].toFixed(2)}] }`;
            }
            else
            {
                return "undefined";
            }
        }
        // already swapped
        // console.log(`source pos cur: ${aggregateParticleData(targetPositionCurrentData).map(mapPair).join(", ")}`);

        console.log(`particles: \n ${aggregateParticleData(data).map(mapPair).join("\n ")}`);
        console.log(`particles swapped: \n ${aggregateParticleData(sourceData).map(mapPair).join("\n ")}`);
    }

    public destroy()
    {
        this.buffer1.buffer.destroy();
        this.buffer2.buffer.destroy();
    }
}