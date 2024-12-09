import {GPUEngine} from "./common/GPUEngine";
import {Particles} from "./data/Particles";
import {Solver, Solvers} from "./Solver";
import {GridRenderer, Renderer} from "./Renderer";
import {GridBuffer} from "./data/Grid";
import {PrefixSum2dBuffer} from "./data/PrefixSum2d";
import {EngineSettings, EngineSettingsBuffer} from "./data/EngineSettings";

export class Engine
{
    private readonly engine: GPUEngine;
    private readonly solver: Solver;
    private readonly renderer: Renderer;
    private readonly settings: EngineSettings;
    private running = false;
    private executing = false;

    constructor(engine: GPUEngine, solver: Solver, renderer: Renderer, settings: EngineSettings)
    {
        this.engine = engine;
        this.solver = solver;
        this.renderer = renderer;
        this.settings = settings;
    }

    static async create(canvas: HTMLCanvasElement,
                        particles: Particles,
                        settings: EngineSettings)
    {
        const engine = await GPUEngine.create(canvas);

        const gridBuffer = new GridBuffer(engine, settings);
        const prefixSum2dBuffer = new PrefixSum2dBuffer(engine, settings);
        const engineSettingsBuffer = new EngineSettingsBuffer(engine, settings);

        const solver = await Solvers.create(engine, particles, gridBuffer, prefixSum2dBuffer, engineSettingsBuffer);
        const renderer = await GridRenderer.create(engine, gridBuffer, engineSettingsBuffer, prefixSum2dBuffer);

        return new Engine(engine, solver, renderer, settings);
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

    public async startLoop()
    {
        this.running = true;
        return this.run()
    }

    private async run()
    {
        if (this.running)
        {
            this.executing = true;
            await this.solver.simulate();
            this.renderer.render();
            requestAnimationFrame(this.run.bind(this));
            this.executing = false;
        }
    }

    private waitForCondition(condition: () => boolean): Promise<void>
    {
        return new Promise<void>((resolve) => {
            const intervalId = setInterval(() => {
                if (condition()) {
                    clearInterval(intervalId);
                    resolve();
                }
            }, 10);
        });
    }

    public timeMeasurement() {
        return this.solver.timeMeasurement();
    }

    public getSettings() {
        return this.settings;
    }

    public getParticleCount() {
        return this.solver.getParticleCount();
    }

    public async destroy()
    {
        this.running = false;
        await this.waitForCondition(() => !this.executing)
        this.solver.destroy();
        this.renderer.destroy();
        this.engine.device.destroy();
        console.log("destroyed");
    }
}