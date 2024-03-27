import {Solver} from "./Solver";
import {Particles, ParticlesBuffer} from "./data/Particles";
import {EngineSettings, EngineSettingsBuffer} from "./data/EngineSettings";
import {GPUEngine} from "./common/GPUEngine";
import {Renderer} from "./Renderer";
import {Camera} from "./data/Camera";

export class Engine
{
    private engine: GPUEngine;
    public solver: Solver;
    public renderer: Renderer;
    public running = true;

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
        const particles = new Particles(settings.maxParticleCount);

        const particlesBuffer = new ParticlesBuffer(engine, settings, particles);
        const settingsBuffer = new EngineSettingsBuffer(engine, settings, particles);

        const solver = await Solver.create(engine, particlesBuffer, settingsBuffer);
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
                this.addPoint(bottomLeftX + x, bottomLeftY + y);
            }
        }
    }

    public addPoint(x: number, y: number)
    {
        this.solver.particlesBuffer.particles.addPoint(x, y);
    }

    public async start()
    {
        this.running = true;
        await this.simulate();
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

    private async simulate()
    {
        if (this.running)
        {
            await this.next()
            requestAnimationFrame(this.simulate.bind(this));
        }
    }

}