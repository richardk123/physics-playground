import {GPUEngine} from "../common/GPUEngine";
import {Buffer} from "../common/Buffer";
import {EngineSettings} from "./EngineSettings";
import {Color} from "./Color";

const OFFSET = 12;
export class Particles
{
    // position vec2<f32>
    // previousPosition vec2<f32>
    // velocity vec2<f32>
    // density f32
    // material index
    public data: ArrayBuffer;
    public count: number;
    // data has been changed, buffer needs to be written
    public dataChanged: boolean = true;

    private constructor(data: ArrayBuffer,
                        count: number)
    {
        this.data = data;
        this.count = count;
    }

    static create(maxParticleCount: number)
    {
        const arraySize = maxParticleCount * 4 * OFFSET;
        const data = new ArrayBuffer(arraySize);
        return new Particles(data, 0);
    }

    static createFromBuffer(data: ArrayBuffer,
                            count: number)
    {
        return new Particles(data, count);
    }

    public addPoint(x: number, y: number, mass: number, color: Color, materialIndex: number)
    {
        const index = this.count;
        const floatData = new Float32Array(this.data);
        const intData = new Int32Array(this.data);
        // current pos
        floatData[index * OFFSET + 0] = x;
        floatData[index * OFFSET + 1] = y;
        // previous pos
        floatData[index * OFFSET + 2] = x;
        floatData[index * OFFSET + 3] = y;
        // velocity
        floatData[index * OFFSET + 4] = 0;
        floatData[index * OFFSET + 5] = 0;
        // density
        floatData[index * OFFSET + 6] = 0;
        // mass
        floatData[index * OFFSET + 7] = mass;
        // color
        floatData[index * OFFSET + 8] = color.r / 255;
        floatData[index * OFFSET + 9] = color.g / 255;
        floatData[index * OFFSET + 10] = color.b / 255;
        intData[index * OFFSET + 11] = materialIndex;

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
        this.buffer = engine.createBuffer("particles", maxParticleBufferSize, "storage");
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

        const sourceData = await this.getSwapped().buffer.readBuffer(size);
        const data = await this.getCurrent().buffer.readBuffer(size);

        const aggregateParticleData = (floatArray: Float32Array, intArray: Int32Array) => {
            return floatArray.reduce((acc: number[][], curr: number, index: number, array: Float32Array) => {
                if (index % OFFSET === 0) {
                    acc.push([
                        array[index + 0], array[index + 1], array[index + 2],
                        array[index + 3], array[index + 4], array[index + 5],
                        array[index + 6], array[index + 7], array[index + 8],
                        array[index + 9], array[index + 10], intArray[index + 11]]);
                }
                return acc;
            }, []);
        }

        const stringifyParticle = (array: number[], index: number) =>
        {
            if (array.every(v => v !== undefined))
            {
                const posCur = `cur:[${array[0].toFixed(2)}, ${array[1].toFixed(2)}]`;
                const posPrev = `pre:[${array[2].toFixed(2)}, ${array[3].toFixed(2)}]`;
                const vel = `vel:[${array[4].toFixed(2)}, ${array[5].toFixed(2)}]`;
                const density = `density:[${array[6].toFixed(2)}]`;
                const mass = `mass:[${array[7].toFixed(2)}]`;
                const color = `color: [r: ${array[8].toFixed(2)}], g:[${array[9].toFixed(2)}], b:[${array[10].toFixed(2)}]`;
                const materialIndex = `material:[${array[11]}]`;
                return `i: ${index}: { ${posCur}, ${posPrev}, ${vel}, ${density}, ${mass}, ${color}, ${materialIndex}`;
            }
            else
            {
                return "undefined";
            }
        }
        // already swapped
        // console.log(`source pos cur: ${aggregateParticleData(targetPositionCurrentData).map(mapPair).join(", ")}`);

        const dataFloat = new Float32Array(data);
        const dataInt = new Int32Array(data);
        console.log(`particles: \n ${aggregateParticleData(dataFloat, dataInt).map(stringifyParticle).join("\n ")}`);
        const sourceDataFloat = new Float32Array(sourceData);
        const sourceDataInt = new Int32Array(data);
        console.log(`particles swapped: \n ${aggregateParticleData(sourceDataFloat, sourceDataInt).map(stringifyParticle).join("\n ")}`);
    }

    public destroy()
    {
        this.buffer1.buffer.destroy();
        this.buffer2.buffer.destroy();
    }
}