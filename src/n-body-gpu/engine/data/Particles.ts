import {GPUEngine} from "../common/GPUEngine";
import {EngineBuffer} from "../common/EngineBuffer";

export type Particle = {
    x: number;
    y: number;
}

const OFFSET = 2;

export class Particles {
    public data: Particle[];

    constructor()
    {
        this.data = [];
    }

    public addParticle(x: number, y: number) {
        this.data.push({x, y});
    }

    public serialize()
    {
        const data = new Float32Array(this.data.length * OFFSET);
        this.data.forEach((particle, i) =>
        {
            data[i * OFFSET] = particle.x;
            data[i * OFFSET + 1] = particle.y;
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