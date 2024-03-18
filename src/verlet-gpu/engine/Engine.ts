import {Solver} from "./solver/Solver";
import {Vec2d} from "./data/Vec2d";
import {Color, Colors} from "./data/Color";
import {BoundingBox, DEFAULT_SOLVER_SETTINGS, SolverSettings} from "./solver/buffer/SolverSettingsBuffer";
import {Camera, DEFAULT_CAMERA_SETTING} from "./solver/buffer/CameraBuffer";

export class Engine
{
    public solver: Solver;

    private constructor(solver: Solver)
    {
        this.solver = solver;
    }

    static async create(canvas: HTMLCanvasElement,
                        settings = DEFAULT_SOLVER_SETTINGS,
                        camera = DEFAULT_CAMERA_SETTING): Promise<Engine>
    {
        const solver = await Solver.create(canvas, settings, camera);
        return new Engine(solver);
    }

    public createRectangle(bottomLeftX: number, bottomLeftY: number,
                           width: number, height: number,
                           mass = 1,
                           color = Colors.blue())
    {
        for (let y = 0; y < height; y++)
        {
            for (let x = 0; x < width; x++)
            {
                const c: Color = {r: Math.random(), g: Math.random(), b: Math.random(), a: 1.0};
                this.solver.pointsBuffer.points.addPoint(bottomLeftX + x, bottomLeftY + y, mass, c);
            }
        }
    }

    public start(): void
    {
        this.solver.initStaticData();
        this.simulate();
    }

    private simulate()
    {
        this.solver.simulate();
        requestAnimationFrame(this.simulate.bind(this));
    }

    public getSettings(): SolverSettings
    {
        return this.solver.settingsBuffer.settings;
    }

    public getWorldBoundingBox(): BoundingBox
    {
        return this.solver.settingsBuffer.settings.boundingBox;
    }

    public getCamera(): Camera
    {
        return this.solver.renderShader.cameraBuffer.camera;
    }

    public getSimulationSize(): Vec2d
    {
        return this.solver.getSimulationSize();
    }
}