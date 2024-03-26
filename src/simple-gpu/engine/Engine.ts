import {Solver} from "./Solver";
import {Particles} from "./data/Particles";
import {EngineSettings} from "./data/EngineSettings";
import {GPUEngine} from "./common/GPUEngine";

export class Engine
{
    private engine: GPUEngine;
    public solver: Solver;
    public running = false;

    constructor(engine: GPUEngine,
                solver: Solver)
    {
        this.engine = engine;
        this.solver = solver;
    }

    static async create(canvas: HTMLCanvasElement,
                        settings: EngineSettings)
    {
        const particles = new Particles(settings.maxParticleCount);
        const engine = await GPUEngine.create(canvas);
        const solver = await Solver.create(engine, settings, particles);

        return new Engine(engine, solver);
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
        this.solver.initStaticData();
        await this.simulate();
    }

    public stop()
    {
        this.running = false;
    }

    public async next()
    {
        await this.solver.simulate();
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