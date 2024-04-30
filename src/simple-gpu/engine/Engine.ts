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
import {Material, Materials, MaterialsBuffer} from "./data/Material";

export class Engine
{
    private engine: GPUEngine;
    public solver: Solver;
    public renderer: Renderer;
    private running = false;
    public executing = false;

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
        const engine = await GPUEngine.create(canvas, settings);
        const particles = Particles.create(settings.maxParticleCount);
        const materials = Materials.create();

        const particlesBuffer = new ParticlesBuffer(engine, settings, particles);
        const materialBuffer = new MaterialsBuffer(engine, settings, materials);
        const settingsBuffer = new EngineSettingsBuffer(engine, settings, particles, camera);
        const gridBuffer = new GridBuffer(engine, settings);
        const prefixSumBuffer = new PrefixSumBuffer(engine, settings);
        const positionChangeBuffer = new PositionChangeBuffer(engine, settings);

        const solver = await Solvers.create(engine, particlesBuffer, materialBuffer, settingsBuffer,
            gridBuffer, prefixSumBuffer, positionChangeBuffer);

        const renderer = await RendererCircle.create(engine, camera, particlesBuffer);
        return new Engine(engine, solver, renderer);
    }


    public createRectangle(bottomLeftX: number, bottomLeftY: number,
                           width: number, height: number,
                           mass: number,
                           color: Color,
                           materialIndex: number)
    {
        for (let y = 0; y < height; y++)
        {
            for (let x = 0; x < width; x++)
            {
                const nx = bottomLeftX + x * 1.1;
                const ny = bottomLeftY + y * 1.1;
                this.addPoint(nx, ny, mass, color, materialIndex);
            }
        }
    }

    public createRectangleRandom(bottomLeftX: number, bottomLeftY: number,
                                 width: number, height: number,
                                 mass: number,
                                 color: Color,
                                 materialIndex: number)
    {
        const shrink = 0.5;
        for (let y = 0; y < height; y++)
        {
            for (let x = 0; x < width; x++)
            {
                const nx = bottomLeftX  * shrink+ (x * shrink) + (Math.random() * 0.01);
                const ny = bottomLeftY * shrink + (y * shrink) + (Math.random() * 0.01);
                this.addPoint(nx, ny, mass, color, materialIndex);
            }
        }
    }

    public addPoint(x: number, y: number, mass: number, color: Color, materialIndex: number)
    {
        this.solver.particlesBuffer.particles.addPoint(x, y, mass, color, materialIndex);
    }

    // return material index
    public addMaterial(material: Material)
    {
        return this.solver.materialsBuffer.materials.addMaterial(material);
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

    public isRunning(): boolean
    {
        return this.running;
    }

    private waitForCondition(condition: () => boolean): Promise<void>
    {
        return new Promise<void>((resolve) => {
            const intervalId = setInterval(() => {
                if (condition()) {
                    clearInterval(intervalId);
                    resolve();
                }
            }, 10); // Adjust the interval as needed
        });
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