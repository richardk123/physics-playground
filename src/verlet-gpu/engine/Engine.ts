import {Solver, SolverSettings} from "./solver/Solver";
import {Vec2d} from "../../unified-particle-physics/engine/data/Vec2d";
import {BoundingBox} from "./data/BoundingBox";
import {Camera} from "./data/Camera";
import {Colors} from "../../unified-particle-physics/engine/data/Color";

export const DEFAULT_ENGINE_SETTINGS: SolverSettings = {
    pointDiameter: 1,
    gravity: {x: 0, y: -10},
    maxParticleCount: 10000,
    deltaTime: 1 / 60,
    subStepCount: 4,
};

export class Engine
{
    public solver: Solver;

    private constructor(solver: Solver)
    {
        this.solver = solver;
    }

    static async create(canvas: HTMLCanvasElement,
                        settings?: SolverSettings): Promise<Engine>
    {
        const s = settings || DEFAULT_ENGINE_SETTINGS;
        const solver = await Solver.create(canvas, s);
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
                this.solver.points.addPoint(bottomLeftX + x, bottomLeftY + y, mass, color);
            }
        }
    }

    public simulate(): void
    {
        this.solver.simulate();
        requestAnimationFrame(this.simulate.bind(this));
    }

    public getSettings(): SolverSettings
    {
        return {...this.solver.settings};
    }

    public setSettings(settings: SolverSettings)
    {
        this.solver.settings = settings;
    }

    public getWorldBoundingBox(): BoundingBox
    {
        return this.solver.getWorldBoundingBox();
    }

    public getCamera(): Camera
    {
        return this.solver.getCamera();
    }

    public getSimulationSize(): Vec2d
    {
        return this.solver.getSimulationSize();
    }
}