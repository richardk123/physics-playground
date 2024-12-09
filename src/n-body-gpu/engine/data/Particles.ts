import {GPUEngine} from "../common/GPUEngine";
import {EngineBuffer} from "../common/EngineBuffer";

export type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
}

const OFFSET = 4;

export class Particles {
    public data: Particle[];

    constructor()
    {
        this.data = [];
    }

    public addParticle(x: number, y: number, vx?: number, vy?: number) {
        this.data.push({x, y, vx: vx ?? 0, vy: vy ?? 0});
    }

    public serialize()
    {
        const data = new Float32Array(this.data.length * OFFSET);
        this.data.forEach((particle, i) =>
        {
            data[i * OFFSET] = particle.x;
            data[i * OFFSET + 1] = particle.y;
            data[i * OFFSET + 2] = particle.vx;
            data[i * OFFSET + 3] = particle.vy;
        });
        return data;
    }
}

export class ParticlesBuffer {
    public buffer: EngineBuffer;
    private readonly particles: Particles;

    constructor(engine: GPUEngine, particles: Particles)
    {
        this.particles = particles;
        this.buffer = engine.createBuffer("particles", particles.data.length * 4 * OFFSET, "storage");
        this.buffer.writeBuffer(particles.serialize());
    }

    public async printGPUData()
    {
        const gpuData = await this.loadGpuData();
        console.log(gpuData);

        const getVal = (pIndex: number, propIndex: number) => {
            const dataIndex = pIndex * OFFSET;
            return gpuData[dataIndex + propIndex].toFixed(4);
        }

        console.log(`Particles: `);
        for (let pIndex = 0; pIndex < this.particles.data.length; pIndex++) {
            console.log(`${pIndex}: pos: [${getVal(pIndex, 0)}, ${getVal(pIndex, 1)}] vel: [${getVal(pIndex, 2)}, ${getVal(pIndex, 3)}]`);
        }
        console.log(`]`);
    }

    private async loadGpuData()
    {
        return new Float32Array(await this.buffer.readBuffer());
    }

    public destroy()
    {
        this.buffer.buffer.destroy();
    }
}