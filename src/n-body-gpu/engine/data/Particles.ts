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

    constructor(engine: GPUEngine, particles: Particles)
    {
        this.buffer = engine.createBuffer("particles", particles.data.length * 4 * OFFSET, "storage");
        this.buffer.writeBuffer(particles.serialize());
    }

    public destroy()
    {
        this.buffer.buffer.destroy();
    }
}