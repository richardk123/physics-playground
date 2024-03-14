import {Solver, SolverSettings} from "./solver/Solver";
import {Vec2d} from "../../unified-particle-physics/engine/data/Vec2d";

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

    public updateWorldBoundingBox(bottomLeft: Vec2d, topRight: Vec2d)
    {
        this.solver.updateWorldBoundingBox(bottomLeft, topRight);
    }

    public getWorldBoundingBox(): {bottomLeft: Vec2d, topRight: Vec2d}
    {
        return this.solver.getWorldBoundingBox();
    }
}