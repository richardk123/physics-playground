import {Solver, Solvers} from "./Solver";
import {Particles, ParticlesBuffer} from "./data/Particles";
import {EngineSettings, EngineSettingsBuffer} from "./data/EngineSettings";
import {GPUEngine} from "./common/GPUEngine";
import {RendererCircle} from "./renderer/RendererCircle";
import {Camera} from "./data/Camera";
import {GridBuffer} from "./data/Grid";
import {PrefixSumBuffer} from "./data/PrefixSum";
import {PositionChangeBuffer} from "./data/PositionChange";
import {Renderer} from "./renderer/Renderer";
import {Color} from "./data/Color";

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
        const settingsBuffer = new EngineSettingsBuffer(engine, settings, particles, camera);
        const gridBuffer = new GridBuffer(engine, settings);
        const prefixSumBuffer = new PrefixSumBuffer(engine, settings);
        const positionChangeBuffer = new PositionChangeBuffer(engine, settings);

        const solver = await Solvers.create(engine, particlesBuffer, settingsBuffer,
            gridBuffer, prefixSumBuffer, positionChangeBuffer);

        const renderer = await RendererCircle.create(engine, camera, particlesBuffer);
        return new Engine(engine, solver, renderer);
    }


    public createRectangle(bottomLeftX: number, bottomLeftY: number,
                           width: number, height: number,
                           color: Color)
    {
        for (let y = 0; y < height; y++)
        {
            for (let x = 0; x < width; x++)
            {
                const nx = bottomLeftX + x * 1.1;
                const ny = bottomLeftY + y * 1.1;
                this.addPoint(nx, ny, color);
            }
        }
    }

    public createRectangleRandom(bottomLeftX: number, bottomLeftY: number,
                                 width: number, height: number,
                                 color: Color)
    {
        for (let y = 0; y < height; y++)
        {
            for (let x = 0; x < width; x++)
            {
                const nx = bottomLeftX + (x * 1.1) + (Math.random() * 0.01);
                const ny = bottomLeftY + (y * 1.1) + (Math.random() * 0.01);
                this.addPoint(nx, ny, color);
            }
        }
    }

    public addPoint(x: number, y: number, color: Color)
    {
        this.solver.particlesBuffer.particles.addPoint(x, y, color);
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