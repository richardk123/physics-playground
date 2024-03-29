import {Buffer} from "../common/Buffer";
import {GPUEngine} from "../common/GPUEngine";
import {EngineSettings} from "./EngineSettings";
import {Particles} from "./Particles";

export class Collision
{
    public particleCollisionCount: Uint32Array;
    public particleCollisionVelocities: Float32Array;


    constructor(particleCollisionCountData: ArrayBuffer,
                particleCollisionVelocitiesData: ArrayBuffer)
    {
        this.particleCollisionCount = new Uint32Array(particleCollisionCountData);
        this.particleCollisionVelocities = new Float32Array(particleCollisionVelocitiesData);
    }
}

export class CollisionBuffer
{
    public particleCollisionCountBuffer: Buffer;
    public particleCollisionVelocitiesBuffer: Buffer;
    public gpuCollision: Collision;
    private particles: Particles;

    constructor(engine: GPUEngine,
                settings: EngineSettings,
                particles: Particles)
    {
        const maxParticleCount = settings.maxParticleCount;

        this.particleCollisionCountBuffer = engine.createBuffer("particleCollisionCount",
            maxParticleCount * 4, "storage");

        this.particleCollisionVelocitiesBuffer = engine.createBuffer("particleCollisionIndexes",
            maxParticleCount * 4 * 8 * 2, "storage");

        this.gpuCollision = new Collision(new ArrayBuffer(0), new ArrayBuffer(0));
        this.particles = particles;
    }


    public async loadFromGpu(): Promise<void>
    {
        const particleCount = this.particles.count;

        const particleCollisionCountData = await this.particleCollisionCountBuffer
            .readBuffer(particleCount * 4);

        const particleCollisionVelocitiesData = await this.particleCollisionVelocitiesBuffer
            .readBuffer(particleCount * 4 * 8 * 2);

        this.gpuCollision = new Collision(particleCollisionCountData, particleCollisionVelocitiesData);
    }
}