import {Buffer} from "../common/Buffer";
import {GPUEngine} from "../common/GPUEngine";
import {EngineSettings} from "./EngineSettings";
import {Particles} from "./Particles";

export class Collision
{
    public particleUpdateCount: Uint32Array;


    constructor(particleUpdateCountData: ArrayBuffer)
    {
        this.particleUpdateCount = new Uint32Array(particleUpdateCountData);
    }
}

export class CollisionBuffer
{
    public particleUpdateCountBuffer: Buffer;
    public gpuCollision: Collision;
    private particles: Particles;

    constructor(engine: GPUEngine,
                settings: EngineSettings,
                particles: Particles)
    {
        const maxParticleCount = settings.maxParticleCount;

        this.particleUpdateCountBuffer = engine.createBuffer("particleUpdateCount",
            maxParticleCount * 4, "storage");

        this.gpuCollision = new Collision(new ArrayBuffer(0));
        this.particles = particles;
    }


    public async loadFromGpu(): Promise<void>
    {
        const particleCount = this.particles.count;

        const particleUpdateCountData = await this.particleUpdateCountBuffer
            .readBuffer(particleCount * 4);

        this.gpuCollision = new Collision(particleUpdateCountData);
    }
}