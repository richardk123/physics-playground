import {Solver} from "./solver/Solver";
import {BoundingBox, DEFAULT_BOUNDING_BOX_SETTINGS} from "./solver/buffer/BoundingBoxBuffer";
import {Vec2d} from "./data/Vec2d";
import {Colors} from "./data/Color";
import {DEFAULT_SOLVER_SETTINGS, SolverSettings} from "./solver/buffer/SolverSettingsBuffer";
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
                        camera = DEFAULT_CAMERA_SETTING,
                        boundingBox = DEFAULT_BOUNDING_BOX_SETTINGS): Promise<Engine>
    {
        const solver = await Solver.create(canvas, settings, camera, boundingBox);
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
                this.solver.gpu.pointsBuffer.points.addPoint(bottomLeftX + x, bottomLeftY + y, mass, color);
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
        return this.solver.gpu.solverSettingsBuffer.settings;
    }

    public getWorldBoundingBox(): BoundingBox
    {
        return this.solver.gpu.boundingBoxBuffer.boundingBox;
    }

    public getCamera(): Camera
    {
        return this.solver.gpu.cameraBuffer.camera;
    }

    public getSimulationSize(): Vec2d
    {
        return this.solver.getSimulationSize();
    }
}