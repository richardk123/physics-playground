import {Solver, Solvers} from "./Solver";
import {Particles, ParticlesBuffer} from "./data/Particles";
import {EngineSettings, EngineSettingsBuffer} from "./data/EngineSettings";
import {GPUEngine} from "./common/GPUEngine";
import {Renderer} from "./Renderer";
import {Camera} from "./data/Camera";
import {GridBuffer} from "./data/Grid";
import {CollisionBuffer} from "./data/Collision";
import {PrefixSumBuffer} from "./data/PrefixSum";

export class Engine
{
    private engine: GPUEngine;
    public solver: Solver;
    public renderer: Renderer;
    public running = false;

    constructor(engine: GPUEngine,
                solver: Solver,
                renderer: Renderer)
    {
        this.engine = engine;
        this.solver = solver;
        this.renderer = renderer;
    }

    static async create(canvas: HTMLCanvasElement,
                        settings: EngineSettings,
                        camera: Camera)
    {
        const engine = await GPUEngine.create(canvas);
        const particles = Particles.create(settings.maxParticleCount);

        const particlesBuffer = new ParticlesBuffer(engine, settings, particles);
        const settingsBuffer = new EngineSettingsBuffer(engine, settings, particles);
        const gridBuffer = new GridBuffer(engine, settings);
        const prefixSumBuffer = new PrefixSumBuffer(engine, settings);
        const collisionBuffer = new CollisionBuffer(engine, settings, particles);

        const solver = await Solvers.create(engine, particlesBuffer, settingsBuffer,
            gridBuffer, prefixSumBuffer, collisionBuffer);

        const renderer = await Renderer.create(engine, camera, particlesBuffer);
        return new Engine(engine, solver, renderer);
    }


    public createRectangle(bottomLeftX: number, bottomLeftY: number,
                           width: number, height: number)
    {
        for (let y = 0; y < height; y++)
        {
            for (let x = 0; x < width; x++)
            {
                this.addPoint(bottomLeftX + x * 2, bottomLeftY + y * 2);
            }
        }
    }

    public addPoint(x: number, y: number)
    {
        this.solver.particlesBuffer.particles.addPoint(x, y);
    }

    public stop()
    {
        this.running = false;
    }

    public async next()
    {
        await this.solver.simulate();
        this.renderer.render();
    }

    public render()
    {
        this.renderer.render();
        requestAnimationFrame(this.render.bind(this));
    }

    public async simulate()
    {
        if (this.running)
        {
            await this.solver.simulate();
            requestAnimationFrame(this.simulate.bind(this));
        }
    }

}